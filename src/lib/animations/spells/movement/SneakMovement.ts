/**
 * Sneak Movement
 *
 * D&D 5e Specs:
 * - Stealthy movement to avoid detection
 * - Requires Stealth check (DC varies)
 * - Half speed movement
 * - Does not provoke if successful
 *
 * Animation Features:
 * - Slower, deliberate easing
 * - Purple translucent trail
 * - 1500ms duration (slower pace)
 * - Lower opacity (0.5)
 */

import { AbstractMovement, type MovementConfig } from '../../core/AbstractMovement'
import type { Point } from '../../types'

export type SneakConfig = {
  fromPosition: Point
  toPosition: Point
  speed?: number
  stealthDC?: number
}

export class SneakMovement extends AbstractMovement {
  constructor(config: SneakConfig) {
    const { fromPosition, toPosition, speed = 15, stealthDC = 12 } = config

    const movementConfig: MovementConfig = {
      name: 'Sneak',
      fromPosition,
      toPosition,
      movementType: 'stealth',
      color: '#6A4C93', // Purple
      duration: 1500,
      easing: 'ease-in-out',
      showTrail: false,
      speed,
      requiresCheck: true,
      dc: stealthDC,
      skill: 'Stealth',
      metadata: {
        provokesOpportunityAttacks: false, // If successful
        costsAction: false,
        halfSpeed: true,
        opacity: 0.5
      }
    }

    super(movementConfig)
  }

  static create(from: Point, to: Point): SneakMovement {
    return new SneakMovement({ fromPosition: from, toPosition: to })
  }

  static createWithDC(from: Point, to: Point, dc: number): SneakMovement {
    return new SneakMovement({ fromPosition: from, toPosition: to, stealthDC: dc })
  }
}
