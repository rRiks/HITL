/**
 * Theme Definitions Master Aggregator
 * Imports and exports all isolated, modular theme definitions.
 * Follows strict Separation of Concerns: each theme maintains its own file.
 */

import { minecraftTheme } from './minecraft';
import { pixelArtTheme } from './pixelArt';
import { glassmorphismTheme } from './glassmorphism';
import { neumorphismTheme } from './neumorphism';
import { bentoGridTheme } from './bentoGrid';
import { spatialUITheme } from './spatialUI';
import { liquidGlassTheme } from './liquidGlass';

export {
  minecraftTheme,
  pixelArtTheme,
  glassmorphismTheme,
  neumorphismTheme,
  bentoGridTheme,
  spatialUITheme,
  liquidGlassTheme,
};

/**
 * Complete list of all registered workshop theme worlds.
 * New themes can be added simply by creating a new file in definitions/ and importing it here.
 */
export const ALL_THEMES = [
  minecraftTheme,
  pixelArtTheme,
  glassmorphismTheme,
  neumorphismTheme,
  bentoGridTheme,
  spatialUITheme,
  liquidGlassTheme,
];

/**
 * Finds a theme definition by ID with fallback to Minecraft Classic.
 */
export function getThemeDefinition(themeId) {
  const cleanId = (themeId || '').toLowerCase().trim();
  return ALL_THEMES.find((t) => t.id === cleanId) || minecraftTheme;
}
