/**
 * Effect factory for creating animation instances from registry templates
 *
 * Provides a clean API for dynamically creating animation configurations
 * from registered templates with runtime parameters and custom overrides.
 */

import { Point } from '@/types';
import { EffectRegistry } from './EffectRegistry';
import type { AbstractProjectileConfig } from '../types/projectiles';

// ============================================================================
// Factory Parameter Types
// ============================================================================

/**
 * Runtime parameters for animation creation
 */
export interface AnimationParams {
  /** Starting position */
  from: Point;
  /** Target position */
  to: Point;
  /** Animation duration in milliseconds */
  duration?: number;
  /** Delay before starting in milliseconds */
  delay?: number;
  /** Completion callback */
  onComplete?: () => void;
  /** Progress tracking callback */
  onProgress?: (progress: number, position: Point) => void;
}

/**
 * Validation result for animation configurations
 */
export interface ValidationResult {
  /** Whether configuration is valid */
  valid: boolean;
  /** Array of error messages */
  errors: string[];
  /** Array of warning messages */
  warnings: string[];
}

// ============================================================================
// Validation Utilities
// ============================================================================

/**
 * Validate hex color format (#RGB, #RRGGBB, #RRGGBBAA)
 */
function isValidHexColor(color: string): boolean {
  return /^#([0-9A-F]{3}|[0-9A-F]{6}|[0-9A-F]{8})$/i.test(color);
}

/**
 * Validate RGB/RGBA color format
 */
function isValidRgbColor(color: string): boolean {
  return /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+\s*)?\)$/i.test(color);
}

/**
 * Validate color format (hex or rgb/rgba)
 */
function isValidColor(color: string): boolean {
  return isValidHexColor(color) || isValidRgbColor(color);
}

/**
 * Merge configuration objects with proper precedence
 * Later sources take precedence over earlier ones, but only for defined values
 */
function mergeConfigs(
  ...sources: Partial<AbstractProjectileConfig>[]
): AbstractProjectileConfig {
  let result = {} as AbstractProjectileConfig;

  for (const source of sources) {
    for (const key in source) {
      const value = source[key as keyof AbstractProjectileConfig];
      // Only override if value is defined
      if (value !== undefined) {
        result = {
          ...result,
          [key]: value,
        };
      }
    }
  }

  return result;
}

// ============================================================================
// Effect Factory Class
// ============================================================================

/**
 * Factory for creating animation configurations from registry templates
 */
class AnimationFactoryClass {
  /**
   * Create animation config from registered template
   *
   * @param templateId - ID of registered template
   * @param params - Runtime parameters (from, to, duration, etc.)
   * @param overrides - Optional config overrides
   * @returns Complete animation configuration
   * @throws Error if template not found or validation fails
   */
  create(
    templateId: string,
    params: AnimationParams,
    overrides?: Partial<AbstractProjectileConfig>
  ): AbstractProjectileConfig {
    // Get template from registry
    const template = EffectRegistry.get(templateId);
    if (!template) {
      throw new Error(
        `[EffectFactory] Template "${templateId}" not found in registry. ` +
          `Available templates: ${EffectRegistry.getAll().map((t) => t.id).join(', ')}`
      );
    }

    // Call template function to get base configuration
    const baseConfig = template.template(params.from, params.to) as AbstractProjectileConfig;

    // Apply default parameters
    const defaults = this.getDefaults();

    // Merge: defaults -> baseConfig -> params -> overrides
    // Later values override earlier ones
    const config = mergeConfigs(
      defaults,
      baseConfig,
      {
        duration: params.duration,
        delay: params.delay,
        onComplete: params.onComplete,
        onProgress: params.onProgress,
      } as Partial<AbstractProjectileConfig>,
      overrides || {}
    );

    // Validate final configuration
    const validation = this.validate(config);
    if (!validation.valid) {
      throw new Error(
        `[EffectFactory] Invalid configuration for "${templateId}":\n` +
          validation.errors.map((e) => `  - ${e}`).join('\n')
      );
    }

    // Log warnings if present
    if (validation.warnings.length > 0) {
      console.warn(
        `[EffectFactory] Warnings for "${templateId}":\n` +
          validation.warnings.map((w) => `  - ${w}`).join('\n')
      );
    }

    return config;
  }

  /**
   * Create custom animation config (not from registry)
   *
   * @param config - Complete animation configuration
   * @returns Validated animation configuration
   * @throws Error if validation fails
   */
  createCustom(config: AbstractProjectileConfig): AbstractProjectileConfig {
    // Apply defaults to fill in missing optional fields
    const defaults = this.getDefaults();
    const mergedConfig = mergeConfigs(defaults, config);

    // Validate
    const validation = this.validate(mergedConfig);
    if (!validation.valid) {
      throw new Error(
        `[EffectFactory] Invalid custom configuration:\n` +
          validation.errors.map((e) => `  - ${e}`).join('\n')
      );
    }

    // Log warnings
    if (validation.warnings.length > 0) {
      console.warn(
        `[EffectFactory] Custom configuration warnings:\n` +
          validation.warnings.map((w) => `  - ${w}`).join('\n')
      );
    }

    return mergedConfig;
  }

  /**
   * Create multiple animations from same template (multi-target)
   *
   * @param templateId - ID of registered template
   * @param paramsList - Array of runtime parameters for each animation
   * @param overrides - Optional config overrides applied to all instances
   * @returns Array of animation configurations
   * @throws Error if template not found or validation fails
   */
  createBatch(
    templateId: string,
    paramsList: AnimationParams[],
    overrides?: Partial<AbstractProjectileConfig>
  ): AbstractProjectileConfig[] {
    return paramsList.map((params) => this.create(templateId, params, overrides));
  }

  /**
   * Validate animation configuration
   *
   * @param config - Configuration to validate
   * @returns Validation result with errors and warnings
   */
  validate(config: AbstractProjectileConfig): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!config.from) {
      errors.push('Missing required field: from');
    } else if (typeof config.from.x !== 'number' || typeof config.from.y !== 'number') {
      errors.push('Invalid from position: must have numeric x and y');
    }

    if (!config.to) {
      errors.push('Missing required field: to');
    } else if (typeof config.to.x !== 'number' || typeof config.to.y !== 'number') {
      errors.push('Invalid to position: must have numeric x and y');
    }

    if (!config.shape) {
      errors.push('Missing required field: shape');
    } else if (!['circle', 'triangle', 'rectangle', 'star', 'custom'].includes(config.shape)) {
      errors.push(`Invalid shape type: ${config.shape}`);
    }

    if (!config.color) {
      errors.push('Missing required field: color');
    } else if (!isValidColor(config.color)) {
      errors.push(`Invalid color format: ${config.color} (use #hex or rgb/rgba)`);
    }

    // Numeric ranges
    if (config.size !== undefined && config.size <= 0) {
      errors.push(`Invalid size: ${config.size} (must be > 0)`);
    }

    if (config.duration !== undefined && config.duration <= 0) {
      errors.push(`Invalid duration: ${config.duration} (must be > 0)`);
    }

    if (config.delay !== undefined && config.delay < 0) {
      errors.push(`Invalid delay: ${config.delay} (must be >= 0)`);
    }

    // Effect types
    if (config.effects) {
      const validEffects = ['trail', 'glow', 'pulse', 'flash', 'particles'];
      for (const effect of config.effects) {
        if (!validEffects.includes(effect)) {
          warnings.push(`Unknown effect type: ${effect}`);
        }
      }
    }

    // Warnings for common issues
    if (config.size && config.size > 100) {
      warnings.push(`Large size: ${config.size}px may be too big for projectile`);
    }

    if (config.duration && config.duration > 10000) {
      warnings.push(`Long duration: ${config.duration}ms may feel too slow`);
    }

    if (config.mutations && config.mutations.length > 5) {
      warnings.push(`Many mutations: ${config.mutations.length} may impact performance`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Clone existing config with modifications
   *
   * @param config - Base configuration to clone
   * @param overrides - Properties to override
   * @returns New configuration with overrides applied
   */
  clone(
    config: AbstractProjectileConfig,
    overrides: Partial<AbstractProjectileConfig>
  ): AbstractProjectileConfig {
    const cloned = mergeConfigs(config, overrides);

    // Validate cloned config
    const validation = this.validate(cloned);
    if (!validation.valid) {
      throw new Error(
        `[EffectFactory] Invalid cloned configuration:\n` +
          validation.errors.map((e) => `  - ${e}`).join('\n')
      );
    }

    return cloned;
  }

  /**
   * Get default configuration values
   *
   * @returns Default partial configuration
   */
  private getDefaults(): Partial<AbstractProjectileConfig> {
    return {
      size: 10,
      duration: 1000,
      delay: 0,
      effects: [],
      mutations: [],
    };
  }
}

// ============================================================================
// Global Factory Instance
// ============================================================================

/**
 * Global effect factory instance
 * Use this singleton to create animation configurations
 */
export const EffectFactory = new AnimationFactoryClass();
