import React, { memo } from 'react'
import { Move, Eye, EyeOff, Zap, Sword, Settings, Cloud, Play } from 'lucide-react'
import { EventType } from '@/types/timeline'
import { Box, Button, FieldLabel } from '@/components/ui'

type EventTypeSelectorProps = {
  eventType: EventType
  setEventType: (type: EventType) => void
}

const EventTypeSelectorComponent: React.FC<EventTypeSelectorProps> = ({
  eventType,
  setEventType
}) => {
  return (
    <Box css={{
      padding: '$3',
      backgroundColor: '$gray900/50',
      borderRadius: '$md',
      border: '1px solid $gray700'
    }}>
      <FieldLabel css={{ marginBottom: '$2' }}>Event Type</FieldLabel>
      <Box display="grid" css={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '$2' }}>
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
        <Button
          onClick={() => setEventType('attack')}
          variant={eventType === 'attack' ? 'primary' : 'outline'}
          css={{
            justifyContent: 'flex-start',
            backgroundColor: eventType === 'attack' ? '$orange600' : '$gray700',
            color: eventType === 'attack' ? '$white' : '$gray300',
            '&:hover': {
              backgroundColor: eventType === 'attack' ? '$orange700' : '$gray600'
            }
          }}
        >
          <Sword size={16} style={{ marginRight: '4px' }} />
          Attack
        </Button>
        <Button
          onClick={() => setEventType('interaction')}
          variant={eventType === 'interaction' ? 'primary' : 'outline'}
          css={{
            justifyContent: 'flex-start',
            backgroundColor: eventType === 'interaction' ? '$cyan600' : '$gray700',
            color: eventType === 'interaction' ? '$white' : '$gray300',
            '&:hover': {
              backgroundColor: eventType === 'interaction' ? '$cyan700' : '$gray600'
            }
          }}
        >
          <Settings size={16} style={{ marginRight: '4px' }} />
          Object
        </Button>
        <Button
          onClick={() => setEventType('sequence')}
          variant={eventType === 'sequence' ? 'primary' : 'outline'}
          css={{
            justifyContent: 'flex-start',
            backgroundColor: eventType === 'sequence' ? '$teal600' : '$gray700',
            color: eventType === 'sequence' ? '$white' : '$gray300',
            '&:hover': {
              backgroundColor: eventType === 'sequence' ? '$teal700' : '$gray600'
            }
          }}
        >
          <Play size={16} style={{ marginRight: '4px' }} />
          Sequence
        </Button>
        <Button
          onClick={() => setEventType('environmental')}
          variant={eventType === 'environmental' ? 'primary' : 'outline'}
          css={{
            justifyContent: 'flex-start',
            backgroundColor: eventType === 'environmental' ? '$indigo600' : '$gray700',
            color: eventType === 'environmental' ? '$white' : '$gray300',
            '&:hover': {
              backgroundColor: eventType === 'environmental' ? '$indigo700' : '$gray600'
            }
          }}
        >
          <Cloud size={16} style={{ marginRight: '4px' }} />
          Weather
        </Button>
      </Box>
    </Box>
  )
}

export const EventTypeSelector = memo(EventTypeSelectorComponent)
EventTypeSelector.displayName = 'EventTypeSelector'