/**
 * Spell Template Service
 *
 * Manages spell templates, D&D 5e authenticity, and template-to-spell conversion
 * following the established service patterns from Timeline and Actions modules.
 */

import { nanoid } from 'nanoid'
import type {
  UnifiedSpell,
  UnifiedSpellTemplate,
  SpellTemplateId,
  SpellCategoryId,
  SpellSchoolId,
  SpellSearchCriteria,
  SpellCategory,
  SpellSchool,
  SpellCustomization
} from '../types'
import {
  createSpellId,
  createSpellTemplateId,
  createSpellCategoryId,
  createSpellSchoolId,
  SPELL_TEMPLATES,
  SPELL_SCHOOLS,
  SPELL_CATEGORIES
} from '../types'

/**
 * Service for managing spell templates and D&D 5e spell library
 */
export class SpellTemplateService {
  private builtInTemplates: Map<SpellTemplateId, UnifiedSpellTemplate>
  private customTemplates: Map<SpellTemplateId, UnifiedSpellTemplate>

  constructor() {
    this.builtInTemplates = new Map()
    this.customTemplates = new Map()
    this.initializeBuiltInTemplates()
  }

  /**
   * Initialize built-in D&D 5e spell templates
   */
  private initializeBuiltInTemplates(): void {
    Object.entries(SPELL_TEMPLATES).forEach(([_key, template]) => {
      const unifiedTemplate: UnifiedSpellTemplate = {
        ...template,
        id: createSpellTemplateId(template.id),
        category: this.getSpellCategory(template.school, template.level),
        isBuiltIn: true,
        tags: this.generateSpellTags(template),
        popularity: this.calculatePopularity(template),
        customizable: true,
        version: '1.0.0'
      }
      this.builtInTemplates.set(unifiedTemplate.id, unifiedTemplate)
    })
  }

  /**
   * Search spells with comprehensive filtering
   */
  searchSpells(criteria: SpellSearchCriteria = {}): UnifiedSpell[] {
    const allTemplates = [
      ...this.builtInTemplates.values(),
      ...(criteria.includeCustom !== false ? this.customTemplates.values() : [])
    ]

    let results = allTemplates

    // Filter by query (name, description, tags)
    if (criteria.query) {
      const query = criteria.query.toLowerCase().trim()
      results = results.filter(template =>
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Filter by school
    if (criteria.school) {
      const schools = Array.isArray(criteria.school) ? criteria.school : [criteria.school]
      results = results.filter(template =>
        schools.includes(createSpellSchoolId(template.school))
      )
    }

    // Filter by category
    if (criteria.category) {
      results = results.filter(template => template.category === criteria.category)
    }

    // Filter by level range
    if (criteria.level) {
      results = results.filter(template => {
        if (criteria.level!.min !== undefined && template.level < criteria.level!.min) return false
        if (criteria.level!.max !== undefined && template.level > criteria.level!.max) return false
        return true
      })
    }

    // Filter by tags
    if (criteria.tags && criteria.tags.length > 0) {
      results = results.filter(template =>
        criteria.tags!.some(tag => template.tags.includes(tag))
      )
    }

    // Filter by effect type
    if (criteria.type) {
      results = results.filter(template => template.effect.type === criteria.type)
    }

    // Filter by duration range
    if (criteria.duration) {
      results = results.filter(template => {
        const duration = template.effect.defaultDuration
        if (criteria.duration!.min !== undefined && duration < criteria.duration!.min) return false
        if (criteria.duration!.max !== undefined && duration > criteria.duration!.max) return false
        return true
      })
    }

    // Sort results
    if (criteria.sortBy) {
      results = this.sortSpells(results, criteria.sortBy, criteria.sortDirection)
    }

    // Convert templates to spells
    return results.map(template => this.createSpellFromTemplate(template))
  }

  /**
   * Get spells by school
   */
  getSpellsBySchool(school: SpellSchoolId): UnifiedSpell[] {
    return this.searchSpells({ school })
  }

  /**
   * Get spells by category
   */
  getSpellsByCategory(category: SpellCategoryId): UnifiedSpell[] {
    return this.searchSpells({ category })
  }

  /**
   * Get spells by level
   */
  getSpellsByLevel(level: number): UnifiedSpell[] {
    return this.searchSpells({
      level: { min: level, max: level }
    })
  }

  /**
   * Get all available spell schools with counts
   */
  getSpellSchools(): SpellSchool[] {
    const schools = Object.values(SPELL_SCHOOLS).map(school => ({
      ...school,
      count: this.getSpellsBySchool(school.id).length
    }))

    return schools.sort((a, b) => a.name.localeCompare(b.name))
  }

  /**
   * Get all available spell categories with counts
   */
  getSpellCategories(): SpellCategory[] {
    const categories = Object.values(SPELL_CATEGORIES).map(category => ({
      ...category,
      count: this.getSpellsByCategory(category.id).length
    }))

    return categories.sort((a, b) => a.name.localeCompare(b.name))
  }

  /**
   * Get all unique tags from spell templates
   */
  getAllTags(): string[] {
    const allTags = new Set<string>()

    for (const template of this.builtInTemplates.values()) {
      template.tags.forEach(tag => allTags.add(tag))
    }

    for (const template of this.customTemplates.values()) {
      template.tags.forEach(tag => allTags.add(tag))
    }

    return Array.from(allTags).sort()
  }

  /**
   * Get popular spells for recommendations
   */
  getPopularSpells(limit = 5): UnifiedSpell[] {
    const templates = [...this.builtInTemplates.values()]
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, limit)

    return templates.map(template => this.createSpellFromTemplate(template))
  }

  /**
   * Get template by ID
   */
  getTemplateById(id: SpellTemplateId): UnifiedSpellTemplate | null {
    return this.builtInTemplates.get(id) || this.customTemplates.get(id) || null
  }

  /**
   * Create custom spell from template with modifications
   */
  createCustomSpellFromTemplate(
    templateId: SpellTemplateId,
    customization: SpellCustomization
  ): UnifiedSpell {
    const template = this.getTemplateById(templateId)
    if (!template) {
      throw new Error(`Template with ID ${templateId} not found`)
    }

    const baseSpell = this.createSpellFromTemplate(template)

    return {
      ...baseSpell,
      id: createSpellId(nanoid()),
      name: customization.name || baseSpell.name,
      description: customization.description || baseSpell.description,
      color: customization.color || baseSpell.color,
      opacity: customization.opacity ?? baseSpell.opacity,
      size: { ...baseSpell.size, ...customization.size },
      duration: customization.duration ?? baseSpell.duration,
      animation: { ...baseSpell.animation, ...customization.animation },
      tags: customization.tags ? [...customization.tags] : baseSpell.tags,
      isCustom: true,
      updatedAt: new Date()
    }
  }

  /**
   * Save custom template
   */
  saveCustomTemplate(template: Omit<UnifiedSpellTemplate, 'id' | 'isBuiltIn' | 'version'>): UnifiedSpellTemplate {
    const id = createSpellTemplateId(nanoid())
    const customTemplate: UnifiedSpellTemplate = {
      ...template,
      id,
      isBuiltIn: false,
      version: '1.0.0'
    }

    this.customTemplates.set(id, customTemplate)
    return customTemplate
  }

  /**
   * Delete custom template
   */
  deleteCustomTemplate(id: SpellTemplateId): boolean {
    return this.customTemplates.delete(id)
  }

  /**
   * Convert template to spell instance
   */
  private createSpellFromTemplate(template: UnifiedSpellTemplate): UnifiedSpell {
    return {
      id: createSpellId(nanoid()),
      templateId: template.id,
      name: template.name,
      description: template.description,
      type: template.effect.type,
      position: { x: 0, y: 0 },
      rotation: 0,
      layer: 1,
      color: template.effect.defaultColor,
      opacity: template.effect.defaultOpacity,
      size: template.effect.defaultSize,
      roundCreated: 1,
      duration: template.effect.defaultDuration,
      animation: template.animation,
      category: template.category,
      school: createSpellSchoolId(template.school),
      isCustom: !template.isBuiltIn,
      customizable: template.customizable,
      tags: [...template.tags],
      createdAt: new Date()
    }
  }

  /**
   * Determine spell category based on school and level
   */
  private getSpellCategory(school: string, level: number): SpellCategoryId {
    if (school === 'evocation' && level >= 1) return createSpellCategoryId('combat')
    if (school === 'necromancy') return createSpellCategoryId('combat')
    if (school === 'enchantment') return createSpellCategoryId('social')
    if (school === 'conjuration') return createSpellCategoryId('environmental')
    if (school === 'transmutation') return createSpellCategoryId('environmental')
    return createSpellCategoryId('utility')
  }

  /**
   * Generate appropriate tags for a spell template
   */
  private generateSpellTags(template: any): string[] {
    const tags: string[] = []

    // Add school as tag
    tags.push(template.school)

    // Add level category
    if (template.level === 0) tags.push('cantrip')
    else if (template.level <= 2) tags.push('low-level')
    else if (template.level <= 5) tags.push('mid-level')
    else tags.push('high-level')

    // Add effect type
    tags.push(template.effect.type)

    // Add duration category
    if (template.effect.defaultDuration === 0) tags.push('instant')
    else if (template.effect.defaultDuration <= 1) tags.push('short-duration')
    else tags.push('long-duration')

    // Add spell-specific tags based on name
    const name = template.name.toLowerCase()
    if (name.includes('fire')) tags.push('fire')
    if (name.includes('cold') || name.includes('ice')) tags.push('cold')
    if (name.includes('lightning') || name.includes('thunder')) tags.push('lightning')
    if (name.includes('dark')) tags.push('darkness')
    if (name.includes('light')) tags.push('light')
    if (name.includes('wall')) tags.push('barrier')
    if (name.includes('bolt')) tags.push('projectile')

    return tags
  }

  /**
   * Calculate popularity score for spell ordering
   */
  private calculatePopularity(template: any): number {
    let score = 50 // Base score

    // Popular spells get bonus
    const popularSpells = ['fireball', 'lightning-bolt', 'darkness', 'web']
    if (popularSpells.includes(template.id)) score += 30

    // Lower level spells are more commonly used
    if (template.level <= 3) score += 20
    else if (template.level <= 5) score += 10

    // Instant spells are often preferred
    if (template.effect.defaultDuration === 0) score += 15

    // Area effects are tactically valuable
    if (template.effect.type === 'area') score += 10

    return score
  }

  /**
   * Sort spells by specified criteria
   */
  private sortSpells(
    spells: UnifiedSpellTemplate[],
    sortBy: NonNullable<SpellSearchCriteria['sortBy']>,
    direction: SpellSearchCriteria['sortDirection'] = 'asc'
  ): UnifiedSpellTemplate[] {
    const multiplier = direction === 'desc' ? -1 : 1

    return spells.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'level':
          comparison = a.level - b.level
          break
        case 'school':
          comparison = a.school.localeCompare(b.school)
          break
        case 'category':
          comparison = a.category.localeCompare(b.category)
          break
        case 'popularity':
          comparison = b.popularity - a.popularity // Higher first for popularity
          break
      }

      return comparison * multiplier
    })
  }
}