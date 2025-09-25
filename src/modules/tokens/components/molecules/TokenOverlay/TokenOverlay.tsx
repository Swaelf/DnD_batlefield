/**
 * TokenOverlay Molecule Component
 *
 * Combines conditions, initiative, and label display for token overlays.
 * Manages positioning and visibility of token UI elements.
 * Molecular design: 60-90 lines, overlay composition focus.
 */

import React from 'react'
import { Group } from 'react-konva'
import { TokenLabel, TokenInitiative, TokenCondition } from '../../atoms'
import type { Token, ConditionType } from '../../../types'
import { isValidCondition } from '../../../constants'

export interface TokenOverlayProps {
  readonly token: Token
  readonly gridSize: number
  readonly showLabel?: boolean
  readonly showInitiative?: boolean
  readonly showConditions?: boolean
  readonly maxConditionsVisible?: number
}

export const TokenOverlay: React.FC<TokenOverlayProps> = React.memo(({
  token,
  gridSize,
  showLabel = true,
  showInitiative = true,
  showConditions = true,
  maxConditionsVisible = 8
}) => {
  const { position, size, label, initiative, conditions } = token

  // Calculate token radius for positioning
  const radius = React.useMemo(() => {
    const gridSquares = size === 'tiny' ? 0.5 :
                      size === 'small' || size === 'medium' ? 1 :
                      size === 'large' ? 2 :
                      size === 'huge' ? 3 : 4 // gargantuan

    return (gridSquares * gridSize) / 2
  }, [size, gridSize])

  // Filter and validate conditions
  const validConditions = React.useMemo(() => {
    return conditions
      .filter(condition => isValidCondition(condition))
      .slice(0, maxConditionsVisible) as ConditionType[]
  }, [conditions, maxConditionsVisible])

  const hasInitiative = initiative !== undefined
  const hasConditions = validConditions.length > 0
  const hasLabel = showLabel && label.position !== 'hidden' && label.text.trim()

  return (
    <Group>
      {/* Token label */}
      {hasLabel && (
        <TokenLabel
          text={label.text}
          x={position.x}
          y={position.y}
          tokenRadius={radius}
          position={label.position}
          color={label.color}
          fontSize={label.fontSize}
          offset={label.offset}
        />
      )}

      {/* Initiative badge */}
      {showInitiative && hasInitiative && (
        <TokenInitiative
          value={initiative}
          x={position.x}
          y={position.y}
          tokenRadius={radius}
        />
      )}

      {/* Condition indicators */}
      {showConditions && hasConditions && (
        <Group>
          {validConditions.map((condition, index) => (
            <TokenCondition
              key={condition}
              condition={condition}
              x={position.x}
              y={position.y + radius + 15} // Below token
              index={index}
              animated={true}
            />
          ))}
        </Group>
      )}

      {/* Condition overflow indicator */}
      {showConditions && conditions.length > maxConditionsVisible && (
        <TokenCondition
          condition="stunned" // Use as "more" indicator
          x={position.x}
          y={position.y + radius + 15}
          index={maxConditionsVisible}
          animated={false}
        />
      )}
    </Group>
  )
})