/**
 * Minecraft Classic Theme Definition
 * Authentic 8-bit voxel universe with stone bevels, dirt backdrops, and Press Start 2P typography.
 */

export const minecraftTheme = {
  id: 'minecraft',
  name: 'Minecraft Classic',
  tagline: 'Signature 8-Bit Pixel Art & Beveled GUI',
  icon: 'Pickaxe',
  badge: 'DEFAULT',
  modes: {
    dark: {
      id: 'dark',
      name: 'Nether Obsidian',
      description: 'Atmospheric dark realm with stone slabs, emerald accents, and fiery gold ore.',
      preview: {
        bg: '#191613',
        surface: '#24201c',
        accent: '#2e8b57',
        secondary: '#ffd700',
        text: '#e5dec9',
        border: '#4a4238',
      },
      variables: {
        // Typography World
        '--theme-font-display': "'Press Start 2P', monospace",
        '--theme-font-body': "'Silkscreen', monospace",
        '--theme-font-mono': "'JetBrains Mono', monospace",
        '--theme-letter-spacing': '0.02em',
        '--theme-text-transform': 'uppercase',
        '--theme-line-height': '1.4',

        // Atmospheric World Backdrop
        '--theme-bg': '#191613',
        '--theme-world-bg': 'radial-gradient(circle at 50% 30%, #24201c 0%, #15120e 100%)',
        '--theme-world-type': 'pixel-dirt',

        // Surfaces & Elevation
        '--theme-surface': '#24201c',
        '--theme-surface-alt': '#1e1a17',
        '--theme-surface-slot': '#15120e',
        '--theme-surface-card': '#2b2622',
        '--theme-header-bg': '#24201c',
        '--theme-card-bg': '#2b2622',
        '--theme-backdrop-blur': '0px',
        '--theme-radius-card': '0px',
        '--theme-radius-btn': '0px',
        '--theme-radius-slot': '0px',
        '--theme-radius-badge': '0px',

        // Borders & Bevels
        '--theme-border': '#4a4238',
        '--theme-border-highlight': '#6b6052',
        '--theme-border-shadow': '#120f0c',
        '--theme-panel-border': '2px solid #5a5043',
        '--theme-panel-shadow': 'inset 2px 2px 0px #6b6052, inset -2px -2px 0px #120f0c, 0 4px 12px rgba(0,0,0,0.6)',

        // Controls & Tactility
        '--theme-btn-bg': '#3c352d',
        '--theme-btn-hover-bg': '#4e453b',
        '--theme-btn-border': '2px solid #1a1612',
        '--theme-btn-shadow': 'inset 2px 2px 0px #6b6052, inset -2px -2px 0px #1a1612, 0 2px 0px #000',
        '--theme-btn-active-shadow': 'inset 2px 2px 0px #1a1612, inset -2px -2px 0px #6b6052',

        // Palette & Font Colors
        '--theme-text': '#e5dec9',
        '--theme-text-muted': '#a89f8b',
        '--theme-text-heading': '#ffffff',
        '--theme-text-accent': '#ffd700',
        '--theme-accent': '#2e8b57',
        '--theme-accent-hover': '#3cb371',
        '--theme-accent-glow': 'rgba(46, 139, 87, 0.35)',
        '--theme-gold': '#ffd700',
        '--theme-danger': '#e52521',
      },
    },
    light: {
      id: 'light',
      name: 'Birch & Parchment',
      description: 'Daylight workshop aesthetic with warm papyrus parchment and birch trims.',
      preview: {
        bg: '#f4ece1',
        surface: '#e8dcce',
        accent: '#1e7041',
        secondary: '#b8860b',
        text: '#2a221b',
        border: '#c2b3a1',
      },
      variables: {
        // Typography World
        '--theme-font-display': "'Press Start 2P', monospace",
        '--theme-font-body': "'Silkscreen', monospace",
        '--theme-font-mono': "'JetBrains Mono', monospace",
        '--theme-letter-spacing': '0.02em',
        '--theme-text-transform': 'uppercase',
        '--theme-line-height': '1.4',

        // Atmospheric World Backdrop
        '--theme-bg': '#f4ece1',
        '--theme-world-bg': 'radial-gradient(circle at 50% 30%, #faf5ee 0%, #ebe0d0 100%)',
        '--theme-world-type': 'pixel-dirt-light',

        // Surfaces & Elevation
        '--theme-surface': '#e8dcce',
        '--theme-surface-alt': '#dfd2c2',
        '--theme-surface-slot': '#d5c6b4',
        '--theme-surface-card': '#ede1d3',
        '--theme-header-bg': '#e8dcce',
        '--theme-card-bg': '#ede1d3',
        '--theme-backdrop-blur': '0px',
        '--theme-radius-card': '0px',
        '--theme-radius-btn': '0px',
        '--theme-radius-slot': '0px',
        '--theme-radius-badge': '0px',

        // Borders & Bevels
        '--theme-border': '#c2b3a1',
        '--theme-border-highlight': '#ffffff',
        '--theme-border-shadow': '#a89885',
        '--theme-panel-border': '2px solid #b3a28e',
        '--theme-panel-shadow': 'inset 2px 2px 0px #ffffff, inset -2px -2px 0px #a89885, 0 3px 8px rgba(0,0,0,0.1)',

        // Controls & Tactility
        '--theme-btn-bg': '#dfd2c2',
        '--theme-btn-hover-bg': '#ede1d3',
        '--theme-btn-border': '2px solid #8f7f6d',
        '--theme-btn-shadow': 'inset 2px 2px 0px #ffffff, inset -2px -2px 0px #8f7f6d, 0 2px 0px rgba(0,0,0,0.15)',
        '--theme-btn-active-shadow': 'inset 2px 2px 0px #8f7f6d, inset -2px -2px 0px #ffffff',

        // Palette & Font Colors
        '--theme-text': '#2a221b',
        '--theme-text-muted': '#6b5d4f',
        '--theme-text-heading': '#120d09',
        '--theme-text-accent': '#996515',
        '--theme-accent': '#1e7041',
        '--theme-accent-hover': '#2e8b57',
        '--theme-accent-glow': 'rgba(30, 112, 65, 0.25)',
        '--theme-gold': '#b8860b',
        '--theme-danger': '#c53030',
      },
    },
  },
};
