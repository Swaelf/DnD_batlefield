import type { BattleMap, MapObject, SpellMapObject, Position, StaticObjectTemplate } from './map'
import type { Timeline, TimelineAction, EventType, EventData, AttackEventData } from './timeline'
import type { ToolType, DrawingState } from './tools'
import type { TokenTemplate } from './token'
import type { StaticEffectTemplate } from '@/components/StaticEffect/types'

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
  isPaused: boolean

  // Actions
  startAnimation: (tokenId: string, from: Position, to: Position) => void
  updateProgress: (tokenId: string, progress: number) => void
  endAnimation: (tokenId: string) => void
  clearAllPaths: () => void
  pauseAnimations: () => void
  resumeAnimations: () => void
}

// Event Creation Store Types
export type EventCreationState = {
  isCreatingEvent: boolean
  isPicking: 'from' | 'to' | 'token' | 'targetToken' | null
  selectedTokenId: string | null
  fromPosition: Position | null
  toPosition: Position | null
  pathPreview: Position[]
  savedToolMode: string | null  // Stores the tool mode before event creation
  // Actions
  startEventCreation: (tokenId: string) => void
  cancelEventCreation: () => void
  startPickingPosition: (type: 'from' | 'to') => void
  startPickingToken: () => void
  setPickingMode: (mode: 'from' | 'to' | 'token' | 'targetToken' | null) => void
  setSelectedToken: (tokenId: string) => void
  setPosition: (type: 'from' | 'to', position: Position) => void
  setPathPreview: (path: Position[]) => void
  completePositionPicking: () => void
  exitPickingMode: () => void  // Exit picking mode but keep modal open
  getTokenExpectedPosition: (tokenId?: string | null) => Position | null
}

// Timeline Store Types - Round-based system
export type TimelineStore = {
  // State
  timeline: Timeline | null
  currentRound: number // Current round number
  currentEvent: number // Event within current round
  isInCombat: boolean
  animationSpeed: number // Multiplier for animation speed

  // Combat actions
  startCombat: (mapId: string) => void
  endCombat: () => void

  // Round management
  startNewRound: () => void // Start new round, merge events
  nextRound: () => void // Advance to next round
  previousRound: () => void // Go back one round
  goToRound: (roundNumber: number) => void // Jump to specific round
  replayRound: (roundNumber: number) => Promise<void> // Replay all actions in round

  // Event management (within round)
  nextEvent: () => Promise<void>
  previousEvent: () => void
  goToEvent: (eventNumber: number) => void

  // Action management
  addAction: (tokenId: string, type: EventType, data: EventData, eventNumber?: number) => void
  updateAction: (id: string, updates: Partial<TimelineAction>) => void
  removeAction: (id: string) => void
  executeEventActions: (eventNumber: number) => Promise<void>
  previewAction: (action: TimelineAction) => void

  // Configuration
  setAnimationSpeed: (speed: number) => void
  clearTimeline: () => void
}

// Battle Log Store Types
export type BattleLogStore = {
  // State
  entries: import('./timeline').BattleLogEntry[]

  // Actions
  addEntry: (entry: Omit<import('./timeline').BattleLogEntry, 'id' | 'timestamp'>) => void
  clearRound: (roundNumber: number) => void
  clearAll: () => void

  // Queries
  getEntriesForRound: (roundNumber: number) => import('./timeline').BattleLogEntry[]
  getEntriesForEvent: (roundNumber: number, eventNumber: number) => import('./timeline').BattleLogEntry[]
  filterEntries: (filter: import('./timeline').BattleLogFilter) => import('./timeline').BattleLogEntry[]
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
  staticEffectTemplate: StaticEffectTemplate | null
  measurementPoints: Position[]

  // Category state
  activeCategory: import('./tools').ToolCategoryId | null
  expandedCategories: Set<import('./tools').ToolCategoryId>

  // Terrain tool state
  terrainBrushSize: number
  terrainColor: string
  terrainOpacity: number

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
  setStaticEffectTemplate: (template: StaticEffectTemplate | null) => void
  addMeasurementPoint: (point: Position) => void
  clearMeasurementPoints: () => void

  // Category actions
  setActiveCategory: (category: import('./tools').ToolCategoryId | null) => void
  toggleCategoryExpanded: (category: import('./tools').ToolCategoryId) => void

  // Terrain tool actions
  setTerrainBrushSize: (size: number) => void
  setTerrainColor: (color: string) => void
  setTerrainOpacity: (opacity: number) => void
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
  cleanupExpiredSpells: (currentRound: number, currentEvent?: number) => void
  toggleSpellPreview: () => void
  clearMapObjects: () => void

  // Terrain actions
  setFieldColor: (color: string) => void
  addTerrainDrawing: (drawing: import('./map').TerrainDrawing) => void
  removeTerrainDrawing: (id: string) => void
  clearTerrainDrawings: () => void
}