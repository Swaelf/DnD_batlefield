import { useCallback, useMemo, memo, type FC, type MouseEvent as ReactMouseEvent } from 'react'
import { Group, Rect, Circle, Line, Text as KonvaText } from 'react-konva'
import type Konva from 'konva'
import type { MapObject, Shape, Text } from '@/types/map'
import type { SpellEventData, AttackEventData } from '@/types/timeline'
import useMapStore from '@/store/mapStore'
import useToolStore from '@/store/toolStore'
import useEventCreationStore from '@/store/eventCreationStore'
import useAnimationStore from '@/store/animationStore'
import useTimelineStore from '@/store/timelineStore'
import { useLayerStore } from '@/store/layerStore'
import { useContextMenu } from '@/hooks/useContextMenu'
import { Token } from '../Token/Token'
import { snapToGrid } from '@/utils/grid'
import { PersistentArea } from '../Spells'
import { AttackRenderer } from '../Actions/ActionRenderer/AttackRenderer'
import { SimpleSpellComponent } from '../Spells/SimpleSpellComponent'
import { StaticObjectRenderer } from '../StaticObject/StaticObjectRenderer'
import { isToken, isShape, isText, isSpell, isAttack, isPersistentArea } from './objectUtils'

// Track completed spell animations to prevent duplicate persistent areas
const completedSpellAnimations = new Set<string>()

// ✅ CACHE: WeakMap for static object detection (prevents object mutation errors)
const staticObjectCache = new WeakMap<Shape, boolean>()

// ✅ STABLE EMPTY ARRAYS: Shared constants to prevent reference changes
const EMPTY_ARRAY: any[] = []

// ✅ STABLE SELECTORS: Define selectors outside component to avoid re-creating on every render
// CRITICAL: Never use || [] - it creates new array every time! Use shared EMPTY_ARRAY constant
const selectObjects = (state: { currentMap: { objects: any[] } | null }) => state.currentMap?.objects ?? EMPTY_ARRAY
const selectMapVersion = (state: { mapVersion: number }) => state.mapVersion
const selectGridSettings = (state: { currentMap: { grid: any } | null }) => state.currentMap?.grid
const selectSelectedObjects = (state: { selectedObjects: string[] }) => state.selectedObjects
const selectDeleteObject = (state: { deleteObject: (id: string) => void }) => state.deleteObject
const selectUpdateObjectPosition = (state: { updateObjectPosition: (id: string, position: { x: number; y: number }) => void }) => state.updateObjectPosition
const selectBatchUpdatePosition = (state: { batchUpdatePosition: (objectIds: string[], deltaPosition: { x: number; y: number }) => void }) => state.batchUpdatePosition
const selectCurrentTool = (state: { currentTool: string }) => state.currentTool
const selectCurrentEvent = (state: { currentEvent: number }) => state.currentEvent
const selectIsPicking = (state: { isPicking: string | null }) => state.isPicking
const selectSetSelectedToken = (state: { setSelectedToken: (id: string) => void }) => state.setSelectedToken
const selectActivePaths = (state: { activePaths: any[] }) => state.activePaths ?? EMPTY_ARRAY
const selectLayers = (state: { layers: any[] }) => state.layers ?? EMPTY_ARRAY
const selectGetDefaultLayerForObjectType = (state: { getDefaultLayerForObjectType: (type: string) => string }) => state.getDefaultLayerForObjectType
const selectMigrateNumericLayer = (state: { migrateNumericLayer: (layer: number) => string }) => state.migrateNumericLayer

type ObjectsLayerProps = {
  onObjectClick?: (id: string, e: Konva.KonvaEventObject<MouseEvent>) => void
  onObjectDragEnd?: (id: string, newPosition: { x: number; y: number }) => void
  onTokenSelect?: (tokenId: string, position: { x: number; y: number }) => void
  onTokenDeselect?: () => void
}

/**
 * ObjectsLayer that uses the new spell effect architecture
 */
export const ObjectsLayer: FC<ObjectsLayerProps> = memo(({
  onObjectClick,
  onObjectDragEnd,
  onTokenSelect,
  onTokenDeselect
}) => {
  // ✅ OPTIMIZED: Use granular selectors with stable references
  const objects = useMapStore(selectObjects)
  const mapVersion = useMapStore(selectMapVersion)
  const gridSettings = useMapStore(selectGridSettings)
  const selectedObjects = useMapStore(selectSelectedObjects)
  const deleteObject = useMapStore(selectDeleteObject)
  const updateObjectPosition = useMapStore(selectUpdateObjectPosition)
  const batchUpdatePosition = useMapStore(selectBatchUpdatePosition)
  const currentTool = useToolStore(selectCurrentTool)
  const isPicking = useEventCreationStore(selectIsPicking)
  const setSelectedToken = useEventCreationStore(selectSetSelectedToken)
  const activePaths = useAnimationStore(selectActivePaths)
  const currentEvent = useTimelineStore(selectCurrentEvent)
  const layers = useLayerStore(selectLayers)
  const getDefaultLayerForObjectType = useLayerStore(selectGetDefaultLayerForObjectType)
  const migrateNumericLayer = useLayerStore(selectMigrateNumericLayer)
  const { handleContextMenu } = useContextMenu()

  // NOTE: Viewport culling disabled due to infinite loop issues with forceUpdate
  // The performance optimization caused state update loops that exceeded React's limit
  // Future implementation should use a different approach (e.g., Konva's built-in culling)

  const handleObjectDragEnd = (objId: string, e: Konva.KonvaEventObject<MouseEvent>) => {
    const node = e.target
    let newPosition = {
      x: node.x(),
      y: node.y()
    }

    // Snap to grid if enabled
    if (gridSettings?.snap) {
      newPosition = snapToGrid(newPosition, gridSettings.size, true)
      node.position(newPosition)
    }

    // Check if this object is part of a multi-selection
    const isPartOfMultiSelection = selectedObjects.length > 1 && selectedObjects.includes(objId)

    if (isPartOfMultiSelection) {
      // Calculate delta from original position
      const draggedObject = objects.find(obj => obj.id === objId)
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
    // If we're picking a token (either main token or target token), handle that first
    if (isPicking === 'token' || isPicking === 'targetToken') {
      const obj = objects.find(o => o.id === objId)
      if (obj && isToken(obj)) {
        setSelectedToken(objId)
        return
      }
    }

    // Check if this is a token
    const obj = objects.find(o => o.id === objId)

    // Priority 1: If in token picking mode for events, select the token for the event
    if (obj && isToken(obj) && (isPicking === 'token' || isPicking === 'targetToken')) {
      setSelectedToken(objId)
      return
    }

    // Priority 2: If using select tool and not in picking mode, show HP tooltip
    if (obj && isToken(obj) && currentTool === 'select' && !isPicking && onTokenSelect) {
      // Get stage position for tooltip placement
      if (e && e.target) {
        const stage = e.target.getStage()
        if (stage) {
          const tokenNode = e.target
          const tokenPosition = tokenNode.getAbsolutePosition()
          const scale = stage.scaleX()

          // Position tooltip to the right of the token
          const tooltipPosition = {
            x: tokenPosition.x + (50 * scale) + 20,  // 50 is approx token radius
            y: tokenPosition.y - 100
          }

          onTokenSelect(objId, tooltipPosition)
        }
      }
    } else if (!isToken(obj!) && onTokenDeselect) {
      // Close tooltip only if selecting a non-token object
      onTokenDeselect()
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
      } as ReactMouseEvent,
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
          key={`${obj.id}-${obj.position.x}-${obj.position.y}`}
          token={obj}
          gridSize={gridSettings?.size || 50}
          isSelected={isSelected}
          isDraggable={isDraggable && !hasActivePath}
          onSelect={(id, e) => handleObjectClick(id, e)}
          onDragStart={() => {}}
          onDragMove={() => {}}
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

  // ✅ OPTIMIZED: Memoize static object detection to avoid 30+ color checks per render
  const checkIsStaticObject = useCallback((shape: Shape): boolean => {
    // Check WeakMap cache first
    const cached = staticObjectCache.get(shape)
    if (cached !== undefined) {
      return cached
    }

    const isStaticEffect = shape.metadata?.isStaticEffect === true
    const result = !isStaticEffect && (
      shape.metadata?.isStatic ||
      shape.fill?.includes('#6B7280') || // Wall/Stairs
      shape.fill?.includes('#8B4513') || // Door/furniture
      shape.fill?.includes('#9CA3AF') || // Pillar
      shape.fill?.includes('#5A5A5A') || // Spiral stairs
      shape.fill?.includes('#10B981') || // Tree
      shape.fill?.includes('#059669') || // Bush
      shape.fill?.includes('#78716C') || // Rock
      shape.fill?.includes('#3B82F6') || // Water
      shape.fill?.includes('#92400E') || // Table/chest/barrel
      shape.fill?.includes('#78350F') || // Chair
      shape.fill?.includes('#EF4444') || // Trap
      shape.fill?.includes('#EA580C') || // Brazier
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
      shape.fill?.includes('#654321')    // Wood/furniture
    )

    // ✅ Cache result in WeakMap (no object mutation!)
    staticObjectCache.set(shape, result)

    return result
  }, [])

  const renderShape = (shape: Shape, isSelected: boolean, isDraggable: boolean) => {
    // ✅ OPTIMIZED: Use cached static object detection
    const isStaticObject = checkIsStaticObject(shape)

    // Use enhanced StaticObjectRenderer for static objects (but NOT static effects)
    if (isStaticObject) {
      return (
        <StaticObjectRenderer
          key={shape.id}
          shape={shape}
          isSelected={isSelected}
          isDraggable={isDraggable}
          onClick={(e: Konva.KonvaEventObject<MouseEvent>) => handleObjectClick(shape.id, e)}
          onDragEnd={(e: Konva.KonvaEventObject<MouseEvent>) => handleObjectDragEnd(shape.id, e)}
          onContextMenu={(e: Konva.KonvaEventObject<MouseEvent>) => handleObjectRightClick(shape.id, e)}
          onMouseEnter={(e: Konva.KonvaEventObject<MouseEvent>) => {
            const target = e.target
            // ✅ OPTIMIZED: Use Konva's to() for smoother animations
            target.to({ scaleX: 1.05, scaleY: 1.05, duration: 0.1 })
            const stage = target.getStage()
            if (stage) {
              stage.container().style.cursor = isDraggable ? 'move' : 'pointer'
            }
          }}
          onMouseLeave={(e: Konva.KonvaEventObject<MouseEvent>) => {
            const target = e.target
            // ✅ OPTIMIZED: Use Konva's to() for smoother animations
            target.to({ scaleX: 1, scaleY: 1, duration: 0.1 })
            const stage = target.getStage()
            if (stage) {
              stage.container().style.cursor = 'default'
            }
          }}
        />
      )
    }

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
      // ✅ OPTIMIZED: Add hover effects with smooth Konva animations
      onMouseEnter: (e: Konva.KonvaEventObject<MouseEvent>) => {
        const target = e.target
        if (isStaticObject) {
          target.to({ scaleX: 1.05, scaleY: 1.05, duration: 0.1 })
        }
        const stage = target.getStage()
        if (stage) {
          stage.container().style.cursor = isDraggable ? 'move' : 'pointer'
        }
      },
      onMouseLeave: (e: Konva.KonvaEventObject<MouseEvent>) => {
        const target = e.target
        if (isStaticObject) {
          target.to({ scaleX: 1, scaleY: 1, duration: 0.1 })
        }
        const stage = target.getStage()
        if (stage) {
          stage.container().style.cursor = 'default'
        }
      }
    }

    switch (shape.shapeType) {
      case 'rectangle': {
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
      }
      case 'circle': {
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
      }
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
      case 'polygon': {
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
      }
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
          //target.shadowBlur(10)
          //target.shadowOpacity(0.6)
          const stage = target.getStage()
          if (stage) {
            stage.container().style.cursor = isDraggable ? 'move' : 'pointer'
          }
        }}
        onMouseLeave={(e: Konva.KonvaEventObject<MouseEvent>) => {
          const target = e.target
          //target.shadowBlur(isSelected ? 8 : 4)
          //target.shadowOpacity(0.4)
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
      console.log('[ObjectsLayer] Animation complete for spell:', spell.spellData?.spellName, 'persistDuration:', persistDuration, 'category:', spell.spellData?.category)

      // Area spells, projectile-burst spells, and cone spells can create persistent areas
      if (persistDuration > 0 && (spell.spellData?.category === 'area' || spell.spellData?.category === 'projectile-burst' || spell.spellData?.category === 'cone')) {
        // Determine position for persistent area - use current target position if tracking enabled
        let persistentPosition = spell.spellData.toPosition
        if (spell.spellData.trackTarget && spell.spellData.targetTokenId) {
          // Get current token position for tracking spells
          const targetToken = objects.find(obj =>
            obj.id === spell.spellData?.targetTokenId && obj.type === 'token'
          )
          if (targetToken) {
            persistentPosition = targetToken.position
          }
        }

        // Create persistent area object
        const persistentAreaObject = {
          id: `persistent-area-${Date.now()}-${Math.random()}`,
          type: 'persistent-area' as const,
          position: persistentPosition,
          rotation: 0,
          layer: 9,
          persistentAreaData: {
            position: persistentPosition,
            radius: spell.spellData.burstRadius || spell.spellData.size || 60, // Use burst radius for area effects
            color: spell.spellData.persistColor || spell.spellData.color || '#3D3D2E',
            opacity: spell.spellData.persistOpacity || 0.8,
            spellName: spell.spellData.spellName || 'Area Effect',
            roundCreated: currentEvent, // Use actual current event number
            // Store token tracking information for persistent areas
            trackTarget: spell.spellData.trackTarget || false,
            targetTokenId: spell.spellData.targetTokenId || null,
            // Cone-specific properties
            shape: spell.spellData.category === 'cone' ? 'cone' : 'circle',
            fromPosition: spell.spellData.fromPosition,
            toPosition: spell.spellData.toPosition,
            coneAngle: spell.spellData.coneAngle || 60
          },
          roundCreated: currentEvent, // Use actual current event number
          spellDuration: persistDuration,
          isSpellEffect: true as const // Mark as spell effect for cleanup
        }

        // Add persistent area to map using addSpellEffect to ensure it's tracked properly
        const addSpellEffect = useMapStore.getState().addSpellEffect
        console.log('[ObjectsLayer] Creating persistent area:', persistentAreaObject)
        addSpellEffect(persistentAreaObject)

        // Remove the spell animation object
        setTimeout(() => {
          console.log('[ObjectsLayer] Removing spell animation object:', spell.id)
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
      console.warn('[ObjectsLayer] Persistent area has no data:', area.id)
      return null
    }

    console.log('[ObjectsLayer] Rendering persistent area:', area.id, 'shape:', area.persistentAreaData.shape)

    // Determine current position - track token if enabled
    let currentPosition = area.persistentAreaData.position
    if (area.persistentAreaData.trackTarget && area.persistentAreaData.targetTokenId) {
      const targetToken = objects.find(obj =>
        obj.id === area.persistentAreaData.targetTokenId && obj.type === 'token'
      )
      if (targetToken) {
        currentPosition = targetToken.position
      }
    }

    // Render cone-shaped persistent area
    if (area.persistentAreaData.shape === 'cone') {
      const PIXELS_PER_FOOT = 8
      const coneLength = (area.persistentAreaData.radius || 30) * PIXELS_PER_FOOT
      const coneAngle = (area.persistentAreaData.coneAngle || 60) * (Math.PI / 180)

      console.log('[ObjectsLayer] Cone calculation:', {
        fromPosition: area.persistentAreaData.fromPosition,
        toPosition: area.persistentAreaData.toPosition,
        radius: area.persistentAreaData.radius,
        coneLength,
        coneAngle
      })

      const dx = area.persistentAreaData.toPosition.x - area.persistentAreaData.fromPosition.x
      const dy = area.persistentAreaData.toPosition.y - area.persistentAreaData.fromPosition.y
      const direction = Math.atan2(dy, dx)

      const leftAngle = direction - coneAngle / 2
      const rightAngle = direction + coneAngle / 2

      const conePoints = [
        area.persistentAreaData.fromPosition.x,
        area.persistentAreaData.fromPosition.y,
        area.persistentAreaData.fromPosition.x + Math.cos(leftAngle) * coneLength,
        area.persistentAreaData.fromPosition.y + Math.sin(leftAngle) * coneLength,
        area.persistentAreaData.fromPosition.x + Math.cos(direction) * coneLength,
        area.persistentAreaData.fromPosition.y + Math.sin(direction) * coneLength,
        area.persistentAreaData.fromPosition.x + Math.cos(rightAngle) * coneLength,
        area.persistentAreaData.fromPosition.y + Math.sin(rightAngle) * coneLength
      ]

      console.log('[ObjectsLayer] Cone points:', conePoints)

      return (
        <Line
          key={area.id}
          points={conePoints}
          closed={true}
          fill={area.persistentAreaData.color}
          opacity={area.persistentAreaData.opacity}
          shadowColor={area.persistentAreaData.color}
          shadowBlur={20}
          shadowOpacity={0.4}
        />
      )
    }

    // Default circular persistent area
    return (
      <PersistentArea
        key={area.id}
        position={currentPosition}
        radius={area.persistentAreaData.radius}
        color={area.persistentAreaData.color}
        opacity={area.persistentAreaData.opacity}
        spellName={area.persistentAreaData.spellName}
        roundCreated={area.persistentAreaData.roundCreated}
      />
    )
  }

  // ✅ OPTIMIZED: Memoize expensive layer calculations and sorting
  // NOTE: Viewport culling removed - was causing infinite render loops
  // NOTE: getLayerForObject defined inline to avoid useCallback dependency issues
  const visibleSortedObjects = useMemo(() => {
    if (!objects || objects.length === 0) return []

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

    return objects
      .map(obj => ({ obj, layer: getLayerForObject(obj) }))
      .filter(({ layer }) => layer?.visible !== false) // Show if layer is visible or undefined
      .sort((a, b) => {
        const zIndexA = a.layer?.zIndex || a.obj.layer || 0
        const zIndexB = b.layer?.zIndex || b.obj.layer || 0
        return zIndexA - zIndexB
      })
      .map(({ obj }) => obj)
  }, [objects, mapVersion, layers, migrateNumericLayer, getDefaultLayerForObjectType]) // Re-compute when objects change OR mapVersion increments

  if (!objects || objects.length === 0) {
    return null
  }

  return (
    <Group>
      {visibleSortedObjects.map(renderObject)}
    </Group>
  )
})

// ✅ OPTIMIZED: Custom comparison function to prevent unnecessary re-renders
const arePropsEqual = (
  prevProps: ObjectsLayerProps,
  nextProps: ObjectsLayerProps
): boolean => {
  return (
    prevProps.onObjectClick === nextProps.onObjectClick &&
    prevProps.onObjectDragEnd === nextProps.onObjectDragEnd &&
    prevProps.onTokenSelect === nextProps.onTokenSelect &&
    prevProps.onTokenDeselect === nextProps.onTokenDeselect
  )
}

export default memo(ObjectsLayer, arePropsEqual)