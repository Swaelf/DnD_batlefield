import { styled } from '@/styles/theme.config'
import type { ComponentProps } from '@/types'

export const Text = styled('span', {
  // Default styles
  display: 'inline',
  margin: 0,
  padding: 0,
  color: 'inherit',
  fontFamily: 'inherit',

  variants: {
    size: {
      xs: { fontSize: '$xs', lineHeight: '$tight' },
      sm: { fontSize: '$sm', lineHeight: '$tight' },
      base: { fontSize: '$base', lineHeight: '$normal' },
      md: { fontSize: '$md', lineHeight: '$normal' },
      lg: { fontSize: '$lg', lineHeight: '$normal' },
      xl: { fontSize: '$xl', lineHeight: '$snug' },
      '2xl': { fontSize: '$2xl', lineHeight: '$snug' },
      '3xl': { fontSize: '$3xl', lineHeight: '$snug' },
    },

    weight: {
      light: { fontWeight: '$light' },
      normal: { fontWeight: '$normal' },
      medium: { fontWeight: '$medium' },
      semibold: { fontWeight: '$semibold' },
      bold: { fontWeight: '$bold' },
    },

    color: {
      inherit: { color: 'inherit' },
      primary: { color: '$primary' },
      secondary: { color: '$secondary' },
      white: { color: '$white' },
      black: { color: '$black' },
      gray100: { color: '$gray100' },
      gray200: { color: '$gray200' },
      gray300: { color: '$gray300' },
      gray400: { color: '$gray400' },
      gray500: { color: '$gray500' },
      gray600: { color: '$gray600' },
      gray700: { color: '$gray700' },
      gray800: { color: '$gray800' },
      gray900: { color: '$gray900' },
      success: { color: '$success' },
      warning: { color: '$warning' },
      error: { color: '$error' },
      info: { color: '$info' },
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
      dnd: { fontFamily: '$dnd' },
      mono: { fontFamily: '$mono' },
      system: { fontFamily: '$system' },
    },

    lineHeight: {
      none: { lineHeight: '$none' },
      tight: { lineHeight: '$tight' },
      snug: { lineHeight: '$snug' },
      normal: { lineHeight: '$normal' },
      relaxed: { lineHeight: '$relaxed' },
      loose: { lineHeight: '$loose' },
    },

    truncate: {
      true: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
    },

    gradient: {
      dnd: {
        background: 'linear-gradient(45deg, $colors$primary, $colors$secondary)',
        '-webkit-background-clip': 'text',
        '-webkit-text-fill-color': 'transparent',
        backgroundClip: 'text',
      },
      gold: {
        background: 'linear-gradient(45deg, $colors$secondary, #FFD700)',
        '-webkit-background-clip': 'text',
        '-webkit-text-fill-color': 'transparent',
        backgroundClip: 'text',
      },
    },
  },

  defaultVariants: {
    size: 'base',
    weight: 'normal',
    color: 'inherit',
  },
})

// Semantic text variants
export const Heading = styled(Text, {
  fontFamily: '$dnd',
  fontWeight: '$semibold',
  color: '$gray100',

  variants: {
    level: {
      1: { fontSize: '$3xl', lineHeight: '$snug' },
      2: { fontSize: '$2xl', lineHeight: '$snug' },
      3: { fontSize: '$xl', lineHeight: '$snug' },
      4: { fontSize: '$lg', lineHeight: '$normal' },
      5: { fontSize: '$md', lineHeight: '$normal' },
      6: { fontSize: '$base', lineHeight: '$normal' },
    },
  },

  defaultVariants: {
    level: 1,
  },
})

export const Label = styled(Text, {
  fontSize: '$sm',
  fontWeight: '$medium',
  color: '$gray300',
  userSelect: 'none',
})

export const Caption = styled(Text, {
  fontSize: '$xs',
  color: '$gray500',
})

export const Code = styled(Text, {
  fontFamily: '$mono',
  fontSize: '$sm',
  backgroundColor: '$gray800',
  color: '$gray200',
  padding: '2px 4px',
  borderRadius: '$sm',
  border: '1px solid $gray700',
})

export type TextProps = ComponentProps<typeof Text>
export type HeadingProps = ComponentProps<typeof Heading>
export type LabelProps = ComponentProps<typeof Label>
export type CaptionProps = ComponentProps<typeof Caption>
export type CodeProps = ComponentProps<typeof Code>