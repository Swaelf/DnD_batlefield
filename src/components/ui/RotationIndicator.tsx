import { type FC, type MouseEvent as ReactMouseEvent } from 'react'
import { Box, Text } from '@/components/primitives'

type RotationIndicatorProps = {
  value: number
  onChange: (value: number) => void
  label?: string
  size?: number
}

export const RotationIndicator: FC<RotationIndicatorProps> = ({
  value,
  onChange,
  label = 'Rotation',
  size = 60
}) => {
  const handleMouseDown = (e: ReactMouseEvent<SVGElement>) => {
    const svg = e.currentTarget
    const rect = svg.getBoundingClientRect()
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const updateRotation = (clientX: number, clientY: number) => {
      const x = clientX - rect.left - centerX
      const y = clientY - rect.top - centerY
      let angle = Math.atan2(y, x) * (180 / Math.PI)
      angle = (angle + 90 + 360) % 360 // Adjust so 0° is at top
      onChange(Math.round(angle))
    }

    const handleMouseMove = (e: MouseEvent) => {
      updateRotation(e.clientX, e.clientY)
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    updateRotation(e.clientX, e.clientY)
  }

  // Calculate line endpoint
  const angleRad = ((value - 90) * Math.PI) / 180
  const radius = (size / 2) - 8
  const lineX = size / 2 + radius * Math.cos(angleRad)
  const lineY = size / 2 + radius * Math.sin(angleRad)

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

        {/* Rotation line */}
        <line
          x1={size / 2}
          y1={size / 2}
          x2={lineX}
          y2={lineY}
          stroke="#C9AD6A"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Center dot */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r="3"
          fill="#C9AD6A"
        />

        {/* Degree markers */}
        {[0, 90, 180, 270].map(deg => {
          const rad = ((deg - 90) * Math.PI) / 180
          const x = size / 2 + ((size / 2) - 6) * Math.cos(rad)
          const y = size / 2 + ((size / 2) - 6) * Math.sin(rad)
          return (
            <circle
              key={deg}
              cx={x}
              cy={y}
              r="2"
              fill="rgba(156, 163, 175, 0.5)"
            />
          )
        })}
      </svg>
      <Text size="xs" color="gray300" weight="semibold">{value}°</Text>
    </Box>
  )
}