import type { Point } from './geometry'

// Core unified action type
export type UnifiedAction = {
  id: string
  name: string // Action display name
  description: string // Action description
  type: 'spell' | 'attack' | 'interaction' | 'move'
  category: string // subcategory for each type (e.g., 'projectile', 'melee', 'door')
  source: Point | string // position or tokenId
  target: Point | string[] // position or array of affected tokenIds
  animation: AnimationConfig
  effects: ActionEffects
  metadata: ActionMetadata
  timestamp: number
  duration: number // Total action duration in ms
  tags: string[] // Action tags for filtering
  templateId?: string // Template identifier for built-in actions
  isCustom?: boolean // Whether this is a custom user action
  customizable?: boolean // Whether this action can be customized
  range?: number // range in feet for D&D spells/attacks
  areaOfEffect?: AreaShape | number // area of effect for spells/abilities (number = radius, AreaShape = complex area)
  damage?: string // damage dice notation (e.g., "2d6+3")
  damageType?: string // type of damage (fire, cold, piercing, etc.)
  spellLevel?: number // D&D spell level (0-9)
  castingTime?: string // D&D casting time (e.g., "1 action", "1 bonus action")
}

// Animation configuration
export type AnimationConfig = {
  type: 'projectile' | 'projectile_burst' | 'melee_swing' | 'melee_slash' | 'ray' | 'area' | 'burst' | 'interaction' | 'line' | 'cone' | 'touch' | 'pillar'
  duration: number
  color: string
  size?: number
  customParams?: Record<string, any>
  startDelay?: number
  easing?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'ease-in' | 'ease-out' | 'ease-in-out'

  // Projectile properties
  speed?: number
  trail?: boolean
  trailLength?: number
  trailFade?: number
  curved?: boolean
  curveHeight?: number
  curveDirection?: 'up' | 'down' | 'auto'
  trackTarget?: boolean
  targetTokenId?: string

  // Projectile-burst specific properties
  burstSize?: number
  burstDuration?: number
  burstColor?: string
  persistDuration?: number
  persistColor?: string
  persistOpacity?: number
  projectilePhase?: number
  explosionPhase?: number
  lingerPhase?: number

  // Other effect properties
  particles?: boolean
  glow?: boolean
  radiance?: boolean
  sparks?: boolean
  persistent?: boolean

  // Additional animation properties
  arc?: number // arc radius for curved attacks
  spin?: boolean // spinning animation for weapons
  impact?: boolean // impact effect on hit
  multiple?: number | boolean // multiple target support (number = count, boolean = enabled)
  pulse?: boolean // pulsing animation effect
  scan?: boolean // scanning animation for detection
  precision?: boolean // precision targeting animation
  sweep?: boolean // sweeping area animation
  motion?: string | boolean // specific motion type for complex animations (string = type, boolean = enabled)
  quick?: boolean // quick animation for fast actions
  swirl?: boolean // swirling animation effect
  instant?: boolean // instant animation (no duration)
  curveRandomSeed?: number // seed for randomizing curve animations
  opacity?: number // animation opacity (0-1)
  vertical?: boolean // vertical movement animation
  fluid?: boolean // fluid motion animation
  elevation?: number | boolean // elevation for flying/jumping animations (number = height, boolean = enabled)
  cautious?: boolean // cautious movement animation
  defensive?: boolean // defensive positioning animation
  secondaryColor?: string // secondary color for complex animations
  burstCount?: number // number of burst effects for multi-burst animations
  burstInterval?: number // interval between bursts in milliseconds
}

// Action effects and targeting
export type ActionEffects = {
  affectedTargets: string[] // token IDs
  areaOfEffect?: AreaShape // for area effects
  highlightColor?: string
  highlightDuration?: number
  persistDuration?: number // for persistent effects
  damageType?: string // for damage visualization
}

// Action metadata
export type ActionMetadata = {
  name: string
  description?: string
  rollResult?: RollResult
  actionResult?: 'hit' | 'miss' | 'critical' | 'save' | 'fail'
  damage?: number
  conditions?: string[] // applied conditions
  sourceName?: string
  targetNames?: string[]
}

// Area shape definitions for area effects
export type AreaShape = CircularArea | SquareArea | ConeArea | LineArea

export type CircularArea = {
  type: 'circle'
  center: Point
  radius: number
}

export type SquareArea = {
  type: 'square'
  center: Point
  size: number
}

export type ConeArea = {
  type: 'cone'
  origin: Point
  direction: number // angle in degrees
  angle: number // cone angle in degrees
  range: number
}

export type LineArea = {
  type: 'line'
  start: Point
  end: Point
  width: number
}

// Roll result for D&D mechanics
export type RollResult = {
  rolls?: number[]
  modifier?: number
  total?: number
  criticalHit?: boolean
  criticalFail?: boolean
  advantage?: boolean
  disadvantage?: boolean
  skill?: string // skill check type (e.g., 'investigation', 'perception', 'stealth')
  dc?: number // difficulty class for skill checks
  success?: boolean // whether the roll was successful
}

// Action template for pre-configured actions
export type ActionTemplate = {
  id: string
  name: string
  category: 'spell' | 'attack' | 'interaction' | 'movement'
  description: string
  icon?: string
  defaultAction: Partial<UnifiedAction>
  requiredFields: (keyof UnifiedAction)[]
  optionalFields?: (keyof UnifiedAction)[]
}

// Action history entry for logging
export type ActionHistoryEntry = UnifiedAction & {
  executedAt: number
  completedAt?: number
  status: 'pending' | 'executing' | 'completed' | 'failed'
  error?: string
}

// Action filter for log/history
export type ActionFilter = {
  types?: UnifiedAction['type'][]
  categories?: string[]
  status?: 'pending' | 'executing' | 'completed' | 'failed'
  source?: string[]
  target?: string[]
  timeRange?: {
    start: number
    end: number
  }
  searchText?: string
}

// Additional types for actions module
export type ActionCategory = 'spell' | 'attack' | 'interaction' | 'movement' | 'environmental' | 'utility' | 'sequence'
export type ActionSortBy = 'name' | 'type' | 'category' | 'level' | 'recent'
export type ActionType = 'spell' | 'attack' | 'interaction' | 'move' | 'environmental' | 'utility' | 'sequence'

export type ActionCategoryInfo = {
  readonly id: ActionCategory
  readonly name: string
  readonly description: string
  readonly icon: string
  readonly color: string
  readonly count: number
}

export type ActionSearchCriteria = {
  readonly query?: string
  readonly type?: ActionType
  readonly category?: ActionCategory
  readonly tags?: string[]
  readonly includeCustom?: boolean
  readonly minLevel?: number
  readonly maxLevel?: number
}