import { type FC } from 'react'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'

export type ProgressProps = {
  value: number // 0 to 100
  label?: string
  showPercentage?: boolean
  height?: number
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
}

export const Progress: FC<ProgressProps> = ({
  value,
  label,
  showPercentage = true,
  height = 8,
  color = 'primary'
}) => {
  const colors = {
    primary: 'var(--colors-primary)',
    secondary: 'var(--colors-secondary)',
    success: 'var(--colors-success)',
    warning: 'var(--colors-warning)',
    error: 'var(--colors-error)'
  }

  const clampedValue = Math.max(0, Math.min(100, value))

  return (
    <Box style={{ width: '100%' }}>
      {(label || showPercentage) && (
        <Box
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px'
          }}
        >
          {label && (
            <Text variant="body" size="sm">
              {label}
            </Text>
          )}
          {showPercentage && (
            <Text variant="body" size="sm" style={{ color: 'var(--colors-gray400)' }}>
              {Math.round(clampedValue)}%
            </Text>
          )}
        </Box>
      )}
      <Box
        style={{
          width: '100%',
          height: `${height}px`,
          backgroundColor: 'var(--colors-gray800)',
          borderRadius: `${height / 2}px`,
          overflow: 'hidden'
        }}
      >
        <Box
          style={{
            width: `${clampedValue}%`,
            height: '100%',
            backgroundColor: colors[color],
            transition: 'width 0.3s ease',
            borderRadius: `${height / 2}px`
          }}
        />
      </Box>
    </Box>
  )
}
