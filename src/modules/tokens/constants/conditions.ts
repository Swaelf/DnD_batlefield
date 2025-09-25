/**
 * D&D 5e Condition Constants and Definitions
 */

import type { ConditionType, ConditionVisual, ConditionValidation, ConditionInteraction } from '../types'

// D&D 5e condition visual definitions
export const CONDITION_VISUALS: Record<ConditionType, ConditionVisual> = {
  blinded: {
    name: 'Blinded',
    description: 'Cannot see and automatically fails sight-based checks',
    color: '#000000',
    icon: 'eye-off',
    animation: 'none',
    priority: 8
  },
  charmed: {
    name: 'Charmed',
    description: 'Cannot attack the charmer or target with harmful abilities',
    color: '#FF69B4',
    icon: 'heart',
    animation: 'pulse',
    priority: 5
  },
  deafened: {
    name: 'Deafened',
    description: 'Cannot hear and automatically fails hearing-based checks',
    color: '#708090',
    icon: 'volume-x',
    animation: 'none',
    priority: 7
  },
  frightened: {
    name: 'Frightened',
    description: 'Disadvantage on ability checks and attacks while source is in sight',
    color: '#FF4500',
    icon: 'alert-triangle',
    animation: 'blink',
    priority: 6
  },
  grappled: {
    name: 'Grappled',
    description: 'Speed becomes 0 and cannot benefit from bonuses to speed',
    color: '#8B4513',
    icon: 'link',
    animation: 'none',
    priority: 4
  },
  incapacitated: {
    name: 'Incapacitated',
    description: 'Cannot take actions or reactions',
    color: '#696969',
    icon: 'pause',
    animation: 'none',
    priority: 9
  },
  invisible: {
    name: 'Invisible',
    description: 'Impossible to see without special senses',
    color: '#D3D3D3',
    icon: 'eye-off',
    opacity: 0.3,
    animation: 'pulse',
    priority: 3
  },
  paralyzed: {
    name: 'Paralyzed',
    description: 'Incapacitated and cannot move or speak',
    color: '#4169E1',
    icon: 'zap-off',
    animation: 'none',
    priority: 10
  },
  petrified: {
    name: 'Petrified',
    description: 'Transformed into solid inanimate substance',
    color: '#808080',
    icon: 'hexagon',
    animation: 'none',
    priority: 12
  },
  poisoned: {
    name: 'Poisoned',
    description: 'Disadvantage on attack rolls and ability checks',
    color: '#4B0082',
    icon: 'skull',
    animation: 'pulse',
    priority: 5
  },
  prone: {
    name: 'Prone',
    description: 'Lying down, disadvantage on attack rolls',
    color: '#8B4513',
    icon: 'chevron-down',
    animation: 'none',
    priority: 2
  },
  restrained: {
    name: 'Restrained',
    description: 'Speed becomes 0, disadvantage on attacks and dex saves',
    color: '#808080',
    icon: 'lock',
    animation: 'none',
    priority: 8
  },
  stunned: {
    name: 'Stunned',
    description: 'Incapacitated, cannot move, and can speak falteringly',
    color: '#FFD700',
    icon: 'zap',
    animation: 'spin',
    priority: 11
  },
  unconscious: {
    name: 'Unconscious',
    description: 'Incapacitated, cannot move or speak, unaware of surroundings',
    color: '#2F4F4F',
    icon: 'moon',
    animation: 'none',
    priority: 13
  }
} as const

// Condition validation rules
export const CONDITION_VALIDATIONS: Record<ConditionType, ConditionValidation> = {
  blinded: {
    condition: 'blinded',
    canStack: false,
    conflicts: [],
    prerequisites: undefined,
    automaticRemoval: undefined
  },
  charmed: {
    condition: 'charmed',
    canStack: false,
    conflicts: ['frightened'],
    prerequisites: undefined,
    automaticRemoval: undefined
  },
  deafened: {
    condition: 'deafened',
    canStack: false,
    conflicts: [],
    prerequisites: undefined,
    automaticRemoval: undefined
  },
  frightened: {
    condition: 'frightened',
    canStack: false,
    conflicts: ['charmed'],
    prerequisites: undefined,
    automaticRemoval: undefined
  },
  grappled: {
    condition: 'grappled',
    canStack: false,
    conflicts: [],
    prerequisites: undefined,
    automaticRemoval: ['unconscious', 'incapacitated']
  },
  incapacitated: {
    condition: 'incapacitated',
    canStack: false,
    conflicts: [],
    prerequisites: undefined,
    automaticRemoval: undefined
  },
  invisible: {
    condition: 'invisible',
    canStack: false,
    conflicts: [],
    prerequisites: undefined,
    automaticRemoval: undefined
  },
  paralyzed: {
    condition: 'paralyzed',
    canStack: false,
    conflicts: [],
    prerequisites: undefined,
    automaticRemoval: undefined
  },
  petrified: {
    condition: 'petrified',
    canStack: false,
    conflicts: ['paralyzed', 'unconscious', 'stunned'],
    prerequisites: undefined,
    automaticRemoval: undefined
  },
  poisoned: {
    condition: 'poisoned',
    canStack: false,
    conflicts: [],
    prerequisites: undefined,
    automaticRemoval: undefined
  },
  prone: {
    condition: 'prone',
    canStack: false,
    conflicts: [],
    prerequisites: undefined,
    automaticRemoval: ['unconscious']
  },
  restrained: {
    condition: 'restrained',
    canStack: false,
    conflicts: [],
    prerequisites: undefined,
    automaticRemoval: ['unconscious', 'incapacitated']
  },
  stunned: {
    condition: 'stunned',
    canStack: false,
    conflicts: ['petrified'],
    prerequisites: undefined,
    automaticRemoval: undefined
  },
  unconscious: {
    condition: 'unconscious',
    canStack: false,
    conflicts: ['petrified'],
    prerequisites: undefined,
    automaticRemoval: undefined
  }
} as const

// Condition interaction rules
export const CONDITION_INTERACTIONS: readonly ConditionInteraction[] = [
  {
    primary: 'unconscious',
    secondary: 'prone',
    interaction: 'upgrades',
    description: 'Unconscious creatures are automatically prone'
  },
  {
    primary: 'paralyzed',
    secondary: 'incapacitated',
    interaction: 'upgrades',
    description: 'Paralyzed creatures are incapacitated'
  },
  {
    primary: 'petrified',
    secondary: 'paralyzed',
    interaction: 'replaces',
    description: 'Petrification replaces paralysis'
  },
  {
    primary: 'petrified',
    secondary: 'unconscious',
    interaction: 'replaces',
    description: 'Petrification replaces unconsciousness'
  },
  {
    primary: 'stunned',
    secondary: 'incapacitated',
    interaction: 'upgrades',
    description: 'Stunned creatures are incapacitated'
  },
  {
    primary: 'unconscious',
    secondary: 'incapacitated',
    interaction: 'upgrades',
    description: 'Unconscious creatures are incapacitated'
  },
  {
    primary: 'charmed',
    secondary: 'frightened',
    interaction: 'blocks',
    description: 'Cannot be charmed and frightened by the same source'
  }
] as const

// Condition priority order (higher number = higher priority)
export const CONDITION_PRIORITIES: Record<ConditionType, number> = Object.fromEntries(
  Object.entries(CONDITION_VISUALS).map(([condition, visual]) => [
    condition,
    visual.priority
  ])
) as Record<ConditionType, number>

// Get condition by name (case insensitive)
export function getConditionByName(name: string): ConditionType | null {
  const normalizedName = name.toLowerCase().trim()

  for (const [condition, visual] of Object.entries(CONDITION_VISUALS)) {
    if (visual.name.toLowerCase() === normalizedName) {
      return condition as ConditionType
    }
  }

  return null
}

// Check if condition is valid D&D 5e condition
export function isValidCondition(condition: string): condition is ConditionType {
  return condition in CONDITION_VISUALS
}

// Get conditions sorted by priority
export function getConditionsByPriority(): readonly ConditionType[] {
  return Object.keys(CONDITION_VISUALS).sort((a, b) => {
    const priorityA = CONDITION_VISUALS[a as ConditionType].priority
    const priorityB = CONDITION_VISUALS[b as ConditionType].priority
    return priorityB - priorityA // Higher priority first
  }) as readonly ConditionType[]
}

// Get condition visual by type
export function getConditionVisual(condition: ConditionType): ConditionVisual {
  return CONDITION_VISUALS[condition]
}

// Get condition validation by type
export function getConditionValidation(condition: ConditionType): ConditionValidation {
  return CONDITION_VALIDATIONS[condition]
}

// Check if conditions conflict
export function doConditionsConflict(condition1: ConditionType, condition2: ConditionType): boolean {
  const validation1 = CONDITION_VALIDATIONS[condition1]
  const validation2 = CONDITION_VALIDATIONS[condition2]

  return validation1.conflicts.includes(condition2) ||
         validation2.conflicts.includes(condition1)
}

// Get condition interaction if any
export function getConditionInteraction(
  condition1: ConditionType,
  condition2: ConditionType
): ConditionInteraction | null {
  return CONDITION_INTERACTIONS.find(
    interaction =>
      (interaction.primary === condition1 && interaction.secondary === condition2) ||
      (interaction.primary === condition2 && interaction.secondary === condition1)
  ) || null
}