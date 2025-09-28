import React, { forwardRef } from 'react'
import { clsx } from 'clsx'
import { text } from '@/styles/recipes/text.css'

// Valid HTML text elements
type TextElements = 'span' | 'div' | 'p' | 'label' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

// Pure Text component using only Vanilla Extract recipes
export type TextProps = {
  // Recipe variants
  as?: TextElements
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'
  color?: 'inherit' | 'primary' | 'secondary' | 'dndRed' | 'text' | 'textSecondary' | 'textTertiary' | 'textInverse' | 'success' | 'warning' | 'error' | 'info' | 'gray100' | 'gray200' | 'gray300' | 'gray400' | 'gray500' | 'gray600' | 'gray700' | 'gray800' | 'gray900'
  align?: 'left' | 'center' | 'right' | 'justify'
  transform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize'
  decoration?: 'none' | 'underline' | 'overline' | 'lineThrough'
  font?: 'base' | 'heading' | 'mono'
  lineHeight?: 'none' | 'tight' | 'normal' | 'relaxed'
  truncate?: boolean
  variant?: 'body' | 'heading' | 'label' | 'caption' | 'code'
  gradient?: 'dnd' | 'gold'
  children?: React.ReactNode
  className?: string
  htmlFor?: string // For label element

  // Event handlers
  onClick?: (event: React.MouseEvent<HTMLElement>) => void
  onMouseEnter?: (event: React.MouseEvent<HTMLElement>) => void
  onMouseLeave?: (event: React.MouseEvent<HTMLElement>) => void
  onFocus?: (event: React.FocusEvent<HTMLElement>) => void
  onBlur?: (event: React.FocusEvent<HTMLElement>) => void

  // Common HTML attributes
  id?: string
  role?: string
  title?: string
  style?: React.CSSProperties
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  'data-testid'?: string
  'data-test-id'?: string
}

export const Text = forwardRef<HTMLElement, TextProps>(
  (
    {
      as = 'span',
      size,
      weight,
      color,
      align,
      transform,
      decoration,
      font,
      lineHeight,
      truncate,
      variant,
      gradient,
      children,
      className,
      htmlFor,
      onClick,
      onMouseEnter,
      onMouseLeave,
      onFocus,
      onBlur,
      ...otherProps
    },
    ref
  ) => {
    const Component = as

    // Recipe props
    const recipeProps = {
      size,
      weight,
      color,
      align,
      transform,
      decoration,
      font,
      lineHeight,
      truncate,
      variant,
      gradient,
    }

    const htmlProps: Record<string, unknown> = {
      ref,
      className: clsx(text(recipeProps), className),
      onClick,
      onMouseEnter,
      onMouseLeave,
      onFocus,
      onBlur,
      ...otherProps,
    }

    // Add htmlFor only if it's a label
    if (as === 'label' && htmlFor) {
      htmlProps.htmlFor = htmlFor
    }

    return React.createElement(
      Component,
      htmlProps,
      children
    )
  }
)

Text.displayName = 'Text'

// Semantic text components built on top of Text
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