/**
 * Position Picker Component
 * Interactive position selection for timeline events
 */

import { memo, type FC, type ChangeEvent } from 'react'
import { MapPin } from '@/utils/optimizedIcons'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Button } from '@/components/primitives/ButtonVE'
import type { Position } from '@/types/map'
import type { EventType } from '@/types/timeline'

export type PositionPickerProps = {
  targetPosition: Position
  onPositionPick: () => void
  isPicking: 'from' | 'to' | 'token' | 'targetToken' | null
  fadeEffect?: boolean
  setFadeEffect?: (value: boolean) => void
  eventType: EventType
  isDisabled?: boolean
}

const PositionPickerComponent: FC<PositionPickerProps> = ({
  targetPosition,
  onPositionPick,
  isPicking,
  fadeEffect,
  setFadeEffect,
  eventType,
  isDisabled = false
}) => {
  const showPositionPicker = eventType === 'move' || eventType === 'spell' || eventType === 'attack' || eventType === 'interaction' || eventType === 'environmental'
  const showFadeEffect = eventType === 'appear' || eventType === 'disappear'

  if (!showPositionPicker && !showFadeEffect) {
    return null
  }

  const getPositionLabel = () => {
    switch (eventType) {
      case 'spell':
        return 'Target Position'
      case 'attack':
        return 'Target Position'
      case 'interaction':
        return 'Interaction Position'
      case 'environmental':
        return 'Effect Center Position'
      default:
        return 'Move To Position'
    }
  }

  const getPickerTitle = () => {
    if (isDisabled) {
      return "Select a spell first"
    }
    return "Pick from map"
  }

  const getInstructionText = () => {
    if (isDisabled) {
      return "Please select a spell first before choosing target position"
    }
    return "Click \"Pick from map\" then click on the map to set position"
  }

  return (
    <Box
      style={{
        padding: '12px',
        backgroundColor: 'rgba(23, 23, 23, 0.5)',
        borderRadius: '8px',
        border: '1px solid var(--colors-gray700)'
      }}
    >
      {showPositionPicker && (
        <>
          {/* Position Label */}
          <Text
            variant="label"
            size="sm"
            style={{
              display: 'block',
              marginBottom: '8px',
              color: 'var(--colors-gray300)',
              fontWeight: '500'
            }}
          >
            {getPositionLabel()}
          </Text>

          {/* Position Controls */}
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '12px'
            }}
          >
            {/* Pick Position Button */}
            <Button
              variant={isPicking === 'to' ? 'primary' : 'outline'}
              size="sm"
              onClick={onPositionPick}
              title={getPickerTitle()}
              disabled={isDisabled}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                padding: 0,
                backgroundColor: isDisabled
                  ? 'var(--colors-gray800)'
                  : (isPicking === 'to' ? 'var(--colors-blue600)' : 'var(--colors-gray700)'),
                color: isDisabled
                  ? 'var(--colors-gray600)'
                  : (isPicking === 'to' ? 'white' : 'var(--colors-gray300)'),
                border: '1px solid var(--colors-gray600)',
                borderRadius: '6px',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                opacity: isDisabled ? 0.5 : 1,
                transition: 'all 0.2s ease',
                animation: isPicking === 'to' && !isDisabled ? 'pulse 2s infinite' : 'none',
                minWidth: 'auto'
              }}
              onMouseEnter={(e) => {
                if (!isDisabled) {
                  e.currentTarget.style.backgroundColor = isPicking === 'to' ? 'var(--colors-blue700)' : 'var(--colors-gray600)'
                  e.currentTarget.style.borderColor = 'var(--colors-dndGold)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isDisabled) {
                  e.currentTarget.style.backgroundColor = isPicking === 'to' ? 'var(--colors-blue600)' : 'var(--colors-gray700)'
                  e.currentTarget.style.borderColor = 'var(--colors-gray600)'
                }
              }}
            >
              <MapPin size={16} />
            </Button>

            {/* Position Inputs */}
            <Box
              style={{
                display: 'flex',
                gap: '8px',
                flex: 1
              }}
            >
              {/* X Input */}
              <Box style={{ flex: 1 }}>
                <input
                  type="number"
                  value={Math.round(targetPosition.x)}
                  readOnly
                  placeholder="X"
                  style={{
                    width: '100%',
                    padding: '8px',
                    fontSize: '12px',
                    backgroundColor: 'var(--colors-gray800)',
                    borderColor: 'var(--colors-gray600)',
                    border: '1px solid var(--colors-gray600)',
                    borderRadius: '4px',
                    color: 'var(--colors-gray100)',
                    textAlign: 'center',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--colors-dndGold)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--colors-gray600)'
                  }}
                />
              </Box>

              {/* Y Input */}
              <Box style={{ flex: 1 }}>
                <input
                  type="number"
                  value={Math.round(targetPosition.y)}
                  readOnly
                  placeholder="Y"
                  style={{
                    width: '100%',
                    padding: '8px',
                    fontSize: '12px',
                    backgroundColor: 'var(--colors-gray800)',
                    borderColor: 'var(--colors-gray600)',
                    border: '1px solid var(--colors-gray600)',
                    borderRadius: '4px',
                    color: 'var(--colors-gray100)',
                    textAlign: 'center',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--colors-dndGold)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--colors-gray600)'
                  }}
                />
              </Box>
            </Box>
          </Box>

          {/* Instruction Text */}
          <Text
            variant="body"
            size="xs"
            style={{
              color: isDisabled ? 'var(--colors-red400)' : 'var(--colors-gray500)',
              margin: 0,
              lineHeight: 1.4
            }}
          >
            {getInstructionText()}
          </Text>
        </>
      )}

      {/* Fade Effect Controls */}
      {showFadeEffect && fadeEffect !== undefined && setFadeEffect && (
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: showPositionPicker ? '12px' : '0'
          }}
        >
          <input
            type="checkbox"
            checked={fadeEffect}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setFadeEffect(e.target.checked)}
            style={{
              accentColor: 'var(--colors-dndGold)',
              width: '16px',
              height: '16px'
            }}
          />
          <Text
            variant="body"
            size="xs"
            style={{
              color: 'var(--colors-gray300)',
              margin: 0
            }}
          >
            {eventType === 'appear' ? 'Fade in effect' : 'Fade out effect'}
          </Text>
        </Box>
      )}
    </Box>
  )
}

export const PositionPicker = memo(PositionPickerComponent)
PositionPicker.displayName = 'PositionPicker'