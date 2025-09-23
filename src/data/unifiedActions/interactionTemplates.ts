import { UnifiedAction } from '@/types/unifiedAction'

export const interactionTemplates: UnifiedAction[] = [
  // Door Interactions
  {
    id: 'open-door-template',
    type: 'interaction',
    category: 'door',
    source: { x: 0, y: 0 }, // Will be set when used
    target: { x: 0, y: 0 }, // Will be set when used
    animation: {
      type: 'glow',
      duration: 800,
      color: '#FFD700',
      size: 30,
      pulse: true
    },
    effects: {
      affectedTargets: [],
      highlightColor: '#FFD700'
    },
    metadata: {
      name: 'Open Door',
      description: 'Attempt to open a door or portal.',
      rollResult: {
        skill: 'Athletics',
        dc: 10,
        success: true
      }
    },
    timestamp: 0,
    duration: 800
  },
  {
    id: 'pick-lock-template',
    type: 'interaction',
    category: 'door',
    source: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    animation: {
      type: 'sparkle',
      duration: 2000,
      color: '#C0C0C0',
      size: 20,
      particles: true
    },
    effects: {
      affectedTargets: [],
      highlightColor: '#C0C0C0'
    },
    metadata: {
      name: 'Pick Lock',
      description: 'Use thieves\' tools to pick a lock.',
      rollResult: {
        skill: 'Sleight of Hand',
        dc: 15,
        success: false
      }
    },
    timestamp: 0,
    duration: 2000
  },

  // Chest Interactions
  {
    id: 'open-chest-template',
    type: 'interaction',
    category: 'chest',
    source: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    animation: {
      type: 'glow',
      duration: 1000,
      color: '#DAA520',
      size: 40,
      radiance: true
    },
    effects: {
      affectedTargets: [],
      highlightColor: '#DAA520'
    },
    metadata: {
      name: 'Open Chest',
      description: 'Open a treasure chest or container.',
      rollResult: {
        skill: 'Investigation',
        dc: 5,
        success: true
      }
    },
    timestamp: 0,
    duration: 1000
  },
  {
    id: 'search-chest-template',
    type: 'interaction',
    category: 'chest',
    source: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    animation: {
      type: 'inspect',
      duration: 1500,
      color: '#87CEEB',
      size: 35,
      scan: true
    },
    effects: {
      affectedTargets: [],
      highlightColor: '#87CEEB'
    },
    metadata: {
      name: 'Search Container',
      description: 'Carefully search a container for hidden compartments or traps.',
      rollResult: {
        skill: 'Investigation',
        dc: 12,
        success: true
      }
    },
    timestamp: 0,
    duration: 1500
  },

  // Trap Interactions
  {
    id: 'disarm-trap-template',
    type: 'interaction',
    category: 'trap',
    source: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    animation: {
      type: 'careful',
      duration: 3000,
      color: '#FF6347',
      size: 25,
      precision: true
    },
    effects: {
      affectedTargets: [],
      highlightColor: '#FF6347'
    },
    metadata: {
      name: 'Disarm Trap',
      description: 'Carefully disable a mechanical trap.',
      rollResult: {
        skill: 'Sleight of Hand',
        dc: 18,
        success: false
      }
    },
    timestamp: 0,
    duration: 3000
  },
  {
    id: 'detect-trap-template',
    type: 'interaction',
    category: 'trap',
    source: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    animation: {
      type: 'scan',
      duration: 2000,
      color: '#FF69B4',
      size: 50,
      sweep: true
    },
    effects: {
      affectedTargets: [],
      highlightColor: '#FF69B4'
    },
    metadata: {
      name: 'Detect Trap',
      description: 'Search for hidden traps in the area.',
      rollResult: {
        skill: 'Perception',
        dc: 15,
        success: true
      }
    },
    timestamp: 0,
    duration: 2000
  },

  // Lever Interactions
  {
    id: 'pull-lever-template',
    type: 'interaction',
    category: 'lever',
    source: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    animation: {
      type: 'mechanical',
      duration: 1200,
      color: '#8B4513',
      size: 30,
      motion: true
    },
    effects: {
      affectedTargets: [],
      highlightColor: '#8B4513'
    },
    metadata: {
      name: 'Pull Lever',
      description: 'Activate a mechanical lever or switch.',
      rollResult: {
        skill: 'Athletics',
        dc: 8,
        success: true
      }
    },
    timestamp: 0,
    duration: 1200
  },

  // Switch Interactions
  {
    id: 'press-button-template',
    type: 'interaction',
    category: 'button',
    source: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    animation: {
      type: 'pulse',
      duration: 600,
      color: '#32CD32',
      size: 20,
      quick: true
    },
    effects: {
      affectedTargets: [],
      highlightColor: '#32CD32'
    },
    metadata: {
      name: 'Press Button',
      description: 'Press a button or activation switch.',
      rollResult: {
        skill: 'Investigation',
        dc: 5,
        success: true
      }
    },
    timestamp: 0,
    duration: 600
  },

  // Portal Interactions
  {
    id: 'activate-portal-template',
    type: 'interaction',
    category: 'portal',
    source: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    animation: {
      type: 'vortex',
      duration: 2500,
      color: '#9370DB',
      size: 80,
      swirl: true
    },
    effects: {
      affectedTargets: [],
      highlightColor: '#9370DB'
    },
    metadata: {
      name: 'Activate Portal',
      description: 'Channel energy to activate a magical portal.',
      rollResult: {
        skill: 'Arcana',
        dc: 16,
        success: false
      }
    },
    timestamp: 0,
    duration: 2500
  },

  // Shrine Interactions
  {
    id: 'pray-shrine-template',
    type: 'interaction',
    category: 'shrine',
    source: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    animation: {
      type: 'divine',
      duration: 3000,
      color: '#FFD700',
      size: 60,
      radiance: true
    },
    effects: {
      affectedTargets: [],
      highlightColor: '#FFD700'
    },
    metadata: {
      name: 'Pray at Shrine',
      description: 'Offer prayers at a divine shrine.',
      rollResult: {
        skill: 'Religion',
        dc: 12,
        success: true
      }
    },
    timestamp: 0,
    duration: 3000
  }
]