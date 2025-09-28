/**
 * Token Organism Component
 *
 * Complete token rendering with all features: visuals, overlays, interactions.
 * Replaces the legacy Token.tsx component with atomic architecture.
 * Organism design: 100-150 lines, complete token functionality.
 */

import React from 'react'
import { Group } from 'react-konva'
import type Konva from 'konva'
import { TokenVisuals, TokenOverlay } from '../../molecules'
import type { Token as TokenType } from '../../../types'

export interface TokenProps {
  readonly token: TokenType
  readonly gridSize: number
  readonly isSelected?: boolean
  readonly isHovered?: boolean
  readonly isDraggable?: boolean
  readonly onSelect?: (id: string) => void
  readonly onHover?: (id: string | null) => void
  readonly onDragStart?: () => void
  readonly onDragMove?: (e: Konva.KonvaEventObject<DragEvent>) => void
  readonly onDragEnd?: (e: Konva.KonvaEventObject<DragEvent>) => void
  readonly showLabel?: boolean
  readonly showInitiative?: boolean
  readonly showConditions?: boolean
  readonly aura?: {
    readonly radius: number
    readonly color: string
    readonly animated?: boolean
  }
}

export const Token: React.FC<TokenProps> = React.memo(({
  token,
  gridSize,
  isSelected = false,
  isHovered = false,
  isDraggable = true,
  onSelect,
  onHover,
  onDragStart,
  onDragMove,
  onDragEnd,
  showLabel = true,
  showInitiative = true,
  showConditions = true,
  aura
}) => {
  const groupRef = React.useRef<Konva.Group>(null)
  const [isDragging, setIsDragging] = React.useState(false)

  // Handle click/tap for selection
  const handleClick = React.useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true
    if (!isDragging) {
      onSelect?.(token.id)
    }
  }, [token.id, onSelect, isDragging])

  // Handle mouse enter for hover
  const handleMouseEnter = React.useCallback(() => {
    if (groupRef.current) {
      groupRef.current.getStage()!.container().style.cursor = 'pointer'
    }
    onHover?.(token.id)
  }, [token.id, onHover])

  // Handle mouse leave
  const handleMouseLeave = React.useCallback(() => {
    if (groupRef.current) {
      groupRef.current.getStage()!.container().style.cursor = 'default'
    }
    onHover?.(null)
  }, [onHover])

  // Handle drag start
  const handleDragStart = React.useCallback(() => {
    setIsDragging(true)
    onDragStart?.()
  }, [onDragStart])

  // Handle drag move with grid snapping
  const handleDragMove = React.useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    if (gridSize > 0) {
      const stage = e.target.getStage()
      if (stage) {
        const pos = stage.getPointerPosition()
        if (pos) {
          // Snap to grid
          const snappedX = Math.round(pos.x / gridSize) * gridSize
          const snappedY = Math.round(pos.y / gridSize) * gridSize
          e.target.x(snappedX)
          e.target.y(snappedY)
        }
      }
    }
    onDragMove?.(e)
  }, [gridSize, onDragMove])

  // Handle drag end
  const handleDragEnd = React.useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    setTimeout(() => setIsDragging(false), 0) // Delay to prevent click after drag
    onDragEnd?.(e)
  }, [onDragEnd])

  // Don't render invisible tokens
  if (!token.isVisible) {
    return null
  }

  return (
    <Group
      ref={groupRef}
      x={token.position.x}
      y={token.position.y}
      draggable={isDraggable && !token.isLocked}
      onClick={handleClick}
      onTap={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
      {/* Main token visuals */}
      <TokenVisuals
        token={token}
        gridSize={gridSize}
        isSelected={isSelected}
        isDragging={isDragging}
        isHovered={isHovered}
        aura={aura}
      />

      {/* Token overlays (conditions, initiative, label) */}
      <TokenOverlay
        token={token}
        gridSize={gridSize}
        showLabel={showLabel}
        showInitiative={showInitiative}
        showConditions={showConditions}
      />

      {/* Locked indicator */}
      {token.isLocked && (
        <Group>
          {/* This would show a lock icon in real implementation */}
        </Group>
      )}
    </Group>
  )
})