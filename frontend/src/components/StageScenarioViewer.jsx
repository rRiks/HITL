import React, { useState, useEffect } from 'react';
import {
  GitPullRequest,
  FileCode,
  AlertTriangle,
  Sparkles,
  Maximize2,
  X,
  Lightbulb,
  Lock,
  Unlock,
} from 'lucide-react';

function StageScenarioViewer({
  stage,
  hintsRemaining = 6,
  maxHints = 6,
  revealedHints = [],
  onRevealHint,
}) {
  const [isExpandedModalOpen, setIsExpandedModalOpen] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);

  // Close expanded modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isExpandedModalOpen) {
        setIsExpandedModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExpandedModalOpen]);

  if (!stage) return null;

  const diffLines = stage.code_diff ? stage.code_diff.split('\n') : [];
  const isHintRevealed = Array.isArray(revealedHints) && revealedHints.includes(stage.id);

  const handleRevealClick = async () => {
    if (isHintRevealed || hintsRemaining <= 0 || !onRevealHint || isRevealing) return;
    setIsRevealing(true);
    try {
      await onRevealHint(stage.id);
    } finally {
      setIsRevealing(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 gap-2 [@media(min-height:860px)]:gap-2.5 select-none overflow-hidden">
      {/* 1. Context & User Story Card */}
      <div className="shrink-0 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-3 [@media(min-height:860px)]:p-3.5 shadow-sm">
        {/* Top meta strip */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[11px] xl:text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 shrink-0 font-theme-badge">
              <GitPullRequest className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
              <span>PR #{stage.id}</span>
            </span>
            <span className="text-xs xl:text-sm font-semibold text-[var(--text-secondary)] truncate">
              PHASE: <strong className="text-[var(--text-primary)] font-bold">{stage.phase_name}</strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsExpandedModalOpen(true)}
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] px-2.5 py-1 rounded-md text-xs xl:text-sm font-semibold flex items-center gap-1.5 transition-colors border border-[var(--border-subtle)] cursor-pointer"
              title="Pop out Full PR Inspection View"
            >
              <Maximize2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>ENLARGE</span>
            </button>
          </div>
        </div>

        {/* User Story Title & Summary */}
        <h2 className="font-theme-heading text-[clamp(0.95rem,1.6vh,1.25rem)] font-bold tracking-tight text-[var(--text-primary)] mb-1 leading-tight">
          {stage.ticket_title || stage.title}
        </h2>
        <p className="text-xs [@media(min-height:860px)]:text-[13.5px] leading-relaxed text-[var(--text-secondary)] font-sans select-text line-clamp-2 font-medium">
          {stage.story}
        </p>
      </div>

      {/* 2. AI Golem Proposal Card */}
      <div className="shrink-0 bg-amber-500/10 border border-[var(--border-subtle)] border-l-4 border-l-amber-500 rounded-xl px-3.5 py-2 [@media(min-height:860px)]:py-2.5 shadow-sm">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
              AI Golem Proposal
            </span>
          </div>
          <code className="text-emerald-800 dark:text-emerald-300 font-mono text-xs bg-[var(--bg-elevated)] px-2 py-0.5 rounded border border-[var(--border-subtle)] select-all truncate max-w-[320px] font-bold">
            {stage.file_name}
          </code>
        </div>
        <p className="text-xs [@media(min-height:860px)]:text-[13.5px] text-[var(--text-primary)] italic font-sans select-text leading-relaxed font-medium">
          "{stage.ai_proposal_summary}"
        </p>
      </div>

      {/* 3. Dominant Code Diff Viewer Card */}
      <div className="flex-1 min-h-[160px] flex flex-col bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl overflow-hidden shadow-sm">
        {/* Diff Toolbar */}
        <div className="px-3.5 py-2 border-b border-[var(--border-subtle)] bg-[var(--bg-panel)] flex items-center justify-between text-xs xl:text-sm text-[var(--text-secondary)] shrink-0">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-[var(--text-muted)]" />
            <span className="font-mono text-xs xl:text-sm text-[var(--text-primary)] font-bold">{stage.file_name}</span>
            <span className="text-[11px] xl:text-xs text-[var(--text-muted)] font-sans font-medium">(git diff)</span>
          </div>
          <button
            type="button"
            onClick={() => setIsExpandedModalOpen(true)}
            className="text-xs xl:text-sm text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Inspect side-by-side full code diff"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>FULL DIFF ➔</span>
          </button>
        </div>

        {/* Diff Workspace with Softly-Clipped Ghost Filler */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-[var(--bg-code)]">
          {/* Actual Diff Lines: Only scrolls if actual diff code + end footer exceeds viewport height */}
          <div className="p-2 font-mono text-[12.5px] [@media(min-height:860px)]:text-[14px] overflow-y-auto overflow-x-auto max-h-full leading-6 [@media(min-height:860px)]:leading-7 select-text">
            {diffLines.map((line, idx) => {
              const isAdd = line.startsWith('+') && !line.startsWith('+++');
              const isRemove = line.startsWith('-') && !line.startsWith('---');
              const isHeader = line.startsWith('@@');
              const isFileMeta = line.startsWith('---') || line.startsWith('+++');

              let lineTextColor = 'text-[var(--text-primary)]';
              let lineBgColor = '';

              if (isAdd) {
                lineTextColor = 'text-emerald-800 dark:text-emerald-300 font-semibold';
                lineBgColor = 'bg-emerald-500/10 dark:bg-emerald-500/15';
              } else if (isRemove) {
                lineTextColor = 'text-rose-800 dark:text-rose-300 font-semibold';
                lineBgColor = 'bg-rose-500/10 dark:bg-rose-500/15';
              } else if (isHeader) {
                lineTextColor = 'text-sky-700 dark:text-sky-300 font-bold';
              } else if (isFileMeta) {
                lineTextColor = 'text-[var(--text-muted)] font-mono font-medium';
              }

              return (
                <div
                  key={idx}
                  className={`flex items-start py-0.5 px-2 hover:bg-black/5 dark:hover:bg-white/[0.03] transition-colors rounded-sm ${lineBgColor}`}
                >
                  {/* Line number gutter */}
                  <span className="w-9 xl:w-11 shrink-0 text-right pr-3.5 text-[var(--text-muted)] select-none font-mono text-xs xl:text-sm leading-6 [@media(min-height:860px)]:leading-7 font-medium">
                    {idx + 1}
                  </span>
                  {/* Diff line code content */}
                  <span className={`flex-1 font-mono leading-6 [@media(min-height:860px)]:leading-7 whitespace-pre ${lineTextColor}`}>
                    {line}
                  </span>
                </div>
              );
            })}

            {/* Eliminate Dead Space: Subtle Muted Footer Line After Code */}
            <div className="flex items-center gap-2 pt-2.5 pb-2 px-3 text-[var(--text-muted)] font-mono text-xs xl:text-sm select-none border-t border-[var(--border-subtle)] mt-2 font-medium">
              <span className="text-[var(--text-muted)] font-bold">───</span>
              <span>// End of diff ({diffLines.length} lines)</span>
            </div>
          </div>

          {/* IDE Gutter Filler Continuation for Large 27"-32" Monitors: Softly clips at bottom, zero scrollbar */}
          <div className="flex-1 min-h-0 overflow-hidden pointer-events-none select-none px-2 hidden xl:flex flex-col opacity-20">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="flex items-center py-0.5 px-2">
                <span className="w-9 xl:w-11 shrink-0 text-right pr-3.5 text-[var(--text-muted)] font-mono text-xs xl:text-sm leading-6 [@media(min-height:860px)]:leading-7">
                  {diffLines.length + i + 1}
                </span>
                <span className="w-8 h-0.5 bg-[var(--text-muted)] opacity-30 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Docked Architectural Telemetry Hint Card */}
      <div className="shrink-0 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl px-3.5 py-2.5 [@media(min-height:860px)]:px-4 [@media(min-height:860px)]:py-3 shadow-sm transition-all duration-200">
        {!isHintRevealed ? (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4 text-[var(--text-muted)]" />
              </div>
              <div className="truncate">
                <span className="text-xs xl:text-sm font-bold uppercase tracking-wider text-[var(--text-primary)] block">
                  Architectural Telemetry Hint
                </span>
                <span className="text-[11px] xl:text-xs text-[var(--text-muted)] font-sans block mt-0.5 font-medium">
                  Budget: {hintsRemaining}/{maxHints} Hints Remaining
                </span>
              </div>
            </div>

            <button
              type="button"
              disabled={hintsRemaining <= 0 || isRevealing}
              onClick={handleRevealClick}
              className={`px-4 py-2 rounded-lg text-xs xl:text-sm font-bold border transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                hintsRemaining > 0
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-800 dark:text-amber-300 hover:bg-amber-500/25 shadow-sm'
                  : 'bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--text-muted)] cursor-not-allowed opacity-60'
              }`}
            >
              <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>
                {hintsRemaining > 0
                  ? (isRevealing ? 'Unlocking...' : `Reveal Hint (${hintsRemaining} left)`)
                  : 'No hints left'}
              </span>
            </button>
          </div>
        ) : (
          <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 border-l-4 border-l-rose-500 p-3 xl:p-4 transition-all duration-200 shadow-md">
            <div className="flex items-center justify-between gap-2 mb-2 border-b border-rose-500/20 pb-1.5">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                <Unlock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs xl:text-sm font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                  Architectural Advisory Unlocked
                </span>
              </div>
              <span className="text-xs xl:text-sm font-bold text-amber-800 dark:text-amber-300 bg-amber-500/15 px-2.5 py-0.5 rounded border border-amber-500/30 font-mono">
                {hintsRemaining}/{maxHints} REMAINING
              </span>
            </div>

            <div className="mb-2 bg-rose-500/15 border border-rose-500/30 px-3 py-1.5 rounded-lg flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span className="text-xs xl:text-sm text-rose-900 dark:text-rose-200 font-bold">
                SUSPECTED THREAT: <strong className="text-rose-950 dark:text-amber-200 underline decoration-rose-500 decoration-2 font-black">{stage.title}</strong>
              </span>
            </div>

            <p className="font-sans text-sm xl:text-[15px] text-[var(--text-primary)] leading-relaxed select-text mt-1 font-medium">
              {stage.hidden_risks}
            </p>
          </div>
        )}
      </div>

      {/* 4. Expanded Single-Screen Inspection Modal */}
      {isExpandedModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 dark:bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-2xl max-w-6xl w-full h-[90vh] max-h-[92vh] flex flex-col p-4 sm:p-6 shadow-2xl overflow-hidden text-[var(--text-primary)]">
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--border-subtle)] shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                  QUEST WAVE {stage.id}: {stage.phase_name}
                </span>
                <span className="text-sm font-bold text-[var(--text-primary)] hidden sm:inline">
                  Architectural PR Inspection Console
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsExpandedModalOpen(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] rounded-lg p-1.5 cursor-pointer flex items-center gap-1.5 transition-colors border border-[var(--border-subtle)] text-xs font-semibold"
                title="Close (ESC)"
              >
                <X className="w-4 h-4" />
                <span className="font-mono text-[10px]">ESC</span>
              </button>
            </div>

            {/* Split: Story/Telemetry on Left, Code Diff on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0 overflow-hidden">
              <div className="lg:col-span-5 flex flex-col justify-between gap-3 min-h-0 overflow-y-auto pr-1">
                <div className="space-y-1.5 bg-[var(--bg-card)] p-4 border border-[var(--border-subtle)] rounded-xl">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 block">
                    📋 Business Requirement (User Story)
                  </span>
                  <h3 className="text-base font-bold text-[var(--text-primary)] leading-snug">
                    {stage.ticket_title || stage.title}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-sans select-text font-medium">
                    {stage.story}
                  </p>
                </div>

                <div className="bg-amber-500/10 border-l-4 border-amber-500 border-y border-r border-amber-500/20 p-3.5 rounded-r-xl flex flex-col gap-2">
                  <div className="flex items-start gap-2">
                    <GitPullRequest className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider block">
                        AI Golem Proposal:
                      </span>
                      <span className="text-xs text-[var(--text-primary)] italic font-sans leading-relaxed block font-medium">
                        "{stage.ai_proposal_summary}"
                      </span>
                    </div>
                  </div>
                  <code className="text-emerald-800 dark:text-emerald-300 font-mono text-[10px] bg-[var(--bg-elevated)] px-2 py-0.5 rounded border border-[var(--border-subtle)] self-start select-all font-bold">
                    {stage.file_name}
                  </code>
                </div>

                {/* Modal Hint Box */}
                {!isHintRevealed ? (
                  <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl flex flex-col items-center justify-center gap-2 text-center">
                    <Lock className="w-6 h-6 text-[var(--text-muted)]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                      Architectural Telemetry Hint
                    </span>
                    <span className="text-xs text-[var(--text-muted)] font-sans font-medium">
                      Uses 1 Hint ({hintsRemaining}/{maxHints} Left in Session Budget)
                    </span>
                    <button
                      type="button"
                      disabled={hintsRemaining <= 0 || isRevealing}
                      onClick={handleRevealClick}
                      className={`px-4 py-2 rounded-lg text-xs font-bold border cursor-pointer mt-1 ${
                        hintsRemaining > 0
                          ? 'bg-amber-500/15 border-amber-500/40 text-amber-800 dark:text-amber-300 hover:bg-amber-500/25'
                          : 'bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--text-muted)] cursor-not-allowed'
                      }`}
                    >
                      {hintsRemaining > 0
                        ? (isRevealing ? 'Unlocking...' : `Reveal Hint (${hintsRemaining} left)`)
                        : 'No hints remaining'}
                    </button>
                  </div>
                ) : (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex-1 min-h-0 flex flex-col justify-start">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2 shrink-0">
                      <Unlock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                        Architectural Hint Unlocked
                      </span>
                    </div>
                    <div className="mb-2 bg-rose-500/15 border border-rose-500/30 px-3 py-1.5 rounded-lg flex items-center gap-2 shrink-0">
                      <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                      <span className="text-xs text-rose-900 dark:text-rose-200 font-bold">
                        DETECTED THREAT: <strong className="text-rose-950 dark:text-amber-200 underline font-black">{stage.title}</strong>
                      </span>
                    </div>
                    <div className="text-xs text-[var(--text-primary)] leading-relaxed overflow-y-auto font-medium">
                      <strong className="text-amber-800 dark:text-amber-300 block mb-1 font-bold">SUSPECT PATTERN:</strong>
                      <p className="font-sans leading-relaxed select-text">
                        {stage.hidden_risks}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Code Diff Full View */}
              <div className="lg:col-span-7 border border-[var(--border-subtle)] bg-[var(--bg-code)] rounded-xl flex flex-col h-full min-h-0 overflow-hidden">
                <div className="bg-[var(--bg-panel)] px-4 py-2 border-b border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-muted)] shrink-0">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-[var(--text-muted)]" />
                    <span className="font-mono text-xs text-[var(--text-primary)]">{stage.file_name}</span>
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)]">UNIFIED DIFF</span>
                </div>
                <div className="p-3 font-mono text-xs overflow-y-auto overflow-x-auto flex-1 leading-relaxed select-text bg-[var(--bg-code)]">
                  {diffLines.map((line, idx) => {
                    const isAdd = line.startsWith('+') && !line.startsWith('+++');
                    const isRemove = line.startsWith('-') && !line.startsWith('---');
                    const isHeader = line.startsWith('@@');
                    const isFileMeta = line.startsWith('---') || line.startsWith('+++');

                    let lineTextColor = 'text-[var(--text-primary)]';
                    let lineBgColor = '';

                    if (isAdd) {
                      lineTextColor = 'text-[var(--diff-add-text)] font-medium';
                      lineBgColor = 'bg-[var(--diff-add-bg)]';
                    } else if (isRemove) {
                      lineTextColor = 'text-[var(--diff-del-text)] font-medium';
                      lineBgColor = 'bg-[var(--diff-del-bg)]';
                    } else if (isHeader) {
                      lineTextColor = 'text-sky-500 dark:text-sky-400 font-medium';
                    } else if (isFileMeta) {
                      lineTextColor = 'text-[var(--text-muted)] font-mono';
                    }

                    return (
                      <div
                        key={idx}
                        className={`flex items-start text-xs py-0.5 px-2 hover:bg-black/5 dark:hover:bg-white/[0.03] transition-colors rounded-sm ${lineBgColor}`}
                      >
                        <span className="w-10 shrink-0 text-right pr-3 text-[var(--text-muted)] select-none font-mono text-[11px] leading-5">
                          {idx + 1}
                        </span>
                        <span className={`flex-1 font-mono leading-5 whitespace-pre ${lineTextColor}`}>
                          {line}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Bottom Bar */}
            <div className="pt-3 mt-3 border-t border-[var(--border-subtle)] flex items-center justify-between shrink-0">
              <span className="text-xs text-[var(--text-muted)] hidden sm:inline">
                Inspect business story & diff side-by-side.
              </span>
              <button
                type="button"
                onClick={() => setIsExpandedModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-[var(--text-primary)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center gap-2 cursor-pointer shadow-md ml-auto transition-colors"
              >
                <span>RETURN TO COCKPIT</span>
                <span className="text-[10px] opacity-75 font-mono">[ESC]</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default React.memo(StageScenarioViewer);

