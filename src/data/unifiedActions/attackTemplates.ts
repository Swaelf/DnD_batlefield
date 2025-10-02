import type { UnifiedAction } from '@/types/unifiedAction'

export const attackTemplates: UnifiedAction[] = [
  // ===== MELEE ATTACKS =====

  // Slashing - Longsword
  {
    id: 'longsword-slash',
    name: 'Longsword (Slashing)',
    description: 'A powerful sweeping slash with a longsword',
    type: 'attack',
    category: 'melee',
    tags: ['attack', 'melee', 'slashing'],
    source: { x: 0, y: 0 }, // Will be set when used
    target: { x: 0, y: 0 }, // Will be set when used
    animation: {
      type: 'melee_slash',
      duration: 600,
      color: '#C0C0C0',
      size: 40
    },
    effects: {
      affectedTargets: [],
      highlightColor: '#C0C0C0'
    },
    metadata: {
      name: 'Longsword (Slashing)',
      description: 'A powerful sweeping slash with a longsword.',
      rollResult: undefined
    },
    timestamp: 0,
    duration: 600,
    damage: '1d8+3',
    damageType: 'slashing',
    range: 5
  },

  // Piercing - Rapier
  {
    id: 'rapier-pierce',
    name: 'Rapier (Piercing)',
    description: 'A precise thrusting attack with a rapier',
    type: 'attack',
    category: 'melee',
    tags: ['attack', 'melee', 'piercing'],
    source: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    animation: {
      type: 'melee_thrust',
      duration: 500,
      color: '#B0B0B0',
      size: 35
    },
    effects: {
      affectedTargets: [],
      highlightColor: '#B0B0B0'
    },
    metadata: {
      name: 'Rapier (Piercing)',
      description: 'A precise thrusting attack with a rapier.',
      rollResult: undefined
    },
    timestamp: 0,
    duration: 500,
    damage: '1d8+2',
    damageType: 'piercing',
    range: 5
  },

  // Bludgeoning - Warhammer
  {
    id: 'warhammer-bludgeon',
    name: 'Warhammer (Bludgeoning)',
    description: 'A bone-crushing swing with a warhammer',
    type: 'attack',
    category: 'melee',
    tags: ['attack', 'melee', 'bludgeoning'],
    source: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    animation: {
      type: 'melee_swing',
      duration: 700,
      color: '#8B7355',
      size: 35,
      impact: true
    },
    effects: {
      affectedTargets: [],
      highlightColor: '#8B7355'
    },
    metadata: {
      name: 'Warhammer (Bludgeoning)',
      description: 'A bone-crushing swing with a warhammer.',
      rollResult: undefined
    },
    timestamp: 0,
    duration: 700,
    damage: '1d8+3',
    damageType: 'bludgeoning',
    range: 5
  },

  // ===== RANGED ATTACKS =====

  // Piercing - Longbow
  {
    id: 'longbow-pierce',
    name: 'Longbow (Piercing)',
    description: 'An arrow fired from a longbow',
    type: 'attack',
    category: 'ranged',
    tags: ['attack', 'ranged', 'piercing'],
    source: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    animation: {
      type: 'projectile',
      duration: 800,
      color: '#8B4513',
      size: 8,
      speed: 600,
      trail: true
    },
    effects: {
      affectedTargets: [],
      highlightColor: '#8B4513'
    },
    metadata: {
      name: 'Longbow (Piercing)',
      description: 'An arrow fired from a longbow.',
      rollResult: undefined
    },
    timestamp: 0,
    duration: 800,
    damage: '1d8+3',
    damageType: 'piercing',
    range: 150
  },

  // Slashing - Thrown Dagger
  {
    id: 'thrown-dagger',
    name: 'Thrown Dagger (Piercing)',
    description: 'A dagger thrown at the target',
    type: 'attack',
    category: 'ranged',
    tags: ['attack', 'ranged', 'piercing', 'thrown'],
    source: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    animation: {
      type: 'projectile',
      duration: 500,
      color: '#C0C0C0',
      size: 12,
      speed: 400,
      spin: true
    },
    effects: {
      affectedTargets: [],
      highlightColor: '#C0C0C0'
    },
    metadata: {
      name: 'Thrown Dagger (Piercing)',
      description: 'A dagger thrown at the target.',
      rollResult: undefined
    },
    timestamp: 0,
    duration: 500,
    damage: '1d4+2',
    damageType: 'piercing',
    range: 20
  },

  // Bludgeoning - Sling
  {
    id: 'sling-bludgeon',
    name: 'Sling (Bludgeoning)',
    description: 'A stone hurled from a sling',
    type: 'attack',
    category: 'ranged',
    tags: ['attack', 'ranged', 'bludgeoning'],
    source: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    animation: {
      type: 'projectile',
      duration: 600,
      color: '#696969',
      size: 10,
      speed: 450
    },
    effects: {
      affectedTargets: [],
      highlightColor: '#696969'
    },
    metadata: {
      name: 'Sling (Bludgeoning)',
      description: 'A stone hurled from a sling.',
      rollResult: undefined
    },
    timestamp: 0,
    duration: 600,
    damage: '1d4+2',
    damageType: 'bludgeoning',
    range: 30
  }
]
