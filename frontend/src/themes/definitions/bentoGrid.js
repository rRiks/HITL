/**
 * Bento Grid Theme Definition
 * Apple/Linear-inspired modern modular studio with crisp hairline borders, high-density cards, and Inter typography.
 */

export const bentoGridTheme = {
  id: 'bento-grid',
  name: 'Bento Grid',
  tagline: 'Apple/Linear Modular Studio & Hairline Borders',
  icon: 'LayoutGrid',
  badge: 'MODULAR',
  modes: {
    dark: {
      id: 'dark',
      name: 'Carbon & Titanium',
      description: 'High-contrast modular carbon cards with hairline borders, precise typographic scale, and emerald telemetry.',
      preview: {
        bg: '#0d1117',
        surface: '#161b22',
        accent: '#10b981',
        secondary: '#6366f1',
        text: '#f0f6fc',
        border: '#30363d',
      },
      variables: {
        // Typography World
        '--theme-font-display': "'Inter', system-ui, sans-serif",
        '--theme-font-body': "'Inter', system-ui, sans-serif",
        '--theme-font-mono': "'JetBrains Mono', monospace",
        '--theme-letter-spacing': '-0.02em',
        '--theme-text-transform': 'none',
        '--theme-line-height': '1.5',

        // Atmospheric World Backdrop
        '--theme-bg': '#0d1117',
        '--theme-world-bg': '#0d1117',
        '--theme-world-type': 'dot-grid-dark',

        // Surfaces & Elevation (Modular Cards)
        '--theme-surface': '#161b22',
        '--theme-surface-alt': '#0e1217',
        '--theme-surface-slot': '#0d1117',
        '--theme-surface-card': '#1c2128',
        '--theme-header-bg': 'rgba(13, 17, 23, 0.9)',
        '--theme-card-bg': '#161b22',
        '--theme-backdrop-blur': '12px',
        '--theme-radius-card': '14px',
        '--theme-radius-btn': '10px',
        '--theme-radius-slot': '8px',

        // Borders & Structure
        '--theme-border': '#30363d',
        '--theme-border-highlight': '#484f58',
        '--theme-border-shadow': '#010409',
        '--theme-panel-border': '1px solid #30363d',
        '--theme-panel-shadow': '0 4px 20px rgba(0, 0, 0, 0.4), 0 0 0 1px #30363d',

        // Controls & Tactility (Minimalist Structured Pill)
        '--theme-btn-bg': '#21262d',
        '--theme-btn-hover-bg': '#30363d',
        '--theme-btn-border': '1px solid #363b42',
        '--theme-btn-shadow': '0 2px 4px rgba(0, 0, 0, 0.2)',
        '--theme-btn-active-shadow': 'inset 0 1px 2px rgba(0, 0, 0, 0.3)',

        // Palette & Font Colors
        '--theme-text': '#f0f6fc',
        '--theme-text-muted': '#8b949e',
        '--theme-text-heading': '#ffffff',
        '--theme-text-accent': '#10b981',
        '--theme-accent': '#10b981',
        '--theme-accent-hover': '#34d399',
        '--theme-accent-glow': 'rgba(16, 185, 129, 0.35)',
        '--theme-gold': '#f59e0b',
        '--theme-danger': '#ef4444',
      },
    },
    light: {
      id: 'light',
      name: 'Swiss Minimalist Studio',
      description: 'Ultra-clean architectural canvas with crisp silver dividers and deep ink typography.',
      preview: {
        bg: '#f8fafc',
        surface: '#ffffff',
        accent: '#059669',
        secondary: '#4f46e5',
        text: '#0f172a',
        border: '#e2e8f0',
      },
      variables: {
        // Typography World
        '--theme-font-display': "'Inter', system-ui, sans-serif",
        '--theme-font-body': "'Inter', system-ui, sans-serif",
        '--theme-font-mono': "'JetBrains Mono', monospace",
        '--theme-letter-spacing': '-0.02em',
        '--theme-text-transform': 'none',
        '--theme-line-height': '1.5',

        // Atmospheric World Backdrop
        '--theme-bg': '#f8fafc',
        '--theme-world-bg': '#f8fafc',
        '--theme-world-type': 'dot-grid-light',

        // Surfaces & Elevation
        '--theme-surface': '#ffffff',
        '--theme-surface-alt': '#f1f5f9',
        '--theme-surface-slot': '#e2e8f0',
        '--theme-surface-card': '#ffffff',
        '--theme-header-bg': 'rgba(255, 255, 255, 0.9)',
        '--theme-card-bg': '#ffffff',
        '--theme-backdrop-blur': '12px',
        '--theme-radius-card': '14px',
        '--theme-radius-btn': '10px',
        '--theme-radius-slot': '8px',

        // Borders & Structure
        '--theme-border': '#e2e8f0',
        '--theme-border-highlight': '#f1f5f9',
        '--theme-border-shadow': '#cbd5e1',
        '--theme-panel-border': '1px solid #e2e8f0',
        '--theme-panel-shadow': '0 4px 12px rgba(15, 23, 42, 0.04), 0 0 0 1px #e2e8f0',

        // Controls & Tactility
        '--theme-btn-bg': '#f1f5f9',
        '--theme-btn-hover-bg': '#e2e8f0',
        '--theme-btn-border': '1px solid #cbd5e1',
        '--theme-btn-shadow': '0 1px 2px rgba(15, 23, 42, 0.05)',
        '--theme-btn-active-shadow': 'inset 0 1px 2px rgba(15, 23, 42, 0.1)',

        // Palette & Font Colors
        '--theme-text': '#0f172a',
        '--theme-text-muted': '#64748b',
        '--theme-text-heading': '#020617',
        '--theme-text-accent': '#059669',
        '--theme-accent': '#059669',
        '--theme-accent-hover': '#047857',
        '--theme-accent-glow': 'rgba(5, 150, 105, 0.25)',
        '--theme-gold': '#d97706',
        '--theme-danger': '#dc2626',
      },
    },
  },
};
