import { describe, test, expect, beforeEach, vi } from 'vitest'
import {
  getAllSpellTemplates,
  getSpellTemplate,
  createSpellFromTemplate,
  fireballTemplate,
  lightningBoltTemplate
} from '@/components/UnifiedActions/templates/spellTemplates'
import {
  getAllAttackTemplates,
  getAttackTemplate,
  getAttackTemplatesByType,
  createAttackFromTemplate,
  swordSlashTemplate
} from '@/components/UnifiedActions/templates/attackTemplates'
import {
  getAllInteractionTemplates,
  getInteractionTemplate,
  getInteractionTemplatesByType,
  getInteractionTemplatesWithChecks,
  createInteractionFromTemplate,
  openDoorTemplate
} from '@/components/UnifiedActions/templates/interactionTemplates'
import {
  getAllTemplateCategories,
  getTemplatesByType,
  getTemplate,
  createActionFromTemplate,
  getTemplatesWithChecks,
  searchTemplates,
  getTemplatesByCategory,
  groupTemplatesByCategory,
  getRandomTemplate,
  isValidTemplate
} from '@/components/UnifiedActions/templates/templateLoader'
import type { Point } from '@/types/geometry'

// Mock nanoid for consistent IDs in tests
vi.mock('nanoid', () => ({
  nanoid: vi.fn(() => 'test-id-123')
}))

describe('Phase 5: Template System', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Spell Templates', () => {
    test('should provide all spell templates', () => {
      const templates = getAllSpellTemplates()

      expect(templates).toHaveLength(6)
      expect(templates.map(t => t.templateId)).toContain('fireball')
      expect(templates.map(t => t.templateId)).toContain('magic-missile')
      expect(templates.map(t => t.templateId)).toContain('lightning-bolt')
      expect(templates.map(t => t.templateId)).toContain('healing-word')
      expect(templates.map(t => t.templateId)).toContain('cone-of-cold')
      expect(templates.map(t => t.templateId)).toContain('burning-hands')
    })

    test('should get specific spell template', () => {
      const fireball = getSpellTemplate('fireball')

      expect(fireball).toBeDefined()
      expect(fireball?.templateId).toBe('fireball')
      expect(fireball?.type).toBe('spell')
      expect(fireball?.category).toBe('fire')
      expect(fireball?.level).toBe(3)
      expect(fireball?.school).toBe('evocation')
    })

    test('should return undefined for non-existent template', () => {
      const template = getSpellTemplate('non-existent')
      expect(template).toBeUndefined()
    })

    test('should create spell action from template', () => {
      const source: Point = { x: 100, y: 100 }
      const target: Point = { x: 200, y: 200 }

      const action = createSpellFromTemplate(fireballTemplate, source, target)

      expect(action.id).toBe('test-id-123')
      expect(action.type).toBe('spell')
      expect(action.category).toBe('fire')
      expect(action.source).toEqual(source)
      expect(action.target).toEqual(target)
      expect(action.timestamp).toBeLessThanOrEqual(Date.now())
      expect(action.effects.areaOfEffect?.type).toBe('circle')
      if (action.effects.areaOfEffect?.type === 'circle') {
        expect(action.effects.areaOfEffect.center).toEqual(target)
        expect(action.effects.areaOfEffect.radius).toBe(100)
      }
    })

    test('should handle cone spell area positioning', () => {
      const source: Point = { x: 0, y: 0 }
      const target: Point = { x: 100, y: 0 }

      const action = createSpellFromTemplate(
        { ...fireballTemplate, effects: {
          ...fireballTemplate.effects,
          areaOfEffect: { type: 'cone', origin: { x: 0, y: 0 }, direction: 0, angle: 60, range: 100 }
        }},
        source,
        target
      )

      if (action.effects.areaOfEffect?.type === 'cone') {
        expect(action.effects.areaOfEffect.origin).toEqual(source)
        expect(action.effects.areaOfEffect.direction).toBe(0) // East
      }
    })

    test('should handle line spell area positioning', () => {
      const source: Point = { x: 50, y: 50 }
      const target: Point = { x: 150, y: 50 }

      const action = createSpellFromTemplate(lightningBoltTemplate, source, target)

      if (action.effects.areaOfEffect?.type === 'line') {
        expect(action.effects.areaOfEffect.start).toEqual(source)
        expect(action.effects.areaOfEffect.end).toEqual(target)
      }
    })
  })

  describe('Attack Templates', () => {
    test('should provide all attack templates', () => {
      const templates = getAllAttackTemplates()

      expect(templates).toHaveLength(8)
      expect(templates.some(t => t.templateId === 'sword-slash')).toBe(true)
      expect(templates.some(t => t.templateId === 'arrow-shot')).toBe(true)
      expect(templates.some(t => t.weaponType === 'longsword')).toBe(true)
      expect(templates.some(t => t.weaponType === 'longbow')).toBe(true)
    })

    test('should filter melee attacks', () => {
      const meleeAttacks = getAttackTemplatesByType('melee')

      expect(meleeAttacks.length).toBeGreaterThan(0)
      expect(meleeAttacks.every(t =>
        !['arrow', 'bolt', 'thrown'].includes(t.category)
      )).toBe(true)
    })

    test('should filter ranged attacks', () => {
      const rangedAttacks = getAttackTemplatesByType('ranged')

      expect(rangedAttacks.length).toBeGreaterThan(0)
      expect(rangedAttacks.every(t =>
        ['arrow', 'bolt', 'thrown'].includes(t.category)
      )).toBe(true)
    })

    test('should create attack action from template', () => {
      const source: Point = { x: 50, y: 50 }
      const target = ['token-123']

      const action = createAttackFromTemplate(swordSlashTemplate, source, target)

      expect(action.id).toBe('test-id-123')
      expect(action.type).toBe('attack')
    })

    test('should handle area attacks correctly', () => {
      const axeTemplate = getAllAttackTemplates().find(t => t.templateId === 'axe-swing')!
      const source: Point = { x: 100, y: 100 }
      const target: Point = { x: 150, y: 100 }

      const action = createAttackFromTemplate(axeTemplate, source, target)

      if (action.effects.areaOfEffect?.type === 'cone') {
        expect(action.effects.areaOfEffect.origin).toEqual(source)
        expect(action.effects.areaOfEffect.direction).toBe(0) // East
        expect(action.effects.areaOfEffect.angle).toBe(90)
      }
    })
  })

  describe('Interaction Templates', () => {
    test('should provide all interaction templates', () => {
      const templates = getAllInteractionTemplates()

      expect(templates).toHaveLength(10)
      expect(templates.some(t => t.templateId === 'open-door')).toBe(true)
      expect(templates.some(t => t.templateId === 'locked-door')).toBe(true)
      expect(templates.some(t => t.templateId === 'disarm-trap')).toBe(true)
      expect(templates.some(t => t.templateId === 'trigger-trap')).toBe(true)
    })

    test('should filter by object type', () => {
      const doorInteractions = getInteractionTemplatesByType('door')

      expect(doorInteractions.length).toBeGreaterThanOrEqual(2)
      expect(doorInteractions.every(t => t.objectType === 'door')).toBe(true)
    })

    test('should get interactions that require checks', () => {
      const checksRequired = getInteractionTemplatesWithChecks()

      expect(checksRequired.length).toBeGreaterThan(0)
      expect(checksRequired.every(t => t.requiresCheck === true)).toBe(true)
      expect(checksRequired.every(t => t.checkDC !== undefined)).toBe(true)
    })

    test('should create interaction action from template', () => {
      const target: Point = { x: 300, y: 300 }

      const action = createInteractionFromTemplate(
        openDoorTemplate,
        'token-player',
        target
      )

      expect(action.id).toBe('test-id-123')
      expect(action.type).toBe('interaction')
      expect(action.category).toBe('door')
      expect(action.metadata.name).toBe('Open Door')
    })

    test('should handle trap trigger area effect', () => {
      const trapTemplate = getInteractionTemplate('trigger-trap')!
      const source: Point = { x: 150, y: 150 }
      const target: Point = { x: 150, y: 150 }

      const action = createInteractionFromTemplate(trapTemplate, source, target)

      if (action.effects.areaOfEffect?.type === 'circle') {
        expect(action.effects.areaOfEffect.center).toEqual(target)
        expect(action.effects.areaOfEffect.radius).toBe(75)
      }
    })
  })

  describe('Template Loader', () => {
    test('should get all template categories', () => {
      const categories = getAllTemplateCategories()

      expect(categories).toHaveLength(4)
      expect(categories.some(c => c.id === 'spells')).toBe(true)
      expect(categories.some(c => c.id === 'melee-attacks')).toBe(true)
      expect(categories.some(c => c.id === 'ranged-attacks')).toBe(true)
      expect(categories.some(c => c.id === 'interactions')).toBe(true)
    })

    test('should get templates by type', () => {
      const spells = getTemplatesByType('spell')
      const attacks = getTemplatesByType('attack')
      const interactions = getTemplatesByType('interaction')

      expect(spells.length).toBeGreaterThan(0)
      expect(attacks.length).toBeGreaterThan(0)
      expect(interactions.length).toBeGreaterThan(0)

      expect(spells.every(t => t.type === 'spell')).toBe(true)
      expect(attacks.every(t => t.type === 'attack')).toBe(true)
      expect(interactions.every(t => t.type === 'interaction')).toBe(true)
    })

    test('should get specific template by type and ID', () => {
      const spell = getTemplate('spell', 'fireball')
      const attack = getTemplate('attack', 'sword-slash')
      const interaction = getTemplate('interaction', 'open-door')

      expect(spell?.templateId).toBe('fireball')
      expect(attack?.templateId).toBe('sword-slash')
      expect(interaction?.templateId).toBe('open-door')
    })

    test('should create action from any template', () => {
      const template = fireballTemplate
      const source: Point = { x: 0, y: 0 }
      const target: Point = { x: 100, y: 100 }

      const action = createActionFromTemplate(template, source, target)

      expect(action.id).toBe('test-id-123')
      expect(action.type).toBe('spell')
      expect(action.source).toEqual(source)
      expect(action.target).toEqual(target)
    })

    test('should get templates that require checks', () => {
      const checksRequired = getTemplatesWithChecks()

      expect(checksRequired.length).toBeGreaterThan(0)
      expect(checksRequired.every(t =>
        'requiresCheck' in t && t.requiresCheck === true
      )).toBe(true)
    })

    test('should search templates by name', () => {
      const results = searchTemplates('fire')

      expect(results.length).toBeGreaterThan(0)
      expect(results.some(t => t.metadata.name.includes('Fire'))).toBe(true)
    })

    test('should search templates case-insensitive', () => {
      const results = searchTemplates('SWORD')

      expect(results.length).toBeGreaterThan(0)
      expect(results.some(t => t.metadata.name.includes('Sword'))).toBe(true)
    })

    test('should get templates by category', () => {
      const fireTemplates = getTemplatesByCategory('fire')

      expect(fireTemplates.length).toBeGreaterThan(0)
      expect(fireTemplates.every(t => t.category === 'fire')).toBe(true)
    })

    test('should group templates by category', () => {
      const grouped = groupTemplatesByCategory()

      expect(grouped.size).toBeGreaterThan(0)
      expect(grouped.has('fire')).toBe(true)
      expect(grouped.has('sword')).toBe(true)
      expect(grouped.has('door')).toBe(true)

      const fireGroup = grouped.get('fire')
      expect(fireGroup).toBeDefined()
      expect(fireGroup!.every(t => t.category === 'fire')).toBe(true)
    })

    test('should get random template', () => {
      const template = getRandomTemplate()

      expect(template).toBeDefined()
      expect(template.templateId).toBeDefined()
      expect(template.type).toMatch(/^(spell|attack|interaction)$/)
    })

    test('should validate template structure', () => {
      const validTemplate = fireballTemplate
      const invalidTemplate = { id: 'test', name: 'Invalid' }

      expect(isValidTemplate(validTemplate)).toBe(true)
      expect(isValidTemplate(invalidTemplate)).toBe(false)
      expect(isValidTemplate(null)).toBe(false)
      expect(isValidTemplate(undefined)).toBe(false)
    })

    test('should handle string source and target', () => {
      const template = swordSlashTemplate
      const source = 'token-player'
      const target = ['token-enemy1', 'token-enemy2']

      const action = createActionFromTemplate(template, source, target)

      expect(action.source).toBe(source)
      expect(action.target).toEqual(target)
    })

    test('should handle complex area updates', () => {
      // Test cone with proper source and target points
      const coneTemplate = {
        ...fireballTemplate,
        effects: {
          ...fireballTemplate.effects,
          areaOfEffect: {
            type: 'cone' as const,
            origin: { x: 0, y: 0 },
            direction: 0,
            angle: 60,
            range: 100
          }
        }
      }

      const source: Point = { x: 100, y: 100 }
      const target: Point = { x: 200, y: 150 }

      const action = createActionFromTemplate(coneTemplate, source, target)

      if (action.effects.areaOfEffect?.type === 'cone') {
        expect(action.effects.areaOfEffect.origin).toEqual(source)
        // Direction should be calculated from source to target
        const expectedDirection = Math.atan2(50, 100) * 180 / Math.PI
        expect(action.effects.areaOfEffect.direction).toBeCloseTo(expectedDirection, 1)
      }
    })
  })

  describe('Template Metadata', () => {
    test('should preserve spell metadata', () => {
      const spell = getSpellTemplate('fireball')

      expect(spell?.metadata.name).toBe('Fireball')
      expect(spell?.metadata.description).toContain('8d6 fire damage')
      expect(spell?.metadata.rollResult).toBeDefined()
      expect(spell?.metadata.rollResult?.total).toBe(28)
      expect(spell?.metadata.rollResult?.rolls).toHaveLength(8)
    })

    test('should preserve attack metadata', () => {
      const attack = getAttackTemplate('sword-slash')

      expect(attack?.metadata.name).toBe('Sword Slash')
      expect(attack?.metadata.description).toContain('1d8+3')
      expect(attack?.metadata.rollResult?.total).toBe(7)
    })

    test('should preserve interaction metadata', () => {
      const interaction = getInteractionTemplate('locked-door')

      expect(interaction?.metadata.name).toBe('Unlock Door')
      expect(interaction?.metadata.description).toContain('DC 15')
      expect(interaction?.requiresCheck).toBe(true)
      expect(interaction?.checkDC).toBe(15)
    })
  })

  describe('Template Animation Configuration', () => {
    test('should have proper animation for spells', () => {
      const spell = getSpellTemplate('magic-missile')

      expect(spell?.animation.type).toBe('projectile')
      expect(spell?.animation.duration).toBe(600)
      expect(spell?.animation.color).toBe('#9400D3')
      expect(spell?.animation.customParams?.projectileCount).toBe(3)
    })

    test('should have proper animation for attacks', () => {
      const attack = getAttackTemplate('arrow-shot')

      expect(attack?.animation.type).toBe('projectile')
      expect(attack?.animation.customParams?.projectileShape).toBe('arrow')
      expect(attack?.animation.customParams?.rotation).toBe(true)
    })

    test('should have proper animation for interactions', () => {
      const interaction = getInteractionTemplate('pull-lever')

      expect(interaction?.animation.type).toBe('interaction')
      expect(interaction?.animation.customParams?.leverMotion).toBe('down')
      expect(interaction?.animation.customParams?.mechanicalSound).toBe(true)
    })
  })
})