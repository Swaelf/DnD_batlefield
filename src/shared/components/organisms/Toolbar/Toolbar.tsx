/**
 * Toolbar - Horizontal container for tool buttons and controls
 * Provides consistent spacing and layout for action items
 */

import type { ReactNode } from 'react'
import { styled } from '@/foundation/theme'
import { Box } from '../../atoms/Box'

export type ToolbarProps = {
  children: ReactNode
  orientation?: 'horizontal' | 'vertical'
  spacing?: 'sm' | 'md' | 'lg'
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
}

const StyledToolbar = styled(Box, {
  display: 'flex',
  alignItems: 'center',
  backgroundColor: '$surface',
  border: '1px solid $border',
  borderRadius: '$md',
  padding: '$sm',

  variants: {
    orientation: {
      horizontal: {
        flexDirection: 'row'
      },
      vertical: {
        flexDirection: 'column'
      }
    },

    spacing: {
      sm: {
        gap: '$xs'
      },
      md: {
        gap: '$sm'
      },
      lg: {
        gap: '$md'
      }
    },

    align: {
      start: { alignItems: 'flex-start' },
      center: { alignItems: 'center' },
      end: { alignItems: 'flex-end' },
      stretch: { alignItems: 'stretch' }
    },

    justify: {
      start: { justifyContent: 'flex-start' },
      center: { justifyContent: 'center' },
      end: { justifyContent: 'flex-end' },
      between: { justifyContent: 'space-between' },
      around: { justifyContent: 'space-around' },
      evenly: { justifyContent: 'space-evenly' }
    }
  },

  defaultVariants: {
    orientation: 'horizontal',
    spacing: 'md',
    align: 'center',
    justify: 'start'
  }
})

export const Toolbar = ({
  children,
  orientation = 'horizontal',
  spacing = 'md',
  align = 'center',
  justify = 'start'
}: ToolbarProps) => {
  return (
    <StyledToolbar
      orientation={orientation}
      spacing={spacing}
      align={align}
      justify={justify}
      role="toolbar"
    >
      {children}
    </StyledToolbar>
  )
}