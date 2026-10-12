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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn select-none">
      <div className="bg-[#faf7f0] rounded-3xl w-full max-w-xl p-5 sm:p-6 shadow-2xl relative border border-[#ded5c5] text-stone-900 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-stone-400 hover:text-stone-800 transition-colors cursor-pointer p-1 rounded-lg hover:bg-stone-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 rounded-2xl bg-amber-100 border border-amber-300 text-amber-800 shadow-xs">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-stone-900 text-lg tracking-tight font-display">Human-in-the-Loop Prompt</h3>
            <p className="text-xs text-stone-600 font-mono">{stageTitle}</p>
          </div>
        </div>

        <p className="text-xs text-stone-600 mb-4 leading-relaxed font-sans">
          Your team is in the driver's seat. Type clear architectural instructions to guide the AI agent. Mention best practices, security tools, or testing frameworks to protect tower components.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-stone-700 font-semibold mb-2">
              ENTER PROMPT FOR AI AGENT:
            </label>
            <textarea
              rows={4}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="e.g., Do not perform SOQL queries inside for loops! Bulkify by collecting Set<Id> and querying outside into Map<Id, SObject>..."
              className="w-full bg-white border border-[#ded5c5] focus:border-amber-500 rounded-2xl p-3.5 text-sm text-stone-900 placeholder-stone-400 focus:outline-none font-mono resize-none transition-all shadow-inner"
              autoFocus
            />
            <div className="flex justify-between items-center text-[11px] text-stone-500 font-mono mt-1.5">
              <span>{promptText.length} characters</span>
              <span className="text-amber-800 font-semibold">Hint: Specific architectural instructions yield maximum health bonuses</span>
            </div>
          </div>

          {suggestedKeywords.length > 0 && (
            <div>
              <span className="text-[11px] font-mono text-stone-600 block mb-1.5 font-semibold">
                SUGGESTED CONCEPTS (CLICK TO APPEND):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {suggestedKeywords.map((kw, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleAddKeyword(kw)}
                    className="text-[11px] font-mono bg-white hover:bg-amber-50 border border-[#ded5c5] hover:border-amber-400 text-amber-900 px-3 py-1 rounded-lg transition-all cursor-pointer shadow-xs"
                  >
                    +{kw}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#ded5c5]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!promptText.trim()}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:opacity-40 text-white flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-amber-600/20 active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Dispatch Prompt to AI</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
 * 2. Guardrails Picker Modal
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn select-none">
      <div className="bg-[#faf7f0] rounded-3xl w-full max-w-xl p-5 sm:p-6 shadow-2xl relative border border-[#ded5c5] text-stone-900 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-stone-400 hover:text-stone-800 transition-colors cursor-pointer p-1 rounded-lg hover:bg-stone-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-800 shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-stone-900 text-lg tracking-tight font-display">Enforce Structured Guardrail</h3>
            <p className="text-xs text-stone-600 font-mono">Institutional Engineering Policy</p>
          </div>
        </div>

        <p className="text-xs text-stone-600 mb-4 leading-relaxed font-sans">
          Select an architectural standard to impose on the AI agent. Structured guardrails eliminate hallucination risk, prevent component removal, and restore system health.
        </p>

        <div className="space-y-2.5 mb-6">
          {rules.map((rule) => {
            const isSelected = selectedRuleId === rule.id;
            return (
              <div
                key={rule.id}
                onClick={() => setSelectedRuleId(rule.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                  isSelected
                    ? 'bg-emerald-50 border-emerald-400 shadow-md shadow-emerald-500/10'
                    : 'bg-white border-[#ded5c5] hover:border-stone-400'
                }`}
              >
                <div className="pt-0.5">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-600'
                        : 'border-stone-300 bg-transparent'
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xs font-bold text-stone-900 font-display">{rule.title}</h4>
                    <span className="text-[10px] font-mono text-emerald-800 font-semibold px-2 py-0.5 bg-emerald-100/70 rounded-md border border-emerald-200">
                      Standard
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed font-sans">
                    {rule.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#ded5c5]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-600/20 active:scale-95"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Enforce Guardrail</span>
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
  const hasBlocksToRemove = (actionResult.jenga_pulls || 0) > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn select-none">
      <div className="bg-[#faf7f0] rounded-3xl w-full max-w-xl p-5 sm:p-8 shadow-2xl relative border border-[#ded5c5] text-stone-900 max-h-[92vh] overflow-y-auto">
        {/* Ambient background header color */}
        <div
          className={`absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-32 rounded-full blur-3xl opacity-20 pointer-events-none ${
            isFailure ? 'bg-rose-500' : 'bg-emerald-500'
          }`}
        />

        {/* Header Icon & Title */}
        <div className="text-center mb-5">
          <div
            className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-3 shadow-md ${
              isFailure
                ? 'bg-rose-100 border border-rose-300 text-rose-600'
                : 'bg-emerald-100 border border-emerald-300 text-emerald-700'
            }`}
          >
            {isFailure ? (
              <AlertOctagon className="w-8 h-8 animate-bounce" />
            ) : (
              <CheckCircle2 className="w-8 h-8" />
            )}
          </div>

          <span className="text-xs font-mono uppercase tracking-widest text-stone-500 font-bold block mb-1">
            {actionResult.action_label}
          </span>
          <h3 className="text-2xl font-black text-stone-900 tracking-tight font-display">
            {isFailure
              ? 'Architectural Incident Detected!'
              : isTimeout
              ? 'Timeout Overtime Incurred'
              : 'Stage Cleared Successfully!'}
          </h3>

          {/* Voting Consensus & Tie-Breaker Badges */}
          {actionResult.tie_broken && (
            <div className="mt-3 bg-amber-50 border-2 border-amber-400 rounded-2xl p-3 text-left shadow-xs flex items-center gap-2.5">
              <span className="text-xl">🎲</span>
              <div>
                <span className="text-[10px] font-mono font-black text-amber-950 uppercase tracking-wider block">
                  50/50 TOSS TIE-BREAKER RESOLUTION
                </span>
                <p className="text-xs text-amber-900 font-sans leading-tight">
                  Team votes split evenly! Random toss selected <strong>{actionResult.action_label}</strong>.
                </p>
              </div>
            </div>
          )}

          {actionResult.winning_votes_count && !actionResult.tie_broken && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-mono font-bold border border-emerald-300">
              <span>✓ Democratic Decision ({actionResult.winning_votes_count} of {actionResult.total_votes_cast} votes)</span>
            </div>
          )}
        </div>

        {/* Dice roll percentage graphic */}
        {isAcceptAsIs && actionResult.roll_value !== null && (
          <div className="bg-white border border-[#ded5c5] rounded-2xl p-4 mb-5 text-center shadow-inner">
            <div className="flex items-center justify-center gap-2 text-xs font-mono text-stone-600 mb-1">
              <Dice5 className={`w-4 h-4 ${animatingRoll ? 'animate-spin' : 'text-amber-600'}`} />
              <span className="font-semibold">PROBABILITY RISK ROLL</span>
            </div>
            <div className="text-5xl font-black font-mono tracking-widest text-stone-900 my-1 font-display">
              {displayedRoll}%
            </div>
            <p className="text-[11px] text-stone-500 font-mono">
              Threshold Required: <strong className="text-stone-900">{Math.round((actionResult.roll_threshold || 0.4) * 100)}%</strong> (Roll below = Clean Pass)
            </p>
          </div>
        )}

        {/* Feedback Narrative */}
        <div className="bg-[#f5efe3] border border-[#ded5c5] rounded-2xl p-4 mb-5 shadow-xs">
          <p className="text-xs text-stone-800 leading-relaxed font-sans">
            {actionResult.feedback_message}
          </p>
        </div>

        {/* Stats Impact Banner */}
        <div className="grid grid-cols-2 gap-3 mb-6 font-mono">
          <div className="bg-white border border-[#ded5c5] rounded-2xl p-3.5 text-center shadow-xs">
            <span className="text-[11px] text-stone-500 block mb-0.5 uppercase font-semibold">Application Health</span>
            <span
              className={`text-xl font-black ${
                actionResult.health_delta >= 0 ? 'text-emerald-700' : 'text-rose-600'
              }`}
            >
              {actionResult.health_delta >= 0 ? `+${actionResult.health_delta}%` : `${actionResult.health_delta}%`}
            </span>
            <span className="text-[10px] text-stone-500 block">Now: {actionResult.new_health}%</span>
          </div>

          <div className="bg-white border border-[#ded5c5] rounded-2xl p-3.5 text-center shadow-xs">
            <span className="text-[11px] text-stone-500 block mb-0.5 uppercase font-semibold">Tower Destabilization</span>
            <span
              className={`text-xl font-black ${
                hasBlocksToRemove ? 'text-amber-800' : 'text-emerald-700'
              }`}
            >
              {hasBlocksToRemove ? `-${actionResult.jenga_pulls} Blocks` : '0 Blocks Lost'}
            </span>
            <span className="text-[10px] text-stone-500 block">
              {hasBlocksToRemove ? 'Sliding out in 3D' : 'All Components Resilient'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          {hasBlocksToRemove ? (
            <button
              onClick={onWatchRemoval}
              className="w-full py-4 px-6 rounded-2xl font-bold text-sm bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-lg shadow-orange-600/20 active:scale-98 font-display"
            >
              <Rotate3d className="w-4 h-4 animate-spin" style={{ animationDuration: '4s' }} />
              <span>Watch 3D Block Removal from Tower (-{actionResult.jenga_pulls} Blocks)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onProceed}
              className="w-full py-4 px-6 rounded-2xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-600/20 font-display"
            >
              <span>{actionResult.is_victory ? 'View Final Audit & Victory Debrief' : 'Proceed to Next Stage'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {hasBlocksToRemove && (
            <button
              onClick={onProceed}
              className="w-full py-2 px-4 rounded-xl text-xs font-mono text-stone-500 hover:text-stone-900 transition-colors cursor-pointer text-center"
            >
              Skip Animation & Proceed Directly ➔
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
