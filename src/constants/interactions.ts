/**
 * Object Interaction Constants
 * Configuration for interactive objects like doors, traps, levers, containers
 */

// Interaction Types
export const INTERACTION_TYPES = {
  DOOR: 'door',
  TRAP: 'trap',
  LEVER: 'lever',
  CHEST: 'chest',
  SWITCH: 'switch',
  BUTTON: 'button',
  PORTAL: 'portal',
  SHRINE: 'shrine',
} as const

// Door States and Types
export const DOOR_STATES = {
  CLOSED: 'closed',
  OPEN: 'open',
  LOCKED: 'locked',
  JAMMED: 'jammed',
  DESTROYED: 'destroyed',
} as const

export const DOOR_TYPES = {
  NORMAL: 'normal',
  REINFORCED: 'reinforced',
  IRON: 'iron',
  MAGICAL: 'magical',
  SECRET: 'secret',
  BARRED: 'barred',
} as const

// Trap States and Types
export const TRAP_STATES = {
  HIDDEN: 'hidden',
  DETECTED: 'detected',
  TRIGGERED: 'triggered',
  DISARMED: 'disarmed',
  DESTROYED: 'destroyed',
} as const

export const TRAP_TYPES = {
  SPIKE: 'spike',
  PIT: 'pit',
  DART: 'dart',
  POISON_GAS: 'poison_gas',
  FIRE: 'fire',
  MAGIC: 'magic',
  ALARM: 'alarm',
  EXPLOSIVE: 'explosive',
} as const

// Container States and Types
export const CONTAINER_STATES = {
  CLOSED: 'closed',
  OPEN: 'open',
  LOCKED: 'locked',
  TRAPPED: 'trapped',
  EMPTY: 'empty',
} as const

export const CONTAINER_TYPES = {
  CHEST: 'chest',
  BARREL: 'barrel',
  CRATE: 'crate',
  COFFIN: 'coffin',
  SAFE: 'safe',
  URN: 'urn',
} as const

// Lever/Switch States
export const SWITCH_STATES = {
  OFF: 'off',
  ON: 'on',
  BROKEN: 'broken',
  STUCK: 'stuck',
} as const

// Portal States
export const PORTAL_STATES = {
  INACTIVE: 'inactive',
  ACTIVE: 'active',
  UNSTABLE: 'unstable',
  COLLAPSED: 'collapsed',
} as const

// Interaction Difficulty Classes (D&D 5e)
export const DIFFICULTY_CLASSES = {
  TRIVIAL: 5,
  EASY: 10,
  MODERATE: 15,
  HARD: 20,
  VERY_HARD: 25,
  NEARLY_IMPOSSIBLE: 30,
} as const

// Lock Complexity
export const LOCK_TYPES = {
  SIMPLE: { dc: DIFFICULTY_CLASSES.EASY, description: 'Simple lock' },
  STANDARD: { dc: DIFFICULTY_CLASSES.MODERATE, description: 'Standard lock' },
  COMPLEX: { dc: DIFFICULTY_CLASSES.HARD, description: 'Complex lock' },
  MASTERWORK: { dc: DIFFICULTY_CLASSES.VERY_HARD, description: 'Masterwork lock' },
  MAGICAL: { dc: DIFFICULTY_CLASSES.NEARLY_IMPOSSIBLE, description: 'Magical lock' },
} as const

// Interaction Animation Durations (ms)
export const INTERACTION_DURATIONS = {
  INSTANT: 0,
  QUICK: 300,
  NORMAL: 600,
  SLOW: 1000,
  VERY_SLOW: 1500,
} as const

// Interaction Visual Effects
export const INTERACTION_EFFECTS = {
  NONE: 'none',
  GLOW: 'glow',
  PULSE: 'pulse',
  SHAKE: 'shake',
  FLASH: 'flash',
  SMOKE: 'smoke',
  SPARKS: 'sparks',
  MAGICAL_AURA: 'magical_aura',
} as const

// Color schemes for different interaction states
export const INTERACTION_COLORS = {
  NORMAL: '#8B9DC3',      // Default interactive object color
  LOCKED: '#DC143C',      // Red for locked objects
  TRAPPED: '#FF4500',     // Orange-red for trapped objects
  MAGICAL: '#9370DB',     // Purple for magical objects
  ACTIVE: '#32CD32',      // Green for active/open objects
  BROKEN: '#696969',      // Gray for broken/destroyed objects
  HIDDEN: '#2F4F4F',      // Dark gray for hidden objects
  DETECTED: '#FFD700',    // Gold for detected traps
} as const

// D&D Object Interaction Presets
export const INTERACTION_PRESETS = {
  // Doors
  WOODEN_DOOR: {
    name: 'Wooden Door',
    type: INTERACTION_TYPES.DOOR,
    doorType: DOOR_TYPES.NORMAL,
    state: DOOR_STATES.CLOSED,
    hp: 15,
    ac: 15,
    lockDC: null,
    breakDC: DIFFICULTY_CLASSES.MODERATE,
    color: INTERACTION_COLORS.NORMAL,
    width: 5,  // 5 feet
    height: 10, // 10 feet
    description: 'Standard wooden door',
  },

  IRON_DOOR: {
    name: 'Iron Door',
    type: INTERACTION_TYPES.DOOR,
    doorType: DOOR_TYPES.IRON,
    state: DOOR_STATES.CLOSED,
    hp: 30,
    ac: 19,
    lockDC: DIFFICULTY_CLASSES.HARD,
    breakDC: DIFFICULTY_CLASSES.VERY_HARD,
    color: INTERACTION_COLORS.NORMAL,
    width: 5,
    height: 10,
    description: 'Heavy iron door with a complex lock',
  },

  SECRET_DOOR: {
    name: 'Secret Door',
    type: INTERACTION_TYPES.DOOR,
    doorType: DOOR_TYPES.SECRET,
    state: DOOR_STATES.CLOSED,
    hp: 15,
    ac: 15,
    detectionDC: DIFFICULTY_CLASSES.HARD,
    color: INTERACTION_COLORS.HIDDEN,
    width: 5,
    height: 10,
    description: 'Hidden door, requires investigation to find',
  },

  // Traps
  SPIKE_TRAP: {
    name: 'Spike Trap',
    type: INTERACTION_TYPES.TRAP,
    trapType: TRAP_TYPES.SPIKE,
    state: TRAP_STATES.HIDDEN,
    detectionDC: DIFFICULTY_CLASSES.MODERATE,
    disarmDC: DIFFICULTY_CLASSES.MODERATE,
    damage: '1d6+3',
    damageType: 'piercing',
    color: INTERACTION_COLORS.HIDDEN,
    triggerArea: '5x5', // 5 foot square
    description: 'Sharp spikes spring from the floor when triggered',
  },

  POISON_DART_TRAP: {
    name: 'Poison Dart Trap',
    type: INTERACTION_TYPES.TRAP,
    trapType: TRAP_TYPES.DART,
    state: TRAP_STATES.HIDDEN,
    detectionDC: DIFFICULTY_CLASSES.HARD,
    disarmDC: DIFFICULTY_CLASSES.HARD,
    damage: '1d4+2',
    damageType: 'piercing',
    additionalEffect: 'poison save DC 15',
    color: INTERACTION_COLORS.HIDDEN,
    description: 'Poisoned darts shoot from wall mechanism',
  },

  // Containers
  TREASURE_CHEST: {
    name: 'Treasure Chest',
    type: INTERACTION_TYPES.CHEST,
    containerType: CONTAINER_TYPES.CHEST,
    state: CONTAINER_STATES.CLOSED,
    lockDC: DIFFICULTY_CLASSES.MODERATE,
    hp: 15,
    ac: 15,
    color: INTERACTION_COLORS.NORMAL,
    width: 3,
    height: 2,
    description: 'Wooden chest with iron reinforcement',
  },

  TRAPPED_CHEST: {
    name: 'Trapped Chest',
    type: INTERACTION_TYPES.CHEST,
    containerType: CONTAINER_TYPES.CHEST,
    state: CONTAINER_STATES.TRAPPED,
    lockDC: DIFFICULTY_CLASSES.HARD,
    trapDC: DIFFICULTY_CLASSES.HARD,
    trapDamage: '2d6',
    trapType: 'poison needle',
    hp: 20,
    ac: 17,
    color: INTERACTION_COLORS.TRAPPED,
    width: 3,
    height: 2,
    description: 'Ornate chest with hidden needle trap',
  },

  // Levers and Switches
  STONE_LEVER: {
    name: 'Stone Lever',
    type: INTERACTION_TYPES.LEVER,
    state: SWITCH_STATES.OFF,
    effect: 'opens_door', // Custom effect description
    color: INTERACTION_COLORS.NORMAL,
    width: 1,
    height: 3,
    description: 'Ancient stone lever set into the wall',
  },

  CRYSTAL_SWITCH: {
    name: 'Crystal Switch',
    type: INTERACTION_TYPES.SWITCH,
    state: SWITCH_STATES.OFF,
    effect: 'activates_portal',
    requiresKey: false,
    color: INTERACTION_COLORS.MAGICAL,
    width: 1,
    height: 1,
    description: 'Glowing crystal that pulses with magical energy',
  },

  // Portals
  MAGIC_PORTAL: {
    name: 'Magic Portal',
    type: INTERACTION_TYPES.PORTAL,
    state: PORTAL_STATES.INACTIVE,
    destination: null, // Can be set to another portal or location
    activationRequirement: 'crystal_switch',
    color: INTERACTION_COLORS.MAGICAL,
    width: 5,
    height: 10,
    description: 'Shimmering magical gateway to another location',
  },

  // Shrines
  HEALING_SHRINE: {
    name: 'Healing Shrine',
    type: INTERACTION_TYPES.SHRINE,
    effect: 'restore_hp',
    usesPerDay: 3,
    usesRemaining: 3,
    healingAmount: '2d4+2',
    color: INTERACTION_COLORS.MAGICAL,
    width: 3,
    height: 4,
    description: 'Divine shrine that radiates healing energy',
  },
} as const

// Interaction Skill Requirements
export const INTERACTION_SKILLS = {
  LOCKPICKING: 'thieves_tools',
  TRAP_DETECTION: 'investigation',
  TRAP_DISARM: 'thieves_tools',
  DOOR_BREAKING: 'athletics',
  SECRET_DETECTION: 'investigation',
  MECHANISM_USE: 'investigation',
  MAGIC_DETECTION: 'arcana',
} as const

// Sound Effects (for future implementation)
export const INTERACTION_SOUNDS = {
  DOOR_OPEN: 'door_creak',
  DOOR_CLOSE: 'door_slam',
  LOCK_CLICK: 'lock_click',
  TRAP_TRIGGER: 'trap_spring',
  CHEST_OPEN: 'chest_open',
  LEVER_PULL: 'stone_grind',
  SWITCH_ACTIVATE: 'crystal_chime',
  PORTAL_ACTIVATE: 'magic_whoosh',
} as const