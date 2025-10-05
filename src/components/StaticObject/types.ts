import type { ReactNode } from 'react'
import type { Point } from '@/types/geometry'

export type StaticObjectType = 'circle' | 'rectangle' | 'line' | 'polygon'

export type StaticObjectCategory = 'structures' | 'nature' | 'furniture' | 'dungeon'

export type StaticObjectTemplate = {
  id: string
  name: string
  type: StaticObjectType
  category: StaticObjectCategory
  icon: ReactNode
  defaultColor: string
  defaultOpacity: number
  rotation?: number
  sizeProperties: {
    radius?: number
    width?: number
    height?: number
    length?: number
  }
  description: string
  // New properties for abstract component system
  abstractType?: AbstractType
  variant?: ObjectVariant
}

export type ObjectProperties = {
  color: string
  opacity: number
  rotation: number
  dimensions: {
    radius?: number
    width?: number
    height?: number
    length?: number
  }
}

// =============================================================================
// Abstract Component System Types
// =============================================================================

// Abstract component types
export type AbstractType = 'wall' | 'furniture' | 'nature' | 'structure' | 'dungeon'

// Variant types for each abstract component
export type WallVariant = 'stone' | 'wooden' | 'brick' | 'metal'
export type FurnitureVariant = 'table' | 'chair' | 'chest' | 'barrel' | 'bookshelf'
export type NatureVariant = 'tree' | 'bush' | 'rock' | 'water'
export type StructureVariant = 'door' | 'pillar' | 'stairs' | 'spiral-stairs'
export type DungeonVariant = 'trap' | 'altar' | 'brazier' | 'statue'

// Union type for all variants
export type ObjectVariant = WallVariant | FurnitureVariant | NatureVariant | StructureVariant | DungeonVariant

// Size configuration types
export type RectangleSize = {
  width: number
  height: number
}

export type CircleSize = {
  radius: number
}

export type ObjectSize = RectangleSize | CircleSize

// Variant configuration structure
export type VariantConfig = {
  color: string
  stroke?: string
  opacity?: number
  pattern?: 'solid' | 'brick' | 'grain' | 'metallic' | 'textured'
  shadowIntensity?: number
}

// Common props for all abstract components
export type BaseAbstractProps = {
  position: Point
  rotation: number
  isSelected: boolean
  isDraggable: boolean
  onClick: (e: any) => void
  onDragEnd: (e: any) => void
  onContextMenu: (e: any) => void
  onMouseEnter: (e: any) => void
  onMouseLeave: (e: any) => void
}

// Specific abstract component props
export type AbstractWallProps = BaseAbstractProps & {
  variant: WallVariant
  size: RectangleSize
}

export type AbstractFurnitureProps = BaseAbstractProps & {
  variant: FurnitureVariant
  size: ObjectSize
}

export type AbstractNatureProps = BaseAbstractProps & {
  variant: NatureVariant
  size: ObjectSize
}

export type AbstractStructureProps = BaseAbstractProps & {
  variant: StructureVariant
  size: ObjectSize
}

export type AbstractDungeonProps = BaseAbstractProps & {
  variant: DungeonVariant
  size: ObjectSize
}

// Type guard helpers
export function isRectangleSize(size: ObjectSize): size is RectangleSize {
  return 'width' in size && 'height' in size
}

export function isCircleSize(size: ObjectSize): size is CircleSize {
  return 'radius' in size
}

// Helper to determine abstract type from variant
export function getAbstractType(variant: ObjectVariant): AbstractType {
  const wallVariants: WallVariant[] = ['stone', 'wooden', 'brick', 'metal']
  const furnitureVariants: FurnitureVariant[] = ['table', 'chair', 'chest', 'barrel', 'bookshelf']
  const natureVariants: NatureVariant[] = ['tree', 'bush', 'rock', 'water']
  const structureVariants: StructureVariant[] = ['door', 'pillar', 'stairs', 'spiral-stairs']
  const dungeonVariants: DungeonVariant[] = ['trap', 'altar', 'brazier', 'statue']

  if (wallVariants.includes(variant as WallVariant)) return 'wall'
  if (furnitureVariants.includes(variant as FurnitureVariant)) return 'furniture'
  if (natureVariants.includes(variant as NatureVariant)) return 'nature'
  if (structureVariants.includes(variant as StructureVariant)) return 'structure'
  if (dungeonVariants.includes(variant as DungeonVariant)) return 'dungeon'

  throw new Error(`Unknown variant: ${variant}`)
}