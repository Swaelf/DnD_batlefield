import { UnifiedAction } from '@/types/unifiedAction'

export const moveTemplates: UnifiedAction[] = [
  // Basic Movement
  {
    id: 'walk-template',
    type: 'move',
    category: 'walk',
    source: { x: 0, y: 0 }, // Will be set when used
    target: { x: 0, y: 0 }, // Will be set when used
    animation: {
      type: 'movement',
      duration: 1000,
      color: '#4A90E2',
      size: 0,
      easing: 'linear'
    },
    effects: {
      affectedTargets: [],
      highlightColor: '#4A90E2'
    },
    metadata: {
      name: 'Walk',
      description: 'Move at normal walking speed.',
      rollResult: {
        skill: 'Athletics',
        dc: 0,
        success: true
      }
    },
    timestamp: 0,
    duration: 1000
  },
  {
    id: 'dash-template',
    type: 'move',
    category: 'dash',
    source: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    animation: {
      type: 'movement',
      duration: 600,
      color: '#FFD700',
      size: 0,
      easing: 'ease-out',
      speed: 'fast'
    },
    effects: {
      affectedTargets: [],
      highlightColor: '#FFD700'
    },
    metadata: {
      name: 'Dash',
      description: 'Move at double speed using your action.',
      rollResult: {
        skill: 'Athletics',
        dc: 0,
        success: true
      }
    },
    timestamp: 0,
    duration: 600
  },
  {
    id: 'charge-template',
    type: 'move',
    category: 'charge',
    source: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    animation: {
      type: 'movement',
      duration: 800,
      color: '#FF6B47',
      size: 0,
      easing: 'ease-in',
      trail: true
    },
    effects: {
      affectedTargets: [],
      highlightColor: '#FF6B47'
    },
    metadata: {
      name: 'Charge',
      description: 'Move in a straight line toward an enemy for an attack.',
      rollResult: {
        skill: 'Athletics',
        dc: 10,
        success: true
      }
    },
    timestamp: 0,
    duration: 800
  },

  // Stealth Movement
  {
    id: 'sneak-template',
    type: 'move',
    category: 'stealth',
    source: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    animation: {
      type: 'movement',
      duration: 1500,
      color: '#6A4C93',
      size: 0,
      easing: 'ease-in-out',
      opacity: 0.5
    },
    effects: {
      affectedTargets: [],
      highlightColor: '#6A4C93'
    },
    metadata: {
      name: 'Sneak',
      description: 'Move stealthily to avoid detection.',
      rollResult: {
        skill: 'Stealth',
        dc: 12,
        success: true
      }
    },
    timestamp: 0,
    duration: 1500
  },

  // Difficult Movement
  {
    id: 'climb-template',
    type: 'move',
    category: 'climb',
    source: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    animation: {
      type: 'movement',
      duration: 2000,
      color: '#8B4513',
      size: 0,
      easing: 'ease-in-out',
      vertical: true
    },
    effects: {
      affectedTargets: [],
      highlightColor: '#8B4513'
    },
    metadata: {
      name: 'Climb',
      description: 'Climb up walls, cliffs, or other vertical surfaces.',
      rollResult: {
        skill: 'Athletics',
        dc: 15,
        success: true
      }
    },
    timestamp: 0,
    duration: 2000
  },
  {
    id: 'swim-template',
    type: 'move',
    category: 'swim',
    source: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    animation: {
      type: 'movement',
      duration: 1800,
      color: '#4ECDC4',
      size: 0,
      easing: 'ease-in-out',
      fluid: true
    },
    effects: {
      affectedTargets: [],
      highlightColor: '#4ECDC4'
    },
    metadata: {
      name: 'Swim',
      description: 'Move through water or other liquid terrain.',
      rollResult: {
        skill: 'Athletics',
        dc: 12,
        success: true
      }
    },
    timestamp: 0,
    duration: 1800
  },

  // Special Movement
  {
    id: 'fly-template',
    type: 'move',
    category: 'fly',
    source: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    animation: {
      type: 'movement',
      duration: 800,
      color: '#B19CD9',
      size: 0,
      easing: 'ease-out',
      elevation: true
    },
    effects: {
      affectedTargets: [],
      highlightColor: '#B19CD9'
    },
    metadata: {
      name: 'Fly',
      description: 'Move through the air using magical or natural flight.',
      rollResult: {
        skill: 'Acrobatics',
        dc: 10,
        success: true
      }
    },
    timestamp: 0,
    duration: 800
  },
  {
    id: 'teleport-template',
    type: 'move',
    category: 'teleport',
    source: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    animation: {
      type: 'teleport',
      duration: 400,
      color: '#9370DB',
      size: 40,
      instant: true
    },
    effects: {
      affectedTargets: [],
      highlightColor: '#9370DB'
    },
    metadata: {
      name: 'Teleport',
      description: 'Instantly transport to a different location.',
      rollResult: {
        skill: 'Arcana',
        dc: 15,
        success: true
      }
    },
    timestamp: 0,
    duration: 400
  },

  // Retreat Movement
  {
    id: 'withdraw-template',
    type: 'move',
    category: 'withdraw',
    source: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    animation: {
      type: 'movement',
      duration: 1200,
      color: '#FFA500',
      size: 0,
      easing: 'ease-out',
      cautious: true
    },
    effects: {
      affectedTargets: [],
      highlightColor: '#FFA500'
    },
    metadata: {
      name: 'Withdraw',
      description: 'Carefully move away from enemies without provoking attacks.',
      rollResult: {
        skill: 'Acrobatics',
        dc: 8,
        success: true
      }
    },
    timestamp: 0,
    duration: 1200
  },
  {
    id: 'disengage-template',
    type: 'move',
    category: 'disengage',
    source: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    animation: {
      type: 'movement',
      duration: 1000,
      color: '#20B2AA',
      size: 0,
      easing: 'ease-in-out',
      defensive: true
    },
    effects: {
      affectedTargets: [],
      highlightColor: '#20B2AA'
    },
    metadata: {
      name: 'Disengage',
      description: 'Use your action to move without triggering opportunity attacks.',
      rollResult: {
        skill: 'Acrobatics',
        dc: 10,
        success: true
      }
    },
    timestamp: 0,
    duration: 1000
  }
]