import type { UnifiedAction } from '@/types/unifiedAction'

export const attackTemplates: UnifiedAction[] = [
  // Sword Attacks
  {
    id: 'longsword-slash-template',
    name: 'Longsword Slash',
    description: 'A powerful sweeping attack with a longsword',
    type: 'attack',
    category: 'sword',
    tags: ['attack', 'melee', 'sword'],
    source: { x: 0, y: 0 }, // Will be set when used
    target: { x: 0, y: 0 }, // Will be set when used
    animation: {
      type: 'melee_swing',
      duration: 600,
      color: '#C0C0C0',
      size: 40,
      arc: 90
    },
    effects: {
      affectedTargets: [],
      highlightColor: '#C0C0C0'
    },
    metadata: {
      name: 'Longsword Slash',
      description: 'A powerful sweeping attack with a longsword.',
      // Attack data for reference:
      // damage:'1d8+3',
      // damageType:'slashing',
      // attackBonus:5
      rollResult: undefined
    },
    timestamp: 0,
    duration: 600
  },
  {
    id: 'rapier-thrust-template',
    name: 'Rapier Thrust',
    description: 'A combat attack action',
    type: 'attack',
    category: 'sword',
    tags: ["attack","combat"],
    source: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    animation: {
      type: 'melee_slash',
      duration: 400,
      color: '#E6E6FA',
      size: 30,
      speed: 300
    },
    effects: {
      affectedTargets: [],
      highlightColor: '#E6E6FA'
    },
    metadata: {
      name: 'Rapier Thrust',
      description: 'A precise thrusting attack with a rapier.',
      // Attack data for reference:
      // damage:'1d8+3',
      // damageType:'piercing',
      // attackBonus:5
      rollResult: undefined
    },
    timestamp: 0,
    duration: 400
  },

  // Axe Attacks
  {
    id: 'greataxe-cleave-template',
    name: 'Greataxe Cleave',
    description: 'A combat attack action',
    type: 'attack',
    category: 'axe',
    tags: ["attack","combat"],
    source: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    animation: {
      type: 'melee_swing',
      duration: 800,
      color: '#8B4513',
      size: 50,
      arc: 120
    },
    effects: {
      affectedTargets: [],
      highlightColor: '#8B4513'
    },
    metadata: {
      name: 'Greataxe Cleave',
      description: 'A devastating overhead chop with a greataxe.',
      // Attack data for reference:
      // damage:'1d12+3',
      // damageType:'slashing',
      // attackBonus:5
      rollResult: undefined
    },
    timestamp: 0,
    duration: 800
  },
  {
    id: 'handaxe-throw-template',
    name: 'Handaxe Throw',
    description: 'A combat attack action',
    type: 'attack',
    category: 'axe',
    tags: ["attack","combat"],
    source: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    animation: {
      type: 'projectile',
      duration: 700,
      color: '#CD853F',
      size: 20,
      speed: 350,
      spin: true
    },
    effects: {
      affectedTargets: [],
      highlightColor: '#CD853F'
    },
    metadata: {
      name: 'Handaxe Throw',
      description: 'A thrown handaxe spinning through the air.',
      // Attack data for reference:
      // damage:'1d6+3',
      // damageType:'slashing',
      // attackBonus:5
      rollResult: undefined
    },
    timestamp: 0,
    duration: 700
  },

  // Mace Attacks
  {
    id: 'warhammer-crush-template',
    name: 'Warhammer Crush',
    description: 'A combat attack action',
    type: 'attack',
    category: 'mace',
    tags: ["attack","combat"],
    source: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    animation: {
      type: 'melee_swing',
      duration: 700,
      color: '#696969',
      size: 35,
      impact: true
    },
    effects: {
      affectedTargets: [],
      highlightColor: '#696969'
    },
    metadata: {
      name: 'Warhammer Crush',
      description: 'A bone-crushing blow from a warhammer.',
      // Attack data for reference:
      // damage:'1d8+3',
      // damageType:'bludgeoning',
      // attackBonus:5
      rollResult: undefined
    },
    timestamp: 0,
    duration: 700
  },

  // Arrow Attacks
  {
    id: 'longbow-shot-template',
    name: 'Longbow Shot',
    description: 'A combat attack action',
    type: 'attack',
    category: 'arrow',
    tags: ["attack","combat"],
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
      name: 'Longbow Shot',
      description: 'An arrow fired from a longbow.',
      // Attack data for reference:
      // damage:'1d8+3',
      // damageType:'piercing',
      // attackBonus:5
      rollResult: undefined
    },
    timestamp: 0,
    duration: 800
  },
  {
    id: 'shortbow-rapid-template',
    name: 'Shortbow Rapid',
    description: 'A combat attack action',
    type: 'attack',
    category: 'arrow',
    tags: ["attack","combat"],
    source: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    animation: {
      type: 'projectile',
      duration: 600,
      color: '#A0522D',
      size: 6,
      speed: 500,
      multiple: 2
    },
    effects: {
      affectedTargets: [],
      highlightColor: '#A0522D'
    },
    metadata: {
      name: 'Shortbow Rapid Shot',
      description: 'Two quick arrows from a shortbow.',
      // Attack data for reference:
      // damage:'2x(1d6+3)',
      // damageType:'piercing',
      // attackBonus:5
      rollResult: undefined
    },
    timestamp: 0,
    duration: 600
  },

  // Bolt Attacks
  {
    id: 'crossbow-bolt-template',
    name: 'Crossbow Bolt',
    description: 'A combat attack action',
    type: 'attack',
    category: 'bolt',
    tags: ["attack","combat"],
    source: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    animation: {
      type: 'projectile',
      duration: 500,
      color: '#4A4A4A',
      size: 10,
      speed: 700
    },
    effects: {
      affectedTargets: [],
      highlightColor: '#4A4A4A'
    },
    metadata: {
      name: 'Crossbow Bolt',
      description: 'A heavy crossbow bolt.',
      // Attack data for reference:
      // damage:'1d10+3',
      // damageType:'piercing',
      // attackBonus:5
      rollResult: undefined
    },
    timestamp: 0,
    duration: 500
  },

  // Breath Attacks
  {
    id: 'fire-breath-template',
    name: 'Fire Breath',
    description: 'A combat attack action',
    type: 'attack',
    category: 'breath',
    tags: ["attack","combat"],
    source: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    animation: {
      type: 'cone',
      duration: 1200,
      color: '#FF4500',
      size: 120,
      particles: true
    },
    effects: {
      affectedTargets: [],
      highlightColor: '#FF4500',
      areaOfEffect: {
        type: 'cone',
        origin: { x: 0, y: 0 },
        direction: 0,
        angle: 90,
        range: 120
      }
    },
    metadata: {
      name: 'Fire Breath',
      description: 'A cone of scorching flames.',
      // Attack data for reference:
      // damage:'3d6',
      // damageType:'fire',
      // attackBonus:0,
      // saveType:'Dexterity',
      rollResult: undefined
    },
    timestamp: 0,
    duration: 1200
  },
  {
    id: 'cold-breath-template',
    name: 'Cold Breath',
    description: 'A combat attack action',
    type: 'attack',
    category: 'breath',
    tags: ["attack","combat"],
    source: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    animation: {
      type: 'cone',
      duration: 1000,
      color: '#87CEEB',
      size: 100,
      particles: true
    },
    effects: {
      affectedTargets: [],
      highlightColor: '#87CEEB',
      areaOfEffect: {
        type: 'cone',
        origin: { x: 0, y: 0 },
        direction: 0,
        angle: 90,
        range: 100
      }
    },
    metadata: {
      name: 'Cold Breath',
      description: 'A blast of freezing cold.',
      // Attack data for reference:
      // damage:'2d8',
      // damageType:'cold',
      // attackBonus:0,
      // saveType:'Constitution',
      rollResult: undefined
    },
    timestamp: 0,
    duration: 1000
  }
]