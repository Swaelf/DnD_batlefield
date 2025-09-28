import type { UnifiedAction } from '@/types/unifiedAction'
import type { Point } from '@/types/geometry'
import { nanoid } from 'nanoid'

export type InteractionTemplate = Omit<UnifiedAction, 'id' | 'timestamp' | 'source' | 'target'> & {
  templateId: string
  objectType?: string
  requiresCheck?: boolean
  checkDC?: number
}

/**
 * Open Door - Basic door interaction
 * Simple door opening action
 */
export const openDoorTemplate: InteractionTemplate = {
  templateId: 'open-door',
  name: 'Open Door',
  description: 'Opens a standard door',
  type: 'interaction',
  category: 'door',
  tags: ["interaction","exploration"],
  animation: {
    type: 'interaction',
    duration: 1000,
    color: '#8B4513',
    size: 40,
    customParams: {
      swingAngle: 90,
      creakSound: true,
      fadeOnComplete: true
    }
  },
  effects: {
    affectedTargets: [],
    highlightColor: '#8B4513',
    highlightDuration: 1000
  },
  metadata: {
    name: 'Open Door',
    description: 'Opens a standard door'
  },
  duration: 1000,
  objectType: 'door',
  requiresCheck: false
}

/**
 * Locked Door - Requires lockpicking
 * Door that needs a skill check
 */
export const lockedDoorTemplate: InteractionTemplate = {
  templateId: 'locked-door',
  name: 'Locked Door',
  description: 'A locked door requiring lockpicking or a key',
  type: 'interaction',
  category: 'door',
  tags: ["interaction","exploration"],
  animation: {
    type: 'interaction',
    duration: 2000,
    color: '#8B4513',
    size: 40,
    customParams: {
      shakeOnFail: true,
      lockpickEffect: true,
      successGlow: '#FFD700'
    }
  },
  effects: {
    affectedTargets: [],
    highlightColor: '#DC143C',
    highlightDuration: 2000
  },
  metadata: {
    name: 'Unlock Door',
    description: 'Requires lockpicking (DC 15)',
    rollResult: {
      total: 17,
      rolls: [12],
      modifier: 5
    }
  },
  duration: 2000,
  objectType: 'door',
  requiresCheck: true,
  checkDC: 15
}

/**
 * Pull Lever - Activate mechanism
 * Lever or switch activation
 */
export const pullLeverTemplate: InteractionTemplate = {
  templateId: 'pull-lever',
  name: 'Pull Lever',
  description: 'Activates a mechanical lever or switch',
  type: 'interaction',
  category: 'lever',
  tags: ["interaction","exploration"],
  animation: {
    type: 'interaction',
    duration: 800,
    color: '#FFD700',
    size: 30,
    customParams: {
      leverMotion: 'down',
      mechanicalSound: true,
      gearEffect: true
    }
  },
  effects: {
    affectedTargets: [],
    highlightColor: '#FFD700',
    highlightDuration: 1000,
    persistDuration: 500
  },
  metadata: {
    name: 'Pull Lever',
    description: 'Activates a mechanism'
  },
  duration: 800,
  objectType: 'lever',
  requiresCheck: false
}

/**
 * Disarm Trap - Disable trap mechanism
 * Requires skill check to disarm
 */
export const disarmTrapTemplate: InteractionTemplate = {
  templateId: 'disarm-trap',
  name: 'Disarm Trap',
  description: 'Attempts to safely disarm a detected trap',
  type: 'interaction',
  category: 'trap',
  tags: ["interaction","exploration"],
  animation: {
    type: 'interaction',
    duration: 3000,
    color: '#DC143C',
    size: 35,
    customParams: {
      cautionEffect: true,
      tensionPulse: true,
      successFade: true,
      failureFlash: '#FF0000'
    }
  },
  effects: {
    affectedTargets: [],
    highlightColor: '#DC143C',
    highlightDuration: 3000
  },
  metadata: {
    name: 'Disarm Trap',
    description: 'Disable trap mechanism (DC 15)',
    rollResult: {
      total: 18,
      rolls: [14],
      modifier: 4
    }
  },
  duration: 3000,
  objectType: 'trap',
  requiresCheck: true,
  checkDC: 15
}

/**
 * Trigger Trap - Trap activation
 * When a trap is triggered
 */
export const triggerTrapTemplate: InteractionTemplate = {
  templateId: 'trigger-trap',
  name: 'Trigger Trap',
  description: 'Accidentally triggers a trap mechanism',
  type: 'interaction',
  category: 'trap',
  tags: ["interaction","exploration"],
  animation: {
    type: 'interaction',
    duration: 500,
    color: '#FF0000',
    size: 50,
    customParams: {
      dangerFlash: true,
      shockwave: true,
      screenShake: 0.8
    }
  },
  effects: {
    affectedTargets: [],
    areaOfEffect: {
      type: 'circle',
      center: { x: 0, y: 0 },
      radius: 75
    },
    highlightColor: '#FF0000',
    highlightDuration: 1000
  },
  metadata: {
    name: 'Trigger Trap',
    description: 'Trap activated! 2d6 damage',
    rollResult: {
      total: 8,
      rolls: [3, 5],
      modifier: 0
    }
  },
  duration: 500,
  objectType: 'trap',
  requiresCheck: false
}

/**
 * Open Chest - Loot container
 * Opening a treasure chest
 */
export const openChestTemplate: InteractionTemplate = {
  templateId: 'open-chest',
  name: 'Open Chest',
  description: 'Opens a treasure chest or container',
  type: 'interaction',
  category: 'chest',
  tags: ["interaction","exploration"],
  animation: {
    type: 'interaction',
    duration: 1200,
    color: '#DAA520',
    size: 45,
    customParams: {
      lidOpen: true,
      shimmerEffect: true,
      lootGlow: '#FFD700'
    }
  },
  effects: {
    affectedTargets: [],
    highlightColor: '#DAA520',
    highlightDuration: 1500,
    persistDuration: 2000
  },
  metadata: {
    name: 'Open Chest',
    description: 'Opens a treasure chest'
  },
  duration: 1200,
  objectType: 'container',
  requiresCheck: false
}

/**
 * Press Button - Activate button
 * Simple button press
 */
export const pressButtonTemplate: InteractionTemplate = {
  templateId: 'press-button',
  name: 'Press Button',
  description: 'Presses a button or activates a mechanism',
  type: 'interaction',
  category: 'button',
  tags: ["interaction","exploration"],
  animation: {
    type: 'interaction',
    duration: 400,
    color: '#708090',
    size: 25,
    customParams: {
      pressDepth: 5,
      clickSound: true,
      glowOnPress: '#00FF00'
    }
  },
  effects: {
    affectedTargets: [],
    highlightColor: '#00FF00',
    highlightDuration: 600
  },
  metadata: {
    name: 'Press Button',
    description: 'Activates a button'
  },
  duration: 400,
  objectType: 'button',
  requiresCheck: false
}

/**
 * Pressure Plate - Floor trigger
 * Stepped on pressure plate
 */
export const pressurePlateTemplate: InteractionTemplate = {
  templateId: 'pressure-plate',
  name: 'Pressure Plate',
  description: 'Steps on or triggers a pressure plate mechanism',
  type: 'interaction',
  category: 'pressure_plate',
  tags: ["interaction","exploration"],
  animation: {
    type: 'interaction',
    duration: 300,
    color: '#696969',
    size: 60,
    customParams: {
      sinkDepth: 10,
      clickSound: true,
      dustEffect: true
    }
  },
  effects: {
    affectedTargets: [],
    areaOfEffect: {
      type: 'square',
      center: { x: 0, y: 0 },
      size: 50
    },
    highlightColor: '#696969',
    highlightDuration: 500
  },
  metadata: {
    name: 'Pressure Plate',
    description: 'Pressure plate activated'
  },
  duration: 300,
  objectType: 'trigger',
  requiresCheck: false
}

/**
 * Pick Lock - Lockpicking attempt
 * Attempt to pick a lock
 */
export const pickLockTemplate: InteractionTemplate = {
  templateId: 'pick-lock',
  name: 'Pick Lock',
  description: 'Attempts to pick a lock with thieves tools',
  type: 'interaction',
  category: 'lock',
  tags: ["interaction","exploration"],
  animation: {
    type: 'interaction',
    duration: 2500,
    color: '#C0C0C0',
    size: 20,
    customParams: {
      lockpickAnimation: true,
      tumblerEffect: true,
      successClick: true,
      failureRattle: true
    }
  },
  effects: {
    affectedTargets: [],
    highlightColor: '#C0C0C0',
    highlightDuration: 2500
  },
  metadata: {
    name: 'Pick Lock',
    description: 'Lockpicking attempt (DC 12)',
    rollResult: {
      total: 15,
      rolls: [11],
      modifier: 4
    }
  },
  duration: 2500,
  objectType: 'lock',
  requiresCheck: true,
  checkDC: 12
}

/**
 * Search Area - Investigation
 * Search for hidden items
 */
export const searchAreaTemplate: InteractionTemplate = {
  templateId: 'search-area',
  name: 'Search Area',
  description: 'Thoroughly searches an area for hidden items or clues',
  type: 'interaction',
  category: 'search',
  tags: ["interaction","exploration"],
  animation: {
    type: 'interaction',
    duration: 2000,
    color: '#4169E1',
    size: 80,
    customParams: {
      scanEffect: true,
      magnifyingGlass: true,
      sparkleOnFind: true
    }
  },
  effects: {
    affectedTargets: [],
    areaOfEffect: {
      type: 'circle',
      center: { x: 0, y: 0 },
      radius: 100
    },
    highlightColor: '#4169E1',
    highlightDuration: 2000
  },
  metadata: {
    name: 'Search Area',
    description: 'Investigation check (DC 10)',
    rollResult: {
      total: 14,
      rolls: [9],
      modifier: 5
    }
  },
  duration: 2000,
  objectType: 'area',
  requiresCheck: true,
  checkDC: 10
}

/**
 * Create an interaction action from a template
 */
export function createInteractionFromTemplate(
  template: InteractionTemplate,
  source: Point | string,
  target: Point | string[]
): UnifiedAction {
  const action: UnifiedAction = {
    ...template,
    id: nanoid(),
    source,
    target,
    timestamp: Date.now()
  }

  // Update area of effect position
  if (action.effects.areaOfEffect) {
    const interactionPoint = typeof target === 'object' && !Array.isArray(target)
      ? target as Point
      : typeof source === 'object'
        ? source as Point
        : { x: 0, y: 0 }

    switch (action.effects.areaOfEffect.type) {
      case 'circle':
        action.effects.areaOfEffect.center = interactionPoint
        break
      case 'square':
        action.effects.areaOfEffect.center = interactionPoint
        break
    }
  }

  return action
}

/**
 * Get all interaction templates
 */
export function getAllInteractionTemplates(): InteractionTemplate[] {
  return [
    openDoorTemplate,
    lockedDoorTemplate,
    pullLeverTemplate,
    disarmTrapTemplate,
    triggerTrapTemplate,
    openChestTemplate,
    pressButtonTemplate,
    pressurePlateTemplate,
    pickLockTemplate,
    searchAreaTemplate
  ]
}

/**
 * Get interaction templates by object type
 */
export function getInteractionTemplatesByType(objectType: string): InteractionTemplate[] {
  return getAllInteractionTemplates().filter(t => t.objectType === objectType)
}

/**
 * Get interaction templates that require checks
 */
export function getInteractionTemplatesWithChecks(): InteractionTemplate[] {
  return getAllInteractionTemplates().filter(t => t.requiresCheck)
}

/**
 * Get interaction template by ID
 */
export function getInteractionTemplate(templateId: string): InteractionTemplate | undefined {
  return getAllInteractionTemplates().find(t => t.templateId === templateId)
}