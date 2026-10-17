import React from 'react';
import {
  Users,
  Check,
  Edit3,
  AlertOctagon,
  CheckCircle2,
  ArrowRight,
  Rotate3d,
  Zap,
} from 'lucide-react';

function StageDecisionConsole({
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
  onOpenDraftPrompt,
  onOpenDraftRule,
  isTimerPaused = false,
}) {
  const totalActivePlayers = Math.max(activePlayers.length, 1);
  const totalVotesCast = Object.values(votesTally).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col gap-2 select-none">
      {/* 1. Timer Paused Banner (If World Time is Frozen by Game Master) */}
      {isTimerPaused && (
        <div className="bg-[#2a1a00] border-2 border-[#ffaa00] text-[#ffddaa] px-2.5 py-1.5 flex items-center justify-between text-[9px] mc-font animate-pulse shadow-md">
          <span className="flex items-center gap-1.5 truncate">
            <span className="text-sm leading-none">⏸</span>
            <span className="truncate"><strong>TIME FROZEN</strong> — Voting is paused.</span>
          </span>
          <span className="text-[#ffd700] uppercase text-[8px] bg-[#3a2500] px-1.5 py-0.5 border border-[#885500] shrink-0">
            PAUSED
          </span>
        </div>
      )}

      {/* 2. Live Multiplayer Roster Bar (Shown only during active voting) */}
      {!stageActionTaken && (
        <div className="bg-[#1b1b1b] border-2 border-[#333] px-2.5 py-1.5 flex flex-wrap items-center justify-between gap-1.5 shadow-xs">
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-[#ffd700] shrink-0" />
            <span className="text-[9px] mc-font text-[#e0e0e0] uppercase tracking-wider">
              CONSENSUS:
            </span>
            <span className="text-[9px] mc-font px-1.5 py-0.2 bg-[#2d241e] text-[#55ff55] border border-[#553311]">
              {totalVotesCast} / {totalActivePlayers}
            </span>
            <span className="text-[8px] mc-font text-[#888] hidden sm:inline">
              (LOCKS AT 100%)
            </span>
            {totalVotesCast > 0 && onCommitDecision && !isTimerPaused && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onCommitDecision();
                }}
                className="mc-btn mc-btn-green px-2 py-0.5 text-[8px] mc-font text-white flex items-center gap-1 cursor-pointer ml-1"
                title="Lock in current votes and resolve immediately"
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
      )}

      {/* 3. Stage Decision Resolution Banner (Replaces consensus bar when decision is taken) */}
      {stageActionTaken && lastActionResult && (
        <div
          className={`mc-panel-dark p-2 sm:p-2.5 border-2 shadow-lg animate-fadeIn flex flex-col gap-2 ${
            lastActionResult.outcome === 'failure'
              ? 'border-[#ff4444] bg-[#220a0a]'
              : 'border-[#22c55e] bg-[#0a1e0a]'
          }`}
        >
          <div className="flex items-start gap-2.5 min-w-0">
            <div
              className={`w-7 h-7 flex items-center justify-center border-2 shrink-0 mt-0.5 ${
                lastActionResult.outcome === 'failure'
                  ? 'bg-[#3a0000] border-[#ff3333] text-[#ff5555]'
                  : 'bg-[#002b00] border-[#55ff55] text-[#55ff55]'
              }`}
            >
              {lastActionResult.outcome === 'failure' ? (
                <AlertOctagon className="w-4 h-4" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[9px] mc-font uppercase text-[#ffd700] font-bold">
                  {lastActionResult.action_label}
                </span>
                <span
                  className={`text-[8px] mc-font px-1.5 py-0.2 border ${
                    lastActionResult.outcome === 'failure'
                      ? 'bg-[#3a0000] text-[#ff5555] border-[#ff3333]'
                      : 'bg-[#002b00] text-[#55ff55] border-[#55ff55]'
                  }`}
                >
                  {lastActionResult.outcome === 'failure' ? 'INCIDENT' : 'CLEARED'}
                </span>
                <span className="text-[8px] mc-font text-[#aaa]">
                  HP: {lastActionResult.health_delta >= 0 ? `+${lastActionResult.health_delta}%` : `${lastActionResult.health_delta}%`} (Now: {lastActionResult.new_health}%)
                </span>
              </div>
              <p className="text-[10px] text-[#ccc] line-clamp-2 font-sans mt-0.5 leading-tight">
                {lastActionResult.feedback_message}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-[#444]/40">
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
                    className="mc-btn px-3 py-1 text-[9px] mc-font text-white flex items-center gap-1 cursor-pointer font-bold shadow-md bg-[#4a0000] border-2 border-[#ff3333] hover:bg-[#660000] animate-pulse"
                  >
                    <AlertOctagon className="w-3.5 h-3.5 text-[#ff5555]" />
                    <span>SEE COLLAPSE ➔</span>
                  </button>
                );
              }
              if (onProceedNextStage) {
                return (
                  <button
                    type="button"
                    onClick={onProceedNextStage}
                    disabled={isTimerPaused}
                    className={`mc-btn ${
                      isTimerPaused
                        ? 'opacity-60 cursor-not-allowed bg-[#444] border-[#666] text-[#aaa]'
                        : 'mc-btn-green cursor-pointer text-white'
                    } px-3.5 py-1 text-[9px] mc-font flex items-center gap-1 font-bold shadow-md`}
                  >
                    <span>{isTimerPaused ? '⏸ PAUSED' : 'PROCEED TO NEXT STAGE'}</span>
                    {!isTimerPaused && <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                );
              }
              return null;
            })()}
          </div>
        </div>
      )}

      {/* 4. Action Cards in a 2x2 Grid */}
      <div className={`grid grid-cols-2 gap-2 ${stageActionTaken || isTimerPaused ? 'opacity-60' : ''}`}>
        {/* Slot 1: Accept as-is */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            if (!disabled && !isTimerPaused) onSelectAction('accept_as_is');
          }}
          className={`mc-slot ${
            myVote === 'accept_as_is' ? 'mc-slot-selected' : 'mc-slot-dark'
          } p-2 flex flex-col justify-between ${
            disabled || isTimerPaused ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:border-[#666]'
          } transition-colors select-none`}
        >
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[8px] mc-font text-[#ffd700] bg-[#332200] px-1 border border-[#664400]">
                SLOT 1
              </span>
              <div className="flex items-center gap-1">
                {(votesTally['accept_as_is'] || 0) > 0 && (
                  <span className="text-[8.5px] mc-font px-1 bg-[#1a331a] text-[#55ff55] border border-[#2d5a2d]">
                    +{votesTally['accept_as_is']}
                  </span>
                )}
                <span className="text-sm">🍏</span>
              </div>
            </div>
            <h4 className="text-[11px] font-bold text-white mc-font mb-0.5 flex items-center justify-between">
              <span>Accept as-is</span>
              {myVote === 'accept_as_is' && (
                <span className="text-[7.5px] text-[#55ff55] mc-font">[VOTED]</span>
              )}
            </h4>
            <p className="text-[9.5px] text-[#aaa] line-clamp-1 font-sans leading-tight">
              Rapid merge, zero review. High risk!
            </p>
          </div>
          <div className="mt-1.5 pt-1 border-t border-[#444] flex items-center justify-between">
            <span className="text-[7.5px] mc-font text-[#777]">RAW SPEED</span>
            <div
              className={`mc-btn px-2 py-0.5 text-[8px] mc-font pointer-events-none ${
                disabled || isTimerPaused ? 'opacity-60' : ''
              } ${
                myVote === 'accept_as_is' ? 'mc-btn-green' : ''
              }`}
            >
              <span>{myVote === 'accept_as_is' ? 'EQUIPPED' : 'SELECT'}</span>
            </div>
          </div>
        </div>

        {/* Slot 2: Bypass & Skip */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            if (!disabled && !isTimerPaused) onSelectAction('deny_and_move_on');
          }}
          className={`mc-slot ${
            myVote === 'deny_and_move_on' ? 'mc-slot-selected' : 'mc-slot-dark'
          } p-2 flex flex-col justify-between ${
            disabled || isTimerPaused ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:border-[#666]'
          } transition-colors select-none`}
        >
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[8px] mc-font text-[#aaa] bg-[#222] px-1 border border-[#444]">
                SLOT 2
              </span>
              <div className="flex items-center gap-1">
                {(votesTally['deny_and_move_on'] || 0) > 0 && (
                  <span className="text-[8.5px] mc-font px-1 bg-[#1a331a] text-[#55ff55] border border-[#2d5a2d]">
                    +{votesTally['deny_and_move_on']}
                  </span>
                )}
                <span className="text-sm">🛡️</span>
              </div>
            </div>
            <h4 className="text-[11px] font-bold text-white mc-font mb-0.5 flex items-center justify-between">
              <span>Bypass & Skip</span>
              {myVote === 'deny_and_move_on' && (
                <span className="text-[7.5px] text-[#55ff55] mc-font">[VOTED]</span>
              )}
            </h4>
            <p className="text-[9.5px] text-[#aaa] line-clamp-1 font-sans leading-tight">
              Reject commit to safeguard health.
            </p>
          </div>
          <div className="mt-1.5 pt-1 border-t border-[#444] flex items-center justify-between">
            <span className="text-[7.5px] mc-font text-[#777]">SAFE SKIP</span>
            <div
              className={`mc-btn px-2 py-0.5 text-[8px] mc-font pointer-events-none ${
                disabled || isTimerPaused ? 'opacity-60' : ''
              } ${
                myVote === 'deny_and_move_on' ? 'mc-btn-green' : ''
              }`}
            >
              <span>{myVote === 'deny_and_move_on' ? 'EQUIPPED' : 'SELECT'}</span>
            </div>
          </div>
        </div>

        {/* Slot 3: Human Guidance (Custom Prompt) */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            if (!disabled && !isTimerPaused) onSelectAction('custom_prompt');
          }}
          className={`mc-slot ${
            myVote === 'custom_prompt' ? 'mc-slot-selected' : 'mc-slot-dark'
          } p-2 flex flex-col justify-between ${
            disabled || isTimerPaused ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:border-[#666]'
          } transition-colors select-none`}
        >
          <div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[8px] mc-font text-[#55ffff] bg-[#002233] px-1 border border-[#005577]">
                  SLOT 3
                </span>
                <div className="flex items-center gap-1">
                  {(votesTally['custom_prompt'] || 0) > 0 && (
                    <span className="text-[8.5px] mc-font px-1 bg-[#1a331a] text-[#55ff55] border border-[#2d5a2d]">
                      +{votesTally['custom_prompt']}
                    </span>
                  )}
                  <span className="text-sm">🪶</span>
                </div>
              </div>

              <h4 className="text-[11px] font-bold text-white mc-font mb-0.5 flex items-center justify-between">
                <span>Human Guidance</span>
                {myVote === 'custom_prompt' && (
                  <span className="text-[7.5px] text-[#55ff55] mc-font">[VOTED]</span>
                )}
              </h4>
            </div>

            {customPromptDraft?.text ? (
              <div className="bg-[#111] border border-[#005577] p-1 my-1 text-[8.5px] text-[#aaddff]">
                <div className="flex items-center justify-between mb-0.5 text-[7.5px] text-[#55ffff] mc-font">
                  <span>BY {customPromptDraft.player_name}:</span>
                  <button
                    type="button"
                    disabled={disabled || isTimerPaused}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!disabled && !isTimerPaused) onOpenDraftPrompt && onOpenDraftPrompt();
                    }}
                    className="text-[#ffd700] hover:underline flex items-center gap-0.5 cursor-pointer disabled:opacity-50"
                  >
                    <Edit3 className="w-2.5 h-2.5 pointer-events-none" />
                    <span>EDIT</span>
                  </button>
                </div>
                <p className="line-clamp-1 italic font-sans">"{customPromptDraft.text}"</p>
              </div>
            ) : (
              <p className="text-[9.5px] text-[#aaa] line-clamp-1 font-sans leading-tight">
                Draft steering prompt in Book & Quill.
              </p>
            )}
          </div>

          <div className="mt-1.5 pt-1 border-t border-[#444] flex items-center justify-between">
            <span className="text-[7.5px] mc-font text-[#777]">COLLAB</span>
            <div
              className={`mc-btn px-2 py-0.5 text-[8px] mc-font pointer-events-none ${
                disabled || isTimerPaused ? 'opacity-60' : ''
              } ${
                myVote === 'custom_prompt' ? 'mc-btn-green' : ''
              }`}
            >
              <span>
                {customPromptDraft?.text ? (myVote === 'custom_prompt' ? 'EQUIPPED' : 'VOTE') : 'WRITE'}
              </span>
            </div>
          </div>
        </div>

        {/* Slot 4: AI Suggestions */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            if (!disabled && !isTimerPaused) onSelectAction('suggest_change');
          }}
          className={`mc-slot ${
            myVote === 'suggest_change' ? 'mc-slot-selected' : 'mc-slot-dark'
          } p-2 flex flex-col justify-between ${
            disabled || isTimerPaused ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:border-[#666]'
          } transition-colors select-none`}
        >
          <div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[8px] mc-font text-[#ffaa00] bg-[#2a1a00] px-1 border border-[#885500]">
                  SLOT 4
                </span>
                <div className="flex items-center gap-1">
                  {(votesTally['suggest_change'] || 0) > 0 && (
                    <span className="text-[8.5px] mc-font px-1 bg-[#1a331a] text-[#55ff55] border border-[#2d5a2d]">
                      +{votesTally['suggest_change']}
                    </span>
                  )}
                  <span className="text-sm">🤖</span>
                </div>
              </div>

              <h4 className="text-[11px] font-bold text-white mc-font mb-0.5 flex items-center justify-between">
                <span>AI Suggestions</span>
                {myVote === 'suggest_change' && (
                  <span className="text-[7.5px] text-[#55ff55] mc-font">[VOTED]</span>
                )}
              </h4>
            </div>

            {guardrailRuleDraft?.title ? (
              <div className="bg-[#111] border border-[#ffaa00] p-1 my-1 text-[8.5px] text-[#ffddaa]">
                <div className="flex items-center justify-between mb-0.5 text-[7.5px] text-[#ffd700] mc-font">
                  <span>BY {guardrailRuleDraft.player_name}:</span>
                  <button
                    type="button"
                    disabled={disabled || isTimerPaused}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!disabled && !isTimerPaused) onOpenDraftRule && onOpenDraftRule();
                    }}
                    className="text-[#ffd700] hover:underline flex items-center gap-0.5 cursor-pointer disabled:opacity-50"
                  >
                    <Edit3 className="w-2.5 h-2.5 pointer-events-none" />
                    <span>EDIT</span>
                  </button>
                </div>
                <p className="line-clamp-1 font-semibold font-sans">{guardrailRuleDraft.title}</p>
              </div>
            ) : (
              <p className="text-[9.5px] text-[#aaa] line-clamp-1 font-sans leading-tight">
                Review 3 AI-proposed technical fixes.
              </p>
            )}
          </div>

          <div className="mt-1.5 pt-1 border-t border-[#444] flex items-center justify-between">
            <span className="text-[7.5px] mc-font text-[#777]">PROPOSALS</span>
            <div
              className={`mc-btn px-2 py-0.5 text-[8px] mc-font pointer-events-none ${
                disabled || isTimerPaused ? 'opacity-60' : ''
              } ${
                myVote === 'suggest_change' ? 'mc-btn-green' : ''
              }`}
            >
              <span>
                {guardrailRuleDraft?.title ? (myVote === 'suggest_change' ? 'EQUIPPED' : 'VOTE') : 'REVIEW'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(StageDecisionConsole);
