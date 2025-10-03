/**
 * Effect Registry Tests
 *
 * Validates core functionality of the animation registry system
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EffectRegistry } from '../EffectRegistry';
import { Point } from '@/types';

// Mock template factory
const mockTemplate = (from: Point, to: Point) => ({
  from,
  to,
  shape: 'circle' as const,
  color: '#FF0000',
  size: 10,
});

describe('EffectRegistry', () => {
  beforeEach(() => {
    // Clear registry before each test
    EffectRegistry.clear();
  });

  describe('register()', () => {
    it('should register a template', () => {
      EffectRegistry.register('test', {
        name: 'Test Template',
        category: 'custom',
        tags: ['test'],
        template: mockTemplate,
      });

      expect(EffectRegistry.has('test')).toBe(true);
      expect(EffectRegistry.getCount()).toBe(1);
    });

    it('should warn on duplicate ID registration', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      EffectRegistry.register('test', {
        name: 'Test 1',
        category: 'custom',
        tags: ['test'],
        template: mockTemplate,
      });

      EffectRegistry.register('test', {
        name: 'Test 2',
        category: 'custom',
        tags: ['test'],
        template: mockTemplate,
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('already exists')
      );

      consoleSpy.mockRestore();
    });

    it('should update category index', () => {
      EffectRegistry.register('spell1', {
        name: 'Spell 1',
        category: 'spell',
        tags: [],
        template: mockTemplate,
      });

      const spells = EffectRegistry.getByCategory('spell');
      expect(spells).toHaveLength(1);
      expect(spells[0]?.id).toBe('spell1');
    });

    it('should update tag index', () => {
      EffectRegistry.register('fire1', {
        name: 'Fire Effect',
        category: 'spell',
        tags: ['fire', 'projectile'],
        template: mockTemplate,
      });

      const fireEffects = EffectRegistry.getByTag('fire');
      expect(fireEffects).toHaveLength(1);
      expect(fireEffects[0]?.id).toBe('fire1');
    });
  });

  describe('get()', () => {
    it('should retrieve template by ID', () => {
      EffectRegistry.register('test', {
        name: 'Test Template',
        category: 'custom',
        tags: ['test'],
        template: mockTemplate,
      });

      const template = EffectRegistry.get('test');
      expect(template).toBeDefined();
      expect(template?.name).toBe('Test Template');
    });

    it('should return undefined for non-existent ID', () => {
      const template = EffectRegistry.get('nonexistent');
      expect(template).toBeUndefined();
    });
  });

  describe('unregister()', () => {
    it('should remove template from registry', () => {
      EffectRegistry.register('test', {
        name: 'Test Template',
        category: 'custom',
        tags: ['test'],
        template: mockTemplate,
      });

      const removed = EffectRegistry.unregister('test');
      expect(removed).toBe(true);
      expect(EffectRegistry.has('test')).toBe(false);
    });

    it('should remove from category index', () => {
      EffectRegistry.register('spell1', {
        name: 'Spell 1',
        category: 'spell',
        tags: [],
        template: mockTemplate,
      });

      EffectRegistry.unregister('spell1');
      const spells = EffectRegistry.getByCategory('spell');
      expect(spells).toHaveLength(0);
    });

    it('should remove from tag index', () => {
      EffectRegistry.register('fire1', {
        name: 'Fire Effect',
        category: 'spell',
        tags: ['fire'],
        template: mockTemplate,
      });

      EffectRegistry.unregister('fire1');
      const fireEffects = EffectRegistry.getByTag('fire');
      expect(fireEffects).toHaveLength(0);
    });

    it('should return false for non-existent ID', () => {
      const removed = EffectRegistry.unregister('nonexistent');
      expect(removed).toBe(false);
    });
  });

  describe('getByCategory()', () => {
    it('should return all templates in category', () => {
      EffectRegistry.register('spell1', {
        name: 'Spell 1',
        category: 'spell',
        tags: [],
        template: mockTemplate,
      });

      EffectRegistry.register('spell2', {
        name: 'Spell 2',
        category: 'spell',
        tags: [],
        template: mockTemplate,
      });

      EffectRegistry.register('attack1', {
        name: 'Attack 1',
        category: 'attack',
        tags: [],
        template: mockTemplate,
      });

      const spells = EffectRegistry.getByCategory('spell');
      expect(spells).toHaveLength(2);
    });

    it('should return empty array for non-existent category', () => {
      const results = EffectRegistry.getByCategory('spell');
      expect(results).toEqual([]);
    });
  });

  describe('getByTag()', () => {
    it('should return all templates with tag', () => {
      EffectRegistry.register('fire1', {
        name: 'Fire 1',
        category: 'spell',
        tags: ['fire', 'projectile'],
        template: mockTemplate,
      });

      EffectRegistry.register('fire2', {
        name: 'Fire 2',
        category: 'spell',
        tags: ['fire', 'aoe'],
        template: mockTemplate,
      });

      const fireEffects = EffectRegistry.getByTag('fire');
      expect(fireEffects).toHaveLength(2);
    });

    it('should return empty array for non-existent tag', () => {
      const results = EffectRegistry.getByTag('nonexistent');
      expect(results).toEqual([]);
    });
  });

  describe('search()', () => {
    beforeEach(() => {
      EffectRegistry.register('fireball', {
        name: 'Fireball',
        category: 'spell',
        tags: ['fire', 'projectile', 'aoe'],
        template: mockTemplate,
      });

      EffectRegistry.register('arrow', {
        name: 'Arrow',
        category: 'attack',
        tags: ['physical', 'projectile'],
        template: mockTemplate,
      });

      EffectRegistry.register('deprecated-spell', {
        name: 'Old Spell',
        category: 'spell',
        tags: ['fire'],
        template: mockTemplate,
        deprecated: true,
      });
    });

    it('should filter by category', () => {
      const results = EffectRegistry.search({ category: 'spell' });
      expect(results).toHaveLength(1); // Excludes deprecated
      expect(results[0]?.id).toBe('fireball');
    });

    it('should filter by multiple categories', () => {
      const results = EffectRegistry.search({
        category: ['spell', 'attack'],
      });
      expect(results).toHaveLength(2);
    });

    it('should filter by tags (all must match)', () => {
      const results = EffectRegistry.search({
        tags: ['fire', 'projectile'],
      });
      expect(results).toHaveLength(1);
      expect(results[0]?.id).toBe('fireball');
    });

    it('should filter by partial name match', () => {
      const results = EffectRegistry.search({ name: 'ball' });
      expect(results).toHaveLength(1);
      expect(results[0]?.id).toBe('fireball');
    });

    it('should be case-insensitive for name search', () => {
      const results = EffectRegistry.search({ name: 'FIRE' });
      expect(results).toHaveLength(1);
    });

    it('should combine multiple criteria', () => {
      const results = EffectRegistry.search({
        category: 'spell',
        tags: ['fire'],
        name: 'ball',
      });
      expect(results).toHaveLength(1);
      expect(results[0]?.id).toBe('fireball');
    });

    it('should exclude deprecated by default', () => {
      const results = EffectRegistry.search({ category: 'spell' });
      expect(results.some((t) => t.deprecated)).toBe(false);
    });

    it('should include deprecated when requested', () => {
      const results = EffectRegistry.search({
        category: 'spell',
        deprecated: true,
      });
      expect(results).toHaveLength(2);
    });
  });

  describe('utility methods', () => {
    beforeEach(() => {
      EffectRegistry.register('spell1', {
        name: 'Spell 1',
        category: 'spell',
        tags: ['fire', 'projectile'],
        template: mockTemplate,
      });

      EffectRegistry.register('attack1', {
        name: 'Attack 1',
        category: 'attack',
        tags: ['physical'],
        template: mockTemplate,
      });
    });

    it('should return all tags', () => {
      const tags = EffectRegistry.getTags();
      expect(tags).toContain('fire');
      expect(tags).toContain('projectile');
      expect(tags).toContain('physical');
    });

    it('should return all categories', () => {
      const categories = EffectRegistry.getCategories();
      expect(categories).toContain('spell');
      expect(categories).toContain('attack');
    });

    it('should return template count', () => {
      expect(EffectRegistry.getCount()).toBe(2);
    });

    it('should clear all templates', () => {
      EffectRegistry.clear();
      expect(EffectRegistry.getCount()).toBe(0);
      expect(EffectRegistry.getTags()).toEqual([]);
      expect(EffectRegistry.getCategories()).toEqual([]);
    });
  });
});
