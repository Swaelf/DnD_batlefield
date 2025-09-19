import React from 'react'
import Konva from 'konva'
import { Point } from './geometry'

export type Position = Point

// GridSettings moved to grid.ts for proper module structure

export type MapObject = {
  id: string
  type: 'token' | 'shape' | 'tile' | 'text' | 'spell' | 'attack'
  position: Position
  rotation: number
  layer: number
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
}

export type Text = MapObject & {
  type: 'text'
  text: string
  fontSize: number
  fontFamily: string
  color: string
}

import { GridSettings } from './grid'

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
  category: 'structures' | 'nature' | 'furniture' | 'dungeon'
  icon: React.ReactNode
  width: number
  height: number
  fillColor: string
  strokeColor: string
  strokeWidth: number
  shape: 'rectangle' | 'circle' | 'polygon'
  points?: number[] // For polygon shapes
}