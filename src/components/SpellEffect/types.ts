import type { ReactNode } from 'react'

export type SpellCategory = 'area' | 'line' | 'wall' | 'emanation'
export type SpellShape = 'sphere' | 'cone' | 'cube' | 'line' | 'wall'

export type SpellEffectTemplate = {
  id: string
  name: string
  category: SpellCategory
  shape: SpellShape
  icon: ReactNode
  color: string
  opacity: number
  size: {
    radius?: number      // For spheres
    length?: number      // For cones, lines, walls
    width?: number       // For lines, walls, cubes
    height?: number      // For walls, cubes
    angle?: number       // For cones (in degrees)
  }
  description: string
  dndSpell?: string      // Associated D&D spell
}

export type SpellEffectsPanelProps = {
  // No props currently needed, but ready for future expansion
}