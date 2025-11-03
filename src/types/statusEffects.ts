/**
 * Status Effect Type Definitions
 * Visual effects that overlay on tokens to indicate conditions
 */

export type StatusEffectType =
  | 'stunned'
  | 'poisoned'
  | 'prone'
  | 'entangled'
  | 'dying'
  | 'flaming'
  | 'chilled'
  | 'dazed'
  | 'blessed'
  | 'regenerating'
  | 'sleeping'
  | 'frightened'

export type StatusEffect = {
  type: StatusEffectType
  duration?: number // Duration in rounds, undefined or 0 means indefinite
  intensity?: number // 0-1 for effects that can stack or vary in strength
  source?: string // Token ID or spell that applied this effect
  roundApplied?: number // Round number when effect was applied (for expiration tracking)
}

export type StatusEffectVisualConfig = {
  type: StatusEffectType
  name: string
  description: string
  color: string
  secondaryColor?: string
  icon?: string
  animationType: 'pulse' | 'spin' | 'flicker' | 'wave' | 'particles' | 'ring' | 'overlay' | 'shimmer' | 'bubbles'
  layer: number // Z-index for effect layering (0 = bottom, higher = on top)
  opacity: number
  blendMode?: 'normal' | 'multiply' | 'screen' | 'overlay'
}

// Visual configurations for each status effect
export const STATUS_EFFECT_CONFIGS: Record<StatusEffectType, StatusEffectVisualConfig> = {
  stunned: {
    type: 'stunned',
    name: 'Stunned',
    description: 'Cannot take actions or reactions',
    color: '#FFD700', // Gold
    animationType: 'spin',
    layer: 3,
    opacity: 0.7,
  },
  poisoned: {
    type: 'poisoned',
    name: 'Poisoned',
    description: 'Disadvantage on attack rolls and ability checks',
    color: '#9333EA', // Purple
    secondaryColor: '#10B981', // Green
    animationType: 'wave',
    layer: 1,
    opacity: 0.6,
    blendMode: 'multiply',
  },
  prone: {
    type: 'prone',
    name: 'Prone',
    description: 'Lying on the ground',
    color: '#78716C', // Stone gray
    animationType: 'overlay',
    layer: 0,
    opacity: 0.4,
  },
  entangled: {
    type: 'entangled',
    name: 'Entangled',
    description: 'Restrained by vines or webs',
    color: '#16A34A', // Green
    secondaryColor: '#854D0E', // Brown
    animationType: 'ring',
    layer: 2,
    opacity: 0.7,
  },
  dying: {
    type: 'dying',
    name: 'Dying',
    description: 'Making death saving throws',
    color: '#DC2626', // Red
    secondaryColor: '#000000', // Black
    animationType: 'pulse',
    layer: 5,
    opacity: 0.8,
  },
  flaming: {
    type: 'flaming',
    name: 'On Fire',
    description: 'Taking fire damage each turn',
    color: '#F59E0B', // Orange
    secondaryColor: '#DC2626', // Red
    animationType: 'flicker',
    layer: 4,
    opacity: 0.8,
    blendMode: 'screen',
  },
  chilled: {
    type: 'chilled',
    name: 'Chilled',
    description: 'Movement speed reduced',
    color: '#06B6D4', // Cyan
    secondaryColor: '#E0F2FE', // Light blue
    animationType: 'particles',
    layer: 2,
    opacity: 0.7,
  },
  dazed: {
    type: 'dazed',
    name: 'Dazed',
    description: 'Confused and disoriented',
    color: '#A855F7', // Purple
    animationType: 'wave',
    layer: 3,
    opacity: 0.6,
  },
  blessed: {
    type: 'blessed',
    name: 'Blessed',
    description: 'Add d4 to attack rolls and saving throws',
    color: '#FDE047', // Yellow
    secondaryColor: '#FFFFFF', // White
    animationType: 'shimmer',
    layer: 4,
    opacity: 0.6,
    blendMode: 'screen',
  },
  regenerating: {
    type: 'regenerating',
    name: 'Regenerating',
    description: 'Healing over time',
    color: '#22C55E', // Green
    secondaryColor: '#86EFAC', // Light green
    animationType: 'pulse',
    layer: 2,
    opacity: 0.7,
    blendMode: 'screen',
  },
  sleeping: {
    type: 'sleeping',
    name: 'Sleeping',
    description: 'Unconscious and vulnerable',
    color: '#475569', // Slate gray
    secondaryColor: '#CBD5E1', // Light slate
    animationType: 'bubbles',
    layer: 3,
    opacity: 0.5,
  },
  frightened: {
    type: 'frightened',
    name: 'Frightened',
    description: 'Disadvantage on ability checks and attack rolls',
    color: '#7C3AED', // Violet
    secondaryColor: '#000000', // Black
    animationType: 'flicker',
    layer: 3,
    opacity: 0.6,
    blendMode: 'multiply',
  },
}
