/**
 * Token Service - Core token operations and D&D 5e rule enforcement
 */

import { nanoid } from 'nanoid'
import type { Point, Circle, Rectangle } from '@/types/geometry'
import type {
  Token,
  TokenId,
  TemplateId,
  CreateTokenData,
  TokenUpdate,
  TokenBounds,
  TokenMovement,
  TokenBatchOperation,
  TokenValidationResult,
  TokenFilters,
  TokenSelection,
  TokenSize,
  TokenCategory
} from '../types'
import { createTokenId } from '../types'
import { getTokenRadius, getTokenDiameter, TOKEN_SIZE_GRID_MAP } from '../constants'

export class TokenService {
  /**
   * Create a new token from provided data
   */
  createToken(data: CreateTokenData): Token {
    const id = createTokenId(nanoid())
    const now = new Date()

    return {
      id,
      type: 'token',
      name: data.name,
      position: data.position,
      size: data.size ?? 'medium',
      shape: data.shape ?? 'circle',
      color: data.color ?? '#922610',
      borderColor: '#C9AD6A',
      borderWidth: 2,
      opacity: 1,
      category: data.category ?? 'npc',
      layer: 1,
      rotation: 0,
      isLocked: false,
      isVisible: true,

      // D&D specific properties
      initiative: data.initiative,
      conditions: [],
      hitPoints: undefined,
      armorClass: undefined,
      speed: undefined,
      isPlayer: data.isPlayer ?? false,

      // Visual properties
      label: {
        text: data.name,
        position: 'bottom',
        color: '#FFFFFF',
        fontSize: 12,
        offset: 5
      },

      // Metadata
      templateId: data.templateId,
      createdAt: now,
      lastModified: now
    }
  }

  /**
   * Create token from template
   */
  createFromTemplate(templateId: TemplateId, position: Point, name: string): Token {
    // This would integrate with TemplateService to get template data
    // For now, create with basic data
    return this.createToken({
      name,
      position,
      templateId
    })
  }

  /**
   * Update existing token
   */
  updateToken(token: Token, updates: TokenUpdate): Token {
    return {
      ...token,
      ...updates,
      lastModified: new Date()
    }
  }

  /**
   * Validate token properties
   */
  validateToken(token: Token): TokenValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // Validate name
    if (!token.name.trim()) {
      errors.push('Token name cannot be empty')
    }

    // Validate size
    if (!TOKEN_SIZE_GRID_MAP[token.size]) {
      errors.push(`Invalid token size: ${token.size}`)
    }

    // Validate opacity
    if (token.opacity < 0 || token.opacity > 1) {
      errors.push('Token opacity must be between 0 and 1')
    }

    // Validate color format
    if (!/^#[0-9A-Fa-f]{6}$/.test(token.color)) {
      errors.push('Token color must be a valid hex color')
    }

    // D&D specific validation
    if (token.hitPoints) {
      if (token.hitPoints.current < 0) {
        errors.push('Current hit points cannot be negative')
      }
      if (token.hitPoints.maximum <= 0) {
        errors.push('Maximum hit points must be positive')
      }
      if (token.hitPoints.current > token.hitPoints.maximum + token.hitPoints.temporary) {
        errors.push('Current HP cannot exceed maximum + temporary HP')
      }
    }

    if (token.armorClass && token.armorClass < 1) {
      errors.push('Armor class must be at least 1')
    }

    if (token.speed && token.speed < 0) {
      errors.push('Speed cannot be negative')
    }

    // Check for unusual D&D values
    if (token.armorClass && (token.armorClass > 25 || token.armorClass < 8)) {
      warnings.push('Unusual armor class for D&D 5e (typical range: 8-25)')
    }

    if (token.speed && token.speed > 0 && token.speed % 5 !== 0) {
      warnings.push('D&D 5e speeds are typically multiples of 5 feet')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      dndCompliant: warnings.length === 0
    }
  }

  /**
   * Calculate token bounds for collision detection
   */
  getTokenBounds(token: Token, gridSize: number): TokenBounds {
    const radius = getTokenRadius(token.size, gridSize)
    const diameter = getTokenDiameter(token.size, gridSize)

    return {
      center: token.position,
      radius,
      width: diameter,
      height: diameter,
      topLeft: {
        x: token.position.x - radius,
        y: token.position.y - radius
      },
      bottomRight: {
        x: token.position.x + radius,
        y: token.position.y + radius
      }
    }
  }

  /**
   * Check if tokens are colliding
   */
  checkCollision(token1: Token, token2: Token, gridSize: number): boolean {
    const bounds1 = this.getTokenBounds(token1, gridSize)
    const bounds2 = this.getTokenBounds(token2, gridSize)

    const distance = Math.sqrt(
      Math.pow(bounds1.center.x - bounds2.center.x, 2) +
      Math.pow(bounds1.center.y - bounds2.center.y, 2)
    )

    return distance < (bounds1.radius + bounds2.radius)
  }

  /**
   * Get movement range for token
   */
  getMovementRange(token: Token, speed: number, gridSize: number): Circle {
    const movementRadius = (speed / 5) * gridSize // Convert feet to pixels

    return {
      center: token.position,
      radius: movementRadius
    }
  }

  /**
   * Calculate distance between tokens in feet
   */
  calculateDistance(from: Token, to: Token, gridSize: number): number {
    const pixelDistance = Math.sqrt(
      Math.pow(to.position.x - from.position.x, 2) +
      Math.pow(to.position.y - from.position.y, 2)
    )

    return Math.round((pixelDistance / gridSize) * 5) // Convert to feet
  }

  /**
   * Get adjacent tokens within range
   */
  getAdjacentTokens(token: Token, otherTokens: Token[], range: number, gridSize: number): Token[] {
    return otherTokens.filter(other => {
      if (other.id === token.id) return false

      const distance = this.calculateDistance(token, other, gridSize)
      return distance <= range
    })
  }

  /**
   * Snap position to grid
   */
  snapToGrid(position: Point, gridSize: number): Point {
    return {
      x: Math.round(position.x / gridSize) * gridSize,
      y: Math.round(position.y / gridSize) * gridSize
    }
  }

  /**
   * Check if position is within map bounds
   */
  isWithinBounds(position: Point, tokenSize: TokenSize, mapBounds: Rectangle, gridSize: number): boolean {
    const radius = getTokenRadius(tokenSize, gridSize)

    return (
      position.x - radius >= mapBounds.x &&
      position.y - radius >= mapBounds.y &&
      position.x + radius <= mapBounds.x + mapBounds.width &&
      position.y + radius <= mapBounds.y + mapBounds.height
    )
  }

  /**
   * Duplicate tokens
   */
  duplicateTokens(tokens: Token[], offset: Point = { x: 50, y: 50 }): Token[] {
    return tokens.map(token => ({
      ...token,
      id: createTokenId(nanoid()),
      name: `${token.name} (Copy)`,
      position: {
        x: token.position.x + offset.x,
        y: token.position.y + offset.y
      },
      createdAt: new Date(),
      lastModified: new Date()
    }))
  }

  /**
   * Align tokens
   */
  alignTokens(tokens: Token[], alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom'): Token[] {
    if (tokens.length < 2) return tokens

    const bounds = tokens.map(token => ({ token, x: token.position.x, y: token.position.y }))
    let alignValue: number

    switch (alignment) {
      case 'left':
        alignValue = Math.min(...bounds.map(b => b.x))
        return tokens.map(token =>
          this.updateToken(token, { position: { ...token.position, x: alignValue } })
        )

      case 'center':
        alignValue = bounds.reduce((sum, b) => sum + b.x, 0) / bounds.length
        return tokens.map(token =>
          this.updateToken(token, { position: { ...token.position, x: alignValue } })
        )

      case 'right':
        alignValue = Math.max(...bounds.map(b => b.x))
        return tokens.map(token =>
          this.updateToken(token, { position: { ...token.position, x: alignValue } })
        )

      case 'top':
        alignValue = Math.min(...bounds.map(b => b.y))
        return tokens.map(token =>
          this.updateToken(token, { position: { ...token.position, y: alignValue } })
        )

      case 'middle':
        alignValue = bounds.reduce((sum, b) => sum + b.y, 0) / bounds.length
        return tokens.map(token =>
          this.updateToken(token, { position: { ...token.position, y: alignValue } })
        )

      case 'bottom':
        alignValue = Math.max(...bounds.map(b => b.y))
        return tokens.map(token =>
          this.updateToken(token, { position: { ...token.position, y: alignValue } })
        )

      default:
        return tokens
    }
  }

  /**
   * Filter tokens by criteria
   */
  filterTokens(tokens: Token[], filters: TokenFilters): Token[] {
    return tokens.filter(token => {
      if (filters.category && token.category !== filters.category) return false
      if (filters.size && token.size !== filters.size) return false
      if (filters.isVisible !== undefined && token.isVisible !== filters.isVisible) return false
      if (filters.hasInitiative !== undefined) {
        const hasInit = token.initiative !== undefined
        if (hasInit !== filters.hasInitiative) return false
      }
      if (filters.isPlayer !== undefined && token.isPlayer !== filters.isPlayer) return false
      if (filters.conditions && filters.conditions.length > 0) {
        const hasAllConditions = filters.conditions.every(condition =>
          token.conditions.includes(condition)
        )
        if (!hasAllConditions) return false
      }

      return true
    })
  }

  /**
   * Get selection data for multiple tokens
   */
  getTokenSelection(tokens: Token[], tokenIds: TokenId[]): TokenSelection {
    const selectedTokens = tokens.filter(token => tokenIds.includes(token.id))

    if (selectedTokens.length === 0) {
      return {
        tokenIds,
        commonProperties: {},
        mixedProperties: []
      }
    }

    // Calculate common properties and mixed properties
    const first = selectedTokens[0]
    const commonProperties: Partial<Token> = {}
    const mixedProperties: (keyof Token)[] = []

    // Check each property for consistency
    const propertiesToCheck: (keyof Token)[] = [
      'size', 'shape', 'color', 'category', 'isVisible', 'isLocked'
    ]

    for (const prop of propertiesToCheck) {
      const values = selectedTokens.map(token => token[prop])
      const allSame = values.every(value => value === values[0])

      if (allSame) {
        ;(commonProperties as any)[prop] = first[prop]
      } else {
        mixedProperties.push(prop)
      }
    }

    // Calculate bounds if multiple tokens
    let bounds: TokenBounds | undefined
    let center: Point | undefined

    if (selectedTokens.length > 1) {
      const positions = selectedTokens.map(token => token.position)
      const minX = Math.min(...positions.map(p => p.x))
      const maxX = Math.max(...positions.map(p => p.x))
      const minY = Math.min(...positions.map(p => p.y))
      const maxY = Math.max(...positions.map(p => p.y))

      center = {
        x: (minX + maxX) / 2,
        y: (minY + maxY) / 2
      }

      bounds = {
        center,
        radius: Math.max(maxX - minX, maxY - minY) / 2,
        width: maxX - minX,
        height: maxY - minY,
        topLeft: { x: minX, y: minY },
        bottomRight: { x: maxX, y: maxY }
      }
    }

    return {
      tokenIds,
      bounds,
      center,
      commonProperties,
      mixedProperties
    }
  }
}