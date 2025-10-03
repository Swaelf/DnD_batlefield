/**
 * EffectFactory Usage Examples
 *
 * Demonstrates how to use the EffectFactory to create animations
 * from registered templates with runtime parameters and custom overrides.
 */

import { EffectFactory } from './EffectFactory';
import { EffectRegistry } from './EffectRegistry';
import type { AnimationParams } from './EffectFactory';
import type { AbstractProjectileConfig } from '../types/projectiles';
import { Point } from '@/types';

// ============================================================================
// Example 1: Create animation from registered template
// ============================================================================

function example1_basicUsage() {
  // Positions for the animation
  const casterPos: Point = { x: 100, y: 100 };
  const targetPos: Point = { x: 500, y: 300 };

  // Create a fireball animation
  const config = EffectFactory.create('fireball', {
    from: casterPos,
    to: targetPos,
  });

  console.log('Fireball config:', config);
  // Result: Complete AbstractProjectileConfig with all defaults applied
}

// ============================================================================
// Example 2: Override template defaults
// ============================================================================

function example2_withOverrides() {
  const casterPos: Point = { x: 0, y: 0 };
  const targetPos: Point = { x: 300, y: 200 };

  // Create a blue fireball with custom size
  const config = EffectFactory.create(
    'fireball',
    {
      from: casterPos,
      to: targetPos,
      duration: 1500, // Slower animation
      onComplete: () => console.log('Fireball hit!'),
    },
    {
      color: '#0000FF', // Blue instead of red
      size: 30, // Bigger explosion
      effects: ['glow', 'trail', 'flash'], // Extra effects
    }
  );

  console.log('Custom fireball:', config);
}

// ============================================================================
// Example 3: Batch creation for multi-target spells
// ============================================================================

function example3_batchCreation() {
  const casterPos: Point = { x: 100, y: 100 };

  // Magic Missile hits 3 targets
  const targets = [
    { x: 300, y: 200 },
    { x: 400, y: 150 },
    { x: 350, y: 250 },
  ];

  const paramsList: AnimationParams[] = targets.map((target) => ({
    from: casterPos,
    to: target,
    delay: Math.random() * 200, // Stagger the missiles
  }));

  const configs = EffectFactory.createBatch('magic-missile', paramsList, {
    color: '#FF00FF', // Purple missiles
  });

  console.log(`Created ${configs.length} magic missiles`);
  configs.forEach((config, i) => {
    console.log(`Missile ${i + 1}:`, config.to, `delay: ${config.delay}ms`);
  });
}

// ============================================================================
// Example 4: Create custom animation without template
// ============================================================================

function example4_customAnimation() {
  // Create a completely custom projectile
  const customConfig: AbstractProjectileConfig = {
    from: { x: 0, y: 0 },
    to: { x: 200, y: 200 },
    shape: 'star',
    color: '#FFD700',
    size: 25,
    duration: 2000,
    effects: ['glow', 'trail'],
    mutations: [
      {
        trigger: { type: 'progress', value: 0.5 },
        color: '#FF0000', // Turn red at midpoint
      },
    ],
  };

  const config = EffectFactory.createCustom(customConfig);
  console.log('Custom animation:', config);
}

// ============================================================================
// Example 5: Clone and modify existing config
// ============================================================================

function example5_cloneConfig() {
  // Create base arrow
  const baseArrow = EffectFactory.create('arrow', {
    from: { x: 0, y: 0 },
    to: { x: 100, y: 100 },
  });

  // Clone with fire effect (flaming arrow)
  const flamingArrow = EffectFactory.clone(baseArrow, {
    color: '#FF4500',
    effects: ['trail', 'glow', 'particles'],
  });

  // Clone with ice effect (frost arrow)
  const frostArrow = EffectFactory.clone(baseArrow, {
    color: '#00FFFF',
    effects: ['trail', 'glow'],
  });

  console.log('Base arrow:', baseArrow);
  console.log('Flaming arrow:', flamingArrow);
  console.log('Frost arrow:', frostArrow);
}

// ============================================================================
// Example 6: Validation and error handling
// ============================================================================

function example6_validation() {
  // This will throw an error - template doesn't exist
  try {
    EffectFactory.create('non-existent-spell', {
      from: { x: 0, y: 0 },
      to: { x: 100, y: 100 },
    });
  } catch (error) {
    console.error('Expected error:', (error as Error).message);
  }

  // This will throw - invalid color format
  try {
    EffectFactory.createCustom({
      from: { x: 0, y: 0 },
      to: { x: 100, y: 100 },
      shape: 'circle',
      color: 'not-a-valid-color',
    });
  } catch (error) {
    console.error('Validation error:', (error as Error).message);
  }

  // This will work but show warnings
  const config = EffectFactory.createCustom({
    from: { x: 0, y: 0 },
    to: { x: 100, y: 100 },
    shape: 'circle',
    color: '#FF0000',
    size: 150, // Very large - will warn
    duration: 15000, // Very slow - will warn
  });

  console.log('Config with warnings:', config);
}

// ============================================================================
// Example 7: Working with registered templates
// ============================================================================

function example7_registryIntegration() {
  // Register a custom template
  EffectRegistry.register('custom-bolt', {
    name: 'Custom Lightning Bolt',
    category: 'spell',
    tags: ['custom', 'lightning', 'test'],
    template: (from: Point, to: Point) => ({
      from,
      to,
      shape: 'rectangle',
      color: '#FFFF00',
      size: 8,
      effects: ['flash', 'glow'],
      duration: 500,
    }),
  });

  // Now use it
  const config = EffectFactory.create('custom-bolt', {
    from: { x: 0, y: 0 },
    to: { x: 300, y: 300 },
  });

  console.log('Custom bolt:', config);

  // Clean up
  EffectRegistry.unregister('custom-bolt');
}

// ============================================================================
// Example 8: Complex composition with callbacks
// ============================================================================

function example8_withCallbacks() {
  let progress = 0;

  const config = EffectFactory.create(
    'scorching-ray',
    {
      from: { x: 100, y: 100 },
      to: { x: 400, y: 300 },
      duration: 800,
      onProgress: (prog, position) => {
        progress = prog;
        console.log(`Progress: ${(prog * 100).toFixed(1)}%`, position);
      },
      onComplete: () => {
        console.log('Scorching Ray hit target!');
        console.log('Final progress:', progress);
      },
    },
    {
      size: 20,
      effects: ['glow', 'trail', 'flash'],
    }
  );

  console.log('Scorching Ray config:', config);
}

// ============================================================================
// Run Examples
// ============================================================================

export function runAllExamples() {
  console.log('\n=== Example 1: Basic Usage ===');
  example1_basicUsage();

  console.log('\n=== Example 2: With Overrides ===');
  example2_withOverrides();

  console.log('\n=== Example 3: Batch Creation ===');
  example3_batchCreation();

  console.log('\n=== Example 4: Custom Animation ===');
  example4_customAnimation();

  console.log('\n=== Example 5: Clone Config ===');
  example5_cloneConfig();

  console.log('\n=== Example 6: Validation ===');
  example6_validation();

  console.log('\n=== Example 7: Registry Integration ===');
  example7_registryIntegration();

  console.log('\n=== Example 8: With Callbacks ===');
  example8_withCallbacks();
}

// Uncomment to run examples:
// runAllExamples();
