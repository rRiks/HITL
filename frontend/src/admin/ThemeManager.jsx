import React, { useState } from 'react';
import {
  Palette,
  Sun,
  Moon,
  Sparkles,
  Check,
  Radio,
  Plus,
  Copy,
  Eye,
  Sliders,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Download,
  Upload,
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
      showToast?.('Please enter a theme display name');
      return;
    }

    const themePayload = {
      id: cleanId,
      name: newTheme.name.trim(),
      tagline: newTheme.tagline.trim() || 'Custom Workshop Theme',
      badge: 'CUSTOM',
      modes: {
        dark: {
          id: 'dark',
          name: newTheme.dark.name,
          description: newTheme.dark.description,
          preview: {
            bg: newTheme.dark.bg,
            surface: newTheme.dark.surface,
            accent: newTheme.dark.accent,
            secondary: newTheme.dark.secondary,
            text: newTheme.dark.text,
            border: newTheme.dark.border,
          },
          variables: {
            '--theme-bg': newTheme.dark.bg,
            '--theme-surface': newTheme.dark.surface,
            '--theme-surface-alt': newTheme.dark.surface,
            '--theme-surface-slot': newTheme.dark.bg,
            '--theme-border': newTheme.dark.border,
            '--theme-border-highlight': newTheme.dark.accent,
            '--theme-border-shadow': '#000000',
            '--theme-text': newTheme.dark.text,
            '--theme-text-muted': '#94a3b8',
            '--theme-text-heading': newTheme.dark.accent,
            '--theme-accent': newTheme.dark.accent,
            '--theme-accent-hover': newTheme.dark.accent,
            '--theme-accent-glow': `${newTheme.dark.accent}55`,
            '--theme-gold': '#ffd700',
            '--theme-danger': newTheme.dark.secondary,
            '--theme-header-bg': newTheme.dark.surface,
            '--theme-card-bg': newTheme.dark.surface,
          },
        },
        light: {
          id: 'light',
          name: newTheme.light.name,
          description: newTheme.light.description,
          preview: {
            bg: newTheme.light.bg,
            surface: newTheme.light.surface,
            accent: newTheme.light.accent,
            secondary: newTheme.light.secondary,
            text: newTheme.light.text,
            border: newTheme.light.border,
          },
          variables: {
            '--theme-bg': newTheme.light.bg,
            '--theme-surface': newTheme.light.surface,
            '--theme-surface-alt': newTheme.light.surface,
            '--theme-surface-slot': newTheme.light.bg,
            '--theme-border': newTheme.light.border,
            '--theme-border-highlight': newTheme.light.accent,
            '--theme-border-shadow': '#cbd5e1',
            '--theme-text': newTheme.light.text,
            '--theme-text-muted': '#64748b',
            '--theme-text-heading': newTheme.light.accent,
            '--theme-accent': newTheme.light.accent,
            '--theme-accent-hover': newTheme.light.accent,
            '--theme-accent-glow': `${newTheme.light.accent}33`,
            '--theme-gold': '#d97706',
            '--theme-danger': newTheme.light.secondary,
            '--theme-header-bg': newTheme.light.surface,
            '--theme-card-bg': newTheme.light.surface,
          },
        },
      },
    };

    themeEngine.registerTheme(themePayload);
    setThemes([...themeEngine.getAllThemes()]);
    setShowCreatorModal(false);
    showToast?.(`Custom theme '${themePayload.name}' successfully registered with Light & Dark variants!`);
  };

  const handleExportThemes = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(themes, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'hitl_workshop_themes.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast?.('Workshop themes exported as JSON');
  };

  return (
    <div className="space-y-6">
      {/* Active Theme Status Banner */}
      <div className="p-4 sm:p-5 bg-[#121622] border-2 border-[#2b354c] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 bg-[#1a233a] border-2 border-[#38bdf8] flex items-center justify-center shrink-0 shadow-md">
            <Palette className="w-5 h-5 text-[#38bdf8]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] mc-font px-2 py-0.5 bg-[#0e3a24] text-[#55ff55] border border-[#55ff55]">
                BROADCAST TARGET
              </span>
              <span className="text-xs font-mono text-[#8e98ad]">Live Workshop Synchronization</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white mc-font tracking-wide mt-1">
              Active Global Theme:{' '}
              <span className="text-[#ffd700] uppercase">{activeGlobalTheme}</span>{' '}
              <span className="text-xs text-[#38bdf8] font-mono">({activeGlobalMode.toUpperCase()} REALM)</span>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
          <button
            type="button"
            onClick={handleExportThemes}
            className="mc-btn px-3 py-2 text-[10px] mc-font text-[#aaa] hover:text-white flex items-center gap-1.5 cursor-pointer"
            title="Export Theme Registry as JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT JSON</span>
          </button>
          <button
            type="button"
            onClick={() => setShowCreatorModal(true)}
            className="mc-btn-green px-3.5 py-2 text-[10px] mc-font text-white flex items-center gap-1.5 cursor-pointer shadow-md"
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
              className={`p-4 sm:p-5 border-2 transition-all relative flex flex-col justify-between ${
                isCurrentlyActiveGlobal
                  ? 'bg-[#151c2a] border-[#ffd700] shadow-xl shadow-amber-950/20'
                  : 'bg-[#10141e] border-[#222a3d] hover:border-[#38bdf888]'
              }`}
            >
              {/* Card Top: Title & Badges */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-white mc-font tracking-wide">
                        {theme.name}
                      </h3>
                      {theme.badge && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 bg-[#252a3a] text-[#8eb2db] border border-[#3b4766]">
                          {theme.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#8e98ad] font-mono mt-0.5">{theme.tagline}</p>
                  </div>

                  {isCurrentlyActiveGlobal && (
                    <span className="text-[9px] mc-font px-2 py-1 bg-[#4a3400] text-[#ffd700] border-2 border-[#ffd700] flex items-center gap-1 shrink-0 animate-pulse">
                      <Check className="w-3 h-3 text-[#ffd700]" />
                      ACTIVE WORLD
                    </span>
                  )}
                </div>

                {/* Dark vs Light Mode Toggle (Requirement: Every theme has both!) */}
                <div className="my-3 flex items-center gap-2 bg-[#0a0d14] p-1 border border-[#1e2538]">
                  <button
                    type="button"
                    onClick={() => handleSelectMode(theme.id, 'dark')}
                    className={`flex-1 py-1.5 px-3 text-xs font-mono flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                      currentChosenMode === 'dark'
                        ? 'bg-[#1e293b] text-[#38bdf8] font-bold border border-[#38bdf8]'
                        : 'text-[#64748b] hover:text-[#94a3b8]'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5 text-[#38bdf8]" />
                    <span>Dark Realm</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectMode(theme.id, 'light')}
                    className={`flex-1 py-1.5 px-3 text-xs font-mono flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                      currentChosenMode === 'light'
                        ? 'bg-[#f8fafc] text-[#0284c7] font-bold border border-[#0284c7]'
                        : 'text-[#64748b] hover:text-[#94a3b8]'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5 text-[#d97706]" />
                    <span>Light Realm</span>
                  </button>
                </div>

                {/* Mode description & Color Swatches */}
                <p className="text-xs text-[#9bb0c9] font-mono mb-3 min-h-[36px] leading-relaxed">
                  {modeConfig.description}
                </p>

                {/* Palette Preview Swatches */}
                <div className="bg-[#0b0e14] p-2.5 border border-[#1f2638] mb-4 space-y-2">
                  <div className="text-[10px] font-mono text-[#6c7d9e] flex justify-between">
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
                        className="h-full border border-black/30 flex flex-col items-center justify-end p-0.5 group relative"
                        style={{ backgroundColor: swatch.color }}
                        title={`${swatch.label}: ${swatch.color}`}
                      >
                        <span className="text-[8px] font-mono font-bold bg-black/60 text-white px-0.5 rounded opacity-80 group-hover:opacity-100">
                          {swatch.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Micro UI Preview Mockup */}
                  <div
                    className="p-2 border mt-2 flex items-center justify-between text-xs font-mono"
                    style={{
                      backgroundColor: modeConfig.preview.surface,
                      borderColor: modeConfig.preview.border,
                      color: modeConfig.preview.text,
                    }}
                  >
                    <span className="truncate mr-2 font-bold">{modeConfig.name}</span>
                    <span
                      className="px-2 py-0.5 text-[10px] font-bold border"
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
              <div className="flex items-center gap-2 pt-2 border-t border-[#1e2538]">
                <button
                  type="button"
                  onClick={() => handlePreviewLocally(theme.id, currentChosenMode)}
                  className="flex-1 mc-btn px-2.5 py-2 text-[10px] mc-font text-[#aaa] hover:text-white flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Inspect theme locally on Game Master screen only"
                >
                  <Eye className="w-3.5 h-3.5 text-[#38bdf8]" />
                  <span>PREVIEW LOCALLY</span>
                </button>

                <button
                  type="button"
                  disabled={isBroadcastingThis || isCurrentlyActiveGlobal}
                  onClick={() => handleBroadcastTheme(theme.id, currentChosenMode)}
                  className={`flex-1 px-3 py-2 text-[10px] mc-font flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    isCurrentlyActiveGlobal
                      ? 'bg-[#1f293d] border-2 border-[#475569] text-[#64748b] cursor-not-allowed'
                      : 'mc-btn-green text-white shadow-md'
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
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="mc-panel-dark max-w-2xl w-full p-6 border-4 border-[#38bdf8] shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#2b354c] mb-4">
              <div className="flex items-center gap-2.5">
                <Sliders className="w-5 h-5 text-[#38bdf8]" />
                <h3 className="text-base font-bold text-white mc-font">CRAFT NEW CUSTOM THEME</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreatorModal(false)}
                className="text-[#888] hover:text-white font-mono text-sm px-2 py-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#aaa] font-mono mb-4">
              Define your custom visual identity. Every theme registered in the HITL engine must specify{' '}
              <strong className="text-[#ffd700]">both Dark and Light variants</strong> for full workshop accessibility.
            </p>

            <form onSubmit={handleCreateCustomTheme} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] mc-font text-[#38bdf8] mb-1">THEME ID (SLUG)</label>
                  <input
                    type="text"
                    value={newTheme.id}
                    onChange={(e) => setNewTheme({ ...newTheme, id: e.target.value })}
                    placeholder="e.g. solarpunk-botany"
                    className="w-full bg-[#0b0e14] border border-[#2b354c] text-white p-2 text-xs font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] mc-font text-[#38bdf8] mb-1">DISPLAY NAME</label>
                  <input
                    type="text"
                    value={newTheme.name}
                    onChange={(e) => setNewTheme({ ...newTheme, name: e.target.value })}
                    placeholder="e.g. Solar Punk Botanical"
                    className="w-full bg-[#0b0e14] border border-[#2b354c] text-white p-2 text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] mc-font text-[#aaa] mb-1">TAGLINE / VIBE</label>
                <input
                  type="text"
                  value={newTheme.tagline}
                  onChange={(e) => setNewTheme({ ...newTheme, tagline: e.target.value })}
                  placeholder="e.g. Organic Brass, Foliage Greens & Bioluminescent Accents"
                  className="w-full bg-[#0b0e14] border border-[#2b354c] text-white p-2 text-xs font-mono"
                />
              </div>

              {/* Dual Realm Specs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Dark Realm Configuration */}
                <div className="p-3 bg-[#0a0d14] border border-[#222a3d]">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#38bdf8] mb-2 font-mono">
                    <Moon className="w-3.5 h-3.5" />
                    <span>DARK REALM CONFIG</span>
                  </div>
                  <div className="space-y-2 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-[#64748b]">Background:</span>
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
                          className="w-6 h-6 border cursor-pointer"
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
                          className="bg-black text-white text-[10px] px-1.5 py-0.5 border border-[#333] flex-1"
                        />
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#64748b]">Surface / Panel:</span>
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
                          className="w-6 h-6 border cursor-pointer"
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
                          className="bg-black text-white text-[10px] px-1.5 py-0.5 border border-[#333] flex-1"
                        />
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#64748b]">Primary Accent:</span>
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
                          className="w-6 h-6 border cursor-pointer"
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
                          className="bg-black text-white text-[10px] px-1.5 py-0.5 border border-[#333] flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Light Realm Configuration */}
                <div className="p-3 bg-[#0a0d14] border border-[#222a3d]">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#d97706] mb-2 font-mono">
                    <Sun className="w-3.5 h-3.5" />
                    <span>LIGHT REALM CONFIG</span>
                  </div>
                  <div className="space-y-2 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-[#64748b]">Background:</span>
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
                          className="w-6 h-6 border cursor-pointer"
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
                          className="bg-black text-white text-[10px] px-1.5 py-0.5 border border-[#333] flex-1"
                        />
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#64748b]">Surface / Panel:</span>
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
                          className="w-6 h-6 border cursor-pointer"
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
                          className="bg-black text-white text-[10px] px-1.5 py-0.5 border border-[#333] flex-1"
                        />
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#64748b]">Primary Accent:</span>
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
                          className="w-6 h-6 border cursor-pointer"
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
                          className="bg-black text-white text-[10px] px-1.5 py-0.5 border border-[#333] flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit / Cancel */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#222a3d]">
                <button
                  type="button"
                  onClick={() => setShowCreatorModal(false)}
                  className="mc-btn px-4 py-2 text-xs mc-font text-[#aaa]"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="mc-btn-green px-5 py-2 text-xs mc-font text-white flex items-center gap-1.5"
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
