/**
 * Action Sequencing Constants
 * Configuration for complex action chains, conditional execution, and multi-turn sequences
 */

// Sequence Execution Types
export const SEQUENCE_TYPES = {
  SIMPLE: 'simple',           // Basic sequential execution
  CONDITIONAL: 'conditional', // Conditional branching based on results
  PARALLEL: 'parallel',       // Simultaneous execution
  LOOP: 'loop',              // Repeated execution with conditions
  BRANCH: 'branch',          // Multiple possible paths
} as const

// Sequence Timing
export const SEQUENCE_TIMING = {
  IMMEDIATE: 'immediate',     // Execute immediately after previous action
  DELAYED: 'delayed',         // Execute after specified delay
  TRIGGER: 'trigger',         // Execute when condition is met
  MANUAL: 'manual',          // Execute when manually triggered
  ROUND_START: 'round_start', // Execute at start of combat round
  ROUND_END: 'round_end',    // Execute at end of combat round
} as const

// Sequence Conditions
export const SEQUENCE_CONDITIONS = {
  SUCCESS: 'success',         // Previous action succeeded
  FAILURE: 'failure',         // Previous action failed
  CRITICAL: 'critical',       // Critical hit/success occurred
  FUMBLE: 'fumble',          // Critical failure occurred
  HP_BELOW: 'hp_below',      // Target HP below threshold
  HP_ABOVE: 'hp_above',      // Target HP above threshold
  DISTANCE: 'distance',       // Target within/outside distance
  ROUND_NUMBER: 'round_number', // Specific round number
  TURN_COUNT: 'turn_count',   // Number of turns elapsed
  CUSTOM: 'custom',          // Custom JavaScript condition
} as const

// Action Dependencies
export const DEPENDENCY_TYPES = {
  REQUIRES: 'requires',       // Must complete before this action
  BLOCKS: 'blocks',          // Prevents other actions
  ENABLES: 'enables',        // Unlocks subsequent actions
  CANCELS: 'cancels',        // Cancels other actions
  MODIFIES: 'modifies',      // Modifies other action parameters
} as const

// Sequence Delays (in milliseconds)
export const SEQUENCE_DELAYS = {
  INSTANT: 0,
  QUICK: 250,
  SHORT: 500,
  NORMAL: 1000,
  LONG: 2000,
  VERY_LONG: 5000,
} as const

// Loop Types
export const LOOP_TYPES = {
  COUNT: 'count',            // Loop specific number of times
  WHILE: 'while',           // Loop while condition is true
  UNTIL: 'until',           // Loop until condition is true
  ROUND: 'round',           // Loop each round
  TURN: 'turn',             // Loop each turn
} as const

// Sequence Priorities
export const SEQUENCE_PRIORITIES = {
  CRITICAL: 100,     // Always execute first
  HIGH: 75,         // High priority
  NORMAL: 50,       // Normal priority
  LOW: 25,          // Low priority
  BACKGROUND: 10,   // Execute when idle
} as const

// Action Sequence Templates
export const SEQUENCE_TEMPLATES = {
  CHARGE_ATTACK: {
    name: 'Charge Attack',
    description: 'Move to target, then attack with bonus damage',
    type: SEQUENCE_TYPES.SIMPLE,
    actions: [
      {
        type: 'move',
        timing: SEQUENCE_TIMING.IMMEDIATE,
        priority: SEQUENCE_PRIORITIES.NORMAL,
      },
      {
        type: 'attack',
        timing: SEQUENCE_TIMING.IMMEDIATE,
        priority: SEQUENCE_PRIORITIES.NORMAL,
        conditions: [SEQUENCE_CONDITIONS.SUCCESS],
        modifiers: {
          damage_bonus: '+1d6',
          attack_bonus: '+2',
        },
      },
    ],
  },

  SPELL_COMBO: {
    name: 'Spell Combination',
    description: 'Cast multiple spells in sequence with targeting',
    type: SEQUENCE_TYPES.CONDITIONAL,
    actions: [
      {
        type: 'spell',
        timing: SEQUENCE_TIMING.IMMEDIATE,
        priority: SEQUENCE_PRIORITIES.HIGH,
      },
      {
        type: 'spell',
        timing: SEQUENCE_TIMING.DELAYED,
        delay: SEQUENCE_DELAYS.SHORT,
        conditions: [SEQUENCE_CONDITIONS.SUCCESS],
        priority: SEQUENCE_PRIORITIES.NORMAL,
      },
    ],
  },

  ENVIRONMENTAL_TRAP: {
    name: 'Environmental Trap Sequence',
    description: 'Trigger environmental effect, then reveal trap',
    type: SEQUENCE_TYPES.BRANCH,
    actions: [
      {
        type: 'environmental',
        timing: SEQUENCE_TIMING.TRIGGER,
        priority: SEQUENCE_PRIORITIES.HIGH,
      },
      {
        type: 'interaction',
        timing: SEQUENCE_TIMING.DELAYED,
        delay: SEQUENCE_DELAYS.NORMAL,
        conditions: [SEQUENCE_CONDITIONS.SUCCESS],
        priority: SEQUENCE_PRIORITIES.NORMAL,
      },
      {
        type: 'attack',
        timing: SEQUENCE_TIMING.IMMEDIATE,
        conditions: [SEQUENCE_CONDITIONS.FAILURE],
        priority: SEQUENCE_PRIORITIES.HIGH,
      },
    ],
  },

  RETREAT_MANEUVER: {
    name: 'Fighting Retreat',
    description: 'Attack, then move away with defensive bonuses',
    type: SEQUENCE_TYPES.SIMPLE,
    actions: [
      {
        type: 'attack',
        timing: SEQUENCE_TIMING.IMMEDIATE,
        priority: SEQUENCE_PRIORITIES.NORMAL,
      },
      {
        type: 'move',
        timing: SEQUENCE_TIMING.IMMEDIATE,
        priority: SEQUENCE_PRIORITIES.HIGH,
        modifiers: {
          ac_bonus: '+2',
          opportunity_immunity: true,
        },
      },
    ],
  },

  MULTI_ATTACK: {
    name: 'Multiple Attacks',
    description: 'Perform multiple attacks with decreasing accuracy',
    type: SEQUENCE_TYPES.LOOP,
    loop: {
      type: LOOP_TYPES.COUNT,
      count: 3,
      conditions: [SEQUENCE_CONDITIONS.SUCCESS],
    },
    actions: [
      {
        type: 'attack',
        timing: SEQUENCE_TIMING.IMMEDIATE,
        priority: SEQUENCE_PRIORITIES.NORMAL,
        modifiers: {
          attack_penalty: '-5', // Stacks each iteration
        },
      },
    ],
  },

  AREA_DENIAL: {
    name: 'Area Denial',
    description: 'Create environmental hazard that persists',
    type: SEQUENCE_TYPES.PARALLEL,
    actions: [
      {
        type: 'spell',
        timing: SEQUENCE_TIMING.IMMEDIATE,
        priority: SEQUENCE_PRIORITIES.HIGH,
      },
      {
        type: 'environmental',
        timing: SEQUENCE_TIMING.IMMEDIATE,
        priority: SEQUENCE_PRIORITIES.NORMAL,
        duration: 'permanent',
      },
    ],
  },
} as const

// Condition Evaluation Helpers
export const CONDITION_EVALUATORS = {
  [SEQUENCE_CONDITIONS.SUCCESS]: (result: any) => result?.success === true,
  [SEQUENCE_CONDITIONS.FAILURE]: (result: any) => result?.success === false,
  [SEQUENCE_CONDITIONS.CRITICAL]: (result: any) => result?.critical === true,
  [SEQUENCE_CONDITIONS.FUMBLE]: (result: any) => result?.fumble === true,
  [SEQUENCE_CONDITIONS.HP_BELOW]: (result: any, threshold: number) =>
    result?.target?.hp < threshold,
  [SEQUENCE_CONDITIONS.HP_ABOVE]: (result: any, threshold: number) =>
    result?.target?.hp > threshold,
  [SEQUENCE_CONDITIONS.DISTANCE]: (result: any, distance: number) =>
    result?.distance <= distance,
  [SEQUENCE_CONDITIONS.ROUND_NUMBER]: (result: any, round: number) =>
    result?.currentRound === round,
  [SEQUENCE_CONDITIONS.TURN_COUNT]: (result: any, turns: number) =>
    result?.turnCount >= turns,
} as const

// Sequence Validation Rules
export const VALIDATION_RULES = {
  MAX_ACTIONS_PER_SEQUENCE: 10,
  MAX_NESTED_CONDITIONS: 5,
  MAX_LOOP_ITERATIONS: 100,
  MAX_DELAY_MS: 30000, // 30 seconds
  REQUIRED_FIELDS: ['type', 'timing', 'priority'],
  ALLOWED_MODIFIERS: [
    'damage_bonus', 'attack_bonus', 'ac_bonus', 'speed_bonus',
    'damage_penalty', 'attack_penalty', 'ac_penalty', 'speed_penalty',
    'advantage', 'disadvantage', 'immunity', 'resistance', 'vulnerability'
  ],
} as const

// Sequence Error Types
export const SEQUENCE_ERRORS = {
  INVALID_TYPE: 'invalid_type',
  MISSING_CONDITION: 'missing_condition',
  CIRCULAR_DEPENDENCY: 'circular_dependency',
  EXCEEDED_MAX_ACTIONS: 'exceeded_max_actions',
  INVALID_TIMING: 'invalid_timing',
  MISSING_REQUIRED_FIELD: 'missing_required_field',
  INVALID_MODIFIER: 'invalid_modifier',
  EXCEEDED_MAX_DELAY: 'exceeded_max_delay',
} as const

// Sequence Status
export const SEQUENCE_STATUS = {
  PENDING: 'pending',       // Waiting to execute
  RUNNING: 'running',       // Currently executing
  PAUSED: 'paused',        // Execution paused
  COMPLETED: 'completed',   // Successfully completed
  FAILED: 'failed',        // Failed execution
  CANCELLED: 'cancelled',   // Manually cancelled
  SKIPPED: 'skipped',      // Conditions not met
} as const