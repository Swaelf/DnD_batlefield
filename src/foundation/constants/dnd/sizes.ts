/**
 * D&D 5e creature size constants
 * These define the grid space requirements for different creature sizes
 */

import type { TokenSize } from '../../types'

// Grid squares occupied by each size category (5ft = 1 square)
export const SIZE_TO_GRID_SQUARES: Record<TokenSize, number> = {
  tiny: 0.5,
  small: 1,
  medium: 1,
  large: 2,
  huge: 3,
  gargantuan: 4
} as const

// Pixel radius for tokens on a standard 50px grid
export const SIZE_TO_PIXEL_RADIUS: Record<TokenSize, number> = {
  tiny: 12.5,    // 0.5 squares
  small: 25,     // 1 square
  medium: 25,    // 1 square
  large: 50,     // 2 squares
  huge: 75,      // 3 squares
  gargantuan: 100 // 4 squares
} as const

// Display names for sizes
export const SIZE_DISPLAY_NAMES: Record<TokenSize, string> = {
  tiny: 'Tiny',
  small: 'Small',
  medium: 'Medium',
  large: 'Large',
  huge: 'Huge',
  gargantuan: 'Gargantuan'
} as const

// Size order for comparisons
export const SIZE_ORDER: readonly TokenSize[] = [
  'tiny',
  'small',
  'medium',
  'large',
  'huge',
  'gargantuan'
] as const

// Helper to get size index for comparisons
export const getSizeIndex = (size: TokenSize): number => SIZE_ORDER.indexOf(size)