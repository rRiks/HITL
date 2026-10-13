import React, { useState, useEffect } from 'react';
import {
  Play,
  Users,
  Zap,
  User,
} from 'lucide-react';
import { fetchGameState, getPlayerName, setPlayerName } from '../services/api';
import CockpitFieldGuide from './CockpitFieldGuide';

const TEAM_SUGGESTIONS = [
  'Alpha Devs',
  'Byte Busters',
  'Apex SREs',
  'Cloud Titans',
];

function slugifyTeam(name) {
  const clean = (name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return clean || 'alpha-devs';
}

export default function WelcomeScreen({ onStartGame, onJoinLiveTable, defaultRoomId }) {
  const [teamName, setTeamName] = useState('Cloud Titans');
  const [playerName, setPlayerNameState] = useState(getPlayerName() || 'Dev');
  const [playerCount, setPlayerCount] = useState(4);
  const [tableStatus, setTableStatus] = useState(null);

  // Flow State: 'setup' -> 'walkthrough'
  const [step, setStep] = useState('setup');
  const [pendingLaunch, setPendingLaunch] = useState(null);

  const derivedRoomId = slugifyTeam(teamName);

  useEffect(() => {
    let isCurrent = true;
    const checkTable = async () => {
      try {
        const state = await fetchGameState(derivedRoomId);
        if (!isCurrent) return;
        if (state && (state.has_started || state.current_stage_index > 0 || state.health < 100 || state.total_jenga_pulls > 0)) {
          setTableStatus({
            isLive: true,
            teamName: state.team_name,
            stage: state.current_stage_index + 1,
            health: state.health,
            totalStages: state.total_stages,
          });
        } else {
          setTableStatus({ isLive: false });
        }
      } catch {
        if (isCurrent) setTableStatus({ isLive: false });
      }
    };

    checkTable();
    const interval = setInterval(checkTable, 3000);
    return () => {
      isCurrent = false;
      clearInterval(interval);
    };
  }, [derivedRoomId]);

  const handleProceedToWalkthrough = (isJoin = false) => {
    const finalPlayer = (playerName || '').trim() || 'Dev';
    const finalTeam = (teamName || '').trim() || 'Cloud Titans';
    setPlayerName(finalPlayer);
    setPendingLaunch({ team: finalTeam, count: playerCount, room: derivedRoomId, player: finalPlayer, isJoin });
    setStep('walkthrough');
  };

  const handleLaunchGame = () => {
    if (!pendingLaunch) return;
    if (pendingLaunch.isJoin && onJoinLiveTable) {
      onJoinLiveTable(pendingLaunch.room, pendingLaunch.player);
    } else {
      onStartGame(pendingLaunch.team, pendingLaunch.count, pendingLaunch.room, pendingLaunch.player);
    }
  };

  if (step === 'walkthrough') {
    return (
      <CockpitFieldGuide
        onClose={() => setStep('setup')}
        onLaunchGame={handleLaunchGame}
        isWalkthrough={true}
        teamName={pendingLaunch?.team || 'Cloud Titans'}
      />
    );
  }

  return (
    <div className="h-screen max-h-screen overflow-hidden bg-mc-dirt text-white flex flex-col justify-between py-2 sm:py-3 px-3 sm:px-6 select-none">
      <div className="max-w-lg mx-auto w-full my-auto flex flex-col justify-center">
        {/* Minecraft Title Header & Yellow Splash Text */}
        <div className="text-center mb-2.5 sm:mb-3 relative shrink-0">
          <div className="relative inline-block mb-1 sm:mb-2">
            <h1 className="text-2xl sm:text-4xl font-black tracking-widest text-[#e0e0e0] mc-font drop-shadow-[0_4px_0_#222]">
              MINECRAFT <span className="text-[#ffd700]">AIDLC</span>
            </h1>
            {/* Bouncing Classic Minecraft Yellow Splash Text */}
            <div
              className="absolute -bottom-2.5 -right-3 sm:-right-6 text-[10px] sm:text-xs text-[#ffff00] font-mono font-bold drop-shadow-[0_2px_0_#000] rotate-[-12deg] animate-bounce pointer-events-none whitespace-nowrap z-10"
              style={{ animationDuration: '0.9s' }}
            >
              Don't dig into Governor limits!
            </div>
          </div>

          <p className="text-[11px] sm:text-xs text-[#ccc] max-w-lg mx-auto leading-snug mt-1 font-mono">
            Balance sprint velocity, code quality, and the stability of your <strong>3D Voxel Tower</strong> across 11 high-pressure stages.
          </p>
        </div>

        {/* Start Your Adventure Card (Clean Dark Minecraft Panel: ZERO rules clutter) */}
        <div className="mc-panel-dark p-4 sm:p-5 shadow-2xl border-4 border-[#333]">
          <div className="text-center mb-3">
            <h2 className="text-base sm:text-lg font-bold text-[#ffd700] mc-font tracking-wide">
              START YOUR ADVENTURE
            </h2>
            <p className="text-[11px] text-[#aaa] font-mono mt-0.5">
              Enter your team name to begin or join your squad
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleProceedToWalkthrough(false);
            }}
            className="space-y-3 sm:space-y-3.5"
          >
            {/* Team Name Input with Quick Chips */}
            <div>
              <label className="block text-[11px] font-mono font-bold text-[#ffd700] uppercase mb-1">
                Team Name
              </label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g. Cloud Titans, Alpha Devs..."
                className="w-full bg-[#111] border-2 border-[#555] text-white px-3 py-2 text-xs sm:text-sm font-mono focus:outline-none focus:border-[#ffd700] transition-colors"
                required
              />

              {/* Quick suggestions */}
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                <span className="text-[9px] text-[#888] font-mono">Quick Pick:</span>
                {TEAM_SUGGESTIONS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setTeamName(preset)}
                    className={`text-[9px] font-mono px-2 py-0.5 border transition-all cursor-pointer ${teamName === preset
                      ? 'bg-[#332200] border-[#ffd700] text-[#ffd700]'
                      : 'bg-[#222] border-[#444] text-[#ccc] hover:border-[#666]'
                      }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Player Name */}
            <div>
              <label className="block text-[11px] font-mono font-bold text-[#ffd700] uppercase mb-1 flex items-center gap-1.5">
                <User className="w-3 h-3 text-[#ffd700]" />
                <span>Your Name (Gamer Tag)</span>
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerNameState(e.target.value)}
                placeholder="e.g. Dev, Steve, Alex..."
                className="w-full bg-[#111] border-2 border-[#555] text-white px-3 py-2 text-xs sm:text-sm font-mono focus:outline-none focus:border-[#ffd700] transition-colors"
                required
              />
            </div>

            {/* Team Size */}
            <div>
              <label className="block text-[11px] font-mono font-bold text-[#ffd700] uppercase mb-1">
                Team Size
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[2, 3, 4, 5].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setPlayerCount(cnt)}
                    className={`mc-btn py-1.5 text-[11px] font-mono cursor-pointer ${playerCount === cnt ? 'mc-btn-green text-white font-bold' : ''
                      }`}
                  >
                    {cnt} Players
                  </button>
                ))}
              </div>
            </div>

            {/* Live Session Status / Actions */}
            <div className="pt-1">
              {tableStatus?.isLive ? (
                <div className="space-y-2">
                  <div className="p-2 bg-[#132813] border-2 border-[#2d5a2d] text-white flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-[#55ff55] animate-ping shrink-0 inline-block" />
                      <div>
                        <span className="text-[9px] font-mono text-[#55ff55] uppercase font-bold block">
                          SESSION ACTIVE • GAME IN PROGRESS
                        </span>
                        <p className="text-[11px] text-white font-mono font-bold">
                          {tableStatus.teamName} • Stage {tableStatus.stage}/{tableStatus.totalStages} • {tableStatus.health}% HP
                        </p>
                      </div>
                    </div>
                    <span className="text-[8.5px] font-mono text-[#55ff55] bg-[#111] px-1.5 py-0.5 border border-[#2d5a2d]">
                      LIVE
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleProceedToWalkthrough(true)}
                    className="mc-btn mc-btn-green w-full py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white flex items-center justify-center gap-2 cursor-pointer shadow-lg tracking-wider"
                  >
                    <Users className="w-4 h-4" />
                    <span>JOIN ACTIVE SQUAD ➔</span>
                  </button>

                  <div className="text-center pt-0.5">
                    <button
                      type="submit"
                      className="text-[10px] font-mono text-[#888] hover:text-[#ff5555] underline cursor-pointer"
                    >
                      Or reset and start fresh game for this team
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="submit"
                  className="mc-btn mc-btn-green w-full py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white flex items-center justify-center gap-2 cursor-pointer shadow-xl tracking-wider"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>START GAME ➔</span>
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-[9px] font-mono text-[#888] shrink-0 py-1">
        Developer Day Workshop Edition • Real-Time 3D Voxel AIDLC Simulation
      </footer>
    </div>
  );
}
