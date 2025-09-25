/**
 * SpellIcon Atom Component
 *
 * Visual icon representation for spells based on school and type.
 * Follows atomic design patterns with 25-40 line constraint.
 */

import React from 'react'
import {
  Zap, Shield, PlusCircle, Eye, Heart, EyeOff,
  Skull, RotateCw, Sword, Cloud, MessageCircle,
  Tool, Settings
} from 'lucide-react'
import { styled } from '@/styles/theme.config'
import type { SpellSchoolId, SpellCategoryId } from '../../types'

interface SpellIconProps {
  school: SpellSchoolId
  category?: SpellCategoryId
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const IconWrapper = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '$2',

  variants: {
    size: {
      sm: { width: 16, height: 16 },
      md: { width: 20, height: 20 },
      lg: { width: 24, height: 24 }
    }
  },

  defaultVariants: {
    size: 'md'
  }
})

const SCHOOL_ICONS = {
  abjuration: Shield,
  conjuration: PlusCircle,
  divination: Eye,
  enchantment: Heart,
  evocation: Zap,
  illusion: EyeOff,
  necromancy: Skull,
  transmutation: RotateCw
} as const

const CATEGORY_ICONS = {
  combat: Sword,
  environmental: Cloud,
  social: MessageCircle,
  utility: Tool,
  custom: Settings
} as const

export const SpellIcon: React.FC<SpellIconProps> = ({
  school,
  category,
  size = 'md',
  className
}) => {
  // Prefer category icon if available, fallback to school
  const IconComponent = (category && CATEGORY_ICONS[category])
    ? CATEGORY_ICONS[category]
    : SCHOOL_ICONS[school]

  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 20 : 16

  return (
    <IconWrapper size={size} className={className}>
      <IconComponent size={iconSize} />
    </IconWrapper>
  )
}