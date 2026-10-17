/**
 * Neumorphism Theme Definition
 * Soft physical UI with extruded matte surfaces, sculpted directional shadows, and Outfit typography.
 */

export const neumorphismTheme = {
  id: 'neumorphism',
  name: 'Neumorphism',
  tagline: 'Soft Tactile Physical UI & Sculpted Depth',
  icon: 'CircleDot',
  badge: 'TACTILE',
  modes: {
    dark: {
      id: 'dark',
      name: 'Matte Obsidian Slate',
      description: 'Velvety dark graphite with extruded physical surfaces, cyan LED accents, and zero hard borders.',
      preview: {
        bg: '#181b22',
        surface: '#181b22',
        accent: '#38bdf8',
        secondary: '#f43f5e',
        text: '#e2e8f0',
        border: '#242934',
      },
      variables: {
        // Typography World
        '--theme-font-display': "'Outfit', sans-serif",
        '--theme-font-body': "'Outfit', sans-serif",
        '--theme-font-mono': "'JetBrains Mono', monospace",
        '--theme-letter-spacing': '0.01em',
        '--theme-text-transform': 'none',
        '--theme-line-height': '1.5',

        // Atmospheric World Backdrop
        '--theme-bg': '#181b22',
        '--theme-world-bg': '#181b22',
        '--theme-world-type': 'soft-matte',

        // Surfaces & Sculpted Elevation
        '--theme-surface': '#181b22',
        '--theme-surface-alt': '#14161c',
        '--theme-surface-slot': '#13151b',
        '--theme-surface-card': '#1b1f27',
        '--theme-header-bg': '#181b22',
        '--theme-card-bg': '#181b22',
        '--theme-backdrop-blur': '0px',
        '--theme-radius-card': '20px',
        '--theme-radius-btn': '16px',
        '--theme-radius-slot': '12px',
        '--theme-radius-badge': '9999px',

        // Sculpted Dual Shadows (No hard borders)
        '--theme-border': 'transparent',
        '--theme-border-highlight': 'rgba(255, 255, 255, 0.05)',
        '--theme-border-shadow': 'rgba(0, 0, 0, 0.6)',
        '--theme-panel-border': 'none',
        '--theme-panel-shadow': '8px 8px 20px #0e1014, -8px -8px 20px #222630',

        // Controls & Tactility (Extruded Convex Push Buttons)
        '--theme-btn-bg': '#181b22',
        '--theme-btn-hover-bg': '#1b1f27',
        '--theme-btn-border': 'none',
        '--theme-btn-shadow': '5px 5px 12px #0e1014, -5px -5px 12px #222630',
        '--theme-btn-active-shadow': 'inset 4px 4px 10px #0e1014, inset -4px -4px 10px #222630',

        // Palette & Font Colors
        '--theme-text': '#e2e8f0',
        '--theme-text-muted': '#7e8b9f',
        '--theme-text-heading': '#ffffff',
        '--theme-text-accent': '#38bdf8',
        '--theme-accent': '#38bdf8',
        '--theme-accent-hover': '#7dd3fc',
        '--theme-accent-glow': 'rgba(56, 189, 248, 0.3)',
        '--theme-gold': '#fbbf24',
        '--theme-danger': '#f43f5e',
      },
    },
    light: {
      id: 'light',
      name: 'Sculpted Porcelain Clay',
      description: 'Clean architectural ceramic with soft directional daylight shadows and embossed controls.',
      preview: {
        bg: '#e6ecf4',
        surface: '#e6ecf4',
        accent: '#0284c7',
        secondary: '#e11d48',
        text: '#1e293b',
        border: '#d5deeb',
      },
      variables: {
        // Typography World
        '--theme-font-display': "'Outfit', sans-serif",
        '--theme-font-body': "'Outfit', sans-serif",
        '--theme-font-mono': "'JetBrains Mono', monospace",
        '--theme-letter-spacing': '0.01em',
        '--theme-text-transform': 'none',
        '--theme-line-height': '1.5',

        // Atmospheric World Backdrop
        '--theme-bg': '#e6ecf4',
        '--theme-world-bg': '#e6ecf4',
        '--theme-world-type': 'soft-ceramic-light',

        // Surfaces & Elevation
        '--theme-surface': '#e6ecf4',
        '--theme-surface-alt': '#dbe3ed',
        '--theme-surface-slot': '#d5deeb',
        '--theme-surface-card': '#eaf0f7',
        '--theme-header-bg': '#e6ecf4',
        '--theme-card-bg': '#e6ecf4',
        '--theme-backdrop-blur': '0px',
        '--theme-radius-card': '20px',
        '--theme-radius-btn': '16px',
        '--theme-radius-slot': '12px',
        '--theme-radius-badge': '9999px',

        // Sculpted Dual Shadows
        '--theme-border': 'transparent',
        '--theme-border-highlight': '#ffffff',
        '--theme-border-shadow': '#c8d2e0',
        '--theme-panel-border': 'none',
        '--theme-panel-shadow': '8px 8px 20px #c2ccd9, -8px -8px 20px #ffffff',

        // Controls & Tactility
        '--theme-btn-bg': '#e6ecf4',
        '--theme-btn-hover-bg': '#eaf0f7',
        '--theme-btn-border': 'none',
        '--theme-btn-shadow': '5px 5px 12px #c2ccd9, -5px -5px 12px #ffffff',
        '--theme-btn-active-shadow': 'inset 4px 4px 8px #c2ccd9, inset -4px -4px 8px #ffffff',

        // Palette & Font Colors
        '--theme-text': '#1e293b',
        '--theme-text-muted': '#64748b',
        '--theme-text-heading': '#0f172a',
        '--theme-text-accent': '#0284c7',
        '--theme-accent': '#0284c7',
        '--theme-accent-hover': '#0369a1',
        '--theme-accent-glow': 'rgba(2, 132, 199, 0.2)',
        '--theme-gold': '#d97706',
        '--theme-danger': '#e11d48',
      },
    },
  },
};
