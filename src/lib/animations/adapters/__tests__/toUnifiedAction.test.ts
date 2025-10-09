/**
 * Unit tests for Animation Library to UnifiedAction Adapter
 */

import { describe, it, expect } from 'vitest'
import {
  animationToUnifiedAction,
  getAnimationsByCategory,
  getAnimationsByType,
  getAnimationInfo,
  searchAnimations
} from '../toUnifiedAction'
import type { Point } from '../../types'

describe('toUnifiedAction Adapter', () => {
  const sourcePos: Point = { x: 100, y: 100 }
  const targetPos: Point = { x: 300, y: 300 }

  describe('animationToUnifiedAction', () => {
    it('should convert Fireball to UnifiedAction', () => {
      const action = animationToUnifiedAction('Fireball', sourcePos, targetPos)

      expect(action).toBeDefined()
      expect(action.name).toBe('Fireball')
      expect(action.type).toBe('spell')
      expect(action.category).toBe('projectile')
      expect(action.animation.type).toBe('projectile')
      expect(action.animation.color).toBeTruthy()
      expect(action.source).toEqual(sourcePos)
      expect(action.target).toEqual(targetPos)
    })

    it('should convert Longsword to UnifiedAction', () => {
      const action = animationToUnifiedAction('Longsword', sourcePos, targetPos)

      expect(action).toBeDefined()
      expect(action.name).toBe('Longsword')
      expect(action.type).toBe('attack')
      expect(action.category).toBe('melee')
      expect(action.animation.type).toMatch(/melee_/)
      expect(action.damage).toBeDefined()
      expect(action.damageType).toBe('slashing')
    })

    it('should convert Walk to UnifiedAction', () => {
      const action = animationToUnifiedAction('Walk', sourcePos, targetPos)

      expect(action).toBeDefined()
      expect(action.name).toBe('Walk')
      expect(action.type).toBe('move')
      expect(action.category).toBe('movement')
    })

    it('should convert Stunned to UnifiedAction', () => {
      const action = animationToUnifiedAction('Stunned', sourcePos, targetPos)

      expect(action).toBeDefined()
      expect(action.name).toBe('Stunned')
      expect(action.type).toBe('spell')
      expect(action.category).toBe('status')
      expect(action.animation.persistent).toBe(true)
    })

    it('should throw error for unknown animation', () => {
      expect(() => {
        animationToUnifiedAction('NonExistent' as any, sourcePos, targetPos)
      }).toThrow('Animation "NonExistent" not found')
    })

    it('should handle string source and target array', () => {
      const action = animationToUnifiedAction('Fireball', 'token-1', ['token-2'])

      expect(action.source).toBe('token-1')
      expect(action.target).toEqual(['token-2'])
    })

    it('should handle array target', () => {
      const action = animationToUnifiedAction('Fireball', sourcePos, ['token-1', 'token-2'])

      expect(action.target).toEqual(['token-1', 'token-2'])
      expect(action.effects.affectedTargets).toEqual(['token-1', 'token-2'])
    })

    it('should generate unique IDs', () => {
      const action1 = animationToUnifiedAction('Fireball', sourcePos, targetPos)
      const action2 = animationToUnifiedAction('Fireball', sourcePos, targetPos)

      expect(action1.id).not.toBe(action2.id)
    })

    it('should set customizable to true', () => {
      const action = animationToUnifiedAction('Fireball', sourcePos, targetPos)

      expect(action.customizable).toBe(true)
      expect(action.isCustom).toBe(false)
    })

    it('should set templateId', () => {
      const action = animationToUnifiedAction('Fireball', sourcePos, targetPos)

      expect(action.templateId).toBe('Fireball')
    })
  })

  describe('getAnimationsByCategory', () => {
    it('should return projectile spells', () => {
      const projectiles = getAnimationsByCategory('projectile')

      expect(projectiles).toContain('Fireball')
      expect(projectiles).toContain('Magic Missile')
      expect(projectiles).toContain('Guiding Bolt')
    })

    it('should return melee attacks', () => {
      const attacks = getAnimationsByCategory('attack')

      expect(attacks).toContain('Longsword')
      expect(attacks).toContain('Rapier')
      expect(attacks).toContain('Warhammer')
    })

    it('should return movements', () => {
      const movements = getAnimationsByCategory('movement')

      expect(movements).toContain('Walk')
      expect(movements).toContain('Dash')
      expect(movements).toContain('Teleport')
    })

    it('should return status effects', () => {
      const statuses = getAnimationsByCategory('status')

      expect(statuses).toContain('Stunned')
      expect(statuses).toContain('Poisoned')
      expect(statuses).toContain('Blessed')
    })
  })

  describe('getAnimationsByType', () => {
    it('should group animations by type', () => {
      const grouped = getAnimationsByType()

      expect(grouped.spell).toBeDefined()
      expect(grouped.attack).toBeDefined()
      expect(grouped.move).toBeDefined()
      expect(grouped.status).toBeDefined()

      expect(grouped.spell.length).toBeGreaterThan(0)
      expect(grouped.attack.length).toBeGreaterThan(0)
      expect(grouped.move.length).toBeGreaterThan(0)
    })

    it('should categorize spells correctly', () => {
      const grouped = getAnimationsByType()

      expect(grouped.spell).toContain('Fireball')
      expect(grouped.spell).toContain('Thunderwave')
      expect(grouped.spell).toContain('Darkness')
    })

    it('should categorize attacks correctly', () => {
      const grouped = getAnimationsByType()

      expect(grouped.attack).toContain('Longsword')
      expect(grouped.attack).toContain('Longbow')
    })

    it('should categorize movements correctly', () => {
      const grouped = getAnimationsByType()

      expect(grouped.move).toContain('Walk')
      expect(grouped.move).toContain('Dash')
    })
  })

  describe('getAnimationInfo', () => {
    it('should return animation info', () => {
      const info = getAnimationInfo('Fireball')

      expect(info).toBeDefined()
      expect(info?.name).toBe('Fireball')
      expect(info?.category).toBe('projectile')
      expect(info?.color).toBeTruthy()
      expect(info?.duration).toBeGreaterThan(0)
    })

    it('should return null for unknown animation', () => {
      const info = getAnimationInfo('NonExistent' as any)

      expect(info).toBeNull()
    })

    it('should include all display properties', () => {
      const info = getAnimationInfo('Longsword')

      expect(info).toHaveProperty('name')
      expect(info).toHaveProperty('description')
      expect(info).toHaveProperty('category')
      expect(info).toHaveProperty('color')
      expect(info).toHaveProperty('duration')
    })
  })

  describe('searchAnimations', () => {
    it('should find animations by name', () => {
      const results = searchAnimations('fire')

      expect(results).toContain('Fireball')
    })

    it('should find animations by partial name', () => {
      const results = searchAnimations('sword')

      expect(results).toContain('Longsword')
    })

    it('should be case insensitive', () => {
      const results = searchAnimations('FIREBALL')

      expect(results).toContain('Fireball')
    })

    it('should return empty array for no matches', () => {
      const results = searchAnimations('xyz123')

      expect(results).toEqual([])
    })
  })

  describe('Animation Config Building', () => {
    it('should build projectile config correctly', () => {
      const action = animationToUnifiedAction('Fireball', sourcePos, targetPos)

      expect(action.animation.speed).toBeDefined()
      expect(action.animation.trail).toBe(true)
      expect(action.animation.trailLength).toBe(8)
    })

    it('should build burst config correctly', () => {
      const action = animationToUnifiedAction('Thunderwave', sourcePos, targetPos)

      expect(action.animation.burstSize).toBeDefined()
      expect(action.animation.particles).toBe(true)
    })

    it('should build area config correctly', () => {
      const action = animationToUnifiedAction('Darkness', sourcePos, targetPos)

      expect(action.animation.persistent).toBeDefined()
      expect(action.animation.opacity).toBeDefined()
    })

    it('should build ray config correctly', () => {
      const action = animationToUnifiedAction('Ray of Frost', sourcePos, targetPos)

      expect(action.animation.instant).toBe(true)
      expect(action.animation.glow).toBe(true)
    })

    it('should build melee config correctly', () => {
      const action = animationToUnifiedAction('Longsword', sourcePos, targetPos)

      expect(action.animation.range).toBe(5)
      expect(action.animation.impact).toBe(true)
    })

    it('should build ranged config correctly', () => {
      const action = animationToUnifiedAction('Longbow', sourcePos, targetPos)

      expect(action.animation.type).toBe('projectile')
      expect(action.animation.speed).toBe(600)
      expect(action.animation.trail).toBe(true)
    })
  })

  describe('Metadata Building', () => {
    it('should include damage for attacks', () => {
      const action = animationToUnifiedAction('Longsword', sourcePos, targetPos)

      expect(action.damage).toBeDefined()
      expect(action.damage).toMatch(/d\d+/) // Matches dice notation
    })

    it('should include damage type for attacks', () => {
      const action = animationToUnifiedAction('Longsword', sourcePos, targetPos)

      expect(action.damageType).toBe('slashing')
    })

    it('should include spell level for spells', () => {
      const action = animationToUnifiedAction('Fireball', sourcePos, targetPos)

      expect(action.spellLevel).toBeDefined()
      expect(action.spellLevel).toBeGreaterThanOrEqual(0)
      expect(action.spellLevel).toBeLessThanOrEqual(9)
    })

    it('should include range for ranged actions', () => {
      const action = animationToUnifiedAction('Longbow', sourcePos, targetPos)

      expect(action.range).toBeDefined()
      expect(action.range).toBeGreaterThan(0)
    })
  })
})
