/**
 * Spells Module Types
 *
 * Type definitions for the modular spell system following atomic design patterns.
 * Re-exports base spell types and adds module-specific branded types.
 */

// Import and re-export core spell types from the centralized type system
import type {
  SpellEffect,
  SpellSize,
  SpellAnimation,
  AnimationType,
  SpellTemplate,
  SpellEffectTemplate
} from '@/types/spells'

export type {
  SpellEffect,
  SpellSize,
  SpellAnimation,
  AnimationType,
  SpellTemplate,
  SpellEffectTemplate
}

// Re-export helper functions
export {
  isSpellExpired,
  getSpellAnimationState,
  SPELL_TEMPLATES
} from '@/types/spells'

// Module-specific branded types for type safety
export type SpellId = string & { readonly __brand: 'SpellId' }
export type SpellTemplateId = string & { readonly __brand: 'SpellTemplateId' }
export type SpellCategoryId = string & { readonly __brand: 'SpellCategoryId' }
export type SpellSchoolId = string & { readonly __brand: 'SpellSchoolId' }

/**
 * Unified spell type that extends base SpellEffect with module features
 */
export type UnifiedSpell = SpellEffect & {
  readonly id: SpellId
  readonly templateId: SpellTemplateId
  readonly category: SpellCategoryId
  readonly school: SpellSchoolId
  readonly description: string
  readonly isCustom: boolean
  readonly customizable: boolean
  readonly tags: readonly string[]
  readonly createdAt: Date
  readonly updatedAt?: Date
}

/**
 * Enhanced spell template with module-specific features
 */
export type UnifiedSpellTemplate = SpellTemplate & {
  readonly id: SpellTemplateId
  readonly category: SpellCategoryId
  readonly isBuiltIn: boolean
  readonly tags: readonly string[]
  readonly popularity: number
  readonly customizable: boolean
  readonly version: string
}

/**
 * Spell search and filtering criteria
 */
export type SpellSearchCriteria = {
  readonly query?: string
  readonly school?: SpellSchoolId | SpellSchoolId[]
  readonly category?: SpellCategoryId
  readonly level?: {
    readonly min?: number
    readonly max?: number
  }
  readonly tags?: readonly string[]
  readonly type?: SpellEffect['type']
  readonly duration?: {
    readonly min?: number
    readonly max?: number
  }
  readonly includeCustom?: boolean
  readonly sortBy?: 'name' | 'level' | 'school' | 'category' | 'popularity'
  readonly sortDirection?: 'asc' | 'desc'
}

/**
 * Spell library organization and metadata
 */
export type SpellCategory = {
  readonly id: SpellCategoryId
  readonly name: string
  readonly description: string
  readonly icon: string
  readonly color: string
  readonly count: number
}

export type SpellSchool = {
  readonly id: SpellSchoolId
  readonly name: string
  readonly description: string
  readonly icon: string
  readonly color: string
  readonly count: number
}

/**
 * Spell animation configuration and state
 */
export type SpellAnimationConfig = {
  readonly enableParticles: boolean
  readonly enableScreenShake: boolean
  readonly enableSoundEffects: boolean
  readonly animationQuality: 'low' | 'medium' | 'high'
  readonly particleDensity: number
  readonly shakeDuration: number
  readonly fadeInDuration: number
  readonly fadeOutDuration: number
}

/**
 * Spell customization data for user modifications
 */
export type SpellCustomization = {
  readonly spellId: SpellId
  readonly name?: string
  readonly description?: string
  readonly color?: string
  readonly opacity?: number
  readonly size?: Partial<SpellSize>
  readonly duration?: number
  readonly animation?: Partial<SpellAnimation>
  readonly tags?: readonly string[]
}

/**
 * Spell rendering configuration
 */
export type SpellRenderingOptions = {
  readonly showGrid: boolean
  readonly showRange: boolean
  readonly showArea: boolean
  readonly showDirection: boolean
  readonly highlightTargets: boolean
  readonly previewMode: boolean
  readonly quality: 'low' | 'medium' | 'high'
}

/**
 * Spell preview state for placement assistance
 */
export type SpellPreviewState = {
  readonly isActive: boolean
  readonly template: UnifiedSpellTemplate | null
  readonly position: { readonly x: number; readonly y: number } | null
  readonly rotation: number
  readonly isValid: boolean
  readonly affectedArea: readonly { readonly x: number; readonly y: number }[]
  readonly potentialTargets: readonly string[]
}

/**
 * D&D 5e spell schools with metadata
 */
export const SPELL_SCHOOLS: Record<string, SpellSchool> = {
  abjuration: {
    id: 'abjuration' as SpellSchoolId,
    name: 'Abjuration',
    description: 'Protective magic and banishment',
    icon: 'shield',
    color: '#4a90e2',
    count: 0
  },
  conjuration: {
    id: 'conjuration' as SpellSchoolId,
    name: 'Conjuration',
    description: 'Summoning and creation magic',
    icon: 'plus-circle',
    color: '#7ed321',
    count: 0
  },
  divination: {
    id: 'divination' as SpellSchoolId,
    name: 'Divination',
    description: 'Information gathering and prophecy',
    icon: 'eye',
    color: '#f5a623',
    count: 0
  },
  enchantment: {
    id: 'enchantment' as SpellSchoolId,
    name: 'Enchantment',
    description: 'Mind control and charm magic',
    icon: 'heart',
    color: '#d0021b',
    count: 0
  },
  evocation: {
    id: 'evocation' as SpellSchoolId,
    name: 'Evocation',
    description: 'Elemental damage and energy magic',
    icon: 'zap',
    color: '#f8e71c',
    count: 0
  },
  illusion: {
    id: 'illusion' as SpellSchoolId,
    name: 'Illusion',
    description: 'Deception and misdirection magic',
    icon: 'eye-off',
    color: '#9013fe',
    count: 0
  },
  necromancy: {
    id: 'necromancy' as SpellSchoolId,
    name: 'Necromancy',
    description: 'Death and undeath magic',
    icon: 'skull',
    color: '#50e3c2',
    count: 0
  },
  transmutation: {
    id: 'transmutation' as SpellSchoolId,
    name: 'Transmutation',
    description: 'Transformation and alteration magic',
    icon: 'rotate-cw',
    color: '#bd10e0',
    count: 0
  }
} as const

/**
 * Spell categories for organization
 */
export const SPELL_CATEGORIES: Record<string, SpellCategory> = {
  combat: {
    id: 'combat' as SpellCategoryId,
    name: 'Combat',
    description: 'Offensive and defensive spells for battle',
    icon: 'sword',
    color: '#d0021b',
    count: 0
  },
  utility: {
    id: 'utility' as SpellCategoryId,
    name: 'Utility',
    description: 'Practical spells for exploration and problem solving',
    icon: 'tool',
    color: '#f5a623',
    count: 0
  },
  social: {
    id: 'social' as SpellCategoryId,
    name: 'Social',
    description: 'Spells for interaction and communication',
    icon: 'message-circle',
    color: '#7ed321',
    count: 0
  },
  environmental: {
    id: 'environmental' as SpellCategoryId,
    name: 'Environmental',
    description: 'Area control and terrain modification spells',
    icon: 'cloud',
    color: '#4a90e2',
    count: 0
  },
  custom: {
    id: 'custom' as SpellCategoryId,
    name: 'Custom',
    description: 'User-created custom spell effects',
    icon: 'settings',
    color: '#9013fe',
    count: 0
  }
} as const

/**
 * Type guards for spell type safety
 */
export const isSpellId = (value: string): value is SpellId => {
  return typeof value === 'string' && value.length > 0
}

export const isUnifiedSpell = (obj: unknown): obj is UnifiedSpell => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'templateId' in obj &&
    'name' in obj &&
    'type' in obj &&
    typeof (obj as any).id === 'string' &&
    typeof (obj as any).name === 'string'
  )
}

export const isSpellTemplate = (obj: unknown): obj is UnifiedSpellTemplate => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj &&
    'school' in obj &&
    'level' in obj &&
    typeof (obj as any).id === 'string' &&
    typeof (obj as any).name === 'string'
  )
}

/**
 * Brand utility functions for type-safe ID creation
 */
export const createSpellId = (id: string): SpellId => id as SpellId
export const createSpellTemplateId = (id: string): SpellTemplateId => id as SpellTemplateId
export const createSpellCategoryId = (id: string): SpellCategoryId => id as SpellCategoryId
export const createSpellSchoolId = (id: string): SpellSchoolId => id as SpellSchoolId