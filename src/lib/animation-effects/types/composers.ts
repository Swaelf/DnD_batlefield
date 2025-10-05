/**
 * Composition type definitions for combining animation primitives
 *
 * Composers allow primitives to be combined in various ways:
 * - Sequential: Execute primitives one after another
 * - Parallel: Execute primitives simultaneously
 * - Conditional: Execute primitives based on conditions
 */

import { AnimationPrimitive, PrimitiveConfig } from './primitives';

// ============================================================================
// Composition Types
// ============================================================================

/**
 * Composition strategy types
 */
export type CompositionType = 'sequential' | 'parallel' | 'conditional';

/**
 * Base composition configuration
 */
export interface BaseCompositionConfig {
  /** Unique identifier for this composition */
  id: string;
  /** Type of composition strategy */
  type: CompositionType;
  /** Primitives to compose */
  primitives: PrimitiveConfig[];
}

/**
 * Sequential composition - execute primitives in order
 */
export interface SequentialCompositionConfig extends BaseCompositionConfig {
  type: 'sequential';
  /** Gap between primitives in milliseconds */
  gap?: number;
  /** Whether to wait for each primitive to complete */
  waitForCompletion?: boolean;
}

/**
 * Parallel composition - execute primitives simultaneously
 */
export interface ParallelCompositionConfig extends BaseCompositionConfig {
  type: 'parallel';
  /** Whether to wait for all primitives to complete */
  waitForAll?: boolean;
  /** Stagger delay between primitive starts in milliseconds */
  stagger?: number;
}

/**
 * Condition evaluation function
 */
export type ConditionEvaluator = (context: CompositionContext) => boolean;

/**
 * Conditional branch configuration
 */
export interface ConditionalBranch {
  /** Condition to evaluate */
  condition: ConditionEvaluator;
  /** Primitives to execute if condition is true */
  primitives: PrimitiveConfig[];
  /** Optional composition type for this branch */
  compositionType?: 'sequential' | 'parallel';
}

/**
 * Conditional composition - execute primitives based on conditions
 */
export interface ConditionalCompositionConfig extends BaseCompositionConfig {
  type: 'conditional';
  /** Branches to evaluate in order */
  branches: ConditionalBranch[];
  /** Fallback primitives if no conditions match */
  fallback?: PrimitiveConfig[];
}

/**
 * Union of all composition configurations
 */
export type CompositionConfig =
  | SequentialCompositionConfig
  | ParallelCompositionConfig
  | ConditionalCompositionConfig;

// ============================================================================
// Composition Context
// ============================================================================

/**
 * Context available to compositions during execution
 */
export interface CompositionContext {
  /** Current timestamp */
  timestamp: number;
  /** Elapsed time since composition start */
  elapsedTime: number;
  /** Completed primitive IDs */
  completedPrimitives: Set<string>;
  /** Active primitive IDs */
  activePrimitives: Set<string>;
  /** Custom data passed to composition */
  data: Record<string, unknown>;
}

// ============================================================================
// Composition Lifecycle
// ============================================================================

/**
 * Composition lifecycle callbacks
 */
export interface CompositionLifecycle {
  /** Called when composition starts */
  onStart?: () => void;
  /** Called when a primitive in the composition starts */
  onPrimitiveStart?: (primitiveId: string) => void;
  /** Called when a primitive in the composition completes */
  onPrimitiveComplete?: (primitiveId: string) => void;
  /** Called on each frame with active primitives */
  onUpdate?: (activePrimitives: string[]) => void;
  /** Called when entire composition completes */
  onComplete?: () => void;
  /** Called when composition is cancelled */
  onCancel?: () => void;
}

// ============================================================================
// Composition Runtime Interface
// ============================================================================

/**
 * Runtime interface for animation compositions
 */
export interface AnimationComposition {
  /** Unique identifier for this composition */
  id: string;
  /** Composition configuration */
  config: CompositionConfig;
  /** Lifecycle callbacks */
  lifecycle: CompositionLifecycle;
  /** Execution context */
  context: CompositionContext;
  /** Active primitive instances */
  primitives: Map<string, AnimationPrimitive>;
  /** Start the composition */
  start: () => void;
  /** Stop the composition */
  stop: () => void;
  /** Pause the composition */
  pause: () => void;
  /** Resume the composition */
  resume: () => void;
  /** Update the composition (called each frame) */
  update: (deltaTime: number) => void;
  /** Clean up resources */
  cleanup: () => void;
}

// ============================================================================
// Composition Builder Types
// ============================================================================

/**
 * Fluent builder interface for creating compositions
 */
export interface CompositionBuilder {
  /** Add a primitive to the composition */
  add: (primitive: PrimitiveConfig) => CompositionBuilder;
  /** Add multiple primitives to the composition */
  addAll: (primitives: PrimitiveConfig[]) => CompositionBuilder;
  /** Set composition type */
  setType: (type: CompositionType) => CompositionBuilder;
  /** Set lifecycle callbacks */
  onLifecycle: (lifecycle: Partial<CompositionLifecycle>) => CompositionBuilder;
  /** Build the composition configuration */
  build: () => CompositionConfig;
}
