import type React from 'react'
import type Konva from 'konva'
import type { Position } from '@/types/map'

// Canvas Hooks Types
export type CanvasSize = {
  width: number
  height: number
}

export type UseCanvasReturn = {
  containerRef: React.RefObject<HTMLDivElement>
  canvasSize: CanvasSize
}

export type UseCanvasControlsProps = {
  stageRef: React.MutableRefObject<Konva.Stage | null>
  containerWidth: number
  containerHeight: number
  mapWidth: number
  mapHeight: number
}

export type UseCanvasControlsReturn = {
  scale: number
  position: Position
  handleWheel: (e: Konva.KonvaEventObject<WheelEvent>) => void
  handleMouseDown: (e: Konva.KonvaEventObject<MouseEvent>) => void
  handleMouseMove: (e: Konva.KonvaEventObject<MouseEvent>) => void
  handleMouseUp: () => void
  resetView: () => void
  zoomIn: () => void
  zoomOut: () => void
  centerView: () => void
}

// Auto Save Types
export type UseAutoSaveReturn = {
  lastSaved: Date | null
  isSaving: boolean
  saveNow: () => void
  clearSaves: () => void
}

// Keyboard Shortcuts Types
export type KeyboardShortcut = {
  key: string
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  action: () => void
  description: string
}

export type UseKeyboardShortcutsReturn = {
  shortcuts: KeyboardShortcut[]
  registerShortcut: (shortcut: KeyboardShortcut) => void
  unregisterShortcut: (key: string) => void
}

// Token Animation Types
export type UseTokenAnimationProps = {
  stageRef: React.MutableRefObject<Konva.Stage | null>
}

export type UseTokenAnimationReturn = {
  executeRoundAnimations: (roundNumber: number) => Promise<void>
}