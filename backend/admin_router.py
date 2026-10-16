import os
import time
import hmac
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, HTTPException, Depends, Header, Request
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from game_state import room_manager
from stages_data import STAGES

# Load .env for local development (no-op in production)
load_dotenv()

# Read admin key purely from environment — no hardcoded fallback
ADMIN_SECRET_KEY: str = os.getenv("ADMIN_SECRET_KEY", "").strip()


def _secure_compare(supplied: str, expected: str) -> bool:
    """Constant-time string comparison — prevents timing-oracle attacks."""
    return hmac.compare_digest(
        supplied.encode("utf-8"),
        expected.encode("utf-8"),
    )

admin_router = APIRouter(prefix="/api/admin", tags=["admin"])

class VerifyKeyRequest(BaseModel):
    key: str = Field(..., max_length=200)

def verify_admin_auth(x_admin_key: Optional[str] = Header(None, alias="X-Admin-Key")):
    """Validates the Game Master Secret Key using constant-time comparison."""
    supplied = (x_admin_key or "").strip()
    if not supplied or not _secure_compare(supplied, ADMIN_SECRET_KEY):
        raise HTTPException(
            status_code=401,
            detail="Unauthorized: Valid Game Master Passcode required in 'X-Admin-Key' header."
        )
    return True


@admin_router.post("/verify")
def verify_admin_key(request: Request, req: VerifyKeyRequest):
    """Validates Game Master Secret Key for entering the admin console."""
    supplied = (req.key or "").strip()
    if not supplied or not _secure_compare(supplied, ADMIN_SECRET_KEY):
        raise HTTPException(
            status_code=401,
            detail="Invalid Game Master Passcode. Please check your admin key."
        )

    return {"success": True, "message": "Game Master identity confirmed."}

# In-memory storage for global administrative announcements
GLOBAL_ANNOUNCEMENT: Dict[str, Any] = {
    "message": "",
    "timestamp": 0.0,
    "active": False,
}

class BroadcastRequest(BaseModel):
    # Fix M3: Bound broadcast message — stored globally, served to all rooms
    message: str = Field(..., max_length=500)

class RoomControlRequest(BaseModel):
    action: str = Field(..., max_length=30)  # advance, retry, health_adjust, debt_adjust, chaos_pull, collapse, reset
    delta: Optional[int] = Field(default=0, ge=-100, le=100)
    pulls: Optional[int] = Field(default=1, ge=1, le=10)
    reason: Optional[str] = Field(default="Admin Intervention", max_length=200)

@admin_router.get("/rooms", dependencies=[Depends(verify_admin_auth)])
def get_all_rooms_detailed():
    """Returns detailed real-time telemetry for all registered workshop rooms."""
    rooms_data = []
    
    for r_id, r in room_manager._rooms.items():
        curr_stage = STAGES[r.current_stage_index] if 0 <= r.current_stage_index < len(STAGES) else None
        
        # Determine status
        status = "active"
        if r.is_game_over:
            status = "collapsed"
        elif r.is_victory:
            status = "victorious"
        elif r.health > 80:
            status = "healthy"
        elif r.health <= 35:
            status = "critical"

        active_list = r.get_active_players()
        rooms_data.append({
            "room_id": r_id,
            "room_code": getattr(r, "room_code", r_id.upper()),
            "team_name": r.team_name,
            "player_count": len(active_list),
            "active_players_count": len(active_list),
            "current_stage": r.current_stage_index + 1,
            "total_stages": len(STAGES),
            "stage_title": curr_stage["title"] if curr_stage else f"Stage {r.current_stage_index + 1}",
            "health": r.health,
            "technical_debt": r.technical_debt,
            "total_pulls": r.total_jenga_pulls,
            "pending_pulls": r.pending_pulls,
            "is_game_over": r.is_game_over,
            "game_over_reason": r.game_over_reason,
            "is_victory": r.is_victory,
            "has_started": r.has_started,
            "stage_action_taken": r.stage_action_taken,
            "active_players": [
                {
                    "player_id": p.player_id,
                    "name": p.player_name,
                    "voted_action": p.voted_action,
                    "has_voted": p.has_voted,
                    "is_active": True
                }
                for p in active_list
            ],
            "status": status,
            "last_active": r.last_active,
            "history_count": len(r.history),
            "is_timer_paused": r.is_effective_timer_paused(),
            "room_timer_paused": r.is_effective_timer_paused(),
        })

    # Sort rooms by current_stage desc, health desc
    rooms_data.sort(key=lambda x: (not x["is_game_over"], x["is_victory"], x["current_stage"], x["health"]), reverse=True)

    total_active_players = sum(x["active_players_count"] for x in rooms_data)
    return {
        "rooms": rooms_data,
        "total_rooms": len(rooms_data),
        "total_active_players": total_active_players,
        "global_announcement": GLOBAL_ANNOUNCEMENT if GLOBAL_ANNOUNCEMENT["active"] else None,
        "global_timer_paused": getattr(room_manager, "global_timer_paused", False),
        "server_time": time.time(),
    }

@admin_router.post("/rooms/{room_id}/action", dependencies=[Depends(verify_admin_auth)])
def perform_room_action(room_id: str, req: RoomControlRequest):
    """Executes remote Game Master interventions on a specific room."""
    norm_id = room_manager.resolve_room_id(room_id)
    if norm_id not in room_manager._rooms:
        raise HTTPException(status_code=404, detail=f"Room '{room_id}' not found.")
    
    r = room_manager._rooms[norm_id]
    r.last_active = time.time()
    
    action = req.action.lower()
    
    if action == "advance":
        r.advance_to_next_stage()
        return {"success": True, "message": f"Room '{r.team_name}' advanced to Stage {r.current_stage_index + 1}."}
    
    elif action == "retry":
        r.retry_current_stage(restore_health=max(35, r.health))
        return {"success": True, "message": f"Stage {r.current_stage_index + 1} retried for '{r.team_name}'."}
        
    elif action == "health_adjust":
        delta = req.delta or 0
        r.health = max(0, min(100, r.health + delta))
        if r.health <= 0 and not r.is_game_over:
            r.is_game_over = True
            r.game_over_reason = "Admin Health Depletion"
        return {"success": True, "health": r.health, "message": f"Health adjusted by {delta:+d}% to {r.health}%."}
        
    elif action == "debt_adjust":
        delta = req.delta or 0
        r.technical_debt = max(0, min(5, r.technical_debt + delta))
        return {"success": True, "technical_debt": r.technical_debt, "message": f"Debt adjusted by {delta:+d} to {r.technical_debt}/5."}
        
    elif action == "chaos_pull":
        pulls = max(1, req.pulls or 1)
        r.total_jenga_pulls += pulls
        r.health = max(0, r.health - (pulls * 10))
        if r.health <= 0:
            r.is_game_over = True
            r.game_over_reason = "Tower Collapsed under Chaos Test"
        return {"success": True, "total_pulls": r.total_jenga_pulls, "health": r.health, "message": f"Extracted {pulls} chaos blocks."}
        
    elif action == "collapse":
        r.force_tower_collapse()
        return {"success": True, "message": f"Forced collapse on '{r.team_name}'."}
        
    elif action == "reset":
        r.reset_game(team_name=r.team_name, player_count=r.player_count)
        return {"success": True, "message": f"Room '{r.team_name}' reset back to Stage 1."}

    elif action == "delete":
        room_manager._rooms.pop(norm_id, None)
        for code, rid in list(room_manager._code_to_room.items()):
            if rid == norm_id:
                room_manager._code_to_room.pop(code, None)
        return {"success": True, "message": f"Table '{r.team_name}' ({getattr(r, 'room_code', norm_id)}) removed from workshop."}

    elif action == "pause_timer":
        r.timer_override = True
        r.is_timer_paused = True
        return {"success": True, "is_timer_paused": True, "message": f"Time paused for table '{r.team_name}'."}

    elif action in ["resume_timer", "toggle_pause"] and getattr(room_manager, "global_timer_paused", False):
        return {
            "success": False,
            "is_timer_paused": True,
            "message": "Cannot resume: Global World Timer is locked. Resume World Timer first."
        }

    elif action == "resume_timer":
        r.timer_override = False
        r.is_timer_paused = False
        return {"success": True, "is_timer_paused": False, "message": f"Time resumed for table '{r.team_name}'."}

    elif action == "toggle_pause":
        new_state = not r.is_effective_timer_paused()
        r.timer_override = new_state
        r.is_timer_paused = new_state
        status_word = "paused" if new_state else "resumed"
        return {"success": True, "is_timer_paused": new_state, "message": f"Time {status_word} for table '{r.team_name}'."}
        
    else:
        raise HTTPException(status_code=400, detail=f"Unknown action '{action}'.")

@admin_router.post("/global/broadcast", dependencies=[Depends(verify_admin_auth)])
def set_broadcast(req: BroadcastRequest):
    """Broadcasts a high-priority announcement to all active rooms."""
    msg = req.message.strip()
    if not msg:
        GLOBAL_ANNOUNCEMENT["active"] = False
        GLOBAL_ANNOUNCEMENT["message"] = ""
    else:
        GLOBAL_ANNOUNCEMENT["active"] = True
        GLOBAL_ANNOUNCEMENT["message"] = msg
        GLOBAL_ANNOUNCEMENT["timestamp"] = time.time()
        
    return {"success": True, "broadcast": GLOBAL_ANNOUNCEMENT}

@admin_router.post("/global/clear-broadcast", dependencies=[Depends(verify_admin_auth)])
def clear_broadcast():
    """Dismisses active global broadcast."""
    GLOBAL_ANNOUNCEMENT["active"] = False
    GLOBAL_ANNOUNCEMENT["message"] = ""
    return {"success": True, "message": "Broadcast cleared."}

@admin_router.get("/broadcast")
def get_current_broadcast():
    """Public read endpoint for client HUDs to display broadcast alerts."""
    return GLOBAL_ANNOUNCEMENT if GLOBAL_ANNOUNCEMENT["active"] else {"active": False, "message": ""}

@admin_router.post("/global/reset-all", dependencies=[Depends(verify_admin_auth)])
def reset_all_rooms():
    """Resets all live rooms simultaneously for a clean workshop cohort run."""
    count = 0
    for r in room_manager._rooms.values():
        r.reset_game(team_name=r.team_name, player_count=r.player_count)
        count += 1
    return {"success": True, "rooms_reset": count, "message": f"Successfully reset {count} workshop tables."}

@admin_router.post("/global/pause-all", dependencies=[Depends(verify_admin_auth)])
def pause_all_rooms():
    """Pauses time countdowns across all live tables in the entire workshop."""
    room_manager.global_timer_paused = True
    for r in room_manager._rooms.values():
        r.timer_override = None
        r.is_timer_paused = True
    return {"success": True, "global_timer_paused": True, "message": "All workshop table timers paused globally."}

@admin_router.post("/global/resume-all", dependencies=[Depends(verify_admin_auth)])
def resume_all_rooms():
    """Resumes time countdowns across all live tables in the entire workshop."""
    room_manager.global_timer_paused = False
    for r in room_manager._rooms.values():
        r.timer_override = None
        r.is_timer_paused = False
    return {"success": True, "global_timer_paused": False, "message": "All workshop table timers resumed globally."}

@admin_router.post("/global/toggle-pause-all", dependencies=[Depends(verify_admin_auth)])
def toggle_pause_all_rooms():
    """Toggles global time countdown pause state for all tables in the workshop."""
    room_manager.global_timer_paused = not getattr(room_manager, "global_timer_paused", False)
    for r in room_manager._rooms.values():
        r.timer_override = None
        r.is_timer_paused = room_manager.global_timer_paused
    status_word = "paused" if room_manager.global_timer_paused else "resumed"
    return {"success": True, "global_timer_paused": room_manager.global_timer_paused, "message": f"All workshop table timers {status_word} globally."}

@admin_router.get("/stages", dependencies=[Depends(verify_admin_auth)])
def get_stages_cheat_sheet():
    """Facilitator cheat sheet with details, traps, and best practices for all 11 stages."""
    sheet = []
    for s in STAGES:
        sheet.append({
            "id": s["id"],
            "title": s["title"],
            "persona": s.get("persona", "Developer"),
            "dilemma": s.get("dilemma", ""),
            "anti_pattern": s.get("telemetry_scanner", {}).get("anti_pattern", ""),
            "risk_type": s.get("telemetry_scanner", {}).get("risk_type", ""),
            "ai_suggestions_count": len(s.get("ai_suggestions", [])),
        })
    return {"stages": sheet, "total": len(sheet)}

@admin_router.get("/analytics", dependencies=[Depends(verify_admin_auth)])
def get_event_analytics():
    """Workshop macro telemetry analytics."""
    rooms = list(room_manager._rooms.values())
    total_rooms = len(rooms)
    total_active_players = sum(len(r.get_active_players()) for r in rooms)
    if total_rooms == 0:
        return {
            "total_rooms": 0,
            "total_active_players": 0,
            "average_stage": 1,
            "average_health": 100,
            "average_debt": 0,
            "total_blocks_mined": 0,
            "collapsed_rooms": 0,
            "victorious_rooms": 0,
        }

    avg_stage = sum(r.current_stage_index + 1 for r in rooms) / total_rooms
    avg_health = sum(r.health for r in rooms) / total_rooms
    avg_debt = sum(r.technical_debt for r in rooms) / total_rooms
    total_pulls = sum(r.total_jenga_pulls for r in rooms)
    collapsed = sum(1 for r in rooms if r.is_game_over)
    victors = sum(1 for r in rooms if r.is_victory)

    return {
        "total_rooms": total_rooms,
        "total_active_players": total_active_players,
        "average_stage": round(avg_stage, 1),
        "average_health": round(avg_health, 1),
        "average_debt": round(avg_debt, 1),
        "total_blocks_mined": total_pulls,
        "collapsed_rooms": collapsed,
        "victorious_rooms": victors,
    }
