export const designTokens = {
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
    '3xl': '4rem',    // 64px
  },
  typography: {
    sizes: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
    },
    weights: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeights: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    semantic: {
      success: {
        light: '#d1fae5',
        default: '#10b981',
        dark: '#059669',
      },
      warning: {
        light: '#fef3c7',
        default: '#f59e0b',
        dark: '#d97706',
      },
      error: {
        light: '#fee2e2',
        default: '#ef4444',
        dark: '#dc2626',
      },
      info: {
        light: '#dbeafe',
        default: '#3b82f6',
        dark: '#1d4ed8',
      },
    },
    neutral: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },
  radii: {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px',
  },
  transitions: {
    fast: '150ms ease-in-out',
    normal: '300ms ease-in-out',
    slow: '500ms ease-in-out',
  },
} as const;

// CSS custom properties for theming
export const cssVariables = {
  light: {
    '--color-background': designTokens.colors.neutral[50],
    '--color-foreground': designTokens.colors.neutral[900],
    '--color-muted': designTokens.colors.neutral[100],
    '--color-muted-foreground': designTokens.colors.neutral[500],
    '--color-border': designTokens.colors.neutral[200],
    '--color-primary': designTokens.colors.primary[500],
    '--color-primary-foreground': designTokens.colors.neutral[50],
    '--color-success': designTokens.colors.semantic.success.default,
    '--color-warning': designTokens.colors.semantic.warning.default,
    '--color-error': designTokens.colors.semantic.error.default,
    '--color-info': designTokens.colors.semantic.info.default,
  },
  dark: {
    '--color-background': designTokens.colors.neutral[900],
    '--color-foreground': designTokens.colors.neutral[50],
    '--color-muted': designTokens.colors.neutral[800],
    '--color-muted-foreground': designTokens.colors.neutral[400],
    '--color-border': designTokens.colors.neutral[700],
    '--color-primary': designTokens.colors.primary[400],
    '--color-primary-foreground': designTokens.colors.neutral[900],
    '--color-success': designTokens.colors.semantic.success.default,
    '--color-warning': designTokens.colors.semantic.warning.default,
    '--color-error': designTokens.colors.semantic.error.default,
    '--color-info': designTokens.colors.semantic.info.default,
  },
} as const;
