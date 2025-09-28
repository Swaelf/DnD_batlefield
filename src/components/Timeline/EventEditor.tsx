import React, { useState, useEffect, memo } from 'react'
import { Plus, X, Sparkles } from 'lucide-react'
import useRoundStore from '@/store/roundStore'
import useMapStore from '@/store/mapStore'
import useEventCreationStore from '@/store/eventCreationStore'
import type { EventType, MoveEventData, AppearEventData, DisappearEventData, SpellEventData, AttackEventData, InteractionEventData, EnvironmentalEventData, SequenceEventData } from '@/types/timeline'
import type { Token } from '@/types/token'
import type { Position } from '@/types/map'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Button } from '@/components/primitives/ButtonVE'
import { Modal } from '@/components/ui/Modal'
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
      >
        <Box
          data-test-id="event-popup"
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: 0,
            backgroundColor: 'var(--colors-gray900)',
            borderRadius: '12px',
            maxWidth: '90vw',
            maxHeight: '90vh',
            overflow: 'hidden'
          }}
        >
          <Box style={{ display: 'flex', height: '75vh' }}>
            {/* Main Content */}
            <Box
              style={{
                display: 'flex',
                flexDirection: 'column',
                flexGrow: 1,
                padding: '24px',
                overflowY: 'auto',
                maxHeight: '75vh'
              }}
            >
              <Box
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '24px',
                  backgroundColor: 'var(--colors-gray800)',
                  borderRadius: '16px',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                  border: '1px solid var(--colors-gray700)'
                }}
              >
                <Box
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '24px'
                  }}
                >
                  <Box
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--colors-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '16px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                    }}
                  >
                    <Plus size={24} color="#1A1A1A" />
                  </Box>
                  <Box>
                    <Text
                      variant="heading"
                      size="xl"
                      style={{
                        margin: 0,
                        fontWeight: '600',
                        color: 'var(--colors-gray100)'
                      }}
                    >
                      Create Event
                    </Text>
                    <Text
                      variant="body"
                      size="sm"
                      style={{
                        margin: '4px 0 0 0',
                        color: 'var(--colors-gray400)'
                      }}
                    >
                      Schedule actions for Round {targetRound}
                    </Text>
                  </Box>
                </Box>

                <Box
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                  }}
                >
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
                  <Box
                    style={{
                      display: 'flex',
                      gap: '8px',
                      marginTop: '8px'
                    }}
                  >
                    <Button
                      variant="primary"
                      size="md"
                      onClick={handleAddEvent}
                      disabled={!canAddEvent()}
                      style={{
                        flex: 1,
                        backgroundColor: 'var(--colors-secondary)',
                        color: 'var(--colors-dndBlack)',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        opacity: !canAddEvent() ? 0.5 : 1,
                        cursor: !canAddEvent() ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <Plus size={16} />
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
          <Box
            style={{
              padding: '24px',
              borderTop: '1px solid var(--colors-gray700)',
              backgroundColor: 'rgba(31, 41, 55, 0.8)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            {/* Spell Preview Toggle */}
            <Box style={{ display: 'flex', alignItems: 'center' }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSpellPreview}
                title={spellPreviewEnabled ? 'Disable Spell Preview' : 'Enable Spell Preview'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  backgroundColor: spellPreviewEnabled ? 'rgba(201, 173, 106, 0.2)' : 'var(--colors-gray700)',
                  color: spellPreviewEnabled ? 'var(--colors-secondary)' : 'var(--colors-gray400)',
                  border: `1px solid ${spellPreviewEnabled ? 'var(--colors-secondary)' : 'var(--colors-gray600)'}`
                }}
              >
                <Sparkles size={14} />
                <Text
                  variant="body"
                  size="xs"
                  style={{
                    fontWeight: '500',
                    color: 'inherit'
                  }}
                >
                  {spellPreviewEnabled ? 'Preview: ON' : 'Preview: OFF'}
                </Text>
              </Button>
            </Box>

            {/* Close Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              style={{
                backgroundColor: 'var(--colors-gray700)',
                color: 'var(--colors-gray300)',
                border: '1px solid var(--colors-gray600)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <X size={16} />
              Close
            </Button>
          </Box>
        </Box>
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