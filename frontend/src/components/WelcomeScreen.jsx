import React, { useState, useEffect } from 'react';
import { Play, Shield, Users, Clock, Flame, Zap, Award, BookOpen, Rotate3d, Layers, Hash, Link2, Check, User } from 'lucide-react';
import { getRoomId, fetchGameState, getPlayerName, setPlayerName } from '../services/api';

const TABLE_PRESETS = [
  { id: 'table-1', label: 'Table 1', defaultTeam: 'Table 1: Alpha Devs' },
  { id: 'table-2', label: 'Table 2', defaultTeam: 'Table 2: Byte Busters' },
  { id: 'table-3', label: 'Table 3', defaultTeam: 'Table 3: Apex SREs' },
  { id: 'table-4', label: 'Table 4', defaultTeam: 'Table 4: Quantum Ops' },
  { id: 'table-5', label: 'Table 5', defaultTeam: 'Table 5: Data Titans' },
];

export default function WelcomeScreen({ onStartGame, onJoinLiveTable, defaultRoomId }) {
  const initialRoom = (defaultRoomId || getRoomId() || 'table-1').toLowerCase();
  const matchedInitial = TABLE_PRESETS.find((t) => t.id === initialRoom) || TABLE_PRESETS[0];

  const [roomId, setRoomId] = useState(matchedInitial.id);
  const [teamName, setTeamName] = useState(matchedInitial.defaultTeam);
  const [playerName, setPlayerNameState] = useState(getPlayerName() || 'Dev');
  const [isCustomTeamName, setIsCustomTeamName] = useState(false);
  const [playerCount, setPlayerCount] = useState(4);
  const [tableStatus, setTableStatus] = useState(null);

  useEffect(() => {
    let isCurrent = true;
    const checkTable = async () => {
      try {
        const state = await fetchGameState(roomId);
        if (!isCurrent) return;
        if (state && (state.has_started || state.current_stage_index > 0 || state.health < 100 || state.total_jenga_pulls > 0)) {
          setTableStatus({
            isLive: true,
            teamName: state.team_name,
            stage: state.current_stage_index + 1,
            health: state.health,
            totalStages: state.total_stages,
          });
          if (!isCustomTeamName) {
            setTeamName(state.team_name);
          }
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
  }, [roomId, isCustomTeamName]);

  const handleSelectTablePreset = (preset) => {
    setRoomId(preset.id);
    setTeamName(preset.defaultTeam);
    setIsCustomTeamName(false);
  };

  const handleRoomIdChange = (e) => {
    const val = e.target.value;
    setRoomId(val);
    const matchedPreset = TABLE_PRESETS.find((t) => t.id === val.toLowerCase().trim());
    if (matchedPreset) {
      setTeamName(matchedPreset.defaultTeam);
    } else if (!isCustomTeamName) {
      const formatted = val
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      setTeamName(formatted ? `Team ${formatted}` : 'Alpha Devs');
    }
  };

  const handleTeamNameChange = (e) => {
    setTeamName(e.target.value);
    setIsCustomTeamName(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalPlayer = (playerName || '').trim() || 'Dev';
    setPlayerName(finalPlayer);
    onStartGame(teamName.trim() || 'Alpha Devs', playerCount, roomId.trim().toLowerCase() || 'table-1', finalPlayer);
  };

  const handleJoin = () => {
    const finalPlayer = (playerName || '').trim() || 'Dev';
    setPlayerName(finalPlayer);
    if (onJoinLiveTable) {
      onJoinLiveTable(roomId, finalPlayer);
    } else {
      onStartGame(teamName, playerCount, roomId, finalPlayer);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f4ed] text-stone-900 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 bg-mesh-radial select-none">
      <div className="max-w-4xl mx-auto w-full">
        {/* Hero Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-mono font-bold uppercase tracking-wider mb-4 shadow-xs">
            <Zap className="w-3.5 h-3.5 text-amber-700" />
            <span>Developer Day // 45-Minute SDLC Workshop Game</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-black text-stone-900 tracking-tight mb-4 font-display">
            Human-in-the-Loop <span className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 bg-clip-text text-transparent">Jenga</span>
          </h1>

          <p className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto font-sans leading-relaxed">
            AI-Paced Software Development Under Extreme Pressure. Balance sprint velocity, architectural resilience, and the stability of your <strong>Real-Time 3D Virtual Architecture Tower</strong> across 11 critical Salesforce SDLC stages.
          </p>
        </div>

        {/* 4 Core Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          <div className="glass-panel rounded-3xl p-6 shadow-md border border-[#e5dec9] hover:border-amber-400 transition-colors">
            <div className="flex items-center gap-3 mb-2.5">
              <div className="p-2.5 rounded-2xl bg-amber-100 border border-amber-300 text-amber-800 shadow-xs">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-stone-900 text-base font-display">2-Minute Stage Chronometer</h3>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed font-sans">
              Strict <strong>02:00</strong> countdown per stage. Turns flashing red under 30s. If the timer hits zero, a <strong>Timeout Penalty</strong> automatically forces blind deploy with -10% health and double block extractions!
            </p>
          </div>

          <div className="glass-panel rounded-3xl p-6 shadow-md border border-[#e5dec9] hover:border-amber-400 transition-colors">
            <div className="flex items-center gap-3 mb-2.5">
              <div className="p-2.5 rounded-2xl bg-amber-100 border border-amber-300 text-amber-800 shadow-xs">
                <Rotate3d className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-stone-900 text-base font-display">3D Virtual Architecture Tower</h3>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed font-sans">
              Rendered in real-time WebGL with 54 architectural subsystem components across <strong>Security, Apex Governors, Async Events, and LWC</strong>. Watch the 3D model rotate and visibly slide out blocks as technical debt accumulates!
            </p>
          </div>

          <div className="glass-panel rounded-3xl p-6 shadow-md border border-[#e5dec9] hover:border-emerald-400 transition-colors">
            <div className="flex items-center gap-3 mb-2.5">
              <div className="p-2.5 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-800 shadow-xs">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-stone-900 text-base font-display">100% Application Health</h3>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed font-sans">
              System health starts at 100%. Blind velocity or unmitigated security vulnerabilities degrade health. If health hits <strong>0%</strong> or the tower topples, you trigger a Catastrophic Production Outage.
            </p>
          </div>

          <div className="glass-panel rounded-3xl p-6 shadow-md border border-[#e5dec9] hover:border-amber-400 transition-colors">
            <div className="flex items-center gap-3 mb-2.5">
              <div className="p-2.5 rounded-2xl bg-amber-100 border border-amber-300 text-amber-800 shadow-xs">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-stone-900 text-base font-display">4 Strategic Action Paths</h3>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed font-sans">
              Choose wisely as a team: <em>Blind Velocity</em> (immediate merge), <em>Bypass & Skip</em> (safe skip), <em>Human Guidance</em> (custom steering), or <em>Guardrail Armor</em> (institutional governance standard). Health impacts and block extraction outcomes are revealed upon deployment!
            </p>
          </div>
        </div>

        {/* Team & Room Registration Form */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-xl max-w-xl mx-auto border border-[#e5dec9]">
          <h2 className="text-2xl font-black text-stone-900 text-center mb-6 font-display">
            Team Setup & Deployment Ready
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Table / Room Selection */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-mono text-stone-700 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-amber-600" />
                  <span>Choose Your Workshop Table</span>
                </label>
                <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-bold flex items-center gap-1">
                  <Link2 className="w-3 h-3 text-emerald-600" />
                  <span>Auto-links Team Name</span>
                </span>
              </div>

              {/* Quick Preset Buttons */}
              <div className="grid grid-cols-5 gap-2 mb-2.5">
                {TABLE_PRESETS.map((t) => {
                  const isSelected = roomId.toLowerCase() === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleSelectTablePreset(t)}
                      className={`py-2 px-1 rounded-xl text-xs font-mono font-black border transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                        isSelected
                          ? 'bg-amber-100 border-amber-500 text-amber-950 shadow-sm ring-2 ring-amber-400/40'
                          : 'bg-white border-[#ded5c5] text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                      }`}
                    >
                      <span>{t.label}</span>
                      {isSelected && <Check className="w-3 h-3 text-amber-700" />}
                    </button>
                  );
                })}
              </div>

              {/* Editable Room / Lobby Code */}
              <div className="relative">
                <input
                  type="text"
                  value={roomId}
                  onChange={handleRoomIdChange}
                  placeholder="e.g., table-1, table-2, squad-alpha"
                  className="w-full bg-white border border-[#ded5c5] focus:border-amber-500 rounded-2xl px-4 py-2.5 text-xs text-stone-900 font-mono placeholder-stone-400 focus:outline-none transition-all shadow-inner"
                  required
                />
                <span className="absolute right-3.5 top-2.5 text-[10px] font-mono text-stone-400 pointer-events-none">
                  Room Key
                </span>
              </div>
            </div>

            {/* Auto-Linked Team Name */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-mono text-stone-700 uppercase tracking-wider font-semibold">
                  Team Display Name
                </label>
                <span className="text-[10px] font-mono text-stone-500">
                  {isCustomTeamName ? 'Customized' : 'Auto-filled from Table'}
                </span>
              </div>
              <input
                type="text"
                value={teamName}
                onChange={handleTeamNameChange}
                placeholder="e.g., Table 1: Alpha Devs"
                className="w-full bg-white border border-[#ded5c5] focus:border-amber-500 rounded-2xl px-4 py-3 text-sm text-stone-900 font-mono placeholder-stone-400 focus:outline-none transition-all shadow-inner"
                required
              />
              <p className="text-[11px] text-stone-500 font-sans mt-1">
                Shown on the live workshop leaderboard ticker and completion certificates.
              </p>
            </div>

            {/* Individual Player Name Input */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-mono text-stone-700 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-600" />
                  <span>Your Display Name (Teammate Ballot)</span>
                </label>
                <span className="text-[10px] font-mono text-stone-500">
                  Individual Chip
                </span>
              </div>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerNameState(e.target.value)}
                placeholder="e.g., Alice, Bob, Dev..."
                className="w-full bg-white border border-[#ded5c5] focus:border-amber-500 rounded-2xl px-4 py-3 text-sm text-stone-900 font-mono placeholder-stone-400 focus:outline-none transition-all shadow-inner"
                required
              />
              <p className="text-[11px] text-stone-500 font-sans mt-1">
                Teammates at your table will see your live vote badge and drafted prompts.
              </p>
            </div>

            {/* Players count */}
            <div>
              <label className="block text-xs font-mono text-stone-700 uppercase tracking-wider mb-2 font-semibold">
                Players in Team (Recommended: 3 - 5)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[2, 3, 4, 5].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setPlayerCount(cnt)}
                    className={`py-2.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                      playerCount === cnt
                        ? 'bg-gradient-to-r from-amber-600 to-amber-700 border-amber-600 text-white shadow-md shadow-amber-600/30'
                        : 'bg-white border-[#ded5c5] text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {cnt} Players
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              {tableStatus?.isLive ? (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-stone-900 shadow-xs flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                      <div>
                        <span className="text-[10px] font-mono font-black text-emerald-800 uppercase tracking-wider block">
                          LIVE TABLE ACTIVE • TEAM IN PROGRESS
                        </span>
                        <p className="text-xs font-black text-stone-900 font-mono">
                          {tableStatus.teamName} • Stage {tableStatus.stage}/{tableStatus.totalStages} • {tableStatus.health}% HP
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-black text-emerald-800 bg-white px-2 py-0.5 rounded-md border border-emerald-300 shadow-xs">
                      LIVE
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleJoin}
                    className="w-full py-4 px-6 rounded-2xl font-extrabold text-base bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-emerald-600/25 cursor-pointer active:scale-98 font-display"
                  >
                    <Users className="w-5 h-5" />
                    <span>Join Live Session as Teammate ➔</span>
                  </button>

                  <div className="text-center pt-0.5">
                    <button
                      type="submit"
                      className="text-[11px] font-mono text-stone-500 hover:text-rose-600 underline cursor-pointer"
                    >
                      Or restart & launch a fresh game for this table
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="submit"
                  className="w-full py-4 px-6 rounded-2xl font-extrabold text-base bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 hover:from-amber-500 hover:to-amber-700 text-white flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-amber-600/25 cursor-pointer active:scale-98 font-display"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>Launch Stage 1: The Governor Limit Trap</span>
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs font-mono text-stone-500 mt-10">
        Developer Day Workshop Edition • Real-Time 3D Virtual Jenga Simulation
      </footer>
    </div>
  );
}
