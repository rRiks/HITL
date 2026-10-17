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

      // 2. Set theme family attribute (e.g. data-theme-family="cyberpunk")
      root.setAttribute('data-theme-family', themeObj.id);

      // 3. Inject CSS Variables
      if (modeObj && modeObj.variables) {
        Object.entries(modeObj.variables).forEach(([key, val]) => {
          root.style.setProperty(key, val);
        });
      }
      root.style.setProperty('--font-theme-heading', "'Inter', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif");
      root.style.setProperty('--font-theme-badge', "var(--theme-font-display, 'Press Start 2P', monospace)");

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
