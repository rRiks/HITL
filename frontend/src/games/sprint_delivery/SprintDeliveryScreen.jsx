import React, { useState, useRef, useMemo } from 'react';
import { useSprintSession } from './hooks/useSprintSession';
import { SPRINT_ACTIONS } from './config/sprintActions';
import Navbar from '../../components/Navbar';
import SprintChatDrawer from './components/SprintChatDrawer';
import ManualOverrideModal from './components/ManualOverrideModal';
import SprintReportCard from './components/SprintReportCard';
import StageArena from '../../components/StageArena';
import { ResultModal, GuardrailsModal } from '../../components/ActionModals';
import GameOverModal from '../../components/GameOverModal';
import * as api from '../../services/api';

export default function SprintDeliveryScreen({
  roomId = 'default',
  sound,
  onExitToLobby,
  onOpenFieldGuide,
  theme = 'dark',
  onToggleTheme,
  isSpectator = false,
}) {
  const towerRef = useRef(null);
  const session = useSprintSession(roomId, sound);

  // Modals state
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [guardrailModalOpen, setGuardrailModalOpen] = useState(false);
  const [resultModalOpen, setResultModalOpen] = useState(false);

  // Asymmetric Player Role State (Architect / Intern / SRE / Gremlin)
  const [playerRole, setPlayerRole] = useState(() => api.getPlayerRole());

  const handleRoleChange = async (newRole) => {
    setPlayerRole(newRole);
    api.setPlayerRoleLocal(newRole);
    if (roomId) {
      try {
        await api.setPlayerRoleRemote(roomId, newRole);
      } catch (e) {
        console.warn('Set role failed:', e);
      }
    }
  };

  const handleSlapVote = async (targetId, targetName) => {
    if (!roomId) return;
    try {
      sound?.playSlap?.();
      await api.slapVote(roomId, targetId, targetName);
    } catch (e) {
      console.warn('Slap failed:', e);
    }
  };

  const handlePurgeIncident = async () => {
    if (!roomId) return;
    try {
      sound?.playRubberStamp?.();
      await api.purgeHallucination(roomId);
    } catch (e) {
      console.warn('Purge failed:', e);
    }
  };

  const { sprintState, clock, dialogue, actions, advanceStage, resetSprint, activeCodeDiff } = session;

  // Dynamic action config: Map senior dev tokens directly onto Card [2] Manual Override where it makes intuitive sense
  // HOOK MUST RUN BEFORE ANY EARLY RETURNS
  const tokensRemaining = sprintState?.senior_dev_tokens_remaining ?? 2;
  const dynamicSprintActions = useMemo(() => {
    return SPRINT_ACTIONS.map((act) => {
      if (act.id === 'manual_override') {
        return {
          ...act,
          badge: tokensRemaining > 0 ? `SENIOR DEV (${tokensRemaining}/2 TOKENS)` : '0 TOKENS LEFT (EXHAUSTED)',
          desc: tokensRemaining > 0
            ? 'Senior dev hand-crafts fix. Guaranteed pass, costs sprint time & 1 token.'
            : 'Tokens exhausted! Cannot manual override. Steer prompt or accept AI.',
        };
      }
      return act;
    });
  }, [tokensRemaining]);

  if (session.initialLoading && !sprintState) {
    return (
      <div className="min-h-screen w-full bg-[#14161a] flex items-center justify-center text-white mc-font">
        <div className="p-4 border-2 border-[#ffd700] bg-[#1b1b1b] text-center space-y-2 animate-pulse">
          <span>INITIALIZING SPRINT DELIVERY SESSION...</span>
        </div>
      </div>
    );
  }

  // 1. Victory Screen: Sprint Delivery Audit Report Card
  if (sprintState?.is_victory) {
    return (
      <SprintReportCard
        teamName={sprintState.team_name}
        health={sprintState.health}
        totalPulls={sprintState.total_jenga_pulls}
        debt={sprintState.technical_debt}
        stageRecords={sprintState.stage_time_records || []}
        formattedTimeRemaining={clock.formattedClock}
        isOvertime={clock.isOvertime}
        overtimeSeconds={clock.overtimeSec}
        onPlayAgain={resetSprint}
        onExit={onExitToLobby}
      />
    );
  }

  // Current stage data enriched with all necessary fields and fallbacks
  const currentStage = {
    id: (sprintState?.current_stage_index ?? 0) + 1,
    phase_name: sprintState?.phase_name || 'SERVICE LAYER ARCHITECTURE',
    phase: sprintState?.phase_name || 'SERVICE LAYER ARCHITECTURE',
    ticket_title: sprintState?.ticket_title || sprintState?.stage_title || 'CSC-101: The Governor Limit Trap',
    title: sprintState?.stage_title || 'The Governor Limit Trap',
    story: sprintState?.story || sprintState?.scenario_text || 'When an Account phone number is updated, propagate changes to child Contacts while respecting bulkification and Apex governor limits.',
    scenario_text: sprintState?.scenario_text || sprintState?.story || '',
    ai_proposal_summary: sprintState?.ai_proposal_summary || sprintState?.active_candidate_label || 'Optimize query selectors and bulkify trigger context to prevent governor limit exceptions.',
    ai_proposal: sprintState?.ai_proposal_summary || sprintState?.active_candidate_label || 'Optimize query selectors and bulkify trigger context to prevent governor limit exceptions.',
    file_name: sprintState?.file_name || sprintState?.file_path || 'force-app/main/default/classes/ContactService.cls',
    file_path: sprintState?.file_path || sprintState?.file_name || 'force-app/main/default/classes/ContactService.cls',
    code_diff: activeCodeDiff || sprintState?.active_code_diff || '',
    hidden_risks: sprintState?.hidden_risks || 'Unindexed SOQL inside iterative Contact loops risks hitting 101 SOQL governor limits during bulk updates.',
  };

  // Action dispatcher matching the 4 slots
  const handleSelectAction = async (actionType) => {
    if (actions.loading || sprintState?.is_game_over) return;

    if (actionType === 'accept_as_is') {
      try {
        await actions.acceptAsIs();
        setResultModalOpen(true);
      } catch {}
    } else if (actionType === 'manual_override') {
      setManualModalOpen(true);
    } else if (actionType === 'custom_prompt' || actionType === 'steer_prompt') {
      setChatDrawerOpen(true);
    } else if (actionType === 'suggest_change' || actionType === 'guardrail') {
      setGuardrailModalOpen(true);
    }
  };

  const handleConfirmManual = async () => {
    setManualModalOpen(false);
    try {
      await actions.manualOverride();
      setResultModalOpen(true);
    } catch {}
  };

  const handleCommitSteer = async () => {
    setChatDrawerOpen(false);
    try {
      await actions.commitSteer();
      setResultModalOpen(true);
    } catch {}
  };

  const handleGuardrailSubmit = async (ruleId) => {
    setGuardrailModalOpen(false);
    try {
      await actions.enforceGuardrail(ruleId, 'Selected Architectural Guardrail');
      setResultModalOpen(true);
    } catch {}
  };

  return (
    <div className="h-[100dvh] max-h-[100dvh] overflow-hidden w-full bg-slate-950 text-slate-100 flex flex-col justify-between select-none">
      {/* 1. Top Telemetry Navbar (Exact 1:1 Unified 3-Cluster Navbar) */}
      <Navbar
        roomId={roomId}
        roomCode={sprintState?.room_code || roomId}
        stageNumber={(sprintState?.current_stage_index ?? 0) + 1}
        totalStages={sprintState?.total_stages ?? 11}
        stageTitle={currentStage.title}
        teamName={sprintState?.team_name || 'Alpha Devs'}
        health={sprintState?.health ?? 100}
        timeLeft={sprintState?.sprint_time_left_seconds ?? 1500}
        formattedClock={clock.formattedClock}
        onResetGame={resetSprint}
        onExitToLobby={onExitToLobby}
        soundEnabled={sound.soundEnabled}
        onToggleSound={sound.toggleSound}
        musicEnabled={sound.musicEnabled}
        onToggleMusic={sound.toggleMusic}
        onOpenFieldGuide={onOpenFieldGuide}
        isSpectator={isSpectator}
        theme={theme}
        onToggleTheme={onToggleTheme}
        isTimerPaused={false}
      />

      {/* 2. Reused StageArena (Direct flex-1 child, exact Game 1 replica) */}
      <StageArena
        stage={currentStage}
        gameState={sprintState}
        hintsRemaining={sprintState?.hints_remaining ?? 6}
        maxHints={sprintState?.max_hints ?? 6}
        revealedHints={sprintState?.revealed_hints ?? []}
        onRevealHint={actions.revealHint}
        towerRef={towerRef}
        totalPulls={sprintState?.total_jenga_pulls ?? 0}
        instabilityPct={Math.min(100, Math.max(0, Math.max(100 - (sprintState?.health ?? 100), sprintState?.tower_instability_pct ?? 0)))}
        technicalDebt={sprintState?.technical_debt ?? 0}
        isGameOver={sprintState?.is_game_over ?? false}
        activePlayers={sprintState?.active_players || []}
        votesTally={sprintState?.votes_tally || {}}
        onBlockSlide={sound.playSlide}
        onBlockLand={sound.playBlockLand}
        onSelectAction={handleSelectAction}
        disabled={actions.loading || sprintState?.is_game_over || Boolean(actions.actionResult)}
        stageActionTaken={Boolean(actions.actionResult)}
        lastActionResult={actions.actionResult}
        onProceedNextStage={advanceStage}
        onWatchRemoval={() => {
          setResultModalOpen(false);
          towerRef.current?.triggerExtractionSequence?.(actions.actionResult?.jenga_pulls || 1);
        }}
        onWatchCollapse={() => {
          setResultModalOpen(false);
          towerRef.current?.triggerCatastrophicCollapse?.();
        }}
        onReopenResult={() => setResultModalOpen(true)}
        onCommitDecision={actions.acceptAsIs}
        onOpenDraftPrompt={() => setChatDrawerOpen(true)}
        onOpenDraftRule={() => setGuardrailModalOpen(true)}
        isTimerPaused={false}
        actionsConfig={dynamicSprintActions}
        sound={sound}
        activeIncident={sprintState?.active_incident}
        recentReactions={sprintState?.recent_reactions || []}
        slapEvents={sprintState?.slap_events || []}
        onSlapVote={handleSlapVote}
        playerRole={playerRole}
        onRoleChange={handleRoleChange}
        onPurgeIncident={handlePurgeIncident}
        roomId={roomId}
      />

      {/* 3. Interactive Copilot Steer Chat Drawer */}
      <SprintChatDrawer
        isOpen={chatDrawerOpen}
        onClose={() => setChatDrawerOpen(false)}
        messages={dialogue.messages}
        isTyping={dialogue.isTyping}
        isHardened={dialogue.isHardened}
        onSendMessage={dialogue.sendSteerTurn}
        onCommitCode={handleCommitSteer}
        stageTitle={currentStage.title}
      />

      {/* 4. Senior Dev Manual Override Confirmation Dialog */}
      <ManualOverrideModal
        isOpen={manualModalOpen}
        onClose={() => setManualModalOpen(false)}
        onConfirm={handleConfirmManual}
        tokensRemaining={sprintState?.senior_dev_tokens_remaining ?? 2}
        isCrunchTime={clock.urgency === 'zero_hour' || clock.urgency === 'overtime'}
      />

      {/* 5. Pre-Scanned Guardrail Modal */}
      <GuardrailsModal
        isOpen={guardrailModalOpen}
        onClose={() => setGuardrailModalOpen(false)}
        rules={[
          { id: 'g_batch', title: 'Refactor into Database.Batchable', description: 'Splits execution into 200 record chunks with retry throttling.' },
          { id: 'g_cmdt', title: 'Org-Agnostic Custom Metadata', description: 'Replaces hardcoded IDs with dynamic describe schema caching.' },
          { id: 'g_event', title: 'Decoupled Platform Event Architecture', description: 'Decouples DML context for zero row lock contention and clean async isolation.' },
        ]}
        onSubmitRule={handleGuardrailSubmit}
      />

      {/* 6. Result Modal (Dice Roll Outcome) */}
      <ResultModal
        isOpen={resultModalOpen}
        actionResult={actions.actionResult}
        onClose={() => {
          setResultModalOpen(false);
          actions.clearActionResult();
        }}
        onProceed={() => {
          setResultModalOpen(false);
          advanceStage();
        }}
        onWatchRemoval={() => {
          setResultModalOpen(false);
          towerRef.current?.triggerExtractionSequence?.(actions.actionResult?.jenga_pulls || 1);
        }}
        onWatchCollapse={() => {
          setResultModalOpen(false);
          towerRef.current?.triggerCatastrophicCollapse?.();
        }}
        isTimerPaused={false}
      />

      {/* 7. Game Over Screen */}
      {sprintState?.is_game_over && (
        <GameOverModal
          reason={sprintState.game_over_reason || 'Production Build Outage'}
          stageNumber={(sprintState.current_stage_index ?? 0) + 1}
          totalStages={sprintState.total_stages ?? 11}
          health={sprintState.health}
          totalPulls={sprintState.total_jenga_pulls}
          onRestart={resetSprint}
          onRetryStage={resetSprint}
          onExitToLobby={onExitToLobby}
        />
      )}
    </div>
  );
}
