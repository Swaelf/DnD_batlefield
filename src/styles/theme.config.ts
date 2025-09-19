import { createStitches } from '@stitches/react'

export const {
  styled,
  css,
  globalCss,
  keyframes,
  getCssText,
  theme,
  createTheme,
  config
} = createStitches({
  theme: {
    colors: {
      // D&D Brand Colors
      dndRed: '#922610',
      dndGold: '#C9AD6A',
      dndBlack: '#1A1A1A',

      // Semantic tokens
      primary: '$dndRed',
      secondary: '$dndGold',
      background: '$gray900',
      surface: '$gray800',

      // Gray scale (matching current Tailwind theme)
      gray100: '#F5F5F5',
      gray200: '#E5E5E5',
      gray300: '#D4D4D4',
      gray400: '#A3A3A3',
      gray500: '#737373',
      gray600: '#525252',
      gray700: '#404040',
      gray800: '#262626',
      gray900: '#171717',

      // State colors
      success: '#10B981',
      warning: '$dndGold',
      error: '$dndRed',
      info: '#3B82F6',

      // Canvas and transparent
      transparent: 'transparent',
      white: '#ffffff',
      black: '#000000'
    },

    space: {
      1: '4px',
      2: '8px',
      3: '12px',
      4: '16px',
      5: '20px',
      6: '24px',
      8: '32px',
      10: '40px',
      12: '48px',
      16: '64px',
      20: '80px'
    },

    sizes: {
      // Component sizes (matching current layout)
      toolbarHeight: '48px',
      sidebarWidth: '320px',
      leftToolbarWidth: '64px',
      toolButtonSize: '32px',

      // D&D grid sizes (for token sizing)
      gridTiny: '25px',     // 0.5 squares
      gridSmall: '25px',    // 1 square
      gridMedium: '25px',   // 1 square
      gridLarge: '50px',    // 2x2 squares
      gridHuge: '75px',     // 3x3 squares
      gridGargantuan: '100px', // 4x4 squares

      // Canvas dimensions
      canvasDefault: '1920px',
      canvasHeight: '1080px'
    },

    fonts: {
      dnd: 'Scala Sans, system-ui, sans-serif',
      mono: 'JetBrains Mono, Consolas, monospace',
      system: 'system-ui, sans-serif'
    },

    fontSizes: {
      xs: '11px',
      sm: '13px',
      base: '14px',
      md: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px'
    },

    fontWeights: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },

    lineHeights: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2
    },

    radii: {
      sm: '4px',
      md: '6px',
      lg: '8px',
      xl: '12px',
      '2xl': '16px',
      round: '9999px'
    },

    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',

      // D&D-themed shadows
      dnd: '0 0 20px rgba(146, 38, 16, 0.3)',  // Red glow
      gold: '0 0 20px rgba(201, 173, 106, 0.3)', // Gold glow

      // UI specific
      panel: '0 8px 32px rgba(0, 0, 0, 0.12)',
      tooltip: '0 4px 16px rgba(0, 0, 0, 0.18)'
    },

    borderWidths: {
      0: '0',
      1: '1px',
      2: '2px',
      4: '4px',
      8: '8px'
    },

    transitions: {
      fast: '150ms ease',
      base: '250ms ease',
      slow: '350ms ease',
      springy: '250ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',

      // Animation curves
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)'
    },

    zIndices: {
      auto: 'auto',
      base: 0,
      docked: 10,
      dropdown: 1000,
      sticky: 1100,
      banner: 1200,
      overlay: 1300,
      modal: 1400,
      popover: 1500,
      skipLink: 1600,
      toast: 1700,
      tooltip: 1800
    }
  },

  media: {
    sm: '(min-width: 640px)',
    md: '(min-width: 768px)',
    lg: '(min-width: 1024px)',
    xl: '(min-width: 1280px)',
    '2xl': '(min-width: 1536px)',

    // Interaction media queries
    motion: '(prefers-reduced-motion: no-preference)',
    hover: '(any-hover: hover)',
    focus: '(any-focus: focus)',

    // Theme media queries
    dark: '(prefers-color-scheme: dark)',
    light: '(prefers-color-scheme: light)'
  },

  utils: {
    // Padding utilities
    p: (value: any) => ({
      padding: value
    }),
    pt: (value: any) => ({
      paddingTop: value
    }),
    pr: (value: any) => ({
      paddingRight: value
    }),
    pb: (value: any) => ({
      paddingBottom: value
    }),
    pl: (value: any) => ({
      paddingLeft: value
    }),
    px: (value: any) => ({
      paddingLeft: value,
      paddingRight: value
    }),
    py: (value: any) => ({
      paddingTop: value,
      paddingBottom: value
    }),

    // Margin utilities
    m: (value: any) => ({
      margin: value
    }),
    mt: (value: any) => ({
      marginTop: value
    }),
    mr: (value: any) => ({
      marginRight: value
    }),
    mb: (value: any) => ({
      marginBottom: value
    }),
    ml: (value: any) => ({
      marginLeft: value
    }),
    mx: (value: any) => ({
      marginLeft: value,
      marginRight: value
    }),
    my: (value: any) => ({
      marginTop: value,
      marginBottom: value
    }),

    // Size utilities
    size: (value: any) => ({
      width: value,
      height: value
    }),

    // Background utilities
    linearGradient: (value: any) => ({
      backgroundImage: `linear-gradient(${value})`
    }),

    // Border utilities
    border: (value: any) => ({
      border: value
    }),
    borderX: (value: any) => ({
      borderLeft: value,
      borderRight: value
    }),
    borderY: (value: any) => ({
      borderTop: value,
      borderBottom: value
    }),

    // Position utilities
    inset: (value: any) => ({
      top: value,
      right: value,
      bottom: value,
      left: value
    }),
    insetX: (value: any) => ({
      left: value,
      right: value
    }),
    insetY: (value: any) => ({
      top: value,
      bottom: value
    })
  }
})

// Export types for use in components
export type CSS = Parameters<typeof css>[0]
export type ComponentProps<T> = T extends React.ComponentType<infer P> ? P : never
export type StitchesVariants<T> = T extends (...args: any[]) => any
  ? Parameters<T>[0] extends { variants: infer V }
    ? V
    : never
  : never