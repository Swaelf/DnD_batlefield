/**
 * Abstract Burst Animation
 *
 * Base class for burst/explosion animations (Thunderwave, Shatter, explosions, etc.)
 * Handles expanding circles/shapes with optional shockwaves and screen shake.
 *
 * Features:
 * - Configurable burst shapes (circle, ring, square, star)
 * - Multi-phase animation (expansion, peak, fade)
 * - Shockwave effects
 * - Screen shake integration
 * - Particle emissions
 */

import type { BurstAnimation, Point } from '../types'
import { nanoid } from 'nanoid'

export type BurstConfig = Partial<Omit<BurstAnimation, 'id' | 'category'>> & {
  name: string
  position: Point
  radius: number
}

export abstract class AbstractBurst {
  // Animation configuration
  protected animation: BurstAnimation

  // Animation state
  protected isPlaying: boolean = false
  protected startTime: number = 0
  protected currentProgress: number = 0
  protected currentPhase: 'expansion' | 'peak' | 'fade' = 'expansion'

  // Animation frame request
  protected animationFrame: number | null = null

  constructor(config: BurstConfig) {
    this.animation = this.createAnimation(config)
  }

  /**
   * Create animation configuration from partial config
   */
  protected createAnimation(config: BurstConfig): BurstAnimation {
    const {
      name,
      position,
      radius,
      duration = 800,
      expansionDuration = 300,
      peakDuration = 200,
      fadeDuration = 300,
      shape = 'circle',
      color = '#FFFFFF',
      size = radius,
      opacity = 0.8,
      shockwave = false,
      shake,
      ...rest
    } = config

    return {
      id: nanoid(),
      category: 'burst',
      name,
      position,
      radius,
      shape,
      duration,
      expansionDuration,
      peakDuration,
      fadeDuration,
      color,
      size,
      opacity,
      shockwave,
      shake,
      ...rest
    }
  }

  /**
   * Get current animation configuration
   */
  public getAnimation(): BurstAnimation {
    return { ...this.animation }
  }

  /**
   * Get current radius based on animation phase
   */
  public getCurrentRadius(): number {
    const { expansionDuration, peakDuration, radius } = this.animation
    const totalExpansionTime = expansionDuration + (peakDuration || 0)
    const elapsed = Date.now() - this.startTime

    if (elapsed < expansionDuration) {
      // Expansion phase: 0 to full radius
      const expansionProgress = elapsed / expansionDuration
      return radius * this.easeOutCubic(expansionProgress)
    } else if (peakDuration && elapsed < totalExpansionTime) {
      // Peak phase: hold at full radius
      return radius
    } else {
      // Fade phase: maintain full radius while fading
      return radius
    }
  }

  /**
   * Get current opacity based on animation phase
   */
  public getCurrentOpacity(): number {
    const { expansionDuration, peakDuration, fadeDuration, opacity = 0.8 } = this.animation
    const totalExpansionTime = expansionDuration + (peakDuration || 0)
    const elapsed = Date.now() - this.startTime

    if (elapsed < expansionDuration) {
      // Expansion phase: fade in
      const expansionProgress = elapsed / expansionDuration
      return opacity * expansionProgress
    } else if (peakDuration && elapsed < totalExpansionTime) {
      // Peak phase: full opacity
      return opacity
    } else {
      // Fade phase: fade out
      const fadeElapsed = elapsed - totalExpansionTime
      const fadeProgress = fadeElapsed / (fadeDuration || 300)
      return opacity * (1 - fadeProgress)
    }
  }

  /**
   * Get current progress (0-1)
   */
  public getProgress(): number {
    return this.currentProgress
  }

  /**
   * Get current animation phase
   */
  public getPhase(): 'expansion' | 'peak' | 'fade' {
    return this.currentPhase
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
    this.currentPhase = 'expansion'

    // Call lifecycle hook
    this.animation.onStart?.()

    // Trigger screen shake if configured
    if (this.animation.shake) {
      this.triggerScreenShake()
    }

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
    this.currentPhase = 'expansion'
    this.startTime = 0
  }

  /**
   * Animation loop (using requestAnimationFrame)
   */
  protected animate = (): void => {
    if (!this.isPlaying) return

    const elapsed = Date.now() - this.startTime
    this.currentProgress = Math.min(elapsed / this.animation.duration, 1)

    // Update phase
    this.updatePhase(elapsed)

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
   * Update current animation phase
   */
  protected updatePhase(elapsed: number): void {
    const { expansionDuration, peakDuration } = this.animation
    const totalExpansionTime = expansionDuration + (peakDuration || 0)

    if (elapsed < expansionDuration) {
      this.currentPhase = 'expansion'
    } else if (peakDuration && elapsed < totalExpansionTime) {
      this.currentPhase = 'peak'
    } else {
      this.currentPhase = 'fade'
    }
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
   * Trigger screen shake effect
   */
  protected triggerScreenShake(): void {
    if (!this.animation.shake) return

    const { intensity, duration } = this.animation.shake

    // This would integrate with a screen shake system
    // For now, just a placeholder that could be implemented by the consumer
    console.log(`[AbstractBurst] Screen shake triggered: intensity=${intensity}, duration=${duration}ms`)
  }

  /**
   * Ease out cubic function for expansion
   */
  protected easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3)
  }

  /**
   * Get vertices for custom shapes
   */
  protected getShapeVertices(): Point[] {
    const { shape, radius, position } = this.animation

    switch (shape) {
      case 'circle':
        return this.getCircleVertices(position, radius, 32)

      case 'ring':
        return this.getRingVertices(position, radius, radius * 0.7, 32)

      case 'square':
        return this.getSquareVertices(position, radius)

      case 'star':
        return this.getStarVertices(position, radius, 5)

      case 'custom':
        return this.animation.customPoints || [position]

      default:
        return this.getCircleVertices(position, radius, 32)
    }
  }

  /**
   * Generate vertices for a circle
   */
  protected getCircleVertices(center: Point, radius: number, segments: number): Point[] {
    const vertices: Point[] = []
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2
      vertices.push({
        x: center.x + Math.cos(angle) * radius,
        y: center.y + Math.sin(angle) * radius
      })
    }
    return vertices
  }

  /**
   * Generate vertices for a ring (donut)
   */
  protected getRingVertices(
    center: Point,
    outerRadius: number,
    innerRadius: number,
    segments: number
  ): Point[] {
    const vertices: Point[] = []

    // Outer circle
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2
      vertices.push({
        x: center.x + Math.cos(angle) * outerRadius,
        y: center.y + Math.sin(angle) * outerRadius
      })
    }

    // Inner circle (reversed for proper polygon winding)
    for (let i = segments - 1; i >= 0; i--) {
      const angle = (i / segments) * Math.PI * 2
      vertices.push({
        x: center.x + Math.cos(angle) * innerRadius,
        y: center.y + Math.sin(angle) * innerRadius
      })
    }

    return vertices
  }

  /**
   * Generate vertices for a square
   */
  protected getSquareVertices(center: Point, radius: number): Point[] {
    return [
      { x: center.x - radius, y: center.y - radius },
      { x: center.x + radius, y: center.y - radius },
      { x: center.x + radius, y: center.y + radius },
      { x: center.x - radius, y: center.y + radius }
    ]
  }

  /**
   * Generate vertices for a star
   */
  protected getStarVertices(center: Point, radius: number, points: number): Point[] {
    const vertices: Point[] = []
    const innerRadius = radius * 0.5

    for (let i = 0; i < points * 2; i++) {
      const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2
      const r = i % 2 === 0 ? radius : innerRadius

      vertices.push({
        x: center.x + Math.cos(angle) * r,
        y: center.y + Math.sin(angle) * r
      })
    }

    return vertices
  }

  /**
   * Clean up resources
   */
  public destroy(): void {
    this.stop()
  }
}
