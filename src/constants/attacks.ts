/**
 * Attack Constants
 * D&D 5e attack system configurations and weapon presets
 */

import { SPELL_COLORS } from './colors'

// Attack Types
export const ATTACK_TYPES = {
  MELEE_WEAPON: 'melee_weapon',
  RANGED_WEAPON: 'ranged_weapon',
  NATURAL_WEAPON: 'natural_weapon',
  SPELL_ATTACK: 'spell_attack',
  UNARMED: 'unarmed',
} as const

// Damage Types
export const DAMAGE_TYPES = {
  SLASHING: 'slashing',
  PIERCING: 'piercing',
  BLUDGEONING: 'bludgeoning',
  ACID: 'acid',
  COLD: 'cold',
  FIRE: 'fire',
  FORCE: 'force',
  LIGHTNING: 'lightning',
  NECROTIC: 'necrotic',
  POISON: 'poison',
  PSYCHIC: 'psychic',
  RADIANT: 'radiant',
  THUNDER: 'thunder',
} as const

// Attack Ranges (in feet)
export const ATTACK_RANGES = {
  MELEE: 5,
  REACH: 10,
  THROWN_SHORT: 20,
  THROWN_LONG: 60,
  BOW_SHORT: 150,
  BOW_LONG: 600,
  CROSSBOW_SHORT: 80,
  CROSSBOW_LONG: 320,
  JAVELIN_SHORT: 30,
  JAVELIN_LONG: 120,
  SPELL_TOUCH: 5,
  SPELL_SHORT: 30,
  SPELL_MEDIUM: 60,
  SPELL_LONG: 120,
} as const

// Weapon Properties
export const WEAPON_PROPERTIES = {
  FINESSE: 'finesse',
  HEAVY: 'heavy',
  LIGHT: 'light',
  LOADING: 'loading',
  REACH: 'reach',
  THROWN: 'thrown',
  TWO_HANDED: 'two_handed',
  VERSATILE: 'versatile',
  AMMUNITION: 'ammunition',
  SPECIAL: 'special',
} as const

// Attack Animation Types
export const ATTACK_ANIMATIONS = {
  MELEE_SLASH: 'melee_slash',
  MELEE_THRUST: 'melee_thrust',
  MELEE_SWING: 'melee_swing',
  RANGED_PROJECTILE: 'ranged_projectile',
  NATURAL_BITE: 'natural_bite',
  NATURAL_CLAW: 'natural_claw',
  NATURAL_TAIL: 'natural_tail',
  SPELL_RAY: 'spell_ray',
  SPELL_BOLT: 'spell_bolt',
} as const

// Weapon Presets - Common D&D 5e Weapons
export const WEAPON_PRESETS = {
  // Simple Melee Weapons
  CLUB: {
    name: 'Club',
    type: ATTACK_TYPES.MELEE_WEAPON,
    damage: '1d4',
    damageType: DAMAGE_TYPES.BLUDGEONING,
    properties: [WEAPON_PROPERTIES.LIGHT],
    range: ATTACK_RANGES.MELEE,
    animation: ATTACK_ANIMATIONS.MELEE_SWING,
    color: '#8B4513',
    cost: '1 sp',
    weight: '2 lb',
  },
  DAGGER: {
    name: 'Dagger',
    type: ATTACK_TYPES.MELEE_WEAPON,
    damage: '1d4',
    damageType: DAMAGE_TYPES.PIERCING,
    properties: [WEAPON_PROPERTIES.FINESSE, WEAPON_PROPERTIES.LIGHT, WEAPON_PROPERTIES.THROWN],
    range: ATTACK_RANGES.MELEE,
    thrownRange: { short: ATTACK_RANGES.THROWN_SHORT, long: ATTACK_RANGES.THROWN_LONG },
    animation: ATTACK_ANIMATIONS.MELEE_THRUST,
    color: '#C0C0C0',
    cost: '2 gp',
    weight: '1 lb',
  },
  HANDAXE: {
    name: 'Handaxe',
    type: ATTACK_TYPES.MELEE_WEAPON,
    damage: '1d6',
    damageType: DAMAGE_TYPES.SLASHING,
    properties: [WEAPON_PROPERTIES.LIGHT, WEAPON_PROPERTIES.THROWN],
    range: ATTACK_RANGES.MELEE,
    thrownRange: { short: ATTACK_RANGES.THROWN_SHORT, long: ATTACK_RANGES.THROWN_LONG },
    animation: ATTACK_ANIMATIONS.MELEE_SLASH,
    color: '#8B4513',
    cost: '5 gp',
    weight: '2 lb',
  },
  MACE: {
    name: 'Mace',
    type: ATTACK_TYPES.MELEE_WEAPON,
    damage: '1d6',
    damageType: DAMAGE_TYPES.BLUDGEONING,
    properties: [],
    range: ATTACK_RANGES.MELEE,
    animation: ATTACK_ANIMATIONS.MELEE_SWING,
    color: '#696969',
    cost: '5 gp',
    weight: '4 lb',
  },

  // Martial Melee Weapons
  LONGSWORD: {
    name: 'Longsword',
    type: ATTACK_TYPES.MELEE_WEAPON,
    damage: '1d8',
    damageType: DAMAGE_TYPES.SLASHING,
    properties: [WEAPON_PROPERTIES.VERSATILE],
    versatileDamage: '1d10',
    range: ATTACK_RANGES.MELEE,
    animation: ATTACK_ANIMATIONS.MELEE_SLASH,
    color: '#C0C0C0',
    cost: '15 gp',
    weight: '3 lb',
  },
  SHORTSWORD: {
    name: 'Shortsword',
    type: ATTACK_TYPES.MELEE_WEAPON,
    damage: '1d6',
    damageType: DAMAGE_TYPES.PIERCING,
    properties: [WEAPON_PROPERTIES.FINESSE, WEAPON_PROPERTIES.LIGHT],
    range: ATTACK_RANGES.MELEE,
    animation: ATTACK_ANIMATIONS.MELEE_THRUST,
    color: '#C0C0C0',
    cost: '10 gp',
    weight: '2 lb',
  },
  RAPIER: {
    name: 'Rapier',
    type: ATTACK_TYPES.MELEE_WEAPON,
    damage: '1d8',
    damageType: DAMAGE_TYPES.PIERCING,
    properties: [WEAPON_PROPERTIES.FINESSE],
    range: ATTACK_RANGES.MELEE,
    animation: ATTACK_ANIMATIONS.MELEE_THRUST,
    color: '#C0C0C0',
    cost: '25 gp',
    weight: '2 lb',
  },
  BATTLEAXE: {
    name: 'Battleaxe',
    type: ATTACK_TYPES.MELEE_WEAPON,
    damage: '1d8',
    damageType: DAMAGE_TYPES.SLASHING,
    properties: [WEAPON_PROPERTIES.VERSATILE],
    versatileDamage: '1d10',
    range: ATTACK_RANGES.MELEE,
    animation: ATTACK_ANIMATIONS.MELEE_SLASH,
    color: '#8B4513',
    cost: '10 gp',
    weight: '4 lb',
  },
  GREATAXE: {
    name: 'Greataxe',
    type: ATTACK_TYPES.MELEE_WEAPON,
    damage: '1d12',
    damageType: DAMAGE_TYPES.SLASHING,
    properties: [WEAPON_PROPERTIES.HEAVY, WEAPON_PROPERTIES.TWO_HANDED],
    range: ATTACK_RANGES.MELEE,
    animation: ATTACK_ANIMATIONS.MELEE_SLASH,
    color: '#8B4513',
    cost: '30 gp',
    weight: '7 lb',
  },
  GREATSWORD: {
    name: 'Greatsword',
    type: ATTACK_TYPES.MELEE_WEAPON,
    damage: '2d6',
    damageType: DAMAGE_TYPES.SLASHING,
    properties: [WEAPON_PROPERTIES.HEAVY, WEAPON_PROPERTIES.TWO_HANDED],
    range: ATTACK_RANGES.MELEE,
    animation: ATTACK_ANIMATIONS.MELEE_SLASH,
    color: '#C0C0C0',
    cost: '50 gp',
    weight: '6 lb',
  },

  // Ranged Weapons
  SHORTBOW: {
    name: 'Shortbow',
    type: ATTACK_TYPES.RANGED_WEAPON,
    damage: '1d6',
    damageType: DAMAGE_TYPES.PIERCING,
    properties: [WEAPON_PROPERTIES.AMMUNITION, WEAPON_PROPERTIES.TWO_HANDED],
    range: { short: 80, long: 320 },
    animation: ATTACK_ANIMATIONS.RANGED_PROJECTILE,
    color: '#8B4513',
    cost: '25 gp',
    weight: '2 lb',
  },
  LONGBOW: {
    name: 'Longbow',
    type: ATTACK_TYPES.RANGED_WEAPON,
    damage: '1d8',
    damageType: DAMAGE_TYPES.PIERCING,
    properties: [WEAPON_PROPERTIES.AMMUNITION, WEAPON_PROPERTIES.HEAVY, WEAPON_PROPERTIES.TWO_HANDED],
    range: { short: ATTACK_RANGES.BOW_SHORT, long: ATTACK_RANGES.BOW_LONG },
    animation: ATTACK_ANIMATIONS.RANGED_PROJECTILE,
    color: '#8B4513',
    cost: '50 gp',
    weight: '2 lb',
  },
  LIGHT_CROSSBOW: {
    name: 'Light Crossbow',
    type: ATTACK_TYPES.RANGED_WEAPON,
    damage: '1d8',
    damageType: DAMAGE_TYPES.PIERCING,
    properties: [WEAPON_PROPERTIES.AMMUNITION, WEAPON_PROPERTIES.LOADING, WEAPON_PROPERTIES.TWO_HANDED],
    range: { short: ATTACK_RANGES.CROSSBOW_SHORT, long: ATTACK_RANGES.CROSSBOW_LONG },
    animation: ATTACK_ANIMATIONS.RANGED_PROJECTILE,
    color: '#8B4513',
    cost: '25 gp',
    weight: '5 lb',
  },
  HEAVY_CROSSBOW: {
    name: 'Heavy Crossbow',
    type: ATTACK_TYPES.RANGED_WEAPON,
    damage: '1d10',
    damageType: DAMAGE_TYPES.PIERCING,
    properties: [WEAPON_PROPERTIES.AMMUNITION, WEAPON_PROPERTIES.HEAVY, WEAPON_PROPERTIES.LOADING, WEAPON_PROPERTIES.TWO_HANDED],
    range: { short: 100, long: 400 },
    animation: ATTACK_ANIMATIONS.RANGED_PROJECTILE,
    color: '#8B4513',
    cost: '50 gp',
    weight: '18 lb',
  },

  // Natural Weapons
  BITE: {
    name: 'Bite',
    type: ATTACK_TYPES.NATURAL_WEAPON,
    damage: '1d6',
    damageType: DAMAGE_TYPES.PIERCING,
    properties: [],
    range: ATTACK_RANGES.MELEE,
    animation: ATTACK_ANIMATIONS.NATURAL_BITE,
    color: '#FFFFFF',
    description: 'Natural bite attack',
  },
  CLAW: {
    name: 'Claw',
    type: ATTACK_TYPES.NATURAL_WEAPON,
    damage: '1d4',
    damageType: DAMAGE_TYPES.SLASHING,
    properties: [],
    range: ATTACK_RANGES.MELEE,
    animation: ATTACK_ANIMATIONS.NATURAL_CLAW,
    color: '#8B4513',
    description: 'Natural claw attack',
  },
  TAIL_SLAP: {
    name: 'Tail Slap',
    type: ATTACK_TYPES.NATURAL_WEAPON,
    damage: '1d8',
    damageType: DAMAGE_TYPES.BLUDGEONING,
    properties: [WEAPON_PROPERTIES.REACH],
    range: ATTACK_RANGES.REACH,
    animation: ATTACK_ANIMATIONS.NATURAL_TAIL,
    color: '#654321',
    description: 'Sweeping tail attack',
  },

  // Unarmed Strike
  UNARMED_STRIKE: {
    name: 'Unarmed Strike',
    type: ATTACK_TYPES.UNARMED,
    damage: '1',
    damageType: DAMAGE_TYPES.BLUDGEONING,
    properties: [],
    range: ATTACK_RANGES.MELEE,
    animation: ATTACK_ANIMATIONS.MELEE_SWING,
    color: '#F5DEB3',
    description: 'Basic unarmed attack',
  },
} as const

// Attack Visual Effects
export const ATTACK_VISUALS = {
  IMPACT_FLASH_DURATION: 200,
  PROJECTILE_SPEED: 800, // pixels per second
  TRAIL_LENGTH: 15,
  DAMAGE_NUMBER_DURATION: 2000,
  CRIT_EFFECT_SCALE: 1.5,
  MISS_EFFECT_OPACITY: 0.3,
} as const

// Damage Type Colors (for visual effects)
export const DAMAGE_TYPE_COLORS = {
  [DAMAGE_TYPES.SLASHING]: '#DC143C',
  [DAMAGE_TYPES.PIERCING]: '#C0C0C0',
  [DAMAGE_TYPES.BLUDGEONING]: '#8B4513',
  [DAMAGE_TYPES.ACID]: SPELL_COLORS.ACID,
  [DAMAGE_TYPES.COLD]: SPELL_COLORS.ICE,
  [DAMAGE_TYPES.FIRE]: SPELL_COLORS.FIRE,
  [DAMAGE_TYPES.FORCE]: SPELL_COLORS.FORCE,
  [DAMAGE_TYPES.LIGHTNING]: SPELL_COLORS.LIGHTNING,
  [DAMAGE_TYPES.NECROTIC]: SPELL_COLORS.NECROTIC,
  [DAMAGE_TYPES.POISON]: SPELL_COLORS.POISON,
  [DAMAGE_TYPES.PSYCHIC]: SPELL_COLORS.PSYCHIC,
  [DAMAGE_TYPES.RADIANT]: SPELL_COLORS.RADIANT,
  [DAMAGE_TYPES.THUNDER]: SPELL_COLORS.THUNDER,
} as const

// Critical Hit Settings
export const CRITICAL_HIT = {
  DEFAULT_RANGE: 20, // Natural 20
  IMPROVED_RANGE: 19, // 19-20
  CHAMPION_RANGE: 18, // 18-20
  EFFECT_SCALE: 1.5,
  EFFECT_DURATION: 500,
  SHAKE_INTENSITY: 5,
} as const