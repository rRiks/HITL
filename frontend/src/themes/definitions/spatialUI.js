/**
 * Spatial UI Theme Definition
 * visionOS-inspired holographic spatial computing with floating layered planes, cosmic horizon glow, and Space Grotesk typography.
 */

export const spatialUITheme = {
  id: 'spatial-ui',
  name: 'Spatial UI',
  tagline: 'visionOS Holographic Planes & Cosmic Telemetry',
  icon: 'Box',
  badge: 'FUTURISTIC',
  modes: {
    dark: {
      id: 'dark',
      name: 'Cosmos Telemetry HUD',
      description: 'Floating holographic glass slabs with cyan telemetry, solar amber accents, and cosmic horizon glow.',
      preview: {
        bg: '#050814',
        surface: 'rgba(12, 18, 38, 0.75)',
        accent: '#00f0ff',
        secondary: '#f59e0b',
        text: '#f1f5f9',
        border: 'rgba(0, 240, 255, 0.35)',
      },
      variables: {
        // Typography World
        '--theme-font-display': "'Space Grotesk', system-ui, sans-serif",
        '--theme-font-body': "'Space Grotesk', system-ui, sans-serif",
        '--theme-font-mono': "'JetBrains Mono', monospace",
        '--theme-letter-spacing': '0.01em',
        '--theme-text-transform': 'none',
        '--theme-line-height': '1.5',

        // Atmospheric World Backdrop
        '--theme-bg': '#050814',
        '--theme-world-bg': 'radial-gradient(ellipse at 50% 100%, #172554 0%, #050814 70%)',
        '--theme-world-type': 'spatial-cosmos',

        // Surfaces & Floating Elevation (Spatial Planes)
        '--theme-surface': 'rgba(12, 18, 38, 0.75)',
        '--theme-surface-alt': 'rgba(8, 12, 28, 0.65)',
        '--theme-surface-slot': 'rgba(6, 10, 22, 0.7)',
        '--theme-surface-card': 'rgba(17, 24, 52, 0.8)',
        '--theme-header-bg': 'rgba(7, 11, 25, 0.85)',
        '--theme-card-bg': 'rgba(12, 18, 38, 0.75)',
        '--theme-backdrop-blur': '24px',
        '--theme-radius-card': '18px',
        '--theme-radius-btn': '14px',
        '--theme-radius-slot': '12px',

        // Holographic Horizon Borders
        '--theme-border': 'rgba(0, 240, 255, 0.25)',
        '--theme-border-highlight': 'rgba(0, 240, 255, 0.6)',
        '--theme-border-shadow': 'rgba(0, 0, 0, 0.6)',
        '--theme-panel-border': '1px solid rgba(0, 240, 255, 0.25)',
        '--theme-panel-shadow': '0 12px 40px rgba(0, 0, 0, 0.6), 0 0 24px rgba(0, 240, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.15)',

        // Controls & Tactility (Floating Spatial Capsule)
        '--theme-btn-bg': 'rgba(16, 24, 52, 0.8)',
        '--theme-btn-hover-bg': 'rgba(24, 36, 76, 0.9)',
        '--theme-btn-border': '1px solid rgba(0, 240, 255, 0.4)',
        '--theme-btn-shadow': '0 4px 16px rgba(0, 240, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        '--theme-btn-active-shadow': 'inset 0 2px 8px rgba(0, 0, 0, 0.5)',

        // Palette & Font Colors
        '--theme-text': '#f1f5f9',
        '--theme-text-muted': '#94a3b8',
        '--theme-text-heading': '#ffffff',
        '--theme-text-accent': '#00f0ff',
        '--theme-accent': '#00f0ff',
        '--theme-accent-hover': '#38bdf8',
        '--theme-accent-glow': 'rgba(0, 240, 255, 0.5)',
        '--theme-gold': '#f59e0b',
        '--theme-danger': '#ef4444',
      },
    },
    light: {
      id: 'light',
      name: 'Solar Stratosphere',
      description: 'Luminous high-altitude sky with holographic blue glass and aerospace titanium accents.',
      preview: {
        bg: '#eef5ff',
        surface: 'rgba(255, 255, 255, 0.75)',
        accent: '#0284c7',
        secondary: '#d97706',
        text: '#0f172a',
        border: 'rgba(2, 132, 199, 0.3)',
      },
      variables: {
        // Typography World
        '--theme-font-display': "'Space Grotesk', system-ui, sans-serif",
        '--theme-font-body': "'Space Grotesk', system-ui, sans-serif",
        '--theme-font-mono': "'JetBrains Mono', monospace",
        '--theme-letter-spacing': '0.01em',
        '--theme-text-transform': 'none',
        '--theme-line-height': '1.5',

        // Atmospheric World Backdrop
        '--theme-bg': '#eef5ff',
        '--theme-world-bg': 'radial-gradient(ellipse at 50% 0%, #bfdbfe 0%, #eef5ff 75%)',
        '--theme-world-type': 'spatial-solar-light',

        // Surfaces & Elevation
        '--theme-surface': 'rgba(255, 255, 255, 0.8)',
        '--theme-surface-alt': 'rgba(240, 247, 255, 0.7)',
        '--theme-surface-slot': 'rgba(224, 239, 255, 0.75)',
        '--theme-surface-card': 'rgba(255, 255, 255, 0.9)',
        '--theme-header-bg': 'rgba(255, 255, 255, 0.85)',
        '--theme-card-bg': 'rgba(255, 255, 255, 0.8)',
        '--theme-backdrop-blur': '20px',
        '--theme-radius-card': '18px',
        '--theme-radius-btn': '14px',
        '--theme-radius-slot': '12px',

        // Borders & Structure
        '--theme-border': 'rgba(2, 132, 199, 0.25)',
        '--theme-border-highlight': 'rgba(2, 132, 199, 0.5)',
        '--theme-border-shadow': 'rgba(15, 23, 42, 0.08)',
        '--theme-panel-border': '1px solid rgba(2, 132, 199, 0.25)',
        '--theme-panel-shadow': '0 8px 30px rgba(2, 132, 199, 0.1), inset 0 1px 0 #ffffff',

        // Controls & Tactility
        '--theme-btn-bg': 'rgba(240, 247, 255, 0.9)',
        '--theme-btn-hover-bg': 'rgba(224, 239, 255, 0.95)',
        '--theme-btn-border': '1px solid rgba(2, 132, 199, 0.35)',
        '--theme-btn-shadow': '0 4px 14px rgba(2, 132, 199, 0.15)',
        '--theme-btn-active-shadow': 'inset 0 1px 3px rgba(15, 23, 42, 0.15)',

        // Palette & Font Colors
        '--theme-text': '#0f172a',
        '--theme-text-muted': '#64748b',
        '--theme-text-heading': '#020617',
        '--theme-text-accent': '#0284c7',
        '--theme-accent': '#0284c7',
        '--theme-accent-hover': '#0369a1',
        '--theme-accent-glow': 'rgba(2, 132, 199, 0.3)',
        '--theme-gold': '#d97706',
        '--theme-danger': '#dc2626',
      },
    },
  },
};
