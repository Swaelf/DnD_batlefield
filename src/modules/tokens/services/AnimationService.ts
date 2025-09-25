/**
 * Animation Service - Token movement and effect animations
 */

import { nanoid } from 'nanoid'
import type { Point } from '@/types/geometry'
import type {
  Token,
  TokenId,
  AnimationHandle,
  TokenAnimation,
  MovementAnimation,
  TeleportAnimation,
  ConditionAnimation,
  DamageAnimation,
  HealAnimation,
  AnimationConfig,
  AnimationMetrics,
  PathfindingOptions,
  CreateAnimationOptions,
  BatchAnimation,
  EasingFunction
} from '../types'
import { createAnimationHandle } from '../types'

export class AnimationService {
  private static instance: AnimationService | null = null
  private activeAnimations = new Map<AnimationHandle, TokenAnimation>()
  private animationFrameId: number | null = null
  private lastFrameTime = 0
  private config: AnimationConfig = {
    enabled: true,
    globalSpeed: 1.0,
    maxConcurrentAnimations: 50,
    defaultDuration: 500,
    defaultEasing: 'ease-out',
    enableParticleEffects: true,
    enableSoundEffects: false,
    performanceMode: 'medium'
  }

  private constructor() {}

  static getInstance(): AnimationService {
    if (!AnimationService.instance) {
      AnimationService.instance = new AnimationService()
    }
    return AnimationService.instance
  }

  /**
   * Create movement animation
   */
  animateMovement(
    token: Token,
    to: Point,
    options: CreateAnimationOptions = {}
  ): AnimationHandle {
    const handle = createAnimationHandle(nanoid())

    const animation: MovementAnimation = {
      id: handle,
      tokenId: token.id,
      type: 'movement',
      status: 'pending',
      duration: options.duration ?? this.config.defaultDuration,
      easing: options.easing ?? this.config.defaultEasing,
      delay: options.delay ?? 0,
      priority: options.priority ?? 1,
      from: token.position,
      to,
      speed: undefined,
      rotateToDirection: false,
      onStart: options.onStart,
      onUpdate: options.onUpdate,
      onComplete: options.onComplete,
      onCancel: options.onCancel
    }

    return this.queueAnimation(animation)
  }

  /**
   * Create teleport animation
   */
  animateTeleport(
    token: Token,
    to: Point,
    options: CreateAnimationOptions = {}
  ): AnimationHandle {
    const handle = createAnimationHandle(nanoid())

    const animation: TeleportAnimation = {
      id: handle,
      tokenId: token.id,
      type: 'teleport',
      status: 'pending',
      duration: options.duration ?? 300,
      easing: options.easing ?? 'ease-in-out',
      delay: options.delay ?? 0,
      priority: options.priority ?? 2,
      from: token.position,
      to,
      fadeOut: true,
      fadeIn: true,
      onStart: options.onStart,
      onUpdate: options.onUpdate,
      onComplete: options.onComplete,
      onCancel: options.onCancel
    }

    return this.queueAnimation(animation)
  }

  /**
   * Create condition animation
   */
  animateCondition(
    token: Token,
    condition: string,
    isAdding: boolean,
    options: CreateAnimationOptions = {}
  ): AnimationHandle {
    const handle = createAnimationHandle(nanoid())

    const animation: ConditionAnimation = {
      id: handle,
      tokenId: token.id,
      type: 'condition',
      status: 'pending',
      duration: options.duration ?? 800,
      easing: options.easing ?? 'bounce',
      delay: options.delay ?? 0,
      priority: options.priority ?? 3,
      condition,
      isAdding,
      flashColor: isAdding ? '#FFD700' : '#FF4444',
      pulseEffect: true,
      onStart: options.onStart,
      onUpdate: options.onUpdate,
      onComplete: options.onComplete,
      onCancel: options.onCancel
    }

    return this.queueAnimation(animation)
  }

  /**
   * Create damage animation
   */
  animateDamage(
    token: Token,
    amount: number,
    damageType?: string,
    options: CreateAnimationOptions = {}
  ): AnimationHandle {
    const handle = createAnimationHandle(nanoid())

    const animation: DamageAnimation = {
      id: handle,
      tokenId: token.id,
      type: 'damage',
      status: 'pending',
      duration: options.duration ?? 1000,
      easing: options.easing ?? 'ease-out',
      delay: options.delay ?? 0,
      priority: options.priority ?? 4,
      amount,
      damageType,
      color: this.getDamageTypeColor(damageType),
      fontSize: Math.min(Math.max(amount, 12), 32),
      movement: { x: 0, y: -50 },
      onStart: options.onStart,
      onUpdate: options.onUpdate,
      onComplete: options.onComplete,
      onCancel: options.onCancel
    }

    return this.queueAnimation(animation)
  }

  /**
   * Create heal animation
   */
  animateHeal(
    token: Token,
    amount: number,
    options: CreateAnimationOptions = {}
  ): AnimationHandle {
    const handle = createAnimationHandle(nanoid())

    const animation: HealAnimation = {
      id: handle,
      tokenId: token.id,
      type: 'heal',
      status: 'pending',
      duration: options.duration ?? 1200,
      easing: options.easing ?? 'ease-out',
      delay: options.delay ?? 0,
      priority: options.priority ?? 4,
      amount,
      color: '#22C55E',
      fontSize: Math.min(Math.max(amount, 12), 28),
      sparkles: true,
      onStart: options.onStart,
      onUpdate: options.onUpdate,
      onComplete: options.onComplete,
      onCancel: options.onCancel
    }

    return this.queueAnimation(animation)
  }

  /**
   * Queue animation for execution
   */
  private queueAnimation(animation: TokenAnimation): AnimationHandle {
    if (!this.config.enabled) {
      return animation.id
    }

    // Check concurrent animation limit
    if (this.activeAnimations.size >= this.config.maxConcurrentAnimations) {
      console.warn('Maximum concurrent animations reached, skipping animation')
      return animation.id
    }

    this.activeAnimations.set(animation.id, animation)

    // Start animation loop if not running
    if (!this.animationFrameId) {
      this.startAnimationLoop()
    }

    // Execute immediately if no delay
    if (animation.delay === 0) {
      this.startAnimation(animation)
    } else {
      // Schedule delayed start
      setTimeout(() => {
        if (this.activeAnimations.has(animation.id)) {
          this.startAnimation(animation)
        }
      }, animation.delay)
    }

    return animation.id
  }

  /**
   * Start individual animation
   */
  private startAnimation(animation: TokenAnimation): void {
    const updatedAnimation: TokenAnimation = {
      ...animation,
      status: 'running',
      startTime: performance.now()
    }

    this.activeAnimations.set(animation.id, updatedAnimation)

    // Call onStart callback
    if (animation.onStart) {
      animation.onStart()
    }
  }

  /**
   * Cancel animation
   */
  cancelAnimation(handle: AnimationHandle): void {
    const animation = this.activeAnimations.get(handle)
    if (!animation) return

    const updatedAnimation: TokenAnimation = {
      ...animation,
      status: 'cancelled'
    }

    this.activeAnimations.set(handle, updatedAnimation)

    // Call onCancel callback
    if (animation.onCancel) {
      animation.onCancel()
    }

    // Remove from active animations
    this.activeAnimations.delete(handle)
  }

  /**
   * Cancel all animations for a token
   */
  cancelTokenAnimations(tokenId: TokenId): void {
    const toCancel: AnimationHandle[] = []

    for (const [handle, animation] of this.activeAnimations) {
      if (animation.tokenId === tokenId) {
        toCancel.push(handle)
      }
    }

    toCancel.forEach(handle => this.cancelAnimation(handle))
  }

  /**
   * Cancel all animations
   */
  cancelAllAnimations(): void {
    const toCancel = Array.from(this.activeAnimations.keys())
    toCancel.forEach(handle => this.cancelAnimation(handle))
  }

  /**
   * Start animation loop
   */
  private startAnimationLoop(): void {
    const animate = (currentTime: number) => {
      this.updateAnimations(currentTime)

      if (this.activeAnimations.size > 0) {
        this.animationFrameId = requestAnimationFrame(animate)
      } else {
        this.animationFrameId = null
      }
    }

    this.animationFrameId = requestAnimationFrame(animate)
  }

  /**
   * Update all active animations
   */
  private updateAnimations(currentTime: number): void {
    const completedAnimations: AnimationHandle[] = []

    for (const [handle, animation] of this.activeAnimations) {
      if (animation.status !== 'running' || !animation.startTime) {
        continue
      }

      const elapsed = currentTime - animation.startTime
      const adjustedDuration = animation.duration / this.config.globalSpeed
      const progress = Math.min(elapsed / adjustedDuration, 1)
      const easedProgress = this.applyEasing(progress, animation.easing)

      // Call onUpdate callback
      if (animation.onUpdate) {
        animation.onUpdate(easedProgress)
      }

      // Update animation based on type
      this.updateAnimationByType(animation, easedProgress)

      // Check if animation is complete
      if (progress >= 1) {
        completedAnimations.push(handle)
      }
    }

    // Complete finished animations
    completedAnimations.forEach(handle => this.completeAnimation(handle))
  }

  /**
   * Update animation based on its type
   */
  private updateAnimationByType(animation: TokenAnimation, progress: number): void {
    switch (animation.type) {
      case 'movement':
        this.updateMovementAnimation(animation as MovementAnimation, progress)
        break
      case 'teleport':
        this.updateTeleportAnimation(animation as TeleportAnimation, progress)
        break
      case 'condition':
        this.updateConditionAnimation(animation as ConditionAnimation, progress)
        break
      case 'damage':
        this.updateDamageAnimation(animation as DamageAnimation, progress)
        break
      case 'heal':
        this.updateHealAnimation(animation as HealAnimation, progress)
        break
    }
  }

  /**
   * Update movement animation
   */
  private updateMovementAnimation(animation: MovementAnimation, progress: number): void {
    // Calculate current position
    const currentX = animation.from.x + (animation.to.x - animation.from.x) * progress
    const currentY = animation.from.y + (animation.to.y - animation.from.y) * progress

    // This would update the actual token position in the store
    // For now, we'll just emit an event or call a callback
    console.log(`Moving token ${animation.tokenId} to (${currentX}, ${currentY})`)
  }

  /**
   * Update teleport animation
   */
  private updateTeleportAnimation(animation: TeleportAnimation, progress: number): void {
    if (progress < 0.5 && animation.fadeOut) {
      // Fade out phase
      const fadeProgress = progress * 2
      console.log(`Fading out token ${animation.tokenId}: ${1 - fadeProgress}`)
    } else if (progress >= 0.5 && animation.fadeIn) {
      // Fade in phase
      const fadeProgress = (progress - 0.5) * 2
      console.log(`Fading in token ${animation.tokenId}: ${fadeProgress}`)

      if (fadeProgress === 0) {
        // Move token to destination instantly
        console.log(`Teleporting token ${animation.tokenId} to (${animation.to.x}, ${animation.to.y})`)
      }
    }
  }

  /**
   * Update condition animation
   */
  private updateConditionAnimation(animation: ConditionAnimation, progress: number): void {
    if (animation.pulseEffect) {
      const pulseIntensity = Math.sin(progress * Math.PI * 4) * 0.5 + 0.5
      console.log(`Pulsing condition ${animation.condition} on token ${animation.tokenId}: ${pulseIntensity}`)
    }
  }

  /**
   * Update damage animation
   */
  private updateDamageAnimation(animation: DamageAnimation, progress: number): void {
    const currentY = animation.movement.y * progress
    const opacity = 1 - progress
    console.log(`Damage text for token ${animation.tokenId}: -${animation.amount} at offset (0, ${currentY}) opacity: ${opacity}`)
  }

  /**
   * Update heal animation
   */
  private updateHealAnimation(animation: HealAnimation, progress: number): void {
    const sparkleIntensity = animation.sparkles ? Math.sin(progress * Math.PI * 6) * 0.5 + 0.5 : 0
    const opacity = 1 - progress
    console.log(`Heal text for token ${animation.tokenId}: +${animation.amount} sparkles: ${sparkleIntensity} opacity: ${opacity}`)
  }

  /**
   * Complete animation
   */
  private completeAnimation(handle: AnimationHandle): void {
    const animation = this.activeAnimations.get(handle)
    if (!animation) return

    const updatedAnimation: TokenAnimation = {
      ...animation,
      status: 'completed'
    }

    // Call onComplete callback
    if (animation.onComplete) {
      animation.onComplete()
    }

    // Remove from active animations
    this.activeAnimations.delete(handle)
  }

  /**
   * Apply easing function to progress
   */
  private applyEasing(progress: number, easing: EasingFunction): number {
    switch (easing) {
      case 'linear':
        return progress

      case 'ease-in':
        return progress * progress

      case 'ease-out':
        return 1 - (1 - progress) * (1 - progress)

      case 'ease-in-out':
        return progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2

      case 'bounce':
        const c1 = 1.70158
        const c3 = c1 + 1
        return c3 * progress * progress * progress - c1 * progress * progress

      case 'elastic':
        const c4 = (2 * Math.PI) / 3
        return progress === 0
          ? 0
          : progress === 1
          ? 1
          : Math.pow(2, -10 * progress) * Math.sin((progress * 10 - 0.75) * c4) + 1

      default:
        return progress
    }
  }

  /**
   * Get damage type color
   */
  private getDamageTypeColor(damageType?: string): string {
    const colors: Record<string, string> = {
      fire: '#EF4444',
      cold: '#3B82F6',
      lightning: '#EAB308',
      acid: '#10B981',
      poison: '#8B5CF6',
      necrotic: '#6B7280',
      radiant: '#F59E0B',
      psychic: '#EC4899',
      force: '#A855F7',
      thunder: '#F97316'
    }

    return damageType ? colors[damageType.toLowerCase()] ?? '#DC2626' : '#DC2626'
  }

  /**
   * Create batch animation
   */
  createBatchAnimation(batch: BatchAnimation): AnimationHandle[] {
    if (batch.sequenceType === 'parallel') {
      // Start all animations simultaneously
      return batch.animations.map(animation => this.queueAnimation(animation))
    } else {
      // Start animations in sequence with optional stagger
      const handles: AnimationHandle[] = []
      const staggerDelay = batch.staggerDelay ?? 100

      batch.animations.forEach((animation, index) => {
        const delayedAnimation: TokenAnimation = {
          ...animation,
          delay: (animation.delay ?? 0) + (index * staggerDelay)
        }

        handles.push(this.queueAnimation(delayedAnimation))
      })

      // Set up completion callback for the last animation
      if (batch.onAllComplete && handles.length > 0) {
        const lastHandle = handles[handles.length - 1]
        const lastAnimation = this.activeAnimations.get(lastHandle)

        if (lastAnimation) {
          const originalOnComplete = lastAnimation.onComplete
          const updatedAnimation: TokenAnimation = {
            ...lastAnimation,
            onComplete: () => {
              originalOnComplete?.()
              batch.onAllComplete?.()
            }
          }
          this.activeAnimations.set(lastHandle, updatedAnimation)
        }
      }

      return handles
    }
  }

  /**
   * Get animation metrics
   */
  getMetrics(): AnimationMetrics {
    return {
      fps: 60, // Would calculate actual FPS
      frameTime: performance.now() - this.lastFrameTime,
      activeAnimationCount: this.activeAnimations.size,
      queuedAnimationCount: 0, // Would track queued animations
      averageFrameTime: 16.67, // Would track average
      droppedFrames: 0 // Would track dropped frames
    }
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<AnimationConfig>): void {
    this.config = { ...this.config, ...updates }
  }

  /**
   * Get current configuration
   */
  getConfig(): AnimationConfig {
    return { ...this.config }
  }

  /**
   * Check if token is animating
   */
  isTokenAnimating(tokenId: TokenId): boolean {
    for (const animation of this.activeAnimations.values()) {
      if (animation.tokenId === tokenId && animation.status === 'running') {
        return true
      }
    }
    return false
  }

  /**
   * Get active animations for token
   */
  getTokenAnimations(tokenId: TokenId): TokenAnimation[] {
    return Array.from(this.activeAnimations.values())
      .filter(animation => animation.tokenId === tokenId)
  }
}