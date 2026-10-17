import React, { useState } from 'react';
import StageScenarioViewer from './StageScenarioViewer';
import Virtual3DTower from './Virtual3DTower';
import StageDecisionConsole from './StageDecisionConsole';
import { GitPullRequest, Layers, Zap } from 'lucide-react';

export default function StageArena({
  stage,
  gameState,
  hintsRemaining = 6,
  maxHints = 6,
  revealedHints = [],
  onRevealHint,
  towerRef,
  totalPulls = 0,
  instabilityPct = 0,
  technicalDebt = 0,
  isGameOver = false,
  activePlayers = [],
  votesTally = {},
  onBlockSlide,
  onBlockLand,
  onTriggerStressCollapse,
  onSelectAction,
  disabled = false,
  stageActionTaken = false,
  lastActionResult = null,
  onProceedNextStage,
  onWatchRemoval,
  onWatchCollapse,
  onReopenResult,
  onCommitDecision,
  myVote = null,
  customPromptDraft = null,
  guardrailRuleDraft = null,
  onOpenDraftPrompt,
  onOpenDraftRule,
  isTimerPaused = false,
}) {
  const [mobileTab, setMobileTab] = useState('scenario'); // 'scenario' | 'tower' | 'decide'

  const totalActivePlayers = Math.max(activePlayers.length, 1);
  const totalVotesCast = Object.values(votesTally).reduce((a, b) => a + b, 0);

  return (
    <div className="flex-1 min-h-0 w-full flex flex-col overflow-hidden">
      {/* 1. Desktop & Laptop Viewports (lg+ >= 1024px) */}
      <div className="hidden lg:grid lg:grid-cols-12 lg:gap-3 flex-1 min-h-0 w-full px-3 lg:px-5 py-2 lg:py-2.5 overflow-hidden">
        {/* Left Column (7 cols): Scenario & Diff Workspace */}
        <div className="lg:col-span-7 flex flex-col min-h-0 h-full overflow-hidden">
          <StageScenarioViewer
            stage={stage}
            hintsRemaining={hintsRemaining}
            maxHints={maxHints}
            revealedHints={revealedHints}
            onRevealHint={onRevealHint}
          />
        </div>

        {/* Right Column (5 cols): 3D Voxel Stability Twin & 2x2 Decision Matrix */}
        <div className="lg:col-span-5 flex flex-col min-h-0 h-full gap-2 overflow-hidden">
          {/* Top: 3D Tower Viewport */}
          <div className="flex-1 min-h-[140px] relative overflow-hidden flex flex-col">
            <Virtual3DTower
              key="desktop-tower"
              ref={towerRef}
              totalPulls={totalPulls}
              instabilityPct={instabilityPct}
              technicalDebt={technicalDebt}
              hintsRemaining={hintsRemaining}
              maxHints={maxHints}
              isGameOver={isGameOver}
              activePlayers={activePlayers}
              votesTally={votesTally}
              onBlockSlide={onBlockSlide}
              onBlockLand={onBlockLand}
              onTriggerStressCollapse={onTriggerStressCollapse}
            />
          </div>

          {/* Bottom: 2x2 Decision Console */}
          <div className="shrink-0 min-h-0">
            <StageDecisionConsole
              onSelectAction={onSelectAction}
              disabled={disabled}
              stageActionTaken={stageActionTaken}
              lastActionResult={lastActionResult}
              onProceedNextStage={onProceedNextStage}
              onWatchRemoval={onWatchRemoval}
              onWatchCollapse={onWatchCollapse}
              onReopenResult={onReopenResult}
              onCommitDecision={onCommitDecision}
              votesTally={votesTally}
              activePlayers={activePlayers}
              myVote={myVote}
              customPromptDraft={customPromptDraft}
              guardrailRuleDraft={guardrailRuleDraft}
              onOpenDraftPrompt={onOpenDraftPrompt}
              onOpenDraftRule={onOpenDraftRule}
              isTimerPaused={isTimerPaused}
            />
          </div>
        </div>
      </div>

      {/* 2. Tablet / iPad Viewports (md: to max-lg:, 768px - 1023px) */}
      <div className="hidden md:flex lg:hidden flex-col flex-1 min-h-0 h-full p-2.5 gap-2.5 overflow-hidden">
        {/* Top Row (52%): Scenario Viewer */}
        <div className="h-[52%] min-h-0 flex flex-col overflow-hidden">
          <StageScenarioViewer
            stage={stage}
            hintsRemaining={hintsRemaining}
            maxHints={maxHints}
            revealedHints={revealedHints}
            onRevealHint={onRevealHint}
          />
        </div>

        {/* Bottom Row (48%): Side-by-side 3D Tower & Decision Console */}
        <div className="h-[48%] min-h-0 grid grid-cols-12 gap-2.5 overflow-hidden">
          {/* Tower (5 cols) */}
          <div className="col-span-5 h-full min-h-0 relative overflow-hidden flex flex-col">
            <Virtual3DTower
              key="tablet-tower"
              ref={towerRef}
              totalPulls={totalPulls}
              instabilityPct={instabilityPct}
              technicalDebt={technicalDebt}
              hintsRemaining={hintsRemaining}
              maxHints={maxHints}
              isGameOver={isGameOver}
              activePlayers={activePlayers}
              votesTally={votesTally}
              onBlockSlide={onBlockSlide}
              onBlockLand={onBlockLand}
              onTriggerStressCollapse={onTriggerStressCollapse}
            />
          </div>

          {/* Decision Console (7 cols, with scroll if needed) */}
          <div className="col-span-7 h-full min-h-0 overflow-y-auto pr-1 flex flex-col">
            <StageDecisionConsole
              onSelectAction={onSelectAction}
              disabled={disabled}
              stageActionTaken={stageActionTaken}
              lastActionResult={lastActionResult}
              onProceedNextStage={onProceedNextStage}
              onWatchRemoval={onWatchRemoval}
              onWatchCollapse={onWatchCollapse}
              onReopenResult={onReopenResult}
              onCommitDecision={onCommitDecision}
              votesTally={votesTally}
              activePlayers={activePlayers}
              myVote={myVote}
              customPromptDraft={customPromptDraft}
              guardrailRuleDraft={guardrailRuleDraft}
              onOpenDraftPrompt={onOpenDraftPrompt}
              onOpenDraftRule={onOpenDraftRule}
              isTimerPaused={isTimerPaused}
            />
          </div>
        </div>
      </div>

      {/* 3. Mobile Phones (< 768px) with 3-Tab Switcher */}
      <div className="flex md:hidden flex-col flex-1 min-h-0 h-full overflow-hidden">
        {/* Active Tab View */}
        <div className="flex-1 min-h-0 p-2 overflow-hidden flex flex-col">
          {mobileTab === 'scenario' && (
            <div className="flex-1 min-h-0 h-full flex flex-col overflow-hidden">
              <StageScenarioViewer
                stage={stage}
                hintsRemaining={hintsRemaining}
                maxHints={maxHints}
                revealedHints={revealedHints}
                onRevealHint={onRevealHint}
              />
            </div>
          )}

          {mobileTab === 'tower' && (
            <div className="flex-1 min-h-0 h-full flex flex-col gap-2 overflow-hidden">
              <div className="flex-1 min-h-0 relative overflow-hidden flex flex-col">
                <Virtual3DTower
                  key="mobile-tower"
                  ref={towerRef}
                  totalPulls={totalPulls}
                  instabilityPct={instabilityPct}
                  technicalDebt={technicalDebt}
                  hintsRemaining={hintsRemaining}
                  maxHints={maxHints}
                  isGameOver={isGameOver}
                  activePlayers={activePlayers}
                  votesTally={votesTally}
                  onBlockSlide={onBlockSlide}
                  onBlockLand={onBlockLand}
                  onTriggerStressCollapse={onTriggerStressCollapse}
                />
              </div>
            </div>
          )}

          {mobileTab === 'decide' && (
            <div className="flex-1 min-h-0 h-full overflow-y-auto">
              <StageDecisionConsole
                onSelectAction={onSelectAction}
                disabled={disabled}
                stageActionTaken={stageActionTaken}
                lastActionResult={lastActionResult}
                onProceedNextStage={onProceedNextStage}
                onWatchRemoval={onWatchRemoval}
                onWatchCollapse={onWatchCollapse}
                onReopenResult={onReopenResult}
                onCommitDecision={onCommitDecision}
                votesTally={votesTally}
                activePlayers={activePlayers}
                myVote={myVote}
                customPromptDraft={customPromptDraft}
                guardrailRuleDraft={guardrailRuleDraft}
                onOpenDraftPrompt={onOpenDraftPrompt}
                onOpenDraftRule={onOpenDraftRule}
                isTimerPaused={isTimerPaused}
              />
            </div>
          )}
        </div>

        {/* Sleek Mobile Bottom Tab Bar */}
        <nav className="shrink-0 h-13 border-t border-white/10 grid grid-cols-3 bg-slate-950/95 backdrop-blur z-20 shadow-lg">
          <button
            type="button"
            onClick={() => setMobileTab('scenario')}
            className={`flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer ${
              mobileTab === 'scenario'
                ? 'text-sky-400 bg-sky-500/10 border-t-2 border-sky-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-1">
              <GitPullRequest className="w-3.5 h-3.5" />
              <span className="text-[11px] font-mono">Code</span>
            </div>
            <span className="text-[9px] text-slate-500 truncate max-w-[90px]">
              PR #{stage?.id || 1}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMobileTab('tower')}
            className={`flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer ${
              mobileTab === 'tower'
                ? 'text-emerald-400 bg-emerald-500/10 border-t-2 border-emerald-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              <span className="text-[11px] font-mono">Tower</span>
            </div>
            <span className={`text-[9px] font-mono ${technicalDebt >= 4 ? 'text-rose-400' : 'text-slate-500'}`}>
              Debt: {technicalDebt}/5
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMobileTab('decide')}
            className={`flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer ${
              mobileTab === 'decide'
                ? 'text-amber-400 bg-amber-500/10 border-t-2 border-amber-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" />
              <span className="text-[11px] font-mono">Vote</span>
            </div>
            <span className="text-[9px] font-mono text-emerald-400">
              {totalVotesCast}/{totalActivePlayers} Votes
            </span>
          </button>
        </nav>
      </div>
    </div>
  );
}
