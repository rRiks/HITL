import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  ShieldCheck,
  Dice5,
  Sparkles,
  CheckCircle2,
  AlertOctagon,
  ArrowRight,
  Send,
  X,
  Flame,
  AlertTriangle,
  Rotate3d,
  Play,
  RotateCcw,
} from 'lucide-react';

/* -------------------------------------------------------------
 * 1. Custom Prompt Modal (Book & Quill)
 * -----------------------------------------------------------*/
export function CustomPromptModal({
  isOpen,
  onClose,
  onSubmitPrompt,
  stageTitle = '',
}) {
  const [promptText, setPromptText] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!promptText.trim()) return;
    onSubmitPrompt(promptText.trim());
    setPromptText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 dark:bg-black/75 backdrop-blur-sm animate-fadeIn select-none">
      <div className="mc-panel-dark w-full max-w-lg p-5 sm:p-6 shadow-2xl relative bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-2xl max-h-[88vh] overflow-y-auto font-sans">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer p-1 rounded-lg transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 bg-amber-500/15 border border-amber-500/35 text-amber-800 dark:text-amber-400 text-xl rounded-xl">
            🪶
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-amber-800 dark:text-amber-300 font-theme-heading">
              BOOK & QUILL: HUMAN GUIDANCE
            </h3>
            <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5">{stageTitle}</p>
          </div>
        </div>

        <p className="text-xs sm:text-[13px] text-[var(--text-secondary)] font-medium mb-4 leading-relaxed font-sans">
          Inspect the code diff carefully. Inscribe specific architectural instructions into the Book & Quill to steer the AI agent (e.g. methods, collection patterns, locking mechanisms, or transaction boundaries). Vague prompts will result in AI hallucinations and tech debt!
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-amber-800 dark:text-amber-400 mb-1.5 uppercase tracking-wider">
              INSCRIBE ARCHITECTURAL GUIDANCE:
            </label>
            <textarea
              rows={4}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="e.g., Do not query inside loops. Extract parent IDs into a Set, run a bulkified SOQL query outside iteration, and map in-memory..."
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 p-3 text-xs sm:text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none font-mono resize-none transition-all rounded-xl"
              autoFocus
            />
            <div className="flex justify-between items-center text-[11px] font-mono mt-1.5">
              <span className="text-[var(--text-muted)]">{promptText.length} CHARS</span>
              <span className="text-emerald-800 dark:text-emerald-300 font-bold">Valid architectural concepts grant +8% Health!</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!promptText.trim()}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Inscribe & Dispatch</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
 * 2. AI Suggestions Modal (3 Jumbled Technical Fixes)
 * -----------------------------------------------------------*/
export function GuardrailsModal({
  isOpen,
  onClose,
  rules = [],
  onSubmitRule,
}) {
  const [selectedRuleId, setSelectedRuleId] = useState(rules[0]?.id || '');

  useEffect(() => {
    if (rules.length > 0 && (!selectedRuleId || !rules.some(r => r.id === selectedRuleId))) {
      setSelectedRuleId(rules[0].id);
    }
  }, [rules, selectedRuleId]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!selectedRuleId) return;
    onSubmitRule(selectedRuleId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 dark:bg-black/75 backdrop-blur-sm animate-fadeIn select-none">
      <div className="mc-panel-dark w-full max-w-lg p-5 sm:p-6 shadow-2xl relative bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-2xl max-h-[88vh] overflow-y-auto font-sans">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer p-1 rounded-lg transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 bg-indigo-500/15 border border-indigo-500/35 text-indigo-800 dark:text-indigo-400 text-xl rounded-xl">
            🤖
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-indigo-900 dark:text-indigo-300 font-theme-heading">
              AI PROPOSED FIXES: 3 OPTIONS
            </h3>
            <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5">Review Proposed Code Solutions</p>
          </div>
        </div>

        <p className="text-xs sm:text-[13px] text-[var(--text-secondary)] font-medium mb-4 leading-relaxed font-sans">
          The AI coding agent generated 3 separate technical fixes. One is an optimal architectural solution (+8% Health, 0 pulls), another is a quick patch with trade-offs (+4% Health, 1 pull), and one is a flawed anti-pattern (-10% Health, 2 pulls, +1 Debt). Inspect their descriptions and select wisely!
        </p>

        <div className="space-y-2.5 mb-5">
          {rules.map((rule, idx) => {
            const isSelected = selectedRuleId === rule.id;
            return (
              <div
                key={rule.id || idx}
                onClick={() => setSelectedRuleId(rule.id)}
                className={`p-3.5 border transition-all cursor-pointer flex items-start gap-3 rounded-xl shadow-xs ${
                  isSelected
                    ? 'bg-indigo-500/10 border-indigo-500 ring-2 ring-indigo-500/30 text-[var(--text-primary)]'
                    : 'bg-[var(--bg-elevated)] border-[var(--border-subtle)] hover:border-indigo-500/40 text-[var(--text-secondary)]'
                }`}
              >
                <div className="pt-0.5">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-600'
                        : 'border-[var(--border-subtle)] bg-[var(--bg-card)]'
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1 gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] leading-snug">
                      {rule.title}
                    </h4>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border shrink-0 ${
                        isSelected
                          ? 'bg-indigo-500/20 text-indigo-900 dark:text-indigo-200 border-indigo-500/40'
                          : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-subtle)]'
                      }`}
                    >
                      OPTION {idx + 1}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed font-sans">
                    {rule.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Enchant Guardrail</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
 * 3. Result Modal (Dice Roll Percentage Popup)
 * -----------------------------------------------------------*/
export function ResultModal({
  isOpen,
  actionResult,
  onClose,
  onProceed,
  onWatchRemoval,
  onWatchCollapse,
  isTimerPaused = false,
}) {
  const [animatingRoll, setAnimatingRoll] = useState(false);
  const [displayedRoll, setDisplayedRoll] = useState(0);

  const rawRoll =
    actionResult?.roll_value ??
    actionResult?.roll ??
    actionResult?.roll_val;

  const rawThreshold =
    actionResult?.roll_threshold ??
    actionResult?.threshold ??
    0.4;

  const hasRoll = rawRoll !== null && rawRoll !== undefined;

  useEffect(() => {
    if (isOpen && hasRoll) {
      setAnimatingRoll(true);
      const targetRoll = Math.round(Number(rawRoll) * 100);
      let step = 0;
      const interval = setInterval(() => {
        setDisplayedRoll(Math.floor(Math.random() * 100));
        step++;
        if (step > 15) {
          clearInterval(interval);
          setDisplayedRoll(targetRoll);
          setAnimatingRoll(false);
        }
      }, 45);
      return () => clearInterval(interval);
    }
  }, [isOpen, hasRoll, rawRoll]);

  if (!isOpen || !actionResult) return null;

  const isAcceptAsIs =
    actionResult.action_type === 'accept_as_is' ||
    actionResult.method === 'accept_as_is' ||
    actionResult.action_type === 'timeout' ||
    hasRoll;
  const isFailure =
    actionResult.outcome === 'failure' || actionResult.outcome === 'timeout_failure';
  const isTimeout =
    actionResult.outcome === 'timeout_success' || actionResult.outcome === 'timeout_failure';
  const isGameOver =
    actionResult.is_game_over ||
    (actionResult.new_health !== undefined && actionResult.new_health <= 0);
  const hasBlocksToRemove = (actionResult.jenga_pulls || 0) > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 dark:bg-black/75 backdrop-blur-sm animate-fadeIn select-none">
      <div className="mc-panel-dark w-full max-w-lg p-5 sm:p-6 shadow-2xl relative bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-2xl max-h-[88vh] overflow-y-auto font-sans">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer p-1 rounded-lg transition-colors z-10"
            title="Close Debrief"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {/* Header Icon & Title */}
        <div className="text-center mb-3">
          <div
            className={`w-11 h-11 mx-auto flex items-center justify-center mb-2 rounded-xl border ${
              isFailure
                ? 'bg-rose-500/15 border-rose-500/40 text-rose-600 dark:text-rose-400'
                : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-400'
            }`}
          >
            {isFailure ? (
              <AlertOctagon className="w-6 h-6 animate-bounce" />
            ) : (
              <CheckCircle2 className="w-6 h-6" />
            )}
          </div>

          <span className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] block mb-0.5 font-bold font-sans">
            {actionResult.action_label || (actionResult.action_type ? actionResult.action_type.replace(/_/g, ' ').toUpperCase() : 'DECISION EVALUATED')}
          </span>
          <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] font-theme-heading tracking-wide">
            {isGameOver
              ? 'Fatal Production Incident!'
              : isFailure
              ? 'Voxel Incident Detected!'
              : isTimeout
              ? 'Timeout Overtime Incurred'
              : 'Stage Cleared Successfully!'}
          </h3>

          {/* Voting Consensus & Tie-Breaker Badges */}
          {actionResult.tie_broken && (
            <div className="mt-2.5 bg-amber-500/15 border border-amber-500/40 p-2.5 text-left flex items-center gap-2 rounded-xl font-sans">
              <span className="text-xl">🎲</span>
              <div>
                <span className="text-[10.5px] font-bold text-amber-800 dark:text-amber-300 uppercase block font-sans">
                  50/50 TOSS TIE-BREAKER
                </span>
                <p className="text-xs text-[var(--text-secondary)] font-medium font-sans">
                  Party split evenly! Random toss selected <strong>{actionResult.action_label || 'Action'}</strong>.
                </p>
              </div>
            </div>
          )}

          {actionResult.winning_votes_count && !actionResult.tie_broken && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-500/35 rounded-full font-mono">
              <span>✓ Democratic Decision ({actionResult.winning_votes_count} of {actionResult.total_votes_cast} votes)</span>
            </div>
          )}
        </div>

        {/* Dice roll percentage graphic */}
        {hasRoll && (
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-3 mb-3 text-center rounded-xl shadow-xs">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[var(--text-secondary)] mb-0.5 font-sans">
              <Dice5 className={`w-3.5 h-3.5 ${animatingRoll ? 'animate-spin' : isFailure ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`} />
              <span className="uppercase tracking-wider font-bold font-sans">
                {animatingRoll
                  ? 'EVALUATING ARCHITECTURAL RISK...'
                  : isFailure
                  ? '🎲 DICE ROLL: DEFECT TRIGGERED'
                  : '🎲 DICE ROLL: CLEAN PASS'}
              </span>
            </div>
            <div
              className={`text-3xl sm:text-4xl font-black font-mono tracking-wider my-1 ${
                isFailure ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-300'
              }`}
            >
              {displayedRoll}%
            </div>
            <p className="text-xs text-[var(--text-muted)] font-medium font-sans">
              Success Threshold: <strong className="text-[var(--text-primary)] font-bold font-mono">{Math.round(Number(rawThreshold) * 100)}%</strong>
              <span className="font-sans ml-1 text-[var(--text-secondary)]">
                (Roll ≤ {Math.round(Number(rawThreshold) * 100)}% to Pass
                {actionResult?.risk_pct !== undefined ? ` • Defect Risk: ${actionResult.risk_pct}%` : ''})
              </span>
            </p>
          </div>
        )}

        {/* Feedback Narrative */}
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-3 mb-3 rounded-xl shadow-xs">
          <p className="text-xs sm:text-[13px] text-[var(--text-primary)] font-medium leading-relaxed font-sans select-text">
            {actionResult.feedback_message || actionResult.feedback || 'Action evaluated and verified against architectural requirements.'}
          </p>
        </div>

        {/* Stats Impact Banner (Clean 2-Column Grid) */}
        <div className="grid grid-cols-2 gap-2.5 mb-3.5 text-center">
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-2.5 rounded-xl shadow-xs">
            <span className="text-[10.5px] font-bold text-[var(--text-muted)] block mb-0.5 uppercase tracking-wider font-sans">Health Impact</span>
            <span
              className={`text-base sm:text-lg font-black font-mono ${
                actionResult.health_delta >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
              }`}
            >
              {actionResult.health_delta >= 0 ? `+${actionResult.health_delta}%` : `${actionResult.health_delta}%`}
            </span>
            <span className="text-[10px] text-[var(--text-secondary)] block mt-0.5 font-medium font-sans">
              Now: <span className="font-mono font-bold">{actionResult.new_health ?? actionResult.health ?? actionResult.health_after ?? 100}%</span>
            </span>
          </div>

          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-2.5 rounded-xl shadow-xs">
            <span className="text-[10.5px] font-bold text-[var(--text-muted)] block mb-0.5 uppercase tracking-wider font-sans">Tower Loss</span>
            <span
              className={`text-base sm:text-lg font-black font-mono ${
                isGameOver || hasBlocksToRemove ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'
              }`}
            >
              {isGameOver
                ? 'Tower Collapsed'
                : hasBlocksToRemove
                ? `-${actionResult.jenga_pulls} Blocks`
                : '0 Blocks Lost'}
            </span>
            <span className="text-[10px] text-[var(--text-secondary)] block mt-0.5 font-medium font-sans">
              {isGameOver ? 'Critical Failure' : hasBlocksToRemove ? 'Mining from tower' : 'Tower Stable'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 font-sans">
          {isGameOver ? (
            <button
              type="button"
              onClick={onWatchCollapse}
              className="w-full py-3 px-4 text-xs sm:text-sm font-bold font-sans bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center gap-2 rounded-xl shadow-lg transition-all cursor-pointer animate-pulse"
            >
              <AlertOctagon className="w-4 h-4 pointer-events-none" />
              <span className="pointer-events-none font-sans font-bold">WATCH TOWER COLLAPSE ➔</span>
            </button>
          ) : hasBlocksToRemove ? (
            <button
              type="button"
              onClick={onWatchRemoval}
              className="w-full py-3 px-4 text-xs sm:text-sm font-bold font-sans bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 rounded-xl shadow-lg transition-all cursor-pointer"
            >
              <Rotate3d className="w-4 h-4 pointer-events-none" />
              <span className="pointer-events-none font-sans font-bold">Watch Block Removal (-{actionResult.jenga_pulls} Blocks)</span>
              <ArrowRight className="w-4 h-4 pointer-events-none" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onProceed}
              disabled={isTimerPaused}
              className={`w-full py-3 px-4 text-xs sm:text-sm font-bold font-sans flex items-center justify-center gap-2 rounded-xl shadow-md transition-all ${
                isTimerPaused
                  ? 'opacity-60 cursor-not-allowed bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-muted)]'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer hover:shadow-lg'
              }`}
            >
              <span className="pointer-events-none font-sans font-bold">
                {isTimerPaused
                  ? '⏸ TIME FROZEN BY GAME MASTER (PAUSED)'
                  : actionResult.is_victory
                  ? 'View Final Audit & Victory'
                  : 'Proceed to Next Stage'}
              </span>
              {!isTimerPaused && <ArrowRight className="w-4 h-4 pointer-events-none" />}
            </button>
          )}

          {hasBlocksToRemove && !isGameOver && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (!isTimerPaused && onProceed) onProceed();
              }}
              disabled={isTimerPaused}
              className={`w-full py-2 px-3 text-xs font-semibold font-sans rounded-xl transition-colors text-center ${
                isTimerPaused
                  ? 'text-[var(--text-muted)] cursor-not-allowed opacity-60'
                  : 'text-amber-800 dark:text-amber-300 hover:underline cursor-pointer'
              }`}
            >
              <span className="pointer-events-none font-sans font-semibold">
                {isTimerPaused ? '⏸ Advancing is frozen by Game Master' : 'Skip Animation & Proceed Directly ➔'}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
 * 4. Confirm Reset Modal (Respawn / Restart World Confirmation)
 * -----------------------------------------------------------*/
export function ConfirmResetModal({
  isOpen,
  onClose,
  onConfirm,
  stageNumber = 1,
  teamName = 'Squad',
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn select-none">
      <div className="mc-panel-dark max-w-md w-full p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl text-center space-y-4 relative text-[var(--text-primary)] font-sans">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer p-1 rounded-lg"
          title="Close (ESC)"
        >
          <X className="w-5 h-5 pointer-events-none" />
        </button>

        <div className="w-12 h-12 bg-amber-500/15 border border-amber-500/35 rounded-xl flex items-center justify-center mx-auto shadow-sm">
          <RotateCcw className="w-6 h-6 text-amber-700 dark:text-amber-400 pointer-events-none" />
        </div>

        <div>
          <h3 className="text-base sm:text-lg font-bold text-amber-800 dark:text-amber-300 font-theme-heading tracking-wide">
            RESTART FROM STAGE 1?
          </h3>
          <p className="text-xs text-[var(--text-secondary)] font-medium mt-1 uppercase font-mono">
            {teamName} • CURRENTLY ON STAGE {stageNumber}
          </p>
        </div>

        <p className="text-xs sm:text-[13px] text-[var(--text-secondary)] font-medium leading-relaxed font-sans">
          Are you sure you want to restart this workshop run? Your squad will return to{' '}
          <strong className="text-[var(--text-primary)]">Stage 1 (100% Stability, 0 Technical Debt)</strong> and all extracted 3D blocks will be restored to the architecture tower.
        </p>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            CANCEL [ESC]
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white cursor-pointer shadow-md flex items-center gap-1.5 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5 pointer-events-none" />
            <span className="pointer-events-none">CONFIRM RESTART</span>
          </button>
        </div>
      </div>
    </div>
  );
}
