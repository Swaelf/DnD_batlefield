/**
 * Animation Library to UnifiedAction Adapter
 *
 * Converts animation library classes to UnifiedAction format for use in timeline and UI.
 * This adapter provides a single source of truth by using the animation library
 * as the canonical data source for all animation parameters.
 */

import { nanoid } from 'nanoid'
import { AnimationRegistry, type RegisteredAnimationName } from '../registry/AnimationRegistry'
import type { Point } from '../types'
import type { UnifiedAction, AnimationConfig } from '@/types/unifiedAction'

/**
 * Convert animation library class to UnifiedAction format
 *
 * @param animationName - Name of registered animation
 * @param source - Source position or token ID
 * @param target - Target position or token IDs
 * @returns UnifiedAction ready for timeline integration
 */
export function animationToUnifiedAction(
  animationName: RegisteredAnimationName,
  source: Point | string,
  target: Point | string[]
): UnifiedAction {
  const template = AnimationRegistry.getTemplate(animationName)
  if (!template) {
    throw new Error(`Animation "${animationName}" not found in registry`)
  }

  // Determine if source/target are positions or IDs
  const sourcePos = typeof source === 'string' ? { x: 0, y: 0 } : source
  const targetPos = Array.isArray(target) ? { x: 0, y: 0 } : target

  // Create animation instance to get actual parameters
  const animationInstance = template.factory({
    fromPosition: sourcePos,
    toPosition: targetPos,
    position: sourcePos, // For status effects
    target: targetPos
  })

  // Map category to UnifiedAction type
  const actionType = mapCategoryToActionType(template.category)

  // Build animation config
  const animationConfig = buildAnimationConfig(template, animationInstance)

  // Build effects
  const effects = {
    affectedTargets: Array.isArray(target) ? target : [],
    highlightColor: template.defaults.color || '#FFFFFF'
  }

  // Build metadata from animation instance
  const metadata = buildMetadata(animationInstance)

  // For attacks, use weaponType from instance metadata as category (arrow, bolt, thrown, sword, etc.)
  // For other animations, use template category
  const categoryValue = template.category === 'attack' && animationInstance.weaponType
    ? animationInstance.weaponType
    : template.category

  return {
    id: nanoid(),
    name: template.name,
    description: template.description || `${template.name} animation`,
    type: actionType,
    category: categoryValue,  // Use weaponType for attacks, template.category for others
    tags: [actionType, categoryValue],
    source,
    target,
    animation: animationConfig,
    effects,
    metadata: {
      name: template.name,
      description: template.description,
      ...metadata
    },
    timestamp: Date.now(),
    duration: template.defaults.duration || 1000,
    templateId: animationName,
    isCustom: false,
    customizable: true,
    // Add D&D-specific properties from metadata
    range: extractRange(animationInstance, metadata),
    damage: metadata.damage as string | undefined,
    damageType: metadata.damageType as string | undefined,
    spellLevel: metadata.spellLevel as number | undefined
  }
}

/**
 * Get all animations for a specific category
 */
export function getAnimationsByCategory(category: string): RegisteredAnimationName[] {
  return AnimationRegistry.getAllTemplates()
    .filter(t => t.category === category)
    .map(t => t.name as RegisteredAnimationName)
}

/**
 * Get all animations grouped by type
 */
export function getAnimationsByType(): Record<string, RegisteredAnimationName[]> {
  const templates = AnimationRegistry.getAllTemplates()
  const grouped: Record<string, RegisteredAnimationName[]> = {
    spell: [],
    attack: [],
    move: [],
    status: []
  }

  templates.forEach(template => {
    const type = mapCategoryToActionType(template.category)
    grouped[type].push(template.name as RegisteredAnimationName)
  })

  return grouped
}

/**
 * Get animation template info (for UI display)
 */
export function getAnimationInfo(animationName: RegisteredAnimationName) {
  const template = AnimationRegistry.getTemplate(animationName)
  if (!template) return null

  return {
    name: template.name,
    description: template.description,
    category: template.category,
    color: template.defaults.color,
    duration: template.defaults.duration,
    size: template.defaults.size
  }
}

/**
 * Search animations by name or description
 */
export function searchAnimations(query: string): RegisteredAnimationName[] {
  return AnimationRegistry.search(query)
    .map(t => t.name as RegisteredAnimationName)
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Map animation category to UnifiedAction type
 */
function mapCategoryToActionType(category: string): UnifiedAction['type'] {
  switch (category) {
    // Spell categories
    case 'projectile':
    case 'burst':
    case 'area':
    case 'ray':
    case 'cone':
      return 'spell'

    // Attack category
    case 'attack':
      return 'attack'

    // Movement category
    case 'movement':
      return 'move'

    // Status effects rendered as spells
    case 'status':
      return 'spell'

    default:
      return 'spell'
  }
}

/**
 * Build animation config from template and instance
 */
function buildAnimationConfig(template: any, instance: any): AnimationConfig {
  const category = template.category as string

  // Map category to animation type
  const animationType = mapCategoryToAnimationType(category)

  // Base config
  const config: AnimationConfig = {
    type: animationType,
    duration: template.defaults.duration || 1000,
    color: template.defaults.color || '#FFFFFF',
    size: template.defaults.size
  }

  // Add category-specific properties
  switch (category) {
    case 'projectile':
      config.speed = instance.speed || 500
      config.trail = true
      config.trailLength = 8
      config.trailFade = 0.8

      // Handle projectiles with burst effects (like Fireball)
      // Try to get animation data using getAnimation() method or direct access
      const projectileAnim = typeof instance.getAnimation === 'function'
        ? instance.getAnimation()
        : ((instance as any).animation || instance)

      // Extract range from instance or animation data (can be 'range' or 'maxRange')
      if (instance.range) config.range = instance.range
      if (projectileAnim.maxRange) config.range = projectileAnim.maxRange

      // Extract curved flag from motion path configuration
      if (projectileAnim.motionPath?.type === 'curved') {
        config.curved = true
        config.curveHeight = projectileAnim.motionPath.curveHeight
        config.curveDirection = projectileAnim.motionPath.curveDirection
      }

      if (projectileAnim.impactEffect) {
        const impact = projectileAnim.impactEffect
        config.burstSize = impact.radius || impact.size
        config.burstDuration = impact.duration || 600
        config.burstColor = impact.color
      }

      // Handle persistent effects (burning ground, etc.)
      if (projectileAnim.metadata?.persistDuration) {
        config.persistDuration = projectileAnim.metadata.persistDuration
        config.durationType = 'events' // Projectile bursts use event-based duration
        config.persistent = true
        config.persistColor = config.burstColor || config.color
        config.persistOpacity = 0.6
      }
      break

    case 'burst':
      config.burstSize = instance.radius || template.defaults.size
      config.particles = true
      break

    case 'area':
      // Access animation properties from the instance's animation object
      const areaAnim = (instance as any).animation || instance
      config.persistent = (areaAnim.persistDuration || 0) > 0
      config.persistDuration = areaAnim.persistDuration || 0
      config.durationType = areaAnim.durationType || 'rounds'
      config.opacity = areaAnim.opacity || 0.6
      // Use actual size from animation instance, not template defaults
      if (areaAnim.size) {
        config.size = areaAnim.size
      }
      break

    case 'ray':
      config.instant = true
      config.glow = true
      if (instance.range) config.range = instance.range
      break

    case 'cone':
      // Cone spells use projectile animation type but need special handling
      const coneAnim = typeof instance.getAnimation === 'function'
        ? instance.getAnimation()
        : ((instance as any).animation || instance)

      config.type = 'projectile' // Cone spells render as projectile type
      config.coneAngle = coneAnim.coneAngle || template.defaults.coneAngle || 60
      // IMPORTANT: Use template.defaults.size as the source of truth (in pixels)
      config.size = template.defaults.size || coneAnim.size || 30

      // Handle persistent cone effects (burning hands, poison spray, etc.)
      // Read from template defaults since animation instance doesn't expose these
      const persistDuration = template.defaults.persistDuration
      console.log('[Adapter] Cone config:', {
        animationName: template.name,
        persistDuration,
        durationType: template.defaults.durationType,
        templateDefaults: template.defaults
      })
      if (persistDuration) {
        config.persistDuration = persistDuration
        config.durationType = (template.defaults.durationType as 'rounds' | 'events') || 'events'
        config.persistent = true
        config.persistColor = (template.defaults.persistColor as string) || config.color
        config.persistOpacity = (template.defaults.persistOpacity as number) || 0.5
      }

      // Particles for visual effect
      if (coneAnim.particles || template.defaults.particles) {
        config.particles = true
      }
      break

    case 'attack':
      // Determine if melee or ranged based on weaponType
      const rangedWeaponTypes = ['arrow', 'bolt', 'thrown', 'sling']
      const isRanged = rangedWeaponTypes.includes(instance.weaponType)

      if (isRanged) {
        // Ranged attack
        config.type = 'projectile'
        config.speed = 600
        config.trail = true
        config.spin = instance.spin || false
        if (instance.range) config.range = instance.range
      } else {
        // Melee attack - use attackType to determine animation
        config.type = mapMeleeTypeToAnimation(instance.attackType || 'slash')
        config.range = instance.range || 5
        config.impact = true
      }
      break

    case 'movement':
      config.type = 'interaction' // Movement uses interaction animation
      config.easing = instance.easing || 'linear'
      config.duration = instance.duration
      break

    case 'status':
      config.type = 'area' // Status effects rendered as area
      config.persistent = true
      config.opacity = instance.opacity || 0.7
      config.pulse = instance.animationType === 'pulse'
      config.particles = instance.animationType === 'particles'
      break
  }

  // Add secondary color if available
  if (instance.secondaryColor) {
    config.secondaryColor = instance.secondaryColor
  }

  return config
}

/**
 * Map category to specific animation type
 */
function mapCategoryToAnimationType(category: string): AnimationConfig['type'] {
  switch (category) {
    case 'projectile':
      return 'projectile'
    case 'burst':
      return 'burst'
    case 'area':
      return 'area'
    case 'ray':
      return 'ray'
    case 'cone':
      return 'projectile' // Cone spells use projectile animation type
    case 'attack':
      return 'melee_slash' // Default, overridden by buildAnimationConfig
    case 'movement':
      return 'interaction'
    case 'status':
      return 'area'
    default:
      return 'projectile'
  }
}

/**
 * Map melee attack type to animation type
 */
function mapMeleeTypeToAnimation(attackType: string): AnimationConfig['type'] {
  switch (attackType) {
    case 'slash':
      return 'melee_slash'
    case 'thrust':
      return 'melee_thrust'
    case 'swing':
      return 'melee_swing'
    default:
      return 'melee_slash'
  }
}

/**
 * Build metadata from animation instance
 */
function buildMetadata(instance: any): Record<string, unknown> {
  const metadata: Record<string, unknown> = {
    rollResult: undefined
  }

  // Add properties from instance if available
  if (instance.damage) metadata.damage = instance.damage
  if (instance.damageType) metadata.damageType = instance.damageType
  if (instance.spellLevel) metadata.spellLevel = instance.spellLevel
  if (instance.range) metadata.range = instance.range
  if (instance.weaponType) metadata.weaponType = instance.weaponType
  if (instance.attackType) metadata.attackType = instance.attackType
  if (instance.movementType) metadata.movementType = instance.movementType
  if (instance.effectType) metadata.effectType = instance.effectType
  if (instance.metadata) {
    // Merge instance metadata
    Object.assign(metadata, instance.metadata)
  }

  return metadata
}

/**
 * Extract range from instance or metadata
 */
function extractRange(instance: any, metadata: Record<string, unknown>): number | undefined {
  // Try instance first
  if (typeof instance.range === 'number') return instance.range

  // Try metadata
  if (typeof metadata.range === 'number') return metadata.range

  // Try getting distance for projectiles
  if (instance.getDistance && typeof instance.getDistance === 'function') {
    const distance = instance.getDistance()
    // Convert pixels to feet (50px = 5 feet)
    return Math.round((distance / 50) * 5)
  }

  return undefined
}
