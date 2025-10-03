/**
 * Scale primitive - RAF-based scale animation
 *
 * Animates scale from start to end values with support for:
 * - Uniform or non-uniform scaling (x/y independent)
 * - Scale origin point (center, corner, custom)
 * - Min/max constraints
 */

import { memo, useEffect, useRef } from 'react';
import type Konva from 'konva';
import type { Point } from '@/types';
import type { ScalePrimitiveConfig, AnimationProgress } from '../../types';
import { DEFAULT_EASING, DURATIONS } from '../../constants/defaults';
import { lerp } from '../../utils/math';

interface ScaleProps {
  /** Konva node to animate */
  nodeRef: React.RefObject<Konva.Node>;
  /** Scale configuration */
  config: Omit<ScalePrimitiveConfig, 'type'>;
  /** Called when animation completes */
  onComplete?: () => void;
  /** Called on each frame with progress */
  onProgress?: (progress: AnimationProgress) => void;
  /** Whether to scale X and Y independently (default: false) */
  nonUniform?: boolean;
  /** Minimum scale constraint (default: 0.01) */
  minScale?: number;
  /** Maximum scale constraint (default: 10) */
  maxScale?: number;
  /** Scale origin point (default: node center) */
  origin?: Point;
}

const ScaleComponent = ({
  nodeRef,
  config,
  onComplete,
  onProgress,
  nonUniform = false,
  minScale = 0.01,
  maxScale = 10,
  origin,
}: ScaleProps) => {
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

    // Set scale origin if provided
    if (origin) {
      node.offsetX(origin.x);
      node.offsetY(origin.y);
    }

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

      // Calculate scale with constraints
      const scale = Math.max(
        minScale,
        Math.min(maxScale, lerp(config.fromScale, config.toScale, easedProgress))
      );

      // Update node scale
      if (nonUniform) {
        // Independent X/Y scaling
        node.scaleX(scale);
        node.scaleY(scale);
      } else {
        // Uniform scaling
        node.scale({ x: scale, y: scale });
      }

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
        // Ensure final scale is exact
        const finalScale = Math.max(minScale, Math.min(maxScale, config.toScale));
        if (nonUniform) {
          node.scaleX(finalScale);
          node.scaleY(finalScale);
        } else {
          node.scale({ x: finalScale, y: finalScale });
        }
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
  }, [nodeRef, config, onComplete, onProgress, nonUniform, minScale, maxScale, origin]);

  return null;
};

export const Scale = memo(ScaleComponent);
