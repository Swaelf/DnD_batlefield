/**
 * D&D 5e specific types for the MapMaker application
 * These types ensure authenticity to D&D rules and conventions
 */

// D&D 5e creature sizes with grid implications
export type TokenSize =
  | 'tiny'      // 0.5x0.5 squares (2.5ft)
  | 'small'     // 1x1 squares (5ft)
  | 'medium'    // 1x1 squares (5ft)
  | 'large'     // 2x2 squares (10ft)
  | 'huge'      // 3x3 squares (15ft)
  | 'gargantuan' // 4x4+ squares (20ft+)

// D&D alignment system
export type Alignment =
  | 'lawful good' | 'neutral good' | 'chaotic good'
  | 'lawful neutral' | 'true neutral' | 'chaotic neutral'
  | 'lawful evil' | 'neutral evil' | 'chaotic evil'

// D&D ability scores
export type AbilityScore = 'strength' | 'dexterity' | 'constitution' | 'intelligence' | 'wisdom' | 'charisma'

// D&D damage types
export type DamageType =
  | 'acid' | 'bludgeoning' | 'cold' | 'fire' | 'force' | 'lightning'
  | 'necrotic' | 'piercing' | 'poison' | 'psychic' | 'radiant' | 'slashing' | 'thunder'

// D&D spell schools
export type SpellSchool =
  | 'abjuration' | 'conjuration' | 'divination' | 'enchantment'
  | 'evocation' | 'illusion' | 'necromancy' | 'transmutation'

// D&D spell levels
export type SpellLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

// D&D creature types
export type CreatureType =
  | 'aberration' | 'beast' | 'celestial' | 'construct' | 'dragon'
  | 'elemental' | 'fey' | 'fiend' | 'giant' | 'humanoid'
  | 'monstrosity' | 'ooze' | 'plant' | 'undead'

// D&D conditions
export type Condition =
  | 'blinded' | 'charmed' | 'deafened' | 'frightened' | 'grappled'
  | 'incapacitated' | 'invisible' | 'paralyzed' | 'petrified' | 'poisoned'
  | 'prone' | 'restrained' | 'stunned' | 'unconscious'

// D&D movement types
export type MovementType = 'walk' | 'fly' | 'swim' | 'climb' | 'burrow'

// D&D ranges
export type SpellRange =
  | 'self' | 'touch' | 'sight' | 'unlimited'
  | { type: 'feet'; distance: number }
  | { type: 'miles'; distance: number }

// D&D area of effect shapes
export type AreaOfEffect =
  | { shape: 'sphere'; radius: number }
  | { shape: 'cube'; size: number }
  | { shape: 'cylinder'; radius: number; height: number }
  | { shape: 'line'; width: number; length: number }
  | { shape: 'cone'; length: number }

// D&D dice notation
export type DiceRoll = {
  readonly count: number
  readonly sides: 4 | 6 | 8 | 10 | 12 | 20 | 100
  readonly modifier?: number
}

// D&D weapon properties
export type WeaponProperty =
  | 'ammunition' | 'finesse' | 'heavy' | 'light' | 'loading'
  | 'range' | 'reach' | 'special' | 'thrown' | 'two-handed' | 'versatile'

// Grid positioning for D&D
export type GridPosition = {
  readonly col: number
  readonly row: number
}