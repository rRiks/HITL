import { useState, useEffect, useCallback, useRef } from 'react';
import * as api from '../../../services/api';
import { useSprintClock } from './useSprintClock';
import { useSprintDialogue } from './useSprintDialogue';
import { useSprintActions } from './useSprintActions';

/**
 * useSprintSession (Top-Level Facade Hook)
 * Coordinates the master sprint state, clock, dialogue engine, and action dispatchers.
 */
export function useSprintSession(roomId, sound) {
  const [sprintState, setSprintState] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [overriddenDiff, setOverriddenDiff] = useState(null);
  const isAdvancingRef = useRef(false);

  // 1. Fetch initial state & Polling loop (every 2.5s)
  const refreshState = useCallback(async () => {
    try {
      const state = await api.fetchSprintState(roomId);
      setSprintState(state);
      return state;
    } catch (err) {
      console.warn('Sprint state poll error:', err);
    } finally {
      setInitialLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    refreshState();
    const interval = setInterval(() => {
      if (!isAdvancingRef.current) {
        refreshState();
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [refreshState]);

  // 2. Sprint Master Clock Service Hook
  const clock = useSprintClock(
    sprintState?.sprint_time_left_seconds ?? 1500,
    sprintState?.is_sprint_timer_running ?? true,
    sprintState?.is_overtime ?? false,
    sprintState?.overtime_seconds ?? 0
  );

  // 3. Human-AI Copilot Dialogue Hook
  const dialogue = useSprintDialogue(
    roomId,
    sprintState?.chat_history || [],
    overriddenDiff || sprintState?.active_code_diff || '',
    (newDiff) => setOverriddenDiff(newDiff)
  );

  // 4. Sprint Action Dispatchers Hook
  const actions = useSprintActions(
    roomId,
    (updatedState) => setSprintState(updatedState),
    sound
  );

  // Reset overridden diff on stage change
  useEffect(() => {
    setOverriddenDiff(null);
  }, [sprintState?.current_stage_index]);

  // Advance to next stage (Must-Clear gating validated server-side)
  const advanceStage = useCallback(async () => {
    if (isAdvancingRef.current) return;
    try {
      isAdvancingRef.current = true;
      actions.clearActionResult();
      const nextState = await api.advanceSprintStage(roomId);
      setSprintState(nextState);
      setOverriddenDiff(null);
      dialogue.clearChat();
      sound?.playSuccess?.();
    } catch (err) {
      console.error('Failed to advance sprint stage:', err);
    } finally {
      isAdvancingRef.current = false;
    }
  }, [roomId, actions, dialogue, sound]);

  // Reset entire 25m sprint
  const resetSprint = useCallback(async () => {
    try {
      actions.clearActionResult();
      const freshState = await api.resetSprintGame(roomId);
      setSprintState(freshState);
      setOverriddenDiff(null);
      dialogue.clearChat();
    } catch (err) {
      console.error('Failed to reset sprint:', err);
    }
  }, [roomId, actions, dialogue]);

  return {
    sprintState,
    initialLoading,
    clock,
    dialogue,
    actions,
    advanceStage,
    resetSprint,
    activeCodeDiff: overriddenDiff || sprintState?.active_code_diff || '',
  };
}
