/**
 * Timeline Integration API
 *
 * Integration layer between the animation library and D&D MapMaker's combat timeline system.
 * Handles round-based spell execution, event-based durations, and concentration management.
 *
 * Features:
 * - Round/event-based animation triggers
 * - Persistent spell effects with duration tracking
 * - Concentration spell management
 * - Event-based cleanup (remove spells after N events)
 * - Timeline synchronization
 * - Spell queue for initiative order
 */

import type { Point } from '../types'
import { AnimationFactory, type AnimationInstance } from '../registry/AnimationFactory'
import type { RegisteredAnimationName } from '../registry/AnimationRegistry'
import { animationCaster } from './AnimationCaster'

/**
 * Timeline event for animation execution
 */
export type TimelineAnimationEvent = {
  id: string
  name: RegisteredAnimationName
  config: unknown
  round: number
  eventNumber: number
  executedAt?: number // Timestamp when executed
  completed: boolean
  persistent?: boolean // Should effect persist after animation
  durationType?: 'time' | 'rounds' | 'events'
  duration?: number // Duration in ms, rounds, or events
  concentration?: boolean
  casterId?: string // Token ID of caster (for concentration)
}

/**
 * Persistent spell effect
 */
export type PersistentEffect = {
  id: string
  animation: AnimationInstance
  createdAt: number
  createdAtRound: number
  createdAtEvent: number
  durationType: 'time' | 'rounds' | 'events'
  duration: number
  concentration: boolean
  casterId?: string
  isExpired: () => boolean
}

/**
 * Timeline Integration class
 */
class TimelineIntegrationClass {
  private scheduledEvents: Map<string, TimelineAnimationEvent> = new Map()
  private persistentEffects: Map<string, PersistentEffect> = new Map()
  private currentRound: number = 0
  private currentEvent: number = 0

  /**
   * Schedule an animation for a specific round/event
   */
  scheduleAnimation(
    round: number,
    eventNumber: number,
    name: RegisteredAnimationName,
    config: unknown,
    options: {
      persistent?: boolean
      durationType?: 'time' | 'rounds' | 'events'
      duration?: number
      concentration?: boolean
      casterId?: string
    } = {}
  ): string {
    const id = `${round}-${eventNumber}-${name}-${Date.now()}`

    const event: TimelineAnimationEvent = {
      id,
      name,
      config,
      round,
      eventNumber,
      completed: false,
      persistent: options.persistent,
      durationType: options.durationType,
      duration: options.duration,
      concentration: options.concentration,
      casterId: options.casterId
    }

    this.scheduledEvents.set(id, event)
    return id
  }

  /**
   * Execute animations for current round/event
   */
  async executeEventsForRound(round: number, eventNumber: number): Promise<void> {
    this.currentRound = round
    this.currentEvent = eventNumber

    const eventsToExecute = Array.from(this.scheduledEvents.values()).filter(
      event => event.round === round && event.eventNumber === eventNumber && !event.completed
    )

    // Execute all animations for this event
    const promises = eventsToExecute.map(async event => {
      try {
        // Execute animation
        await animationCaster.cast(event.name, event.config)

        // Mark as completed
        event.completed = true
        event.executedAt = Date.now()

        // Create persistent effect if needed
        if (event.persistent && event.durationType && event.duration) {
          this.createPersistentEffect(event)
        }
      } catch (error) {
        console.error(`Failed to execute animation event ${event.id}:`, error)
      }
    })

    await Promise.all(promises)

    // Clean up expired effects
    this.cleanupExpiredEffects()
  }

  /**
   * Create a persistent spell effect
   */
  private createPersistentEffect(event: TimelineAnimationEvent): void {
    const animation = AnimationFactory.create(event.name, event.config)
    if (!animation) return

    const effect: PersistentEffect = {
      id: event.id,
      animation,
      createdAt: Date.now(),
      createdAtRound: this.currentRound,
      createdAtEvent: this.currentEvent,
      durationType: event.durationType!,
      duration: event.duration!,
      concentration: event.concentration || false,
      casterId: event.casterId,
      isExpired: () => this.checkEffectExpired(effect)
    }

    this.persistentEffects.set(effect.id, effect)

    // Start the animation for persistent effects
    animation.play()
  }

  /**
   * Check if a persistent effect has expired
   */
  private checkEffectExpired(effect: PersistentEffect): boolean {
    switch (effect.durationType) {
      case 'time':
        return Date.now() - effect.createdAt >= effect.duration

      case 'rounds':
        return this.currentRound - effect.createdAtRound >= effect.duration

      case 'events':
        return this.currentEvent - effect.createdAtEvent >= effect.duration

      default:
        return false
    }
  }

  /**
   * Clean up expired persistent effects
   */
  cleanupExpiredEffects(): void {
    const expiredEffects = Array.from(this.persistentEffects.values()).filter(
      effect => effect.isExpired()
    )

    expiredEffects.forEach(effect => {
      effect.animation.stop()
      this.persistentEffects.delete(effect.id)
    })
  }

  /**
   * Break concentration for a caster (removes their concentration spells)
   */
  breakConcentration(casterId: string): void {
    const concentrationEffects = Array.from(this.persistentEffects.values()).filter(
      effect => effect.concentration && effect.casterId === casterId
    )

    concentrationEffects.forEach(effect => {
      effect.animation.stop()
      this.persistentEffects.delete(effect.id)
    })
  }

  /**
   * Advance to next round (increment round counter)
   */
  advanceRound(): void {
    this.currentRound++
    this.cleanupExpiredEffects()
  }

  /**
   * Advance to next event (increment event counter)
   */
  advanceEvent(): void {
    this.currentEvent++
    this.cleanupExpiredEffects()
  }

  /**
   * Get current round number
   */
  getCurrentRound(): number {
    return this.currentRound
  }

  /**
   * Get current event number
   */
  getCurrentEvent(): number {
    return this.currentEvent
  }

  /**
   * Set current round/event (for timeline synchronization)
   */
  setCurrentRound(round: number, event: number = 0): void {
    this.currentRound = round
    this.currentEvent = event
    this.cleanupExpiredEffects()
  }

  /**
   * Get all scheduled events
   */
  getScheduledEvents(): TimelineAnimationEvent[] {
    return Array.from(this.scheduledEvents.values())
  }

  /**
   * Get scheduled events for a specific round
   */
  getEventsForRound(round: number): TimelineAnimationEvent[] {
    return Array.from(this.scheduledEvents.values()).filter(
      event => event.round === round
    )
  }

  /**
   * Get all persistent effects
   */
  getPersistentEffects(): PersistentEffect[] {
    return Array.from(this.persistentEffects.values())
  }

  /**
   * Get persistent effects for a specific caster
   */
  getEffectsForCaster(casterId: string): PersistentEffect[] {
    return Array.from(this.persistentEffects.values()).filter(
      effect => effect.casterId === casterId
    )
  }

  /**
   * Cancel a scheduled event
   */
  cancelEvent(eventId: string): boolean {
    return this.scheduledEvents.delete(eventId)
  }

  /**
   * Remove a persistent effect
   */
  removeEffect(effectId: string): boolean {
    const effect = this.persistentEffects.get(effectId)
    if (effect) {
      effect.animation.stop()
      return this.persistentEffects.delete(effectId)
    }
    return false
  }

  /**
   * Clear all scheduled events and persistent effects
   */
  clear(): void {
    // Stop all persistent effects
    this.persistentEffects.forEach(effect => effect.animation.stop())

    this.scheduledEvents.clear()
    this.persistentEffects.clear()
    this.currentRound = 0
    this.currentEvent = 0
  }

  /**
   * Reset to specific round/event (for timeline rewind)
   */
  reset(round: number = 0, event: number = 0): void {
    this.clear()
    this.currentRound = round
    this.currentEvent = event
  }

  /**
   * Quick spell scheduling helpers
   */
  schedule = {
    /**
     * Schedule Fireball
     */
    fireball: (
      round: number,
      event: number,
      from: Point,
      to: Point,
      options?: { casterId?: string }
    ) =>
      this.scheduleAnimation(
        round,
        event,
        'Fireball',
        { fromPosition: from, toPosition: to },
        options
      ),

    /**
     * Schedule Darkness (persistent area)
     */
    darkness: (
      round: number,
      event: number,
      position: Point,
      options: {
        durationType?: 'time' | 'rounds' | 'events'
        duration?: number
        concentration?: boolean
        casterId?: string
      } = {}
    ) =>
      this.scheduleAnimation(
        round,
        event,
        'Darkness',
        { position },
        {
          persistent: true,
          durationType: options.durationType || 'time',
          duration: options.duration || 600000, // 10 minutes default
          concentration: options.concentration !== false, // Default true
          casterId: options.casterId
        }
      ),

    /**
     * Schedule Thunderwave
     */
    thunderwave: (
      round: number,
      event: number,
      position: Point,
      options?: { casterId?: string }
    ) =>
      this.scheduleAnimation(
        round,
        event,
        'Thunderwave',
        { position },
        options
      ),

    /**
     * Schedule Ray of Frost
     */
    rayOfFrost: (
      round: number,
      event: number,
      from: Point,
      to: Point,
      options?: { casterId?: string }
    ) =>
      this.scheduleAnimation(
        round,
        event,
        'Ray of Frost',
        { fromPosition: from, toPosition: to },
        options
      ),

    /**
     * Schedule Magic Missile
     */
    magicMissile: (
      round: number,
      event: number,
      from: Point,
      to: Point,
      options?: { casterId?: string }
    ) =>
      this.scheduleAnimation(
        round,
        event,
        'Magic Missile',
        { fromPosition: from, toPosition: to },
        options
      )
  }
}

/**
 * Singleton instance of timeline integration
 */
export const timelineIntegration = new TimelineIntegrationClass()
