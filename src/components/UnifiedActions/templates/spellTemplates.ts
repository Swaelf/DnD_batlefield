import type { UnifiedAction } from '@/types/unifiedAction'
import type { Point } from '@/types/geometry'
import { nanoid } from 'nanoid'

export type SpellTemplate = Omit<UnifiedAction, 'id' | 'timestamp' | 'source' | 'target'> & {
  templateId: string
  iconPath?: string
  level?: number
  school?: string
}

/**
 * Fireball - Classic area damage spell
 * 3rd level evocation spell
 * 20ft radius sphere
 */
export const fireballTemplate: SpellTemplate = {
  templateId: 'fireball',
  name: 'Fireball',
  description: 'A classic fireball spell that explodes in a 20-foot radius',
  type: 'spell',
  category: 'fire',
  tags: ["spell","magic"],
  animation: {
    type: 'projectile_burst',
    duration: 800,
    color: '#FF4500',
    size: 15,
    trail: true,
    glow: true,
    pulse: true,
    curved: false, // Fireball flies straight
    burstSize: 150,
    burstColor: '#FF6600',
    burstDuration: 600,
    customParams: {
      trailLength: 5,
      trailColor: '#FFA500',
      explosionSize: 150,
      explosionDuration: 600
    }
  },
  effects: {
    affectedTargets: [],
    areaOfEffect: {
      type: 'circle',
      center: { x: 0, y: 0 }, // Will be set at cast time
      radius: 100 // 20ft radius in grid units
    },
    highlightColor: '#FF6600',
    persistDuration: 1000
  },
  metadata: {
    name: 'Fireball',
    description: '8d6 fire damage in a 20-foot radius sphere',
    rollResult: {
      total: 28,
      rolls: [6, 4, 3, 5, 2, 4, 3, 1],
      modifier: 0
    }
  },
  duration: 1400,
  level: 3,
  school: 'evocation'
}

/**
 * Magic Missile - Auto-hit projectile spell
 * 1st level evocation spell
 * Creates 3 darts that hit targets
 * Updated: Uses projectile_burst with curved motion
 */
export const magicMissileTemplate: SpellTemplate = {
  templateId: 'magic-missile',
  name: 'Magic Missile',
  description: 'Auto-hit projectiles that never miss their target',
  type: 'spell',
  category: 'magic_missile',
  tags: ["spell","magic"],
  animation: {
    type: 'projectile_burst',
    duration: 600,
    color: '#9400D3',
    size: 8,
    trail: true,
    glow: true,
    pulse: true,
    curved: true, // Magic Missile curves to target
    curveHeight: 60,
    curveDirection: 'auto',
    burstSize: 32, // Smaller burst than fireball (size * 4)
    burstColor: '#BA55D3',
    burstDuration: 400,
    customParams: {
      projectileCount: 3,
      staggerDelay: 100,
      glowIntensity: 0.8,
      trailLength: 3
    }
  },
  effects: {
    affectedTargets: [], // Will be set at cast time
    highlightColor: '#9400D3',
    highlightDuration: 1000
  },
  metadata: {
    name: 'Magic Missile',
    description: '3 darts, each deals 1d4+1 force damage',
    rollResult: {
      total: 10,
      rolls: [3, 2, 4],
      modifier: 3
    }
  },
  duration: 800,
  level: 1,
  school: 'evocation'
}

/**
 * Lightning Bolt - Line area damage spell
 * 3rd level evocation spell
 * 100ft line that is 5ft wide
 */
export const lightningBoltTemplate: SpellTemplate = {
  templateId: 'lightning-bolt',
  name: 'Lightning Bolt',
  description: 'A bolt of lightning in a 100-foot line',
  type: 'spell',
  category: 'lightning',
  tags: ["spell","magic"],
  animation: {
    type: 'ray',
    duration: 400,
    color: '#00FFFF',
    size: 5,
    customParams: {
      segments: 8,
      jitter: 15,
      branches: true,
      glowRadius: 10
    }
  },
  effects: {
    affectedTargets: [],
    areaOfEffect: {
      type: 'line',
      start: { x: 0, y: 0 }, // Will be set at cast time
      end: { x: 0, y: 0 },
      width: 25 // 5ft wide in grid units
    },
    highlightColor: '#00FFFF',
    persistDuration: 800
  },
  metadata: {
    name: 'Lightning Bolt',
    description: '8d6 lightning damage in a 100-foot line',
    rollResult: {
      total: 32,
      rolls: [5, 6, 3, 4, 6, 2, 5, 1],
      modifier: 0
    }
  },
  duration: 1200,
  level: 3,
  school: 'evocation'
}

/**
 * Healing Word - Ranged healing spell
 * 1st level evocation spell
 * Single target healing
 */
export const healingWordTemplate: SpellTemplate = {
  templateId: 'healing-word',
  name: 'Healing Word',
  description: 'A ranged healing spell that restores hit points',
  type: 'spell',
  category: 'healing',
  tags: ["spell","magic"],
  animation: {
    type: 'projectile',
    duration: 500,
    color: '#00FF00',
    size: 12,
    customParams: {
      particleEffect: 'sparkles',
      glowColor: '#FFFFFF',
      pulseOnImpact: true
    }
  },
  effects: {
    affectedTargets: [], // Single target
    highlightColor: '#00FF00',
    highlightDuration: 1500
  },
  metadata: {
    name: 'Healing Word',
    description: 'Heal 1d4+3 hit points',
    rollResult: {
      total: 6,
      rolls: [3],
      modifier: 3
    }
  },
  duration: 500,
  level: 1,
  school: 'evocation'
}

/**
 * Cone of Cold - Cone area damage spell
 * 5th level evocation spell
 * 60ft cone
 */
export const coneOfColdTemplate: SpellTemplate = {
  templateId: 'cone-of-cold',
  name: 'Cone of Cold',
  description: 'A cone of freezing air that deals cold damage',
  type: 'spell',
  category: 'ice',
  tags: ["spell","magic"],
  animation: {
    type: 'area',
    duration: 1000,
    color: '#87CEEB',
    size: 150,
    customParams: {
      particleType: 'snow',
      fadeIn: 200,
      fadeOut: 300,
      opacity: 0.7
    }
  },
  effects: {
    affectedTargets: [],
    areaOfEffect: {
      type: 'cone',
      origin: { x: 0, y: 0 }, // Will be set at cast time
      direction: 0, // Will be calculated from target
      angle: 60,
      range: 300 // 60ft in grid units
    },
    highlightColor: '#87CEEB',
    persistDuration: 1500
  },
  metadata: {
    name: 'Cone of Cold',
    description: '8d8 cold damage in a 60-foot cone',
    rollResult: {
      total: 36,
      rolls: [8, 5, 6, 4, 7, 2, 3, 1],
      modifier: 0
    }
  },
  duration: 1500,
  level: 5,
  school: 'evocation'
}

/**
 * Burning Hands - Small cone fire spell
 * 1st level evocation spell
 * 15ft cone
 */
export const burningHandsTemplate: SpellTemplate = {
  templateId: 'burning-hands',
  name: 'Burning Hands',
  description: 'Flames spring from your hands in a 15-foot cone',
  type: 'spell',
  category: 'fire',
  tags: ["spell","magic"],
  animation: {
    type: 'area',
    duration: 800,
    color: '#FF8C00',
    size: 75,
    customParams: {
      waveEffect: true,
      particleType: 'flame',
      intensity: 0.8
    }
  },
  effects: {
    affectedTargets: [],
    areaOfEffect: {
      type: 'cone',
      origin: { x: 0, y: 0 },
      direction: 0,
      angle: 45,
      range: 75 // 15ft in grid units
    },
    highlightColor: '#FF8C00',
    persistDuration: 600
  },
  metadata: {
    name: 'Burning Hands',
    description: '3d6 fire damage in a 15-foot cone',
    rollResult: {
      total: 11,
      rolls: [4, 3, 4],
      modifier: 0
    }
  },
  duration: 800,
  level: 1,
  school: 'evocation'
}

/**
 * Create a spell action from a template
 */
export function createSpellFromTemplate(
  template: SpellTemplate,
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

  // Update area of effect position based on target
  if (action.effects.areaOfEffect) {
    if (typeof target === 'object' && !Array.isArray(target)) {
      const targetPoint = target as Point

      switch (action.effects.areaOfEffect.type) {
        case 'circle':
          action.effects.areaOfEffect.center = targetPoint
          break
        case 'cone':
          if (typeof source === 'object') {
            const sourcePoint = source as Point
            const dx = targetPoint.x - sourcePoint.x
            const dy = targetPoint.y - sourcePoint.y
            action.effects.areaOfEffect.origin = sourcePoint
            action.effects.areaOfEffect.direction = Math.atan2(dy, dx) * 180 / Math.PI
          }
          break
        case 'line':
          if (typeof source === 'object') {
            action.effects.areaOfEffect.start = source as Point
            action.effects.areaOfEffect.end = targetPoint
          }
          break
      }
    }
  }

  return action
}

/**
 * Get all spell templates
 */
export function getAllSpellTemplates(): SpellTemplate[] {
  return [
    fireballTemplate,
    magicMissileTemplate,
    lightningBoltTemplate,
    healingWordTemplate,
    coneOfColdTemplate,
    burningHandsTemplate
  ]
}

/**
 * Get spell template by ID
 */
export function getSpellTemplate(templateId: string): SpellTemplate | undefined {
  return getAllSpellTemplates().find(t => t.templateId === templateId)
}