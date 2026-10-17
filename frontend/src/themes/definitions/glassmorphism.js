/**
 * Glassmorphism Theme Definition
 * Multi-layered frosted glass with optical refraction, specular highlights, and Plus Jakarta Sans typography.
 */

export const glassmorphismTheme = {
  id: 'glassmorphism',
  name: 'Glassmorphism',
  tagline: 'Frosted Aero & Translucent Specular Depth',
  icon: 'Layers',
  badge: 'POPULAR',
  modes: {
    dark: {
      id: 'dark',
      name: 'Midnight Nebula',
      description: 'Deep sapphire-indigo frosted glass with glowing cyan & amethyst rims and high-optical blur.',
      preview: {
        bg: '#0a0d1a',
        surface: 'rgba(21, 28, 48, 0.65)',
        accent: '#38bdf8',
        secondary: '#a855f7',
        text: '#f8fafc',
        border: 'rgba(56, 189, 248, 0.35)',
      },
      variables: {
        // Typography World
        '--theme-font-display': "'Plus Jakarta Sans', system-ui, sans-serif",
        '--theme-font-body': "'Plus Jakarta Sans', system-ui, sans-serif",
        '--theme-font-mono': "'JetBrains Mono', monospace",
        '--theme-letter-spacing': '-0.01em',
        '--theme-text-transform': 'none',
        '--theme-line-height': '1.5',

        // Atmospheric World Backdrop
        '--theme-bg': '#0a0d1a',
        '--theme-world-bg': 'radial-gradient(circle at 50% 0%, #1e1b4b 0%, #0a0d1a 75%)',
        '--theme-world-type': 'nebula-ambient',

        // Surfaces & Elevation (Frosted Glass Slabs)
        '--theme-surface': 'rgba(21, 28, 48, 0.65)',
        '--theme-surface-alt': 'rgba(15, 20, 36, 0.55)',
        '--theme-surface-slot': 'rgba(10, 14, 26, 0.6)',
        '--theme-surface-card': 'rgba(26, 35, 60, 0.7)',
        '--theme-header-bg': 'rgba(12, 16, 30, 0.8)',
        '--theme-card-bg': 'rgba(21, 28, 48, 0.65)',
        '--theme-backdrop-blur': '20px',
        '--theme-radius-card': '16px',
        '--theme-radius-btn': '12px',
        '--theme-radius-slot': '10px',

        // Borders & Specular Sheen
        '--theme-border': 'rgba(255, 255, 255, 0.12)',
        '--theme-border-highlight': 'rgba(255, 255, 255, 0.25)',
        '--theme-border-shadow': 'rgba(0, 0, 0, 0.4)',
        '--theme-panel-border': '1px solid rgba(255, 255, 255, 0.15)',
        '--theme-panel-shadow': '0 8px 32px 0 rgba(0, 0, 0, 0.45), inset 0 1px 0 0 rgba(255, 255, 255, 0.2)',

        // Controls & Tactility (Frosted Glass Capsules)
        '--theme-btn-bg': 'linear-gradient(135deg, rgba(56, 189, 248, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
        '--theme-btn-hover-bg': 'linear-gradient(135deg, rgba(56, 189, 248, 0.35) 0%, rgba(168, 85, 247, 0.35) 100%)',
        '--theme-btn-border': '1px solid rgba(255, 255, 255, 0.25)',
        '--theme-btn-shadow': '0 4px 20px rgba(56, 189, 248, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
        '--theme-btn-active-shadow': 'inset 0 2px 6px rgba(0, 0, 0, 0.4)',

        // Palette & Font Colors
        '--theme-text': '#f8fafc',
        '--theme-text-muted': '#94a3b8',
        '--theme-text-heading': '#ffffff',
        '--theme-text-accent': '#38bdf8',
        '--theme-accent': '#38bdf8',
        '--theme-accent-hover': '#7dd3fc',
        '--theme-accent-glow': 'rgba(56, 189, 248, 0.45)',
        '--theme-gold': '#fbbf24',
        '--theme-danger': '#f43f5e',
      },
    },
    light: {
      id: 'light',
      name: 'Crystal Frost',
      description: 'Luminous daytime frosted crystal with crisp oceanic gradients and white specular rims.',
      preview: {
        bg: '#eef4f8',
        surface: 'rgba(255, 255, 255, 0.65)',
        accent: '#0284c7',
        secondary: '#7c3aed',
        text: '#0f172a',
        border: 'rgba(2, 132, 199, 0.25)',
      },
      variables: {
        // Typography World
        '--theme-font-display': "'Plus Jakarta Sans', system-ui, sans-serif",
        '--theme-font-body': "'Plus Jakarta Sans', system-ui, sans-serif",
        '--theme-font-mono': "'JetBrains Mono', monospace",
        '--theme-letter-spacing': '-0.01em',
        '--theme-text-transform': 'none',
        '--theme-line-height': '1.5',

        // Atmospheric World Backdrop
        '--theme-bg': '#eef4f8',
        '--theme-world-bg': 'radial-gradient(circle at 50% 0%, #dbeafe 0%, #eef4f8 80%)',
        '--theme-world-type': 'crystal-ambient-light',

        // Surfaces & Elevation
        '--theme-surface': 'rgba(255, 255, 255, 0.7)',
        '--theme-surface-alt': 'rgba(240, 246, 252, 0.6)',
        '--theme-surface-slot': 'rgba(225, 235, 245, 0.6)',
        '--theme-surface-card': 'rgba(255, 255, 255, 0.8)',
        '--theme-header-bg': 'rgba(255, 255, 255, 0.8)',
        '--theme-card-bg': 'rgba(255, 255, 255, 0.7)',
        '--theme-backdrop-blur': '18px',
        '--theme-radius-card': '16px',
        '--theme-radius-btn': '12px',
        '--theme-radius-slot': '10px',

        // Borders & Specular Highlights
        '--theme-border': 'rgba(255, 255, 255, 0.6)',
        '--theme-border-highlight': '#ffffff',
        '--theme-border-shadow': 'rgba(15, 23, 42, 0.08)',
        '--theme-panel-border': '1px solid rgba(255, 255, 255, 0.8)',
        '--theme-panel-shadow': '0 8px 30px rgba(15, 23, 42, 0.07), inset 0 1px 0 rgba(255, 255, 255, 0.9)',

        // Controls & Tactility
        '--theme-btn-bg': 'linear-gradient(135deg, rgba(2, 132, 199, 0.15) 0%, rgba(124, 58, 237, 0.15) 100%)',
        '--theme-btn-hover-bg': 'linear-gradient(135deg, rgba(2, 132, 199, 0.25) 0%, rgba(124, 58, 237, 0.25) 100%)',
        '--theme-btn-border': '1px solid rgba(255, 255, 255, 0.7)',
        '--theme-btn-shadow': '0 4px 15px rgba(2, 132, 199, 0.12), inset 0 1px 0 #ffffff',
        '--theme-btn-active-shadow': 'inset 0 2px 4px rgba(15, 23, 42, 0.1)',

        // Palette & Font Colors
        '--theme-text': '#0f172a',
        '--theme-text-muted': '#64748b',
        '--theme-text-heading': '#020617',
        '--theme-text-accent': '#0284c7',
        '--theme-accent': '#0284c7',
        '--theme-accent-hover': '#0369a1',
        '--theme-accent-glow': 'rgba(2, 132, 199, 0.25)',
        '--theme-gold': '#d97706',
        '--theme-danger': '#e11d48',
      },
    },
  },
};
