/**
 * Action Type Guards and Helpers
 *
 * Type-safe utilities for working with timeline actions and event data.
 * Use these instead of `as any` when accessing action-specific properties.
 */

import type {
  TimelineAction,
  EventData,
  EventType,
  MoveEventData,
  AppearEventData,
  DisappearEventData,
  SpellEventData,
  AttackEventData,
  InteractionEventData,
  EnvironmentalEventData,
  SequenceEventData
} from './timeline'

// =============================================================================
// EVENT DATA TYPE GUARDS
// =============================================================================

/**
 * Check if event data is for a move action
 */
export function isMoveEventData(data: EventData): data is MoveEventData {
  return data.type === 'move'
}

/**
 * Check if event data is for an appear action
 */
export function isAppearEventData(data: EventData): data is AppearEventData {
  return data.type === 'appear'
}

/**
 * Check if event data is for a disappear action
 */
export function isDisappearEventData(data: EventData): data is DisappearEventData {
  return data.type === 'disappear'
}

/**
 * Check if event data is for a spell action
 */
export function isSpellEventData(data: EventData): data is SpellEventData {
  return data.type === 'spell'
}

/**
 * Check if event data is for an attack action
 */
export function isAttackEventData(data: EventData): data is AttackEventData {
  return data.type === 'attack'
}

/**
 * Check if event data is for an interaction action
 */
export function isInteractionEventData(data: EventData): data is InteractionEventData {
  return data.type === 'interaction'
}

/**
 * Check if event data is for an environmental action
 */
export function isEnvironmentalEventData(data: EventData): data is EnvironmentalEventData {
  return data.type === 'environmental'
}

/**
 * Check if event data is for a sequence action
 */
export function isSequenceEventData(data: EventData): data is SequenceEventData {
  return data.type === 'sequence'
}

// =============================================================================
// TIMELINE ACTION TYPE GUARDS
// =============================================================================

/**
 * Check if action is a move action
 */
export function isMoveAction(action: TimelineAction): action is TimelineAction & { data: MoveEventData } {
  return action.type === 'move' && isMoveEventData(action.data)
}

/**
 * Check if action is a spell action
 */
export function isSpellAction(action: TimelineAction): action is TimelineAction & { data: SpellEventData } {
  return action.type === 'spell' && isSpellEventData(action.data)
}

/**
 * Check if action is an attack action
 */
export function isAttackAction(action: TimelineAction): action is TimelineAction & { data: AttackEventData } {
  return action.type === 'attack' && isAttackEventData(action.data)
}

/**
 * Check if action is an interaction action
 */
export function isInteractionAction(action: TimelineAction): action is TimelineAction & { data: InteractionEventData } {
  return action.type === 'interaction' && isInteractionEventData(action.data)
}

// =============================================================================
// ASSERTION HELPERS
// =============================================================================

/**
 * Assert that event data is spell data (throws if not)
 */
export function assertSpellEventData(data: EventData): asserts data is SpellEventData {
  if (!isSpellEventData(data)) {
    throw new Error(`Expected SpellEventData, got ${data.type}`)
  }
}

/**
 * Assert that event data is attack data (throws if not)
 */
export function assertAttackEventData(data: EventData): asserts data is AttackEventData {
  if (!isAttackEventData(data)) {
    throw new Error(`Expected AttackEventData, got ${data.type}`)
  }
}

/**
 * Assert that event data is move data (throws if not)
 */
export function assertMoveEventData(data: EventData): asserts data is MoveEventData {
  if (!isMoveEventData(data)) {
    throw new Error(`Expected MoveEventData, got ${data.type}`)
  }
}

// =============================================================================
// PROPERTY ACCESSORS (Type-safe getters)
// =============================================================================

/**
 * Get spell name from action data (returns undefined if not a spell)
 */
export function getSpellName(action: TimelineAction): string | undefined {
  if (isSpellAction(action)) {
    return action.data.spellName
  }
  return undefined
}

/**
 * Get weapon type from action data (returns undefined if not an attack)
 */
export function getWeaponType(action: TimelineAction): string | undefined {
  if (isAttackAction(action)) {
    return action.data.weaponType
  }
  return undefined
}

/**
 * Get move duration from action data (returns undefined if not a move)
 */
export function getMoveDuration(action: TimelineAction): number | undefined {
  if (isMoveAction(action)) {
    return action.data.duration
  }
  return undefined
}

/**
 * Get interaction type from action data (returns undefined if not an interaction)
 */
export function getInteractionType(action: TimelineAction): string | undefined {
  if (isInteractionAction(action)) {
    return action.data.interactionType
  }
  return undefined
}

// =============================================================================
// SPELL-SPECIFIC HELPERS
// =============================================================================

/**
 * Check if spell has persistence
 */
export function hasSpellPersistence(data: SpellEventData): boolean {
  return Boolean(
    data.persistDuration !== undefined &&
    data.persistDuration > 0
  )
}

/**
 * Get spell persistence duration safely
 */
export function getSpellPersistDuration(data: SpellEventData): number | undefined {
  return data.persistDuration
}

/**
 * Get spell duration type safely
 */
export function getSpellDurationType(data: SpellEventData): 'rounds' | 'events' | undefined {
  return data.durationType
}

/**
 * Check if spell targets a position
 */
export function hasSpellTargetPosition(data: SpellEventData): data is SpellEventData & { toPosition: { x: number; y: number } } {
  return data.toPosition !== undefined
}

/**
 * Check if spell has source position
 */
export function hasSpellSourcePosition(data: SpellEventData): data is SpellEventData & { fromPosition: { x: number; y: number } } {
  return data.fromPosition !== undefined
}

// =============================================================================
// ATTACK-SPECIFIC HELPERS
// =============================================================================

/**
 * Check if attack is a critical hit
 */
export function isAttackCritical(data: AttackEventData): boolean {
  return data.isCritical === true
}

/**
 * Get attack damage safely
 */
export function getAttackDamage(data: AttackEventData): string | undefined {
  return data.damage
}

/**
 * Get attack range safely
 */
export function getAttackRange(data: AttackEventData): number | undefined {
  return data.range
}

// =============================================================================
// MOVE-SPECIFIC HELPERS
// =============================================================================

/**
 * Check if move has waypoints
 */
export function hasMoveWaypoints(data: MoveEventData): data is MoveEventData & { path: Array<{ x: number; y: number }> } {
  return data.path !== undefined && data.path.length > 0
}

/**
 * Get move path safely (falls back to straight line)
 */
export function getMovePath(data: MoveEventData): Array<{ x: number; y: number }> {
  if (hasMoveWaypoints(data)) {
    return data.path
  }
  return [data.fromPosition, data.toPosition]
}

// =============================================================================
// ACTION TYPE CONVERSION
// =============================================================================

/**
 * Convert action type to friendly name
 */
export function getActionTypeName(type: EventType): string {
  const names: Record<EventType, string> = {
    move: 'Move',
    appear: 'Appear',
    disappear: 'Disappear',
    spell: 'Spell',
    attack: 'Attack',
    interaction: 'Interaction',
    environmental: 'Environmental',
    sequence: 'Sequence'
  }
  return names[type] || type
}

/**
 * Get action description for display
 */
export function getActionDescription(action: TimelineAction): string {
  switch (action.type) {
    case 'move':
      return `Move to position`
    case 'spell':
      if (isSpellAction(action)) {
        return `Cast ${action.data.spellName}`
      }
      return 'Cast spell'
    case 'attack':
      if (isAttackAction(action)) {
        return `Attack with ${action.data.weaponType || 'weapon'}`
      }
      return 'Attack'
    case 'interaction':
      if (isInteractionAction(action)) {
        return `${action.data.interactionType} interaction`
      }
      return 'Interact'
    case 'appear':
      return 'Appear'
    case 'disappear':
      return 'Disappear'
    case 'environmental':
      return 'Environmental effect'
    case 'sequence':
      return 'Complex sequence'
    default:
      return 'Unknown action'
  }
}
