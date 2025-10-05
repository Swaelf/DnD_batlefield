/**
 * Effect registry for managing animation effect templates
 *
 * Centralized registry system for managing animation templates and presets.
 * Provides fast lookup by ID, category filtering, tag-based search, and
 * efficient indexing for discovery.
 */

import type { AbstractProjectileConfig } from '../types/projectiles';
import type { CompositionConfig } from '../types/composers';

// ============================================================================
// Animation Template Types
// ============================================================================

/**
 * Animation category types
 */
export type AnimationCategory =
  | 'spell' // D&D spells
  | 'attack' // Physical attacks
  | 'movement' // Token movement
  | 'interaction' // Object interactions
  | 'environmental' // Weather, terrain
  | 'custom'; // User-defined

/**
 * Search criteria for finding templates
 */
export interface SearchCriteria {
  /** Filter by category (single or multiple) */
  category?: AnimationCategory | AnimationCategory[];
  /** Filter by tags (all must match) */
  tags?: string[];
  /** Partial name match (case-insensitive) */
  name?: string;
  /** Include deprecated templates (default: false) */
  deprecated?: boolean;
}

/**
 * Animation template definition
 * Represents a registered animation template with metadata
 */
export interface AnimationTemplate {
  /** Unique template identifier */
  id: string;
  /** Display name */
  name: string;
  /** Description of the template */
  description?: string;
  /** Animation category */
  category: AnimationCategory;
  /** Tags for filtering and search */
  tags: string[];
  /** Template factory function */
  template: (...args: any[]) => AbstractProjectileConfig | CompositionConfig;
  /** Additional metadata (D&D stats, etc.) */
  metadata?: Record<string, unknown>;
  /** Template version */
  version?: string;
  /** Whether template is deprecated */
  deprecated?: boolean;
}

// ============================================================================
// Animation Registry Class
// ============================================================================

/**
 * Centralized registry for animation templates
 *
 * Provides O(1) lookup by ID and efficient filtering by category and tags
 * through index-based searching.
 */
class AnimationRegistryClass {
  /** Main template storage (ID -> Template) */
  private templates: Map<string, AnimationTemplate>;

  /** Category index (Category -> Set of IDs) */
  private categoryIndex: Map<AnimationCategory, Set<string>>;

  /** Tag index (Tag -> Set of IDs) */
  private tagIndex: Map<string, Set<string>>;

  constructor() {
    this.templates = new Map();
    this.categoryIndex = new Map();
    this.tagIndex = new Map();
  }

  /**
   * Register a new animation template
   *
   * @param id - Unique template identifier
   * @param template - Template configuration (without ID)
   */
  register(id: string, template: Omit<AnimationTemplate, 'id'>): void {
    // Warn if ID already exists
    if (this.templates.has(id)) {
      console.warn(`[EffectRegistry] Template "${id}" already exists. Overwriting.`);
      this.unregister(id);
    }

    const fullTemplate: AnimationTemplate = {
      id,
      ...template,
    };

    // Store template
    this.templates.set(id, fullTemplate);

    // Update category index
    if (!this.categoryIndex.has(template.category)) {
      this.categoryIndex.set(template.category, new Set());
    }
    this.categoryIndex.get(template.category)!.add(id);

    // Update tag index
    for (const tag of template.tags) {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, new Set());
      }
      this.tagIndex.get(tag)!.add(id);
    }
  }

  /**
   * Unregister a template by ID
   *
   * @param id - Template ID to remove
   * @returns True if template was removed, false if not found
   */
  unregister(id: string): boolean {
    const template = this.templates.get(id);
    if (!template) {
      return false;
    }

    // Remove from template map
    this.templates.delete(id);

    // Remove from category index
    const categorySet = this.categoryIndex.get(template.category);
    if (categorySet) {
      categorySet.delete(id);
      if (categorySet.size === 0) {
        this.categoryIndex.delete(template.category);
      }
    }

    // Remove from tag index
    for (const tag of template.tags) {
      const tagSet = this.tagIndex.get(tag);
      if (tagSet) {
        tagSet.delete(id);
        if (tagSet.size === 0) {
          this.tagIndex.delete(tag);
        }
      }
    }

    return true;
  }

  /**
   * Get a template by ID
   *
   * @param id - Template ID
   * @returns Template or undefined if not found
   */
  get(id: string): AnimationTemplate | undefined {
    return this.templates.get(id);
  }

  /**
   * Get all registered templates
   *
   * @returns Array of all templates
   */
  getAll(): AnimationTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Get templates by category
   *
   * @param category - Animation category
   * @returns Array of templates in the category
   */
  getByCategory(category: AnimationCategory): AnimationTemplate[] {
    const ids = this.categoryIndex.get(category);
    if (!ids) {
      return [];
    }

    return Array.from(ids)
      .map((id) => this.templates.get(id))
      .filter((template): template is AnimationTemplate => template !== undefined);
  }

  /**
   * Get templates by tag
   *
   * @param tag - Tag to filter by
   * @returns Array of templates with the tag
   */
  getByTag(tag: string): AnimationTemplate[] {
    const ids = this.tagIndex.get(tag);
    if (!ids) {
      return [];
    }

    return Array.from(ids)
      .map((id) => this.templates.get(id))
      .filter((template): template is AnimationTemplate => template !== undefined);
  }

  /**
   * Search for templates using multiple criteria
   *
   * Combines category, tag, and name filtering. All criteria must match.
   *
   * @param criteria - Search criteria
   * @returns Array of matching templates
   */
  search(criteria: SearchCriteria): AnimationTemplate[] {
    let results = this.getAll();

    // Filter by deprecated
    if (!criteria.deprecated) {
      results = results.filter((t) => !t.deprecated);
    }

    // Filter by category
    if (criteria.category) {
      const categories = Array.isArray(criteria.category)
        ? criteria.category
        : [criteria.category];
      results = results.filter((t) => categories.includes(t.category));
    }

    // Filter by tags (all tags must match)
    if (criteria.tags && criteria.tags.length > 0) {
      results = results.filter((t) =>
        criteria.tags!.every((tag) => t.tags.includes(tag))
      );
    }

    // Filter by name (partial match, case-insensitive)
    if (criteria.name) {
      const nameLower = criteria.name.toLowerCase();
      results = results.filter((t) =>
        t.name.toLowerCase().includes(nameLower)
      );
    }

    return results;
  }

  /**
   * Check if a template exists
   *
   * @param id - Template ID
   * @returns True if template exists
   */
  has(id: string): boolean {
    return this.templates.has(id);
  }

  /**
   * Clear all registered templates
   */
  clear(): void {
    this.templates.clear();
    this.categoryIndex.clear();
    this.tagIndex.clear();
  }

  /**
   * Get all unique tags
   *
   * @returns Array of all tags in the registry
   */
  getTags(): string[] {
    return Array.from(this.tagIndex.keys());
  }

  /**
   * Get all categories with registered templates
   *
   * @returns Array of categories
   */
  getCategories(): AnimationCategory[] {
    return Array.from(this.categoryIndex.keys());
  }

  /**
   * Get total number of registered templates
   *
   * @returns Template count
   */
  getCount(): number {
    return this.templates.size;
  }
}

// ============================================================================
// Global Registry Instance
// ============================================================================

/**
 * Global effect registry instance
 * Use this singleton to register and retrieve animation templates
 */
export const EffectRegistry = new AnimationRegistryClass();

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Get all registered animation templates
 *
 * @returns Array of all templates
 */
export function getAllAnimations(): AnimationTemplate[] {
  return EffectRegistry.getAll();
}

/**
 * Get all spell animation templates
 *
 * @returns Array of spell templates
 */
export function getSpellAnimations(): AnimationTemplate[] {
  return EffectRegistry.getByCategory('spell');
}

/**
 * Get all attack animation templates
 *
 * @returns Array of attack templates
 */
export function getAttackAnimations(): AnimationTemplate[] {
  return EffectRegistry.getByCategory('attack');
}

/**
 * Get all movement animation templates
 *
 * @returns Array of movement templates
 */
export function getMovementAnimations(): AnimationTemplate[] {
  return EffectRegistry.getByCategory('movement');
}

/**
 * Search for animation templates
 *
 * @param criteria - Search criteria
 * @returns Array of matching templates
 */
export function searchAnimations(criteria: SearchCriteria): AnimationTemplate[] {
  return EffectRegistry.search(criteria);
}
