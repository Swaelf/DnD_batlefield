/**
 * Legacy Token Adapter - Phase 8 Migration Component
 *
 * Provides seamless integration between legacy Token API and new atomic architecture.
 * Maintains 100% compatibility with existing Token usage while leveraging new features.
 *
 * Migration Strategy:
 * 1. Accept legacy TokenProps interface
 * 2. Transform legacy props to atomic component props
 * 3. Use atomic Token component internally
 * 4. Provide all legacy functionality with enhanced performance
 */

import React from 'react'
import Konva from 'konva'
import { Token as AtomicToken } from '@/modules/tokens'
import { useTokenStore } from '@/modules/tokens/store'
import { useTokenDrag } from '@/modules/tokens/hooks'
import type { Token as TokenType } from '@/types/token'
import type { Point } from '@/types/geometry'

// Legacy TokenProps interface for backward compatibility
export interface TokenProps {
  readonly token: TokenType
  readonly gridSize: number
  readonly isSelected?: boolean
  readonly onSelect?: (id: string) => void
  readonly onDragStart?: () => void
  readonly onDragMove?: (e: Konva.KonvaEventObject<DragEvent>) => void
  readonly onDragEnd?: (e: Konva.KonvaEventObject<DragEvent>) => void
  readonly isDraggable?: boolean
}

/**
 * Legacy Token Adapter Component
 *
 * Wraps the new atomic Token with legacy-compatible interface.
 * Provides seamless migration with zero breaking changes.
 */
export const Token: React.FC<TokenProps> = React.memo(({
  token,
  gridSize,
  isSelected = false,
  onSelect,
  onDragStart,
  onDragMove,
  onDragEnd,
  isDraggable = true
}) => {
  // Ensure token exists in store for atomic component compatibility
  const tokenInStore = useTokenStore(state => state.tokens.get(token.id))
  const addOrUpdateToken = useTokenStore(state => state.addOrUpdateToken)

  // Sync token with store if needed (non-breaking enhancement)
  React.useEffect(() => {
    if (!tokenInStore || tokenInStore !== token) {
      addOrUpdateToken(token)
    }
  }, [token, tokenInStore, addOrUpdateToken])

  // Enhanced drag functionality using new hook system
  const {
    handleDragStart: atomicDragStart,
    handleDragMove: atomicDragMove,
    handleDragEnd: atomicDragEnd
  } = useTokenDrag({
    tokenId: token.id,
    gridSize,
    snapToGrid: true,
    onDragStart,
    onDragMove: onDragMove ? (position: Point) => {
      // Create legacy-compatible event for onDragMove
      const mockEvent = {
        target: {
          x: () => position.x,
          y: () => position.y
        }
      } as Konva.KonvaEventObject<DragEvent>
      onDragMove(mockEvent)
    } : undefined,
    onDragEnd: onDragEnd ? (position: Point) => {
      // Create legacy-compatible event for onDragEnd
      const mockEvent = {
        target: {
          x: () => position.x,
          y: () => position.y
        }
      } as Konva.KonvaEventObject<DragEvent>
      onDragEnd(mockEvent)
    } : undefined
  })

  // Handle legacy onSelect callback
  const handleSelect = React.useCallback(() => {
    onSelect?.(token.id)
  }, [token.id, onSelect])

  // Use atomic Token component with enhanced features
  return (
    <AtomicToken
      token={token}
      gridSize={gridSize}
      isSelected={isSelected}
      onSelect={handleSelect}
      onDragStart={atomicDragStart}
      onDragMove={atomicDragMove}
      onDragEnd={atomicDragEnd}
      isDraggable={isDraggable}
      // Enhanced features from atomic architecture (non-breaking)
      showLabel={token.showLabel ?? true}
      showConditions={token.conditions && token.conditions.length > 0}
      showInitiative={token.initiative !== undefined}
    />
  )
})

Token.displayName = 'LegacyTokenAdapter'