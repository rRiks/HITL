import { useState, useCallback } from 'react';
import * as api from '../../../services/api';

/**
 * useSprintActions (Single Responsibility: Sprint Action Execution)
 * Dispatches the 4 Sprint Delivery choices:
 *  1. Accept AI As-Is
 *  2. Manual Override (Senior dev 3:30 velocity burn + token)
 *  3. Commit Steered Code
 *  4. Enforce Guardrail Rule
 */
export function useSprintActions(roomId, onStateUpdated, sound) {
  const [loading, setLoading] = useState(false);
  const [actionResult, setActionResult] = useState(null);

  const acceptAsIs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.submitSprintAcceptAsIs(roomId);
      setActionResult(res.result);
      if (onStateUpdated) onStateUpdated(res.state);

      if (res.result.success) {
        sound?.playSuccess?.();
      } else {
        sound?.playWarning?.();
      }
      return res.result;
    } catch (err) {
      console.error('Accept As-Is Error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [roomId, onStateUpdated, sound]);

  const manualOverride = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.submitSprintManualOverride(
        roomId,
        api.getPlayerId(),
        api.getPlayerName()
      );
      setActionResult(res.result);
      if (onStateUpdated) onStateUpdated(res.state);

      sound?.playSuccess?.();
      return res.result;
    } catch (err) {
      console.error('Manual Override Error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [roomId, onStateUpdated, sound]);

  const commitSteer = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.commitSprintSteeredCode(roomId);
      setActionResult(res.result);
      if (onStateUpdated) onStateUpdated(res.state);

      if (res.result.success) {
        sound?.playSuccess?.();
      } else {
        sound?.playWarning?.();
      }
      return res.result;
    } catch (err) {
      console.error('Commit Steered Code Error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [roomId, onStateUpdated, sound]);

  const enforceGuardrail = useCallback(async (ruleId, ruleTitle) => {
    try {
      setLoading(true);
      const res = await api.submitSprintGuardrail(roomId, ruleId, ruleTitle);
      setActionResult(res.result);
      if (onStateUpdated) onStateUpdated(res.state);

      sound?.playSuccess?.();
      return res.result;
    } catch (err) {
      console.error('Guardrail Error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [roomId, onStateUpdated, sound]);

  const clearActionResult = useCallback(() => {
    setActionResult(null);
  }, []);

  return {
    loading,
    actionResult,
    acceptAsIs,
    manualOverride,
    commitSteer,
    enforceGuardrail,
    clearActionResult,
  };
}
