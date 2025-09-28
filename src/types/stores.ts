import type { BattleMap, MapObject, SpellMapObject, Position, StaticObjectTemplate } from './map'
import type { Timeline, RoundEvent, EventType, EventData, AttackEventData } from './timeline'
import type { ToolType, DrawingState } from './tools'
import type { TokenTemplate } from './token'
import type { SpellEffectTemplate } from './spells'

// Layer Store Types
export type LayerDefinition = {
  id: string
  name: string
  type: 'background' | 'terrain' | 'grid' | 'objects' | 'tokens' | 'effects' | 'fog' | 'ui'
  visible: boolean
  locked: boolean
  opacity: number
  zIndex: number
  color?: string
  defaultForType?: string[]
  isDeletable: boolean
}

export type LayerStore = {
  layers: LayerDefinition[]
  activeLayerId: string | null

  // Actions
  createLayer: (name: string, type: LayerDefinition['type'], afterLayerId?: string) => void
  deleteLayer: (layerId: string) => void
  updateLayer: (layerId: string, updates: Partial<LayerDefinition>) => void
  moveLayer: (layerId: string, direction: 'up' | 'down') => void
  setActiveLayer: (layerId: string | null) => void
  toggleLayerVisibility: (layerId: string) => void
  toggleLayerLock: (layerId: string) => void

  // Utility functions
  getLayerById: (layerId: string) => LayerDefinition | undefined
  getDefaultLayerForObjectType: (objectType: string) => string
  migrateNumericLayer: (numericLayer: number) => string
  getLayerZIndex: (layerId: string) => number
}

// Animation Store Types
export type AnimationPath = {
  tokenId: string
  from: Position
  to: Position
  progress: number // 0 to 1
  isAnimating: boolean
}

export type AnimationStore = {
  activePaths: AnimationPath[]

  // Actions
  startAnimation: (tokenId: string, from: Position, to: Position) => void
  updateProgress: (tokenId: string, progress: number) => void
  endAnimation: (tokenId: string) => void
  clearAllPaths: () => void
}

// Event Creation Store Types
export type EventCreationState = {
  isCreatingEvent: boolean
  isPicking: 'from' | 'to' | 'token' | null
  selectedTokenId: string | null
  fromPosition: Position | null
  toPosition: Position | null
  pathPreview: Position[]
  selectedSpell?: any // Spell configuration data

  // Actions
  startEventCreation: (tokenId: string) => void
  cancelEventCreation: () => void
  startPickingPosition: (type: 'from' | 'to') => void
  startPickingToken: () => void
  setSelectedToken: (tokenId: string) => void
  setPosition: (type: 'from' | 'to', position: Position) => void
  setPathPreview: (path: Position[]) => void
  completePositionPicking: () => void
  setSelectedSpell: (spell: any) => void
  clearSpellSelection: () => void
  getTokenExpectedPosition: (tokenId?: string | null) => Position | null
}

// Round Store Types
export type RoundStore = {
  // State
  timeline: Timeline | null
  currentRound: number
  isInCombat: boolean
  animationSpeed: number // Multiplier for animation speed

  // Actions
  startCombat: (mapId: string) => void
  endCombat: () => void
  nextRound: () => Promise<void>
  previousRound: () => void
  goToRound: (roundNumber: number) => void

  // Event management
  addEvent: (tokenId: string, type: EventType, data: EventData, roundNumber?: number) => void
  updateEvent: (id: string, updates: Partial<RoundEvent>) => void
  removeEvent: (id: string) => void
  executeRoundEvents: (roundNumber: number) => Promise<void>
  previewEvent: (event: RoundEvent) => void

  // Configuration
  setAnimationSpeed: (speed: number) => void
  clearTimeline: () => void
}

// Tool Store Types
export type ToolStore = {
  currentTool: ToolType
  previousTool: ToolType
  drawingState: DrawingState
  fillColor: string
  strokeColor: string
  strokeWidth: number
  opacity: number
  tokenTemplate: TokenTemplate | null
  staticObjectTemplate: StaticObjectTemplate | null
  spellEffectTemplate: SpellEffectTemplate | null
  measurementPoints: Position[]

  // Actions
  setTool: (tool: ToolType) => void
  setPreviousTool: () => void
  setDrawingState: (state: Partial<DrawingState>) => void
  setFillColor: (color: string) => void
  setStrokeColor: (color: string) => void
  setStrokeWidth: (width: number) => void
  setOpacity: (opacity: number) => void
  resetDrawingState: () => void
  setTokenTemplate: (template: TokenTemplate | null) => void
  setStaticObjectTemplate: (template: StaticObjectTemplate | null) => void
  setSpellEffectTemplate: (template: SpellEffectTemplate | null) => void
  addMeasurementPoint: (point: Position) => void
  clearMeasurementPoints: () => void
}

// History Store Types
export type HistoryState = {
  past: string[]
  present: string | null
  future: string[]
  maxSize: number
}

export type HistoryStore = HistoryState & {
  // Actions
  push: (state: string) => void
  undo: () => void
  redo: () => void
  clear: () => void
  canUndo: () => boolean
  canRedo: () => boolean
}

// Map Store Types
export type MapStore = {
  currentMap: BattleMap | null
  selectedObjects: string[]
  mapVersion: number // Force re-renders when map changes
  spellPreviewEnabled: boolean // Enable/disable action preview (spells and movement)

  // Actions
  createNewMap: (name: string) => void
  loadMap: (map: BattleMap) => void
  addObject: (object: MapObject) => void
  addSpellEffect: (spell: SpellMapObject) => void
  addAttackEffect: (attack: AttackEventData) => void
  selectObject: (id: string) => void
  selectMultiple: (ids: string[]) => void
  clearSelection: () => void
  deleteSelected: () => void
  duplicateSelected: (offset?: Position) => void
  deleteObject: (id: string) => void
  updateObjectPosition: (id: string, position: Position) => void
  batchUpdatePosition: (objectIds: string[], deltaPosition: Position) => void
  updateObject: (id: string, updates: Partial<MapObject>) => void
  toggleGridSnap: () => void
  toggleGridVisibility: () => void
  updateGridSettings: (settings: Partial<BattleMap['grid']>) => void
  cleanupExpiredSpells: (currentRound: number) => void
  toggleSpellPreview: () => void
}