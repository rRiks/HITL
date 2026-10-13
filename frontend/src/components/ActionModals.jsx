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
  suggestedKeywords = [],
}) {
  const [promptText, setPromptText] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!promptText.trim()) return;
    onSubmitPrompt(promptText.trim());
    setPromptText('');
  };

  const handleAddKeyword = (kw) => {
    setPromptText((prev) => (prev ? `${prev} ${kw}` : kw));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn select-none">
      <div className="mc-panel-dark w-full max-w-xl p-5 sm:p-6 shadow-2xl relative text-white max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#888] hover:text-white cursor-pointer p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-[#1a110a] border-2 border-[#553311] text-[#ffd700] text-xl">
            🪶
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#ffd700] mc-font">BOOK & QUILL: HUMAN GUIDANCE</h3>
            <p className="text-[10px] text-[#aaa] mc-font">{stageTitle}</p>
          </div>
        </div>

        <p className="text-xs text-[#ccc] mb-4 leading-relaxed font-sans">
          Write specific architectural instructions into the Book & Quill to steer the AI golem and protect vulnerable voxel blocks.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[9px] mc-font text-[#ffd700] mb-1.5">
              INSCRIBE PROMPT FOR AI GOLEM:
            </label>
            <textarea
              rows={4}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="e.g., Do not query inside loops! Collect IDs into Set and bulkify with Map..."
              className="w-full bg-[#111] border-2 border-[#555] focus:border-[#ffd700] p-3 text-xs text-white placeholder-[#666] focus:outline-none font-mono resize-none transition-all"
              autoFocus
            />
            <div className="flex justify-between items-center text-[8px] mc-font text-[#888] mt-1">
              <span>{promptText.length} CHARS</span>
              <span className="text-[#ffd700]">Specific instructions maximize health recovery!</span>
            </div>
          </div>

          {suggestedKeywords.length > 0 && (
            <div>
              <span className="text-[8px] mc-font text-[#aaa] block mb-1">
                SUGGESTED RUNES & CONCEPTS:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {suggestedKeywords.map((kw, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleAddKeyword(kw)}
                    className="text-[9px] mc-font bg-[#222] hover:bg-[#333] border border-[#555] text-[#ffd700] px-2 py-1 cursor-pointer"
                  >
                    +{kw}
                  </button>
                ))}
              </div>
            </div>
          )}

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
 * 2. Guardrails Picker Modal (Minecraft Enchantment Table)
 * -----------------------------------------------------------*/
export function GuardrailsModal({
  isOpen,
  onClose,
  rules = [],
  onSubmitRule,
}) {
  const [selectedRuleId, setSelectedRuleId] = useState(rules[0]?.id || '');

  useEffect(() => {
    if (rules.length > 0 && !selectedRuleId) {
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
      <div className="mc-panel-dark w-full max-w-xl p-5 sm:p-6 shadow-2xl relative text-white max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#888] hover:text-white cursor-pointer p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-[#001a00] border-2 border-[#00aa00] text-[#55ff55] text-xl">
            ⚡
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#55ff55] mc-font">ENCHANTMENT CODEX: GUARDRAIL</h3>
            <p className="text-[10px] text-[#aaa] mc-font">Institutional Policy Armor</p>
          </div>
        </div>

        <p className="text-xs text-[#ccc] mb-4 leading-relaxed font-sans">
          Select an architectural standard to enchant the codebase. Strict guardrails eliminate risks and shield voxel blocks from tumbling.
        </p>

        <div className="space-y-2 mb-5">
          {rules.map((rule) => {
            const isSelected = selectedRuleId === rule.id;
            return (
              <div
                key={rule.id}
                onClick={() => setSelectedRuleId(rule.id)}
                className={`p-3 border-2 transition-all cursor-pointer flex items-start gap-3 ${
                  isSelected
                    ? 'bg-[#002b00] border-[#55ff55] shadow-md'
                    : 'bg-[#1e1e1e] border-[#444] hover:border-[#666]'
                }`}
              >
                <div className="pt-0.5">
                  <div
                    className={`w-3.5 h-3.5 border flex items-center justify-center ${
                      isSelected
                        ? 'border-[#55ff55] bg-[#55ff55]'
                        : 'border-[#555] bg-transparent'
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 bg-black" />}
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <h4 className="text-xs font-bold text-white mc-font">{rule.title}</h4>
                    <span className="text-[8px] mc-font text-[#55ff55] bg-[#002200] px-1.5 py-0.5 border border-[#00aa00]">
                      RULE
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
  onProceed,
  onWatchRemoval,
  onWatchCollapse,
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
      <div className="mc-panel-dark w-full max-w-xl p-5 sm:p-7 shadow-2xl relative text-white max-h-[92vh] overflow-y-auto">
        {/* Header Icon & Title */}
        <div className="text-center mb-4">
          <div
            className={`w-12 h-12 mx-auto flex items-center justify-center mb-2.5 border-2 ${
              isFailure
                ? 'bg-[#3a0000] border-[#ff3333] text-[#ff5555]'
                : 'bg-[#002b00] border-[#55ff55] text-[#55ff55]'
            }`}
          >
            {isFailure ? (
              <AlertOctagon className="w-7 h-7 animate-bounce" />
            ) : (
              <CheckCircle2 className="w-7 h-7" />
            )}
          </div>

          <span className="text-[9px] mc-font uppercase tracking-widest text-[#aaa] block mb-1">
            {actionResult.action_label}
          </span>
          <h3 className="text-base sm:text-lg font-bold text-white mc-font tracking-wide">
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
            <div className="mt-2.5 bg-[#251505] border-2 border-[#ffaa00] p-2.5 text-left flex items-center gap-2">
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
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#1a331a] text-[#55ff55] text-[9px] mc-font border border-[#2d5a2d]">
              <span>✓ Democratic Decision ({actionResult.winning_votes_count} of {actionResult.total_votes_cast} votes)</span>
            </div>
          )}
        </div>

        {/* Dice roll percentage graphic */}
        {isAcceptAsIs && actionResult.roll_value !== null && (
          <div className="bg-[#111] border-2 border-[#444] p-3 mb-4 text-center">
            <div className="flex items-center justify-center gap-1.5 text-[9px] mc-font text-[#aaa] mb-1">
              <Dice5 className={`w-3.5 h-3.5 ${animatingRoll ? 'animate-spin' : 'text-[#ffd700]'}`} />
              <span>RISK PROBABILITY ROLL</span>
            </div>
            <div className="text-3xl sm:text-4xl font-bold mc-font tracking-widest text-[#ffd700] my-1">
              {displayedRoll}%
            </div>
            <p className="text-[9px] text-[#888] mc-font">
              Threshold: <strong className="text-white">{Math.round((actionResult.roll_threshold || 0.4) * 100)}%</strong> (Roll below = Clean Pass)
            </p>
          </div>
        )}

        {/* Feedback Narrative */}
        <div className="bg-[#181818] border-2 border-[#333] p-3 mb-4">
          <p className="text-xs text-[#ddd] leading-relaxed font-sans">
            {actionResult.feedback_message}
          </p>
        </div>

        {/* Stats Impact Banner */}
        <div className="grid grid-cols-2 gap-2.5 mb-5 mc-font text-center">
          <div className="bg-[#151515] border border-[#444] p-3">
            <span className="text-[8px] text-[#aaa] block mb-0.5 uppercase">Health Impact</span>
            <span
              className={`text-base sm:text-lg font-bold ${
                actionResult.health_delta >= 0 ? 'text-[#55ff55]' : 'text-[#ff5555]'
              }`}
            >
              {actionResult.health_delta >= 0 ? `+${actionResult.health_delta}%` : `${actionResult.health_delta}%`}
            </span>
            <span className="text-[8px] text-[#777] block mt-0.5">Now: {actionResult.new_health}%</span>
          </div>

          <div className="bg-[#151515] border border-[#444] p-3">
            <span className="text-[8px] text-[#aaa] block mb-0.5 uppercase">Tower Loss</span>
            <span
              className={`text-base sm:text-lg font-bold ${
                isGameOver || hasBlocksToRemove ? 'text-[#ff5555]' : 'text-[#55ff55]'
              }`}
            >
              {isGameOver
                ? 'Tower Collapsed'
                : hasBlocksToRemove
                ? `-${actionResult.jenga_pulls} Blocks`
                : '0 Blocks Lost'}
            </span>
            <span className="text-[8px] text-[#777] block mt-0.5">
              {isGameOver ? 'Critical Failure' : hasBlocksToRemove ? 'Mining from tower' : 'Tower Stable'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          {isGameOver ? (
            <button
              type="button"
              onClick={onWatchCollapse}
              className="mc-btn mc-btn-red w-full py-3.5 px-4 text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer mc-font shadow-2xl animate-pulse"
            >
              <AlertOctagon className="w-4 h-4 text-white pointer-events-none" />
              <span className="pointer-events-none">SEE STATUS: WATCH TOWER COLLAPSE ➔</span>
            </button>
          ) : hasBlocksToRemove ? (
            <button
              type="button"
              onClick={onWatchRemoval}
              className="mc-btn mc-btn-green w-full py-3 px-4 text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer mc-font shadow-lg active:scale-[0.98] transition-transform"
            >
              <Rotate3d className="w-4 h-4 pointer-events-none" />
              <span className="pointer-events-none">Watch Block Removal (-{actionResult.jenga_pulls} Blocks)</span>
              <ArrowRight className="w-4 h-4 pointer-events-none" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onProceed}
              className="mc-btn mc-btn-green w-full py-3 px-4 text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer mc-font shadow-lg active:scale-[0.98] transition-transform"
            >
              <span className="pointer-events-none">{actionResult.is_victory ? 'View Final Audit & Victory' : 'Proceed to Next Stage'}</span>
              <ArrowRight className="w-4 h-4 pointer-events-none" />
            </button>
          )}

          {hasBlocksToRemove && !isGameOver && (
            <button
              type="button"
              onClick={onProceed}
              className="w-full py-1.5 text-[8px] mc-font text-[#888] hover:text-white transition-colors cursor-pointer text-center"
            >
              <span className="pointer-events-none">Skip Animation & Proceed Directly ➔</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
