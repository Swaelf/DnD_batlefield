import { type FC, type ChangeEvent } from 'react'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'

type StyleSliderControlProps = {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
  formatValue?: (value: number) => string
}

export const StyleSliderControl: FC<StyleSliderControlProps> = ({
  label,
  value,
  min,
  max,
  step,
  onChange,
  formatValue
}) => {
  const displayValue = formatValue ? formatValue(value) : value.toString()

  return (
    <Box
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '8px'
      }}
    >
      <Text
        variant="label"
        size="xs"
        style={{
          minWidth: '60px',
          fontWeight: '500',
          color: 'var(--colors-gray300)'
        }}
      >
        {label}: {displayValue}
      </Text>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(Number(e.target.value))}
        style={{
          flex: 1,
          appearance: 'none',
          height: '4px',
          borderRadius: '4px',
          background: 'var(--colors-gray800)',
          outline: 'none'
        }}
      />
    </Box>
  )
}
