import type { UnifiedAction } from '@/types/unifiedAction'

export const moveTemplates: UnifiedAction[] = [
  // Basic Movement
  {
    id: 'walk-template',
    name: 'Walk',
    description: 'A movement action',
    type: 'move',
    category: 'walk',
    tags: ["movement","positioning"],
    source: { x: 0, y: 0 }, // Will be set when used
    target: { x: 0, y: 0 }, // Will be set when used
    animation: {
      type: 'line',
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
    name: 'Dash',
    description: 'A movement action',
    type: 'move',
    category: 'dash',
    tags: ["movement","positioning"],
    source: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    animation: {
      type: 'line',
      duration: 600,
      color: '#FFD700',
      size: 0,
      easing: 'ease-out',
      speed: 300
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
    name: 'Charge',
    description: 'A movement action',
    type: 'move',
    category: 'charge',
    tags: ["movement","positioning"],
    source: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    animation: {
      type: 'line',
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
    name: 'Sneak',
    description: 'A movement action',
    type: 'move',
    category: 'stealth',
    tags: ["movement","positioning"],
    source: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    animation: {
      type: 'line',
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
    name: 'Climb',
    description: 'A movement action',
    type: 'move',
    category: 'climb',
    tags: ["movement","positioning"],
    source: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    animation: {
      type: 'line',
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
    name: 'Swim',
    description: 'A movement action',
    type: 'move',
    category: 'swim',
    tags: ["movement","positioning"],
    source: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    animation: {
      type: 'line',
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
    name: 'Fly',
    description: 'A movement action',
    type: 'move',
    category: 'fly',
    tags: ["movement","positioning"],
    source: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    animation: {
      type: 'line',
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
    name: 'Teleport',
    description: 'A movement action',
    type: 'move',
    category: 'teleport',
    tags: ["movement","positioning"],
    source: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    animation: {
      type: 'burst',
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
    name: 'Withdraw',
    description: 'A movement action',
    type: 'move',
    category: 'withdraw',
    tags: ["movement","positioning"],
    source: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    animation: {
      type: 'line',
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
    name: 'Disengage',
    description: 'A movement action',
    type: 'move',
    category: 'disengage',
    tags: ["movement","positioning"],
    source: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    animation: {
      type: 'line',
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