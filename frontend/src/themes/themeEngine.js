import React from 'react';
import { THEME_REGISTRY } from './themeRegistry';

const STORAGE_KEY_CONFIG = 'hitl_theme_config';
const STORAGE_KEY_LEGACY = 'hitl_theme';

class ThemeEngine {
  constructor() {
    this.registry = [...THEME_REGISTRY];
    this.currentThemeId = 'minecraft';
    this.currentMode = 'dark';
    this.listeners = new Set();
    this.initialized = false;
  }

  /**
   * Initializes theme engine from stored settings or default.
   */
  init() {
    if (this.initialized) return this.getCurrentState();
    this.initialized = true;

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_CONFIG);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.theme && parsed.mode) {
            this.currentThemeId = parsed.theme;
            this.currentMode = parsed.mode;
          }
        } else {
          // Check legacy dark/light key
          const legacyMode = localStorage.getItem(STORAGE_KEY_LEGACY);
          if (legacyMode === 'light' || legacyMode === 'dark') {
            this.currentMode = legacyMode;
          }
        }
      } catch (err) {
        console.warn('Failed to parse stored theme config:', err);
      }

      this.applyTheme(this.currentThemeId, this.currentMode, false);
    }

    return this.getCurrentState();
  }

  /**
   * Returns list of all available themes in registry.
   */
  getAllThemes() {
    return this.registry;
  }

  /**
   * Retrieves a theme definition by id.
   */
  getTheme(themeId) {
    const cleanId = (themeId || '').toLowerCase().trim();
    return this.registry.find((t) => t.id === cleanId) || this.registry[0];
  }

  /**
   * Returns current active theme object and mode.
   */
  getCurrentState() {
    const themeObj = this.getTheme(this.currentThemeId);
    const modeConfig = themeObj.modes[this.currentMode] || themeObj.modes.dark;
    return {
      themeId: themeObj.id,
      themeName: themeObj.name,
      mode: this.currentMode,
      theme: themeObj,
      modeConfig,
    };
  }

  /**
   * Alias for getCurrentState() to prevent runtime sync exceptions.
   */
  getState() {
    return this.getCurrentState();
  }

  /**
   * Registers a new custom theme into the engine at runtime.
   * Enables user-defined custom written themes.
   */
  registerTheme(customTheme) {
    if (!customTheme || !customTheme.id || !customTheme.modes) {
      console.error('Invalid custom theme specification:', customTheme);
      return false;
    }

    // Check if theme requires both light and dark options
    if (!customTheme.modes.dark || !customTheme.modes.light) {
      console.warn(`Theme '${customTheme.id}' should include both 'dark' and 'light' mode options.`);
    }

    const existingIndex = this.registry.findIndex((t) => t.id === customTheme.id);
    if (existingIndex >= 0) {
      this.registry[existingIndex] = { ...this.registry[existingIndex], ...customTheme };
    } else {
      this.registry.push(customTheme);
    }

    this._notifyListeners();
    return true;
  }

  /**
   * Applies the theme and mode to the DOM.
   * @param {string} themeId
   * @param {'dark'|'light'} mode
   * @param {boolean} persist - whether to save in localStorage
   */
  applyTheme(themeId, mode = 'dark', persist = true) {
    const cleanThemeId = (themeId || 'minecraft').toLowerCase().trim();
    const cleanMode = mode === 'light' ? 'light' : 'dark';

    const themeObj = this.getTheme(cleanThemeId);
    const modeObj = themeObj.modes[cleanMode] || themeObj.modes.dark;

    this.currentThemeId = themeObj.id;
    this.currentMode = cleanMode;

    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const root = document.documentElement;

      // 1. Maintain backward compatibility with existing [data-theme="light"] selectors
      root.setAttribute('data-theme', cleanMode);
      root.style.colorScheme = cleanMode;

      // Synchronize class list so Tailwind v4 custom dark variant matches perfectly
      if (cleanMode === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
      }

      // 2. Set theme family attribute (e.g. data-theme-family="cyberpunk")
      root.setAttribute('data-theme-family', themeObj.id);

      // 3. Inject Theme Specific CSS Variables
      if (modeObj && modeObj.variables) {
        Object.entries(modeObj.variables).forEach(([key, val]) => {
          root.style.setProperty(key, val);
        });
      }

      // 4. Inject Dynamic Semantic Color-Mode Tokens
      const isLight = cleanMode === 'light';
      const isMinecraft = themeObj.id === 'minecraft';
      const isLiquidGlass = themeObj.id === 'liquid-glass';

      if (isLight) {
        root.style.setProperty('--bg-app', isMinecraft ? (modeObj?.variables?.['--theme-bg'] || '#f4ece1') : isLiquidGlass ? '#f8f6fc' : '#eef2f6');
        root.style.setProperty('--bg-panel', isMinecraft ? (modeObj?.variables?.['--theme-surface'] || '#e8dcce') : isLiquidGlass ? 'rgba(255, 255, 255, 0.88)' : 'rgba(255, 255, 255, 0.88)');
        root.style.setProperty('--bg-card', isMinecraft ? (modeObj?.variables?.['--theme-surface-card'] || '#fbf8f3') : isLiquidGlass ? 'rgba(255, 255, 255, 0.96)' : 'rgba(255, 255, 255, 0.96)');
        root.style.setProperty('--bg-elevated', isMinecraft ? (modeObj?.variables?.['--theme-surface-alt'] || '#decaba') : isLiquidGlass ? '#f3f0fb' : '#f1f5f9');
        root.style.setProperty('--bg-code', isMinecraft ? '#faf6f0' : '#f8fafc');
        root.style.setProperty(
          '--tower-bg',
          isMinecraft
            ? 'linear-gradient(180deg, #cbe5ff 0%, #e2f0fd 50%, #f0f7ff 100%)'
            : isLiquidGlass
            ? 'linear-gradient(180deg, #ede9fe 0%, #e0e7ff 45%, #f1f5f9 100%)'
            : 'linear-gradient(180deg, #eef2f6 0%, #e2e8f0 50%, #cbd5e1 100%)'
        );
        root.style.setProperty('--text-primary', isMinecraft ? '#2a221b' : '#0a0f1d');
        root.style.setProperty('--text-secondary', isMinecraft ? '#5c4c3d' : '#1e293b');
        root.style.setProperty('--text-muted', isMinecraft ? '#786450' : '#475569');
        root.style.setProperty('--border-subtle', isMinecraft ? (modeObj?.variables?.['--theme-border'] || '#c2b3a1') : isLiquidGlass ? 'rgba(124, 58, 237, 0.20)' : 'rgba(15, 23, 42, 0.14)');
        root.style.setProperty('--diff-add-bg', 'rgba(16, 185, 129, 0.12)');
        root.style.setProperty('--diff-add-text', '#065f46');
        root.style.setProperty('--diff-del-bg', 'rgba(244, 63, 94, 0.12)');
        root.style.setProperty('--diff-del-text', '#9f1239');
      } else {
        root.style.setProperty('--bg-app', isMinecraft ? (modeObj?.variables?.['--theme-bg'] || '#191613') : (modeObj?.variables?.['--theme-bg'] || '#050814'));
        root.style.setProperty('--bg-panel', isMinecraft ? (modeObj?.variables?.['--theme-surface'] || '#24201c') : 'rgba(15, 23, 42, 0.72)');
        root.style.setProperty('--bg-card', isMinecraft ? (modeObj?.variables?.['--theme-surface-card'] || '#2b2622') : 'rgba(15, 23, 42, 0.85)');
        root.style.setProperty('--bg-elevated', isMinecraft ? (modeObj?.variables?.['--theme-surface-alt'] || '#1e1a17') : 'rgba(30, 41, 59, 0.65)');
        root.style.setProperty('--bg-code', isMinecraft ? '#15120e' : '#070b14');
        root.style.setProperty('--tower-bg', '#050814');
        root.style.setProperty('--text-primary', isMinecraft ? '#e5dec9' : '#f8fafc');
        root.style.setProperty('--text-secondary', isMinecraft ? '#cbd5e1' : '#cbd5e1');
        root.style.setProperty('--text-muted', isMinecraft ? '#a89f8b' : '#94a3b8');
        root.style.setProperty('--border-subtle', isMinecraft ? (modeObj?.variables?.['--theme-border'] || '#4a4238') : 'rgba(255, 255, 255, 0.10)');
        root.style.setProperty('--diff-add-bg', 'rgba(16, 185, 129, 0.14)');
        root.style.setProperty('--diff-add-text', '#6ee7b7');
        root.style.setProperty('--diff-del-bg', 'rgba(244, 63, 94, 0.14)');
        root.style.setProperty('--diff-del-text', '#fda4af');
      }

      root.style.setProperty('--font-theme-heading', "'Inter', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif");
      root.style.setProperty(
        '--font-theme-badge',
        isMinecraft
          ? "var(--theme-font-display, 'Press Start 2P', monospace)"
          : "var(--theme-font-body, 'Plus Jakarta Sans', system-ui, sans-serif)"
      );

      // 4. Persistence (debounced to avoid blocking main thread on rapid toggles)
      if (persist) {
        this._schedulePersistence(themeObj.id, cleanMode);
      }

      // 5. Dispatch native CustomEvent for any non-React listeners
      try {
        window.dispatchEvent(
          new CustomEvent('hitl:themechange', {
            detail: { theme: themeObj.id, mode: cleanMode, themeObj, modeObj },
          })
        );
      } catch {}
    }

    this._notifyListeners();
    return this.getCurrentState();
  }

/**
 * Debounced persistence helper for zero-lag continuous toggling.
 */
_schedulePersistence(themeId, mode) {
  if (typeof window === 'undefined') return;
  if (this._persistTimer) {
    clearTimeout(this._persistTimer);
  }
  this._persistTimer = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify({ theme: themeId, mode }));
      localStorage.setItem(STORAGE_KEY_LEGACY, mode);
    } catch {}
  }, 100);
}

/**
 * Toggles between 'dark' and 'light' mode within the current theme.
 */
toggleMode() {
  const nextMode = this.currentMode === 'light' ? 'dark' : 'light';
  return this.applyTheme(this.currentThemeId, nextMode, true);
}

  /**
   * Subscribe to theme changes.
   */
  subscribe(callback) {
    if (typeof callback === 'function') {
      this.listeners.add(callback);
    }
    return () => this.listeners.delete(callback);
  }

  _notifyListeners() {
    const state = this.getCurrentState();
    this.listeners.forEach((cb) => {
      try {
        cb(state);
      } catch (err) {
        console.error('Error in theme listener:', err);
      }
    });
  }
}

// Singleton theme engine instance
export const themeEngine = new ThemeEngine();

// React hook for consuming and reacting to theme state
export function useTheme() {
  const [state, setState] = React.useState(() => themeEngine.init());

  React.useEffect(() => {
    return themeEngine.subscribe((newState) => {
      setState(newState);
    });
  }, []);

  return {
    ...state,
    applyTheme: (themeId, mode) => themeEngine.applyTheme(themeId, mode, true),
    toggleMode: () => themeEngine.toggleMode(),
    getAllThemes: () => themeEngine.getAllThemes(),
    getTheme: (id) => themeEngine.getTheme(id),
  };
}

export default themeEngine;
