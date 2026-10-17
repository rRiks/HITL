/**
 * Liquid Glass Theme Definition
 * Chromatic fluidity with iridescent sheen, optical liquid refraction, and Sora & Plus Jakarta Sans typography.
 */

export const liquidGlassTheme = {
  id: 'liquid-glass',
  name: 'Liquid Glass',
  tagline: 'Chromatic Iridescence & Fluid Optical Sheen',
  icon: 'Droplets',
  badge: 'ORGANIC',
  modes: {
    dark: {
      id: 'dark',
      name: 'Abyssal Chromatic Fluid',
      description: 'Deep abyssal navy with fluid iridescent sheen, violet/cyan optical pools, and glassy organic pill cards.',
      preview: {
        bg: '#070a14',
        surface: 'rgba(18, 22, 44, 0.7)',
        accent: '#38bdf8',
        secondary: '#c084fc',
        text: '#f8fafc',
        border: 'rgba(192, 132, 252, 0.35)',
      },
      variables: {
        // Typography World
        '--theme-font-display': "'Sora', system-ui, sans-serif",
        '--theme-font-body': "'Plus Jakarta Sans', system-ui, sans-serif",
        '--theme-font-mono': "'JetBrains Mono', monospace",
        '--theme-letter-spacing': '-0.01em',
        '--theme-text-transform': 'none',
        '--theme-line-height': '1.5',

        // Atmospheric World Backdrop
        '--theme-bg': '#070a14',
        '--theme-world-bg': 'radial-gradient(ellipse at 30% 20%, #2e1065 0%, #070a14 60%)',
        '--theme-world-type': 'liquid-chromatic-dark',

        // Surfaces & Elevation (Fluid Iridescent Slabs)
        '--theme-surface': 'rgba(18, 22, 44, 0.7)',
        '--theme-surface-alt': 'rgba(13, 16, 32, 0.65)',
        '--theme-surface-slot': 'rgba(10, 12, 24, 0.7)',
        '--theme-surface-card': 'rgba(24, 28, 56, 0.75)',
        '--theme-header-bg': 'rgba(10, 13, 26, 0.85)',
        '--theme-card-bg': 'rgba(18, 22, 44, 0.7)',
        '--theme-backdrop-blur': '24px',
        '--theme-radius-card': '22px',
        '--theme-radius-btn': '9999px', // Pill
        '--theme-radius-slot': '14px',

        // Iridescent Fluid Borders & Specular Sheen
        '--theme-border': 'rgba(192, 132, 252, 0.3)',
        '--theme-border-highlight': 'rgba(56, 189, 248, 0.6)',
        '--theme-border-shadow': 'rgba(0, 0, 0, 0.5)',
        '--theme-panel-border': '1px solid rgba(192, 132, 252, 0.25)',
        '--theme-panel-shadow': '0 12px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(192, 132, 252, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.3)',

        // Controls & Tactility (Liquid Pill Buttons)
        '--theme-btn-bg': 'linear-gradient(135deg, rgba(56, 189, 248, 0.25) 0%, rgba(192, 132, 252, 0.25) 100%)',
        '--theme-btn-hover-bg': 'linear-gradient(135deg, rgba(56, 189, 248, 0.4) 0%, rgba(192, 132, 252, 0.4) 100%)',
        '--theme-btn-border': '1px solid rgba(255, 255, 255, 0.3)',
        '--theme-btn-shadow': '0 4px 20px rgba(192, 132, 252, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
        '--theme-btn-active-shadow': 'inset 0 2px 6px rgba(0, 0, 0, 0.4)',

        // Palette & Font Colors
        '--theme-text': '#f8fafc',
        '--theme-text-muted': '#a78bfa',
        '--theme-text-heading': '#ffffff',
        '--theme-text-accent': '#38bdf8',
        '--theme-accent': '#38bdf8',
        '--theme-accent-hover': '#818cf8',
        '--theme-accent-glow': 'rgba(56, 189, 248, 0.5)',
        '--theme-gold': '#fbbf24',
        '--theme-danger': '#f43f5e',
      },
    },
    light: {
      id: 'light',
      name: 'Prismatic Opal Pearl',
      description: 'Luminous iridescent pearl with rainbow chromatic reflections and fluid pastel curves.',
      preview: {
        bg: '#f8f6fc',
        surface: 'rgba(255, 255, 255, 0.75)',
        accent: '#7c3aed',
        secondary: '#0284c7',
        text: '#1e1b4b',
        border: 'rgba(124, 58, 237, 0.25)',
      },
      variables: {
        // Typography World
        '--theme-font-display': "'Sora', system-ui, sans-serif",
        '--theme-font-body': "'Plus Jakarta Sans', system-ui, sans-serif",
        '--theme-font-mono': "'JetBrains Mono', monospace",
        '--theme-letter-spacing': '-0.01em',
        '--theme-text-transform': 'none',
        '--theme-line-height': '1.5',

        // Atmospheric World Backdrop
        '--theme-bg': '#f8f6fc',
        '--theme-world-bg': 'radial-gradient(ellipse at 70% 10%, #ede9fe 0%, #f8f6fc 70%)',
        '--theme-world-type': 'liquid-chromatic-light',

        // Surfaces & Elevation
        '--theme-surface': 'rgba(255, 255, 255, 0.8)',
        '--theme-surface-alt': 'rgba(245, 243, 255, 0.7)',
        '--theme-surface-slot': 'rgba(237, 233, 254, 0.75)',
        '--theme-surface-card': 'rgba(255, 255, 255, 0.9)',
        '--theme-header-bg': 'rgba(255, 255, 255, 0.85)',
        '--theme-card-bg': 'rgba(255, 255, 255, 0.8)',
        '--theme-backdrop-blur': '20px',
        '--theme-radius-card': '22px',
        '--theme-radius-btn': '9999px',
        '--theme-radius-slot': '14px',

        // Borders & Structure
        '--theme-border': 'rgba(124, 58, 237, 0.2)',
        '--theme-border-highlight': '#ffffff',
        '--theme-border-shadow': 'rgba(30, 27, 75, 0.08)',
        '--theme-panel-border': '1px solid rgba(124, 58, 237, 0.2)',
        '--theme-panel-shadow': '0 8px 32px rgba(124, 58, 237, 0.08), inset 0 1px 0 #ffffff',

        // Controls & Tactility
        '--theme-btn-bg': 'linear-gradient(135deg, rgba(124, 58, 237, 0.12) 0%, rgba(2, 132, 199, 0.12) 100%)',
        '--theme-btn-hover-bg': 'linear-gradient(135deg, rgba(124, 58, 237, 0.2) 0%, rgba(2, 132, 199, 0.2) 100%)',
        '--theme-btn-border': '1px solid rgba(124, 58, 237, 0.3)',
        '--theme-btn-shadow': '0 4px 16px rgba(124, 58, 237, 0.15), inset 0 1px 0 #ffffff',
        '--theme-btn-active-shadow': 'inset 0 1px 3px rgba(30, 27, 75, 0.15)',

        // Palette & Font Colors
        '--theme-text': '#1e1b4b',
        '--theme-text-muted': '#6b7280',
        '--theme-text-heading': '#0f0b29',
        '--theme-text-accent': '#7c3aed',
        '--theme-accent': '#7c3aed',
        '--theme-accent-hover': '#6d28d9',
        '--theme-accent-glow': 'rgba(124, 58, 237, 0.25)',
        '--theme-gold': '#d97706',
        '--theme-danger': '#e11d48',
      },
    },
  },
};
