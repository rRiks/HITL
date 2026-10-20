import React from 'react';
import { Wrench, AlertTriangle, Clock, X, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function ManualOverrideModal({
  isOpen,
  onClose,
  onConfirm,
  tokensRemaining = 2,
  isCrunchTime = false,
}) {
  if (!isOpen) return null;

  const hasTokens = tokensRemaining > 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 select-none animate-fadeIn">
      <div className="w-full max-w-lg p-5 sm:p-6 shadow-2xl relative bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-2xl max-h-[88vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer p-1 rounded-lg transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[var(--border-subtle)]">
          <div className="p-2.5 bg-emerald-500/15 border border-emerald-500/35 text-emerald-800 dark:text-emerald-400 rounded-xl flex items-center justify-center shrink-0">
            <Wrench className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] font-theme-heading">
              AUTHORIZE MANUAL OVERRIDE
            </h3>
            <span className="text-xs text-[var(--text-secondary)] font-medium">
              Senior Engineer Craftsmanship (Bypasses AI)
            </span>
          </div>
        </div>

        {/* Narrative / Costs */}
        <div className="space-y-3 text-xs sm:text-[13px] leading-relaxed font-sans text-[var(--text-secondary)] font-medium">
          <p>
            Your team rejects the active AI candidate proposal. A senior engineer will hand-craft and harden the production Salesforce implementation from scratch.
          </p>

          <div className="grid grid-cols-2 gap-2 text-center pt-1 font-mono">
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-2.5 rounded-xl shadow-xs">
              <div className="flex items-center justify-center gap-1 text-[10px] text-rose-600 dark:text-rose-400 mb-0.5 font-bold uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5" />
                <span>VELOCITY BURN</span>
              </div>
              <span className="text-base sm:text-lg font-bold text-rose-600 dark:text-rose-400 block font-mono">-3m 30s</span>
              <span className="text-[10px] text-[var(--text-muted)] font-sans">Deducted from Sprint Clock</span>
            </div>

            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-2.5 rounded-xl shadow-xs">
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 block mb-0.5 uppercase tracking-wider font-mono">
                TOKEN BUDGET
              </span>
              <span className="text-base sm:text-lg font-bold text-[var(--text-primary)] block font-mono">
                {tokensRemaining}/2 Remaining
              </span>
              <span className="text-[10px] text-[var(--text-muted)] font-sans">Costs 1 Token</span>
            </div>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl text-emerald-900 dark:text-emerald-300 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-800 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>GUARANTEED CODE HARDENING</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] font-sans">
              Restores +15% Health, triggers 0 block extractions, and repairs 1 point of Technical Debt.
            </p>
          </div>

          {!hasTokens && (
            <div className="bg-rose-500/15 border border-rose-500/40 p-3 rounded-xl flex items-center gap-2.5 text-xs text-rose-700 dark:text-rose-300 font-bold">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>NO SENIOR DEV TOKENS LEFT (Limit: 2 per sprint). Please select another action.</span>
            </div>
          )}

          {isCrunchTime && hasTokens && (
            <div className="bg-amber-500/15 border border-amber-500/40 p-3 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2 font-medium">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>CRUNCH TIME WARNING: Under 5 minutes left! 15% fatigue risk factor applies.</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-4 mt-2 border-t border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!hasTokens}
            onClick={onConfirm}
            className={`px-5 py-2.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md ${
              hasTokens
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer hover:shadow-lg'
                : 'bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-muted)] cursor-not-allowed opacity-60'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>{hasTokens ? 'Authorize Senior Dev (-3:30)' : 'No Tokens Remaining (0/2)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
