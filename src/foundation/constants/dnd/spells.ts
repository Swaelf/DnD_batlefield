/**
 * D&D 5e spell constants and categorizations
 * These define common spell properties and visual effects
 */

import type { SpellSchool, SpellLevel, Color } from '../../types'

// Color themes for spell schools
export const SPELL_SCHOOL_COLORS: Record<SpellSchool, Color> = {
  abjuration: '#4A90E2' as Color,      // Blue - protective
  conjuration: '#9013FE' as Color,     // Purple - summoning
  divination: '#FFD700' as Color,      // Gold - knowledge
  enchantment: '#FF69B4' as Color,     // Pink - charm
  evocation: '#FF4444' as Color,       // Red - destructive
  illusion: '#BA68C8' as Color,        // Lavender - deceptive
  necromancy: '#424242' as Color,      // Dark gray - death
  transmutation: '#4CAF50' as Color    // Green - change
} as const

// Spell level difficulties for visual scaling
export const SPELL_LEVEL_INTENSITY: Record<SpellLevel, number> = {
  0: 0.3,  // Cantrips - subtle
  1: 0.4,
  2: 0.5,
  3: 0.6,
  4: 0.7,
  5: 0.8,
  6: 0.9,
  7: 0.95,
  8: 1.0,
  9: 1.0   // Most intense
} as const

// Common spell durations in milliseconds
export const SPELL_DURATIONS = {
  INSTANT: 500,
  SHORT: 1000,
  MEDIUM: 2000,
  LONG: 3000,
  EXTENDED: 5000
} as const

// Spell effect categories for rendering
export const SPELL_CATEGORIES = {
  PROJECTILE: 'projectile',
  AREA: 'area',
  BURST: 'burst',
  RAY: 'ray',
  TOUCH: 'touch',
  SELF: 'self',
  PERSISTENT: 'persistent'
} as const

// Standard spell ranges in feet
export const SPELL_RANGES = {
  TOUCH: 5,
  CLOSE: 30,
  MEDIUM: 60,
  LONG: 120,
  EXTREME: 300,
  SIGHT: 999999
} as const