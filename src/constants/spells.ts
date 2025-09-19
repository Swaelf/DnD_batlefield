/**
 * Spell Constants
 * D&D spell system configurations and presets
 */

import { SPELL_COLORS } from './colors'

// Spell Categories
export const SPELL_CATEGORIES = {
  PROJECTILE: 'projectile',
  PROJECTILE_BURST: 'projectile-burst',
  RAY: 'ray',
  AREA: 'area',
  BURST: 'burst',
  CONE: 'cone',
  LINE: 'line',
  WALL: 'wall',
} as const

// Spell Ranges (in feet)
export const SPELL_RANGES = {
  TOUCH: 5,
  SHORT: 30,
  MEDIUM: 60,
  LONG: 120,
  VERY_LONG: 300,
  SIGHT: 1000,
  UNLIMITED: Infinity,
} as const

// Common Spell Sizes (radius in feet)
export const SPELL_SIZES = {
  TINY: 5,
  SMALL: 10,
  MEDIUM: 15,
  LARGE: 20,
  HUGE: 30,
  GARGANTUAN: 40,
} as const

// Spell Durations (in rounds, 0 = instant)
export const SPELL_DURATIONS = {
  INSTANT: 0,
  ONE_ROUND: 1,
  ONE_MINUTE: 10,
  TEN_MINUTES: 100,
  ONE_HOUR: 600,
  CONCENTRATION: -1, // Special value for concentration spells
} as const

// Spell Visual Effects Configuration
export const SPELL_VISUALS = {
  DEFAULT_OPACITY: 0.7,
  PERSIST_OPACITY: 0.5,
  PARTICLE_COUNT: 12,
  RING_COUNT: 3,
  TRAIL_LENGTH: 10,
  GLOW_INTENSITY: 1.5,
  PULSE_FREQUENCY: 2, // pulses per second
} as const

// Spell Presets
export const SPELL_PRESETS = {
  // Fire spells
  FIREBALL: {
    name: 'Fireball',
    category: SPELL_CATEGORIES.PROJECTILE_BURST,
    color: SPELL_COLORS.FIRE,
    secondaryColor: '#FFA500',
    size: SPELL_SIZES.LARGE,
    range: SPELL_RANGES.LONG,
    duration: SPELL_DURATIONS.INSTANT,
    projectileSpeed: 800,
    burstRadius: 20,
    particleEffect: true,
  },
  BURNING_HANDS: {
    name: 'Burning Hands',
    category: SPELL_CATEGORIES.CONE,
    color: SPELL_COLORS.FIRE,
    size: 15, // 15ft cone
    range: SPELL_RANGES.TOUCH,
    duration: SPELL_DURATIONS.INSTANT,
  },

  // Ice spells
  RAY_OF_FROST: {
    name: 'Ray of Frost',
    category: SPELL_CATEGORIES.RAY,
    color: SPELL_COLORS.ICE,
    range: SPELL_RANGES.MEDIUM,
    duration: SPELL_DURATIONS.INSTANT,
  },
  CONE_OF_COLD: {
    name: 'Cone of Cold',
    category: SPELL_CATEGORIES.CONE,
    color: SPELL_COLORS.ICE,
    size: 60, // 60ft cone
    range: SPELL_RANGES.TOUCH,
    duration: SPELL_DURATIONS.INSTANT,
  },

  // Lightning spells
  LIGHTNING_BOLT: {
    name: 'Lightning Bolt',
    category: SPELL_CATEGORIES.LINE,
    color: SPELL_COLORS.LIGHTNING,
    size: 100, // 100ft line
    range: SPELL_RANGES.TOUCH,
    duration: SPELL_DURATIONS.INSTANT,
  },
  THUNDERWAVE: {
    name: 'Thunderwave',
    category: SPELL_CATEGORIES.BURST,
    color: SPELL_COLORS.THUNDER,
    size: SPELL_SIZES.MEDIUM,
    duration: SPELL_DURATIONS.INSTANT,
  },

  // Magical effects
  MAGIC_MISSILE: {
    name: 'Magic Missile',
    category: SPELL_CATEGORIES.PROJECTILE,
    color: SPELL_COLORS.FORCE,
    range: SPELL_RANGES.LONG,
    duration: SPELL_DURATIONS.INSTANT,
    projectileSpeed: 1000,
  },
  ELDRITCH_BLAST: {
    name: 'Eldritch Blast',
    category: SPELL_CATEGORIES.PROJECTILE,
    color: '#8B00FF',
    range: SPELL_RANGES.LONG,
    duration: SPELL_DURATIONS.INSTANT,
    projectileSpeed: 900,
  },

  // Area effects
  WEB: {
    name: 'Web',
    category: SPELL_CATEGORIES.AREA,
    color: '#F5F5DC',
    size: SPELL_SIZES.LARGE,
    duration: SPELL_DURATIONS.TEN_MINUTES,
    persistDuration: 10,
  },
  ENTANGLE: {
    name: 'Entangle',
    category: SPELL_CATEGORIES.AREA,
    color: '#228B22',
    size: SPELL_SIZES.LARGE,
    duration: SPELL_DURATIONS.ONE_MINUTE,
    persistDuration: 10,
  },
  GREASE: {
    name: 'Grease',
    category: SPELL_CATEGORIES.AREA,
    color: '#708090',
    size: SPELL_SIZES.SMALL,
    duration: SPELL_DURATIONS.ONE_MINUTE,
    persistDuration: 10,
  },
  SPIKE_GROWTH: {
    name: 'Spike Growth',
    category: SPELL_CATEGORIES.AREA,
    color: '#8B4513',
    size: SPELL_SIZES.LARGE,
    duration: SPELL_DURATIONS.TEN_MINUTES,
    persistDuration: 100,
  },
} as const

// Spell Animation Speeds
export const SPELL_SPEEDS = {
  SLOW: 300,    // pixels per second
  NORMAL: 500,
  FAST: 800,
  VERY_FAST: 1200,
} as const

// Damage Types (for visual effects)
export const DAMAGE_TYPES = {
  ACID: { color: SPELL_COLORS.ACID, effect: 'dissolve' },
  BLUDGEONING: { color: '#8B4513', effect: 'impact' },
  COLD: { color: SPELL_COLORS.ICE, effect: 'freeze' },
  FIRE: { color: SPELL_COLORS.FIRE, effect: 'burn' },
  FORCE: { color: SPELL_COLORS.FORCE, effect: 'push' },
  LIGHTNING: { color: SPELL_COLORS.LIGHTNING, effect: 'shock' },
  NECROTIC: { color: SPELL_COLORS.NECROTIC, effect: 'wither' },
  PIERCING: { color: '#C0C0C0', effect: 'pierce' },
  POISON: { color: SPELL_COLORS.POISON, effect: 'cloud' },
  PSYCHIC: { color: SPELL_COLORS.PSYCHIC, effect: 'wave' },
  RADIANT: { color: SPELL_COLORS.RADIANT, effect: 'glow' },
  SLASHING: { color: '#DC143C', effect: 'slash' },
  THUNDER: { color: SPELL_COLORS.THUNDER, effect: 'wave' },
} as const