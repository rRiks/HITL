import random
import time
from typing import Optional, List, Dict, Any
from stages_data import STAGES
from models import (
    GameStateResponse,
    StageDetails,
    RuleItem,
    AISuggestionItem,
    ActionRequest,
    ActionResponse,
    StageSummaryRecord,
    PlayerInfo,
    DraftRequest,
    VoteRequest,
)

class GameStateManager:
    def __init__(self, room_id: str = "default", team_name: str = "DevOps Gladiators", player_count: int = 4, room_code: Optional[str] = None):
        self.room_id: str = room_id
        self.room_code: str = (room_code or (room_id[:4].upper() if len(room_id) == 4 else "ALPH")).upper()
        self.team_name: str = team_name.strip() or "DevOps Gladiators"
        self.player_count: int = player_count
        self.current_stage_index: int = 0
        self.health: int = 100
        self.total_jenga_pulls: int = 0
        self.pending_pulls: int = 0
        self.is_game_over: bool = False
        self.game_over_reason: Optional[str] = None
        self.is_victory: bool = False
        self.has_started: bool = False
        self.history: List[StageSummaryRecord] = []
        self.stage_start_time: float = time.time()
        self.last_active: float = time.time()
        self.pending_stage_advance: bool = False
        self.stage_action_taken: bool = False
        self.last_action_result: Optional[Dict[str, Any]] = None

        # Live Player Roster & Democratic Voting State
        self.players: Dict[str, Dict[str, Any]] = {}
        self.votes: Dict[str, str] = {}  # player_id -> action_type
        self.custom_prompt_draft: Optional[Dict[str, Any]] = None
        self.guardrail_rule_draft: Optional[Dict[str, Any]] = None
        self.tie_broken: bool = False
        self.tied_options: Optional[List[str]] = None
        self.technical_debt: int = 0
        self.stage_restart_count: int = 0
        self.is_timer_paused: bool = False
        self.timer_override: Optional[bool] = None
        self._shuffled_suggestions: Dict[int, List[Dict[str, Any]]] = {}
        # Hint Economy (Budget of 6 hints across entire 11 stages)
        self.max_hints: int = 6
        self.hints_remaining: int = 6
        self.revealed_hints: List[int] = []

    def is_effective_timer_paused(self) -> bool:
        if getattr(self, "timer_override", None) is not None:
            return bool(self.timer_override)
        if getattr(self, "is_timer_paused", False):
            return True
        return bool(getattr(room_manager, "global_timer_paused", False))

    def reset_game(self, team_name: str = "DevOps Gladiators", player_count: int = 4):
        self.team_name = team_name.strip() or "DevOps Gladiators"
        self.player_count = player_count
        self.current_stage_index = 0
        self.health = 100
        self.total_jenga_pulls = 0
        self.pending_pulls = 0
        self.is_game_over = False
        self.game_over_reason = None
        self.is_victory = False
        self.has_started = True
        self.stage_action_taken = False
        self.last_action_result = None
        self.history = []
        self.stage_start_time = time.time()
        self.last_active = time.time()
        self.pending_stage_advance = False
        self.votes = {}
        self.custom_prompt_draft = None
        self.guardrail_rule_draft = None
        self.tie_broken = False
        self.tied_options = None
        self.technical_debt = 0
        self.stage_restart_count = 0
        self.is_timer_paused = False
        self.timer_override = None
        self._shuffled_suggestions = {}
        self.hints_remaining = 6
        self.revealed_hints = []

    def retry_current_stage(self, restore_health: int = 35):
        """
        Hotfix & Retry: restores the session from failure back to the current
        failed stage with 35 HP restored, enabling workshop teams to learn and
        try a proper guardrail rule without losing entire session progress.
        """
        self.stage_restart_count = getattr(self, "stage_restart_count", 0) + 1
        previous_health = self.health
        self.health = max(25, restore_health)
        self.is_game_over = False
        self.game_over_reason = None
        self.stage_action_taken = False
        self.last_action_result = None
        self.stage_start_time = time.time()
        self.last_active = time.time()
        self.pending_stage_advance = False
        self.votes = {}
        self.tie_broken = False
        self.tied_options = None
        self.custom_prompt_draft = None
        self.guardrail_rule_draft = None

        # Record Stage Restart in AIDLC Audit Log
        current_stg = self.get_current_stage()
        stg_id = current_stg["id"] if current_stg else (self.current_stage_index + 1)
        stg_title = current_stg["title"] if current_stg else f"Wave {stg_id}"
        phase_name = current_stg["phase_name"] if current_stg else "Incident Remediation"

        health_restored = self.health - previous_health if previous_health < self.health else self.health

        restart_record = StageSummaryRecord(
            stage_id=stg_id,
            stage_title=stg_title,
            phase_name=phase_name,
            action_type="stage_restart",
            action_label="Hotfix & Retry (Incident Remediation)",
            outcome="retry",
            feedback=(
                f"🔧 SRE Emergency Hotfix Applied: Restored +{health_restored}% Health to {self.health}% "
                f"and stabilized tower structure for second-chance retry. (Outage incident recorded)."
            ),
            health_delta=health_restored,
            jenga_pulls=0,
            health_after=self.health,
            time_spent_seconds=0,
            details={
                "type": "stage_restart",
                "restored_health": self.health,
                "previous_health": previous_health,
                "restart_number": self.stage_restart_count,
            }
        )
        self.history.append(restart_record)

    def get_current_stage(self) -> Optional[Dict[str, Any]]:
        if 0 <= self.current_stage_index < len(STAGES):
            stg = dict(STAGES[self.current_stage_index])
            # Return randomized/jumbled AI suggestions per room session
            if self.current_stage_index not in self._shuffled_suggestions:
                sugs = [dict(s) for s in stg.get("ai_suggestions", [])]
                random.shuffle(sugs)
                self._shuffled_suggestions[self.current_stage_index] = sugs
            stg["ai_suggestions"] = self._shuffled_suggestions[self.current_stage_index]
            stg["suggest_change_rules"] = stg["ai_suggestions"]
            return stg
        return None

    def calculate_instability(self) -> int:
        # Tower health directly represents the stability state of the tower:
        # 100 HP = 0% instability (rock solid)
        # Degrading HP directly destabilizes the tower, combined with physical block pulls.
        health_instability = max(0, 100 - self.health)
        pull_instability = int((self.total_jenga_pulls / 18.0) * 100)
        instability = max(health_instability, pull_instability)
        return min(100, max(0, instability))

    def touch_player(self, player_id: str, player_name: str) -> None:
        self.last_active = time.time()
        pid = player_id.strip() if player_id else "anonymous"
        pname = player_name.strip() if player_name else "Player"
        if pid not in self.players:
            self.players[pid] = {
                "player_id": pid,
                "player_name": pname,
                "last_seen": time.time(),
            }
        else:
            self.players[pid]["player_name"] = pname
            self.players[pid]["last_seen"] = time.time()

    def get_active_players(self, timeout_sec: float = 12.0) -> List[PlayerInfo]:
        now = time.time()
        # Clean up stale connections older than 45s
        stale_pids = [pid for pid, pdata in self.players.items() if now - pdata.get("last_seen", 0) > 45.0]
        for pid in stale_pids:
            self.players.pop(pid, None)
            self.votes.pop(pid, None)

        active = []
        for pid, pdata in self.players.items():
            if now - pdata.get("last_seen", 0) <= timeout_sec:
                voted_act = self.votes.get(pid)
                active.append(PlayerInfo(
                    player_id=pid,
                    player_name=pdata.get("player_name", "Player"),
                    has_voted=voted_act is not None,
                    voted_action=voted_act,
                    last_seen=pdata.get("last_seen", 0)
                ))
        return active

    def get_votes_tally(self) -> Dict[str, int]:
        tally = {
            "accept_as_is": 0,
            "deny_and_move_on": 0,
            "custom_prompt": 0,
            "suggest_change": 0,
        }
        for pid, act in self.votes.items():
            if act in tally:
                tally[act] += 1
        return tally

    def submit_draft(self, req: DraftRequest) -> GameStateResponse:
        self.touch_player(req.player_id, req.player_name)
        if self.stage_action_taken or self.is_game_over or self.is_effective_timer_paused():
            return self.get_state()
        if req.draft_type == "custom_prompt":
            self.custom_prompt_draft = {
                "text": (req.custom_prompt_text or "").strip(),
                "player_name": req.player_name,
                "player_id": req.player_id,
                "timestamp": time.time(),
            }
        elif req.draft_type == "suggest_change":
            stg = self.get_current_stage()
            rule_title = "Selected Guardrail Rule"
            if stg:
                all_sugs = stg.get("suggest_change_rules", []) + stg.get("ai_suggestions", [])
                for r in all_sugs:
                    if r["id"] == req.selected_rule_id:
                        rule_title = r["title"]
                        break
            self.guardrail_rule_draft = {
                "rule_id": req.selected_rule_id or "rule_1",
                "title": rule_title,
                "player_name": req.player_name,
                "player_id": req.player_id,
                "timestamp": time.time(),
            }
        return self.get_state()

    def submit_vote(self, req: VoteRequest) -> GameStateResponse:
        self.touch_player(req.player_id, req.player_name)
        if self.stage_action_taken or self.is_game_over or self.is_effective_timer_paused():
            return self.get_state()

        # Record or update vote
        self.votes[req.player_id] = req.action_type

        # Check if decision should resolve immediately:
        active = self.get_active_players()
        tally = self.get_votes_tally()
        max_v = max(tally.values(), default=0)

        # 1. Only 1 active player online in room (solo / test) -> resolve immediately
        # 2. All active players have voted -> resolve immediately
        # 3. An action holds strict mathematical majority (> active / 2) -> resolve immediately
        if len(active) <= 1 or all(p.player_id in self.votes for p in active) or (len(active) > 1 and max_v > len(active) / 2):
            self.resolve_voting(is_timeout=False, time_spent_seconds=req.time_spent_seconds)

        return self.get_state()

    def resolve_voting(self, is_timeout: bool = False, time_spent_seconds: int = 0) -> ActionResponse:
        if self.stage_action_taken and self.last_action_result:
            return ActionResponse(**self.last_action_result)

        tally = self.get_votes_tally()
        total_votes = sum(tally.values())

        if total_votes == 0:
            act_req = ActionRequest(
                action_type="accept_as_is",
                is_timeout=True,
                time_spent_seconds=120
            )
            return self.process_action(act_req)

        max_votes = max(tally.values())
        tied_candidates = [act for act, cnt in tally.items() if cnt == max_votes]

        tie_broken = False
        tied_options = None
        if len(tied_candidates) > 1:
            tie_broken = True
            tied_options = tied_candidates
            winning_action = random.choice(tied_candidates)  # 50-50 toss or 1-of-N uniform random
        else:
            winning_action = tied_candidates[0]

        prompt_text = None
        if winning_action == "custom_prompt" and self.custom_prompt_draft:
            prompt_text = self.custom_prompt_draft.get("text")

        rule_id = None
        if winning_action == "suggest_change":
            if self.guardrail_rule_draft:
                rule_id = self.guardrail_rule_draft.get("rule_id")
            else:
                rule_id = "rule_1"

        act_req = ActionRequest(
            action_type=winning_action,
            custom_prompt_text=prompt_text,
            selected_rule_id=rule_id,
            is_timeout=is_timeout,
            time_spent_seconds=time_spent_seconds
        )

        resp = self.process_action(act_req)
        resp.tie_broken = tie_broken
        resp.tied_options = tied_options
        resp.winning_votes_count = max_votes
        resp.total_votes_cast = total_votes

        # Append tie-breaker info to feedback message if tie occurred
        if tie_broken and tied_options:
            options_str = " vs ".join([opt.replace('_', ' ').title() for opt in tied_options])
            resp.feedback_message = (
                f"🎲 TIE-BREAKER (50/50 TOSS): Votes split across [{options_str}]. "
                f"Random toss selected [{winning_action.replace('_', ' ').title()}]!\n"
                + resp.feedback_message
            )

        self.last_action_result = resp.dict()
        return resp

    def get_state(self) -> GameStateResponse:
        current_stg = self.get_current_stage()
        stage_details = None
        if current_stg:
            stage_details = StageDetails(
                id=current_stg["id"],
                title=current_stg["title"],
                ticket_title=current_stg.get("ticket_title") or current_stg["title"],
                phase_name=current_stg["phase_name"],
                story=current_stg["story"],
                ai_proposal_summary=current_stg["ai_proposal_summary"],
                file_name=current_stg["file_name"],
                code_diff=current_stg["code_diff"],
                hidden_risks=current_stg["hidden_risks"],
                suggest_change_rules=[
                    RuleItem(**r) for r in current_stg["suggest_change_rules"]
                ],
                ai_suggestions=[
                    AISuggestionItem(**s) for s in current_stg.get("ai_suggestions", [])
                ]
            )

        self.last_active = time.time()
        return GameStateResponse(
            room_id=self.room_id,
            room_code=self.room_code,
            team_name=self.team_name,
            player_count=self.player_count,
            current_stage_index=self.current_stage_index,
            total_stages=len(STAGES),
            current_stage=stage_details,
            health=self.health,
            total_jenga_pulls=self.total_jenga_pulls,
            pending_pulls=self.pending_pulls,
            tower_instability_pct=self.calculate_instability(),
            is_game_over=self.is_game_over,
            game_over_reason=self.game_over_reason,
            is_victory=self.is_victory,
            has_started=self.has_started,
            stage_action_taken=self.stage_action_taken,
            last_action_result=self.last_action_result,
            history=self.history,
            current_stage_time_limit_seconds=120,
            technical_debt=self.technical_debt,
            stage_restart_count=getattr(self, "stage_restart_count", 0),
            active_players=self.get_active_players(),
            votes_tally=self.get_votes_tally(),
            custom_prompt_draft=self.custom_prompt_draft,
            guardrail_rule_draft=self.guardrail_rule_draft,
            tie_broken=self.tie_broken,
            tied_options=self.tied_options,
            is_timer_paused=self.is_effective_timer_paused(),
            max_hints=getattr(self, "max_hints", 6),
            hints_remaining=getattr(self, "hints_remaining", 6),
            revealed_hints=getattr(self, "revealed_hints", []),
        )

    def reveal_hint(self, stage_id: int) -> GameStateResponse:
        self.last_active = time.time()
        if not hasattr(self, "revealed_hints"):
            self.revealed_hints = []
        if not hasattr(self, "hints_remaining"):
            self.hints_remaining = 6
        if not hasattr(self, "max_hints"):
            self.max_hints = 6

        # Only charge hint if not already revealed for this stage
        if stage_id not in self.revealed_hints:
            if self.hints_remaining > 0:
                self.hints_remaining -= 1
                self.revealed_hints.append(stage_id)

        return self.get_state()

    def process_action(self, req: ActionRequest) -> ActionResponse:
        self.last_active = time.time()
        if self.is_game_over:
            return ActionResponse(
                room_id=self.room_id,
                success=False,
                action_type=req.action_type,
                action_label="Game Over",
                outcome="failure",
                feedback_message=f"Game already terminated: {self.game_over_reason}",
                health_delta=0,
                jenga_pulls=0,
                new_health=self.health,
                total_pulls=self.total_jenga_pulls,
                pending_pulls=self.pending_pulls,
                tower_instability_pct=self.calculate_instability(),
                is_game_over=True,
                game_over_reason=self.game_over_reason,
                is_victory=False,
                next_stage_ready=False,
                technical_debt=self.technical_debt,
                stage_restart_count=getattr(self, "stage_restart_count", 0)
            )

        # CONCURRENCY RESOLUTION (First-To-Act Wins):
        # If another teammate has already committed a decision for this stage,
        # return the identical cached ActionResponse immediately.
        # This prevents double health penalties, duplicate block extractions, or state drift.
        if self.stage_action_taken and self.last_action_result:
            return ActionResponse(**self.last_action_result)

        current_stg = self.get_current_stage()
        if not current_stg:
            raise ValueError("No active stage available.")

        action_type = req.action_type
        is_timeout = req.is_timeout
        health_delta = 0
        jenga_pulls = 0
        outcome = "success"
        feedback = ""
        action_label = ""
        roll_val: Optional[float] = None
        roll_threshold: Optional[float] = None
        adds_debt = False

        # 1. TIMEOUT CASE: If timer hit 00:00, forces "Accept As-Is"
        if is_timeout:
            action_type = "accept_as_is"
            action_label = "TIMEOUT FORCED: Accept As-Is"
            cfg = current_stg["accept_as_is"]
            roll_val = round(random.random(), 3)
            # If 5+ debts, degrade success threshold to 15%
            roll_threshold = 0.15 if self.technical_debt >= 5 else cfg["success_rate"]
            
            if roll_val < roll_threshold:
                outcome = "timeout_success"
                feedback = (
                    f"⏰ TIMEOUT EXPIRED! Defaulted to Blind Accept. "
                    f"By pure luck, AI didn't explode immediately, but panic overtime cost team morale. "
                    f"Timeout Penalty: -10% Health and mandatory 2 Jenga pulls!"
                )
                health_delta = -10
                jenga_pulls = 2
                adds_debt = True
            else:
                outcome = "timeout_failure"
                base_pulls = max(2, cfg["failure_pulls"] * 2)
                health_delta = cfg["failure_health_delta"] - 10
                jenga_pulls = base_pulls
                feedback = (
                    f"⏰ TIMEOUT DISASTER! You ran out of time and blindly deployed to production. "
                    f"{cfg['failure_feedback']} "
                    f"DOUBLE TIMEOUT PENALTY: {health_delta}% Health, MUST PULL {jenga_pulls} JENGA BLOCKS!"
                )
                adds_debt = True

        # 2. STANDARD "Accept as-is"
        elif action_type == "accept_as_is":
            action_label = "Accept As-Is"
            cfg = current_stg["accept_as_is"]
            roll_val = round(random.random(), 3)
            roll_threshold = 0.15 if self.technical_debt >= 5 else cfg["success_rate"]

            if roll_val < roll_threshold:
                outcome = "success"
                health_delta = cfg.get("success_health_delta", 5)
                jenga_pulls = cfg.get("success_pulls", 0)
                feedback = (
                    f"🎲 Roll {int(roll_val*100)}% (Threshold: {int(roll_threshold*100)}%): SUCCESS! "
                    f"{cfg['success_feedback']} (+{health_delta}% Health gained for rapid velocity delivery!)"
                )
            else:
                outcome = "failure"
                feedback = f"🎲 Roll {int(roll_val*100)}% (Threshold: {int(roll_threshold*100)}%): HALLUCINATION DETECTED! {cfg['failure_feedback']}"
                health_delta = cfg["failure_health_delta"]
                jenga_pulls = cfg["failure_pulls"]
                adds_debt = True

        # 3. "Deny and Move On (Bypass & Skip)"
        elif action_type == "deny_and_move_on":
            action_label = "Deny & Move On (Bypass & Skip)"
            cfg = current_stg["deny_and_move_on"]
            outcome = "partial"
            feedback = f"🛑 PR REJECTED: {cfg['feedback']}"
            health_delta = cfg["health_delta"]
            jenga_pulls = cfg["pulls"]
            adds_debt = True

        # 4. "Discuss & Type Custom Prompt (Human Guidance - Contextual Prompt Validation)"
        elif action_type == "custom_prompt":
            action_label = "Human Guidance (Contextual Prompt)"
            prompt_text = (req.custom_prompt_text or "").strip().lower()
            cfg = current_stg["custom_prompt"]
            keywords = cfg.get("keywords", [])

            # Check if prompt articulated genuine architectural solutions
            hit_keywords = [kw for kw in keywords if kw.lower() in prompt_text]

            if hit_keywords:
                outcome = "success"
                matched_str = f" [Matched concepts: {', '.join(hit_keywords[:3])}]"
                feedback = f"💬 HITL Prompt Accepted!{matched_str} {cfg['success_feedback']}"
                health_delta = cfg["success_health_delta"]
                jenga_pulls = cfg["success_pulls"]
            else:
                outcome = "failure"
                feedback = (
                    f"💬 Vague Guidance Flaw: The prompt did not specify concrete architectural solutions for this crisis! "
                    f"{cfg.get('failure_feedback', 'The AI agent generated an anti-pattern that broke under production load!')}"
                )
                health_delta = cfg.get("failure_health_delta", -12)
                jenga_pulls = cfg.get("failure_pulls", 1)
                adds_debt = True

        # 5. "AI Suggestions (3 Jumbled Technical Choices: Optimal, Patchwork, Flawed)"
        elif action_type == "suggest_change":
            action_label = "AI Suggestion"
            sugs = current_stg.get("ai_suggestions", current_stg.get("suggest_change_rules", []))
            selected_sug = None
            target_id = req.selected_rule_id
            if target_id:
                for s in sugs:
                    if s["id"] == target_id:
                        selected_sug = s
                        break
            if not selected_sug and sugs:
                selected_sug = sugs[0]

            tier = selected_sug.get("tier", "optimal")
            if tier == "optimal":
                outcome = "success"
                health_delta = selected_sug.get("health_delta", 8)
                jenga_pulls = selected_sug.get("pulls", 0)
                feedback = f"🤖 AI Suggestion [Optimal Match]: [{selected_sug['title']}]. {selected_sug.get('benefit_feedback', '')}"
            elif tier == "patchwork":
                outcome = "partial"
                health_delta = selected_sug.get("health_delta", 4)
                jenga_pulls = selected_sug.get("pulls", 1)
                feedback = f"🤖 AI Suggestion [Patchwork Quick-Fix]: [{selected_sug['title']}]. {selected_sug.get('benefit_feedback', '')}"
            else:  # flawed
                outcome = "failure"
                health_delta = selected_sug.get("health_delta", -10)
                jenga_pulls = selected_sug.get("pulls", 2)
                adds_debt = True
                feedback = f"🤖 AI Suggestion [Flawed Anti-Pattern]: [{selected_sug['title']}]. {selected_sug.get('benefit_feedback', '')}"

        else:
            raise ValueError(f"Unknown action type: {action_type}")

        # Update Technical Debt & Fragility Escalation (0-3: normal, 4: critical fragility, 5: systemic debt crisis)
        if adds_debt:
            self.technical_debt += 1
            if self.technical_debt >= 4:
                jenga_pulls = max(jenga_pulls, 3)
                health_delta = min(health_delta, -25)
                feedback += (
                    f"\n⚠️ CRITICAL DEBT FRAGILITY (Debt: {self.technical_debt}/5): Cumulative architectural debt "
                    f"triggered structural failure (-25% Health, 3 Blocks Pulled)!"
                )
            if self.technical_debt >= 5:
                feedback += (
                    f"\n🚨 SYSTEMIC DEBT CRISIS: Tech Debt reached 5! Base Accept As-Is success rate permanently degraded to 15%!"
                )

        # Update Health (Clamped 0 - 100)
        new_health = max(0, min(100, self.health + health_delta))
        self.health = new_health
        self.total_jenga_pulls += jenga_pulls
        self.pending_pulls = jenga_pulls

        # Check for Health Outage Game Over with explicit, detailed failure reason
        if self.health <= 0:
            self.is_game_over = True
            self.game_over_reason = (
                f"CATASTROPHIC INCIDENT in Stage {current_stg['id']} [{current_stg['title']}]: "
                f"{feedback} (Target File: {current_stg['file_name']} | Application Health collapsed to 0%)"
            )

        # Record History
        summary_rec = StageSummaryRecord(
            stage_id=current_stg["id"],
            stage_title=current_stg["title"],
            phase_name=current_stg["phase_name"],
            action_type=action_type,
            action_label=action_label,
            outcome=outcome,
            feedback=feedback,
            health_delta=health_delta,
            jenga_pulls=jenga_pulls,
            health_after=self.health,
            time_spent_seconds=req.time_spent_seconds or 0,
            details={
                "roll_val": roll_val,
                "roll_threshold": roll_threshold,
                "custom_prompt": req.custom_prompt_text,
                "selected_rule_id": req.selected_rule_id,
                "technical_debt": self.technical_debt,
            }
        )
        self.history.append(summary_rec)

        # Check for Victory on final stage
        if not self.is_game_over and self.current_stage_index == len(STAGES) - 1:
            self.is_victory = True

        resp = ActionResponse(
            room_id=self.room_id,
            success=True,
            action_type=action_type,
            action_label=action_label,
            outcome=outcome,
            roll_value=roll_val,
            roll_threshold=roll_threshold,
            feedback_message=feedback,
            health_delta=health_delta,
            jenga_pulls=jenga_pulls,
            new_health=self.health,
            total_pulls=self.total_jenga_pulls,
            pending_pulls=self.pending_pulls,
            tower_instability_pct=self.calculate_instability(),
            is_game_over=self.is_game_over,
            game_over_reason=self.game_over_reason,
            is_victory=self.is_victory,
            next_stage_ready=True,
            technical_debt=self.technical_debt,
            stage_restart_count=getattr(self, "stage_restart_count", 0)
        )
        self.stage_action_taken = True
        self.last_action_result = resp.dict()
        return resp

    def acknowledge_pulls(self, physical_tower_fell: bool = False):
        self.last_active = time.time()
        self.pending_pulls = 0
        if physical_tower_fell:
            self.is_game_over = True
            self.game_over_reason = "VIRTUAL 3D TOWER COLLAPSED: The Salesforce Architecture Tower toppled during block extraction!"

    def force_tower_collapse(self):
        self.last_active = time.time()
        current_stg = self.get_current_stage()
        stage_name = current_stg["title"] if current_stg else "Stage Execution"
        self.is_game_over = True
        self.game_over_reason = (
            f"3D ARCHITECTURAL COLLAPSE: Virtual Salesforce Architecture Tower suffered catastrophic structural "
            f"failure under excessive destabilization during {stage_name}!"
        )

    def advance_to_next_stage(self) -> bool:
        self.last_active = time.time()
        if self.is_game_over or self.is_effective_timer_paused():
            return False
        if self.current_stage_index < len(STAGES) - 1:
            self.current_stage_index += 1
            self.stage_start_time = time.time()
            self.pending_pulls = 0
            self.stage_action_taken = False
            self.last_action_result = None
            self.votes = {}
            self.custom_prompt_draft = None
            self.guardrail_rule_draft = None
            self.tie_broken = False
            self.tied_options = None
            return True
        else:
            self.is_victory = True
            return False


class RoomManager:
    """
    Manages isolated multi-team game rooms for workshops.
    Ensures that when 20+ developers split across multiple tables or rooms,
    each team has their own completely isolated 3D tower, health, and 11-stage progress.
    """
    KNOWN_PRESETS: Dict[str, str] = {
        "alpha-devs": "Alpha Devs",
        "byte-busters": "Byte Busters",
        "apex-sres": "Apex SREs",
        "cloud-titans": "Cloud Titans",
        "default": "Alpha Devs",
    }

    def __init__(self):
        self._rooms: Dict[str, GameStateManager] = {}
        self._code_to_room: Dict[str, str] = {}
        self.global_timer_paused: bool = False
        # Pre-seed default room for standard single-room play
        self.get_or_create_room("default", team_name="Alpha Devs", player_count=4, room_code="ALPH")

    def generate_room_code(self) -> str:
        alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"
        for _ in range(200):
            code = "".join(random.choices(alphabet, k=4))
            if code not in self._code_to_room and code.lower() not in self._rooms:
                return code
        return f"T{random.randint(100, 999)}"

    def resolve_room_id(self, code_or_id: Optional[str]) -> str:
        if not code_or_id:
            return "default"
        clean = self.normalize_room_id(code_or_id)
        upper = clean.upper()
        if upper in self._code_to_room:
            return self._code_to_room[upper]
        for rid, room in self._rooms.items():
            if getattr(room, "room_code", "").upper() == upper:
                return rid
        return clean

    def create_room_with_code(self, team_name: str, player_count: int = 4, room_code: Optional[str] = None) -> GameStateManager:
        code = (room_code or self.generate_room_code()).upper()
        norm_id = code.lower()
        if norm_id in self._rooms and not room_code:
            code = self.generate_room_code().upper()
            norm_id = code.lower()

        manager = GameStateManager(room_id=norm_id, team_name=team_name, player_count=player_count, room_code=code)
        self._rooms[norm_id] = manager
        self._code_to_room[code] = norm_id
        return manager

    def normalize_room_id(self, room_id: Optional[str]) -> str:
        if not room_id:
            return "default"
        clean = "".join(c for c in room_id.lower().strip() if c.isalnum() or c in "-_")
        return clean or "default"

    def derive_team_name(self, room_id: str) -> str:
        norm = self.normalize_room_id(room_id)
        if norm in self.KNOWN_PRESETS:
            return self.KNOWN_PRESETS[norm]
        words = norm.replace("-", " ").replace("_", " ").split()
        return " ".join(w.capitalize() for w in words) or "Alpha Devs"

    def get_or_create_room(self, room_id: str, team_name: Optional[str] = None, player_count: int = 4, room_code: Optional[str] = None) -> GameStateManager:
        resolved = self.resolve_room_id(room_id)
        if resolved not in self._rooms:
            code = (room_code or (resolved.upper() if len(resolved) == 4 and resolved.isalnum() else self.generate_room_code())).upper()
            actual_name = (team_name or "").strip() or self.derive_team_name(resolved)
            manager = GameStateManager(room_id=resolved, team_name=actual_name, player_count=player_count, room_code=code)
            self._rooms[resolved] = manager
            self._code_to_room[code] = resolved
        elif team_name and team_name.strip():
            self._rooms[resolved].team_name = team_name.strip()
        return self._rooms[resolved]

    def get_room(self, room_id: Optional[str]) -> GameStateManager:
        resolved = self.resolve_room_id(room_id)
        if resolved not in self._rooms:
            # Auto-create on demand with derived team name
            return self.get_or_create_room(resolved)
        return self._rooms[resolved]

    def list_leaderboard(self) -> List[Dict[str, Any]]:
        """
        Returns live telemetry for all active workshop rooms.
        Also supplements with realistic benchmark tables if fewer than 4 live rooms exist.
        """
        live_list = []
        for r_id, r in self._rooms.items():
            status = "active"
            if r.is_game_over:
                status = "collapsed"
            elif r.is_victory:
                status = "victorious"
            elif r.health > 80:
                status = "leading"
            elif r.health < 40:
                status = "warning"

            live_list.append({
                "room_id": r_id,
                "team_name": r.team_name,
                "health": r.health,
                "current_stage": r.current_stage_index + 1,
                "total_stages": len(STAGES),
                "total_pulls": r.total_jenga_pulls,
                "is_game_over": r.is_game_over,
                "is_victory": r.is_victory,
                "status": status,
                "last_active": r.last_active,
            })

        # Mock workshop competitor teams if only 1-2 real tables are active
        mock_benchmarks = [
            {"room_id": "table-2", "team_name": "Table 2: ByteBusters", "health": 82, "current_stage": 5, "total_stages": len(STAGES), "total_pulls": 2, "is_game_over": False, "is_victory": False, "status": "leading", "last_active": time.time() - 40},
            {"room_id": "table-4", "team_name": "Table 4: QuantumSREs", "health": 94, "current_stage": 7, "total_stages": len(STAGES), "total_pulls": 1, "is_game_over": False, "is_victory": False, "status": "leading", "last_active": time.time() - 15},
            {"room_id": "table-7", "team_name": "Table 7: NullPointers", "health": 0, "current_stage": 4, "total_stages": len(STAGES), "total_pulls": 7, "is_game_over": True, "is_victory": False, "status": "collapsed", "last_active": time.time() - 120},
            {"room_id": "table-9", "team_name": "Table 9: GlitchHunters", "health": 68, "current_stage": 6, "total_stages": len(STAGES), "total_pulls": 3, "is_game_over": False, "is_victory": False, "status": "active", "last_active": time.time() - 30},
        ]

        # Only add mock tables if they don't collide with real room IDs
        existing_ids = {item["room_id"] for item in live_list}
        for mock in mock_benchmarks:
            if mock["room_id"] not in existing_ids and len(live_list) < 6:
                live_list.append(mock)

        # Sort: Victors first, then non-collapsed by stage desc, then health desc
        live_list.sort(key=lambda x: (x["is_victory"], not x["is_game_over"], x["current_stage"], x["health"]), reverse=True)
        return live_list


# Global Room Manager instance
room_manager = RoomManager()

# Default singleton for backward compatibility
game_manager = room_manager.get_room("default")
