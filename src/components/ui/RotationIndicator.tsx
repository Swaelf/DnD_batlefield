import { type FC, type MouseEvent as ReactMouseEvent, useRef } from 'react'
import { Box, Text } from '@/components/primitives'

type RotationIndicatorProps = {
  value: number
  onChange: (value: number) => void
  label?: string
  size?: number
}

const SNAP_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315]
const SNAP_THRESHOLD = 5 // Snap when within 5 degrees

export const RotationIndicator: FC<RotationIndicatorProps> = ({
  value,
  onChange,
  label = 'Rotation',
  size = 60
}) => {
  const isDragging = useRef(false)
  const handleMouseDown = (e: ReactMouseEvent<SVGElement>) => {
    // Check if clicking on snap point
    const target = e.target as SVGElement
    if (target.getAttribute('data-snap-angle')) {
      return // Let the snap point handle it
    }

    isDragging.current = true
    const svg = e.currentTarget
    const rect = svg.getBoundingClientRect()
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const updateRotation = (clientX: number, clientY: number) => {
      const x = clientX - rect.left - centerX
      const y = clientY - rect.top - centerY
      let angle = Math.atan2(y, x) * (180 / Math.PI)
      angle = (angle + 90 + 360) % 360 // Adjust so 0° is at top

      // Snap to nearest angle if close
      for (const snapAngle of SNAP_ANGLES) {
        if (Math.abs(angle - snapAngle) < SNAP_THRESHOLD) {
          angle = snapAngle
          break
        }
      }

      onChange(Math.round(angle))
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging.current) {
        updateRotation(e.clientX, e.clientY)
      }
    }

    const handleMouseUp = () => {
      isDragging.current = false
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    updateRotation(e.clientX, e.clientY)
  }

  const handleSnapClick = (angle: number) => {
    onChange(angle)
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

        {/* Snap point markers and clickable areas */}
        {SNAP_ANGLES.map(deg => {
          const rad = ((deg - 90) * Math.PI) / 180
          const x = size / 2 + ((size / 2) - 6) * Math.cos(rad)
          const y = size / 2 + ((size / 2) - 6) * Math.sin(rad)
          const isMajor = deg % 90 === 0
          const isActive = Math.abs(value - deg) < 3

          return (
            <g key={deg}>
              {/* Clickable area (larger for better UX) */}
              <circle
                cx={x}
                cy={y}
                r="8"
                fill="transparent"
                style={{ cursor: 'pointer' }}
                data-snap-angle={deg}
                onClick={() => handleSnapClick(deg)}
              />
              {/* Visual marker */}
              <circle
                cx={x}
                cy={y}
                r={isMajor ? "3" : "2"}
                fill={isActive ? "#C9AD6A" : isMajor ? "rgba(201, 173, 106, 0.6)" : "rgba(156, 163, 175, 0.4)"}
                style={{ pointerEvents: 'none' }}
              />
              {/* Label for major angles */}
              {isMajor && (
                <text
                  x={x + (Math.cos(rad) * 12)}
                  y={y + (Math.sin(rad) * 12) + 3}
                  fontSize="8"
                  fill="rgba(156, 163, 175, 0.8)"
                  textAnchor="middle"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {deg}°
                </text>
              )}
            </g>
          )
        })}
      </svg>
      <Text size="xs" color="gray300" weight="semibold">{value}°</Text>
    </Box>
  )
}