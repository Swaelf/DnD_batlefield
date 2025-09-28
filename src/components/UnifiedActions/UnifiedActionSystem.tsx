import { memo, useEffect, useRef } from 'react'
import { Group } from 'react-konva'
import type Konva from 'konva'
import { useUnifiedActionStore } from '@/store/unifiedActionStore'
import useMapStore from '@/store/mapStore'
import { ActionRenderer } from './ActionRenderer'
import { TargetHighlighter } from './TargetHighlighter'
import { detectAffectedTokens } from '@/utils/targetDetection'
import type { Token } from '@/types'
import type { UnifiedAction } from '@/types/unifiedAction'

type UnifiedActionSystemProps = {
  enabled?: boolean
  onActionComplete?: (action: UnifiedAction) => void
  onAllComplete?: () => void
}

const UnifiedActionSystemComponent = ({
  enabled = true,
  onActionComplete,
  onAllComplete
}: UnifiedActionSystemProps) => {
  const activeActions = useUnifiedActionStore(state => state.activeActions)
  // const completeAction = useUnifiedActionStore(state => state.completeAction) // unused
  const highlightTargets = useUnifiedActionStore(state => state.highlightTargets)
  const clearHighlight = useUnifiedActionStore(state => state.clearHighlight)
  const currentMap = useMapStore(state => state.currentMap)
  const groupRef = useRef<Konva.Group>(null)
  const previousActionsRef = useRef<UnifiedAction[]>([])

  // Get all tokens from the map
  const tokens = (currentMap?.objects.filter(obj => obj.type === 'token') || []) as Token[]

  // Handle action lifecycle
  useEffect(() => {
    if (!enabled) return

    // Check for new actions
    const newActions = activeActions.filter(
      action => !previousActionsRef.current.find(prev => prev.id === action.id)
    )

    // Process new actions
    newActions.forEach(action => {
      console.log(`[UnifiedActionSystem] Starting action: ${action.metadata.name} (${action.id})`)

      // Detect and highlight affected targets
      const affectedTokens = detectAffectedTokens(action, tokens)
      if (affectedTokens.length > 0) {
        const tokenIds = affectedTokens.map(t => t.id)
        highlightTargets(tokenIds, action.id, action.animation.color || '#FFD700')
      }

      // Log affected targets
      if (affectedTokens.length > 0) {
        console.log(`[UnifiedActionSystem] Action ${action.metadata.name} affects:`,
          affectedTokens.map(t => t.name || t.id).join(', '))
      }
    })

    // Check for completed actions
    const completedActions = previousActionsRef.current.filter(
      prev => !activeActions.find(action => action.id === prev.id)
    )

    completedActions.forEach(action => {
      console.log(`[UnifiedActionSystem] Completed action: ${action.metadata.name} (${action.id})`)

      // Clear highlights for this action
      clearHighlight(action.id)

      // Notify external handlers
      onActionComplete?.(action)
    })

    // Check if all actions completed
    if (previousActionsRef.current.length > 0 && activeActions.length === 0) {
      console.log('[UnifiedActionSystem] All actions completed')
      onAllComplete?.()
    }

    // Update reference
    previousActionsRef.current = [...activeActions]
  }, [activeActions, tokens, enabled, highlightTargets, clearHighlight, onActionComplete, onAllComplete])

  // Handle cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear all highlights when component unmounts
      const store = useUnifiedActionStore.getState()
      store.clearAllHighlights()
    }
  }, [])

  if (!enabled || !currentMap) return null

  return (
    <Group ref={groupRef} listening={false}>
      {/* Target highlighting layer */}
      <TargetHighlighter
        showAreaPreviews={true}
        pulseAnimation={true}
      />

      {/* Action rendering layer */}
      {activeActions.map(action => (
        <ActionRenderer
          key={action.id}
          action={action}
          onAnimationComplete={(actionId) => {
            console.log(`[UnifiedActionSystem] Animation complete for: ${actionId}`)
            // The ActionRenderer already calls completeAction internally
          }}
        />
      ))}
    </Group>
  )
}

export const UnifiedActionSystem = memo(UnifiedActionSystemComponent)