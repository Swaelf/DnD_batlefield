import React, { memo } from 'react'
import { Move, Eye, EyeOff, Zap, Plus, Trash2 } from 'lucide-react'
import { RoundEvent, SpellEventData } from '@/types/timeline'
import { Token } from '@/types/token'
import { Box, Button, Text } from '@/components/ui'

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
  return (
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
                    onClick={() => onDeleteEvent(event.id)}
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
  )
}

export const EventsList = memo(EventsListComponent)
EventsList.displayName = 'EventsList'