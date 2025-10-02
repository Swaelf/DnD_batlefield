import { useRef, type FC } from 'react'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'

type RotationDialProps = {
  value: number
  snapAngles: number[]
  snapThreshold: number
  onChange: (value: number) => void
}

export const RotationDial: FC<RotationDialProps> = ({
  value,
  snapAngles,
  snapThreshold,
  onChange
}) => {
  const dialRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  const normalizeAngle = (angle: number) => {
    while (angle < 0) angle += 360
    while (angle >= 360) angle -= 360
    return angle
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dialRef.current) return
    isDragging.current = true
    e.preventDefault()

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !dialRef.current) return

      const rect = dialRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const deltaX = e.clientX - centerX
      const deltaY = e.clientY - centerY

      let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 90
      angle = normalizeAngle(angle)

      // Check for snap angles
      for (const snapAngle of snapAngles) {
        if (Math.abs(angle - snapAngle) < snapThreshold) {
          angle = snapAngle
          break
        }
      }

      onChange(Math.round(angle))
    }

    const handleMouseUp = () => {
      isDragging.current = false
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const handleSnapClick = (angle: number) => {
    onChange(angle)
  }

  return (
    <Box
      ref={dialRef}
      onMouseDown={handleMouseDown}
      style={{
        position: 'relative',
        width: '80px',
        height: '80px',
        backgroundColor: 'var(--colors-gray800)',
        borderRadius: '50%',
        border: '2px solid var(--colors-gray600)',
        cursor: 'grab',
        userSelect: 'none'
      }}
    >
      {/* Radial lines for major angles */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
        const rad = ((angle - 90) * Math.PI) / 180
        const x1 = Math.cos(rad) * 25 + 40
        const y1 = Math.sin(rad) * 25 + 40
        const x2 = Math.cos(rad) * 32 + 40
        const y2 = Math.sin(rad) * 32 + 40
        const isMajorAngle = angle % 90 === 0

        return (
          <svg
            key={`line-${angle}`}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '80px',
              height: '80px',
              pointerEvents: 'none'
            }}
          >
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={isMajorAngle ? 'var(--colors-gray500)' : 'var(--colors-gray700)'}
              strokeWidth={isMajorAngle ? '2' : '1'}
              opacity={isMajorAngle ? 0.8 : 0.4}
            />
          </svg>
        )
      })}

      {/* Snap angle indicators with enhanced visibility */}
      {snapAngles.map((angle) => {
        const rad = ((angle - 90) * Math.PI) / 180
        const x = Math.cos(rad) * 38 + 40
        const y = Math.sin(rad) * 38 + 40
        const labelX = Math.cos(rad) * 50 + 40
        const labelY = Math.sin(rad) * 50 + 40
        const isActive = Math.abs(value - angle) < 3
        const isMajorAngle = angle % 90 === 0

        return (
          <div key={angle}>
            {/* Clickable area - larger for better UX */}
            <Box
              onClick={(e) => {
                e.stopPropagation()
                handleSnapClick(angle)
              }}
              style={{
                position: 'absolute',
                left: `${x}px`,
                top: `${y}px`,
                width: '20px',
                height: '20px',
                transform: 'translate(-50%, -50%)',
                cursor: 'pointer',
                zIndex: isActive ? 3 : 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title={`Click to set ${angle}°`}
            >
              {/* Visual dot */}
              <Box
                style={{
                  width: isMajorAngle ? '14px' : '12px',
                  height: isMajorAngle ? '14px' : '12px',
                  backgroundColor: isActive
                    ? 'var(--colors-secondary)'
                    : isMajorAngle
                      ? 'var(--colors-gray400)'
                      : 'var(--colors-gray500)',
                  border: isActive
                    ? '2px solid var(--colors-secondary)'
                    : isMajorAngle
                      ? '2px solid var(--colors-gray600)'
                      : '1px solid var(--colors-gray600)',
                  borderRadius: '50%',
                  transition: 'all 0.2s',
                  boxShadow: isActive
                    ? '0 0 8px var(--colors-secondary)'
                    : isMajorAngle
                      ? '0 0 4px rgba(0,0,0,0.2)'
                      : 'none'
                }}
              />
            </Box>

            {/* Angle label for all angles */}
            <Text
              variant="body"
              size="xs"
              style={{
                position: 'absolute',
                left: `${labelX}px`,
                top: `${labelY}px`,
                transform: 'translate(-50%, -50%)',
                color: isActive
                  ? 'var(--colors-secondary)'
                  : isMajorAngle
                    ? 'var(--colors-gray300)'
                    : 'var(--colors-gray500)',
                fontSize: isMajorAngle ? '11px' : '9px',
                fontWeight: isActive ? 'bold' : isMajorAngle ? '600' : 'normal',
                userSelect: 'none',
                pointerEvents: 'none',
                backgroundColor: 'var(--colors-gray900)',
                padding: '1px 3px',
                borderRadius: '2px'
              }}
            >
              {angle}°
            </Text>
          </div>
        )
      })}

      {/* Current angle pointer with arrow */}
      <Box
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '3px',
          height: '35px',
          backgroundColor: 'var(--colors-secondary)',
          transformOrigin: '50% 0',
          transform: `translate(-50%, 0) rotate(${value}deg)`,
          pointerEvents: 'none',
          borderRadius: '2px',
          boxShadow: '0 0 4px rgba(0,0,0,0.3)'
        }}
      >
        {/* Arrow tip */}
        <Box
          style={{
            position: 'absolute',
            bottom: '-5px',
            left: '50%',
            width: '0',
            height: '0',
            borderLeft: '4px solid transparent',
            borderRight: '4px solid transparent',
            borderTop: '6px solid var(--colors-secondary)',
            transform: 'translateX(-50%)'
          }}
        />
      </Box>

      {/* Center dot */}
      <Box
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '6px',
          height: '6px',
          backgroundColor: 'var(--colors-gray400)',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none'
        }}
      />

      {/* Angle labels for major angles */}
      {[0, 90, 180, 270].map((angle) => {
        const positions = {
          0: { top: '-20px', left: '50%', transform: 'translateX(-50%)' },
          90: { top: '50%', right: '-20px', transform: 'translateY(-50%)' },
          180: { bottom: '-20px', left: '50%', transform: 'translateX(-50%)' },
          270: { top: '50%', left: '-20px', transform: 'translateY(-50%)' }
        }

        return (
          <Text
            key={angle}
            variant="body"
            size="xs"
            style={{
              position: 'absolute',
              ...positions[angle as keyof typeof positions],
              color: 'var(--colors-gray400)',
              fontSize: '10px',
              userSelect: 'none',
              pointerEvents: 'none'
            }}
          >
            {angle}°
          </Text>
        )
      })}
    </Box>
  )
}
