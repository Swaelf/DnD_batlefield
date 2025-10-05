/**
 * Particles primitive - RAF-based particle emission system
 *
 * Creates particle effects with configurable emission patterns,
 * physics (gravity, velocity), and lifecycle management.
 * Uses object pooling for performance.
 */

import { memo, useEffect, useRef, useState } from 'react';
import { Group, Circle } from 'react-konva';
import type { ParticlesPrimitiveConfig, AnimationProgress } from '../../types';
import { DEFAULT_EASING, DEFAULT_PARTICLES } from '../../constants/defaults';
import { Point } from '@/types';

interface ParticlesProps {
  /** Origin position for particle emission */
  position: Point;
  /** Particles configuration */
  config: Omit<ParticlesPrimitiveConfig, 'type'>;
  /** Called when animation completes */
  onComplete?: () => void;
  /** Called on each frame with progress */
  onProgress?: (progress: AnimationProgress) => void;
}

interface Particle {
  id: string;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  size: number;
  color: string;
  opacity: number;
  lifetime: number;
  age: number;
}

/**
 * Simple object pool for particle reuse
 */
class ParticlePool {
  private pool: Particle[] = [];
  private maxSize = 200;

  acquire(
    x: number,
    y: number,
    velocityX: number,
    velocityY: number,
    size: number,
    color: string,
    lifetime: number
  ): Particle {
    const particle = this.pool.pop() || this.createParticle();

    // Reset particle properties
    particle.id = Math.random().toString(36).substring(7);
    particle.x = x;
    particle.y = y;
    particle.velocityX = velocityX;
    particle.velocityY = velocityY;
    particle.size = size;
    particle.color = color;
    particle.opacity = 1;
    particle.lifetime = lifetime;
    particle.age = 0;

    return particle;
  }

  release(particle: Particle): void {
    if (this.pool.length < this.maxSize) {
      this.pool.push(particle);
    }
  }

  private createParticle(): Particle {
    return {
      id: '',
      x: 0,
      y: 0,
      velocityX: 0,
      velocityY: 0,
      size: 0,
      color: '#ffffff',
      opacity: 1,
      lifetime: 0,
      age: 0,
    };
  }
}

const particlePool = new ParticlePool();

const ParticlesComponent = ({ position, config, onComplete, onProgress }: ParticlesProps) => {
  const hasStartedRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);
  const lastEmissionRef = useRef(0);
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    const duration = config.duration;
    const delay = config.delay || 0;
    const easing = config.easing || DEFAULT_EASING;
    const startTime = Date.now() + delay;

    const emissionRate = config.emissionRate || DEFAULT_PARTICLES.emissionRate;
    const particleLifetime = config.particleLifetime || DEFAULT_PARTICLES.lifetime;
    const colors = config.colors || ['#ffffff'];
    const sizeRange = config.sizeRange || DEFAULT_PARTICLES.sizeRange;
    const velocityRange = config.velocityRange;
    const gravity = config.gravity || { x: 0, y: 0 };

    const emissionInterval = 1000 / emissionRate; // milliseconds per particle

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

      // Emit new particles
      if (now - lastEmissionRef.current >= emissionInterval && rawProgress < 1) {
        lastEmissionRef.current = now;

        setParticles((prev) => {
          // Create new particle
          const size = sizeRange[0] + Math.random() * (sizeRange[1] - sizeRange[0]);
          const color = colors[Math.floor(Math.random() * colors.length)];

          const velocityX =
            velocityRange.min.x + Math.random() * (velocityRange.max.x - velocityRange.min.x);
          const velocityY =
            velocityRange.min.y + Math.random() * (velocityRange.max.y - velocityRange.min.y);

          const newParticle = particlePool.acquire(
            position.x,
            position.y,
            velocityX,
            velocityY,
            size,
            color,
            particleLifetime
          );

          return [...prev, newParticle];
        });
      }

      // Update all particles
      setParticles((prev) => {
        const deltaTime = 1000 / 60; // Assume 60fps for physics
        const aliveParticles: Particle[] = [];

        prev.forEach((particle) => {
          // Update age
          particle.age += deltaTime;

          // Check if particle is still alive
          if (particle.age >= particle.lifetime) {
            particlePool.release(particle);
            return;
          }

          // Update physics
          particle.velocityX += gravity.x * (deltaTime / 1000);
          particle.velocityY += gravity.y * (deltaTime / 1000);
          particle.x += particle.velocityX * (deltaTime / 1000);
          particle.y += particle.velocityY * (deltaTime / 1000);

          // Update opacity (fade out over lifetime)
          particle.opacity = 1 - particle.age / particle.lifetime;

          aliveParticles.push(particle);
        });

        return aliveParticles;
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
      if (rawProgress < 1 || particles.length > 0) {
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

      // Release all particles back to pool
      particles.forEach((particle) => particlePool.release(particle));
    };
  }, [position, config, onComplete, onProgress, particles.length]);

  return (
    <Group listening={false}>
      {particles.map((particle) => (
        <Circle
          key={particle.id}
          x={particle.x}
          y={particle.y}
          radius={particle.size}
          fill={particle.color}
          opacity={particle.opacity}
          listening={false}
        />
      ))}
    </Group>
  );
};

export const Particles = memo(ParticlesComponent);
