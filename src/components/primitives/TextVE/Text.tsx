import { forwardRef, createElement, type ReactNode, type CSSProperties, type MouseEvent, type FocusEvent } from 'react'
import { clsx } from 'clsx'
import { text } from '@/styles/recipes/text.css'

// Valid HTML text elements
export type TextElements = 'span' | 'div' | 'p' | 'label' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

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
  children?: ReactNode
  className?: string
  htmlFor?: string // For label element

  // Event handlers
  onClick?: (event: MouseEvent<HTMLElement>) => void
  onMouseEnter?: (event: MouseEvent<HTMLElement>) => void
  onMouseLeave?: (event: MouseEvent<HTMLElement>) => void
  onFocus?: (event: FocusEvent<HTMLElement>) => void
  onBlur?: (event: FocusEvent<HTMLElement>) => void

  // Common HTML attributes
  id?: string
  role?: string
  title?: string
  style?: CSSProperties
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

    return createElement(
      Component,
      htmlProps,
      children
    )
  }
)

Text.displayName = 'Text'
