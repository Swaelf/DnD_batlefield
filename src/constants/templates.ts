/**
 * Action Templates and Macros
 * Pre-defined action combinations for common D&D scenarios
 */

import { nanoid } from 'nanoid'
import { SEQUENCE_TYPES, SEQUENCE_TIMING, SEQUENCE_PRIORITIES } from './sequences'

// Template Categories
export const TEMPLATE_CATEGORIES = {
  COMBAT: 'combat',
  EXPLORATION: 'exploration',
  SOCIAL: 'social',
  ENVIRONMENTAL: 'environmental',
  UTILITY: 'utility',
} as const

// Combat Action Templates
export const COMBAT_TEMPLATES = {
  CHARGE_ATTACK: {
    id: 'charge-attack',
    name: 'Charge Attack',
    category: TEMPLATE_CATEGORIES.COMBAT,
    description: 'Move to target and attack with bonus damage',
    icon: '⚔️',
    difficulty: 'beginner',
    type: SEQUENCE_TYPES.SIMPLE,
    estimatedDuration: 2000,
    actions: [
      {
        id: nanoid(),
        type: 'move' as const,
        timing: SEQUENCE_TIMING.IMMEDIATE,
        priority: SEQUENCE_PRIORITIES.HIGH,
        description: 'Move to target within melee range',
        modifiers: {
          speedBonus: 10, // Extra movement for charge
        }
      },
      {
        id: nanoid(),
        type: 'attack' as const,
        timing: SEQUENCE_TIMING.IMMEDIATE,
        priority: SEQUENCE_PRIORITIES.NORMAL,
        description: 'Attack with charge bonus',
        conditions: [{ type: 'success' as const }], // Only if move succeeded
        modifiers: {
          damageBonus: '+1d6',
          attackBonus: 2,
        }
      }
    ]
  },

  FULL_ATTACK: {
    id: 'full-attack',
    name: 'Full Attack',
    category: TEMPLATE_CATEGORIES.COMBAT,
    description: 'Multiple attacks with decreasing accuracy',
    icon: '🗡️',
    difficulty: 'intermediate',
    type: SEQUENCE_TYPES.LOOP,
    estimatedDuration: 1500,
    actions: [
      {
        id: nanoid(),
        type: 'attack' as const,
        timing: SEQUENCE_TIMING.IMMEDIATE,
        priority: SEQUENCE_PRIORITIES.NORMAL,
        description: 'Iterative attack with penalties',
        modifiers: {
          attackPenalty: -5, // Cumulative with each iteration
        }
      }
    ],
    loop: {
      type: 'count',
      count: 3,
      condition: { type: 'success' as const }
    }
  },

  FIGHTING_RETREAT: {
    id: 'fighting-retreat',
    name: 'Fighting Retreat',
    category: TEMPLATE_CATEGORIES.COMBAT,
    description: 'Attack then move away defensively',
    icon: '🛡️',
    difficulty: 'beginner',
    type: SEQUENCE_TYPES.SIMPLE,
    estimatedDuration: 2500,
    actions: [
      {
        id: nanoid(),
        type: 'attack' as const,
        timing: SEQUENCE_TIMING.IMMEDIATE,
        priority: SEQUENCE_PRIORITIES.NORMAL,
        description: 'Attack before retreating'
      },
      {
        id: nanoid(),
        type: 'move' as const,
        timing: SEQUENCE_TIMING.IMMEDIATE,
        priority: SEQUENCE_PRIORITIES.HIGH,
        description: 'Move away from enemies',
        modifiers: {
          acBonus: 2, // Defensive movement
          advantage: true, // Avoid opportunity attacks
        }
      }
    ]
  },

  SPELL_STRIKE: {
    id: 'spell-strike',
    name: 'Spell Strike',
    category: TEMPLATE_CATEGORIES.COMBAT,
    description: 'Cast spell then follow up with weapon attack',
    icon: '⚡',
    difficulty: 'advanced',
    type: SEQUENCE_TYPES.CONDITIONAL,
    estimatedDuration: 3000,
    actions: [
      {
        id: nanoid(),
        type: 'spell' as const,
        timing: SEQUENCE_TIMING.IMMEDIATE,
        priority: SEQUENCE_PRIORITIES.HIGH,
        description: 'Cast touch or close-range spell'
      },
      {
        id: nanoid(),
        type: 'attack' as const,
        timing: SEQUENCE_TIMING.IMMEDIATE,
        priority: SEQUENCE_PRIORITIES.NORMAL,
        description: 'Follow-up weapon attack',
        conditions: [{ type: 'success' as const }],
        modifiers: {
          damageBonus: '+1d4', // Spell-enhanced weapon
        }
      }
    ]
  }
} as const

// Exploration Action Templates
export const EXPLORATION_TEMPLATES = {
  STEALTH_SCOUT: {
    id: 'stealth-scout',
    name: 'Stealth Scout',
    category: TEMPLATE_CATEGORIES.EXPLORATION,
    description: 'Move stealthily and observe area',
    icon: '👤',
    difficulty: 'intermediate',
    type: SEQUENCE_TYPES.SIMPLE,
    estimatedDuration: 4000,
    actions: [
      {
        id: nanoid(),
        type: 'move' as const,
        timing: SEQUENCE_TIMING.IMMEDIATE,
        priority: SEQUENCE_PRIORITIES.NORMAL,
        description: 'Move to scouting position',
        modifiers: {
          speedPenalty: -10, // Careful movement
          advantage: true, // Stealth advantage
        }
      },
      {
        id: nanoid(),
        type: 'interaction' as const,
        timing: SEQUENCE_TIMING.DELAYED,
        delay: 1000,
        priority: SEQUENCE_PRIORITIES.LOW,
        description: 'Observe and gather information'
      }
    ]
  },

  TRAP_DETECTION: {
    id: 'trap-detection',
    name: 'Trap Detection & Disarm',
    category: TEMPLATE_CATEGORIES.EXPLORATION,
    description: 'Search for traps then attempt to disarm',
    icon: '🔍',
    difficulty: 'advanced',
    type: SEQUENCE_TYPES.CONDITIONAL,
    estimatedDuration: 6000,
    actions: [
      {
        id: nanoid(),
        type: 'interaction' as const,
        timing: SEQUENCE_TIMING.IMMEDIATE,
        priority: SEQUENCE_PRIORITIES.HIGH,
        description: 'Search for hidden traps'
      },
      {
        id: nanoid(),
        type: 'interaction' as const,
        timing: SEQUENCE_TIMING.DELAYED,
        delay: 2000,
        priority: SEQUENCE_PRIORITIES.HIGH,
        description: 'Attempt to disarm detected trap',
        conditions: [{ type: 'success' as const }]
      }
    ]
  },

  DOOR_BREACH: {
    id: 'door-breach',
    name: 'Door Breach',
    category: TEMPLATE_CATEGORIES.EXPLORATION,
    description: 'Break down door and rush through',
    icon: '🚪',
    difficulty: 'beginner',
    type: SEQUENCE_TYPES.SIMPLE,
    estimatedDuration: 2000,
    actions: [
      {
        id: nanoid(),
        type: 'interaction' as const,
        timing: SEQUENCE_TIMING.IMMEDIATE,
        priority: SEQUENCE_PRIORITIES.HIGH,
        description: 'Attempt to break down door'
      },
      {
        id: nanoid(),
        type: 'move' as const,
        timing: SEQUENCE_TIMING.IMMEDIATE,
        priority: SEQUENCE_PRIORITIES.NORMAL,
        description: 'Rush through opened door',
        conditions: [{ type: 'success' as const }],
        modifiers: {
          speedBonus: 10, // Momentum from breaking door
        }
      }
    ]
  }
} as const

// Environmental Action Templates
export const ENVIRONMENTAL_TEMPLATES = {
  WEATHER_AMBUSH: {
    id: 'weather-ambush',
    name: 'Weather Ambush',
    category: TEMPLATE_CATEGORIES.ENVIRONMENTAL,
    description: 'Create weather effect then ambush from concealment',
    icon: '🌩️',
    difficulty: 'advanced',
    type: SEQUENCE_TYPES.PARALLEL,
    estimatedDuration: 5000,
    actions: [
      {
        id: nanoid(),
        type: 'environmental' as const,
        timing: SEQUENCE_TIMING.IMMEDIATE,
        priority: SEQUENCE_PRIORITIES.HIGH,
        description: 'Create concealing weather'
      },
      {
        id: nanoid(),
        type: 'move' as const,
        timing: SEQUENCE_TIMING.DELAYED,
        delay: 1000,
        priority: SEQUENCE_PRIORITIES.NORMAL,
        description: 'Position for ambush',
        modifiers: {
          advantage: true, // Weather concealment
        }
      },
      {
        id: nanoid(),
        type: 'attack' as const,
        timing: SEQUENCE_TIMING.DELAYED,
        delay: 2000,
        priority: SEQUENCE_PRIORITIES.HIGH,
        description: 'Surprise attack from concealment',
        modifiers: {
          advantage: true,
          damageBonus: '+2d6', // Sneak attack
        }
      }
    ]
  },

  TERRAIN_CONTROL: {
    id: 'terrain-control',
    name: 'Terrain Control',
    category: TEMPLATE_CATEGORIES.ENVIRONMENTAL,
    description: 'Modify terrain to control battlefield',
    icon: '🏔️',
    difficulty: 'intermediate',
    type: SEQUENCE_TYPES.SIMPLE,
    estimatedDuration: 3000,
    actions: [
      {
        id: nanoid(),
        type: 'environmental' as const,
        timing: SEQUENCE_TIMING.IMMEDIATE,
        priority: SEQUENCE_PRIORITIES.HIGH,
        description: 'Create terrain obstacles'
      },
      {
        id: nanoid(),
        type: 'move' as const,
        timing: SEQUENCE_TIMING.IMMEDIATE,
        priority: SEQUENCE_PRIORITIES.NORMAL,
        description: 'Position to take advantage',
        modifiers: {
          advantage: true, // High ground advantage
        }
      }
    ]
  }
} as const

// Utility Action Templates
export const UTILITY_TEMPLATES = {
  QUICK_HEAL: {
    id: 'quick-heal',
    name: 'Quick Heal',
    category: TEMPLATE_CATEGORIES.UTILITY,
    description: 'Cast healing spell and continue fighting',
    icon: '💚',
    difficulty: 'beginner',
    type: SEQUENCE_TYPES.SIMPLE,
    estimatedDuration: 1500,
    actions: [
      {
        id: nanoid(),
        type: 'spell' as const,
        timing: SEQUENCE_TIMING.IMMEDIATE,
        priority: SEQUENCE_PRIORITIES.CRITICAL,
        description: 'Cast healing spell'
      }
    ]
  },

  TACTICAL_WITHDRAWAL: {
    id: 'tactical-withdrawal',
    name: 'Tactical Withdrawal',
    category: TEMPLATE_CATEGORIES.UTILITY,
    description: 'Create diversion and escape safely',
    icon: '🏃',
    difficulty: 'intermediate',
    type: SEQUENCE_TYPES.SIMPLE,
    estimatedDuration: 4000,
    actions: [
      {
        id: nanoid(),
        type: 'spell' as const,
        timing: SEQUENCE_TIMING.IMMEDIATE,
        priority: SEQUENCE_PRIORITIES.HIGH,
        description: 'Create distraction or concealment'
      },
      {
        id: nanoid(),
        type: 'move' as const,
        timing: SEQUENCE_TIMING.DELAYED,
        delay: 500,
        priority: SEQUENCE_PRIORITIES.CRITICAL,
        description: 'Move to safe position',
        modifiers: {
          speedBonus: 20,
          advantage: true, // Diversion helps escape
        }
      }
    ]
  }
} as const

// Combined template library
export const ACTION_TEMPLATES = {
  ...COMBAT_TEMPLATES,
  ...EXPLORATION_TEMPLATES,
  ...ENVIRONMENTAL_TEMPLATES,
  ...UTILITY_TEMPLATES,
} as const

// Template metadata
export const TEMPLATE_METADATA = {
  difficulties: {
    beginner: {
      label: 'Beginner',
      color: '$green500',
      description: 'Simple actions with clear outcomes'
    },
    intermediate: {
      label: 'Intermediate',
      color: '$yellow500',
      description: 'Moderate complexity with conditional logic'
    },
    advanced: {
      label: 'Advanced',
      color: '$red500',
      description: 'Complex sequences with multiple conditions'
    }
  },

  categories: {
    [TEMPLATE_CATEGORIES.COMBAT]: {
      label: 'Combat',
      icon: '⚔️',
      color: '$red600',
      description: 'Attack combinations and combat maneuvers'
    },
    [TEMPLATE_CATEGORIES.EXPLORATION]: {
      label: 'Exploration',
      icon: '🗺️',
      color: '$blue600',
      description: 'Scouting, searching, and navigation'
    },
    [TEMPLATE_CATEGORIES.ENVIRONMENTAL]: {
      label: 'Environmental',
      icon: '🌪️',
      color: '$green600',
      description: 'Weather and terrain manipulation'
    },
    [TEMPLATE_CATEGORIES.UTILITY]: {
      label: 'Utility',
      icon: '🔧',
      color: '$purple600',
      description: 'Support actions and tactical options'
    }
  }
} as const

// Template search and filtering
export const getTemplatesByCategory = (category: keyof typeof TEMPLATE_CATEGORIES) => {
  return Object.values(ACTION_TEMPLATES).filter(
    template => template.category === TEMPLATE_CATEGORIES[category]
  )
}

export const getTemplatesByDifficulty = (difficulty: 'beginner' | 'intermediate' | 'advanced') => {
  return Object.values(ACTION_TEMPLATES).filter(
    template => template.difficulty === difficulty
  )
}

export const searchTemplates = (query: string) => {
  const searchTerm = query.toLowerCase()
  return Object.values(ACTION_TEMPLATES).filter(
    template =>
      template.name.toLowerCase().includes(searchTerm) ||
      template.description.toLowerCase().includes(searchTerm)
  )
}

// Template validation
export const validateTemplate = (template: typeof ACTION_TEMPLATES[keyof typeof ACTION_TEMPLATES]) => {
  const errors: string[] = []

  if (!template.name?.trim()) {
    errors.push('Template name is required')
  }

  if (!template.actions || template.actions.length === 0) {
    errors.push('Template must have at least one action')
  }

  if (template.estimatedDuration && template.estimatedDuration > 30000) {
    errors.push('Template duration should not exceed 30 seconds')
  }

  template.actions?.forEach((action, index) => {
    if (!action.type) {
      errors.push(`Action ${index + 1}: Type is required`)
    }

    if (!action.timing) {
      errors.push(`Action ${index + 1}: Timing is required`)
    }

    if (action.timing === 'delayed' && (!action.delay || action.delay < 0)) {
      errors.push(`Action ${index + 1}: Delay must be specified for delayed timing`)
    }
  })

  return errors
}

// Export helpers
export const exportTemplate = (template: typeof ACTION_TEMPLATES[keyof typeof ACTION_TEMPLATES]) => {
  return JSON.stringify(template, null, 2)
}

export const importTemplate = (templateJson: string) => {
  try {
    const template = JSON.parse(templateJson)
    const errors = validateTemplate(template)

    if (errors.length > 0) {
      throw new Error(`Template validation failed: ${errors.join(', ')}`)
    }

    return template
  } catch (error) {
    throw new Error(`Failed to import template: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}