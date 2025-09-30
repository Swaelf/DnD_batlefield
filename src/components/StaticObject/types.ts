import type { ReactNode } from 'react'

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