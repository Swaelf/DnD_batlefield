/**
 * Trail primitive - RAF-based trailing line effect
 *
 * Creates a trailing line effect that follows an object's movement.
 * Automatically collects position points and fades older segments.
 */

import { memo, useEffect, useRef, useState } from 'react';
import { Line } from 'react-konva';
import type Konva from 'konva';
import type { TrailPrimitiveConfig, AnimationProgress } from '../../types';
import { DEFAULT_EASING, DEFAULT_TRAIL } from '../../constants/defaults';

interface TrailProps {
  /** Konva node being tracked */
  nodeRef: React.RefObject<Konva.Node>;
  /** Trail configuration */
  config: Omit<TrailPrimitiveConfig, 'type'>;
  /** Called when animation completes */
  onComplete?: () => void;
  /** Called on each frame with progress */
  onProgress?: (progress: AnimationProgress) => void;
}

interface TrailPoint {
  x: number;
  y: number;
  opacity: number;
}

const TrailComponent = ({ nodeRef, config, onComplete, onProgress }: TrailProps) => {
  const hasStartedRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);
  const [trailPoints, setTrailPoints] = useState<TrailPoint[]>([]);

  useEffect(() => {
    if (!nodeRef.current || hasStartedRef.current) return;
    hasStartedRef.current = true;

    const node = nodeRef.current;
    const duration = config.duration;
    const delay = config.delay || 0;
    const easing = config.easing || DEFAULT_EASING;
    const startTime = Date.now() + delay;
    const maxSegments = config.segments || DEFAULT_TRAIL.segments;
    const fadeRate = config.fadeRate || DEFAULT_TRAIL.fadeRate;

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

      // Get current node position
      const currentX = node.x();
      const currentY = node.y();

      // Update trail points
      setTrailPoints((prevPoints) => {
        // Add new point at full opacity
        const newPoint: TrailPoint = {
          x: currentX,
          y: currentY,
          opacity: 1,
        };

        // Fade existing points
        const fadedPoints = prevPoints
          .map((point) => ({
            ...point,
            opacity: Math.max(0, point.opacity - fadeRate),
          }))
          .filter((point) => point.opacity > 0);

        // Combine and limit to max segments
        const allPoints = [newPoint, ...fadedPoints];
        return allPoints.slice(0, maxSegments);
      });

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

  // Don't render if no trail points
  if (trailPoints.length === 0) return null;

  // Convert trail points to flat array of coordinates
  const points = trailPoints.flatMap((p) => [p.x, p.y]);

  // Use average opacity for the entire line
  const averageOpacity = trailPoints.reduce((sum, p) => sum + p.opacity, 0) / trailPoints.length;

  return (
    <Line
      points={points}
      stroke={config.color}
      strokeWidth={config.width || DEFAULT_TRAIL.width}
      opacity={averageOpacity}
      lineCap="round"
      lineJoin="round"
      tension={0.5} // Smoothing
      listening={false}
    />
  );
};

export const Trail = memo(TrailComponent);
