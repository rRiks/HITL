import React, { useState } from 'react';
import {
  GitPullRequest,
  FileCode,
  AlertTriangle,
  Dice5,
  Ban,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Zap,
  Terminal,
  Search,
  ChevronDown,
  ChevronUp,
  Users,
  Check,
  Edit3,
} from 'lucide-react';

export default function StageArena({
  stage,
  onSelectAction,
  disabled = false,
  votesTally = {},
  activePlayers = [],
  myVote = null,
  customPromptDraft = null,
  guardrailRuleDraft = null,
  onOpenDraftPrompt,
  onOpenDraftRule,
}) {
  const [showRiskScanner, setShowRiskScanner] = useState(false);

  if (!stage) return null;

  const diffLines = stage.code_diff.split('\n');

  // Voting metrics
  const totalActivePlayers = Math.max(activePlayers.length, 1);
  const totalVotesCast = Object.values(votesTally).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col h-full justify-between gap-3 overflow-hidden select-none">
      {/* 1. Incident Briefing & Code Diff Panel */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col flex-1 overflow-hidden relative border border-[#e5dec9] shadow-md">
        {/* Stage Threat Header */}
        <div className="flex items-center justify-between gap-2 mb-2 shrink-0">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1.5 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
              <span>STAGE {stage.id} // SEV-1 ALERT</span>
            </span>
            <span className="text-xs font-mono text-stone-500">
              Phase: <strong className="text-stone-800 font-semibold">{stage.phase_name}</strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-900 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full">
            <Sparkles className="w-3 h-3 text-amber-700 animate-spin" style={{ animationDuration: '4s' }} />
            <span>AI AGENT STREAMING PR</span>
          </div>
        </div>

        {/* Story Title & Narrative */}
        <h2 className="text-xl font-extrabold text-stone-900 tracking-tight mb-1 shrink-0 font-display">
          {stage.title}
        </h2>
        <p className="text-xs text-stone-600 font-normal leading-relaxed mb-2.5 line-clamp-2 shrink-0">
          {stage.story}
        </p>

        {/* AI Commit / PR Summary Bar */}
        <div className="bg-[#f5efe3] border border-[#e0d7c6] rounded-xl px-3.5 py-2 mb-2.5 flex items-center justify-between gap-3 shrink-0 shadow-xs">
          <div className="flex items-center gap-2 text-xs truncate">
            <GitPullRequest className="w-4 h-4 text-amber-700 shrink-0" />
            <span className="text-[11px] font-bold text-stone-700 uppercase font-mono shrink-0">PROPOSAL:</span>
            <span className="text-[11px] text-stone-600 italic font-mono truncate">
              "{stage.ai_proposal_summary}"
            </span>
          </div>
          <code className="text-stone-800 font-mono text-[10px] bg-[#ede6d8] px-2.5 py-0.5 rounded border border-[#d8cfbe] shrink-0 font-semibold">
            {stage.file_name}
          </code>
        </div>

        {/* Unified Code Diff Viewer (Editorial Light Styling) */}
        <div className="rounded-xl border border-[#ded5c5] bg-[#fbf9f4] flex-1 min-h-[160px] sm:min-h-[180px] flex flex-col overflow-hidden shadow-inner">
          <div className="bg-[#f0e9dc] px-3.5 py-1.5 border-b border-[#ded5c5] flex items-center justify-between text-xs font-mono text-stone-600 shrink-0">
            <div className="flex items-center gap-2">
              <FileCode className="w-3.5 h-3.5 text-amber-700" />
              <span className="font-semibold text-stone-800">Inspection View: git diff</span>
            </div>
            <span className="text-[10px] text-stone-500 font-mono">Unified Diff</span>
          </div>

          <div className="p-2 sm:p-2.5 font-mono text-xs overflow-y-auto overflow-x-auto flex-1 leading-relaxed select-text bg-[#fbf9f4]">
            {diffLines.map((line, idx) => {
              const isAdd = line.startsWith('+') && !line.startsWith('+++');
              const isRemove = line.startsWith('-') && !line.startsWith('---');
              const isHeader = line.startsWith('@@') || line.startsWith('---') || line.startsWith('+++');

              let rowClass = 'text-stone-700 py-0.5 px-2';
              if (isAdd) rowClass = 'code-diff-add py-0.5 px-2 font-medium';
              if (isRemove) rowClass = 'code-diff-remove py-0.5 px-2 font-medium';
              if (isHeader) rowClass = 'text-amber-900 font-bold py-0.5 px-2 bg-amber-100/70 rounded-xs';

              return (
                <div key={idx} className={`font-mono text-[11px] sm:text-[12px] whitespace-pre ${rowClass}`}>
                  {line}
                </div>
              );
            })}
          </div>
        </div>

        {/* Hidden Architectural Risks Accordion */}
        <div className="mt-2.5 shrink-0">
          <button
            onClick={() => setShowRiskScanner(!showRiskScanner)}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-[#f5efe3] hover:bg-[#ede5d6] border border-[#ded5c5] text-xs font-mono text-stone-700 transition-colors cursor-pointer shadow-xs"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span className="font-bold">Human Inspector Threat Telemetry</span>
            </div>
            {showRiskScanner ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showRiskScanner && (
            <div className="mt-1.5 p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 font-mono leading-relaxed animate-fadeIn shadow-xs">
              <strong className="text-amber-900 block mb-1 font-bold">DETECTED PATTERN:</strong>
              {stage.hidden_risks}
            </div>
          )}
        </div>
      </div>

      {/* 2. Team Voting & Decision Consoles */}
      <div className="shrink-0 space-y-2">
        {/* Live Active Connected Teammates Roster Bar */}
        <div className="bg-[#f0e9dc] border border-[#ded5c5] rounded-xl px-3 py-2 flex flex-wrap items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span className="text-[11px] font-mono font-bold text-stone-800 uppercase tracking-wider">
              Team Consensus:
            </span>
            <span className="text-[11px] font-mono font-black text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300">
              {totalVotesCast} / {totalActivePlayers} Votes
            </span>
            <span className="text-[10px] font-mono text-stone-500 hidden sm:inline">
              (Auto-triggers when all connected vote or timer ends)
            </span>
          </div>

          {/* Active Teammates Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            {activePlayers.map((player) => {
              const hasVoted = player.has_voted;
              return (
                <div
                  key={player.player_id}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border transition-all ${
                    hasVoted
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-900 shadow-2xs'
                      : 'bg-white border-stone-300 text-stone-600'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      hasVoted ? 'bg-emerald-600' : 'bg-amber-400 animate-pulse'
                    }`}
                  />
                  <span>{player.player_name}</span>
                  {hasVoted && <Check className="w-3 h-3 text-emerald-700" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Voting Action Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-2.5">
          {/* Option 1: Accept as-is */}
          <button
            onClick={() => !disabled && onSelectAction('accept_as_is')}
            disabled={disabled}
            className={`group text-left p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
              myVote === 'accept_as_is'
                ? 'bg-[#fef3c7] border-amber-500 shadow-md ring-2 ring-amber-400/50'
                : 'bg-[#fffbeb] hover:bg-[#fef3c7] border-amber-300 hover:border-amber-400 hover:shadow-md'
            } ${disabled ? 'opacity-50 pointer-events-none' : 'active:scale-98'}`}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-mono font-bold">
                  Velocity
                </span>
                <div className="flex items-center gap-1">
                  {(votesTally['accept_as_is'] || 0) > 0 && (
                    <span className="text-[10px] font-mono font-black px-1.5 py-0.5 bg-amber-200 text-amber-950 rounded-md border border-amber-300">
                      {votesTally['accept_as_is']} {votesTally['accept_as_is'] === 1 ? 'vote' : 'votes'}
                    </span>
                  )}
                  <Dice5 className="w-4 h-4 text-amber-600 group-hover:rotate-45 transition-transform" />
                </div>
              </div>
              <h4 className="font-bold text-stone-900 text-sm group-hover:text-amber-900 transition-colors leading-tight mb-1 font-display flex items-center justify-between">
                <span>Blind Velocity</span>
                {myVote === 'accept_as_is' && (
                  <span className="text-[10px] font-mono text-emerald-700 font-black">✓ YOU</span>
                )}
              </h4>
              <p className="text-[11px] text-stone-600 line-clamp-2 leading-tight">
                Approve AI PR directly into the pipeline without manual review.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-amber-200 flex items-center justify-between">
              <span className="text-[10px] font-mono text-stone-500">Unverified</span>
              <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold transition-all ${
                myVote === 'accept_as_is'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-100 group-hover:bg-amber-200 text-amber-900'
              }`}>
                {myVote === 'accept_as_is' ? 'Voted' : 'Vote'}
              </span>
            </div>
          </button>

          {/* Option 2: Deny & Skip */}
          <button
            onClick={() => !disabled && onSelectAction('deny_and_move_on')}
            disabled={disabled}
            className={`group text-left p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
              myVote === 'deny_and_move_on'
                ? 'bg-stone-200 border-stone-600 shadow-md ring-2 ring-stone-400/50'
                : 'bg-[#fafaf9] hover:bg-[#f5f5f4] border-stone-300 hover:border-stone-400 hover:shadow-md'
            } ${disabled ? 'opacity-50 pointer-events-none' : 'active:scale-98'}`}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="px-2 py-0.5 rounded-md bg-stone-200 text-stone-800 border border-stone-300 text-[10px] font-mono font-bold">
                  Bypass
                </span>
                <div className="flex items-center gap-1">
                  {(votesTally['deny_and_move_on'] || 0) > 0 && (
                    <span className="text-[10px] font-mono font-black px-1.5 py-0.5 bg-stone-300 text-stone-900 rounded-md border border-stone-400">
                      {votesTally['deny_and_move_on']} {votesTally['deny_and_move_on'] === 1 ? 'vote' : 'votes'}
                    </span>
                  )}
                  <Ban className="w-4 h-4 text-stone-500" />
                </div>
              </div>
              <h4 className="font-bold text-stone-900 text-sm group-hover:text-stone-700 transition-colors leading-tight mb-1 font-display flex items-center justify-between">
                <span>Bypass & Skip</span>
                {myVote === 'deny_and_move_on' && (
                  <span className="text-[10px] font-mono text-emerald-700 font-black">✓ YOU</span>
                )}
              </h4>
              <p className="text-[11px] text-stone-600 line-clamp-2 leading-tight">
                Reject commit and skip changes to safeguard existing architecture.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-stone-200 flex items-center justify-between">
              <span className="text-[10px] font-mono text-stone-500">Safe Skip</span>
              <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold transition-all ${
                myVote === 'deny_and_move_on'
                  ? 'bg-stone-700 text-white shadow-xs'
                  : 'bg-stone-200 group-hover:bg-stone-300 text-stone-800'
              }`}>
                {myVote === 'deny_and_move_on' ? 'Voted' : 'Vote'}
              </span>
            </div>
          </button>

          {/* Option 3: Custom Prompt (Collaborative Draft + Vote) */}
          <div
            className={`group text-left p-2.5 sm:p-3 rounded-xl border transition-all relative overflow-hidden flex flex-col justify-between ${
              myVote === 'custom_prompt'
                ? 'bg-sky-100 border-sky-500 shadow-md ring-2 ring-sky-400/50'
                : 'bg-[#f0f9ff] hover:bg-[#e0f2fe] border-sky-300 hover:border-sky-400 hover:shadow-md'
            } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-900 border border-sky-300 text-[10px] font-mono font-bold">
                  HITL Prompt
                </span>
                <div className="flex items-center gap-1">
                  {(votesTally['custom_prompt'] || 0) > 0 && (
                    <span className="text-[10px] font-mono font-black px-1.5 py-0.5 bg-sky-200 text-sky-950 rounded-md border border-sky-300">
                      {votesTally['custom_prompt']} {votesTally['custom_prompt'] === 1 ? 'vote' : 'votes'}
                    </span>
                  )}
                  <MessageSquare className="w-4 h-4 text-sky-600" />
                </div>
              </div>

              <h4 className="font-bold text-stone-900 text-sm group-hover:text-sky-900 transition-colors leading-tight mb-1 font-display flex items-center justify-between">
                <span>Human Guidance</span>
                {myVote === 'custom_prompt' && (
                  <span className="text-[10px] font-mono text-emerald-700 font-black">✓ YOU</span>
                )}
              </h4>

              {/* Collaborative Draft Preview */}
              {customPromptDraft?.text ? (
                <div className="bg-white/80 border border-sky-200 rounded-lg p-1.5 my-1 text-[10px] font-mono text-sky-900">
                  <div className="flex items-center justify-between mb-0.5 text-[9px] text-sky-600 font-bold uppercase">
                    <span>Drafted by {customPromptDraft.player_name}:</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenDraftPrompt && onOpenDraftPrompt();
                      }}
                      className="text-sky-700 hover:text-sky-900 underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <Edit3 className="w-2.5 h-2.5" />
                      <span>Edit</span>
                    </button>
                  </div>
                  <p className="line-clamp-2 italic font-sans">"{customPromptDraft.text}"</p>
                </div>
              ) : (
                <p className="text-[11px] text-stone-600 line-clamp-2 leading-tight">
                  Type specific architectural instructions to steer the AI agent.
                </p>
              )}
            </div>

            <div className="mt-3 pt-2 border-t border-sky-200 flex items-center justify-between">
              <span className="text-[10px] font-mono text-stone-500">Collaborative</span>
              <button
                type="button"
                onClick={() => {
                  if (!disabled) onSelectAction('custom_prompt');
                }}
                className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer active:scale-95 ${
                  myVote === 'custom_prompt'
                    ? 'bg-sky-700 text-white shadow-xs'
                    : 'bg-sky-600 hover:bg-sky-700 text-white shadow-xs'
                }`}
              >
                {customPromptDraft?.text ? (myVote === 'custom_prompt' ? 'Voted' : 'Vote') : 'Draft Prompt'}
              </button>
            </div>
          </div>

          {/* Option 4: Guardrail Armor (Collaborative Rule + Vote) */}
          <div
            className={`group text-left p-2.5 sm:p-3 rounded-xl border transition-all relative overflow-hidden flex flex-col justify-between ${
              myVote === 'suggest_change'
                ? 'bg-emerald-100 border-emerald-500 shadow-md ring-2 ring-emerald-400/50'
                : 'bg-[#f0fdf4] hover:bg-[#dcfce7] border-emerald-300 hover:border-emerald-400 hover:shadow-md'
            } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-mono font-bold">
                  Policy
                </span>
                <div className="flex items-center gap-1">
                  {(votesTally['suggest_change'] || 0) > 0 && (
                    <span className="text-[10px] font-mono font-black px-1.5 py-0.5 bg-emerald-200 text-emerald-950 rounded-md border border-emerald-300">
                      {votesTally['suggest_change']} {votesTally['suggest_change'] === 1 ? 'vote' : 'votes'}
                    </span>
                  )}
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
              </div>

              <h4 className="font-bold text-stone-900 text-sm group-hover:text-emerald-900 transition-colors leading-tight mb-1 font-display flex items-center justify-between">
                <span>Guardrail Armor</span>
                {myVote === 'suggest_change' && (
                  <span className="text-[10px] font-mono text-emerald-700 font-black">✓ YOU</span>
                )}
              </h4>

              {/* Selected Guardrail Rule Preview */}
              {guardrailRuleDraft?.title ? (
                <div className="bg-white/80 border border-emerald-200 rounded-lg p-1.5 my-1 text-[10px] font-mono text-emerald-900">
                  <div className="flex items-center justify-between mb-0.5 text-[9px] text-emerald-700 font-bold uppercase">
                    <span>Chosen by {guardrailRuleDraft.player_name}:</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenDraftRule && onOpenDraftRule();
                      }}
                      className="text-emerald-800 hover:text-emerald-950 underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <Edit3 className="w-2.5 h-2.5" />
                      <span>Change</span>
                    </button>
                  </div>
                  <p className="line-clamp-2 font-semibold font-sans">{guardrailRuleDraft.title}</p>
                </div>
              ) : (
                <p className="text-[11px] text-stone-600 line-clamp-2 leading-tight">
                  Enforce institutional architectural standard on AI output.
                </p>
              )}
            </div>

            <div className="mt-3 pt-2 border-t border-emerald-200 flex items-center justify-between">
              <span className="text-[10px] font-mono text-stone-500">Governance</span>
              <button
                type="button"
                onClick={() => {
                  if (!disabled) onSelectAction('suggest_change');
                }}
                className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer active:scale-95 ${
                  myVote === 'suggest_change'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs'
                }`}
              >
                {guardrailRuleDraft?.title ? (myVote === 'suggest_change' ? 'Voted' : 'Vote') : 'Select Rule'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
