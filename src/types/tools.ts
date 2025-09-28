import type { Point } from './geometry'

export type ToolType =
  | 'select'
  | 'rectangle'
  | 'circle'
  | 'line'
  | 'polygon'
  | 'token'
  | 'staticObject'
  | 'spellEffect'
  | 'layers'
  | 'pan'
  | 'measure'
  | 'text'
  | 'eraser'

export type Tool = {
  id: ToolType
  name: string
  icon: string // Lucide icon name
  shortcut?: string
  tooltip: string
}

export type DrawingState = {
  isDrawing: boolean
  startPoint: Point | null
  currentPoint: Point | null
  points: Point[] // For polygon drawing
}

export const TOOLS: Record<ToolType, Tool> = {
  select: {
    id: 'select',
    name: 'Select',
    icon: 'MousePointer',
    shortcut: 'V',
    tooltip: 'Select and move objects (V)'
  },
  rectangle: {
    id: 'rectangle',
    name: 'Rectangle',
    icon: 'Square',
    shortcut: 'R',
    tooltip: 'Draw rectangle (R)'
  },
  circle: {
    id: 'circle',
    name: 'Circle',
    icon: 'Circle',
    shortcut: 'C',
    tooltip: 'Draw circle (C)'
  },
  line: {
    id: 'line',
    name: 'Line',
    icon: 'Minus',
    shortcut: 'L',
    tooltip: 'Draw line (L)'
  },
  polygon: {
    id: 'polygon',
    name: 'Polygon',
    icon: 'Pentagon',
    shortcut: 'P',
    tooltip: 'Draw polygon (P) - Click to add points, double-click to finish'
  },
  token: {
    id: 'token',
    name: 'Token',
    icon: 'User',
    shortcut: 'T',
    tooltip: 'Place token (T)'
  },
  staticObject: {
    id: 'staticObject',
    name: 'Objects',
    icon: 'Home',
    shortcut: 'O',
    tooltip: 'Place static objects (O)'
  },
  spellEffect: {
    id: 'spellEffect',
    name: 'Spells',
    icon: 'Sparkles',
    shortcut: 'S',
    tooltip: 'Place spell effects (S)'
  },
  layers: {
    id: 'layers',
    name: 'Layers',
    icon: 'Layers',
    shortcut: 'Y',
    tooltip: 'Manage layers (Y)'
  },
  pan: {
    id: 'pan',
    name: 'Pan',
    icon: 'Hand',
    shortcut: 'H',
    tooltip: 'Pan view (H or hold Space)'
  },
  measure: {
    id: 'measure',
    name: 'Measure',
    icon: 'Ruler',
    shortcut: 'M',
    tooltip: 'Measure distance (M)'
  },
  text: {
    id: 'text',
    name: 'Text',
    icon: 'Type',
    shortcut: 'X',
    tooltip: 'Add text (X)'
  },
  eraser: {
    id: 'eraser',
    name: 'Eraser',
    icon: 'Eraser',
    shortcut: 'E',
    tooltip: 'Erase objects (E)'
  }
}