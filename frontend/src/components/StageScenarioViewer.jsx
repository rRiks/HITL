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
    <div className="flex flex-col h-full min-h-0 bg-slate-900/60 border border-white/10 rounded-xl overflow-hidden shadow-xl select-none">
      {/* 1. Compact Context Header (Story + PR Callout) */}
      <div className="p-3.5 pb-2.5 shrink-0 border-b border-white/10 bg-slate-950/40">
        {/* Top meta strip */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 shrink-0">
              <GitPullRequest className="w-3 h-3 text-emerald-400" />
              <span>PR #{stage.id}</span>
            </span>
            <span className="text-[11px] font-medium text-slate-400 truncate">
              PHASE: <strong className="text-slate-200">{stage.phase_name}</strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>AI Proposal</span>
            </div>
            <button
              type="button"
              onClick={() => setIsExpandedModalOpen(true)}
              className="text-slate-400 hover:text-white hover:bg-white/5 px-2 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 transition-colors border border-white/10 cursor-pointer"
              title="Pop out Full PR Inspection View"
            >
              <Maximize2 className="w-3 h-3 text-sky-400" />
              <span>ENLARGE</span>
            </button>
          </div>
        </div>

        {/* User Story Title & Summary */}
        <h2 className="text-sm font-semibold tracking-tight text-white mb-1">
          {stage.ticket_title || stage.title}
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed font-sans select-text line-clamp-2">
          {stage.story}
        </p>

        {/* Inline PR Commit Callout with Left Accent Border */}
        <div className="mt-2.5 border-l-4 border-amber-500 bg-amber-500/5 px-3.5 py-2 rounded-r-md border-y border-r border-amber-500/10">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-1.5">
              <GitPullRequest className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">
                AI Golem Proposal
              </span>
            </div>
            <code className="text-emerald-400 font-mono text-[10px] bg-slate-950/70 px-2 py-0.5 rounded border border-white/10 select-all">
              {stage.file_name}
            </code>
          </div>
          <p className="text-xs text-amber-100/90 italic font-sans select-text leading-relaxed">
            "{stage.ai_proposal_summary}"
          </p>
        </div>
      </div>

      {/* 2. Dominant Diff Viewer (flex-1, line-numbered, occupying >65% height) */}
      <div className="flex-1 min-h-[180px] flex flex-col bg-slate-950/90 overflow-hidden">
        {/* Diff Toolbar */}
        <div className="px-3.5 py-2 border-b border-white/10 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <FileCode className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-mono text-[11px] text-slate-200">{stage.file_name}</span>
            <span className="text-[10px] text-slate-500 font-sans">(git diff)</span>
          </div>
          <button
            type="button"
            onClick={() => setIsExpandedModalOpen(true)}
            className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer transition-colors"
            title="Inspect side-by-side full code diff"
          >
            <Maximize2 className="w-3 h-3" />
            <span>FULL DIFF ➔</span>
          </button>
        </div>

        {/* Diff Lines Container with Left Gutter Numbers */}
        <div className="p-2 font-mono text-xs overflow-y-auto overflow-x-auto flex-1 leading-relaxed select-text bg-slate-950 divide-y divide-white/[0.02]">
          {diffLines.map((line, idx) => {
            const isAdd = line.startsWith('+') && !line.startsWith('+++');
            const isRemove = line.startsWith('-') && !line.startsWith('---');
            const isHeader = line.startsWith('@@');
            const isFileMeta = line.startsWith('---') || line.startsWith('+++');

            let rowBg = 'hover:bg-white/[0.02] text-slate-300';
            let lineTextColor = 'text-slate-300';

            if (isAdd) {
              rowBg = 'bg-emerald-950/30 hover:bg-emerald-950/40 border-l-2 border-emerald-500';
              lineTextColor = 'text-emerald-300 font-medium';
            } else if (isRemove) {
              rowBg = 'bg-rose-950/30 hover:bg-rose-950/40 border-l-2 border-rose-500';
              lineTextColor = 'text-rose-300 font-medium';
            } else if (isHeader) {
              rowBg = 'bg-sky-950/20 text-sky-400 font-medium border-l-2 border-sky-500/40';
              lineTextColor = 'text-sky-400';
            } else if (isFileMeta) {
              rowBg = 'text-slate-500 bg-slate-900/40';
              lineTextColor = 'text-slate-400 font-mono';
            }

            return (
              <div
                key={idx}
                className={`flex items-start text-[11px] py-0.5 px-2 transition-colors ${rowBg}`}
              >
                {/* Line number gutter */}
                <span className="w-8 shrink-0 text-right pr-3 text-slate-600 select-none font-mono text-[10px] leading-5">
                  {idx + 1}
                </span>
                {/* Diff line code content */}
                <span className={`flex-1 font-mono leading-5 whitespace-pre ${lineTextColor}`}>
                  {line}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Docked Hint Footer (Bottom Status Drawer) */}
      <div className="shrink-0 border-t border-white/10 bg-slate-950/90 px-4 py-2.5">
        {!isHintRevealed ? (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="truncate">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-300 block">
                  Architectural Telemetry Hint
                </span>
                <span className="text-[10px] text-slate-400 font-sans block">
                  Budget: {hintsRemaining}/{maxHints} Hints Remaining
                </span>
              </div>
            </div>

            <button
              type="button"
              disabled={hintsRemaining <= 0 || isRevealing}
              onClick={handleRevealClick}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                hintsRemaining > 0
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20 hover:border-amber-500/50'
                  : 'bg-white/5 border-white/10 text-slate-600 cursor-not-allowed opacity-60'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {hintsRemaining > 0
                  ? (isRevealing ? 'Unlocking...' : `Reveal Hint (${hintsRemaining} left)`)
                  : 'No hints left'}
              </span>
            </button>
          </div>
        ) : (
          <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-2.5">
            <div className="flex items-center justify-between gap-2 mb-1.5 border-b border-amber-500/10 pb-1">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] font-semibold uppercase tracking-wider">
                  Architectural Hint Unlocked
                </span>
              </div>
              <span className="text-[10px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-mono">
                {hintsRemaining}/{maxHints} REMAINING
              </span>
            </div>

            <div className="mb-1.5 bg-rose-950/40 border border-rose-500/30 px-2.5 py-1 rounded flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span className="text-[11px] text-rose-300 font-medium">
                SUSPECTED THREAT: <strong className="text-amber-200 underline">{stage.title}</strong>
              </span>
            </div>

            <p className="font-sans text-xs text-amber-100/90 leading-relaxed select-text">
              {stage.hidden_risks}
            </p>
          </div>
        )}
      </div>

      {/* 4. Expanded Single-Screen Inspection Modal */}
      {isExpandedModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className="bg-slate-900 border border-white/15 rounded-2xl max-w-6xl w-full h-[90vh] max-h-[92vh] flex flex-col p-4 sm:p-6 shadow-2xl overflow-hidden">
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  QUEST WAVE {stage.id}: {stage.phase_name}
                </span>
                <span className="text-sm font-semibold text-white hidden sm:inline">
                  Architectural PR Inspection Console
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsExpandedModalOpen(false)}
                className="text-slate-400 hover:text-white hover:bg-white/10 rounded-lg p-1.5 cursor-pointer flex items-center gap-1.5 transition-colors border border-white/10 text-xs"
                title="Close (ESC)"
              >
                <X className="w-4 h-4" />
                <span className="font-mono text-[10px]">ESC</span>
              </button>
            </div>

            {/* Split: Story/Telemetry on Left, Code Diff on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0 overflow-hidden">
              <div className="lg:col-span-5 flex flex-col justify-between gap-3 min-h-0 overflow-y-auto pr-1">
                <div className="space-y-1.5 bg-slate-950/50 p-4 border border-white/10 rounded-xl">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 block">
                    📋 Business Requirement (User Story)
                  </span>
                  <h3 className="text-base font-semibold text-white leading-snug">
                    {stage.ticket_title || stage.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans select-text">
                    {stage.story}
                  </p>
                </div>

                <div className="bg-amber-500/5 border-l-4 border-amber-500 border-y border-r border-amber-500/20 p-3.5 rounded-r-xl flex flex-col gap-2">
                  <div className="flex items-start gap-2">
                    <GitPullRequest className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider block">
                        AI Golem Proposal:
                      </span>
                      <span className="text-xs text-amber-100/90 italic font-sans leading-relaxed block">
                        "{stage.ai_proposal_summary}"
                      </span>
                    </div>
                  </div>
                  <code className="text-emerald-400 font-mono text-[10px] bg-slate-950/70 px-2 py-0.5 rounded border border-white/10 self-start select-all">
                    {stage.file_name}
                  </code>
                </div>

                {/* Modal Hint Box */}
                {!isHintRevealed ? (
                  <div className="p-4 bg-slate-950/50 border border-white/10 rounded-xl flex flex-col items-center justify-center gap-2 text-center">
                    <Lock className="w-6 h-6 text-slate-500" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Architectural Telemetry Hint
                    </span>
                    <span className="text-xs text-slate-400 font-sans">
                      Uses 1 Hint ({hintsRemaining}/{maxHints} Left in Session Budget)
                    </span>
                    <button
                      type="button"
                      disabled={hintsRemaining <= 0 || isRevealing}
                      onClick={handleRevealClick}
                      className={`px-4 py-2 rounded-lg text-xs font-medium border cursor-pointer mt-1 ${
                        hintsRemaining > 0
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                          : 'bg-white/5 border-white/10 text-slate-600 cursor-not-allowed'
                      }`}
                    >
                      {hintsRemaining > 0
                        ? (isRevealing ? 'Unlocking...' : `Reveal Hint (${hintsRemaining} left)`)
                        : 'No hints remaining'}
                    </button>
                  </div>
                ) : (
                  <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl flex-1 min-h-0 flex flex-col justify-start">
                    <div className="flex items-center gap-2 text-emerald-400 mb-2 shrink-0">
                      <Unlock className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-xs font-semibold uppercase tracking-wider">
                        Architectural Hint Unlocked
                      </span>
                    </div>
                    <div className="mb-2 bg-rose-950/40 border border-rose-500/30 px-3 py-1.5 rounded-lg flex items-center gap-2 shrink-0">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span className="text-xs text-rose-300 font-medium">
                        DETECTED THREAT: <strong className="text-amber-200 underline">{stage.title}</strong>
                      </span>
                    </div>
                    <div className="text-xs text-amber-100/90 leading-relaxed overflow-y-auto">
                      <strong className="text-amber-300 block mb-1">SUSPECT PATTERN:</strong>
                      <p className="font-sans leading-relaxed select-text">
                        {stage.hidden_risks}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Code Diff Full View */}
              <div className="lg:col-span-7 border border-white/10 bg-slate-950 rounded-xl flex flex-col h-full min-h-0 overflow-hidden">
                <div className="bg-slate-900/60 px-4 py-2 border-b border-white/10 flex items-center justify-between text-xs text-slate-400 shrink-0">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-slate-400" />
                    <span className="font-mono text-xs text-slate-200">{stage.file_name}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">UNIFIED DIFF</span>
                </div>
                <div className="p-3 font-mono text-xs overflow-y-auto overflow-x-auto flex-1 leading-relaxed select-text bg-slate-950 divide-y divide-white/[0.02]">
                  {diffLines.map((line, idx) => {
                    const isAdd = line.startsWith('+') && !line.startsWith('+++');
                    const isRemove = line.startsWith('-') && !line.startsWith('---');
                    const isHeader = line.startsWith('@@');
                    const isFileMeta = line.startsWith('---') || line.startsWith('+++');

                    let rowBg = 'hover:bg-white/[0.02] text-slate-300';
                    let lineTextColor = 'text-slate-300';

                    if (isAdd) {
                      rowBg = 'bg-emerald-950/30 hover:bg-emerald-950/40 border-l-2 border-emerald-500';
                      lineTextColor = 'text-emerald-300 font-medium';
                    } else if (isRemove) {
                      rowBg = 'bg-rose-950/30 hover:bg-rose-950/40 border-l-2 border-rose-500';
                      lineTextColor = 'text-rose-300 font-medium';
                    } else if (isHeader) {
                      rowBg = 'bg-sky-950/20 text-sky-400 font-medium border-l-2 border-sky-500/40';
                      lineTextColor = 'text-sky-400';
                    } else if (isFileMeta) {
                      rowBg = 'text-slate-500 bg-slate-900/40';
                      lineTextColor = 'text-slate-400 font-mono';
                    }

                    return (
                      <div
                        key={idx}
                        className={`flex items-start text-xs py-0.5 px-2 transition-colors ${rowBg}`}
                      >
                        <span className="w-10 shrink-0 text-right pr-3 text-slate-600 select-none font-mono text-[11px] leading-5">
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
            <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500 hidden sm:inline">
                Inspect business story & diff side-by-side.
              </span>
              <button
                type="button"
                onClick={() => setIsExpandedModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-white/10 flex items-center gap-2 cursor-pointer shadow-md ml-auto transition-colors"
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

