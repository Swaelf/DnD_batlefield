import type React from 'react';
import { type ReactElement, type ComponentProps, createElement } from 'react'
import { clsx } from 'clsx'
import { sprinkles, type Sprinkles } from '../sprinkles.css'

// Utility to merge className with sprinkles
export function mergeStyles(
  baseClassName?: string,
  sprinkleProps?: Sprinkles,
  additionalClassName?: string
): string {
  return clsx(
    baseClassName,
    sprinkleProps && sprinkles(sprinkleProps),
    additionalClassName
  )
}

// Type for components that accept both sprinkles and className
export interface StylableProps extends Sprinkles {
  className?: string
}

// Extract sprinkles props from component props
export function extractSprinkles<T extends Record<string, any>>(
  props: T
): [Sprinkles, Omit<T, keyof Sprinkles>] {
  const sprinkleKeys = new Set([
    // Layout
    'display', 'flexDirection', 'flexWrap', 'justifyContent', 'alignItems', 'alignSelf',
    'flexGrow', 'flexShrink', 'gridTemplateColumns', 'gap',

    // Spacing
    'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
    'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
    'm', 'mt', 'mr', 'mb', 'ml', 'mx', 'my',
    'p', 'pt', 'pr', 'pb', 'pl', 'px', 'py',

    // Typography
    'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'textAlign',

    // Layout & Position
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

  const sprinkleProps: any = {}
  const otherProps: any = {}

  for (const [key, value] of Object.entries(props)) {
    if (sprinkleKeys.has(key)) {
      sprinkleProps[key] = value
    } else {
      otherProps[key] = value
    }
  }

  return [sprinkleProps, otherProps]
}

// Create a stylable component wrapper
export function createStylableComponent<T extends keyof React.JSX.IntrinsicElements>(
  element: T,
  baseClassName?: string
) {
  return function StylableComponent({
    className,
    ...props
  }: ComponentProps<T> & StylableProps) {
    const [sprinkleProps, elementProps] = extractSprinkles(props)

    return createElement(
      element,
      {
        ...elementProps,
        className: mergeStyles(baseClassName, sprinkleProps, className)
      }
    ) as ReactElement
  }
}

// Style group type helpers
type StyleGroupBase = {
  base?: Sprinkles
  variants?: Record<string, Sprinkles>
  sizes?: Record<string, Sprinkles>
  [key: string]: Sprinkles | Record<string, Sprinkles> | undefined
}

// Common style combinations
export const styleGroups: Record<string, StyleGroupBase> = {
  // Button-like styles
  button: {
    base: {
      display: 'inline-flex' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      borderRadius: 'md' as const,
      cursor: 'pointer' as const,
      transition: 'colors' as const,
      userSelect: 'none' as const,
    },

    sizes: {
      sm: { padding: 2, fontSize: 'sm' as const },
      md: { padding: 3, fontSize: 'md' as const },
      lg: { padding: 4, fontSize: 'lg' as const },
    },

    variants: {
      primary: {
        backgroundColor: 'primary' as const,
        color: 'textInverse' as const,
      },
      secondary: {
        backgroundColor: 'secondary' as const,
        color: 'textInverse' as const,
      },
      outline: {
        borderWidth: 1,
        borderStyle: 'solid' as const,
        borderColor: 'border' as const,
        backgroundColor: 'transparent' as const,
      },
    },
  },

  // Input-like styles
  input: {
    base: {
      display: 'block' as const,
      width: 'full' as const,
      borderRadius: 'md' as const,
      borderWidth: 1,
      borderStyle: 'solid' as const,
      borderColor: 'border' as const,
      backgroundColor: 'surface' as const,
      color: 'text' as const,
      transition: 'colors' as const,
    },

    sizes: {
      sm: { padding: 2, fontSize: 'sm' as const },
      md: { padding: 3, fontSize: 'md' as const },
      lg: { padding: 4, fontSize: 'lg' as const },
    },
  },

  // Panel-like styles
  panel: {
    base: {
      backgroundColor: 'surface' as const,
      borderRadius: 'lg' as const,
      borderWidth: 1,
      borderStyle: 'solid' as const,
      borderColor: 'border' as const,
    },

    padding: {
      sm: { padding: 3 },
      md: { padding: 4 },
      lg: { padding: 6 },
    },
  },

  // Card-like styles
  card: {
    base: {
      backgroundColor: 'surface' as const,
      borderRadius: 'lg' as const,
      boxShadow: 'md' as const,
      overflow: 'hidden' as const,
    },
  },

  // Typography styles
  text: {
    heading: {
      fontWeight: 'bold' as const,
      lineHeight: 'tight' as const,
    },

    body: {
      lineHeight: 'normal' as const,
    },

    caption: {
      fontSize: 'sm' as const,
      color: 'textSecondary' as const,
    },
  },
}

// Helper to apply style groups
export function applyStyleGroup(
  group: keyof typeof styleGroups,
  variant?: string,
  size?: string,
  additionalProps?: Sprinkles
): Sprinkles {
  const styleGroup = styleGroups[group]
  const baseStyles = styleGroup.base || {}

  let variantStyles: Sprinkles = {}
  if (variant && styleGroup.variants) {
    variantStyles = styleGroup.variants[variant] || {}
  }

  let sizeStyles: Sprinkles = {}
  if (size && styleGroup.sizes) {
    sizeStyles = styleGroup.sizes[size] || {}
  }

  return {
    ...baseStyles,
    ...variantStyles,
    ...sizeStyles,
    ...additionalProps,
  }
}

// Responsive helper utilities
export function responsiveValue<T>(
  mobile: T,
  tablet?: T,
  desktop?: T
): { mobile: T; tablet?: T; desktop?: T } {
  return {
    mobile,
    ...(tablet && { tablet }),
    ...(desktop && { desktop }),
  }
}

// Conditional styling helper
export function conditionalStyle(
  condition: boolean,
  trueStyle: Sprinkles,
  falseStyle?: Sprinkles
): Sprinkles {
  return condition ? trueStyle : (falseStyle || {})
}