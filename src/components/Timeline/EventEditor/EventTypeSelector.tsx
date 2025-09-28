import React, { memo } from 'react'
import { Move, Eye, EyeOff, Zap, Sword, Settings, Cloud, Play } from 'lucide-react'
import type { EventType } from '@/types/timeline'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Button } from '@/components/primitives/ButtonVE'

type EventTypeSelectorProps = {
  eventType: EventType
  setEventType: (type: EventType) => void
}

const EventTypeSelectorComponent: React.FC<EventTypeSelectorProps> = ({
  eventType,
  setEventType
}) => {
  const eventTypes = [
    {
      type: 'move' as EventType,
      icon: <Move size={16} />,
      label: 'Move',
      color: '#3b82f6', // blue
      description: 'Token movement and positioning'
    },
    {
      type: 'appear' as EventType,
      icon: <Eye size={16} />,
      label: 'Appear',
      color: '#10b981', // green
      description: 'Token summoning and reveals'
    },
    {
      type: 'disappear' as EventType,
      icon: <EyeOff size={16} />,
      label: 'Disappear',
      color: '#f59e0b', // amber
      description: 'Token removal and hiding'
    },
    {
      type: 'spell' as EventType,
      icon: <Zap size={16} />,
      label: 'Spell',
      color: '#8b5cf6', // violet
      description: 'Magical effects and spells'
    },
    {
      type: 'attack' as EventType,
      icon: <Sword size={16} />,
      label: 'Attack',
      color: '#ef4444', // red
      description: 'Combat attacks and damage'
    },
    {
      type: 'interaction' as EventType,
      icon: <Settings size={16} />,
      label: 'Interaction',
      color: '#06b6d4', // cyan
      description: 'Object manipulation and skills'
    },
    {
      type: 'environmental' as EventType,
      icon: <Cloud size={16} />,
      label: 'Environmental',
      color: '#84cc16', // lime
      description: 'Weather and terrain effects'
    },
    {
      type: 'sequence' as EventType,
      icon: <Play size={16} />,
      label: 'Sequence',
      color: '#ec4899', // pink
      description: 'Complex action combinations'
    }
  ]

  return (
    <Box
      style={{
        padding: '16px',
        backgroundColor: 'var(--colors-gray900)',
        borderRadius: '8px',
        border: '1px solid var(--colors-gray700)'
      }}
    >
      <Text
        variant="body"
        size="sm"
        style={{
          marginBottom: '12px',
          fontWeight: '500',
          color: 'var(--colors-gray200)'
        }}
      >
        Event Type
      </Text>

      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8px'
        }}
      >
        {eventTypes.map(({ type, icon, label, color, description }) => {
          const isSelected = eventType === type

          return (
            <Button
              key={type}
              onClick={() => setEventType(type)}
              variant={isSelected ? 'primary' : 'outline'}
              size="sm"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: '8px',
                padding: '12px',
                height: 'auto',
                backgroundColor: isSelected ? color : 'var(--colors-gray800)',
                borderColor: isSelected ? color : 'var(--colors-gray600)',
                color: isSelected ? 'white' : 'var(--colors-gray300)',
                transition: 'all 0.2s ease'
              }}
            >
              <Box style={{ color: isSelected ? 'white' : color }}>
                {icon}
              </Box>
              <Box style={{ textAlign: 'left' }}>
                <Text
                  variant="body"
                  size="sm"
                  style={{
                    fontWeight: '500',
                    color: isSelected ? 'white' : 'var(--colors-gray200)',
                    lineHeight: '1.2'
                  }}
                >
                  {label}
                </Text>
                <Text
                  variant="body"
                  size="xs"
                  style={{
                    color: isSelected ? 'rgba(255,255,255,0.8)' : 'var(--colors-gray400)',
                    lineHeight: '1.2',
                    marginTop: '2px'
                  }}
                >
                  {description}
                </Text>
              </Box>
            </Button>
          )
        })}
      </Box>

      {/* Selected Event Info */}
      <Box
        style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: 'var(--colors-gray800)',
          borderRadius: '6px',
          border: `1px solid ${eventTypes.find(e => e.type === eventType)?.color || 'var(--colors-gray600)'}`
        }}
      >
        <Text
          variant="body"
          size="sm"
          style={{
            fontWeight: '500',
            color: 'var(--colors-gray200)',
            marginBottom: '4px'
          }}
        >
          Selected: {eventTypes.find(e => e.type === eventType)?.label}
        </Text>
        <Text
          variant="body"
          size="xs"
          style={{ color: 'var(--colors-gray400)' }}
        >
          {eventTypes.find(e => e.type === eventType)?.description}
        </Text>
      </Box>
    </Box>
  )
}

export const EventTypeSelector = memo(EventTypeSelectorComponent)
export default EventTypeSelector