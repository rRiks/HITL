# Low-Level Design Document (LLD.md)
## Project: Voxel AIDLC — Sprint Delivery (SoC Modular Implementation)
**Document:** Low-Level Component Contracts, Service Interfaces & Frontend Hooks  
**Core Architectural Standard:** Strict Separation of Concerns (SoC)  
**Status:** Approved for Implementation  

---

## 1. Backend Service Contracts (`backend/sprint/`)

### 1.1 `SprintClockService` (`backend/sprint/clock_service.py`)
Responsible strictly for time tracking, master sprint countdown, deductions, and overtime math.

```python
import time
from typing import Tuple

class SprintClockService:
    DEFAULT_DURATION_SECONDS = 1500  # 25 Minutes
    MANUAL_OVERRIDE_COST = 210        # -3:30 Minutes
    INCIDENT_PENALTY_COST = 45        # -45s Incident Remediation
    OVERTIME_TICK_SECONDS = 30        # Fatigue penalty interval
    OVERTIME_HEALTH_PENALTY = 5       # -5% HP per overtime tick

    def __init__(self, duration_seconds: int = DEFAULT_DURATION_SECONDS):
        self.start_time: float = time.time()
        self.duration_seconds: int = duration_seconds
        self.accumulated_deductions: int = 0
        self.is_paused: bool = False
        self.paused_at: float = 0
        self.last_overtime_tick: float = 0

    def get_remaining_seconds(self) -> int:
        """Returns integer seconds remaining on the master clock (can be 0)."""
        if self.is_paused:
            elapsed = self.paused_at - self.start_time
        else:
            elapsed = time.time() - self.start_time
        net_time = self.duration_seconds - int(elapsed) - self.accumulated_deductions
        return max(0, net_time)

    def deduct_seconds(self, seconds: int) -> None:
        """Deducts sprint time immediately for penalties or manual coding."""
        self.accumulated_deductions += max(0, seconds)

    def get_overtime_seconds(self) -> int:
        """If sprint clock hit 00:00, returns positive seconds spent in Overtime."""
        remaining = self.get_remaining_seconds()
        if remaining > 0:
            return 0
        elapsed = time.time() - self.start_time
        total_lost = int(elapsed) + self.accumulated_deductions
        return max(0, total_lost - self.duration_seconds)

    def check_and_apply_overtime_penalty(self) -> int:
        """Returns health points to deduct if a 30s overtime interval passed."""
        overtime_sec = self.get_overtime_seconds()
        if overtime_sec <= 0:
            return 0
        if overtime_sec - self.last_overtime_tick >= self.OVERTIME_TICK_SECONDS:
            self.last_overtime_tick = overtime_sec
            return self.OVERTIME_HEALTH_PENALTY
        return 0

    def pause(self) -> None:
        if not self.is_paused:
            self.is_paused = True
            self.paused_at = time.time()

    def resume(self) -> None:
        if self.is_paused:
            self.start_time += (time.time() - self.paused_at)
            self.is_paused = False
```

---

### 1.2 `CandidateRepository` (`backend/sprint/candidate_repo.py`)
Pure data access layer storing the 6 candidate proposals per stage and stochastic sampling.

```python
import random
from typing import Dict, Any, List

class CandidateRepository:
    def __init__(self, pool_data: Dict[int, List[Dict[str, Any]]]):
        self._pools = pool_data

    def get_stage_candidates(self, stage_id: int) -> List[Dict[str, Any]]:
        return self._pools.get(stage_id, [])

    def sample_candidate(self, stage_id: int) -> Dict[str, Any]:
        """
        Samples a proposal candidate from the 6-item pool with replacement.
        The returned dict strips out 'hidden_risk' so the controller cannot leak it to the client.
        """
        candidates = self._pools.get(stage_id, [])
        if not candidates:
            return {"id": "c_default", "label": "Default Proposal", "code_diff": "", "hidden_risk": 0.50}
        return random.choice(candidates)

    def get_candidate_hidden_risk(self, stage_id: int, candidate_id: str) -> float:
        """Internal retrieval of the candidate's secret risk probability (0.05 to 0.85)."""
        candidates = self._pools.get(stage_id, [])
        for c in candidates:
            if c["id"] == candidate_id:
                return float(c.get("hidden_risk", 0.50))
        return 0.50
```

---

### 1.3 `RulesEvaluator` (`backend/sprint/rules_evaluator.py`)
Functional keyword and domain pattern matching engine.

```python
import re
from typing import Dict, Any, Tuple

class RulesEvaluator:
    def __init__(self, stage_rules: Dict[int, Dict[str, Any]]):
        self._rules = stage_rules

    def evaluate_prompt(self, stage_id: int, prompt_text: str) -> Tuple[float, Dict[str, bool], str]:
        """
        Scans prompt text against domain keyword groups.
        Returns: (risk_reduction: float, matches: Dict[str, bool], architectural_hint: str)
        """
        norm_text = prompt_text.lower().strip()
        rules = self._rules.get(stage_id, {})
        
        core_hits = any(k in norm_text for k in rules.get("core_keywords", []))
        tuning_hits = any(k in norm_text for k in rules.get("tuning_keywords", []))
        hardening_hits = any(k in norm_text for k in rules.get("hardening_keywords", []))
        
        reduction = 0.0
        if core_hits:
            reduction += 0.35
        if tuning_hits:
            reduction += 0.20
        if hardening_hits:
            reduction += 0.15
            
        matches = {
            "core": core_hits,
            "tuning": tuning_hits,
            "hardening": hardening_hits,
        }
        
        hint = rules.get("hint", "Specify design patterns or chunking to optimize architecture.")
        return reduction, matches, hint
```

---

### 1.4 `CopilotEngine` (`backend/sprint/copilot_engine.py`)
Manages multi-turn conversation states, generates dynamic text, and swaps code diffs.

```python
from typing import Tuple, Dict, Any, List
from .rules_evaluator import RulesEvaluator

class CopilotEngine:
    def __init__(self, evaluator: RulesEvaluator, diff_templates: Dict[int, Dict[str, str]]):
        self.evaluator = evaluator
        self.diff_templates = diff_templates

    def process_turn(
        self,
        stage_id: int,
        user_prompt: str,
        current_risk: float,
        turn_index: int
    ) -> Tuple[str, str, float, bool]:
        """
        Executes a dialogue turn.
        Returns: (reply_text, updated_code_diff, new_risk, is_hardened)
        """
        reduction, matches, hint = self.evaluator.evaluate_prompt(stage_id, user_prompt)
        new_risk = max(0.05, current_risk - reduction)
        
        templates = self.diff_templates.get(stage_id, {})
        
        if matches["core"] and matches["tuning"] and matches["hardening"]:
            reply = (
                "🤖 Copilot: Outstanding architectural guidance! Refactored into a fully hardened, "
                "defensive design with transaction isolation and error events. Hidden risk minimized to 5%."
            )
            code_diff = templates.get("hardened", "")
            return reply, code_diff, new_risk, True
            
        elif matches["core"]:
            reply = (
                f"🤖 Copilot: Refactored implementation into standard design pattern. "
                f"Risk reduced significantly. (Hint: {hint})"
            )
            code_diff = templates.get("refactored", "")
            return reply, code_diff, new_risk, False
            
        else:
            reply = (
                f"🤖 Copilot: I reviewed the instructions, but no core architecture pattern was recognized. "
                f"Risk remains elevated. {hint}"
            )
            code_diff = templates.get("baseline", "")
            return reply, code_diff, new_risk, False
```

---

### 1.5 `ScoringService` (`backend/sprint/scoring_service.py`)
Calculates dice rolls, health impacts, Jenga block mining counts, and technical debt.

```python
import random
from typing import Tuple, Dict, Any

class ScoringService:
    def roll_dice(self, failure_threshold: float) -> Tuple[bool, float]:
        """
        Rolls a 0.0 - 1.0 random value against failure threshold.
        Returns: (is_success: bool, roll_value: float)
        """
        roll = random.random()
        # If roll is GREATER than threshold, it succeeds!
        is_success = roll >= failure_threshold
        return is_success, roll

    def evaluate_manual_override(self) -> Dict[str, Any]:
        """Manual coding delivers 100% clean pass with +15% Health and 0 block pulls."""
        return {
            "success": True,
            "health_delta": 15,
            "jenga_pulls": 0,
            "debt_delta": -1,
            "feedback": "🔧 Manual Senior Dev Craftsmanship: Production code written from scratch. Zero governor debt.",
        }

    def evaluate_candidate_commit(self, hidden_risk: float) -> Dict[str, Any]:
        """Rolls dice based on candidate's secret risk."""
        success, roll = self.roll_dice(hidden_risk)
        if success:
            return {
                "success": True,
                "health_delta": 5,
                "jenga_pulls": 0,
                "debt_delta": 0,
                "roll": roll,
                "feedback": "✅ PR Merged Cleanly: Automated tests passed without incident.",
            }
        else:
            return {
                "success": False,
                "health_delta": -25,
                "jenga_pulls": 3,
                "debt_delta": 1,
                "roll": roll,
                "feedback": "💥 Catastrophic Outage: Latent architectural defect triggered runtime exception!",
            }
```

---

### 1.6 `SprintSessionManager` (`backend/sprint/session_manager.py`)
Facade orchestrating all domain services for an individual room.

```python
class SprintSessionManager:
    def __init__(
        self,
        room_id: str,
        team_name: str,
        clock: SprintClockService,
        candidates: CandidateRepository,
        copilot: CopilotEngine,
        scoring: ScoringService,
    ):
        self.room_id = room_id
        self.team_name = team_name
        self.clock = clock
        self.candidates = candidates
        self.copilot = copilot
        self.scoring = scoring
        
        self.current_stage_index = 0
        self.health = 100
        self.technical_debt = 0
        self.total_jenga_pulls = 0
        self.senior_dev_tokens = 2
        
        self.active_candidate = self.candidates.sample_candidate(1)
        self.current_hidden_risk = self.candidates.get_candidate_hidden_risk(1, self.active_candidate["id"])
        self.active_code_diff = self.active_candidate.get("code_diff", "")
        self.chat_history = []
        self.stage_time_records = []
        self.stage_start_timestamp = time.time()
```

---

## 2. Frontend Hook Contracts (`frontend/src/games/sprint_delivery/hooks/`)

### 2.1 `useSprintClock(roomState)`
```javascript
export function useSprintClock(initialDuration = 1500) {
  // Returns:
  // - timeLeftSeconds: number
  // - formattedClock: string ("24:15" or "-01:30")
  // - urgency: "on_track" | "crunch" | "zero_hour" | "overtime"
  // - isOvertime: boolean
}
```

### 2.2 `useSprintDialogue(roomId)`
```javascript
export function useSprintDialogue(roomId, currentStageId) {
  // Returns:
  // - chatHistory: Array<{ sender, text, timestamp, isHardened }>
  // - isTyping: boolean (drives typewriter animation)
  // - activeCodeDiff: string (live refactored diff for StageScenarioViewer)
  // - sendSteerTurn(userPromptText): Promise<void>
  // - resetDialogue(): void
}
```

### 2.3 `useSprintActions(roomId, sessionState)`
```javascript
export function useSprintActions(roomId, sessionState) {
  // Returns:
  // - seniorDevTokens: number (2 max)
  // - acceptAsIs(): Promise<ActionResult>
  // - executeManualOverride(): Promise<ActionResult>
  // - enforceGuardrail(ruleId): Promise<ActionResult>
  // - commitSteeredCode(): Promise<ActionResult>
}
```

### 2.4 `useSprintSession(roomId)`
Facade hook that aggregates `useSprintClock`, `useSprintDialogue`, and `useSprintActions` into a clean object consumed directly by [`SprintDeliveryScreen.jsx`](file:///c:/Users/saubh/Documents/GenAI/AI/HITL/frontend/src/games/sprint_delivery/SprintDeliveryScreen.jsx).
