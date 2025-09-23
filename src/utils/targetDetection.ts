import type { Token } from '@/types'
import type { Point } from '@/types/geometry'
import type { UnifiedAction, AreaShape } from '@/types/unifiedAction'
import { isPointInArea, getTokensInArea } from './areaCalculations'

/**
 * Detects all tokens affected by an action based on its area of effect
 */
export const detectAffectedTokens = (
  action: UnifiedAction,
  tokens: Token[],
  excludeSelf: boolean = true
): Token[] => {
  // Handle direct token targeting
  if (Array.isArray(action.target)) {
    const targetIds = action.target
    return tokens.filter(token => targetIds.includes(token.id))
  }

  // Handle area-based targeting
  if (action.effects.areaOfEffect) {
    const sourceId = typeof action.source === 'string' ? action.source : undefined
    const excludeId = excludeSelf ? sourceId : undefined

    return getTokensInArea(
      tokens,
      action.effects.areaOfEffect,
      excludeId
    )
  }

  // Handle single point targeting (find tokens at that position)
  if (typeof action.target === 'object' && !Array.isArray(action.target)) {
    const targetPoint = action.target as Point
    const tolerance = 25 // pixels tolerance for clicking on a token

    return tokens.filter(token => {
      const dx = token.position.x - targetPoint.x
      const dy = token.position.y - targetPoint.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      // Consider token size for hit detection
      const tokenRadius = getTokenRadius(token.size)
      return distance <= tokenRadius + tolerance
    })
  }

  return []
}

/**
 * Generates area shape from action parameters
 */
export const generateActionArea = (
  action: UnifiedAction,
  origin?: Point
): AreaShape | null => {
  // Use existing area if defined
  if (action.effects.areaOfEffect) {
    return action.effects.areaOfEffect
  }

  // Generate area based on action type and category
  const source = origin || (
    typeof action.source === 'object' ? action.source : { x: 0, y: 0 }
  )

  const target = typeof action.target === 'object' && !Array.isArray(action.target)
    ? action.target as Point
    : null

  switch (action.type) {
    case 'spell':
      return generateSpellArea(action, source, target)
    case 'attack':
      return generateAttackArea(action, source, target)
    case 'interaction':
      return generateInteractionArea(action, source, target)
    default:
      return null
  }
}

/**
 * Generate spell area based on spell category
 */
const generateSpellArea = (
  action: UnifiedAction,
  source: Point,
  target: Point | null
): AreaShape | null => {
  switch (action.category) {
    case 'fire':
    case 'ice':
    case 'lightning':
      // Burst spells - circular area at target (requires target)
      if (!target) {
        return null
      }
      return {
        type: 'circle',
        center: target,
        radius: action.animation.size || 100
      }

    case 'healing':
      // Healing - circular area around caster (no target needed)
      return {
        type: 'circle',
        center: target || source,
        radius: action.animation.size || 60
      }

    case 'poison':
      // Poison cloud - square area
      if (target) {
        return {
          type: 'square',
          center: target,
          size: action.animation.size || 80
        }
      }
      break

    case 'divine':
      // Divine spells - cone from caster
      if (target) {
        const dx = target.x - source.x
        const dy = target.y - source.y
        const direction = Math.atan2(dy, dx) * 180 / Math.PI

        return {
          type: 'cone',
          origin: source,
          direction,
          angle: 60,
          range: action.animation.size || 150
        }
      }
      break
  }

  return null
}

/**
 * Generate attack area based on attack type
 */
const generateAttackArea = (
  action: UnifiedAction,
  source: Point,
  target: Point | null
): AreaShape | null => {
  switch (action.category) {
    case 'sword':
    case 'axe':
    case 'mace':
      // Melee weapons - small circle around source
      return {
        type: 'circle',
        center: source,
        radius: 50 // Melee reach
      }

    case 'arrow':
    case 'bolt':
      // Ranged projectiles - line to target
      if (target) {
        return {
          type: 'line',
          start: source,
          end: target,
          width: 10
        }
      }
      break

    case 'breath':
      // Breath weapons - cone
      if (target) {
        const dx = target.x - source.x
        const dy = target.y - source.y
        const direction = Math.atan2(dy, dx) * 180 / Math.PI

        return {
          type: 'cone',
          origin: source,
          direction,
          angle: 90,
          range: 200
        }
      }
      break
  }

  return null
}

/**
 * Generate interaction area
 */
const generateInteractionArea = (
  action: UnifiedAction,
  source: Point,
  target: Point | null
): AreaShape | null => {
  // Most interactions affect a small area around the interaction point
  const center = target || source

  return {
    type: 'circle',
    center,
    radius: 30 // Small interaction radius
  }
}

/**
 * Calculate if action requires line of sight
 */
export const requiresLineOfSight = (action: UnifiedAction): boolean => {
  // Spells and ranged attacks typically require line of sight
  if (action.type === 'spell') {
    // Area spells might not need line of sight to all targets
    const areaCategories = ['fire', 'poison', 'ice']
    return !areaCategories.includes(action.category)
  }

  if (action.type === 'attack') {
    // Ranged attacks need line of sight
    return ['arrow', 'bolt', 'thrown'].includes(action.category)
  }

  // Interactions usually don't need line of sight calculation
  return false
}

/**
 * Filter tokens by line of sight from source
 */
export const filterByLineOfSight = (
  tokens: Token[],
  source: Point,
  obstacles: { position: Point; size: number }[]
): Token[] => {
  return tokens.filter(token => {
    return hasLineOfSight(source, token.position, obstacles)
  })
}

/**
 * Simple line of sight check
 */
const hasLineOfSight = (
  from: Point,
  to: Point,
  obstacles: { position: Point; size: number }[]
): boolean => {
  // Simple implementation - check if line intersects any obstacles
  for (const obstacle of obstacles) {
    if (lineIntersectsCircle(from, to, obstacle.position, obstacle.size)) {
      return false
    }
  }
  return true
}

/**
 * Group tokens by distance from a point
 */
export const groupTokensByDistance = (
  tokens: Token[],
  origin: Point
): { near: Token[], medium: Token[], far: Token[] } => {
  const near: Token[] = []
  const medium: Token[] = []
  const far: Token[] = []

  tokens.forEach(token => {
    const dx = token.position.x - origin.x
    const dy = token.position.y - origin.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance <= 50) {
      near.push(token)
    } else if (distance <= 150) {
      medium.push(token)
    } else {
      far.push(token)
    }
  })

  return { near, medium, far }
}

/**
 * Calculate optimal target point for area effect
 */
export const calculateOptimalTargetPoint = (
  caster: Point,
  enemies: Token[],
  allies: Token[],
  areaRadius: number
): Point => {
  // Find the point that maximizes enemies hit while minimizing allies hit
  let bestPoint = { x: 0, y: 0 }
  let bestScore = -Infinity

  // Check various candidate points
  const candidates: Point[] = []

  // Add enemy positions as candidates
  enemies.forEach(enemy => {
    candidates.push(enemy.position)
  })

  // Add points between enemies
  for (let i = 0; i < enemies.length - 1; i++) {
    for (let j = i + 1; j < enemies.length; j++) {
      const midPoint = {
        x: (enemies[i].position.x + enemies[j].position.x) / 2,
        y: (enemies[i].position.y + enemies[j].position.y) / 2
      }
      candidates.push(midPoint)
    }
  }

  // Evaluate each candidate
  candidates.forEach(point => {
    let score = 0

    // Count enemies in area
    enemies.forEach(enemy => {
      const dx = enemy.position.x - point.x
      const dy = enemy.position.y - point.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      if (distance <= areaRadius) {
        score += 10 // Positive points for hitting enemies
      }
    })

    // Count allies in area
    allies.forEach(ally => {
      const dx = ally.position.x - point.x
      const dy = ally.position.y - point.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      if (distance <= areaRadius) {
        score -= 20 // Negative points for hitting allies
      }
    })

    if (score > bestScore) {
      bestScore = score
      bestPoint = point
    }
  })

  return bestPoint
}

/**
 * Check if line segment intersects circle
 */
const lineIntersectsCircle = (
  start: Point,
  end: Point,
  center: Point,
  radius: number
): boolean => {
  const dx = end.x - start.x
  const dy = end.y - start.y
  const fx = start.x - center.x
  const fy = start.y - center.y

  const a = dx * dx + dy * dy
  const b = 2 * (fx * dx + fy * dy)
  const c = fx * fx + fy * fy - radius * radius

  const discriminant = b * b - 4 * a * c
  if (discriminant < 0) return false

  const t1 = (-b - Math.sqrt(discriminant)) / (2 * a)
  const t2 = (-b + Math.sqrt(discriminant)) / (2 * a)

  return (t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1)
}

/**
 * Get token radius based on D&D size
 */
const getTokenRadius = (size: string): number => {
  const sizeMap: Record<string, number> = {
    tiny: 12.5,
    small: 25,
    medium: 25,
    large: 50,
    huge: 75,
    gargantuan: 100
  }
  return sizeMap[size] || 25
}