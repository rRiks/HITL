import random
from typing import Tuple, Dict, Any

class ScoringService:
    """
    ScoringService (Single Responsibility: Scoring, Health, Pulls & Dice Roll)
    Calculates outcome deltas and feedback messages without handling HTTP or time state.
    """
    def roll_dice(self, success_threshold: float) -> Tuple[bool, float]:
        """
        Rolls a 0.0 - 1.0 random value against success threshold.
        Returns: (is_success: bool, roll_value: float)
        If roll <= success_threshold -> Clean Pass!
        """
        roll = round(random.random(), 4)
        is_success = roll <= success_threshold
        return is_success, roll

    def evaluate_accept_as_is(self, hidden_risk: float, candidate_label: str) -> Dict[str, Any]:
        """
        Evaluates immediate commit of the active proposal against its secret risk.
        hidden_risk = defect risk (e.g. 0.05 -> 5% chance of bug).
        success_threshold = 1.0 - hidden_risk (e.g. 0.95 -> 95% chance of clean pass).
        """
        success_threshold = round(max(0.05, min(0.95, 1.0 - hidden_risk)), 4)
        is_success, roll = self.roll_dice(success_threshold)
        risk_pct = int(round(hidden_risk * 100))
        success_pct = int(round(success_threshold * 100))
        roll_pct = int(round(roll * 100))

        if is_success:
            return {
                "success": True,
                "action_type": "accept_as_is",
                "action_label": "Accept AI As-Is",
                "outcome": "success",
                "health_delta": 6,
                "jenga_pulls": 0,
                "debt_delta": 0,
                "roll": roll,
                "roll_value": roll,
                "threshold": success_threshold,
                "roll_threshold": success_threshold,
                "risk_pct": risk_pct,
                "success_pct": success_pct,
                "feedback": (
                    f"✅ AI Proposal Merged Cleanly! [{candidate_label}] passed automated integration tests "
                    f"(Roll: {roll_pct}% ≤ {success_pct}% Success Threshold | Defect Risk: {risk_pct}%)."
                ),
            }
        else:
            return {
                "success": False,
                "action_type": "accept_as_is",
                "action_label": "Accept AI As-Is",
                "outcome": "failure",
                "health_delta": -25,
                "jenga_pulls": 3,
                "debt_delta": 1,
                "roll": roll,
                "roll_value": roll,
                "threshold": success_threshold,
                "roll_threshold": success_threshold,
                "risk_pct": risk_pct,
                "success_pct": success_pct,
                "feedback": (
                    f"💥 Production Build Failure! Latent architectural defect in [{candidate_label}] triggered "
                    f"runtime governor exception (Roll: {roll_pct}% > {success_pct}% Success Threshold | Defect Risk: {risk_pct}%). "
                    f"Incident remediation penalty incurred."
                ),
            }

    def evaluate_manual_override(self, is_crunch_time: bool = False) -> Dict[str, Any]:
        """
        Evaluates Manual Override by senior dev:
        Normally 100% clean pass. If in crunch time, 15% fatigue bug factor (85% success threshold).
        """
        if is_crunch_time:
            is_success, roll = self.roll_dice(0.85)
            if not is_success:
                return {
                    "success": False,
                    "action_type": "manual_override",
                    "action_label": "Senior Dev Manual Override",
                    "outcome": "failure",
                    "health_delta": -15,
                    "jenga_pulls": 2,
                    "debt_delta": 0,
                    "roll": roll,
                    "roll_value": roll,
                    "threshold": 0.85,
                    "roll_threshold": 0.85,
                    "risk_pct": 15,
                    "success_pct": 85,
                    "feedback": "⚠️ Senior Dev Fatigue Bug: Rushed manual hotfix under critical sprint deadline missed boundary check!",
                }

        return {
            "success": True,
            "action_type": "manual_override",
            "action_label": "Senior Dev Manual Override",
            "outcome": "success",
            "health_delta": 15,
            "jenga_pulls": 0,
            "debt_delta": -1,
            "roll": 0.0,
            "roll_value": 0.0,
            "threshold": 1.0,
            "roll_threshold": 1.0,
            "risk_pct": 0,
            "success_pct": 100,
            "feedback": (
                "🔧 Manual Senior Dev Craftsmanship: Production code written from scratch. "
                "Architectural debt repaired and stability reinforced."
            ),
        }

    def evaluate_steered_commit(self, hidden_risk: float, is_hardened: bool) -> Dict[str, Any]:
        """Evaluates commit of human-AI steered solution."""
        success_threshold = round(max(0.05, min(0.95, 1.0 - hidden_risk)), 4)
        is_success, roll = self.roll_dice(success_threshold)
        risk_pct = int(round(hidden_risk * 100))
        success_pct = int(round(success_threshold * 100))
        roll_pct = int(round(roll * 100))

        if is_success:
            bonus = 10 if is_hardened else 8
            return {
                "success": True,
                "action_type": "custom_prompt",
                "action_label": "Human Guidance Steering",
                "outcome": "success",
                "health_delta": bonus,
                "jenga_pulls": 0,
                "debt_delta": -1 if is_hardened else 0,
                "roll": roll,
                "roll_value": roll,
                "threshold": success_threshold,
                "roll_threshold": success_threshold,
                "risk_pct": risk_pct,
                "success_pct": success_pct,
                "feedback": (
                    f"🎯 HITL Success! Team architectural steering resolved the incident cleanly. "
                    f"(Roll: {roll_pct}% ≤ {success_pct}% Success Threshold | Final Defect Risk: {risk_pct}%)."
                ),
            }
        else:
            return {
                "success": False,
                "action_type": "custom_prompt",
                "action_label": "Human Guidance Steering",
                "outcome": "failure",
                "health_delta": -20,
                "jenga_pulls": 2,
                "debt_delta": 1,
                "roll": roll,
                "roll_value": roll,
                "threshold": success_threshold,
                "roll_threshold": success_threshold,
                "risk_pct": risk_pct,
                "success_pct": success_pct,
                "feedback": (
                    f"⚠️ Incomplete Steering: Steered logic still contained edge-case failure "
                    f"(Roll: {roll_pct}% > {success_pct}% Success Threshold | Final Defect Risk: {risk_pct}%)."
                ),
            }

    def evaluate_guardrail(self, rule_title: str) -> Dict[str, Any]:
        """Evaluates selecting a pre-scanned guardrail patch."""
        return {
            "success": True,
            "action_type": "suggest_change",
            "action_label": "Enforce Architectural Guardrail",
            "outcome": "success",
            "health_delta": 8,
            "jenga_pulls": 0,
            "debt_delta": 0,
            "roll": None,
            "roll_value": None,
            "threshold": None,
            "roll_threshold": None,
            "feedback": f"🛡️ Architectural Guardrail Enforced: [{rule_title}] applied successfully.",
        }
