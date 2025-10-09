/**
 * Teleport Movement
 *
 * D&D 5e Specs:
 * - Magical instant transportation
 * - No distance limit (spell-specific)
 * - Does not provoke opportunity attacks
 * - Requires spell slot or ability
 *
 * Animation Features:
 * - Very fast (400ms)
 * - Instant easing
 * - Purple mystical color
 * - Particle effects at start and end
 */

import { AbstractMovement, type MovementConfig } from '../../core/AbstractMovement'
import type { Point } from '../../types'

export type TeleportConfig = {
  fromPosition: Point
  toPosition: Point
  spellLevel?: number // Spell level (if using spell)
}

export class TeleportMovement extends AbstractMovement {
  constructor(config: TeleportConfig) {
    const { fromPosition, toPosition, spellLevel = 2 } = config

    const movementConfig: MovementConfig = {
      name: 'Teleport',
      fromPosition,
      toPosition,
      movementType: 'teleport',
      color: '#9370DB', // Medium purple
      duration: 400, // Very fast
      easing: 'ease-in-out', // Instant feel
      showTrail: false, // No trail for teleport
      showParticles: true, // Magical particles
      speed: 999, // Effectively instant
      requiresCheck: false,
      metadata: {
        provokesOpportunityAttacks: false, // Teleport doesn't provoke
        costsAction: true,
        magical: true,
        spellLevel,
        instant: true
      }
    }

    super(movementConfig)
  }

  /**
   * Create teleport movement
   */
  static create(from: Point, to: Point): TeleportMovement {
    return new TeleportMovement({ fromPosition: from, toPosition: to })
  }

  /**
   * Create teleport with custom spell level
   */
  static createWithSpellLevel(from: Point, to: Point, spellLevel: number): TeleportMovement {
    return new TeleportMovement({ fromPosition: from, toPosition: to, spellLevel })
  }
}
