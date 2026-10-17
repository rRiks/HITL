import React, { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from './components/Navbar';
import StageScenarioViewer from './components/StageScenarioViewer';
import StageDecisionConsole from './components/StageDecisionConsole';
import StageArena from './components/StageArena';
import Virtual3DTower from './components/Virtual3DTower';
import WelcomeScreen from './components/WelcomeScreen';
import GameOverModal from './components/GameOverModal';
import VictoryScreen from './components/VictoryScreen';
import {
  CustomPromptModal,
  GuardrailsModal,
  ResultModal,
} from './components/ActionModals';
import CockpitFieldGuide from './components/CockpitFieldGuide';
import { useSound } from './hooks/useSound';
import * as api from './services/api';
import AdminDashboard from './admin/AdminDashboard';
import themeEngine from './themes/themeEngine';
import { ArrowRight, Rotate3d, CheckCircle2, AlertTriangle, Layers, Zap, Radio } from 'lucide-react';

function getRouteInfo() {
  if (typeof window === 'undefined') {
    return { route: 'home', roomId: null, isSpectator: false };
  }
  const pathname = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/';
  const params = new URLSearchParams(window.location.search);
  const roomParam = params.get('code') || params.get('pin') || params.get('table') || params.get('roomId') || params.get('roomid') || params.get('room');
  const isSpectator = params.get('spectate') === 'true' || params.get('spectate') === '1';

  if (pathname === '/admin') {
    return { route: 'admin', roomId: null, isSpectator: false };
  }
  if (pathname === '/guide') {
    return { route: 'guide', roomId: roomParam || api.getRoomId(), isSpectator };
  }
  if (roomParam) {
    const cleanRoom = roomParam.toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'default';
    return { route: 'game', roomId: cleanRoom, isSpectator };
  }
  if (pathname === '/home') {
    return { route: 'home', roomId: null, isSpectator: false };
  }
  return { route: 'home', roomId: null, isSpectator: false };
}

export default function App() {
  const [routeInfo, setRouteInfo] = useState(() => getRouteInfo());
  const isSpectator = Boolean(routeInfo.isSpectator);
  const [walkthroughLaunch, setWalkthroughLaunch] = useState(null);

  const [gameStarted, setGameStarted] = useState(() => {
    const info = getRouteInfo();
    if (info.route === 'game') return true;
    if (typeof window !== 'undefined') {
      const inGame = sessionStorage.getItem('hitl_in_game') === 'true';
      return inGame && info.route !== 'home';
    }
    return false;
  });
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(false);

  // Countdown timer: 120s (2 minutes)
  const [timeLeft, setTimeLeft] = useState(120);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isTimerPausedByAdmin, setIsTimerPausedByAdmin] = useState(false);
  const timeLeftRef = useRef(120);

  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  // Synchronize routing and browser back/forward buttons
  useEffect(() => {
    const pathname = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/';
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('roomId') || params.get('roomid') || params.get('room');

    // Canonical redirect on root '/' to '/home' when no room parameter is present
    if (pathname === '/' && !roomParam) {
      window.history.replaceState({}, '', '/home');
    }

    const handlePopState = () => {
      const info = getRouteInfo();
      setRouteInfo(info);
      if (info.route === 'game' && info.roomId) {
        api.setRoomId(info.roomId);
        setRoomIdState(info.roomId);
        setGameStarted(true);
      } else if (info.route === 'home' || info.route === 'admin') {
        setGameStarted(false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Modals & Extraction State
  const [promptModalOpen, setPromptModalOpen] = useState(false);
  const [guardrailsModalOpen, setGuardrailsModalOpen] = useState(false);
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [actionResult, setActionResult] = useState(null);
  const [activeBroadcast, setActiveBroadcast] = useState(null);
  const [isWatchingRemoval, setIsWatchingRemoval] = useState(false);
  const [isWatchingCollapse, setIsWatchingCollapse] = useState(false);
  const [screenShaking, setScreenShaking] = useState(false);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [myVote, setMyVote] = useState(null);
  const lastHandledStageResultRef = useRef(-1);
  const isAdvancingStageRef = useRef(false);

  // Tower 3D Ref
  const towerRef = useRef(null);

  // Sound Engine
  const sound = useSound();

  // Theme Engine Management: Supports custom themes with both dark & light options
  const [theme, setTheme] = useState(() => {
    const current = themeEngine.init();
    return current.mode;
  });

  useEffect(() => {
    const unsubscribe = themeEngine.subscribe((state) => {
      setTheme(state.mode);
    });
    return () => unsubscribe();
  }, []);

  const lastKnownAdminThemeTsRef = useRef(null);

  const toggleTheme = useCallback(() => {
    themeEngine.toggleMode();
  }, []);

  const [roomId, setRoomIdState] = useState(() => {
    const info = getRouteInfo();
    return info.roomId || api.getRoomId();
  });

  // Centralized URL Router Navigation
  const navigateTo = useCallback((destination, targetRoomId = null) => {
    if (destination === 'admin') {
      setRouteInfo({ route: 'admin', roomId: null, isSpectator: false });
      window.history.pushState({}, '', '/admin');
    } else if (destination === 'spectate') {
      const room = targetRoomId || roomId || api.getRoomId();
      api.setRoomId(room);
      setRoomIdState(room);
      sessionStorage.removeItem('hitl_in_game');
      setGameStarted(true);
      setRouteInfo({ route: 'game', roomId: room, isSpectator: true });
      window.history.pushState({}, '', `/?roomId=${room}&spectate=true`);
    } else if (destination === 'home') {
      sessionStorage.removeItem('hitl_in_game');
      setGameStarted(false);
      setIsTimerRunning(false);
      setWalkthroughLaunch(null);
      setRouteInfo({ route: 'home', roomId: null, isSpectator: false });
      window.history.pushState({}, '', '/home');
    } else if (destination === 'guide') {
      setRouteInfo((prev) => ({ route: 'guide', roomId: targetRoomId || prev.roomId || roomId, from: prev.route, isSpectator: prev.isSpectator }));
      window.history.pushState({}, '', '/guide');
    } else if (destination === 'game') {
      const room = targetRoomId || roomId || api.getRoomId();
      api.setRoomId(room);
      setRoomIdState(room);
      sessionStorage.setItem('hitl_in_game', 'true');
      setGameStarted(true);
      setRouteInfo({ route: 'game', roomId: room, isSpectator: false });
      window.history.pushState({}, '', `/?roomId=${room}`);
    }
  }, [roomId]);

  // Load initial state
  const refreshState = useCallback(async () => {
    try {
      const state = await api.fetchGameState();
      setGameState(state);
      if (typeof state?.is_timer_paused !== 'undefined') {
        setIsTimerPausedByAdmin(!!state.is_timer_paused);
      }
      // Only auto-restore in-game view if this tab was actively in an in-game session
      const inGameSession = sessionStorage.getItem('hitl_in_game') === 'true';
      if (inGameSession && (state.has_started || state.current_stage_index > 0 || state.health < 100 || state.total_jenga_pulls > 0)) {
        setGameStarted(true);
      }
      if (!isSpectator) {
        const myId = api.getPlayerId();
        const me = state.active_players?.find((p) => p.player_id === myId);
        if (me?.voted_action) setMyVote(me.voted_action);
      }
    } catch (err) {
      console.warn('Initial state fetch:', err);
    }
  }, [isSpectator]);

  useEffect(() => {
    refreshState();
  }, [refreshState]);

  // Facilitator Broadcast & Global Theme Polling
  useEffect(() => {
    const checkGlobalSettings = async () => {
      try {
        const [broadcastData, themeData] = await Promise.all([
          api.fetchBroadcast(),
          api.fetchGlobalTheme(),
        ]);
        setActiveBroadcast(broadcastData?.active ? broadcastData.message : null);

        if (themeData?.theme && themeData?.mode && themeData?.updated_at) {
          const remoteTs = Number(themeData.updated_at) || 0;

          // Initial poll on mount: establish baseline server timestamp
          if (lastKnownAdminThemeTsRef.current === null) {
            lastKnownAdminThemeTsRef.current = remoteTs;
            const hasLocalPref = typeof window !== 'undefined' && localStorage.getItem('hitl_theme_config');
            if (!hasLocalPref) {
              themeEngine.applyTheme(themeData.theme, themeData.mode, false);
            }
          } else if (remoteTs > lastKnownAdminThemeTsRef.current) {
            // Only synchronize when Game Master explicitly broadcasts a brand-new theme
            lastKnownAdminThemeTsRef.current = remoteTs;
            themeEngine.applyTheme(themeData.theme, themeData.mode, true);
          }
        }
      } catch {}
    };
    checkGlobalSettings();
    const bInterval = setInterval(checkGlobalSettings, 3000);
    return () => clearInterval(bInterval);
  }, []);

  // Live Multi-Client Room Synchronization (syncs teammates on same table)
  useEffect(() => {
    if (!gameStarted) return;
    const pollInterval = setInterval(async () => {
      try {
        if (isAdvancingStageRef.current) return;
        const remoteState = await api.fetchGameState();
        if (typeof remoteState?.is_timer_paused !== 'undefined') {
          setIsTimerPausedByAdmin(!!remoteState.is_timer_paused);
        }

        // Sync local voter status (skip if spectator)
        if (!isSpectator) {
          const myId = api.getPlayerId();
          const me = remoteState.active_players?.find((p) => p.player_id === myId);
          if (me?.voted_action) {
            setMyVote(me.voted_action);
          } else if (!remoteState.stage_action_taken && !me?.voted_action) {
            setMyVote(null);
          }
        }

        // 1. If team consensus or timeout committed a decision on this stage
        if (
          remoteState.stage_action_taken &&
          remoteState.last_action_result &&
          lastHandledStageResultRef.current !== remoteState.current_stage_index &&
          !isWatchingRemoval &&
          !isWatchingCollapse &&
          !showGameOverModal
        ) {
          lastHandledStageResultRef.current = remoteState.current_stage_index;
          setPromptModalOpen(false);
          setGuardrailsModalOpen(false);
          setIsTimerRunning(false);
          setActionResult(remoteState.last_action_result);
          setResultModalOpen(true);
          if (remoteState.last_action_result.outcome === 'failure') {
            sound.playWarning();
          } else {
            sound.playSuccess();
          }
        }

        // 2. Detect stage change or state updates
        setGameState((prev) => {
          if (!prev) return remoteState;
          if (prev.current_stage_index !== remoteState.current_stage_index) {
            lastHandledStageResultRef.current = -1;
            setResultModalOpen(false);
            setIsWatchingRemoval(false);
            setIsWatchingCollapse(false);
            setActionResult(null);
            setMyVote(null);
            setTimeLeft(120);
            setIsTimerRunning(true);
            return remoteState;
          }
          if (
            prev.health !== remoteState.health ||
            prev.total_jenga_pulls !== remoteState.total_jenga_pulls ||
            prev.technical_debt !== remoteState.technical_debt ||
            prev.stage_restart_count !== remoteState.stage_restart_count ||
            prev.is_game_over !== remoteState.is_game_over ||
            prev.is_victory !== remoteState.is_victory ||
            prev.stage_action_taken !== remoteState.stage_action_taken ||
            JSON.stringify(prev.votes_tally) !== JSON.stringify(remoteState.votes_tally) ||
            JSON.stringify(prev.custom_prompt_draft) !== JSON.stringify(remoteState.custom_prompt_draft) ||
            JSON.stringify(prev.guardrail_rule_draft) !== JSON.stringify(remoteState.guardrail_rule_draft) ||
            (prev.active_players?.length ?? 0) !== (remoteState.active_players?.length ?? 0)
          ) {
            return remoteState;
          }
          return prev;
        });
      } catch {}
    }, 2000);
    return () => clearInterval(pollInterval);
  }, [gameStarted, isWatchingRemoval, isWatchingCollapse, showGameOverModal, sound]);

  // Ambient tension synth pulse heartbeat
  useEffect(() => {
    if (!gameStarted || !isTimerRunning || gameState?.is_game_over || gameState?.is_victory) return;
    const intervalTime = timeLeft <= 30 ? 600 : 1400;
    const musicTimer = setInterval(() => {
      sound.playAmbientPulse(timeLeft <= 30);
    }, intervalTime);
    return () => clearInterval(musicTimer);
  }, [gameStarted, isTimerRunning, timeLeft, gameState, sound]);

  // Timer Tick Interval
  useEffect(() => {
    let timer = null;
    if (
      gameStarted &&
      isTimerRunning &&
      !isTimerPausedByAdmin &&
      !gameState?.is_game_over &&
      !gameState?.is_victory &&
      !resultModalOpen &&
      !isWatchingRemoval
    ) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }

          if (prev <= 31 && prev > 1) {
            sound.playUrgentTick();
          } else if (prev % 10 === 0 && prev > 30) {
            sound.playTick();
          }

          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameStarted, isTimerRunning, isTimerPausedByAdmin, gameState, resultModalOpen, isWatchingRemoval, sound]);

  // Handle Timeout
  const handleTimeoutTrigger = useCallback(async () => {
    if (
      !gameStarted ||
      !gameState ||
      gameState.is_game_over ||
      gameState.is_victory ||
      resultModalOpen ||
      isWatchingRemoval
    ) {
      return;
    }
    setIsTimerRunning(false);
    sound.playAlarm();

    try {
      setLoading(true);
      const res = await api.resolveTimeout();
      setActionResult(res);
      setResultModalOpen(true);
      await refreshState();
    } catch (err) {
      console.error('Failed timeout resolution:', err);
    } finally {
      setLoading(false);
    }
  }, [gameStarted, gameState, resultModalOpen, isWatchingRemoval, sound, refreshState]);

  useEffect(() => {
    if (timeLeft === 0 && isTimerRunning) {
      handleTimeoutTrigger();
    }
  }, [timeLeft, isTimerRunning, handleTimeoutTrigger]);

  // Democratic Action Voting Handler
  const handleSelectAction = useCallback(async (actionType) => {
    if (isSpectator || isTimerPausedByAdmin) return;
    // 1. If custom prompt clicked and no prompt draft exists yet, open prompt drawer
    if (actionType === 'custom_prompt' && !gameState?.custom_prompt_draft?.text) {
      setPromptModalOpen(true);
      return;
    }
    // 2. If suggest change clicked and no guardrail rule draft exists yet, open rule drawer
    if (actionType === 'suggest_change' && !gameState?.guardrail_rule_draft?.rule_id) {
      setGuardrailsModalOpen(true);
      return;
    }

    try {
      setLoading(true);
      const timeSpent = 120 - timeLeftRef.current;
      setMyVote(actionType);

      // Submit vote to server
      const updatedState = await api.submitVote({
        action_type: actionType,
        time_spent_seconds: timeSpent,
      });

      setGameState(updatedState);

      // Check if all active connected players have voted (instant consensus resolution)
      if (updatedState.stage_action_taken && updatedState.last_action_result) {
        lastHandledStageResultRef.current = updatedState.current_stage_index;
        setIsTimerRunning(false);
        setActionResult(updatedState.last_action_result);
        setResultModalOpen(true);
        if (updatedState.last_action_result.outcome === 'failure') {
          sound.playWarning();
        } else {
          sound.playSuccess();
        }
      } else {
        sound.playTick();
      }
    } catch (err) {
      alert(`Vote error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [gameState, sound]);

  // Keyboard Hotkeys: [1], [2], [3], [4]
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if typing in an input or modal is open
      if (
        promptModalOpen ||
        guardrailsModalOpen ||
        loading ||
        !gameStarted ||
        isWatchingCollapse ||
        gameState?.is_victory
      ) {
        return;
      }

      if (resultModalOpen) {
        if (e.key === ' ' || e.key === 'Enter') {
          if (actionResult?.is_game_over || (actionResult?.new_health !== undefined && actionResult.new_health <= 0)) {
            handleWatchCollapse();
          } else if (actionResult?.jenga_pulls > 0) {
            handleWatchRemoval();
          } else {
            handleProceedNextStage();
          }
        }
        return;
      }

      if (isWatchingRemoval) {
        if (e.key === ' ' || e.key === 'Enter') {
          handleProceedNextStage();
        }
        return;
      }

      if (e.key === '1') handleSelectAction('accept_as_is');
      if (e.key === '2') handleSelectAction('deny_and_move_on');
      if (e.key === '3') handleSelectAction('custom_prompt');
      if (e.key === '4') handleSelectAction('suggest_change');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    promptModalOpen,
    guardrailsModalOpen,
    resultModalOpen,
    isWatchingRemoval,
    loading,
    gameStarted,
    gameState,
    actionResult,
    handleSelectAction,
  ]);

  // Start / Reset Game
  const handleStartGame = async (teamName, playerCount, chosenRoomId, playerName) => {
    try {
      setLoading(true);
      let state;
      let room = chosenRoomId;
      if (!room || room === 'create') {
        state = await api.createTableGame(teamName, playerCount);
        room = state.room_code || state.room_id;
      } else {
        state = await api.startGame(teamName, playerCount, room);
      }
      setRoomIdState(room);
      api.setRoomId(room);
      if (playerName) api.setPlayerName(playerName);
      await api.joinPlayer(api.getPlayerId(), api.getPlayerName(), room);
      sessionStorage.setItem('hitl_in_game', 'true');
      setGameState(state);
      setGameStarted(true);
      setTimeLeft(120);
      setIsTimerRunning(true);
      setActionResult(null);
      setResultModalOpen(false);
      setIsWatchingRemoval(false);
      setMyVote(null);
      navigateTo('game', room);
      sound.playSuccess();
    } catch (err) {
      alert(`Backend connection error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Join already active room without resetting
  const handleJoinLiveTable = async (chosenRoomId, playerName) => {
    try {
      setLoading(true);
      const room = chosenRoomId || roomId;
      api.setRoomId(room);
      setRoomIdState(room);
      if (playerName) api.setPlayerName(playerName);
      await api.joinPlayer(api.getPlayerId(), api.getPlayerName(), room);
      const state = await api.fetchGameState(room);
      sessionStorage.setItem('hitl_in_game', 'true');
      setGameState(state);
      setGameStarted(true);
      setTimeLeft(120);
      setIsTimerRunning(true);
      navigateTo('game', room);
      sound.playSuccess();
    } catch (err) {
      alert(`Failed to join live table: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Exit back to Welcome Screen / Table Lobby
  const handleExitToLobby = () => {
    sessionStorage.removeItem('hitl_in_game');
    if (isSpectator) {
      navigateTo('admin');
    } else {
      navigateTo('home');
    }
  };

  const handleResetGame = async () => {
    if (isSpectator) return;
    try {
      const state = await api.resetGame();
      setGameState(state);
      setTimeLeft(120);
      setIsTimerRunning(true);
      setActionResult(null);
      setResultModalOpen(false);
      setIsWatchingRemoval(false);
      setIsWatchingCollapse(false);
      setShowGameOverModal(false);
      setPromptModalOpen(false);
      setGuardrailsModalOpen(false);
      setMyVote(null);
      lastHandledStageResultRef.current = -1;
      towerRef.current?.restoreTowerStructure(0);
    } catch (err) {
      console.error('Failed to reset game:', err);
    }
  };

  // Submit Custom Prompt: Drafts for team + casts vote
  const handleSubmitPrompt = async (promptText) => {
    if (isSpectator || isTimerPausedByAdmin) return;
    try {
      setLoading(true);
      setPromptModalOpen(false);
      const timeSpent = 120 - timeLeftRef.current;

      // 1. Submit collaborative draft
      await api.submitDraft({
        draft_type: 'custom_prompt',
        custom_prompt_text: promptText,
      });

      // 2. Cast vote for custom prompt
      setMyVote('custom_prompt');
      const updatedState = await api.submitVote({
        action_type: 'custom_prompt',
        time_spent_seconds: timeSpent,
      });

      setGameState(updatedState);
      if (updatedState.stage_action_taken && updatedState.last_action_result) {
        lastHandledStageResultRef.current = updatedState.current_stage_index;
        setIsTimerRunning(false);
        setActionResult(updatedState.last_action_result);
        setResultModalOpen(true);
        if (updatedState.last_action_result.outcome === 'failure') {
          sound.playWarning();
        } else {
          sound.playSuccess();
        }
      } else {
        sound.playSuccess();
      }
    } catch (err) {
      alert(`Prompt draft error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Submit Guardrail Rule: Drafts for team + casts vote
  const handleSubmitRule = async (ruleId) => {
    if (isSpectator || isTimerPausedByAdmin) return;
    try {
      setLoading(true);
      setGuardrailsModalOpen(false);
      const timeSpent = 120 - timeLeftRef.current;

      // 1. Submit collaborative draft
      await api.submitDraft({
        draft_type: 'suggest_change',
        selected_rule_id: ruleId,
        selected_suggestion_id: ruleId,
      });

      // 2. Cast vote for guardrail rule
      setMyVote('suggest_change');
      const updatedState = await api.submitVote({
        action_type: 'suggest_change',
        time_spent_seconds: timeSpent,
      });

      setGameState(updatedState);
      if (updatedState.stage_action_taken && updatedState.last_action_result) {
        lastHandledStageResultRef.current = updatedState.current_stage_index;
        setIsTimerRunning(false);
        setActionResult(updatedState.last_action_result);
        setResultModalOpen(true);
        if (updatedState.last_action_result.outcome === 'failure') {
          sound.playWarning();
        } else {
          sound.playSuccess();
        }
      } else {
        sound.playSuccess();
      }
    } catch (err) {
      alert(`Rule draft error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Watch Block Removal on Tower
  const handleWatchRemoval = () => {
    setResultModalOpen(false);
    setIsWatchingRemoval(true);

    const pulls = actionResult?.jenga_pulls || 1;
    setTimeout(() => {
      towerRef.current?.triggerExtractionSequence(pulls);
    }, 250);
  };

  // Block Land Sound & Screen Shake Effect
  const handleBlockLand = () => {
    sound.playBlockThud();
    setScreenShaking(true);
    setTimeout(() => setScreenShaking(false), 500);
  };

  // Proceed to Next Stage
  const handleProceedNextStage = useCallback(async () => {
    if (isSpectator || isTimerPausedByAdmin) return;
    if (isAdvancingStageRef.current) return;
    isAdvancingStageRef.current = true;
    setResultModalOpen(false);
    setIsWatchingRemoval(false);
    setActionResult(null);

    if (actionResult?.is_victory) {
      try {
        await refreshState();
      } finally {
        isAdvancingStageRef.current = false;
      }
      return;
    }
    try {
      setLoading(true);
      const nextState = await api.nextStage();
      lastHandledStageResultRef.current = -1;
      setGameState(nextState);
      setTimeLeft(120);
      setIsTimerRunning(true);
      setMyVote(null);
      towerRef.current?.restoreTowerStructure(nextState.total_jenga_pulls);
    } catch (err) {
      console.error('Failed to advance stage:', err);
      try {
        const fallback = await api.fetchGameState();
        setGameState(fallback);
      } catch {}
    } finally {
      setLoading(false);
      isAdvancingStageRef.current = false;
    }
  }, [actionResult, refreshState, isSpectator, isTimerPausedByAdmin]);

  // Immediate Team / Solo Decision Lock-In (Forces immediate consensus resolution)
  const handleCommitDecision = async () => {
    if (isSpectator || isTimerPausedByAdmin) return;
    try {
      setLoading(true);
      const res = await api.commitDecision();
      lastHandledStageResultRef.current = gameState?.current_stage_index ?? -1;
      setActionResult(res);
      setResultModalOpen(true);
      setIsTimerRunning(false);
      await refreshState();
      if (res.outcome === 'failure') {
        sound.playWarning();
      } else {
        sound.playSuccess();
      }
    } catch (err) {
      console.error('Commit decision error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Stress Collapse Simulation
  const handleStressCollapse = async () => {
    sound.playCrash();
    setScreenShaking(true);
    setTimeout(() => setScreenShaking(false), 800);
    try {
      const updated = await api.reportTowerToppled();
      setGameState(updated);
    } catch (err) {
      console.error(err);
    }
  };
  // Cinematic Tower Collapse Triggered AFTER player views Dice Roll & clicks See Status
  const handleWatchCollapse = useCallback(() => {
    setResultModalOpen(false);
    setIsWatchingRemoval(false);
    setIsWatchingCollapse(true);
    setShowGameOverModal(false);

    sound.playCrash();
    setScreenShaking(true);
    setTimeout(() => setScreenShaking(false), 1400);

    // 1. Trigger realistic 3D directional buckling collapse
    towerRef.current?.triggerCatastrophicCollapse();

    // 2. The camera and scene stay on the rubble pile undisturbed for 3.8 seconds
    setTimeout(() => {
      setIsWatchingCollapse(false);
      setShowGameOverModal(true);
    }, 3800);
  }, [sound]);

  // If restoring an already-collapsed session from reload without an active result modal or collapse sequence
  useEffect(() => {
    if (gameState?.is_game_over && !resultModalOpen && !isWatchingCollapse && !actionResult) {
      setShowGameOverModal(true);
      towerRef.current?.triggerCatastrophicCollapse();
    }
  }, [gameState?.is_game_over, resultModalOpen, isWatchingCollapse, actionResult]);

  const handleRetryStage = useCallback(async () => {
    if (isSpectator) return;
    try {
      setLoading(true);
      const updated = await api.retryStage();
      setGameState(updated);
      setShowGameOverModal(false);
      setIsWatchingCollapse(false);
      setIsWatchingRemoval(false);
      setResultModalOpen(false);
      setActionResult(null);
      lastHandledStageResultRef.current = -1;
      setTimeLeft(120);
      setIsTimerRunning(true);
      setMyVote(null);
      // Immediately restore and reconstruct 3D tower upright
      towerRef.current?.restoreTowerStructure(updated.total_jenga_pulls);
    } catch (err) {
      console.error('Failed to retry stage:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 0. Admin Console (/admin)
  if (routeInfo.route === 'admin') {
    return <AdminDashboard onNavigate={navigateTo} theme={theme} onToggleTheme={toggleTheme} />;
  }

  // 1. Guide Screen (/guide)
  if (routeInfo.route === 'guide') {
    const isFromAdmin = routeInfo.from === 'admin' && !walkthroughLaunch;
    return (
      <CockpitFieldGuide
        onClose={() => {
          if (isFromAdmin) {
            navigateTo('admin');
          } else if (gameStarted) {
            navigateTo('game', roomId);
          } else {
            setWalkthroughLaunch(null);
            navigateTo('home');
          }
        }}
        onGoHome={() => {
          setWalkthroughLaunch(null);
          navigateTo('home');
        }}
        onLaunchGame={() => {
          if (isFromAdmin) {
            navigateTo('admin');
            return;
          }
          if (walkthroughLaunch) {
            if (walkthroughLaunch.isJoin) {
              handleJoinLiveTable(walkthroughLaunch.room, walkthroughLaunch.player);
            } else {
              handleStartGame(walkthroughLaunch.team, walkthroughLaunch.count, walkthroughLaunch.room, walkthroughLaunch.player);
            }
          } else if (gameStarted) {
            navigateTo('game', roomId);
          } else {
            navigateTo('home');
          }
        }}
        isWalkthrough={!isFromAdmin && !gameStarted && !!walkthroughLaunch}
        isAdminView={isFromAdmin}
        teamName={walkthroughLaunch?.team || gameState?.team_name || 'Cloud Titans'}
      />
    );
  }

  // 2. Welcome Screen (/home)
  if (routeInfo.route === 'home' || !gameStarted) {
    return (
      <WelcomeScreen
        onStartGame={handleStartGame}
        onJoinLiveTable={handleJoinLiveTable}
        defaultRoomId={routeInfo.roomId}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenGuide={(launchData) => {
          setWalkthroughLaunch(launchData);
          navigateTo('guide', launchData.room);
        }}
      />
    );
  }

  // Victory Screen
  if (gameState?.is_victory) {
    return (
      <VictoryScreen
        teamName={gameState.team_name}
        health={gameState.health}
        totalPulls={gameState.total_jenga_pulls}
        history={gameState.history}
        restarts={gameState.stage_restart_count || 0}
        debt={gameState.technical_debt || 0}
        onPlayAgain={handleResetGame}
        onExitToLobby={handleExitToLobby}
      />
    );
  }

  const currentStage = gameState?.current_stage;

  return (
    <div
      className={`min-h-screen min-h-[100dvh] w-full lg:h-screen lg:overflow-hidden bg-[#14161a] text-white flex flex-col justify-between select-none ${
        screenShaking ? 'animate-screen-shake' : ''
      }`}
    >
      {/* Spectator Read-Only Mode Banner */}
      {isSpectator && (
        <div className="bg-[#0b1626] border-b-2 border-[#38bdf8] px-3 sm:px-4 py-1.5 flex items-center justify-between text-xs text-white z-40 shadow-xl">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8] animate-ping shrink-0 inline-block" />
            <span className="text-[10px] mc-font text-[#55ffff] uppercase font-bold">
              👁 SPECTATOR MODE (READ-ONLY)
            </span>
            <span className="text-[11px] font-mono text-[#cbd5e1] hidden sm:inline">
              Observing live squad <strong>{gameState?.team_name || roomId}</strong>. All voting, actions, and timer mutations are disabled.
            </span>
          </div>
          <button
            type="button"
            onClick={() => navigateTo('admin')}
            className="mc-btn px-2.5 py-1 text-[9px] mc-font text-[#ffd700] hover:text-white bg-[#152238] border-[#38bdf8] flex items-center gap-1 cursor-pointer"
          >
            <span>← RETURN TO ADMIN PANEL</span>
          </button>
        </div>
      )}

      {/* 1. Cockpit Top Bar (Navbar) */}
      <Navbar
        roomId={roomId}
        roomCode={gameState?.room_code || roomId}
        stageNumber={(gameState?.current_stage_index ?? 0) + 1}
        totalStages={gameState?.total_stages ?? 11}
        stageTitle={currentStage?.title || ''}
        teamName={gameState?.team_name || 'Alpha Devs'}
        health={gameState?.health ?? 100}
        timeLeft={timeLeft}
        isTimerRunning={isTimerRunning}
        onResetGame={handleResetGame}
        onExitToLobby={handleExitToLobby}
        soundEnabled={sound.soundEnabled}
        onToggleSound={sound.toggleSound}
        musicEnabled={sound.musicEnabled}
        onToggleMusic={sound.toggleMusic}
        onOpenFieldGuide={() => navigateTo('guide')}
        isSpectator={isSpectator}
        theme={theme}
        onToggleTheme={toggleTheme}
        isTimerPaused={isTimerPausedByAdmin}
      />

      {/* Facilitator Global Broadcast Alert Banner */}
      {activeBroadcast && (
        <div className="bg-[#3a0808] border-b-2 border-[#ff3333] px-3 py-1 flex items-center justify-between text-xs text-white z-20 shadow-md">
          <div className="flex items-center gap-2 mx-auto">
            <Radio className="w-3.5 h-3.5 text-[#ff5555] animate-pulse shrink-0" />
            <span className="text-[9.5px] mc-font text-[#ffd700] uppercase font-bold">
              FACILITATOR BROADCAST:
            </span>
            <span className="text-[11px] font-mono text-white font-bold">{activeBroadcast}</span>
          </div>
        </div>
      )}

      {/* Main Cockpit Arena (Dynamic Flexbox Layout: Zero Hardcoded Heights) */}
      <main className="flex-1 p-2 sm:p-3 overflow-y-auto min-h-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0 lg:h-full items-stretch">
          {/* Left Wing (7 cols): Full Height Scenario, Problem Statement & Git Diff */}
          <div className="lg:col-span-7 min-h-0 lg:h-full flex flex-col overflow-hidden">
            <StageScenarioViewer stage={currentStage} />
          </div>

          {/* Right Wing (5 cols): Decision Console (Top) & 3D Jenga Tower (Bottom) */}
          <div className="lg:col-span-5 min-h-0 lg:h-full flex flex-col gap-2.5 overflow-hidden">
            {/* Top Right: Options & Team Voting Console */}
            <div className="shrink-0">
              <StageDecisionConsole
                onSelectAction={handleSelectAction}
                disabled={isSpectator || loading || gameState?.is_game_over || gameState?.stage_action_taken || resultModalOpen || isWatchingRemoval}
                stageActionTaken={gameState?.stage_action_taken}
                lastActionResult={gameState?.last_action_result}
                onProceedNextStage={handleProceedNextStage}
                onWatchRemoval={handleWatchRemoval}
                onWatchCollapse={handleWatchCollapse}
                onReopenResult={() => {
                  setActionResult(gameState?.last_action_result);
                  setResultModalOpen(true);
                }}
                onCommitDecision={handleCommitDecision}
                votesTally={gameState?.votes_tally || {}}
                activePlayers={gameState?.active_players || []}
                myVote={myVote}
                customPromptDraft={gameState?.custom_prompt_draft}
                guardrailRuleDraft={gameState?.guardrail_rule_draft}
                onOpenDraftPrompt={() => setPromptModalOpen(true)}
                onOpenDraftRule={() => setGuardrailsModalOpen(true)}
                isTimerPaused={isTimerPausedByAdmin}
              />
            </div>

            {/* Bottom Right: Virtual 3D Jenga Tower */}
            <div className="flex-1 min-h-[220px] flex flex-col overflow-hidden">
              <Virtual3DTower
                key="beige-tower-scene"
                ref={towerRef}
                totalPulls={gameState?.total_jenga_pulls ?? 0}
                instabilityPct={Math.min(100, Math.max(0, Math.max(100 - (gameState?.health ?? 100), gameState?.tower_instability_pct ?? 0)))}
                technicalDebt={gameState?.technical_debt || 0}
                isGameOver={gameState?.is_game_over ?? false}
                onBlockSlide={sound.playSlide}
                onBlockLand={handleBlockLand}
                onTriggerStressCollapse={handleStressCollapse}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Cinematic Extraction Floating HUD Bar */}
      {isWatchingRemoval && !gameState?.is_game_over && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-4 animate-bounce">
          <div className="mc-panel-dark p-3 shadow-2xl flex items-center justify-between gap-3 border-2 border-[#ffd700]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-[#251505] border border-[#ffd700] flex items-center justify-center shrink-0">
                <Rotate3d className="w-5 h-5 text-[#ffd700] animate-spin" style={{ animationDuration: '3s' }} />
              </div>
              <div>
                <span className="text-[9px] mc-font text-[#ffd700] uppercase block">
                  VOXEL DESTABILIZATION CAMERA
                </span>
                <p className="text-[10px] text-white mc-font">
                  {actionResult?.jenga_pulls > 0
                    ? `Mining ${actionResult.jenga_pulls} structural block(s) from the tower!`
                    : 'Blocks Resilient.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleProceedNextStage}
              className="mc-btn mc-btn-green px-3.5 py-2 text-[9px] mc-font text-white flex items-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-[0.98] transition-transform"
            >
              <span className="pointer-events-none">NEXT STAGE [SPACE]</span>
              <ArrowRight className="w-3.5 h-3.5 pointer-events-none" />
            </button>
          </div>
        </div>
      )}

      {/* Custom Prompt Cockpit Drawer */}
      <CustomPromptModal
        isOpen={promptModalOpen}
        onClose={() => setPromptModalOpen(false)}
        onSubmitPrompt={handleSubmitPrompt}
        stageTitle={currentStage?.title}
        suggestedKeywords={
          currentStage?.id === 1
            ? ['bulkify', 'map', 'set', 'soql outside loop', 'trigger.new']
            : currentStage?.id === 2
            ? ['with sharing', 'stripinaccessible', 'fls', 'bind variable', 'user_mode']
            : currentStage?.id === 3
            ? ['queueable', 'system.runas', 'async finalizer', 'platform events', 'enqueuejob']
            : currentStage?.id === 4
            ? ['shadow dom', 'this.template', '@salesforce/schema', 'lws', 'lightning data service']
            : currentStage?.id === 5
            ? ['database.batchable', '200 record chunk', 'limits.getqueueablejobs', 'platform events']
            : currentStage?.id === 6
            ? ['schema.sobjecttype', 'custom metadata cmdt', 'getrecordtypeinfosbydevelopername', 'describe cache']
            : currentStage?.id === 7
            ? ['runlocaltests', 'quick deploy', 'check-only validate', '85% coverage', 'scratch org']
            : currentStage?.id === 8
            ? ['for update', 'order by id', 'queueable', 'platform event', 'row lock', 'deterministic']
            : currentStage?.id === 9
            ? ['jsonparser', 'cpu limit', 'regex', 'async queueable', 'streaming parser', 'deserializestrict']
            : currentStage?.id === 10
            ? ['idempotency', 'correlation id', 'eventbus', 'recursion guard', 'cdc', 'replayid']
            : ['named credential', 'external credential', 'callout:', 'vault', 'mask headers', 'certificate']
        }
      />

      {/* Guardrails Cockpit Modal */}
      <GuardrailsModal
        isOpen={guardrailsModalOpen}
        onClose={() => setGuardrailsModalOpen(false)}
        rules={currentStage?.ai_suggestions || currentStage?.suggest_change_rules || []}
        onSubmitRule={handleSubmitRule}
      />

      {/* Dice Roll Percentage Popup */}
      <ResultModal
        isOpen={resultModalOpen}
        actionResult={actionResult || gameState?.last_action_result}
        onClose={() => setResultModalOpen(false)}
        onProceed={handleProceedNextStage}
        onWatchRemoval={handleWatchRemoval}
        onWatchCollapse={handleWatchCollapse}
        isTimerPaused={isTimerPausedByAdmin}
      />

      {/* Cinematic Falling Tower Banner (Visible while tower topples and during the 3.8s rubble pause) */}
      {isWatchingCollapse && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-lg px-4 pointer-events-none animate-fadeIn">
          <div className="bg-[#240505]/95 border-2 border-[#ff3333] p-3 text-center shadow-2xl backdrop-blur-sm animate-pulse">
            <span className="text-[10px] mc-font text-[#ff5555] uppercase block font-bold">
              ⚠️ CRITICAL SYSTEM FAILURE • TOWER BUCKLING & COLLAPSING
            </span>
            <p className="text-[9px] text-[#ffd700] mc-font mt-1">
              Cumulative governor limits breached — watching architecture collapse into rubble...
            </p>
          </div>
        </div>
      )}

      {/* Catastrophic Outage / Collapse Screen (Appears ONLY after 3.8s rubble pause) */}
      {gameState?.is_game_over && showGameOverModal && !resultModalOpen && !isWatchingCollapse && (
        <GameOverModal
          reason={gameState.game_over_reason || 'Production Build Outage'}
          stageNumber={(gameState.current_stage_index ?? 0) + 1}
          totalStages={gameState.total_stages ?? 11}
          health={gameState.health}
          totalPulls={gameState.total_jenga_pulls}
          onRestart={handleResetGame}
          onRetryStage={handleRetryStage}
          onExitToLobby={handleExitToLobby}
        />
      )}
    </div>
  );
}
