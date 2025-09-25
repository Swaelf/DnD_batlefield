/**
 * Design tokens for the MapMaker D&D theme
 * These tokens define the visual identity of the application
 */

import type { Color } from '../types'

// Color palette
export const colors = {
  // Primary D&D colors
  dndRed: '#922610' as Color,
  dndGold: '#C9AD6A' as Color,

  // Background colors
  dndBlack: '#1A1A1A' as Color,
  background: '#171717' as Color,
  surface: '#1F1F1F' as Color,

  // Gray scale
  gray50: '#FAFAFA' as Color,
  gray100: '#F5F5F5' as Color,
  gray200: '#EEEEEE' as Color,
  gray300: '#E0E0E0' as Color,
  gray400: '#BDBDBD' as Color,
  gray500: '#9E9E9E' as Color,
  gray600: '#757575' as Color,
  gray700: '#616161' as Color,
  gray800: '#424242' as Color,
  gray900: '#171717' as Color,

  // Semantic colors
  success: '#4CAF50' as Color,
  warning: '#FF9800' as Color,
  error: '#F44336' as Color,
  info: '#2196F3' as Color,

  // Accent colors
  accent: '#9013FE' as Color,
  highlight: '#FFD700' as Color,

  // Text colors
  textPrimary: '#FFFFFF' as Color,
  textSecondary: '#B3B3B3' as Color,
  textTertiary: '#808080' as Color,
  textDisabled: '#4A4A4A' as Color,

  // Border colors
  border: '#333333' as Color,
  borderLight: '#444444' as Color,
  borderAccent: '#555555' as Color
} as const

// Spacing scale (rem units)
export const spacing = {
  xs: '0.25rem', // 4px
  sm: '0.5rem',  // 8px
  md: '1rem',    // 16px
  lg: '1.5rem',  // 24px
  xl: '2rem',    // 32px
  xxl: '3rem'    // 48px
} as const

// Typography scale
export const typography = {
  fontFamily: {
    sans: ['Scala Sans', 'Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'Monaco', 'Consolas', 'monospace']
  },
  fontSize: {
    xs: '0.75rem',   // 12px
    sm: '0.875rem',  // 14px
    base: '1rem',    // 16px
    lg: '1.125rem',  // 18px
    xl: '1.25rem',   // 20px
    xxl: '1.5rem',   // 24px
    xxxl: '2rem'     // 32px
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  },
  lineHeight: {
    none: 1,
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75
  }
} as const

// Border radius scale
export const radii = {
  none: '0',
  sm: '0.25rem',  // 4px
  md: '0.5rem',   // 8px
  lg: '0.75rem',  // 12px
  full: '9999px'
} as const

// Shadow scale
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
} as const

// Z-index scale
export const zIndex = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  fixed: 300,
  modalBackdrop: 400,
  modal: 500,
  popover: 600,
  tooltip: 700,
  notification: 800,
  debug: 9999
} as const

// Animation durations
export const durations = {
  fast: '150ms',
  normal: '250ms',
  slow: '350ms'
} as const

// Animation easings
export const easings = {
  linear: 'linear',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
} as const