import React, { forwardRef } from 'react'
import { clsx } from 'clsx'
import { sprinkles, type Sprinkles } from '@/styles/sprinkles.css'

// Base props for Box component
type BoxOwnProps = {
  as?: React.ElementType
  children?: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

// Combined Box props with Sprinkles and HTML attributes
export type BoxProps = Partial<Sprinkles> &
  BoxOwnProps &
  Omit<React.HTMLAttributes<HTMLElement>, keyof Sprinkles | keyof BoxOwnProps>

// List of valid sprinkles properties for efficient filtering
const SPRINKLES_PROPS = new Set([
  // Display & Layout
  'display', 'flexDirection', 'flexWrap', 'justifyContent', 'alignItems',
  'alignSelf', 'flexGrow', 'flexShrink', 'gridTemplateColumns', 'gap',
  // Spacing (full names and shorthands)
  'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
  'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
  'm', 'mt', 'mr', 'mb', 'ml', 'mx', 'my',
  'p', 'pt', 'pr', 'pb', 'pl', 'px', 'py',
  // Typography
  'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'textAlign',
  'color', 'textDecoration', 'textTransform',
  // Position & Layout
  'position', 'top', 'right', 'bottom', 'left', 'zIndex',
  'overflow', 'overflowX', 'overflowY',
  // Sizing (full names and shorthands)
  'width', 'height', 'minWidth', 'maxWidth', 'minHeight', 'maxHeight',
  'w', 'h', 'size',
  // Visual (including shorthands)
  'opacity', 'backgroundColor', 'bg', 'bgColor',
  'borderRadius', 'borderTopLeftRadius', 'borderTopRightRadius',
  'borderBottomLeftRadius', 'borderBottomRightRadius', 'rounded',
  'borderWidth', 'borderStyle', 'borderColor',
  'boxShadow', 'outline',
  // Effects
  'transition', 'transform', 'cursor', 'userSelect', 'pointerEvents',
])

// Simplified Box implementation using forwardRef
export const Box = forwardRef<HTMLElement, BoxProps>(
  (props, ref) => {
    const {
      as: Component = 'div',
      children,
      className,
      style,
      ...rest
    } = props

    // Separate sprinkles from HTML props
    const sprinkleProps: Record<string, unknown> = {}
    const htmlProps: Record<string, unknown> = {}

    Object.entries(rest).forEach(([key, value]) => {
      if (SPRINKLES_PROPS.has(key)) {
        sprinkleProps[key] = value
      } else {
        htmlProps[key] = value
      }
    })

    // Generate the class name from sprinkles
    const sprinklesClassName = Object.keys(sprinkleProps).length > 0
      ? sprinkles(sprinkleProps as Sprinkles)
      : undefined

    return React.createElement(
      Component as React.ElementType,
      {
        ref,
        className: clsx(sprinklesClassName, className),
        style,
        ...htmlProps,
      },
      children
    )
  }
)

Box.displayName = 'Box'

// Export specific element type variants
export type DivBoxProps = BoxProps & React.HTMLAttributes<HTMLDivElement>
export type SpanBoxProps = BoxProps & React.HTMLAttributes<HTMLSpanElement>
export type ButtonBoxProps = BoxProps & React.ButtonHTMLAttributes<HTMLButtonElement>
export type SectionBoxProps = BoxProps & React.HTMLAttributes<HTMLElement>
export type ArticleBoxProps = BoxProps & React.HTMLAttributes<HTMLElement>