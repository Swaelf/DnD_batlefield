import { type ReactNode } from 'react'
import type { StaticObjectTemplate, StaticObjectCategory } from './types'

// Enhanced SVG icon components with better details
const WallIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <rect x="2" y="7" width="16" height="6" fill="currentColor" rx="1" />
    <rect x="2" y="8" width="7" height="1" fill="rgba(0,0,0,0.2)" />
    <rect x="11" y="8" width="7" height="1" fill="rgba(0,0,0,0.2)" />
    <rect x="2" y="11" width="7" height="1" fill="rgba(0,0,0,0.2)" />
    <rect x="11" y="11" width="7" height="1" fill="rgba(0,0,0,0.2)" />
  </svg>
)

const DoorIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <rect x="5" y="2" width="10" height="16" fill="currentColor" rx="1" />
    <rect x="6" y="3" width="8" height="6" fill="rgba(0,0,0,0.15)" rx="0.5" />
    <rect x="6" y="10" width="8" height="6" fill="rgba(0,0,0,0.15)" rx="0.5" />
    <circle cx="13" cy="10" r="1.2" fill="#C9AD6A" />
    <circle cx="13" cy="10" r="0.6" fill="rgba(0,0,0,0.3)" />
  </svg>
)

const PillarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <ellipse cx="10" cy="3" rx="5" ry="1.5" fill="currentColor" />
    <rect x="5" y="3" width="10" height="14" fill="currentColor" />
    <rect x="6" y="4" width="8" height="12" fill="rgba(255,255,255,0.1)" />
    <rect x="5.5" y="6" width="1" height="10" fill="rgba(0,0,0,0.2)" />
    <ellipse cx="10" cy="17" rx="5" ry="1.5" fill="currentColor" />
  </svg>
)

const StairsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <rect x="2" y="15" width="16" height="3" fill="currentColor" />
    <rect x="2" y="15" width="16" height="0.5" fill="rgba(255,255,255,0.2)" />
    <rect x="4" y="12" width="12" height="3" fill="currentColor" />
    <rect x="4" y="12" width="12" height="0.5" fill="rgba(255,255,255,0.2)" />
    <rect x="6" y="9" width="8" height="3" fill="currentColor" />
    <rect x="6" y="9" width="8" height="0.5" fill="rgba(255,255,255,0.2)" />
    <rect x="8" y="6" width="4" height="3" fill="currentColor" />
    <rect x="8" y="6" width="4" height="0.5" fill="rgba(255,255,255,0.2)" />
  </svg>
)

const TreeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <rect x="9" y="11" width="2" height="7" fill="#8B4513" />
    <rect x="9.5" y="11" width="0.5" height="7" fill="rgba(0,0,0,0.3)" />
    <circle cx="10" cy="8" r="5.5" fill="currentColor" opacity="0.9" />
    <circle cx="10" cy="8" r="4.5" fill="currentColor" />
    <circle cx="7" cy="9" r="2" fill="rgba(0,0,0,0.15)" />
    <circle cx="13" cy="9" r="2" fill="rgba(0,0,0,0.15)" />
    <circle cx="10" cy="6" r="2" fill="rgba(255,255,255,0.15)" />
  </svg>
)

const BushIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <circle cx="6" cy="13" r="4" fill="currentColor" opacity="0.9" />
    <circle cx="14" cy="13" r="4" fill="currentColor" opacity="0.9" />
    <circle cx="10" cy="10" r="3.5" fill="currentColor" />
    <circle cx="6" cy="13" r="2.5" fill="rgba(0,0,0,0.2)" />
    <circle cx="14" cy="13" r="2.5" fill="rgba(0,0,0,0.2)" />
    <circle cx="10" cy="9" r="1.5" fill="rgba(255,255,255,0.2)" />
  </svg>
)

const RockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M 10 3 L 17 15 L 3 15 Z" fill="currentColor" />
    <path d="M 10 5 L 15 14 L 5 14 Z" fill="rgba(0,0,0,0.2)" />
    <path d="M 7 10 L 10 5 L 13 10 Z" fill="rgba(255,255,255,0.15)" />
    <ellipse cx="10" cy="15" rx="7" ry="1" fill="rgba(0,0,0,0.3)" />
  </svg>
)

const WaterIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M 2 10 Q 5 8, 8 10 T 14 10 T 18 10 L 18 16 L 2 16 Z" fill="currentColor" />
    <path d="M 2 11 Q 5 9.5, 8 11 T 14 11 T 18 11" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" fill="none" />
    <path d="M 2 13 Q 4 12, 6 13 T 10 13 T 14 13 T 18 13" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" fill="none" />
    <circle cx="5" cy="12" r="0.8" fill="rgba(255,255,255,0.4)" />
    <circle cx="15" cy="14" r="0.6" fill="rgba(255,255,255,0.3)" />
  </svg>
)

const TableIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <rect x="3" y="7" width="14" height="6" fill="currentColor" rx="1" />
    <rect x="3.5" y="7.5" width="13" height="1" fill="rgba(255,255,255,0.2)" />
    <rect x="4" y="13" width="1.5" height="4" fill="currentColor" />
    <rect x="14.5" y="13" width="1.5" height="4" fill="currentColor" />
    <rect x="4.2" y="13" width="1.1" height="0.5" fill="rgba(0,0,0,0.3)" />
    <rect x="14.7" y="13" width="1.1" height="0.5" fill="rgba(0,0,0,0.3)" />
  </svg>
)

const ChairIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <rect x="6" y="2" width="8" height="2.5" fill="currentColor" rx="0.5" />
    <rect x="6" y="8" width="8" height="6" fill="currentColor" rx="1" />
    <rect x="6.5" y="8.5" width="7" height="1" fill="rgba(255,255,255,0.2)" />
    <rect x="7" y="14" width="1.5" height="4" fill="currentColor" />
    <rect x="11.5" y="14" width="1.5" height="4" fill="currentColor" />
    <rect x="7.2" y="14" width="1.1" height="0.5" fill="rgba(0,0,0,0.3)" />
    <rect x="11.7" y="14" width="1.1" height="0.5" fill="rgba(0,0,0,0.3)" />
  </svg>
)

const ChestIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <rect x="4" y="8" width="12" height="8" fill="currentColor" rx="1" />
    <path d="M 4 8 Q 10 4.5, 16 8" fill="currentColor" stroke="rgba(0,0,0,0.4)" strokeWidth="0.8" />
    <path d="M 5.5 5.5 Q 10 4, 14.5 5.5" stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none" />
    {/* Corner reinforcements */}
    <rect x="4.5" y="8.5" width="1.5" height="1.5" fill="rgba(0,0,0,0.3)" rx="0.3" />
    <rect x="14" y="8.5" width="1.5" height="1.5" fill="rgba(0,0,0,0.3)" rx="0.3" />
    <rect x="4.5" y="14" width="1.5" height="1.5" fill="rgba(0,0,0,0.3)" rx="0.3" />
    <rect x="14" y="14" width="1.5" height="1.5" fill="rgba(0,0,0,0.3)" rx="0.3" />
    {/* Metal bands */}
    <rect x="4.5" y="10" width="11" height="0.8" fill="rgba(0,0,0,0.35)" rx="0.2" />
    <rect x="4.5" y="13.5" width="11" height="0.8" fill="rgba(0,0,0,0.3)" rx="0.2" />
    {/* Large lock plate */}
    <rect x="8" y="11" width="4" height="4" fill="#C9AD6A" rx="0.5" />
    <rect x="8" y="11" width="4" height="4" fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="0.5" rx="0.5" />
    {/* Keyhole */}
    <circle cx="10" cy="12.5" r="1" fill="rgba(0,0,0,0.6)" />
    <rect x="9.7" y="12.8" width="0.6" height="1.5" fill="rgba(0,0,0,0.6)" />
    {/* Lock shine */}
    <circle cx="9.5" cy="12" r="0.5" fill="rgba(255,255,255,0.4)" />
  </svg>
)

const BarrelIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <ellipse cx="10" cy="10" rx="5" ry="7" fill="currentColor" />
    <ellipse cx="10" cy="10" rx="4.5" ry="6.5" fill="rgba(0,0,0,0.2)" />
    <line x1="5" y1="10" x2="15" y2="10" stroke="rgba(0,0,0,0.4)" strokeWidth="1.2" />
    <line x1="5.5" y1="6" x2="14.5" y2="6" stroke="rgba(0,0,0,0.3)" strokeWidth="0.8" />
    <line x1="5.5" y1="14" x2="14.5" y2="14" stroke="rgba(0,0,0,0.3)" strokeWidth="0.8" />
    <ellipse cx="10" cy="3" rx="5" ry="1.5" fill="rgba(255,255,255,0.1)" />
  </svg>
)

const BookshelfIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <rect x="3" y="2" width="14" height="16" fill="currentColor" rx="1" />
    <rect x="3.5" y="2.5" width="13" height="2" fill="rgba(0,0,0,0.3)" />
    <rect x="3.5" y="6.5" width="13" height="0.8" fill="rgba(0,0,0,0.35)" />
    <rect x="3.5" y="6.5" width="13" height="0.2" fill="rgba(255,255,255,0.15)" />
    <rect x="3.5" y="11.5" width="13" height="0.8" fill="rgba(0,0,0,0.35)" />
    <rect x="3.5" y="11.5" width="13" height="0.2" fill="rgba(255,255,255,0.15)" />
    <rect x="4.5" y="7.5" width="1.8" height="3.5" fill="#8B4513" />
    <rect x="7" y="8" width="1.5" height="3" fill="#654321" />
    <rect x="9" y="7.5" width="2" height="3.5" fill="#7B3F00" />
    <rect x="11.5" y="8" width="1.8" height="3" fill="#8B4513" />
    <rect x="13.8" y="7.5" width="1.5" height="3.5" fill="#654321" />
    <rect x="4.5" y="12.5" width="2" height="4" fill="#654321" />
    <rect x="7" y="13" width="1.5" height="3.5" fill="#8B4513" />
    <rect x="9" y="12.5" width="1.8" height="4" fill="#7B3F00" />
    <rect x="11.3" y="13" width="1.8" height="3.5" fill="#654321" />
    <rect x="13.5" y="12.5" width="1.5" height="4" fill="#8B4513" />
  </svg>
)

const TrapIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <rect x="5" y="5" width="10" height="10" rx="1" fill="rgba(255,0,0,0.1)" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2,2" />
    <path d="M 10 7 L 13 10 L 10 13 L 7 10 Z" fill="#922610" />
    <path d="M 10 8 L 12 10 L 10 12 L 8 10 Z" fill="rgba(0,0,0,0.3)" />
    <circle cx="10" cy="10" r="1" fill="#C9AD6A" />
    <line x1="6" y1="6" x2="14" y2="14" stroke="rgba(255,0,0,0.2)" strokeWidth="0.5" />
    <line x1="14" y1="6" x2="6" y2="14" stroke="rgba(255,0,0,0.2)" strokeWidth="0.5" />
  </svg>
)

const AltarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <rect x="6" y="10" width="8" height="6" fill="currentColor" rx="1" />
    <rect x="4" y="8" width="12" height="2" fill="currentColor" rx="0.5" />
    <rect x="4.5" y="8.5" width="11" height="0.5" fill="rgba(255,255,255,0.2)" />
    <polygon points="10,2 12,8 8,8" fill="#C9AD6A" />
    <polygon points="10,3 11.5,7.5 8.5,7.5" fill="rgba(255,255,255,0.3)" />
    <circle cx="10" cy="4.5" r="0.8" fill="rgba(255,255,255,0.4)" />
  </svg>
)

const BrazierIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <rect x="8.5" y="12" width="3" height="6" fill="currentColor" />
    <rect x="9" y="12" width="0.5" height="6" fill="rgba(255,255,255,0.2)" />
    <circle cx="10" cy="8" r="4.5" fill="#DC143C" opacity="0.8" />
    <circle cx="10" cy="8" r="3.5" fill="#FF4500" opacity="0.6" />
    <circle cx="10" cy="8" r="2.5" fill="#FFD700" opacity="0.8" />
    <path d="M 10 4 L 11 6 L 9 6 Z" fill="#FFD700" />
    <path d="M 8 5 L 9 7 L 7 7 Z" fill="#FFA500" />
    <path d="M 12 5 L 13 7 L 11 7 Z" fill="#FFA500" />
  </svg>
)

const SpiralStairsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="7" fill="currentColor" />
    <circle cx="10" cy="10" r="5.5" fill="rgba(0,0,0,0.2)" />
    <path d="M 10 3 Q 14 6, 17 10" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" fill="none" />
    <path d="M 17 10 Q 14 14, 10 17" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" fill="none" />
    <path d="M 10 17 Q 6 14, 3 10" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" fill="none" />
    <circle cx="10" cy="10" r="2" fill="rgba(0,0,0,0.4)" />
  </svg>
)

const ShapesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <rect x="2" y="2" width="7" height="7" fill="currentColor" rx="1" />
    <circle cx="14" cy="14" r="4" fill="currentColor" />
  </svg>
)

export const staticObjectCategories: Array<{
  id: StaticObjectCategory
  name: string
  icon: ReactNode
}> = [
  { id: 'structures', name: 'Structures', icon: <WallIcon /> },
  { id: 'nature', name: 'Nature', icon: <TreeIcon /> },
  { id: 'furniture', name: 'Furniture', icon: <TableIcon /> },
  { id: 'dungeon', name: 'Dungeon', icon: <ChestIcon /> },
  { id: 'drawing', name: 'Drawing Tools', icon: <ShapesIcon /> }
]

export const staticObjectTemplates: StaticObjectTemplate[] = [
  // Structures
  {
    id: 'wall',
    name: 'Wall',
    type: 'rectangle',
    category: 'structures',
    icon: <WallIcon />,
    defaultColor: '#6B7280',
    defaultOpacity: 1,
    rotation: 0,
    sizeProperties: {
      width: 200,
      height: 20
    },
    description: 'Stone or wooden wall',
    abstractType: 'wall',
    variant: 'stone'
  },
  {
    id: 'door',
    name: 'Door',
    type: 'rectangle',
    category: 'structures',
    icon: <DoorIcon />,
    defaultColor: '#8B4513',
    defaultOpacity: 1,
    rotation: 0,
    sizeProperties: {
      width: 50,
      height: 50
    },
    description: 'Wooden door',
    abstractType: 'structure',
    variant: 'door'
  },
  {
    id: 'pillar',
    name: 'Pillar',
    type: 'circle',
    category: 'structures',
    icon: <PillarIcon />,
    defaultColor: '#9CA3AF',
    defaultOpacity: 1,
    rotation: 0,
    sizeProperties: {
      radius: 30
    },
    description: 'Stone pillar',
    abstractType: 'structure',
    variant: 'pillar'
  },
  {
    id: 'stairs',
    name: 'Stairs',
    type: 'rectangle',
    category: 'structures',
    icon: <StairsIcon />,
    defaultColor: '#6B7280',
    defaultOpacity: 1,
    rotation: 0,
    sizeProperties: {
      width: 100,
      height: 150
    },
    description: 'Staircase',
    abstractType: 'structure',
    variant: 'stairs'
  },
  {
    id: 'spiral-stairs',
    name: 'Spiral Stairs',
    type: 'circle',
    category: 'structures',
    icon: <SpiralStairsIcon />,
    defaultColor: '#5A5A5A',
    defaultOpacity: 1,
    rotation: 0,
    sizeProperties: {
      radius: 40
    },
    description: 'Spiral staircase',
    abstractType: 'structure',
    variant: 'spiral-stairs'
  },

  // Nature
  {
    id: 'tree',
    name: 'Tree',
    type: 'circle',
    category: 'nature',
    icon: <TreeIcon />,
    defaultColor: '#10B981',
    defaultOpacity: 0.8,
    rotation: 0,
    sizeProperties: {
      radius: 40
    },
    description: 'Large tree',
    abstractType: 'nature',
    variant: 'tree'
  },
  {
    id: 'bush',
    name: 'Bush',
    type: 'circle',
    category: 'nature',
    icon: <BushIcon />,
    defaultColor: '#059669',
    defaultOpacity: 0.7,
    rotation: 0,
    sizeProperties: {
      radius: 25
    },
    description: 'Small bush',
    abstractType: 'nature',
    variant: 'bush'
  },
  {
    id: 'rock',
    name: 'Rock',
    type: 'circle',
    category: 'nature',
    icon: <RockIcon />,
    defaultColor: '#78716C',
    defaultOpacity: 1,
    rotation: 0,
    sizeProperties: {
      radius: 35
    },
    description: 'Large boulder',
    abstractType: 'nature',
    variant: 'rock'
  },
  {
    id: 'water',
    name: 'Water',
    type: 'rectangle',
    category: 'nature',
    icon: <WaterIcon />,
    defaultColor: '#3B82F6',
    defaultOpacity: 0.6,
    rotation: 0,
    sizeProperties: {
      width: 150,
      height: 150
    },
    description: 'Water area',
    abstractType: 'nature',
    variant: 'water'
  },

  // Furniture
  {
    id: 'table',
    name: 'Table',
    type: 'rectangle',
    category: 'furniture',
    icon: <TableIcon />,
    defaultColor: '#92400E',
    defaultOpacity: 1,
    rotation: 0,
    sizeProperties: {
      width: 100,
      height: 60
    },
    description: 'Wooden table',
    abstractType: 'furniture',
    variant: 'table'
  },
  {
    id: 'chair',
    name: 'Chair',
    type: 'rectangle',
    category: 'furniture',
    icon: <ChairIcon />,
    defaultColor: '#78350F',
    defaultOpacity: 1,
    rotation: 0,
    sizeProperties: {
      width: 40,
      height: 40
    },
    description: 'Wooden chair',
    abstractType: 'furniture',
    variant: 'chair'
  },
  {
    id: 'chest',
    name: 'Chest',
    type: 'rectangle',
    category: 'furniture',
    icon: <ChestIcon />,
    defaultColor: '#92400E',
    defaultOpacity: 1,
    rotation: 0,
    sizeProperties: {
      width: 60,
      height: 50
    },
    description: 'Treasure chest',
    abstractType: 'furniture',
    variant: 'chest'
  },
  {
    id: 'barrel',
    name: 'Barrel',
    type: 'circle',
    category: 'furniture',
    icon: <BarrelIcon />,
    defaultColor: '#92400E',
    defaultOpacity: 1,
    rotation: 0,
    sizeProperties: {
      radius: 25
    },
    description: 'Wooden barrel',
    abstractType: 'furniture',
    variant: 'barrel'
  },
  {
    id: 'bookshelf',
    name: 'Bookshelf',
    type: 'rectangle',
    category: 'furniture',
    icon: <BookshelfIcon />,
    defaultColor: '#92400E',
    defaultOpacity: 1,
    rotation: 0,
    sizeProperties: {
      width: 60,
      height: 100
    },
    description: 'Wooden bookshelf',
    abstractType: 'furniture',
    variant: 'bookshelf'
  },

  // Dungeon
  {
    id: 'trap',
    name: 'Trap',
    type: 'rectangle',
    category: 'dungeon',
    icon: <TrapIcon />,
    defaultColor: '#EF4444',
    defaultOpacity: 0.5,
    rotation: 0,
    sizeProperties: {
      width: 80,
      height: 80
    },
    description: 'Hidden trap',
    abstractType: 'dungeon',
    variant: 'trap'
  },
  {
    id: 'altar',
    name: 'Altar',
    type: 'rectangle',
    category: 'dungeon',
    icon: <AltarIcon />,
    defaultColor: '#6B7280',
    defaultOpacity: 1,
    rotation: 0,
    sizeProperties: {
      width: 80,
      height: 100
    },
    description: 'Stone altar',
    abstractType: 'dungeon',
    variant: 'altar'
  },
  {
    id: 'brazier',
    name: 'Brazier',
    type: 'circle',
    category: 'dungeon',
    icon: <BrazierIcon />,
    defaultColor: '#EA580C',
    defaultOpacity: 1,
    rotation: 0,
    sizeProperties: {
      radius: 30
    },
    description: 'Fire brazier',
    abstractType: 'dungeon',
    variant: 'brazier'
  },

  // Drawing Tools
  {
    id: 'draw-rectangle',
    name: 'Rectangle',
    type: 'rectangle',
    category: 'drawing',
    icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="5" width="14" height="10" stroke="currentColor" strokeWidth="2" fill="none" rx="1"/></svg>,
    defaultColor: '#3B82F6',
    defaultOpacity: 0.6,
    rotation: 0,
    sizeProperties: {
      width: 100,
      height: 60
    },
    description: 'Basic rectangle shape for custom drawings'
  },
  {
    id: 'draw-circle',
    name: 'Circle',
    type: 'circle',
    category: 'drawing',
    icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="2" fill="none"/></svg>,
    defaultColor: '#3B82F6',
    defaultOpacity: 0.6,
    rotation: 0,
    sizeProperties: {
      radius: 40
    },
    description: 'Basic circle shape for custom drawings'
  }
]