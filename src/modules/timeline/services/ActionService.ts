/**
 * Action Service
 * Business logic for unified action system and templates
 */

import { nanoid } from 'nanoid'
import type {
  UnifiedAction,
  ActionId,
  ActionTemplateId,
  ActionType,
  ActionCategory,
  ActionData,
  ActionToEventConversionResult,
  EventToActionConversionResult,
  RoundEvent,
  EventData,
  AttackActionData,
  SpellActionData,
  MovementActionData,
  InteractionActionData,
  EnvironmentalActionData,
  SequenceActionData
} from '../types'

/**
 * Action template for creating actions
 */
export type ActionTemplate = {
  readonly id: ActionTemplateId
  readonly name: string
  readonly description: string
  readonly type: ActionType
  readonly category: ActionCategory
  readonly data: ActionData
  readonly tags: string[]
  readonly isBuiltIn: boolean
}

/**
 * Search parameters for actions
 */
export type ActionSearchParams = {
  readonly query?: string
  readonly type?: ActionType
  readonly category?: ActionCategory
  readonly tags?: string[]
  readonly includeCustom?: boolean
}

/**
 * Service for managing actions and templates
 */
export class ActionService {
  private templates: Map<ActionTemplateId, ActionTemplate> = new Map()
  private customActions: Map<ActionId, UnifiedAction> = new Map()

  constructor() {
    this.initializeBuiltInTemplates()
  }

  /**
   * Get action templates by type
   */
  getActionsByType(type: ActionType): UnifiedAction[] {
    const templates = Array.from(this.templates.values())
      .filter(template => template.type === type)

    const custom = Array.from(this.customActions.values())
      .filter(action => action.type === type)

    return [
      ...templates.map(template => this.templateToAction(template)),
      ...custom
    ]
  }

  /**
   * Search actions by various criteria
   */
  searchActions(params: ActionSearchParams): UnifiedAction[] {
    const allActions = [
      ...Array.from(this.templates.values()).map(t => this.templateToAction(t)),
      ...(params.includeCustom ? Array.from(this.customActions.values()) : [])
    ]

    return allActions.filter(action => {
      // Query filter
      if (params.query) {
        const query = params.query.toLowerCase()
        const matchesName = action.name.toLowerCase().includes(query)
        const matchesDescription = action.description.toLowerCase().includes(query)
        const matchesTags = action.tags.some(tag => tag.toLowerCase().includes(query))

        if (!matchesName && !matchesDescription && !matchesTags) {
          return false
        }
      }

      // Type filter
      if (params.type && action.type !== params.type) {
        return false
      }

      // Category filter
      if (params.category && action.category !== params.category) {
        return false
      }

      // Tags filter
      if (params.tags && params.tags.length > 0) {
        const hasMatchingTag = params.tags.some(tag =>
          action.tags.includes(tag)
        )
        if (!hasMatchingTag) {
          return false
        }
      }

      return true
    })
  }

  /**
   * Get action by ID
   */
  getActionById(actionId: ActionId): UnifiedAction | null {
    return this.customActions.get(actionId) || null
  }

  /**
   * Get template by ID
   */
  getTemplateById(templateId: ActionTemplateId): ActionTemplate | null {
    return this.templates.get(templateId) || null
  }

  /**
   * Customize an action from a template
   */
  customizeAction(templateId: ActionTemplateId, overrides: Partial<UnifiedAction>): UnifiedAction {
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
      createdAt: new Date()
    }
  }

  /**
   * Save a custom action
   */
  saveCustomAction(action: UnifiedAction): void {
    this.customActions.set(action.id, action)
  }

  /**
   * Delete a custom action
   */
  deleteCustomAction(actionId: ActionId): boolean {
    return this.customActions.delete(actionId)
  }

  /**
   * Convert action to event data
   */
  convertActionToEvent(action: UnifiedAction): ActionToEventConversionResult {
    try {
      const eventData = this.actionToEventData(action)
      return {
        success: true,
        eventData,
        errors: [],
        warnings: []
      }
    } catch (error) {
      return {
        success: false,
        eventData: null,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings: []
      }
    }
  }

  /**
   * Convert event to action (reverse conversion)
   */
  convertEventToAction(event: RoundEvent): EventToActionConversionResult {
    try {
      const action = this.eventToAction(event)
      return {
        success: true,
        action,
        errors: [],
        warnings: action ? [] : ['Event type not supported for action conversion']
      }
    } catch (error) {
      return {
        success: false,
        action: null,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings: []
      }
    }
  }

  /**
   * Get all available action categories
   */
  getCategories(): ActionCategory[] {
    return ['combat', 'exploration', 'social', 'environmental', 'utility', 'custom']
  }

  /**
   * Get all available action types
   */
  getActionTypes(): ActionType[] {
    return ['attack', 'spell', 'movement', 'interaction', 'environmental', 'sequence', 'utility']
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
   * Convert action data to event data
   */
  private actionToEventData(action: UnifiedAction): EventData {
    switch (action.type) {
      case 'attack':
        return this.attackActionToEventData(action.data as AttackActionData)
      case 'spell':
        return this.spellActionToEventData(action.data as SpellActionData)
      case 'movement':
        return this.movementActionToEventData(action.data as MovementActionData)
      case 'interaction':
        return this.interactionActionToEventData(action.data as InteractionActionData)
      case 'environmental':
        return this.environmentalActionToEventData(action.data as EnvironmentalActionData)
      case 'sequence':
        return this.sequenceActionToEventData(action.data as SequenceActionData)
      default:
        throw new Error(`Cannot convert action type ${action.type} to event data`)
    }
  }

  /**
   * Convert event to action (reverse)
   */
  private eventToAction(event: RoundEvent): UnifiedAction | null {
    // This is a simplified conversion - in practice you might want more sophisticated logic
    const actionType = this.eventTypeToActionType(event.type)
    if (!actionType) return null

    return {
      id: nanoid() as ActionId,
      templateId: null,
      name: event.name,
      description: `Converted from ${event.type} event`,
      type: actionType,
      category: 'custom',
      data: this.eventDataToActionData(event.data),
      customizable: true,
      isCustom: true,
      tags: ['converted', event.type],
      createdAt: new Date()
    }
  }

  // Conversion methods for each action type
  private attackActionToEventData(data: AttackActionData): EventData {
    return {
      type: 'attack',
      attackerId: '' as any, // Will be filled when creating event
      targetId: null,
      targetPosition: null,
      attackType: data.attackType,
      weapon: {
        name: data.weapon.name,
        type: data.weapon.type,
        damage: {
          amount: data.damage.bonusAmount,
          type: data.damage.damageType,
          dice: data.damage.baseDice,
          isCritical: false
        },
        range: data.range,
        properties: data.weapon.properties
      },
      damage: null, // Will be calculated during execution
      criticalHit: false,
      effects: data.effects.map(effect => ({
        type: effect.type,
        duration: typeof effect.duration === 'number' ? effect.duration : 0,
        parameters: effect.parameters
      }))
    }
  }

  private spellActionToEventData(data: SpellActionData): EventData {
    return {
      type: 'spell',
      casterId: '' as any, // Will be filled when creating event
      spellId: `${data.school}_${data.level}`,
      targetType: data.targetType.type,
      targets: [], // Will be filled when creating event
      spellLevel: data.level,
      components: data.components,
      effects: data.effects.map(effect => ({
        type: effect.type,
        parameters: effect.parameters,
        duration: 0,
        concentration: data.concentration
      })),
      concentration: data.concentration,
      ritual: data.ritual
    }
  }

  private movementActionToEventData(data: MovementActionData): EventData {
    return {
      type: 'move',
      tokenId: '' as any, // Will be filled when creating event
      startPosition: { x: 0, y: 0 }, // Will be filled when creating event
      endPosition: { x: 0, y: 0 }, // Will be filled when creating event
      path: [],
      speed: data.speed,
      easing: 'easeInOut',
      shouldRotate: true
    }
  }

  private interactionActionToEventData(data: InteractionActionData): EventData {
    return {
      type: 'interaction',
      actorId: '' as any, // Will be filled when creating event
      targetId: '', // Will be filled when creating event
      interactionType: data.interactionType.name as any,
      parameters: {},
      duration: data.duration,
      canFail: data.canFail,
      skillCheck: data.skillRequired ? {
        skill: data.skillRequired,
        dc: Math.floor((data.dcRange.min + data.dcRange.max) / 2),
        modifier: 0,
        advantage: false,
        disadvantage: false
      } : null
    }
  }

  private environmentalActionToEventData(data: EnvironmentalActionData): EventData {
    return {
      type: 'environmental',
      effectType: data.effectType.category as any,
      area: {
        type: data.areaOfEffect.shape === 'sphere' ? 'circle' : data.areaOfEffect.shape as any,
        center: { x: 0, y: 0 }, // Will be filled when creating event
        radius: typeof data.areaOfEffect.size === 'number' ? data.areaOfEffect.size : undefined,
        width: typeof data.areaOfEffect.size === 'object' ? data.areaOfEffect.size.width : undefined,
        height: typeof data.areaOfEffect.size === 'object' ? data.areaOfEffect.size.height : undefined
      },
      intensity: data.intensity,
      duration: data.duration,
      weatherType: data.weatherDependency ? 'rain' : undefined,
      terrainEffect: data.terrainDependency ? {
        type: 'difficult',
        movementModifier: 0.5,
        visualEffect: 'muddy'
      } : undefined,
      lightingChange: data.effectType.category === 'lighting' ? {
        type: 'darken',
        intensity: data.intensity,
        duration: data.duration
      } : undefined
    }
  }

  private sequenceActionToEventData(data: SequenceActionData): EventData {
    return {
      type: 'sequence',
      sequenceType: data.sequenceType.complexity === 'simple' ? 'simple' : 'conditional',
      events: data.actions.map(action => this.actionToEventData(action)),
      conditions: data.executionRules.map(rule => ({
        type: rule.type as any,
        parameters: rule.parameters,
        continueOnMet: true
      })),
      parallelExecution: data.parallelExecution,
      stopOnFailure: !data.allowPartialSuccess
    }
  }

  private eventTypeToActionType(eventType: string): ActionType | null {
    switch (eventType) {
      case 'attack': return 'attack'
      case 'spell': return 'spell'
      case 'move': return 'movement'
      case 'interaction': return 'interaction'
      case 'environmental': return 'environmental'
      case 'sequence': return 'sequence'
      default: return null
    }
  }

  private eventDataToActionData(eventData: EventData): ActionData {
    // Simplified reverse conversion - would need more sophisticated logic in practice
    switch (eventData.type) {
      case 'attack':
        return {
          type: 'attack',
          attackType: eventData.attackType,
          weapon: {
            name: eventData.weapon?.name || 'Unknown',
            type: eventData.weapon?.type || 'melee',
            damage: {
              baseDice: eventData.weapon?.damage.dice || '1d6',
              damageType: eventData.weapon?.damage.type || 'slashing',
              bonusType: 'fixed',
              bonusAmount: eventData.weapon?.damage.amount || 0,
              versatile: false
            },
            properties: eventData.weapon?.properties || [],
            attackBonus: 0
          },
          damage: {
            baseDice: '1d6',
            damageType: 'slashing',
            bonusType: 'fixed',
            bonusAmount: 0,
            versatile: false
          },
          range: eventData.weapon?.range || 5,
          areaOfEffect: null,
          effects: [],
          canCrit: true,
          critMultiplier: 2
        } as AttackActionData

      default:
        throw new Error(`Cannot convert event type ${eventData.type} to action data`)
    }
  }

  /**
   * Initialize built-in action templates
   */
  private initializeBuiltInTemplates(): void {
    // Combat templates
    this.addTemplate({
      id: 'basic_melee_attack' as ActionTemplateId,
      name: 'Basic Melee Attack',
      description: 'A standard melee weapon attack',
      type: 'attack',
      category: 'combat',
      tags: ['combat', 'melee', 'basic'],
      isBuiltIn: true,
      data: {
        type: 'attack',
        attackType: 'melee',
        weapon: {
          name: 'Sword',
          type: 'melee',
          damage: {
            baseDice: '1d8',
            damageType: 'slashing',
            bonusType: 'ability',
            bonusAmount: 3,
            versatile: false
          },
          properties: [],
          attackBonus: 5
        },
        damage: {
          baseDice: '1d8',
          damageType: 'slashing',
          bonusType: 'ability',
          bonusAmount: 3,
          versatile: false
        },
        range: 5,
        areaOfEffect: null,
        effects: [],
        canCrit: true,
        critMultiplier: 2
      } as AttackActionData
    })

    // Add more built-in templates here...
  }

  private addTemplate(template: ActionTemplate): void {
    this.templates.set(template.id, template)
  }
}