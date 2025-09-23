import { createGlobalTheme, createTheme, createThemeContract } from '@vanilla-extract/css'

// Define the theme contract (shape of our theme)
const themeContract = createThemeContract({
  colors: {
    // Primary colors
    primary: '',
    primaryHover: '',
    primaryActive: '',

    // Secondary colors
    secondary: '',
    secondaryHover: '',
    secondaryActive: '',

    // D&D colors
    dndRed: '',
    dndBlack: '',

    // Background colors
    background: '',
    backgroundSecondary: '',
    backgroundTertiary: '',
    surface: '',
    surfaceHover: '',

    // Text colors
    text: '',
    textSecondary: '',
    textTertiary: '',
    textInverse: '',

    // Border colors
    border: '',
    borderHover: '',
    borderActive: '',

    // State colors
    success: '',
    warning: '',
    error: '',
    info: '',

    // Gray scale
    gray100: '',
    gray200: '',
    gray300: '',
    gray400: '',
    gray500: '',
    gray600: '',
    gray700: '',
    gray800: '',
    gray900: '',
  },

  space: {
    px: '',
    0: '',
    1: '',
    2: '',
    3: '',
    4: '',
    5: '',
    6: '',
    7: '',
    8: '',
    9: '',
    10: '',
    12: '',
    16: '',
    20: '',
    24: '',
    32: '',
    40: '',
    48: '',
    56: '',
    64: '',
  },

  fonts: {
    base: '',
    heading: '',
    mono: '',
  },

  fontSizes: {
    xs: '',
    sm: '',
    md: '',
    lg: '',
    xl: '',
    '2xl': '',
    '3xl': '',
    '4xl': '',
  },

  fontWeights: {
    normal: '',
    medium: '',
    semibold: '',
    bold: '',
  },

  lineHeights: {
    none: '',
    tight: '',
    normal: '',
    relaxed: '',
  },

  letterSpacing: {
    tight: '',
    normal: '',
    wide: '',
  },

  radii: {
    none: '',
    sm: '',
    md: '',
    lg: '',
    xl: '',
    full: '',
  },

  shadows: {
    none: '',
    sm: '',
    md: '',
    lg: '',
    xl: '',
    inner: '',
  },

  transitions: {
    fast: '',
    normal: '',
    slow: '',
  },

  zIndices: {
    base: '',
    dropdown: '',
    sticky: '',
    modal: '',
    popover: '',
    tooltip: '',
  },
})

// Create the default theme
export const theme = createTheme(themeContract, {
  colors: {
    // Primary colors
    primary: '#922610',
    primaryHover: '#A62B12',
    primaryActive: '#7A200D',

    // Secondary colors
    secondary: '#C9AD6A',
    secondaryHover: '#D4BC7E',
    secondaryActive: '#B89E5C',

    // D&D colors
    dndRed: '#922610',
    dndBlack: '#1A1A1A',

    // Background colors
    background: '#171717',
    backgroundSecondary: '#1F1F1F',
    backgroundTertiary: '#262626',
    surface: '#2A2A2A',
    surfaceHover: '#323232',

    // Text colors
    text: '#F5F5F5',
    textSecondary: '#A3A3A3',
    textTertiary: '#737373',
    textInverse: '#171717',

    // Border colors
    border: '#404040',
    borderHover: '#525252',
    borderActive: '#737373',

    // State colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',

    // Gray scale
    gray100: '#F5F5F5',
    gray200: '#E5E5E5',
    gray300: '#D4D4D4',
    gray400: '#A3A3A3',
    gray500: '#737373',
    gray600: '#525252',
    gray700: '#404040',
    gray800: '#262626',
    gray900: '#171717',
  },

  space: {
    px: '1px',
    0: '0',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    7: '1.75rem',
    8: '2rem',
    9: '2.25rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    32: '8rem',
    40: '10rem',
    48: '12rem',
    56: '14rem',
    64: '16rem',
  },

  fonts: {
    base: '"Scala Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    heading: '"Scala Sans", Georgia, serif',
    mono: 'Menlo, Monaco, "Courier New", monospace',
  },

  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },

  fontWeights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  lineHeights: {
    none: '1',
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },

  letterSpacing: {
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
  },

  radii: {
    none: '0',
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px',
  },

  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.3)',
  },

  transitions: {
    fast: '150ms ease-in-out',
    normal: '250ms ease-in-out',
    slow: '350ms ease-in-out',
  },

  zIndices: {
    base: '0',
    dropdown: '1000',
    sticky: '1100',
    modal: '9999',
    popover: '10000',
    tooltip: '10001',
  },
})

// Export vars for use in recipes and styles
export const vars = themeContract