import {
  Circle,
  Square,
  Triangle,
  Minus
} from '@/utils/optimizedIcons'
import type { StaticEffectTemplate } from './types'

export const staticEffectTemplates: StaticEffectTemplate[] = [
  // Circle Area
  {
    id: 'circle-area',
    name: 'Circle Area',
    type: 'circle',
    category: 'area',
    icon: <Circle />,
    defaultColor: '#3B82F6',
    defaultOpacity: 0.4,
    sizeProperties: { radius: 50 },
    description: 'Circular area marker'
  },

  // Rectangle Area
  {
    id: 'rectangle-area',
    name: 'Rectangle Area',
    type: 'rectangle',
    category: 'area',
    icon: <Square />,
    defaultColor: '#10B981',
    defaultOpacity: 0.4,
    sizeProperties: { width: 100, height: 60 },
    description: 'Rectangular area marker'
  },

  // Cone Area
  {
    id: 'cone-area',
    name: 'Cone Area',
    type: 'cone',
    category: 'cone',
    icon: <Triangle />,
    defaultColor: '#F59E0B',
    defaultOpacity: 0.4,
    sizeProperties: { length: 80, angle: 60 },
    description: 'Cone-shaped area marker'
  },

  // Line Area
  {
    id: 'line-area',
    name: 'Line Area',
    type: 'line',
    category: 'line',
    icon: <Minus />,
    defaultColor: '#EF4444',
    defaultOpacity: 0.4,
    sizeProperties: { length: 100, width: 10 },
    description: 'Linear area marker'
  }
] as const

export const staticEffectCategories = [
  { id: 'area', name: 'Area Effects', icon: <Circle size={16} /> },
  { id: 'line', name: 'Line Effects', icon: <Minus size={16} /> },
  { id: 'cone', name: 'Cone Effects', icon: <Triangle size={16} /> }
] as const