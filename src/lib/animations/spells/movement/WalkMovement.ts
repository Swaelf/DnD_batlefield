/**
 * Walk Movement
 *
 * D&D 5e Specs:
 * - Standard movement action
 * - Speed: 30 feet per round (typical)
 * - No special requirements
 * - Provokes opportunity attacks
 *
 * Animation Features:
 * - Linear interpolation
 * - Standard duration (1000ms)
 * - Blue trail
 */

import { AbstractMovement, type MovementConfig } from '../../core/AbstractMovement'
import type { Point } from '../../types'

export type WalkConfig = {
  fromPosition: Point
  toPosition: Point
  speed?: number // Movement speed in feet per round
}

export class WalkMovement extends AbstractMovement {
  constructor(config: WalkConfig) {
    const { fromPosition, toPosition, speed = 30 } = config

    const movementConfig: MovementConfig = {
      name: 'Walk',
      fromPosition,
      toPosition,
      movementType: 'walk',
      color: '#4A90E2', // Blue
      duration: 1000, // 1 second
      easing: 'linear',
      showTrail: false,
      speed,
      requiresCheck: false,
      metadata: {
        provokesOpportunityAttacks: true,
        costsAction: false, // Movement is separate from action
        doubleSpeed: false
      }
    }

    super(movementConfig)
  }

  /**
   * Create walk movement
   */
  static create(from: Point, to: Point): WalkMovement {
    return new WalkMovement({ fromPosition: from, toPosition: to })
  }

  /**
   * Create walk with custom speed
   */
  static createWithSpeed(from: Point, to: Point, speed: number): WalkMovement {
    return new WalkMovement({ fromPosition: from, toPosition: to, speed })
  }
}
