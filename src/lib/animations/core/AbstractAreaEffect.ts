/**
 * Abstract Area Effect Animation
 *
 * Base class for persistent area effects (Fog Cloud, Darkness, Spirit Guardians, etc.)
 * Handles ground-based effects with optional pulsing, rotation, and target tracking.
 *
 * Features:
 * - Multiple shapes (circle, cone, cube, line, cylinder, sphere)
 * - Persistent duration (time-based or rounds/events)
 * - Pulsing/breathing effects
 * - Rotation animation
 * - Target tracking (follows token)
 * - Billowing fog effects
 */

import type { AreaAnimation, Point, AreaShape } from '../types'
import { nanoid } from 'nanoid'

export type AreaEffectConfig = Partial<Omit<AreaAnimation, 'id' | 'category'>> & {
  name: string
  position: Point
  shape: AreaShape
  size: number
}

export abstract class AbstractAreaEffect {
  // Animation configuration
  protected animation: AreaAnimation

  // Animation state
  protected isPlaying: boolean = false
  protected startTime: number = 0
  protected currentProgress: number = 0
  protected elapsedTime: number = 0

  // Visual state
  protected currentOpacity: number = 1
  protected currentRotation: number = 0
  protected pulseProgress: number = 0

  // Animation frame request
  protected animationFrame: number | null = null

  constructor(config: AreaEffectConfig) {
    this.animation = this.createAnimation(config)
  }

  /**
   * Create animation configuration from partial config
   */
  protected createAnimation(config: AreaEffectConfig): AreaAnimation {
    const {
      name,
      position,
      shape,
      size,
      duration = 10000, // Default 10 seconds
      color = '#888888',
      opacity = 0.6,
      persistDuration = 0,
      durationType = 'time',
      pulsing = false,
      pulseSpeed = 1,
      rotating = false,
      rotationSpeed = 0.5,
      billowing = false,
      coneAngle = 60,
      coneDirection,
      lineWidth = 50,
      lineEndPosition,
      trackTarget = false,
      targetTokenId,
      ...rest
    } = config

    // Calculate cone direction if not provided
    let calculatedDirection = coneDirection
    if (shape === 'cone' && !coneDirection && lineEndPosition) {
      const dx = lineEndPosition.x - position.x
      const dy = lineEndPosition.y - position.y
      calculatedDirection = Math.atan2(dy, dx)
    }

    return {
      id: nanoid(),
      category: 'area',
      name,
      position,
      shape,
      size,
      duration,
      color,
      opacity,
      persistDuration,
      durationType,
      pulsing,
      pulseSpeed,
      rotating,
      rotationSpeed,
      billowing,
      coneAngle,
      coneDirection: calculatedDirection,
      lineWidth,
      lineEndPosition,
      trackTarget,
      targetTokenId,
      ...rest
    }
  }

  /**
   * Get current animation configuration
   */
  public getAnimation(): AreaAnimation {
    return { ...this.animation }
  }

  /**
   * Get current position (updated if tracking target)
   */
  public getCurrentPosition(): Point {
    // If tracking target, this would be updated externally
    // For now, return base position
    return { ...this.animation.position }
  }

  /**
   * Get current opacity (with pulsing if enabled)
   */
  public getCurrentOpacity(): number {
    if (!this.animation.pulsing) {
      return this.animation.opacity || 0.6
    }

    // Calculate pulsing opacity
    const baseOpacity = this.animation.opacity || 0.6
    const pulseAmount = Math.sin(this.pulseProgress * Math.PI * 2) * 0.2
    return Math.max(0.2, Math.min(1, baseOpacity + pulseAmount))
  }

  /**
   * Get current rotation (if rotating)
   */
  public getCurrentRotation(): number {
    return this.currentRotation
  }

  /**
   * Get current progress (0-1)
   */
  public getProgress(): number {
    return this.currentProgress
  }

  /**
   * Get elapsed time in milliseconds
   */
  public getElapsedTime(): number {
    return this.elapsedTime
  }

  /**
   * Check if animation is playing
   */
  public isAnimating(): boolean {
    return this.isPlaying
  }

  /**
   * Check if effect has expired
   */
  public isExpired(): boolean {
    if (this.animation.persistDuration === 0) {
      return false // Infinite duration
    }

    if (this.animation.durationType === 'time') {
      return this.elapsedTime >= (this.animation.persistDuration || 0)
    }

    // For rounds/events, expiration is checked externally
    return false
  }

  /**
   * Start the animation
   */
  public play(): void {
    if (this.isPlaying) return

    this.isPlaying = true
    this.startTime = Date.now()
    this.currentProgress = 0
    this.elapsedTime = 0

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
    this.elapsedTime = 0
    this.currentRotation = 0
    this.pulseProgress = 0
    this.startTime = 0
  }

  /**
   * Animation loop (using requestAnimationFrame)
   */
  protected animate = (): void => {
    if (!this.isPlaying) return

    this.elapsedTime = Date.now() - this.startTime
    const totalDuration = this.animation.persistDuration || this.animation.duration

    // Calculate progress
    if (totalDuration > 0) {
      this.currentProgress = Math.min(this.elapsedTime / totalDuration, 1)
    } else {
      this.currentProgress = 0 // Infinite duration
    }

    // Update pulsing
    if (this.animation.pulsing) {
      const pulseSpeed = this.animation.pulseSpeed || 1
      this.pulseProgress = (this.elapsedTime / 1000) * pulseSpeed
    }

    // Update rotation
    if (this.animation.rotating) {
      const rotationSpeed = this.animation.rotationSpeed || 0.5
      this.currentRotation = (this.elapsedTime / 1000) * rotationSpeed * Math.PI * 2
    }

    // Update lifecycle hook
    this.animation.onUpdate?.(this.currentProgress)

    // Check if effect expired
    if (this.isExpired()) {
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
   * Update target position (for tracking effects)
   */
  public updatePosition(newPosition: Point): void {
    if (!this.animation.trackTarget) return

    this.animation.position = newPosition
  }

  /**
   * Get shape vertices for rendering
   */
  public getShapeVertices(): Point[] {
    const { shape, position, size } = this.animation

    switch (shape) {
      case 'circle':
        return this.getCircleVertices(position, size)

      case 'cone':
        return this.getConeVertices()

      case 'cube':
      case 'cylinder': // Render cylinder as circle from top-down view
        return this.getSquareVertices(position, size)

      case 'line':
        return this.getLineVertices()

      case 'sphere':
        return this.getCircleVertices(position, size)

      default:
        return this.getCircleVertices(position, size)
    }
  }

  /**
   * Generate vertices for a circle
   */
  protected getCircleVertices(center: Point, radius: number, segments: number = 32): Point[] {
    const vertices: Point[] = []
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2 + this.currentRotation
      vertices.push({
        x: center.x + Math.cos(angle) * radius,
        y: center.y + Math.sin(angle) * radius
      })
    }
    return vertices
  }

  /**
   * Generate vertices for a cone
   */
  protected getConeVertices(): Point[] {
    const { position, size, coneAngle = 60, coneDirection = 0 } = this.animation

    // Convert feet to pixels (50px grid = 5 feet, so 1 foot = 10 pixels)
    const PIXELS_PER_FOOT = 10
    const coneLength = size * PIXELS_PER_FOOT

    const angleRad = (coneAngle * Math.PI) / 180
    const halfAngle = angleRad / 2

    const leftAngle = coneDirection - halfAngle
    const rightAngle = coneDirection + halfAngle

    return [
      position,
      {
        x: position.x + Math.cos(leftAngle) * coneLength,
        y: position.y + Math.sin(leftAngle) * coneLength
      },
      {
        x: position.x + Math.cos(coneDirection) * coneLength,
        y: position.y + Math.sin(coneDirection) * coneLength
      },
      {
        x: position.x + Math.cos(rightAngle) * coneLength,
        y: position.y + Math.sin(rightAngle) * coneLength
      }
    ]
  }

  /**
   * Generate vertices for a square
   */
  protected getSquareVertices(center: Point, size: number): Point[] {
    const halfSize = size / 2
    return [
      { x: center.x - halfSize, y: center.y - halfSize },
      { x: center.x + halfSize, y: center.y - halfSize },
      { x: center.x + halfSize, y: center.y + halfSize },
      { x: center.x - halfSize, y: center.y + halfSize }
    ]
  }

  /**
   * Generate vertices for a line
   */
  protected getLineVertices(): Point[] {
    const { position, lineEndPosition, lineWidth = 50 } = this.animation

    if (!lineEndPosition) {
      return [position]
    }

    // Calculate perpendicular direction for line width
    const dx = lineEndPosition.x - position.x
    const dy = lineEndPosition.y - position.y
    const length = Math.sqrt(dx * dx + dy * dy)

    if (length === 0) return [position]

    const perpX = (-dy / length) * (lineWidth / 2)
    const perpY = (dx / length) * (lineWidth / 2)

    return [
      { x: position.x + perpX, y: position.y + perpY },
      { x: lineEndPosition.x + perpX, y: lineEndPosition.y + perpY },
      { x: lineEndPosition.x - perpX, y: lineEndPosition.y - perpY },
      { x: position.x - perpX, y: position.y - perpY }
    ]
  }

  /**
   * Clean up resources
   */
  public destroy(): void {
    this.stop()
  }
}
