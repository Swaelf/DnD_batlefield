import type { UnifiedAction } from '@/types/unifiedAction'
import type { Point } from '@/types/geometry'
import {
  getAllSpellTemplates,
  getSpellTemplate,
  type SpellTemplate
} from './spellTemplates'
import {
  getAllAttackTemplates,
  getAttackTemplate,
  getAttackTemplatesByType,
  type AttackTemplate
} from './attackTemplates'
import {
  getAllInteractionTemplates,
  getInteractionTemplate,
  getInteractionTemplatesByType,
  getInteractionTemplatesWithChecks,
  type InteractionTemplate
} from './interactionTemplates'
import { nanoid } from 'nanoid'

export type ActionTemplate = SpellTemplate | AttackTemplate | InteractionTemplate

export type TemplateCategory = {
  id: string
  name: string
  type: 'spell' | 'attack' | 'interaction'
  templates: ActionTemplate[]
}

/**
 * Get all available templates organized by category
 */
export function getAllTemplateCategories(): TemplateCategory[] {
  return [
    {
      id: 'spells',
      name: 'Spells',
      type: 'spell',
      templates: getAllSpellTemplates()
    },
    {
      id: 'melee-attacks',
      name: 'Melee Attacks',
      type: 'attack',
      templates: getAttackTemplatesByType('melee')
    },
    {
      id: 'ranged-attacks',
      name: 'Ranged Attacks',
      type: 'attack',
      templates: getAttackTemplatesByType('ranged')
    },
    {
      id: 'interactions',
      name: 'Interactions',
      type: 'interaction',
      templates: getAllInteractionTemplates()
    }
  ]
}

/**
 * Get all templates of a specific type
 */
export function getTemplatesByType(type: 'spell' | 'attack' | 'interaction'): ActionTemplate[] {
  switch (type) {
    case 'spell':
      return getAllSpellTemplates()
    case 'attack':
      return getAllAttackTemplates()
    case 'interaction':
      return getAllInteractionTemplates()
    default:
      return []
  }
}

/**
 * Get a specific template by type and ID
 */
export function getTemplate(
  type: 'spell' | 'attack' | 'interaction',
  templateId: string
): ActionTemplate | undefined {
  switch (type) {
    case 'spell':
      return getSpellTemplate(templateId)
    case 'attack':
      return getAttackTemplate(templateId)
    case 'interaction':
      return getInteractionTemplate(templateId)
    default:
      return undefined
  }
}

/**
 * Create an action from a template
 */
export function createActionFromTemplate(
  template: ActionTemplate,
  source: Point | string,
  target: Point | string[]
): UnifiedAction {
  const baseAction = {
    ...template,
    id: nanoid(),
    source,
    target,
    timestamp: Date.now()
  } as UnifiedAction

  // Update area of effect based on source and target
  if (baseAction.effects.areaOfEffect) {
    updateAreaOfEffect(baseAction, source, target)
  }

  return baseAction
}

/**
 * Update area of effect positioning based on source and target
 */
function updateAreaOfEffect(
  action: UnifiedAction,
  source: Point | string,
  target: Point | string[]
): void {
  if (!action.effects.areaOfEffect) return

  const targetPoint = getTargetPoint(target)
  const sourcePoint = getSourcePoint(source)

  switch (action.effects.areaOfEffect.type) {
    case 'circle':
      action.effects.areaOfEffect.center = targetPoint
      break

    case 'square':
      action.effects.areaOfEffect.center = targetPoint
      break

    case 'cone':
      if (sourcePoint && targetPoint) {
        const dx = targetPoint.x - sourcePoint.x
        const dy = targetPoint.y - sourcePoint.y
        action.effects.areaOfEffect.origin = sourcePoint
        action.effects.areaOfEffect.direction = Math.atan2(dy, dx) * 180 / Math.PI
      }
      break

    case 'line':
      if (sourcePoint && targetPoint) {
        action.effects.areaOfEffect.start = sourcePoint

        // For attacks with range, calculate end point
        if ('range' in action && typeof action.range === 'number') {
          const angle = Math.atan2(
            targetPoint.y - sourcePoint.y,
            targetPoint.x - sourcePoint.x
          )
          const range = action.range * 5 // Convert to grid units
          action.effects.areaOfEffect.end = {
            x: sourcePoint.x + Math.cos(angle) * range,
            y: sourcePoint.y + Math.sin(angle) * range
          }
        } else {
          action.effects.areaOfEffect.end = targetPoint
        }
      }
      break
  }
}

/**
 * Get target point from various target types
 */
function getTargetPoint(target: Point | string[] | string): Point {
  if (typeof target === 'object' && !Array.isArray(target)) {
    return target as Point
  }
  // Default fallback
  return { x: 0, y: 0 }
}

/**
 * Get source point from various source types
 */
function getSourcePoint(source: Point | string): Point | null {
  if (typeof source === 'object') {
    return source as Point
  }
  return null
}

/**
 * Get templates that require skill checks
 */
export function getTemplatesWithChecks(): ActionTemplate[] {
  const interactions = getInteractionTemplatesWithChecks()
  // Could add spells/attacks with saving throws in the future
  return interactions
}

/**
 * Search templates by name or description
 */
export function searchTemplates(query: string): ActionTemplate[] {
  const lowerQuery = query.toLowerCase()
  const allTemplates = [
    ...getAllSpellTemplates(),
    ...getAllAttackTemplates(),
    ...getAllInteractionTemplates()
  ]

  return allTemplates.filter(template => {
    const name = template.metadata.name.toLowerCase()
    const description = template.metadata.description?.toLowerCase() || ''
    return name.includes(lowerQuery) || description.includes(lowerQuery)
  })
}

/**
 * Get template by category
 */
export function getTemplatesByCategory(category: string): ActionTemplate[] {
  const allTemplates = [
    ...getAllSpellTemplates(),
    ...getAllAttackTemplates(),
    ...getAllInteractionTemplates()
  ]

  return allTemplates.filter(template => template.category === category)
}

/**
 * Group templates by their categories
 */
export function groupTemplatesByCategory(): Map<string, ActionTemplate[]> {
  const grouped = new Map<string, ActionTemplate[]>()

  const allTemplates = [
    ...getAllSpellTemplates(),
    ...getAllAttackTemplates(),
    ...getAllInteractionTemplates()
  ]

  allTemplates.forEach(template => {
    const category = template.category
    if (!grouped.has(category)) {
      grouped.set(category, [])
    }
    grouped.get(category)!.push(template)
  })

  return grouped
}

/**
 * Get a random template for testing
 */
export function getRandomTemplate(): ActionTemplate {
  const allTemplates = [
    ...getAllSpellTemplates(),
    ...getAllAttackTemplates(),
    ...getAllInteractionTemplates()
  ]

  const randomIndex = Math.floor(Math.random() * allTemplates.length)
  return allTemplates[randomIndex]
}

/**
 * Validate if a template is valid
 */
export function isValidTemplate(template: any): template is ActionTemplate {
  if (!template || typeof template !== 'object') {
    return false
  }

  return (
    'templateId' in template &&
    'type' in template &&
    'category' in template &&
    'animation' in template &&
    'effects' in template &&
    'metadata' in template &&
    'duration' in template
  )
}