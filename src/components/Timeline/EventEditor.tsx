import React, { useState, useEffect, memo } from 'react'
import { Plus, X, Sparkles } from 'lucide-react'
import useRoundStore from '@/store/roundStore'
import useMapStore from '@/store/mapStore'
import useEventCreationStore from '@/store/eventCreationStore'
import { EventType, MoveEventData, AppearEventData, DisappearEventData, SpellEventData, AttackEventData, InteractionEventData, EnvironmentalEventData, SequenceEventData } from '@/types/timeline'
import { Token } from '@/types/token'
import { Position } from '@/types/map'
import { Modal, ModalBody, Box, Text, Button } from '@/components/ui'
import { styled } from '@/styles/theme.config'
import { SpellSelectionModal } from './SpellSelectionModal'
import { AttackActionConfig } from '@/components/Actions/ActionEditor/AttackActionConfig'
import { InteractionActionConfig } from '@/components/Actions/ActionEditor/InteractionActionConfig'
import { EnvironmentalActionConfig } from '@/components/Actions/ActionEditor/EnvironmentalActionConfig'
import { ActionSequencer } from '@/components/Actions/ActionSequencer/ActionSequencer'
import {
  TokenSelector,
  EventTypeSelector,
  SpellConfiguration,
  PositionPicker,
  EventsList
} from './EventEditor/index'

const StyledFooter = styled(Box, {
  padding: '$6',
  borderTop: '1px solid $gray700',
  backgroundColor: '$gray800/80',
  backdropFilter: 'blur(8px)'
})

const StyledSpellPreviewButton = styled(Button, {
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
  padding: '$2 $3',
  borderRadius: '$md',
  transition: '$fast',

  variants: {
    enabled: {
      true: {
        backgroundColor: '$secondary/20',
        color: '$secondary',
        border: '1px solid $secondary',
        '&:hover': {
          backgroundColor: '$secondary/30',
          color: '$secondary'
        }
      },
      false: {
        backgroundColor: '$gray700',
        color: '$gray400',
        border: '1px solid $gray600',
        '&:hover': {
          backgroundColor: '$gray600',
          color: '$white'
        }
      }
    }
  }
})

const StyledCloseButton = styled(Button, {
  backgroundColor: '$gray700',
  color: '$gray300',
  border: '1px solid $gray600',
  '&:hover': {
    backgroundColor: '$gray600'
  }
})

const StyledPreviewText = styled(Text, {
  fontSize: '$xs',
  fontWeight: '$medium'
})

type EventEditorProps = {
  isOpen: boolean
  onClose: () => void
  initialEventType?: EventType
  tokenId?: string
  roundNumber?: number
}

const EventEditorComponent: React.FC<EventEditorProps> = ({
  isOpen,
  onClose,
  initialEventType = 'move',
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

  const [selectedToken, setSelectedToken] = useState<string>(initialTokenId || '')
  const [eventType, setEventType] = useState<EventType>(initialEventType)
  const [targetPosition, setTargetPosition] = useState<Position>({ x: 0, y: 0 })
  const [fadeEffect, setFadeEffect] = useState(true)
  const [isTemporarilyHidden, setIsTemporarilyHidden] = useState(false)

  // Spell-related state
  const [useEnvironmentCaster, setUseEnvironmentCaster] = useState(false)
  const [selectedSpell, setSelectedSpell] = useState<Partial<SpellEventData> | null>(null)
  const [isSpellModalOpen, setIsSpellModalOpen] = useState(false)

  // Attack-related state
  const [selectedAttack, setSelectedAttack] = useState<Partial<AttackEventData> | null>(null)

  // Interaction-related state
  const [selectedInteraction, setSelectedInteraction] = useState<Partial<InteractionEventData> | null>(null)

  // Environmental-related state
  const [selectedEnvironmental, setSelectedEnvironmental] = useState<Partial<EnvironmentalEventData> | null>(null)

  // Sequence-related state
  const [selectedSequence, setSelectedSequence] = useState<Partial<SequenceEventData> | null>(null)

  // Fixed values
  const duration = 1000
  const targetRound = currentRound // Events execute in current round, not next

  // Use specific selectors to prevent unnecessary re-renders
  const isPicking = useEventCreationStore(state => state.isPicking)
  const startPickingPosition = useEventCreationStore(state => state.startPickingPosition)
  const startPickingToken = useEventCreationStore(state => state.startPickingToken)
  const pickedToPosition = useEventCreationStore(state => state.toPosition)
  const pickedTokenId = useEventCreationStore(state => state.selectedTokenId)
  const setEventStoreSelectedSpell = useEventCreationStore(state => state.setSelectedSpell)
  const setEventStorePosition = useEventCreationStore(state => state.setPosition)

  // Get all tokens from the current map - recalculate on every render when modal is open
  const tokens = React.useMemo(() => {
    if (!isOpen) return []

    const filteredTokens = (currentMap?.objects.filter(obj =>
      obj.type === 'token' && obj.id !== 'void-token'
    ) as Token[]) || []

    return filteredTokens
  }, [isOpen, currentMap?.objects])

  // Get events for the next round
  const nextRound = currentRound + 1
  const roundEvents = timeline?.rounds.find(r => r.number === nextRound)?.events || []

  useEffect(() => {
    if (eventType === 'spell' && useEnvironmentCaster) {
      // For environment caster, set from position to a default location or center of view
      setEventStorePosition('from', { x: 500, y: 300 }) // Default position for environment caster
      return
    }

    if (selectedToken && currentMap) {
      const token = currentMap.objects.find(obj => obj.id === selectedToken)
      if (token) {
        setTargetPosition({ x: token.position.x + 100, y: token.position.y })
        // Set from position in event creation store for spell preview
        if (eventType === 'spell') {
          setEventStorePosition('from', token.position)
        }
      }
    }
  }, [selectedToken, currentMap, eventType, setEventStorePosition, useEnvironmentCaster])

  // Sync selected spell with event creation store for preview
  useEffect(() => {
    console.log('Spell sync effect triggered:', { eventType, selectedSpell, hasSpell: !!selectedSpell })

    if (eventType === 'spell' && selectedSpell) {
      // Pass the full spell configuration including range and area
      const spellConfig = {
        ...selectedSpell,
        areaOfEffect: selectedSpell.burstRadius || selectedSpell.size || 0,
        lineWidth: selectedSpell.category === 'ray' ? 10 : undefined
      }

      setEventStoreSelectedSpell(spellConfig);

      // Also ensure fromPosition is set if we have a token
      const casterId = useEnvironmentCaster ? 'void-token' : selectedToken
      if (casterId && currentMap) {
        if (casterId === 'void-token') {
          setEventStorePosition('from', { x: 500, y: 300 })
        } else {
          const caster = currentMap.objects.find(obj => obj.id === casterId)
          if (caster) {
            setEventStorePosition('from', caster.position)
          }
        }
      }

      // Verify sync
      setTimeout(() => {
        const state = useEventCreationStore.getState()
        console.log('Verified spell sync in useEffect:', {
          selectedSpell: state.selectedSpell,
          fromPosition: state.fromPosition
        })
      }, 50)
    } else if (eventType !== 'spell') {
      // Clear spell selection when event type changes
      setEventStoreSelectedSpell(undefined)
    }
  }, [selectedSpell, eventType, setEventStoreSelectedSpell, setEventStorePosition, selectedToken, useEnvironmentCaster, currentMap])

  useEffect(() => {
    if (pickedToPosition && isPicking === null && isTemporarilyHidden) {
      setTargetPosition(pickedToPosition)
      // Also update the event creation store's toPosition for spell preview
      if (eventType === 'spell') {
        setEventStorePosition('to', pickedToPosition)
      }
      setIsTemporarilyHidden(false)
    }
  }, [pickedToPosition, isPicking, isTemporarilyHidden, eventType, setEventStorePosition])

  useEffect(() => {
    if (pickedTokenId && isPicking === null && isTemporarilyHidden) {
      setSelectedToken(pickedTokenId)
      setIsTemporarilyHidden(false)
    }
  }, [pickedTokenId, isPicking, isTemporarilyHidden])

  const handleAddEvent = () => {
    if (eventType === 'spell') {
      const casterId = useEnvironmentCaster ? 'void-token' : selectedToken
      if (!casterId || !currentMap || !selectedSpell) return

      const caster = currentMap.objects.find(obj => obj.id === casterId)
      if (!caster) return

      // Find if there's a token at the target position (for tracking)
      let targetTokenId: string | undefined
      if (selectedSpell.trackTarget && (selectedSpell.category === 'projectile' || selectedSpell.category === 'projectile-burst' || selectedSpell.category === 'ray')) {
        // Find token at or near target position
        const targetToken = currentMap.objects.find(obj => {
          if (obj.type !== 'token') return false
          const distance = Math.sqrt(
            Math.pow(obj.position.x - targetPosition.x, 2) +
            Math.pow(obj.position.y - targetPosition.y, 2)
          )
          return distance < 30 // Within 30 pixels is considered a hit
        })
        targetTokenId = targetToken?.id
      }

      const spellData: SpellEventData = {
        type: 'spell',
        spellName: selectedSpell.spellName || 'Custom Spell',
        category: selectedSpell.category || 'projectile',
        fromPosition: caster.position,
        toPosition: targetPosition,
        color: selectedSpell.color || '#ff0000',
        size: selectedSpell.size || 20,
        range: selectedSpell.range || 0,
        duration: selectedSpell.duration || 0,
        projectileSpeed: selectedSpell.projectileSpeed,
        burstRadius: selectedSpell.burstRadius,
        persistDuration: selectedSpell.persistDuration,
        particleEffect: selectedSpell.particleEffect,
        trackTarget: selectedSpell.trackTarget,
        targetTokenId
      }

      addEvent(casterId, 'spell', spellData, targetRound)
    } else if (eventType === 'attack') {
      if (!selectedToken || !currentMap || !selectedAttack) return
      const attacker = currentMap.objects.find(obj => obj.id === selectedToken)
      if (!attacker) return

      const attackData: AttackEventData = {
        type: 'attack',
        weaponName: selectedAttack.weaponName || 'Weapon',
        attackType: selectedAttack.attackType || 'melee',
        fromPosition: attacker.position,
        toPosition: targetPosition,
        damage: selectedAttack.damage || '1d6',
        damageType: selectedAttack.damageType || 'bludgeoning',
        attackBonus: selectedAttack.attackBonus || 0,
        range: selectedAttack.range || 5,
        duration: selectedAttack.duration || 800,
        animation: selectedAttack.animation || 'melee_swing',
        color: selectedAttack.color || '#FFFFFF',
        isCritical: selectedAttack.isCritical,
        hit: selectedAttack.hit,
        actualDamage: selectedAttack.actualDamage,
        properties: selectedAttack.properties || [],
        weaponType: selectedAttack.weaponType
      }

      addEvent(selectedToken, 'attack', attackData, targetRound)
    } else if (eventType === 'interaction') {
      if (!selectedToken || !currentMap || !selectedInteraction) return
      const actor = currentMap.objects.find(obj => obj.id === selectedToken)
      if (!actor) return

      const interactionData: InteractionEventData = {
        type: 'interaction',
        interactionType: selectedInteraction.interactionType || 'door',
        objectId: selectedInteraction.objectId,
        position: targetPosition,
        action: selectedInteraction.action || 'use',
        actor: selectedToken,
        skill: selectedInteraction.skill,
        dc: selectedInteraction.dc,
        success: selectedInteraction.success,
        duration: selectedInteraction.duration || 600,
        effect: selectedInteraction.effect || 'glow',
        sound: selectedInteraction.sound,
        result: selectedInteraction.result,
        stateChange: selectedInteraction.stateChange,
        consequences: selectedInteraction.consequences
      }

      addEvent(selectedToken, 'interaction', interactionData, targetRound)
    } else if (eventType === 'environmental') {
      if (!selectedEnvironmental) return

      const environmentalData: EnvironmentalEventData = {
        type: 'environmental',
        environmentalType: selectedEnvironmental.environmentalType || 'weather',
        effectName: selectedEnvironmental.effectName || 'Custom Effect',
        category: selectedEnvironmental.category || 'custom',
        intensity: selectedEnvironmental.intensity || 'moderate',
        area: selectedEnvironmental.area || 'medium',
        position: targetPosition,
        radius: selectedEnvironmental.radius,
        color: selectedEnvironmental.color || '#FFFFFF',
        opacity: selectedEnvironmental.opacity || 0.6,
        duration: selectedEnvironmental.duration || 0,
        particleCount: selectedEnvironmental.particleCount,
        animationSpeed: selectedEnvironmental.animationSpeed,
        effects: selectedEnvironmental.effects,
        description: selectedEnvironmental.description || ''
      }

      // For environmental effects, we use 'void-token' as the source since they don't belong to specific tokens
      addEvent('void-token', 'environmental', environmentalData, targetRound)
    } else if (eventType === 'sequence') {
      if (!selectedSequence || !selectedSequence.sequenceName) return

      const sequenceData: SequenceEventData = {
        type: 'sequence',
        sequenceName: selectedSequence.sequenceName,
        sequenceType: selectedSequence.sequenceType || 'simple',
        templateId: selectedSequence.templateId,
        actions: selectedSequence.actions || [],
        conditions: selectedSequence.conditions,
        priority: selectedSequence.priority || 50,
        maxDuration: selectedSequence.maxDuration,
        onSuccess: selectedSequence.onSuccess,
        onFailure: selectedSequence.onFailure,
        description: selectedSequence.description || '',
      }

      // For sequences, we use 'void-token' as the source since they can involve multiple tokens
      addEvent('void-token', 'sequence', sequenceData, targetRound)
    } else {
      if (!selectedToken || !currentMap) return
      const token = currentMap.objects.find(obj => obj.id === selectedToken)
      if (!token) return

      let eventData: MoveEventData | AppearEventData | DisappearEventData

      switch (eventType) {
        case 'move':
          eventData = {
            type: 'move',
            fromPosition: token.position,
            toPosition: targetPosition,
            duration,
            easing: 'ease-in-out' as const
          }
          break

        case 'appear':
          eventData = {
            type: 'appear',
            position: token.position,
            fadeIn: fadeEffect,
            duration
          }
          break

        case 'disappear':
          eventData = {
            type: 'disappear',
            fadeOut: fadeEffect,
            duration
          }
          break

        default:
          return
      }

      addEvent(selectedToken, eventType, eventData, targetRound)
    }
  }

  const handleDeleteEvent = (eventId: string) => {
    removeEvent(eventId)
  }

  const handlePositionPick = () => {
    console.log('handlePositionPick called:', {
      eventType,
      selectedSpell,
      hasSelectedSpell: !!selectedSpell,
      selectedToken,
      useEnvironmentCaster
    })

    // For spells, only allow position picking if a spell is selected
    if (eventType === 'spell' && !selectedSpell) {
      console.warn('Cannot pick position: No spell selected')
      return
    }

    // CRITICAL: Sync all spell data to the store BEFORE hiding the modal
    if (eventType === 'spell' && selectedSpell) {
      console.log('Syncing spell data to store:', { selectedSpell })

      // Ensure spell is in the store
      setEventStoreSelectedSpell(selectedSpell)

      // Ensure fromPosition is set based on current token
      const casterId = useEnvironmentCaster ? 'void-token' : selectedToken
      if (casterId && currentMap) {
        if (casterId === 'void-token') {
          console.log('Setting environment caster position')
          setEventStorePosition('from', { x: 500, y: 300 })
        } else {
          const caster = currentMap.objects.find(obj => obj.id === casterId)
          if (caster) {
            console.log('Setting caster position:', caster.position)
            setEventStorePosition('from', caster.position)
          }
        }
      }

      // Verify the store was updated
      setTimeout(() => {
        const verifyState = useEventCreationStore.getState()
        console.log('Verified store state after sync:', {
          selectedSpell: verifyState.selectedSpell,
          fromPosition: verifyState.fromPosition
        })
      }, 50)
    }

    // Get current store state for debugging
    const storeState = useEventCreationStore.getState()
    console.log('Before position picking:', {
      eventType,
      selectedSpell,
      storeState: {
        isPicking: storeState.isPicking,
        selectedSpell: storeState.selectedSpell,
        fromPosition: storeState.fromPosition,
        toPosition: storeState.toPosition
      }
    })

    // Now start position picking
    startPickingPosition('to')
    setIsTemporarilyHidden(true)

    // Check state after setting
    setTimeout(() => {
      const newState = useEventCreationStore.getState()
      console.log('After position picking:', {
        isPicking: newState.isPicking,
        selectedSpell: newState.selectedSpell,
        fromPosition: newState.fromPosition
      })
    }, 100)
  }

  const handleTokenPick = () => {
    startPickingToken()
    setIsTemporarilyHidden(true)
  }

  const canAddEvent = () => {
    if (eventType === 'spell') {
      const casterId = useEnvironmentCaster ? 'void-token' : selectedToken
      return casterId && selectedSpell
    }
    if (eventType === 'interaction') {
      return selectedToken && selectedInteraction && selectedInteraction.interactionType
    }
    if (eventType === 'environmental') {
      return selectedEnvironmental && selectedEnvironmental.environmentalType
    }
    if (eventType === 'sequence') {
      return selectedSequence && selectedSequence.sequenceName && selectedSequence.actions && selectedSequence.actions.length > 0
    }
    return selectedToken && (eventType !== 'move' || (targetPosition.x !== 0 || targetPosition.y !== 0))
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
        closeOnOverlayClick={true}
        closeOnEscape={true}
      >
        <ModalBody data-test-id="event-popup" display="flex" flexDirection="column" css={{ padding: 0, backgroundColor: '$gray900' }}>
          <Box display="flex" css={{ height: '75vh' }}>
            {/* Main Content */}
            <Box display="flex" flexDirection="column" css={{ flex: 1, padding: '$6', overflowY: 'auto', maxHeight: '75vh' }}>
              <Box display="flex" flexDirection="column" css={{
                padding: '$6',
                backgroundColor: '$gray800',
                borderRadius: '$xl',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                border: '1px solid $gray700'
              }}>
                <Box display="flex" alignItems="center" css={{ marginBottom: '$6' }}>
                  <Box css={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '$round',
                    backgroundColor: '$secondary',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '$4',
                    boxShadow: '0 4px 12px rgba(201, 173, 106, 0.3)'
                  }}>
                    <Plus size={24} color="#1A1A1A" />
                  </Box>
                  <Box>
                    <Text css={{ fontSize: '$xl', fontWeight: '$semibold', color: '$white' }}>
                      Create Event
                    </Text>
                    <Text css={{ fontSize: '$sm', color: '$gray400', marginTop: '$1' }}>
                      Schedule actions for Round {targetRound}
                    </Text>
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

                  {/* Event Type Selection */}
                  <EventTypeSelector
                    eventType={eventType}
                    setEventType={setEventType}
                  />

                  {/* Spell Configuration */}
                  {eventType === 'spell' && (
                    <SpellConfiguration
                      selectedSpell={selectedSpell}
                      useEnvironmentCaster={useEnvironmentCaster}
                      setUseEnvironmentCaster={setUseEnvironmentCaster}
                      onOpenSpellModal={() => setIsSpellModalOpen(true)}
                    />
                  )}

                  {/* Attack Configuration */}
                  {eventType === 'attack' && (
                    <AttackActionConfig
                      selectedAttack={selectedAttack}
                      onAttackChange={setSelectedAttack}
                    />
                  )}

                  {/* Interaction Configuration */}
                  {eventType === 'interaction' && (
                    <InteractionActionConfig
                      selectedInteraction={selectedInteraction}
                      onInteractionChange={setSelectedInteraction}
                    />
                  )}

                  {/* Environmental Configuration */}
                  {eventType === 'environmental' && (
                    <EnvironmentalActionConfig
                      selectedEnvironmental={selectedEnvironmental}
                      onEnvironmentalChange={setSelectedEnvironmental}
                    />
                  )}

                  {/* Sequence Configuration */}
                  {eventType === 'sequence' && (
                    <ActionSequencer
                      selectedSequence={selectedSequence}
                      onSequenceChange={setSelectedSequence}
                    />
                  )}

                  {/* Position Picker */}
                  <PositionPicker
                    targetPosition={targetPosition}
                    onPositionPick={handlePositionPick}
                    isPicking={isPicking}
                    fadeEffect={fadeEffect}
                    setFadeEffect={setFadeEffect}
                    eventType={eventType}
                    isDisabled={eventType === 'spell' && !selectedSpell}
                  />

                  {/* Action Buttons */}
                  <Box display="flex" gap="2" css={{ marginTop: '$2' }}>
                    <Button
                      onClick={handleAddEvent}
                      disabled={!canAddEvent()}
                      variant="primary"
                      css={{
                        flex: 1,
                        backgroundColor: '$secondary',
                        color: '$dndBlack',
                        fontWeight: '$bold',
                        '&:hover:not(:disabled)': {
                          backgroundColor: '$yellow500'
                        },
                        '&:disabled': {
                          opacity: 0.5,
                          cursor: 'not-allowed'
                        }
                      }}
                    >
                      <Plus size={16} style={{ marginRight: '8px' }} />
                      Add Event
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Events List Sidebar */}
            <EventsList
              roundEvents={roundEvents}
              tokens={tokens}
              nextRound={nextRound}
              onDeleteEvent={handleDeleteEvent}
            />
          </Box>

          {/* Footer */}
          <StyledFooter
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            {/* Spell Preview Toggle */}
            <Box display="flex" alignItems="center">
              <StyledSpellPreviewButton
                onClick={toggleSpellPreview}
                enabled={spellPreviewEnabled}
                title={spellPreviewEnabled ? 'Disable Spell Preview' : 'Enable Spell Preview'}
              >
                <Sparkles size={14} />
                <StyledPreviewText>
                  {spellPreviewEnabled ? 'Preview: ON' : 'Preview: OFF'}
                </StyledPreviewText>
              </StyledSpellPreviewButton>
            </Box>

            {/* Close Button */}
            <StyledCloseButton
              onClick={onClose}
            >
              <X size={16} style={{ marginRight: '4px' }} />
              Close
            </StyledCloseButton>
          </StyledFooter>
        </ModalBody>
      </Modal>

      {/* Spell Selection Modal */}
      <SpellSelectionModal
        isOpen={isSpellModalOpen}
        onClose={() => setIsSpellModalOpen(false)}
        onSelect={(spell: Partial<SpellEventData>) => {
          console.log('Spell selected from modal:', spell)
          setSelectedSpell(spell)
          setIsSpellModalOpen(false)

          // Immediately sync to store
          console.log('Immediately syncing spell to store')
          setEventStoreSelectedSpell(spell)

          // Also set the from position when spell is selected if we have a token
          if (selectedToken && currentMap) {
            const token = currentMap.objects.find(obj => obj.id === selectedToken)
            if (token) {
              console.log('Setting from position on spell selection:', token.position)
              setEventStorePosition('from', token.position)
            }
          } else if (useEnvironmentCaster) {
            console.log('Setting environment caster position on spell selection')
            setEventStorePosition('from', { x: 500, y: 300 })
          }

          // Verify store update
          setTimeout(() => {
            const state = useEventCreationStore.getState()
            console.log('Store state after spell selection:', {
              selectedSpell: state.selectedSpell,
              fromPosition: state.fromPosition
            })
          }, 100)
        }}
      />
    </>
  )
}

export const EventEditor = memo(EventEditorComponent)
EventEditor.displayName = 'EventEditor'