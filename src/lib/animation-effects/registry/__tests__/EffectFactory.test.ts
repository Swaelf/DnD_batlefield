/**
 * Tests for EffectFactory
 *
 * Verifies animation creation, validation, batch operations, and error handling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EffectFactory } from '../EffectFactory';
import { EffectRegistry } from '../EffectRegistry';
import type { AnimationParams } from '../EffectFactory';
import type { AbstractProjectileConfig } from '../../types/projectiles';
import { Point } from '@/types';

// Test helper: Create basic animation params
const createBasicParams = (from?: Point, to?: Point): AnimationParams => ({
  from: from || { x: 0, y: 0 },
  to: to || { x: 100, y: 100 },
});

// Test helper: Create basic projectile config
const createBasicConfig = (overrides?: Partial<AbstractProjectileConfig>): AbstractProjectileConfig => ({
  from: { x: 0, y: 0 },
  to: { x: 100, y: 100 },
  shape: 'circle',
  color: '#FF0000',
  size: 10,
  duration: 1000,
  ...overrides,
});

describe('EffectFactory', () => {
  beforeEach(() => {
    // Clear registry before each test
    EffectRegistry.clear();
  });

  // ==========================================================================
  // create() method tests
  // ==========================================================================

  describe('create()', () => {
    it('should create animation from registered template', () => {
      // Register a simple template
      EffectRegistry.register('test-arrow', {
        name: 'Test Arrow',
        category: 'attack',
        tags: ['test'],
        template: (from: Point, to: Point) => ({
          from,
          to,
          shape: 'triangle',
          color: '#8B4513',
          size: 10,
          effects: ['trail'],
          duration: 800,
        }),
      });

      const params = createBasicParams();
      const config = EffectFactory.create('test-arrow', params);

      expect(config).toBeDefined();
      expect(config.from).toEqual(params.from);
      expect(config.to).toEqual(params.to);
      expect(config.shape).toBe('triangle');
      expect(config.color).toBe('#8B4513');
      expect(config.duration).toBe(800);
    });

    it('should apply runtime parameters', () => {
      EffectRegistry.register('test-spell', {
        name: 'Test Spell',
        category: 'spell',
        tags: ['test'],
        template: (from: Point, to: Point) => ({
          from,
          to,
          shape: 'circle',
          color: '#00FF00',
          duration: 1000,
        }),
      });

      const onComplete = vi.fn();
      const onProgress = vi.fn();

      const config = EffectFactory.create('test-spell', {
        from: { x: 50, y: 50 },
        to: { x: 200, y: 200 },
        duration: 1500,
        delay: 500,
        onComplete,
        onProgress,
      });

      expect(config.duration).toBe(1500);
      expect(config.delay).toBe(500);
      expect(config.onComplete).toBe(onComplete);
      expect(config.onProgress).toBe(onProgress);
    });

    it('should apply custom overrides', () => {
      EffectRegistry.register('test-projectile', {
        name: 'Test Projectile',
        category: 'attack',
        tags: ['test'],
        template: (from: Point, to: Point) => ({
          from,
          to,
          shape: 'circle',
          color: '#FF0000',
          size: 10,
        }),
      });

      const config = EffectFactory.create(
        'test-projectile',
        createBasicParams(),
        {
          color: '#0000FF', // Override to blue
          size: 20, // Bigger size
          effects: ['glow', 'trail'],
        }
      );

      expect(config.color).toBe('#0000FF');
      expect(config.size).toBe(20);
      expect(config.effects).toEqual(['glow', 'trail']);
    });

    it('should apply defaults for optional fields', () => {
      EffectRegistry.register('minimal-template', {
        name: 'Minimal',
        category: 'custom',
        tags: ['test'],
        template: (from: Point, to: Point) => ({
          from,
          to,
          shape: 'circle',
          color: '#FFFFFF',
        }),
      });

      const config = EffectFactory.create('minimal-template', createBasicParams());

      expect(config.size).toBe(10); // Default size
      expect(config.duration).toBe(1000); // Default duration
      expect(config.delay).toBe(0); // Default delay
      expect(config.effects).toEqual([]); // Default effects
      expect(config.mutations).toEqual([]); // Default mutations
    });

    it('should throw error for non-existent template', () => {
      expect(() => {
        EffectFactory.create('non-existent', createBasicParams());
      }).toThrow(/Template "non-existent" not found/);
    });

    it('should throw error for invalid configuration', () => {
      EffectRegistry.register('invalid-template', {
        name: 'Invalid',
        category: 'custom',
        tags: ['test'],
        template: () => ({
          from: { x: 0, y: 0 },
          to: { x: 100, y: 100 },
          shape: 'circle',
          color: 'INVALID_COLOR', // Invalid color format
        }),
      });

      expect(() => {
        EffectFactory.create('invalid-template', createBasicParams());
      }).toThrow(/Invalid color format/);
    });

    it('should warn for configuration issues without failing', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      EffectRegistry.register('warning-template', {
        name: 'Warning',
        category: 'custom',
        tags: ['test'],
        template: (from: Point, to: Point) => ({
          from,
          to,
          shape: 'circle',
          color: '#FF0000',
          size: 150, // Large size - triggers warning
        }),
      });

      const config = EffectFactory.create('warning-template', createBasicParams());

      expect(config).toBeDefined();
      expect(warnSpy).toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Large size')
      );

      warnSpy.mockRestore();
    });
  });

  // ==========================================================================
  // createCustom() method tests
  // ==========================================================================

  describe('createCustom()', () => {
    it('should create custom animation without registry', () => {
      const config = EffectFactory.createCustom({
        from: { x: 0, y: 0 },
        to: { x: 100, y: 100 },
        shape: 'star',
        color: '#FFD700',
        size: 15,
      });

      expect(config).toBeDefined();
      expect(config.shape).toBe('star');
      expect(config.color).toBe('#FFD700');
      expect(config.size).toBe(15);
    });

    it('should apply defaults to custom config', () => {
      const config = EffectFactory.createCustom({
        from: { x: 0, y: 0 },
        to: { x: 100, y: 100 },
        shape: 'circle',
        color: '#FF0000',
      });

      expect(config.duration).toBe(1000);
      expect(config.delay).toBe(0);
      expect(config.effects).toEqual([]);
      expect(config.mutations).toEqual([]);
    });

    it('should validate custom config', () => {
      expect(() => {
        EffectFactory.createCustom({
          from: { x: 0, y: 0 },
          to: { x: 100, y: 100 },
          shape: 'circle',
          color: 'not-a-color',
        });
      }).toThrow(/Invalid color format/);
    });

    it('should accept valid RGB color format', () => {
      const config = EffectFactory.createCustom({
        from: { x: 0, y: 0 },
        to: { x: 100, y: 100 },
        shape: 'circle',
        color: 'rgb(255, 0, 0)',
      });

      expect(config.color).toBe('rgb(255, 0, 0)');
    });

    it('should accept valid RGBA color format', () => {
      const config = EffectFactory.createCustom({
        from: { x: 0, y: 0 },
        to: { x: 100, y: 100 },
        shape: 'circle',
        color: 'rgba(255, 0, 0, 0.5)',
      });

      expect(config.color).toBe('rgba(255, 0, 0, 0.5)');
    });
  });

  // ==========================================================================
  // createBatch() method tests
  // ==========================================================================

  describe('createBatch()', () => {
    it('should create multiple animations from same template', () => {
      EffectRegistry.register('batch-test', {
        name: 'Batch Test',
        category: 'spell',
        tags: ['test'],
        template: (from: Point, to: Point) => ({
          from,
          to,
          shape: 'circle',
          color: '#00FF00',
        }),
      });

      const paramsList: AnimationParams[] = [
        { from: { x: 0, y: 0 }, to: { x: 100, y: 100 } },
        { from: { x: 0, y: 0 }, to: { x: 200, y: 200 } },
        { from: { x: 0, y: 0 }, to: { x: 300, y: 300 } },
      ];

      const configs = EffectFactory.createBatch('batch-test', paramsList);

      expect(configs).toHaveLength(3);
      expect(configs[0].to).toEqual({ x: 100, y: 100 });
      expect(configs[1].to).toEqual({ x: 200, y: 200 });
      expect(configs[2].to).toEqual({ x: 300, y: 300 });
    });

    it('should apply overrides to all batch animations', () => {
      EffectRegistry.register('batch-override', {
        name: 'Batch Override',
        category: 'spell',
        tags: ['test'],
        template: (from: Point, to: Point) => ({
          from,
          to,
          shape: 'circle',
          color: '#FF0000',
          size: 10,
        }),
      });

      const paramsList: AnimationParams[] = [
        { from: { x: 0, y: 0 }, to: { x: 100, y: 100 } },
        { from: { x: 0, y: 0 }, to: { x: 200, y: 200 } },
      ];

      const configs = EffectFactory.createBatch(
        'batch-override',
        paramsList,
        { size: 25, effects: ['glow'] }
      );

      expect(configs[0].size).toBe(25);
      expect(configs[0].effects).toEqual(['glow']);
      expect(configs[1].size).toBe(25);
      expect(configs[1].effects).toEqual(['glow']);
    });

    it('should create empty array for empty params list', () => {
      EffectRegistry.register('batch-empty', {
        name: 'Batch Empty',
        category: 'spell',
        tags: ['test'],
        template: (from: Point, to: Point) => ({
          from,
          to,
          shape: 'circle',
          color: '#FF0000',
        }),
      });

      const configs = EffectFactory.createBatch('batch-empty', []);

      expect(configs).toHaveLength(0);
    });
  });

  // ==========================================================================
  // validate() method tests
  // ==========================================================================

  describe('validate()', () => {
    it('should pass validation for valid config', () => {
      const config = createBasicConfig();
      const result = EffectFactory.validate(config);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for missing from position', () => {
      const config = createBasicConfig() as Partial<AbstractProjectileConfig>;
      delete config.from;

      const result = EffectFactory.validate(config as AbstractProjectileConfig);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required field: from');
    });

    it('should fail validation for missing to position', () => {
      const config = createBasicConfig() as Partial<AbstractProjectileConfig>;
      delete config.to;

      const result = EffectFactory.validate(config as AbstractProjectileConfig);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required field: to');
    });

    it('should fail validation for missing shape', () => {
      const config = createBasicConfig() as Partial<AbstractProjectileConfig>;
      delete config.shape;

      const result = EffectFactory.validate(config as AbstractProjectileConfig);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required field: shape');
    });

    it('should fail validation for invalid shape type', () => {
      const config = createBasicConfig({ shape: 'invalid' as never });

      const result = EffectFactory.validate(config);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Invalid shape type'))).toBe(true);
    });

    it('should fail validation for missing color', () => {
      const config = createBasicConfig() as Partial<AbstractProjectileConfig>;
      delete config.color;

      const result = EffectFactory.validate(config as AbstractProjectileConfig);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required field: color');
    });

    it('should fail validation for invalid color format', () => {
      const config = createBasicConfig({ color: 'not-a-color' });

      const result = EffectFactory.validate(config);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Invalid color format'))).toBe(true);
    });

    it('should fail validation for invalid size', () => {
      const config = createBasicConfig({ size: -5 });

      const result = EffectFactory.validate(config);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Invalid size'))).toBe(true);
    });

    it('should fail validation for invalid duration', () => {
      const config = createBasicConfig({ duration: 0 });

      const result = EffectFactory.validate(config);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Invalid duration'))).toBe(true);
    });

    it('should fail validation for negative delay', () => {
      const config = createBasicConfig({ delay: -100 });

      const result = EffectFactory.validate(config);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Invalid delay'))).toBe(true);
    });

    it('should warn for unknown effect types', () => {
      const config = createBasicConfig({ effects: ['unknown-effect'] as never });

      const result = EffectFactory.validate(config);

      expect(result.valid).toBe(true); // Still valid, just warning
      expect(result.warnings.some((w) => w.includes('Unknown effect type'))).toBe(true);
    });

    it('should warn for large size', () => {
      const config = createBasicConfig({ size: 150 });

      const result = EffectFactory.validate(config);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.includes('Large size'))).toBe(true);
    });

    it('should warn for long duration', () => {
      const config = createBasicConfig({ duration: 15000 });

      const result = EffectFactory.validate(config);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.includes('Long duration'))).toBe(true);
    });

    it('should warn for many mutations', () => {
      const config = createBasicConfig({
        mutations: Array(10).fill({
          trigger: { type: 'progress', value: 0.5 },
          color: '#00FF00',
        }),
      });

      const result = EffectFactory.validate(config);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.includes('Many mutations'))).toBe(true);
    });
  });

  // ==========================================================================
  // clone() method tests
  // ==========================================================================

  describe('clone()', () => {
    it('should clone config with overrides', () => {
      const original = createBasicConfig({
        shape: 'circle',
        color: '#FF0000',
        size: 10,
      });

      const cloned = EffectFactory.clone(original, {
        color: '#0000FF',
        size: 20,
      });

      expect(cloned).not.toBe(original); // Different object
      expect(cloned.shape).toBe('circle'); // Preserved
      expect(cloned.color).toBe('#0000FF'); // Overridden
      expect(cloned.size).toBe(20); // Overridden
    });

    it('should validate cloned config', () => {
      const original = createBasicConfig();

      expect(() => {
        EffectFactory.clone(original, {
          color: 'invalid-color',
        });
      }).toThrow(/Invalid color format/);
    });

    it('should deep merge nested properties', () => {
      const original = createBasicConfig({
        mutations: [
          {
            trigger: { type: 'progress', value: 0.5 },
            color: '#FF0000',
          },
        ],
      });

      const cloned = EffectFactory.clone(original, {
        size: 20,
      });

      expect(cloned.mutations).toHaveLength(1);
      expect(cloned.mutations![0].color).toBe('#FF0000');
      expect(cloned.size).toBe(20);
    });
  });
});
