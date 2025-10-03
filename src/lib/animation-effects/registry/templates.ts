/**
 * Pre-populated animation templates
 *
 * Auto-registers all built-in projectile presets into the EffectRegistry.
 * This module should be imported once at application startup to populate
 * the registry with all available templates.
 */

import { EffectRegistry } from './EffectRegistry';
import {
  ArrowProjectile,
  CrossbowBoltProjectile,
  MagicMissileProjectile,
  EldritchBlastProjectile,
  FireballProjectile,
  AcidSplashProjectile,
  ScorchingRayProjectile,
  ChromaticOrbProjectile,
  GuidingBoltProjectile,
  ThrowingDaggerProjectile,
  ThrowingAxeProjectile,
} from '../projectiles/presets';

// ============================================================================
// Physical Attack Templates
// ============================================================================

EffectRegistry.register('arrow', {
  name: 'Arrow',
  description: 'Simple linear flight with trail effect',
  category: 'attack',
  tags: ['physical', 'projectile', 'ranged', 'piercing'],
  template: ArrowProjectile,
  metadata: {
    weaponType: 'bow',
    damageType: 'piercing',
    range: 150,
  },
});

EffectRegistry.register('crossbow-bolt', {
  name: 'Crossbow Bolt',
  description: 'Faster than arrow with shorter trail',
  category: 'attack',
  tags: ['physical', 'projectile', 'ranged', 'piercing'],
  template: CrossbowBoltProjectile,
  metadata: {
    weaponType: 'crossbow',
    damageType: 'piercing',
    range: 100,
  },
});

EffectRegistry.register('throwing-dagger', {
  name: 'Throwing Dagger',
  description: 'Spinning dagger with minimal effects',
  category: 'attack',
  tags: ['physical', 'projectile', 'ranged', 'piercing', 'thrown'],
  template: ThrowingDaggerProjectile,
  metadata: {
    weaponType: 'dagger',
    damageType: 'piercing',
    range: 60,
  },
});

EffectRegistry.register('throwing-axe', {
  name: 'Throwing Axe',
  description: 'Heavier projectile with arc',
  category: 'attack',
  tags: ['physical', 'projectile', 'ranged', 'slashing', 'thrown'],
  template: ThrowingAxeProjectile,
  metadata: {
    weaponType: 'handaxe',
    damageType: 'slashing',
    range: 60,
  },
});

// ============================================================================
// Magic Spell Templates
// ============================================================================

EffectRegistry.register('magic-missile', {
  name: 'Magic Missile',
  description: 'Glowing star with curved path and glow effect',
  category: 'spell',
  tags: ['magic', 'projectile', 'force', 'evocation'],
  template: MagicMissileProjectile,
  metadata: {
    spellLevel: 1,
    school: 'evocation',
    damage: '1d4+1',
    damageType: 'force',
    range: 120,
    components: ['V', 'S'],
  },
});

EffectRegistry.register('eldritch-blast', {
  name: 'Eldritch Blast',
  description: 'Dark energy with crackling effects',
  category: 'spell',
  tags: ['magic', 'projectile', 'force', 'evocation', 'warlock'],
  template: EldritchBlastProjectile,
  metadata: {
    spellLevel: 0,
    school: 'evocation',
    damage: '1d10',
    damageType: 'force',
    range: 120,
    components: ['V', 'S'],
  },
});

EffectRegistry.register('fireball', {
  name: 'Fireball',
  description: 'Grows and accelerates with impact explosion',
  category: 'spell',
  tags: ['magic', 'projectile', 'fire', 'evocation', 'explosive', 'aoe'],
  template: FireballProjectile,
  metadata: {
    spellLevel: 3,
    school: 'evocation',
    damage: '8d6',
    damageType: 'fire',
    range: 150,
    areaOfEffect: { type: 'sphere', radius: 20 },
    components: ['V', 'S', 'M'],
  },
});

EffectRegistry.register('acid-splash', {
  name: 'Acid Splash',
  description: 'Green orb that splatters on impact',
  category: 'spell',
  tags: ['magic', 'projectile', 'acid', 'conjuration', 'splash'],
  template: AcidSplashProjectile,
  metadata: {
    spellLevel: 0,
    school: 'conjuration',
    damage: '1d6',
    damageType: 'acid',
    range: 60,
    components: ['V', 'S'],
  },
});

EffectRegistry.register('scorching-ray', {
  name: 'Scorching Ray',
  description: 'Beam of fire with intense glow',
  category: 'spell',
  tags: ['magic', 'projectile', 'fire', 'evocation', 'beam'],
  template: ScorchingRayProjectile,
  metadata: {
    spellLevel: 2,
    school: 'evocation',
    damage: '2d6',
    damageType: 'fire',
    range: 120,
    components: ['V', 'S'],
  },
});

EffectRegistry.register('chromatic-orb', {
  name: 'Chromatic Orb',
  description: 'Color-shifting orb with complex mutations',
  category: 'spell',
  tags: ['magic', 'projectile', 'elemental', 'evocation', 'chromatic'],
  template: ChromaticOrbProjectile,
  metadata: {
    spellLevel: 1,
    school: 'evocation',
    damage: '3d8',
    damageType: 'varies', // acid, cold, fire, lightning, poison, thunder
    range: 90,
    components: ['V', 'S', 'M'],
  },
});

EffectRegistry.register('guiding-bolt', {
  name: 'Guiding Bolt',
  description: 'Holy radiant projectile with trailing light',
  category: 'spell',
  tags: ['magic', 'projectile', 'radiant', 'evocation', 'holy'],
  template: GuidingBoltProjectile,
  metadata: {
    spellLevel: 1,
    school: 'evocation',
    damage: '4d6',
    damageType: 'radiant',
    range: 120,
    components: ['V', 'S'],
  },
});

// ============================================================================
// Registry Initialization
// ============================================================================

/**
 * Get the number of templates registered
 *
 * @returns Template count
 */
export function getRegisteredTemplateCount(): number {
  return EffectRegistry.getCount();
}

/**
 * Log registry statistics
 */
export function logRegistryStats(): void {
  console.log('[EffectRegistry] Registered templates:', {
    total: EffectRegistry.getCount(),
    categories: EffectRegistry.getCategories(),
    tags: EffectRegistry.getTags(),
  });
}
