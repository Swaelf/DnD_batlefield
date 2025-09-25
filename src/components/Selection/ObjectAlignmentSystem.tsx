import React, { useCallback, useMemo, useRef, useState } from 'react'
import { Group, Line, Rect } from 'react-konva'
import Konva from 'konva'
import useMapStore from '@store/mapStore'
import { Point, MapObject } from '@/types'

interface ObjectAlignmentSystemProps {
  isActive: boolean
  selectedObjects: string[]
  snapTolerance?: number
  showGuides?: boolean
}

interface AlignmentGuide {
  type: 'horizontal' | 'vertical'
  position: number
  length: number
  startX?: number
  startY?: number
  endX?: number
  endY?: number
}

export const ObjectAlignmentSystem: React.FC<ObjectAlignmentSystemProps> = ({
  isActive,
  selectedObjects,
  snapTolerance = 5,
  showGuides = true
}) => {
  const [activeGuides, setActiveGuides] = useState<AlignmentGuide[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const groupRef = useRef<Konva.Group>(null)

  const { currentMap, updateObject } = useMapStore()

  // Get all objects except selected ones (for alignment reference)
  const referenceObjects = useMemo(() => {
    if (!currentMap) return []
    return currentMap.objects.filter(obj => !selectedObjects.includes(obj.id))
  }, [currentMap, selectedObjects])

  // Get selected object data
  const selectedObjectData = useMemo(() => {
    if (!currentMap) return []
    return currentMap.objects.filter(obj => selectedObjects.includes(obj.id))
  }, [currentMap, selectedObjects])

  // Calculate object bounds
  const getObjectBounds = useCallback((obj: MapObject) => {
    const width = obj.width || 50
    const height = obj.height || 50

    return {
      left: obj.position.x,
      right: obj.position.x + width,
      top: obj.position.y,
      bottom: obj.position.y + height,
      centerX: obj.position.x + width / 2,
      centerY: obj.position.y + height / 2,
      width,
      height
    }
  }, [])

  // Find alignment guides for current position
  const findAlignmentGuides = useCallback((draggedObjects: MapObject[], mousePos: Point) => {
    if (referenceObjects.length === 0) return []

    const guides: AlignmentGuide[] = []
    const tolerance = snapTolerance

    // Get bounds for all dragged objects
    const draggedBounds = draggedObjects.map(getObjectBounds)

    // Find potential alignment points from reference objects
    const referencePoints = referenceObjects.map(getObjectBounds)

    draggedBounds.forEach(draggedBound => {
      referencePoints.forEach(refBound => {
        // Horizontal alignment guides (vertical lines)
        const horizontalAlignments = [
          { type: 'left', draggedPos: draggedBound.left, refPos: refBound.left },
          { type: 'center', draggedPos: draggedBound.centerX, refPos: refBound.centerX },
          { type: 'right', draggedPos: draggedBound.right, refPos: refBound.right }
        ]

        horizontalAlignments.forEach(alignment => {
          const distance = Math.abs(alignment.draggedPos - alignment.refPos)
          if (distance <= tolerance) {
            guides.push({
              type: 'vertical',
              position: alignment.refPos,
              length: Math.abs(Math.max(draggedBound.bottom, refBound.bottom) - Math.min(draggedBound.top, refBound.top)) + 40,
              startX: alignment.refPos,
              startY: Math.min(draggedBound.top, refBound.top) - 20,
              endX: alignment.refPos,
              endY: Math.max(draggedBound.bottom, refBound.bottom) + 20
            })
          }
        })

        // Vertical alignment guides (horizontal lines)
        const verticalAlignments = [
          { type: 'top', draggedPos: draggedBound.top, refPos: refBound.top },
          { type: 'center', draggedPos: draggedBound.centerY, refPos: refBound.centerY },
          { type: 'bottom', draggedPos: draggedBound.bottom, refPos: refBound.bottom }
        ]

        verticalAlignments.forEach(alignment => {
          const distance = Math.abs(alignment.draggedPos - alignment.refPos)
          if (distance <= tolerance) {
            guides.push({
              type: 'horizontal',
              position: alignment.refPos,
              length: Math.abs(Math.max(draggedBound.right, refBound.right) - Math.min(draggedBound.left, refBound.left)) + 40,
              startX: Math.min(draggedBound.left, refBound.left) - 20,
              startY: alignment.refPos,
              endX: Math.max(draggedBound.right, refBound.right) + 20,
              endY: alignment.refPos
            })
          }
        })
      })
    })

    // Remove duplicate guides
    const uniqueGuides = guides.filter((guide, index, self) =>
      index === self.findIndex(g =>
        g.type === guide.type &&
        Math.abs(g.position - guide.position) < 1
      )
    )

    return uniqueGuides
  }, [referenceObjects, snapTolerance, getObjectBounds])

  // Snap position to alignment guides
  const snapToAlignment = useCallback((position: Point, objWidth: number, objHeight: number): Point => {
    const guides = findAlignmentGuides([{
      id: 'temp',
      type: 'shape',
      position,
      width: objWidth,
      height: objHeight,
      layer: 0,
      rotation: 0,
      visible: true,
      locked: false
    } as MapObject], position)

    let snappedX = position.x
    let snappedY = position.y

    // Snap to vertical guides
    guides
      .filter(guide => guide.type === 'vertical')
      .forEach(guide => {
        const leftDistance = Math.abs(position.x - guide.position)
        const centerDistance = Math.abs(position.x + objWidth / 2 - guide.position)
        const rightDistance = Math.abs(position.x + objWidth - guide.position)

        if (leftDistance <= snapTolerance) {
          snappedX = guide.position
        } else if (centerDistance <= snapTolerance) {
          snappedX = guide.position - objWidth / 2
        } else if (rightDistance <= snapTolerance) {
          snappedX = guide.position - objWidth
        }
      })

    // Snap to horizontal guides
    guides
      .filter(guide => guide.type === 'horizontal')
      .forEach(guide => {
        const topDistance = Math.abs(position.y - guide.position)
        const centerDistance = Math.abs(position.y + objHeight / 2 - guide.position)
        const bottomDistance = Math.abs(position.y + objHeight - guide.position)

        if (topDistance <= snapTolerance) {
          snappedY = guide.position
        } else if (centerDistance <= snapTolerance) {
          snappedY = guide.position - objHeight / 2
        } else if (bottomDistance <= snapTolerance) {
          snappedY = guide.position - objHeight
        }
      })

    return { x: snappedX, y: snappedY }
  }, [findAlignmentGuides, snapTolerance])

  // Handle drag start
  const handleDragStart = useCallback(() => {
    setIsDragging(true)
  }, [])

  // Handle drag move
  const handleDragMove = useCallback((position: Point) => {
    if (!isDragging || selectedObjectData.length === 0) return

    // Find alignment guides for current drag position
    const guides = findAlignmentGuides(selectedObjectData, position)
    setActiveGuides(guides)

    // Apply snapping to selected objects
    selectedObjectData.forEach(obj => {
      const objBounds = getObjectBounds(obj)
      const snappedPosition = snapToAlignment(obj.position, objBounds.width, objBounds.height)

      if (snappedPosition.x !== obj.position.x || snappedPosition.y !== obj.position.y) {
        updateObject(obj.id, { position: snappedPosition })
      }
    })
  }, [isDragging, selectedObjectData, findAlignmentGuides, snapToAlignment, getObjectBounds, updateObject])

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
    setActiveGuides([])
  }, [])

  // Auto-align selected objects to each other
  const alignSelectedObjects = useCallback((alignmentType: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    if (selectedObjectData.length < 2) return

    const bounds = selectedObjectData.map(getObjectBounds)
    let referenceValue: number

    switch (alignmentType) {
      case 'left':
        referenceValue = Math.min(...bounds.map(b => b.left))
        selectedObjectData.forEach((obj, index) => {
          updateObject(obj.id, { position: { x: referenceValue, y: obj.position.y } })
        })
        break

      case 'center':
        referenceValue = bounds.reduce((sum, b) => sum + b.centerX, 0) / bounds.length
        selectedObjectData.forEach((obj, index) => {
          const objBounds = bounds[index]
          updateObject(obj.id, {
            position: {
              x: referenceValue - objBounds.width / 2,
              y: obj.position.y
            }
          })
        })
        break

      case 'right':
        referenceValue = Math.max(...bounds.map(b => b.right))
        selectedObjectData.forEach((obj, index) => {
          const objBounds = bounds[index]
          updateObject(obj.id, {
            position: {
              x: referenceValue - objBounds.width,
              y: obj.position.y
            }
          })
        })
        break

      case 'top':
        referenceValue = Math.min(...bounds.map(b => b.top))
        selectedObjectData.forEach((obj, index) => {
          updateObject(obj.id, { position: { x: obj.position.x, y: referenceValue } })
        })
        break

      case 'middle':
        referenceValue = bounds.reduce((sum, b) => sum + b.centerY, 0) / bounds.length
        selectedObjectData.forEach((obj, index) => {
          const objBounds = bounds[index]
          updateObject(obj.id, {
            position: {
              x: obj.position.x,
              y: referenceValue - objBounds.height / 2
            }
          })
        })
        break

      case 'bottom':
        referenceValue = Math.max(...bounds.map(b => b.bottom))
        selectedObjectData.forEach((obj, index) => {
          const objBounds = bounds[index]
          updateObject(obj.id, {
            position: {
              x: obj.position.x,
              y: referenceValue - objBounds.height
            }
          })
        })
        break
    }
  }, [selectedObjectData, getObjectBounds, updateObject])

  // Expose alignment methods
  React.useImperativeHandle(React.createRef(), () => ({
    alignLeft: () => alignSelectedObjects('left'),
    alignCenter: () => alignSelectedObjects('center'),
    alignRight: () => alignSelectedObjects('right'),
    alignTop: () => alignSelectedObjects('top'),
    alignMiddle: () => alignSelectedObjects('middle'),
    alignBottom: () => alignSelectedObjects('bottom'),
    snapToAlignment,
    handleDragStart,
    handleDragMove,
    handleDragEnd
  }))

  if (!isActive || !showGuides) {
    return null
  }

  return (
    <Group ref={groupRef}>
      {/* Render active alignment guides */}
      {activeGuides.map((guide, index) => (
        <Line
          key={index}
          points={[
            guide.startX || guide.position,
            guide.startY || guide.position,
            guide.endX || guide.position,
            guide.endY || guide.position
          ]}
          stroke="#00FF88"
          strokeWidth={1}
          dash={[4, 4]}
          listening={false}
          opacity={0.8}
        />
      ))}

      {/* Distance indicators */}
      {activeGuides.map((guide, index) => {
        if (guide.type === 'vertical') {
          return (
            <Group key={`indicator-${index}`}>
              <Rect
                x={guide.position - 15}
                y={guide.startY! + guide.length / 2 - 8}
                width={30}
                height={16}
                fill="rgba(0, 255, 136, 0.8)"
                cornerRadius={2}
              />
            </Group>
          )
        } else {
          return (
            <Group key={`indicator-${index}`}>
              <Rect
                x={guide.startX! + guide.length / 2 - 15}
                y={guide.position - 8}
                width={30}
                height={16}
                fill="rgba(0, 255, 136, 0.8)"
                cornerRadius={2}
              />
            </Group>
          )
        }
      })}
    </Group>
  )
}

export default ObjectAlignmentSystem