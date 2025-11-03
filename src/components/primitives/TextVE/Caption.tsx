import { forwardRef } from 'react'
import { Text, type TextProps } from './Text'

// Caption component for secondary text
export type CaptionProps = Omit<TextProps, 'variant'>

export const Caption = forwardRef<HTMLElement, CaptionProps>(
  ({ size = 'sm', color = 'textTertiary', ...props }, ref) => (
    <Text
      ref={ref}
      variant="caption"
      size={size}
      color={color}
      {...props}
    />
  )
)

Caption.displayName = 'Caption'
