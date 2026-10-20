import { useState, useEffect } from 'react';

/**
 * useSprintClock (Single Responsibility: 25-Minute Master Sprint Timer)
 * Runs local second-by-second countdown, synchronizes with server state,
 * handles negative overtime formatting, and classifies urgency tiers.
 */
export function useSprintClock(serverTimeLeft = 1500, isRunning = true, serverIsOvertime = false, serverOvertimeSeconds = 0) {
  const [timeLeft, setTimeLeft] = useState(serverTimeLeft);
  const [isOvertime, setIsOvertime] = useState(serverIsOvertime);
  const [overtimeSec, setOvertimeSec] = useState(serverOvertimeSeconds);

  // Synchronize on remote polling updates
  useEffect(() => {
    setTimeLeft(serverTimeLeft);
    setIsOvertime(serverIsOvertime);
    setOvertimeSec(serverOvertimeSeconds);
  }, [serverTimeLeft, serverIsOvertime, serverOvertimeSeconds]);

  // Local second-by-second ticker
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsOvertime(true);
          setOvertimeSec((ot) => ot + 1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  // Urgency classification
  let urgency = 'on_track';
  if (isOvertime || timeLeft === 0) {
    urgency = 'overtime';
  } else if (timeLeft < 300) {
    urgency = 'zero_hour'; // Under 5 minutes
  } else if (timeLeft < 900) {
    urgency = 'crunch';    // Under 15 minutes
  }

  // Format string for header display
  let formattedTime = '';
  if (isOvertime) {
    const mins = Math.floor(overtimeSec / 60);
    const secs = overtimeSec % 60;
    formattedTime = `-${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  } else {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  return {
    timeLeft,
    formattedTime,
    urgency,
    isOvertime,
    overtimeSec,
  };
}
