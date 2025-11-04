import { forwardRef } from 'react'
import { Text, type TextProps } from './Text'

// Paragraph component
export type ParagraphProps = Omit<TextProps, 'as'>

export const Paragraph = forwardRef<HTMLParagraphElement, ParagraphProps>(
  ({ color = 'text', lineHeight = 'relaxed', ...props }, ref) => (
    <Text
      ref={ref}
      as="p"
      color={color}
      lineHeight={lineHeight}
      {...props}
    />
  )
)

Paragraph.displayName = 'Paragraph'
