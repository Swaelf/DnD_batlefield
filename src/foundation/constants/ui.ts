/**
 * UI constants for consistent interface behavior
 */

// Z-index layers for proper stacking
export const Z_LAYERS = {
  BASE: 0,
  OBJECTS: 10,
  SELECTION: 20,
  UI: 100,
  TOOLTIP: 200,
  DROPDOWN: 300,
  MODAL_BACKDROP: 400,
  MODAL: 500,
  NOTIFICATION: 600
} as const

// Animation durations in milliseconds
export const ANIMATIONS = {
  FAST: 150,
  NORMAL: 250,
  SLOW: 350,
  FADE: 200,
  SLIDE: 300,
  SPRING: 400
} as const

// Breakpoints for responsive design
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  XXL: 1536
} as const

// Spacing scale (pixels)
export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 24,
  XL: 32,
  XXL: 48
} as const

// Border radius scale
export const RADIUS = {
  NONE: 0,
  SM: 4,
  MD: 8,
  LG: 12,
  FULL: 9999
} as const

// Shadow depths
export const SHADOWS = {
  SM: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  MD: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  LG: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  XL: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
} as const

// Typography scale
export const FONT_SIZES = {
  XS: 12,
  SM: 14,
  BASE: 16,
  LG: 18,
  XL: 20,
  XXL: 24,
  XXXL: 32
} as const

// Icon sizes
export const ICON_SIZES = {
  XS: 12,
  SM: 16,
  MD: 20,
  LG: 24,
  XL: 32
} as const