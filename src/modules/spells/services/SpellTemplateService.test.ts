/**
 * Spell Template Service Tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { SpellTemplateService } from './SpellTemplateService'
import type {
  SpellSearchCriteria,
  createSpellSchoolId,
  createSpellCategoryId,
  createSpellTemplateId
} from '../types'

describe('SpellTemplateService', () => {
  let service: SpellTemplateService

  beforeEach(() => {
    service = new SpellTemplateService()
  })

  describe('searchSpells', () => {
    it('returns all spells with no criteria', () => {
      const results = service.searchSpells({})
      expect(results.length).toBeGreaterThan(0)
    })

    it('filters by query string', () => {
      const results = service.searchSpells({ query: 'fire' })
      expect(results.length).toBeGreaterThan(0)
      expect(results.some(spell =>
        spell.name.toLowerCase().includes('fire') ||
        spell.description?.toLowerCase().includes('fire') ||
        spell.tags.some(tag => tag.toLowerCase().includes('fire'))
      )).toBe(true)
    })

    it('filters by spell school', () => {
      const evocationResults = service.searchSpells({
        school: createSpellSchoolId('evocation')
      })
      const necromancyResults = service.searchSpells({
        school: createSpellSchoolId('necromancy')
      })

      expect(evocationResults.every(spell => spell.school === 'evocation')).toBe(true)
      expect(necromancyResults.every(spell => spell.school === 'necromancy')).toBe(true)
      expect(evocationResults.length).toBeGreaterThan(0)
    })

    it('filters by category', () => {
      const combatResults = service.searchSpells({
        category: createSpellCategoryId('combat')
      })
      expect(combatResults.every(spell => spell.category === 'combat')).toBe(true)
      expect(combatResults.length).toBeGreaterThan(0)
    })

    it('filters by tags', () => {
      const fireResults = service.searchSpells({ tags: ['fire'] })
      expect(fireResults.every(spell => spell.tags.includes('fire'))).toBe(true)
    })

    it('filters by spell level range', () => {
      const lowLevelResults = service.searchSpells({
        level: { min: 1, max: 2 }
      })

      lowLevelResults.forEach(spell => {
        const template = service.getTemplateById(spell.templateId)
        if (template?.level !== undefined) {
          expect(template.level).toBeGreaterThanOrEqual(1)
          expect(template.level).toBeLessThanOrEqual(2)
        }
      })
    })

    it('filters by effect type', () => {
      const areaResults = service.searchSpells({ type: 'area' })
      expect(areaResults.every(spell => spell.type === 'area')).toBe(true)
      expect(areaResults.length).toBeGreaterThan(0)
    })

    it('combines multiple filters', () => {
      const results = service.searchSpells({
        query: 'fire',
        school: createSpellSchoolId('evocation'),
        category: createSpellCategoryId('combat')
      })

      expect(results.every(spell =>
        spell.school === 'evocation' &&
        spell.category === 'combat'
      )).toBe(true)
    })
  })

  describe('getSpellsBySchool', () => {
    it('returns only spells of specified school', () => {
      const evocation = service.getSpellsBySchool(createSpellSchoolId('evocation'))
      const conjuration = service.getSpellsBySchool(createSpellSchoolId('conjuration'))

      expect(evocation.every(spell => spell.school === 'evocation')).toBe(true)
      expect(conjuration.every(spell => spell.school === 'conjuration')).toBe(true)
    })

    it('returns empty array for non-existent school', () => {
      const results = service.getSpellsBySchool('nonexistent' as any)
      expect(results).toEqual([])
    })
  })

  describe('getSpellsByCategory', () => {
    it('returns only spells of specified category', () => {
      const combat = service.getSpellsByCategory(createSpellCategoryId('combat'))
      const utility = service.getSpellsByCategory(createSpellCategoryId('utility'))

      expect(combat.every(spell => spell.category === 'combat')).toBe(true)
      expect(utility.every(spell => spell.category === 'utility')).toBe(true)
    })
  })

  describe('getSpellSchools', () => {
    it('returns school information with counts', () => {
      const schools = service.getSpellSchools()

      expect(schools.length).toBeGreaterThan(0)
      expect(schools[0]).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        description: expect.any(String),
        icon: expect.any(String),
        color: expect.any(String),
        count: expect.any(Number)
      })
    })

    it('calculates correct school counts', () => {
      const schools = service.getSpellSchools()
      const evocationSchool = schools.find(school => school.id === 'evocation')
      const evocationSpells = service.getSpellsBySchool(createSpellSchoolId('evocation'))

      expect(evocationSchool?.count).toBe(evocationSpells.length)
    })
  })

  describe('getSpellCategories', () => {
    it('returns category information with counts', () => {
      const categories = service.getSpellCategories()

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
      const categories = service.getSpellCategories()
      const combatCategory = categories.find(cat => cat.id === 'combat')
      const combatSpells = service.getSpellsByCategory(createSpellCategoryId('combat'))

      expect(combatCategory?.count).toBe(combatSpells.length)
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

  describe('getPopularSpells', () => {
    it('returns limited number of popular spells', () => {
      const popular = service.getPopularSpells(3)
      expect(popular.length).toBeLessThanOrEqual(3)
    })

    it('returns spells from different schools', () => {
      const popular = service.getPopularSpells(6)
      const schools = [...new Set(popular.map(spell => spell.school))]
      expect(schools.length).toBeGreaterThan(1)
    })
  })

  describe('custom spells', () => {
    it('creates custom spell from template', () => {
      const customSpell = service.createCustomSpellFromTemplate(
        createSpellTemplateId('fireball'),
        { name: 'Epic Fireball' }
      )

      expect(customSpell.name).toBe('Epic Fireball')
      expect(customSpell.isCustom).toBe(true)
      expect(customSpell.templateId).toBe('fireball')
    })

    it('applies customization overrides', () => {
      const customSpell = service.createCustomSpellFromTemplate(
        createSpellTemplateId('fireball'),
        {
          name: 'Cold Fireball',
          color: '#0000ff',
          opacity: 0.5,
          tags: ['cold', 'area', 'custom']
        }
      )

      expect(customSpell.name).toBe('Cold Fireball')
      expect(customSpell.color).toBe('#0000ff')
      expect(customSpell.opacity).toBe(0.5)
      expect(customSpell.tags).toEqual(['cold', 'area', 'custom'])
    })

    it('saves and retrieves custom templates', () => {
      const customTemplate = service.saveCustomTemplate({
        name: 'Custom Ice Shard',
        school: 'evocation',
        level: 2,
        description: 'A sharp shard of ice',
        effect: {
          type: 'single',
          defaultSize: { radius: 10 },
          defaultColor: '#87ceeb',
          defaultOpacity: 0.8,
          defaultDuration: 0
        },
        animation: {
          enter: 'burst',
          exit: 'fade-out',
          enterDuration: 300,
          exitDuration: 500
        },
        category: createSpellCategoryId('combat'),
        tags: ['cold', 'projectile'],
        popularity: 25,
        customizable: true
      })

      const retrieved = service.getTemplateById(customTemplate.id)
      expect(retrieved).toEqual(customTemplate)
      expect(retrieved?.isBuiltIn).toBe(false)
    })

    it('deletes custom templates', () => {
      const customTemplate = service.saveCustomTemplate({
        name: 'Temporary Spell',
        school: 'transmutation',
        level: 1,
        description: 'A test spell',
        effect: {
          type: 'area',
          defaultSize: { radius: 25 },
          defaultColor: '#ffffff',
          defaultOpacity: 0.5,
          defaultDuration: 1
        },
        animation: {
          enter: 'fade-in',
          exit: 'fade-out',
          enterDuration: 500,
          exitDuration: 500
        },
        category: createSpellCategoryId('utility'),
        tags: ['test'],
        popularity: 1,
        customizable: true
      })

      const deleted = service.deleteCustomTemplate(customTemplate.id)
      expect(deleted).toBe(true)

      const retrieved = service.getTemplateById(customTemplate.id)
      expect(retrieved).toBeNull()
    })
  })

  describe('template management', () => {
    it('gets template by ID', () => {
      const template = service.getTemplateById(createSpellTemplateId('fireball'))
      expect(template).toBeTruthy()
      expect(template?.name).toBe('Fireball')
      expect(template?.isBuiltIn).toBe(true)
    })

    it('returns null for non-existent template', () => {
      const template = service.getTemplateById(createSpellTemplateId('nonexistent'))
      expect(template).toBeNull()
    })
  })

  describe('built-in templates', () => {
    it('includes essential D&D spells', () => {
      const fireball = service.getTemplateById(createSpellTemplateId('fireball'))
      const lightningBolt = service.getTemplateById(createSpellTemplateId('lightning-bolt'))
      const darkness = service.getTemplateById(createSpellTemplateId('darkness'))

      expect(fireball?.name).toBe('Fireball')
      expect(fireball?.school).toBe('evocation')
      expect(fireball?.level).toBe(3)

      expect(lightningBolt?.name).toBe('Lightning Bolt')
      expect(lightningBolt?.school).toBe('evocation')

      expect(darkness?.name).toBe('Darkness')
      expect(darkness?.school).toBe('evocation')
    })

    it('has proper D&D spell data', () => {
      const fireball = service.getTemplateById(createSpellTemplateId('fireball'))
      expect(fireball?.effect).toMatchObject({
        type: 'area',
        defaultColor: '#ff4500',
        defaultOpacity: 0.7,
        defaultDuration: 0
      })
    })

    it('has proper animation configurations', () => {
      const lightningBolt = service.getTemplateById(createSpellTemplateId('lightning-bolt'))
      expect(lightningBolt?.animation).toMatchObject({
        enter: 'burst',
        exit: 'fade-out',
        enterDuration: 300,
        exitDuration: 500
      })
    })
  })
})