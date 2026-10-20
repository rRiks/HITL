import time

class SprintClockService:
    """
    SprintClockService (Single Responsibility: Time Engine)
    Tracks the master 25-minute sprint countdown, deductions, penalties, and overtime.
    """
    DEFAULT_DURATION_SECONDS = 1500  # 25 Minutes
    MANUAL_OVERRIDE_COST = 210        # 3 Minutes 30 Seconds
    INCIDENT_PENALTY_COST = 45        # 45 Seconds Remediation Penalty
    OVERTIME_TICK_SECONDS = 30        # Overtime fatigue penalty interval
    OVERTIME_HEALTH_PENALTY = 5       # -5% HP per overtime tick

    def __init__(self, duration_seconds: int = DEFAULT_DURATION_SECONDS):
        self.start_time: float = time.time()
        self.duration_seconds: int = duration_seconds
        self.accumulated_deductions: int = 0
        self.is_paused: bool = False
        self.paused_at: float = 0
        self.last_overtime_tick: float = 0

    def get_remaining_seconds(self) -> int:
        """Returns non-negative seconds left on the 25-minute sprint clock."""
        if self.is_paused:
            elapsed = self.paused_at - self.start_time
        else:
            elapsed = time.time() - self.start_time
        net_time = self.duration_seconds - int(elapsed) - self.accumulated_deductions
        return max(0, net_time)

    def deduct_seconds(self, seconds: int) -> int:
        """Deducts seconds immediately (for manual override or incident penalties)."""
        deduction = max(0, seconds)
        self.accumulated_deductions += deduction
        return self.get_remaining_seconds()

    def get_overtime_seconds(self) -> int:
        """Returns positive seconds spent in Overtime if the 25m clock reached 00:00."""
        remaining = self.get_remaining_seconds()
        if remaining > 0:
            return 0
        if self.is_paused:
            elapsed = self.paused_at - self.start_time
        else:
            elapsed = time.time() - self.start_time
        total_time_used = int(elapsed) + self.accumulated_deductions
        return max(0, total_time_used - self.duration_seconds)

    def check_and_apply_overtime_penalty(self) -> int:
        """Checks if a 30s overtime boundary was crossed and returns HP to deduct."""
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
