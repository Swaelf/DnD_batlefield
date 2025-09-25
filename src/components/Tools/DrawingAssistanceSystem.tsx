import React, { useCallback, useState, useRef, useMemo } from 'react'
import { Group, Line, Circle, Rect } from 'react-konva'
import Konva from 'konva'
import useMapStore from '@store/mapStore'
import { Point, MapObject } from '@/types'
import { Box, Text, Button, Checkbox } from '@/components/ui'
import { Grid3x3, Move, RotateCw, Square, Circle as CircleIcon, Triangle } from 'lucide-react'

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
  const [snapGuides, setSnapGuides] = useState<SnapGuide[]>([])
  const [currentDraw, setCurrentDraw] = useState<{
    startPoint: Point
    currentPoint: Point
    isDrawing: boolean
  } | null>(null)
  const [showSettings, setShowSettings] = useState(false)

  const [constraints, setConstraints] = useState<DrawingConstraint[]>([
    { type: 'horizontal', enabled: true, tolerance: 5 },
    { type: 'vertical', enabled: true, tolerance: 5 },
    { type: 'diagonal', enabled: true, tolerance: 15 },
    { type: 'perpendicular', enabled: false, tolerance: 15 },
    { type: 'parallel', enabled: false, tolerance: 15 },
    { type: 'circle', enabled: false, tolerance: 10 },
    { type: 'square', enabled: false, tolerance: 10 }
  ])

  const groupRef = useRef<Konva.Group>(null)
  const { currentMap } = useMapStore()

  // Reference points from existing objects
  const referencePoints = useMemo(() => {
    if (!currentMap) return []

    const points: Point[] = []
    currentMap.objects.forEach(obj => {
      // Add object corners and center
      const width = obj.width || 50
      const height = obj.height || 50

      points.push(
        obj.position, // Top-left
        { x: obj.position.x + width, y: obj.position.y }, // Top-right
        { x: obj.position.x, y: obj.position.y + height }, // Bottom-left
        { x: obj.position.x + width, y: obj.position.y + height }, // Bottom-right
        { x: obj.position.x + width/2, y: obj.position.y + height/2 } // Center
      )

      // Add specific points for shapes
      if (obj.points) {
        for (let i = 0; i < obj.points.length; i += 2) {
          points.push({
            x: obj.position.x + obj.points[i],
            y: obj.position.y + obj.points[i + 1]
          })
        }
      }
    })

    return points
  }, [currentMap])

  // Snap point to grid
  const snapToGrid = useCallback((point: Point): Point => {
    if (!gridSnap) return point

    return {
      x: Math.round(point.x / gridSize) * gridSize,
      y: Math.round(point.y / gridSize) * gridSize
    }
  }, [gridSnap, gridSize])

  // Find nearest reference point
  const findNearestPoint = useCallback((point: Point, tolerance: number = 10): Point | null => {
    let nearest: Point | null = null
    let minDistance = tolerance

    referencePoints.forEach(refPoint => {
      const distance = Math.sqrt(
        Math.pow(point.x - refPoint.x, 2) + Math.pow(point.y - refPoint.y, 2)
      )

      if (distance < minDistance) {
        minDistance = distance
        nearest = refPoint
      }
    })

    return nearest
  }, [referencePoints])

  // Apply drawing constraints
  const applyConstraints = useCallback((startPoint: Point, currentPoint: Point): Point => {
    let constrainedPoint = { ...currentPoint }

    // Apply grid snap first
    constrainedPoint = snapToGrid(constrainedPoint)

    // Apply geometric constraints
    constraints.forEach(constraint => {
      if (!constraint.enabled) return

      const dx = constrainedPoint.x - startPoint.x
      const dy = constrainedPoint.y - startPoint.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      const angle = Math.atan2(dy, dx) * 180 / Math.PI

      switch (constraint.type) {
        case 'horizontal':
          if (Math.abs(dy) < constraint.tolerance) {
            constrainedPoint.y = startPoint.y
          }
          break

        case 'vertical':
          if (Math.abs(dx) < constraint.tolerance) {
            constrainedPoint.x = startPoint.x
          }
          break

        case 'diagonal':
          const diagonalAngle = Math.abs(Math.abs(angle) - 45)
          const diagonalAngle2 = Math.abs(Math.abs(angle) - 135)
          if (diagonalAngle < constraint.tolerance || diagonalAngle2 < constraint.tolerance) {
            const targetAngle = angle > 0 ?
              (angle < 90 ? 45 : 135) :
              (angle > -90 ? -45 : -135)
            const radians = targetAngle * Math.PI / 180
            constrainedPoint.x = startPoint.x + distance * Math.cos(radians)
            constrainedPoint.y = startPoint.y + distance * Math.sin(radians)
          }
          break

        case 'square':
          // Constrain to square proportions
          const maxDimension = Math.max(Math.abs(dx), Math.abs(dy))
          constrainedPoint.x = startPoint.x + (dx >= 0 ? maxDimension : -maxDimension)
          constrainedPoint.y = startPoint.y + (dy >= 0 ? maxDimension : -maxDimension)
          break

        case 'circle':
          // Maintain consistent radius
          if (distance > 0) {
            const avgRadius = distance
            const normalizedAngle = Math.atan2(dy, dx)
            constrainedPoint.x = startPoint.x + avgRadius * Math.cos(normalizedAngle)
            constrainedPoint.y = startPoint.y + avgRadius * Math.sin(normalizedAngle)
          }
          break
      }
    })

    // Check for nearby reference points
    const nearbyPoint = findNearestPoint(constrainedPoint, 15)
    if (nearbyPoint) {
      constrainedPoint = nearbyPoint
    }

    return constrainedPoint
  }, [constraints, snapToGrid, findNearestPoint])

  // Generate visual guides
  const generateGuides = useCallback((startPoint: Point, currentPoint: Point) => {
    const guides: SnapGuide[] = []

    // Grid guides
    if (gridSnap) {
      const snappedPoint = snapToGrid(currentPoint)
      if (snappedPoint.x !== currentPoint.x || snappedPoint.y !== currentPoint.y) {
        guides.push({
          type: 'grid',
          position: snappedPoint,
          color: '#60A5FA'
        })
      }
    }

    // Constraint guides
    constraints.forEach(constraint => {
      if (!constraint.enabled) return

      const dx = currentPoint.x - startPoint.x
      const dy = currentPoint.y - startPoint.y

      switch (constraint.type) {
        case 'horizontal':
          if (Math.abs(dy) < constraint.tolerance * 2) {
            guides.push({
              type: 'object',
              position: { x: startPoint.x - 50, y: startPoint.y },
              color: '#00FF88'
            })
          }
          break

        case 'vertical':
          if (Math.abs(dx) < constraint.tolerance * 2) {
            guides.push({
              type: 'object',
              position: { x: startPoint.x, y: startPoint.y - 50 },
              color: '#00FF88'
            })
          }
          break
      }
    })

    // Reference point guides
    const nearbyPoint = findNearestPoint(currentPoint, 20)
    if (nearbyPoint) {
      guides.push({
        type: 'object',
        position: nearbyPoint,
        color: '#FF6B6B'
      })
    }

    setSnapGuides(guides)
  }, [constraints, gridSnap, snapToGrid, findNearestPoint])

  // Handle mouse events
  const handleMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isActive) return

    const stage = e.target.getStage()
    if (!stage) return

    const pointer = stage.getPointerPosition()
    if (!pointer) return

    const transform = stage.getAbsoluteTransform().copy().invert()
    const pos = transform.point(pointer)

    setCurrentDraw({
      startPoint: pos,
      currentPoint: pos,
      isDrawing: true
    })
  }, [isActive])

  const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isActive || !currentDraw?.isDrawing) return

    const stage = e.target.getStage()
    if (!stage) return

    const pointer = stage.getPointerPosition()
    if (!pointer) return

    const transform = stage.getAbsoluteTransform().copy().invert()
    const pos = transform.point(pointer)

    const constrainedPos = applyConstraints(currentDraw.startPoint, pos)

    setCurrentDraw(prev => prev ? {
      ...prev,
      currentPoint: constrainedPos
    } : null)

    generateGuides(currentDraw.startPoint, constrainedPos)
  }, [isActive, currentDraw, applyConstraints, generateGuides])

  const handleMouseUp = useCallback(() => {
    setCurrentDraw(null)
    setSnapGuides([])
  }, [])

  // Toggle constraint
  const toggleConstraint = useCallback((constraintType: DrawingConstraint['type']) => {
    const updated = constraints.map(constraint =>
      constraint.type === constraintType
        ? { ...constraint, enabled: !constraint.enabled }
        : constraint
    )
    setConstraints(updated)
    onConstraintChange?.(updated)
  }, [constraints, onConstraintChange])

  if (!isActive) return null

  return (
    <>
      <Group
        ref={groupRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Drawing preview */}
        {currentDraw && (
          <Line
            points={[
              currentDraw.startPoint.x,
              currentDraw.startPoint.y,
              currentDraw.currentPoint.x,
              currentDraw.currentPoint.y
            ]}
            stroke="#C9AD6A"
            strokeWidth={2}
            dash={[8, 4]}
            opacity={0.8}
          />
        )}

        {/* Snap guides */}
        {snapGuides.map((guide, index) => {
          switch (guide.type) {
            case 'grid':
              return (
                <Circle
                  key={index}
                  x={guide.position.x}
                  y={guide.position.y}
                  radius={4}
                  fill={guide.color}
                  opacity={0.8}
                />
              )
            case 'object':
              return (
                <Group key={index}>
                  <Circle
                    x={guide.position.x}
                    y={guide.position.y}
                    radius={8}
                    stroke={guide.color}
                    strokeWidth={2}
                    opacity={0.6}
                  />
                  <Circle
                    x={guide.position.x}
                    y={guide.position.y}
                    radius={4}
                    fill={guide.color}
                    opacity={0.8}
                  />
                </Group>
              )
            default:
              return null
          }
        })}

        {/* Constraint guide lines */}
        {currentDraw && constraints.map((constraint, index) => {
          if (!constraint.enabled) return null

          const { startPoint, currentPoint } = currentDraw
          const dx = currentPoint.x - startPoint.x
          const dy = currentPoint.y - startPoint.y

          switch (constraint.type) {
            case 'horizontal':
              if (Math.abs(dy) < constraint.tolerance * 2) {
                return (
                  <Line
                    key={`h-${index}`}
                    points={[startPoint.x - 100, startPoint.y, startPoint.x + 100, startPoint.y]}
                    stroke="#00FF88"
                    strokeWidth={1}
                    dash={[4, 4]}
                    opacity={0.6}
                  />
                )
              }
              break

            case 'vertical':
              if (Math.abs(dx) < constraint.tolerance * 2) {
                return (
                  <Line
                    key={`v-${index}`}
                    points={[startPoint.x, startPoint.y - 100, startPoint.x, startPoint.y + 100]}
                    stroke="#00FF88"
                    strokeWidth={1}
                    dash={[4, 4]}
                    opacity={0.6}
                  />
                )
              }
              break

            default:
              return null
          }
        })}
      </Group>

      {/* Settings panel */}
      <Button
        css={{
          position: 'fixed',
          top: 80,
          right: 20,
          zIndex: 1000
        }}
        variant={showSettings ? 'default' : 'ghost'}
        onClick={() => setShowSettings(!showSettings)}
      >
        <Grid3x3 size={16} />
      </Button>

      {showSettings && (
        <Box
          css={{
            position: 'fixed',
            top: 120,
            right: 20,
            width: 280,
            backgroundColor: '$dndBlack',
            border: '1px solid $gray800',
            borderRadius: '$md',
            padding: '$4',
            zIndex: 1000,
            maxHeight: 400,
            overflow: 'auto'
          }}
        >
          <Text size="lg" weight="semibold" css={{ marginBottom: '$3' }}>
            Drawing Assistance
          </Text>

          <Box css={{ marginBottom: '$3' }}>
            <Text size="sm" css={{ marginBottom: '$2' }}>Basic Constraints:</Text>

            <Box css={{ display: 'flex', flexDirection: 'column', gap: '$2' }}>
              {constraints.filter(c => ['horizontal', 'vertical', 'diagonal'].includes(c.type)).map(constraint => (
                <Box key={constraint.type} css={{ display: 'flex', alignItems: 'center', gap: '$2' }}>
                  <Checkbox
                    checked={constraint.enabled}
                    onCheckedChange={() => toggleConstraint(constraint.type)}
                  />
                  <Text size="sm" css={{ textTransform: 'capitalize' }}>
                    {constraint.type}
                  </Text>
                  {constraint.type === 'horizontal' && <Move size={12} style={{ transform: 'rotate(90deg)' }} />}
                  {constraint.type === 'vertical' && <Move size={12} />}
                  {constraint.type === 'diagonal' && <RotateCw size={12} />}
                </Box>
              ))}
            </Box>
          </Box>

          <Box css={{ marginBottom: '$3' }}>
            <Text size="sm" css={{ marginBottom: '$2' }}>Shape Constraints:</Text>

            <Box css={{ display: 'flex', flexDirection: 'column', gap: '$2' }}>
              {constraints.filter(c => ['square', 'circle'].includes(c.type)).map(constraint => (
                <Box key={constraint.type} css={{ display: 'flex', alignItems: 'center', gap: '$2' }}>
                  <Checkbox
                    checked={constraint.enabled}
                    onCheckedChange={() => toggleConstraint(constraint.type)}
                  />
                  <Text size="sm" css={{ textTransform: 'capitalize' }}>
                    {constraint.type}
                  </Text>
                  {constraint.type === 'square' && <Square size={12} />}
                  {constraint.type === 'circle' && <CircleIcon size={12} />}
                </Box>
              ))}
            </Box>
          </Box>

          <Box css={{ marginBottom: '$3' }}>
            <Text size="sm" css={{ marginBottom: '$2' }}>Advanced:</Text>

            <Box css={{ display: 'flex', flexDirection: 'column', gap: '$2' }}>
              {constraints.filter(c => ['perpendicular', 'parallel'].includes(c.type)).map(constraint => (
                <Box key={constraint.type} css={{ display: 'flex', alignItems: 'center', gap: '$2' }}>
                  <Checkbox
                    checked={constraint.enabled}
                    onCheckedChange={() => toggleConstraint(constraint.type)}
                  />
                  <Text size="sm" css={{ textTransform: 'capitalize' }}>
                    {constraint.type}
                  </Text>
                </Box>
              ))}
            </Box>
          </Box>

          <Box css={{ padding: '$2', backgroundColor: '$gray800', borderRadius: '$sm' }}>
            <Text size="xs" css={{ color: '$gray400' }}>
              💡 Tip: Hold Shift to temporarily disable constraints
            </Text>
          </Box>
        </Box>
      )}
    </>
  )
}

export default DrawingAssistanceSystem