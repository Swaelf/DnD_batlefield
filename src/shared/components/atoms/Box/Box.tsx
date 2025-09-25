/**
 * Box - The most fundamental layout primitive
 * A flexible container component that serves as the base for all other components
 */

import type { ComponentProps } from 'react'
import { styled } from '@/foundation/theme'

export type BoxProps = ComponentProps<typeof StyledBox>

const StyledBox = styled('div', {
  // Base styles
  boxSizing: 'border-box',

  variants: {
    // Display variants
    display: {
      block: { display: 'block' },
      inline: { display: 'inline' },
      'inline-block': { display: 'inline-block' },
      flex: { display: 'flex' },
      'inline-flex': { display: 'inline-flex' },
      grid: { display: 'grid' },
      'inline-grid': { display: 'inline-grid' },
      none: { display: 'none' }
    },

    // Flex direction
    direction: {
      row: { flexDirection: 'row' },
      column: { flexDirection: 'column' },
      'row-reverse': { flexDirection: 'row-reverse' },
      'column-reverse': { flexDirection: 'column-reverse' }
    },

    // Align items
    align: {
      start: { alignItems: 'flex-start' },
      center: { alignItems: 'center' },
      end: { alignItems: 'flex-end' },
      stretch: { alignItems: 'stretch' },
      baseline: { alignItems: 'baseline' }
    },

    // Justify content
    justify: {
      start: { justifyContent: 'flex-start' },
      center: { justifyContent: 'center' },
      end: { justifyContent: 'flex-end' },
      between: { justifyContent: 'space-between' },
      around: { justifyContent: 'space-around' },
      evenly: { justifyContent: 'space-evenly' }
    },

    // Flex wrap
    wrap: {
      nowrap: { flexWrap: 'nowrap' },
      wrap: { flexWrap: 'wrap' },
      'wrap-reverse': { flexWrap: 'wrap-reverse' }
    },

    // Gap
    gap: {
      none: { gap: 0 },
      xs: { gap: '$xs' },
      sm: { gap: '$sm' },
      md: { gap: '$md' },
      lg: { gap: '$lg' },
      xl: { gap: '$xl' },
      xxl: { gap: '$xxl' }
    },

    // Padding
    p: {
      none: { padding: 0 },
      xs: { padding: '$xs' },
      sm: { padding: '$sm' },
      md: { padding: '$md' },
      lg: { padding: '$lg' },
      xl: { padding: '$xl' },
      xxl: { padding: '$xxl' }
    },

    // Margin
    m: {
      none: { margin: 0 },
      xs: { margin: '$xs' },
      sm: { margin: '$sm' },
      md: { margin: '$md' },
      lg: { margin: '$lg' },
      xl: { margin: '$xl' },
      xxl: { margin: '$xxl' },
      auto: { margin: 'auto' }
    }
  }
})

export const Box = (props: BoxProps) => <StyledBox {...props} />