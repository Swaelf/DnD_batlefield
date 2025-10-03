/**
 * Rotate primitive - RAF-based rotation animation
 *
 * Animates rotation from start angle to end angle with automatic shortest path calculation.
 * Supports clockwise/counter-clockwise direction and continuous rotation (>360°).
 */

import { memo, useEffect, useRef } from 'react';
import type Konva from 'konva';
import type { RotatePrimitiveConfig, AnimationProgress } from '../../types';
import { DEFAULT_EASING, DURATIONS } from '../../constants/defaults';
import { lerpAngle, shortestAngle } from '../../utils/math';

interface RotateProps {
  /** Konva node to animate */
  nodeRef: React.RefObject<Konva.Node>;
  /** Rotate configuration */
  config: Omit<RotatePrimitiveConfig, 'type'>;
  /** Called when animation completes */
  onComplete?: () => void;
  /** Called on each frame with progress */
  onProgress?: (progress: AnimationProgress) => void;
  /** Whether to take shortest path (default: true) */
  shortestPath?: boolean;
}

const RotateComponent = ({
  nodeRef,
  config,
  onComplete,
  onProgress,
  shortestPath = true,
}: RotateProps) => {
  const hasStartedRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!nodeRef.current || hasStartedRef.current) return;
    hasStartedRef.current = true;

    const node = nodeRef.current;
    const duration = config.duration || DURATIONS.NORMAL;
    const delay = config.delay || 0;
    const easing = config.easing || DEFAULT_EASING;
    const startTime = Date.now() + delay;

    // Calculate rotation delta
    const fromRotation = config.fromRotation;
    const toRotation = config.toRotation;
    const rotationDelta = shortestPath
      ? shortestAngle(fromRotation, toRotation)
      : toRotation - fromRotation;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;

      // Handle delay
      if (elapsed < 0) {
        rafIdRef.current = requestAnimationFrame(animate);
        return;
      }

      const rawProgress = Math.min(elapsed / duration, 1);
      const easedProgress = easing(rawProgress);

      // Calculate rotation
      const rotation = shortestPath
        ? lerpAngle(fromRotation, toRotation, easedProgress)
        : fromRotation + rotationDelta * easedProgress;

      // Update node rotation
      node.rotation(rotation);

      // Trigger layer redraw
      node.getLayer()?.batchDraw();

      // Report progress
      if (onProgress) {
        onProgress({
          currentTime: elapsed,
          totalDuration: duration,
          progress: rawProgress,
          easedProgress,
          isComplete: rawProgress >= 1,
        });
      }

      // Continue or complete
      if (rawProgress < 1) {
        rafIdRef.current = requestAnimationFrame(animate);
      } else {
        // Ensure final rotation is exact
        node.rotation(toRotation);
        node.getLayer()?.batchDraw();
        onComplete?.();
      }
    };

    rafIdRef.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [nodeRef, config, onComplete, onProgress, shortestPath]);

  return null;
};

export const Rotate = memo(RotateComponent);
