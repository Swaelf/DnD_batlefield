import { forwardRef } from 'react'
import { Text, type TextProps } from './Text'

// Code component for inline code
export type CodeProps = Omit<TextProps, 'variant' | 'font'>

export const Code = forwardRef<HTMLElement, CodeProps>(
  ({ as = 'span', ...props }, ref) => (
    <Text
      ref={ref}
      as={as}
      variant="code"
      font="mono"
      {...props}
    />
  )
)

Code.displayName = 'Code'
