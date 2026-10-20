import time
from typing import Dict, Any, List, Optional
from stages_data import STAGES
from models import (
    SprintStateResponse,
    StageTimeRecord,
    ChatMessage,
    StageSummaryRecord,
    GameMode,
)
from .clock_service import SprintClockService
from .candidate_repo import CandidateRepository
from .copilot_engine import CopilotEngine
from .scoring_service import ScoringService

class SprintSessionManager:
    """
    SprintSessionManager (Single Responsibility: Room Orchestrator Facade)
    Maintains room session state and coordinates clock, candidates, copilot, and scoring.
    """
    def __init__(
        self,
        room_id: str,
        team_name: str = "Alpha Devs",
        room_code: Optional[str] = None,
        clock: Optional[SprintClockService] = None,
        candidates: Optional[CandidateRepository] = None,
        copilot: Optional[CopilotEngine] = None,
        scoring: Optional[ScoringService] = None,
    ):
        self.room_id = room_id
        self.room_code = (room_code or room_id[:4]).upper()
        self.team_name = team_name
        self.clock = clock if clock is not None else SprintClockService()
        self.candidates = candidates if candidates is not None else CandidateRepository()
        self.copilot = copilot if copilot is not None else CopilotEngine()
        self.scoring = scoring if scoring is not None else ScoringService()

        # Session Metrics
        self.current_stage_index = 0
        self.total_stages = len(STAGES)
        self.health = 100
        self.technical_debt = 0
        self.total_jenga_pulls = 0
        self.senior_dev_tokens = 2

        # Game Termination
        self.is_game_over = False
        self.game_over_reason: Optional[str] = None
        self.is_victory = False

        # Interactive State
        self.chat_history: List[ChatMessage] = []
        self.stage_time_records: List[StageTimeRecord] = []
        self.history: List[StageSummaryRecord] = []
        self.last_action_result: Optional[Dict[str, Any]] = None
        self.stage_action_taken = False

        # Chaos & Social Mechanics
        self.active_incident = None
        self.recent_reactions = []
        self.last_blamed_player = None
        self.slap_events = []

        # Stage Timing & Candidate Initialization
        self.stage_start_timestamp = time.time()
        self.stage_attempts_count = 0
        self._init_current_stage_candidate()

    def _init_current_stage_candidate(self) -> None:
        """Samples a new proposal candidate for the active stage."""
        stage_num = self.current_stage_index + 1
        self.active_candidate = self.candidates.sample_candidate(stage_num)
        self.current_hidden_risk = self.candidates.get_candidate_hidden_risk(
            stage_num, self.active_candidate["id"]
        )
        self.active_code_diff = self.active_candidate.get("code_diff", "")
        self.chat_history = []
        self.is_steer_hardened = False
        self.stage_attempts_count += 1

    def get_current_stage_info(self) -> Dict[str, Any]:
        if 0 <= self.current_stage_index < len(STAGES):
            return dict(STAGES[self.current_stage_index])
        return {}

    def calculate_instability(self) -> int:
        health_instability = max(0, 100 - self.health)
        pull_instability = int((self.total_jenga_pulls / 18.0) * 100)
        return min(100, max(0, max(health_instability, pull_instability)))

    def apply_overtime_check(self) -> None:
        """Deducts fatigue HP if in overtime."""
        if not self.is_game_over and not self.is_victory:
            penalty = self.clock.check_and_apply_overtime_penalty()
            if penalty > 0:
                self.health = max(0, self.health - penalty)
                if self.health <= 0:
                    self.is_game_over = True
                    self.game_over_reason = "CRITICAL COLLAPSE: Developer fatigue in Overtime reduced stability to 0%!"

    def get_state(self) -> SprintStateResponse:
        self.apply_overtime_check()
        stg = self.get_current_stage_info()
        time_left = self.clock.get_remaining_seconds()
        overtime_sec = self.clock.get_overtime_seconds()
        story_text = stg.get("story", "") or stg.get("scenario_text", "")
        file_target = stg.get("file_name", "") or stg.get("file_path", "force-app/main/default/classes/AccountTriggerHandler.cls")
        ticket = stg.get("ticket_title", "") or f"PR #{self.current_stage_index + 1}: {stg.get('title', '')}"
        ai_summary = self.active_candidate.get("description") or self.active_candidate.get("label") or stg.get("ai_proposal_summary", "")

        return SprintStateResponse(
            room_id=self.room_id,
            room_code=self.room_code,
            team_name=self.team_name,
            game_mode="sprint_delivery",
            current_stage_index=self.current_stage_index,
            total_stages=self.total_stages,
            health=self.health,
            technical_debt=self.technical_debt,
            total_jenga_pulls=self.total_jenga_pulls,
            tower_instability_pct=self.calculate_instability(),
            is_game_over=self.is_game_over,
            game_over_reason=self.game_over_reason,
            is_victory=self.is_victory,
            sprint_time_left_seconds=time_left,
            is_sprint_timer_running=not self.clock.is_paused and not self.is_game_over and not self.is_victory,
            is_overtime=overtime_sec > 0,
            overtime_seconds=overtime_sec,
            senior_dev_tokens_remaining=self.senior_dev_tokens,
            active_candidate_id=self.active_candidate.get("id", "c_unknown"),
            active_candidate_label=self.active_candidate.get("label", "AI Proposal"),
            active_code_diff=self.active_code_diff,
            scenario_text=story_text,
            story=story_text,
            file_path=file_target,
            file_name=file_target,
            stage_title=stg.get("title", f"Stage {self.current_stage_index + 1}"),
            ticket_title=ticket,
            phase_name=stg.get("phase_name", "Apex Trigger Architecture"),
            ai_proposal_summary=ai_summary,
            chat_history=self.chat_history,
            stage_time_records=self.stage_time_records,
            history=self.history,
            active_incident=self.active_incident,
            recent_reactions=self.recent_reactions[-12:] if hasattr(self, "recent_reactions") else [],
            last_blamed_player=getattr(self, "last_blamed_player", None),
            slap_events=self.slap_events[-10:] if hasattr(self, "slap_events") else [],
        )

    # ---------------------------------------------------------
    # Action 1: Accept AI As-Is
    # ---------------------------------------------------------
    def commit_accept_as_is(self) -> Dict[str, Any]:
        if self.is_game_over or self.is_victory:
            return {"error": "Game is already completed"}

        candidate_label = self.active_candidate.get("label", "AI Proposal")
        result = self.scoring.evaluate_accept_as_is(self.current_hidden_risk, candidate_label)

        self._apply_action_result(result, method="accept_as_is")
        return result

    # ---------------------------------------------------------
    # Action 2: Manual Override (Senior Dev Craftsmanship)
    # ---------------------------------------------------------
    def execute_manual_override(self, player_id: str, player_name: str) -> Dict[str, Any]:
        if self.is_game_over or self.is_victory:
            return {"error": "Game is already completed"}
        if self.senior_dev_tokens <= 0:
            return {"error": "No Senior Dev Override Tokens remaining (limit: 2 per sprint)!"}

        # Deduct 1 token & burn 3m 30s (210s) sprint time
        self.senior_dev_tokens -= 1
        self.clock.deduct_seconds(SprintClockService.MANUAL_OVERRIDE_COST)

        is_crunch = self.clock.get_remaining_seconds() < 300  # < 5 minutes
        result = self.scoring.evaluate_manual_override(is_crunch_time=is_crunch)

        self._apply_action_result(result, method="manual_override")
        return result

    # ---------------------------------------------------------
    # Action 3: Prompt Steer (Interactive Human-AI Dialogue)
    # ---------------------------------------------------------
    def process_steer_turn(self, player_id: str, player_name: str, prompt_text: str) -> Dict[str, Any]:
        if self.is_game_over or self.is_victory:
            return {"error": "Game is already completed"}

        stage_num = self.current_stage_index + 1
        stg = self.get_current_stage_info()

        # 1. Record player message
        player_msg = ChatMessage(
            sender="player",
            player_name=player_name,
            text=prompt_text,
            timestamp=time.time(),
        )
        self.chat_history.append(player_msg)

        # 2. Process through Copilot Engine (accumulating conversation context)
        all_user_prompts = " ".join([m.text for m in self.chat_history if m.sender == "player"] + [prompt_text])
        reply_text, updated_diff, new_risk, is_hardened = self.copilot.process_turn(
            stage_id=stage_num,
            user_prompt=all_user_prompts,
            current_risk=self.current_hidden_risk,
            turn_index=len(self.chat_history),
            stage_title=stg.get("title", ""),
        )

        self.current_hidden_risk = new_risk
        self.active_code_diff = updated_diff
        self.is_steer_hardened = is_hardened

        # 3. Record Copilot response
        copilot_msg = ChatMessage(
            sender="copilot",
            player_name="AI Copilot",
            text=reply_text,
            timestamp=time.time(),
            risk_level="hardened" if is_hardened else ("low" if new_risk <= 0.20 else "medium"),
        )
        self.chat_history.append(copilot_msg)

        return {
            "reply_text": reply_text,
            "updated_code_diff": updated_diff,
            "hidden_risk_probability": new_risk,
            "is_hardened": is_hardened,
            "chat_history": [m.dict() for m in self.chat_history],
        }

    def commit_steered_code(self) -> Dict[str, Any]:
        """Locks in the steered code solution."""
        if self.is_game_over or self.is_victory:
            return {"error": "Game is already completed"}

        result = self.scoring.evaluate_steered_commit(
            self.current_hidden_risk, getattr(self, "is_steer_hardened", False)
        )
        self._apply_action_result(result, method="steer_prompt")
        return result

    # ---------------------------------------------------------
    # Action 4: Enforce Guardrail (Pre-Scanned Rules)
    # ---------------------------------------------------------
    def enforce_guardrail(self, rule_id: str, rule_title: str) -> Dict[str, Any]:
        if self.is_game_over or self.is_victory:
            return {"error": "Game is already completed"}

        # 15s review overhead
        self.clock.deduct_seconds(15)
        result = self.scoring.evaluate_guardrail(rule_title)
        self._apply_action_result(result, method="guardrail")
        return result

    # ---------------------------------------------------------
    # Internal State Application & Must-Clear Logic
    # ---------------------------------------------------------
    def _apply_action_result(self, result: Dict[str, Any], method: str) -> None:
        self.stage_action_taken = True
        health_delta = result.get("health_delta", 0)
        jenga_pulls = result.get("jenga_pulls", 0)
        debt_delta = result.get("debt_delta", 0)
        is_success = result.get("success", False)

        # Update stats
        self.health = max(0, min(100, self.health + health_delta))
        self.total_jenga_pulls += max(0, jenga_pulls)
        self.technical_debt = max(0, self.technical_debt + debt_delta)

        # Check tower failure
        if self.health <= 0 or self.total_jenga_pulls >= 18:
            self.is_game_over = True
            self.game_over_reason = (
                f"BUILD FAILURE: Tower collapsed under architectural stress ({self.health}% Health, "
                f"{self.total_jenga_pulls} Blocks Mined)!"
            )

        # Enrich result for frontend ResultModal compatibility
        label_map = {
            "accept_as_is": "Accept AI As-Is",
            "manual_override": "Senior Dev Manual Override",
            "steer_prompt": "Prompt Steer Solution",
            "guardrail": "Architectural Guardrail",
        }
        result["action_type"] = method
        result["action_label"] = label_map.get(method, method.replace("_", " ").title())
        fb = result.get("feedback") or result.get("feedback_message") or "Action evaluated and applied to codebase."
        result["feedback"] = fb
        result["feedback_message"] = fb
        result["new_health"] = self.health
        result["total_pulls"] = self.total_jenga_pulls
        result["pending_pulls"] = 0
        result["tower_instability_pct"] = self.calculate_instability()
        result["is_game_over"] = self.is_game_over
        result["game_over_reason"] = self.game_over_reason
        result["is_victory"] = self.is_victory
        self.last_action_result = result

        if self.is_game_over:
            return

        stg = self.get_current_stage_info()
        stg_id = self.current_stage_index + 1
        elapsed_stage_time = int(time.time() - self.stage_start_timestamp)

        if is_success:
            # Stage Cleared! Record timing & telemetry
            record = StageTimeRecord(
                stage_id=stg_id,
                stage_title=stg.get("title", f"Stage {stg_id}"),
                time_spent_seconds=elapsed_stage_time,
                method_used=method,
                attempts_count=self.stage_attempts_count,
                cleared=True,
            )
            self.stage_time_records.append(record)

            summary = StageSummaryRecord(
                stage_id=stg_id,
                stage_title=stg.get("title", f"Stage {stg_id}"),
                phase_name=stg.get("phase_name", "Sprint Execution"),
                action_type=method,
                action_label=method.replace("_", " ").title(),
                outcome="success",
                feedback=result.get("feedback", "Stage Cleared"),
                health_delta=health_delta,
                jenga_pulls=jenga_pulls,
                health_after=self.health,
                time_spent_seconds=elapsed_stage_time,
                details={"method": method, "roll": result.get("roll")},
            )
            self.history.append(summary)

            # Check Victory
            if self.current_stage_index >= self.total_stages - 1:
                self.is_victory = True
                self.clock.pause()
        else:
            # MUST-CLEAR LOGIC: Stage failed!
            # Deduct 45s Incident Remediation penalty and re-sample a candidate
            self.clock.deduct_seconds(SprintClockService.INCIDENT_PENALTY_COST)
            self._init_current_stage_candidate()

    def advance_stage(self) -> SprintStateResponse:
        """Advances to the next stage if current stage was cleared."""
        if self.current_stage_index < self.total_stages - 1:
            self.current_stage_index += 1
            self.stage_action_taken = False
            self.last_action_result = None
            self.stage_attempts_count = 0
            self.stage_start_timestamp = time.time()
            self._init_current_stage_candidate()
        return self.get_state()

    def reset_sprint(self, team_name: Optional[str] = None) -> SprintStateResponse:
        """Resets the sprint session back to Stage 1 with fresh 25m clock."""
        if team_name:
            self.team_name = team_name
        self.clock = SprintClockService()
        self.current_stage_index = 0
        self.health = 100
        self.technical_debt = 0
        self.total_jenga_pulls = 0
        self.senior_dev_tokens = 2
        self.is_game_over = False
        self.game_over_reason = None
        self.is_victory = False
        self.stage_time_records = []
        self.history = []
        self.last_action_result = None
        self.stage_action_taken = False
        self.stage_start_timestamp = time.time()
        self.stage_attempts_count = 0
        self._init_current_stage_candidate()
        return self.get_state()
