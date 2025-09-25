/**
 * D&D 5e weapon constants and properties
 * These define weapon characteristics for combat animations
 */

import type { DamageType, WeaponProperty, Color } from '../../types'

export type WeaponCategory = 'simple' | 'martial'
export type WeaponType = 'melee' | 'ranged'

// Weapon damage type colors for visual effects
export const DAMAGE_TYPE_COLORS: Record<DamageType, Color> = {
  acid: '#32CD32' as Color,        // Lime green
  bludgeoning: '#8B4513' as Color, // Saddle brown
  cold: '#87CEEB' as Color,        // Sky blue
  fire: '#FF4500' as Color,        // Orange red
  force: '#9370DB' as Color,       // Medium purple
  lightning: '#FFFF00' as Color,   // Yellow
  necrotic: '#2F2F2F' as Color,    // Dark gray
  piercing: '#C0C0C0' as Color,    // Silver
  poison: '#9ACD32' as Color,      // Yellow green
  psychic: '#FF1493' as Color,     // Deep pink
  radiant: '#FFD700' as Color,     // Gold
  slashing: '#DC143C' as Color,    // Crimson
  thunder: '#4682B4' as Color      // Steel blue
} as const

// Animation durations for different weapon types (milliseconds)
export const WEAPON_ANIMATION_DURATIONS = {
  LIGHT_MELEE: 400,    // Daggers, rapiers
  HEAVY_MELEE: 600,    // Greataxes, mauls
  RANGED: 800,         // Bows, crossbows
  THROWN: 700,         // Javelins, handaxes
  FINESSE: 350         // Quick, precise weapons
} as const

// Weapon reach distances in feet
export const WEAPON_REACHES = {
  MELEE: 5,
  REACH: 10,
  THROWN_SHORT: 20,
  THROWN_LONG: 60,
  RANGED_SHORT: 80,
  RANGED_LONG: 320
} as const

// Critical hit multipliers for visual scaling
export const CRITICAL_HIT_MULTIPLIERS = {
  DAMAGE_SCALE: 1.5,
  ANIMATION_INTENSITY: 2.0,
  SCREEN_SHAKE: 1.8,
  EFFECT_DURATION: 1.3
} as const