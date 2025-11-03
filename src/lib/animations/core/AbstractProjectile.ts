/**
 * Abstract Projectile Animation
 *
 * Base class for all projectile-based animations (arrows, fireballs, magic missiles, etc.)
 * Handles motion along a path from source to target with optional effects.
 *
 * Features:
 * - Motion path generation (linear, curved, arc, etc.)
 * - Trail effects
 * - Impact bursts
 * - Range limiting
 * - Target tracking
 */

import type { ProjectileAnimation, Point, MotionPathGenerator } from '../types'
import { createMotionFromConfig, calculateDistance } from '../utils/motion'
import { nanoid } from 'nanoid'

export type ProjectileConfig = Partial<Omit<ProjectileAnimation, 'id' | 'category'>> & {
  name: string
  fromPosition: Point
  toPosition: Point
}

export abstract class AbstractProjectile {
  // Animation configuration
  protected animation: ProjectileAnimation

  // Motion generator
  protected motionGenerator: MotionPathGenerator

  // Animation state
  protected isPlaying: boolean = false
  protected startTime: number = 0
  protected currentProgress: number = 0

  // Animation frame request
  protected animationFrame: number | null = null

  constructor(config: ProjectileConfig) {
    // Create full animation configuration
    this.animation = this.createAnimation(config)

    // Create motion path generator
    this.motionGenerator = createMotionFromConfig(this.animation.motionPath)
  }

  /**
   * Create animation configuration from partial config
   */
  protected createAnimation(config: ProjectileConfig): ProjectileAnimation {
    const {
      name,
      fromPosition,
      toPosition,
      duration = 1000,
      color = '#FFFFFF',
      size = 10,
      speed = 500,
      opacity = 1,
      rotateToDirection = true,
      ...rest
    } = config

    // Calculate duration from speed if not provided
    const distance = calculateDistance(fromPosition, toPosition)
    const calculatedDuration = duration || (distance / speed) * 1000

    return {
      id: nanoid(),
      category: 'projectile',
      name,
      fromPosition,
      toPosition,
      duration: calculatedDuration,
      color,
      size,
      speed,
      opacity,
      rotateToDirection,
      motionPath: rest.motionPath || {
        type: 'linear',
        startPosition: fromPosition,
        endPosition: toPosition,
        duration: calculatedDuration
      },
      ...rest
    }
  }

  /**
   * Get current animation configuration
   */
  public getAnimation(): ProjectileAnimation {
    return { ...this.animation }
  }

  /**
   * Get current position based on progress
   */
  public getCurrentPosition(): Point {
    return this.motionGenerator(this.currentProgress)
  }

  /**
   * Get current progress (0-1)
   */
  public getProgress(): number {
    return this.currentProgress
  }

  /**
   * Check if animation is playing
   */
  public isAnimating(): boolean {
    return this.isPlaying
  }

  /**
   * Start the animation
   */
  public play(): void {
    if (this.isPlaying) return

    this.isPlaying = true
    this.startTime = Date.now()
    this.currentProgress = 0

    // Call lifecycle hook
    this.animation.onStart?.()

    // Start animation loop
    this.animate()
  }

  /**
   * Stop the animation
   */
  public stop(): void {
    this.isPlaying = false

    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = null
    }
  }

  /**
   * Reset animation to beginning
   */
  public reset(): void {
    this.stop()
    this.currentProgress = 0
    this.startTime = 0
  }

  /**
   * Animation loop (using requestAnimationFrame)
   */
  protected animate = (): void => {
    if (!this.isPlaying) return

    // Calculate progress
    const elapsed = Date.now() - this.startTime
    this.currentProgress = Math.min(elapsed / this.animation.duration, 1)

    // Update lifecycle hook
    this.animation.onUpdate?.(this.currentProgress)

    // Check if animation completed
    if (this.currentProgress >= 1) {
      this.handleComplete()
      return
    }

    // Continue animation
    this.animationFrame = requestAnimationFrame(this.animate)
  }

  /**
   * Handle animation completion
   */
  protected handleComplete(): void {
    this.isPlaying = false
    this.currentProgress = 1

    // Trigger impact effect if configured
    if (this.animation.impactEffect) {
      const impactPosition = this.getCurrentPosition()
      this.animation.onImpact?.(impactPosition)
    }

    // Call lifecycle hook
    this.animation.onComplete?.()
  }

  /**
   * Calculate rotation angle based on direction of movement
   */
  protected calculateRotation(): number {
    if (!this.animation.rotateToDirection) return 0

    // Get current and next position to determine direction
    const currentPos = this.motionGenerator(this.currentProgress)
    const nextProgress = Math.min(this.currentProgress + 0.01, 1)
    const nextPos = this.motionGenerator(nextProgress)

    const dx = nextPos.x - currentPos.x
    const dy = nextPos.y - currentPos.y

    return Math.atan2(dy, dx)
  }

  /**
   * Check if range limit is exceeded
   */
  protected isWithinRange(): boolean {
    if (!this.animation.maxRange) return true

    const distance = calculateDistance(
      this.animation.fromPosition,
      this.animation.toPosition
    )

    // Assuming 1 unit = 5 feet (D&D standard)
    const FEET_PER_UNIT = 5
    const distanceInFeet = (distance / 50) * FEET_PER_UNIT // 50 pixels = 1 grid cell

    return distanceInFeet <= this.animation.maxRange
  }

  /**
   * Update target position (for homing projectiles)
   */
  public updateTarget(newTarget: Point): void {
    if (!this.animation.trackTarget) return

    this.animation.toPosition = newTarget

    // Recreate motion path with new target
    this.animation.motionPath.endPosition = newTarget
    this.motionGenerator = createMotionFromConfig(this.animation.motionPath)
  }

  /**
   * Clean up resources
   */
  public destroy(): void {
    this.stop()
  }
}
