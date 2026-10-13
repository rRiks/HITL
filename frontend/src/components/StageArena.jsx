import React, { useState, useEffect } from 'react';
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
  AlertOctagon,
  CheckCircle2,
  ArrowRight,
  Rotate3d,
  Maximize2,
  X,
} from 'lucide-react';

export default function StageArena({
  stage,
  onSelectAction,
  disabled = false,
  stageActionTaken = false,
  lastActionResult = null,
  onProceedNextStage,
  onWatchRemoval,
  onWatchCollapse,
  onReopenResult,
  onCommitDecision,
  votesTally = {},
  activePlayers = [],
  myVote = null,
  customPromptDraft = null,
  guardrailRuleDraft = null,
  technicalDebt = 0,
  onOpenDraftPrompt,
  onOpenDraftRule,
}) {
  const [showRiskScanner, setShowRiskScanner] = useState(false);
  const [isExpandedModalOpen, setIsExpandedModalOpen] = useState(false);

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

  const diffLines = stage.code_diff.split('\n');

  // Voting metrics
  const totalActivePlayers = Math.max(activePlayers.length, 1);
  const totalVotesCast = Object.values(votesTally).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col h-full min-h-0 gap-2 overflow-hidden select-none">
      {/* 1. Incident Briefing & Code Diff Panel (Dynamic Flexbox: Zero Hardcoded Offsets) */}
      <div className="mc-panel-dark p-2.5 sm:p-3 flex flex-col flex-1 min-h-0 overflow-y-auto relative shadow-md">
        {/* Stage Threat Header */}
        <div className="flex items-center justify-between gap-1.5 mb-1.5 shrink-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="px-2 py-0.5 text-[9px] mc-font uppercase tracking-wider bg-[#3a0000] text-[#ff5555] border-2 border-[#aa0000] flex items-center gap-1.5 shrink-0">
              <span className="w-1.5 h-1.5 bg-[#ff3333] animate-ping inline-block" />
              <span>QUEST WAVE {stage.id}</span>
            </span>
            <span className="text-[9px] mc-font text-[#aaa] truncate">
              STAGE: <strong className="text-[#ffd700]">{stage.phase_name}</strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <div className="hidden sm:flex items-center gap-1 text-[8.5px] mc-font text-[#ffd700] bg-[#221a0f] border border-[#553311] px-1.5 py-0.5">
              <Sparkles className="w-3 h-3 text-[#ffd700] animate-spin" style={{ animationDuration: '4s' }} />
              <span>AI GOLEM PR</span>
            </div>
            <button
              type="button"
              onClick={() => setIsExpandedModalOpen(true)}
              className="mc-btn px-2.5 py-0.5 text-[8.5px] mc-font text-[#55ffff] flex items-center gap-1 cursor-pointer transition-colors hover:text-white shrink-0 shadow-xs"
              title="Pop out Quest Briefing, Code Diff & Telemetry into full single-screen view"
            >
              <Maximize2 className="w-3 h-3 text-[#55ffff]" />
              <span>ENLARGE</span>
            </button>
          </div>
        </div>

        {/* Story Title & Narrative */}
        <h2 className="text-xs sm:text-sm font-bold text-white tracking-wide mb-1 shrink-0 mc-font text-[#ffff55]">
          {stage.title}
        </h2>
        <p className="text-[10.5px] sm:text-[11.5px] text-[#ccc] leading-snug mb-1.5 shrink-0 font-sans select-text">
          {stage.story}
        </p>

        {/* AI Commit / PR Summary Bar (Minecraft Anvil / Crafting Box) */}
        <div className="bg-[#181818] border-2 border-[#333] px-2.5 py-1 mb-1.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 shrink-0">
          <div className="flex items-start sm:items-center gap-2 text-xs min-w-0">
            <GitPullRequest className="w-3.5 h-3.5 text-[#ffd700] shrink-0 mt-0.5 sm:mt-0" />
            <span className="text-[9px] font-bold text-[#aaa] uppercase mc-font shrink-0">PROPOSAL:</span>
            <span className="text-[10.5px] text-[#ddd] italic font-sans select-text leading-snug truncate">
              "{stage.ai_proposal_summary}"
            </span>
          </div>
          <code className="text-[#55ff55] font-mono text-[9px] bg-[#101010] px-2 py-0.5 border border-[#333] shrink-0 self-start sm:self-auto select-all">
            {stage.file_name}
          </code>
        </div>

        {/* Unified Code Diff Viewer (Obsidian Slate Console: Dynamic height) */}
        <div className="border-2 border-[#333] bg-[#0c0d10] flex-1 min-h-[70px] flex flex-col overflow-hidden shadow-inner mb-1.5">
          <div className="bg-[#1a1c22] px-2.5 py-0.5 border-b-2 border-[#333] flex items-center justify-between text-xs mc-font text-[#aaa] shrink-0">
            <div className="flex items-center gap-1.5">
              <FileCode className="w-3 h-3 text-[#ffd700]" />
              <span className="text-[9px] text-white">BOOK & QUILL: git diff</span>
            </div>
            <span className="text-[8px] text-[#777]">UNIFIED</span>
          </div>

          <div className="p-2 font-mono text-xs overflow-y-auto overflow-x-auto flex-1 leading-relaxed select-text bg-[#0c0d10]">
            {diffLines.map((line, idx) => {
              const isAdd = line.startsWith('+') && !line.startsWith('+++');
              const isRemove = line.startsWith('-') && !line.startsWith('---');
              const isHeader = line.startsWith('@@') || line.startsWith('---') || line.startsWith('+++');

              let rowClass = 'text-[#ccc] py-0.5 px-2';
              if (isAdd) rowClass = 'text-[#55ff55] bg-[#0d2a0d]/50 py-0.5 px-2 font-medium';
              if (isRemove) rowClass = 'text-[#ff5555] bg-[#3a0d0d]/50 py-0.5 px-2 font-medium';
              if (isHeader) rowClass = 'text-[#ffff55] font-bold py-0.5 px-2 bg-[#2a2400]/50';

              return (
                <div key={idx} className={`font-mono text-[10.5px] sm:text-[11.5px] whitespace-pre ${rowClass}`}>
                  {line}
                </div>
              );
            })}
          </div>
        </div>

        {/* Hidden Architectural Risks Accordion */}
        <div className="shrink-0">
          <button
            onClick={() => setShowRiskScanner(!showRiskScanner)}
            className="w-full flex items-center justify-between px-2.5 py-1 bg-[#252525] hover:bg-[#2d2d2d] border border-[#444] text-[9px] mc-font text-[#ffd700] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3 h-3 text-[#ffaa00]" />
              <span>DETECTED ARCHITECTURE TELEMETRY</span>
            </div>
            {showRiskScanner ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showRiskScanner && (
            <div className="mt-1 p-2 bg-[#251505] border-2 border-[#aa5500] text-[9.5px] text-[#ffddaa] mc-font leading-relaxed">
              <strong className="text-[#ffd700] block mb-0.5">SUSPECT PATTERN:</strong>
              {stage.hidden_risks}
            </div>
          )}
        </div>
      </div>

      {/* 2. Team Voting & Hotbar Action Consoles */}
      <div className="shrink-0 space-y-1.5">
        {/* Live Multiplayer Roster Bar */}
        <div className="bg-[#1b1b1b] border-2 border-[#333] px-2.5 py-1.5 flex flex-wrap items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-[#ffd700] shrink-0" />
            <span className="text-[9px] mc-font text-[#e0e0e0] uppercase tracking-wider">
              REALM CONSENSUS:
            </span>
            <span className="text-[9px] mc-font px-1.5 py-0.2 bg-[#2d241e] text-[#55ff55] border border-[#553311]">
              {totalVotesCast} / {totalActivePlayers} VOTES
            </span>
            <span className="text-[8px] mc-font text-[#888] hidden sm:inline">
              (LOCKS AT 100% OR 2MIN)
            </span>
            {!stageActionTaken && totalVotesCast > 0 && onCommitDecision && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onCommitDecision();
                }}
                className="mc-btn mc-btn-green px-2 py-0.5 text-[8px] mc-font text-white flex items-center gap-1 cursor-pointer ml-1"
                title="Lock in current votes and resolve immediately without waiting"
              >
                <Zap className="w-2.5 h-2.5 text-[#ffd700]" />
                <span>RESOLVE NOW</span>
              </button>
            )}
          </div>

          {/* Active Player Badges */}
          <div className="flex flex-wrap items-center gap-1">
            {activePlayers.map((player) => {
              const hasVoted = player.has_voted;
              return (
                <div
                  key={player.player_id}
                  className={`flex items-center gap-1 px-1.5 py-0.5 text-[8px] mc-font border transition-all ${
                    hasVoted
                      ? 'bg-[#1a331a] border-[#2d5a2d] text-[#55ff55]'
                      : 'bg-[#282828] border-[#444] text-[#888]'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 inline-block ${
                      hasVoted ? 'bg-[#55ff55]' : 'bg-[#ffaa00] animate-pulse'
                    }`}
                  />
                  <span>{player.player_name}</span>
                  {hasVoted && <Check className="w-2.5 h-2.5 text-[#55ff55]" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Stage Decision Resolution Banner (Appears when decision is taken) */}
        {stageActionTaken && lastActionResult && (
          <div className="mc-panel-dark p-2.5 sm:p-3 border-2 border-[#ffd700] bg-[#1a1400]/95 flex flex-wrap items-center justify-between gap-2.5 shadow-lg animate-fadeIn">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-8 h-8 flex items-center justify-center border-2 shrink-0 ${
                  lastActionResult.outcome === 'failure'
                    ? 'bg-[#3a0000] border-[#ff3333] text-[#ff5555]'
                    : 'bg-[#002b00] border-[#55ff55] text-[#55ff55]'
                }`}
              >
                {lastActionResult.outcome === 'failure' ? (
                  <AlertOctagon className="w-4.5 h-4.5" />
                ) : (
                  <CheckCircle2 className="w-4.5 h-4.5" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[9px] mc-font uppercase text-[#ffd700] font-bold">
                    RESOLVED: {lastActionResult.action_label}
                  </span>
                  <span
                    className={`text-[8px] mc-font px-1.5 py-0.2 border ${
                      lastActionResult.outcome === 'failure'
                        ? 'bg-[#3a0000] text-[#ff5555] border-[#ff3333]'
                        : 'bg-[#002b00] text-[#55ff55] border-[#55ff55]'
                    }`}
                  >
                    {lastActionResult.outcome === 'failure' ? 'INCIDENT DETECTED' : 'CLEARED'}
                  </span>
                  <span className="text-[8px] mc-font text-[#aaa]">
                    HP: {lastActionResult.health_delta >= 0 ? `+${lastActionResult.health_delta}%` : `${lastActionResult.health_delta}%`} (Now: {lastActionResult.new_health}%)
                  </span>
                </div>
                <p className="text-[10px] text-[#ccc] line-clamp-1 font-sans mt-0.5">
                  {lastActionResult.feedback_message}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 ml-auto">
              {onReopenResult && (
                <button
                  type="button"
                  onClick={onReopenResult}
                  className="mc-btn px-2.5 py-1 text-[8px] mc-font text-[#ffd700] border border-[#ffd700] cursor-pointer"
                >
                  <span>DEBRIEF</span>
                </button>
              )}
              {lastActionResult.jenga_pulls > 0 && onWatchRemoval && (
                <button
                  type="button"
                  onClick={onWatchRemoval}
                  className="mc-btn px-2.5 py-1 text-[8px] mc-font text-white flex items-center gap-1 cursor-pointer"
                >
                  <Rotate3d className="w-3 h-3 text-[#ffd700]" />
                  <span>MINING (-{lastActionResult.jenga_pulls})</span>
                </button>
              )}
              {(() => {
                const isGameOver =
                  lastActionResult.is_game_over ||
                  (lastActionResult.new_health !== undefined && lastActionResult.new_health <= 0);
                if (isGameOver && onWatchCollapse) {
                  return (
                    <button
                      type="button"
                      onClick={onWatchCollapse}
                      className="mc-btn px-3.5 py-1 text-[9px] mc-font text-white flex items-center gap-1 cursor-pointer font-bold shadow-md bg-[#4a0000] border-2 border-[#ff3333] hover:bg-[#660000] animate-pulse"
                    >
                      <AlertOctagon className="w-3.5 h-3.5 text-[#ff5555]" />
                      <span>SEE STATUS: WATCH COLLAPSE ➔</span>
                    </button>
                  );
                }
                if (onProceedNextStage) {
                  return (
                    <button
                      type="button"
                      onClick={onProceedNextStage}
                      className="mc-btn mc-btn-green px-3.5 py-1 text-[9px] mc-font text-white flex items-center gap-1 cursor-pointer font-bold shadow-md"
                    >
                      <span>PROCEED TO NEXT STAGE</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  );
                }
                return null;
              })()}
            </div>
          </div>
        )}

        {/* Minecraft 4-Slot Hotbar Action Cards Grid */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-2 ${stageActionTaken ? 'opacity-50 pointer-events-none' : ''}`}>
          {/* Slot 1: Accept as-is (Gold Pickaxe / Apple) */}
          <div
            onClick={() => !disabled && onSelectAction('accept_as_is')}
            className={`mc-slot ${
              myVote === 'accept_as_is' ? 'mc-slot-selected' : 'mc-slot-dark'
            } p-2.5 flex flex-col justify-between cursor-pointer transition-colors ${
              disabled ? 'opacity-50' : 'hover:border-[#666]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[8px] mc-font text-[#ffd700] bg-[#332200] px-1 border border-[#664400]">
                  SLOT 1
                </span>
                <div className="flex items-center gap-1">
                  {(votesTally['accept_as_is'] || 0) > 0 && (
                    <span className="text-[9px] mc-font px-1 bg-[#1a331a] text-[#55ff55] border border-[#2d5a2d]">
                      +{votesTally['accept_as_is']}
                    </span>
                  )}
                  <span className="text-base pointer-events-none">🍏</span>
                </div>
              </div>
              <h4 className="text-xs font-bold text-white mc-font mb-0.5 flex items-center justify-between">
                <span>Accept as-is</span>
                {myVote === 'accept_as_is' && (
                  <span className="text-[8px] text-[#55ff55] mc-font">[EQUIPPED]</span>
                )}
              </h4>
              <p className="text-[10px] text-[#aaa] line-clamp-2 font-sans leading-tight">
                Mine ahead rapidly without human review. High risk!
              </p>
            </div>
            <div className="mt-2 pt-1 border-t border-[#444] flex items-center justify-between">
              <span className="text-[8px] mc-font text-[#777]">RAW SPEED</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!disabled) onSelectAction('accept_as_is');
                }}
                className={`mc-btn px-2 py-0.5 text-[8px] mc-font cursor-pointer ${
                  myVote === 'accept_as_is' ? 'mc-btn-green' : ''
                }`}
              >
                <span className="pointer-events-none">{myVote === 'accept_as_is' ? 'EQUIPPED' : 'SELECT'}</span>
              </button>
            </div>
          </div>

          {/* Slot 2: Deny & Skip (Iron Shield) */}
          <div
            onClick={() => !disabled && onSelectAction('deny_and_move_on')}
            className={`mc-slot ${
              myVote === 'deny_and_move_on' ? 'mc-slot-selected' : 'mc-slot-dark'
            } p-2.5 flex flex-col justify-between cursor-pointer transition-colors ${
              disabled ? 'opacity-50' : 'hover:border-[#666]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[8px] mc-font text-[#aaa] bg-[#222] px-1 border border-[#444]">
                  SLOT 2
                </span>
                <div className="flex items-center gap-1">
                  {(votesTally['deny_and_move_on'] || 0) > 0 && (
                    <span className="text-[9px] mc-font px-1 bg-[#1a331a] text-[#55ff55] border border-[#2d5a2d]">
                      +{votesTally['deny_and_move_on']}
                    </span>
                  )}
                  <span className="text-base pointer-events-none">🛡️</span>
                </div>
              </div>
              <h4 className="text-xs font-bold text-white mc-font mb-0.5 flex items-center justify-between">
                <span>Bypass & Skip</span>
                {myVote === 'deny_and_move_on' && (
                  <span className="text-[8px] text-[#55ff55] mc-font">[EQUIPPED]</span>
                )}
              </h4>
              <p className="text-[10px] text-[#aaa] line-clamp-2 font-sans leading-tight">
                Reject commit to safeguard existing architecture.
              </p>
            </div>
            <div className="mt-2 pt-1 border-t border-[#444] flex items-center justify-between">
              <span className="text-[8px] mc-font text-[#777]">SAFE SKIP</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!disabled) onSelectAction('deny_and_move_on');
                }}
                className={`mc-btn px-2 py-0.5 text-[8px] mc-font cursor-pointer ${
                  myVote === 'deny_and_move_on' ? 'mc-btn-green' : ''
                }`}
              >
                <span className="pointer-events-none">{myVote === 'deny_and_move_on' ? 'EQUIPPED' : 'SELECT'}</span>
              </button>
            </div>
          </div>

          {/* Slot 3: Custom Prompt (Book & Quill) */}
          <div
            onClick={() => !disabled && onSelectAction('custom_prompt')}
            className={`mc-slot ${
              myVote === 'custom_prompt' ? 'mc-slot-selected' : 'mc-slot-dark'
            } p-2.5 flex flex-col justify-between cursor-pointer transition-colors ${
              disabled ? 'opacity-50' : 'hover:border-[#666]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[8px] mc-font text-[#55ffff] bg-[#002233] px-1 border border-[#005577]">
                  SLOT 3
                </span>
                <div className="flex items-center gap-1">
                  {(votesTally['custom_prompt'] || 0) > 0 && (
                    <span className="text-[9px] mc-font px-1 bg-[#1a331a] text-[#55ff55] border border-[#2d5a2d]">
                      +{votesTally['custom_prompt']}
                    </span>
                  )}
                  <span className="text-base pointer-events-none">🪶</span>
                </div>
              </div>

              <h4 className="text-xs font-bold text-white mc-font mb-0.5 flex items-center justify-between">
                <span>Human Guidance</span>
                {myVote === 'custom_prompt' && (
                  <span className="text-[8px] text-[#55ff55] mc-font">[EQUIPPED]</span>
                )}
              </h4>

              {/* Collaborative Draft Preview */}
              {customPromptDraft?.text ? (
                <div className="bg-[#111] border border-[#005577] p-1 my-1 text-[9px] text-[#aaddff]">
                  <div className="flex items-center justify-between mb-0.5 text-[8px] text-[#55ffff] mc-font">
                    <span>BY {customPromptDraft.player_name}:</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenDraftPrompt && onOpenDraftPrompt();
                      }}
                      className="text-[#ffd700] hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <Edit3 className="w-2.5 h-2.5 pointer-events-none" />
                      <span className="pointer-events-none">EDIT</span>
                    </button>
                  </div>
                  <p className="line-clamp-2 italic font-sans">"{customPromptDraft.text}"</p>
                </div>
              ) : (
                <p className="text-[10px] text-[#aaa] line-clamp-2 font-sans leading-tight">
                  Write instructions in Book & Quill to steer agent.
                </p>
              )}
            </div>

            <div className="mt-2 pt-1 border-t border-[#444] flex items-center justify-between">
              <span className="text-[8px] mc-font text-[#777]">COLLAB</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!disabled) onSelectAction('custom_prompt');
                }}
                className={`mc-btn px-2 py-0.5 text-[8px] mc-font cursor-pointer ${
                  myVote === 'custom_prompt' ? 'mc-btn-green' : ''
                }`}
              >
                <span className="pointer-events-none">
                  {customPromptDraft?.text ? (myVote === 'custom_prompt' ? 'EQUIPPED' : 'VOTE') : 'WRITE'}
                </span>
              </button>
            </div>
          </div>

          {/* Slot 4: AI Suggestions (3 Jumbled Technical Fixes) */}
          <div
            onClick={() => !disabled && onSelectAction('suggest_change')}
            className={`mc-slot ${
              myVote === 'suggest_change' ? 'mc-slot-selected' : 'mc-slot-dark'
            } p-2.5 flex flex-col justify-between cursor-pointer transition-colors ${
              disabled ? 'opacity-50' : 'hover:border-[#666]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[8px] mc-font text-[#ffaa00] bg-[#2a1a00] px-1 border border-[#885500]">
                  SLOT 4
                </span>
                <div className="flex items-center gap-1">
                  {(votesTally['suggest_change'] || 0) > 0 && (
                    <span className="text-[9px] mc-font px-1 bg-[#1a331a] text-[#55ff55] border border-[#2d5a2d]">
                      +{votesTally['suggest_change']}
                    </span>
                  )}
                  <span className="text-base pointer-events-none">🤖</span>
                </div>
              </div>

              <h4 className="text-xs font-bold text-white mc-font mb-0.5 flex items-center justify-between">
                <span>AI Suggestions</span>
                {myVote === 'suggest_change' && (
                  <span className="text-[8px] text-[#55ff55] mc-font">[EQUIPPED]</span>
                )}
              </h4>

              {/* Selected AI Suggestion Preview */}
              {guardrailRuleDraft?.title ? (
                <div className="bg-[#111] border border-[#ffaa00] p-1 my-1 text-[9px] text-[#ffddaa]">
                  <div className="flex items-center justify-between mb-0.5 text-[8px] text-[#ffd700] mc-font">
                    <span>BY {guardrailRuleDraft.player_name}:</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenDraftRule && onOpenDraftRule();
                      }}
                      className="text-[#ffd700] hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <Edit3 className="w-2.5 h-2.5 pointer-events-none" />
                      <span className="pointer-events-none">EDIT</span>
                    </button>
                  </div>
                  <p className="line-clamp-2 font-semibold font-sans">{guardrailRuleDraft.title}</p>
                </div>
              ) : (
                <p className="text-[10px] text-[#aaa] line-clamp-2 font-sans leading-tight">
                  Review 3 AI-proposed technical fixes. Choose carefully!
                </p>
              )}
            </div>

            <div className="mt-2 pt-1 border-t border-[#444] flex items-center justify-between">
              <span className="text-[8px] mc-font text-[#777]">PROPOSALS</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!disabled) onSelectAction('suggest_change');
                }}
                className={`mc-btn px-2 py-0.5 text-[8px] mc-font cursor-pointer ${
                  myVote === 'suggest_change' ? 'mc-btn-green' : ''
                }`}
              >
                <span className="pointer-events-none">
                  {guardrailRuleDraft?.title ? (myVote === 'suggest_change' ? 'EQUIPPED' : 'VOTE') : 'REVIEW'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Expanded Single-Screen Side-by-Side Quest Inspection Modal */}
      {isExpandedModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
          <div className="mc-panel-dark max-w-6xl w-full h-[90vh] max-h-[92vh] flex flex-col p-3.5 sm:p-5 shadow-2xl border-2 border-[#ffd700] overflow-hidden">
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b-2 border-[#444] shrink-0">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 text-[10px] mc-font uppercase tracking-wider bg-[#3a0000] text-[#ff5555] border-2 border-[#aa0000]">
                  QUEST WAVE {stage.id}: {stage.phase_name}
                </span>
                <span className="text-xs text-[#ffd700] mc-font font-bold hidden sm:inline">
                  ARCHITECTURAL INSPECTION CONSOLE
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsExpandedModalOpen(false)}
                className="mc-btn px-2.5 py-1 text-xs mc-font text-white hover:text-[#ff5555] cursor-pointer flex items-center gap-1.5"
                title="Close (ESC)"
              >
                <X className="w-3.5 h-3.5" />
                <span>ESC</span>
              </button>
            </div>

            {/* Single-Screen 2-Column Split: Zero Outer Scrolling! */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 flex-1 min-h-0 overflow-hidden">
              {/* Left Column (5 cols): Story Narrative, Proposal & Orange Telemetry */}
              <div className="lg:col-span-5 flex flex-col justify-between gap-2.5 min-h-0 overflow-y-auto pr-1">
                <div className="space-y-1.5">
                  <h3 className="text-sm sm:text-base font-bold text-[#ffff55] mc-font leading-snug">
                    {stage.title}
                  </h3>
                  <p className="text-xs text-[#ddd] leading-relaxed font-sans select-text">
                    {stage.story}
                  </p>
                </div>

                {/* Proposal Banner */}
                <div className="bg-[#181818] border-2 border-[#444] p-2.5 flex flex-col gap-1.5">
                  <div className="flex items-start gap-2">
                    <GitPullRequest className="w-3.5 h-3.5 text-[#ffd700] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[9px] font-bold text-[#ffd700] uppercase mc-font block">
                        AI GOLEM PROPOSAL:
                      </span>
                      <span className="text-[11px] text-[#eee] italic font-sans leading-tight block">
                        "{stage.ai_proposal_summary}"
                      </span>
                    </div>
                  </div>
                  <code className="text-[#55ff55] font-mono text-[10px] bg-[#101010] px-2 py-0.5 border border-[#333] self-start select-all">
                    {stage.file_name}
                  </code>
                </div>

                {/* Prominent Orange Suggestion / Telemetry Box */}
                <div className="p-3 bg-[#251505] border-2 border-[#ffaa00] shadow-lg flex-1 min-h-0 flex flex-col justify-start">
                  <div className="flex items-center gap-2 text-[#ffd700] mb-1.5 shrink-0">
                    <AlertTriangle className="w-4 h-4 text-[#ffaa00] shrink-0" />
                    <span className="text-[10px] sm:text-xs mc-font font-bold uppercase tracking-wider">
                      DETECTED ARCHITECTURE TELEMETRY
                    </span>
                  </div>
                  <div className="text-[11px] text-[#ffddaa] mc-font leading-relaxed overflow-y-auto">
                    <strong className="text-[#ffd700] block mb-1">SUSPECT PATTERN:</strong>
                    {stage.hidden_risks}
                  </div>
                </div>
              </div>

              {/* Right Column (7 cols): Full Height Code Diff Box */}
              <div className="lg:col-span-7 border-2 border-[#444] bg-[#0c0d10] flex flex-col h-full min-h-0 shadow-inner overflow-hidden">
                <div className="bg-[#1a1c22] px-3 py-1.5 border-b-2 border-[#444] flex items-center justify-between text-xs mc-font text-[#aaa] shrink-0">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-3.5 h-3.5 text-[#ffd700]" />
                    <span className="text-[10px] sm:text-xs text-white">BOOK & QUILL: git diff</span>
                  </div>
                  <span className="text-[8.5px] text-[#777]">UNIFIED VIEW</span>
                </div>
                <div className="p-2.5 font-mono text-[11px] sm:text-xs overflow-y-auto overflow-x-auto flex-1 leading-relaxed select-text bg-[#0c0d10]">
                  {diffLines.map((line, idx) => {
                    const isAdd = line.startsWith('+') && !line.startsWith('+++');
                    const isRemove = line.startsWith('-') && !line.startsWith('---');
                    const isHeader = line.startsWith('@@') || line.startsWith('---') || line.startsWith('+++');

                    let rowClass = 'text-[#ccc] py-0.5 px-2';
                    if (isAdd) rowClass = 'text-[#55ff55] bg-[#0d2a0d]/60 py-0.5 px-2 font-medium';
                    if (isRemove) rowClass = 'text-[#ff5555] bg-[#3a0d0d]/60 py-0.5 px-2 font-medium';
                    if (isHeader) rowClass = 'text-[#ffff55] font-bold py-0.5 px-2 bg-[#2a2400]/60';

                    return (
                      <div key={idx} className={`whitespace-pre ${rowClass}`}>
                        {line}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-2.5 mt-2.5 border-t-2 border-[#444] flex items-center justify-between shrink-0">
              <span className="text-[9px] text-[#888] mc-font hidden sm:inline">
                Inspect proposal & telemetry side-by-side with code diff.
              </span>
              <button
                type="button"
                onClick={() => setIsExpandedModalOpen(false)}
                className="mc-btn mc-btn-green px-4 py-1.5 text-xs mc-font text-white flex items-center gap-2 cursor-pointer shadow-md ml-auto"
              >
                <span>RETURN TO COCKPIT</span>
                <span className="text-[9px] opacity-75">[ESC]</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
