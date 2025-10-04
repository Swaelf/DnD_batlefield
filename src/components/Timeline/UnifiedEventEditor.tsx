import { useState, useEffect, memo, useMemo } from 'react'
import { Plus, X, Sparkles } from '@/utils/optimizedIcons'
import useTimelineStore from '@/store/timelineStore'
import useMapStore from '@/store/mapStore'
import useEventCreationStore from '@/store/eventCreationStore'
import useAnimationStore from '@/store/animationStore'
import { useUnifiedActionStore } from '@/store/unifiedActionStore'
import type { Token } from '@/types/token'
import type { Position } from '@/types/map'
import type { UnifiedAction } from '@/types/unifiedAction'
// ActionId is just a string identifier
type ActionId = string
import { createUnifiedRoundEvent } from '@/types/timelineUnified'
import { Box, Text, Button } from '@/components/primitives'
import { Modal } from '@/components/ui/Modal'
import { ActionSelectionModal } from './ActionSelectionModal'
import { ActionCustomizationModal } from './ActionCustomizationModal'
import {
  EventsList,
  SelectToken,
  SelectTarget,
  SelectAction,
  ActionPreview
} from './EventEditor/index'
import type { EventType } from '@/types'
import { getEnvironmentTokenCanvasPosition } from '@/utils/stageRegistry'

// All styled components removed - using primitive components with style props

type UnifiedEventEditorProps = {
  isOpen: boolean
  onClose: () => void
  tokenId?: string
  roundNumber?: number
}

const UnifiedEventEditorComponent = ({
  isOpen,
  onClose,
  tokenId: initialTokenId
}: UnifiedEventEditorProps) => {
  // Use specific selectors to prevent unnecessary re-renders
  const currentEvent = useTimelineStore(state => state.currentEvent)
  const timeline = useTimelineStore(state => state.timeline)
  const addAction = useTimelineStore(state => state.addAction)
  const removeAction = useTimelineStore(state => state.removeAction)
  const currentMap = useMapStore(state => state.currentMap)
  const spellPreviewEnabled = useMapStore(state => state.spellPreviewEnabled)
  const toggleSpellPreview = useMapStore(state => state.toggleSpellPreview)
  const executeAction = useUnifiedActionStore(state => state.executeAction)
  const pauseAnimations = useAnimationStore(state => state.pauseAnimations)
  const resumeAnimations = useAnimationStore(state => state.resumeAnimations)
  const cancelEventCreation = useEventCreationStore(state => state.cancelEventCreation)

  const [selectedToken, setSelectedToken] = useState<string>(initialTokenId || '')
  const [selectedAction, setSelectedAction] = useState<UnifiedAction | null>(null)
  const [isActionModalOpen, setIsActionModalOpen] = useState(false)
  const [isCustomizationModalOpen, setIsCustomizationModalOpen] = useState(false)
  const [actionToCustomize, setActionToCustomize] = useState<UnifiedAction | null>(null)
  const [targetPosition, setTargetPosition] = useState<Position>({ x: 0, y: 0 })
  const [targetTokenId, setTargetTokenId] = useState<string>('')
  const [isTemporarilyHidden, setIsTemporarilyHidden] = useState(false)
  const [targetingMode, setTargetingMode] = useState<'position' | 'token' | null>(null) // Track user's explicit targeting choice
  const [useEnvironmentToken, setUseEnvironmentToken] = useState(false)

  // Handle modal close with proper cleanup
  const handleClose = () => {
    // Clean up event creation state to restore preview modes
    cancelEventCreation()
    // Call the original onClose
    onClose()
  }

  // Fixed values
  const targetEvent = currentEvent // Events execute in current event, not next

  // Use specific selectors to prevent unnecessary re-renders
  const isPicking = useEventCreationStore(state => state.isPicking)
  const startPickingPosition = useEventCreationStore(state => state.startPickingPosition)
  const startPickingToken = useEventCreationStore(state => state.startPickingToken)
  const pickedToPosition = useEventCreationStore(state => state.toPosition)
  const pickedTokenId = useEventCreationStore(state => state.selectedTokenId)

  // Get all tokens from the current map
  const tokens = useMemo(() => {
    if (!isOpen) return []

    const filteredTokens = (currentMap?.objects.filter(obj =>
      obj.type === 'token' && obj.id !== 'void-token'
    ) as Token[]) || []

    return filteredTokens
  }, [isOpen, currentMap?.objects])

  // Get actions for the current event
  const currentRoundData = timeline?.rounds.find(r => r.number === 1) // Round 1 for now
  const eventActions = currentRoundData?.events.find(e => e.number === currentEvent)?.actions || []

  useEffect(() => {
    if (selectedToken && currentMap) {
      const token = currentMap.objects.find(obj => obj.id === selectedToken)
      if (token) {
        setTargetPosition({ x: token.position.x + 100, y: token.position.y })
      }
    }
  }, [selectedToken, currentMap])

  useEffect(() => {
    if (pickedToPosition && isPicking === null && isTemporarilyHidden) {
      setTargetPosition(pickedToPosition)
      // Clear the picked position so we can pick again
      setTimeout(() => {
        const eventStore = useEventCreationStore.getState()
        eventStore.setPosition('to', { x: 0, y: 0 }) // Reset to allow re-picking
      }, 50)
      setIsTemporarilyHidden(false)
    }
  }, [pickedToPosition, isPicking, isTemporarilyHidden])

  // Performance optimization: Pause animations when modal is open
  useEffect(() => {
    if (isOpen && !isTemporarilyHidden) {
      pauseAnimations()
    } else {
      resumeAnimations()
    }

    // Cleanup: Resume animations when component unmounts
    return () => {
      resumeAnimations()
    }
  }, [isOpen, isTemporarilyHidden, pauseAnimations, resumeAnimations])

  // Handle token picking for main token selection
  useEffect(() => {
    if (pickedTokenId && isPicking === 'token' && isTemporarilyHidden) {
      setSelectedToken(pickedTokenId) // Set the local component state
      // Clear the picking state and show the modal again
      const eventStore = useEventCreationStore.getState()
      eventStore.setPickingMode(null)
      // For token picking, clear the selectedTokenId to allow re-picking
      // Use a small delay to ensure state updates properly
      setTimeout(() => {
        eventStore.setSelectedToken('')
      }, 50)
      setIsTemporarilyHidden(false)
    }
  }, [pickedTokenId, isPicking, isTemporarilyHidden])

  // Handle target token picking
  useEffect(() => {
    if (pickedTokenId && isPicking === 'targetToken' && isTemporarilyHidden) {
      // When a token is picked as target, set the targetTokenId and target position
      setTargetTokenId(pickedTokenId)
      const token = tokens.find(t => t.id === pickedTokenId)
      if (token) {
        setTargetPosition(token.position)
      }
      // Clear the picking state and store state, then show the modal again
      const eventStore = useEventCreationStore.getState()
      eventStore.setPickingMode(null)
      eventStore.setSelectedToken('') // Clear the picked token ID so we can pick again
      setIsTemporarilyHidden(false)
    }
  }, [pickedTokenId, isPicking, isTemporarilyHidden, tokens])

  // Handle when picking is cancelled (e.g., by pressing Escape)
  useEffect(() => {
    // If modal was temporarily hidden for picking, but picking is now null (cancelled)
    // then show the modal again
    if (isTemporarilyHidden && !isPicking) {
      setIsTemporarilyHidden(false)
    }
  }, [isPicking, isTemporarilyHidden])

  const handleActionSelect = (action: UnifiedAction) => {
    setSelectedAction(action)

    // Note: Spell preview is now handled by the mapStore.spellPreviewEnabled flag
    // The unified action contains all necessary data for preview
  }

  const handleActionEdit = (action: UnifiedAction) => {
    setActionToCustomize(action)
    setIsActionModalOpen(false)
    setIsCustomizationModalOpen(true)
  }

  const handleCustomActionSave = (customAction: UnifiedAction) => {
    setSelectedAction(customAction)
    setIsCustomizationModalOpen(false)
  }

  const handleAddEvent = () => {
    if (!selectedAction || !selectedToken || !currentMap) return

    const token = currentMap.objects.find(obj => obj.id === selectedToken)
    if (!token) return

    // Calculate source position for environment token
    // For environment token, use viewport-relative bottom-left corner
    let sourcePosition = token.position
    if (useEnvironmentToken && token.id === 'void-token') {
      // Use utility function to get viewport-relative position
      sourcePosition = getEnvironmentTokenCanvasPosition()
    }

    // Use the explicitly selected target token ID if available,
    // otherwise fall back to position-based detection for backwards compatibility
    let finalTargetTokenId = targetTokenId // Use the explicit target token selection


    // Only auto-detect tokens if user chose token targeting or hasn't made an explicit choice
    // If user explicitly chose position targeting, respect that choice and don't auto-detect
    if (!finalTargetTokenId && selectedAction.animation.trackTarget && targetingMode !== 'position') {
      const targetToken = currentMap.objects.find(obj =>
        obj.type === 'token' &&
        obj.id !== selectedToken && // Don't target self
        Math.abs(obj.position.x - targetPosition.x) < 25 && // Within 25 pixels
        Math.abs(obj.position.y - targetPosition.y) < 25
      )
      if (targetToken) {
        finalTargetTokenId = targetToken.id
      }
    }


    // Create a customized action based on the selected template and current context
    const customizedAction: UnifiedAction = {
      ...selectedAction,
      id: `action-${Date.now()}` as ActionId, // Generate new unique ID
      source: sourcePosition,      // Set source to calculated position (viewport-relative for environment token)
      target: targetPosition,      // Set target to selected position
      timestamp: Date.now(),
      animation: {
        ...selectedAction.animation,
        targetTokenId: finalTargetTokenId, // Use the determined target token ID
        trackTarget: !!(finalTargetTokenId && selectedAction.animation.trackTarget) // Only track if we have a target token
      }
    }

    // Add to unified action store for execution tracking
    executeAction(customizedAction)

    // Add to timeline as unified event
    createUnifiedRoundEvent(
      selectedToken,
      customizedAction,
      targetEvent
    )

    // For now, convert to legacy format for existing timelineStore
    // This will be updated when timelineStore is migrated to unified actions
    const legacyEventType = mapActionTypeToLegacyType(customizedAction.type) as EventType
    const legacyEventData = convertActionToLegacyData(customizedAction, finalTargetTokenId)

    addAction(selectedToken, legacyEventType, legacyEventData, targetEvent)

    // Reset form
    setSelectedAction(null)
    setTargetingMode(null) // Reset targeting mode for next event

    // Clean up event creation state to restore preview modes
    cancelEventCreation()
  }

  // Helper to map unified action types to legacy event types
  const mapActionTypeToLegacyType = (actionType: string): EventType => {
    switch (actionType) {
      case 'spell': return 'spell'
      case 'attack': return 'attack'
      case 'interaction': return 'interaction'
      case 'move': return 'move'
      default: return 'spell' // Default fallback
    }
  }

  // Helper to convert unified action to legacy event data
  const convertActionToLegacyData = (action: UnifiedAction, finalTargetTokenId?: string): any => {
    switch (action.type) {
      case 'spell':
        // Map unified animation types to legacy spell categories
        const legacyCategory = action.animation.type === 'projectile_burst' ? 'projectile-burst' : action.animation.type
        const result = {
          type: 'spell',
          tokenId: selectedToken, // ✅ FIX: Include caster token ID for position lookup
          spellName: action.metadata.name || 'Unknown Spell',
          category: legacyCategory || 'projectile',
          fromPosition: action.source,
          toPosition: action.target,
          color: action.animation.color || '#FF0000',
          secondaryColor: '#FFAA00', // Default yellow-orange for flame cores
          size: action.animation.size || 20,
          duration: action.animation.duration || 1000,
          // Pass through enhanced animation properties for projectile_burst
          projectileSpeed: action.animation.speed || 500,
          trailLength: action.animation.trailLength || 8,
          trailFade: action.animation.trailFade || 0.8,
          burstRadius: action.animation.burstSize || 80, // Map burstSize to burstRadius for ProjectileSpell compatibility
          burstDuration: action.animation.burstDuration || 600,
          burstColor: action.animation.burstColor || action.animation.color,
          persistDuration: action.animation.persistDuration || 0,
          persistColor: action.animation.persistColor || action.animation.color,
          persistOpacity: action.animation.persistOpacity || 0.4,
          // Cone spell properties
          coneAngle: action.animation.coneAngle || 60,
          particleEffect: action.animation.particles || false,
          // Curved projectile path properties
          curved: action.animation.curved || false,
          curveHeight: action.animation.curveHeight || 30,
          curveDirection: action.animation.curveDirection || 'auto',
          // Target tracking properties - only enable if we have a target token
          trackTarget: !!(finalTargetTokenId && action.animation.trackTarget),
          targetTokenId: finalTargetTokenId || ''
        }
        return result

      case 'attack':
        return {
          type: 'attack',
          tokenId: selectedToken, // ✅ FIX: Include attacker token ID for position lookup
          weaponName: action.metadata.name || 'Weapon',
          attackType: action.category, // Use category directly ('melee' or 'ranged')
          fromPosition: action.source,
          toPosition: action.target,
          damage: action.damage || '1d8',
          damageType: action.damageType || 'slashing',
          attackBonus: 5, // Default attack bonus
          range: action.range || 5,
          duration: action.animation.duration || 800,
          animation: action.animation.type, // Use the animation type from template
          color: action.animation.color || '#FFFFFF',
          isCritical: false,
          targetTokenId: finalTargetTokenId || ''
        }

      case 'interaction':
        return {
          type: 'interaction',
          interactionType: action.category || 'door',
          position: action.target,
          action: 'use',
          actor: selectedToken,
          duration: action.animation.duration || 600,
          effect: 'glow'
        }

      case 'move':
        return {
          type: 'move',
          fromPosition: action.source,
          toPosition: action.target,
          duration: action.animation.duration || 1000,
          easing: 'ease-in-out' as const
        }

      default:
        return {}
    }
  }

  const handleDeleteEvent = (eventId: string) => {
    removeAction(eventId)
  }

  const handlePositionPick = () => {
    // Clear target token when switching to position mode
    setTargetTokenId('')
    setTargetingMode('position') // Explicitly set position targeting mode
    startPickingPosition('to')
    setIsTemporarilyHidden(true)
  }

  const handleTokenPick = () => {
    startPickingToken()
    setIsTemporarilyHidden(true)
  }

  const handleTargetTokenPick = () => {
    // Clear target position when switching to token mode to avoid confusion
    setTargetPosition({ x: 0, y: 0 })
    setTargetingMode('token') // Explicitly set token targeting mode
    // Use a custom picking mode for target tokens
    const setPickingMode = useEventCreationStore.getState().setPickingMode
    setPickingMode('targetToken')
    setIsTemporarilyHidden(true)
  }

  const canAddEvent = () => {
    return selectedToken && selectedAction && (targetTokenId || targetPosition.x !== 0 || targetPosition.y !== 0)
  }

  if (!isOpen && !isTemporarilyHidden) {
    return null
  }

  return (
    <>
      <Modal
        isOpen={isOpen && !isTemporarilyHidden}
        onClose={handleClose}
        size="xl"
        padding="none"
        style={{
          backgroundColor: '#1A1A1A',
          border: '1px solid #374151',
          minHeight: '70vh'
        }}
      >
        <Box
          style={{
            display: 'flex',
            flexDirection: 'row',
            height: '70vh',
            overflow: 'hidden'
          }}
        >
          {/* Main Content - Left Side */}
          <Box
            style={{
              flex: 1,
              padding: '24px',
              overflowY: 'auto',
              backgroundColor: '#1A1A1A',
              borderRight: '1px solid #374151'
            }}
          >
            <Box
              style={{
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '24px',
                  paddingBottom: '16px',
                  borderBottom: '1px solid #374151'
                }}
              >
                <Box style={{ display: 'flex', flexDirection: 'column' }}>
                  <Text
                    variant="heading"
                    size="lg"
                    style={{
                      fontWeight: '600',
                      color: '#FFFFFF',
                      marginBottom: '4px'
                    }}
                  >
                    Create Action Event
                  </Text>
                  <Text
                    variant="body"
                    size="sm"
                    style={{ color: '#9CA3AF' }}
                  >
                    Schedule actions for Event {targetEvent}
                  </Text>
                </Box>

                <Button
                  variant="primary"
                  onClick={handleAddEvent}
                  disabled={!canAddEvent()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#C9AD6A',
                    color: '#000000',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '10px 16px',
                    fontWeight: '500'
                  }}
                >
                  <Plus size={16} />
                  Add Event
                </Button>
              </Box>

                <Box style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Token Selection */}
                  <SelectToken
                    selectedToken={selectedToken}
                    setSelectedToken={setSelectedToken}
                    tokens={tokens}
                    isPicking={isPicking}
                    onTokenPick={handleTokenPick}
                    useEnvironmentToken={useEnvironmentToken}
                    onUseEnvironmentTokenChange={setUseEnvironmentToken}
                  />

                  {/* Target Position */}
                  <SelectTarget
                    targetPosition={targetPosition}
                    targetTokenId={targetTokenId}
                    tokens={tokens}
                    onPositionPick={handlePositionPick}
                    onTargetTokenPick={handleTargetTokenPick}
                    isPicking={isPicking}
                  />

                  {/* Action Selection */}
                  <SelectAction
                    selectedAction={selectedAction}
                    onSelectAction={() => setIsActionModalOpen(true)}
                  />

                  {/* Action Preview */}
                  <ActionPreview selectedAction={selectedAction} targetTokenId={targetTokenId} />
                </Box>
            </Box>
          </Box>

          {/* Right Sidebar - Events List */}
          <EventsList
            roundEvents={eventActions}
            tokens={tokens}
            nextRound={currentEvent}
            onDeleteEvent={handleDeleteEvent}
          />
        </Box>

        {/* Footer */}
        <Box
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '8px',
            padding: '16px 24px',
            borderTop: '1px solid #374151',
            backgroundColor: '#1A1A1A'
          }}
        >
          {/* Action Preview Toggle */}
          <Button
            onClick={toggleSpellPreview}
            variant="secondary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              borderRadius: '6px',
              backgroundColor: spellPreviewEnabled ? 'rgba(201, 173, 106, 0.2)' : '#374151',
              color: spellPreviewEnabled ? '#C9AD6A' : '#9CA3AF',
              border: spellPreviewEnabled ? '1px solid #C9AD6A' : '1px solid #4B5563'
            }}
            title={spellPreviewEnabled ? 'Disable Action Preview (Spells & Movement)' : 'Enable Action Preview (Spells & Movement)'}
          >
            <Sparkles size={14} />
            <Text
              variant="body"
              size="xs"
              style={{ fontWeight: '500' }}
            >
              {spellPreviewEnabled ? 'Preview: ON' : 'Preview: OFF'}
            </Text>
          </Button>

          {/* Close Button */}
          <Button
            onClick={handleClose}
            variant="secondary"
            style={{
              backgroundColor: '#374151',
              color: '#D1D5DB',
              border: '1px solid #4B5563',
              borderRadius: '6px',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <X size={16} />
            Close
          </Button>
        </Box>
      </Modal>

      {/* Action Selection Modal */}
      <ActionSelectionModal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        onSelect={handleActionSelect}
        onEdit={handleActionEdit}
      />

      {/* Action Customization Modal */}
      <ActionCustomizationModal
        isOpen={isCustomizationModalOpen}
        onClose={() => setIsCustomizationModalOpen(false)}
        onSave={handleCustomActionSave}
        baseAction={actionToCustomize}
      />
    </>
  )
}

export const UnifiedEventEditor = memo(UnifiedEventEditorComponent)
UnifiedEventEditor.displayName = 'UnifiedEventEditor'