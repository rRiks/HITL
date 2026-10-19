import React, { useState } from 'react';
import {
  Palette,
  Sun,
  Moon,
  Check,
  Radio,
  Plus,
  Eye,
  Sliders,
  Download,
} from 'lucide-react';
import themeEngine from '../themes/themeEngine';
import * as adminApi from './adminApi';

export default function ThemeManager({ currentThemeId, currentMode, onThemeChange, showToast }) {
  const [themes, setThemes] = useState(() => themeEngine.getAllThemes());
  const [activeGlobalTheme, setActiveGlobalTheme] = useState(currentThemeId || 'minecraft');
  const [activeGlobalMode, setActiveGlobalMode] = useState(currentMode || 'dark');
  const [selectedModes, setSelectedModes] = useState(() => {
    // Track selected preview mode per theme (defaults to active mode or dark)
    const initial = {};
    themeEngine.getAllThemes().forEach((t) => {
      initial[t.id] = currentMode || 'dark';
    });
    return initial;
  });

  const [broadcastingId, setBroadcastingId] = useState(null);
  const [showCreatorModal, setShowCreatorModal] = useState(false);

  // Custom Theme Form State (Enforcing BOTH dark and light variants)
  const [newTheme, setNewTheme] = useState({
    id: '',
    name: '',
    tagline: '',
    badge: 'CUSTOM',
    dark: {
      name: 'Dark Realm',
      description: 'Deep midnight aesthetic with high-contrast glowing accents.',
      bg: '#0f172a',
      surface: '#1e293b',
      accent: '#38bdf8',
      secondary: '#f43f5e',
      text: '#f8fafc',
      border: '#38bdf855',
    },
    light: {
      name: 'Light Realm',
      description: 'Bright daytime drafting surface with crisp legible contrast.',
      bg: '#f8fafc',
      surface: '#f1f5f9',
      accent: '#0284c7',
      secondary: '#e11d48',
      text: '#0f172a',
      border: '#0284c744',
    },
  });

  const handleSelectMode = (themeId, mode) => {
    setSelectedModes((prev) => ({ ...prev, [themeId]: mode }));
  };

  const handlePreviewLocally = (themeId, mode) => {
    themeEngine.applyTheme(themeId, mode, true);
    onThemeChange?.(themeId, mode);
    showToast?.(`Local preview applied: ${themeId.toUpperCase()} (${mode.toUpperCase()})`);
  };

  const handleBroadcastTheme = async (themeId, mode) => {
    setBroadcastingId(`${themeId}-${mode}`);
    try {
      await adminApi.setGlobalTheme(themeId, mode);
      themeEngine.applyTheme(themeId, mode, true);
      setActiveGlobalTheme(themeId);
      setActiveGlobalMode(mode);
      onThemeChange?.(themeId, mode);
      showToast?.(`🌟 Theme broadcasted to all workshop tables: ${themeId.toUpperCase()} (${mode.toUpperCase()})`);
    } catch (err) {
      console.error('Failed to broadcast theme:', err);
      showToast?.(`Error broadcasting theme: ${err.message}`);
    } finally {
      setBroadcastingId(null);
    }
  };

  const handleCreateCustomTheme = (e) => {
    e.preventDefault();
    const cleanId = newTheme.id.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '-');
    if (!cleanId) {
      showToast?.('Please enter a valid theme ID (alphanumeric)');
      return;
    }
    if (!newTheme.name.trim()) {
      showToast?.('Please enter a display name for the theme');
      return;
    }

    const customThemeConfig = {
      id: cleanId,
      name: newTheme.name.trim(),
      badge: 'CUSTOM',
      tagline: newTheme.tagline.trim() || 'Custom crafted aesthetic',
      modes: {
        dark: {
          name: newTheme.dark.name,
          description: newTheme.dark.description,
          vars: {
            '--theme-bg': newTheme.dark.bg,
            '--theme-surface': newTheme.dark.surface,
            '--theme-accent': newTheme.dark.accent,
            '--theme-secondary': newTheme.dark.secondary,
            '--theme-text': newTheme.dark.text,
            '--theme-text-heading': '#ffffff',
            '--theme-border': newTheme.dark.border,
            '--tower-bg': newTheme.dark.bg,
            '--bg-app': newTheme.dark.bg,
            '--bg-panel': newTheme.dark.surface,
            '--bg-card': newTheme.dark.surface,
            '--bg-elevated': newTheme.dark.surface,
            '--text-primary': newTheme.dark.text,
            '--text-secondary': '#94a3b8',
            '--border-subtle': newTheme.dark.border,
          },
          preview: {
            bg: newTheme.dark.bg,
            surface: newTheme.dark.surface,
            accent: newTheme.dark.accent,
            secondary: newTheme.dark.secondary,
            text: newTheme.dark.text,
            border: newTheme.dark.border,
          },
        },
        light: {
          name: newTheme.light.name,
          description: newTheme.light.description,
          vars: {
            '--theme-bg': newTheme.light.bg,
            '--theme-surface': newTheme.light.surface,
            '--theme-accent': newTheme.light.accent,
            '--theme-secondary': newTheme.light.secondary,
            '--theme-text': newTheme.light.text,
            '--theme-text-heading': '#0f172a',
            '--theme-border': newTheme.light.border,
            '--tower-bg': newTheme.light.bg,
            '--bg-app': newTheme.light.bg,
            '--bg-panel': newTheme.light.surface,
            '--bg-card': newTheme.light.surface,
            '--bg-elevated': newTheme.light.surface,
            '--text-primary': newTheme.light.text,
            '--text-secondary': '#475569',
            '--border-subtle': newTheme.light.border,
          },
          preview: {
            bg: newTheme.light.bg,
            surface: newTheme.light.surface,
            accent: newTheme.light.accent,
            secondary: newTheme.light.secondary,
            text: newTheme.light.text,
            border: newTheme.light.border,
          },
        },
      },
    };

    try {
      themeEngine.registerTheme(customThemeConfig);
      setThemes(themeEngine.getAllThemes());
      setSelectedModes((prev) => ({ ...prev, [cleanId]: 'dark' }));
      setShowCreatorModal(false);
      showToast?.(`Crafted and registered custom theme: ${customThemeConfig.name}`);
    } catch (err) {
      showToast?.(`Registration error: ${err.message}`);
    }
  };

  const handleExportThemes = () => {
    const all = themeEngine.getAllThemes();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(all, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `hitl-themes-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast?.('Theme registry exported as JSON');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Broadcast Target Status Bar */}
      <div className="bg-[var(--bg-card)] p-4 sm:p-5 rounded-xl border border-[var(--border-subtle)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center shrink-0 shadow-sm">
            <Palette className="w-5 h-5 text-sky-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 font-bold">
                BROADCAST TARGET
              </span>
              <span className="text-xs font-mono text-[var(--text-muted)]">Live Workshop Synchronization</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] font-theme-heading tracking-wide mt-1">
              Active Global Theme:{' '}
              <span className="text-amber-600 dark:text-amber-400 uppercase">{activeGlobalTheme}</span>{' '}
              <span className="text-xs text-sky-600 dark:text-sky-400 font-mono">({activeGlobalMode.toUpperCase()} REALM)</span>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
          <button
            type="button"
            onClick={handleExportThemes}
            className="px-3 py-2 text-xs font-mono font-bold rounded-lg border transition-all cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-1.5"
            title="Export Theme Registry as JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT JSON</span>
          </button>
          <button
            type="button"
            onClick={() => setShowCreatorModal(true)}
            className="px-3.5 py-2 text-xs font-mono font-bold text-white rounded-lg bg-emerald-600 hover:bg-emerald-500 flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ CRAFT CUSTOM THEME</span>
          </button>
        </div>
      </div>

      {/* Themes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {themes.map((theme) => {
          const currentChosenMode = selectedModes[theme.id] || 'dark';
          const modeConfig = theme.modes[currentChosenMode] || theme.modes.dark;
          const isCurrentlyActiveGlobal =
            activeGlobalTheme === theme.id && activeGlobalMode === currentChosenMode;
          const isBroadcastingThis = broadcastingId === `${theme.id}-${currentChosenMode}`;

          return (
            <div
              key={theme.id}
              className={`p-4 sm:p-5 rounded-xl border transition-all relative flex flex-col justify-between shadow-md ${
                isCurrentlyActiveGlobal
                  ? 'bg-[var(--bg-card)] border-amber-500/60 ring-2 ring-amber-500/30 shadow-xl'
                  : 'bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-slate-400 dark:hover:border-slate-600'
              }`}
            >
              {/* Card Top: Title & Badges */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] font-theme-heading tracking-wide">
                        {theme.name}
                      </h3>
                      {theme.badge && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)] font-bold">
                          {theme.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-muted)] font-mono mt-0.5">{theme.tagline}</p>
                  </div>

                  {isCurrentlyActiveGlobal && (
                    <span className="text-[9px] font-mono font-bold px-2 py-1 rounded-md bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40 flex items-center gap-1 shrink-0 animate-pulse">
                      <Check className="w-3 h-3 text-amber-500" />
                      ACTIVE WORLD
                    </span>
                  )}
                </div>

                {/* Dark vs Light Mode Toggle */}
                <div className="my-3 flex items-center gap-2 bg-[var(--bg-elevated)] p-1 rounded-lg border border-[var(--border-subtle)]">
                  <button
                    type="button"
                    onClick={() => handleSelectMode(theme.id, 'dark')}
                    className={`flex-1 py-1.5 px-3 text-xs font-mono rounded-md flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      currentChosenMode === 'dark'
                        ? 'bg-[var(--bg-card)] text-sky-700 dark:text-sky-300 font-bold border border-[var(--border-subtle)] shadow-xs'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5 text-sky-500" />
                    <span>Dark Realm</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectMode(theme.id, 'light')}
                    className={`flex-1 py-1.5 px-3 text-xs font-mono rounded-md flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      currentChosenMode === 'light'
                        ? 'bg-[var(--bg-card)] text-amber-700 dark:text-amber-300 font-bold border border-[var(--border-subtle)] shadow-xs'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span>Light Realm</span>
                  </button>
                </div>

                {/* Mode description & Color Swatches */}
                <p className="text-xs text-[var(--text-secondary)] font-mono mb-3 min-h-[36px] leading-relaxed">
                  {modeConfig.description}
                </p>

                {/* Palette Preview Swatches */}
                <div className="bg-[var(--bg-code)] p-2.5 rounded-lg border border-[var(--border-subtle)] mb-4 space-y-2">
                  <div className="text-[10px] font-mono text-[var(--text-muted)] flex justify-between font-semibold">
                    <span>PALETTE SWATCHES</span>
                    <span>{modeConfig.name}</span>
                  </div>

                  <div className="grid grid-cols-6 gap-1.5 h-8">
                    {[
                      { label: 'BG', color: modeConfig.preview.bg },
                      { label: 'Surface', color: modeConfig.preview.surface },
                      { label: 'Accent', color: modeConfig.preview.accent },
                      { label: 'Alt', color: modeConfig.preview.secondary },
                      { label: 'Text', color: modeConfig.preview.text },
                      { label: 'Border', color: modeConfig.preview.border },
                    ].map((swatch, sIdx) => (
                      <div
                        key={sIdx}
                        className="h-full rounded border border-black/20 flex flex-col items-center justify-end p-0.5 group relative shadow-xs"
                        style={{ backgroundColor: swatch.color }}
                        title={`${swatch.label}: ${swatch.color}`}
                      >
                        <span className="text-[8px] font-mono font-bold bg-black/70 text-white px-0.5 rounded opacity-80 group-hover:opacity-100">
                          {swatch.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Micro UI Preview Mockup */}
                  <div
                    className="p-2.5 rounded-lg border mt-2 flex items-center justify-between text-xs font-mono shadow-inner"
                    style={{
                      backgroundColor: modeConfig.preview.surface,
                      borderColor: modeConfig.preview.border,
                      color: modeConfig.preview.text,
                    }}
                  >
                    <span className="truncate mr-2 font-bold">{modeConfig.name}</span>
                    <span
                      className="px-2 py-0.5 text-[10px] font-bold rounded border"
                      style={{
                        backgroundColor: modeConfig.preview.accent,
                        borderColor: modeConfig.preview.border,
                        color: currentChosenMode === 'dark' ? '#000' : '#fff',
                      }}
                    >
                      SAMPLE GUI
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => handlePreviewLocally(theme.id, currentChosenMode)}
                  className="flex-1 px-2.5 py-2 text-xs font-mono font-bold rounded-lg border transition-all cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-center gap-1.5"
                  title="Inspect theme locally on Game Master screen only"
                >
                  <Eye className="w-3.5 h-3.5 text-sky-500" />
                  <span>PREVIEW LOCALLY</span>
                </button>

                <button
                  type="button"
                  disabled={isBroadcastingThis || isCurrentlyActiveGlobal}
                  onClick={() => handleBroadcastTheme(theme.id, currentChosenMode)}
                  className={`flex-1 px-3 py-2 text-xs font-mono font-bold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    isCurrentlyActiveGlobal
                      ? 'bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-muted)] cursor-not-allowed opacity-60'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                  }`}
                  title="Broadcast this theme to all player laptops in the workshop"
                >
                  <Radio className={`w-3.5 h-3.5 ${isBroadcastingThis ? 'animate-spin' : ''}`} />
                  <span>
                    {isCurrentlyActiveGlobal
                      ? 'ACTIVE ON ALL TABLES'
                      : isBroadcastingThis
                      ? 'BROADCASTING...'
                      : 'APPLY TO ALL TABLES'}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Theme Creator Modal */}
      {showCreatorModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl max-w-2xl w-full p-6 shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto text-[var(--text-primary)]">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)] mb-4">
              <div className="flex items-center gap-2.5">
                <Sliders className="w-5 h-5 text-sky-500" />
                <h3 className="text-base font-bold text-[var(--text-primary)] font-theme-heading">
                  CRAFT NEW CUSTOM THEME
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreatorModal(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] font-mono text-sm px-2 py-1 rounded cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[var(--text-secondary)] font-mono mb-4 leading-relaxed">
              Define your custom visual identity. Every theme registered in the HITL engine must specify{' '}
              <strong className="text-amber-600 dark:text-amber-400">both Dark and Light variants</strong> for full workshop accessibility.
            </p>

            <form onSubmit={handleCreateCustomTheme} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-sky-600 dark:text-sky-400 mb-1">
                    THEME ID (SLUG)
                  </label>
                  <input
                    type="text"
                    value={newTheme.id}
                    onChange={(e) => setNewTheme({ ...newTheme, id: e.target.value })}
                    placeholder="e.g. solarpunk-botany"
                    className="w-full bg-[var(--bg-code)] border border-[var(--border-subtle)] text-[var(--text-primary)] p-2 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono font-bold text-sky-600 dark:text-sky-400 mb-1">
                    DISPLAY NAME
                  </label>
                  <input
                    type="text"
                    value={newTheme.name}
                    onChange={(e) => setNewTheme({ ...newTheme, name: e.target.value })}
                    placeholder="e.g. Solar Punk Botanical"
                    className="w-full bg-[var(--bg-code)] border border-[var(--border-subtle)] text-[var(--text-primary)] p-2 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-[var(--text-muted)] mb-1">
                  TAGLINE / VIBE
                </label>
                <input
                  type="text"
                  value={newTheme.tagline}
                  onChange={(e) => setNewTheme({ ...newTheme, tagline: e.target.value })}
                  placeholder="e.g. Organic Brass, Foliage Greens & Bioluminescent Accents"
                  className="w-full bg-[var(--bg-code)] border border-[var(--border-subtle)] text-[var(--text-primary)] p-2 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500"
                />
              </div>

              {/* Dual Realm Specs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Dark Realm Configuration */}
                <div className="p-3 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-subtle)]">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400 mb-2 font-mono">
                    <Moon className="w-3.5 h-3.5" />
                    <span>DARK REALM CONFIG</span>
                  </div>
                  <div className="space-y-2 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-[var(--text-muted)]">Background:</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <input
                          type="color"
                          value={newTheme.dark.bg}
                          onChange={(e) =>
                            setNewTheme({
                              ...newTheme,
                              dark: { ...newTheme.dark, bg: e.target.value },
                            })
                          }
                          className="w-6 h-6 border rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={newTheme.dark.bg}
                          onChange={(e) =>
                            setNewTheme({
                              ...newTheme,
                              dark: { ...newTheme.dark, bg: e.target.value },
                            })
                          }
                          className="bg-[var(--bg-code)] text-[var(--text-primary)] text-[10px] px-1.5 py-0.5 rounded border border-[var(--border-subtle)] flex-1 font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--text-muted)]">Surface / Panel:</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <input
                          type="color"
                          value={newTheme.dark.surface}
                          onChange={(e) =>
                            setNewTheme({
                              ...newTheme,
                              dark: { ...newTheme.dark, surface: e.target.value },
                            })
                          }
                          className="w-6 h-6 border rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={newTheme.dark.surface}
                          onChange={(e) =>
                            setNewTheme({
                              ...newTheme,
                              dark: { ...newTheme.dark, surface: e.target.value },
                            })
                          }
                          className="bg-[var(--bg-code)] text-[var(--text-primary)] text-[10px] px-1.5 py-0.5 rounded border border-[var(--border-subtle)] flex-1 font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--text-muted)]">Primary Accent:</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <input
                          type="color"
                          value={newTheme.dark.accent}
                          onChange={(e) =>
                            setNewTheme({
                              ...newTheme,
                              dark: { ...newTheme.dark, accent: e.target.value },
                            })
                          }
                          className="w-6 h-6 border rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={newTheme.dark.accent}
                          onChange={(e) =>
                            setNewTheme({
                              ...newTheme,
                              dark: { ...newTheme.dark, accent: e.target.value },
                            })
                          }
                          className="bg-[var(--bg-code)] text-[var(--text-primary)] text-[10px] px-1.5 py-0.5 rounded border border-[var(--border-subtle)] flex-1 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Light Realm Configuration */}
                <div className="p-3 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-subtle)]">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 mb-2 font-mono">
                    <Sun className="w-3.5 h-3.5" />
                    <span>LIGHT REALM CONFIG</span>
                  </div>
                  <div className="space-y-2 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-[var(--text-muted)]">Background:</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <input
                          type="color"
                          value={newTheme.light.bg}
                          onChange={(e) =>
                            setNewTheme({
                              ...newTheme,
                              light: { ...newTheme.light, bg: e.target.value },
                            })
                          }
                          className="w-6 h-6 border rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={newTheme.light.bg}
                          onChange={(e) =>
                            setNewTheme({
                              ...newTheme,
                              light: { ...newTheme.light, bg: e.target.value },
                            })
                          }
                          className="bg-[var(--bg-code)] text-[var(--text-primary)] text-[10px] px-1.5 py-0.5 rounded border border-[var(--border-subtle)] flex-1 font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--text-muted)]">Surface / Panel:</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <input
                          type="color"
                          value={newTheme.light.surface}
                          onChange={(e) =>
                            setNewTheme({
                              ...newTheme,
                              light: { ...newTheme.light, surface: e.target.value },
                            })
                          }
                          className="w-6 h-6 border rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={newTheme.light.surface}
                          onChange={(e) =>
                            setNewTheme({
                              ...newTheme,
                              light: { ...newTheme.light, surface: e.target.value },
                            })
                          }
                          className="bg-[var(--bg-code)] text-[var(--text-primary)] text-[10px] px-1.5 py-0.5 rounded border border-[var(--border-subtle)] flex-1 font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--text-muted)]">Primary Accent:</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <input
                          type="color"
                          value={newTheme.light.accent}
                          onChange={(e) =>
                            setNewTheme({
                              ...newTheme,
                              light: { ...newTheme.light, accent: e.target.value },
                            })
                          }
                          className="w-6 h-6 border rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={newTheme.light.accent}
                          onChange={(e) =>
                            setNewTheme({
                              ...newTheme,
                              light: { ...newTheme.light, accent: e.target.value },
                            })
                          }
                          className="bg-[var(--bg-code)] text-[var(--text-primary)] text-[10px] px-1.5 py-0.5 rounded border border-[var(--border-subtle)] flex-1 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit / Cancel */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setShowCreatorModal(false)}
                  className="px-4 py-2 text-xs font-mono font-bold rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-mono font-bold rounded-lg text-white bg-emerald-600 hover:bg-emerald-500 flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>REGISTER CUSTOM THEME</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
