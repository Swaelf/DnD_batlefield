import { forwardRef } from 'react'
import { Text, type TextProps } from './Text'

// Label component for form labels
export type LabelProps = Omit<TextProps, 'variant' | 'as'> & {
  htmlFor?: string
  required?: boolean
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ required, children, size = 'sm', weight = 'medium', color = 'textSecondary', htmlFor, ...props }, ref) => (
    <Text
      ref={ref}
      as="label"
      variant="label"
      size={size}
      weight={weight}
      color={color}
      htmlFor={htmlFor}
      {...props}
    >
      {children}
      {required && (
        <Text as="span" color="error">
          {' *'}
        </Text>
      )}
    </Text>
  )
)

Label.displayName = 'Label'
