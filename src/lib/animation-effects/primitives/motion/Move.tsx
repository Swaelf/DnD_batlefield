/**
 * Move primitive - RAF-based position animation
 *
 * Interpolates an object's position from point A to point B with easing.
 * Uses requestAnimationFrame for smooth 60fps animations without Konva Tween.
 */

import { memo, useEffect, useRef } from 'react';
import type Konva from 'konva';
import type { MovePrimitiveConfig, AnimationProgress } from '../../types';
import { DEFAULT_EASING, DURATIONS } from '../../constants/defaults';
import { lerpPoint } from '../../utils/math';

interface MoveProps {
  /** Konva node to animate */
  nodeRef: React.RefObject<Konva.Node>;
  /** Move configuration */
  config: Omit<MovePrimitiveConfig, 'type'>;
  /** Called when animation completes */
  onComplete?: () => void;
  /** Called on each frame with progress */
  onProgress?: (progress: AnimationProgress) => void;
  /** Grid size for snapping (optional) */
  gridSize?: number;
  /** Whether to snap to grid */
  snapToGrid?: boolean;
}

const MoveComponent = ({
  nodeRef,
  config,
  onComplete,
  onProgress,
  gridSize,
  snapToGrid = false,
}: MoveProps) => {
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

      // Interpolate position
      let position = lerpPoint(config.from, config.to, easedProgress);

      // Apply grid snapping if enabled
      if (snapToGrid && gridSize) {
        position = {
          x: Math.round(position.x / gridSize) * gridSize,
          y: Math.round(position.y / gridSize) * gridSize,
        };
      }

      // Update node position
      node.x(position.x);
      node.y(position.y);

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
        // Ensure final position is exact
        node.x(config.to.x);
        node.y(config.to.y);
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
  }, [nodeRef, config, onComplete, onProgress, gridSize, snapToGrid]);

  return null;
};

export const Move = memo(MoveComponent);
