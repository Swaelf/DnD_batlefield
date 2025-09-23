import type { Point } from './geometry'

// Core unified action type
export type UnifiedAction = {
  id: string
  type: 'spell' | 'attack' | 'interaction' | 'move'
  category: string // subcategory for each type (e.g., 'projectile', 'melee', 'door')
  source: Point | string // position or tokenId
  target: Point | string[] // position or array of affected tokenIds
  animation: AnimationConfig
  effects: ActionEffects
  metadata: ActionMetadata
  timestamp: number
  duration: number // Total action duration in ms
}

// Animation configuration
export type AnimationConfig = {
  type: 'projectile' | 'projectile_burst' | 'melee_swing' | 'melee_slash' | 'ray' | 'area' | 'burst' | 'interaction' | 'line' | 'cone' | 'touch' | 'pillar'
  duration: number
  color: string
  size?: number
  customParams?: Record<string, any>
  startDelay?: number
  easing?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut'

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
  rolls: number[]
  modifier: number
  total: number
  criticalHit?: boolean
  criticalFail?: boolean
  advantage?: boolean
  disadvantage?: boolean
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