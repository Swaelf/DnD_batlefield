import { forwardRef } from 'react'
import { Text, type TextProps } from './Text'

// Heading elements
type HeadingElements = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

export type HeadingProps = Omit<TextProps, 'variant' | 'as'> & {
  level?: 1 | 2 | 3 | 4 | 5 | 6
  as?: HeadingElements
}

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ level = 1, as, size, weight = 'bold', color = 'text', ...props }, ref) => {
    const Component = as || (`h${level}` as HeadingElements)

    // Map heading levels to sizes if size not provided
    const headingSize = size || ({
      1: '3xl',
      2: '2xl',
      3: 'xl',
      4: 'lg',
      5: 'md',
      6: 'md',
    }[level] as TextProps['size'])

    return (
      <Text
        ref={ref}
        as={Component}
        variant="heading"
        size={headingSize}
        weight={weight}
        color={color}
        {...props}
      />
    )
  }
)

Heading.displayName = 'Heading'
