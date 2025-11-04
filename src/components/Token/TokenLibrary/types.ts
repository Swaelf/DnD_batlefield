import type { TokenSize } from '@/types/token'

// Token template type with exact typing
export type TokenTemplate = {
  name: string
  size: TokenSize
  color: string
  shape: 'circle' | 'square'
  category: 'player' | 'enemy' | 'npc' | 'object'
}

export const DEFAULT_TOKENS: TokenTemplate[] = [
  // Player tokens
  { name: 'Fighter', size: 'medium', color: '#1E40AF', shape: 'circle', category: 'player' },
  { name: 'Wizard', size: 'medium', color: '#7C3AED', shape: 'circle', category: 'player' },
  { name: 'Rogue', size: 'medium', color: '#374151', shape: 'circle', category: 'player' },
  { name: 'Cleric', size: 'medium', color: '#F59E0B', shape: 'circle', category: 'player' },

  // Enemy tokens
  { name: 'Goblin', size: 'small', color: '#16A34A', shape: 'circle', category: 'enemy' },
  { name: 'Orc', size: 'medium', color: '#65A30D', shape: 'circle', category: 'enemy' },
  { name: 'Ogre', size: 'large', color: '#A16207', shape: 'circle', category: 'enemy' },
  { name: 'Dragon', size: 'gargantuan', color: '#DC2626', shape: 'circle', category: 'enemy' },
  { name: 'Wolf', size: 'medium', color: '#6B7280', shape: 'circle', category: 'enemy' },

  // NPC tokens
  { name: 'Merchant', size: 'medium', color: '#8B5CF6', shape: 'square', category: 'npc' },
  { name: 'Guard', size: 'medium', color: '#3B82F6', shape: 'square', category: 'npc' },
  { name: 'Noble', size: 'medium', color: '#A855F7', shape: 'square', category: 'npc' },

  // Objects
  { name: 'Barrel', size: 'small', color: '#92400E', shape: 'square', category: 'object' },
  { name: 'Chest', size: 'small', color: '#A16207', shape: 'square', category: 'object' },
  { name: 'Door', size: 'medium', color: '#451A03', shape: 'square', category: 'object' },
]

export const SIZE_LABELS: Record<TokenSize, string> = {
  tiny: 'Tiny (2.5ft)',
  small: 'Small (5ft)',
  medium: 'Medium (5ft)',
  large: 'Large (10ft)',
  huge: 'Huge (15ft)',
  gargantuan: 'Gargantuan (20ft+)',
}

// Default HP values based on size and category
export const getDefaultHP = (size: TokenSize, category: string): number => {
  const sizeHP: Record<TokenSize, number> = {
    tiny: 4,
    small: 10,
    medium: 20,
    large: 50,
    huge: 100,
    gargantuan: 200,
  }

  const categoryMultiplier = {
    player: 1.5,
    enemy: 1,
    npc: 0.8,
    object: 0.5,
  }

  const baseHP = sizeHP[size] || 20
  const multiplier = categoryMultiplier[category as keyof typeof categoryMultiplier] || 1
  return Math.floor(baseHP * multiplier)
}
