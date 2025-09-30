import React from 'react'
import { Box, Text } from '@/components/primitives'

type AngleIndicatorProps = {
  value: number
  onChange: (value: number) => void
  label?: string
  min?: number
  max?: number
  size?: number
}

export const AngleIndicator: React.FC<AngleIndicatorProps> = ({
  value,
  onChange,
  label = 'Angle',
  min = 15,
  max = 180,
  size = 60
}) => {
  const handleMouseDown = (e: React.MouseEvent<SVGElement>) => {
    const svg = e.currentTarget
    const rect = svg.getBoundingClientRect()
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const updateAngle = (clientX: number, clientY: number) => {
      const x = clientX - rect.left - centerX
      const y = clientY - rect.top - centerY

      // Calculate angle from vertical (top = 0°)
      let angle = Math.atan2(x, -y) * (180 / Math.PI)
      angle = Math.abs(angle)

      // Clamp to min/max
      angle = Math.max(min, Math.min(max, angle))
      onChange(Math.round(angle))
    }

    const handleMouseMove = (e: MouseEvent) => {
      updateAngle(e.clientX, e.clientY)
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    updateAngle(e.clientX, e.clientY)
  }

  // Calculate line endpoints for the cone angle
  const radius = (size / 2) - 8
  const halfAngle = (value / 2) * (Math.PI / 180)

  const line1X = size / 2 + radius * Math.sin(halfAngle)
  const line1Y = size / 2 - radius * Math.cos(halfAngle)

  const line2X = size / 2 - radius * Math.sin(halfAngle)
  const line2Y = size / 2 - radius * Math.cos(halfAngle)

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
      <Text size="xs" color="gray400">{label}</Text>
      <svg
        width={size}
        height={size}
        style={{ cursor: 'pointer', userSelect: 'none' }}
        onMouseDown={handleMouseDown}
      >
        {/* Outer circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={(size / 2) - 2}
          fill="rgba(55, 65, 81, 0.5)"
          stroke="rgba(107, 114, 128, 0.5)"
          strokeWidth="2"
        />

        {/* Angle arc */}
        <path
          d={`M ${line2X} ${line2Y} A ${radius} ${radius} 0 0 1 ${line1X} ${line1Y}`}
          fill="none"
          stroke="rgba(201, 173, 106, 0.3)"
          strokeWidth="2"
        />

        {/* Cone lines */}
        <line
          x1={size / 2}
          y1={size / 2}
          x2={line1X}
          y2={line1Y}
          stroke="#C9AD6A"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1={size / 2}
          y1={size / 2}
          x2={line2X}
          y2={line2Y}
          stroke="#C9AD6A"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Center dot */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r="3"
          fill="#C9AD6A"
        />
      </svg>
      <Text size="xs" color="gray300" weight="semibold">{value}°</Text>
    </Box>
  )
}