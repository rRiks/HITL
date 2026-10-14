from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class StartGameRequest(BaseModel):
    team_name: str = Field(default="Alpha Devs", description="Name of the team")
    player_count: int = Field(default=4, ge=1, le=10, description="Number of players in team")
    room_id: Optional[str] = Field(default="default", description="Room/table identifier for multi-team isolation")
    room_code: Optional[str] = Field(default=None, description="Optional 4-character join code")

class ActionRequest(BaseModel):
    action_type: str = Field(..., description="'accept_as_is' | 'deny_and_move_on' | 'custom_prompt' | 'suggest_change'")
    custom_prompt_text: Optional[str] = Field(default=None, description="Custom prompt provided by human team")
    selected_rule_id: Optional[str] = Field(default=None, description="ID of structured guardrail rule selected")
    is_timeout: bool = Field(default=False, description="True if decision timed out at 00:00")
    time_spent_seconds: int = Field(default=0, description="Seconds spent on this stage")

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

class JoinPlayerRequest(BaseModel):
    player_id: str
    player_name: str

class DraftRequest(BaseModel):
    player_id: str
    player_name: str
    draft_type: str  # "custom_prompt" or "suggest_change"
    custom_prompt_text: Optional[str] = None
    selected_rule_id: Optional[str] = None
    selected_suggestion_id: Optional[str] = None

class VoteRequest(BaseModel):
    player_id: str
    player_name: str
    action_type: str  # "accept_as_is" | "deny_and_move_on" | "custom_prompt" | "suggest_change"
    time_spent_seconds: int = 0

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
    # Technical Debt & Restarts
    technical_debt: int = 0
    stage_restart_count: int = 0
    # Live Team Voting & Roster State
    active_players: List[PlayerInfo] = []
    votes_tally: Dict[str, int] = {}
    custom_prompt_draft: Optional[Dict[str, Any]] = None
    guardrail_rule_draft: Optional[Dict[str, Any]] = None
    tie_broken: bool = False
    tied_options: Optional[List[str]] = None

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
