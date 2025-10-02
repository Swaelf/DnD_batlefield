import { type FC, useRef, useState } from 'react'
import { Group, Line, Rect } from 'react-konva'
import type Konva from 'konva'
// import useMapStore from '@store/mapStore' // Unused
// MapObject and Point types are unused

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

export const ObjectAlignmentSystem: FC<ObjectAlignmentSystemProps> = ({
  isActive,
  // selectedObjects, // Unused parameter
  // snapTolerance = 5, // Unused parameter
  showGuides = true
}) => {
  const [activeGuides] = useState<AlignmentGuide[]>([])
  // const [isDragging, setIsDragging] = useState(false)

  const groupRef = useRef<Konva.Group>(null)

  // const { currentMap } = useMapStore() // Unused

  // Get all objects except selected ones (for alignment reference) - currently unused
  /* const referenceObjects = useMemo(() => {
    if (!currentMap) return []
    return currentMap.objects.filter(obj => !selectedObjects.includes(obj.id))
  }, [currentMap, selectedObjects]) */

  // Get selected object data
  // const selectedObjectData = useMemo(() => {
  //   if (!currentMap) return []
  //   return currentMap.objects.filter(obj => selectedObjects.includes(obj.id))
  // }, [currentMap, selectedObjects])

  // Calculate object bounds - currently unused
  /* const getObjectBounds = useCallback((obj: MapObject) => {
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
  }, []) */

  // Find alignment guides for current position
  /* const findAlignmentGuides = useCallback((draggedObjects: MapObject[], _mousePos: Point) => {
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
  }, [referenceObjects, snapTolerance, getObjectBounds]) */

  // Snap position to alignment guides
  /* const snapToAlignment = useCallback((position: Point, objWidth: number, objHeight: number): Point => {
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
  }, [findAlignmentGuides, snapTolerance]) */

  // Note: Drag and alignment handlers removed as they are not currently used
  // These could be re-implemented if drag-and-drop alignment is needed

  // Note: Alignment methods are internal to this component
  // They could be exposed via context or props if needed externally

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