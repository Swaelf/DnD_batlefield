import type { Point } from './geometry'
import type { ReactNode } from 'react'

export type ToolType =
  | 'select'
  | 'rectangle'
  | 'circle'
  | 'line'
  | 'polygon'
  | 'token'
  | 'staticObject'
  | 'staticEffect'
  | 'layers'
  | 'battleLogs'
  | 'pan'
  | 'measure'
  | 'text'
  | 'eraser'
  | 'terrainBrush'
  | 'terrainFill'
  | 'terrainEraser'

export type ToolCategoryId = 'basic' | 'terrain' | 'drawing' | 'objects' | 'utilities'

export type ToolCategory = {
  id: ToolCategoryId
  name: string
  icon: ReactNode
  tools: ToolType[]
  isExpandable: boolean
  isExpanded: boolean
  showInSidebar?: boolean
}

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
  staticEffect: {
    id: 'staticEffect',
    name: 'Effects',
    icon: 'MapPin',
    shortcut: 'S',
    tooltip: 'Place static effects (S)'
  },
  layers: {
    id: 'layers',
    name: 'Layers',
    icon: 'Layers',
    shortcut: 'Y',
    tooltip: 'Manage layers (Y)'
  },
  battleLogs: {
    id: 'battleLogs',
    name: 'Battle Logs',
    icon: 'FileText',
    shortcut: 'B',
    tooltip: 'View battle logs (B)'
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
  },
  terrainBrush: {
    id: 'terrainBrush',
    name: 'Terrain Brush',
    icon: 'Pencil',
    tooltip: 'Paint terrain on background layer'
  },
  terrainFill: {
    id: 'terrainFill',
    name: 'Terrain Fill',
    icon: 'Droplet',
    tooltip: 'Fill terrain areas'
  },
  terrainEraser: {
    id: 'terrainEraser',
    name: 'Terrain Eraser',
    icon: 'Eraser',
    tooltip: 'Erase terrain drawings'
  }
}

// Tool categories configuration
export const TOOL_CATEGORIES: Record<ToolCategoryId, Omit<ToolCategory, 'isExpanded'>> = {
  basic: {
    id: 'basic',
    name: 'Basic Tools',
    icon: null, // Will use individual tool icons
    tools: ['select', 'pan', 'measure'],
    isExpandable: false,
    showInSidebar: false
  },
  terrain: {
    id: 'terrain',
    name: 'Terrain',
    icon: null, // Will use Paintbrush icon in component
    tools: ['terrainBrush', 'terrainFill', 'terrainEraser'],
    isExpandable: true,
    showInSidebar: true
  },
  drawing: {
    id: 'drawing',
    name: 'Drawing',
    icon: null, // Will use Square icon in component
    tools: ['rectangle', 'circle', 'line', 'polygon', 'text'],
    isExpandable: true,
    showInSidebar: false
  },
  objects: {
    id: 'objects',
    name: 'Objects',
    icon: null, // Will use Home icon in component
    tools: ['token', 'staticObject', 'staticEffect'],
    isExpandable: true,
    showInSidebar: true
  },
  utilities: {
    id: 'utilities',
    name: 'Utilities',
    icon: null, // Will use individual tool icons
    tools: ['layers', 'battleLogs', 'eraser'],
    isExpandable: false,
    showInSidebar: false
  }
}