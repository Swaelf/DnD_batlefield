import {
  Sparkles,
  Zap,
  Flame,
  Wind,
  Snowflake,
  Circle,
  Square,
  Minus
} from 'lucide-react'
import type { SpellEffectTemplate } from './types'

export const spellEffectTemplates: SpellEffectTemplate[] = [
  // Area Effects - Spheres
  {
    id: 'fireball',
    name: 'Fireball',
    category: 'area',
    shape: 'sphere',
    icon: <Flame />,
    color: '#FF6347',
    opacity: 0.4,
    size: { radius: 100 }, // 20ft radius = 4 squares * 50px/square / 2
    description: '20-foot radius sphere',
    dndSpell: 'Fireball (3rd level)'
  },
  {
    id: 'darkness',
    name: 'Darkness',
    category: 'area',
    shape: 'sphere',
    icon: <Circle />,
    color: '#000000',
    opacity: 0.7,
    size: { radius: 75 }, // 15ft radius
    description: '15-foot radius sphere',
    dndSpell: 'Darkness (2nd level)'
  },
  {
    id: 'fog-cloud',
    name: 'Fog Cloud',
    category: 'area',
    shape: 'sphere',
    icon: <Wind />,
    color: '#D3D3D3',
    opacity: 0.5,
    size: { radius: 100 }, // 20ft radius
    description: '20-foot radius sphere',
    dndSpell: 'Fog Cloud (1st level)'
  },
  {
    id: 'ice-storm',
    name: 'Ice Storm',
    category: 'area',
    shape: 'sphere',
    icon: <Snowflake />,
    color: '#87CEEB',
    opacity: 0.4,
    size: { radius: 100 }, // 20ft radius
    description: '20-foot radius, 40-foot high cylinder',
    dndSpell: 'Ice Storm (4th level)'
  },

  // Cone Effects
  {
    id: 'burning-hands',
    name: 'Burning Hands',
    category: 'area',
    shape: 'cone',
    icon: <Flame />,
    color: '#FFA500',
    opacity: 0.4,
    size: { length: 75, angle: 60 }, // 15ft cone
    description: '15-foot cone',
    dndSpell: 'Burning Hands (1st level)'
  },
  {
    id: 'cone-of-cold',
    name: 'Cone of Cold',
    category: 'area',
    shape: 'cone',
    icon: <Snowflake />,
    color: '#4169E1',
    opacity: 0.4,
    size: { length: 300, angle: 60 }, // 60ft cone
    description: '60-foot cone',
    dndSpell: 'Cone of Cold (5th level)'
  },
  {
    id: 'color-spray',
    name: 'Color Spray',
    category: 'area',
    shape: 'cone',
    icon: <Sparkles />,
    color: '#FF69B4',
    opacity: 0.3,
    size: { length: 75, angle: 60 }, // 15ft cone
    description: '15-foot cone',
    dndSpell: 'Color Spray (1st level)'
  },

  // Cube Effects
  {
    id: 'thunderwave',
    name: 'Thunderwave',
    category: 'area',
    shape: 'cube',
    icon: <Zap />,
    color: '#4B0082',
    opacity: 0.4,
    size: { width: 75, height: 75 }, // 15ft cube
    description: '15-foot cube',
    dndSpell: 'Thunderwave (1st level)'
  },
  {
    id: 'hypnotic-pattern',
    name: 'Hypnotic Pattern',
    category: 'area',
    shape: 'cube',
    icon: <Sparkles />,
    color: '#9370DB',
    opacity: 0.3,
    size: { width: 150, height: 150 }, // 30ft cube
    description: '30-foot cube',
    dndSpell: 'Hypnotic Pattern (3rd level)'
  },
  {
    id: 'web',
    name: 'Web',
    category: 'area',
    shape: 'cube',
    icon: <Square />,
    color: '#F5F5DC',
    opacity: 0.5,
    size: { width: 100, height: 100 }, // 20ft cube
    description: '20-foot cube',
    dndSpell: 'Web (2nd level)'
  },

  // Line Effects
  {
    id: 'lightning-bolt',
    name: 'Lightning Bolt',
    category: 'line',
    shape: 'line',
    icon: <Zap />,
    color: '#00FFFF',
    opacity: 0.6,
    size: { length: 500, width: 25 }, // 100ft long, 5ft wide
    description: '100-foot long, 5-foot wide line',
    dndSpell: 'Lightning Bolt (3rd level)'
  },
  {
    id: 'gust-of-wind',
    name: 'Gust of Wind',
    category: 'line',
    shape: 'line',
    icon: <Wind />,
    color: '#87CEFA',
    opacity: 0.3,
    size: { length: 300, width: 50 }, // 60ft long, 10ft wide
    description: '60-foot long, 10-foot wide line',
    dndSpell: 'Gust of Wind (2nd level)'
  },
  {
    id: 'disintegrate',
    name: 'Disintegrate',
    category: 'line',
    shape: 'line',
    icon: <Minus />,
    color: '#32CD32',
    opacity: 0.7,
    size: { length: 500, width: 5 }, // Thin beam
    description: 'Thin green beam',
    dndSpell: 'Disintegrate (6th level)'
  },

  // Wall Effects
  {
    id: 'wall-of-fire',
    name: 'Wall of Fire',
    category: 'wall',
    shape: 'wall',
    icon: <Flame />,
    color: '#FF4500',
    opacity: 0.6,
    size: { length: 300, width: 5, height: 100 }, // 60ft long, 1ft thick, 20ft high
    description: '60-foot long, 20-foot high wall',
    dndSpell: 'Wall of Fire (4th level)'
  },
  {
    id: 'wall-of-ice',
    name: 'Wall of Ice',
    category: 'wall',
    shape: 'wall',
    icon: <Snowflake />,
    color: '#ADD8E6',
    opacity: 0.7,
    size: { length: 500, width: 5, height: 50 }, // 100ft long, 1ft thick, 10ft high
    description: '100-foot long, 10-foot high wall',
    dndSpell: 'Wall of Ice (6th level)'
  },
  {
    id: 'wall-of-force',
    name: 'Wall of Force',
    category: 'wall',
    shape: 'wall',
    icon: <Square />,
    color: '#6495ED',
    opacity: 0.2,
    size: { length: 500, width: 2, height: 50 }, // 100ft long, invisible
    description: '100-foot long invisible wall',
    dndSpell: 'Wall of Force (5th level)'
  },
  {
    id: 'blade-barrier',
    name: 'Blade Barrier',
    category: 'wall',
    shape: 'wall',
    icon: <Zap />,
    color: '#C0C0C0',
    opacity: 0.5,
    size: { length: 500, width: 25, height: 100 }, // 100ft long, 5ft thick, 20ft high
    description: '100-foot long wall of blades',
    dndSpell: 'Blade Barrier (6th level)'
  }
] as const

export const spellCategories = [
  { id: 'area', name: 'Area Effects', icon: <Circle size={16} /> },
  { id: 'line', name: 'Line Effects', icon: <Minus size={16} /> },
  { id: 'wall', name: 'Wall Effects', icon: <Square size={16} /> },
  { id: 'emanation', name: 'Emanations', icon: <Sparkles size={16} /> }
] as const