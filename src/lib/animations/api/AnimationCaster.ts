/**
 * Animation Caster API
 *
 * High-level API for casting animations in a simplified, game-friendly manner.
 * Provides promises, callbacks, and async/await support for animation execution.
 *
 * Features:
 * - Promise-based animation execution
 * - Event callbacks (onStart, onUpdate, onComplete)
 * - Sequential and parallel casting
 * - Animation queue management
 * - Auto-cleanup of completed animations
 * - Integration with timeline system
 */

import type { Point } from '../types'
import { AnimationFactory, type AnimationInstance } from '../registry/AnimationFactory'
import type { RegisteredAnimationName } from '../registry/AnimationRegistry'

/**
 * Cast options for animation execution
 */
export type CastOptions = {
  // Lifecycle callbacks
  onStart?: () => void
  onUpdate?: (progress: number) => void
  onComplete?: () => void
  onError?: (error: Error) => void

  // Timing options
  delay?: number // Delay before starting (ms)
  autoCleanup?: boolean // Auto-remove from active animations (default: true)

  // Integration options
  trackInTimeline?: boolean // Add to timeline system (default: false)
  roundEvent?: number // Timeline round/event number
}

/**
 * Cast result with promise and control methods
 */
export type CastResult = {
  animation: AnimationInstance
  promise: Promise<void>
  stop: () => void
  pause: () => void
  resume: () => void
}

/**
 * Animation Caster class
 */
class AnimationCasterClass {
  private activeAnimations: Set<AnimationInstance> = new Set()
  private animationQueue: Array<() => Promise<void>> = []
  private isProcessingQueue: boolean = false

  /**
   * Cast a spell animation
   */
  async cast(
    name: RegisteredAnimationName,
    config: unknown,
    options: CastOptions = {}
  ): Promise<void> {
    const {
      onStart,
      onUpdate,
      onComplete,
      onError,
      delay = 0,
      autoCleanup = true
    } = options

    try {
      // Create animation
      const animation = AnimationFactory.create(name, config)
      if (!animation) {
        throw new Error(`Failed to create animation: ${name}`)
      }

      // Add lifecycle callbacks by wrapping the animation
      const originalAnimation = animation.getAnimation()
      const originalOnStart = originalAnimation.onStart
      const originalOnUpdate = originalAnimation.onUpdate
      const originalOnComplete = originalAnimation.onComplete

      // Override callbacks through the animation object
      originalAnimation.onStart = () => {
        originalOnStart?.()
        onStart?.()
      }
      originalAnimation.onUpdate = (progress: number) => {
        originalOnUpdate?.(progress)
        onUpdate?.(progress)
      }
      originalAnimation.onComplete = () => {
        originalOnComplete?.()
        onComplete?.()
        if (autoCleanup) {
          this.activeAnimations.delete(animation)
        }
      }

      // Add to active animations
      this.activeAnimations.add(animation)

      // Delay if specified
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay))
      }

      // Play animation and wait for completion
      return new Promise<void>((resolve) => {
        const checkComplete = () => {
          if (!animation.isAnimating()) {
            resolve()
          } else {
            requestAnimationFrame(checkComplete)
          }
        }

        animation.play()
        checkComplete()
      })
    } catch (error) {
      onError?.(error as Error)
      throw error
    }
  }

  /**
   * Cast with manual control (returns CastResult)
   */
  castWithControl(
    name: RegisteredAnimationName,
    config: unknown,
    options: CastOptions = {}
  ): CastResult | null {
    const animation = AnimationFactory.create(name, config)
    if (!animation) {
      console.error(`Failed to create animation: ${name}`)
      return null
    }

    const {
      onStart,
      onUpdate,
      onComplete,
      delay = 0,
      autoCleanup = true
    } = options

    // Add lifecycle callbacks by wrapping the animation
    const originalAnimation = animation.getAnimation()
    const originalOnStart = originalAnimation.onStart
    const originalOnUpdate = originalAnimation.onUpdate
    const originalOnComplete = originalAnimation.onComplete

    // Override callbacks through the animation object
    originalAnimation.onStart = () => {
      originalOnStart?.()
      onStart?.()
    }
    originalAnimation.onUpdate = (progress: number) => {
      originalOnUpdate?.(progress)
      onUpdate?.(progress)
    }
    originalAnimation.onComplete = () => {
      originalOnComplete?.()
      onComplete?.()
      if (autoCleanup) {
        this.activeAnimations.delete(animation)
      }
    }

    // Add to active animations
    this.activeAnimations.add(animation)

    // Create promise
    const promise = new Promise<void>((resolve) => {
      const startAnimation = () => {
        const checkComplete = () => {
          if (!animation.isAnimating()) {
            resolve()
          } else {
            requestAnimationFrame(checkComplete)
          }
        }

        animation.play()
        checkComplete()
      }

      if (delay > 0) {
        setTimeout(startAnimation, delay)
      } else {
        startAnimation()
      }
    })

    return {
      animation,
      promise,
      stop: () => animation.stop(),
      pause: () => animation.stop(), // Can enhance with actual pause/resume
      resume: () => animation.play()
    }
  }

  /**
   * Cast multiple animations in sequence
   */
  async castSequence(
    casts: Array<{
      name: RegisteredAnimationName
      config: unknown
      options?: CastOptions
    }>,
    globalOptions: { stagger?: number } = {}
  ): Promise<void> {
    const { stagger = 0 } = globalOptions

    for (let i = 0; i < casts.length; i++) {
      const { name, config, options = {} } = casts[i]

      // Add stagger delay to each cast except the first
      const delay = (options.delay || 0) + (i * stagger)

      await this.cast(name, config, { ...options, delay })
    }
  }

  /**
   * Cast multiple animations in parallel
   */
  async castParallel(
    casts: Array<{
      name: RegisteredAnimationName
      config: unknown
      options?: CastOptions
    }>
  ): Promise<void> {
    const promises = casts.map(({ name, config, options }) =>
      this.cast(name, config, options)
    )

    await Promise.all(promises)
  }

  /**
   * Cast animations with stagger delay (parallel but delayed)
   */
  async castStaggered(
    casts: Array<{
      name: RegisteredAnimationName
      config: unknown
      options?: CastOptions
    }>,
    staggerDelay: number = 100
  ): Promise<void> {
    const promises = casts.map(({ name, config, options }, index) =>
      this.cast(name, config, {
        ...options,
        delay: (options?.delay || 0) + (index * staggerDelay)
      })
    )

    await Promise.all(promises)
  }

  /**
   * Queue an animation for sequential playback
   */
  queueCast(
    name: RegisteredAnimationName,
    config: unknown,
    options: CastOptions = {}
  ): void {
    this.animationQueue.push(() => this.cast(name, config, options))

    if (!this.isProcessingQueue) {
      void this.processQueue()
    }
  }

  /**
   * Process the animation queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.animationQueue.length === 0) {
      return
    }

    this.isProcessingQueue = true

    while (this.animationQueue.length > 0) {
      const nextCast = this.animationQueue.shift()
      if (nextCast) {
        await nextCast()
      }
    }

    this.isProcessingQueue = false
  }

  /**
   * Clear the animation queue
   */
  clearQueue(): void {
    this.animationQueue = []
  }

  /**
   * Stop all active animations
   */
  stopAll(): void {
    this.activeAnimations.forEach(animation => animation.stop())
    this.activeAnimations.clear()
  }

  /**
   * Get count of active animations
   */
  getActiveCount(): number {
    return this.activeAnimations.size
  }

  /**
   * Get all active animations
   */
  getActiveAnimations(): AnimationInstance[] {
    return Array.from(this.activeAnimations)
  }

  /**
   * Check if any animations are playing
   */
  isAnimating(): boolean {
    return this.activeAnimations.size > 0
  }

  /**
   * Wait for all active animations to complete
   */
  async waitForAll(): Promise<void> {
    const promises = Array.from(this.activeAnimations).map(animation => {
      return new Promise<void>((resolve) => {
        const checkComplete = () => {
          if (!animation.isAnimating()) {
            resolve()
          } else {
            requestAnimationFrame(checkComplete)
          }
        }
        checkComplete()
      })
    })

    await Promise.all(promises)
  }

  /**
   * Quick spell casting helpers
   */
  spell = {
    fireball: (from: Point, to: Point, options?: CastOptions) =>
      this.cast('Fireball', { fromPosition: from, toPosition: to }, options),

    magicMissile: (from: Point, to: Point, options?: CastOptions) =>
      this.cast('Magic Missile', { fromPosition: from, toPosition: to }, options),

    thunderwave: (position: Point, options?: CastOptions) =>
      this.cast('Thunderwave', { position }, options),

    darkness: (position: Point, options?: CastOptions) =>
      this.cast('Darkness', { position }, options),

    rayOfFrost: (from: Point, to: Point, options?: CastOptions) =>
      this.cast('Ray of Frost', { fromPosition: from, toPosition: to }, options)
  }
}

/**
 * Singleton instance of the animation caster
 */
export const animationCaster = new AnimationCasterClass()

/**
 * Convenience exports for quick spell casting
 */
export const castSpell = animationCaster.spell
