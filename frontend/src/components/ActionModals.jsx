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
 * 1. Custom Prompt Modal
 * -----------------------------------------------------------*/
/* -------------------------------------------------------------
 * 1. Custom Prompt Modal (Minecraft Book & Quill)
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn select-none">
      <div className="mc-panel-dark w-full max-w-lg p-4 sm:p-5 shadow-2xl relative text-white max-h-[88vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#888] hover:text-white cursor-pointer p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-3">
          <div
            className="p-2 bg-[#1a110a] border-2 border-[#553311] text-[#ffd700] text-xl mc-inner-box"
            style={{ borderRadius: 'var(--theme-radius-slot, 0px)' }}
          >
            🪶
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#ffd700] mc-font">BOOK & QUILL: HUMAN GUIDANCE</h3>
            <p className="text-[10px] text-[#aaa] mc-font">{stageTitle}</p>
          </div>
        </div>

        <p className="text-xs text-[#ccc] mb-4 leading-relaxed font-sans">
          Inspect the code diff carefully. Inscribe specific architectural instructions into the Book & Quill to steer the AI agent (e.g. methods, collection patterns, locking mechanisms, or transaction boundaries). Vague prompts will result in AI hallucinations and tech debt!
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[9px] mc-font text-[#ffd700] mb-1.5">
              INSCRIBE ARCHITECTURAL GUIDANCE:
            </label>
            <textarea
              rows={4}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="e.g., Do not query inside loops. Extract parent IDs into a Set, run a bulkified SOQL query outside iteration, and map in-memory..."
              className="w-full bg-[#111] border-2 border-[#555] focus:border-[#ffd700] p-3 text-xs text-white placeholder-[#666] focus:outline-none font-mono resize-none transition-all mc-inner-box"
              style={{ borderRadius: 'var(--theme-radius-slot, 0px)' }}
              autoFocus
            />
            <div className="flex justify-between items-center text-[8px] mc-font text-[#888] mt-1">
              <span>{promptText.length} CHARS</span>
              <span className="text-[#ffd700]">Valid architectural concepts grant +8% Health!</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#333]">
            <button
              type="button"
              onClick={onClose}
              className="mc-btn px-3 py-1.5 text-[9px] mc-font text-[#aaa] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!promptText.trim()}
              className="mc-btn mc-btn-green px-4 py-1.5 text-[9px] mc-font text-white flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn select-none">
      <div className="mc-panel-dark w-full max-w-lg p-4 sm:p-5 shadow-2xl relative text-white max-h-[88vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#888] hover:text-white cursor-pointer p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-3">
          <div
            className="p-2 bg-[#1a110a] border-2 border-[#ffaa00] text-[#ffd700] text-xl mc-inner-box"
            style={{ borderRadius: 'var(--theme-radius-slot, 0px)' }}
          >
            🤖
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#ffd700] mc-font">AI PROPOSED FIXES: 3 OPTIONS</h3>
            <p className="text-[10px] text-[#aaa] mc-font">Review Proposed Code Solutions</p>
          </div>
        </div>

        <p className="text-xs text-[#ccc] mb-4 leading-relaxed font-sans">
          The AI coding agent generated 3 separate technical fixes. One is an optimal architectural solution (+8% Health, 0 pulls), another is a quick patch with trade-offs (+4% Health, 1 pull), and one is a flawed anti-pattern (-10% Health, 2 pulls, +1 Debt). Inspect their descriptions and select wisely!
        </p>

        <div className="space-y-2.5 mb-5">
          {rules.map((rule, idx) => {
            const isSelected = selectedRuleId === rule.id;
            return (
              <div
                key={rule.id || idx}
                onClick={() => setSelectedRuleId(rule.id)}
                className={`p-3 border-2 transition-all cursor-pointer flex items-start gap-3 mc-inner-box ${
                  isSelected
                    ? 'bg-[#2b2210] border-[#ffd700] shadow-md'
                    : 'bg-[#1a1a1a] border-[#444] hover:border-[#666]'
                }`}
                style={{ borderRadius: 'var(--theme-radius-slot, 0px)' }}
              >
                <div className="pt-0.5">
                  <div
                    className={`w-3.5 h-3.5 border flex items-center justify-center ${
                      isSelected
                        ? 'border-[#ffd700] bg-[#ffd700]'
                        : 'border-[#555] bg-transparent'
                    }`}
                    style={{ borderRadius: 'calc(var(--theme-radius-slot, 0px) * 0.35)' }}
                  >
                    {isSelected && (
                      <div
                        className="w-1.5 h-1.5 bg-black"
                        style={{ borderRadius: 'calc(var(--theme-radius-slot, 0px) * 0.2)' }}
                      />
                    )}
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1 gap-2">
                    <h4 className="text-xs font-bold text-white mc-font">{rule.title}</h4>
                    <span
                      className="text-[8px] mc-font text-[#ffd700] bg-[#221808] px-1.5 py-0.5 border border-[#885500] shrink-0 mc-badge-pill"
                      style={{ borderRadius: 'var(--theme-radius-badge, 0px)' }}
                    >
                      OPTION {idx + 1}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#bbb] leading-relaxed font-sans">
                    {rule.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#333]">
          <button
            type="button"
            onClick={onClose}
            className="mc-btn px-3 py-1.5 text-[9px] mc-font text-[#aaa] cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="mc-btn mc-btn-green px-4 py-1.5 text-[9px] mc-font text-white flex items-center gap-1.5 cursor-pointer"
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

  useEffect(() => {
    if (isOpen && actionResult?.roll_value !== null && actionResult?.roll_value !== undefined) {
      setAnimatingRoll(true);
      const targetRoll = Math.round(actionResult.roll_value * 100);
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
  }, [isOpen, actionResult]);

  if (!isOpen || !actionResult) return null;

  const isAcceptAsIs = actionResult.action_type === 'accept_as_is';
  const isFailure =
    actionResult.outcome === 'failure' || actionResult.outcome === 'timeout_failure';
  const isTimeout =
    actionResult.outcome === 'timeout_success' || actionResult.outcome === 'timeout_failure';
  const isGameOver =
    actionResult.is_game_over ||
    (actionResult.new_health !== undefined && actionResult.new_health <= 0);
  const hasBlocksToRemove = (actionResult.jenga_pulls || 0) > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn select-none">
      <div className="mc-panel-dark w-full max-w-lg p-4 sm:p-5 shadow-2xl relative text-white max-h-[88vh] overflow-y-auto">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 text-[#888] hover:text-white cursor-pointer p-1 transition-colors z-10"
            title="Close Debrief"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {/* Header Icon & Title */}
        <div className="text-center mb-3">
          <div
            className={`result-modal-badge w-10 h-10 mx-auto flex items-center justify-center mb-1.5 border-2 ${
              isFailure
                ? 'bg-[#3a0000] border-[#ff3333] text-[#ff5555]'
                : 'bg-[#002b00] border-[#55ff55] text-[#55ff55]'
            }`}
            style={{ borderRadius: 'var(--theme-radius-badge, 0px)' }}
          >
            {isFailure ? (
              <AlertOctagon className="w-5 h-5 animate-bounce" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
          </div>

          <span className="text-[8.5px] mc-font uppercase tracking-widest text-[#aaa] block mb-0.5">
            {actionResult.action_label}
          </span>
          <h3 className="text-sm sm:text-base font-bold text-white mc-font tracking-wide">
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
            <div
              className="mt-2.5 bg-[#251505] border-2 border-[#ffaa00] p-2.5 text-left flex items-center gap-2 mc-inner-box"
              style={{ borderRadius: 'var(--theme-radius-slot, 0px)' }}
            >
              <span className="text-xl">🎲</span>
              <div>
                <span className="text-[8px] mc-font text-[#ffd700] uppercase block">
                  50/50 TOSS TIE-BREAKER
                </span>
                <p className="text-[10px] text-[#ffddaa] mc-font">
                  Party split evenly! Random toss selected <strong>{actionResult.action_label}</strong>.
                </p>
              </div>
            </div>
          )}

          {actionResult.winning_votes_count && !actionResult.tie_broken && (
            <div
              className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#1a331a] text-[#55ff55] text-[9px] mc-font border border-[#2d5a2d] mc-badge-pill"
              style={{ borderRadius: 'var(--theme-radius-badge, 0px)' }}
            >
              <span>✓ Democratic Decision ({actionResult.winning_votes_count} of {actionResult.total_votes_cast} votes)</span>
            </div>
          )}
        </div>

        {/* Dice roll percentage graphic */}
        {isAcceptAsIs && actionResult.roll_value !== null && (
          <div
            className="result-modal-roll-box bg-[#111] border-2 border-[#444] p-2 sm:p-2.5 mb-2.5 text-center mc-inner-box"
            style={{ borderRadius: 'var(--theme-radius-slot, 0px)' }}
          >
            <div className="flex items-center justify-center gap-1 text-[8.5px] mc-font text-[#aaa] mb-0.5">
              <Dice5 className={`w-3 h-3 ${animatingRoll ? 'animate-spin' : 'text-[#ffd700]'}`} />
              <span>RISK PROBABILITY ROLL</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold mc-font tracking-widest text-[#ffd700] my-0.5">
              {displayedRoll}%
            </div>
            <p className="text-[8.5px] text-[#888] mc-font">
              Threshold: <strong className="text-white">{Math.round((actionResult.roll_threshold || 0.4) * 100)}%</strong> (Roll below = Clean Pass)
            </p>
          </div>
        )}

        {/* Feedback Narrative */}
        <div
          className="result-modal-feedback-box bg-[#181818] border-2 border-[#333] p-2.5 mb-2.5 mc-inner-box"
          style={{ borderRadius: 'var(--theme-radius-slot, 0px)' }}
        >
          <p className="text-[11.5px] text-[#ddd] leading-normal font-sans">
            {actionResult.feedback_message}
          </p>
        </div>

        {/* Stats Impact Banner (Clean 2-Column Grid) */}
        <div className="grid grid-cols-2 gap-2 mb-3 mc-font text-center">
          <div
            className="result-modal-stat-box bg-[#151515] border border-[#444] p-2 mc-inner-box"
            style={{ borderRadius: 'var(--theme-radius-slot, 0px)' }}
          >
            <span className="text-[7.5px] text-[#aaa] block mb-0.5 uppercase">Health Impact</span>
            <span
              className={`text-sm sm:text-base font-bold ${
                actionResult.health_delta >= 0 ? 'text-[#55ff55]' : 'text-[#ff5555]'
              }`}
            >
              {actionResult.health_delta >= 0 ? `+${actionResult.health_delta}%` : `${actionResult.health_delta}%`}
            </span>
            <span className="text-[7.5px] text-[#777] block mt-0.5">Now: {actionResult.new_health}%</span>
          </div>

          <div
            className="result-modal-stat-box bg-[#151515] border border-[#444] p-2 mc-inner-box"
            style={{ borderRadius: 'var(--theme-radius-slot, 0px)' }}
          >
            <span className="text-[7.5px] text-[#aaa] block mb-0.5 uppercase">Tower Loss</span>
            <span
              className={`text-sm sm:text-base font-bold ${
                isGameOver || hasBlocksToRemove ? 'text-[#ff5555]' : 'text-[#55ff55]'
              }`}
            >
              {isGameOver
                ? 'Tower Collapsed'
                : hasBlocksToRemove
                ? `-${actionResult.jenga_pulls} Blocks`
                : '0 Blocks Lost'}
            </span>
            <span className="text-[7.5px] text-[#777] block mt-0.5">
              {isGameOver ? 'Critical Failure' : hasBlocksToRemove ? 'Mining from tower' : 'Tower Stable'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-1.5">
          {isGameOver ? (
            <button
              type="button"
              onClick={onWatchCollapse}
              className="mc-btn mc-btn-red w-full py-2.5 px-3 text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer mc-font shadow-2xl animate-pulse"
            >
              <AlertOctagon className="w-4 h-4 text-white pointer-events-none" />
              <span className="pointer-events-none">SEE STATUS: WATCH TOWER COLLAPSE ➔</span>
            </button>
          ) : hasBlocksToRemove ? (
            <button
              type="button"
              onClick={onWatchRemoval}
              className="mc-btn mc-btn-green w-full py-2.5 px-3 text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer mc-font shadow-lg"
            >
              <Rotate3d className="w-4 h-4 pointer-events-none" />
              <span className="pointer-events-none">Watch Block Removal (-{actionResult.jenga_pulls} Blocks)</span>
              <ArrowRight className="w-4 h-4 pointer-events-none" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onProceed}
              disabled={isTimerPaused}
              className={`mc-btn ${
                isTimerPaused
                  ? 'opacity-60 cursor-not-allowed bg-[#444] border-[#666] text-[#aaa]'
                  : 'mc-btn-green cursor-pointer text-white'
              } w-full py-2.5 px-3 text-xs font-bold flex items-center justify-center gap-2 mc-font shadow-lg transition-all`}
            >
              <span className="pointer-events-none">
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
              className={`w-full py-2.5 px-3 mc-btn text-[9px] mc-font ${
                isTimerPaused ? 'text-[#555] cursor-not-allowed opacity-60' : 'text-[#ffd700] hover:text-white cursor-pointer'
              } transition-colors text-center shadow-md`}
            >
              <span className="pointer-events-none">
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn select-none">
      <div className="mc-panel-dark max-w-md w-full p-6 border-4 border-[#ffaa00] shadow-2xl text-center space-y-4 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 text-[#888] hover:text-white cursor-pointer p-1"
          title="Close (ESC)"
        >
          <X className="w-5 h-5 pointer-events-none" />
        </button>

        <div className="w-12 h-12 bg-[#2d1c08] border-2 border-[#ffaa00] flex items-center justify-center mx-auto shadow-md">
          <RotateCcw className="w-6 h-6 text-[#ffaa00] pointer-events-none" />
        </div>

        <div>
          <h3 className="text-base font-bold text-[#ffd700] mc-font tracking-wide">
            RESTART FROM STAGE 1?
          </h3>
          <p className="text-[10px] text-[#ffaa00] mc-font mt-1 uppercase">
            {teamName} • CURRENTLY ON STAGE {stageNumber}
          </p>
        </div>

        <p className="text-xs text-[#ccc] leading-relaxed font-sans">
          Are you sure you want to restart this workshop run? Your squad will return to{' '}
          <strong className="text-white">Stage 1 (100% Stability, 0 Technical Debt)</strong> and all extracted 3D blocks will be restored to the architecture tower.
        </p>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="mc-btn px-4 py-2 text-xs mc-font text-[#aaa] hover:text-white border-[#555] cursor-pointer"
          >
            CANCEL [ESC]
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="mc-btn mc-btn-red px-4 py-2 text-xs mc-font font-bold text-white cursor-pointer shadow-lg flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 pointer-events-none" />
            <span className="pointer-events-none">CONFIRM RESTART</span>
          </button>
        </div>
      </div>
    </div>
  );
}
