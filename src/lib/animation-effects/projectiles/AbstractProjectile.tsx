/**
 * Abstract projectile component
 *
 * A configurable projectile that can transform during flight with support for:
 * - Generic visual representation (shapes)
 * - Motion path integration
 * - Effect attachment (trail, glow, pulse)
 * - Runtime mutations (appearance transformations)
 * - Multi-phase lifecycle (spawn → travel → impact)
 */

import React, { memo, useRef, useEffect } from 'react';
import { Group, Circle, RegularPolygon, Rect, Star, Line } from 'react-konva';
import Konva from 'konva';
import type { AbstractProjectileConfig, ProjectileState } from '../types/projectiles';
import { createLinearMotion } from '../motion/LinearMotion';
import { distance } from '../utils/math';
import { processMutations } from './ProjectileMutator';

export interface AbstractProjectileProps {
  /** Projectile configuration */
  config: AbstractProjectileConfig;
}

/**
 * Abstract projectile component
 * Renders a configurable projectile with motion, effects, and mutations
 */
const AbstractProjectileComponent: React.FC<AbstractProjectileProps> = ({ config }) => {
  const groupRef = useRef<Konva.Group>(null);
  const projectileRef = useRef<Konva.Shape>(null);
  const trailRef = useRef<Konva.Line>(null);
  const glowRef = useRef<Konva.Circle>(null);
  const animationRef = useRef<Konva.Animation | null>(null);
  const hasStartedRef = useRef(false);

  // State tracking
  const stateRef = useRef<ProjectileState>({
    position: { ...config.from },
    progress: 0,
    elapsedTime: 0,
    distanceTraveled: 0,
    currentShape: config.shape,
    currentColor: config.color,
    currentSize: config.size ?? 10,
    currentEffects: config.effects ?? [],
    appliedMutations: new Set(),
  });

  useEffect(() => {
    if (!groupRef.current || hasStartedRef.current) return;
    hasStartedRef.current = true;

    const group = groupRef.current;
    const projectile = projectileRef.current;

    if (!projectile) return;

    // Use provided motion generator or default to linear
    const motionGenerator = config.motion ?? createLinearMotion(config.from, config.to);

    // Calculate total distance for distance-based triggers
    const totalDistance = distance(config.from, config.to);

    // Position group at start
    group.position(config.from);
    group.visible(true);

    // Configure trail if enabled
    const trailPoints: number[] = [];
    const maxTrailLength = 8;
    const hasTrail = stateRef.current.currentEffects.includes('trail');

    // Configure glow if enabled
    const hasGlow = stateRef.current.currentEffects.includes('glow');
    if (glowRef.current && hasGlow) {
      glowRef.current.visible(true);
    }

    // Animation setup
    const startTime = Date.now();
    const duration = config.duration ?? 1000;
    const delay = config.delay ?? 0;

    const anim = new Konva.Animation((frame) => {
      if (!frame) return;

      const elapsed = Date.now() - startTime - delay;
      if (elapsed < 0) return; // Still in delay period

      const progress = Math.min(elapsed / duration, 1);
      const state = stateRef.current;

      // Update state
      state.progress = progress;
      state.elapsedTime = elapsed;
      state.distanceTraveled = totalDistance * progress;

      // Get position from motion generator
      const position = motionGenerator(progress);
      state.position = position;

      // Process mutations
      if (config.mutations && config.mutations.length > 0) {
        processMutations(state, config.mutations, config.from, config.onMutate);
      }

      // Update projectile position (relative to group)
      const relativeX = position.x - config.from.x;
      const relativeY = position.y - config.from.y;
      projectile.x(relativeX);
      projectile.y(relativeY);

      // Update projectile appearance from state
      projectile.fill(state.currentColor);
      projectile.visible(true);

      // Update size (accounting for current state)
      const baseScale = state.currentSize / (config.size ?? 10);
      projectile.scaleX(baseScale);
      projectile.scaleY(baseScale);

      // Apply pulse effect if enabled
      if (state.currentEffects.includes('pulse')) {
        const pulseScale = 1 + Math.sin(elapsed * 0.005) * 0.15;
        projectile.scaleX(baseScale * pulseScale);
        projectile.scaleY(baseScale * pulseScale);
      }

      // Update trail
      if (trailRef.current && state.currentEffects.includes('trail')) {
        trailPoints.push(relativeX, relativeY);
        if (trailPoints.length > maxTrailLength * 2) {
          trailPoints.splice(0, 2);
        }
        trailRef.current.points([...trailPoints]);
        trailRef.current.stroke(state.currentColor);
        trailRef.current.opacity(Math.max(0, 0.6 - progress * 0.3));
        trailRef.current.visible(true);
      } else if (trailRef.current && !hasTrail) {
        trailRef.current.visible(false);
      }

      // Update glow
      if (glowRef.current && state.currentEffects.includes('glow')) {
        glowRef.current.x(relativeX);
        glowRef.current.y(relativeY);
        glowRef.current.radius(state.currentSize * 2);
        glowRef.current.fill(state.currentColor);
        glowRef.current.opacity(0.3);
        glowRef.current.visible(true);
      } else if (glowRef.current && !hasGlow) {
        glowRef.current.visible(false);
      }

      // Flash effect
      if (state.currentEffects.includes('flash')) {
        const flashOpacity = Math.sin(elapsed * 0.02) > 0.5 ? 1 : 0.7;
        projectile.opacity(flashOpacity);
      }

      // Progress callback
      config.onProgress?.(progress, position);

      // Check completion
      if (progress >= 1) {
        anim.stop();

        // Fade out effect
        projectile.to({
          opacity: 0,
          scaleX: baseScale * 1.5,
          scaleY: baseScale * 1.5,
          duration: 0.15,
          onFinish: () => {
            group.visible(false);
            config.onComplete?.();
          },
        });
      }
    });

    animationRef.current = anim;
    anim.start();

    // Cleanup
    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
        animationRef.current = null;
      }
    };
  }, [config]);

  /**
   * Render the projectile shape based on current state
   */
  const renderProjectileShape = () => {
    const state = stateRef.current;
    const size = state.currentSize;
    const color = state.currentColor;

    switch (state.currentShape) {
      case 'circle':
        return (
          <Circle
            ref={projectileRef as React.Ref<Konva.Circle>}
            radius={size}
            fill={color}
            opacity={0.9}
            shadowColor={color}
            shadowBlur={10}
            shadowOpacity={0.5}
          />
        );

      case 'triangle':
        return (
          <RegularPolygon
            ref={projectileRef as React.Ref<Konva.RegularPolygon>}
            sides={3}
            radius={size}
            fill={color}
            opacity={0.9}
            shadowColor={color}
            shadowBlur={10}
            shadowOpacity={0.5}
          />
        );

      case 'rectangle':
        return (
          <Rect
            ref={projectileRef as React.Ref<Konva.Rect>}
            width={size * 2}
            height={size}
            offsetX={size}
            offsetY={size / 2}
            fill={color}
            opacity={0.9}
            shadowColor={color}
            shadowBlur={10}
            shadowOpacity={0.5}
          />
        );

      case 'star':
        return (
          <Star
            ref={projectileRef as React.Ref<Konva.Star>}
            numPoints={5}
            innerRadius={size * 0.5}
            outerRadius={size}
            fill={color}
            opacity={0.9}
            shadowColor={color}
            shadowBlur={15}
            shadowOpacity={0.6}
          />
        );

      case 'custom':
        // Default to circle for custom (users can extend this)
        return (
          <Circle
            ref={projectileRef as React.Ref<Konva.Circle>}
            radius={size}
            fill={color}
            opacity={0.9}
          />
        );

      default:
        const _exhaustive: never = state.currentShape;
        return _exhaustive;
    }
  };

  return (
    <Group ref={groupRef} visible={false}>
      {/* Glow effect layer */}
      <Circle
        ref={glowRef}
        radius={stateRef.current.currentSize * 2}
        fill={stateRef.current.currentColor}
        opacity={0.3}
        visible={false}
      />

      {/* Trail effect */}
      <Line
        ref={trailRef}
        points={[]}
        stroke={stateRef.current.currentColor}
        strokeWidth={3}
        lineCap="round"
        lineJoin="round"
        opacity={0.5}
        visible={false}
      />

      {/* Projectile shape */}
      {renderProjectileShape()}
    </Group>
  );
};

export const AbstractProjectile = memo(AbstractProjectileComponent);
