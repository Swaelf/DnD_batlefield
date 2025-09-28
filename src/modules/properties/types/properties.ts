/**
 * Properties Module Types
 *
 * Type definitions for the modular property editing system following atomic design patterns.
 * Extends existing map object types with comprehensive D&D property management.
 */

// Import and re-export core object types from the centralized type system
import type {
  MapObject,
  Shape,
  Text,
  Token,
  TokenSize
} from '@/types'

export type {
  MapObject,
  Shape,
  Text,
  Token,
  TokenSize
}

// Re-export base types for property editing
export type { Point as Position } from '@/types/geometry'

// Module-specific branded types for type safety
export type PropertyId = string & { readonly __brand: 'PropertyId' }
export type PropertyGroupId = string & { readonly __brand: 'PropertyGroupId' }
export type ValidationRuleId = string & { readonly __brand: 'ValidationRuleId' }
export type PropertyFieldId = string & { readonly __brand: 'PropertyFieldId' }

/**
 * Property field definition with validation and D&D rules
 */
export type PropertyField = {
  readonly id: PropertyFieldId
  readonly key: string
  readonly label: string
  readonly type: PropertyFieldType
  readonly required: boolean
  readonly validation?: ValidationRule[]
  readonly dndRule?: DNDValidationRule
  readonly defaultValue?: unknown
  readonly options?: PropertyFieldOption[]
  readonly min?: number
  readonly max?: number
  readonly step?: number
  readonly placeholder?: string
  readonly helpText?: string
  readonly groupId?: PropertyGroupId
}

/**
 * Property field types for different input components
 */
export type PropertyFieldType =
  | 'text'
  | 'number'
  | 'color'
  | 'boolean'
  | 'select'
  | 'multiselect'
  | 'range'
  | 'position'
  | 'size'
  | 'dnd-size'     // D&D creature size
  | 'dnd-speed'    // D&D movement speed
  | 'dnd-stat'     // D&D ability score
  | 'dnd-ac'       // D&D armor class
  | 'dnd-hp'       // D&D hit points
  | 'condition'    // D&D conditions

/**
 * Property field options for select fields
 */
export type PropertyFieldOption = {
  readonly value: string | number
  readonly label: string
  readonly description?: string
  readonly icon?: string
  readonly dndOfficial?: boolean
}

/**
 * Validation rules for property fields
 */
export type ValidationRule = {
  readonly id: ValidationRuleId
  readonly type: 'required' | 'min' | 'max' | 'pattern' | 'custom'
  readonly value?: unknown
  readonly message: string
  readonly validator?: (value: unknown) => boolean
}

/**
 * D&D-specific validation rules
 */
export type DNDValidationRule = {
  readonly type: 'creature-size' | 'movement-speed' | 'ability-score' | 'armor-class' | 'hit-points' | 'spell-level'
  readonly enforceOfficial: boolean
  readonly allowCustom: boolean
  readonly warningMessage?: string
}

/**
 * Property groups for organizing fields
 */
export type PropertyGroup = {
  readonly id: PropertyGroupId
  readonly name: string
  readonly description?: string
  readonly icon?: string
  readonly collapsible: boolean
  readonly defaultExpanded: boolean
  readonly order: number
  readonly conditional?: PropertyCondition
}

/**
 * Conditional display of property groups or fields
 */
export type PropertyCondition = {
  readonly field: string
  readonly operator: 'equals' | 'not-equals' | 'in' | 'not-in' | 'greater' | 'less'
  readonly value: unknown
}

/**
 * Property schema for different object types
 */
export type PropertySchema = {
  readonly objectType: MapObject['type']
  readonly groups: readonly PropertyGroup[]
  readonly fields: readonly PropertyField[]
  readonly validation: readonly ValidationRule[]
  readonly dndCompliant: boolean
}

/**
 * Property values for an object instance
 */
export type PropertyValues = {
  readonly objectId: string
  readonly objectType: MapObject['type']
  readonly values: Record<string, unknown>
  readonly isValid: boolean
  readonly errors: Record<string, string[]>
  readonly warnings: Record<string, string[]>
  readonly lastModified: Date
}

/**
 * Property change event
 */
export type PropertyChange = {
  readonly objectId: string
  readonly field: string
  readonly oldValue: unknown
  readonly newValue: unknown
  readonly timestamp: Date
  readonly isValid: boolean
  readonly errors?: string[]
  readonly warnings?: string[]
}

/**
 * Multi-object property editing state
 */
export type MultiPropertyState = {
  readonly selectedObjectIds: readonly string[]
  readonly commonProperties: Record<string, unknown>
  readonly mixedProperties: Set<string>
  readonly canBatchEdit: boolean
  readonly affectedCount: number
}

/**
 * D&D creature stats for tokens
 */
export type DNDCreatureStats = {
  readonly armorClass: number
  readonly hitPoints: {
    readonly current: number
    readonly maximum: number
    readonly temporary: number
  }
  readonly speed: {
    readonly walk: number
    readonly fly?: number
    readonly swim?: number
    readonly climb?: number
    readonly burrow?: number
  }
  readonly abilities: {
    readonly strength: number
    readonly dexterity: number
    readonly constitution: number
    readonly intelligence: number
    readonly wisdom: number
    readonly charisma: number
  }
  readonly savingThrows?: Record<string, number>
  readonly skills?: Record<string, number>
  readonly damageResistances?: readonly string[]
  readonly damageImmunities?: readonly string[]
  readonly conditionImmunities?: readonly string[]
  readonly senses?: Record<string, number>
  readonly languages?: readonly string[]
  readonly challengeRating?: string
  readonly proficiencyBonus?: number
}

/**
 * D&D conditions that can affect creatures
 */
export type DNDCondition = {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly icon: string
  readonly color: string
  readonly stackable: boolean
  readonly duration?: 'instant' | 'round' | 'minute' | 'hour' | 'day' | 'permanent'
  readonly effects: readonly string[]
  readonly source?: string
}

/**
 * Extended token with D&D properties
 */
export type DNDToken = Token & {
  readonly stats?: DNDCreatureStats
  readonly conditions?: readonly DNDCondition[]
  readonly initiative?: number
  readonly isPlayer?: boolean
  readonly isNPC?: boolean
  readonly isMonster?: boolean
  readonly creatureType?: 'aberration' | 'beast' | 'celestial' | 'construct' | 'dragon' | 'elemental' | 'fey' | 'fiend' | 'giant' | 'humanoid' | 'monstrosity' | 'ooze' | 'plant' | 'undead'
}

/**
 * Property editing configuration
 */
export type PropertyConfig = {
  readonly enableDNDValidation: boolean
  readonly enforceOfficialRules: boolean
  readonly allowCustomProperties: boolean
  readonly showHelpText: boolean
  readonly showWarnings: boolean
  readonly autoSave: boolean
  readonly autoSaveDelay: number
  readonly validationDelay: number
}

/**
 * Property field validation result
 */
export type PropertyValidationResult = {
  readonly field: string
  readonly isValid: boolean
  readonly errors: readonly string[]
  readonly warnings: readonly string[]
  readonly dndCompliant: boolean
}

/**
 * Batch property update operation
 */
export type PropertyBatchUpdate = {
  readonly objectIds: readonly string[]
  readonly changes: Record<string, unknown>
  readonly skipValidation: boolean
  readonly reason: string
}

/**
 * Property history entry for undo/redo
 */
export type PropertyHistoryEntry = {
  readonly id: string
  readonly timestamp: Date
  readonly objectIds: readonly string[]
  readonly changes: readonly PropertyChange[]
  readonly description: string
  readonly canUndo: boolean
}

/**
 * Default D&D conditions
 */
export const DND_CONDITIONS: Record<string, DNDCondition> = {
  blinded: {
    id: 'blinded',
    name: 'Blinded',
    description: 'A blinded creature can\'t see and automatically fails ability checks that require sight.',
    icon: 'eye-off',
    color: '#6b7280',
    stackable: false,
    effects: ['disadvantage on attack rolls', 'attackers have advantage']
  },
  charmed: {
    id: 'charmed',
    name: 'Charmed',
    description: 'A charmed creature can\'t attack the charmer or target the charmer with harmful abilities.',
    icon: 'heart',
    color: '#ec4899',
    stackable: false,
    effects: ['cannot attack charmer', 'charmer has advantage on social interactions']
  },
  deafened: {
    id: 'deafened',
    name: 'Deafened',
    description: 'A deafened creature can\'t hear and automatically fails ability checks that require hearing.',
    icon: 'volume-x',
    color: '#6b7280',
    stackable: false,
    effects: ['cannot hear', 'fails hearing-based checks']
  },
  frightened: {
    id: 'frightened',
    name: 'Frightened',
    description: 'A frightened creature has disadvantage on ability checks and attack rolls while the source is in sight.',
    icon: 'alert-triangle',
    color: '#f59e0b',
    stackable: false,
    effects: ['disadvantage on checks and attacks', 'cannot willingly move closer to source']
  },
  grappled: {
    id: 'grappled',
    name: 'Grappled',
    description: 'A grappled creature\'s speed becomes 0, and it can\'t benefit from bonuses to speed.',
    icon: 'link',
    color: '#8b5cf6',
    stackable: false,
    effects: ['speed becomes 0', 'cannot benefit from speed bonuses']
  },
  incapacitated: {
    id: 'incapacitated',
    name: 'Incapacitated',
    description: 'An incapacitated creature can\'t take actions or reactions.',
    icon: 'pause',
    color: '#ef4444',
    stackable: false,
    effects: ['cannot take actions', 'cannot take reactions']
  },
  invisible: {
    id: 'invisible',
    name: 'Invisible',
    description: 'An invisible creature is impossible to see without special senses.',
    icon: 'ghost',
    color: '#a3a3a3',
    stackable: false,
    effects: ['heavily obscured', 'attack rolls have advantage', 'attackers have disadvantage']
  },
  paralyzed: {
    id: 'paralyzed',
    name: 'Paralyzed',
    description: 'A paralyzed creature is incapacitated and can\'t move or speak.',
    icon: 'pause-circle',
    color: '#dc2626',
    stackable: false,
    effects: ['incapacitated', 'cannot move or speak', 'fails Str and Dex saves', 'melee attacks within 5ft auto-crit']
  },
  poisoned: {
    id: 'poisoned',
    name: 'Poisoned',
    description: 'A poisoned creature has disadvantage on attack rolls and ability checks.',
    icon: 'droplet',
    color: '#22c55e',
    stackable: false,
    effects: ['disadvantage on attacks', 'disadvantage on ability checks']
  },
  prone: {
    id: 'prone',
    name: 'Prone',
    description: 'A prone creature\'s only movement option is to crawl, unless it stands up.',
    icon: 'trending-down',
    color: '#92400e',
    stackable: false,
    effects: ['disadvantage on attacks', 'melee attackers have advantage', 'ranged attackers have disadvantage']
  },
  restrained: {
    id: 'restrained',
    name: 'Restrained',
    description: 'A restrained creature\'s speed becomes 0 and has disadvantage on attacks.',
    icon: 'lock',
    color: '#7c3aed',
    stackable: false,
    effects: ['speed becomes 0', 'disadvantage on attacks', 'disadvantage on Dex saves', 'attackers have advantage']
  },
  stunned: {
    id: 'stunned',
    name: 'Stunned',
    description: 'A stunned creature is incapacitated and automatically fails Strength and Dexterity saves.',
    icon: 'zap-off',
    color: '#f97316',
    stackable: false,
    effects: ['incapacitated', 'fails Str and Dex saves', 'attackers have advantage']
  },
  unconscious: {
    id: 'unconscious',
    name: 'Unconscious',
    description: 'An unconscious creature is incapacitated, drops items, falls prone, and is unaware.',
    icon: 'moon',
    color: '#1f2937',
    stackable: false,
    effects: ['incapacitated', 'drops items', 'falls prone', 'fails Str and Dex saves', 'melee attacks within 5ft auto-crit']
  }
} as const

/**
 * D&D creature sizes with grid information
 */
export const DND_CREATURE_SIZES = {
  tiny: { gridSquares: 0.5, feet: 2.5, examples: ['Imp', 'Sprite'] },
  small: { gridSquares: 1, feet: 5, examples: ['Goblin', 'Halfling'] },
  medium: { gridSquares: 1, feet: 5, examples: ['Human', 'Elf', 'Dwarf'] },
  large: { gridSquares: 2, feet: 10, examples: ['Ogre', 'Horse'] },
  huge: { gridSquares: 3, feet: 15, examples: ['Giant', 'Dragon'] },
  gargantuan: { gridSquares: 4, feet: 20, examples: ['Ancient Dragon', 'Kraken'] }
} as const

/**
 * Type guards for property type safety
 */
export const isPropertyField = (obj: unknown): obj is PropertyField => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'key' in obj &&
    'type' in obj &&
    typeof (obj as any).id === 'string' &&
    typeof (obj as any).key === 'string'
  )
}

export const isDNDToken = (obj: unknown): obj is DNDToken => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'type' in obj &&
    (obj as any).type === 'token'
  )
}

/**
 * Brand utility functions for type-safe ID creation
 */
export const createPropertyId = (id: string): PropertyId => id as PropertyId
export const createPropertyGroupId = (id: string): PropertyGroupId => id as PropertyGroupId
export const createValidationRuleId = (id: string): ValidationRuleId => id as ValidationRuleId
export const createPropertyFieldId = (id: string): PropertyFieldId => id as PropertyFieldId