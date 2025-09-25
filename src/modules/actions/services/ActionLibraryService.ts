/**
 * Action Library Service
 * Service for managing action templates and library
 */

import { nanoid } from 'nanoid'
import type {
  ActionTemplate,
  ActionTemplateId,
  ActionType,
  ActionCategory,
  ActionSearchCriteria,
  ActionLibrary,
  ActionCategoryInfo,
  UnifiedAction,
  ActionId
} from '../types'
import type { ActionData } from '@/modules/timeline/types'

/**
 * Service for action template and library management
 */
export class ActionLibraryService {
  private templates: Map<ActionTemplateId, ActionTemplate> = new Map()
  private customActions: Map<ActionId, UnifiedAction> = new Map()

  constructor() {
    this.initializeBuiltInTemplates()
  }

  /**
   * Search actions by criteria
   */
  searchActions(criteria: ActionSearchCriteria): UnifiedAction[] {
    const allActions = this.getAllActions(criteria.includeCustom ?? false)

    return allActions.filter(action => {
      // Query filter
      if (criteria.query) {
        const query = criteria.query.toLowerCase()
        const matchesName = action.name.toLowerCase().includes(query)
        const matchesDescription = action.description.toLowerCase().includes(query)
        const matchesTags = action.tags.some(tag => tag.toLowerCase().includes(query))

        if (!matchesName && !matchesDescription && !matchesTags) {
          return false
        }
      }

      // Type filter
      if (criteria.type && action.type !== criteria.type) {
        return false
      }

      // Category filter
      if (criteria.category && action.category !== criteria.category) {
        return false
      }

      // Tags filter
      if (criteria.tags && criteria.tags.length > 0) {
        const hasMatchingTag = criteria.tags.some(tag =>
          action.tags.includes(tag)
        )
        if (!hasMatchingTag) {
          return false
        }
      }

      // Level filter (for spells)
      if (criteria.minLevel !== undefined || criteria.maxLevel !== undefined) {
        const template = this.getTemplateById(action.templateId)
        if (template?.level !== undefined) {
          if (criteria.minLevel !== undefined && template.level < criteria.minLevel) {
            return false
          }
          if (criteria.maxLevel !== undefined && template.level > criteria.maxLevel) {
            return false
          }
        }
      }

      return true
    })
  }

  /**
   * Get all actions (templates + custom)
   */
  getAllActions(includeCustom: boolean = true): UnifiedAction[] {
    const templateActions = Array.from(this.templates.values()).map(template =>
      this.templateToAction(template)
    )

    if (!includeCustom) {
      return templateActions
    }

    return [
      ...templateActions,
      ...Array.from(this.customActions.values())
    ]
  }

  /**
   * Get actions by type
   */
  getActionsByType(type: ActionType): UnifiedAction[] {
    return this.searchActions({ type })
  }

  /**
   * Get actions by category
   */
  getActionsByCategory(category: ActionCategory): UnifiedAction[] {
    return this.searchActions({ category })
  }

  /**
   * Get template by ID
   */
  getTemplateById(templateId: ActionTemplateId | null): ActionTemplate | null {
    return templateId ? this.templates.get(templateId) || null : null
  }

  /**
   * Get action by ID
   */
  getActionById(actionId: ActionId): UnifiedAction | null {
    return this.customActions.get(actionId) || null
  }

  /**
   * Get category information
   */
  getCategories(): ActionCategoryInfo[] {
    const categoryCounts = new Map<ActionCategory, number>()
    const allActions = this.getAllActions(true)

    // Count actions per category
    allActions.forEach(action => {
      const current = categoryCounts.get(action.category) || 0
      categoryCounts.set(action.category, current + 1)
    })

    return [
      {
        id: 'combat',
        name: 'Combat',
        description: 'Spells and attacks for battle',
        icon: '⚔️',
        color: '#dc2626',
        count: categoryCounts.get('combat') || 0
      },
      {
        id: 'exploration',
        name: 'Exploration',
        description: 'Actions for discovering and interacting',
        icon: '🗺️',
        color: '#059669',
        count: categoryCounts.get('exploration') || 0
      },
      {
        id: 'social',
        name: 'Social',
        description: 'Influence and communication abilities',
        icon: '💬',
        color: '#7c3aed',
        count: categoryCounts.get('social') || 0
      },
      {
        id: 'environmental',
        name: 'Environmental',
        description: 'Weather and terrain effects',
        icon: '🌪️',
        color: '#0891b2',
        count: categoryCounts.get('environmental') || 0
      },
      {
        id: 'utility',
        name: 'Utility',
        description: 'Helpful tools and enhancements',
        icon: '🛠️',
        color: '#ea580c',
        count: categoryCounts.get('utility') || 0
      },
      {
        id: 'custom',
        name: 'Custom',
        description: 'User-created actions',
        icon: '✨',
        color: '#8b5cf6',
        count: categoryCounts.get('custom') || 0
      }
    ]
  }

  /**
   * Get all available tags
   */
  getAllTags(): string[] {
    const tags = new Set<string>()

    this.templates.forEach(template => {
      template.tags.forEach(tag => tags.add(tag))
    })

    this.customActions.forEach(action => {
      action.tags.forEach(tag => tags.add(tag))
    })

    return Array.from(tags).sort()
  }

  /**
   * Get popular/recent actions
   */
  getPopularActions(limit: number = 6): UnifiedAction[] {
    // For now, return first few actions of each type
    // In the future, this could be based on usage analytics
    const popular: UnifiedAction[] = []
    const types: ActionType[] = ['attack', 'spell', 'movement', 'interaction']

    types.forEach(type => {
      const actionsOfType = this.getActionsByType(type)
      if (actionsOfType.length > 0) {
        popular.push(actionsOfType[0])
      }
    })

    return popular.slice(0, limit)
  }

  /**
   * Save custom action
   */
  saveCustomAction(action: UnifiedAction): void {
    this.customActions.set(action.id, action)
  }

  /**
   * Delete custom action
   */
  deleteCustomAction(actionId: ActionId): boolean {
    return this.customActions.delete(actionId)
  }

  /**
   * Create custom action from template
   */
  createCustomActionFromTemplate(templateId: ActionTemplateId, overrides: Partial<UnifiedAction>): UnifiedAction {
    const template = this.templates.get(templateId)
    if (!template) {
      throw new Error(`Template not found: ${templateId}`)
    }

    const baseAction = this.templateToAction(template)

    return {
      ...baseAction,
      ...overrides,
      id: nanoid() as ActionId,
      templateId,
      isCustom: true,
      category: 'custom',
      createdAt: new Date()
    }
  }

  /**
   * Convert template to action
   */
  private templateToAction(template: ActionTemplate): UnifiedAction {
    return {
      id: nanoid() as ActionId,
      templateId: template.id,
      name: template.name,
      description: template.description,
      type: template.type,
      category: template.category,
      data: template.data,
      customizable: true,
      isCustom: false,
      tags: template.tags,
      createdAt: new Date()
    }
  }

  /**
   * Initialize built-in templates
   */
  private initializeBuiltInTemplates(): void {
    // Combat - Attack Templates
    this.addTemplate({
      id: 'sword_attack' as ActionTemplateId,
      name: 'Sword Attack',
      description: 'A standard melee sword attack',
      type: 'attack',
      category: 'combat',
      tags: ['melee', 'weapon', 'sword', 'basic'],
      level: 0,
      isBuiltIn: true,
      iconName: 'sword',
      rarity: 'common',
      data: {
        type: 'attack',
        attackType: 'melee',
        weapon: {
          name: 'Longsword',
          type: 'melee',
          damage: {
            baseDice: '1d8',
            damageType: 'slashing',
            bonusType: 'ability',
            bonusAmount: 3,
            versatile: true,
            versatileDice: '1d10'
          },
          properties: ['versatile'],
          attackBonus: 5
        },
        damage: {
          baseDice: '1d8',
          damageType: 'slashing',
          bonusType: 'ability',
          bonusAmount: 3,
          versatile: true,
          versatileDice: '1d10'
        },
        range: 5,
        areaOfEffect: null,
        effects: [],
        canCrit: true,
        critMultiplier: 2
      } as ActionData
    })

    this.addTemplate({
      id: 'bow_attack' as ActionTemplateId,
      name: 'Bow Attack',
      description: 'A ranged longbow attack',
      type: 'attack',
      category: 'combat',
      tags: ['ranged', 'weapon', 'bow', 'basic'],
      level: 0,
      isBuiltIn: true,
      iconName: 'bow',
      rarity: 'common',
      data: {
        type: 'attack',
        attackType: 'ranged',
        weapon: {
          name: 'Longbow',
          type: 'ranged',
          damage: {
            baseDice: '1d8',
            damageType: 'piercing',
            bonusType: 'ability',
            bonusAmount: 3,
            versatile: false
          },
          properties: ['ammunition', 'heavy', 'two-handed'],
          attackBonus: 5
        },
        damage: {
          baseDice: '1d8',
          damageType: 'piercing',
          bonusType: 'ability',
          bonusAmount: 3,
          versatile: false
        },
        range: 150,
        areaOfEffect: null,
        effects: [],
        canCrit: true,
        critMultiplier: 2
      } as ActionData
    })

    // Combat - Spell Templates
    this.addTemplate({
      id: 'fireball' as ActionTemplateId,
      name: 'Fireball',
      description: 'A bright flash and a burst of flame at a target location',
      type: 'spell',
      category: 'combat',
      tags: ['fire', 'evocation', 'area', 'damage'],
      level: 3,
      isBuiltIn: true,
      iconName: 'flame',
      rarity: 'uncommon',
      data: {
        type: 'spell',
        school: 'evocation',
        level: 3,
        components: ['verbal', 'somatic', 'material'],
        castingTime: {
          value: 1,
          unit: 'action'
        },
        range: 150,
        duration: {
          type: 'instant'
        },
        concentration: false,
        ritual: false,
        targetType: {
          type: 'point',
          range: 150,
          area: {
            shape: 'sphere',
            size: 20,
            origin: 'point',
            affectsCaster: false
          }
        },
        effects: [
          {
            type: 'damage',
            scaling: true,
            scaleType: 'slot_level',
            basePower: 8,
            parameters: {
              damageType: 'fire',
              dice: '8d6',
              saveType: 'dexterity',
              saveDC: 15
            }
          }
        ]
      } as ActionData
    })

    // Movement Templates
    this.addTemplate({
      id: 'dash' as ActionTemplateId,
      name: 'Dash',
      description: 'Move up to your speed',
      type: 'movement',
      category: 'utility',
      tags: ['movement', 'basic', 'utility'],
      level: 0,
      isBuiltIn: true,
      iconName: 'move',
      rarity: 'common',
      data: {
        type: 'movement',
        distance: 30,
        speed: 30,
        movementType: 'walk',
        canTriggerOpportunityAttacks: true,
        terrainRestrictions: [],
        followsPath: true
      } as ActionData
    })

    // Interaction Templates
    this.addTemplate({
      id: 'open_door' as ActionTemplateId,
      name: 'Open Door',
      description: 'Open a door or similar barrier',
      type: 'interaction',
      category: 'exploration',
      tags: ['door', 'interaction', 'exploration'],
      level: 0,
      isBuiltIn: true,
      iconName: 'door-open',
      rarity: 'common',
      data: {
        type: 'interaction',
        interactionType: {
          name: 'door_open',
          category: 'barrier',
          objectTypes: ['door', 'gate', 'portcullis'],
          multipleUse: true,
          reversible: true
        },
        duration: 1000,
        skillRequired: null,
        dcRange: { min: 10, max: 15 },
        canFail: true,
        failureConsequences: ['Door is locked', 'Door is stuck', 'Door is trapped']
      } as ActionData
    })
  }

  /**
   * Add template to library
   */
  private addTemplate(template: ActionTemplate): void {
    this.templates.set(template.id, template)
  }
}