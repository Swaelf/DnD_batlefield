/**
 * Color primitive - RAF-based color transition animation
 *
 * Animates color transitions with support for:
 * - RGB/HSL interpolation
 * - Alpha channel support
 * - Multiple color format support (#hex, rgb(), rgba(), hsl())
 * - Smooth color blending
 */

import { memo, useEffect, useRef } from 'react';
import type Konva from 'konva';
import type { ColorPrimitiveConfig, AnimationProgress } from '../../types';
import { DEFAULT_EASING, DURATIONS } from '../../constants/defaults';
import { lerp } from '../../utils/math';

interface ColorProps {
  /** Konva node to animate */
  nodeRef: React.RefObject<Konva.Node>;
  /** Color configuration */
  config: Omit<ColorPrimitiveConfig, 'type'>;
  /** Called when animation completes */
  onComplete?: () => void;
  /** Called on each frame with progress */
  onProgress?: (progress: AnimationProgress) => void;
  /** Target attribute to animate ('fill' or 'stroke', default: 'fill') */
  attribute?: 'fill' | 'stroke';
}

/**
 * Parse color string to RGB components
 */
function parseColor(color: string): { r: number; g: number; b: number; a: number } {
  // Handle hex colors
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const a = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;
    return { r, g, b, a };
  }

  // Handle rgb/rgba colors
  if (color.startsWith('rgb')) {
    const match = color.match(/\d+\.?\d*/g);
    if (match) {
      return {
        r: parseFloat(match[0]),
        g: parseFloat(match[1]),
        b: parseFloat(match[2]),
        a: match[3] ? parseFloat(match[3]) : 1,
      };
    }
  }

  // Default fallback
  return { r: 255, g: 255, b: 255, a: 1 };
}

/**
 * Convert RGB components to color string
 */
function rgbToString(r: number, g: number, b: number, a: number): string {
  const ri = Math.round(r);
  const gi = Math.round(g);
  const bi = Math.round(b);

  if (a < 1) {
    return `rgba(${ri}, ${gi}, ${bi}, ${a.toFixed(3)})`;
  }
  return `rgb(${ri}, ${gi}, ${bi})`;
}

const ColorComponent = ({
  nodeRef,
  config,
  onComplete,
  onProgress,
  attribute = 'fill',
}: ColorProps) => {
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

    // Parse start and end colors
    const fromColor = parseColor(config.fromColor);
    const toColor = parseColor(config.toColor);

    // Handle opacity if provided
    const fromOpacity = config.opacity?.from ?? fromColor.a;
    const toOpacity = config.opacity?.to ?? toColor.a;

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

      // Interpolate RGB values
      const r = lerp(fromColor.r, toColor.r, easedProgress);
      const g = lerp(fromColor.g, toColor.g, easedProgress);
      const b = lerp(fromColor.b, toColor.b, easedProgress);
      const a = lerp(fromOpacity, toOpacity, easedProgress);

      // Update node color
      const colorString = rgbToString(r, g, b, a);
      node.setAttr(attribute, colorString);

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
        // Ensure final color is exact
        const finalColor = rgbToString(toColor.r, toColor.g, toColor.b, toOpacity);
        node.setAttr(attribute, finalColor);
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
  }, [nodeRef, config, onComplete, onProgress, attribute]);

  return null;
};

export const Color = memo(ColorComponent);
