import { recipe, type RecipeVariants } from '@vanilla-extract/recipes'
import { vars } from '../theme.css'

export const text = recipe({
  base: {
    margin: 0,
    padding: 0,
    fontFamily: vars.fonts.base,
  },

  variants: {
    as: {
      span: { display: 'inline' },
      div: { display: 'block' },
      p: { display: 'block' },
      label: { display: 'inline-block' },
      h1: { display: 'block' },
      h2: { display: 'block' },
      h3: { display: 'block' },
      h4: { display: 'block' },
      h5: { display: 'block' },
      h6: { display: 'block' },
    },

    size: {
      xs: {
        fontSize: vars.fontSizes.xs,
        lineHeight: vars.lineHeights.tight,
      },
      sm: {
        fontSize: vars.fontSizes.sm,
        lineHeight: vars.lineHeights.tight,
      },
      md: {
        fontSize: vars.fontSizes.md,
        lineHeight: vars.lineHeights.normal,
      },
      lg: {
        fontSize: vars.fontSizes.lg,
        lineHeight: vars.lineHeights.normal,
      },
      xl: {
        fontSize: vars.fontSizes.xl,
        lineHeight: vars.lineHeights.tight,
      },
      '2xl': {
        fontSize: vars.fontSizes['2xl'],
        lineHeight: vars.lineHeights.tight,
      },
      '3xl': {
        fontSize: vars.fontSizes['3xl'],
        lineHeight: vars.lineHeights.tight,
      },
      '4xl': {
        fontSize: vars.fontSizes['4xl'],
        lineHeight: vars.lineHeights.tight,
      },
    },

    weight: {
      normal: { fontWeight: vars.fontWeights.normal },
      medium: { fontWeight: vars.fontWeights.medium },
      semibold: { fontWeight: vars.fontWeights.semibold },
      bold: { fontWeight: vars.fontWeights.bold },
    },

    color: {
      inherit: { color: 'inherit' },
      text: { color: vars.colors.text },
      textSecondary: { color: vars.colors.textSecondary },
      textTertiary: { color: vars.colors.textTertiary },
      textInverse: { color: vars.colors.textInverse },
      primary: { color: vars.colors.primary },
      secondary: { color: vars.colors.secondary },
      success: { color: vars.colors.success },
      warning: { color: vars.colors.warning },
      error: { color: vars.colors.error },
      info: { color: vars.colors.info },
      dndRed: { color: vars.colors.dndRed },
      gray100: { color: vars.colors.gray100 },
      gray200: { color: vars.colors.gray200 },
      gray300: { color: vars.colors.gray300 },
      gray400: { color: vars.colors.gray400 },
      gray500: { color: vars.colors.gray500 },
      gray600: { color: vars.colors.gray600 },
      gray700: { color: vars.colors.gray700 },
      gray800: { color: vars.colors.gray800 },
      gray900: { color: vars.colors.gray900 },
    },

    align: {
      left: { textAlign: 'left' },
      center: { textAlign: 'center' },
      right: { textAlign: 'right' },
      justify: { textAlign: 'justify' },
    },

    transform: {
      none: { textTransform: 'none' },
      uppercase: { textTransform: 'uppercase' },
      lowercase: { textTransform: 'lowercase' },
      capitalize: { textTransform: 'capitalize' },
    },

    decoration: {
      none: { textDecoration: 'none' },
      underline: { textDecoration: 'underline' },
      overline: { textDecoration: 'overline' },
      lineThrough: { textDecoration: 'line-through' },
    },

    font: {
      base: { fontFamily: vars.fonts.base },
      heading: { fontFamily: vars.fonts.heading },
      mono: { fontFamily: vars.fonts.mono },
    },

    lineHeight: {
      none: { lineHeight: vars.lineHeights.none },
      tight: { lineHeight: vars.lineHeights.tight },
      normal: { lineHeight: vars.lineHeights.normal },
      relaxed: { lineHeight: vars.lineHeights.relaxed },
    },

    truncate: {
      true: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
    },

    variant: {
      body: {},
      heading: {
        fontFamily: vars.fonts.heading,
        fontWeight: vars.fontWeights.bold,
        color: vars.colors.text,
      },
      label: {
        fontWeight: vars.fontWeights.medium,
        color: vars.colors.textSecondary,
        userSelect: 'none',
      },
      caption: {
        fontSize: vars.fontSizes.sm,
        color: vars.colors.textTertiary,
      },
      code: {
        fontFamily: vars.fonts.mono,
        fontSize: vars.fontSizes.sm,
        backgroundColor: vars.colors.backgroundTertiary,
        color: vars.colors.textSecondary,
        padding: `${vars.space[1]} ${vars.space[2]}`,
        borderRadius: vars.radii.sm,
        border: `1px solid ${vars.colors.border}`,
      },
    },

    gradient: {
      dnd: {
        background: `linear-gradient(45deg, ${vars.colors.primary}, ${vars.colors.secondary})`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      },
      gold: {
        background: `linear-gradient(45deg, ${vars.colors.secondary}, #FFD700)`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      },
    },
  },

  compoundVariants: [
    // Heading size mappings
    {
      variants: { variant: 'heading', size: '4xl' },
      style: { fontSize: vars.fontSizes['4xl'] },
    },
    {
      variants: { variant: 'heading', size: '3xl' },
      style: { fontSize: vars.fontSizes['3xl'] },
    },
    {
      variants: { variant: 'heading', size: '2xl' },
      style: { fontSize: vars.fontSizes['2xl'] },
    },
    {
      variants: { variant: 'heading', size: 'xl' },
      style: { fontSize: vars.fontSizes.xl },
    },
    {
      variants: { variant: 'heading', size: 'lg' },
      style: { fontSize: vars.fontSizes.lg },
    },
    {
      variants: { variant: 'heading', size: 'md' },
      style: { fontSize: vars.fontSizes.md },
    },
  ],

  defaultVariants: {
    as: 'span',
    size: 'md',
    weight: 'normal',
    color: 'inherit',
    variant: 'body',
  },
})

export type TextVariants = RecipeVariants<typeof text>