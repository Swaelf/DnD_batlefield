/**
 * Color Constants
 * D&D-themed color palette and spell effect colors
 */

// D&D Brand Colors
export const DND_COLORS = {
  PRIMARY: '#922610',      // D&D Red
  SECONDARY: '#C9AD6A',    // D&D Gold
  BLACK: '#1A1A1A',        // D&D Black
  BACKGROUND: '#171717',   // Dark background
  PARCHMENT: '#F4E5C2',    // Parchment color
} as const

// UI Colors
export const UI_COLORS = {
  // Status colors
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  ERROR: '#EF4444',
  INFO: '#3B82F6',

  // Gray scale
  GRAY_100: '#F5F5F5',
  GRAY_200: '#E5E5E5',
  GRAY_300: '#D4D4D4',
  GRAY_400: '#A3A3A3',
  GRAY_500: '#737373',
  GRAY_600: '#525252',
  GRAY_700: '#404040',
  GRAY_800: '#262626',
  GRAY_900: '#171717',

  // Transparency
  TRANSPARENT: 'transparent',
  WHITE: '#FFFFFF',
  BLACK: '#000000',
} as const

// Spell Effect Colors by School
export const SPELL_COLORS = {
  // Schools of Magic
  ABJURATION: '#2563EB',    // Blue
  CONJURATION: '#7C3AED',   // Purple
  DIVINATION: '#6B7280',    // Gray
  ENCHANTMENT: '#EC4899',   // Pink
  EVOCATION: '#EF4444',     // Red
  ILLUSION: '#8B5CF6',      // Violet
  NECROMANCY: '#10B981',    // Green (decay)
  TRANSMUTATION: '#F59E0B',  // Amber

  // Common spell effects
  FIRE: '#FF4500',
  ICE: '#00BFFF',
  LIGHTNING: '#4169E1',
  ACID: '#32CD32',
  POISON: '#9370DB',
  RADIANT: '#FFD700',
  NECROTIC: '#4B0082',
  PSYCHIC: '#FF1493',
  FORCE: '#9932CC',
  THUNDER: '#708090',
} as const

// Token Colors
export const TOKEN_COLORS = {
  PLAYER: '#3B82F6',
  ALLY: '#10B981',
  ENEMY: '#EF4444',
  NEUTRAL: '#6B7280',
  NPC: '#F59E0B',
  BOSS: '#7C3AED',
} as const

// Grid Colors
export const GRID_COLORS = {
  DEFAULT: 'rgba(255, 255, 255, 0.1)',
  LIGHT: 'rgba(255, 255, 255, 0.2)',
  DARK: 'rgba(0, 0, 0, 0.3)',
  HIGHLIGHT: 'rgba(201, 173, 106, 0.3)', // D&D Gold with transparency
  MEASURE: '#F59E0B',
} as const

// Map preset colors for quick selection
export const PRESET_COLORS = [
  '#000000', // Black
  '#FFFFFF', // White
  '#EF4444', // Red
  '#F59E0B', // Amber
  '#10B981', // Green
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#922610', // D&D Red
  '#C9AD6A', // D&D Gold
] as const

// Selection and highlight colors
export const SELECTION_COLORS = {
  PRIMARY: 'rgba(59, 130, 246, 0.5)',    // Blue with transparency
  SECONDARY: 'rgba(201, 173, 106, 0.5)', // Gold with transparency
  HOVER: 'rgba(255, 255, 255, 0.1)',
  ACTIVE: 'rgba(59, 130, 246, 0.8)',
  HANDLE: '#3B82F6',
  OUTLINE: '#FFFFFF',
} as const