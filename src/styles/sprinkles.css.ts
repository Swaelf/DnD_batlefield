import { defineProperties, createSprinkles } from '@vanilla-extract/sprinkles'
import { vars } from './theme.css'

// Responsive conditions
const responsiveProperties = defineProperties({
  conditions: {
    mobile: {},
    tablet: { '@media': 'screen and (min-width: 768px)' },
    desktop: { '@media': 'screen and (min-width: 1024px)' },
  },
  defaultCondition: 'mobile',
  properties: {
    // Display
    display: ['none', 'block', 'inline-block', 'flex', 'inline-flex', 'grid', 'inline-grid'],

    // Flexbox
    flexDirection: ['row', 'row-reverse', 'column', 'column-reverse'],
    flexWrap: ['nowrap', 'wrap', 'wrap-reverse'],
    justifyContent: ['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly'],
    alignItems: ['flex-start', 'flex-end', 'center', 'baseline', 'stretch'],
    alignSelf: ['auto', 'flex-start', 'flex-end', 'center', 'baseline', 'stretch'],
    flexGrow: [0, 1],
    flexShrink: [0, 1],

    // Grid
    gridTemplateColumns: {
      1: 'repeat(1, minmax(0, 1fr))',
      2: 'repeat(2, minmax(0, 1fr))',
      3: 'repeat(3, minmax(0, 1fr))',
      4: 'repeat(4, minmax(0, 1fr))',
      5: 'repeat(5, minmax(0, 1fr))',
      6: 'repeat(6, minmax(0, 1fr))',
    },
    gap: vars.space,

    // Spacing
    margin: vars.space,
    marginTop: vars.space,
    marginRight: vars.space,
    marginBottom: vars.space,
    marginLeft: vars.space,
    padding: vars.space,
    paddingTop: vars.space,
    paddingRight: vars.space,
    paddingBottom: vars.space,
    paddingLeft: vars.space,

    // Typography
    fontSize: vars.fontSizes,
    fontWeight: vars.fontWeights,
    lineHeight: vars.lineHeights,
    letterSpacing: vars.letterSpacing,
    textAlign: ['left', 'center', 'right', 'justify'],

    // Layout
    position: ['static', 'relative', 'absolute', 'fixed', 'sticky'],
    top: vars.space,
    right: vars.space,
    bottom: vars.space,
    left: vars.space,
    zIndex: vars.zIndices,

    // Sizing
    width: {
      auto: 'auto',
      full: '100%',
      fit: 'fit-content',
      min: 'min-content',
      max: 'max-content',
      ...vars.space,
    },
    height: {
      auto: 'auto',
      full: '100%',
      screen: '100vh',
      fit: 'fit-content',
      min: 'min-content',
      max: 'max-content',
      ...vars.space,
    },
    minWidth: vars.space,
    maxWidth: {
      none: 'none',
      xs: '20rem',
      sm: '24rem',
      md: '28rem',
      lg: '32rem',
      xl: '36rem',
      '2xl': '42rem',
      '3xl': '48rem',
      '4xl': '56rem',
      '5xl': '64rem',
      '6xl': '72rem',
      full: '100%',
    },
    minHeight: vars.space,
    maxHeight: {
      none: 'none',
      full: '100%',
      screen: '100vh',
      ...vars.space,
    },

    // Visual
    overflow: ['visible', 'hidden', 'scroll', 'auto'],
    overflowX: ['visible', 'hidden', 'scroll', 'auto'],
    overflowY: ['visible', 'hidden', 'scroll', 'auto'],
    opacity: {
      0: '0',
      25: '0.25',
      50: '0.5',
      75: '0.75',
      100: '1',
    },

    // Borders
    borderRadius: vars.radii,
    borderTopLeftRadius: vars.radii,
    borderTopRightRadius: vars.radii,
    borderBottomLeftRadius: vars.radii,
    borderBottomRightRadius: vars.radii,

    // Cursor
    cursor: ['auto', 'default', 'pointer', 'wait', 'move', 'not-allowed', 'grab', 'grabbing'],

    // User select
    userSelect: ['none', 'text', 'all', 'auto'],

    // Pointer events
    pointerEvents: ['none', 'auto'],
  },
  shorthands: {
    m: ['margin'],
    mt: ['marginTop'],
    mr: ['marginRight'],
    mb: ['marginBottom'],
    ml: ['marginLeft'],
    mx: ['marginLeft', 'marginRight'],
    my: ['marginTop', 'marginBottom'],
    p: ['padding'],
    pt: ['paddingTop'],
    pr: ['paddingRight'],
    pb: ['paddingBottom'],
    pl: ['paddingLeft'],
    px: ['paddingLeft', 'paddingRight'],
    py: ['paddingTop', 'paddingBottom'],
    w: ['width'],
    h: ['height'],
    size: ['width', 'height'],
    rounded: ['borderRadius'],
  },
})

// Color properties (not responsive)
const colorProperties = defineProperties({
  properties: {
    color: {
      primary: vars.colors.primary,
      secondary: vars.colors.secondary,
      text: vars.colors.text,
      textSecondary: vars.colors.textSecondary,
      textTertiary: vars.colors.textTertiary,
      textInverse: vars.colors.textInverse,
      success: vars.colors.success,
      warning: vars.colors.warning,
      error: vars.colors.error,
      info: vars.colors.info,
      dndRed: vars.colors.dndRed,
      ...Object.fromEntries(
        Object.entries(vars.colors).filter(([key]) => key.startsWith('gray'))
      ),
    },
    backgroundColor: {
      transparent: 'transparent',
      primary: vars.colors.primary,
      primaryHover: vars.colors.primaryHover,
      primaryActive: vars.colors.primaryActive,
      secondary: vars.colors.secondary,
      secondaryHover: vars.colors.secondaryHover,
      secondaryActive: vars.colors.secondaryActive,
      background: vars.colors.background,
      backgroundSecondary: vars.colors.backgroundSecondary,
      backgroundTertiary: vars.colors.backgroundTertiary,
      surface: vars.colors.surface,
      surfaceHover: vars.colors.surfaceHover,
      success: vars.colors.success,
      warning: vars.colors.warning,
      error: vars.colors.error,
      info: vars.colors.info,
      dndRed: vars.colors.dndRed,
      dndBlack: vars.colors.dndBlack,
      ...Object.fromEntries(
        Object.entries(vars.colors).filter(([key]) => key.startsWith('gray'))
      ),
    },
    borderColor: {
      transparent: 'transparent',
      border: vars.colors.border,
      borderHover: vars.colors.borderHover,
      borderActive: vars.colors.borderActive,
      primary: vars.colors.primary,
      secondary: vars.colors.secondary,
      success: vars.colors.success,
      warning: vars.colors.warning,
      error: vars.colors.error,
      info: vars.colors.info,
      ...Object.fromEntries(
        Object.entries(vars.colors).filter(([key]) => key.startsWith('gray'))
      ),
    },
    borderWidth: {
      0: '0',
      1: '1px',
      2: '2px',
      4: '4px',
    },
    borderStyle: ['solid', 'dashed', 'dotted', 'none'],
    boxShadow: vars.shadows,
    outline: {
      none: 'none',
      primary: `2px solid ${vars.colors.primary}`,
      secondary: `2px solid ${vars.colors.secondary}`,
      error: `2px solid ${vars.colors.error}`,
    },
  },
  shorthands: {
    bg: ['backgroundColor'],
    bgColor: ['backgroundColor'],
  },
})

// Create transition properties
const transitionProperties = defineProperties({
  properties: {
    transition: {
      none: 'none',
      all: `all ${vars.transitions.normal}`,
      colors: `background-color ${vars.transitions.fast}, border-color ${vars.transitions.fast}, color ${vars.transitions.fast}, fill ${vars.transitions.fast}, stroke ${vars.transitions.fast}`,
      opacity: `opacity ${vars.transitions.fast}`,
      shadow: `box-shadow ${vars.transitions.normal}`,
      transform: `transform ${vars.transitions.normal}`,
    },
    transform: {
      none: 'none',
      scale90: 'scale(0.9)',
      scale95: 'scale(0.95)',
      scale100: 'scale(1)',
      scale105: 'scale(1.05)',
      scale110: 'scale(1.1)',
      rotate45: 'rotate(45deg)',
      rotate90: 'rotate(90deg)',
      rotate180: 'rotate(180deg)',
      translateY2: 'translateY(-0.5rem)',
      translateY4: 'translateY(-1rem)',
    },
  },
})

// Export the sprinkles function
export const sprinkles = createSprinkles(
  responsiveProperties,
  colorProperties,
  transitionProperties
)

// Export type for sprinkles props
export type Sprinkles = Parameters<typeof sprinkles>[0]