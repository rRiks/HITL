/**
 * Pixel Art Theme Definition
 * 80s Retro Cyber Arcade & GameBoy Handheld with CRT nostalgia, VT323 typography, and sharp mechanical tactility.
 */

export const pixelArtTheme = {
  id: 'pixel-art',
  name: 'Pixel Art',
  tagline: '80s Retro Cyber Arcade & CRT Nostalgia',
  icon: 'Gamepad2',
  badge: 'RETRO',
  modes: {
    dark: {
      id: 'dark',
      name: 'Arcade CRT 1984',
      description: 'Late-night arcade glow with neon magenta, cyan laser telemetry, and crisp CRT gridlines.',
      preview: {
        bg: '#080811',
        surface: '#121124',
        accent: '#ff007f',
        secondary: '#00f3ff',
        text: '#f0f3f8',
        border: '#ff007f',
      },
      variables: {
        // Typography World
        '--theme-font-display': "'VT323', monospace",
        '--theme-font-body': "'Silkscreen', monospace",
        '--theme-font-mono': "'VT323', monospace",
        '--theme-letter-spacing': '0.04em',
        '--theme-text-transform': 'uppercase',
        '--theme-line-height': '1.3',

        // Atmospheric World Backdrop
        '--theme-bg': '#080811',
        '--theme-world-bg': 'radial-gradient(ellipse at 50% 20%, #1a0b2e 0%, #080811 80%)',
        '--theme-world-type': 'scanline-grid',

        // Surfaces & Elevation
        '--theme-surface': '#121124',
        '--theme-surface-alt': '#0c0b18',
        '--theme-surface-slot': '#07060e',
        '--theme-surface-card': '#191733',
        '--theme-header-bg': '#0c0b18',
        '--theme-card-bg': '#141328',
        '--theme-backdrop-blur': '0px',
        '--theme-radius-card': '0px',
        '--theme-radius-btn': '0px',
        '--theme-radius-slot': '0px',

        // Borders & Retro Outlines
        '--theme-border': '#ff007f',
        '--theme-border-highlight': '#00f3ff',
        '--theme-border-shadow': '#05050a',
        '--theme-panel-border': '2px solid #ff007f',
        '--theme-panel-shadow': '0 0 16px rgba(255, 0, 127, 0.35), inset 0 0 12px rgba(0, 243, 255, 0.15)',

        // Controls & Tactility (Mechanical Arcade Switch)
        '--theme-btn-bg': '#1f1638',
        '--theme-btn-hover-bg': '#2d1e52',
        '--theme-btn-border': '2px solid #00f3ff',
        '--theme-btn-shadow': '3px 3px 0px #ff007f, 0 0 10px rgba(0, 243, 255, 0.4)',
        '--theme-btn-active-shadow': '1px 1px 0px #ff007f',

        // Palette & Font Colors
        '--theme-text': '#f0f3f8',
        '--theme-text-muted': '#8f8ea8',
        '--theme-text-heading': '#00f3ff',
        '--theme-text-accent': '#ff007f',
        '--theme-accent': '#ff007f',
        '--theme-accent-hover': '#ff3399',
        '--theme-accent-glow': 'rgba(255, 0, 127, 0.6)',
        '--theme-gold': '#ffe600',
        '--theme-danger': '#ff1744',
      },
    },
    light: {
      id: 'light',
      name: 'GameBoy Color Pocket',
      description: 'Nostalgic 90s handheld LCD screen with olive-lime pigments and dark pixel ink.',
      preview: {
        bg: '#8b956d',
        surface: '#9bbc0f',
        accent: '#0f380f',
        secondary: '#306230',
        text: '#0f380f',
        border: '#0f380f',
      },
      variables: {
        // Typography World
        '--theme-font-display': "'VT323', monospace",
        '--theme-font-body': "'Silkscreen', monospace",
        '--theme-font-mono': "'VT323', monospace",
        '--theme-letter-spacing': '0.04em',
        '--theme-text-transform': 'uppercase',
        '--theme-line-height': '1.3',

        // Atmospheric World Backdrop
        '--theme-bg': '#8b956d',
        '--theme-world-bg': 'linear-gradient(180deg, #9bbc0f 0%, #8b956d 100%)',
        '--theme-world-type': 'lcd-dot-matrix',

        // Surfaces & Elevation
        '--theme-surface': '#9bbc0f',
        '--theme-surface-alt': '#8bac0f',
        '--theme-surface-slot': '#7a9b08',
        '--theme-surface-card': '#a4c614',
        '--theme-header-bg': '#8bac0f',
        '--theme-card-bg': '#9bbc0f',
        '--theme-backdrop-blur': '0px',
        '--theme-radius-card': '0px',
        '--theme-radius-btn': '0px',
        '--theme-radius-slot': '0px',

        // Borders & Solid Pixel Outlines
        '--theme-border': '#0f380f',
        '--theme-border-highlight': '#306230',
        '--theme-border-shadow': '#072007',
        '--theme-panel-border': '2px solid #0f380f',
        '--theme-panel-shadow': '3px 3px 0px #0f380f',

        // Controls & Tactility
        '--theme-btn-bg': '#8bac0f',
        '--theme-btn-hover-bg': '#9bbc0f',
        '--theme-btn-border': '2px solid #0f380f',
        '--theme-btn-shadow': '2px 2px 0px #0f380f',
        '--theme-btn-active-shadow': 'inset 2px 2px 0px #0f380f',

        // Palette & Font Colors
        '--theme-text': '#0f380f',
        '--theme-text-muted': '#306230',
        '--theme-text-heading': '#072007',
        '--theme-text-accent': '#0f380f',
        '--theme-accent': '#0f380f',
        '--theme-accent-hover': '#1e521e',
        '--theme-accent-glow': 'rgba(15, 56, 15, 0.3)',
        '--theme-gold': '#306230',
        '--theme-danger': '#591212',
      },
    },
  },
};
