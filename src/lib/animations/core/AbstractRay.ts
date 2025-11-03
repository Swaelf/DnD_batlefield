/**
 * Abstract Ray Animation
 *
 * Base class for beam/ray attacks (Ray of Frost, Scorching Ray, Eldritch Blast, etc.)
 * Handles continuous beam effects from source to target with visual effects.
 *
 * Features:
 * - Instant beam appearance
 * - Multiple ray patterns (single, split, jagged)
 * - Flickering/flowing effects
 * - Tapering (thick to thin)
 * - Multi-ray support (Scorching Ray)
 */

import type { RayAnimation, Point } from '../types'
import { calculateAngle, calculateDistance } from '../utils/motion'
import { nanoid } from 'nanoid'

export type RayConfig = Partial<Omit<RayAnimation, 'id' | 'category'>> & {
  name: string
  fromPosition: Point
  toPosition: Point
}

export abstract class AbstractRay {
  // Animation configuration
  protected animation: RayAnimation

  // Animation state
  protected isPlaying: boolean = false
  protected startTime: number = 0
  protected currentProgress: number = 0
  protected flickerOffset: number = 0

  // Animation frame request
  protected animationFrame: number | null = null

  constructor(config: RayConfig) {
    this.animation = this.createAnimation(config)
  }

  /**
   * Create animation configuration from partial config
   */
  protected createAnimation(config: RayConfig): RayAnimation {
    const {
      name,
      fromPosition,
      toPosition,
      duration = 500, // Ray duration (how long beam persists)
      width = 10,
      color = '#FFFFFF',
      size = width,
      opacity = 1,
      segments = 1, // Number of beam segments for jagged rays
      taper = false,
      flickering = false,
      flowing = false,
      expanding = false,
      rayCount = 1,
      spread = 15, // Degrees between rays
      ...rest
    } = config

    return {
      id: nanoid(),
      category: 'ray',
      name,
      fromPosition,
      toPosition,
      duration,
      width,
      color,
      size,
      opacity,
      segments,
      taper,
      flickering,
      flowing,
      expanding,
      rayCount,
      spread,
      ...rest
    }
  }

  /**
   * Get current animation configuration
   */
  public getAnimation(): RayAnimation {
    return { ...this.animation }
  }

  /**
   * Get current width (with optional expanding)
   */
  public getCurrentWidth(): number {
    if (!this.animation.expanding) {
      return this.animation.width
    }

    // Expanding: width pulses
    const pulseSpeed = 3
    const time = (Date.now() - this.startTime) / 1000
    const pulse = Math.sin(time * pulseSpeed) * 0.3 + 1
    return this.animation.width * pulse
  }

  /**
   * Get current opacity (with optional flickering)
   */
  public getCurrentOpacity(): number {
    if (!this.animation.flickering) {
      return this.animation.opacity || 1
    }

    // Flickering: opacity varies randomly
    const time = (Date.now() - this.startTime) / 1000
    const flicker = Math.sin(time * 20 + this.flickerOffset) * 0.2 + 0.8
    return (this.animation.opacity || 1) * flicker
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
    this.flickerOffset = Math.random() * Math.PI * 2

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

    // Call lifecycle hook
    this.animation.onComplete?.()
  }

  /**
   * Get ray path segments (for jagged rays)
   */
  public getRaySegments(): Point[] {
    const { fromPosition, toPosition, segments = 1 } = this.animation

    if (segments === 1) {
      // Straight beam
      return [fromPosition, toPosition]
    }

    // Jagged beam with multiple segments
    const points: Point[] = [fromPosition]
    const dx = toPosition.x - fromPosition.x
    const dy = toPosition.y - fromPosition.y

    for (let i = 1; i < segments; i++) {
      const t = i / segments
      const baseX = fromPosition.x + dx * t
      const baseY = fromPosition.y + dy * t

      // Add random offset perpendicular to beam direction
      const perpX = -dy
      const perpY = dx
      const length = Math.sqrt(perpX * perpX + perpY * perpY)
      const normalizedPerpX = perpX / length
      const normalizedPerpY = perpY / length

      const offsetAmount = (Math.random() - 0.5) * this.animation.width * 2

      points.push({
        x: baseX + normalizedPerpX * offsetAmount,
        y: baseY + normalizedPerpY * offsetAmount
      })
    }

    points.push(toPosition)
    return points
  }

  /**
   * Get width at a specific point along the ray (for tapering)
   */
  public getWidthAtPoint(progress: number): number {
    const currentWidth = this.getCurrentWidth()

    if (!this.animation.taper) {
      return currentWidth
    }

    // Taper from full width at start to thin at end
    return currentWidth * (1 - progress * 0.7) // Reduces to 30% at end
  }

  /**
   * Get positions for multi-ray patterns
   */
  public getMultiRayPositions(): Array<{ from: Point; to: Point }> {
    const { fromPosition, toPosition, rayCount = 1, spread = 15 } = this.animation

    if (rayCount === 1) {
      return [{ from: fromPosition, to: toPosition }]
    }

    const rays: Array<{ from: Point; to: Point }> = []
    const baseAngle = calculateAngle(fromPosition, toPosition)
    const distance = calculateDistance(fromPosition, toPosition)
    const spreadRad = (spread * Math.PI) / 180

    for (let i = 0; i < rayCount; i++) {
      // Calculate angle offset for this ray
      const offset = spreadRad * (i - (rayCount - 1) / 2)
      const angle = baseAngle + offset

      const to = {
        x: fromPosition.x + Math.cos(angle) * distance,
        y: fromPosition.y + Math.sin(angle) * distance
      }

      rays.push({ from: fromPosition, to })
    }

    return rays
  }

  /**
   * Generate particle positions for flowing effect
   */
  public getFlowingParticles(particleCount: number = 10): Point[] {
    if (!this.animation.flowing) {
      return []
    }

    const particles: Point[] = []
    const { fromPosition, toPosition } = this.animation
    const time = (Date.now() - this.startTime) / 1000

    for (let i = 0; i < particleCount; i++) {
      // Particles flow along the beam
      const baseProgress = ((time * 2 + i / particleCount) % 1)
      const progress = baseProgress

      const x = fromPosition.x + (toPosition.x - fromPosition.x) * progress
      const y = fromPosition.y + (toPosition.y - fromPosition.y) * progress

      particles.push({ x, y })
    }

    return particles
  }

  /**
   * Update target position (for moving targets)
   */
  public updateTarget(newTarget: Point): void {
    this.animation.toPosition = newTarget
  }

  /**
   * Clean up resources
   */
  public destroy(): void {
    this.stop()
  }
}
