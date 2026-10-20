import React, { useEffect, useMemo } from 'react';
import {
  Users,
  Check,
  Edit3,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { getPlayerName, getPlayerId } from '../services/api';

const DEFAULT_ACTIONS = [
  {
    id: 'accept_as_is',
    slot: 1,
    title: 'Accept as-is',
    desc: 'Rapid merge, zero review. High risk!',
    badge: 'RAW SPEED',
    emoji: '🍏',
    themeColor: 'rose',
  },
  {
    id: 'deny_and_move_on',
    slot: 2,
    title: 'Bypass & Skip',
    desc: 'Reject commit to safeguard health.',
    badge: 'SAFE SKIP',
    emoji: '🛡️',
    themeColor: 'sky',
  },
  {
    id: 'custom_prompt',
    slot: 3,
    title: 'Human Guidance',
    desc: 'Draft steering prompt in Book & Quill.',
    badge: 'COLLAB',
    emoji: '🪶',
    themeColor: 'emerald',
  },
  {
    id: 'suggest_change',
    slot: 4,
    title: 'AI Suggestions',
    desc: 'Review 3 AI-proposed technical fixes.',
    badge: 'PROPOSALS',
    emoji: '🤖',
    themeColor: 'indigo',
  },
];

const THEME_STYLES = {
  rose: {
    active: 'border-rose-500/60 bg-rose-500/10 ring-1 ring-rose-500/40',
    hover: 'border-[var(--border-subtle)] hover:border-rose-500/50 hover:bg-rose-500/10',
    headerHover: 'group-hover:text-rose-700 dark:group-hover:text-rose-300 group-hover:border-rose-500/30',
    badgeText: 'text-rose-700 dark:text-rose-400',
    arrowHover: 'group-hover:text-rose-600',
  },
  sky: {
    active: 'border-sky-500/60 bg-sky-500/10 ring-1 ring-sky-500/40',
    hover: 'border-[var(--border-subtle)] hover:border-sky-500/50 hover:bg-sky-500/10',
    headerHover: 'group-hover:text-sky-700 dark:group-hover:text-sky-300 group-hover:border-sky-500/30',
    badgeText: 'text-sky-700 dark:text-sky-400',
    arrowHover: 'group-hover:text-sky-600',
  },
  emerald: {
    active: 'border-emerald-500/60 bg-emerald-500/10 ring-1 ring-emerald-500/40',
    hover: 'border-[var(--border-subtle)] hover:border-emerald-500/50 hover:bg-emerald-500/10',
    headerHover: 'group-hover:text-emerald-700 dark:group-hover:text-emerald-300 group-hover:border-emerald-500/30',
    badgeText: 'text-emerald-700 dark:text-emerald-400',
    arrowHover: 'group-hover:text-emerald-600',
  },
  indigo: {
    active: 'border-indigo-500/60 bg-indigo-500/10 ring-1 ring-indigo-500/40',
    hover: 'border-[var(--border-subtle)] hover:border-indigo-500/50 hover:bg-indigo-500/10',
    headerHover: 'group-hover:text-indigo-700 dark:group-hover:text-indigo-300 group-hover:border-indigo-500/30',
    badgeText: 'text-indigo-700 dark:text-indigo-400',
    arrowHover: 'group-hover:text-indigo-600',
  },
  amber: {
    active: 'border-amber-500/60 bg-amber-500/10 ring-1 ring-amber-500/40',
    hover: 'border-[var(--border-subtle)] hover:border-amber-500/50 hover:bg-amber-500/10',
    headerHover: 'group-hover:text-amber-700 dark:group-hover:text-amber-300 group-hover:border-amber-500/30',
    badgeText: 'text-amber-700 dark:text-amber-400',
    arrowHover: 'group-hover:text-amber-600',
  },
};

const ICON_EMOJI_MAP = {
  Zap: '⚡',
  Wrench: '🛠️',
  MessageSquareCode: '💬',
  ShieldCheck: '🛡️',
  deny_and_move_on: '🛡️',
  custom_prompt: '🪶',
  suggest_change: '🤖',
};

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
  actionsConfig = null,
  onSlapVote = null,
}) {
  const resolvedActions = useMemo(() => {
    if (Array.isArray(actionsConfig) && actionsConfig.length >= 4) {
      return actionsConfig.slice(0, 4);
    }
    return DEFAULT_ACTIONS;
  }, [actionsConfig]);

  const actionSlotMap = useMemo(() => {
    const map = {};
    resolvedActions.forEach((act, idx) => {
      map[act.id] = `[${idx + 1}]`;
    });
    return map;
  }, [resolvedActions]);

  const totalActivePlayers = Math.max(activePlayers.length, 1);
  const totalVotesCast = Object.values(votesTally).reduce((a, b) => a + b, 0);
  const consensusPct = Math.min(100, Math.round((totalVotesCast / totalActivePlayers) * 100));

  const localPlayerName = getPlayerName() || 'Riks';
  const localPlayerId = getPlayerId?.();

  // If activePlayers is provided, use it; otherwise fallback to the current local player
  const displayPlayers = activePlayers.length > 0
    ? activePlayers
    : [
        {
          player_id: localPlayerId || 'local-me',
          player_name: localPlayerName,
          has_voted: Boolean(myVote),
          voted_action: myVote,
        },
      ];

  // Keyboard Accessibility: Bind keys 1, 2, 3, 4 to Slot 1-4 actions
  useEffect(() => {
    const handleKeyDown = (e) => {
      const target = e.target;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (disabled || isTimerPaused || stageActionTaken) return;

      if (e.key === '1' && resolvedActions[0]) {
        e.preventDefault();
        onSelectAction(resolvedActions[0].id);
      } else if (e.key === '2' && resolvedActions[1]) {
        e.preventDefault();
        onSelectAction(resolvedActions[1].id);
      } else if (e.key === '3' && resolvedActions[2]) {
        e.preventDefault();
        onSelectAction(resolvedActions[2].id);
      } else if (e.key === '4' && resolvedActions[3]) {
        e.preventDefault();
        onSelectAction(resolvedActions[3].id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled, isTimerPaused, stageActionTaken, onSelectAction, resolvedActions]);

  return (
    <div className="flex flex-col gap-2.5 select-none">
      {/* 1. Timer Paused Banner */}
      {isTimerPaused && (
        <div className="bg-amber-950/40 border border-amber-500/40 text-amber-200 px-3 py-1.5 rounded-lg flex items-center justify-between text-xs animate-pulse shadow-md">
          <span className="flex items-center gap-2 truncate">
            <span className="text-sm leading-none">⏸</span>
            <span className="truncate"><strong>TIME FROZEN</strong> — Voting is currently paused by Game Master.</span>
          </span>
          <span className="text-[10px] font-mono text-amber-400 uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 shrink-0">
            PAUSED
          </span>
        </div>
      )}

      {/* 2. Dedicated Full-Width Quorum Bar & Active Player Team Roster */}
      <div className="w-full bg-[var(--bg-panel)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-xl px-3 py-2 [@media(min-height:860px)]:px-4 [@media(min-height:860px)]:py-3 shadow-sm flex flex-col gap-1.5 [@media(min-height:860px)]:gap-2.5 shrink-0">
        {/* Row 1: Consensus Metric, Fraction Badge, Progress Bar, and Resolve Action */}
        <div className="flex items-center justify-between gap-2.5 flex-wrap">
          {/* Left Cluster */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
              <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-[11px] xl:text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                CONSENSUS
              </span>
            </div>

            {/* Dynamic Fraction Badge */}
            <div className="flex items-center gap-1.5 font-mono text-xs font-bold px-2 py-0.5 [@media(min-height:860px)]:px-2.5 [@media(min-height:860px)]:py-1 rounded-md bg-emerald-500/15 border border-emerald-500/35 text-emerald-800 dark:text-emerald-300">
              <span>{totalVotesCast}/{totalActivePlayers}</span>
              <span className="text-[10px] xl:text-[11px] opacity-80 font-semibold">({consensusPct}%)</span>
            </div>

            {/* Dynamic Status Subtext */}
            {totalVotesCast === 0 ? (
              <span className="text-[11px] xl:text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider hidden sm:inline">
                (Awaiting Votes)
              </span>
            ) : totalVotesCast >= totalActivePlayers ? (
              <span className="text-[11px] xl:text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider hidden sm:inline flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-ping inline-block" />
                (All Votes Cast • Ready)
              </span>
            ) : (
              <span className="text-[11px] xl:text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider hidden sm:inline">
                ({totalVotesCast}/{totalActivePlayers} Voted)
              </span>
            )}

            {/* Subtle Inline Progress Bar */}
            <div className="w-16 sm:w-24 h-1.5 [@media(min-height:860px)]:h-2 bg-[var(--bg-elevated)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  totalVotesCast >= totalActivePlayers ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-amber-500 dark:bg-amber-400'
                }`}
                style={{ width: `${consensusPct}%` }}
              />
            </div>
          </div>

          {/* Right Action: Resolve Now Button (APPEARS AS SOON AS AT LEAST 1 VOTE IS CAST) */}
          {!stageActionTaken && totalVotesCast >= 1 && onCommitDecision && !isTimerPaused && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCommitDecision();
              }}
              className={`px-3 py-1 [@media(min-height:860px)]:px-3.5 [@media(min-height:860px)]:py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer transition-all shadow-md ml-auto shrink-0 ${
                totalVotesCast >= totalActivePlayers
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/25 ring-2 ring-emerald-400/50 animate-pulse'
                  : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-800 dark:text-emerald-300 border border-emerald-500/40'
              }`}
              title={
                totalVotesCast >= totalActivePlayers
                  ? 'All players voted! Click to submit decision immediately, or wait for timer'
                  : `Submit decision now with ${totalVotesCast} of ${totalActivePlayers} votes`
              }
            >
              <Zap className={`w-3 h-3 ${totalVotesCast >= totalActivePlayers ? 'text-white fill-current' : 'text-amber-500'}`} />
              <span>RESOLVE NOW</span>
            </button>
          )}
        </div>

        {/* Row 2: Active Team Roster Presence Chips */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1.5 border-t border-[var(--border-subtle)]">
          <span className="text-[11px] xl:text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mr-1 shrink-0">
            Active Team:
          </span>
          {displayPlayers.map((player) => {
            const isMe = (player.player_id && player.player_id === localPlayerId) || player.player_name === localPlayerName;
            const hasVoted = player.has_voted || (isMe && Boolean(myVote));
            const votedAction = player.voted_action || (isMe ? myVote : null);
            const slotBadge = votedAction ? actionSlotMap[votedAction] : null;
            const isBlamed = (player.incident_blame_count || 0) > 0;
            const roleIcons = { architect: '🧠', intern: '🔨', sre: '🛡️' };
            const roleIcon = roleIcons[player.role] || '🧠';

            return (
              <div
                key={player.player_id || player.player_name}
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] xl:text-xs font-semibold border transition-all ${
                  hasVoted
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-800 dark:text-emerald-300'
                    : 'bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--text-secondary)]'
                }`}
              >
                <span title={`Role: ${player.role || 'architect'}`} className="text-[10px] leading-none select-none">
                  {roleIcon}
                </span>
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    hasVoted ? 'bg-emerald-600 dark:bg-emerald-400' : 'bg-amber-500 animate-pulse'
                  }`}
                />
                <span className="truncate max-w-[110px]">{player.player_name}</span>
                {isBlamed && (
                  <span title={`On-Call Probation (Blamed for ${player.incident_blame_count} outages)`} className="text-[10px]">
                    🤡
                  </span>
                )}
                {hasVoted ? (
                  <div className="flex items-center gap-1">
                    {slotBadge ? (
                      <span className="font-mono text-[10px] xl:text-[11px] font-bold text-emerald-800 dark:text-emerald-400 bg-emerald-500/15 px-1 py-0.2 rounded border border-emerald-500/30">
                        {slotBadge}
                      </span>
                    ) : (
                      <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0 font-bold" />
                    )}
                    {!isMe && onSlapVote && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSlapVote(player.player_id, player.player_name);
                        }}
                        title={`Slap ${player.player_name}'s vote! 👋`}
                        className="hover:scale-135 transition-transform text-xs cursor-pointer leading-none ml-0.5 p-0.5"
                      >
                        👋
                      </button>
                    )}
                  </div>
                ) : (
                  <span className="text-[10px] text-[var(--text-muted)] font-sans italic">deciding</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. 2x2 Decision Engine Grid */}
      <div className={`grid grid-cols-2 gap-2 [@media(min-height:860px)]:gap-3 shrink-0 ${stageActionTaken || isTimerPaused ? 'opacity-60 pointer-events-none' : ''}`}>
        {resolvedActions.map((action, index) => {
          const slotNum = index + 1;
          const isSelected = myVote === action.id;
          const voteCount = votesTally[action.id] || 0;
          const theme = THEME_STYLES[action.themeColor] || THEME_STYLES.rose;
          const emojiIcon = action.emoji || ICON_EMOJI_MAP[action.icon] || ICON_EMOJI_MAP[action.id] || '⚡';

          return (
            <button
              key={action.id}
              type="button"
              disabled={disabled || isTimerPaused}
              onClick={() => onSelectAction(action.id)}
              className={`group relative text-left transition-all duration-150 hover:-translate-y-0.5 p-2.5 [@media(min-height:860px)]:p-3 rounded-xl border bg-[var(--bg-card)] shadow-sm flex flex-col justify-between cursor-pointer ${
                isSelected ? theme.active : theme.hover
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-theme-badge text-[10px] xl:text-[11px] font-bold px-2 py-0.5 rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] ${theme.headerHover} transition-colors`}>
                    [{slotNum}]
                  </span>
                  <div className="flex items-center gap-1.5">
                    {voteCount > 0 && (
                      <span className="text-[11px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                        +{voteCount}
                      </span>
                    )}
                    <span className="text-sm xl:text-base">{emojiIcon}</span>
                  </div>
                </div>

                <h4 className="font-theme-heading text-[clamp(0.875rem,1.5vh,1.05rem)] font-bold text-[var(--text-primary)] mb-0.5 flex items-center justify-between leading-tight">
                  <span>{action.title}</span>
                  {isSelected && (
                    <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-bold">[VOTED]</span>
                  )}
                </h4>

                {/* Slot 3 Draft Bubble (if custom_prompt has draft) */}
                {action.id === 'custom_prompt' && customPromptDraft?.text ? (
                  <div className="bg-[var(--bg-elevated)] border border-emerald-500/30 rounded-lg p-1.5 my-1 text-xs text-emerald-800 dark:text-emerald-200">
                    <div className="flex items-center justify-between mb-0.5 text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">
                      <span className="font-mono">BY {customPromptDraft.player_name}:</span>
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!disabled && !isTimerPaused && onOpenDraftPrompt) onOpenDraftPrompt();
                        }}
                        className="text-amber-800 dark:text-amber-300 hover:underline flex items-center gap-1 cursor-pointer font-bold"
                      >
                        <Edit3 className="w-2.5 h-2.5" />
                        <span>EDIT</span>
                      </span>
                    </div>
                    <p className="line-clamp-2 text-xs leading-snug italic font-sans font-medium">"{customPromptDraft.text}"</p>
                  </div>
                ) : action.id === 'suggest_change' && guardrailRuleDraft?.title ? (
                  /* Slot 4 Rule Draft Bubble (if suggest_change has draft) */
                  <div className="bg-[var(--bg-elevated)] border border-indigo-500/30 rounded-lg p-1.5 my-1 text-xs text-indigo-800 dark:text-indigo-200">
                    <div className="flex items-center justify-between mb-0.5 text-[10px] text-indigo-700 dark:text-indigo-400 font-bold">
                      <span className="font-mono">BY {guardrailRuleDraft.player_name}:</span>
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!disabled && !isTimerPaused && onOpenDraftRule) onOpenDraftRule();
                        }}
                        className="text-amber-800 dark:text-amber-300 hover:underline flex items-center gap-1 cursor-pointer font-bold"
                      >
                        <Edit3 className="w-2.5 h-2.5" />
                        <span>EDIT</span>
                      </span>
                    </div>
                    <p className="line-clamp-2 text-xs leading-snug font-semibold font-sans">{guardrailRuleDraft.title}</p>
                  </div>
                ) : (
                  <p className="text-xs leading-snug text-[var(--text-secondary)] mt-0.5 line-clamp-2 font-sans font-medium">
                    {action.desc}
                  </p>
                )}
              </div>

              <div className="text-[10.5px] xl:text-xs font-bold tracking-wider mt-1.5 pt-1.5 border-t border-[var(--border-subtle)] flex items-center justify-between">
                <span className={`${theme.badgeText} font-bold`}>
                  {action.badge || 'ACTION'}
                </span>
                <ArrowRight className={`w-3.5 h-3.5 text-[var(--text-muted)] ${theme.arrowHover} group-hover:translate-x-0.5 transition-all`} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default React.memo(StageDecisionConsole);

