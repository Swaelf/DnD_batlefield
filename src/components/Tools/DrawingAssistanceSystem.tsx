import React, { useCallback, useState, useMemo } from 'react'
import { Group, Line, Circle } from 'react-konva'
// import useMapStore from '@store/mapStore' // Unused since currentMap is commented
import type { Point } from '@/types'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Button } from '@/components/primitives/ButtonVE'
import { Grid3x3, Move, RotateCw, Square, Circle as CircleIcon, Settings } from '@/utils/optimizedIcons'

interface SnapGuide {
  type: 'grid' | 'object' | 'angle' | 'distance'
  position: Point
  angle?: number
  distance?: number
  color: string
}

interface DrawingConstraint {
  type: 'horizontal' | 'vertical' | 'diagonal' | 'perpendicular' | 'parallel' | 'circle' | 'square'
  enabled: boolean
  tolerance: number
}

interface DrawingAssistanceSystemProps {
  isActive: boolean
  gridSize: number
  gridSnap: boolean
  onConstraintChange?: (constraints: DrawingConstraint[]) => void
}

export const DrawingAssistanceSystem: React.FC<DrawingAssistanceSystemProps> = ({
  isActive,
  gridSize,
  gridSnap,
  onConstraintChange
}) => {
  const [snapGuides] = useState<SnapGuide[]>([]) // setSnapGuides unused
  const [currentDraw] = useState<{
    startPoint: Point
    currentPoint: Point
    isDrawing: boolean
  } | null>(null) // setCurrentDraw unused
  const [showSettings, setShowSettings] = useState(false)

  const [constraints, setConstraints] = useState<DrawingConstraint[]>([
    { type: 'horizontal', enabled: true, tolerance: 5 },
    { type: 'vertical', enabled: true, tolerance: 5 },
    { type: 'diagonal', enabled: true, tolerance: 15 },
    { type: 'perpendicular', enabled: false, tolerance: 15 },
    { type: 'parallel', enabled: false, tolerance: 15 },
    { type: 'circle', enabled: true, tolerance: 10 },
    { type: 'square', enabled: true, tolerance: 10 }
  ])

  // const { currentMap } = useMapStore() // Unused since calculateSnapGuides is commented

  // Calculate snap guides based on current drawing state
  // Calculate snap guides - currently unused (referenced only in commented functions)
  /* const calculateSnapGuides = useCallback((currentPoint: Point, startPoint?: Point): SnapGuide[] => {
    if (!isActive || !currentMap) return []

    const guides: SnapGuide[] = []

    // Grid snapping
    if (gridSnap) {
      const snappedX = Math.round(currentPoint.x / gridSize) * gridSize
      const snappedY = Math.round(currentPoint.y / gridSize) * gridSize

      if (Math.abs(currentPoint.x - snappedX) < 10) {
        guides.push({
          type: 'grid',
          position: { x: snappedX, y: currentPoint.y },
          color: '#4ade80'
        })
      }

      if (Math.abs(currentPoint.y - snappedY) < 10) {
        guides.push({
          type: 'grid',
          position: { x: currentPoint.x, y: snappedY },
          color: '#4ade80'
        })
      }
    }

    // Object snapping
    currentMap.objects.forEach(obj => {
      const distance = Math.sqrt(
        Math.pow(currentPoint.x - obj.position.x, 2) +
        Math.pow(currentPoint.y - obj.position.y, 2)
      )

      if (distance < 20) {
        guides.push({
          type: 'object',
          position: obj.position,
          color: '#f59e0b'
        })
      }
    })

    // Constraint-based guides
    if (startPoint) {
      const dx = currentPoint.x - startPoint.x
      const dy = currentPoint.y - startPoint.y
      const angle = Math.atan2(dy, dx) * 180 / Math.PI

      // Horizontal constraint
      const horizontalConstraint = constraints.find(c => c.type === 'horizontal')
      if (horizontalConstraint?.enabled && Math.abs(angle) < horizontalConstraint.tolerance) {
        guides.push({
          type: 'angle',
          position: { x: currentPoint.x, y: startPoint.y },
          angle: 0,
          color: '#3b82f6'
        })
      }

      // Vertical constraint
      const verticalConstraint = constraints.find(c => c.type === 'vertical')
      if (verticalConstraint?.enabled && Math.abs(Math.abs(angle) - 90) < verticalConstraint.tolerance) {
        guides.push({
          type: 'angle',
          position: { x: startPoint.x, y: currentPoint.y },
          angle: 90,
          color: '#3b82f6'
        })
      }

      // Diagonal constraints (45°, 135°)
      const diagonalConstraint = constraints.find(c => c.type === 'diagonal')
      if (diagonalConstraint?.enabled) {
        if (Math.abs(Math.abs(angle) - 45) < diagonalConstraint.tolerance) {
          const distance = Math.sqrt(dx * dx + dy * dy)
          const sign = dx * dy > 0 ? 1 : -1
          guides.push({
            type: 'angle',
            position: {
              x: startPoint.x + distance * Math.cos(45 * Math.PI / 180) * sign,
              y: startPoint.y + distance * Math.sin(45 * Math.PI / 180) * sign
            },
            angle: 45,
            color: '#8b5cf6'
          })
        }
        if (Math.abs(Math.abs(angle) - 135) < diagonalConstraint.tolerance) {
          const distance = Math.sqrt(dx * dx + dy * dy)
          const sign = dx * dy < 0 ? 1 : -1
          guides.push({
            type: 'angle',
            position: {
              x: startPoint.x + distance * Math.cos(135 * Math.PI / 180) * sign,
              y: startPoint.y + distance * Math.sin(135 * Math.PI / 180) * sign
            },
            angle: 135,
            color: '#8b5cf6'
          })
        }
      }

      // Circle constraint (equal distance from start)
      const circleConstraint = constraints.find(c => c.type === 'circle')
      if (circleConstraint?.enabled) {
        const distance = Math.sqrt(dx * dx + dy * dy)
        guides.push({
          type: 'distance',
          position: startPoint,
          distance,
          color: '#ec4899'
        })
      }

      // Square constraint (equal width and height)
      const squareConstraint = constraints.find(c => c.type === 'square')
      if (squareConstraint?.enabled) {
        const size = Math.max(Math.abs(dx), Math.abs(dy))
        guides.push({
          type: 'angle',
          position: {
            x: startPoint.x + (dx > 0 ? size : -size),
            y: startPoint.y + (dy > 0 ? size : -size)
          },
          color: '#06b6d4'
        })
      }
    }

    return guides
  }, [isActive, currentMap, gridSnap, gridSize, constraints]) */

  // Handle constraint toggle
  const handleConstraintToggle = useCallback((type: DrawingConstraint['type']) => {
    const updatedConstraints = constraints.map(constraint =>
      constraint.type === type
        ? { ...constraint, enabled: !constraint.enabled }
        : constraint
    )
    setConstraints(updatedConstraints)
    onConstraintChange?.(updatedConstraints)
  }, [constraints, onConstraintChange])

  // Handle constraint tolerance change
  const handleToleranceChange = useCallback((type: DrawingConstraint['type'], tolerance: number) => {
    const updatedConstraints = constraints.map(constraint =>
      constraint.type === type
        ? { ...constraint, tolerance }
        : constraint
    )
    setConstraints(updatedConstraints)
    onConstraintChange?.(updatedConstraints)
  }, [constraints, onConstraintChange])

  // Apply snap to point - currently unused (duplicate definition below)
  /* const applySnap = useCallback((point: Point, startPoint?: Point): Point => {
    if (!isActive) return point

    const guides = calculateSnapGuides(point, startPoint)

    // Find the closest snap guide
    let closestGuide: SnapGuide | null = null
    let minDistance = Infinity

    guides.forEach(guide => {
      const distance = Math.sqrt(
        Math.pow(point.x - guide.position.x, 2) +
        Math.pow(point.y - guide.position.y, 2)
      )

      if (distance < minDistance) {
        minDistance = distance
        closestGuide = guide
      }
    })

    // Apply snap if close enough
    if (closestGuide && minDistance < 15) {
      return closestGuide!.position // Type assertion since we already checked for null
    }

    return point
  }, [isActive, calculateSnapGuides]) */

  // Start drawing
  /* const _startDrawing = useCallback((point: Point) => {
    if (!isActive) return

    const snappedPoint = applySnap(point)
    setCurrentDraw({
      startPoint: snappedPoint,
      currentPoint: snappedPoint,
      isDrawing: true
    })
  }, [isActive, applySnap]) */

  // Update drawing
  /* const _updateDrawing = useCallback((point: Point) => {
    if (!isActive || !currentDraw?.isDrawing) return

    const snappedPoint = applySnap(point, currentDraw.startPoint)
    const guides = calculateSnapGuides(snappedPoint, currentDraw.startPoint)

    setCurrentDraw(prev => prev ? {
      ...prev,
      currentPoint: snappedPoint
    } : null)

    setSnapGuides(guides)
  }, [isActive, currentDraw, applySnap, calculateSnapGuides]) */

  // End drawing
  /* const _endDrawing = useCallback(() => {
    if (!isActive) return

    setCurrentDraw(null)
    setSnapGuides([])
  }, [isActive]) */

  // Constraint icons
  const constraintIcons = useMemo(() => ({
    horizontal: <Move size={16} style={{ transform: 'rotate(90deg)' }} />,
    vertical: <Move size={16} />,
    diagonal: <RotateCw size={16} />,
    perpendicular: <Grid3x3 size={16} />,
    parallel: <Grid3x3 size={16} />,
    circle: <CircleIcon size={16} />,
    square: <Square size={16} />
  }), [])

  if (!isActive) return null

  return (
    <>
      {/* Konva Drawing Guides */}
      <Group>
        {/* Snap guides */}
        {snapGuides.map((guide, index) => {
          if (guide.type === 'distance' && guide.distance) {
            // Circle guide
            return (
              <Circle
                key={index}
                x={guide.position.x}
                y={guide.position.y}
                radius={guide.distance}
                stroke={guide.color}
                strokeWidth={1}
                dash={[5, 5]}
                listening={false}
              />
            )
          } else {
            // Point guide
            return (
              <Circle
                key={index}
                x={guide.position.x}
                y={guide.position.y}
                radius={4}
                fill={guide.color}
                listening={false}
              />
            )
          }
        })}

        {/* Current drawing preview */}
        {currentDraw?.isDrawing && (
          <Line
            points={[
              currentDraw.startPoint.x,
              currentDraw.startPoint.y,
              currentDraw.currentPoint.x,
              currentDraw.currentPoint.y
            ]}
            stroke="#ffffff"
            strokeWidth={2}
            dash={[3, 3]}
            listening={false}
          />
        )}

        {/* Grid overlay when grid snap is enabled */}
        {gridSnap && currentDraw?.isDrawing && (
          <Group>
            {Array.from({ length: Math.ceil(2000 / gridSize) }, (_, i) => (
              <Line
                key={`v-${i}`}
                points={[i * gridSize, 0, i * gridSize, 2000]}
                stroke="#374151"
                strokeWidth={0.5}
                opacity={0.3}
                listening={false}
              />
            ))}
            {Array.from({ length: Math.ceil(2000 / gridSize) }, (_, i) => (
              <Line
                key={`h-${i}`}
                points={[0, i * gridSize, 2000, i * gridSize]}
                stroke="#374151"
                strokeWidth={0.5}
                opacity={0.3}
                listening={false}
              />
            ))}
          </Group>
        )}
      </Group>

      {/* Settings Panel */}
      <Box
        style={{
          position: 'fixed',
          top: '80px',
          right: '20px',
          width: '280px',
          backgroundColor: 'var(--colors-gray900)',
          border: '1px solid var(--colors-gray700)',
          borderRadius: '8px',
          padding: '16px',
          zIndex: 100
        }}
      >
        {/* Header */}
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <Text variant="heading" size="md" style={{ fontWeight: '600' }}>
            Drawing Assistance
          </Text>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings size={16} />
          </Button>
        </Box>

        {/* Quick Toggle Buttons */}
        <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '16px' }}>
          {constraints.filter(c => ['horizontal', 'vertical', 'diagonal', 'circle'].includes(c.type)).map(constraint => (
            <Button
              key={constraint.type}
              variant={constraint.enabled ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleConstraintToggle(constraint.type)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px'
              }}
            >
              {constraintIcons[constraint.type]}
              {constraint.type}
            </Button>
          ))}
        </Box>

        {/* Advanced Settings */}
        {showSettings && (
          <Box style={{ borderTop: '1px solid var(--colors-gray700)', paddingTop: '16px' }}>
            <Text variant="body" size="sm" style={{ marginBottom: '12px', fontWeight: '500' }}>
              Constraint Settings
            </Text>

            {constraints.map(constraint => (
              <Box key={constraint.type} style={{ marginBottom: '12px' }}>
                <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <Text variant="body" size="xs" style={{ textTransform: 'capitalize' }}>
                    {constraint.type}
                  </Text>
                  <Text variant="body" size="xs" style={{ color: 'var(--colors-gray400)' }}>
                    {constraint.tolerance}°
                  </Text>
                </Box>

                <input
                  type="range"
                  min="1"
                  max="45"
                  value={constraint.tolerance}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleToleranceChange(constraint.type, Number(e.target.value))
                  }
                  style={{
                    width: '100%',
                    height: '4px',
                    background: constraint.enabled ? 'var(--colors-secondary)' : 'var(--colors-gray600)',
                    borderRadius: '2px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                />
              </Box>
            ))}

            {/* Snap Distance */}
            <Box style={{ marginTop: '16px' }}>
              <Text variant="body" size="sm" style={{ marginBottom: '8px', fontWeight: '500' }}>
                Snap Distance: {gridSnap ? `${gridSize}px` : 'Disabled'}
              </Text>
              <Text variant="body" size="xs" style={{ color: 'var(--colors-gray400)' }}>
                Grid snapping is {gridSnap ? 'enabled' : 'disabled'} in map settings
              </Text>
            </Box>
          </Box>
        )}

        {/* Status */}
        <Box
          style={{
            marginTop: '16px',
            padding: '8px',
            backgroundColor: 'var(--colors-gray800)',
            borderRadius: '4px'
          }}
        >
          <Text variant="body" size="xs" style={{ color: 'var(--colors-gray300)' }}>
            Active: {constraints.filter(c => c.enabled).length} constraints
            {currentDraw?.isDrawing && ' • Drawing'}
          </Text>
        </Box>
      </Box>
    </>
  )
}

// Export utilities for external use
export const useDrawingAssistance = (
  isActive: boolean,
  gridSize: number,
  gridSnap: boolean,
  constraints?: DrawingConstraint[]
) => {
  const defaultConstraints: DrawingConstraint[] = [
    { type: 'horizontal', enabled: true, tolerance: 5 },
    { type: 'vertical', enabled: true, tolerance: 5 },
    { type: 'diagonal', enabled: true, tolerance: 15 },
    { type: 'circle', enabled: true, tolerance: 10 },
    { type: 'square', enabled: true, tolerance: 10 }
  ]

  const activeConstraints = constraints || defaultConstraints

  const applySnap = useCallback((point: Point, startPoint?: Point): Point => {
    if (!isActive) return point

    // Grid snapping
    if (gridSnap) {
      const snappedX = Math.round(point.x / gridSize) * gridSize
      const snappedY = Math.round(point.y / gridSize) * gridSize

      if (Math.abs(point.x - snappedX) < 10 && Math.abs(point.y - snappedY) < 10) {
        return { x: snappedX, y: snappedY }
      }
    }

    // Constraint snapping
    if (startPoint) {
      const dx = point.x - startPoint.x
      const dy = point.y - startPoint.y
      const angle = Math.atan2(dy, dx) * 180 / Math.PI

      // Check horizontal constraint
      const horizontal = activeConstraints.find(c => c.type === 'horizontal')
      if (horizontal?.enabled && Math.abs(angle) < horizontal.tolerance) {
        return { x: point.x, y: startPoint.y }
      }

      // Check vertical constraint
      const vertical = activeConstraints.find(c => c.type === 'vertical')
      if (vertical?.enabled && Math.abs(Math.abs(angle) - 90) < vertical.tolerance) {
        return { x: startPoint.x, y: point.y }
      }
    }

    return point
  }, [isActive, gridSnap, gridSize, activeConstraints])

  return { applySnap }
}

export default DrawingAssistanceSystem