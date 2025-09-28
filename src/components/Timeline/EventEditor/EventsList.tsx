/**
 * Events List Component
 * Displays scheduled timeline events for next round
 */

import React, { memo } from 'react'
import { Move, Eye, EyeOff, Zap, Plus, Trash2 } from 'lucide-react'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Button } from '@/components/primitives/ButtonVE'
import type { RoundEvent, SpellEventData } from '@/types/timeline'
import type { Token } from '@/types/token'

type EventsListProps = {
  roundEvents: RoundEvent[]
  tokens: Token[]
  nextRound: number
  onDeleteEvent: (eventId: string) => void
}

const EventsListComponent: React.FC<EventsListProps> = ({
  roundEvents,
  tokens,
  nextRound,
  onDeleteEvent
}) => {
  // Get event type configuration
  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'move':
        return <Move size={18} style={{ color: '#3B82F6' }} />
      case 'appear':
        return <Eye size={18} style={{ color: '#10B981' }} />
      case 'disappear':
        return <EyeOff size={18} style={{ color: '#EF4444' }} />
      case 'spell':
        return <Zap size={18} style={{ color: '#8B5CF6' }} />
      default:
        return <Move size={18} style={{ color: '#3B82F6' }} />
    }
  }

  const getEventBadgeStyle = (eventType: string) => {
    const baseStyle = {
      width: '36px',
      height: '36px',
      borderRadius: '6px',
      border: '1px solid',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }

    switch (eventType) {
      case 'move':
        return { ...baseStyle, backgroundColor: 'rgba(59, 130, 246, 0.2)', borderColor: '#3B82F6' }
      case 'appear':
        return { ...baseStyle, backgroundColor: 'rgba(16, 185, 129, 0.2)', borderColor: '#10B981' }
      case 'disappear':
        return { ...baseStyle, backgroundColor: 'rgba(239, 68, 68, 0.2)', borderColor: '#EF4444' }
      case 'spell':
        return { ...baseStyle, backgroundColor: 'rgba(139, 92, 246, 0.2)', borderColor: '#8B5CF6' }
      default:
        return { ...baseStyle, backgroundColor: 'rgba(59, 130, 246, 0.2)', borderColor: '#3B82F6' }
    }
  }

  const getEventDescription = (event: RoundEvent) => {
    switch (event.type) {
      case 'move':
        return 'Move to position'
      case 'appear':
        return 'Appear on map'
      case 'disappear':
        return 'Disappear'
      case 'spell':
        return (event.data as SpellEventData).spellName || 'Cast spell'
      default:
        return 'Unknown event'
    }
  }

  return (
    <Box
      style={{
        width: '50%',
        minWidth: '350px',
        padding: '16px',
        overflowY: 'auto',
        maxHeight: '70vh',
        borderLeft: '1px solid var(--colors-gray700)',
        backgroundColor: 'rgba(23, 23, 23, 0.5)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header */}
      <Box
        style={{
          marginBottom: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box>
          <Text
            variant="heading"
            size="lg"
            style={{
              fontWeight: '500',
              color: 'var(--colors-gray200)'
            }}
          >
            Timeline Events
          </Text>
          <Text
            variant="body"
            size="xs"
            style={{ color: 'var(--colors-gray400)' }}
          >
            Round {nextRound} • {roundEvents.length} event{roundEvents.length !== 1 ? 's' : ''}
          </Text>
        </Box>
        <Box
          style={{
            padding: '8px',
            backgroundColor: 'var(--colors-gray800)',
            borderRadius: '6px',
            border: '1px solid var(--colors-gray700)'
          }}
        >
          <Text
            variant="body"
            size="xs"
            style={{
              fontWeight: '500',
              color: 'var(--colors-secondary)'
            }}
          >
            Next Round
          </Text>
        </Box>
      </Box>

      {/* Events List */}
      {roundEvents.length === 0 ? (
        <Box
          style={{
            padding: '32px',
            textAlign: 'center',
            backgroundColor: 'rgba(31, 41, 55, 0.5)',
            borderRadius: '8px',
            border: '1px dashed var(--colors-gray700)'
          }}
        >
          <Box
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'var(--colors-gray700)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              marginBottom: '12px'
            }}
          >
            <Plus size={24} style={{ color: '#666' }} />
          </Box>
          <Text
            variant="body"
            size="sm"
            style={{ color: 'var(--colors-gray400)' }}
          >
            No events scheduled
          </Text>
          <Text
            variant="body"
            size="xs"
            style={{
              color: 'var(--colors-gray500)',
              marginTop: '4px'
            }}
          >
            Add events to animate tokens
          </Text>
        </Box>
      ) : (
        <Box
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          {roundEvents.map((event) => {
            const token = tokens.find(t => t.id === event.tokenId)
            return (
              <Box
                key={event.id}
                style={{
                  padding: '12px',
                  backgroundColor: 'var(--colors-gray800)',
                  borderRadius: '8px',
                  border: '1px solid var(--colors-gray700)',
                  transition: 'all 0.2s ease'
                }}
              >
                <Box
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <Box
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    {/* Event Type Icon */}
                    <Box style={getEventBadgeStyle(event.type)}>
                      {getEventIcon(event.type)}
                    </Box>

                    {/* Event Details */}
                    <Box style={{ flex: 1 }}>
                      <Text
                        variant="body"
                        size="sm"
                        style={{
                          color: 'var(--colors-gray200)',
                          fontWeight: '500'
                        }}
                      >
                        {token?.name || 'Unknown Token'}
                      </Text>
                      <Text
                        variant="body"
                        size="xs"
                        style={{ color: 'var(--colors-gray400)' }}
                      >
                        {getEventDescription(event)}
                      </Text>
                    </Box>
                  </Box>

                  {/* Delete Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteEvent(event.id)}
                    style={{
                      width: '28px',
                      height: '28px',
                      color: 'var(--colors-gray500)',
                      padding: '4px'
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
  )
}

export const EventsList = memo(EventsListComponent)
EventsList.displayName = 'EventsList'