import Konva from 'konva'
import { Position } from './map'

// Timeline and round management types
export type Timeline = {
  id: string
  mapId: string
  rounds: Round[]
  currentRound: number
  isActive: boolean
  history: Round[] // Completed rounds
}

export type Round = {
  id: string
  number: number
  name?: string // Optional name like "Ambush!" or "Dragon arrives"
  timestamp: number
  events: RoundEvent[]
  executed: boolean
}

// Event types
export type EventType = 'move' | 'appear' | 'disappear' | 'spell'

// Spell categories for different animation types
export type SpellCategory =
  | 'projectile-burst'  // Projectile that explodes on impact
  | 'projectile'        // Simple projectile without burst
  | 'ray'              // Instant beam effect
  | 'area'             // Area effect that appears at location
  | 'burst'            // Explosion at target location

export type RoundEvent = {
  id: string
  roundNumber: number
  tokenId: string
  type: EventType
  data: EventData
  executed: boolean
  order?: number // For ordering events within a round
}

// Event data types
export type EventData = MoveEventData | AppearEventData | DisappearEventData | SpellEventData

export type MoveEventData = {
  type: 'move'
  fromPosition: Position
  toPosition: Position
  path?: Position[] // Optional waypoints for curved/complex paths
  duration?: number // Animation duration in ms
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out'
}

export type AppearEventData = {
  type: 'appear'
  position: Position
  fadeIn?: boolean
  duration?: number
}

export type DisappearEventData = {
  type: 'disappear'
  fadeOut?: boolean
  duration?: number
}

export type SpellEventData = {
  type: 'spell'
  spellName: string
  category: SpellCategory
  fromPosition: Position      // Caster position (or void token position)
  toPosition: Position        // Target position
  color: string              // Primary spell color
  secondaryColor?: string    // Optional secondary color
  size: number              // Effect size/radius in pixels (for area/burst effects)
  range?: number            // Spell range in feet (for projectile/ray spells)
  duration: number          // Animation duration in ms
  projectileSpeed?: number  // Pixels per second for projectiles
  burstRadius?: number      // Burst effect radius in pixels
  persistDuration?: number  // Rounds for area effects
  particleEffect?: boolean  // Enable particle effects
}

// Animation state
export type AnimationState = {
  isAnimating: boolean
  currentAnimations: Map<string, Konva.Animation> // tokenId -> Konva.Animation
  queue: RoundEvent[]
}

// Helper type guards
export function isMoveEvent(data: EventData): data is MoveEventData {
  return data.type === 'move'
}

export function isAppearEvent(data: EventData): data is AppearEventData {
  return data.type === 'appear'
}

export function isDisappearEvent(data: EventData): data is DisappearEventData {
  return data.type === 'disappear'
}

export function isSpellEvent(data: EventData): data is SpellEventData {
  return data.type === 'spell'
}