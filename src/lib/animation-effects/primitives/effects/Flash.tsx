/**
 * Flash primitive - RAF-based quick flash effect
 *
 * Creates a quick flash effect by rapidly changing opacity/color.
 * Supports multiple flashes with configurable intensity and easing.
 */

import { memo, useEffect, useRef } from 'react';
import type Konva from 'konva';
import type { FlashPrimitiveConfig, AnimationProgress } from '../../types';
import { DEFAULT_EASING } from '../../constants/defaults';
import { clamp } from '../../utils/math';

interface FlashProps {
  /** Konva node to flash */
  nodeRef: React.RefObject<Konva.Node>;
  /** Flash configuration */
  config: Omit<FlashPrimitiveConfig, 'type'>;
  /** Called when animation completes */
  onComplete?: () => void;
  /** Called on each frame with progress */
  onProgress?: (progress: AnimationProgress) => void;
}

const FlashComponent = ({ nodeRef, config, onComplete, onProgress }: FlashProps) => {
  const hasStartedRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);
  const originalPropsRef = useRef<{
    fill: string;
    opacity: number;
  } | null>(null);

  useEffect(() => {
    if (!nodeRef.current || hasStartedRef.current) return;
    hasStartedRef.current = true;

    const node = nodeRef.current;
    const duration = config.duration;
    const delay = config.delay || 0;
    const easing = config.easing || DEFAULT_EASING;
    const startTime = Date.now() + delay;

    const flashCount = config.count || 1;
    const flashIntensity = config.intensity || 1;
    const flashColor = config.color;

    // Store original properties for restoration
    const fillValue = (node as Konva.Shape).fill?.();
    originalPropsRef.current = {
      fill: typeof fillValue === 'string' ? fillValue : '#ffffff',
      opacity: node.opacity(),
    };

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

      // Calculate flash progress within current cycle
      const flashProgress = (rawProgress * flashCount) % 1;

      // Flash uses spike pattern: 0 -> peak -> 0
      // Use easing for smooth rise and fall
      let flashValue: number;
      if (flashProgress < 0.5) {
        // Rising: 0 to 1
        flashValue = easing(flashProgress * 2);
      } else {
        // Falling: 1 to 0
        flashValue = easing((1 - flashProgress) * 2);
      }

      // Apply flash intensity
      const opacity = clamp(flashValue * flashIntensity, 0, 1);

      // Apply flash color and opacity
      if (node instanceof Object && 'fill' in node && typeof node.fill === 'function') {
        (node as Konva.Shape).fill(flashColor);
      }
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
        // Restore original properties
        if (originalPropsRef.current) {
          if (node instanceof Object && 'fill' in node && typeof node.fill === 'function') {
            (node as Konva.Shape).fill(originalPropsRef.current.fill);
          }
          node.opacity(originalPropsRef.current.opacity);
          node.getLayer()?.batchDraw();
        }
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

      // Restore original properties
      if (originalPropsRef.current && nodeRef.current) {
        const node = nodeRef.current;
        if (node instanceof Object && 'fill' in node && typeof node.fill === 'function') {
          (node as Konva.Shape).fill(originalPropsRef.current.fill);
        }
        node.opacity(originalPropsRef.current.opacity);
        node.getLayer()?.batchDraw();
      }
    };
  }, [nodeRef, config, onComplete, onProgress]);

  return null;
};

export const Flash = memo(FlashComponent);
