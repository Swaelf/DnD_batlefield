/**
 * Token Template Types - Template system for token creation
 */

import type { TemplateId, TokenSize, TokenShape, TokenCategory, LabelPosition } from './token'

// Template category grouping
export type TemplateCategory =
  | 'players'
  | 'enemies'
  | 'npcs'
  | 'objects'
  | 'environment'
  | 'custom'

// Template rarity for organization
export type TemplateRarity = 'common' | 'uncommon' | 'rare' | 'custom'

// Token template interface
export interface TokenTemplate {
  readonly id: TemplateId
  readonly name: string
  readonly description?: string
  readonly category: TemplateCategory
  readonly rarity: TemplateRarity
  readonly tags: readonly string[]

  // Default token properties
  readonly defaults: {
    readonly size: TokenSize
    readonly shape: TokenShape
    readonly color: string
    readonly borderColor?: string
    readonly borderWidth: number
    readonly opacity: number
    readonly tokenCategory: TokenCategory
    readonly isPlayer: boolean
    readonly label: {
      readonly position: LabelPosition
      readonly color: string
      readonly fontSize: number
      readonly offset: number
    }
  }

  // D&D specific defaults
  readonly dndDefaults?: {
    readonly hitPoints?: {
      readonly maximum: number
      readonly current?: number
      readonly temporary: number
    }
    readonly armorClass?: number
    readonly speed?: number
    readonly initiative?: number
    readonly conditions?: readonly string[]
  }

  // Visual customization
  readonly customization: {
    readonly allowColorChange: boolean
    readonly allowSizeChange: boolean
    readonly allowShapeChange: boolean
    readonly allowLabelChange: boolean
  }

  // Preview image for template browser
  readonly preview?: {
    readonly url: string
    readonly alt: string
  }

  // Template metadata
  readonly isBuiltIn: boolean
  readonly createdBy?: string
  readonly createdAt: Date
  readonly lastModified: Date
  readonly usageCount: number
}

// Template creation data
export interface CreateTemplateData {
  readonly name: string
  readonly description?: string
  readonly category: TemplateCategory
  readonly tags?: readonly string[]
  readonly defaults: TokenTemplate['defaults']
  readonly dndDefaults?: TokenTemplate['dndDefaults']
  readonly customization?: Partial<TokenTemplate['customization']>
  readonly preview?: TokenTemplate['preview']
}

// Template update data
export type TemplateUpdate = Partial<Omit<TokenTemplate, 'id' | 'isBuiltIn' | 'createdAt'>> & {
  readonly lastModified: Date
}

// Template collection for organization
export interface TemplateCollection {
  readonly name: string
  readonly description?: string
  readonly templateIds: readonly TemplateId[]
  readonly isBuiltIn: boolean
  readonly createdAt: Date
}

// Template search criteria
export interface TemplateSearchCriteria {
  readonly query?: string
  readonly category?: TemplateCategory
  readonly rarity?: TemplateRarity
  readonly tags?: readonly string[]
  readonly size?: TokenSize
  readonly shape?: TokenShape
  readonly isBuiltIn?: boolean
}

// Template usage statistics
export interface TemplateUsageStats {
  readonly templateId: TemplateId
  readonly usageCount: number
  readonly lastUsed: Date
  readonly averageUsagePerWeek: number
  readonly popularTags: readonly string[]
}

// Template validation result
export interface TemplateValidationResult {
  readonly isValid: boolean
  readonly errors: readonly string[]
  readonly warnings: readonly string[]
  readonly suggestions: readonly string[]
}

// Built-in template definitions
export interface BuiltInTemplateDefinition {
  readonly category: TemplateCategory
  readonly templates: readonly {
    readonly name: string
    readonly description: string
    readonly size: TokenSize
    readonly color: string
    readonly isPlayer: boolean
    readonly tags: readonly string[]
  }[]
}

// Template browser state
export interface TemplateBrowserState {
  readonly activeCategory: TemplateCategory | null
  readonly searchQuery: string
  readonly filteredTemplates: readonly TokenTemplate[]
  readonly selectedTemplate: TokenTemplate | null
  readonly isCreatingCustom: boolean
  readonly sortBy: 'name' | 'category' | 'usage' | 'recent'
  readonly sortOrder: 'asc' | 'desc'
}