/**
 * Status Effect Animation Presets
 *
 * Defines composition patterns for all D&D status effect animations
 * using animation primitives instead of custom Konva.Animation code.
 *
 * NOTE: This is a simplified configuration format that will be translated
 * to actual PrimitiveConfig objects when rendering. The actual StatusEffectRenderer
 * component will handle the translation.
 */

import type { StatusEffectType } from '@/types';

/**
 * Simplified status effect animation configuration
 * This format is easier to work with than raw PrimitiveConfig objects
 */
export interface StatusEffectAnimationConfig {
  type: StatusEffectType;
  // Using a simpler format - actual primitives will be created by renderer
  effects: Array<{
    primitive: 'pulse' | 'rotate' | 'fade' | 'move' | 'glow' | 'particles';
    params: Record<string, unknown>;
  }>;
  loop: boolean;
}

/**
 * Get animation configuration for a status effect
 */
export function getStatusEffectAnimation(
  effectType: StatusEffectType,
  intensity: number = 1
): StatusEffectAnimationConfig {
  const configs: Record<StatusEffectType, StatusEffectAnimationConfig> = {
    // Simple pulse effects
    stunned: {
      type: 'stunned',
      effects: [
        {
          primitive: 'pulse',
          params: {
            scaleRange: [0.9, 1.1],
            frequency: 2,
            duration: 1000,
          },
        },
      ],
      loop: true,
    },

    dazed: {
      type: 'dazed',
      effects: [
        {
          primitive: 'pulse',
          params: {
            scaleRange: [0.95, 1.05],
            frequency: 1.5,
            duration: 1000,
          },
        },
      ],
      loop: true,
    },

    // Rotation effects
    prone: {
      type: 'prone',
      effects: [
        {
          primitive: 'rotate',
          params: {
            fromRotation: 0,
            toRotation: 360,
            duration: 2000,
          },
        },
      ],
      loop: true,
    },

    // Oscillating fade effects
    sleeping: {
      type: 'sleeping',
      effects: [
        {
          primitive: 'fade',
          params: {
            fromOpacity: 0.3,
            toOpacity: 0.8,
            duration: 2000,
          },
        },
      ],
      loop: true,
    },

    // Wave motion effects (simplified - actual move primitive will be configured in renderer)
    entangled: {
      type: 'entangled',
      effects: [
        {
          primitive: 'move',
          params: {
            pathType: 'wave',
            amplitude: 5 * intensity,
            duration: 1000,
          },
        },
      ],
      loop: true,
    },

    // Complex multi-primitive effects
    flaming: {
      type: 'flaming',
      effects: [
        {
          primitive: 'pulse',
          params: {
            scaleRange: [0.9, 1.1],
            frequency: 3,
            duration: 1000,
          },
        },
        {
          primitive: 'glow',
          params: {
            color: '#FF6347',
            radius: 20 * intensity,
            intensity: intensity * 0.8,
            pulse: {
              enabled: true,
              speed: 2,
              range: [0.6, 1.0],
            },
            duration: 1000,
          },
        },
        {
          primitive: 'particles',
          params: {
            emissionRate: 8 * intensity,
            particleLifetime: 1000,
            colors: ['#FF4500', '#FF6347', '#FFA500'],
            sizeRange: [2, 6],
            duration: 1000,
          },
        },
      ],
      loop: true,
    },

    chilled: {
      type: 'chilled',
      effects: [
        {
          primitive: 'pulse',
          params: {
            scaleRange: [0.95, 1.02],
            frequency: 1,
            duration: 1000,
          },
        },
        {
          primitive: 'particles',
          params: {
            emissionRate: 6 * intensity,
            particleLifetime: 1500,
            colors: ['#00BFFF', '#87CEEB', '#B0E0E6'],
            sizeRange: [1, 4],
            duration: 1000,
          },
        },
      ],
      loop: true,
    },

    poisoned: {
      type: 'poisoned',
      effects: [
        {
          primitive: 'pulse',
          params: {
            scaleRange: [0.92, 1.08],
            frequency: 2.5,
            duration: 1000,
          },
        },
        {
          primitive: 'particles',
          params: {
            emissionRate: 5 * intensity,
            particleLifetime: 2000,
            colors: ['#32CD32', '#90EE90', '#98FB98'],
            sizeRange: [2, 5],
            duration: 1000,
          },
        },
      ],
      loop: true,
    },

    blessed: {
      type: 'blessed',
      effects: [
        {
          primitive: 'pulse',
          params: {
            scaleRange: [0.95, 1.05],
            frequency: 1.5,
            duration: 1000,
          },
        },
        {
          primitive: 'glow',
          params: {
            color: '#FFFACD',
            radius: 25 * intensity,
            intensity: intensity * 0.6,
            pulse: {
              enabled: true,
              speed: 1,
              range: [0.5, 1.0],
            },
            duration: 1000,
          },
        },
        {
          primitive: 'particles',
          params: {
            emissionRate: 4 * intensity,
            particleLifetime: 1500,
            colors: ['#FFD700', '#FFFACD', '#FFF8DC'],
            sizeRange: [2, 6],
            duration: 1000,
          },
        },
      ],
      loop: true,
    },

    regenerating: {
      type: 'regenerating',
      effects: [
        {
          primitive: 'pulse',
          params: {
            scaleRange: [0.98, 1.02],
            frequency: 1,
            duration: 1000,
          },
        },
        {
          primitive: 'glow',
          params: {
            color: '#90EE90',
            radius: 20 * intensity,
            intensity: intensity * 0.5,
            pulse: {
              enabled: true,
              speed: 0.8,
              range: [0.4, 0.8],
            },
            duration: 1000,
          },
        },
        {
          primitive: 'particles',
          params: {
            emissionRate: 3 * intensity,
            particleLifetime: 2000,
            colors: ['#98FB98', '#90EE90', '#B4EEB4'],
            sizeRange: [1, 4],
            duration: 1000,
          },
        },
      ],
      loop: true,
    },

    frightened: {
      type: 'frightened',
      effects: [
        {
          primitive: 'fade',
          params: {
            fromOpacity: 0.6,
            toOpacity: 1.0,
            duration: 500,
          },
        },
      ],
      loop: true,
    },

    dying: {
      type: 'dying',
      effects: [
        {
          primitive: 'fade',
          params: {
            fromOpacity: 0.2,
            toOpacity: 0.6,
            duration: 1500,
          },
        },
        {
          primitive: 'pulse',
          params: {
            scaleRange: [0.95, 1.05],
            frequency: 0.8,
            duration: 1500,
          },
        },
      ],
      loop: true,
    },
  };

  return configs[effectType];
}

/**
 * Get all available status effect types
 */
export function getAllStatusEffectTypes(): StatusEffectType[] {
  return [
    'stunned',
    'poisoned',
    'prone',
    'entangled',
    'dying',
    'flaming',
    'chilled',
    'dazed',
    'blessed',
    'regenerating',
    'sleeping',
    'frightened',
  ];
}

/**
 * Check if a status effect has particle effects
 */
export function hasParticleEffects(effectType: StatusEffectType): boolean {
  const particleEffects: StatusEffectType[] = [
    'flaming',
    'chilled',
    'poisoned',
    'blessed',
    'regenerating',
  ];
  return particleEffects.includes(effectType);
}

/**
 * Get complexity score for a status effect (1-3)
 * 1 = Simple (single primitive)
 * 2 = Medium (2 primitives)
 * 3 = Complex (3+ primitives)
 */
export function getEffectComplexity(effectType: StatusEffectType): number {
  const config = getStatusEffectAnimation(effectType);
  return Math.min(config.effects.length, 3);
}
