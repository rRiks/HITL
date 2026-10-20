from fastapi import APIRouter, HTTPException, Body
from typing import Dict, Any, Optional
from models import (
    SprintStateResponse,
    SteerTurnRequest,
    SteerTurnResponse,
    ManualOverrideRequest,
    StartGameRequest,
)
from .session_manager import SprintSessionManager

sprint_router = APIRouter(prefix="/api/sprint", tags=["Sprint Delivery (Game 2)"])

# In-memory repository of active Sprint Delivery rooms
_sprint_rooms: Dict[str, SprintSessionManager] = {}

def get_or_create_sprint_room(room_id: str, team_name: Optional[str] = None) -> SprintSessionManager:
    clean_id = (room_id or "default").lower().strip()
    if clean_id not in _sprint_rooms:
        clean_team = (team_name or "").strip() or f"Sprint Squad {clean_id.upper()}"
        _sprint_rooms[clean_id] = SprintSessionManager(room_id=clean_id, team_name=clean_team)
    elif team_name and team_name.strip():
        _sprint_rooms[clean_id].team_name = team_name.strip()
    return _sprint_rooms[clean_id]


@sprint_router.post("/{room_id}/start", response_model=SprintStateResponse)
def start_sprint_room(room_id: str, req: Optional[StartGameRequest] = Body(None)):
    team_name = req.team_name if req else "Sprint Squad"
    clean_id = (room_id or "default").lower().strip()
    # Reset or create fresh 25m sprint session
    manager = SprintSessionManager(room_id=clean_id, team_name=team_name)
    _sprint_rooms[clean_id] = manager
    return manager.get_state()


@sprint_router.get("/{room_id}/state", response_model=SprintStateResponse)
def get_sprint_state(room_id: str):
    manager = get_or_create_sprint_room(room_id)
    return manager.get_state()


@sprint_router.post("/{room_id}/accept-as-is")
def accept_as_is(room_id: str):
    manager = get_or_create_sprint_room(room_id)
    result = manager.commit_accept_as_is()
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return {
        "result": result,
        "state": manager.get_state().dict(),
    }


@sprint_router.post("/{room_id}/manual-override")
def manual_override(room_id: str, req: ManualOverrideRequest):
    manager = get_or_create_sprint_room(room_id)
    result = manager.execute_manual_override(req.player_id, req.player_name)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return {
        "result": result,
        "state": manager.get_state().dict(),
    }


@sprint_router.post("/{room_id}/steer-turn", response_model=SteerTurnResponse)
def steer_turn(room_id: str, req: SteerTurnRequest):
    manager = get_or_create_sprint_room(room_id)
    result = manager.process_steer_turn(req.player_id, req.player_name, req.user_prompt)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return SteerTurnResponse(
        reply_text=result["reply_text"],
        updated_code_diff=result["updated_code_diff"],
        hidden_risk_probability=result["hidden_risk_probability"],
        turn_count=len(result["chat_history"]),
        is_hardened=result["is_hardened"],
        chat_history=result["chat_history"],
    )


@sprint_router.post("/{room_id}/commit-steer")
def commit_steer(room_id: str):
    manager = get_or_create_sprint_room(room_id)
    result = manager.commit_steered_code()
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return {
        "result": result,
        "state": manager.get_state().dict(),
    }


@sprint_router.post("/{room_id}/guardrail")
def enforce_guardrail_patch(room_id: str, payload: Dict[str, Any] = Body(...)):
    rule_id = payload.get("rule_id", "rule_1")
    rule_title = payload.get("rule_title", "Enforce Architectural Guardrail")
    manager = get_or_create_sprint_room(room_id)
    result = manager.enforce_guardrail(rule_id, rule_title)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return {
        "result": result,
        "state": manager.get_state().dict(),
    }


@sprint_router.post("/{room_id}/advance", response_model=SprintStateResponse)
def advance_sprint_stage(room_id: str):
    manager = get_or_create_sprint_room(room_id)
    return manager.advance_stage()


@sprint_router.post("/{room_id}/reset", response_model=SprintStateResponse)
def reset_sprint(room_id: str):
    manager = get_or_create_sprint_room(room_id)
    return manager.reset_sprint()
