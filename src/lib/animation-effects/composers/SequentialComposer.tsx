/**
 * SequentialComposer - Executes animation primitives one after another
 *
 * Orchestrates sequential execution of animation primitives, waiting for each
 * to complete before starting the next. Supports optional delays between steps
 * and early termination on errors.
 */

import { memo, useState, useEffect, useCallback, useRef } from 'react';
import type Konva from 'konva';
import type { PrimitiveConfig, AnimationProgress } from '../types';
import { Move } from '../primitives/motion/Move';
import { Rotate } from '../primitives/motion/Rotate';
import { Scale } from '../primitives/motion/Scale';
import { Color } from '../primitives/motion/Color';
import { Fade } from '../primitives/motion/Fade';
import { Trail } from '../primitives/effects/Trail';
import { Pulse } from '../primitives/effects/Pulse';
import { Flash } from '../primitives/effects/Flash';

// ============================================================================
// Types
// ============================================================================

export interface AnimationStep {
  /** Primitive type to execute */
  type: PrimitiveConfig['type'];
  /** Configuration for the primitive */
  config: Omit<PrimitiveConfig, 'type'>;
  /** Optional delay before starting this step (in addition to sequence gap) */
  delay?: number;
}

export interface SequentialComposerProps {
  /** Konva node to animate */
  nodeRef: React.RefObject<Konva.Node>;
  /** Array of animation steps to execute sequentially */
  animations: AnimationStep[];
  /** Optional gap between animations in milliseconds */
  gap?: number;
  /** Whether to stop execution if an animation fails */
  stopOnError?: boolean;
  /** Called when all animations complete */
  onComplete?: () => void;
  /** Called with current step index and progress */
  onProgress?: (step: number, progress: AnimationProgress) => void;
  /** Called when a step starts */
  onStepStart?: (step: number) => void;
  /** Called when a step completes */
  onStepComplete?: (step: number) => void;
}

// ============================================================================
// Component
// ============================================================================

const SequentialComposerComponent = ({
  nodeRef,
  animations,
  gap = 0,
  onComplete,
  onProgress,
  onStepStart,
  onStepComplete,
}: SequentialComposerProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const hasStartedRef = useRef(false);
  const stepTimeoutRef = useRef<number | null>(null);

  // Handle step completion
  const handleStepComplete = useCallback(() => {
    onStepComplete?.(currentStep);

    // Check if there are more steps
    if (currentStep < animations.length - 1) {
      // Schedule next step with gap
      if (gap > 0) {
        stepTimeoutRef.current = window.setTimeout(() => {
          setCurrentStep((prev) => prev + 1);
        }, gap);
      } else {
        setCurrentStep((prev) => prev + 1);
      }
    } else {
      // All steps complete
      setIsComplete(true);
    }
  }, [currentStep, animations.length, gap, onStepComplete]);

  // Handle step progress
  const handleStepProgress = useCallback(
    (progress: AnimationProgress) => {
      onProgress?.(currentStep, progress);
    },
    [currentStep, onProgress]
  );

  // Notify when step starts
  useEffect(() => {
    if (!hasStartedRef.current && currentStep === 0) {
      hasStartedRef.current = true;
      onStepStart?.(0);
    } else if (currentStep > 0) {
      onStepStart?.(currentStep);
    }
  }, [currentStep, onStepStart]);

  // Call onComplete when all animations finish
  useEffect(() => {
    if (isComplete && onComplete) {
      onComplete();
    }
  }, [isComplete, onComplete]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stepTimeoutRef.current !== null) {
        clearTimeout(stepTimeoutRef.current);
      }
    };
  }, []);

  // Return null if complete or no animations
  if (isComplete || animations.length === 0 || currentStep >= animations.length) {
    return null;
  }

  const step = animations[currentStep];

  // Render the current step's primitive
  return (
    <PrimitiveRenderer
      nodeRef={nodeRef}
      step={step}
      onComplete={handleStepComplete}
      onProgress={handleStepProgress}
    />
  );
};

// ============================================================================
// Primitive Renderer
// ============================================================================

interface PrimitiveRendererProps {
  nodeRef: React.RefObject<Konva.Node>;
  step: AnimationStep;
  onComplete: () => void;
  onProgress: (progress: AnimationProgress) => void;
}

const PrimitiveRenderer = memo(
  ({ nodeRef, step, onComplete, onProgress }: PrimitiveRendererProps) => {
    switch (step.type) {
      case 'move':
        return (
          <Move
            nodeRef={nodeRef}
            config={step.config as Parameters<typeof Move>[0]['config']}
            onComplete={onComplete}
            onProgress={onProgress}
          />
        );
      case 'rotate':
        return (
          <Rotate
            nodeRef={nodeRef}
            config={step.config as Parameters<typeof Rotate>[0]['config']}
            onComplete={onComplete}
            onProgress={onProgress}
          />
        );
      case 'scale':
        return (
          <Scale
            nodeRef={nodeRef}
            config={step.config as Parameters<typeof Scale>[0]['config']}
            onComplete={onComplete}
            onProgress={onProgress}
          />
        );
      case 'color':
        return (
          <Color
            nodeRef={nodeRef}
            config={step.config as Parameters<typeof Color>[0]['config']}
            onComplete={onComplete}
            onProgress={onProgress}
          />
        );
      case 'fade':
        return (
          <Fade
            nodeRef={nodeRef}
            config={step.config as Parameters<typeof Fade>[0]['config']}
            onComplete={onComplete}
            onProgress={onProgress}
          />
        );
      case 'trail':
        return (
          <Trail
            nodeRef={nodeRef}
            config={step.config as Parameters<typeof Trail>[0]['config']}
            onComplete={onComplete}
            onProgress={onProgress}
          />
        );
      case 'pulse':
        return (
          <Pulse
            nodeRef={nodeRef}
            config={step.config as Parameters<typeof Pulse>[0]['config']}
            onComplete={onComplete}
            onProgress={onProgress}
          />
        );
      case 'flash':
        return (
          <Flash
            nodeRef={nodeRef}
            config={step.config as Parameters<typeof Flash>[0]['config']}
            onComplete={onComplete}
            onProgress={onProgress}
          />
        );
      case 'glow':
      case 'particles':
        // These primitives have special requirements (Shape nodeRef or position)
        // Complete immediately - should be handled separately
        console.warn(`Primitive type "${step.type}" requires special handling not supported in composers`);
        onComplete();
        return null;
      default:
        // Unknown primitive type - complete immediately to continue sequence
        onComplete();
        return null;
    }
  }
);

PrimitiveRenderer.displayName = 'PrimitiveRenderer';

// ============================================================================
// Export
// ============================================================================

export const SequentialComposer = memo(SequentialComposerComponent);
SequentialComposer.displayName = 'SequentialComposer';
