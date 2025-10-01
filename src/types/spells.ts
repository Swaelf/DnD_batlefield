import type { ReactNode } from 'react'
import type { Position } from './map'

// Spell effect types
export type SpellEffect = {
  id: string
  name: string
  type: 'area' | 'single' | 'line' | 'cone' | 'wall'
  position: Position
  rotation: number
  layer: number

  // Visual properties
  color: string
  opacity: number
  size: SpellSize

  // Lifetime properties
  roundCreated: number
  duration: number // in rounds (0 = instant)
  currentRound?: number

  // Animation properties
  animation: SpellAnimation
  animationState?: 'entering' | 'active' | 'exiting' | 'complete'
}

export type SpellSize = {
  radius?: number // For circular effects
  width?: number
  height?: number
  length?: number // For lines/cones
  angle?: number // For cones
}

export type SpellAnimation = {
  enter: AnimationType
  active?: AnimationType
  exit: AnimationType
  enterDuration: number // milliseconds
  exitDuration: number // milliseconds
}

export type AnimationType =
  | 'burst'      // Explosive expansion (fireball)
  | 'spread'     // Gradual expansion (darkness)
  | 'fade-in'    // Simple fade in
  | 'fade-out'   // Simple fade out
  | 'pulse'      // Pulsing effect
  | 'ripple'     // Ripple outward
  | 'collapse'   // Shrink to nothing
  | 'dissolve'   // Particle dissolve
  | 'none'       // No animation

// Preset spell templates
export type SpellTemplate = {
  id: string
  name: string
  school: 'evocation' | 'necromancy' | 'illusion' | 'conjuration' | 'enchantment' | 'abjuration' | 'transmutation' | 'divination'
  level: number
  description: string

  // Effect configuration
  effect: {
    type: SpellEffect['type']
    defaultSize: SpellSize
    defaultColor: string
    defaultOpacity: number
    defaultDuration: number // rounds
  }

  // Animation configuration
  animation: SpellAnimation

  // Optional sound effect
  soundEffect?: string
}

// Common spell templates
export const SPELL_TEMPLATES: Record<string, SpellTemplate> = {
  fireball: {
    id: 'fireball',
    name: 'Fireball',
    school: 'evocation',
    level: 3,
    description: 'A bright streak flashes from your pointing finger to a point you choose within range and then blossoms with a low roar into an explosion of flame.',
    effect: {
      type: 'area',
      defaultSize: { radius: 100 }, // 20ft radius = ~4 squares
      defaultColor: '#ff4500',
      defaultOpacity: 0.7,
      defaultDuration: 0 // Instant
    },
    animation: {
      enter: 'burst',
      exit: 'fade-out',
      enterDuration: 500,
      exitDuration: 1000
    }
  },

  darkness: {
    id: 'darkness',
    name: 'Darkness',
    school: 'evocation',
    level: 2,
    description: 'Magical darkness spreads from a point you choose within range to fill a 15-foot-radius sphere.',
    effect: {
      type: 'area',
      defaultSize: { radius: 75 }, // 15ft radius = 3 squares
      defaultColor: '#1a1a1a',
      defaultOpacity: 0.9,
      defaultDuration: 10 // 10 rounds (1 minute)
    },
    animation: {
      enter: 'spread',
      active: 'pulse',
      exit: 'dissolve',
      enterDuration: 2000,
      exitDuration: 1500
    }
  },

  web: {
    id: 'web',
    name: 'Web',
    school: 'conjuration',
    level: 2,
    description: 'You conjure a mass of thick, sticky webbing at a point of your choice within range.',
    effect: {
      type: 'area',
      defaultSize: { width: 100, height: 100 }, // 20ft cube
      defaultColor: '#f0f0f0',
      defaultOpacity: 0.6,
      defaultDuration: 60 // 1 hour
    },
    animation: {
      enter: 'spread',
      exit: 'dissolve',
      enterDuration: 1500,
      exitDuration: 2000
    }
  },

  lightningBolt: {
    id: 'lightning-bolt',
    name: 'Lightning Bolt',
    school: 'evocation',
    level: 3,
    description: 'A stroke of lightning forming a line 100 feet long and 5 feet wide blasts out from you.',
    effect: {
      type: 'line',
      defaultSize: { length: 500, width: 25 }, // 100ft x 5ft
      defaultColor: '#87ceeb',
      defaultOpacity: 0.8,
      defaultDuration: 0 // Instant
    },
    animation: {
      enter: 'burst',
      exit: 'fade-out',
      enterDuration: 300,
      exitDuration: 500
    }
  },

  coneOfCold: {
    id: 'cone-of-cold',
    name: 'Cone of Cold',
    school: 'evocation',
    level: 5,
    description: 'A blast of cold air erupts from your hands in a 60-foot cone.',
    effect: {
      type: 'cone',
      defaultSize: { length: 300, angle: 60 }, // 60ft cone
      defaultColor: '#b0e0e6',
      defaultOpacity: 0.7,
      defaultDuration: 0 // Instant
    },
    animation: {
      enter: 'spread',
      exit: 'fade-out',
      enterDuration: 800,
      exitDuration: 1200
    }
  },

  wallOfFire: {
    id: 'wall-of-fire',
    name: 'Wall of Fire',
    school: 'evocation',
    level: 4,
    description: 'You create a wall of fire on a solid surface within range.',
    effect: {
      type: 'wall',
      defaultSize: { length: 300, width: 5, height: 100 }, // 60ft x 1ft x 20ft
      defaultColor: '#ff6347',
      defaultOpacity: 0.8,
      defaultDuration: 10 // Concentration, up to 1 minute
    },
    animation: {
      enter: 'fade-in',
      active: 'pulse',
      exit: 'fade-out',
      enterDuration: 1000,
      exitDuration: 1000
    }
  },

  entangle: {
    id: 'entangle',
    name: 'Entangle',
    school: 'conjuration',
    level: 1,
    description: 'Grasping weeds and vines sprout from the ground in a 20-foot square.',
    effect: {
      type: 'area',
      defaultSize: { width: 100, height: 100 }, // 20ft square
      defaultColor: '#228b22',
      defaultOpacity: 0.5,
      defaultDuration: 10 // Concentration, up to 1 minute
    },
    animation: {
      enter: 'spread',
      active: 'ripple',
      exit: 'dissolve',
      enterDuration: 1500,
      exitDuration: 1000
    }
  },

  moonbeam: {
    id: 'moonbeam',
    name: 'Moonbeam',
    school: 'evocation',
    level: 2,
    description: 'A silvery beam of pale light shines down in a 5-foot-radius cylinder.',
    effect: {
      type: 'area',
      defaultSize: { radius: 25 }, // 5ft radius
      defaultColor: '#e6e6fa',
      defaultOpacity: 0.6,
      defaultDuration: 10 // Concentration, up to 1 minute
    },
    animation: {
      enter: 'fade-in',
      active: 'pulse',
      exit: 'fade-out',
      enterDuration: 1000,
      exitDuration: 800
    }
  }
}

// Helper functions
export function isSpellExpired(spell: SpellEffect, currentRound: number): boolean {
  if (spell.duration === 0) {
    // Instant spells expire after their animation
    return spell.animationState === 'complete'
  }
  return currentRound > spell.roundCreated + spell.duration
}

export function getSpellAnimationState(spell: SpellEffect, currentRound: number): SpellEffect['animationState'] {
  if (currentRound === spell.roundCreated) {
    return 'entering'
  } else if (spell.duration === 0) {
    // Instant spell
    return spell.animationState || 'entering'
  } else if (currentRound >= spell.roundCreated + spell.duration) {
    return 'exiting'
  } else {
    return 'active'
  }
}

// Spell effect template for placing predefined spell effects
export type SpellEffectTemplate = {
  id: string
  name: string
  category: 'area' | 'line' | 'wall' | 'emanation'
  shape: 'sphere' | 'cone' | 'cube' | 'line' | 'wall'
  icon: ReactNode
  color: string
  opacity: number
  size: {
    radius?: number      // For spheres
    length?: number      // For cones, lines, walls
    width?: number       // For lines, walls, cubes
    height?: number      // For walls, cubes
    angle?: number       // For cones (in degrees)
  }
  description: string
  dndSpell?: string      // Associated D&D spell
}