import type Konva from 'konva'
import type { Position } from './map'

// Timeline and event management types
export type Timeline = {
  id: string
  mapId: string
  events: Event[]
  currentEvent: number
  isActive: boolean
  history: Event[] // Completed events
}

export type Event = {
  id: string
  number: number
  name?: string // Optional name like "Ambush!" or "Dragon arrives"
  timestamp: number
  actions: TimelineAction[]
  executed: boolean
  snapshot?: MapSnapshot // State snapshot before execution for undo
}

// Snapshot of map state for undo functionality
export type MapSnapshot = {
  tokenPositions: Record<string, Position> // tokenId -> position
  spellEffects: string[] // IDs of active spell effects
}

// Event types
export type EventType = 'move' | 'appear' | 'disappear' | 'spell' | 'attack' | 'interaction' | 'environmental' | 'sequence'

// Spell categories for different animation types
export type SpellCategory =
  | 'projectile-burst'  // Projectile that explodes on impact
  | 'projectile'        // Simple projectile without burst
  | 'ray'              // Instant beam effect
  | 'area'             // Area effect that appears at location
  | 'burst'            // Explosion at target location
  | 'cone'            // Cone area

export type TimelineAction = {
  id: string
  eventNumber: number
  tokenId: string
  type: EventType
  data: EventData
  executed: boolean
  order?: number // For ordering actions within an event
}

// Event data types
export type EventData = MoveEventData | AppearEventData | DisappearEventData | SpellEventData | AttackEventData | InteractionEventData | EnvironmentalEventData | SequenceEventData

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
  id?: string               // Unique identifier for this spell instance
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

  // Enhanced animation properties for projectile_burst and other complex spells
  trailLength?: number      // Number of trail segments
  trailFade?: number        // Trail opacity decay rate
  burstDuration?: number    // Duration of burst explosion phase
  burstColor?: string       // Color for burst explosion
  persistColor?: string     // Color for lingering effects
  persistOpacity?: number   // Opacity of lingering effects

  // Curved projectile path properties
  curved?: boolean          // Enable curved projectile path
  curveHeight?: number      // Height of the curve in pixels
  curveDirection?: 'up' | 'down' | 'auto'  // Direction of curve
  curveRandomSeed?: number  // Random seed (0-1) for varying curves per dart

  // Target tracking properties
  targetTokenId?: string    // Token ID to track and follow
  trackTarget?: boolean     // Enable dynamic target tracking
}

// Attack event data for weapon attacks
export type AttackEventData = {
  type: 'attack'
  weaponName: string
  attackType: 'melee' | 'ranged' | 'natural' | 'spell' | 'unarmed'
  fromPosition: Position      // Attacker position
  toPosition: Position        // Target position
  damage: string             // Damage dice (e.g., "1d8", "2d6+3")
  damageType: string         // Damage type (slashing, piercing, etc.)
  attackBonus: number        // Attack roll bonus
  range?: number            // Attack range in feet
  duration: number          // Animation duration in ms
  animation: string         // Animation type (slash, thrust, projectile, etc.)
  color: string             // Attack effect color
  isCritical?: boolean      // Critical hit indicator
  hit?: boolean            // Attack hit/miss (determined after roll)
  actualDamage?: number    // Actual damage dealt (after roll)
  properties?: string[]     // Weapon properties (finesse, reach, etc.)
  weaponType?: string      // Specific weapon (longsword, shortbow, etc.)
}

// Object interaction event data for doors, traps, levers, containers, etc.
export type InteractionEventData = {
  type: 'interaction'
  interactionType: 'door' | 'trap' | 'lever' | 'chest' | 'switch' | 'button' | 'portal' | 'shrine'
  objectId?: string           // Target object ID (if interacting with existing object)
  position: Position          // Interaction position
  action: 'open' | 'close' | 'lock' | 'unlock' | 'activate' | 'deactivate' | 'trigger' | 'disarm' | 'search' | 'use'
  actor: string              // Token performing the interaction
  skill?: string             // Required skill (lockpicking, investigation, etc.)
  dc?: number               // Difficulty class for skill check
  success?: boolean         // Whether the interaction succeeded
  duration: number          // Animation duration in ms
  effect?: string           // Visual effect (glow, sparks, etc.)
  sound?: string            // Sound effect to play
  result?: string           // Result description for DM
  stateChange?: {           // Object state changes
    before: string
    after: string
  }
  consequences?: {          // Additional effects
    damage?: string         // Damage from traps
    healing?: string        // Healing from shrines
    unlock?: string         // What gets unlocked
    activate?: string       // What gets activated
  }
}

// Environmental effect event data for weather, terrain, lighting, hazards
export type EnvironmentalEventData = {
  type: 'environmental'
  environmentalType: 'weather' | 'terrain' | 'lighting' | 'hazard' | 'atmosphere'
  effectName: string          // Name of the environmental effect
  category: string            // Specific category (rain, fog, lava, etc.)
  intensity: 'subtle' | 'moderate' | 'strong' | 'overwhelming'
  area: 'point' | 'small' | 'medium' | 'large' | 'huge' | 'map_wide'
  position?: Position         // Center position for localized effects
  radius?: number            // Effect radius in pixels
  color: string              // Primary effect color
  opacity: number            // Effect opacity (0-1)
  duration: number           // Effect duration in rounds (0 = permanent)
  particleCount?: number     // Number of particles for weather effects
  animationSpeed?: number    // Animation speed multiplier
  effects?: {                // Gameplay effects
    visibility?: string      // Visibility changes
    movement?: string        // Movement speed modifications
    damage?: string          // Environmental damage
    disadvantage?: string[]  // Types of disadvantage imposed
    advantage?: string[]     // Types of advantage granted
    conditions?: string[]    // Status conditions applied
    saves?: {               // Required saving throws
      ability: string       // Ability to save with
      dc: number           // Difficulty class
      frequency: string    // How often to save
    }
  }
  description: string        // Effect description for DM
}

// Action sequence event data for complex multi-step actions
export type SequenceEventData = {
  type: 'sequence'
  sequenceName: string        // Name of the action sequence
  sequenceType: 'simple' | 'conditional' | 'parallel' | 'loop' | 'branch'
  templateId?: string         // ID of sequence template if using preset
  actions: SequenceAction[]   // Ordered list of actions in sequence
  conditions?: SequenceCondition[] // Global conditions for sequence execution
  priority: number           // Execution priority (0-100)
  duration?: number          // Animation duration in ms
  maxDuration?: number       // Maximum sequence duration in ms
  onSuccess?: SequenceAction[] // Actions to execute on sequence success
  onFailure?: SequenceAction[] // Actions to execute on sequence failure
  description: string        // Sequence description for DM
}

// Individual action within a sequence
export type SequenceAction = {
  id: string                 // Unique action identifier
  type: Exclude<EventType, 'sequence'> // Action type (can't be another sequence)
  timing: 'immediate' | 'delayed' | 'trigger' | 'manual' | 'round_start' | 'round_end'
  delay?: number            // Delay in milliseconds (for delayed timing)
  priority: number          // Action priority within sequence
  conditions?: SequenceCondition[] // Conditions for action execution
  dependencies?: string[]   // IDs of actions that must complete first
  data: Exclude<EventData, SequenceEventData> // Action-specific data
  modifiers?: SequenceModifiers // Modifiers to apply to base action
  retryCount?: number       // Number of retries on failure
  optional?: boolean        // Whether action failure fails entire sequence
}

// Condition for sequence/action execution
export type SequenceCondition = {
  type: 'success' | 'failure' | 'critical' | 'fumble' | 'hp_below' | 'hp_above' | 'distance' | 'round_number' | 'turn_count' | 'custom'
  targetActionId?: string   // ID of action to check condition against
  value?: number           // Threshold value for numeric conditions
  operator?: '>' | '<' | '=' | '>=' | '<=' | '!=' // Comparison operator
  customFunction?: string  // JavaScript function for custom conditions
}

// Modifiers that can be applied to actions in sequences
export type SequenceModifiers = {
  damageBonus?: string     // Additional damage (e.g., "+1d6")
  damagePenalty?: string   // Damage reduction (e.g., "-2")
  attackBonus?: number     // Attack roll bonus
  attackPenalty?: number   // Attack roll penalty
  acBonus?: number        // Armor class bonus
  acPenalty?: number      // Armor class penalty
  speedBonus?: number     // Movement speed bonus
  speedPenalty?: number   // Movement speed penalty
  advantage?: boolean     // Grant advantage on rolls
  disadvantage?: boolean  // Grant disadvantage on rolls
  immunity?: string[]     // Damage type immunities
  resistance?: string[]   // Damage type resistances
  vulnerability?: string[] // Damage type vulnerabilities
  customModifiers?: Record<string, any> // Custom modifiers
}

// Sequence execution result
export type SequenceResult = {
  sequenceId: string
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled' | 'skipped'
  currentActionIndex: number
  actionResults: ActionResult[]
  startTime: number
  endTime?: number
  errors?: string[]
}

// Individual action execution result
export type ActionResult = {
  actionId: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
  success?: boolean
  critical?: boolean
  fumble?: boolean
  damage?: number
  healing?: number
  effectsApplied?: string[]
  startTime: number
  endTime?: number
  error?: string
}

// Animation state
export type AnimationState = {
  isAnimating: boolean
  currentAnimations: Map<string, Konva.Animation> // tokenId -> Konva.Animation
  queue: TimelineAction[]
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

export function isAttackEvent(data: EventData): data is AttackEventData {
  return data.type === 'attack'
}

export function isInteractionEvent(data: EventData): data is InteractionEventData {
  return data.type === 'interaction'
}

export function isEnvironmentalEvent(data: EventData): data is EnvironmentalEventData {
  return data.type === 'environmental'
}

export function isSequenceEvent(data: EventData): data is SequenceEventData {
  return data.type === 'sequence'
}