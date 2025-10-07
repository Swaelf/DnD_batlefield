import type { UnifiedAction } from '@/types/unifiedAction'
import type { Point } from '@/types/geometry'
import { nanoid } from 'nanoid'

export type AttackTemplate = Omit<UnifiedAction, 'id' | 'timestamp' | 'source' | 'target'> & {
  templateId: string
  weaponType?: string
  damageType?: string
  range?: number
}

/**
 * Sword Slash - Basic melee attack
 * Single target within reach
 */
export const swordSlashTemplate: AttackTemplate = {
  templateId: 'sword-slash',
  name: 'Sword Slash',
  description: 'A swift slash with a bladed weapon',
  type: 'attack',
  category: 'sword',
  tags: ['melee', 'weapon', 'sword'],
  animation: {
    type: 'melee_slash',
    duration: 400,
    color: '#C0C0C0',
    size: 60,
    customParams: {
      slashAngle: 120,
      slashSpeed: 0.8,
      trailEffect: true,
      sparkOnHit: true
    }
  },
  effects: {
    affectedTargets: [], // Single target
    highlightColor: '#FF0000',
    highlightDuration: 500
  },
  metadata: {
    name: 'Sword Slash',
    description: '1d8+3 slashing damage',
    rollResult: {
      total: 7,
      rolls: [4],
      modifier: 3
    }
  },
  duration: 400,
  weaponType: 'longsword',
  damageType: 'slashing',
  range: 5 // 5ft reach
}

/**
 * Axe Swing - Heavy melee attack
 * Wide arc attack
 */
export const axeSwingTemplate: AttackTemplate = {
  templateId: 'axe-swing',
  name: 'Axe Swing',
  description: 'A heavy axe swing with wide arc',
  type: 'attack',
  category: 'axe',
  tags: ['melee', 'weapon', 'axe'],
  animation: {
    type: 'melee_swing',
    duration: 500,
    color: '#8B4513',
    size: 70,
    customParams: {
      swingAngle: 180,
      swingSpeed: 0.6,
      impactShake: true,
      heavyTrail: true
    }
  },
  effects: {
    affectedTargets: [],
    areaOfEffect: {
      type: 'cone',
      origin: { x: 0, y: 0 },
      direction: 0,
      angle: 90,
      range: 50 // Melee reach
    },
    highlightColor: '#8B4513',
    highlightDuration: 600
  },
  metadata: {
    name: 'Axe Swing',
    description: '1d12+4 slashing damage',
    rollResult: {
      total: 10,
      rolls: [6],
      modifier: 4
    }
  },
  duration: 500,
  weaponType: 'greataxe',
  damageType: 'slashing',
  range: 5
}

/**
 * Mace Smash - Blunt melee attack
 * Impact attack with knockback potential
 */
export const maceSmashTemplate: AttackTemplate = {
  templateId: 'mace-smash',
  name: 'Mace Smash',
  description: 'A crushing blow with a mace',
  type: 'attack',
  category: 'mace',
  tags: ["attack","combat"],
  animation: {
    type: 'melee_swing',
    duration: 450,
    color: '#696969',
    size: 50,
    customParams: {
      impactEffect: 'shockwave',
      screenShake: 0.5,
      dustCloud: true
    }
  },
  effects: {
    affectedTargets: [],
    highlightColor: '#696969',
    highlightDuration: 500
  },
  metadata: {
    name: 'Mace Smash',
    description: '1d6+2 bludgeoning damage',
    rollResult: {
      total: 5,
      rolls: [3],
      modifier: 2
    }
  },
  duration: 450,
  weaponType: 'mace',
  damageType: 'bludgeoning',
  range: 5
}

/**
 * Dagger Stab - Quick melee attack
 * Fast, precise attack
 */
export const daggerStabTemplate: AttackTemplate = {
  templateId: 'dagger-stab',
  name: 'Dagger Stab',
  description: 'A quick, precise stab with a dagger',
  type: 'attack',
  category: 'dagger',
  tags: ["attack","combat"],
  animation: {
    type: 'melee_slash',
    duration: 250,
    color: '#708090',
    size: 30,
    customParams: {
      stabMotion: true,
      quickStrike: true,
      glintEffect: true
    }
  },
  effects: {
    affectedTargets: [],
    highlightColor: '#DC143C',
    highlightDuration: 300
  },
  metadata: {
    name: 'Dagger Stab',
    description: '1d4+4 piercing damage (sneak attack)',
    rollResult: {
      total: 6,
      rolls: [2],
      modifier: 4
    }
  },
  duration: 250,
  weaponType: 'dagger',
  damageType: 'piercing',
  range: 5
}

/**
 * Arrow Shot - Basic ranged attack (Longbow)
 * Range: 120ft (24 cells)
 * Projectile attack
 */
export const arrowShotTemplate: AttackTemplate = {
  templateId: 'arrow-shot',
  name: 'Arrow Shot (Longbow)',
  description: 'A longbow arrow shot (Range: 120ft / 24 cells)',
  type: 'attack',
  category: 'arrow',
  tags: ["attack","combat"],
  animation: {
    type: 'projectile',
    duration: 800,
    color: '#8B4513',
    size: 8,
    range: 120, // 120ft = 24 cells
    customParams: {
      projectileShape: 'arrow',
      rotation: true,
      trailLength: 2,
      arcHeight: 0.2
    }
  },
  effects: {
    affectedTargets: [],
    highlightColor: '#8B4513',
    highlightDuration: 500
  },
  metadata: {
    name: 'Arrow Shot',
    description: '1d8+2 piercing damage (Range: 120ft)',
    rollResult: {
      total: 7,
      rolls: [5],
      modifier: 2
    },
    range: 120 // Store range in metadata too
  },
  duration: 800,
  weaponType: 'longbow',
  damageType: 'piercing',
  range: 120 // 120ft = 24 cells
}

/**
 * Crossbow Bolt / Sling Shot - Medium ranged attack
 * Range: 60ft (12 cells)
 * High damage projectile
 */
export const crossbowBoltTemplate: AttackTemplate = {
  templateId: 'crossbow-bolt',
  name: 'Sling Shot',
  description: 'A sling shot attack (Range: 60ft / 12 cells)',
  type: 'attack',
  category: 'bolt',
  tags: ["attack","combat"],
  animation: {
    type: 'projectile',
    duration: 600,
    color: '#8B7355',
    size: 6,
    range: 60, // 60ft = 12 cells
    customParams: {
      projectileShape: 'bolt',
      speed: 1.0,
      piercing: true,
      impactForce: 'medium'
    }
  },
  effects: {
    affectedTargets: [],
    highlightColor: '#8B7355',
    highlightDuration: 500
  },
  metadata: {
    name: 'Sling Shot',
    description: '1d4+2 bludgeoning damage (Range: 60ft)',
    rollResult: {
      total: 5,
      rolls: [3],
      modifier: 2
    },
    range: 60 // Store range in metadata too
  },
  duration: 600,
  weaponType: 'sling',
  damageType: 'bludgeoning',
  range: 60 // 60ft = 12 cells
}

/**
 * Thrown Dagger - Quick ranged attack
 * Range: 30ft (6 cells)
 * Fast projectile
 */
export const throwingKnifeTemplate: AttackTemplate = {
  templateId: 'throwing-knife',
  name: 'Thrown Dagger',
  description: 'A thrown dagger attack (Range: 30ft / 6 cells)',
  type: 'attack',
  category: 'thrown',
  tags: ["attack","combat"],
  animation: {
    type: 'projectile',
    duration: 400,
    color: '#C0C0C0',
    size: 6,
    range: 30, // 30ft = 6 cells
    customParams: {
      projectileShape: 'knife',
      spin: true,
      spinSpeed: 2,
      glintEffect: true
    }
  },
  effects: {
    affectedTargets: [],
    highlightColor: '#C0C0C0',
    highlightDuration: 400
  },
  metadata: {
    name: 'Thrown Dagger',
    description: '1d4+3 piercing damage (Range: 30ft)',
    rollResult: {
      total: 5,
      rolls: [2],
      modifier: 3
    },
    range: 30 // Store range in metadata too
  },
  duration: 400,
  weaponType: 'dagger',
  damageType: 'piercing',
  range: 30 // 30ft = 6 cells
}

/**
 * Spear Thrust - Reach melee attack
 * Extended reach attack
 */
export const spearThrustTemplate: AttackTemplate = {
  templateId: 'spear-thrust',
  name: 'Spear Thrust',
  description: 'A thrusting attack with a spear',
  type: 'attack',
  category: 'spear',
  tags: ["attack","combat"],
  animation: {
    type: 'melee_slash',
    duration: 350,
    color: '#8B4513',
    size: 80,
    customParams: {
      thrustMotion: true,
      extendedReach: true,
      pierceEffect: true
    }
  },
  effects: {
    affectedTargets: [],
    areaOfEffect: {
      type: 'line',
      start: { x: 0, y: 0 },
      end: { x: 0, y: 0 },
      width: 5
    },
    highlightColor: '#8B4513',
    highlightDuration: 400
  },
  metadata: {
    name: 'Spear Thrust',
    description: '1d6+2 piercing damage',
    rollResult: {
      total: 5,
      rolls: [3],
      modifier: 2
    }
  },
  duration: 350,
  weaponType: 'spear',
  damageType: 'piercing',
  range: 10 // 10ft reach
}

/**
 * Create an attack action from a template
 */
export function createAttackFromTemplate(
  template: AttackTemplate,
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

  // Update area of effect for attacks with areas
  if (action.effects.areaOfEffect) {
    if (typeof source === 'object' && typeof target === 'object' && !Array.isArray(target)) {
      const sourcePoint = source as Point
      const targetPoint = target as Point

      switch (action.effects.areaOfEffect.type) {
        case 'cone':
          const dx = targetPoint.x - sourcePoint.x
          const dy = targetPoint.y - sourcePoint.y
          action.effects.areaOfEffect.origin = sourcePoint
          action.effects.areaOfEffect.direction = Math.atan2(dy, dx) * 180 / Math.PI
          break
        case 'line':
          action.effects.areaOfEffect.start = sourcePoint
          // Calculate end point based on range
          const angle = Math.atan2(
            targetPoint.y - sourcePoint.y,
            targetPoint.x - sourcePoint.x
          )
          const range = template.range ? template.range * 5 : 50 // Convert to grid units
          action.effects.areaOfEffect.end = {
            x: sourcePoint.x + Math.cos(angle) * range,
            y: sourcePoint.y + Math.sin(angle) * range
          }
          break
      }
    }
  }

  return action
}

/**
 * Get all attack templates
 */
export function getAllAttackTemplates(): AttackTemplate[] {
  return [
    swordSlashTemplate,
    axeSwingTemplate,
    maceSmashTemplate,
    daggerStabTemplate,
    arrowShotTemplate,
    crossbowBoltTemplate,
    throwingKnifeTemplate,
    spearThrustTemplate
  ]
}

/**
 * Get attack templates by type (melee/ranged)
 */
export function getAttackTemplatesByType(type: 'melee' | 'ranged'): AttackTemplate[] {
  const rangedCategories = ['arrow', 'bolt', 'thrown']

  if (type === 'ranged') {
    return getAllAttackTemplates().filter(t => rangedCategories.includes(t.category))
  } else {
    return getAllAttackTemplates().filter(t => !rangedCategories.includes(t.category))
  }
}

/**
 * Get attack template by ID
 */
export function getAttackTemplate(templateId: string): AttackTemplate | undefined {
  return getAllAttackTemplates().find(t => t.templateId === templateId)
}