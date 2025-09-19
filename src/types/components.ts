import React from 'react'
import Konva from 'konva'
import { Position } from '@/types/map'
import { SpellEventData } from '@/types/timeline'
import { Token } from '@/types/token'
import { SpellEffect } from '@/types/spells'

// Common Component Props
export type BaseComponentProps = {
  className?: string
  children?: React.ReactNode
}

// Canvas Component Types
export type MapCanvasProps = {
  width: number
  height: number
  stageRef?: React.MutableRefObject<Konva.Stage | null>
  onMouseMove?: (position: Position) => void
  onZoomChange?: (zoom: number) => void
}

export type GridLayerProps = {
  width: number
  height: number
  gridSize: number
  gridColor: string
  visible: boolean
  scale: number
  stagePosition: Position
  viewportWidth: number
  viewportHeight: number
}

export type ObjectsLayerProps = {
  onObjectClick?: (id: string, e: Konva.KonvaEventObject<MouseEvent>) => void
  onObjectDragEnd?: (id: string, newPosition: Position) => void
}

export type PathPreviewProps = {
  gridSize: number
}

// Tool Component Types
export type ToolButtonProps = {
  tool: string
  icon: React.ReactNode
  label: string
  shortcut?: string
  isActive: boolean
  onClick: () => void
}

export type DrawingLayerProps = {
  stageRef: React.MutableRefObject<Konva.Stage | null>
  gridSize: number
}

export type MeasureToolProps = {
  gridSize: number
}

// Token Component Types
export type TokenProps = {
  token: Token
  gridSize: number
  isSelected: boolean
  onSelect: (id: string) => void
  onDragMove?: () => void
  onDragEnd?: () => void
  isDraggable?: boolean
}

export type TokenLibraryProps = BaseComponentProps

// Spell Component Types
export type SpellProps = {
  spell: SpellEventData
  isAnimating: boolean
  onAnimationComplete?: () => void
}

export type SpellEffectRendererProps = {
  spell: SpellEffect
  onRemove?: (id: string) => void
}

export type SpellEffectsPanelProps = BaseComponentProps

// Timeline Component Types
export type TimelineProps = BaseComponentProps

export type CombatTrackerProps = BaseComponentProps

export type EventEditorProps = {
  isOpen: boolean
  onClose: () => void
}

// Menu & UI Component Types
export type FileMenuProps = {
  stageRef: React.MutableRefObject<Konva.Stage | null>
}

export type HelpDialogProps = {
  isOpen: boolean
  onClose: () => void
}

export type StatusBarProps = {
  mousePosition: Position
  zoom: number
}

// Context Menu Types
export type ContextMenuProps = {
  x: number
  y: number
  isOpen: boolean
  onClose: () => void
  children?: React.ReactNode
}

export type MapContextMenuProps = ContextMenuProps & {
  position: Position
}

export type ObjectContextMenuProps = ContextMenuProps & {
  objectId: string
}

// Properties Panel Types
export type PropertiesPanelProps = BaseComponentProps

export type ColorPickerProps = {
  color: string
  onChange: (color: string) => void
  label?: string
}

export type LayerControlsProps = {
  selectedObjects: string[]
}

// Static Object Types
export type StaticObjectLibraryProps = BaseComponentProps