/**
 * Fade primitive - RAF-based opacity animation
 *
 * Animates opacity changes with support for:
 * - Fade in/out/to target opacity
 * - Respect existing opacity
 * - Layer-aware fading
 */

import { memo, useEffect, useRef } from 'react';
import type Konva from 'konva';
import type { BasePrimitiveConfig, AnimationProgress } from '../../types';
import { DEFAULT_EASING, DURATIONS } from '../../constants/defaults';
import { lerp, clamp } from '../../utils/math';

interface FadeConfig extends BasePrimitiveConfig {
  /** Starting opacity (0-1) */
  fromOpacity: number;
  /** Ending opacity (0-1) */
  toOpacity: number;
}

interface FadeProps {
  /** Konva node to animate */
  nodeRef: React.RefObject<Konva.Node>;
  /** Fade configuration */
  config: FadeConfig;
  /** Called when animation completes */
  onComplete?: () => void;
  /** Called on each frame with progress */
  onProgress?: (progress: AnimationProgress) => void;
}

const FadeComponent = ({ nodeRef, config, onComplete, onProgress }: FadeProps) => {
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

      // Calculate opacity with clamping (0-1)
      const opacity = clamp(lerp(config.fromOpacity, config.toOpacity, easedProgress), 0, 1);

      // Update node opacity
      node.opacity(opacity);

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
        // Ensure final opacity is exact
        node.opacity(clamp(config.toOpacity, 0, 1));
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
  }, [nodeRef, config, onComplete, onProgress]);

  return null;
};

export const Fade = memo(FadeComponent);

/**
 * Convenience helper: Fade In (0 -> 1)
 */
export function createFadeIn(duration?: number): FadeConfig {
  return {
    fromOpacity: 0,
    toOpacity: 1,
    duration: duration || DURATIONS.FAST,
  };
}

/**
 * Convenience helper: Fade Out (1 -> 0)
 */
export function createFadeOut(duration?: number): FadeConfig {
  return {
    fromOpacity: 1,
    toOpacity: 0,
    duration: duration || DURATIONS.FAST,
  };
}

/**
 * Convenience helper: Fade To (current -> target)
 */
export function createFadeTo(targetOpacity: number, duration?: number): FadeConfig {
  return {
    fromOpacity: 1, // Caller should get current opacity from node
    toOpacity: clamp(targetOpacity, 0, 1),
    duration: duration || DURATIONS.NORMAL,
  };
}
