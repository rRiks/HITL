import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  Zap,
  RotateCcw,
  FastForward,
  Heart,
  AlertTriangle,
  Play,
  Pause,
  ExternalLink,
  Radio,
  BookOpen,
  BarChart3,
  Layers,
  Users,
  Search,
  RefreshCw,
  Home,
  Check,
  X,
  Volume2,
  Sun,
  Moon,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  ArrowLeft,
  Trash2,
  Palette,
} from 'lucide-react';
import * as adminApi from './adminApi';
import CockpitFieldGuide from '../components/CockpitFieldGuide';
import ThemeManager from './ThemeManager';

const BROADCAST_PRESETS = [
  '⚡ 5-minute warning: Cast your consensus votes now!',
  '⚠️ Pro-Tip: Inspect Telemetry to detect hidden governor limits!',
  '☕ Workshop Break: World clocks paused for speaker recap.',
  '🏆 Final Stage Sprint: First squad to merge Stage 11 takes the podium!',
];

export default function AdminDashboard({ onNavigate, theme = 'dark', onToggleTheme }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!adminApi.getAdminKey());
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [showPasscode, setShowPasscode] = useState(false);
  const [showFieldGuide, setShowFieldGuide] = useState(false);

  const [activeTab, setActiveTab] = useState('squads'); // 'squads' | 'analytics' | 'themes'
  const [rooms, setRooms] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [activeBroadcast, setActiveBroadcast] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [confirmResetAll, setConfirmResetAll] = useState(false);
  const [tableToDelete, setTableToDelete] = useState(null);
  const [globalTimerPaused, setGlobalTimerPaused] = useState(false);
  const [themeConfig, setThemeConfig] = useState({ theme: 'minecraft', mode: 'dark' });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = useCallback(async () => {
    const key = adminApi.getAdminKey();
    if (!key) {
      setIsAuthenticated(false);
      return;
    }
    try {
      const data = await adminApi.fetchAllRooms();
      setRooms(data.rooms || []);
      setActiveBroadcast(data.global_announcement);
      setGlobalTimerPaused(!!data.global_timer_paused);
      if (data.global_theme) {
        setThemeConfig({
          theme: data.global_theme.theme || 'minecraft',
          mode: data.global_theme.mode || 'dark',
        });
      }
      setIsAuthenticated(true);
    } catch (err) {
      if (err.message === '401_UNAUTHORIZED') {
        adminApi.clearAdminKey();
        setIsAuthenticated(false);
        showToast('Session expired or unauthorized. Please re-enter Game Master Key.');
      } else {
        console.error('Failed to load admin rooms:', err);
      }
    }
  }, []);

  const loadAnalytics = useCallback(async () => {
    if (!adminApi.getAdminKey()) return;
    try {
      const data = await adminApi.fetchAnalytics();
      setAnalytics(data);
    } catch (err) {
      if (err.message === '401_UNAUTHORIZED') {
        setIsAuthenticated(false);
      } else {
        console.error('Failed to load analytics:', err);
      }
    }
  }, []);

  // Poll active rooms every 2.5s only when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
      const interval = setInterval(loadData, 2500);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, loadData]);

  useEffect(() => {
    if (isAuthenticated && activeTab === 'analytics') loadAnalytics();
  }, [isAuthenticated, activeTab, loadAnalytics]);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!passcode.trim()) {
      setAuthError('Please enter the Game Master passcode.');
      return;
    }
    try {
      setAuthLoading(true);
      setAuthError('');
      await adminApi.verifyAdminPasscode(passcode);
      setIsAuthenticated(true);
      setPasscode('');
      showToast('Game Master identity confirmed. Console unlocked.');
      loadData();
    } catch (err) {
      setAuthError(err.message || 'Invalid Game Master Passcode.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    adminApi.clearAdminKey();
    setIsAuthenticated(false);
    showToast('Game Master console locked.');
  };

  // Handlers for room interventions
  const handleRoomAction = async (roomId, action, delta = 0, pulls = 1) => {
    try {
      const res = await adminApi.sendRoomAction(roomId, action, delta, pulls);
      showToast(res.message || 'Action executed.');
      loadData();
    } catch (err) {
      showToast(`Error: ${err.message}`);
    }
  };

  // Broadcast handlers
  const handleSendBroadcast = async (msg = broadcastMessage) => {
    if (!msg.trim()) return;
    try {
      await adminApi.broadcastAnnouncement(msg.trim());
      showToast('Global announcement broadcasted to all player HUDs!');
      setBroadcastMessage('');
      loadData();
    } catch (err) {
      showToast(`Failed to broadcast: ${err.message}`);
    }
  };

  const handleClearBroadcast = async () => {
    try {
      await adminApi.clearBroadcast();
      showToast('Global announcement dismissed.');
      loadData();
    } catch (err) {
      showToast(`Failed: ${err.message}`);
    }
  };

  const handleResetAll = async () => {
    try {
      setLoading(true);
      const res = await adminApi.resetAllRooms();
      showToast(res.message || 'All workshop tables reset.');
      setConfirmResetAll(false);
      loadData();
    } catch (err) {
      showToast(`Reset failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleGlobalTimer = async () => {
    try {
      const res = await adminApi.toggleGlobalTimer();
      setGlobalTimerPaused(res.global_timer_paused);
      showToast(res.message);
      loadData();
    } catch (err) {
      showToast(`Global timer error: ${err.message}`);
    }
  };

  const handleToggleRoomTimer = async (roomId) => {
    try {
      const res = await adminApi.toggleRoomTimer(roomId);
      showToast(res.message);
      loadData();
    } catch (err) {
      showToast(`Room timer error: ${err.message}`);
    }
  };

  // Filtered rooms
  const filteredRooms = rooms.filter((r) => {
    const matchesSearch =
      r.team_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.room_id.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') return !r.is_game_over && !r.is_victory;
    if (statusFilter === 'critical') return r.health <= 35 && !r.is_game_over;
    if (statusFilter === 'collapsed') return r.is_game_over;
    if (statusFilter === 'victorious') return r.is_victory;
    return true;
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0e1117] text-white flex flex-col font-sans select-none admin-console-root">
        {/* Top Header with Back & Theme */}
        <header className="h-[62px] bg-[#141822] border-b-2 border-[#2b3245] px-4 sm:px-6 flex items-center justify-between gap-3 shrink-0 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#8b1818] border-2 border-[#ff4444] flex items-center justify-center shadow-md">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-[#ffd700] mc-font tracking-wide">
                COMMAND BLOCK CONSOLE
              </h1>
              <span className="text-[9px] font-mono text-[#ffaa00]">
                RESTRICTED ACCESS • GAME MASTER ONLY
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onToggleTheme && (
              <button
                type="button"
                onClick={onToggleTheme}
                title={theme === 'light' ? 'Switch to Dark Realm' : 'Switch to Light Realm'}
                className="mc-btn px-2.5 py-1.5 text-[10px] mc-font flex items-center gap-1.5 cursor-pointer"
              >
                {theme === 'light' ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-[#fbbf24]" />
                    <span className="text-[#fbbf24]">LIGHT</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-[#38bdf8]" />
                    <span className="text-[#38bdf8]">DARK</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => onNavigate?.('home')}
              className="mc-btn px-3 py-1.5 text-[10px] mc-font text-[#aaa] hover:text-white flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>RETURN TO LOBBY</span>
            </button>
          </div>
        </header>

        {/* Security Gate Form */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="mc-panel-dark max-w-md w-full p-6 sm:p-8 shadow-2xl border-4 border-[#ffaa00] text-center animate-fadeIn relative">
            <div className="w-14 h-14 mx-auto mb-3 bg-[#251505] border-2 border-[#ffaa00] flex items-center justify-center shadow-md">
              <Lock className="w-7 h-7 text-[#ffd700] animate-pulse" />
            </div>

            <h2 className="text-base sm:text-lg font-bold text-white mc-font tracking-wide mb-1">
              GAME MASTER SECURITY GATE
            </h2>
            <p className="text-xs text-[#aaa] font-mono mb-5 leading-relaxed">
              Enter the facilitator key to unlock the Command Block Console and event orchestration controls.
            </p>

            {authError && (
              <div className="mb-4 p-2.5 bg-[#3a0808] border-2 border-[#ff3333] text-[#ff8888] text-xs font-mono flex items-center gap-2 text-left">
                <AlertTriangle className="w-4 h-4 text-[#ff5555] shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="w-4 h-4 text-[#888]" />
                </div>
                <input
                  type={showPasscode ? 'text' : 'password'}
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter Game Master Passcode..."
                  className="w-full bg-[#0b0e14] border-2 border-[#555] text-white pl-9 pr-10 py-2.5 text-xs sm:text-sm font-mono tracking-wider focus:outline-none focus:border-[#ffd700] transition-colors"
                  autoFocus
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasscode(!showPasscode)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#888] hover:text-white cursor-pointer"
                  title={showPasscode ? 'Hide passcode' : 'Show passcode'}
                >
                  {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="mc-btn mc-btn-green w-full py-3 text-xs sm:text-sm font-bold text-white flex items-center justify-center gap-2 cursor-pointer shadow-xl tracking-wider disabled:opacity-50"
              >
                <Lock className="w-4 h-4" />
                <span>{authLoading ? 'VERIFYING KEY...' : 'AUTHENTICATE [ENTER] ➔'}</span>
              </button>
            </form>

            <div className="mt-5 pt-3 border-t border-[#333] text-[10px] text-[#777] font-mono leading-relaxed">
              <span>Restricted console. Facilitator access only.</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0e1117] text-white flex flex-col font-sans select-none admin-console-root">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#1e2330] border-2 border-[#ffd700] text-[#ffd700] px-4 py-2 text-xs font-mono shadow-2xl flex items-center gap-2 animate-bounce">
          <Zap className="w-4 h-4 text-[#ffd700]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Game Master Navigation Bar */}
      <header className="h-[62px] bg-[#141822] border-b-2 border-[#2b3245] px-4 sm:px-6 flex items-center justify-between gap-3 shrink-0 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#8b1818] border-2 border-[#ff4444] flex items-center justify-center shadow-md">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-[#ffd700] mc-font tracking-wide">
                COMMAND BLOCK CONSOLE
              </h1>
              <span className="text-[9px] font-mono px-2 py-0.5 bg-[#251505] text-[#ffaa00] border border-[#ffaa00] font-bold">
                GAME MASTER (GM)
              </span>
            </div>
            <p className="text-[10px] text-[#8e98ad] font-mono hidden sm:block">
              Multi-Room Event Facilitator & Chaos Orchestration Center
            </p>
          </div>
        </div>

        {/* Global Summary Stats */}
        <div className="hidden lg:flex items-center gap-4 text-xs font-mono bg-[#0b0e14] px-3.5 py-1.5 border border-[#232a3d]">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span className="text-[#8e98ad]">Active Players:</span>
            <strong className="text-[#38bdf8]">
              {rooms.reduce((acc, r) => acc + (r.active_players_count ?? r.active_players?.length ?? 0), 0)}
            </strong>
          </div>
          <div className="w-px h-3 bg-[#333]" />
          <div className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-[#55ff55]" />
            <span className="text-[#8e98ad]">Active Tables:</span>
            <strong className="text-white">{rooms.length}</strong>
          </div>
          <div className="w-px h-3 bg-[#333]" />
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#ffd700]" />
            <span className="text-[#8e98ad]">Total Mined Blocks:</span>
            <strong className="text-[#ffd700]">{rooms.reduce((acc, r) => acc + (r.total_pulls || 0), 0)}</strong>
          </div>
        </div>

        {/* Action Shortcuts */}
        <div className="flex items-center gap-2">
          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              title={theme === 'light' ? 'Switch to Dark Realm' : 'Switch to Light Realm'}
              className="mc-btn px-2.5 py-1.5 text-[10px] mc-font flex items-center gap-1.5 cursor-pointer"
            >
              {theme === 'light' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-[#fbbf24]" />
                  <span className="text-[#fbbf24]">LIGHT</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-[#38bdf8]" />
                  <span className="text-[#38bdf8]">DARK</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => onNavigate?.('home')}
            title="Return to Player Lobby"
            className="mc-btn px-2.5 py-1.5 text-[10px] mc-font text-[#aaa] hover:text-white flex items-center gap-1.5 cursor-pointer"
          >
            <Home className="w-3 h-3 text-[#aaa]" />
            <span>LOBBY</span>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            title="Lock Game Master Console"
            className="mc-btn px-2.5 py-1.5 text-[10px] mc-font text-[#ff6666] hover:text-white border-[#ff4444] bg-[#2a0808] flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
          >
            <Lock className="w-3 h-3 text-[#ff6666]" />
            <span>LOCK</span>
          </button>
          <button
            type="button"
            onClick={() => setShowFieldGuide(true)}
            className="mc-btn px-2.5 py-1.5 text-[10px] mc-font text-[#55ffff] hover:text-white flex items-center gap-1.5 cursor-pointer bg-[#0c1c28] border-[#38bdf8]"
          >
            <BookOpen className="w-3 h-3 text-[#55ffff]" />
            <span>FIELD GUIDE</span>
          </button>
        </div>
      </header>

      {/* Global Broadcast & Alert Bar */}
      <div className="bg-[#191d29] border-b border-[#2b3245] px-4 sm:px-6 py-2.5">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1">
            <Radio className="w-4 h-4 text-[#ff5555] animate-pulse shrink-0" />
            <span className="text-[10px] font-mono text-[#ff8888] font-bold uppercase whitespace-nowrap">
              REALM BROADCAST:
            </span>
            <input
              type="text"
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              placeholder="Type urgent facilitator message to all player screens..."
              className="flex-1 bg-[#0b0e14] border border-[#38435d] text-white text-xs font-mono px-3 py-1.5 focus:outline-none focus:border-[#ffd700]"
              onKeyDown={(e) => e.key === 'Enter' && handleSendBroadcast()}
            />
            <button
              type="button"
              onClick={() => handleSendBroadcast()}
              className="mc-btn mc-btn-green px-3 py-1.5 text-[10px] mc-font text-white cursor-pointer whitespace-nowrap"
            >
              SEND ALERT ➔
            </button>
          </div>

          {/* Quick Presets & Clear */}
          <div className="flex items-center gap-2 shrink-0">
            {activeBroadcast && (
              <div className="flex items-center gap-2 bg-[#2d1111] border border-[#ff3333] px-2.5 py-1 text-[10px] font-mono">
                <span className="text-[#ff9999] truncate max-w-xs">Live: "{activeBroadcast.message}"</span>
                <button
                  type="button"
                  onClick={handleClearBroadcast}
                  className="text-[#ff5555] hover:text-white font-bold ml-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={handleToggleGlobalTimer}
              className={`mc-btn px-2.5 py-1.5 text-[9px] mc-font flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-sm transition-all ${
                globalTimerPaused
                  ? 'text-[#ffd700] border-[#ffd700] bg-[#332200] animate-pulse'
                  : 'text-[#38bdf8] border-[#38bdf8] bg-[#0c1c28] hover:text-white'
              }`}
              title={globalTimerPaused ? 'Resume countdown timers across all tables in the workshop' : 'Freeze countdown timers across all tables in the workshop'}
            >
              {globalTimerPaused ? (
                <>
                  <Play className="w-3 h-3 text-[#ffd700]" />
                  <span>▶ RESUME ALL TIMERS</span>
                </>
              ) : (
                <>
                  <Pause className="w-3 h-3 text-[#38bdf8]" />
                  <span>⏸ PAUSE ALL TIMERS</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setConfirmResetAll(true)}
              className="mc-btn px-2.5 py-1.5 text-[9px] mc-font text-[#ff5555] hover:text-white border-[#ff3333] bg-[#2d0e0e] cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-3 h-3 inline mr-1" />
              RESET ALL ROOMS
            </button>
          </div>
        </div>

        {/* Quick Presets Chips */}
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          <span className="text-[9px] text-[#6d7890] font-mono">Quick Presets:</span>
          {BROADCAST_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendBroadcast(preset)}
              className="text-[9px] font-mono text-[#8e98ad] hover:text-[#ffd700] bg-[#0f131c] px-2 py-0.5 border border-[#2b3245] cursor-pointer hover:border-[#ffd700] transition-colors"
            >
              {preset.slice(0, 36)}...
            </button>
          ))}
        </div>
      </div>

      {/* Main Workspace Navigation Tabs */}
      <div className="px-4 sm:px-6 pt-3 pb-2 flex items-center justify-between border-b border-[#232a3d] bg-[#12151f]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('squads')}
            className={`px-3.5 py-1.5 text-xs font-mono font-bold border transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'squads'
                ? 'bg-[#ffd700] text-black border-[#ffd700]'
                : 'bg-[#181c28] text-[#8e98ad] border-[#2b3245] hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>LIVE SQUADS MATRIX ({rooms.length})</span>
          </button>



          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-1.5 text-xs font-mono font-bold border transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-[#ffd700] text-black border-[#ffd700]'
                : 'bg-[#181c28] text-[#8e98ad] border-[#2b3245] hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>WORKSHOP TELEMETRY</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('themes')}
            className={`px-3.5 py-1.5 text-xs font-mono font-bold border transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'themes'
                ? 'bg-[#ffd700] text-black border-[#ffd700]'
                : 'bg-[#181c28] text-[#8e98ad] border-[#2b3245] hover:text-white'
            }`}
          >
            <Palette className="w-3.5 h-3.5 text-[#ffd700]" />
            <span>THEME ENGINE</span>
          </button>
        </div>

        {/* Refresh button */}
        <button
          type="button"
          onClick={loadData}
          title="Force Telemetry Sync"
          className="text-xs font-mono text-[#8e98ad] hover:text-white flex items-center gap-1.5 bg-[#181c28] px-2.5 py-1 border border-[#2b3245] cursor-pointer"
        >
          <RefreshCw className="w-3 h-3 text-[#ffd700]" />
          <span className="hidden sm:inline">REFRESH</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
        {activeTab === 'squads' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#141822] p-3 border border-[#2b3245]">
              <div className="relative flex-1 max-w-md">
                <Search className="w-3.5 h-3.5 text-[#8e98ad] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter tables by name..."
                  className="w-full bg-[#0b0e14] border border-[#2b3245] text-white text-xs font-mono pl-9 pr-3 py-1.5 focus:outline-none focus:border-[#ffd700]"
                />
              </div>

              {/* Status Filter Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { id: 'all', label: 'All Tables' },
                  { id: 'active', label: 'Playing' },
                  { id: 'critical', label: 'Critical HP' },
                  { id: 'collapsed', label: 'Collapsed' },
                  { id: 'victorious', label: 'Victorious' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setStatusFilter(f.id)}
                    className={`text-[10px] font-mono px-2.5 py-1 border transition-colors cursor-pointer ${
                      statusFilter === f.id
                        ? 'bg-[#38435d] text-white font-bold border-[#ffd700]'
                        : 'bg-[#0f131c] text-[#8e98ad] border-[#2b3245] hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Squads Matrix Cards Grid */}
            {filteredRooms.length === 0 ? (
              <div className="text-center py-12 bg-[#12151f] border-2 border-dashed border-[#2b3245] p-6">
                <Users className="w-8 h-8 text-[#555] mx-auto mb-2" />
                <h3 className="text-sm font-mono text-[#8e98ad]">No active workshop tables match your filter.</h3>
                <p className="text-xs text-[#555] font-mono mt-1">
                  Start games via <code className="text-[#ffd700]">/home</code> or share room invite links.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredRooms.map((r) => {
                  const isDead = r.is_game_over;
                  const isWon = r.is_victory;
                  const isLow = r.health <= 35 && !isDead;

                  return (
                    <div
                      key={r.room_id}
                      className={`p-4 border-2 transition-all shadow-xl flex flex-col justify-between ${
                        isDead
                          ? 'bg-[#1a0e0e] border-[#ff3333]'
                          : isWon
                          ? 'bg-[#111a11] border-[#55ff55]'
                          : isLow
                          ? 'bg-[#221708] border-[#ffaa00] animate-pulse'
                          : 'bg-[#151924] border-[#2b3245] hover:border-[#ffd700]'
                      }`}
                    >
                      <div>
                        {/* Squad Header */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-sm sm:text-base font-bold text-white mc-font tracking-wide">
                                {r.team_name}
                              </h3>
                              <span className="text-[9.5px] font-mono px-1.5 py-0.5 bg-[#251505] text-[#ffd700] border border-[#ffaa00] font-bold tracking-wider">
                                PIN: {r.room_code || r.room_id}
                              </span>
                              {r.is_timer_paused && (
                                <span className="text-[9px] font-mono px-1.5 py-0.5 bg-[#332200] text-[#ffd700] border border-[#ffd700] font-bold flex items-center gap-1 animate-pulse">
                                  <Pause className="w-2.5 h-2.5 text-[#ffd700]" />
                                  <span>TIME PAUSED</span>
                                </span>
                              )}
                              <span className="text-[9px] font-mono px-1.5 py-0.5 bg-[#0c1c28] text-[#38bdf8] border border-[#1e3a5f] flex items-center gap-1">
                                <Users className="w-2.5 h-2.5 text-[#38bdf8]" />
                                <span>{r.active_players_count ?? r.active_players?.length ?? 0} active</span>
                              </span>
                            </div>
                            <span className="text-[10px] text-[#ffd700] font-mono block mt-0.5 font-bold">
                              {r.stage_title}
                            </span>
                          </div>

                          {/* Status Badge & Delete Icon */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span
                              className={`text-[9px] mc-font px-2 py-0.5 border uppercase font-bold ${
                                isDead
                                  ? 'bg-[#3a0000] text-[#ff5555] border-[#ff3333]'
                                  : isWon
                                  ? 'bg-[#003a00] text-[#55ff55] border-[#55ff55]'
                                  : isLow
                                  ? 'bg-[#331c00] text-[#ffaa00] border-[#ffaa00]'
                                  : 'bg-[#002233] text-[#55ffff] border-[#38bdf8]'
                              }`}
                            >
                              {isDead ? 'COLLAPSED' : isWon ? 'VICTORY' : isLow ? 'CRITICAL' : 'LIVE'}
                            </span>

                            <button
                              type="button"
                              onClick={() => setTableToDelete({ id: r.room_id, name: r.team_name, code: r.room_code || r.room_id })}
                              title="Delete Table"
                              className="text-[10px] text-[#ff6666] hover:text-white px-1.5 py-0.5 bg-[#250a0a] border border-[#661111] hover:bg-[#880000] cursor-pointer font-mono font-bold transition-colors"
                            >
                              ✕
                            </button>
                          </div>
                        </div>

                        {/* Vital Metrics Grid */}
                        <div className="grid grid-cols-4 gap-2 bg-[#0b0e14] p-2.5 border border-[#2b3245] mb-3">
                          <div className="text-center">
                            <span className="text-[8px] text-[#8e98ad] font-mono uppercase block">Stage</span>
                            <strong className="text-xs text-white font-mono font-bold">
                              {r.current_stage}/{r.total_stages}
                            </strong>
                          </div>

                          <div className="text-center">
                            <span className="text-[8px] text-[#8e98ad] font-mono uppercase block">Stability</span>
                            <strong
                              className={`text-xs font-mono font-bold ${
                                r.health > 60 ? 'text-[#55ff55]' : r.health > 30 ? 'text-[#ffaa00]' : 'text-[#ff5555]'
                              }`}
                            >
                              {r.health}%
                            </strong>
                          </div>

                          <div className="text-center">
                            <span className="text-[8px] text-[#8e98ad] font-mono uppercase block">Debt</span>
                            <strong
                              className={`text-xs font-mono font-bold ${
                                r.technical_debt >= 4 ? 'text-[#ff5555]' : 'text-[#ffaa00]'
                              }`}
                            >
                              {r.technical_debt}/5
                            </strong>
                          </div>

                          <div className="text-center">
                            <span className="text-[8px] text-[#8e98ad] font-mono uppercase block">Mined</span>
                            <strong className="text-xs text-[#ffd700] font-mono font-bold">
                              {r.total_pulls} blk
                            </strong>
                          </div>
                        </div>

                        {/* Connected Players & Consensus Voting State */}
                        <div className="mb-3">
                          <span className="text-[9px] font-mono text-[#8e98ad] uppercase block mb-1">
                            Teammates & Live Votes ({r.active_players?.length || 0}):
                          </span>
                          <div className="flex flex-wrap gap-1.5 min-h-[22px]">
                            {r.active_players && r.active_players.length > 0 ? (
                              r.active_players.map((p) => (
                                <span
                                  key={p.player_id}
                                  className={`text-[9px] font-mono px-2 py-0.5 border flex items-center gap-1 ${
                                    p.voted_action
                                      ? 'bg-[#183318] text-[#77ff77] border-[#2d5a2d]'
                                      : 'bg-[#161a24] text-[#aaa] border-[#2b3245]'
                                  }`}
                                >
                                  <strong>{p.name}</strong>
                                  {p.voted_action && (
                                    <span className="text-[7.5px] uppercase bg-[#000] px-1 text-[#ffd700]">
                                      {p.voted_action.replace('_', ' ')}
                                    </span>
                                  )}
                                </span>
                              ))
                            ) : (
                              <span className="text-[9px] text-[#555] font-mono italic">No players connected</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* GM Interventions Toolbar */}
                      <div className="pt-2 border-t border-[#232a3d] space-y-2">
                        {/* Row 1: Spectate + Pause + Stage Jumps */}
                        <div className="grid grid-cols-4 gap-1.5">
                          <button
                            type="button"
                            onClick={() => onNavigate ? onNavigate('spectate', r.room_id) : (window.location.href = `/?roomId=${r.room_id}&spectate=true`)}
                            className="mc-btn px-2 py-1 text-[9px] mc-font text-[#55ffff] flex items-center justify-center gap-1 bg-[#0c1c28] border-[#38bdf8] hover:text-white cursor-pointer"
                            title="Spectate this room in real-time"
                          >
                            <span>SPECTATE</span>
                            <Eye className="w-2.5 h-2.5" />
                          </button>

                          <button
                            type="button"
                            disabled={globalTimerPaused}
                            onClick={() => handleToggleRoomTimer(r.room_id)}
                            className={`mc-btn px-2 py-1 text-[9px] mc-font flex items-center justify-center gap-1 transition-colors ${
                              globalTimerPaused
                                ? 'bg-[#1a1c23] border-[#444] text-[#666] opacity-60 cursor-not-allowed'
                                : r.is_timer_paused
                                ? 'bg-[#332200] border-[#ffd700] text-[#ffd700] hover:bg-[#443300] cursor-pointer'
                                : 'bg-[#152238] border-[#38bdf8] text-[#38bdf8] hover:text-white cursor-pointer'
                            }`}
                            title={
                              globalTimerPaused
                                ? 'World Timer is locked globally. Resume World Timer to control individual tables.'
                                : r.is_timer_paused
                                ? 'Resume countdown timer for this table'
                                : 'Pause countdown timer for this table'
                            }
                          >
                            {r.is_timer_paused ? (
                              <>
                                <Play className="w-2.5 h-2.5 text-[#ffd700]" />
                                <span>RESUME</span>
                              </>
                            ) : (
                              <>
                                <Pause className="w-2.5 h-2.5 text-[#ffaa00]" />
                                <span>PAUSE</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRoomAction(r.room_id, 'advance')}
                            disabled={r.current_stage >= r.total_stages}
                            className="mc-btn mc-btn-green px-2 py-1 text-[9px] mc-font text-white flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40"
                          >
                            <span>+STAGE ➔</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRoomAction(r.room_id, 'retry')}
                            className="mc-btn px-2 py-1 text-[9px] mc-font text-[#ffaa00] flex items-center justify-center gap-1 cursor-pointer bg-[#251505] border-[#885500]"
                          >
                            <span>RETRY</span>
                          </button>
                        </div>

                        {/* Row 2: Vitals & Debt Injection */}
                        <div className="grid grid-cols-4 gap-1">
                          <button
                            type="button"
                            onClick={() => handleRoomAction(r.room_id, 'health_adjust', 15)}
                            className="mc-btn px-1.5 py-1 text-[8.5px] font-mono text-[#55ff55] bg-[#002200] border-[#006600] cursor-pointer"
                            title="Heal +15% Health"
                          >
                            +15% HP
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRoomAction(r.room_id, 'health_adjust', -15)}
                            className="mc-btn px-1.5 py-1 text-[8.5px] font-mono text-[#ff5555] bg-[#220000] border-[#660000] cursor-pointer"
                            title="Damage -15% Health"
                          >
                            -15% HP
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRoomAction(r.room_id, 'debt_adjust', 1)}
                            className="mc-btn px-1.5 py-1 text-[8.5px] font-mono text-[#ffaa00] bg-[#251505] border-[#664400] cursor-pointer"
                            title="Add +1 Technical Debt"
                          >
                            +1 Debt
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRoomAction(r.room_id, 'debt_adjust', -1)}
                            className="mc-btn px-1.5 py-1 text-[8.5px] font-mono text-[#38bdf8] bg-[#001828] border-[#004868] cursor-pointer"
                            title="Remove -1 Technical Debt"
                          >
                            -1 Debt
                          </button>
                        </div>

                        {/* Row 3: Chaos Pull + Danger Controls */}
                        <div className="flex items-center justify-between gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => handleRoomAction(r.room_id, 'chaos_pull', 0, 1)}
                            className="mc-btn px-2 py-1 text-[8.5px] font-mono text-[#ffd700] bg-[#332200] border-[#886600] cursor-pointer flex-1"
                            title="Force Mine 1 Tower Block"
                          >
                            ⚡ Mine Chaos Block
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRoomAction(r.room_id, 'collapse')}
                            className="mc-btn px-2 py-1 text-[8.5px] font-mono text-[#ff5555] bg-[#2d0e0e] border-[#880000] cursor-pointer"
                            title="Force Tower Collapse Outage"
                          >
                            💥 Collapse
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRoomAction(r.room_id, 'reset')}
                            className="mc-btn px-2 py-1 text-[8.5px] font-mono text-[#aaa] hover:text-white bg-[#111] border-[#333] cursor-pointer"
                            title="Reset Table to Stage 1"
                          >
                            Reset
                          </button>

                          <button
                            type="button"
                            onClick={() => setTableToDelete({ id: r.room_id, name: r.team_name, code: r.room_code || r.room_id })}
                            className="mc-btn px-2 py-1 text-[8.5px] font-mono text-[#ff4444] hover:text-white bg-[#2a0808] border-[#661111] hover:bg-[#880000] cursor-pointer font-bold"
                            title="Delete Table from Workshop"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Workshop Analytics & Macro Telemetry Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div className="bg-[#141822] p-4 border border-[#2b3245] flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-[#ffd700] mc-font uppercase mb-1">
                  WORKSHOP MACRO TELEMETRY
                </h2>
                <p className="text-xs text-[#8e98ad] font-mono">
                  Live player presence, cross-table performance, failure frequency, and technical debt accumulation across the venue.
                </p>
              </div>
              <button
                type="button"
                onClick={loadAnalytics}
                className="text-xs font-mono text-[#8e98ad] hover:text-white flex items-center gap-1.5 bg-[#0b0e14] px-3 py-1.5 border border-[#2b3245] cursor-pointer"
              >
                <RefreshCw className="w-3 h-3 text-[#38bdf8]" />
                <span>REFRESH TELEMETRY</span>
              </button>
            </div>

            {/* High-Level Venue Metric Cards */}
            {analytics && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#151924] p-4 border border-[#2b3245] text-center border-l-4 border-l-[#38bdf8] shadow-lg">
                  <span className="text-xs text-[#8e98ad] font-mono uppercase block mb-1">Active Players Online</span>
                  <strong className="text-2xl text-[#38bdf8] font-mono font-bold flex items-center justify-center gap-1.5">
                    <Users className="w-5 h-5 text-[#38bdf8]" />
                    {analytics.total_active_players ?? rooms.reduce((acc, r) => acc + (r.active_players_count ?? r.active_players?.length ?? 0), 0)}
                  </strong>
                </div>

                <div className="bg-[#151924] p-4 border border-[#2b3245] text-center">
                  <span className="text-xs text-[#8e98ad] font-mono uppercase block mb-1">Registered Tables</span>
                  <strong className="text-2xl text-white font-mono font-bold">{analytics.total_rooms}</strong>
                </div>

                <div className="bg-[#151924] p-4 border border-[#2b3245] text-center">
                  <span className="text-xs text-[#8e98ad] font-mono uppercase block mb-1">Average Stage</span>
                  <strong className="text-2xl text-[#ffd700] font-mono font-bold">{analytics.average_stage} / 11</strong>
                </div>

                <div className="bg-[#151924] p-4 border border-[#2b3245] text-center">
                  <span className="text-xs text-[#8e98ad] font-mono uppercase block mb-1">Average Stability</span>
                  <strong className="text-2xl text-[#55ff55] font-mono font-bold">{analytics.average_health}%</strong>
                </div>

                <div className="bg-[#151924] p-4 border border-[#2b3245] text-center">
                  <span className="text-xs text-[#8e98ad] font-mono uppercase block mb-1">Average Tech Debt</span>
                  <strong className="text-2xl text-[#ffaa00] font-mono font-bold">{analytics.average_debt} / 5</strong>
                </div>

                <div className="bg-[#151924] p-4 border border-[#2b3245] text-center">
                  <span className="text-xs text-[#8e98ad] font-mono uppercase block mb-1">Total Mined Blocks</span>
                  <strong className="text-2xl text-[#ffd700] font-mono font-bold">{analytics.total_blocks_mined}</strong>
                </div>

                <div className="bg-[#151924] p-4 border border-[#2b3245] text-center">
                  <span className="text-xs text-[#8e98ad] font-mono uppercase block mb-1">Tower Collapses</span>
                  <strong className="text-2xl text-[#ff5555] font-mono font-bold">{analytics.collapsed_rooms}</strong>
                </div>

                <div className="bg-[#151924] p-4 border border-[#2b3245] text-center">
                  <span className="text-xs text-[#8e98ad] font-mono uppercase block mb-1">Victorious Squads</span>
                  <strong className="text-2xl text-[#55ff55] font-mono font-bold">{analytics.victorious_rooms ?? 0}</strong>
                </div>
              </div>
            )}

            {/* Live Per-Table Player Presence & Telemetry Breakdown */}
            <div className="bg-[#141822] border border-[#2b3245] overflow-hidden">
              <div className="p-3 bg-[#181d2a] border-b border-[#2b3245] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#38bdf8]" />
                  <h3 className="text-xs font-bold text-white mc-font">
                    LIVE SQUAD TELEMETRY & PLAYER PRESENCE ({rooms.length} TABLES)
                  </h3>
                </div>
                <span className="text-[10px] text-[#8e98ad] font-mono">
                  Real-time heartbeat & vote telemetry
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#0b0e14] text-[#8e98ad] text-[10px] uppercase border-b border-[#2b3245]">
                    <tr>
                      <th className="p-3">Table / Squad</th>
                      <th className="p-3 text-center">Active Players</th>
                      <th className="p-3">Current Stage</th>
                      <th className="p-3 text-center">Stability</th>
                      <th className="p-3 text-center">Tech Debt</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e2433]">
                    {rooms.map((r) => {
                      const activeCount = r.active_players_count ?? r.active_players?.length ?? 0;
                      return (
                        <tr key={r.room_id} className="hover:bg-[#181c28] transition-colors">
                          <td className="p-3">
                            <strong className="text-white block font-sans font-bold text-sm">{r.team_name}</strong>
                            <span className="text-[9px] font-mono text-[#ffd700] bg-[#221708] px-1.5 py-0.2 border border-[#664400] inline-block mt-0.5 font-bold">
                              PIN: {r.room_code || r.room_id}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#0c1c28] text-[#38bdf8] border border-[#1e3a5f] font-bold text-[11px]">
                              <Users className="w-3 h-3 text-[#38bdf8]" />
                              {activeCount} Active
                            </span>
                            {r.active_players && r.active_players.length > 0 && (
                              <div className="flex items-center justify-center gap-1 flex-wrap mt-1 max-w-xs mx-auto">
                                {r.active_players.map((p) => (
                                  <span
                                    key={p.player_id}
                                    title={p.voted_action ? `Voted: ${p.voted_action}` : 'Connected (not voted)'}
                                    className={`text-[8.5px] px-1 py-0.2 border ${
                                      p.voted_action
                                        ? 'bg-[#183318] text-[#55ff55] border-[#2d5a2d]'
                                        : 'bg-[#10141e] text-[#8e98ad] border-[#222a3d]'
                                    }`}
                                  >
                                    {p.name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="p-3">
                            <span className="text-[#ffd700] font-bold">Stage {r.current_stage}/11</span>
                            <span className="text-[10px] text-[#8e98ad] block truncate max-w-[160px]">{r.stage_title}</span>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`font-bold ${r.health > 60 ? 'text-[#55ff55]' : r.health > 30 ? 'text-[#ffaa00]' : 'text-[#ff5555]'}`}>
                              {r.health}%
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`font-bold ${r.technical_debt >= 4 ? 'text-[#ff5555]' : 'text-[#ffaa00]'}`}>
                              {r.technical_debt}/5
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`text-[9px] mc-font px-2 py-0.5 border uppercase ${
                              r.is_game_over
                                ? 'bg-[#3a0000] text-[#ff5555] border-[#ff3333]'
                                : r.is_victory
                                ? 'bg-[#003a00] text-[#55ff55] border-[#55ff55]'
                                : r.health <= 35
                                ? 'bg-[#331c00] text-[#ffaa00] border-[#ffaa00]'
                                : 'bg-[#002233] text-[#55ffff] border-[#38bdf8]'
                            }`}>
                              {r.is_game_over ? 'COLLAPSED' : r.is_victory ? 'VICTORY' : r.health <= 35 ? 'CRITICAL' : 'LIVE'}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => onNavigate ? onNavigate('spectate', r.room_id) : (window.location.href = `/?roomId=${r.room_id}&spectate=true`)}
                                className="mc-btn px-2.5 py-1 text-[9px] mc-font text-[#55ffff] inline-flex items-center gap-1 bg-[#0c1c28] border-[#38bdf8] hover:text-white cursor-pointer"
                                title="Spectate this room in real-time"
                              >
                                <span>SPECTATE</span>
                                <Eye className="w-2.5 h-2.5" />
                              </button>
                              <button
                                type="button"
                                disabled={globalTimerPaused}
                                onClick={() => handleToggleRoomTimer(r.room_id)}
                                className={`mc-btn px-2 py-1 text-[9px] mc-font inline-flex items-center gap-1 transition-colors ${
                                  globalTimerPaused
                                    ? 'bg-[#1a1c23] border-[#444] text-[#666] opacity-60 cursor-not-allowed'
                                    : r.is_timer_paused
                                    ? 'bg-[#332200] border-[#ffd700] text-[#ffd700] cursor-pointer'
                                    : 'bg-[#152238] border-[#38bdf8] text-[#38bdf8] cursor-pointer'
                                }`}
                                title={
                                  globalTimerPaused
                                    ? 'World Timer is locked globally. Resume World Timer to control individual tables.'
                                    : r.is_timer_paused
                                    ? 'Resume timer for this table'
                                    : 'Pause timer for this table'
                                }
                              >
                                {r.is_timer_paused ? <Play className="w-2.5 h-2.5 text-[#ffd700]" /> : <Pause className="w-2.5 h-2.5 text-[#ffaa00]" />}
                                <span>{r.is_timer_paused ? 'RESUME' : 'PAUSE'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setTableToDelete({ id: r.room_id, name: r.team_name, code: r.room_code || r.room_id })}
                                className="mc-btn px-2 py-1 text-[9px] font-mono text-[#ff5555] hover:text-white bg-[#200a0a] border-[#661111] hover:bg-[#880000] cursor-pointer"
                                title="Delete Table from Workshop"
                              >
                                ✕
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'themes' && (
          <ThemeManager
            currentThemeId={themeConfig.theme}
            currentMode={themeConfig.mode}
            onThemeChange={(newTheme, newMode) => {
              setThemeConfig({ theme: newTheme, mode: newMode });
            }}
            showToast={showToast}
          />
        )}
      </main>

      {/* Confirmation Modal for Reset All Rooms */}
      {confirmResetAll && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="mc-panel-dark max-w-md w-full p-6 border-4 border-[#ff3333] shadow-2xl text-center space-y-4">
            <AlertTriangle className="w-12 h-12 text-[#ff5555] mx-auto animate-bounce" />
            <h3 className="text-base font-bold text-white mc-font">
              RESET ALL WORKSHOP ROOMS?
            </h3>
            <p className="text-xs text-[#ccc] font-mono leading-relaxed">
              This will restart all active developer squads back to <strong>Stage 1 (100% HP, 0 Debt)</strong>. Use this only when starting a fresh session.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmResetAll(false)}
                className="mc-btn px-4 py-2 text-xs font-mono text-[#aaa] hover:text-white border-[#555] cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleResetAll}
                disabled={loading}
                className="mc-btn px-4 py-2 text-xs font-mono font-bold text-white bg-[#880000] border-[#ff3333] hover:bg-[#aa0000] cursor-pointer"
              >
                CONFIRM RESET ALL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Themed Confirmation Modal for Delete Single Table */}
      {tableToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="mc-panel-dark max-w-md w-full p-6 border-4 border-[#ff3333] shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 bg-[#2d0e0e] border-2 border-[#ff3333] flex items-center justify-center mx-auto shadow-md">
              <Trash2 className="w-6 h-6 text-[#ff5555]" />
            </div>
            <h3 className="text-base font-bold text-white mc-font tracking-wide">
              DELETE TABLE '{tableToDelete.name.toUpperCase()}'?
            </h3>
            <p className="text-xs text-[#ccc] font-mono leading-relaxed">
              This will remove table <strong>{tableToDelete.code}</strong> from the workshop session and disconnect all players at this table.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setTableToDelete(null)}
                className="mc-btn px-4 py-2 text-xs font-mono text-[#aaa] hover:text-white border-[#555] cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={() => {
                  handleRoomAction(tableToDelete.id, 'delete');
                  setTableToDelete(null);
                }}
                className="mc-btn px-4 py-2 text-xs font-mono font-bold text-white bg-[#880000] border-[#ff3333] hover:bg-[#aa0000] cursor-pointer"
              >
                CONFIRM DELETE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Field Guide Overlay (Facilitator Reference Mode) */}
      {showFieldGuide && (
        <CockpitFieldGuide
          onClose={() => setShowFieldGuide(false)}
          isAdminView={true}
        />
      )}
    </div>
  );
}
