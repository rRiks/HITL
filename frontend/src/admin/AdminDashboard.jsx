import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  Zap,
  RotateCcw,
  AlertTriangle,
  Play,
  Pause,
  Radio,
  BookOpen,
  BarChart3,
  Layers,
  Users,
  Search,
  RefreshCw,
  Home,
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
import themeEngine from '../themes/themeEngine';

const BROADCAST_PRESETS = [
  '⚡ 5-minute warning: Cast your consensus votes now!',
  '⚠️ Pro-Tip: Inspect Telemetry to detect hidden governor limits!',
  '☕ Workshop Break: World clocks paused for speaker recap.',
  '🏆 Final Stage Sprint: First squad to merge Stage 11 takes the podium!',
];

export default function AdminDashboard({ onNavigate, theme: propTheme, onToggleTheme }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!adminApi.getAdminKey());
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [showPasscode, setShowPasscode] = useState(false);
  const [showFieldGuide, setShowFieldGuide] = useState(false);

  // Theme Engine integration
  const [themeState, setThemeState] = useState(() => themeEngine.init?.() || themeEngine.getCurrentState?.() || {});

  useEffect(() => {
    const unsubscribe = themeEngine.subscribe((state) => {
      setThemeState(state);
    });
    return () => unsubscribe();
  }, []);

  const currentMode = themeState?.mode || propTheme || 'dark';

  const handleToggleTheme = () => {
    if (onToggleTheme) {
      onToggleTheme();
    } else {
      themeEngine.toggleMode();
    }
  };

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

  // Load analytics when analytics tab is clicked
  useEffect(() => {
    if (isAuthenticated && activeTab === 'analytics') {
      loadAnalytics();
      const interval = setInterval(loadAnalytics, 5000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, activeTab, loadAnalytics]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      await adminApi.verifyAdminPasscode(passcode);
      setIsAuthenticated(true);
      setPasscode('');
      await loadData();
      showToast('Game Master access granted. Command Block Console unlocked.');
    } catch (err) {
      setAuthError(err.message || 'Invalid Game Master Passcode');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    adminApi.clearAdminKey();
    setIsAuthenticated(false);
    showToast('Game Master Console locked.');
  };

  const handleSendBroadcast = async (customMsg = null) => {
    const msg = customMsg || broadcastMessage;
    if (!msg.trim()) return;
    try {
      const res = await adminApi.broadcastAnnouncement(msg);
      setActiveBroadcast(res.announcement);
      setBroadcastMessage('');
      showToast('Global alert broadcasted to all table cockpits!');
    } catch (err) {
      showToast(`Broadcast failed: ${err.message}`);
    }
  };

  const handleClearBroadcast = async () => {
    try {
      await adminApi.clearBroadcast();
      setActiveBroadcast(null);
      showToast('Broadcast banner cleared.');
    } catch (err) {
      showToast(`Clear broadcast failed: ${err.message}`);
    }
  };

  const handleRoomAction = async (roomId, action, value = 0, count = 1) => {
    try {
      await adminApi.sendRoomAction(roomId, action, value, count);
      await loadData();
      showToast(`Action '${action}' applied to room ${roomId}`);
    } catch (err) {
      showToast(`Action failed: ${err.message}`);
    }
  };

  const handleResetAll = async () => {
    setLoading(true);
    try {
      await adminApi.resetAllRooms();
      setConfirmResetAll(false);
      await loadData();
      showToast('All workshop rooms have been reset to Stage 1!');
    } catch (err) {
      showToast(`Reset failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRoomTimer = async (roomId) => {
    try {
      const res = await adminApi.toggleRoomTimer(roomId);
      await loadData();
      showToast(`Timer for room ${roomId} is now ${res.is_timer_paused ? 'PAUSED' : 'RESUMED'}`);
    } catch (err) {
      showToast(`Timer toggle failed: ${err.message}`);
    }
  };

  const handleToggleGlobalTimer = async () => {
    try {
      const res = await adminApi.toggleGlobalTimer();
      setGlobalTimerPaused(res.global_timer_paused);
      await loadData();
      showToast(
        res.global_timer_paused
          ? '⏸ All workshop timers have been PAUSED globally!'
          : '▶ All workshop timers have been RESUMED globally!'
      );
    } catch (err) {
      showToast(`Global timer toggle failed: ${err.message}`);
    }
  };

  // Filter and search logic
  const filteredRooms = rooms.filter((r) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (r.team_name || '').toLowerCase().includes(q);
      const matchId = (r.room_id || '').toLowerCase().includes(q);
      const matchCode = (r.room_code || '').toLowerCase().includes(q);
      if (!matchName && !matchId && !matchCode) return false;
    }
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') return !r.is_game_over && !r.is_victory;
    if (statusFilter === 'critical') return r.health <= 35 && !r.is_game_over;
    if (statusFilter === 'collapsed') return r.is_game_over;
    if (statusFilter === 'victorious') return r.is_victory;
    return true;
  });

  // Unauthenticated Security Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col font-sans select-none transition-colors duration-200">
        {/* Top Header with Back & Theme */}
        <header className="h-[62px] bg-[var(--bg-panel)] backdrop-blur-md border-b border-[var(--border-subtle)] px-4 sm:px-6 flex items-center justify-between gap-3 shrink-0 shadow-sm transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center shadow-sm">
              <Shield className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-[var(--text-primary)] font-theme-heading tracking-wide">
                COMMAND BLOCK CONSOLE
              </h1>
              <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-semibold">
                RESTRICTED ACCESS • GAME MASTER ONLY
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleTheme}
              title={currentMode === 'light' ? 'Switch to Dark Realm' : 'Switch to Light Realm'}
              className="px-2.5 py-1.5 text-xs font-mono font-bold rounded-lg border transition-all cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-1.5"
            >
              {currentMode === 'light' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-amber-600 font-bold">LIGHT</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-sky-400" />
                  <span className="text-sky-300 font-bold">DARK</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => onNavigate?.('home')}
              className="px-3 py-1.5 text-xs font-mono font-bold rounded-lg border transition-all cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>RETURN TO LOBBY</span>
            </button>
          </div>
        </header>

        {/* Security Gate Form */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] max-w-md w-full p-6 sm:p-8 rounded-2xl shadow-2xl text-center animate-fadeIn relative backdrop-blur-xl">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shadow-inner">
              <Lock className="w-7 h-7 text-amber-600 dark:text-amber-400 animate-pulse" />
            </div>

            <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] font-theme-heading tracking-wide mb-1">
              GAME MASTER SECURITY GATE
            </h2>
            <p className="text-xs text-[var(--text-secondary)] font-mono mb-5 leading-relaxed">
              Enter the facilitator key to unlock the Command Block Console and event orchestration controls.
            </p>

            {authError && (
              <div className="mb-4 p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-mono flex items-center gap-2 text-left">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="w-4 h-4 text-[var(--text-muted)]" />
                </div>
                <input
                  type={showPasscode ? 'text' : 'password'}
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter Game Master Passcode..."
                  className="w-full bg-[var(--bg-code)] border border-[var(--border-subtle)] text-[var(--text-primary)] pl-9 pr-10 py-2.5 rounded-xl text-xs sm:text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all placeholder:text-[var(--text-muted)]"
                  autoFocus
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasscode(!showPasscode)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                  title={showPasscode ? 'Hide passcode' : 'Show passcode'}
                >
                  {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 text-xs sm:text-sm font-bold text-white rounded-xl bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center gap-2 cursor-pointer shadow-lg tracking-wider disabled:opacity-50 transition-all"
              >
                <Lock className="w-4 h-4" />
                <span>{authLoading ? 'VERIFYING KEY...' : 'AUTHENTICATE [ENTER] ➔'}</span>
              </button>
            </form>

            <div className="mt-5 pt-3 border-t border-[var(--border-subtle)] text-[10px] text-[var(--text-muted)] font-mono leading-relaxed">
              <span>Restricted console. Facilitator access only.</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col font-sans select-none transition-colors duration-200">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[var(--bg-card)] border border-amber-500/50 text-[var(--text-primary)] px-4 py-2.5 rounded-xl text-xs font-mono shadow-2xl flex items-center gap-2 animate-bounce backdrop-blur-md">
          <Zap className="w-4 h-4 text-amber-500" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Game Master Navigation Bar */}
      <header className="h-[62px] bg-[var(--bg-panel)] backdrop-blur-md border-b border-[var(--border-subtle)] px-4 sm:px-6 flex items-center justify-between gap-3 shrink-0 shadow-sm transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center shadow-sm">
            <Shield className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-[var(--text-primary)] font-theme-heading tracking-wide">
                COMMAND BLOCK CONSOLE
              </h1>
              <span className="text-[9.5px] font-mono px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 font-bold">
                GAME MASTER (GM)
              </span>
            </div>
            <p className="text-[10px] text-[var(--text-muted)] font-mono hidden sm:block">
              Multi-Room Event Facilitator & Chaos Orchestration Center
            </p>
          </div>
        </div>

        {/* Global Summary Stats */}
        <div className="hidden lg:flex items-center gap-4 text-xs font-mono bg-[var(--bg-card)] px-3.5 py-1.5 rounded-xl border border-[var(--border-subtle)] shadow-xs">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
            <span className="text-[var(--text-muted)]">Active Players:</span>
            <strong className="text-sky-600 dark:text-sky-300 font-bold">
              {rooms.reduce((acc, r) => acc + (r.active_players_count ?? r.active_players?.length ?? 0), 0)}
            </strong>
          </div>
          <div className="w-px h-3 bg-[var(--border-subtle)]" />
          <div className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
            <span className="text-[var(--text-muted)]">Active Tables:</span>
            <strong className="text-[var(--text-primary)] font-bold">{rooms.length}</strong>
          </div>
          <div className="w-px h-3 bg-[var(--border-subtle)]" />
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span className="text-[var(--text-muted)]">Total Mined Blocks:</span>
            <strong className="text-amber-600 dark:text-amber-400 font-bold">
              {rooms.reduce((acc, r) => acc + (r.total_pulls || 0), 0)}
            </strong>
          </div>
        </div>

        {/* Action Shortcuts */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleTheme}
            title={currentMode === 'light' ? 'Switch to Dark Realm' : 'Switch to Light Realm'}
            className="px-2.5 py-1.5 text-xs font-mono font-bold rounded-lg border transition-all cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-1.5"
          >
            {currentMode === 'light' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-amber-600 font-bold">LIGHT</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-sky-400" />
                <span className="text-sky-300 font-bold">DARK</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => onNavigate?.('home')}
            title="Return to Player Lobby"
            className="px-2.5 py-1.5 text-xs font-mono font-bold rounded-lg border transition-all cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-1.5"
          >
            <Home className="w-3 h-3 text-[var(--text-muted)]" />
            <span>LOBBY</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            title="Lock Game Master Console"
            className="px-2.5 py-1.5 text-xs font-mono font-bold rounded-lg border transition-all cursor-pointer bg-rose-500/15 hover:bg-rose-500/25 text-rose-700 dark:text-rose-300 border-rose-500/30 shadow-xs flex items-center gap-1.5"
          >
            <Lock className="w-3 h-3 text-rose-500" />
            <span>LOCK</span>
          </button>

          <button
            type="button"
            onClick={() => setShowFieldGuide(true)}
            className="px-2.5 py-1.5 text-xs font-mono font-bold rounded-lg border transition-all cursor-pointer bg-sky-500/15 hover:bg-sky-500/25 text-sky-700 dark:text-sky-300 border-sky-500/30 shadow-xs flex items-center gap-1.5"
          >
            <BookOpen className="w-3 h-3 text-sky-500" />
            <span>FIELD GUIDE</span>
          </button>
        </div>
      </header>

      {/* Global Broadcast & Alert Bar */}
      <div className="bg-[var(--bg-panel)] border-b border-[var(--border-subtle)] px-4 sm:px-6 py-2.5 transition-colors">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1">
            <Radio className="w-4 h-4 text-rose-500 animate-pulse shrink-0" />
            <span className="text-[10px] font-mono text-rose-600 dark:text-rose-400 font-bold uppercase whitespace-nowrap">
              REALM BROADCAST:
            </span>
            <input
              type="text"
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              placeholder="Type urgent facilitator message to all player screens..."
              className="flex-1 bg-[var(--bg-code)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs font-mono px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all placeholder:text-[var(--text-muted)]"
              onKeyDown={(e) => e.key === 'Enter' && handleSendBroadcast()}
            />
            <button
              type="button"
              onClick={() => handleSendBroadcast()}
              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-sm transition-all whitespace-nowrap"
            >
              SEND ALERT ➔
            </button>
          </div>

          {/* Quick Presets & Clear */}
          <div className="flex items-center gap-2 shrink-0">
            {activeBroadcast && (
              <div className="flex items-center gap-2 bg-rose-500/15 border border-rose-500/30 px-2.5 py-1 rounded-lg text-[10px] font-mono text-rose-700 dark:text-rose-300">
                <span className="truncate max-w-xs">Live: "{activeBroadcast.message}"</span>
                <button
                  type="button"
                  onClick={handleClearBroadcast}
                  className="text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-200 font-bold ml-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={handleToggleGlobalTimer}
              className={`px-2.5 py-1.5 text-[10px] font-mono font-bold rounded-lg border flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-xs transition-all ${
                globalTimerPaused
                  ? 'text-amber-800 dark:text-amber-300 border-amber-500/50 bg-amber-500/20 animate-pulse'
                  : 'text-sky-700 dark:text-sky-300 border-sky-500/30 bg-sky-500/15 hover:bg-sky-500/25'
              }`}
              title={globalTimerPaused ? 'Resume countdown timers across all tables' : 'Freeze countdown timers across all tables'}
            >
              {globalTimerPaused ? (
                <>
                  <Play className="w-3 h-3 text-amber-500" />
                  <span>▶ RESUME ALL TIMERS</span>
                </>
              ) : (
                <>
                  <Pause className="w-3 h-3 text-sky-500" />
                  <span>⏸ PAUSE ALL TIMERS</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setConfirmResetAll(true)}
              className="px-2.5 py-1.5 text-[10px] font-mono font-bold text-rose-700 dark:text-rose-300 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 rounded-lg cursor-pointer whitespace-nowrap transition-all shadow-xs"
            >
              <RotateCcw className="w-3 h-3 inline mr-1" />
              RESET ALL ROOMS
            </button>
          </div>
        </div>

        {/* Quick Presets Chips */}
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          <span className="text-[9px] text-[var(--text-muted)] font-mono">Quick Presets:</span>
          {BROADCAST_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendBroadcast(preset)}
              className="text-[9px] font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-elevated)] px-2 py-0.5 rounded-md border border-[var(--border-subtle)] cursor-pointer hover:border-amber-500/50 transition-colors"
            >
              {preset.slice(0, 36)}...
            </button>
          ))}
        </div>
      </div>

      {/* Main Workspace Navigation Tabs */}
      <div className="px-4 sm:px-6 pt-3 pb-2 flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-panel)] transition-colors">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('squads')}
            className={`px-3.5 py-1.5 text-xs font-mono font-bold border transition-colors flex items-center gap-2 cursor-pointer rounded-lg ${
              activeTab === 'squads'
                ? 'bg-[var(--bg-card)] text-[var(--text-primary)] border-amber-500/50 ring-1 ring-amber-500/30 shadow-xs'
                : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-slate-400 dark:hover:border-slate-600 hover:text-[var(--text-primary)]'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-sky-500" />
            <span>LIVE SQUADS MATRIX ({rooms.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-1.5 text-xs font-mono font-bold border transition-colors flex items-center gap-2 cursor-pointer rounded-lg ${
              activeTab === 'analytics'
                ? 'bg-[var(--bg-card)] text-[var(--text-primary)] border-amber-500/50 ring-1 ring-amber-500/30 shadow-xs'
                : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-slate-400 dark:hover:border-slate-600 hover:text-[var(--text-primary)]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-emerald-500" />
            <span>WORKSHOP TELEMETRY</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('themes')}
            className={`px-3.5 py-1.5 text-xs font-mono font-bold border transition-colors flex items-center gap-2 cursor-pointer rounded-lg ${
              activeTab === 'themes'
                ? 'bg-[var(--bg-card)] text-[var(--text-primary)] border-amber-500/50 ring-1 ring-amber-500/30 shadow-xs'
                : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-slate-400 dark:hover:border-slate-600 hover:text-[var(--text-primary)]'
            }`}
          >
            <Palette className="w-3.5 h-3.5 text-amber-500" />
            <span>THEME ENGINE</span>
          </button>
        </div>

        {/* Refresh button */}
        <button
          type="button"
          onClick={loadData}
          title="Force Telemetry Sync"
          className="text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1.5 bg-[var(--bg-card)] px-2.5 py-1 rounded-lg border border-[var(--border-subtle)] cursor-pointer hover:border-slate-400 transition-colors shadow-xs"
        >
          <RefreshCw className="w-3 h-3 text-amber-500" />
          <span className="hidden sm:inline">REFRESH</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
        {activeTab === 'squads' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[var(--bg-panel)] p-3 rounded-xl border border-[var(--border-subtle)] shadow-xs">
              <div className="relative flex-1 max-w-md">
                <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter tables by name..."
                  className="w-full bg-[var(--bg-code)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs font-mono pl-9 pr-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all placeholder:text-[var(--text-muted)]"
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
                    className={`text-[10px] font-mono px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      statusFilter === f.id
                        ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 font-bold border-transparent shadow-xs'
                        : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border-[var(--border-subtle)] hover:border-slate-400 dark:hover:border-slate-600'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Squads Matrix Cards Grid */}
            {filteredRooms.length === 0 ? (
              <div className="text-center py-12 bg-[var(--bg-card)] border-2 border-dashed border-[var(--border-subtle)] rounded-2xl p-6 shadow-xs">
                <Users className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2" />
                <h3 className="text-sm font-mono text-[var(--text-secondary)] font-bold">
                  No active workshop tables match your filter.
                </h3>
                <p className="text-xs text-[var(--text-muted)] font-mono mt-1">
                  Start games via <code className="text-amber-500">/home</code> or share room invite links.
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
                      className={`p-4 rounded-xl border transition-all shadow-md flex flex-col justify-between ${
                        isDead
                          ? 'bg-rose-500/10 border-rose-500/40 text-[var(--text-primary)]'
                          : isWon
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-[var(--text-primary)]'
                          : isLow
                          ? 'bg-amber-500/10 border-amber-500/40 animate-pulse text-[var(--text-primary)]'
                          : 'bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-slate-400 dark:hover:border-slate-600 text-[var(--text-primary)]'
                      }`}
                    >
                      <div>
                        {/* Squad Header */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] font-theme-heading tracking-wide">
                                {r.team_name}
                              </h3>
                              <span className="text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] text-amber-700 dark:text-amber-400 border border-amber-500/30 font-bold tracking-wider">
                                PIN: {r.room_code || r.room_id}
                              </span>
                              {r.is_timer_paused && (
                                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1 animate-pulse">
                                  <Pause className="w-2.5 h-2.5 text-amber-500" />
                                  <span>TIME PAUSED</span>
                                </span>
                              )}
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30 flex items-center gap-1 font-semibold">
                                <Users className="w-2.5 h-2.5 text-sky-500" />
                                <span>{r.active_players_count ?? r.active_players?.length ?? 0} active</span>
                              </span>
                            </div>
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono block mt-0.5 font-bold">
                              {r.stage_title}
                            </span>
                          </div>

                          {/* Status Badge & Delete Icon */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span
                              className={`text-[9px] font-mono px-2 py-0.5 rounded-md border uppercase font-bold ${
                                isDead
                                  ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/40'
                                  : isWon
                                  ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500/40'
                                  : isLow
                                  ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/40'
                                  : 'bg-sky-500/20 text-sky-800 dark:text-sky-300 border-sky-500/40'
                              }`}
                            >
                              {isDead ? 'COLLAPSED' : isWon ? 'VICTORY' : isLow ? 'CRITICAL' : 'LIVE'}
                            </span>

                            <button
                              type="button"
                              onClick={() => setTableToDelete({ id: r.room_id, name: r.team_name, code: r.room_code || r.room_id })}
                              title="Delete Table"
                              className="text-[10px] text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-200 px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 cursor-pointer font-mono font-bold transition-colors"
                            >
                              ✕
                            </button>
                          </div>
                        </div>

                        {/* Vital Metrics Grid */}
                        <div className="grid grid-cols-4 gap-2 bg-[var(--bg-elevated)] p-2.5 rounded-lg border border-[var(--border-subtle)] mb-3 text-center">
                          <div>
                            <span className="text-[8px] text-[var(--text-muted)] font-mono uppercase block">Stage</span>
                            <strong className="text-xs text-[var(--text-primary)] font-mono font-bold">
                              {r.current_stage}/{r.total_stages}
                            </strong>
                          </div>

                          <div>
                            <span className="text-[8px] text-[var(--text-muted)] font-mono uppercase block">Stability</span>
                            <strong
                              className={`text-xs font-mono font-bold ${
                                r.health > 60
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : r.health > 30
                                  ? 'text-amber-600 dark:text-amber-400'
                                  : 'text-rose-600 dark:text-rose-400'
                              }`}
                            >
                              {r.health}%
                            </strong>
                          </div>

                          <div>
                            <span className="text-[8px] text-[var(--text-muted)] font-mono uppercase block">Debt</span>
                            <strong
                              className={`text-xs font-mono font-bold ${
                                r.technical_debt >= 4 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'
                              }`}
                            >
                              {r.technical_debt}/5
                            </strong>
                          </div>

                          <div>
                            <span className="text-[8px] text-[var(--text-muted)] font-mono uppercase block">Mined</span>
                            <strong className="text-xs text-amber-600 dark:text-amber-400 font-mono font-bold">
                              {r.total_pulls} blk
                            </strong>
                          </div>
                        </div>

                        {/* Connected Players & Consensus Voting State */}
                        <div className="mb-3">
                          <span className="text-[9px] font-mono text-[var(--text-muted)] uppercase block mb-1 font-semibold">
                            Teammates & Live Votes ({r.active_players?.length || 0}):
                          </span>
                          <div className="flex flex-wrap gap-1.5 min-h-[22px]">
                            {r.active_players && r.active_players.length > 0 ? (
                              r.active_players.map((p) => (
                                <span
                                  key={p.player_id}
                                  className={`text-[9px] font-mono px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                                    p.voted_action
                                      ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30'
                                      : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border-subtle)]'
                                  }`}
                                >
                                  <strong>{p.name}</strong>
                                  {p.voted_action && (
                                    <span className="text-[7.5px] uppercase bg-black/60 text-amber-300 px-1 rounded">
                                      {p.voted_action.replace('_', ' ')}
                                    </span>
                                  )}
                                </span>
                              ))
                            ) : (
                              <span className="text-[9px] text-[var(--text-muted)] font-mono italic">No players connected</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* GM Interventions Toolbar */}
                      <div className="pt-2 border-t border-[var(--border-subtle)] space-y-2">
                        {/* Row 1: Spectate + Pause + Stage Jumps */}
                        <div className="grid grid-cols-4 gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              onNavigate
                                ? onNavigate('spectate', r.room_id)
                                : (window.location.href = `/?roomId=${r.room_id}&spectate=true`)
                            }
                            className="px-2 py-1 text-[9px] font-mono font-bold rounded-lg text-sky-700 dark:text-sky-300 bg-sky-500/15 border border-sky-500/30 hover:bg-sky-500/25 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                            title="Spectate this room in real-time"
                          >
                            <span>SPECTATE</span>
                            <Eye className="w-2.5 h-2.5" />
                          </button>

                          <button
                            type="button"
                            disabled={globalTimerPaused}
                            onClick={() => handleToggleRoomTimer(r.room_id)}
                            className={`px-2 py-1 text-[9px] font-mono font-bold rounded-lg border flex items-center justify-center gap-1 transition-colors ${
                              globalTimerPaused
                                ? 'bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--text-muted)] opacity-60 cursor-not-allowed'
                                : r.is_timer_paused
                                ? 'bg-amber-500/20 border-amber-500/40 text-amber-800 dark:text-amber-300 hover:bg-amber-500/30 cursor-pointer'
                                : 'bg-sky-500/15 border-sky-500/30 text-sky-700 dark:text-sky-300 hover:bg-sky-500/25 cursor-pointer'
                            }`}
                            title={
                              globalTimerPaused
                                ? 'World Timer is locked globally.'
                                : r.is_timer_paused
                                ? 'Resume countdown timer for this table'
                                : 'Pause countdown timer for this table'
                            }
                          >
                            {r.is_timer_paused ? (
                              <>
                                <Play className="w-2.5 h-2.5 text-amber-500" />
                                <span>RESUME</span>
                              </>
                            ) : (
                              <>
                                <Pause className="w-2.5 h-2.5 text-sky-500" />
                                <span>PAUSE</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRoomAction(r.room_id, 'advance')}
                            disabled={r.current_stage >= r.total_stages}
                            className="px-2 py-1 text-[9px] font-mono font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40 transition-colors shadow-xs"
                          >
                            <span>+STAGE ➔</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRoomAction(r.room_id, 'retry')}
                            className="px-2 py-1 text-[9px] font-mono font-bold text-amber-800 dark:text-amber-300 bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/25 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors"
                          >
                            <span>RETRY</span>
                          </button>
                        </div>

                        {/* Row 2: Vitals & Debt Injection */}
                        <div className="grid grid-cols-4 gap-1">
                          <button
                            type="button"
                            onClick={() => handleRoomAction(r.room_id, 'health_adjust', 15)}
                            className="px-1.5 py-1 text-[8.5px] font-mono font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 rounded hover:bg-emerald-500/25 cursor-pointer transition-colors"
                            title="Heal +15% Health"
                          >
                            +15% HP
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRoomAction(r.room_id, 'health_adjust', -15)}
                            className="px-1.5 py-1 text-[8.5px] font-mono font-bold text-rose-800 dark:text-rose-300 bg-rose-500/15 border border-rose-500/30 rounded hover:bg-rose-500/25 cursor-pointer transition-colors"
                            title="Damage -15% Health"
                          >
                            -15% HP
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRoomAction(r.room_id, 'debt_adjust', 1)}
                            className="px-1.5 py-1 text-[8.5px] font-mono font-bold text-amber-800 dark:text-amber-300 bg-amber-500/15 border border-amber-500/30 rounded hover:bg-amber-500/25 cursor-pointer transition-colors"
                            title="Add +1 Technical Debt"
                          >
                            +1 Debt
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRoomAction(r.room_id, 'debt_adjust', -1)}
                            className="px-1.5 py-1 text-[8.5px] font-mono font-bold text-sky-800 dark:text-sky-300 bg-sky-500/15 border border-sky-500/30 rounded hover:bg-sky-500/25 cursor-pointer transition-colors"
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
                            className="px-2 py-1 text-[8.5px] font-mono font-bold text-amber-800 dark:text-amber-300 bg-amber-500/15 border border-amber-500/30 rounded-lg hover:bg-amber-500/25 cursor-pointer flex-1 transition-colors"
                            title="Force Mine 1 Tower Block"
                          >
                            ⚡ Mine Chaos Block
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRoomAction(r.room_id, 'collapse')}
                            className="px-2 py-1 text-[8.5px] font-mono font-bold text-rose-800 dark:text-rose-300 bg-rose-500/15 border border-rose-500/30 rounded-lg hover:bg-rose-500/25 cursor-pointer transition-colors"
                            title="Force Tower Collapse Outage"
                          >
                            💥 Collapse
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRoomAction(r.room_id, 'reset')}
                            className="px-2 py-1 text-[8.5px] font-mono font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg hover:bg-[var(--bg-card)] cursor-pointer transition-colors"
                            title="Reset Table to Stage 1"
                          >
                            Reset
                          </button>

                          <button
                            type="button"
                            onClick={() => setTableToDelete({ id: r.room_id, name: r.team_name, code: r.room_code || r.room_id })}
                            className="px-2 py-1 text-[8.5px] font-mono font-bold text-rose-700 dark:text-rose-300 bg-rose-500/15 border border-rose-500/30 hover:bg-rose-500/25 rounded-lg cursor-pointer transition-colors"
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
            <div className="bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border-subtle)] flex items-center justify-between gap-3 shadow-xs">
              <div>
                <h2 className="text-sm font-bold text-[var(--text-primary)] font-theme-heading uppercase mb-1">
                  WORKSHOP MACRO TELEMETRY
                </h2>
                <p className="text-xs text-[var(--text-muted)] font-mono">
                  Live player presence, cross-table performance, failure frequency, and technical debt accumulation across the venue.
                </p>
              </div>
              <button
                type="button"
                onClick={loadAnalytics}
                className="text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1.5 bg-[var(--bg-elevated)] px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] cursor-pointer hover:border-slate-400 transition-colors shadow-xs"
              >
                <RefreshCw className="w-3 h-3 text-sky-500" />
                <span>REFRESH TELEMETRY</span>
              </button>
            </div>

            {/* High-Level Venue Metric Cards */}
            {analytics && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border-subtle)] text-center border-l-4 border-l-sky-500 shadow-xs transition-colors">
                  <span className="text-xs text-[var(--text-muted)] font-mono uppercase block mb-1">Active Players Online</span>
                  <strong className="text-2xl text-sky-600 dark:text-sky-400 font-mono font-bold flex items-center justify-center gap-1.5">
                    <Users className="w-5 h-5 text-sky-500" />
                    {analytics.total_active_players ??
                      rooms.reduce((acc, r) => acc + (r.active_players_count ?? r.active_players?.length ?? 0), 0)}
                  </strong>
                </div>

                <div className="bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border-subtle)] text-center shadow-xs transition-colors">
                  <span className="text-xs text-[var(--text-muted)] font-mono uppercase block mb-1">Registered Tables</span>
                  <strong className="text-2xl text-[var(--text-primary)] font-mono font-bold">{analytics.total_rooms}</strong>
                </div>

                <div className="bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border-subtle)] text-center shadow-xs transition-colors">
                  <span className="text-xs text-[var(--text-muted)] font-mono uppercase block mb-1">Average Stage</span>
                  <strong className="text-2xl text-amber-600 dark:text-amber-400 font-mono font-bold">
                    {analytics.average_stage} / 11
                  </strong>
                </div>

                <div className="bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border-subtle)] text-center shadow-xs transition-colors">
                  <span className="text-xs text-[var(--text-muted)] font-mono uppercase block mb-1">Average Stability</span>
                  <strong className="text-2xl text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                    {analytics.average_health}%
                  </strong>
                </div>

                <div className="bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border-subtle)] text-center shadow-xs transition-colors">
                  <span className="text-xs text-[var(--text-muted)] font-mono uppercase block mb-1">Average Tech Debt</span>
                  <strong className="text-2xl text-amber-600 dark:text-amber-400 font-mono font-bold">
                    {analytics.average_debt} / 5
                  </strong>
                </div>

                <div className="bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border-subtle)] text-center shadow-xs transition-colors">
                  <span className="text-xs text-[var(--text-muted)] font-mono uppercase block mb-1">Total Mined Blocks</span>
                  <strong className="text-2xl text-amber-600 dark:text-amber-400 font-mono font-bold">
                    {analytics.total_blocks_mined}
                  </strong>
                </div>

                <div className="bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border-subtle)] text-center shadow-xs transition-colors">
                  <span className="text-xs text-[var(--text-muted)] font-mono uppercase block mb-1">Tower Collapses</span>
                  <strong className="text-2xl text-rose-600 dark:text-rose-400 font-mono font-bold">
                    {analytics.collapsed_rooms}
                  </strong>
                </div>

                <div className="bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border-subtle)] text-center shadow-xs transition-colors">
                  <span className="text-xs text-[var(--text-muted)] font-mono uppercase block mb-1">Victorious Squads</span>
                  <strong className="text-2xl text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                    {analytics.victorious_rooms ?? 0}
                  </strong>
                </div>
              </div>
            )}

            {/* Live Per-Table Player Presence & Telemetry Breakdown */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl overflow-hidden shadow-md">
              <div className="p-3 bg-[var(--bg-elevated)] border-b border-[var(--border-subtle)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-sky-500" />
                  <h3 className="text-xs font-bold text-[var(--text-primary)] font-theme-heading">
                    LIVE SQUAD TELEMETRY & PLAYER PRESENCE ({rooms.length} TABLES)
                  </h3>
                </div>
                <span className="text-[10px] text-[var(--text-muted)] font-mono">
                  Real-time heartbeat & vote telemetry
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[var(--bg-panel)] text-[var(--text-muted)] text-[10px] uppercase border-b border-[var(--border-subtle)] font-semibold">
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
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                    {rooms.map((r) => {
                      const activeCount = r.active_players_count ?? r.active_players?.length ?? 0;
                      return (
                        <tr key={r.room_id} className="hover:bg-[var(--bg-elevated)] transition-colors">
                          <td className="p-3">
                            <strong className="text-[var(--text-primary)] block font-sans font-bold text-sm">
                              {r.team_name}
                            </strong>
                            <span className="text-[9px] font-mono text-amber-700 dark:text-amber-400 bg-amber-500/15 px-1.5 py-0.2 rounded border border-amber-500/30 inline-block mt-0.5 font-bold">
                              PIN: {r.room_code || r.room_id}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30 font-bold text-[11px]">
                              <Users className="w-3 h-3 text-sky-500" />
                              {activeCount} Active
                            </span>
                            {r.active_players && r.active_players.length > 0 && (
                              <div className="flex items-center justify-center gap-1 flex-wrap mt-1 max-w-xs mx-auto">
                                {r.active_players.map((p) => (
                                  <span
                                    key={p.player_id}
                                    title={p.voted_action ? `Voted: ${p.voted_action}` : 'Connected (not voted)'}
                                    className={`text-[8.5px] px-1 py-0.2 rounded border ${
                                      p.voted_action
                                        ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30'
                                        : 'bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border-subtle)]'
                                    }`}
                                  >
                                    {p.name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="p-3">
                            <span className="text-amber-600 dark:text-amber-400 font-bold">Stage {r.current_stage}/11</span>
                            <span className="text-[10px] text-[var(--text-muted)] block truncate max-w-[160px] font-sans">
                              {r.stage_title}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span
                              className={`font-bold ${
                                r.health > 60
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : r.health > 30
                                  ? 'text-amber-600 dark:text-amber-400'
                                  : 'text-rose-600 dark:text-rose-400'
                              }`}
                            >
                              {r.health}%
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span
                              className={`font-bold ${
                                r.technical_debt >= 4 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'
                              }`}
                            >
                              {r.technical_debt}/5
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span
                              className={`text-[9px] font-mono px-2 py-0.5 rounded-md border uppercase font-bold ${
                                r.is_game_over
                                  ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/40'
                                  : r.is_victory
                                  ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500/40'
                                  : r.health <= 35
                                  ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/40'
                                  : 'bg-sky-500/20 text-sky-800 dark:text-sky-300 border-sky-500/40'
                              }`}
                            >
                              {r.is_game_over ? 'COLLAPSED' : r.is_victory ? 'VICTORY' : r.health <= 35 ? 'CRITICAL' : 'LIVE'}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  onNavigate
                                    ? onNavigate('spectate', r.room_id)
                                    : (window.location.href = `/?roomId=${r.room_id}&spectate=true`)
                                }
                                className="px-2.5 py-1 text-[9px] font-mono font-bold rounded-lg text-sky-700 dark:text-sky-300 bg-sky-500/15 border border-sky-500/30 hover:bg-sky-500/25 inline-flex items-center gap-1 cursor-pointer transition-colors"
                                title="Spectate this room in real-time"
                              >
                                <span>SPECTATE</span>
                                <Eye className="w-2.5 h-2.5" />
                              </button>
                              <button
                                type="button"
                                disabled={globalTimerPaused}
                                onClick={() => handleToggleRoomTimer(r.room_id)}
                                className={`px-2 py-1 text-[9px] font-mono font-bold rounded-lg border inline-flex items-center gap-1 transition-colors ${
                                  globalTimerPaused
                                    ? 'bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--text-muted)] opacity-60 cursor-not-allowed'
                                    : r.is_timer_paused
                                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-800 dark:text-amber-300 cursor-pointer'
                                    : 'bg-sky-500/15 border-sky-500/30 text-sky-700 dark:text-sky-300 cursor-pointer'
                                }`}
                                title={
                                  globalTimerPaused
                                    ? 'World Timer is locked globally.'
                                    : r.is_timer_paused
                                    ? 'Resume timer for this table'
                                    : 'Pause timer for this table'
                                }
                              >
                                {r.is_timer_paused ? (
                                  <Play className="w-2.5 h-2.5 text-amber-500" />
                                ) : (
                                  <Pause className="w-2.5 h-2.5 text-sky-500" />
                                )}
                                <span>{r.is_timer_paused ? 'RESUME' : 'PAUSE'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setTableToDelete({ id: r.room_id, name: r.team_name, code: r.room_code || r.room_id })}
                                className="px-2 py-1 text-[9px] font-mono font-bold text-rose-700 dark:text-rose-300 bg-rose-500/15 border border-rose-500/30 hover:bg-rose-500/25 rounded-lg cursor-pointer transition-colors"
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
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[var(--bg-card)] border border-rose-500/50 rounded-2xl max-w-md w-full p-6 shadow-2xl text-center space-y-4 text-[var(--text-primary)]">
            <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto animate-bounce" />
            <h3 className="text-base font-bold text-[var(--text-primary)] font-theme-heading">
              RESET ALL WORKSHOP ROOMS?
            </h3>
            <p className="text-xs text-[var(--text-secondary)] font-mono leading-relaxed">
              This will restart all active developer squads back to <strong>Stage 1 (100% HP, 0 Debt)</strong>. Use this only when starting a fresh session.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmResetAll(false)}
                className="px-4 py-2 text-xs font-mono font-bold rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleResetAll}
                disabled={loading}
                className="px-4 py-2 text-xs font-mono font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg cursor-pointer transition-colors shadow-md disabled:opacity-50"
              >
                CONFIRM RESET ALL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Themed Confirmation Modal for Delete Single Table */}
      {tableToDelete && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[var(--bg-card)] border border-rose-500/50 rounded-2xl max-w-md w-full p-6 shadow-2xl text-center space-y-4 text-[var(--text-primary)]">
            <div className="w-12 h-12 bg-rose-500/15 border border-rose-500/30 rounded-xl flex items-center justify-center mx-auto shadow-md">
              <Trash2 className="w-6 h-6 text-rose-500" />
            </div>
            <h3 className="text-base font-bold text-[var(--text-primary)] font-theme-heading tracking-wide">
              DELETE TABLE '{tableToDelete.name.toUpperCase()}'?
            </h3>
            <p className="text-xs text-[var(--text-secondary)] font-mono leading-relaxed">
              This will remove table <strong>{tableToDelete.code}</strong> from the workshop session and disconnect all players at this table.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setTableToDelete(null)}
                className="px-4 py-2 text-xs font-mono font-bold rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={() => {
                  handleRoomAction(tableToDelete.id, 'delete');
                  setTableToDelete(null);
                }}
                className="px-4 py-2 text-xs font-mono font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg cursor-pointer transition-colors shadow-md"
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
