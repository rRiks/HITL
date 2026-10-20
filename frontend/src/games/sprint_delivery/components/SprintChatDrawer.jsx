import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, CheckCircle2, X, Sparkles, AlertCircle, Users } from 'lucide-react';
import { getPlayerName } from '../../../services/api';

export default function SprintChatDrawer({
  isOpen,
  onClose,
  messages = [],
  isTyping = false,
  isHardened = false,
  onSendMessage,
  onCommitCode,
  stageTitle = 'Current Stage',
}) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);
  const localPlayerName = getPlayerName() || 'Engineer';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || isTyping) return;
    const text = inputText;
    setInputText('');
    onSendMessage(text);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 select-none animate-fadeIn">
      <div className="w-full max-w-2xl flex flex-col max-h-[90vh] h-[650px] shadow-2xl rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-primary)] overflow-hidden relative">
        {/* Drawer Header */}
        <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between gap-3 bg-[var(--bg-panel)] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/35 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] font-theme-heading">
                  AI COPILOT STEERING CONVERSATION
                </h3>
                {isHardened ? (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-400 text-[10px] font-mono font-bold animate-pulse">
                    HARDENED (5% RISK)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-[10px] font-mono font-bold flex items-center gap-1">
                    <Users className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    <span>TEAM CHAT</span>
                  </span>
                )}
              </div>
              <span className="text-xs text-[var(--text-secondary)] font-medium">
                Refining: {stageTitle} (All teammates' prompts & diffs sync live)
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer p-1 rounded-lg transition-colors"
            title="Close Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[var(--bg-app)]">
          {messages.length === 0 && (
            <div className="p-8 text-center text-[var(--text-muted)] space-y-2 my-auto">
              <Bot className="w-10 h-10 text-amber-600 dark:text-amber-400 mx-auto opacity-70" />
              <p className="text-sm font-bold text-[var(--text-primary)]">
                AI Copilot ready. Any teammate at the table can steer technical implementation!
              </p>
              <p className="text-xs font-mono text-[var(--text-secondary)] max-w-md mx-auto">
                Example: "Bulkify using a Map outside the loop" or "Add stripInaccessible FLS security check".
              </p>
            </div>
          )}

          {messages.map((msg, idx) => {
            const isPlayer = msg.sender === 'player';
            const isMe = isPlayer && (msg.player_name === localPlayerName);
            const isTeammate = isPlayer && !isMe;

            return (
              <div
                key={idx}
                className={`flex gap-2.5 ${isPlayer ? 'justify-end' : 'justify-start'}`}
              >
                {!isPlayer && (
                  <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/35 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] p-3.5 text-xs sm:text-[13px] leading-relaxed font-sans shadow-xs ${
                    isMe
                      ? 'bg-sky-500/15 border border-sky-500/30 text-[var(--text-primary)] rounded-2xl rounded-tr-sm'
                      : isTeammate
                      ? 'bg-emerald-500/15 border border-emerald-500/30 text-[var(--text-primary)] rounded-2xl rounded-tr-sm'
                      : 'bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-2xl rounded-tl-sm'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <span className="text-[11px] font-mono font-bold">
                      {isMe ? (
                        <span className="text-sky-700 dark:text-sky-300">YOU ({msg.player_name || localPlayerName})</span>
                      ) : isTeammate ? (
                        <span className="text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>TEAMMATE: {msg.player_name || 'Teammate'}</span>
                        </span>
                      ) : (
                        <span className="text-amber-700 dark:text-amber-400 flex items-center gap-1 font-bold">
                          <Bot className="w-3.5 h-3.5" />
                          <span>AI COPILOT</span>
                        </span>
                      )}
                    </span>
                    {msg.risk_level && (
                      <span
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                          msg.risk_level === 'hardened'
                            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-800 dark:text-emerald-400'
                            : msg.risk_level === 'low'
                            ? 'bg-sky-500/15 border-sky-500/30 text-sky-800 dark:text-sky-400'
                            : 'bg-amber-500/15 border-amber-500/30 text-amber-800 dark:text-amber-300'
                        }`}
                      >
                        {msg.risk_level.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <p className="whitespace-pre-wrap font-medium">{msg.text}</p>
                </div>

                {isPlayer && (
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-1 border ${
                    isMe
                      ? 'bg-sky-500/15 border-sky-500/35 text-sky-600 dark:text-sky-400'
                      : 'bg-emerald-500/15 border-emerald-500/35 text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {isMe ? <User className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                  </div>
                )}
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-mono w-fit animate-pulse">
              <Sparkles className="w-4 h-4 animate-spin text-amber-600 dark:text-amber-400" />
              <span>Copilot is refactoring code diff & evaluating risk...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 border-t border-[var(--border-subtle)] bg-[var(--bg-panel)] flex gap-2 shrink-0">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isTyping}
            placeholder="Type architectural steer (e.g. 'Use Database.Batchable with 200 record chunking')..."
            className="flex-1 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 px-3.5 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none rounded-xl font-sans"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="px-4 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white rounded-xl flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Steer</span>
          </button>
        </form>

        {/* Footer Actions */}
        <div className="p-3 bg-[var(--bg-card)] border-t border-[var(--border-subtle)] flex items-center justify-between gap-3 shrink-0">
          <span className="text-xs text-[var(--text-muted)] font-mono font-medium">
            {messages.length > 0 ? `${messages.length} messages in conversation` : 'No prompt submitted yet'}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              Continue Review
            </button>
            <button
              type="button"
              onClick={onCommitCode}
              disabled={messages.length === 0}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Commit & Deploy Solution ➔</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
