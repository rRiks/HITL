from typing import Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from models import (
    StartGameRequest,
    ActionRequest,
    PullAcknowledgmentRequest,
    GameStateResponse,
    ActionResponse,
    LeaderboardResponse,
    JoinPlayerRequest,
    DraftRequest,
    VoteRequest,
)
from game_state import room_manager
from stages_data import STAGES
from admin_router import admin_router

app = FastAPI(
    title="HITL Jenga: AI-Paced Development API",
    description="Multi-Room Backend State Machine & Cross-Room Leaderboard for Developer Day HITL Jenga.",
    version="2.0.0"
)

# Enable CORS for frontend Vite dev server and workshop dashboards
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register isolated Admin Router
app.include_router(admin_router)

@app.get("/")
@app.get("/healthz")
@app.get("/api/health")
def get_health():
    return {
        "status": "healthy",
        "service": "hitl-jenga-backend-multi-room",
        "active_rooms": len(room_manager._rooms),
        "stages_loaded": len(STAGES)
    }

# -------------------------------------------------------------
# Cross-Room Workshop Live Leaderboard
# -------------------------------------------------------------
@app.get("/api/leaderboard", response_model=LeaderboardResponse)
def get_leaderboard():
    rooms = room_manager.list_leaderboard()
    return {
        "total_rooms": len(rooms),
        "rooms": rooms,
    }

@app.post("/api/game/create", response_model=GameStateResponse)
def create_table_room(req: StartGameRequest):
    """Creates a new isolated game room with a unique 4-character Game PIN."""
    manager = room_manager.create_room_with_code(team_name=req.team_name, player_count=req.player_count, room_code=req.room_code)
    manager.reset_game(team_name=req.team_name, player_count=req.player_count)
    return manager.get_state()

@app.get("/api/game/lookup/{code}")
def lookup_table_by_code(code: str):
    """Kahoot/Jackbox-style PIN lookup to verify active room status before joining."""
    clean = code.strip().upper()
    resolved = room_manager.resolve_room_id(clean)
    if resolved in room_manager._rooms:
        r = room_manager._rooms[resolved]
        state = r.get_state()
        return {
            "found": True,
            "room_id": r.room_id,
            "room_code": getattr(r, "room_code", clean),
            "team_name": r.team_name,
            "current_stage": r.current_stage_index + 1,
            "total_stages": len(STAGES),
            "stage_title": state.current_stage.title if state.current_stage else f"Stage {r.current_stage_index + 1}",
            "health": r.health,
            "technical_debt": r.technical_debt,
            "active_players": len(r.get_active_players()),
            "has_started": r.has_started,
            "is_game_over": r.is_game_over,
            "is_victory": r.is_victory,
        }
    return {"found": False, "message": f"No active table found for PIN '{code}'"}

@app.post("/api/game/{room_id}/start", response_model=GameStateResponse)
def start_game_room(room_id: str, req: StartGameRequest):
    resolved = room_manager.resolve_room_id(room_id)
    manager = room_manager.get_or_create_room(resolved, team_name=req.team_name, player_count=req.player_count, room_code=req.room_code)
    manager.reset_game(team_name=req.team_name, player_count=req.player_count)
    return manager.get_state()

@app.get("/api/game/{room_id}/state", response_model=GameStateResponse)
def get_state_room(room_id: str, player_id: Optional[str] = Query(default=None), player_name: Optional[str] = Query(default=None)):
    norm_id = room_manager.normalize_room_id(room_id)
    if norm_id not in room_manager._rooms:
        if not (player_id and player_name):
            # Probe from welcome screen - return clean state without registering ghost room
            transient = GameStateManager(room_id=norm_id, team_name=room_manager.derive_team_name(norm_id))
            return transient.get_state()
        manager = room_manager.get_or_create_room(norm_id)
    else:
        manager = room_manager.get_room(norm_id)

    if player_id and player_name:
        manager.touch_player(player_id, player_name)
    return manager.get_state()

@app.post("/api/game/{room_id}/join-player", response_model=GameStateResponse)
def join_player_room(room_id: str, req: JoinPlayerRequest):
    manager = room_manager.get_room(room_id)
    manager.touch_player(req.player_id, req.player_name)
    return manager.get_state()

@app.post("/api/game/{room_id}/draft", response_model=GameStateResponse)
def submit_draft_room(room_id: str, req: DraftRequest):
    manager = room_manager.get_room(room_id)
    if manager.is_effective_timer_paused():
        raise HTTPException(status_code=403, detail="Table time is frozen by Game Master. Drafts are paused.")
    return manager.submit_draft(req)

@app.post("/api/game/{room_id}/vote", response_model=GameStateResponse)
def submit_vote_room(room_id: str, req: VoteRequest):
    manager = room_manager.get_room(room_id)
    if manager.is_effective_timer_paused():
        raise HTTPException(status_code=403, detail="Table time is frozen by Game Master. Voting is paused.")
    return manager.submit_vote(req)

@app.post("/api/game/{room_id}/resolve-timeout", response_model=ActionResponse)
def resolve_timeout_room(room_id: str):
    manager = room_manager.get_room(room_id)
    if manager.is_effective_timer_paused():
        raise HTTPException(status_code=403, detail="Table time is frozen by Game Master. Timeout resolution paused.")
    return manager.resolve_voting(is_timeout=True, time_spent_seconds=120)

@app.post("/api/game/{room_id}/commit-decision", response_model=ActionResponse)
def commit_decision_room(room_id: str):
    manager = room_manager.get_room(room_id)
    if manager.is_effective_timer_paused():
        raise HTTPException(status_code=403, detail="Table time is frozen by Game Master. Voting is paused.")
    return manager.resolve_voting(is_timeout=False, time_spent_seconds=0)

@app.post("/api/game/{room_id}/action", response_model=ActionResponse)
def submit_action_room(room_id: str, req: ActionRequest):
    manager = room_manager.get_room(room_id)
    if manager.is_effective_timer_paused():
        raise HTTPException(status_code=403, detail="Table time is frozen by Game Master. Actions are paused.")
    try:
        return manager.process_action(req)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/game/{room_id}/acknowledge-pull", response_model=GameStateResponse)
def acknowledge_pull_room(room_id: str, req: PullAcknowledgmentRequest):
    manager = room_manager.get_room(room_id)
    manager.acknowledge_pulls(physical_tower_fell=req.physical_tower_fell)
    return manager.get_state()

@app.post("/api/game/{room_id}/tower-toppled", response_model=GameStateResponse)
def tower_toppled_room(room_id: str):
    manager = room_manager.get_room(room_id)
    manager.force_tower_collapse()
    return manager.get_state()

@app.post("/api/game/{room_id}/next-stage", response_model=GameStateResponse)
def next_stage_room(room_id: str):
    manager = room_manager.get_room(room_id)
    if manager.is_effective_timer_paused():
        raise HTTPException(status_code=403, detail="Table time is frozen by Game Master. Cannot advance stage.")
    manager.advance_to_next_stage()
    return manager.get_state()

@app.post("/api/game/{room_id}/reset", response_model=GameStateResponse)
def reset_game_room(room_id: str):
    manager = room_manager.get_room(room_id)
    manager.reset_game(team_name=manager.team_name, player_count=manager.player_count)
    return manager.get_state()

@app.post("/api/game/{room_id}/retry-stage", response_model=GameStateResponse)
def retry_stage_room(room_id: str):
    manager = room_manager.get_room(room_id)
    manager.retry_current_stage(restore_health=35)
    return manager.get_state()

# -------------------------------------------------------------
# Backwards-Compatible Global Endpoints (Default Room)
# -------------------------------------------------------------
@app.post("/api/game/start", response_model=GameStateResponse)
def start_game_default(req: StartGameRequest):
    room_id = req.room_id or "default"
    manager = room_manager.get_or_create_room(room_id, team_name=req.team_name, player_count=req.player_count)
    manager.reset_game(team_name=req.team_name, player_count=req.player_count)
    return manager.get_state()

@app.get("/api/game/state", response_model=GameStateResponse)
def get_state_default(room: Optional[str] = Query(default=None)):
    manager = room_manager.get_room(room or "default")
    return manager.get_state()

@app.post("/api/game/action", response_model=ActionResponse)
def submit_action_default(req: ActionRequest, room: Optional[str] = Query(default=None)):
    manager = room_manager.get_room(room or "default")
    try:
        return manager.process_action(req)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/game/acknowledge-pull", response_model=GameStateResponse)
def acknowledge_pull_default(req: PullAcknowledgmentRequest, room: Optional[str] = Query(default=None)):
    manager = room_manager.get_room(room or "default")
    manager.acknowledge_pulls(physical_tower_fell=req.physical_tower_fell)
    return manager.get_state()

@app.post("/api/game/tower-toppled", response_model=GameStateResponse)
def tower_toppled_default(room: Optional[str] = Query(default=None)):
    manager = room_manager.get_room(room or "default")
    manager.force_tower_collapse()
    return manager.get_state()

@app.post("/api/game/next-stage", response_model=GameStateResponse)
def next_stage_default(room: Optional[str] = Query(default=None)):
    manager = room_manager.get_room(room or "default")
    manager.advance_to_next_stage()
    return manager.get_state()

@app.post("/api/game/reset", response_model=GameStateResponse)
def reset_game_default(room: Optional[str] = Query(default=None)):
    manager = room_manager.get_room(room or "default")
    manager.reset_game(team_name=manager.team_name, player_count=manager.player_count)
    return manager.get_state()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
