import { styled } from '@/styles/theme.config'
import type { ComponentProps } from '@/types'

export const Box = styled('div', {
  // Default styles - no display set by default
  variants: {
    display: {
      block: { display: 'block' },
      inline: { display: 'inline' },
      inlineBlock: { display: 'inline-block' },
      flex: { display: 'flex' },
      inlineFlex: { display: 'inline-flex' },
      grid: { display: 'grid' },
      none: { display: 'none' },
    },

    position: {
      static: { position: 'static' },
      relative: { position: 'relative' },
      absolute: { position: 'absolute' },
      fixed: { position: 'fixed' },
      sticky: { position: 'sticky' },
    },

    overflow: {
      visible: { overflow: 'visible' },
      hidden: { overflow: 'hidden' },
      scroll: { overflow: 'scroll' },
      auto: { overflow: 'auto' },
    },

    flexDirection: {
      row: { flexDirection: 'row' },
      column: { flexDirection: 'column' },
      rowReverse: { flexDirection: 'row-reverse' },
      columnReverse: { flexDirection: 'column-reverse' },
    },

    alignItems: {
      start: { alignItems: 'flex-start' },
      center: { alignItems: 'center' },
      end: { alignItems: 'flex-end' },
      stretch: { alignItems: 'stretch' },
      baseline: { alignItems: 'baseline' },
    },

    justifyContent: {
      start: { justifyContent: 'flex-start' },
      center: { justifyContent: 'center' },
      end: { justifyContent: 'flex-end' },
      between: { justifyContent: 'space-between' },
      around: { justifyContent: 'space-around' },
      evenly: { justifyContent: 'space-evenly' },
    },

    gap: {
      1: { gap: '$1' },
      2: { gap: '$2' },
      3: { gap: '$3' },
      4: { gap: '$4' },
      5: { gap: '$5' },
      6: { gap: '$6' },
      8: { gap: '$8' },
      10: { gap: '$10' },
      12: { gap: '$12' },
      16: { gap: '$16' },
      20: { gap: '$20' },
    },

    width: {
      auto: { width: 'auto' },
      full: { width: '100%' },
      screen: { width: '100vw' },
      fit: { width: 'fit-content' },
      min: { width: 'min-content' },
      max: { width: 'max-content' },
    },

    height: {
      auto: { height: 'auto' },
      full: { height: '100%' },
      screen: { height: '100vh' },
      fit: { height: 'fit-content' },
      min: { height: 'min-content' },
      max: { height: 'max-content' },
    },

    borderRadius: {
      none: { borderRadius: 0 },
      sm: { borderRadius: '$sm' },
      md: { borderRadius: '$md' },
      lg: { borderRadius: '$lg' },
      xl: { borderRadius: '$xl' },
      '2xl': { borderRadius: '$2xl' },
      round: { borderRadius: '$round' },
    },

    background: {
      transparent: { backgroundColor: '$transparent' },
      primary: { backgroundColor: '$primary' },
      secondary: { backgroundColor: '$secondary' },
      surface: { backgroundColor: '$surface' },
      gray100: { backgroundColor: '$gray100' },
      gray200: { backgroundColor: '$gray200' },
      gray300: { backgroundColor: '$gray300' },
      gray400: { backgroundColor: '$gray400' },
      gray500: { backgroundColor: '$gray500' },
      gray600: { backgroundColor: '$gray600' },
      gray700: { backgroundColor: '$gray700' },
      gray800: { backgroundColor: '$gray800' },
      gray900: { backgroundColor: '$gray900' },
    },

    shadow: {
      none: { boxShadow: 'none' },
      sm: { boxShadow: '$sm' },
      md: { boxShadow: '$md' },
      lg: { boxShadow: '$lg' },
      xl: { boxShadow: '$xl' },
      '2xl': { boxShadow: '$2xl' },
      dnd: { boxShadow: '$dnd' },
      gold: { boxShadow: '$gold' },
      panel: { boxShadow: '$panel' },
      tooltip: { boxShadow: '$tooltip' },
    },

    border: {
      none: { border: 'none' },
      1: { border: '1px solid $gray600' },
      2: { border: '2px solid $gray600' },
      primary: { border: '1px solid $primary' },
      secondary: { border: '1px solid $secondary' },
    },
  },

  compoundVariants: [
    {
      display: 'flex',
      flexDirection: 'column',
      css: {
        flexDirection: 'column',
      },
    },
  ],

  defaultVariants: {
    // No default display - let it be a normal block element
  },
})

export type BoxProps = ComponentProps<typeof Box>