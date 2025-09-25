/**
 * Template Service - Token template management and built-in templates
 */

import { nanoid } from 'nanoid'
import type {
  TokenTemplate,
  TemplateId,
  CreateTemplateData,
  TemplateUpdate,
  TemplateCollection,
  TemplateSearchCriteria,
  TemplateUsageStats,
  TemplateValidationResult,
  BuiltInTemplateDefinition,
  TemplateCategory,
  TemplateRarity
} from '../types'
import { createTemplateId } from '../types'

export class TemplateService {
  private static instance: TemplateService | null = null

  private constructor() {}

  static getInstance(): TemplateService {
    if (!TemplateService.instance) {
      TemplateService.instance = new TemplateService()
    }
    return TemplateService.instance
  }

  /**
   * Get default built-in templates
   */
  getDefaultTemplates(): TokenTemplate[] {
    const now = new Date()

    return BUILT_IN_TEMPLATES.flatMap(category =>
      category.templates.map(template => ({
        id: createTemplateId(`builtin-${category.category}-${template.name.toLowerCase().replace(/\s+/g, '-')}`),
        name: template.name,
        description: template.description,
        category: category.category,
        rarity: 'common' as TemplateRarity,
        tags: template.tags,
        defaults: {
          size: template.size,
          shape: 'circle' as const,
          color: template.color,
          borderColor: '#C9AD6A',
          borderWidth: 2,
          opacity: 1,
          tokenCategory: category.category === 'players' ? 'player' :
                        category.category === 'enemies' ? 'enemy' :
                        category.category === 'npcs' ? 'npc' : 'object',
          isPlayer: template.isPlayer,
          label: {
            position: 'bottom' as const,
            color: '#FFFFFF',
            fontSize: 12,
            offset: 5
          }
        },
        customization: {
          allowColorChange: true,
          allowSizeChange: true,
          allowShapeChange: true,
          allowLabelChange: true
        },
        isBuiltIn: true,
        createdAt: now,
        lastModified: now,
        usageCount: 0
      }))
    )
  }

  /**
   * Get templates by category
   */
  getCategoryTemplates(category: TemplateCategory): TokenTemplate[] {
    const allTemplates = this.getDefaultTemplates() // Would include custom templates too
    return allTemplates.filter(template => template.category === category)
  }

  /**
   * Create new custom template
   */
  createTemplate(data: CreateTemplateData): TokenTemplate {
    const id = createTemplateId(nanoid())
    const now = new Date()

    return {
      id,
      name: data.name,
      description: data.description,
      category: data.category,
      rarity: 'custom',
      tags: data.tags ?? [],
      defaults: data.defaults,
      dndDefaults: data.dndDefaults,
      customization: {
        allowColorChange: true,
        allowSizeChange: true,
        allowShapeChange: true,
        allowLabelChange: true,
        ...data.customization
      },
      preview: data.preview,
      isBuiltIn: false,
      createdAt: now,
      lastModified: now,
      usageCount: 0
    }
  }

  /**
   * Update existing template
   */
  updateTemplate(template: TokenTemplate, updates: TemplateUpdate): TokenTemplate {
    if (template.isBuiltIn) {
      throw new Error('Cannot modify built-in templates')
    }

    return {
      ...template,
      ...updates,
      lastModified: new Date()
    }
  }

  /**
   * Validate template data
   */
  validateTemplate(data: Partial<TokenTemplate>): TemplateValidationResult {
    const errors: string[] = []
    const warnings: string[] = []
    const suggestions: string[] = []

    // Validate name
    if (!data.name?.trim()) {
      errors.push('Template name is required')
    } else if (data.name.length > 50) {
      warnings.push('Template name is quite long (>50 characters)')
    }

    // Validate color
    if (data.defaults?.color && !/^#[0-9A-Fa-f]{6}$/.test(data.defaults.color)) {
      errors.push('Template color must be a valid hex color')
    }

    // Validate opacity
    if (data.defaults?.opacity !== undefined) {
      if (data.defaults.opacity < 0 || data.defaults.opacity > 1) {
        errors.push('Template opacity must be between 0 and 1')
      }
    }

    // Validate D&D defaults
    if (data.dndDefaults?.hitPoints) {
      if (data.dndDefaults.hitPoints.maximum <= 0) {
        errors.push('Maximum hit points must be positive')
      }
    }

    if (data.dndDefaults?.armorClass !== undefined) {
      if (data.dndDefaults.armorClass < 1) {
        errors.push('Armor class must be at least 1')
      } else if (data.dndDefaults.armorClass > 25) {
        warnings.push('Armor class over 25 is very high for D&D 5e')
      }
    }

    // Suggestions for better templates
    if (data.tags && data.tags.length === 0) {
      suggestions.push('Consider adding tags to help organize templates')
    }

    if (!data.description?.trim()) {
      suggestions.push('Adding a description helps identify template purpose')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    }
  }

  /**
   * Search templates by criteria
   */
  searchTemplates(templates: TokenTemplate[], criteria: TemplateSearchCriteria): TokenTemplate[] {
    return templates.filter(template => {
      // Text search
      if (criteria.query) {
        const query = criteria.query.toLowerCase()
        const matches =
          template.name.toLowerCase().includes(query) ||
          template.description?.toLowerCase().includes(query) ||
          template.tags.some(tag => tag.toLowerCase().includes(query))

        if (!matches) return false
      }

      // Category filter
      if (criteria.category && template.category !== criteria.category) {
        return false
      }

      // Rarity filter
      if (criteria.rarity && template.rarity !== criteria.rarity) {
        return false
      }

      // Tags filter
      if (criteria.tags && criteria.tags.length > 0) {
        const hasAllTags = criteria.tags.every(tag =>
          template.tags.includes(tag)
        )
        if (!hasAllTags) return false
      }

      // Size filter
      if (criteria.size && template.defaults.size !== criteria.size) {
        return false
      }

      // Shape filter
      if (criteria.shape && template.defaults.shape !== criteria.shape) {
        return false
      }

      // Built-in filter
      if (criteria.isBuiltIn !== undefined && template.isBuiltIn !== criteria.isBuiltIn) {
        return false
      }

      return true
    })
  }

  /**
   * Get template usage statistics
   */
  getTemplateStats(template: TokenTemplate): TemplateUsageStats {
    // This would integrate with actual usage tracking
    return {
      templateId: template.id,
      usageCount: template.usageCount,
      lastUsed: new Date(), // Would be tracked
      averageUsagePerWeek: template.usageCount / 4, // Simplified calculation
      popularTags: template.tags
    }
  }

  /**
   * Export templates to JSON
   */
  exportTemplates(templates: TokenTemplate[]): string {
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      templates: templates.filter(t => !t.isBuiltIn) // Only export custom templates
    }

    return JSON.stringify(exportData, null, 2)
  }

  /**
   * Import templates from JSON
   */
  importTemplates(jsonData: string): TokenTemplate[] {
    try {
      const data = JSON.parse(jsonData)

      if (!data.templates || !Array.isArray(data.templates)) {
        throw new Error('Invalid template data format')
      }

      return data.templates.map((templateData: any) => {
        const validation = this.validateTemplate(templateData)
        if (!validation.isValid) {
          throw new Error(`Invalid template: ${validation.errors.join(', ')}`)
        }

        return this.createTemplate(templateData)
      })
    } catch (error) {
      throw new Error(`Failed to import templates: ${error}`)
    }
  }

  /**
   * Create template collection
   */
  createCollection(name: string, templateIds: TemplateId[]): TemplateCollection {
    return {
      name,
      templateIds,
      isBuiltIn: false,
      createdAt: new Date()
    }
  }

  /**
   * Get most used templates
   */
  getMostUsedTemplates(templates: TokenTemplate[], limit = 10): TokenTemplate[] {
    return [...templates]
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit)
  }

  /**
   * Get recently used templates
   */
  getRecentTemplates(templates: TokenTemplate[], limit = 5): TokenTemplate[] {
    // This would track actual usage timestamps
    return [...templates]
      .sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime())
      .slice(0, limit)
  }
}

// Built-in template definitions
const BUILT_IN_TEMPLATES: readonly BuiltInTemplateDefinition[] = [
  {
    category: 'players',
    templates: [
      {
        name: 'Player Character',
        description: 'Standard player character token',
        size: 'medium',
        color: '#2563EB',
        isPlayer: true,
        tags: ['player', 'pc', 'hero']
      },
      {
        name: 'Player (Small)',
        description: 'Small-sized player character',
        size: 'small',
        color: '#2563EB',
        isPlayer: true,
        tags: ['player', 'pc', 'small', 'halfling', 'gnome']
      },
      {
        name: 'Player (Large)',
        description: 'Large-sized player character',
        size: 'large',
        color: '#2563EB',
        isPlayer: true,
        tags: ['player', 'pc', 'large', 'centaur']
      }
    ]
  },
  {
    category: 'enemies',
    templates: [
      {
        name: 'Goblin',
        description: 'Small humanoid enemy',
        size: 'small',
        color: '#DC2626',
        isPlayer: false,
        tags: ['enemy', 'goblin', 'small', 'humanoid']
      },
      {
        name: 'Orc',
        description: 'Medium humanoid enemy',
        size: 'medium',
        color: '#DC2626',
        isPlayer: false,
        tags: ['enemy', 'orc', 'humanoid']
      },
      {
        name: 'Troll',
        description: 'Large giant enemy',
        size: 'large',
        color: '#DC2626',
        isPlayer: false,
        tags: ['enemy', 'troll', 'large', 'giant']
      },
      {
        name: 'Dragon',
        description: 'Huge dragon enemy',
        size: 'huge',
        color: '#7C2D12',
        isPlayer: false,
        tags: ['enemy', 'dragon', 'huge', 'boss']
      }
    ]
  },
  {
    category: 'npcs',
    templates: [
      {
        name: 'Villager',
        description: 'Friendly village NPC',
        size: 'medium',
        color: '#059669',
        isPlayer: false,
        tags: ['npc', 'villager', 'friendly']
      },
      {
        name: 'Guard',
        description: 'Town guard or soldier',
        size: 'medium',
        color: '#7C2D12',
        isPlayer: false,
        tags: ['npc', 'guard', 'soldier', 'authority']
      },
      {
        name: 'Merchant',
        description: 'Traveling merchant',
        size: 'medium',
        color: '#B45309',
        isPlayer: false,
        tags: ['npc', 'merchant', 'trader', 'shop']
      },
      {
        name: 'Noble',
        description: 'Aristocrat or important figure',
        size: 'medium',
        color: '#7C3AED',
        isPlayer: false,
        tags: ['npc', 'noble', 'aristocrat', 'important']
      }
    ]
  },
  {
    category: 'objects',
    templates: [
      {
        name: 'Chest',
        description: 'Treasure chest or container',
        size: 'medium',
        color: '#92400E',
        isPlayer: false,
        tags: ['object', 'chest', 'treasure', 'container']
      },
      {
        name: 'Barrel',
        description: 'Wooden barrel',
        size: 'medium',
        color: '#78350F',
        isPlayer: false,
        tags: ['object', 'barrel', 'container']
      },
      {
        name: 'Statue',
        description: 'Stone statue or monument',
        size: 'large',
        color: '#6B7280',
        isPlayer: false,
        tags: ['object', 'statue', 'stone', 'decoration']
      }
    ]
  },
  {
    category: 'environment',
    templates: [
      {
        name: 'Tree',
        description: 'Large tree',
        size: 'large',
        color: '#166534',
        isPlayer: false,
        tags: ['environment', 'tree', 'nature', 'obstacle']
      },
      {
        name: 'Boulder',
        description: 'Large rock or boulder',
        size: 'large',
        color: '#6B7280',
        isPlayer: false,
        tags: ['environment', 'boulder', 'rock', 'obstacle']
      },
      {
        name: 'Campfire',
        description: 'Campfire or light source',
        size: 'small',
        color: '#EA580C',
        isPlayer: false,
        tags: ['environment', 'fire', 'light', 'camp']
      }
    ]
  }
] as const