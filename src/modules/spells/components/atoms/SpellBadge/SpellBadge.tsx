/**
 * SpellBadge Atom Component
 *
 * Small visual badge for spell properties (level, school, type).
 * Follows atomic design patterns with 25-40 line constraint.
 */

import React from 'react'
import { styled } from '@/styles/theme.config'
import type { SpellSchoolId } from '../../types'

interface SpellBadgeProps {
  variant: 'level' | 'school' | 'type' | 'custom'
  content: string | number
  color?: string
  size?: 'sm' | 'md'
  title?: string
  className?: string
}

const Badge = styled('span', {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '$2',
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.025em',
  whiteSpace: 'nowrap',

  variants: {
    variant: {
      level: {
        background: '$dndRed',
        color: 'white',
        minWidth: '20px',
        height: '20px',
        fontSize: '$xs'
      },
      school: {
        background: '$gray300',
        color: '$gray800',
        padding: '2px 6px',
        fontSize: '$xs'
      },
      type: {
        background: '$secondary',
        color: '$dndBlack',
        padding: '2px 6px',
        fontSize: '$xs'
      },
      custom: {
        background: '$violet600',
        color: 'white',
        padding: '1px 4px',
        fontSize: '$xs'
      }
    },

    size: {
      sm: {
        fontSize: '$xs',
        padding: '1px 4px'
      },
      md: {
        fontSize: '$sm',
        padding: '2px 6px'
      }
    }
  },

  defaultVariants: {
    size: 'md'
  }
})

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
    <Badge
      variant={variant}
      size={size}
      title={title}
      className={className}
      style={badgeColor ? { background: badgeColor } : undefined}
    >
      {content}
    </Badge>
  )
}