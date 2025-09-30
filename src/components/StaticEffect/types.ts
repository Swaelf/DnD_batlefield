import type { ReactNode } from 'react'

export type StaticEffectType = 'circle' | 'rectangle' | 'cone' | 'line'

export type StaticEffectCategory = 'area' | 'line' | 'cone'

export type StaticEffectTemplate = {
  id: string
  name: string
  type: StaticEffectType
  category: StaticEffectCategory
  icon: ReactNode
  defaultColor: string
  defaultOpacity: number
  rotation?: number    // Rotation in degrees (0-360)
  sizeProperties: {
    radius?: number      // For circles
    width?: number       // For rectangles and lines
    height?: number      // For rectangles
    length?: number      // For cones and lines
    angle?: number       // For cones (in degrees)
  }
  description: string
}

export type StaticEffectsPanelProps = {
  // No props currently needed, but ready for future expansion
}