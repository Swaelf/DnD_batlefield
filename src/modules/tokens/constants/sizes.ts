/**
 * D&D 5e Token Size Constants
 */

import type { TokenSize, TokenSizeMap } from '../types'

// D&D 5e creature size to grid square mapping
export const TOKEN_SIZE_GRID_MAP: TokenSizeMap = {
  tiny: {
    gridSquares: 0.5,
    diameter: 0.5,
    description: '2.5 feet (smaller than 1 square)'
  },
  small: {
    gridSquares: 1,
    diameter: 1,
    description: '5 feet (1 square)'
  },
  medium: {
    gridSquares: 1,
    diameter: 1,
    description: '5 feet (1 square)'
  },
  large: {
    gridSquares: 2,
    diameter: 2,
    description: '10 feet (2x2 squares)'
  },
  huge: {
    gridSquares: 3,
    diameter: 3,
    description: '15 feet (3x3 squares)'
  },
  gargantuan: {
    gridSquares: 4,
    diameter: 4,
    description: '20+ feet (4x4 squares or larger)'
  }
} as const

// Size categories for filtering and organization
export const TOKEN_SIZE_CATEGORIES = {
  small: ['tiny', 'small'] as const,
  medium: ['medium'] as const,
  large: ['large', 'huge', 'gargantuan'] as const
} as const

// Size ordering for sorting
export const TOKEN_SIZE_ORDER: readonly TokenSize[] = [
  'tiny',
  'small',
  'medium',
  'large',
  'huge',
  'gargantuan'
] as const

// Calculate pixel radius from grid size and token size
export function getTokenRadius(size: TokenSize, gridSize: number): number {
  const gridSquares = TOKEN_SIZE_GRID_MAP[size].gridSquares
  return (gridSquares * gridSize) / 2
}

// Calculate pixel diameter from grid size and token size
export function getTokenDiameter(size: TokenSize, gridSize: number): number {
  const gridSquares = TOKEN_SIZE_GRID_MAP[size].gridSquares
  return gridSquares * gridSize
}

// Get grid squares occupied by token size
export function getGridSquares(size: TokenSize): number {
  return TOKEN_SIZE_GRID_MAP[size].gridSquares
}

// Check if size is valid D&D 5e size
export function isValidTokenSize(size: string): size is TokenSize {
  return size in TOKEN_SIZE_GRID_MAP
}

// Get size category (small/medium/large)
export function getSizeCategory(size: TokenSize): 'small' | 'medium' | 'large' {
  if (TOKEN_SIZE_CATEGORIES.small.includes(size as 'tiny' | 'small')) {
    return 'small'
  }
  if (TOKEN_SIZE_CATEGORIES.medium.includes(size as 'medium')) {
    return 'medium'
  }
  return 'large'
}

// Get next larger size
export function getNextLargerSize(size: TokenSize): TokenSize | null {
  const currentIndex = TOKEN_SIZE_ORDER.indexOf(size)
  if (currentIndex === -1 || currentIndex === TOKEN_SIZE_ORDER.length - 1) {
    return null
  }
  return TOKEN_SIZE_ORDER[currentIndex + 1]
}

// Get next smaller size
export function getNextSmallerSize(size: TokenSize): TokenSize | null {
  const currentIndex = TOKEN_SIZE_ORDER.indexOf(size)
  if (currentIndex === -1 || currentIndex === 0) {
    return null
  }
  return TOKEN_SIZE_ORDER[currentIndex - 1]
}