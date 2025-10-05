import { type FC, useMemo } from 'react'
import { Group, Rect, Circle } from 'react-konva'
import type { Shape } from '@/types/map'
import type { Point } from '@/types/geometry'
import { AbstractWall } from './primitives/AbstractWall'
import { AbstractStructure } from './primitives/AbstractStructure'
import { AbstractNature } from './primitives/AbstractNature'
import { AbstractFurniture } from './primitives/AbstractFurniture'
import { AbstractDungeon } from './primitives/AbstractDungeon'
import type { WallVariant, StructureVariant, NatureVariant, FurnitureVariant, DungeonVariant, ObjectSize } from './types'

type StaticObjectRendererProps = {
  shape: Shape
  isSelected: boolean
  isDraggable: boolean
  onClick: (e: any) => void
  onDragEnd: (e: any) => void
  onContextMenu: (e: any) => void
  onMouseEnter: (e: any) => void
  onMouseLeave: (e: any) => void
}

// Fallback renderer for color-based type detection (backward compatibility)
function getObjectTypeFromColor(shape: Shape): { abstractType: string; variant: string } | null {
  const color = shape.fill || shape.fillColor || ''

  // Walls
  if (color.includes('#6B7280') && shape.width && shape.height && shape.width > shape.height * 5) {
    return { abstractType: 'wall', variant: 'stone' }
  }

  // Doors
  if (color.includes('#8B4513') && shape.width && shape.height && Math.abs(shape.width - shape.height) < 20) {
    return { abstractType: 'structure', variant: 'door' }
  }

  // Pillars
  if (shape.shapeType === 'circle' && color.includes('#9CA3AF')) {
    return { abstractType: 'structure', variant: 'pillar' }
  }

  // Stairs
  if (color.includes('#6B7280') && shape.width && shape.height && shape.height > shape.width) {
    return { abstractType: 'structure', variant: 'stairs' }
  }

  // Spiral stairs
  if (shape.shapeType === 'circle' && (color.includes('#5A5A5A') || color.includes('#5a5a5a'))) {
    return { abstractType: 'structure', variant: 'spiral-stairs' }
  }

  // Trees
  if (shape.shapeType === 'circle' && (color.includes('#10B981') || color.includes('#228B22'))) {
    return { abstractType: 'nature', variant: 'tree' }
  }

  // Bushes
  if (shape.shapeType === 'circle' && (color.includes('#059669') || color.includes('#3CB371'))) {
    return { abstractType: 'nature', variant: 'bush' }
  }

  // Rocks
  if (shape.shapeType === 'circle' && (color.includes('#78716C') || color.includes('#696969'))) {
    return { abstractType: 'nature', variant: 'rock' }
  }

  // Brazier
  if (shape.shapeType === 'circle' && (color.includes('#EA580C') || color.includes('#DC143C'))) {
    return { abstractType: 'dungeon', variant: 'brazier' }
  }

  // Barrels
  if (shape.shapeType === 'circle' && color.includes('#92400E')) {
    return { abstractType: 'furniture', variant: 'barrel' }
  }

  // Water
  if (color.includes('#3B82F6') && shape.opacity && shape.opacity < 0.8) {
    return { abstractType: 'nature', variant: 'water' }
  }

  // Tables
  if (color.includes('#92400E') && shape.width && shape.height && shape.width > shape.height) {
    return { abstractType: 'furniture', variant: 'table' }
  }

  // Chairs
  if (color.includes('#78350F') && shape.width && shape.height && Math.abs(shape.width - shape.height) < 20) {
    return { abstractType: 'furniture', variant: 'chair' }
  }

  // Chests
  if (color.includes('#92400E') && shape.width && shape.height && shape.width < shape.height) {
    return { abstractType: 'furniture', variant: 'chest' }
  }

  // Traps
  if (color.includes('#EF4444') && shape.opacity && shape.opacity <= 0.5) {
    return { abstractType: 'dungeon', variant: 'trap' }
  }

  // Altars
  if (color.includes('#6B7280') && shape.width && shape.height && shape.width < shape.height * 1.5) {
    return { abstractType: 'dungeon', variant: 'altar' }
  }

  return null
}

export const StaticObjectRenderer: FC<StaticObjectRendererProps> = ({
  shape,
  isSelected,
  isDraggable,
  onClick,
  onDragEnd,
  onContextMenu,
  onMouseEnter,
  onMouseLeave
}) => {
  const commonProps = useMemo(() => ({
    isSelected,
    isDraggable,
    onClick,
    onDragEnd,
    onContextMenu,
    onMouseEnter,
    onMouseLeave
  }), [isSelected, isDraggable, onClick, onDragEnd, onContextMenu, onMouseEnter, onMouseLeave])

  const position: Point = useMemo(() => shape.position, [shape.position])
  const rotation = shape.rotation || 0

  // Determine abstractType and variant
  const { abstractType, variant } = useMemo(() => {
    // Direct property access (O(1)) - preferred method
    if (shape.abstractType && shape.variant) {
      return { abstractType: shape.abstractType, variant: shape.variant }
    }

    // Fallback: color-based detection for backward compatibility
    const detected = getObjectTypeFromColor(shape)
    if (detected) {
      return detected
    }

    // Default to null (will render fallback)
    return { abstractType: null, variant: null }
  }, [shape])

  // Build size object
  const size: ObjectSize = useMemo(() => {
    if (shape.radius !== undefined) {
      return { radius: shape.radius }
    }
    return { width: shape.width || 50, height: shape.height || 50 }
  }, [shape.radius, shape.width, shape.height])

  // Render appropriate abstract component
  if (abstractType === 'wall' && variant) {
    return (
      <AbstractWall
        variant={variant as WallVariant}
        position={position}
        size={{ width: shape.width || 200, height: shape.height || 20 }}
        rotation={rotation}
        {...commonProps}
      />
    )
  }

  if (abstractType === 'structure' && variant) {
    return (
      <AbstractStructure
        variant={variant as StructureVariant}
        position={position}
        size={size}
        rotation={rotation}
        {...commonProps}
      />
    )
  }

  if (abstractType === 'nature' && variant) {
    return (
      <AbstractNature
        variant={variant as NatureVariant}
        position={position}
        size={size}
        rotation={rotation}
        {...commonProps}
      />
    )
  }

  if (abstractType === 'furniture' && variant) {
    return (
      <AbstractFurniture
        variant={variant as FurnitureVariant}
        position={position}
        size={size}
        rotation={rotation}
        {...commonProps}
      />
    )
  }

  if (abstractType === 'dungeon' && variant) {
    return (
      <AbstractDungeon
        variant={variant as DungeonVariant}
        position={position}
        size={size}
        rotation={rotation}
        {...commonProps}
      />
    )
  }

  // Fallback: render simple shape (for unknown or custom objects)
  const baseColor = shape.fill || shape.fillColor
  const strokeColor = isSelected ? '#C9AD6A' : (shape.stroke || shape.strokeColor)
  const strokeWidth = isSelected ? 3 : (shape.strokeWidth || 2)

  const shadowConfig = {
    shadowColor: '#000000',
    shadowBlur: isSelected ? 10 : 4,
    shadowOpacity: 0.6,
    shadowOffset: { x: 4, y: 6 }
  }

  if (shape.shapeType === 'circle' && shape.radius) {
    return (
      <Circle
        x={position.x}
        y={position.y}
        radius={shape.radius}
        fill={baseColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        opacity={shape.opacity}
        {...shadowConfig}
        {...commonProps}
      />
    )
  }

  // Default: rectangle
  const width = shape.width || 50
  const height = shape.height || 50

  return (
    <Group x={position.x} y={position.y} {...commonProps}>
      <Rect
        width={width}
        height={height}
        rotation={rotation}
        offsetX={width / 2}
        offsetY={height / 2}
        x={width / 2}
        y={height / 2}
        fill={baseColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        opacity={shape.opacity}
        cornerRadius={4}
        {...shadowConfig}
      />
    </Group>
  )
}
