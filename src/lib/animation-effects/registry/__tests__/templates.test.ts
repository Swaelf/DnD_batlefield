/**
 * Template Registration Tests
 *
 * Validates that all projectile presets are properly registered
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { EffectRegistry } from '../EffectRegistry';
import '../templates'; // Import to trigger registration

describe('Template Registration', () => {
  beforeAll(() => {
    // Templates are registered on module import
  });

  it('should register all 11 projectile presets', () => {
    expect(EffectRegistry.getCount()).toBeGreaterThanOrEqual(11);
  });

  describe('Physical Attack Templates', () => {
    it('should register arrow', () => {
      const template = EffectRegistry.get('arrow');
      expect(template).toBeDefined();
      expect(template?.name).toBe('Arrow');
      expect(template?.category).toBe('attack');
      expect(template?.tags).toContain('physical');
    });

    it('should register crossbow bolt', () => {
      const template = EffectRegistry.get('crossbow-bolt');
      expect(template).toBeDefined();
      expect(template?.name).toBe('Crossbow Bolt');
      expect(template?.category).toBe('attack');
    });

    it('should register throwing dagger', () => {
      const template = EffectRegistry.get('throwing-dagger');
      expect(template).toBeDefined();
      expect(template?.tags).toContain('thrown');
    });

    it('should register throwing axe', () => {
      const template = EffectRegistry.get('throwing-axe');
      expect(template).toBeDefined();
      expect(template?.tags).toContain('thrown');
    });
  });

  describe('Magic Spell Templates', () => {
    it('should register magic missile', () => {
      const template = EffectRegistry.get('magic-missile');
      expect(template).toBeDefined();
      expect(template?.name).toBe('Magic Missile');
      expect(template?.category).toBe('spell');
      expect(template?.metadata?.spellLevel).toBe(1);
    });

    it('should register eldritch blast', () => {
      const template = EffectRegistry.get('eldritch-blast');
      expect(template).toBeDefined();
      expect(template?.metadata?.spellLevel).toBe(0); // Cantrip
    });

    it('should register fireball', () => {
      const template = EffectRegistry.get('fireball');
      expect(template).toBeDefined();
      expect(template?.tags).toContain('explosive');
      expect(template?.tags).toContain('aoe');
      expect(template?.metadata?.spellLevel).toBe(3);
    });

    it('should register acid splash', () => {
      const template = EffectRegistry.get('acid-splash');
      expect(template).toBeDefined();
      expect(template?.tags).toContain('acid');
    });

    it('should register scorching ray', () => {
      const template = EffectRegistry.get('scorching-ray');
      expect(template).toBeDefined();
      expect(template?.tags).toContain('beam');
    });

    it('should register chromatic orb', () => {
      const template = EffectRegistry.get('chromatic-orb');
      expect(template).toBeDefined();
      expect(template?.tags).toContain('chromatic');
    });

    it('should register guiding bolt', () => {
      const template = EffectRegistry.get('guiding-bolt');
      expect(template).toBeDefined();
      expect(template?.tags).toContain('holy');
      expect(template?.tags).toContain('radiant');
    });
  });

  describe('Category Filtering', () => {
    it('should find attack templates', () => {
      const attacks = EffectRegistry.getByCategory('attack');
      expect(attacks.length).toBeGreaterThanOrEqual(4);
    });

    it('should find spell templates', () => {
      const spells = EffectRegistry.getByCategory('spell');
      expect(spells.length).toBeGreaterThanOrEqual(7);
    });
  });

  describe('Tag Filtering', () => {
    it('should find fire-tagged templates', () => {
      const fireEffects = EffectRegistry.getByTag('fire');
      expect(fireEffects.length).toBeGreaterThan(0);
      expect(fireEffects.some((t) => t.id === 'fireball')).toBe(true);
    });

    it('should find projectile-tagged templates', () => {
      const projectiles = EffectRegistry.getByTag('projectile');
      expect(projectiles.length).toBeGreaterThanOrEqual(11);
    });

    it('should find magic-tagged templates', () => {
      const magic = EffectRegistry.getByTag('magic');
      expect(magic.length).toBeGreaterThan(0);
    });
  });

  describe('Template Search', () => {
    it('should search by name', () => {
      const results = EffectRegistry.search({ name: 'bolt' });
      expect(results.length).toBeGreaterThanOrEqual(2); // crossbow-bolt, guiding-bolt
    });

    it('should search by category and tag', () => {
      const results = EffectRegistry.search({
        category: 'spell',
        tags: ['fire'],
      });
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((t) => t.category === 'spell')).toBe(true);
      expect(results.every((t) => t.tags.includes('fire'))).toBe(true);
    });
  });

  describe('Template Metadata', () => {
    it('should include D&D spell metadata', () => {
      const fireball = EffectRegistry.get('fireball');
      expect(fireball?.metadata).toBeDefined();
      expect(fireball?.metadata?.spellLevel).toBe(3);
      expect(fireball?.metadata?.damage).toBe('8d6');
      expect(fireball?.metadata?.damageType).toBe('fire');
      expect(fireball?.metadata?.range).toBe(150);
    });

    it('should include weapon metadata', () => {
      const arrow = EffectRegistry.get('arrow');
      expect(arrow?.metadata).toBeDefined();
      expect(arrow?.metadata?.weaponType).toBe('bow');
      expect(arrow?.metadata?.damageType).toBe('piercing');
    });
  });

  describe('Template Functions', () => {
    it('should create projectile configs from templates', () => {
      const template = EffectRegistry.get('arrow');
      expect(template?.template).toBeDefined();

      const config = template!.template({ x: 0, y: 0 }, { x: 100, y: 100 });
      expect(config).toBeDefined();

      // Type guard to check if it's a projectile config
      if ('from' in config && 'to' in config) {
        expect(config.from).toEqual({ x: 0, y: 0 });
        expect(config.to).toEqual({ x: 100, y: 100 });
      }
    });
  });
});
