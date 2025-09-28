/**
 * SpellBadge Atom Component
 *
 * Small visual badge for spell properties (level, school, type).
 * Follows atomic design patterns with 25-40 line constraint.
 */

import React from 'react'
import { Box } from '@/components/primitives'

interface SpellBadgeProps {
  variant: 'level' | 'school' | 'type' | 'custom'
  content: string | number
  color?: string
  size?: 'sm' | 'md'
  title?: string
  className?: string
}

// Helper functions for styling
const getBadgeStyles = (variant: SpellBadgeProps['variant'], size: SpellBadgeProps['size'] = 'md', customColor?: string) => {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    fontWeight: '500',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.025em',
    whiteSpace: 'nowrap' as const
  }

  const variantStyles = {
    level: {
      background: 'var(--dnd-red)',
      color: 'white',
      minWidth: '20px',
      height: '20px',
      fontSize: '12px'
    },
    school: {
      background: 'var(--gray-300)',
      color: 'var(--gray-800)',
      padding: '2px 6px',
      fontSize: '12px'
    },
    type: {
      background: 'var(--secondary)',
      color: 'var(--dnd-black)',
      padding: '2px 6px',
      fontSize: '12px'
    },
    custom: {
      background: 'var(--violet-600)',
      color: 'white',
      padding: '1px 4px',
      fontSize: '12px'
    }
  }

  const sizeStyles = {
    sm: {
      fontSize: '12px',
      padding: '1px 4px'
    },
    md: {
      fontSize: '14px',
      padding: '2px 6px'
    }
  }

  return {
    ...baseStyles,
    ...variantStyles[variant],
    ...sizeStyles[size],
    ...(customColor ? { background: customColor } : {})
  }
}

const SCHOOL_COLORS: Record<string, string> = {
  abjuration: '#4a90e2',
  conjuration: '#7ed321',
  divination: '#f5a623',
  enchantment: '#d0021b',
  evocation: '#f8e71c',
  illusion: '#9013fe',
  necromancy: '#50e3c2',
  transmutation: '#bd10e0'
}

export const SpellBadge: React.FC<SpellBadgeProps> = ({
  variant,
  content,
  color,
  size = 'md',
  title,
  className
}) => {
  const badgeColor = color || SCHOOL_COLORS[String(content).toLowerCase()]

  return (
    <Box
      className={className}
      title={title}
      style={getBadgeStyles(variant, size, badgeColor)}
    >
      {content}
    </Box>
  )
}