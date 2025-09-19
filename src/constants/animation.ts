/**
 * Animation Constants
 * Centralized animation timing, durations, and easing functions
 */

// Animation Durations (in milliseconds)
export const ANIMATION_DURATION = {
  // Spell animations
  SPELL_RAY: 500,
  SPELL_BURST: 600,
  SPELL_AREA_FADE_IN: 500,
  SPELL_PROJECTILE_SPEED: 500, // pixels per second

  // UI animations
  TOOLTIP_DELAY: 400,
  MODAL_FADE: 200,
  PANEL_SLIDE: 300,

  // Canvas animations
  ZOOM_TRANSITION: 200,
  PAN_TRANSITION: 150,

  // Token animations
  TOKEN_MOVE: 1000,
  TOKEN_FADE_IN: 500,
  TOKEN_FADE_OUT: 500,
  TOKEN_ROTATION: 300,
} as const

// Animation Easing Functions
export const ANIMATION_EASING = {
  LINEAR: 'linear',
  EASE_IN: 'ease-in',
  EASE_OUT: 'ease-out',
  EASE_IN_OUT: 'ease-in-out',
  CUBIC_BEZIER: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  ELASTIC: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
} as const

// Animation Speed Multipliers
export const ANIMATION_SPEED = {
  SLOW: 0.5,
  NORMAL: 1.0,
  FAST: 1.5,
  VERY_FAST: 2.0,
  INSTANT: 3.0,
} as const

// Frame Rate Constants
export const FRAME_RATE = {
  TARGET_FPS: 60,
  MIN_FPS: 30,
  FRAME_TIME: 1000 / 60, // ~16.67ms per frame
} as const

// Animation States
export const ANIMATION_STATE = {
  IDLE: 'idle',
  ENTERING: 'entering',
  ACTIVE: 'active',
  EXITING: 'exiting',
  COMPLETE: 'complete',
} as const

// Spell Animation Phases
export const SPELL_ANIMATION_PHASE = {
  TRAVEL: 'travel',
  IMPACT: 'impact',
  BURST: 'burst',
  PERSIST: 'persist',
  FADE: 'fade',
} as const

// Animation Priorities (higher = more important)
export const ANIMATION_PRIORITY = {
  LOW: 1,
  NORMAL: 5,
  HIGH: 10,
  CRITICAL: 100,
} as const