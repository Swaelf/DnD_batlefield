/**
 * Unified Action System Types
 * Actions are templates that can be converted to events
 */

import type { BrandedString } from '@/foundation/types'
import type { EventData, AttackType, DamageType, SpellComponent } from './events'

export type ActionId = BrandedString<'ActionId'>
export type ActionTemplateId = BrandedString<'ActionTemplateId'>

/**
 * Unified action that can be converted to timeline events
 */
export type UnifiedAction = {
  readonly id: ActionId
  readonly templateId: ActionTemplateId | null
  readonly name: string
  readonly description: string
  readonly type: ActionType
  readonly category: ActionCategory
  readonly data: ActionData
  readonly customizable: boolean
  readonly isCustom: boolean
  readonly tags: string[]
  readonly createdAt: Date
}

/**
 * Action type discriminator
 */
export type ActionType =
  | 'attack'
  | 'spell'
  | 'movement'
  | 'interaction'
  | 'environmental'
  | 'sequence'
  | 'utility'

/**
 * Action category for organization
 */
export type ActionCategory =
  | 'combat'
  | 'exploration'
  | 'social'
  | 'environmental'
  | 'utility'
  | 'custom'

/**
 * Union type for all action data
 */
export type ActionData =
  | AttackActionData
  | SpellActionData
  | MovementActionData
  | InteractionActionData
  | EnvironmentalActionData
  | SequenceActionData
  | UtilityActionData

/**
 * Attack action data
 */
export type AttackActionData = {
  readonly type: 'attack'
  readonly attackType: AttackType
  readonly weapon: WeaponTemplate
  readonly damage: DamageTemplate
  readonly range: number
  readonly areaOfEffect: AreaTemplate | null
  readonly effects: ActionEffect[]
  readonly canCrit: boolean
  readonly critMultiplier: number
}

/**
 * Spell action data
 */
export type SpellActionData = {
  readonly type: 'spell'
  readonly school: SpellSchool
  readonly level: number
  readonly components: SpellComponent[]
  readonly castingTime: CastingTime
  readonly range: number
  readonly duration: SpellDuration
  readonly concentration: boolean
  readonly ritual: boolean
  readonly targetType: SpellTargetTemplate
  readonly effects: SpellEffectTemplate[]
}

/**
 * Movement action data
 */
export type MovementActionData = {
  readonly type: 'movement'
  readonly distance: number
  readonly speed: number
  readonly movementType: MovementType
  readonly canTriggerOpportunityAttacks: boolean
  readonly terrainRestrictions: string[]
  readonly followsPath: boolean
}

/**
 * Interaction action data
 */
export type InteractionActionData = {
  readonly type: 'interaction'
  readonly interactionType: InteractionTemplate
  readonly duration: number
  readonly skillRequired: string | null
  readonly dcRange: { min: number; max: number }
  readonly canFail: boolean
  readonly failureConsequences: string[]
}

/**
 * Environmental action data
 */
export type EnvironmentalActionData = {
  readonly type: 'environmental'
  readonly effectType: EnvironmentalTemplate
  readonly areaOfEffect: AreaTemplate
  readonly duration: number
  readonly intensity: number
  readonly weatherDependency: boolean
  readonly terrainDependency: boolean
}

/**
 * Sequence action data (meta-action containing other actions)
 */
export type SequenceActionData = {
  readonly type: 'sequence'
  readonly sequenceType: SequenceTemplate
  readonly actions: UnifiedAction[]
  readonly executionRules: ExecutionRule[]
  readonly parallelExecution: boolean
  readonly allowPartialSuccess: boolean
}

/**
 * Utility action data (non-combat actions)
 */
export type UtilityActionData = {
  readonly type: 'utility'
  readonly utilityType: UtilityTemplate
  readonly affectsTimeline: boolean
  readonly requiresConfirmation: boolean
  readonly undoable: boolean
  readonly parameters: Record<string, ActionParameter>
}

// Supporting template types

export type WeaponTemplate = {
  readonly name: string
  readonly type: string
  readonly damage: DamageTemplate
  readonly properties: WeaponProperty[]
  readonly attackBonus: number
}

export type DamageTemplate = {
  readonly baseDice: string // e.g., "1d8"
  readonly damageType: DamageType
  readonly bonusType: 'fixed' | 'ability' | 'proficiency'
  readonly bonusAmount: number
  readonly versatile: boolean
  readonly versatileDice?: string
}

export type AreaTemplate = {
  readonly shape: 'circle' | 'rectangle' | 'line' | 'cone' | 'sphere'
  readonly size: number | { width: number; height: number; length?: number }
  readonly origin: 'self' | 'target' | 'point'
  readonly affectsCaster: boolean
}

export type ActionEffect = {
  readonly name: string
  readonly type: 'damage' | 'healing' | 'condition' | 'movement' | 'environmental'
  readonly duration: number | 'instant' | 'permanent'
  readonly saveType: string | null
  readonly saveDC: number | null
  readonly parameters: Record<string, unknown>
}

export type SpellSchool =
  | 'abjuration'
  | 'conjuration'
  | 'divination'
  | 'enchantment'
  | 'evocation'
  | 'illusion'
  | 'necromancy'
  | 'transmutation'

export type CastingTime = {
  readonly value: number
  readonly unit: 'action' | 'bonus_action' | 'reaction' | 'minute' | 'hour'
  readonly condition?: string
}

export type SpellDuration = {
  readonly type: 'instant' | 'timed' | 'concentration' | 'until_dispelled' | 'special'
  readonly value?: number
  readonly unit?: 'round' | 'minute' | 'hour' | 'day'
}

export type SpellTargetTemplate = {
  readonly type: 'single' | 'multiple' | 'area' | 'self' | 'point'
  readonly count?: number
  readonly range: number
  readonly area?: AreaTemplate
}

export type SpellEffectTemplate = {
  readonly type: string
  readonly scaling: boolean
  readonly scaleType?: 'slot_level' | 'caster_level'
  readonly basePower: number
  readonly parameters: Record<string, unknown>
}

export type MovementType = 'walk' | 'fly' | 'swim' | 'climb' | 'burrow' | 'teleport'

export type InteractionTemplate = {
  readonly name: string
  readonly category: string
  readonly objectTypes: string[]
  readonly multipleUse: boolean
  readonly reversible: boolean
}

export type EnvironmentalTemplate = {
  readonly name: string
  readonly category: 'weather' | 'terrain' | 'lighting' | 'atmospheric'
  readonly intensity: 'mild' | 'moderate' | 'severe' | 'extreme'
  readonly visualEffects: string[]
  readonly gameplayEffects: string[]
}

export type SequenceTemplate = {
  readonly name: string
  readonly description: string
  readonly complexity: 'simple' | 'moderate' | 'complex'
  readonly maxActions: number
  readonly allowsConditionals: boolean
  readonly allowsLoops: boolean
}

export type UtilityTemplate = {
  readonly name: string
  readonly category: string
  readonly affectsGameState: boolean
  readonly requiresPermission: boolean
}

export type ExecutionRule = {
  readonly type: 'sequential' | 'conditional' | 'loop' | 'branch'
  readonly condition?: string
  readonly parameters: Record<string, unknown>
}

export type ActionParameter = {
  readonly type: 'string' | 'number' | 'boolean' | 'select' | 'multi-select'
  readonly value: unknown
  readonly options?: string[]
  readonly validation?: ValidationRule
}

export type ValidationRule = {
  readonly required: boolean
  readonly min?: number
  readonly max?: number
  readonly pattern?: string
}

export type WeaponProperty =
  | 'light'
  | 'finesse'
  | 'thrown'
  | 'two-handed'
  | 'versatile'
  | 'heavy'
  | 'reach'
  | 'loading'
  | 'ammunition'
  | 'special'

/**
 * Action conversion utilities
 */
export type ActionToEventConversionResult = {
  readonly success: boolean
  readonly eventData: EventData | null
  readonly errors: string[]
  readonly warnings: string[]
}

export type EventToActionConversionResult = {
  readonly success: boolean
  readonly action: UnifiedAction | null
  readonly errors: string[]
  readonly warnings: string[]
}