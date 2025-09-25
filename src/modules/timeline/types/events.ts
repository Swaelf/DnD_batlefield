/**
 * Timeline Event Data Types
 * Specific data structures for each event type
 */

import type { Point } from '@/foundation/types'
import type { TokenId } from '@/foundation/types'

/**
 * Union type for all event data
 */
export type EventData =
  | MoveEventData
  | AttackEventData
  | SpellEventData
  | InteractionEventData
  | EnvironmentalEventData
  | SequenceEventData

/**
 * Movement event data
 */
export type MoveEventData = {
  readonly type: 'move'
  readonly tokenId: TokenId
  readonly startPosition: Point
  readonly endPosition: Point
  readonly path: Point[]
  readonly speed: number // pixels per second
  readonly easing: EasingType
  readonly shouldRotate: boolean
}

/**
 * Attack event data
 */
export type AttackEventData = {
  readonly type: 'attack'
  readonly attackerId: TokenId
  readonly targetId: TokenId | null
  readonly targetPosition: Point | null
  readonly attackType: AttackType
  readonly weapon: WeaponData
  readonly damage: DamageData | null
  readonly criticalHit: boolean
  readonly effects: AttackEffect[]
}

/**
 * Spell event data
 */
export type SpellEventData = {
  readonly type: 'spell'
  readonly casterId: TokenId
  readonly spellId: string
  readonly targetType: SpellTargetType
  readonly targets: SpellTarget[]
  readonly spellLevel: number
  readonly components: SpellComponent[]
  readonly effects: SpellEffect[]
  readonly concentration: boolean
  readonly ritual: boolean
}

/**
 * Interaction event data
 */
export type InteractionEventData = {
  readonly type: 'interaction'
  readonly actorId: TokenId
  readonly targetId: string // Object or area ID
  readonly interactionType: InteractionType
  readonly parameters: Record<string, unknown>
  readonly duration: number
  readonly canFail: boolean
  readonly skillCheck: SkillCheck | null
}

/**
 * Environmental event data
 */
export type EnvironmentalEventData = {
  readonly type: 'environmental'
  readonly effectType: EnvironmentalEffectType
  readonly area: EffectArea
  readonly intensity: number
  readonly duration: number
  readonly weatherType?: WeatherType
  readonly terrainEffect?: TerrainEffect
  readonly lightingChange?: LightingChange
}

/**
 * Sequence event data (compound events)
 */
export type SequenceEventData = {
  readonly type: 'sequence'
  readonly sequenceType: SequenceType
  readonly events: EventData[]
  readonly conditions: ExecutionCondition[]
  readonly parallelExecution: boolean
  readonly stopOnFailure: boolean
}

// Supporting types for event data

export type EasingType = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'bounce'

export type AttackType = 'melee' | 'ranged' | 'spell_attack' | 'area_effect'

export type WeaponData = {
  readonly name: string
  readonly type: string
  readonly damage: DamageData
  readonly range: number
  readonly properties: string[]
}

export type DamageData = {
  readonly amount: number
  readonly type: DamageType
  readonly dice: string // e.g., "1d8+3"
  readonly isCritical: boolean
}

export type DamageType =
  | 'slashing'
  | 'piercing'
  | 'bludgeoning'
  | 'fire'
  | 'cold'
  | 'lightning'
  | 'thunder'
  | 'acid'
  | 'poison'
  | 'psychic'
  | 'necrotic'
  | 'radiant'
  | 'force'

export type AttackEffect = {
  readonly type: string
  readonly duration: number
  readonly parameters: Record<string, unknown>
}

export type SpellTargetType = 'single' | 'multiple' | 'area' | 'self' | 'point'

export type SpellTarget = {
  readonly type: 'token' | 'point' | 'area'
  readonly tokenId?: TokenId
  readonly position?: Point
  readonly area?: EffectArea
}

export type SpellComponent = 'verbal' | 'somatic' | 'material'

export type SpellEffect = {
  readonly type: string
  readonly parameters: Record<string, unknown>
  readonly duration: number
  readonly concentration: boolean
}

export type InteractionType =
  | 'door_open'
  | 'door_close'
  | 'trap_disarm'
  | 'container_open'
  | 'lever_pull'
  | 'button_press'
  | 'custom'

export type SkillCheck = {
  readonly skill: string
  readonly dc: number
  readonly modifier: number
  readonly advantage: boolean
  readonly disadvantage: boolean
}

export type EnvironmentalEffectType = 'weather' | 'terrain' | 'lighting' | 'atmospheric'

export type EffectArea = {
  readonly type: 'circle' | 'rectangle' | 'line' | 'cone'
  readonly center: Point
  readonly radius?: number
  readonly width?: number
  readonly height?: number
  readonly length?: number
  readonly angle?: number
}

export type WeatherType = 'rain' | 'snow' | 'fog' | 'wind' | 'storm' | 'clear'

export type TerrainEffect = {
  readonly type: string
  readonly movementModifier: number
  readonly visualEffect: string
}

export type LightingChange = {
  readonly type: 'brighten' | 'darken' | 'color_change'
  readonly intensity: number
  readonly color?: string
  readonly duration: number
}

export type SequenceType = 'simple' | 'conditional' | 'parallel' | 'loop' | 'branch'

export type ExecutionCondition = {
  readonly type: 'success' | 'failure' | 'damage_dealt' | 'custom'
  readonly parameters: Record<string, unknown>
  readonly continueOnMet: boolean
}