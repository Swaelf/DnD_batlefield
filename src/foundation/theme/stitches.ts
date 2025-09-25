/**
 * Stitches configuration for the MapMaker theme system
 * This creates a type-safe CSS-in-JS system with our design tokens
 */

import { createStitches } from '@stitches/react'
import { colors, spacing, typography, radii, shadows, zIndex, durations, easings } from './tokens'

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
    colors,
    space: spacing,
    fontSizes: typography.fontSize,
    fonts: typography.fontFamily,
    fontWeights: typography.fontWeight,
    lineHeights: typography.lineHeight,
    radii,
    shadows,
    zIndices: zIndex,
    transitions: durations
  },

  media: {
    bp1: '(min-width: 640px)',  // sm
    bp2: '(min-width: 768px)',  // md
    bp3: '(min-width: 1024px)', // lg
    bp4: '(min-width: 1280px)', // xl
    bp5: '(min-width: 1536px)'  // 2xl
  },

  utils: {
    // Margin utilities
    m: (value: string | number) => ({
      margin: value
    }),
    mt: (value: string | number) => ({
      marginTop: value
    }),
    mr: (value: string | number) => ({
      marginRight: value
    }),
    mb: (value: string | number) => ({
      marginBottom: value
    }),
    ml: (value: string | number) => ({
      marginLeft: value
    }),
    mx: (value: string | number) => ({
      marginLeft: value,
      marginRight: value
    }),
    my: (value: string | number) => ({
      marginTop: value,
      marginBottom: value
    }),

    // Padding utilities
    p: (value: string | number) => ({
      padding: value
    }),
    pt: (value: string | number) => ({
      paddingTop: value
    }),
    pr: (value: string | number) => ({
      paddingRight: value
    }),
    pb: (value: string | number) => ({
      paddingBottom: value
    }),
    pl: (value: string | number) => ({
      paddingLeft: value
    }),
    px: (value: string | number) => ({
      paddingLeft: value,
      paddingRight: value
    }),
    py: (value: string | number) => ({
      paddingTop: value,
      paddingBottom: value
    }),

    // Size utilities
    size: (value: string | number) => ({
      width: value,
      height: value
    }),

    // Flexbox utilities
    d: (value: string) => ({ display: value }),
    fd: (value: string) => ({ flexDirection: value }),
    fw: (value: string) => ({ flexWrap: value }),
    ai: (value: string) => ({ alignItems: value }),
    ac: (value: string) => ({ alignContent: value }),
    jc: (value: string) => ({ justifyContent: value }),
    as: (value: string) => ({ alignSelf: value }),
    fg: (value: number) => ({ flexGrow: value }),
    fs: (value: number) => ({ flexShrink: value }),
    fb: (value: string) => ({ flexBasis: value }),

    // Grid utilities
    gap: (value: string | number) => ({ gap: value }),
    gridTemplateColumns: (value: string) => ({ gridTemplateColumns: value }),
    gridColumn: (value: string) => ({ gridColumn: value }),
    gridRow: (value: string) => ({ gridRow: value }),

    // Position utilities
    position: (value: string) => ({ position: value }),
    top: (value: string | number) => ({ top: value }),
    right: (value: string | number) => ({ right: value }),
    bottom: (value: string | number) => ({ bottom: value }),
    left: (value: string | number) => ({ left: value }),

    // Background utilities
    bg: (value: string) => ({ backgroundColor: value }),
    bgImage: (value: string) => ({ backgroundImage: value }),
    bgSize: (value: string) => ({ backgroundSize: value }),
    bgPosition: (value: string) => ({ backgroundPosition: value }),
    bgRepeat: (value: string) => ({ backgroundRepeat: value }),

    // Border utilities
    border: (value: string) => ({ border: value }),
    borderTop: (value: string) => ({ borderTop: value }),
    borderRight: (value: string) => ({ borderRight: value }),
    borderBottom: (value: string) => ({ borderBottom: value }),
    borderLeft: (value: string) => ({ borderLeft: value }),
    borderColor: (value: string) => ({ borderColor: value }),
    borderRadius: (value: string | number) => ({ borderRadius: value }),

    // Typography utilities
    ta: (value: string) => ({ textAlign: value }),
    tt: (value: string) => ({ textTransform: value }),
    to: (value: string) => ({ textOverflow: value }),
    td: (value: string) => ({ textDecoration: value }),

    // Appearance utilities
    appearance: (value: string) => ({ appearance: value }),
    userSelect: (value: string) => ({ userSelect: value }),
    pointerEvents: (value: string) => ({ pointerEvents: value }),
    cursor: (value: string) => ({ cursor: value }),

    // Transform utilities
    transform: (value: string) => ({ transform: value }),
    transformOrigin: (value: string) => ({ transformOrigin: value }),

    // Transition utilities
    transition: (value: string) => ({ transition: value }),
    transitionProperty: (value: string) => ({ transitionProperty: value }),
    transitionDuration: (value: string) => ({ transitionDuration: value }),
    transitionTimingFunction: (value: string) => ({ transitionTimingFunction: value })
  }
})

// Global styles
export const globalStyles = globalCss({
  '*': {
    boxSizing: 'border-box'
  },

  'html, body': {
    margin: 0,
    padding: 0,
    fontFamily: '$sans',
    backgroundColor: '$background',
    color: '$textPrimary',
    overflow: 'hidden'
  },

  'body': {
    fontSize: '$base',
    lineHeight: '$normal'
  },

  'button': {
    fontFamily: 'inherit',
    fontSize: 'inherit',
    lineHeight: 'inherit',
    cursor: 'pointer'
  },

  'input, textarea, select': {
    fontFamily: 'inherit',
    fontSize: 'inherit',
    lineHeight: 'inherit'
  },

  // Focus styles
  ':focus': {
    outline: '2px solid $accent',
    outlineOffset: '2px'
  },

  ':focus:not(:focus-visible)': {
    outline: 'none'
  }
})