/**
 * Actions Module Types
 * Types for the unified action system and templates
 */

// Import basic types from unifiedAction
import type {
  UnifiedAction,
  ActionType,
  ActionCategory
} from '@/types/unifiedAction'

// Import timeline action types
import type {
  ActionData,
  AttackActionData,
  SpellActionData,
  MovementActionData,
  InteractionActionData,
  EnvironmentalActionData,
  SequenceActionData,
  UtilityActionData,
  WeaponTemplate,
  DamageTemplate,
  AreaTemplate,
  ActionEffect,
  SpellSchool,
  CastingTime,
  SpellDuration,
  SpellTargetTemplate,
  SpellEffectTemplate,
  MovementType,
  InteractionTemplate,
  EnvironmentalTemplate,
  SequenceTemplate,
  UtilityTemplate,
  ExecutionRule,
  ActionParameter,
  ValidationRule,
  WeaponProperty,
  ActionToEventConversionResult,
  EventToActionConversionResult
} from '@/modules/timeline/types'

// Create local types that actions module needs
export type ActionId = string
export type ActionTemplateId = string

export type {
  UnifiedAction,
  ActionType,
  ActionCategory,
  ActionData,
  AttackActionData,
  SpellActionData,
  MovementActionData,
  InteractionActionData,
  EnvironmentalActionData,
  SequenceActionData,
  UtilityActionData,
  WeaponTemplate,
  DamageTemplate,
  AreaTemplate,
  ActionEffect,
  SpellSchool,
  CastingTime,
  SpellDuration,
  SpellTargetTemplate,
  SpellEffectTemplate,
  MovementType,
  InteractionTemplate,
  EnvironmentalTemplate,
  SequenceTemplate,
  UtilityTemplate,
  ExecutionRule,
  ActionParameter,
  ValidationRule,
  WeaponProperty,
  ActionToEventConversionResult,
  EventToActionConversionResult
}

/**
 * Action selection and filtering
 */
export type ActionSearchCriteria = {
  readonly query?: string
  readonly type?: ActionType
  readonly category?: ActionCategory
  readonly tags?: string[]
  readonly includeCustom?: boolean
  readonly minLevel?: number
  readonly maxLevel?: number
}

/**
 * Action library organization
 */
export type ActionLibrary = {
  readonly templates: Map<ActionTemplateId, ActionTemplate>
  readonly customActions: Map<ActionId, UnifiedAction>
  readonly categories: ActionCategoryInfo[]
  readonly tags: string[]
}

export type ActionTemplate = {
  readonly id: ActionTemplateId
  readonly name: string
  readonly description: string
  readonly type: ActionType
  readonly category: ActionCategory
  readonly data: ActionData
  readonly tags: string[]
  readonly level?: number // For spells
  readonly isBuiltIn: boolean
  readonly iconName?: string
  readonly rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
}

export type ActionCategoryInfo = {
  readonly id: ActionCategory
  readonly name: string
  readonly description: string
  readonly icon: string
  readonly color: string
  readonly count: number
}

/**
 * Action selection state
 */
export type ActionSelectionState = {
  readonly selectedActionId: ActionId | null
  readonly searchQuery: string
  readonly activeCategory: ActionCategory | 'all'
  readonly sortBy: ActionSortBy
  readonly sortDirection: 'asc' | 'desc'
  readonly viewMode: 'grid' | 'list'
  readonly showCustomActions: boolean
}

export type ActionSortBy = 'name' | 'type' | 'category' | 'level' | 'recent'

/**
 * Action customization
 */
export type ActionCustomization = {
  readonly actionId: ActionId
  readonly name?: string
  readonly description?: string
  readonly visualProperties?: ActionVisualProperties
  readonly mechanicalProperties?: ActionMechanicalProperties
  readonly metadata?: Record<string, unknown>
}

export type ActionVisualProperties = {
  readonly color?: string
  readonly size?: number
  readonly duration?: number
  readonly intensity?: number
  readonly particleCount?: number
  readonly glowEffect?: boolean
  readonly trailEffect?: boolean
}

export type ActionMechanicalProperties = {
  readonly damage?: DamageTemplate
  readonly range?: number
  readonly areaOfEffect?: AreaTemplate
  readonly duration?: SpellDuration
  readonly components?: string[]
  readonly castingTime?: CastingTime
}