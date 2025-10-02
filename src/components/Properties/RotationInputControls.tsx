import { useState, useEffect, type FC, type ChangeEvent } from 'react'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Input } from '@/components/ui/Input'

type RotationInputControlsProps = {
  value: number
  onChange: (value: number) => void
}

export const RotationInputControls: FC<RotationInputControlsProps> = ({
  value,
  onChange
}) => {
  const [isEditingInput, setIsEditingInput] = useState(false)
  const [inputValue, setInputValue] = useState(value.toString())

  useEffect(() => {
    if (!isEditingInput) {
      setInputValue(value.toString())
    }
  }, [value, isEditingInput])

  const normalizeAngle = (angle: number) => {
    while (angle < 0) angle += 360
    while (angle >= 360) angle -= 360
    return angle
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleInputBlur = () => {
    const parsed = parseFloat(inputValue)
    if (!isNaN(parsed)) {
      onChange(normalizeAngle(parsed))
    } else {
      setInputValue(value.toString())
    }
    setIsEditingInput(false)
  }

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleInputBlur()
    }
    if (e.key === 'Escape') {
      setInputValue(value.toString())
      setIsEditingInput(false)
    }
  }

  return (
    <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Editable angle input */}
      <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Input
          type="number"
          value={isEditingInput ? inputValue : value}
          onChange={handleInputChange}
          onFocus={() => setIsEditingInput(true)}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          min="0"
          max="359"
          style={{ width: '70px', textAlign: 'center' }}
        />
        <Text
          variant="body"
          size="sm"
          style={{
            margin: 0,
            color: 'var(--colors-gray400)'
          }}
        >
          degrees
        </Text>
      </Box>

      {/* Slider */}
      <input
        type="range"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min="0"
        max="359"
        style={{
          width: '100%',
          height: '6px',
          backgroundColor: 'var(--colors-gray700)',
          borderRadius: '3px',
          outline: 'none',
          appearance: 'none',
          cursor: 'pointer'
        }}
      />
    </Box>
  )
}
