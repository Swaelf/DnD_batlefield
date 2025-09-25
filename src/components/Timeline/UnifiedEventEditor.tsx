import React, { useState, useEffect, memo } from 'react'
import { Plus, X, Move, Target, Sparkles } from 'lucide-react'
import useRoundStore from '@/store/roundStore'
import useMapStore from '@/store/mapStore'
import useEventCreationStore from '@/store/eventCreationStore'
import { useUnifiedActionStore } from '@/store/unifiedActionStore'
import { Token } from '@/types/token'
import { Position } from '@/types/map'
import { UnifiedAction } from '@/types/unifiedAction'
import { createUnifiedRoundEvent } from '@/types/timelineUnified'
import { Modal, ModalBody, Box, Text, Button } from '@/components/ui'
import { styled } from '@/styles/theme.config'
import { ActionSelectionModal } from './ActionSelectionModal'
import { ActionCustomizationModal } from './ActionCustomizationModal'
import {
  TokenSelector,
  PositionPicker,
  EventsList
} from './EventEditor/index'
import { EventType } from '@/types'

// Styled components to fix TypeScript errors
const MainContainer = styled(Box, {
  height: '70vh',
  overflow: 'hidden'
})

const ContentContainer = styled(Box, {
  flex: 1,
  padding: '$4',
  overflowY: 'auto',
  maxHeight: '70vh'
})

const MainContent = styled(Box, {
  padding: '$4',
  backgroundColor: '$gray800',
  borderRadius: '$lg',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
})

const HeaderTitle = styled(Text, {
  fontSize: '$xl',
  fontWeight: '$semibold',
  color: '$white'
})

const HeaderSubtitle = styled(Text, {
  fontSize: '$sm',
  color: '$gray400'
})

const ActionTitle = styled(Text, {
  fontSize: '$md',
  fontWeight: '$semibold',
  color: '$white'
})

const ActionDescription = styled(Text, {
  fontSize: '$sm',
  color: '$gray400',
  marginBottom: '$1'
})

const AnimationInfo = styled(Text, {
  fontSize: '$xs'
})

const ActionContainer = styled(Box, {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '$3',
  backgroundColor: '$gray700',
  borderRadius: '$lg',
  border: '1px solid $gray600'
})

const ActionIcon = styled(Box, {
  width: '32px',
  height: '32px',
  borderRadius: '$md',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
})


const PreviewTitle = styled(Text, {
  fontSize: '$md',
  fontWeight: '$semibold',
  color: '$white',
  marginBottom: '$2'
})

type UnifiedEventEditorProps = {
  isOpen: boolean
  onClose: () => void
  tokenId?: string
  roundNumber?: number
}

const UnifiedEventEditorComponent: React.FC<UnifiedEventEditorProps> = ({
  isOpen,
  onClose,
  tokenId: initialTokenId
}) => {
  // Use specific selectors to prevent unnecessary re-renders
  const currentRound = useRoundStore(state => state.currentRound)
  const timeline = useRoundStore(state => state.timeline)
  const addEvent = useRoundStore(state => state.addEvent)
  const removeEvent = useRoundStore(state => state.removeEvent)
  const currentMap = useMapStore(state => state.currentMap)
  const spellPreviewEnabled = useMapStore(state => state.spellPreviewEnabled)
  const toggleSpellPreview = useMapStore(state => state.toggleSpellPreview)
  const executeAction = useUnifiedActionStore(state => state.executeAction)

  const [selectedToken, setSelectedToken] = useState<string>(initialTokenId || '')
  const [selectedAction, setSelectedAction] = useState<UnifiedAction | null>(null)
  const [isActionModalOpen, setIsActionModalOpen] = useState(false)
  const [isCustomizationModalOpen, setIsCustomizationModalOpen] = useState(false)
  const [actionToCustomize, setActionToCustomize] = useState<UnifiedAction | null>(null)
  const [targetPosition, setTargetPosition] = useState<Position>({ x: 0, y: 0 })
  const [isTemporarilyHidden, setIsTemporarilyHidden] = useState(false)

  // Fixed values
  const targetRound = currentRound // Events execute in current round, not next

  // Use specific selectors to prevent unnecessary re-renders
  const isPicking = useEventCreationStore(state => state.isPicking)
  const startPickingPosition = useEventCreationStore(state => state.startPickingPosition)
  const startPickingToken = useEventCreationStore(state => state.startPickingToken)
  const pickedToPosition = useEventCreationStore(state => state.toPosition)
  const pickedTokenId = useEventCreationStore(state => state.selectedTokenId)

  // Get all tokens from the current map
  const tokens = React.useMemo(() => {
    if (!isOpen) return []

    const filteredTokens = (currentMap?.objects.filter(obj =>
      obj.type === 'token' && obj.id !== 'void-token'
    ) as Token[]) || []

    return filteredTokens
  }, [isOpen, currentMap?.objects])

  // Get events for the current round
  const roundEvents = timeline?.rounds.find(r => r.number === currentRound)?.events || []

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
      setIsTemporarilyHidden(false)
    }
  }, [pickedToPosition, isPicking, isTemporarilyHidden])

  useEffect(() => {
    if (pickedTokenId && isPicking === null && isTemporarilyHidden) {
      setSelectedToken(pickedTokenId)
      setIsTemporarilyHidden(false)
    }
  }, [pickedTokenId, isPicking, isTemporarilyHidden])

  const handleActionSelect = (action: UnifiedAction) => {
    setSelectedAction(action)

    // If this is a spell action, sync it to the event creation store for preview
    if (action.type === 'spell' && action.animation) {
      const setEventStoreSelectedSpell = useEventCreationStore.getState().setSelectedSpell
      const setEventStorePosition = useEventCreationStore.getState().setPosition

      // Create spell config from unified action
      // Check if action has custom properties for range and area
      const range = (action as any).range || 150
      const areaOfEffect = (action as any).areaOfEffect || 0
      const burstSize = action.animation.burstSize || 0

      const spellConfig = {
        type: 'spell' as const,
        spellName: action.metadata?.name || 'Spell',
        category: action.animation.type?.includes('burst') ? 'projectile-burst' :
                  action.animation.type === 'projectile' ? 'projectile' :
                  action.animation.type === 'ray' ? 'ray' :
                  action.animation.type as any,
        color: action.animation.color || '#ff0000',
        range: range,
        burstRadius: areaOfEffect || burstSize, // Use areaOfEffect if available, otherwise burstSize
        size: action.animation.size || 20,
        duration: action.duration || 2000
      }

      setEventStoreSelectedSpell(spellConfig)

      // Also set fromPosition if we have a token
      if (selectedToken && currentMap) {
        const token = currentMap.objects.find(obj => obj.id === selectedToken)
        if (token) {
          setEventStorePosition('from', token.position)
        }
      }
    }
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

    // Check if target position corresponds to a token for target tracking
    let targetTokenId = ''
    if (selectedAction.animation.trackTarget) {
      const targetToken = currentMap.objects.find(obj =>
        obj.type === 'token' &&
        Math.abs(obj.position.x - targetPosition.x) < 25 && // Within 25 pixels
        Math.abs(obj.position.y - targetPosition.y) < 25
      )
      if (targetToken) {
        targetTokenId = targetToken.id
      }
    }

    // Create a customized action based on the selected template and current context
    const customizedAction: UnifiedAction = {
      ...selectedAction,
      id: `action-${Date.now()}`, // Generate new unique ID
      source: token.position,      // Set source to token position
      target: targetPosition,      // Set target to selected position
      timestamp: Date.now(),
      animation: {
        ...selectedAction.animation,
        targetTokenId: targetTokenId // Set target token ID for tracking
      }
    }

    // Add to unified action store for execution tracking
    executeAction(customizedAction)

    // Add to timeline as unified event
    createUnifiedRoundEvent(
      selectedToken,
      customizedAction,
      targetRound
    )

    // For now, convert to legacy format for existing roundStore
    // This will be updated when roundStore is migrated to unified actions
    const legacyEventType = mapActionTypeToLegacyType(customizedAction.type) as EventType
    const legacyEventData = convertActionToLegacyData(customizedAction)

    addEvent(selectedToken, legacyEventType, legacyEventData, targetRound)

    // Reset form
    setSelectedAction(null)
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
  const convertActionToLegacyData = (action: UnifiedAction): any => {
    switch (action.type) {
      case 'spell':
        // Map unified animation types to legacy spell categories
        const legacyCategory = action.animation.type === 'projectile_burst' ? 'projectile-burst' : action.animation.type
        const result = {
          type: 'spell',
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
          // Curved projectile path properties
          curved: action.animation.curved || false,
          curveHeight: action.animation.curveHeight || 30,
          curveDirection: action.animation.curveDirection || 'auto',
          // Target tracking properties
          trackTarget: action.animation.trackTarget || false,
          targetTokenId: action.animation.targetTokenId || ''
        }
        return result;

      case 'attack':
        return {
          type: 'attack',
          weaponName: action.metadata.name || 'Weapon',
          attackType: action.category === 'sword' ? 'melee' : 'ranged',
          fromPosition: action.source,
          toPosition: action.target,
          damage: '1d8',
          damageType: 'slashing',
          attackBonus: 0,
          duration: action.animation.duration || 800,
          animation: 'melee_swing',
          color: action.animation.color || '#FFFFFF'
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
    removeEvent(eventId)
  }

  const handlePositionPick = () => {
    // Before starting position picking, ensure spell data is synced if we have a spell action
    if (selectedAction && selectedAction.type === 'spell') {
      const setEventStoreSelectedSpell = useEventCreationStore.getState().setSelectedSpell
      const setEventStorePosition = useEventCreationStore.getState().setPosition

      // Create spell config from unified action
      // Check if action has custom properties for range and area
      const range = (selectedAction as any).range || 150
      const areaOfEffect = (selectedAction as any).areaOfEffect || 0
      const burstSize = selectedAction.animation?.burstSize || 0

      const spellConfig = {
        type: 'spell' as const,
        spellName: selectedAction.metadata?.name || 'Spell',
        category: selectedAction.animation?.type?.includes('burst') ? 'projectile-burst' :
                  selectedAction.animation?.type === 'projectile' ? 'projectile' :
                  selectedAction.animation?.type === 'ray' ? 'ray' :
                  selectedAction.animation?.type as any || 'projectile',
        color: selectedAction.animation?.color || '#ff0000',
        range: range,
        burstRadius: areaOfEffect || burstSize, // Use areaOfEffect if available
        size: selectedAction.animation?.size || 20,
        duration: selectedAction.duration || 2000
      }

      setEventStoreSelectedSpell(spellConfig)

      // Also ensure fromPosition is set
      if (selectedToken && currentMap) {
        const token = currentMap.objects.find(obj => obj.id === selectedToken)
        if (token) {
          setEventStorePosition('from', token.position)
        }
      }
    }

    startPickingPosition('to')
    setIsTemporarilyHidden(true)
  }

  const handleTokenPick = () => {
    startPickingToken()
    setIsTemporarilyHidden(true)
  }

  const canAddEvent = () => {
    return selectedToken && selectedAction && (targetPosition.x !== 0 || targetPosition.y !== 0)
  }

  if (!isOpen && !isTemporarilyHidden) {
    return null
  }

  return (
    <>
      <Modal
        isOpen={isOpen && !isTemporarilyHidden}
        onClose={onClose}
        title=""
        size="xl"
      >
        <ModalBody data-test-id="unified-event-popup" display="flex" flexDirection="column">
          <MainContainer display="flex">
            {/* Main Content */}
            <ContentContainer display="flex" flexDirection="column">
              <MainContent display="flex" flexDirection="column">
                <Box display="flex" alignItems="center" justifyContent="space-between" marginBottom="4">
                  <Box display="flex" flexDirection="column" width="auto">
                    <HeaderTitle>
                      Create Unified Action Event
                    </HeaderTitle>
                    <HeaderSubtitle>
                      Schedule unified actions for Round {targetRound}
                    </HeaderSubtitle>
                  </Box>

                  <Box display="flex">
                    <Button
                      onClick={handleAddEvent}
                      disabled={!canAddEvent()}
                    >
                      <Plus size={16} style={{ marginRight: '8px' }} />
                      Add Action Event
                    </Button>
                  </Box>
                </Box>

                <Box display="flex" flexDirection="column" gap="4">
                  {/* Token Selection */}
                  <TokenSelector
                    selectedToken={selectedToken}
                    setSelectedToken={setSelectedToken}
                    tokens={tokens}
                    isPicking={isPicking}
                    onTokenPick={handleTokenPick}
                  />

                  {/* Position Picker */}
                  <PositionPicker
                    targetPosition={targetPosition}
                    onPositionPick={handlePositionPick}
                    isPicking={isPicking}
                    eventType="spell"
                  />

                  {/* Action Selection */}
                  <Box display="flex" flexDirection="column" width="auto">
                    <ActionTitle>
                      Action
                    </ActionTitle>
                    {selectedAction ? (
                      <ActionContainer>
                        <Box display="flex" alignItems="center" gap="3">
                          <ActionIcon
                            css={{
                              backgroundColor: selectedAction.type === 'spell' ? '$blue500' :
                                              selectedAction.type === 'attack' ? '$red500' : '$green500'
                            }}
                          >
                            {selectedAction.type === 'spell' && <Target size={16} />}
                            {selectedAction.type === 'attack' && <Target size={16} />}
                            {selectedAction.type === 'interaction' && <Target size={16} />}
                            {selectedAction.type === 'move' && <Move size={16} />}
                          </ActionIcon>
                          <Box>
                            <ActionTitle>
                              {selectedAction.metadata.name}
                            </ActionTitle>
                            <ActionDescription>
                              {selectedAction.category} • {selectedAction.type}
                            </ActionDescription>
                          </Box>
                        </Box>
                        <Button
                          onClick={() => setIsActionModalOpen(true)}
                          variant="outline"
                          size="sm"
                          css={{
                            backgroundColor: '$gray600',
                            color: '$gray300',
                            border: '1px solid $gray500'
                          }}
                        >
                          Change
                        </Button>
                      </ActionContainer>
                    ) : (
                      <Button
                        onClick={() => setIsActionModalOpen(true)}
                        variant="outline"
                        css={{
                          padding: '$4',
                          backgroundColor: '$gray700',
                          color: '$gray300',
                          border: '2px dashed $gray500',
                          borderRadius: '$lg',
                          '&:hover': {
                            backgroundColor: '$gray600',
                            borderColor: '$secondary'
                          }
                        }}
                      >
                        <Plus size={16} style={{ marginRight: '8px' }} />
                        Select Action
                      </Button>
                    )}
                  </Box>

                  {/* Action Preview */}
                  {selectedAction && (
                    <Box>
                      <PreviewTitle>
                        Action Preview
                      </PreviewTitle>
                      <Box
                        css={{
                          padding: '$3',
                          backgroundColor: '$gray700',
                          borderRadius: '$md',
                          border: '1px solid $gray600'
                        }}
                      >
                        <AnimationInfo css={{ color: '$gray400' }}>
                          Animation: {selectedAction.animation.type} • Duration: {selectedAction.animation.duration}ms
                        </AnimationInfo>
                        {selectedAction.metadata.description && (
                          <AnimationInfo css={{ color: '$gray300' }}>
                            {selectedAction.metadata.description}
                          </AnimationInfo>
                        )}
                      </Box>
                    </Box>
                  )}
                </Box>
              </MainContent>
            </ContentContainer>

            {/* Events List Sidebar */}
            <EventsList
              roundEvents={roundEvents}
              tokens={tokens}
              nextRound={currentRound}
              onDeleteEvent={handleDeleteEvent}
            />
          </MainContainer>

          {/* Footer */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            gap="2"
            css={{
              padding: '$4',
              borderTop: '1px solid $gray700',
              backgroundColor: '$gray900/50'
            }}
          >
            {/* Action Preview Toggle */}
            <Box display="flex" alignItems="center">
              <Button
                onClick={toggleSpellPreview}
                css={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '$2',
                  padding: '$2 $3',
                  borderRadius: '$md',
                  backgroundColor: spellPreviewEnabled ? '$secondary/20' : '$gray700',
                  color: spellPreviewEnabled ? '$secondary' : '$gray400',
                  border: spellPreviewEnabled ? '1px solid $secondary' : '1px solid $gray600',
                  '&:hover': {
                    backgroundColor: spellPreviewEnabled ? '$secondary/30' : '$gray600',
                    color: spellPreviewEnabled ? '$secondary' : '$gray300'
                  }
                }}
                title={spellPreviewEnabled ? 'Disable Action Preview (Spells & Movement)' : 'Enable Action Preview (Spells & Movement)'}
              >
                <Sparkles size={14} />
                <Box css={{ fontSize: '$xs', fontWeight: '$medium' }}>
                  {spellPreviewEnabled ? 'Preview: ON' : 'Preview: OFF'}
                </Box>
              </Button>
            </Box>

            {/* Close Button */}
            <Button
              onClick={onClose}
              variant="outline"
              css={{
                backgroundColor: '$gray700',
                color: '$gray300',
                '&:hover': {
                  backgroundColor: '$gray600'
                }
              }}
            >
              <X size={16} style={{ marginRight: '4px' }} />
              Close
            </Button>
          </Box>
        </ModalBody>
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