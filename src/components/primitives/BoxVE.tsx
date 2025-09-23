import React, { forwardRef } from 'react'
import { clsx } from 'clsx'
import { sprinkles, type Sprinkles } from '@/styles/sprinkles.css'

// Define Box-specific props that extend Sprinkles
export interface BoxProps extends Sprinkles {
  children?: React.ReactNode
  className?: string
  as?: keyof JSX.IntrinsicElements
  css?: React.CSSProperties | Record<string, any>
  // Additional common props
  style?: React.CSSProperties
  id?: string
  'data-testid'?: string
  'data-test-id'?: string
  role?: string
  'aria-label'?: string
  onClick?: (event: React.MouseEvent) => void
  onMouseEnter?: (event: React.MouseEvent) => void
  onMouseLeave?: (event: React.MouseEvent) => void
}

// Create the Box component using forwardRef for better ref handling
export const Box = forwardRef<HTMLElement, BoxProps>(
  ({ children, className, as: Component = 'div', css, style, ...props }, ref) => {
    // Extract sprinkles props from other props
    const sprinkleProps: Sprinkles = {}
    const elementProps: Record<string, any> = {}

    // Separate sprinkles props from DOM props
    for (const [key, value] of Object.entries(props)) {
      // Check if this is a valid sprinkles prop
      if (isValidSprinklesProp(key)) {
        sprinkleProps[key as keyof Sprinkles] = value
      } else {
        elementProps[key] = value
      }
    }

    // Handle CSS prop by converting it to inline styles (basic support)
    let combinedStyle = style
    if (css && typeof css === 'object') {
      combinedStyle = { ...style, ...css }
    }

    return React.createElement(
      Component,
      {
        ref,
        className: clsx(sprinkles(sprinkleProps), className),
        style: combinedStyle,
        ...elementProps,
      },
      children
    )
  }
)

Box.displayName = 'Box'

// Helper to check if a prop is a valid sprinkles prop
function isValidSprinklesProp(prop: string): boolean {
  const sprinklesProps = new Set([
    // Display & Layout
    'display', 'flexDirection', 'flexWrap', 'justifyContent', 'alignItems', 'alignSelf',
    'flexGrow', 'flexShrink', 'gridTemplateColumns', 'gap',

    // Spacing
    'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
    'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
    'm', 'mt', 'mr', 'mb', 'ml', 'mx', 'my',
    'p', 'pt', 'pr', 'pb', 'pl', 'px', 'py',

    // Typography
    'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'textAlign',

    // Position & Layout
    'position', 'top', 'right', 'bottom', 'left', 'zIndex',

    // Sizing
    'width', 'height', 'minWidth', 'maxWidth', 'minHeight', 'maxHeight',
    'w', 'h', 'size',

    // Visual
    'overflow', 'overflowX', 'overflowY', 'opacity',

    // Borders
    'borderRadius', 'borderTopLeftRadius', 'borderTopRightRadius',
    'borderBottomLeftRadius', 'borderBottomRightRadius', 'rounded',
    'borderWidth', 'borderStyle', 'borderColor',

    // Colors
    'color', 'backgroundColor', 'bg', 'bgColor',

    // Effects
    'boxShadow', 'outline', 'transition', 'transform',

    // Interaction
    'cursor', 'userSelect', 'pointerEvents',
  ])

  return sprinklesProps.has(prop)
}

// Export type for use in other components
export type BoxVEProps = BoxProps