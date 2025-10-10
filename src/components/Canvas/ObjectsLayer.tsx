import { useCallback, useMemo, memo, useEffect, useState, useRef, type FC, type MouseEvent as ReactMouseEvent } from 'react'
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
import { SpellRenderer } from '../Spells/SpellRenderer'
import { StaticObjectRenderer } from '../StaticObject/StaticObjectRenderer'
import { TreeRenderer } from './TreeRenderer'
import { isToken, isShape, isText, isSpell, isAttack, isPersistentArea } from './objectUtils'
import { ProgressiveLoader } from '@/utils/progressiveLoader'

// Track completed spell animations to prevent duplicate persistent areas
const completedSpellAnimations = new Set<string>()

// 🚀 PERFORMANCE: Track attack animation cleanup timers
const attackCleanupTimers = new Map<string, NodeJS.Timeout>()

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
  const layers = useLayerStore(selectLayers)
  const getDefaultLayerForObjectType = useLayerStore(selectGetDefaultLayerForObjectType)
  const migrateNumericLayer = useLayerStore(selectMigrateNumericLayer)
  const { handleContextMenu } = useContextMenu()

  // 🚀 PROGRESSIVE LOADING: State for progressively loaded objects
  const [progressiveObjects, setProgressiveObjects] = useState<MapObject[]>([])
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState({ loaded: 0, total: 0 })
  const progressiveLoader = useRef(new ProgressiveLoader())
  const prevObjectCount = useRef(0)

  // NOTE: Viewport culling disabled due to infinite loop issues with forceUpdate
  // The performance optimization caused state update loops that exceeded React's limit
  // Future implementation should use a different approach (e.g., Konva's built-in culling)

  // 🚀 PROGRESSIVE LOADING: Load objects progressively to prevent frame drops
  useEffect(() => {
    if (!objects || objects.length === 0) {
      setProgressiveObjects([])
      setLoadingProgress({ loaded: 0, total: 0 })
      return
    }

    // Detect if this is a large initial load (>20 objects appearing at once)
    const isLargeLoad = prevObjectCount.current === 0 && objects.length > 20
    const isBigChange = Math.abs(objects.length - prevObjectCount.current) > 15

    if (isLargeLoad || (isInitialLoad && objects.length > 20) || isBigChange) {
      // Use progressive loading for large loads

      progressiveLoader.current.loadObjects(
        objects,
        (loaded) => {
          setProgressiveObjects(loaded)
        },
        {
          chunkSize: 8, // Load 8 objects per idle frame
          onProgress: (loaded, total) => {
            setLoadingProgress({ loaded, total })
            if (loaded === total) {
            }
          },
          onComplete: () => {
            setIsInitialLoad(false)
          }
        }
      )
    } else {
      // For small changes, update immediately
      setProgressiveObjects(objects)
      setLoadingProgress({ loaded: objects.length, total: objects.length })
    }

    prevObjectCount.current = objects.length

    // Cleanup on unmount
    return () => {
      progressiveLoader.current.cancel()
    }
  }, [objects, isInitialLoad])

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
    // 🚀 PERFORMANCE: Disable shadows on unselected static objects (+5-8 fps)
    const shadowConfig = isStaticObject && !isSelected
      ? {} // No shadow for unselected static objects (major performance boost)
      : isStaticObject
        ? { shadowColor: '#C9AD6A', shadowBlur: 12, shadowOpacity: 0.8, shadowOffset: { x: 4, y: 6 } }
        : { shadowColor: 'black', shadowBlur: isSelected ? 12 : 8, shadowOpacity: 0.3, shadowOffset: { x: 2, y: 2 } }

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
          // 🚀 PERFORMANCE: Use cached tree renderer (12 trees × 4 circles = 48 nodes → 12 cached images)
          return (
            <TreeRenderer
              key={shape.id}
              shape={shape}
              isSelected={isSelected}
              commonProps={commonProps}
            />
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
      return null
    }

    const handleAnimationComplete = () => {

      // Guard against multiple completions
      if (completedSpellAnimations.has(spell.id)) {
        return
      }
      completedSpellAnimations.add(spell.id)

      // Apply status effects to tokens in area of effect (if spell has statusEffect property)
      if (spell.spellData?.statusEffect) {
        const PIXELS_PER_FOOT = 8

        // For cone spells, use fromPosition as origin and size as range
        const isCone = spell.spellData.category === 'cone'
        const effectRadius = isCone
          ? (spell.spellData.size || 30) * PIXELS_PER_FOOT // Convert feet to pixels
          : (spell.spellData.burstRadius || spell.spellData.size || 60)

        const originPosition = isCone ? spell.spellData.fromPosition : spell.spellData.toPosition

          category: spell.spellData.category,
          isCone,
          effectRadius,
          originPosition
        })

        // Find all tokens within the spell's area of effect
        const affectedTokens = objects.filter(obj => {
          if (obj.type !== 'token') return false

          // Calculate distance from spell origin to token
          const dx = obj.position.x - originPosition.x
          const dy = obj.position.y - originPosition.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          // For cone spells, also check if token is within the cone angle
          if (isCone && spell.spellData) {
            const coneAngle = (spell.spellData.coneAngle || 60) * (Math.PI / 180)
            const targetDx = spell.spellData.toPosition.x - spell.spellData.fromPosition.x
            const targetDy = spell.spellData.toPosition.y - spell.spellData.fromPosition.y
            const coneDirection = Math.atan2(targetDy, targetDx)

            const tokenAngle = Math.atan2(dy, dx)
            let angleDiff = Math.abs(tokenAngle - coneDirection)

            // Normalize angle difference to 0-PI range
            if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff

            const isInCone = distance <= effectRadius && angleDiff <= coneAngle / 2
            return isInCone
          }

          return distance <= effectRadius
        })

        // Apply status effect to all affected tokens
        const { addStatusEffect } = useMapStore.getState()
        const { currentRound } = useTimelineStore.getState()

        affectedTokens.forEach(token => {
          const statusEffect = {
            type: spell.spellData!.statusEffect!.type,
            intensity: spell.spellData!.statusEffect!.intensity || 1,
            roundApplied: currentRound,
            duration: spell.spellData!.statusEffect!.duration || 1
          }

          addStatusEffect(token.id, statusEffect)
        })
      }

      // For spells with persist duration, create a persistent area
      const persistDuration = spell.spellData?.persistDuration || 0

      // Area spells, projectile-burst spells, cone spells, and projectiles with burst effects can create persistent areas
      if (persistDuration > 0 && (spell.spellData?.category === 'area' || spell.spellData?.category === 'projectile-burst' || spell.spellData?.category === 'cone' || (spell.spellData?.category === 'projectile' && spell.spellData?.burstRadius))) {
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
          burstRadius: spell.spellData.burstRadius,
          size: spell.spellData.size,
          spellName: spell.spellData.spellName,
          category: spell.spellData.category
        })

        // Get current round and event from timeline
        const { currentRound, currentEvent } = useTimelineStore.getState()

        // Use durationType from spell data if provided, otherwise default based on category
        // Continuous spells (area, ray) typically use rounds
        // Instant burst effects (projectile-burst, cone with durationType='events') use events
        const durationType: 'rounds' | 'events' = spell.spellData.durationType || 'rounds'

        // Calculate radius for persistent area
        const persistentRadius = spell.spellData.category === 'cone'
          ? spell.spellData.size
          : (spell.spellData.burstRadius || spell.spellData.size || 60)

          category: spell.spellData.category,
          burstRadius: spell.spellData.burstRadius,
          size: spell.spellData.size,
          calculatedRadius: persistentRadius
        })

        const persistentAreaObject = {
          id: `persistent-area-${Date.now()}-${Math.random()}`,
          type: 'persistent-area' as const,
          position: persistentPosition,
          rotation: 0,
          layer: 9,
          persistentAreaData: {
            position: persistentPosition,
            // For cone spells, use size (in feet). For burst spells, use burstRadius (in pixels)
            radius: persistentRadius,
            color: spell.spellData.persistColor || spell.spellData.color || '#3D3D2E',
            opacity: spell.spellData.persistOpacity || 0.8,
            spellName: spell.spellData.spellName || 'Area Effect',
            roundCreated: currentRound,
            // Store token tracking information for persistent areas
            trackTarget: spell.spellData.trackTarget || false,
            targetTokenId: spell.spellData.targetTokenId || null,
            // Cone-specific properties
            shape: spell.spellData.category === 'cone' ? 'cone' : 'circle',
            fromPosition: spell.spellData.fromPosition,
            toPosition: spell.spellData.toPosition,
            coneAngle: spell.spellData.coneAngle || 60
          },
          roundCreated: currentRound,
          eventCreated: currentEvent,
          spellDuration: persistDuration,
          durationType: durationType,
          isSpellEffect: true as const // Mark as spell effect for cleanup
        }

          roundCreated: currentRound,
          eventCreated: currentEvent,
          spellDuration: persistDuration,
          durationType: durationType,
          expiresAt: durationType === 'rounds'
            ? `Round ${currentRound + persistDuration}`
            : `Event ${currentEvent + persistDuration}`,
          spellName: spell.spellData?.spellName
        })

        // Add persistent area to map using addSpellEffect to ensure it's tracked properly
        const addSpellEffect = useMapStore.getState().addSpellEffect
        addSpellEffect(persistentAreaObject)

        // Remove the spell animation object
        setTimeout(() => {
          deleteObject(spell.id)
          // Clean up from completed set to allow same spell ID to be used again
          completedSpellAnimations.delete(spell.id)
        }, 100)
      } else {
        // Remove immediately if no persist duration
        setTimeout(() => {
          deleteObject(spell.id)
          // Clean up from completed set to allow same spell ID to be used again
          completedSpellAnimations.delete(spell.id)
        }, 100)
      }
    }

    // Use SpellRenderer with O(1) category detection
    return (
      <SpellRenderer
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
      // Clear emergency timer since animation completed normally
      const timer = attackCleanupTimers.get(attack.id)
      if (timer) {
        clearTimeout(timer)
        attackCleanupTimers.delete(attack.id)
      }

      setTimeout(() => {
        deleteObject(attack.id)
      }, 100)
    }

    // 🚀 PERFORMANCE: Set emergency cleanup timer for stuck animations (5 seconds)
    if (!attackCleanupTimers.has(attack.id)) {
      const emergencyTimer = setTimeout(() => {
        deleteObject(attack.id)
        attackCleanupTimers.delete(attack.id)
      }, 5000)
      attackCleanupTimers.set(attack.id, emergencyTimer)
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
          listening={false} // Make non-interactive so tokens can be selected through it
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

  // 🚀 PERFORMANCE: Only render dynamic objects in this layer
  // Static objects are now in StaticObjectsLayer for better performance
  const dynamicObjects = useMemo(() => {
    // Use progressively loaded objects instead of raw objects
    if (!progressiveObjects || progressiveObjects.length === 0) {
      return EMPTY_ARRAY
    }

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

    // First, filter visible objects based on layer visibility
    const visibleObjects = progressiveObjects
      .map(obj => ({ obj, layer: getLayerForObject(obj) }))
      .filter(({ layer }) => layer?.visible !== false) // Show if layer is visible or undefined
      .sort((a, b) => {
        // Always render animations (spells, attacks, persistent-area) on top
        const isAnimationA = a.obj.type === 'spell' || a.obj.type === 'attack' || a.obj.type === 'persistent-area'
        const isAnimationB = b.obj.type === 'spell' || b.obj.type === 'attack' || b.obj.type === 'persistent-area'

        if (isAnimationA && !isAnimationB) return 1  // A is animation, goes after B
        if (!isAnimationA && isAnimationB) return -1 // B is animation, goes after A

        // Both same type (both animations or both regular), sort by zIndex
        const zIndexA = a.layer?.zIndex || a.obj.layer || 0
        const zIndexB = b.layer?.zIndex || b.obj.layer || 0
        return zIndexA - zIndexB
      })
      .map(({ obj }) => obj)

    // 🚀 PERFORMANCE: Filter OUT static objects and static effects - they're rendered in separate layers
    // Only return dynamic objects (tokens, spells, animations, non-static shapes)
    return visibleObjects.filter(obj => {
      // Keep all non-shape objects (tokens, spells, etc.)
      if (!isShape(obj)) return true

      // For shapes, exclude both static objects AND static effects
      const isStaticEffect = obj.metadata?.isStaticEffect === true
      return !checkIsStaticObject(obj) && !isStaticEffect
    })
  }, [progressiveObjects, mapVersion, layers, migrateNumericLayer, getDefaultLayerForObjectType, checkIsStaticObject]) // Re-compute when progressively loaded objects change OR mapVersion increments

  // 🚀 PERFORMANCE: Dev mode logging for performance monitoring
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && objects.length > 0) {
      const staticCount = objects.filter(obj => isShape(obj) && checkIsStaticObject(obj)).length
      const stats = {
        totalObjects: objects.length,
        staticObjects: staticCount,
        dynamicObjects: dynamicObjects.length,
        hiddenByLayers: objects.length - (staticCount + dynamicObjects.length),
        tokens: objects.filter(obj => obj.type === 'token').length,
        shapes: objects.filter(obj => obj.type === 'shape').length,
        trees: objects.filter(obj => (obj as any).metadata?.templateId === 'tree').length,
        attacks: objects.filter(obj => obj.type === 'attack').length,
        spells: objects.filter(obj => obj.type === 'spell').length,
      }


      // Performance warnings
      if (stats.attacks > 0) {
      }
      if (stats.trees > 10) {
      }
    }
  }, [objects.length, dynamicObjects.length, checkIsStaticObject])

  if (!objects || objects.length === 0) {
    return null
  }

  // 🚀 PERFORMANCE: Static objects in separate group with caching for FPS boost
  // Static objects (walls, trees, furniture) rendered with heavy caching
  // Dynamic objects (tokens, animations) rendered without caching for smooth movement
  return (
    <>
      {/* 🚀 PERFORMANCE: Only dynamic objects rendered here */}
      {/* Static objects are now in separate StaticObjectsLayer */}
      <Group
        name="dynamic-objects-group"
        listening={true}
        cache={false}  // No caching for smooth movement/animations
      >
        {dynamicObjects.map(renderObject)}
      </Group>

      {/* Loading indicator for progressive loading */}
      {loadingProgress.total > 0 && loadingProgress.loaded < loadingProgress.total && (
        <Group>
          <Rect
            x={10}
            y={10}
            width={200}
            height={30}
            fill="rgba(0, 0, 0, 0.7)"
            cornerRadius={5}
          />
          <Rect
            x={15}
            y={15}
            width={(190 * loadingProgress.loaded) / loadingProgress.total}
            height={20}
            fill="#C9AD6A"
            cornerRadius={3}
          />
          <KonvaText
            x={15}
            y={18}
            text={`Loading: ${loadingProgress.loaded}/${loadingProgress.total} objects`}
            fontSize={14}
            fill="white"
            fontFamily="Arial"
          />
        </Group>
      )}
    </>
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