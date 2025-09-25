/**
 * Text - Styled text component with typography variants
 * Provides consistent text styling across the application
 */

import type { ComponentProps, ReactNode } from 'react'
import { styled } from '@/foundation/theme'
import { textVariants } from '@/foundation/theme/variants'

export type TextProps = {
  children: ReactNode
  as?: 'span' | 'p' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
} & ComponentProps<typeof StyledText>

const StyledText = styled('span', {
  // Base styles
  fontFamily: '$sans',
  lineHeight: '$normal',
  color: '$textPrimary',

  // Apply text variants
  variants: textVariants,

  defaultVariants: {
    variant: 'primary',
    size: 'base',
    weight: 'normal'
  }
})

export const Text = ({ children, as = 'span', ...props }: TextProps) => {
  return (
    <StyledText as={as} {...props}>
      {children}
    </StyledText>
  )
}