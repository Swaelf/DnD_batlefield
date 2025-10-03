/**
 * Wave motion path generator
 *
 * Provides sine wave and oscillating movement patterns.
 * Useful for serpentine movement, vibration effects, and energy waves.
 */

import { Point } from '@/types';
import { lerp } from '../utils/math';

/**
 * Motion path generator function type
 */
export type MotionPathGenerator = (progress: number) => Point;

/**
 * Wave type variations
 */
export type WaveType = 'sine' | 'square' | 'triangle' | 'sawtooth';

/**
 * Configuration for wave motion
 */
export interface WaveConfig {
  /** Wave amplitude in pixels */
  amplitude: number;
  /** Wave frequency (complete waves over the path) */
  frequency: number;
  /** Wave type (default: 'sine') */
  waveType?: WaveType;
  /** Phase offset (0-1) */
  phase?: number;
  /** Wave axis ('perpendicular' | 'horizontal' | 'vertical') */
  axis?: 'perpendicular' | 'horizontal' | 'vertical';
}

/**
 * Create a sine wave motion path
 *
 * Moves from start to end while oscillating perpendicular to the path direction.
 * Creates smooth, natural-looking wave patterns.
 *
 * @param from - Starting point
 * @param to - Ending point
 * @param amplitude - Wave amplitude in pixels (distance from center line)
 * @param frequency - Number of complete waves over the path
 * @returns Function that generates wave path points
 *
 * @example
 * // Smooth sine wave with 3 complete oscillations
 * const wave = createSineWave(
 *   { x: 0, y: 100 },
 *   { x: 300, y: 100 },
 *   20,  // 20px amplitude
 *   3    // 3 complete waves
 * );
 */
export function createSineWave(
  from: Point,
  to: Point,
  amplitude: number,
  frequency: number
): MotionPathGenerator {
  // Calculate perpendicular direction
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist === 0) {
    return () => from;
  }

  // Perpendicular vector (rotated 90 degrees)
  const perpX = -dy / dist;
  const perpY = dx / dist;

  return (progress: number): Point => {
    const t = Math.max(0, Math.min(1, progress));

    // Base position along linear path
    const baseX = lerp(from.x, to.x, t);
    const baseY = lerp(from.y, to.y, t);

    // Wave offset perpendicular to path
    const waveOffset = amplitude * Math.sin(t * frequency * 2 * Math.PI);

    return {
      x: baseX + perpX * waveOffset,
      y: baseY + perpY * waveOffset,
    };
  };
}

/**
 * Create a configurable wave motion path
 *
 * Supports multiple wave types and axis configurations for versatile wave patterns.
 *
 * @param from - Starting point
 * @param to - Ending point
 * @param config - Wave configuration
 * @returns Function that generates wave path points
 *
 * @example
 * // Square wave with vertical oscillation
 * const wave = createWave(
 *   { x: 0, y: 100 },
 *   { x: 300, y: 100 },
 *   {
 *     amplitude: 20,
 *     frequency: 4,
 *     waveType: 'square',
 *     axis: 'vertical'
 *   }
 * );
 */
export function createWave(from: Point, to: Point, config: WaveConfig): MotionPathGenerator {
  const {
    amplitude,
    frequency,
    waveType = 'sine',
    phase = 0,
    axis = 'perpendicular',
  } = config;

  // Calculate direction vectors
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist === 0) {
    return () => from;
  }

  // Determine wave axis direction
  let offsetX: number;
  let offsetY: number;

  switch (axis) {
    case 'horizontal':
      offsetX = 1;
      offsetY = 0;
      break;
    case 'vertical':
      offsetX = 0;
      offsetY = 1;
      break;
    case 'perpendicular':
    default:
      // Perpendicular to path direction
      offsetX = -dy / dist;
      offsetY = dx / dist;
      break;
  }

  return (progress: number): Point => {
    const t = Math.max(0, Math.min(1, progress));

    // Base position along linear path
    const baseX = lerp(from.x, to.x, t);
    const baseY = lerp(from.y, to.y, t);

    // Calculate wave value based on type
    const waveInput = (t + phase) * frequency * 2 * Math.PI;
    const waveValue = calculateWaveValue(waveInput, waveType);
    const waveOffset = amplitude * waveValue;

    return {
      x: baseX + offsetX * waveOffset,
      y: baseY + offsetY * waveOffset,
    };
  };
}

/**
 * Calculate wave value for different wave types
 *
 * @param t - Input value (typically angle in radians)
 * @param waveType - Type of wave function
 * @returns Wave value between -1 and 1
 */
function calculateWaveValue(t: number, waveType: WaveType): number {
  switch (waveType) {
    case 'sine':
      return Math.sin(t);

    case 'square':
      // Square wave: alternates between -1 and 1
      return Math.sin(t) >= 0 ? 1 : -1;

    case 'triangle':
      // Triangle wave: linear interpolation between peaks
      const normalized = (t / (2 * Math.PI)) % 1;
      return normalized < 0.5 ? normalized * 4 - 1 : 3 - normalized * 4;

    case 'sawtooth':
      // Sawtooth wave: linear ramp from -1 to 1
      const sawNormalized = (t / (2 * Math.PI)) % 1;
      return sawNormalized * 2 - 1;

    default:
      return Math.sin(t);
  }
}

/**
 * Create a damped wave motion path
 *
 * Wave amplitude decreases over time, useful for vibration effects that settle.
 *
 * @param from - Starting point
 * @param to - Ending point
 * @param amplitude - Initial wave amplitude
 * @param frequency - Wave frequency
 * @param damping - Damping factor (0-1, higher = faster decay)
 * @returns Function that generates damped wave path points
 *
 * @example
 * // Vibration that settles over time
 * const dampedWave = createDampedWave(
 *   { x: 0, y: 100 },
 *   { x: 300, y: 100 },
 *   30,   // Start with 30px amplitude
 *   8,    // High frequency vibration
 *   0.8   // Fast damping
 * );
 */
export function createDampedWave(
  from: Point,
  to: Point,
  amplitude: number,
  frequency: number,
  damping: number = 0.5
): MotionPathGenerator {
  const baseGenerator = createSineWave(from, to, amplitude, frequency);

  return (progress: number): Point => {
    const t = Math.max(0, Math.min(1, progress));

    // Exponential decay of amplitude
    const dampingFactor = Math.exp(-damping * t * 5);
    const dampedProgress = t;

    const basePoint = baseGenerator(dampedProgress);

    // Apply damping to offset from linear path
    const linearX = lerp(from.x, to.x, t);
    const linearY = lerp(from.y, to.y, t);

    return {
      x: linearX + (basePoint.x - linearX) * dampingFactor,
      y: linearY + (basePoint.y - linearY) * dampingFactor,
    };
  };
}

/**
 * Legacy function for backward compatibility
 *
 * @deprecated Use createSineWave or createWave instead
 */
export function generateWavePath(
  start: Point,
  end: Point,
  amplitude: number,
  frequency: number,
  phase: number,
  progress: number
): Point {
  const generator = createWave(start, end, { amplitude, frequency, phase });
  return generator(progress);
}
