import { useState, useEffect, useCallback } from 'react';
import * as api from '../../../services/api';

/**
 * useSprintDialogue (Single Responsibility: Human-AI Copilot Dialogue)
 * Manages the multi-turn chat history, optimistic message appending,
 * typewriter streaming states, and live refactored code diff updates.
 */
export function useSprintDialogue(roomId, serverChatHistory = [], serverCodeDiff = '', onDiffUpdated) {
  const [messages, setMessages] = useState(serverChatHistory);
  const [isTyping, setIsTyping] = useState(false);
  const [activeCodeDiff, setActiveCodeDiff] = useState(serverCodeDiff);
  const [isHardened, setIsHardened] = useState(false);

  // Sync with remote server state on stage changes or polling
  useEffect(() => {
    if (!isTyping) {
      setMessages(serverChatHistory);
    }
  }, [serverChatHistory, isTyping]);

  useEffect(() => {
    setActiveCodeDiff(serverCodeDiff);
  }, [serverCodeDiff]);

  const sendSteerTurn = useCallback(async (userPrompt) => {
    if (!userPrompt || !userPrompt.trim()) return;

    const trimmed = userPrompt.trim();
    const playerName = api.getPlayerName() || 'Engineer';
    const playerId = api.getPlayerId();

    // 1. Optimistic player message
    const tempPlayerMsg = {
      sender: 'player',
      player_name: playerName,
      text: trimmed,
      timestamp: Date.now() / 1000,
    };
    setMessages((prev) => [...prev, tempPlayerMsg]);
    setIsTyping(true);

    try {
      // 2. Dispatch to backend deterministic Copilot Engine
      const res = await api.submitSprintSteerTurn(roomId, trimmed, playerId, playerName);

      // 3. Simulated realistic Copilot streaming delay (350ms)
      setTimeout(() => {
        setIsTyping(false);
        setMessages(res.chat_history || []);
        if (res.updated_code_diff) {
          setActiveCodeDiff(res.updated_code_diff);
          if (onDiffUpdated) onDiffUpdated(res.updated_code_diff);
        }
        setIsHardened(Boolean(res.is_hardened));
      }, 350);

      return res;
    } catch (err) {
      setIsTyping(false);
      console.error('Steer turn error:', err);
      throw err;
    }
  }, [roomId, onDiffUpdated]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setIsHardened(false);
    setIsTyping(false);
  }, []);

  return {
    messages,
    isTyping,
    activeCodeDiff,
    isHardened,
    sendSteerTurn,
    clearChat,
  };
}
