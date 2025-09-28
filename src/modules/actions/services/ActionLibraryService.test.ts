/**
 * Action Library Service Tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { ActionLibraryService } from './ActionLibraryService'
// import type { ActionSearchCriteria } from '@/types/unifiedAction'

describe('ActionLibraryService', () => {
  let service: ActionLibraryService

  beforeEach(() => {
    service = new ActionLibraryService()
  })

  describe('searchActions', () => {
    it('returns all actions with no criteria', () => {
      const results = service.searchActions({})
      expect(results.length).toBeGreaterThan(0)
    })

    it('filters by query string', () => {
      const results = service.searchActions({ query: 'fire' })
      expect(results.length).toBeGreaterThan(0)
      expect(results.some(action =>
        action.name.toLowerCase().includes('fire') ||
        action.description.toLowerCase().includes('fire') ||
        action.tags.some(tag => tag.toLowerCase().includes('fire'))
      )).toBe(true)
    })

    it('filters by action type', () => {
      const spellResults = service.searchActions({ type: 'spell' })
      const attackResults = service.searchActions({ type: 'attack' })

      expect(spellResults.every(action => action.type === 'spell')).toBe(true)
      expect(attackResults.every(action => action.type === 'attack')).toBe(true)
      expect(spellResults.length).toBeGreaterThan(0)
      expect(attackResults.length).toBeGreaterThan(0)
    })

    it('filters by category', () => {
      const attackResults = service.searchActions({ category: 'attack' })
      expect(attackResults.every(action => action.category === 'attack')).toBe(true)
      expect(attackResults.length).toBeGreaterThan(0)
    })

    it('filters by tags', () => {
      const fireResults = service.searchActions({ tags: ['fire'] })
      expect(fireResults.every(action => action.tags.includes('fire'))).toBe(true)
    })

    it('filters by spell level', () => {
      const lowLevelResults = service.searchActions({
        type: 'spell',
        minLevel: 1,
        maxLevel: 2
      })

      lowLevelResults.forEach(action => {
        if (action.type === 'spell') {
          const template = service.getTemplateById(action.templateId || null)
          if (template?.level !== undefined) {
            expect(template.level).toBeGreaterThanOrEqual(1)
            expect(template.level).toBeLessThanOrEqual(2)
          }
        }
      })
    })

    it('combines multiple filters', () => {
      const results = service.searchActions({
        query: 'attack',
        type: 'attack',
        category: 'attack'
      })

      expect(results.every(action =>
        action.type === 'attack' &&
        action.category === 'attack'
      )).toBe(true)
    })
  })

  describe('getActionsByType', () => {
    it('returns only actions of specified type', () => {
      const spells = service.getActionsByType('spell')
      const attacks = service.getActionsByType('attack')

      expect(spells.every(action => action.type === 'spell')).toBe(true)
      expect(attacks.every(action => action.type === 'attack')).toBe(true)
    })

    it('returns empty array for non-existent type', () => {
      const results = service.getActionsByType('nonexistent' as any)
      expect(results).toEqual([])
    })
  })

  describe('getActionsByCategory', () => {
    it('returns only actions of specified category', () => {
      const attack = service.getActionsByCategory('attack')
      const utility = service.getActionsByCategory('utility')

      expect(attack.every(action => action.category === 'attack')).toBe(true)
      expect(utility.every(action => action.category === 'utility')).toBe(true)
    })
  })

  describe('getCategories', () => {
    it('returns category information with counts', () => {
      const categories = service.getCategories()

      expect(categories.length).toBeGreaterThan(0)
      expect(categories[0]).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        description: expect.any(String),
        icon: expect.any(String),
        color: expect.any(String),
        count: expect.any(Number)
      })
    })

    it('calculates correct category counts', () => {
      const categories = service.getCategories()
      const attackCategory = categories.find(cat => cat.id === 'attack')
      const attackActions = service.getActionsByCategory('attack')

      expect(attackCategory?.count).toBe(attackActions.length)
    })
  })

  describe('getAllTags', () => {
    it('returns sorted array of unique tags', () => {
      const tags = service.getAllTags()

      expect(Array.isArray(tags)).toBe(true)
      expect(tags.length).toBeGreaterThan(0)
      expect(tags).toEqual([...tags].sort())

      // Check uniqueness
      const uniqueTags = [...new Set(tags)]
      expect(tags.length).toBe(uniqueTags.length)
    })
  })

  describe('getPopularActions', () => {
    it('returns limited number of popular actions', () => {
      const popular = service.getPopularActions(3)
      expect(popular.length).toBeLessThanOrEqual(3)
    })

    it('returns actions from different types', () => {
      const popular = service.getPopularActions(6)
      const types = [...new Set(popular.map(action => action.type))]
      expect(types.length).toBeGreaterThan(1)
    })
  })

  describe('custom actions', () => {
    it('saves and retrieves custom actions', () => {
      const customAction = service.createCustomActionFromTemplate(
        'sword_attack' as any,
        { name: 'Epic Sword Strike' }
      )

      service.saveCustomAction(customAction)
      const retrieved = service.getActionById(customAction.id)

      expect(retrieved).toEqual(customAction)
      expect(retrieved?.name).toBe('Epic Sword Strike')
      expect(retrieved?.isCustom).toBe(true)
    })

    it('includes custom actions in search when enabled', () => {
      const customAction = service.createCustomActionFromTemplate(
        'fireball' as any,
        { name: 'Super Fireball' }
      )
      service.saveCustomAction(customAction)

      const withCustom = service.searchActions({
        query: 'super',
        includeCustom: true
      })
      const withoutCustom = service.searchActions({
        query: 'super',
        includeCustom: false
      })

      expect(withCustom.length).toBeGreaterThan(withoutCustom.length)
      expect(withCustom.some(action => action.name === 'Super Fireball')).toBe(true)
      expect(withoutCustom.some(action => action.name === 'Super Fireball')).toBe(false)
    })

    it('deletes custom actions', () => {
      const customAction = service.createCustomActionFromTemplate(
        'bow_attack' as any,
        { name: 'Magic Bow' }
      )
      service.saveCustomAction(customAction)

      const deleted = service.deleteCustomAction(customAction.id)
      expect(deleted).toBe(true)

      const retrieved = service.getActionById(customAction.id)
      expect(retrieved).toBeNull()
    })
  })

  describe('template management', () => {
    it('gets template by ID', () => {
      const template = service.getTemplateById('fireball' as any)
      expect(template).toBeTruthy()
      expect(template?.name).toBe('Fireball')
      expect(template?.isBuiltIn).toBe(true)
    })

    it('returns null for non-existent template', () => {
      const template = service.getTemplateById('nonexistent' as any)
      expect(template).toBeNull()
    })
  })

  describe('built-in templates', () => {
    it('includes essential D&D actions', () => {
      const fireball = service.getTemplateById('fireball' as any)
      const swordAttack = service.getTemplateById('sword_attack' as any)
      const dash = service.getTemplateById('dash' as any)

      expect(fireball?.name).toBe('Fireball')
      expect(fireball?.type).toBe('spell')
      expect(fireball?.level).toBe(3)

      expect(swordAttack?.name).toBe('Sword Attack')
      expect(swordAttack?.type).toBe('attack')

      expect(dash?.name).toBe('Dash')
      expect(dash?.type).toBe('movement')
    })

    it('has proper D&D spell data', () => {
      const fireball = service.getTemplateById('fireball' as any)
      expect(fireball?.data).toMatchObject({
        type: 'spell',
        school: 'evocation',
        level: 3,
        components: ['verbal', 'somatic', 'material']
      })
    })

    it('has proper weapon attack data', () => {
      const swordAttack = service.getTemplateById('sword_attack' as any)
      expect(swordAttack?.data).toMatchObject({
        type: 'attack',
        attackType: 'melee',
        weapon: expect.objectContaining({
          name: 'Longsword',
          damage: expect.objectContaining({
            baseDice: '1d8',
            damageType: 'slashing'
          })
        })
      })
    })
  })
})