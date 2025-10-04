import type { ReactNode } from 'react'
import type Konva from 'konva'
import type { Point } from './geometry'

export type Position = Point

// GridSettings moved to grid.ts for proper module structure

export type MapObject = {
  id: string
  type: 'token' | 'shape' | 'tile' | 'text' | 'spell' | 'attack' | 'persistent-area'
  position: Position
  rotation: number
  layer: number // Legacy numeric layer for backward compatibility
  layerId?: string // New layer ID for layer management system
  locked?: boolean
  visible?: boolean
  name?: string
  opacity?: number

  // Spell-specific
  isSpellEffect?: boolean
  roundCreated?: number
  spellDuration?: number // in rounds

  // Attack-specific
  isAttackEffect?: boolean
  attackData?: any // Will be properly typed later

  shapeType?: string
  width?: number
  height?: number

  // Persistent area-specific
}

// Specialized spell object that requires round tracking
export type SpellMapObject = MapObject & {
  type: 'spell' | 'persistent-area'
  isSpellEffect: boolean
  roundCreated: number // Required for spells
  spellDuration: number // Required for spells
  persistentAreaData?: {
    position: Position
    radius: number
    color: string
    opacity: number
    spellName: string
    roundCreated: number
  }
}

export type Shape = MapObject & {
  type: 'shape'
  shapeType: 'rectangle' | 'circle' | 'polygon' | 'line' | 'rect'
  width?: number
  height?: number
  radius?: number
  points?: number[]
  fill: string // for compatibility with existing code
  fillColor: string
  stroke: string // for compatibility with existing code
  strokeColor: string
  strokeWidth: number
  opacity: number
  metadata?: any
  // Abstract component system properties
  abstractType?: 'wall' | 'furniture' | 'nature' | 'structure' | 'dungeon'
  variant?: string // Specific variant (e.g., 'stone', 'wooden', 'tree', etc.)
}

export type Text = MapObject & {
  type: 'text'
  text: string
  fontSize: number
  fontFamily: string
  color: string
  fill?: string
  align?: string
}

import type { GridSettings } from './grid'

export type BattleMap = {
  id: string
  name: string
  width: number
  height: number
  grid: GridSettings
  objects: MapObject[]
}

// Runtime state for managing animations (not persisted)
export type MapObjectRuntimeState = {
  id: string // Links to MapObject.id
  animation?: Konva.Animation | null
  isAnimating?: boolean
}

// Static object template for placing predefined objects
export type StaticObjectTemplate = {
  id: string
  name: string
  type: 'circle' | 'rectangle' | 'line' | 'polygon'
  category: 'structures' | 'nature' | 'furniture' | 'dungeon'
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
  // Abstract component system properties for O(1) type detection
  abstractType?: 'wall' | 'furniture' | 'nature' | 'structure' | 'dungeon'
  variant?: string
}