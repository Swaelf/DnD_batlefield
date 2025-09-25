/**
 * Event Service
 * Business logic for event creation, validation, and processing
 */

import { nanoid } from 'nanoid'
import type {
  RoundEvent,
  EventId,
  RoundId,
  EventType,
  EventData,
  ValidationResult,
  MoveEventData,
  AttackEventData,
  SpellEventData,
  InteractionEventData,
  EnvironmentalEventData,
  SequenceEventData
} from '../types'

/**
 * Data for creating a new event
 */
export type CreateEventData = {
  readonly name: string
  readonly type: EventType
  readonly order: number
  readonly data: EventData
  readonly duration?: number
  readonly canSkip?: boolean
}

/**
 * Service for managing event operations
 */
export class EventService {
  /**
   * Create a new event
   */
  createEvent(roundId: RoundId, data: CreateEventData): RoundEvent {
    // Validate event data
    const validation = this.validateEventData(data.type, data.data)
    if (!validation.isValid) {
      throw new Error(`Invalid event data: ${validation.errors.map(e => e.message).join(', ')}`)
    }

    // Calculate duration if not provided
    const duration = data.duration ?? this.calculateDefaultDuration(data.type, data.data)

    return {
      id: nanoid() as EventId,
      roundId,
      name: data.name,
      type: data.type,
      order: data.order,
      data: data.data,
      duration,
      canSkip: data.canSkip ?? true,
      isExecuted: false,
      executionTime: null
    }
  }

  /**
   * Validate event data based on type
   */
  validateEventData(type: EventType, data: EventData): ValidationResult {
    const errors = []
    const warnings = []

    // Type-specific validation
    switch (type) {
      case 'move':
        this.validateMoveEvent(data as MoveEventData, errors, warnings)
        break
      case 'attack':
        this.validateAttackEvent(data as AttackEventData, errors, warnings)
        break
      case 'spell':
        this.validateSpellEvent(data as SpellEventData, errors, warnings)
        break
      case 'interaction':
        this.validateInteractionEvent(data as InteractionEventData, errors, warnings)
        break
      case 'environmental':
        this.validateEnvironmentalEvent(data as EnvironmentalEventData, errors, warnings)
        break
      case 'sequence':
        this.validateSequenceEvent(data as SequenceEventData, errors, warnings)
        break
      default:
        errors.push({ field: 'type', message: `Unknown event type: ${type}`, code: 'UNKNOWN_EVENT_TYPE' })
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Process event data for execution
   */
  processEventData(event: RoundEvent): ProcessedEventData {
    switch (event.type) {
      case 'move':
        return this.processMoveEvent(event.data as MoveEventData)
      case 'attack':
        return this.processAttackEvent(event.data as AttackEventData)
      case 'spell':
        return this.processSpellEvent(event.data as SpellEventData)
      case 'interaction':
        return this.processInteractionEvent(event.data as InteractionEventData)
      case 'environmental':
        return this.processEnvironmentalEvent(event.data as EnvironmentalEventData)
      case 'sequence':
        return this.processSequenceEvent(event.data as SequenceEventData)
      default:
        throw new Error(`Cannot process unknown event type: ${event.type}`)
    }
  }

  /**
   * Calculate animation duration for an event
   */
  calculateAnimationDuration(event: RoundEvent): number {
    const baseTime = event.duration

    // Apply type-specific modifiers
    switch (event.type) {
      case 'move':
        const moveData = event.data as MoveEventData
        return Math.max(baseTime, moveData.path.length * 100) // 100ms per path segment minimum

      case 'attack':
        return baseTime + 500 // Extra time for impact effects

      case 'spell':
        const spellData = event.data as SpellEventData
        return baseTime + (spellData.spellLevel * 200) // More dramatic spells take longer

      case 'sequence':
        const sequenceData = event.data as SequenceEventData
        if (sequenceData.parallelExecution) {
          // Parallel execution uses the longest sub-event
          return Math.max(...sequenceData.events.map(e =>
            this.calculateDefaultDuration(e.type, e)
          ))
        } else {
          // Sequential execution sums all sub-events
          return sequenceData.events.reduce((total, e) =>
            total + this.calculateDefaultDuration(e.type, e), 0
          )
        }

      default:
        return baseTime
    }
  }

  /**
   * Get default duration for event type
   */
  private calculateDefaultDuration(type: EventType, data: EventData): number {
    switch (type) {
      case 'move':
        const moveData = data as MoveEventData
        const distance = this.calculatePathDistance(moveData.path)
        return Math.max(1000, (distance / moveData.speed) * 1000) // Convert to milliseconds

      case 'attack':
        return 2000 // 2 seconds for attack animation

      case 'spell':
        const spellData = data as SpellEventData
        return 1500 + (spellData.spellLevel * 300) // Base + level scaling

      case 'interaction':
        const interactionData = data as InteractionEventData
        return interactionData.duration

      case 'environmental':
        const envData = data as EnvironmentalEventData
        return envData.duration

      case 'sequence':
        return 3000 // Default sequence duration

      default:
        return 1500 // Default duration
    }
  }

  /**
   * Validation methods for each event type
   */
  private validateMoveEvent(data: MoveEventData, errors: any[], warnings: any[]): void {
    if (!data.tokenId) {
      errors.push({ field: 'tokenId', message: 'Token ID is required for move events', code: 'MISSING_TOKEN_ID' })
    }

    if (!data.startPosition || !data.endPosition) {
      errors.push({ field: 'position', message: 'Start and end positions are required', code: 'MISSING_POSITIONS' })
    }

    if (data.path.length < 2) {
      warnings.push({ field: 'path', message: 'Path should contain at least start and end points', code: 'SHORT_PATH' })
    }

    if (data.speed <= 0) {
      errors.push({ field: 'speed', message: 'Speed must be positive', code: 'INVALID_SPEED' })
    }
  }

  private validateAttackEvent(data: AttackEventData, errors: any[], warnings: any[]): void {
    if (!data.attackerId) {
      errors.push({ field: 'attackerId', message: 'Attacker ID is required', code: 'MISSING_ATTACKER' })
    }

    if (!data.targetId && !data.targetPosition) {
      errors.push({ field: 'target', message: 'Either target ID or target position is required', code: 'MISSING_TARGET' })
    }

    if (data.damage && data.damage.amount < 0) {
      errors.push({ field: 'damage', message: 'Damage amount cannot be negative', code: 'INVALID_DAMAGE' })
    }

    if (!data.weapon) {
      errors.push({ field: 'weapon', message: 'Weapon data is required for attack events', code: 'MISSING_WEAPON' })
    }
  }

  private validateSpellEvent(data: SpellEventData, errors: any[], warnings: any[]): void {
    if (!data.casterId) {
      errors.push({ field: 'casterId', message: 'Caster ID is required', code: 'MISSING_CASTER' })
    }

    if (!data.spellId) {
      errors.push({ field: 'spellId', message: 'Spell ID is required', code: 'MISSING_SPELL_ID' })
    }

    if (data.spellLevel < 0 || data.spellLevel > 9) {
      errors.push({ field: 'spellLevel', message: 'Spell level must be between 0 and 9', code: 'INVALID_SPELL_LEVEL' })
    }

    if (data.targets.length === 0 && data.targetType !== 'self') {
      warnings.push({ field: 'targets', message: 'Spell has no targets', code: 'NO_TARGETS' })
    }
  }

  private validateInteractionEvent(data: InteractionEventData, errors: any[], warnings: any[]): void {
    if (!data.actorId) {
      errors.push({ field: 'actorId', message: 'Actor ID is required', code: 'MISSING_ACTOR' })
    }

    if (!data.targetId) {
      errors.push({ field: 'targetId', message: 'Target ID is required', code: 'MISSING_TARGET' })
    }

    if (data.duration <= 0) {
      errors.push({ field: 'duration', message: 'Duration must be positive', code: 'INVALID_DURATION' })
    }

    if (data.skillCheck && data.skillCheck.dc <= 0) {
      errors.push({ field: 'skillCheck.dc', message: 'Skill check DC must be positive', code: 'INVALID_DC' })
    }
  }

  private validateEnvironmentalEvent(data: EnvironmentalEventData, errors: any[], warnings: any[]): void {
    if (data.intensity < 0 || data.intensity > 100) {
      errors.push({ field: 'intensity', message: 'Intensity must be between 0 and 100', code: 'INVALID_INTENSITY' })
    }

    if (data.duration <= 0) {
      errors.push({ field: 'duration', message: 'Duration must be positive', code: 'INVALID_DURATION' })
    }

    if (!data.area) {
      errors.push({ field: 'area', message: 'Effect area is required', code: 'MISSING_AREA' })
    }
  }

  private validateSequenceEvent(data: SequenceEventData, errors: any[], warnings: any[]): void {
    if (data.events.length === 0) {
      errors.push({ field: 'events', message: 'Sequence must contain at least one event', code: 'EMPTY_SEQUENCE' })
    }

    if (data.events.length > 10) {
      warnings.push({ field: 'events', message: 'Large sequences may impact performance', code: 'LARGE_SEQUENCE' })
    }

    // Validate each sub-event
    for (let i = 0; i < data.events.length; i++) {
      const subEvent = data.events[i]
      const subValidation = this.validateEventData(subEvent.type, subEvent)

      for (const error of subValidation.errors) {
        errors.push({
          field: `events[${i}].${error.field}`,
          message: error.message,
          code: error.code
        })
      }
    }
  }

  /**
   * Processing methods for each event type
   */
  private processMoveEvent(data: MoveEventData): ProcessedEventData {
    return {
      type: 'animation',
      animationType: 'move',
      target: data.tokenId,
      parameters: {
        path: data.path,
        speed: data.speed,
        easing: data.easing,
        shouldRotate: data.shouldRotate
      }
    }
  }

  private processAttackEvent(data: AttackEventData): ProcessedEventData {
    return {
      type: 'animation',
      animationType: 'attack',
      target: data.attackerId,
      parameters: {
        attackType: data.attackType,
        targetId: data.targetId,
        targetPosition: data.targetPosition,
        weapon: data.weapon,
        damage: data.damage,
        criticalHit: data.criticalHit,
        effects: data.effects
      }
    }
  }

  private processSpellEvent(data: SpellEventData): ProcessedEventData {
    return {
      type: 'animation',
      animationType: 'spell',
      target: data.casterId,
      parameters: {
        spellId: data.spellId,
        targets: data.targets,
        spellLevel: data.spellLevel,
        effects: data.effects,
        concentration: data.concentration
      }
    }
  }

  private processInteractionEvent(data: InteractionEventData): ProcessedEventData {
    return {
      type: 'interaction',
      target: data.targetId,
      parameters: {
        actorId: data.actorId,
        interactionType: data.interactionType,
        duration: data.duration,
        skillCheck: data.skillCheck,
        canFail: data.canFail
      }
    }
  }

  private processEnvironmentalEvent(data: EnvironmentalEventData): ProcessedEventData {
    return {
      type: 'environmental',
      parameters: {
        effectType: data.effectType,
        area: data.area,
        intensity: data.intensity,
        duration: data.duration,
        weatherType: data.weatherType,
        terrainEffect: data.terrainEffect,
        lightingChange: data.lightingChange
      }
    }
  }

  private processSequenceEvent(data: SequenceEventData): ProcessedEventData {
    return {
      type: 'sequence',
      parameters: {
        sequenceType: data.sequenceType,
        events: data.events.map(e => this.processEventData({
          id: nanoid() as EventId,
          roundId: nanoid() as RoundId,
          name: 'Sub-event',
          type: e.type,
          order: 0,
          data: e,
          duration: 0,
          canSkip: true,
          isExecuted: false,
          executionTime: null
        })),
        parallelExecution: data.parallelExecution,
        conditions: data.conditions,
        stopOnFailure: data.stopOnFailure
      }
    }
  }

  /**
   * Calculate total distance of a path
   */
  private calculatePathDistance(path: Array<{ x: number; y: number }>): number {
    if (path.length < 2) return 0

    let totalDistance = 0
    for (let i = 1; i < path.length; i++) {
      const dx = path[i].x - path[i - 1].x
      const dy = path[i].y - path[i - 1].y
      totalDistance += Math.sqrt(dx * dx + dy * dy)
    }

    return totalDistance
  }
}

/**
 * Processed event data ready for execution
 */
export type ProcessedEventData = {
  readonly type: 'animation' | 'interaction' | 'environmental' | 'sequence'
  readonly animationType?: string
  readonly target?: string
  readonly parameters: Record<string, unknown>
}