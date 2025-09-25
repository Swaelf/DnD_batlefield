/**
 * Panel - Container component for grouping related content
 * Provides consistent styling for cards, sections, and content areas
 */

import type { ReactNode } from 'react'
import { styled } from '@/foundation/theme'
import { panelVariants } from '@/foundation/theme/variants'
import { Box } from '../../atoms/Box'

export type PanelProps = {
  children: ReactNode
  title?: string
  variant?: keyof typeof panelVariants.variant
  padding?: keyof typeof panelVariants.padding
} & React.ComponentProps<typeof StyledPanel>

const StyledPanel = styled(Box, {
  variants: panelVariants,

  defaultVariants: {
    variant: 'default',
    padding: 'md'
  }
})

const PanelHeader = styled(Box, {
  borderBottom: '1px solid $border',
  marginBottom: '$md',
  paddingBottom: '$sm'
})

const PanelTitle = styled('h3', {
  fontSize: '$lg',
  fontWeight: '$semibold',
  color: '$textPrimary',
  margin: 0
})

export const Panel = ({ children, title, ...props }: PanelProps) => {
  return (
    <StyledPanel {...props}>
      {title && (
        <PanelHeader>
          <PanelTitle>{title}</PanelTitle>
        </PanelHeader>
      )}
      {children}
    </StyledPanel>
  )
}