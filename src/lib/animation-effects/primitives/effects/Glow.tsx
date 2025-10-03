/**
 * Glow primitive - RAF-based radial glow/shadow effect
 *
 * Adds a pulsing glow effect around an object by manipulating
 * Konva shadow properties with optional pulse animation.
 */

import { memo, useEffect, useRef } from 'react';
import type Konva from 'konva';
import type { GlowPrimitiveConfig, AnimationProgress } from '../../types';
import { DEFAULT_EASING, DEFAULT_GLOW } from '../../constants/defaults';
import { lerp } from '../../utils/math';

interface GlowProps {
  /** Konva node to apply glow to (must be a Shape for shadow properties) */
  nodeRef: React.RefObject<Konva.Shape>;
  /** Glow configuration */
  config: Omit<GlowPrimitiveConfig, 'type'>;
  /** Called when animation completes */
  onComplete?: () => void;
  /** Called on each frame with progress */
  onProgress?: (progress: AnimationProgress) => void;
}

const GlowComponent = ({ nodeRef, config, onComplete, onProgress }: GlowProps) => {
  const hasStartedRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);
  const originalShadowRef = useRef<{
    color: string;
    blur: number;
    opacity: number;
    offset: { x: number; y: number };
  } | null>(null);

  useEffect(() => {
    if (!nodeRef.current || hasStartedRef.current) return;
    hasStartedRef.current = true;

    const node = nodeRef.current;
    const duration = config.duration;
    const delay = config.delay || 0;
    const easing = config.easing || DEFAULT_EASING;
    const startTime = Date.now() + delay;

    const radius = config.radius || DEFAULT_GLOW.radius;
    const intensity = config.intensity || DEFAULT_GLOW.intensity;
    const pulseConfig = config.pulse;

    // Store original shadow properties for restoration
    originalShadowRef.current = {
      color: node.shadowColor(),
      blur: node.shadowBlur(),
      opacity: node.shadowOpacity(),
      offset: { x: node.shadowOffsetX(), y: node.shadowOffsetY() },
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

      // Calculate glow intensity
      let currentIntensity = intensity;

      // Apply pulse effect if enabled
      if (pulseConfig?.enabled) {
        const pulseSpeed = pulseConfig.speed || 1;
        const pulseRange = pulseConfig.range || [0.5, 1.0];
        const pulseValue = Math.sin(elapsed * 0.001 * pulseSpeed * Math.PI * 2);
        const pulseFactor = lerp(pulseRange[0], pulseRange[1], (pulseValue + 1) * 0.5);
        currentIntensity *= pulseFactor;
      }

      // Apply glow using shadow properties
      node.shadowColor(config.color);
      node.shadowBlur(radius * currentIntensity);
      node.shadowOpacity(currentIntensity);
      node.shadowOffsetX(0);
      node.shadowOffsetY(0);

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
        // Restore original shadow properties
        if (originalShadowRef.current) {
          node.shadowColor(originalShadowRef.current.color);
          node.shadowBlur(originalShadowRef.current.blur);
          node.shadowOpacity(originalShadowRef.current.opacity);
          node.shadowOffsetX(originalShadowRef.current.offset.x);
          node.shadowOffsetY(originalShadowRef.current.offset.y);
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

      // Restore original shadow
      if (originalShadowRef.current && nodeRef.current) {
        const node = nodeRef.current;
        node.shadowColor(originalShadowRef.current.color);
        node.shadowBlur(originalShadowRef.current.blur);
        node.shadowOpacity(originalShadowRef.current.opacity);
        node.shadowOffsetX(originalShadowRef.current.offset.x);
        node.shadowOffsetY(originalShadowRef.current.offset.y);
        node.getLayer()?.batchDraw();
      }
    };
  }, [nodeRef, config, onComplete, onProgress]);

  return null;
};

export const Glow = memo(GlowComponent);
