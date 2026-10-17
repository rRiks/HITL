import React, { useState, useEffect } from 'react';
import {
  GitPullRequest,
  FileCode,
  AlertTriangle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Maximize2,
  X,
} from 'lucide-react';

export default function StageScenarioViewer({ stage }) {
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

  const diffLines = stage.code_diff ? stage.code_diff.split('\n') : [];

  return (
    <div className="mc-panel-dark p-2.5 sm:p-3 flex flex-col h-full min-h-0 overflow-hidden shadow-md select-none">
      {/* 1. Stage Threat Header */}
      <div className="flex items-center justify-between gap-1.5 mb-2 shrink-0">
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

      {/* 2. Story Title & Problem Statement (Primary Focus) */}
      <div className="mb-2 shrink-0 bg-[#161310]/70 p-2.5 sm:p-3 border border-[#3e3428] shadow-xs">
        <h2 className="text-sm sm:text-base font-bold text-white tracking-wide mb-1.5 mc-font text-[#ffff55]">
          {stage.title}
        </h2>
        <p className="text-xs sm:text-[12.5px] text-[#e0e0e0] leading-relaxed font-sans select-text">
          {stage.story}
        </p>
      </div>

      {/* 3. AI Golem Proposal Card (Full, Uncompacted Text!) */}
      <div className="bg-[#1b150c] border-2 border-[#ffaa00]/60 p-2.5 sm:p-3 mb-2 shrink-0 shadow-sm">
        <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-[#ffd700] mc-font font-bold">
            <GitPullRequest className="w-3.5 h-3.5 text-[#ffd700] shrink-0" />
            <span className="text-[10px] uppercase tracking-wider">AI GOLEM PROPOSAL</span>
          </div>
          <code className="text-[#55ff55] font-mono text-[9.5px] bg-[#0c0d10] px-2 py-0.5 border border-[#444] select-all">
            {stage.file_name}
          </code>
        </div>
        <p className="text-xs sm:text-[12.5px] text-[#ffe6cc] italic font-sans select-text leading-relaxed">
          "{stage.ai_proposal_summary}"
        </p>
      </div>

      {/* 4. Unified Code Diff Viewer (Relative Flex: Stretches to fill remaining space!) */}
      <div className="border-2 border-[#333] bg-[#0c0d10] flex-1 min-h-[120px] flex flex-col overflow-hidden shadow-inner mb-2">
        <div className="bg-[#1a1c22] px-2.5 py-1 border-b-2 border-[#333] flex items-center justify-between text-xs mc-font text-[#aaa] shrink-0">
          <div className="flex items-center gap-1.5">
            <FileCode className="w-3.5 h-3.5 text-[#ffd700]" />
            <span className="text-[9.5px] text-white">BOOK & QUILL: git diff</span>
            <span className="text-[8px] text-[#777] font-sans">(Preview)</span>
          </div>
          <button
            type="button"
            onClick={() => setIsExpandedModalOpen(true)}
            className="text-[8.5px] text-[#55ffff] hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
            title="Inspect side-by-side full code diff"
          >
            <Maximize2 className="w-2.5 h-2.5" />
            <span>FULL DIFF ➔</span>
          </button>
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
              <div key={idx} className={`font-mono text-[11px] whitespace-pre ${rowClass}`}>
                {line}
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Detected Architectural Risks Accordion */}
      <div className="shrink-0">
        <button
          onClick={() => setShowRiskScanner(!showRiskScanner)}
          className="w-full flex items-center justify-between px-2.5 py-1.5 bg-[#252525] hover:bg-[#2d2d2d] border border-[#444] text-[9.5px] mc-font text-[#ffd700] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-[#ffaa00]" />
            <span>DETECTED ARCHITECTURE TELEMETRY</span>
          </div>
          {showRiskScanner ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showRiskScanner && (
          <div className="mt-1 p-2 bg-[#251505] border-2 border-[#aa5500] text-[10px] text-[#ffddaa] mc-font leading-relaxed">
            <strong className="text-[#ffd700] block mb-0.5">SUSPECT PATTERN:</strong>
            {stage.hidden_risks}
          </div>
        )}
      </div>

      {/* 6. Expanded Single-Screen Inspection Modal */}
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

            {/* Split: Story/Telemetry on Left, Code Diff on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 flex-1 min-h-0 overflow-hidden">
              <div className="lg:col-span-5 flex flex-col justify-between gap-2.5 min-h-0 overflow-y-auto pr-1">
                <div className="space-y-1.5">
                  <h3 className="text-sm sm:text-base font-bold text-[#ffff55] mc-font leading-snug">
                    {stage.title}
                  </h3>
                  <p className="text-xs text-[#ddd] leading-relaxed font-sans select-text">
                    {stage.story}
                  </p>
                </div>

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
