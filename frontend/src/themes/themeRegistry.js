/**
 * Workshop Theme Registry
 * Public API for all workshop themes.
 * Delegates individual theme configurations to their isolated modules under `./definitions/`.
 */

import { ALL_THEMES, getThemeDefinition } from './definitions';

// Dynamic runtime registry populated from modular definitions
export const THEME_REGISTRY = [...ALL_THEMES];

export { ALL_THEMES, getThemeDefinition };

/**
 * Retrieves a theme specification by its identifier.
 */
export function getThemeById(themeId) {
  return getThemeDefinition(themeId);
}

/**
 * Validates whether a theme object satisfies the dual-mode contract.
 */
export function isValidTheme(theme) {
  if (!theme || typeof theme !== 'object') return false;
  if (!theme.id || !theme.name || !theme.modes) return false;
  return Boolean(theme.modes.dark && theme.modes.light);
}

export default THEME_REGISTRY;
