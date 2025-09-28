import type { MapObject } from './map';

export type TokenSize = 'tiny' | 'small' | 'medium' | 'large' | 'huge' | 'gargantuan';

export type Token = MapObject & {
  type: 'token';
  size: TokenSize;
  image?: string;
  name?: string;
  color: string;
  borderColor?: string;
  borderWidth?: number;
  opacity: number;
  shape: 'circle' | 'square';
  showLabel?: boolean;
  labelPosition?: 'top' | 'bottom';
  labelColor?: string;
  initiative?: number;
  conditions?: string[];
  isVoid?: boolean;  // Special flag for void/environment token
  allowedEvents?: ('move' | 'appear' | 'disappear' | 'spell')[];  // Restrict event types
  // HP Management
  currentHP?: number;
  maxHP?: number;
  tempHP?: number;
  hpBarColor?: string;
  showHP?: boolean;
}

export type TokenTemplate = {
  name: string;
  size: TokenSize;
  color: string;
  shape: 'circle' | 'square';
  category?: 'player' | 'enemy' | 'npc' | 'object';
  showLabel?: boolean;
  labelPosition?: 'top' | 'bottom';
  opacity?: number;
  borderColor?: string;
  borderWidth?: number;
  // HP properties for templates
  currentHP?: number;
  maxHP?: number;
  tempHP?: number;
  hpBarColor?: string;
  showHP?: boolean;
}