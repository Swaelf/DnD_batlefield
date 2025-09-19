import React, { useState, useEffect } from 'react'
import { Move, Eye, EyeOff, Plus, Trash2, MapPin, MousePointer, Zap, Wand2 } from 'lucide-react'
import useRoundStore from '@/store/roundStore'
import useMapStore from '@/store/mapStore'
import useEventCreationStore from '@/store/eventCreationStore'
import { EventType, MoveEventData, AppearEventData, DisappearEventData, SpellEventData } from '@/types/timeline'
import { Token } from '@/types/token'
import { Position } from '@/types/map'
import { Modal, ModalBody, Box, Text, Button, Input, FieldLabel } from '@/components/ui'
import { SpellSelectionModal } from './SpellSelectionModal'

type EventEditorProps = {
  isOpen: boolean
  onClose: () => void
  initialEventType?: EventType
  tokenId?: string
  roundNumber?: number
}

export const EventEditor: React.FC<EventEditorProps> = ({
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

      const eventData: SpellEventData = {
        type: 'spell',
        spellName: selectedSpell.spellName || 'Custom Spell',
        category: selectedSpell.category || 'burst',
        fromPosition: caster.position,
        toPosition: targetPosition,
        color: selectedSpell.color || '#ff0000',
        size: selectedSpell.size || 20,
        range: selectedSpell.range,
        duration: selectedSpell.duration || 1500,
        persistDuration: selectedSpell.persistDuration,
        particleEffect: selectedSpell.particleEffect !== false, // Default true
        projectileSpeed: selectedSpell.projectileSpeed || 500,
        // Add burstRadius for projectile-burst spells
        burstRadius: selectedSpell.burstRadius
      }

      addEvent(casterId, 'spell', eventData, targetRound)
      setSelectedSpell(null)
      setTargetPosition({ x: 0, y: 0 })
      return
    }

    if (!selectedToken || !currentMap) return

    const token = currentMap.objects.find(obj => obj.id === selectedToken)
    if (!token) return

    const currentPosition = token.position
    let eventData: MoveEventData | AppearEventData | DisappearEventData

    switch (eventType) {
      case 'move':
        eventData = {
          type: 'move',
          fromPosition: currentPosition,
          toPosition: targetPosition,
          duration,
          easing: 'ease-in-out'
        }
        break
      case 'appear':
        eventData = {
          type: 'appear',
          position: targetPosition,
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
    setSelectedToken('')
    setTargetPosition({ x: 0, y: 0 })
  }

  const handleDeleteEvent = (eventId: string) => {
    removeEvent(eventId)
  }

  const handlePositionPick = () => {
    setIsTemporarilyHidden(true)
    startPickingPosition('to')
  }

  const handleTokenPick = () => {
    setIsTemporarilyHidden(true)
    startPickingToken()
  }

  if (!isOpen) return null
  if (isTemporarilyHidden) return null

  return (
    <>
      <SpellSelectionModal
        isOpen={isSpellModalOpen}
        onClose={() => setIsSpellModalOpen(false)}
        onSelect={(spell) => {
          setSelectedSpell(spell)
          setIsSpellModalOpen(false)
        }}
      />
      <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title="Event Editor" 
      showCloseButton
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
                {/* Token Selection Card */}
                <Box css={{
                  padding: '$3',
                  backgroundColor: '$gray900/50',
                  borderRadius: '$md',
                  border: '1px solid $gray700'
                }}>
                  <FieldLabel css={{ marginBottom: '$2' }}>Select Token</FieldLabel>
                  <Box display="flex" gap="2">
                    <Button
                      onClick={handleTokenPick}
                      variant={isPicking === 'token' ? 'primary' : 'secondary'}
                      size="icon"
                      title="Pick from map"
                      css={{
                        backgroundColor: isPicking === 'token' ? '$blue600' : '$gray700',
                        color: isPicking === 'token' ? '$white' : '$gray300',
                        animation: isPicking === 'token' ? 'pulse 2s infinite' : 'none',
                        border: '1px solid $gray600',
                        '&:hover': {
                          backgroundColor: isPicking === 'token' ? '$blue700' : '$gray600',
                          borderColor: '$secondary'
                        }
                      }}
                    >
                      <MousePointer size={16} />
                    </Button>
                    <Box css={{ flex: 1 }}>
                      {/* Using native select as the custom Select has rendering issues in modal */}
                      <select
                        value={selectedToken || ''}
                        onChange={(e) => setSelectedToken(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '6px 8px',
                          backgroundColor: '#1a1a1a',
                          color: '#e5e5e5',
                          border: '1px solid #3a3a3a',
                          borderRadius: '6px',
                          fontSize: '14px',
                          cursor: 'pointer',
                          outline: 'none',
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#C9AD6A'}
                        onBlur={(e) => e.target.style.borderColor = '#3a3a3a'}
                      >
                        <option value="" style={{ backgroundColor: '#1a1a1a' }}>
                          {tokens.length === 0 ? 'No tokens available' : 'Select a token...'}
                        </option>
                        {tokens.map(token => (
                          <option
                            key={token.id}
                            value={token.id}
                            style={{ backgroundColor: '#1a1a1a' }}
                          >
                            {token.name || `Token ${token.id.slice(0, 8)}`}
                          </option>
                        ))}
                      </select>
                    </Box>
                  </Box>
                </Box>

                {/* Event Type Selection */}
                <Box css={{
                  padding: '$3',
                  backgroundColor: '$gray900/50',
                  borderRadius: '$md',
                  border: '1px solid $gray700'
                }}>
                  <FieldLabel css={{ marginBottom: '$2' }}>Event Type</FieldLabel>
                  <Box display="grid" css={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '$2' }}>
                    <Button
                      onClick={() => setEventType('move')}
                      variant={eventType === 'move' ? 'primary' : 'outline'}
                      css={{
                        justifyContent: 'flex-start',
                        backgroundColor: eventType === 'move' ? '$blue600' : '$gray700',
                        color: eventType === 'move' ? '$white' : '$gray300',
                        '&:hover': {
                          backgroundColor: eventType === 'move' ? '$blue700' : '$gray600'
                        }
                      }}
                    >
                      <Move size={16} style={{ marginRight: '4px' }} />
                      Move
                    </Button>
                    <Button
                      onClick={() => setEventType('appear')}
                      variant={eventType === 'appear' ? 'primary' : 'outline'}
                      css={{
                        justifyContent: 'flex-start',
                        backgroundColor: eventType === 'appear' ? '$green600' : '$gray700',
                        color: eventType === 'appear' ? '$white' : '$gray300',
                        '&:hover': {
                          backgroundColor: eventType === 'appear' ? '$green700' : '$gray600'
                        }
                      }}
                    >
                      <Eye size={16} style={{ marginRight: '4px' }} />
                      Appear
                    </Button>
                    <Button
                      onClick={() => setEventType('disappear')}
                      variant={eventType === 'disappear' ? 'primary' : 'outline'}
                      css={{
                        justifyContent: 'flex-start',
                        backgroundColor: eventType === 'disappear' ? '$red600' : '$gray700',
                        color: eventType === 'disappear' ? '$white' : '$gray300',
                        '&:hover': {
                          backgroundColor: eventType === 'disappear' ? '$red700' : '$gray600'
                        }
                      }}
                    >
                      <EyeOff size={16} style={{ marginRight: '4px' }} />
                      Disappear
                    </Button>
                    <Button
                      onClick={() => setEventType('spell')}
                      variant={eventType === 'spell' ? 'primary' : 'outline'}
                      css={{
                        justifyContent: 'flex-start',
                        backgroundColor: eventType === 'spell' ? '$purple600' : '$gray700',
                        color: eventType === 'spell' ? '$white' : '$gray300',
                        '&:hover': {
                          backgroundColor: eventType === 'spell' ? '$purple700' : '$gray600'
                        }
                      }}
                    >
                      <Zap size={16} style={{ marginRight: '4px' }} />
                      Spell
                    </Button>
                  </Box>
                </Box>

                {/* Spell Configuration */}
                {eventType === 'spell' && (
                  <Box css={{
                    padding: '$3',
                    backgroundColor: '$purple900/30',
                    borderRadius: '$lg',
                    border: '1px solid $purple700/50'
                  }}>
                    <Text size="sm" weight="medium" color="gray300" css={{ marginBottom: '$3', color: '$purple300' }}>
                      Spell Configuration
                    </Text>

                    {/* Environment Caster Toggle */}
                    <Box display="flex" alignItems="center" gap="2" css={{ marginBottom: '$3' }}>
                      <input
                        type="checkbox"
                        checked={useEnvironmentCaster}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUseEnvironmentCaster(e.target.checked)}
                        style={{ accentColor: 'var(--colors-purple500)' }}
                      />
                      <Text size="xs" color="gray300">Cast from environment (no caster token)</Text>
                    </Box>

                    {/* Selected Spell Display */}
                    {selectedSpell ? (
                      <Box css={{
                        padding: '$3',
                        backgroundColor: '$gray800',
                        borderRadius: '$md',
                        marginBottom: '$3'
                      }}>
                        <Box display="flex" alignItems="center" justifyContent="between">
                          <Box>
                            <Text size="sm" weight="medium" color="white">
                              {selectedSpell.spellName || 'Custom Spell'}
                            </Text>
                            <Text size="xs" color="gray400" css={{ marginTop: '$1' }}>
                              {selectedSpell.category?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Text>
                          </Box>
                          <Box
                            css={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '$round',
                              backgroundColor: selectedSpell.color || '#ff0000',
                              border: '2px solid $gray700'
                            }}
                          />
                        </Box>
                      </Box>
                    ) : (
                      <Box css={{
                        padding: '$4',
                        backgroundColor: '$gray800',
                        borderRadius: '$md',
                        marginBottom: '$3',
                        textAlign: 'center',
                        borderStyle: 'dashed',
                        borderWidth: '2px',
                        borderColor: '$gray700'
                      }}>
                        <Text size="sm" color="gray400">
                          No spell selected
                        </Text>
                      </Box>
                    )}

                    {/* Select Spell Button */}
                    <Button
                      onClick={() => setIsSpellModalOpen(true)}
                      variant="secondary"
                      css={{
                        width: '100%',
                        backgroundColor: '$purple600',
                        color: '$white',
                        '&:hover': {
                          backgroundColor: '$purple700'
                        }
                      }}
                    >
                      <Wand2 size={16} style={{ marginRight: '8px' }} />
                      {selectedSpell ? 'Change Spell' : 'Select Spell'}
                    </Button>
                  </Box>
                )}

                {/* Event-specific Options */}
                {(eventType === 'move' || eventType === 'appear' || eventType === 'spell') && (
                  <Box css={{
                    padding: '$3',
                    backgroundColor: '$gray900/50',
                    borderRadius: '$md',
                    border: '1px solid $gray700'
                  }}>
                    <FieldLabel>
                      {eventType === 'move' ? 'Target Position' :
                       eventType === 'appear' ? 'Appear Position' :
                       'Spell Target'}
                    </FieldLabel>
                    <Box display="flex" gap="2">
                      <Button
                        onClick={handlePositionPick}
                        variant={isPicking === 'to' ? 'primary' : 'secondary'}
                        size="icon"
                        title="Click on map to set position"
                        css={{
                          backgroundColor: isPicking === 'to' ? '$blue600' : '$secondary',
                          color: isPicking === 'to' ? '$white' : '$dndBlack',
                          animation: isPicking === 'to' ? 'pulse 2s infinite' : 'none',
                          '&:hover': {
                            backgroundColor: isPicking === 'to' ? '$blue700' : '$yellow500'
                          }
                        }}
                      >
                        <MapPin size={16} />
                      </Button>
                      <Box display="flex" gap="2" css={{ flex: 1 }}>
                        <Input
                          type="number"
                          value={targetPosition.x}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setTargetPosition({ ...targetPosition, x: parseInt(e.target.value) || 0 })}
                          placeholder="X"
                          size="sm"
                          css={{ flex: 1 }}
                        />
                        <Input
                          type="number"
                          value={targetPosition.y}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setTargetPosition({ ...targetPosition, y: parseInt(e.target.value) || 0 })}
                          placeholder="Y"
                          size="sm"
                          css={{ flex: 1 }}
                        />
                      </Box>
                    </Box>
                  </Box>
                )}

                {/* Fade Effect for appear/disappear */}
                {(eventType === 'appear' || eventType === 'disappear') && (
                  <Box css={{
                    padding: '$3',
                    backgroundColor: '$gray900/50',
                    borderRadius: '$md',
                    border: '1px solid $gray700'
                  }}>
                    <Box display="flex" alignItems="center" gap="2">
                      <input
                        type="checkbox"
                        checked={fadeEffect}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFadeEffect(e.target.checked)}
                        style={{ accentColor: 'var(--colors-secondary)' }}
                      />
                      <Text size="sm" color="gray300">Use fade animation</Text>
                    </Box>
                  </Box>
                )}
              </Box>

              <Box display="flex" justifyContent="center" css={{ marginTop: '$4' }}>
                <Button
                  onClick={handleAddEvent}
                  disabled={eventType === 'spell' ? (!selectedToken && !useEnvironmentCaster) || !selectedSpell : !selectedToken}
                  variant="primary"
                  size="lg"
                  css={{
                    width: '100%',
                    maxWidth: '300px',
                    backgroundColor: '$secondary',
                    color: '$dndBlack',
                    fontWeight: 'bold',
                    padding: '$3 $4',
                    '&:hover': {
                      backgroundColor: '$yellow500',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(201, 173, 106, 0.3)'
                    },
                    '&:disabled': {
                      opacity: 0.5,
                      cursor: 'not-allowed',
                      transform: 'none'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Plus size={18} style={{ marginRight: '8px' }} />
                  Add Event to Timeline
                </Button>
              </Box>
            </Box>
          </Box>

          {/* Events List */}
          <Box display="flex" flexDirection="column" css={{
            width: '350px',
            minWidth: '350px',
            padding: '$4',
            overflowY: 'auto',
            maxHeight: '70vh',
            borderLeft: '1px solid $gray700',
            backgroundColor: '$gray900/50'
          }}>
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="between" css={{ marginBottom: '$4' }}>
              <Box>
                <Text size="lg" weight="medium" color="white">
                  Timeline Events
                </Text>
                <Text size="xs" color="gray400">
                  Round {nextRound} • {roundEvents.length} event{roundEvents.length !== 1 ? 's' : ''}
                </Text>
              </Box>
              <Box css={{
                padding: '$2',
                backgroundColor: '$gray800',
                borderRadius: '$md',
                border: '1px solid $gray700'
              }}>
                <Text size="xs" weight="medium" color="secondary">
                  Next Round
                </Text>
              </Box>
            </Box>

            {roundEvents.length === 0 ? (
              <Box css={{
                padding: '$8',
                textAlign: 'center',
                backgroundColor: '$gray800/50',
                borderRadius: '$lg',
                border: '1px dashed $gray700'
              }}>
                <Box css={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '$round',
                  backgroundColor: '$gray700',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  marginBottom: '$3'
                }}>
                  <Plus size={24} color="#666" />
                </Box>
                <Text color="gray400" size="sm">
                  No events scheduled
                </Text>
                <Text color="gray500" size="xs" css={{ marginTop: '$1' }}>
                  Add events to animate tokens
                </Text>
              </Box>
            ) : (
              <Box display="flex" flexDirection="column" gap="2">
                {roundEvents.map((event) => {
                  const token = tokens.find(t => t.id === event.tokenId)
                  return (
                    <Box
                      key={event.id}
                      css={{
                        padding: '$3',
                        backgroundColor: '$gray800',
                        borderRadius: '$lg',
                        border: '1px solid $gray700',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: '$gray750',
                          borderColor: '$gray600',
                          transform: 'translateX(-2px)'
                        }
                      }}
                    >
                      <Box display="flex" alignItems="center" justifyContent="between">
                        <Box display="flex" alignItems="center" gap="3">
                          <Box
                            css={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '$md',
                              backgroundColor:
                                event.type === 'move' ? '$blue600/20' :
                                event.type === 'appear' ? '$green600/20' :
                                event.type === 'spell' ? '$purple600/20' :
                                '$red600/20',
                              border: '1px solid',
                              borderColor:
                                event.type === 'move' ? '$blue600' :
                                event.type === 'appear' ? '$green600' :
                                event.type === 'spell' ? '$purple600' :
                                '$red600',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {event.type === 'move' && <Move size={18} color="#3B82F6" />}
                            {event.type === 'appear' && <Eye size={18} color="#10B981" />}
                            {event.type === 'disappear' && <EyeOff size={18} color="#EF4444" />}
                            {event.type === 'spell' && <Zap size={18} color="#8B5CF6" />}
                          </Box>
                          <Box css={{ flex: 1 }}>
                            <Text color="white" weight="medium" size="sm">
                              {token?.name || 'Unknown Token'}
                            </Text>
                            <Text size="xs" color="gray400">
                              {event.type === 'move' && 'Move to position'}
                              {event.type === 'appear' && 'Appear on map'}
                              {event.type === 'disappear' && 'Disappear'}
                              {event.type === 'spell' && (
                                (event.data as SpellEventData).spellName || 'Cast spell'
                              )}
                            </Text>
                          </Box>
                        </Box>
                        <Button
                          onClick={() => handleDeleteEvent(event.id)}
                          variant="ghost"
                          size="icon"
                          css={{
                            width: '28px',
                            height: '28px',
                            color: '$gray500',
                            '&:hover': {
                              color: '$red500',
                              backgroundColor: '$red500/10'
                            }
                          }}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </Box>
                    </Box>
                  )
                })}
              </Box>
            )}
          </Box>
        </Box>

        {/* Footer */}
        <Box
          display="flex"
          justifyContent="end"
          gap="2"
          css={{
            padding: '$3',
            borderTop: '1px solid $gray700',
            backgroundColor: '$gray800/50'
          }}
        >
          <Button
            onClick={onClose}
            variant="outline"
            css={{
              backgroundColor: '$gray700',
              color: '$gray300',
              '&:hover': { backgroundColor: '$gray600' }
            }}
          >
            Close
          </Button>
        </Box>
      </ModalBody>
    </Modal>
    </>
  )
}