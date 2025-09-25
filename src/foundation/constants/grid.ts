/**
 * Grid system constants for battle map rendering
 */

import type { Color } from '../types'

// Standard grid sizes in pixels
export const GRID_SIZES = {
  SMALL: 25,
  MEDIUM: 50,
  LARGE: 75,
  XLARGE: 100
} as const

// Default grid configuration
export const DEFAULT_GRID_SIZE = GRID_SIZES.MEDIUM

// Grid types
export const GRID_TYPES = {
  SQUARE: 'square',
  HEX: 'hex'
} as const

// Grid colors
export const GRID_COLORS = {
  DEFAULT: '#333333' as Color,
  LIGHT: '#666666' as Color,
  ACCENT: '#888888' as Color,
  HIDDEN: 'transparent' as Color
} as const

// Grid opacity levels
export const GRID_OPACITY = {
  HIDDEN: 0,
  SUBTLE: 0.3,
  NORMAL: 0.6,
  PROMINENT: 0.9
} as const

// Snap tolerance in pixels
export const SNAP_TOLERANCE = 15

// Minimum zoom levels for grid visibility
export const GRID_VISIBILITY_THRESHOLDS = {
  MIN_ZOOM: 0.25,
  FADE_START: 0.3,
  FULL_OPACITY: 0.5
} as const