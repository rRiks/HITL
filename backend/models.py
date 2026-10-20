from enum import Enum
from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field

class StartGameRequest(BaseModel):
    team_name: str = Field(default="Alpha Devs", min_length=1, max_length=60, description="Name of the team")
    player_count: int = Field(default=4, ge=1, le=10, description="Number of players in team")
    room_id: Optional[str] = Field(default="default", max_length=20, description="Room/table identifier for multi-team isolation")
    room_code: Optional[str] = Field(default=None, max_length=6, description="Optional 4-character join code")

class ActionRequest(BaseModel):
    # Fix L3: Literal whitelist — Pydantic rejects any value not in this set with a clean 422
    action_type: Literal["accept_as_is", "deny_and_move_on", "custom_prompt", "suggest_change"]
    # Fix M3: Bounded free-text fields to prevent memory exhaustion
    custom_prompt_text: Optional[str] = Field(default=None, max_length=2000, description="Custom prompt provided by human team")
    selected_rule_id: Optional[str] = Field(default=None, max_length=50, description="ID of structured guardrail rule selected")
    is_timeout: bool = Field(default=False, description="True if decision timed out at 00:00")
    time_spent_seconds: int = Field(default=0, ge=0, le=300, description="Seconds spent on this stage")

class PullAcknowledgmentRequest(BaseModel):
    acknowledged: bool = Field(default=True, description="Physical blocks acknowledged")
    physical_tower_fell: bool = Field(default=False, description="Did the physical tower collapse?")

class StageSummaryRecord(BaseModel):
    stage_id: int
    stage_title: str
    phase_name: str
    action_type: str
    action_label: str
    outcome: str
    feedback: str
    health_delta: int
    jenga_pulls: int
    health_after: int
    time_spent_seconds: int
    details: Optional[Dict[str, Any]] = None

class RuleItem(BaseModel):
    id: str
    title: str
    description: str
    benefit_feedback: str
    health_delta: int
    pulls: int
    tier: Optional[str] = "optimal"
    accuracy: Optional[str] = "80% Match"

class AISuggestionItem(BaseModel):
    id: str
    tier: str = "optimal"
    accuracy: str = "80% Match"
    title: str
    description: str
    benefit_feedback: Optional[str] = None
    health_delta: int = 8
    pulls: int = 0

class StageDetails(BaseModel):
    id: int
    title: str
    ticket_title: Optional[str] = None
    phase_name: str
    story: str
    ai_proposal_summary: str
    file_name: str
    code_diff: str
    hidden_risks: str
    suggest_change_rules: List[RuleItem] = []
    ai_suggestions: List[AISuggestionItem] = []

class PlayerInfo(BaseModel):
    player_id: str
    player_name: str
    has_voted: bool = False
    voted_action: Optional[str] = None
    last_seen: float
    role: Optional[str] = "architect"  # "architect" | "intern" | "sre" | "gremlin"
    incident_blame_count: int = 0

class ChaosIncident(BaseModel):
    id: str
    type: Literal["friday_deploy", "rogue_ai", "vp_bridge", "memory_leak"]
    title: str
    description: str
    severity: str = "critical"
    started_at: float
    duration_seconds: int = 45
    purged: bool = False

class ReactionBroadcastRequest(BaseModel):
    room_id: str = Field(..., max_length=20)
    player_id: str = Field(..., max_length=64)
    player_name: str = Field(..., max_length=50)
    emoji: str = Field(..., max_length=10)
    label: Optional[str] = Field(default=None, max_length=50)

class SlapVoteRequest(BaseModel):
    room_id: str = Field(..., max_length=20)
    slapper_id: str = Field(..., max_length=64)
    slapper_name: str = Field(..., max_length=50)
    target_player_id: str = Field(..., max_length=64)
    target_player_name: str = Field(..., max_length=50)

class SetRoleRequest(BaseModel):
    room_id: str = Field(..., max_length=20)
    player_id: str = Field(..., max_length=64)
    role: Literal["architect", "intern", "sre", "gremlin"]

class JoinPlayerRequest(BaseModel):
    player_id: str = Field(..., min_length=1, max_length=64)
    player_name: str = Field(..., min_length=1, max_length=50)
    role: Optional[str] = "architect"

class DraftRequest(BaseModel):
    player_id: str = Field(..., min_length=1, max_length=64)
    player_name: str = Field(..., min_length=1, max_length=50)
    draft_type: Literal["custom_prompt", "suggest_change"]
    custom_prompt_text: Optional[str] = Field(default=None, max_length=2000)
    selected_rule_id: Optional[str] = Field(default=None, max_length=50)
    selected_suggestion_id: Optional[str] = Field(default=None, max_length=50)

class VoteRequest(BaseModel):
    player_id: str = Field(..., min_length=1, max_length=64)
    player_name: str = Field(..., min_length=1, max_length=50)
    action_type: Literal["accept_as_is", "deny_and_move_on", "custom_prompt", "suggest_change"]
    time_spent_seconds: int = Field(default=0, ge=0, le=300)

class GameStateResponse(BaseModel):
    room_id: str = "default"
    room_code: str = "DEFAULT"
    team_name: str
    player_count: int
    current_stage_index: int  # 0 to 10
    total_stages: int
    current_stage: Optional[StageDetails] = None
    health: int  # 0 to 100
    total_jenga_pulls: int
    pending_pulls: int
    tower_instability_pct: int
    is_game_over: bool
    game_over_reason: Optional[str] = None
    is_victory: bool
    has_started: bool = False
    stage_action_taken: bool = False
    last_action_result: Optional[Dict[str, Any]] = None
    history: List[StageSummaryRecord]
    current_stage_time_limit_seconds: int = 120
    time_left_seconds: int = 120
    stage_start_time: float = 0.0
    # Technical Debt & Restarts
    technical_debt: int = 0
    stage_restart_count: int = 0
    # Live Team Voting & Roster State
    active_players: List[PlayerInfo] = []
    votes_tally: Dict[str, int] = {}
    custom_prompt_draft: Optional[Dict[str, Any]] = None
    guardrail_rule_draft: Optional[Dict[str, Any]] = None
    # Chaos System Extensions
    active_incident: Optional[ChaosIncident] = None
    recent_reactions: List[Dict[str, Any]] = []
    last_blamed_player: Optional[str] = None
    slap_events: List[Dict[str, Any]] = []
    tie_broken: bool = False
    tied_options: Optional[List[str]] = None
    is_timer_paused: bool = False
    # Hint Economy
    max_hints: int = 6
    hints_remaining: int = 6
    revealed_hints: List[int] = []

class RevealHintRequest(BaseModel):
    stage_id: int

class ActionResponse(BaseModel):
    room_id: str = "default"
    success: bool
    action_type: str
    action_label: str
    outcome: str  # "success", "partial", "failure", "timeout"
    roll_value: Optional[float] = None
    roll_threshold: Optional[float] = None
    feedback_message: str
    health_delta: int
    jenga_pulls: int
    new_health: int
    total_pulls: int
    pending_pulls: int
    tower_instability_pct: int
    is_game_over: bool
    game_over_reason: Optional[str] = None
    is_victory: bool
    next_stage_ready: bool
    technical_debt: int = 0
    stage_restart_count: int = 0
    # Voting Details
    tie_broken: bool = False
    tied_options: Optional[List[str]] = None
    winning_votes_count: Optional[int] = None
    total_votes_cast: Optional[int] = None

class LeaderboardEntry(BaseModel):
    room_id: str
    team_name: str
    health: int
    current_stage: int
    total_stages: int
    total_pulls: int
    is_game_over: bool
    is_victory: bool
    status: str
    last_active: float

class LeaderboardResponse(BaseModel):
    total_rooms: int
    rooms: List[LeaderboardEntry]

# -------------------------------------------------------------
# Admin & Workshop Global Settings Models
# -------------------------------------------------------------
class VerifyKeyRequest(BaseModel):
    key: str = Field(..., max_length=200)

class BroadcastRequest(BaseModel):
    message: str = Field(..., max_length=500)

class ThemeConfigRequest(BaseModel):
    theme: str = Field(..., max_length=50)
    mode: Optional[str] = Field(default="dark", pattern="^(dark|light)$")

class RoomControlRequest(BaseModel):
    action: str = Field(..., max_length=30)  # advance, retry, health_adjust, debt_adjust, chaos_pull, collapse, reset, etc.
    delta: Optional[int] = Field(default=0, ge=-100, le=100)
    pulls: Optional[int] = Field(default=1, ge=1, le=10)
    reason: Optional[str] = Field(default="Admin Intervention", max_length=200)

# -------------------------------------------------------------
# Sprint Delivery Mode Models (Game 2)
# -------------------------------------------------------------
class GameMode(str, Enum):
    GATEKEEPER = "gatekeeper"
    SPRINT_DELIVERY = "sprint_delivery"

class ChatMessage(BaseModel):
    sender: str  # "player" | "copilot"
    player_name: Optional[str] = None
    text: str
    timestamp: float
    risk_level: Optional[str] = None

class SteerTurnRequest(BaseModel):
    player_id: str
    player_name: str
    user_prompt: str = Field(..., min_length=2, max_length=1000)

class SteerTurnResponse(BaseModel):
    reply_text: str
    updated_code_diff: str
    hidden_risk_probability: float
    turn_count: int
    is_hardened: bool
    chat_history: List[ChatMessage]

class ManualOverrideRequest(BaseModel):
    player_id: str
    player_name: str

class StageTimeRecord(BaseModel):
    stage_id: int
    stage_title: str
    time_spent_seconds: int
    method_used: str  # "accept_as_is" | "manual_override" | "steer_prompt" | "guardrail"
    attempts_count: int
    cleared: bool

class SprintStateResponse(BaseModel):
    room_id: str
    room_code: str
    team_name: str
    game_mode: str = "sprint_delivery"
    current_stage_index: int
    total_stages: int = 11
    health: int
    technical_debt: int
    total_jenga_pulls: int
    tower_instability_pct: int
    is_game_over: bool
    game_over_reason: Optional[str] = None
    is_victory: bool

    # Sprint Delivery Master Clock & Overtime
    sprint_time_left_seconds: int
    is_sprint_timer_running: bool
    is_overtime: bool
    overtime_seconds: int
    senior_dev_tokens_remaining: int

    # Active Candidate (Hidden Risk not serialized to client)
    active_candidate_id: str
    active_candidate_label: str
    active_code_diff: str
    scenario_text: Optional[str] = None
    story: Optional[str] = None
    file_path: Optional[str] = None
    file_name: Optional[str] = None
    stage_title: Optional[str] = None
    ticket_title: Optional[str] = None
    phase_name: Optional[str] = None
    ai_proposal_summary: Optional[str] = None

    # Multi-turn Chat & Telemetry
    chat_history: List[ChatMessage] = []
    stage_time_records: List[StageTimeRecord] = []
    history: List[StageSummaryRecord] = []
    # Chaos System Extensions
    active_incident: Optional[ChaosIncident] = None
    recent_reactions: List[Dict[str, Any]] = []
    last_blamed_player: Optional[str] = None
    slap_events: List[Dict[str, Any]] = []


