/**
 * Grid Constants
 * Configuration for battle map grid system
 */

// Grid Size Options (in pixels)
export const GRID_SIZES = {
  TINY: 25,
  SMALL: 40,
  MEDIUM: 50,  // Default D&D 5ft square
  LARGE: 70,
  HUGE: 100,
  CUSTOM_MIN: 10,
  CUSTOM_MAX: 200,
} as const

// Grid Types
export const GRID_TYPES = {
  SQUARE: 'square',
  HEXAGON: 'hex',
  TRIANGLE: 'triangle',
  ISOMETRIC: 'isometric',
} as const

// Grid Configuration Defaults
export const GRID_DEFAULTS = {
  SIZE: GRID_SIZES.MEDIUM,
  TYPE: GRID_TYPES.SQUARE,
  VISIBLE: true,
  SNAP: true,
  COLOR: 'rgba(255, 255, 255, 0.1)',
  LINE_WIDTH: 1,
  OPACITY: 0.3,
} as const

// D&D Distance Units
export const DISTANCE_UNITS = {
  FEET_PER_SQUARE: 5,
  METERS_PER_SQUARE: 1.5,
  DIAGONAL_MULTIPLIER: 1.5, // For optional diagonal movement rules
} as const

// Token Size to Grid Mapping
export const TOKEN_GRID_SIZES = {
  TINY: 0.5,      // 2.5ft - half square
  SMALL: 1,       // 5ft - 1 square
  MEDIUM: 1,      // 5ft - 1 square
  LARGE: 2,       // 10ft - 2x2 squares
  HUGE: 3,        // 15ft - 3x3 squares
  GARGANTUAN: 4,  // 20ft+ - 4x4 squares
} as const

// Grid Snap Settings
export const GRID_SNAP = {
  THRESHOLD: 0.3,  // Snap when within 30% of grid size
  CORNER: true,    // Snap to corners
  CENTER: true,    // Snap to centers
  EDGE: false,     // Snap to edges
} as const

// Grid Rendering Options
export const GRID_RENDER = {
  MAJOR_LINE_INTERVAL: 5,  // Every 5th line is major
  MAJOR_LINE_WIDTH: 2,      // Thicker major lines
  MAJOR_LINE_OPACITY: 0.5,  // More visible major lines
  SUBDIVISION: 1,           // Grid subdivisions (1 = none)
  DASH_PATTERN: [],         // Solid lines by default
} as const

// Measurement Settings
export const MEASUREMENT = {
  SHOW_DISTANCE: true,
  SHOW_SQUARES: true,
  LINE_WIDTH: 3,
  FONT_SIZE: 14,
  BACKGROUND_PADDING: 4,
  BACKGROUND_OPACITY: 0.8,
} as const

// Grid Drawing Helpers
export const GRID_HELPERS = {
  RULER: {
    WIDTH: 2,
    COLOR: '#F59E0B',
    DASH: [5, 5],
  },
  AREA_TEMPLATE: {
    FILL_OPACITY: 0.2,
    STROKE_WIDTH: 2,
    STROKE_DASH: [10, 5],
  },
  PATH_PREVIEW: {
    WIDTH: 3,
    COLOR: '#3B82F6',
    OPACITY: 0.7,
    ARROW_SIZE: 10,
  },
} as const