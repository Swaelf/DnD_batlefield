import React, { useEffect, useRef } from 'react'
import { Group, Rect, Circle, Line, Text as KonvaText } from 'react-konva'
import Konva from 'konva'
import { MapObject, Shape, Text } from '@/types/map'
import { Token as TokenType } from '@/types/token'
import useMapStore from '@store/mapStore'
import useToolStore from '@store/toolStore'
import useEventCreationStore from '@store/eventCreationStore'
import useAnimationStore from '@store/animationStore'
import useRoundStore from '@store/roundStore'
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
  const currentTool = useToolStore(state => state.currentTool)
  const gridSettings = currentMap?.grid
  const { isPicking, setSelectedToken } = useEventCreationStore()
  const { activePaths } = useAnimationStore()
  const currentRound = useRoundStore(state => state.currentRound)

  if (!currentMap) {
    return null
  }

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

    // Update position in store
    updateObjectPosition(objId, newPosition)

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
    const commonProps = {
      key: shape.id,
      id: shape.id,
      x: shape.position.x,
      y: shape.position.y,
      rotation: shape.rotation,
      fill: shape.fill,
      stroke: isSelected ? '#C9AD6A' : shape.stroke,
      strokeWidth: isSelected ? 3 : shape.strokeWidth,
      opacity: shape.opacity,
      draggable: isDraggable,
      onClick: (e: Konva.KonvaEventObject<MouseEvent>) => handleObjectClick(shape.id, e),
      onDragEnd: (e: Konva.KonvaEventObject<MouseEvent>) => handleObjectDragEnd(shape.id, e)
    }

    switch (shape.shapeType) {
      case 'rectangle':
        return <Rect {...commonProps} width={shape.width} height={shape.height} />
      case 'circle':
        return <Circle {...commonProps} radius={shape.radius} />
      case 'line':
        return <Line {...commonProps} points={shape.points} />
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
        strokeWidth={isSelected ? 1 : 0}
        draggable={isDraggable}
        onClick={(e: Konva.KonvaEventObject<MouseEvent>) => handleObjectClick(text.id, e)}
        onDragEnd={(e: Konva.KonvaEventObject<MouseEvent>) => handleObjectDragEnd(text.id, e)}
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

  // Sort objects by layer to ensure proper rendering order
  const sortedObjects = [...currentMap.objects].sort((a, b) => {
    const layerA = a.layer || 0
    const layerB = b.layer || 0
    return layerA - layerB
  })


  return (
    <Group>
      {sortedObjects.map(renderObject)}
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