import React, { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from './components/Navbar';
import LiveLeaderboardTicker from './components/LiveLeaderboardTicker';
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
import { useSound } from './hooks/useSound';
import * as api from './services/api';
import { ArrowRight, Rotate3d, CheckCircle2, AlertTriangle, Layers, Zap } from 'lucide-react';

export default function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(false);

  // Countdown timer: 120s (2 minutes)
  const [timeLeft, setTimeLeft] = useState(120);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timeLeftRef = useRef(120);

  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  // Modals & Extraction State
  const [promptModalOpen, setPromptModalOpen] = useState(false);
  const [guardrailsModalOpen, setGuardrailsModalOpen] = useState(false);
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [actionResult, setActionResult] = useState(null);
  const [isWatchingRemoval, setIsWatchingRemoval] = useState(false);
  const [screenShaking, setScreenShaking] = useState(false);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [myVote, setMyVote] = useState(null);

  // Tower 3D Ref
  const towerRef = useRef(null);

  // Sound Engine
  const sound = useSound();

  const [roomId, setRoomIdState] = useState(() => api.getRoomId());

  // Load initial state
  const refreshState = useCallback(async () => {
    try {
      const state = await api.fetchGameState();
      setGameState(state);
      if (state.has_started || state.current_stage_index > 0 || state.health < 100 || state.total_jenga_pulls > 0) {
        setGameStarted(true);
      }
      const myId = api.getPlayerId();
      const me = state.active_players?.find((p) => p.player_id === myId);
      if (me?.voted_action) setMyVote(me.voted_action);
    } catch (err) {
      console.warn('Initial state fetch:', err);
    }
  }, []);

  useEffect(() => {
    refreshState();
  }, [refreshState]);

  // Live Multi-Client Room Synchronization (syncs teammates on same table)
  useEffect(() => {
    if (!gameStarted) return;
    const pollInterval = setInterval(async () => {
      try {
        const remoteState = await api.fetchGameState();

        // Sync local voter status
        const myId = api.getPlayerId();
        const me = remoteState.active_players?.find((p) => p.player_id === myId);
        if (me?.voted_action) {
          setMyVote(me.voted_action);
        } else if (!remoteState.stage_action_taken && !me?.voted_action) {
          setMyVote(null);
        }

        // 1. If team consensus or timeout committed a decision on this stage
        if (remoteState.stage_action_taken && remoteState.last_action_result && !resultModalOpen && !isWatchingRemoval) {
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
            setResultModalOpen(false);
            setIsWatchingRemoval(false);
            setActionResult(null);
            setMyVote(null);
            setTimeLeft(120);
            setIsTimerRunning(true);
            return remoteState;
          }
          if (
            prev.health !== remoteState.health ||
            prev.total_jenga_pulls !== remoteState.total_jenga_pulls ||
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
  }, [gameStarted, resultModalOpen, isWatchingRemoval, sound]);

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
  }, [gameStarted, isTimerRunning, gameState, resultModalOpen, isWatchingRemoval, sound]);

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
        gameState?.is_game_over ||
        gameState?.is_victory
      ) {
        return;
      }

      if (resultModalOpen) {
        if (e.key === ' ' || e.key === 'Enter') {
          if (actionResult?.jenga_pulls > 0) {
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
      const room = chosenRoomId || roomId;
      setRoomIdState(room);
      if (playerName) api.setPlayerName(playerName);
      const state = await api.startGame(teamName, playerCount, room);
      await api.joinPlayer(api.getPlayerId(), api.getPlayerName(), room);
      setGameState(state);
      setGameStarted(true);
      setTimeLeft(120);
      setIsTimerRunning(true);
      setActionResult(null);
      setResultModalOpen(false);
      setIsWatchingRemoval(false);
      setMyVote(null);
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
      setGameState(state);
      setGameStarted(true);
      setTimeLeft(120);
      setIsTimerRunning(true);
      sound.playSuccess();
    } catch (err) {
      alert(`Failed to join live table: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleResetGame = async () => {
    if (window.confirm('Reset workshop game and start back at Stage 1?')) {
      try {
        const state = await api.resetGame();
        setGameState(state);
        setTimeLeft(120);
        setIsTimerRunning(true);
        setActionResult(null);
        setResultModalOpen(false);
        setIsWatchingRemoval(false);
        setPromptModalOpen(false);
        setGuardrailsModalOpen(false);
        setMyVote(null);
      } catch (err) {
        alert(err.message);
      }
    }
  };

  // Submit Custom Prompt: Drafts for team + casts vote
  const handleSubmitPrompt = async (promptText) => {
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
    try {
      setLoading(true);
      setGuardrailsModalOpen(false);
      const timeSpent = 120 - timeLeftRef.current;

      // 1. Submit collaborative draft
      await api.submitDraft({
        draft_type: 'suggest_change',
        selected_rule_id: ruleId,
      });

      // 2. Cast vote for guardrail rule
      setMyVote('suggest_change');
      const updatedState = await api.submitVote({
        action_type: 'suggest_change',
        time_spent_seconds: timeSpent,
      });

      setGameState(updatedState);
      if (updatedState.stage_action_taken && updatedState.last_action_result) {
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
  const handleProceedNextStage = async () => {
    setResultModalOpen(false);
    setIsWatchingRemoval(false);

    if (actionResult?.is_victory) {
      await refreshState();
      return;
    }
    try {
      const nextState = await api.nextStage();
      setGameState(nextState);
      setTimeLeft(120);
      setIsTimerRunning(true);
    } catch (err) {
      console.error(err);
    }
  };

  // Stress Collapse Simulation
  const handleStressCollapse = async () => {
    if (window.confirm('Simulate 3D catastrophic structural collapse of the architecture tower?')) {
      sound.playCrash();
      setScreenShaking(true);
      setTimeout(() => setScreenShaking(false), 800);
      try {
        const updated = await api.reportTowerToppled();
        setGameState(updated);
      } catch (err) {
        console.error(err);
      }
    }
  };
  // Catastrophic Game Over: Trigger 3D tower collapse first, then present incident telemetry
  useEffect(() => {
    if (gameState?.is_game_over) {
      sound.playCrash();
      setScreenShaking(true);
      setTimeout(() => setScreenShaking(false), 1400);
      towerRef.current?.triggerCatastrophicCollapse();

      // Ensure intermediate extraction and result HUDs are dismissed
      setIsWatchingRemoval(false);
      setResultModalOpen(false);

      const timer = setTimeout(() => {
        setShowGameOverModal(true);
      }, 2500);

      return () => clearTimeout(timer);
    } else {
      setShowGameOverModal(false);
    }
  }, [gameState?.is_game_over, sound]);

  const handleReplayCollapse = useCallback(() => {
    sound.playCrash();
    setScreenShaking(true);
    setTimeout(() => setScreenShaking(false), 1400);
    towerRef.current?.triggerCatastrophicCollapse();
  }, [sound]);

  // Welcome Screen
  if (!gameStarted) {
    return (
      <WelcomeScreen
        onStartGame={handleStartGame}
        onJoinLiveTable={handleJoinLiveTable}
        defaultRoomId={roomId}
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
        onPlayAgain={handleResetGame}
      />
    );
  }

  const currentStage = gameState?.current_stage;

  return (
    <div
      className={`min-h-screen min-h-[100dvh] w-full lg:h-screen lg:overflow-hidden bg-[#f7f4ed] text-stone-900 flex flex-col justify-between select-none bg-mesh-radial ${
        screenShaking ? 'animate-screen-shake' : ''
      }`}
    >
      {/* 1. Cockpit Top Bar (Navbar) */}
      <Navbar
        roomId={roomId}
        stageNumber={(gameState?.current_stage_index ?? 0) + 1}
        totalStages={gameState?.total_stages ?? 11}
        stageTitle={currentStage?.title || ''}
        teamName={gameState?.team_name || 'Alpha Devs'}
        health={gameState?.health ?? 100}
        timeLeft={timeLeft}
        isTimerRunning={isTimerRunning}
        onToggleTimer={() => setIsTimerRunning((prev) => !prev)}
        onResetGame={handleResetGame}
        soundEnabled={sound.soundEnabled}
        onToggleSound={sound.toggleSound}
        musicEnabled={sound.musicEnabled}
        onToggleMusic={sound.toggleMusic}
      />

      {/* 2. Room Rivalry Leaderboard Ticker */}
      <LiveLeaderboardTicker
        currentRoomId={roomId}
        currentTeamName={gameState?.team_name || 'Alpha Devs'}
        currentHealth={gameState?.health ?? 100}
        currentStage={(gameState?.current_stage_index ?? 0) + 1}
        totalStages={gameState?.total_stages ?? 11}
        totalPulls={gameState?.total_jenga_pulls ?? 0}
      />

      {/* 3. Main Cockpit Arena (Responsive on smaller screens, zero-scroll on large) */}
      <main className="flex-1 p-2 sm:p-3 overflow-y-auto lg:overflow-hidden min-h-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0 lg:h-full items-stretch">
          {/* Left Wing (6 cols): Stage Scenario & 4 Arcade Action Consoles */}
          <div className="lg:col-span-6 min-h-[500px] lg:h-full flex flex-col overflow-hidden">
            <StageArena
              stage={currentStage}
              onSelectAction={handleSelectAction}
              disabled={loading || gameState?.is_game_over || resultModalOpen || isWatchingRemoval}
              votesTally={gameState?.votes_tally || {}}
              activePlayers={gameState?.active_players || []}
              myVote={myVote}
              customPromptDraft={gameState?.custom_prompt_draft}
              guardrailRuleDraft={gameState?.guardrail_rule_draft}
              onOpenDraftPrompt={() => setPromptModalOpen(true)}
              onOpenDraftRule={() => setGuardrailsModalOpen(true)}
            />
          </div>

          {/* Right Wing (6 cols): Majestic 3D Virtual Architecture Tower */}
          <div className="lg:col-span-6 min-h-[520px] lg:h-full flex flex-col overflow-hidden">
            <Virtual3DTower
              key="beige-tower-scene"
              ref={towerRef}
              totalPulls={gameState?.total_jenga_pulls ?? 0}
              instabilityPct={gameState?.tower_instability_pct ?? 0}
              isGameOver={gameState?.is_game_over ?? false}
              onBlockSlide={sound.playSlide}
              onBlockLand={handleBlockLand}
              onTriggerStressCollapse={handleStressCollapse}
            />
          </div>
        </div>
      </main>

      {/* Cinematic Extraction Floating HUD Bar */}
      {isWatchingRemoval && !gameState?.is_game_over && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-4 animate-bounce">
          <div className="bg-[#faf7f0]/95 border border-[#ded5c5] text-stone-900 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-300 flex items-center justify-center shrink-0">
                <Rotate3d className="w-5 h-5 text-amber-600 animate-spin" style={{ animationDuration: '3s' }} />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-800 uppercase tracking-wider block">
                  3D Destabilization Live Feed
                </span>
                <p className="text-xs text-stone-900 font-mono font-bold">
                  {actionResult?.jenga_pulls > 0
                    ? `Watching ${actionResult.jenga_pulls} block(s) slide out & crash to the floor!`
                    : 'Components Resilient.'}
                </p>
              </div>
            </div>

            <button
              onClick={handleProceedNextStage}
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-amber-600/20 whitespace-nowrap active:scale-95"
            >
              <span>Proceed to Next Stage [SPACE]</span>
              <ArrowRight className="w-4 h-4" />
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
        rules={currentStage?.suggest_change_rules || []}
        onSubmitRule={handleSubmitRule}
      />

      {/* Dice Roll Percentage Popup */}
      <ResultModal
        isOpen={resultModalOpen}
        actionResult={actionResult}
        onProceed={handleProceedNextStage}
        onWatchRemoval={handleWatchRemoval}
      />

      {/* Catastrophic Outage / Collapse Screen */}
      {gameState?.is_game_over && (
        <>
          {/* Emergency Alarm Banner during initial 3D tumble */}
          {!showGameOverModal && (
            <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4 animate-bounce">
              <div className="bg-[#faf7f0]/95 border-2 border-rose-500 text-stone-900 rounded-2xl p-4 shadow-2xl backdrop-blur-md flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-rose-100 border border-rose-400 flex items-center justify-center shrink-0">
                    <Rotate3d className="w-6 h-6 text-amber-600 animate-spin" style={{ animationDuration: '3s' }} />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-black uppercase tracking-widest text-rose-700 block">
                      🚨 CATASTROPHIC 3D COLLAPSE IN PROGRESS
                    </span>
                    <p className="text-xs sm:text-sm font-black text-stone-900 font-mono">
                      Watching Salesforce Architecture Tower Topple...
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowGameOverModal(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white transition-all cursor-pointer shadow-md font-mono whitespace-nowrap active:scale-95"
                >
                  View Telemetry ➔
                </button>
              </div>
            </div>
          )}

          {showGameOverModal && (
            <GameOverModal
              reason={gameState.game_over_reason || 'Production Build Outage'}
              stageNumber={(gameState.current_stage_index ?? 0) + 1}
              totalStages={gameState.total_stages ?? 11}
              health={gameState.health}
              totalPulls={gameState.total_jenga_pulls}
              onRestart={handleResetGame}
              onReplayCollapse={handleReplayCollapse}
            />
          )}
        </>
      )}
    </div>
  );
}
