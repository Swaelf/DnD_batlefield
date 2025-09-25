/**
 * Token Types - Core token definitions with D&D 5e integration
 */

import type { Point } from '@/types/geometry'

// Branded types for type safety
export type TokenId = string & { readonly _brand: 'TokenId' }
export type TemplateId = string & { readonly _brand: 'TemplateId' }

// Type constructors
export const createTokenId = (id: string): TokenId => id as TokenId
export const createTemplateId = (id: string): TemplateId => id as TemplateId

// D&D 5e creature sizes
export type TokenSize = 'tiny' | 'small' | 'medium' | 'large' | 'huge' | 'gargantuan'

// Token shapes
export type TokenShape = 'circle' | 'square'

// Token categories
export type TokenCategory = 'player' | 'enemy' | 'npc' | 'object' | 'environment'

// Label positioning
export type LabelPosition = 'top' | 'bottom' | 'hidden'

// Core Token interface
export interface Token {
  readonly id: TokenId
  readonly type: 'token'
  readonly name: string
  readonly position: Point
  readonly size: TokenSize
  readonly shape: TokenShape
  readonly color: string
  readonly borderColor?: string
  readonly borderWidth?: number
  readonly opacity: number
  readonly category: TokenCategory
  readonly layer: number
  readonly rotation: number
  readonly isLocked: boolean
  readonly isVisible: boolean

  // D&D specific properties
  readonly initiative?: number
  readonly conditions: readonly string[]
  readonly hitPoints?: {
    readonly current: number
    readonly maximum: number
    readonly temporary: number
  }
  readonly armorClass?: number
  readonly speed?: number
  readonly isPlayer: boolean

  // Visual properties
  readonly label: {
    readonly text: string
    readonly position: LabelPosition
    readonly color: string
    readonly fontSize: number
    readonly offset: number
  }

  // Metadata
  readonly templateId?: TemplateId
  readonly createdAt: Date
  readonly lastModified: Date
}

// Token creation data
export interface CreateTokenData {
  readonly name: string
  readonly position: Point
  readonly size?: TokenSize
  readonly shape?: TokenShape
  readonly color?: string
  readonly category?: TokenCategory
  readonly isPlayer?: boolean
  readonly initiative?: number
  readonly templateId?: TemplateId
}

// Token update data (partial)
export type TokenUpdate = Partial<Omit<Token, 'id' | 'type' | 'createdAt'>> & {
  readonly lastModified: Date
}

// Token state for animations
export interface TokenState {
  readonly token: Token
  readonly isSelected: boolean
  readonly isDragging: boolean
  readonly isAnimating: boolean
  readonly dragOffset?: Point
}

// Token bounds calculation
export interface TokenBounds {
  readonly center: Point
  readonly radius: number
  readonly width: number
  readonly height: number
  readonly topLeft: Point
  readonly bottomRight: Point
}

// Grid size mappings for D&D 5e
export interface TokenSizeMap {
  readonly [K in TokenSize]: {
    readonly gridSquares: number
    readonly diameter: number
    readonly description: string
  }
}

// Token movement data
export interface TokenMovement {
  readonly tokenId: TokenId
  readonly from: Point
  readonly to: Point
  readonly path?: readonly Point[]
  readonly duration: number
  readonly easing?: string
}

// Batch token operations
export interface TokenBatchOperation {
  readonly type: 'create' | 'update' | 'delete'
  readonly tokens: readonly Token[]
  readonly updates?: readonly TokenUpdate[]
}

// Token validation result
export interface TokenValidationResult {
  readonly isValid: boolean
  readonly errors: readonly string[]
  readonly warnings: readonly string[]
  readonly dndCompliant: boolean
}

// Token query filters
export interface TokenFilters {
  readonly category?: TokenCategory
  readonly size?: TokenSize
  readonly isVisible?: boolean
  readonly hasInitiative?: boolean
  readonly isPlayer?: boolean
  readonly conditions?: readonly string[]
}

// Token selection data
export interface TokenSelection {
  readonly tokenIds: readonly TokenId[]
  readonly bounds?: TokenBounds
  readonly center?: Point
  readonly commonProperties: Partial<Token>
  readonly mixedProperties: readonly (keyof Token)[]
}