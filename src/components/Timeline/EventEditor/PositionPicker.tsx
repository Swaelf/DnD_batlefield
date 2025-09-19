import React, { memo } from 'react'
import { MapPin } from 'lucide-react'
import { Position } from '@/types/map'
import { EventType } from '@/types/timeline'
import { Box, Button, Text, Input, FieldLabel } from '@/components/ui'

type PositionPickerProps = {
  targetPosition: Position
  onPositionPick: () => void
  isPicking: 'from' | 'to' | 'token' | null
  fadeEffect?: boolean
  setFadeEffect?: (value: boolean) => void
  eventType: EventType
}

const PositionPickerComponent: React.FC<PositionPickerProps> = ({
  targetPosition,
  onPositionPick,
  isPicking,
  fadeEffect,
  setFadeEffect,
  eventType
}) => {
  const showPositionPicker = eventType === 'move' || eventType === 'spell' || eventType === 'attack' || eventType === 'interaction' || eventType === 'environmental'
  const showFadeEffect = eventType === 'appear' || eventType === 'disappear'

  if (!showPositionPicker && !showFadeEffect) {
    return null
  }

  return (
    <Box css={{
      padding: '$3',
      backgroundColor: '$gray900/50',
      borderRadius: '$md',
      border: '1px solid $gray700'
    }}>
      {showPositionPicker && (
        <>
          <FieldLabel css={{ marginBottom: '$2' }}>
            {eventType === 'spell' ? 'Target Position' :
             eventType === 'attack' ? 'Target Position' :
             eventType === 'interaction' ? 'Interaction Position' :
             eventType === 'environmental' ? 'Effect Center Position' :
             'Move To Position'}
          </FieldLabel>
          <Box display="flex" gap="2" css={{ marginBottom: '$3' }}>
            <Button
              onClick={onPositionPick}
              variant={isPicking === 'to' ? 'primary' : 'secondary'}
              size="icon"
              title="Pick from map"
              css={{
                backgroundColor: isPicking === 'to' ? '$blue600' : '$gray700',
                color: isPicking === 'to' ? '$white' : '$gray300',
                animation: isPicking === 'to' ? 'pulse 2s infinite' : 'none',
                border: '1px solid $gray600',
                '&:hover': {
                  backgroundColor: isPicking === 'to' ? '$blue700' : '$gray600',
                  borderColor: '$secondary'
                }
              }}
            >
              <MapPin size={16} />
            </Button>
            <Box display="flex" gap="2" css={{ flex: 1 }}>
              <Box css={{ flex: 1 }}>
                <Input
                  type="number"
                  value={Math.round(targetPosition.x)}
                  readOnly
                  size="sm"
                  placeholder="X"
                  css={{
                    backgroundColor: '$gray800',
                    borderColor: '$gray600',
                    '&:focus': { borderColor: '$secondary' }
                  }}
                />
              </Box>
              <Box css={{ flex: 1 }}>
                <Input
                  type="number"
                  value={Math.round(targetPosition.y)}
                  readOnly
                  size="sm"
                  placeholder="Y"
                  css={{
                    backgroundColor: '$gray800',
                    borderColor: '$gray600',
                    '&:focus': { borderColor: '$secondary' }
                  }}
                />
              </Box>
            </Box>
          </Box>
          <Text size="xs" color="gray500">
            Click "Pick from map" then click on the map to set position
          </Text>
        </>
      )}

      {showFadeEffect && fadeEffect !== undefined && setFadeEffect && (
        <Box display="flex" alignItems="center" gap="2">
          <input
            type="checkbox"
            checked={fadeEffect}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFadeEffect(e.target.checked)}
            style={{ accentColor: 'var(--colors-secondary)' }}
          />
          <Text size="xs" color="gray300">
            {eventType === 'appear' ? 'Fade in effect' : 'Fade out effect'}
          </Text>
        </Box>
      )}
    </Box>
  )
}

export const PositionPicker = memo(PositionPickerComponent)
PositionPicker.displayName = 'PositionPicker'