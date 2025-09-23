import React, { forwardRef } from 'react'
import { clsx } from 'clsx'
import { text } from '@/styles/recipes/text.css'

// Define the full interface with all text properties
export interface TextProps {
  children?: React.ReactNode
  className?: string
  id?: string
  role?: string
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  title?: string
  onClick?: (event: React.MouseEvent) => void
  onMouseEnter?: (event: React.MouseEvent) => void
  onMouseLeave?: (event: React.MouseEvent) => void
  // Additional props for compatibility
  css?: React.CSSProperties | Record<string, any>
  style?: React.CSSProperties
  'data-testid'?: string
  'data-test-id'?: string
  // TextVariants should include these, but making them explicit for now
  as?: 'span' | 'div' | 'p' | 'label' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
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
}

export const Text = forwardRef<HTMLElement, TextProps>(
  ({ children, className, as = 'span', size, weight, color, align, transform, decoration, font, lineHeight, truncate, variant, gradient, css, style, ...otherProps }, ref) => {
    const Component = as

    // Only pass the recipe variants to the text function
    const recipeProps = {
      as,
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

    // Handle CSS prop by converting it to inline styles (basic support)
    let combinedStyle = style
    if (css && typeof css === 'object') {
      combinedStyle = { ...style, ...css }
    }

    return React.createElement(
      Component,
      {
        ref: ref as any,
        className: clsx(text(recipeProps), className),
        style: combinedStyle,
        ...otherProps,
      },
      children
    )
  }
)

Text.displayName = 'Text'

// Semantic text components built on top of Text
export interface HeadingProps extends Omit<TextProps, 'variant' | 'as'> {
  level?: 1 | 2 | 3 | 4 | 5 | 6
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ level = 1, as, size, weight = 'bold', color = 'text', ...props }, ref) => {
    const Component = as || (`h${level}` as const)

    // Map heading levels to sizes if size not provided
    const headingSize = size || {
      1: '3xl',
      2: '2xl',
      3: 'xl',
      4: 'lg',
      5: 'md',
      6: 'md',
    }[level] as TextProps['size']

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
export interface LabelProps extends Omit<TextProps, 'variant' | 'as'> {
  htmlFor?: string
  required?: boolean
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ required, children, size = 'sm', weight = 'medium', color = 'textSecondary', ...props }, ref) => (
    <Text
      ref={ref}
      as="label"
      variant="label"
      size={size}
      weight={weight}
      color={color}
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
export interface CaptionProps extends Omit<TextProps, 'variant'> {}

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
export interface CodeProps extends Omit<TextProps, 'variant' | 'font'> {}

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
export interface ParagraphProps extends Omit<TextProps, 'as'> {}

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

// Export types for use elsewhere
export type TextVEProps = TextProps
export type HeadingVEProps = HeadingProps
export type LabelVEProps = LabelProps
export type CaptionVEProps = CaptionProps
export type CodeVEProps = CodeProps
export type ParagraphVEProps = ParagraphProps