/**
 * Pulse primitive - RAF-based rhythmic pulsing effect
 *
 * Creates a continuous pulsing effect by animating scale and/or opacity
 * with configurable frequency and range.
 */

import { memo, useEffect, useRef } from 'react';
import type Konva from 'konva';
import type { PulsePrimitiveConfig, AnimationProgress } from '../../types';
import { DEFAULT_EASING, DEFAULT_PULSE } from '../../constants/defaults';
import { lerp } from '../../utils/math';

interface PulseProps {
  /** Konva node to pulse */
  nodeRef: React.RefObject<Konva.Node>;
  /** Pulse configuration */
  config: Omit<PulsePrimitiveConfig, 'type'>;
  /** Called when animation completes */
  onComplete?: () => void;
  /** Called on each frame with progress */
  onProgress?: (progress: AnimationProgress) => void;
}

const PulseComponent = ({ nodeRef, config, onComplete, onProgress }: PulseProps) => {
  const hasStartedRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);
  const originalPropsRef = useRef<{
    scaleX: number;
    scaleY: number;
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

    const scaleRange = config.scaleRange || DEFAULT_PULSE.scaleRange;
    const opacityRange = config.opacityRange || DEFAULT_PULSE.opacityRange;
    const frequency = config.frequency || DEFAULT_PULSE.frequency;

    // Store original properties for restoration
    originalPropsRef.current = {
      scaleX: node.scaleX(),
      scaleY: node.scaleY(),
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

      // Calculate pulse value using sine wave
      // frequency is pulses per second, convert to radians
      const pulseTime = elapsed * 0.001; // Convert to seconds
      const pulsePhase = pulseTime * frequency * Math.PI * 2;
      const pulseValue = Math.sin(pulsePhase);

      // Map pulse value (-1 to 1) to our ranges (0 to 1)
      const t = (pulseValue + 1) * 0.5;

      // Apply scale pulse
      const scale = lerp(scaleRange[0], scaleRange[1], t);
      node.scaleX(scale);
      node.scaleY(scale);

      // Apply opacity pulse if configured
      if (opacityRange) {
        const opacity = lerp(opacityRange[0], opacityRange[1], t);
        node.opacity(opacity);
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
        // Restore original properties
        if (originalPropsRef.current) {
          node.scaleX(originalPropsRef.current.scaleX);
          node.scaleY(originalPropsRef.current.scaleY);
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
        node.scaleX(originalPropsRef.current.scaleX);
        node.scaleY(originalPropsRef.current.scaleY);
        node.opacity(originalPropsRef.current.opacity);
        node.getLayer()?.batchDraw();
      }
    };
  }, [nodeRef, config, onComplete, onProgress]);

  return null;
};

export const Pulse = memo(PulseComponent);
