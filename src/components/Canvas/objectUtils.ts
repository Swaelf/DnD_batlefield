/**
 * ObjectsLayer Utility Functions
 * Type guards and helper functions for object rendering
 */

import type { MapObject, Shape, Text } from '@/types/map'
import type { Token } from '@/types/token'
import type { SpellEventData, AttackEventData } from '@/types/timeline'

/**
 * Type guard to check if an object is a token
 */
export function isToken(obj: MapObject): obj is Token {
  return obj.type === 'token'
}

/**
 * Type guard to check if an object is a shape
 */
export function isShape(obj: MapObject): obj is Shape {
  return obj.type === 'shape'
}

/**
 * Type guard to check if an object is text
 */
export function isText(obj: MapObject): obj is Text {
  return obj.type === 'text'
}

/**
 * Type guard to check if an object is a spell
 */
export function isSpell(obj: MapObject): obj is MapObject & { type: 'spell'; spellData?: SpellEventData } {
  return obj.type === 'spell'
}

/**
 * Type guard to check if an object is an attack
 */
export function isAttack(obj: MapObject): obj is MapObject & { type: 'attack'; attackData?: AttackEventData } {
  return obj.type === 'attack'
}

/**
 * Type guard to check if an object is a persistent area
 */
export function isPersistentArea(obj: MapObject): obj is MapObject & { type: 'persistent-area'; persistentAreaData?: unknown } {
  return obj.type === 'persistent-area'
}
