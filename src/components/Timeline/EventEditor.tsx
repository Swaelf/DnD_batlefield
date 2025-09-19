import React, { useState, useEffect, memo } from 'react'
import { Plus, X } from 'lucide-react'
import useRoundStore from '@/store/roundStore'
import useMapStore from '@/store/mapStore'
import useEventCreationStore from '@/store/eventCreationStore'
import { EventType, MoveEventData, AppearEventData, DisappearEventData, SpellEventData, AttackEventData, InteractionEventData, EnvironmentalEventData, SequenceEventData } from '@/types/timeline'
import { Token } from '@/types/token'
import { Position } from '@/types/map'
import { Modal, ModalBody, Box, Text, Button } from '@/components/ui'
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
  const targetRound = currentRound + 1

  // Use specific selectors to prevent unnecessary re-renders
  const isPicking = useEventCreationStore(state => state.isPicking)
  const startPickingPosition = useEventCreationStore(state => state.startPickingPosition)
  const startPickingToken = useEventCreationStore(state => state.startPickingToken)
  const pickedToPosition = useEventCreationStore(state => state.toPosition)
  const pickedTokenId = useEventCreationStore(state => state.selectedTokenId)

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

  const handleAddEvent = () => {
    if (eventType === 'spell') {
      const casterId = useEnvironmentCaster ? 'void-token' : selectedToken
      if (!casterId || !currentMap || !selectedSpell) return

      const caster = currentMap.objects.find(obj => obj.id === casterId)
      if (!caster) return

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
        particleEffect: selectedSpell.particleEffect
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
    startPickingPosition('to')
    setIsTemporarilyHidden(true)
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
      >
        <ModalBody data-test-id="event-popup" display="flex" flexDirection="column" css={{ padding: 0 }}>
          <Box display="flex" css={{ height: '70vh', overflow: 'hidden' }}>
            {/* Main Content */}
            <Box display="flex" flexDirection="column" css={{ flex: 1, padding: '$4', overflowY: 'auto', maxHeight: '70vh' }}>
              <Box display="flex" flexDirection="column" css={{ padding: '$4', backgroundColor: '$gray800', borderRadius: '$lg', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)' }}>
                <Box display="flex" alignItems="center" css={{ marginBottom: '$4' }}>
                  <Box css={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '$round',
                    backgroundColor: '$secondary',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '$3'
                  }}>
                    <Plus size={20} color="#1A1A1A" />
                  </Box>
                  <Box>
                    <Text size="lg" weight="medium" color="white">
                      Create Event
                    </Text>
                    <Text size="xs" color="gray400">
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
          <Box
            display="flex"
            justifyContent="end"
            gap="2"
            css={{
              padding: '$4',
              borderTop: '1px solid $gray700',
              backgroundColor: '$gray900/50'
            }}
          >
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

      {/* Spell Selection Modal */}
      <SpellSelectionModal
        isOpen={isSpellModalOpen}
        onClose={() => setIsSpellModalOpen(false)}
        onSelect={(spell: Partial<SpellEventData>) => {
          setSelectedSpell(spell)
          setIsSpellModalOpen(false)
        }}
      />
    </>
  )
}

export const EventEditor = memo(EventEditorComponent)
EventEditor.displayName = 'EventEditor'