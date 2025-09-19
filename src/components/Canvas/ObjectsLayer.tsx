import React from 'react'
import { Group, Rect, Circle, Line, Text as KonvaText } from 'react-konva'
import Konva from 'konva'
import { MapObject, Shape, Text } from '@/types/map'
import { Token as TokenType } from '@/types/token'
import useMapStore from '@store/mapStore'
import useToolStore from '@store/toolStore'
import useEventCreationStore from '@store/eventCreationStore'
import { Token } from '../Token/Token'
import { snapToGrid } from '@/utils/grid'
import { ProjectileSpell, RaySpell, AreaSpell, BurstSpell } from '../Spells'
import { SpellEventData } from '@/types/timeline'

// Type guard for token
function isToken(obj: MapObject): obj is TokenType {
  return obj.type === 'token'
}

// Type guard for shape
function isShape(obj: MapObject): obj is Shape {
  return obj.type === 'shape'
}

// Type guard for text
function isText(obj: MapObject): obj is Text {
  return obj.type === 'text'
}

// Type guard for spell
function isSpell(obj: MapObject): obj is MapObject & { type: 'spell'; spellData?: SpellEventData } {
  return obj.type === 'spell'
}

interface ObjectsLayerProps {
  onObjectClick?: (id: string, e: Konva.KonvaEventObject<MouseEvent>) => void
  onObjectDragEnd?: (id: string, newPosition: { x: number; y: number }) => void
}

const ObjectsLayer: React.FC<ObjectsLayerProps> = ({ onObjectClick, onObjectDragEnd }) => {
  const { currentMap, selectedObjects, deleteObject, mapVersion } = useMapStore()
  const { currentTool } = useToolStore()
  const { isPicking, setSelectedToken } = useEventCreationStore()
  // Removed unused activeAnimations state

  // Use mapVersion to force re-render when positions change
  React.useEffect(() => {
    // Silent re-render on map version change
  }, [mapVersion])

  if (!currentMap) return null


  const renderObject = (obj: MapObject) => {
    const isSelected = selectedObjects.includes(obj.id)

    if (isToken(obj)) {
      // Don't render void token
      if (obj.isVoid) return null
      return renderToken(obj, isSelected)
    } else if (isShape(obj)) {
      return renderShape(obj, isSelected)
    } else if (isText(obj)) {
      return renderText(obj, isSelected)
    } else if (isSpell(obj)) {
      return renderSpell(obj)
    }
    return null
  }

  const handleObjectClick = (objId: string, e: Konva.KonvaEventObject<MouseEvent> | null) => {
    // If we're picking a token, handle that first
    if (isPicking === 'token') {
      const obj = currentMap?.objects.find(o => o.id === objId)
      if (obj && isToken(obj)) {
        setSelectedToken(objId)
        return
      }
    }

    if (currentTool === 'eraser') {
      // Delete object when using eraser tool
      deleteObject(objId)
    } else {
      // Normal click behavior
      if (e) {
        onObjectClick?.(objId, e)
      }
    }
  }

  const renderShape = (shape: Shape, isSelected: boolean) => {
    const commonProps = {
      key: shape.id,
      id: shape.id,
      x: shape.position.x,
      y: shape.position.y,
      rotation: shape.rotation,
      fill: shape.fillColor,
      stroke: isSelected ? '#C9AD6A' : shape.strokeColor,
      strokeWidth: isSelected ? shape.strokeWidth + 2 : shape.strokeWidth,
      opacity: shape.opacity,
      draggable: !shape.locked && currentTool !== 'eraser',
      onClick: (e: Konva.KonvaEventObject<MouseEvent>) => handleObjectClick(shape.id, e),
      onMouseEnter: (e: Konva.KonvaEventObject<MouseEvent>) => {
        if (currentTool === 'eraser') {
          const stage = e.target.getStage()
          if (stage) {
            const container = stage.container()
            container.style.cursor = 'pointer'
          }
        }
      },
      onMouseLeave: (e: Konva.KonvaEventObject<MouseEvent>) => {
        if (currentTool === 'eraser') {
          const stage = e.target.getStage()
          if (stage) {
            const container = stage.container()
            container.style.cursor = 'default'
          }
        }
      },
      onDragMove: (e: Konva.KonvaEventObject<DragEvent>) => {
        if (currentMap?.grid.snap) {
          const node = e.target
          const pos = { x: node.x(), y: node.y() }
          const snapped = snapToGrid(pos, currentMap.grid.size, true)
          node.x(snapped.x)
          node.y(snapped.y)
        }
      },
      onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => {
        const node = e.target
        const pos = { x: node.x(), y: node.y() }
        const finalPos = currentMap?.grid.snap
          ? snapToGrid(pos, currentMap.grid.size, true)
          : pos
        node.x(finalPos.x)
        node.y(finalPos.y)
        onObjectDragEnd?.(shape.id, finalPos)
      },
    }

    switch (shape.shapeType) {
      case 'rectangle':
        return (
          <Rect
            {...commonProps}
            width={shape.width || 100}
            height={shape.height || 100}
          />
        )
      case 'circle':
        return (
          <Circle
            {...commonProps}
            radius={shape.radius || 50}
          />
        )
      case 'line':
        return (
          <Line
            {...commonProps}
            points={shape.points || [0, 0, 100, 100]}
          />
        )
      default:
        return null
    }
  }

  const renderToken = (token: TokenType, isSelected: boolean) => {
    const gridSize = currentMap.grid.size

    // Force re-render by using position values directly as props
    return (
      <Group
        key={token.id}
        id={token.id}
        x={token.position.x}
        y={token.position.y}
        rotation={token.rotation}
        draggable={!token.locked && currentTool !== 'eraser'}
        onDragMove={(e) => {
          if (currentMap?.grid.snap) {
            const node = e.target
            const pos = { x: node.x(), y: node.y() }
            const snapped = snapToGrid(pos, currentMap.grid.size, true)
            node.x(snapped.x)
            node.y(snapped.y)
          }
        }}
        onDragEnd={(e) => {
          const node = e.target
          const pos = { x: node.x(), y: node.y() }
          const finalPos = currentMap?.grid.snap
            ? snapToGrid(pos, currentMap.grid.size, true)
            : pos
          node.x(finalPos.x)
          node.y(finalPos.y)
          onObjectDragEnd?.(token.id, finalPos)
        }}
      >
        <Token
          token={{...token, position: {x: 0, y: 0}, rotation: 0}} // Position is now on parent Group
          gridSize={gridSize}
          isSelected={isSelected}
          onSelect={(id) => handleObjectClick(id, null)}
          onDragMove={() => {}} // Handled by parent Group
          onDragEnd={() => {}} // Handled by parent Group
          isDraggable={false} // Dragging handled by parent Group
        />
      </Group>
    )
  }

  const renderText = (text: Text, isSelected: boolean) => {
    return (
      <KonvaText
        key={text.id}
        id={text.id}
        x={text.position.x}
        y={text.position.y}
        rotation={text.rotation}
        text={text.text}
        fontSize={text.fontSize}
        fontFamily={text.fontFamily}
        fill={text.color}
        {...(isSelected && { stroke: '#C9AD6A' })}
        strokeWidth={isSelected ? 1 : 0}
        draggable={!text.locked && currentTool !== 'eraser'}
        onClick={(e: Konva.KonvaEventObject<MouseEvent>) => handleObjectClick(text.id, e)}
        onMouseEnter={(e: Konva.KonvaEventObject<MouseEvent>) => {
          if (currentTool === 'eraser') {
            const stage = e.target.getStage()
            if (stage) {
              const container = stage.container()
              container.style.cursor = 'pointer'
            }
          }
        }}
        onMouseLeave={(e: Konva.KonvaEventObject<MouseEvent>) => {
          if (currentTool === 'eraser') {
            const stage = e.target.getStage()
            if (stage) {
              const container = stage.container()
              container.style.cursor = 'default'
            }
          }
        }}
        onDragMove={(e: Konva.KonvaEventObject<DragEvent>) => {
          if (currentMap?.grid.snap) {
            const node = e.target
            const pos = { x: node.x(), y: node.y() }
            const snapped = snapToGrid(pos, currentMap.grid.size, true)
            node.x(snapped.x)
            node.y(snapped.y)
          }
        }}
        onDragEnd={(e: Konva.KonvaEventObject<DragEvent>) => {
          const node = e.target
          const pos = { x: node.x(), y: node.y() }
          const finalPos = currentMap?.grid.snap
            ? snapToGrid(pos, currentMap.grid.size, true)
            : pos
          node.x(finalPos.x)
          node.y(finalPos.y)
          onObjectDragEnd?.(text.id, finalPos)
        }}
      />
    )
  }

  const renderSpell = (spell: MapObject & { type: 'spell'; spellData?: SpellEventData }) => {
    if (!spell.spellData) {
      return null
    }

    // Spells should always animate when they appear on the map
    const isAnimating = true
    const handleAnimationComplete = () => {
      // Remove the spell after animation completes
      // Check if it's a persistent spell
      if (!spell.spellData?.persistDuration || spell.spellData.persistDuration === 0) {
        setTimeout(() => {
          deleteObject(spell.id)
        }, 100) // Small delay to ensure animation finishes
      }
    }

    const spellProps = {
      spell: spell.spellData,
      isAnimating,
      onAnimationComplete: handleAnimationComplete
    }

    switch (spell.spellData.category) {
      case 'projectile':
      case 'projectile-burst':
        return <ProjectileSpell key={spell.id} {...spellProps} />
      case 'ray':
        return <RaySpell key={spell.id} {...spellProps} />
      case 'area':
        return <AreaSpell key={spell.id} {...spellProps} />
      case 'burst':
        return <BurstSpell key={spell.id} {...spellProps} />
      default:
        return null
    }
  }

  return (
    <Group>
      {currentMap.objects.map(renderObject)}
    </Group>
  )
}

export default React.memo(ObjectsLayer)