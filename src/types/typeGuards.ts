/**
 * Type Guards for MapMaker
 *
 * Comprehensive type guard utilities for runtime type checking and
 * TypeScript type narrowing. Use these instead of `as any` assertions.
 */

import type { MapObject, Token, Shape, Text } from './index'

// =============================================================================
// MAP OBJECT TYPE GUARDS
// =============================================================================

/**
 * Check if an object is a valid MapObject
 */
export function isMapObject(obj: unknown): obj is MapObject {
  if (typeof obj !== 'object' || obj === null) return false
  const candidate = obj as Record<string, unknown>

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.type === 'string' &&
    ['token', 'shape', 'text', 'tile', 'spell'].includes(candidate.type as string) &&
    typeof candidate.position === 'object' &&
    candidate.position !== null
  )
}

/**
 * Check if a MapObject is a Token
 */
export function isToken(obj: MapObject): obj is Token {
  return obj.type === 'token'
}

/**
 * Check if a MapObject is a Shape
 */
export function isShape(obj: MapObject): obj is Shape {
  return obj.type === 'shape'
}

/**
 * Check if a MapObject is a Text object
 */
export function isText(obj: MapObject): obj is Text {
  return obj.type === 'text'
}

/**
 * Check if a MapObject has spell effect properties
 * Note: This checks for the isSpellEffect boolean property, not the SpellEffect type
 */
export function isSpellEffect(obj: MapObject): obj is MapObject & { isSpellEffect: true } {
  return 'isSpellEffect' in obj && obj.isSpellEffect === true
}

/**
 * Assert that an object is a Token (throws if not)
 */
export function assertToken(obj: MapObject): asserts obj is Token {
  if (!isToken(obj)) {
    throw new Error(`Expected Token, got ${obj.type}`)
  }
}

/**
 * Assert that an object is a Shape (throws if not)
 */
export function assertShape(obj: MapObject): asserts obj is Shape {
  if (!isShape(obj)) {
    throw new Error(`Expected Shape, got ${obj.type}`)
  }
}

// =============================================================================
// PROPERTY EXISTENCE CHECKS
// =============================================================================

/**
 * Check if an object has a specific property with type safety
 */
export function hasProperty<T extends object, K extends string>(
  obj: T,
  key: K
): obj is T & Record<K, unknown> {
  return key in obj
}

/**
 * Check if an object has a string property
 */
export function hasStringProperty<T extends object, K extends string>(
  obj: T,
  key: K
): obj is T & Record<K, string> {
  return key in obj && typeof (obj as Record<string, unknown>)[key] === 'string'
}

/**
 * Check if an object has a number property
 */
export function hasNumberProperty<T extends object, K extends string>(
  obj: T,
  key: K
): obj is T & Record<K, number> {
  return key in obj && typeof (obj as Record<string, unknown>)[key] === 'number'
}

/**
 * Check if an object has a boolean property
 */
export function hasBooleanProperty<T extends object, K extends string>(
  obj: T,
  key: K
): obj is T & Record<K, boolean> {
  return key in obj && typeof (obj as Record<string, unknown>)[key] === 'boolean'
}

/**
 * Check if an object has a string array property
 */
export function hasStringArrayProperty<T extends object, K extends string>(
  obj: T,
  key: K
): obj is T & Record<K, string[]> {
  if (!(key in obj)) return false
  const value = (obj as Record<string, unknown>)[key]
  return Array.isArray(value) && value.every(item => typeof item === 'string')
}

// =============================================================================
// PRIMITIVE TYPE GUARDS
// =============================================================================

/**
 * Check if value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

/**
 * Check if value is a number (not NaN)
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value)
}

/**
 * Check if value is a boolean
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean'
}

/**
 * Check if value is an object (not null or array)
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Check if value is an array
 */
export function isArray<T = unknown>(value: unknown): value is T[] {
  return Array.isArray(value)
}

// =============================================================================
// OPTIONAL PROPERTY HELPERS
// =============================================================================

/**
 * Get a property from an object with type safety
 * Returns undefined if property doesn't exist or is wrong type
 */
export function getStringProperty<T extends object>(
  obj: T,
  key: keyof T
): string | undefined {
  const value = obj[key]
  return isString(value) ? value : undefined
}

/**
 * Get a number property with type safety
 */
export function getNumberProperty<T extends object>(
  obj: T,
  key: keyof T
): number | undefined {
  const value = obj[key]
  return isNumber(value) ? value : undefined
}

/**
 * Get a boolean property with type safety
 */
export function getBooleanProperty<T extends object>(
  obj: T,
  key: keyof T
): boolean | undefined {
  const value = obj[key]
  return isBoolean(value) ? value : undefined
}

// =============================================================================
// TOKEN-SPECIFIC HELPERS
// =============================================================================

/**
 * Check if a MapObject has a name property (tokens, some shapes)
 */
export function hasName(obj: MapObject): obj is MapObject & { name: string } {
  return hasStringProperty(obj, 'name')
}

/**
 * Check if a MapObject has statusEffects (tokens)
 */
export function hasStatusEffects(
  obj: MapObject
): obj is MapObject & { statusEffects: unknown[] } {
  return 'statusEffects' in obj && isArray(obj.statusEffects)
}

/**
 * Check if a MapObject has allowedEvents (tokens)
 */
export function hasAllowedEvents(
  obj: MapObject
): obj is MapObject & { allowedEvents: string[] } {
  return 'allowedEvents' in obj && isArray(obj.allowedEvents)
}

/**
 * Get token name safely
 */
export function getTokenName(obj: MapObject): string {
  if (isToken(obj)) {
    return obj.name || obj.id
  }
  if (hasName(obj)) {
    return obj.name
  }
  return obj.id
}

// =============================================================================
// SPELL EFFECT HELPERS
// =============================================================================

/**
 * Check if a spell effect is persistent
 */
export function isPersistentSpell(obj: MapObject): boolean {
  if (!isSpellEffect(obj)) return false

  const spellObj = obj as MapObject & {
    spellDuration?: number
    persistDuration?: number
    persistent?: boolean
    isStatic?: boolean
  }

  return Boolean(
    spellObj.spellDuration ||
    spellObj.persistDuration ||
    spellObj.persistent ||
    spellObj.isStatic
  )
}

/**
 * Get spell duration safely
 */
export function getSpellDuration(obj: MapObject): number | undefined {
  if (!isSpellEffect(obj)) return undefined

  const spellObj = obj as MapObject & {
    spellDuration?: number
    persistDuration?: number
    duration?: number
  }

  return (
    spellObj.spellDuration ||
    spellObj.persistDuration ||
    spellObj.duration ||
    undefined
  )
}

// =============================================================================
// STATIC OBJECT HELPERS
// =============================================================================

/**
 * Check if an object has metadata
 */
export function hasObjectMetadata<T extends object>(
  obj: T
): obj is T & { metadata: Record<string, unknown> } {
  return 'metadata' in obj && typeof (obj as { metadata: unknown }).metadata === 'object' && (obj as { metadata: unknown }).metadata !== null
}

/**
 * Check if a MapObject is a static object
 */
export function isStaticObject(obj: MapObject): obj is Shape & { metadata: { isStatic: true } } {
  return (
    obj.type === 'shape' &&
    hasObjectMetadata(obj) &&
    'isStatic' in obj.metadata &&
    obj.metadata.isStatic === true
  )
}

/**
 * Check if a MapObject is a static effect
 */
export function isStaticEffectObject(obj: MapObject): obj is Shape & { metadata: { isStaticEffect: true } } {
  return (
    obj.type === 'shape' &&
    hasObjectMetadata(obj) &&
    'isStaticEffect' in obj.metadata &&
    obj.metadata.isStaticEffect === true
  )
}

// =============================================================================
// KONVA NODE HELPERS
// =============================================================================

/**
 * Check if a value looks like a Konva node
 */
export function isKonvaNode(value: unknown): value is { attrs: Record<string, unknown> } {
  return (
    isObject(value) &&
    'attrs' in value &&
    isObject(value.attrs)
  )
}

/**
 * Get object ID from Konva node attributes
 */
export function getKonvaObjectId(node: unknown): string | undefined {
  if (!isKonvaNode(node)) return undefined
  const attrs = node.attrs
  return isString(attrs.id) ? attrs.id : undefined
}
