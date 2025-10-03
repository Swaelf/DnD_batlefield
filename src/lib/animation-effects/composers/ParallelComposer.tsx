/**
 * ParallelComposer - Executes animation primitives simultaneously
 *
 * Orchestrates parallel execution of animation primitives, running all at once
 * and waiting for all to complete. Supports staggered starts and individual
 * completion tracking.
 */

import { memo, useState, useEffect, useCallback, useRef } from 'react';
import type Konva from 'konva';
import type { PrimitiveConfig } from '../types';
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
  /** Optional delay before starting this specific animation */
  delay?: number;
}

export interface ParallelComposerProps {
  /** Konva node to animate */
  nodeRef: React.RefObject<Konva.Node>;
  /** Array of animation steps to execute in parallel */
  animations: AnimationStep[];
  /** Optional stagger delay between animation starts in milliseconds */
  stagger?: number;
  /** Called when all animations complete */
  onComplete?: () => void;
  /** Called when number of completed animations changes */
  onProgress?: (completedCount: number, totalCount: number) => void;
  /** Called when an individual animation completes */
  onAnimationComplete?: (index: number) => void;
}

// ============================================================================
// Component
// ============================================================================

const ParallelComposerComponent = ({
  nodeRef,
  animations,
  stagger = 0,
  onComplete,
  onProgress,
  onAnimationComplete,
}: ParallelComposerProps) => {
  const [completedCount, setCompletedCount] = useState(0);
  const [activeAnimations, setActiveAnimations] = useState<number[]>([]);
  const hasCompletedRef = useRef(false);
  const staggerTimeoutsRef = useRef<number[]>([]);

  // Handle individual animation completion
  const handleAnimationComplete = useCallback(
    (index: number) => {
      setCompletedCount((prev) => {
        const newCount = prev + 1;
        onProgress?.(newCount, animations.length);
        return newCount;
      });
      onAnimationComplete?.(index);
    },
    [animations.length, onProgress, onAnimationComplete]
  );

  // Initialize active animations with stagger
  useEffect(() => {
    if (animations.length === 0) return;

    // Start all animations, possibly with stagger
    const activeIndices: number[] = [];
    animations.forEach((_, index) => {
      if (stagger > 0) {
        const timeout = window.setTimeout(() => {
          setActiveAnimations((prev) => [...prev, index]);
        }, index * stagger);
        staggerTimeoutsRef.current.push(timeout);
      } else {
        activeIndices.push(index);
      }
    });

    if (stagger === 0) {
      setActiveAnimations(activeIndices);
    }

    return () => {
      staggerTimeoutsRef.current.forEach(clearTimeout);
      staggerTimeoutsRef.current = [];
    };
  }, [animations.length, stagger]);

  // Call onComplete when all animations finish
  useEffect(() => {
    if (
      completedCount === animations.length &&
      animations.length > 0 &&
      !hasCompletedRef.current
    ) {
      hasCompletedRef.current = true;
      onComplete?.();
    }
  }, [completedCount, animations.length, onComplete]);

  // Return null if no animations
  if (animations.length === 0) {
    return null;
  }

  // Render all active animations
  return (
    <>
      {activeAnimations.map((index) => (
        <PrimitiveRenderer
          key={index}
          nodeRef={nodeRef}
          step={animations[index]}
          onComplete={() => handleAnimationComplete(index)}
        />
      ))}
    </>
  );
};

// ============================================================================
// Primitive Renderer
// ============================================================================

interface PrimitiveRendererProps {
  nodeRef: React.RefObject<Konva.Node>;
  step: AnimationStep;
  onComplete: () => void;
}

const PrimitiveRenderer = memo(
  ({ nodeRef, step, onComplete }: PrimitiveRendererProps) => {
    switch (step.type) {
      case 'move':
        return (
          <Move
            nodeRef={nodeRef}
            config={step.config as Parameters<typeof Move>[0]['config']}
            onComplete={onComplete}
          />
        );
      case 'rotate':
        return (
          <Rotate
            nodeRef={nodeRef}
            config={step.config as Parameters<typeof Rotate>[0]['config']}
            onComplete={onComplete}
          />
        );
      case 'scale':
        return (
          <Scale
            nodeRef={nodeRef}
            config={step.config as Parameters<typeof Scale>[0]['config']}
            onComplete={onComplete}
          />
        );
      case 'color':
        return (
          <Color
            nodeRef={nodeRef}
            config={step.config as Parameters<typeof Color>[0]['config']}
            onComplete={onComplete}
          />
        );
      case 'fade':
        return (
          <Fade
            nodeRef={nodeRef}
            config={step.config as Parameters<typeof Fade>[0]['config']}
            onComplete={onComplete}
          />
        );
      case 'trail':
        return (
          <Trail
            nodeRef={nodeRef}
            config={step.config as Parameters<typeof Trail>[0]['config']}
            onComplete={onComplete}
          />
        );
      case 'pulse':
        return (
          <Pulse
            nodeRef={nodeRef}
            config={step.config as Parameters<typeof Pulse>[0]['config']}
            onComplete={onComplete}
          />
        );
      case 'flash':
        return (
          <Flash
            nodeRef={nodeRef}
            config={step.config as Parameters<typeof Flash>[0]['config']}
            onComplete={onComplete}
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
        // Unknown primitive type - complete immediately
        onComplete();
        return null;
    }
  }
);

PrimitiveRenderer.displayName = 'PrimitiveRenderer';

// ============================================================================
// Export
// ============================================================================

export const ParallelComposer = memo(ParallelComposerComponent);
ParallelComposer.displayName = 'ParallelComposer';
