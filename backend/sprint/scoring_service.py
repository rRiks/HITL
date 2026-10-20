import random
from typing import Tuple, Dict, Any

class ScoringService:
    """
    ScoringService (Single Responsibility: Scoring, Health, Pulls & Dice Roll)
    Calculates outcome deltas and feedback messages without handling HTTP or time state.
    """
    def roll_dice(self, failure_threshold: float) -> Tuple[bool, float]:
        """
        Rolls a 0.0 - 1.0 random value against failure threshold.
        Returns: (is_success: bool, roll_value: float)
        If roll >= failure_threshold -> Success!
        """
        roll = round(random.random(), 4)
        is_success = roll >= failure_threshold
        return is_success, roll

    def evaluate_accept_as_is(self, hidden_risk: float, candidate_label: str) -> Dict[str, Any]:
        """Evaluates immediate commit of the active proposal against its secret risk."""
        is_success, roll = self.roll_dice(hidden_risk)
        if is_success:
            return {
                "success": True,
                "outcome": "success",
                "health_delta": 6,
                "jenga_pulls": 0,
                "debt_delta": 0,
                "roll": roll,
                "threshold": hidden_risk,
                "feedback": (
                    f"✅ AI Proposal Merged Cleanly! [{candidate_label}] passed automated integration tests "
                    f"(Risk threshold: {int(hidden_risk * 100)}% | Roll: {int(roll * 100)}%)."
                ),
            }
        else:
            return {
                "success": False,
                "outcome": "failure",
                "health_delta": -25,
                "jenga_pulls": 3,
                "debt_delta": 1,
                "roll": roll,
                "threshold": hidden_risk,
                "feedback": (
                    f"💥 Production Build Failure! Latent architectural defect in [{candidate_label}] triggered "
                    f"runtime governor exception (Risk threshold: {int(hidden_risk * 100)}% | Roll: {int(roll * 100)}%). "
                    f"Incident remediation penalty incurred."
                ),
            }

    def evaluate_manual_override(self, is_crunch_time: bool = False) -> Dict[str, Any]:
        """
        Evaluates Manual Override by senior dev:
        Normally 100% clean pass. If in crunch time, 15% fatigue bug factor.
        """
        if is_crunch_time:
            is_success, roll = self.roll_dice(0.15)
            if not is_success:
                return {
                    "success": False,
                    "outcome": "failure",
                    "health_delta": -15,
                    "jenga_pulls": 2,
                    "debt_delta": 0,
                    "roll": roll,
                    "threshold": 0.15,
                    "feedback": "⚠️ Senior Dev Fatigue Bug: Rushed manual hotfix under critical sprint deadline missed boundary check!",
                }

        return {
            "success": True,
            "outcome": "success",
            "health_delta": 15,
            "jenga_pulls": 0,
            "debt_delta": -1,
            "roll": 1.0,
            "threshold": 0.0,
            "feedback": (
                "🔧 Manual Senior Dev Craftsmanship: Production code written from scratch. "
                "Architectural debt repaired and stability reinforced."
            ),
        }

    def evaluate_steered_commit(self, hidden_risk: float, is_hardened: bool) -> Dict[str, Any]:
        """Evaluates commit of human-AI steered solution."""
        is_success, roll = self.roll_dice(hidden_risk)
        if is_success:
            bonus = 10 if is_hardened else 8
            return {
                "success": True,
                "outcome": "success",
                "health_delta": bonus,
                "jenga_pulls": 0,
                "debt_delta": -1 if is_hardened else 0,
                "roll": roll,
                "threshold": hidden_risk,
                "feedback": (
                    f"🎯 HITL Success! Team architectural steering resolved the incident cleanly. "
                    f"Code verified with {int(hidden_risk * 100)}% final risk profile."
                ),
            }
        else:
            return {
                "success": False,
                "outcome": "failure",
                "health_delta": -20,
                "jenga_pulls": 2,
                "debt_delta": 1,
                "roll": roll,
                "threshold": hidden_risk,
                "feedback": (
                    f"⚠️ Incomplete Steering: Steered logic still contained edge-case failure "
                    f"(Risk threshold: {int(hidden_risk * 100)}% | Roll: {int(roll * 100)}%)."
                ),
            }

    def evaluate_guardrail(self, rule_title: str) -> Dict[str, Any]:
        """Evaluates selecting a pre-scanned guardrail patch."""
        return {
            "success": True,
            "outcome": "success",
            "health_delta": 8,
            "jenga_pulls": 0,
            "debt_delta": 0,
            "roll": 0.9,
            "threshold": 0.1,
            "feedback": f"🛡️ Architectural Guardrail Enforced: [{rule_title}] applied successfully.",
        }
