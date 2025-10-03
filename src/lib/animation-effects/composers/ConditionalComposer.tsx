/**
 * ConditionalComposer - Executes animation primitives based on conditions
 *
 * Evaluates a condition at runtime and executes different animation sets based
 * on the result. Supports true/false branches with fallback handling and
 * sequential or parallel execution within each branch.
 */

import { memo, useState, useEffect, useCallback, useMemo } from 'react';
import type Konva from 'konva';
import { SequentialComposer, type AnimationStep } from './SequentialComposer';
import { ParallelComposer } from './ParallelComposer';

// ============================================================================
// Types
// ============================================================================

export interface ConditionalComposerProps {
  /** Konva node to animate */
  nodeRef: React.RefObject<Konva.Node>;
  /** Condition function to evaluate (receives the Konva node) */
  condition: (node: Konva.Node) => boolean;
  /** Animation(s) to execute if condition is true */
  trueAnimation: AnimationStep | AnimationStep[];
  /** Animation(s) to execute if condition is false */
  falseAnimation?: AnimationStep | AnimationStep[];
  /** Composition type for animation arrays ('sequential' or 'parallel') */
  compositionType?: 'sequential' | 'parallel';
  /** Called when animation completes */
  onComplete?: () => void;
  /** Called when condition is evaluated */
  onConditionEvaluated?: (result: boolean) => void;
}

// ============================================================================
// Component
// ============================================================================

const ConditionalComposerComponent = ({
  nodeRef,
  condition,
  trueAnimation,
  falseAnimation,
  compositionType = 'sequential',
  onComplete,
  onConditionEvaluated,
}: ConditionalComposerProps) => {
  const [conditionResult, setConditionResult] = useState<boolean | null>(null);
  const [hasEvaluated, setHasEvaluated] = useState(false);

  // Evaluate condition when component mounts or nodeRef changes
  useEffect(() => {
    if (!nodeRef.current || hasEvaluated) return;

    try {
      const result = condition(nodeRef.current);
      setConditionResult(result);
      setHasEvaluated(true);
      onConditionEvaluated?.(result);
    } catch (error) {
      console.error('Error evaluating condition in ConditionalComposer:', error);
      // Default to false on error
      setConditionResult(false);
      setHasEvaluated(true);
      onConditionEvaluated?.(false);
    }
  }, [nodeRef, condition, hasEvaluated, onConditionEvaluated]);

  // Determine which animation set to use
  const selectedAnimations = useMemo(() => {
    if (conditionResult === null) return null;

    if (conditionResult) {
      return Array.isArray(trueAnimation) ? trueAnimation : [trueAnimation];
    } else {
      if (!falseAnimation) return null;
      return Array.isArray(falseAnimation) ? falseAnimation : [falseAnimation];
    }
  }, [conditionResult, trueAnimation, falseAnimation]);

  // Handle completion
  const handleComplete = useCallback(() => {
    onComplete?.();
  }, [onComplete]);

  // Wait for condition evaluation
  if (conditionResult === null || selectedAnimations === null) {
    return null;
  }

  // No animations to run
  if (selectedAnimations.length === 0) {
    // Call onComplete immediately
    if (onComplete) {
      setTimeout(onComplete, 0);
    }
    return null;
  }

  // Render appropriate composer based on composition type
  if (compositionType === 'parallel') {
    return (
      <ParallelComposer
        nodeRef={nodeRef}
        animations={selectedAnimations}
        onComplete={handleComplete}
      />
    );
  } else {
    return (
      <SequentialComposer
        nodeRef={nodeRef}
        animations={selectedAnimations}
        onComplete={handleComplete}
      />
    );
  }
};

// ============================================================================
// Export
// ============================================================================

export const ConditionalComposer = memo(ConditionalComposerComponent);
ConditionalComposer.displayName = 'ConditionalComposer';
