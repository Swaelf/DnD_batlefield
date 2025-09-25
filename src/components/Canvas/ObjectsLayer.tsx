import React, { useEffect, useRef, useCallback } from 'react'
import { Group, Rect, Circle, Line, Text as KonvaText } from 'react-konva'
import Konva from 'konva'
import { MapObject, Shape, Text } from '@/types/map'
import { Token as TokenType } from '@/types/token'
import useMapStore from '@store/mapStore'
import useToolStore from '@store/toolStore'
import useEventCreationStore from '@store/eventCreationStore'
import useAnimationStore from '@store/animationStore'
import useRoundStore from '@store/roundStore'
import { useLayerStore } from '@store/layerStore'
import { useContextMenu } from '@hooks/useContextMenu'
import { Token } from '../Token/Token'
import { snapToGrid } from '@/utils/grid'
import { PersistentArea } from '../Spells'
import { AttackRenderer } from '../Actions/ActionRenderer/AttackRenderer'
import { SpellEventData, AttackEventData } from '@/types/timeline'
import { SimpleSpellComponent } from '../Spells/SimpleSpellComponent'

// Track completed spell animations to prevent duplicate persistent areas
const completedSpellAnimations = new Set<string>()

// Type guards (same as before)
function isToken(obj: MapObject): obj is TokenType {
  return obj.type === 'token'
}

function isShape(obj: MapObject): obj is Shape {
  return obj.type === 'shape'
}

function isText(obj: MapObject): obj is Text {
  return obj.type === 'text'
}

function isSpell(obj: MapObject): obj is MapObject & { type: 'spell'; spellData?: SpellEventData } {
  return obj.type === 'spell'
}

function isAttack(obj: MapObject): obj is MapObject & { type: 'attack'; attackData?: AttackEventData } {
  return obj.type === 'attack'
}

function isPersistentArea(obj: MapObject): obj is MapObject & { type: 'persistent-area'; persistentAreaData?: any } {
  return obj.type === 'persistent-area'
}

type ObjectsLayerProps = {
  onObjectClick?: (id: string, e: Konva.KonvaEventObject<MouseEvent>) => void
  onObjectDragEnd?: (id: string, newPosition: { x: number; y: number }) => void
}

/**
 * ObjectsLayer that uses the new spell effect architecture
 */
export const ObjectsLayer: React.FC<ObjectsLayerProps> = React.memo(({
  onObjectClick,
  onObjectDragEnd
}) => {
  const currentMap = useMapStore(state => state.currentMap)
  const selectedObjects = useMapStore(state => state.selectedObjects)
  const deleteObject = useMapStore(state => state.deleteObject)
  const updateObjectPosition = useMapStore(state => state.updateObjectPosition)
  const batchUpdatePosition = useMapStore(state => state.batchUpdatePosition)
  const currentTool = useToolStore(state => state.currentTool)
  const gridSettings = currentMap?.grid
  const { isPicking, setSelectedToken } = useEventCreationStore()
  const { activePaths } = useAnimationStore()
  const currentRound = useRoundStore(state => state.currentRound)
  const { layers, getDefaultLayerForObjectType, migrateNumericLayer } = useLayerStore()
  const { handleContextMenu } = useContextMenu()

  const handleObjectDragEnd = (objId: string, e: Konva.KonvaEventObject<MouseEvent>) => {
    const node = e.target
    let newPosition = {
      x: node.x(),
      y: node.y()
    }

    // Snap to grid if enabled
    if (gridSettings?.snap) {
      newPosition = snapToGrid(newPosition, gridSettings.size)
      node.position(newPosition)
    }

    // Check if this object is part of a multi-selection
    const isPartOfMultiSelection = selectedObjects.length > 1 && selectedObjects.includes(objId)

    if (isPartOfMultiSelection) {
      // Calculate delta from original position
      const draggedObject = currentMap.objects.find(obj => obj.id === objId)
      if (draggedObject) {
        const deltaX = newPosition.x - draggedObject.position.x
        const deltaY = newPosition.y - draggedObject.position.y

        // Move all selected objects by the same delta
        batchUpdatePosition(selectedObjects, { x: deltaX, y: deltaY })
      }
    } else {
      // Single object movement
      updateObjectPosition(objId, newPosition)
    }

    // Notify parent
    onObjectDragEnd?.(objId, newPosition)
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
      // Normal click behavior - call onObjectClick regardless of event
      onObjectClick?.(objId, e || ({} as Konva.KonvaEventObject<MouseEvent>))
    }
  }

  const handleObjectRightClick = useCallback((objId: string, e: Konva.KonvaEventObject<MouseEvent>) => {
    e.evt.preventDefault()
    e.evt.stopPropagation()

    // Convert Konva coordinates to screen coordinates
    const stage = e.target.getStage()
    if (!stage) return

    // Use the mouse event coordinates directly since they're already in screen space
    const screenX = e.evt.clientX
    const screenY = e.evt.clientY

    handleContextMenu(
      {
        clientX: screenX,
        clientY: screenY,
        preventDefault: () => e.evt.preventDefault(),
        stopPropagation: () => e.evt.stopPropagation()
      } as React.MouseEvent,
      'object',
      { objectId: objId }
    )
  }, [handleContextMenu])

  const renderObject = (obj: MapObject) => {
    const isSelected = selectedObjects.includes(obj.id)
    const isDraggable = currentTool === 'select' && !obj.locked

    // Check if token has active animation path
    const hasActivePath = activePaths.some(path => path.tokenId === obj.id && path.isAnimating)

    if (isToken(obj)) {
      return (
        <Token
          key={obj.id}
          token={obj}
          gridSize={gridSettings?.size || 50}
          isSelected={isSelected}
          isDraggable={isDraggable && !hasActivePath}
          onSelect={(id) => handleObjectClick(id, null)}
          onDragStart={() => {}}
          onDragMove={(e) => {}}
          onDragEnd={(e) => handleObjectDragEnd(obj.id, e)}
          onContextMenu={(e) => handleObjectRightClick(obj.id, e)}
        />
      )
    }

    if (isShape(obj)) {
      return renderShape(obj, isSelected, isDraggable)
    }

    if (isText(obj)) {
      return renderText(obj, isSelected, isDraggable)
    }

    if (isSpell(obj)) {
      return renderModernSpell(obj)
    }

    if (isAttack(obj)) {
      return renderAttack(obj)
    }

    if (isPersistentArea(obj)) {
      return renderPersistentArea(obj)
    }

    return null
  }

  const renderShape = (shape: Shape, isSelected: boolean, isDraggable: boolean) => {
    // Determine if this is a static object based on its properties
    const isStaticObject = shape.metadata?.isStatic ||
      shape.fill?.includes('#228B22') || // Tree colors - Summer Oak
      shape.fill?.includes('#0F5132') || // Pine tree
      shape.fill?.includes('#CD853F') || // Autumn Oak
      shape.fill?.includes('#8FBC8F') || // Willow
      shape.fill?.includes('#FFB6C1') || // Cherry Blossom
      shape.fill?.includes('#8B7D6B') || // Dead tree
      shape.fill?.includes('#DC143C') || // Maple Red
      shape.fill?.includes('#90EE90') || // Birch
      shape.fill?.includes('#006400') || // Jungle
      shape.fill?.includes('#696969') || // Rock
      shape.fill?.includes('#3CB371') || // Bush
      shape.fill?.includes('#8B008B') || // Berry Bush
      shape.fill?.includes('#FF69B4') || // Flowering Bush
      shape.fill?.includes('#5c5c5c') || // Stone wall
      shape.fill?.includes('#8B4513') || // Wood/furniture
      shape.fill?.includes('#654321')    // Wood/furniture

    // Different visual styles for static objects vs regular shapes
    const shadowConfig = isStaticObject ? {
      shadowColor: '#000000',
      shadowBlur: isSelected ? 10 : 4,
      shadowOpacity: 0.6,
      shadowOffset: { x: 4, y: 6 },
    } : {
      shadowColor: 'black',
      shadowBlur: isSelected ? 12 : 8,
      shadowOpacity: 0.3,
      shadowOffset: { x: 2, y: 2 },
    }

    const commonProps = {
      id: shape.id,
      x: shape.position.x,
      y: shape.position.y,
      rotation: shape.rotation,
      fill: shape.fill,
      stroke: isSelected ? '#C9AD6A' : shape.stroke,
      strokeWidth: isSelected ? 3 : shape.strokeWidth,
      opacity: shape.opacity * (isStaticObject ? 0.95 : 1),
      draggable: isDraggable,
      onClick: (e: Konva.KonvaEventObject<MouseEvent>) => handleObjectClick(shape.id, e),
      onDragEnd: (e: Konva.KonvaEventObject<MouseEvent>) => handleObjectDragEnd(shape.id, e),
      onContextMenu: (e: Konva.KonvaEventObject<MouseEvent>) => handleObjectRightClick(shape.id, e),
      ...shadowConfig,
      // Add hover effects
      onMouseEnter: (e: Konva.KonvaEventObject<MouseEvent>) => {
        const target = e.target
        if (isStaticObject) {
          target.shadowBlur(8)
          target.shadowOpacity(0.8)
          target.scaleX(1.05)
          target.scaleY(1.05)
        } else {
          target.shadowBlur(15)
          target.shadowOpacity(0.5)
        }
        const stage = target.getStage()
        if (stage) {
          stage.container().style.cursor = isDraggable ? 'move' : 'pointer'
        }
      },
      onMouseLeave: (e: Konva.KonvaEventObject<MouseEvent>) => {
        const target = e.target
        if (isStaticObject) {
          target.shadowBlur(isSelected ? 10 : 4)
          target.shadowOpacity(0.6)
          target.scaleX(1)
          target.scaleY(1)
        } else {
          target.shadowBlur(isSelected ? 12 : 8)
          target.shadowOpacity(0.3)
        }
        const stage = target.getStage()
        if (stage) {
          stage.container().style.cursor = 'default'
        }
      }
    }

    switch (shape.shapeType) {
      case 'rectangle':
        // Special handling for walls and furniture
        const isWall = shape.fill?.includes('#5c5c5c') || shape.fill?.includes('#8B4513')
        const isFurniture = shape.fill?.includes('#654321') || shape.fill?.includes('#A0522D')

        return (
          <Rect
            key={shape.id}
            {...commonProps}
            width={shape.width}
            height={shape.height}
            cornerRadius={isWall ? 0 : (isFurniture ? 2 : 4)}
            dash={isWall ? [10, 5] : undefined}
            dashEnabled={isWall}
          />
        )
      case 'circle':
        // Special handling for trees and natural objects - expanded color detection
        const isTree = shape.metadata?.effectType === 'tree' ||
          shape.fill?.includes('#228B22') || // Summer Oak
          shape.fill?.includes('#0F5132') || // Pine
          shape.fill?.includes('#CD853F') || // Autumn Oak
          shape.fill?.includes('#8FBC8F') || // Willow
          shape.fill?.includes('#FFB6C1') || // Cherry
          shape.fill?.includes('#8B7D6B') || // Dead
          shape.fill?.includes('#DC143C') || // Maple
          shape.fill?.includes('#90EE90') || // Birch
          shape.fill?.includes('#006400') || // Jungle
          shape.fill?.includes('#3CB371') || // Bush
          shape.fill?.includes('#8B008B') || // Berry Bush
          shape.fill?.includes('#FF69B4')    // Flowering Bush
        const isWell = shape.fill?.includes('#4682B4')

        // Ensure we have a valid radius
        const validRadius = shape.radius || (shape.width ? shape.width / 2 : 30) // Default to 30 if no radius or width

        if (isTree) {
          // Trees get a rougher, more organic edge with multiple layers for depth
          const isFlowering = shape.fill?.includes('#FFB6C1') || shape.fill?.includes('#FF69B4')
          const isAutumn = shape.fill?.includes('#CD853F') || shape.fill?.includes('#DC143C')
          const isDead = shape.fill?.includes('#8B7D6B')

          return (
            <Group key={shape.id}>
              {/* Outer shadow/canopy effect */}
              <Circle
                x={commonProps.x}
                y={commonProps.y}
                radius={validRadius * 1.2}
                fill={commonProps.fill}
                opacity={0.15}
                listening={false}
              />
              {/* Main tree circle */}
              <Circle
                {...commonProps}
                radius={validRadius}
                strokeWidth={commonProps.strokeWidth * 1.5}
                dash={isDead ? [5, 5] : [3, 2]}
                dashEnabled={true}
              />
              {/* Inner texture circles for depth */}
              <Circle
                x={commonProps.x}
                y={commonProps.y}
                radius={validRadius * 0.7}
                fill={commonProps.fill}
                opacity={isDead ? 0.2 : 0.3}
                listening={false}
              />
              {/* Special effects for flowering/autumn trees */}
              {(isFlowering || isAutumn) && (
                <Circle
                  x={commonProps.x + validRadius * 0.2}
                  y={commonProps.y - validRadius * 0.2}
                  radius={validRadius * 0.4}
                  fill={isFlowering ? '#FFC0CB' : '#FF8C00'}
                  opacity={0.4}
                  listening={false}
                />
              )}
            </Group>
          )
        }

        return (
          <Circle
            key={shape.id}
            {...commonProps}
            radius={validRadius}
            strokeWidth={isWell ? commonProps.strokeWidth * 2 : commonProps.strokeWidth}
          />
        )
      case 'line':
        return (
          <Line
            key={shape.id}
            {...commonProps}
            points={shape.points}
            lineCap="round"
            lineJoin="round"
          />
        )
      case 'polygon':
        // Special handling for rocks and crystals
        const isRock = shape.fill?.includes('#696969')
        const isCrystal = shape.fill?.includes('#9370DB')

        return (
          <Group key={shape.id}>
            <Line
              {...commonProps}
              points={shape.points}
              closed={true}
              lineCap={isRock ? "square" : "round"}
              lineJoin={isRock ? "miter" : "round"}
              strokeWidth={commonProps.strokeWidth * (isRock ? 1.5 : 1)}
            />
            {isCrystal && (
              /* Add inner glow for crystals */
              <Line
                x={commonProps.x}
                y={commonProps.y}
                points={shape.points}
                closed={true}
                fill={commonProps.fill}
                opacity={0.5}
                scaleX={0.8}
                scaleY={0.8}
                listening={false}
              />
            )}
          </Group>
        )
      default:
        return null
    }
  }

  const renderText = (text: Text, isSelected: boolean, isDraggable: boolean) => {
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
        fill={text.fill}
        opacity={text.opacity}
        align={text.align}
        stroke={isSelected ? '#C9AD6A' : undefined}
        strokeWidth={isSelected ? 2 : 0}
        draggable={isDraggable}
        // Add visual enhancements
        shadowColor='black'
        shadowBlur={isSelected ? 8 : 4}
        shadowOpacity={0.4}
        shadowOffset={{ x: 1, y: 1 }}
        // Add hover effects
        onMouseEnter={(e: Konva.KonvaEventObject<MouseEvent>) => {
          const target = e.target
          target.shadowBlur(10)
          target.shadowOpacity(0.6)
          const stage = target.getStage()
          if (stage) {
            stage.container().style.cursor = isDraggable ? 'move' : 'pointer'
          }
        }}
        onMouseLeave={(e: Konva.KonvaEventObject<MouseEvent>) => {
          const target = e.target
          target.shadowBlur(isSelected ? 8 : 4)
          target.shadowOpacity(0.4)
          const stage = target.getStage()
          if (stage) {
            stage.container().style.cursor = 'default'
          }
        }}
        onClick={(e: Konva.KonvaEventObject<MouseEvent>) => handleObjectClick(text.id, e)}
        onDragEnd={(e: Konva.KonvaEventObject<MouseEvent>) => handleObjectDragEnd(text.id, e)}
        onContextMenu={(e: Konva.KonvaEventObject<MouseEvent>) => handleObjectRightClick(text.id, e)}
      />
    )
  }

  /**
   * Render spell using the new modern architecture
   */
  const renderModernSpell = (spell: MapObject & { type: 'spell'; spellData?: SpellEventData }) => {
    if (!spell.spellData) {
      console.warn('[ObjectsLayerModern] Spell has no spellData:', spell)
      return null
    }

    const handleAnimationComplete = () => {
      // Guard against multiple completions
      if (completedSpellAnimations.has(spell.id)) {
        return
      }
      completedSpellAnimations.add(spell.id)

      // For spells with persist duration, create a persistent area
      const persistDuration = spell.spellData?.persistDuration || 0

      // Area spells and projectile-burst spells can create persistent areas
      if (persistDuration > 0 && (spell.spellData?.category === 'area' || spell.spellData?.category === 'projectile-burst')) {
        // Create persistent area object
        const persistentAreaObject = {
          id: `persistent-area-${Date.now()}-${Math.random()}`,
          type: 'persistent-area' as const,
          position: spell.spellData.toPosition,
          rotation: 0,
          layer: 9,
          persistentAreaData: {
            position: spell.spellData.toPosition,
            radius: spell.spellData.size || 60,
            color: spell.spellData.persistColor || spell.spellData.color || '#3D3D2E',
            opacity: spell.spellData.persistOpacity || 0.8,
            spellName: spell.spellData.spellName || 'Area Effect',
            roundCreated: currentRound // Use actual current round
          },
          roundCreated: currentRound, // Use actual current round
          spellDuration: persistDuration,
          isSpellEffect: true // Mark as spell effect for cleanup
        }

        // Add persistent area to map using addSpellEffect to ensure it's tracked properly
        const { addSpellEffect } = useMapStore.getState()
        addSpellEffect(persistentAreaObject as any)

        // Remove the spell animation object
        setTimeout(() => {
          deleteObject(spell.id)
        }, 100)
      } else {
        // Remove immediately if no persist duration
        setTimeout(() => {
          deleteObject(spell.id)
        }, 100)
      }
    }

    // Use SimpleSpellComponent for now
    return (
      <SimpleSpellComponent
        key={spell.id}
        spell={spell.spellData}
        isAnimating={true}
        onAnimationComplete={handleAnimationComplete}
      />
    )
  }

  const renderAttack = (attack: MapObject & { type: 'attack'; attackData?: AttackEventData }) => {
    if (!attack.attackData) {
      return null
    }

    const handleAnimationComplete = () => {
      setTimeout(() => {
        deleteObject(attack.id)
      }, 100)
    }

    return (
      <AttackRenderer
        key={attack.id}
        attack={attack.attackData}
        isAnimating={true}
        onAnimationComplete={handleAnimationComplete}
      />
    )
  }

  const renderPersistentArea = (area: MapObject & { type: 'persistent-area'; persistentAreaData?: any }) => {
    if (!area.persistentAreaData) {
      return null
    }

    return (
      <PersistentArea
        key={area.id}
        position={area.persistentAreaData.position}
        radius={area.persistentAreaData.radius}
        color={area.persistentAreaData.color}
        opacity={area.persistentAreaData.opacity}
        spellName={area.persistentAreaData.spellName}
        roundCreated={area.persistentAreaData.roundCreated}
      />
    )
  }

  // Create layer-aware object rendering with proper sorting and visibility
  const getLayerForObject = (obj: MapObject) => {
    // If object has a layer ID, use it; otherwise migrate numeric layer or use default
    if (obj.layerId) {
      return layers.find(l => l.id === obj.layerId)
    }

    // Migrate legacy numeric layer to layer ID
    if (obj.layer !== undefined) {
      const layerId = migrateNumericLayer(obj.layer)
      return layers.find(l => l.id === layerId)
    }

    // Use default layer for object type
    const defaultLayerId = getDefaultLayerForObjectType(obj.type)
    return layers.find(l => l.id === defaultLayerId)
  }

  // Filter and sort objects by layer visibility and z-index
  const visibleSortedObjects = currentMap?.objects
    ? currentMap.objects
        .map(obj => ({ obj, layer: getLayerForObject(obj) }))
        .filter(({ layer }) => layer?.visible !== false) // Show if layer is visible or undefined
        .sort((a, b) => {
          const zIndexA = a.layer?.zIndex || a.obj.layer || 0
          const zIndexB = b.layer?.zIndex || b.obj.layer || 0
          return zIndexA - zIndexB
        })
        .map(({ obj }) => obj)
    : []

  if (!currentMap) {
    return null
  }

  return (
    <Group>
      {visibleSortedObjects.map(renderObject)}
    </Group>
  )
})

// Custom comparison function to prevent unnecessary re-renders
const arePropsEqual = (
  prevProps: ObjectsLayerProps,
  nextProps: ObjectsLayerProps
): boolean => {
  return (
    prevProps.onObjectClick === nextProps.onObjectClick &&
    prevProps.onObjectDragEnd === nextProps.onObjectDragEnd
  )
}

export default React.memo(ObjectsLayer, arePropsEqual)