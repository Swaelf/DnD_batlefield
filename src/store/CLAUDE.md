# Store Directory

## Overview
Zustand-based state management stores for the MapMaker application. Each store manages a specific domain of application state.

## Directory Structure
```
store/
├── mapStore.ts             # Map data and object management
├── toolStore.ts            # Tool selection and drawing state
├── historyStore.ts         # Undo/redo history management
├── uiStore.ts              # UI state (panels, dialogs, etc.)
├── roundStore.ts           # Timeline and combat round management
├── eventCreationStore.ts   # Event creation workflow state
└── animationStore.ts       # Token animation coordination
```

## Store Rules & Guidelines

### 1. Store Organization
- **One store per domain** - Don't create monolithic stores
- **Clear boundaries** - Each store has distinct responsibilities
- **No store dependencies** - Stores shouldn't import each other directly
- **Immer for updates** - Use Immer for complex state mutations

### 2. Store Naming Conventions
- **Store files** - camelCase with 'Store' suffix (e.g., `mapStore.ts`)
- **Hook exports** - `useXStore` pattern (e.g., `useMapStore`)
- **Action names** - Verb or verbNoun (e.g., `setTool`, `addObject`)
- **Selector names** - Noun or getNoun (e.g., `selectedObjects`, `getCurrentMap`)

### 3. Store Structure Pattern
```typescript
interface StoreState {
  // State properties
  data: DataType
  isLoading: boolean
}

interface StoreActions {
  // Action methods
  setData: (data: DataType) => void
  reset: () => void
}

type Store = StoreState & StoreActions

const useStore = create<Store>()(
  immer((set, get) => ({
    // Initial state
    data: initialData,
    isLoading: false,

    // Actions
    setData: (data) =>
      set((state) => {
        state.data = data
      }),

    reset: () =>
      set((state) => {
        state.data = initialData
        state.isLoading = false
      }),
  }))
)
```

## Individual Store Documentation

### mapStore
**Purpose**: Manages map data, objects, and selection state

**State Properties**:
- `currentMap`: The active BattleMap
- `selectedObjects`: Array of selected object IDs
- `copiedObjects`: Clipboard for copy/paste
- `isGridVisible`: Grid visibility toggle

**Key Actions**:
- `createNewMap(name, width?, height?)`: Create new map
- `loadMap(map)`: Load existing map
- `addObject(object)`: Add object to map
- `addAttackEffect(attack)`: Add attack animation to map with auto-cleanup
- `updateObject(id, updates)`: Update object properties
- `deleteObject(id)`: Remove object
- `selectObject(id)`: Select single object
- `selectMultiple(ids)`: Select multiple objects
- `clearSelection()`: Deselect all
- `deleteSelected()`: Delete selected objects
- `duplicateSelected()`: Duplicate selected objects
- `updateObjectPosition(id, position)`: Move object
- `setGridSettings(settings)`: Update grid configuration

**Selectors**:
- `getSelectedObjects()`: Returns full object data for selected IDs
- `getObjectById(id)`: Find specific object
- `getObjectsByType(type)`: Filter objects by type
- `getLayerOrder()`: Get objects sorted by layer

**Rules**:
- Never mutate objects directly
- Maintain referential equality for unchanged objects
- Update layer values to maintain proper z-order
- Validate object bounds within map dimensions
- Generate unique IDs for all objects

### toolStore
**Purpose**: Manages active tool and drawing settings

**State Properties**:
- `currentTool`: Active tool type
- `drawingState`: Current drawing operation state
- `fillColor`: Shape fill color
- `strokeColor`: Shape stroke color
- `strokeWidth`: Line thickness
- `opacity`: Object opacity
- `fontSize`: Text size
- `fontFamily`: Text font
- `tokenTemplate`: Template for token placement
- `measureUnit`: Grid or pixels
- `snapToGrid`: Snap enabled state

**Key Actions**:
- `setTool(tool)`: Change active tool
- `setDrawingState(state)`: Update drawing operation
- `setFillColor(color)`: Set fill color
- `setStrokeColor(color)`: Set stroke color
- `setStrokeWidth(width)`: Set line width
- `setOpacity(opacity)`: Set opacity
- `setTokenTemplate(template)`: Set token preset
- `resetDrawingState()`: Clear drawing operation

**Tool Types**:
```typescript
type Tool =
  | 'select'      // Selection and manipulation
  | 'rectangle'   // Draw rectangles
  | 'circle'      // Draw circles
  | 'polygon'     // Draw polygons
  | 'line'        // Draw lines
  | 'text'        // Add text
  | 'token'       // Place tokens
  | 'pan'         // Navigate canvas
  | 'measure'     // Measure distances
  | 'eraser'      // Delete objects
```

**Rules**:
- Reset drawing state on tool change
- Validate color values (hex format)
- Enforce min/max for numeric properties
- Clear token template when switching from token tool

### historyStore
**Purpose**: Undo/redo functionality with command pattern

**State Properties**:
- `history`: Array of state snapshots
- `currentIndex`: Current position in history
- `maxHistorySize`: Maximum stored actions (default: 50)
- `canUndo`: Computed - whether undo is available
- `canRedo`: Computed - whether redo is available

**Key Actions**:
- `pushState(state)`: Add new state to history
- `undo()`: Revert to previous state
- `redo()`: Reapply next state
- `clearHistory()`: Reset history
- `setMaxHistorySize(size)`: Configure history limit

**Implementation Pattern**:
```typescript
interface HistoryEntry {
  timestamp: number
  description: string
  state: SerializedState
}
```

**Rules**:
- Limit history size to prevent memory issues
- Clear redo stack when new action is pushed
- Use structured cloning for state snapshots
- Debounce rapid changes before pushing to history
- Group related changes (e.g., dragging) as single entry

### uiStore
**Purpose**: UI state that doesn't belong in component state

**State Properties**:
- `sidebarWidth`: Right panel width
- `leftPanelCollapsed`: Toolbar collapse state
- `rightPanelCollapsed`: Properties panel collapse state
- `activeDialog`: Current open dialog
- `contextMenu`: Context menu state
- `tooltipPosition`: Active tooltip
- `isDragging`: Global drag state
- `cursorPosition`: Mouse coordinates
- `zoom`: Canvas zoom level
- `panOffset`: Canvas pan position

**Key Actions**:
- `setSidebarWidth(width)`: Resize sidebar
- `toggleLeftPanel()`: Collapse/expand toolbar
- `toggleRightPanel()`: Collapse/expand properties
- `openDialog(dialog)`: Show dialog
- `closeDialog()`: Hide dialog
- `showContextMenu(menu, position)`: Display context menu
- `hideContextMenu()`: Close context menu
- `updateCursor(position)`: Track mouse position
- `setZoom(level)`: Update zoom
- `setPan(offset)`: Update pan position

**Rules**:
- Don't duplicate state that belongs in components
- UI state should be serializable
- Reset transient state appropriately
- Consider responsive breakpoints

### roundStore
**Purpose**: Timeline and combat round management for D&D-style encounters

**State Properties**:
- `timeline`: Current Timeline object with rounds and events
- `currentRound`: Active round number
- `isInCombat`: Combat state flag
- `animationSpeed`: Animation speed multiplier (0.5-3.0)

**Key Actions**:
- `startCombat(mapId)`: Initialize combat with timeline
- `endCombat()`: End combat and save history
- `nextRound()`: Advance to next round with event execution
- `previousRound()`: Navigate to previous round
- `goToRound(number)`: Jump to specific round
- `addEvent(tokenId, type, data, round?)`: Add event to round
- `updateEvent(id, updates)`: Modify existing event
- `removeEvent(id)`: Delete event
- `executeRoundEvents(round)`: Process all events in round
- `previewEvent(event)`: Test event without committing
- `setAnimationSpeed(speed)`: Adjust animation timing
- `clearTimeline()`: Reset all timeline data

**Event Management**:
- Events are queued by round and executed in order
- Async execution with proper sequencing
- Animation coordination with other stores
- History tracking for replay functionality

**Rules**:
- One timeline per map
- Events must have valid tokenId references
- Round numbers are sequential starting from 1
- Animation speed affects all timeline events

### eventCreationStore
**Purpose**: Manages event creation workflow and interactive UI state

**State Properties**:
- `isCreatingEvent`: Whether event creation is active
- `isPicking`: Current picking mode ('from' | 'to' | 'token' | null)
- `selectedTokenId`: Token being configured for event
- `fromPosition`: Source position for movement events
- `toPosition`: Target position for movement events
- `pathPreview`: Visual path preview for movement

**Key Actions**:
- `startEventCreation(tokenId)`: Begin event creation for token
- `cancelEventCreation()`: Abort event creation and reset
- `startPickingPosition(type)`: Enter position selection mode
- `startPickingToken()`: Enter token selection mode
- `setSelectedToken(id)`: Set active token
- `setPosition(type, position)`: Set from/to position
- `setPathPreview(path)`: Update movement path preview
- `completePositionPicking()`: Finish position selection

**Workflow States**:
1. **Token Selection** - Choose token to animate
2. **Position Picking** - Interactive position selection
3. **Event Configuration** - Set timing and properties
4. **Preview** - Test before committing
5. **Creation** - Add to timeline

**Rules**:
- Only one event creation session at a time
- Must clear state between event types
- Position picking is modal - blocks other interactions
- Path preview updates in real-time during selection

### animationStore
**Purpose**: Coordinates token movement animations and state

**State Properties**:
- `activePaths`: Array of currently animating token movements

**Path Structure**:
```typescript
interface AnimationPath {
  tokenId: string
  from: Position
  to: Position
  progress: number // 0 to 1
  isAnimating: boolean
}
```

**Key Actions**:
- `startAnimation(tokenId, from, to)`: Begin token movement
- `updateProgress(tokenId, progress)`: Update animation progress
- `endAnimation(tokenId)`: Complete and remove animation
- `clearAllPaths()`: Stop all active animations

**Animation Coordination**:
- Integrates with Konva animations in components
- Tracks multiple simultaneous token movements
- Provides progress updates for smooth interpolation
- Handles animation cleanup and memory management

**Rules**:
- One animation path per token (newest replaces old)
- Progress values must be 0-1 range
- Animations are removed when complete
- Store is read-only during animation execution

## State Management Patterns

### Computed State
Use getters for derived state:
```typescript
get selectedCount() {
  return get().selectedObjects.length
}
```

### Async Actions
Handle async operations properly:
```typescript
loadMapAsync: async (id: string) => {
  set({ isLoading: true })
  try {
    const map = await fetchMap(id)
    set({ currentMap: map, isLoading: false })
  } catch (error) {
    set({ error, isLoading: false })
  }
}
```

### Subscriptions
Subscribe to store changes:
```typescript
const unsubscribe = useMapStore.subscribe(
  (state) => state.currentMap,
  (currentMap) => {
    console.log('Map changed:', currentMap)
  }
)
```

### Middleware
Using Immer for immutable updates:
```typescript
import { immer } from 'zustand/middleware/immer'

const useStore = create<Store>()(
  immer((set) => ({
    // Mutations are safe with Immer
    updateNested: () =>
      set((state) => {
        state.deep.nested.value = 'new value'
      })
  }))
)
```

## Performance Optimization

### Selector Optimization
Use shallow equality for performance:
```typescript
const objects = useMapStore((state) => state.objects, shallow)
```

### Slice Pattern
Select only needed state:
```typescript
const tool = useToolStore((state) => state.currentTool)
// Instead of
const { currentTool } = useToolStore()
```

### Memoized Selectors
For expensive computations:
```typescript
const sortedObjects = useMapStore((state) =>
  useMemo(() =>
    [...state.objects].sort((a, b) => a.layer - b.layer),
    [state.objects]
  )
)
```

## Testing Stores

### Test Setup
```typescript
import { renderHook, act } from '@testing-library/react'

beforeEach(() => {
  useMapStore.setState(initialState)
})
```

### Testing Actions
```typescript
test('adds object to map', () => {
  const { result } = renderHook(() => useMapStore())

  act(() => {
    result.current.addObject(newObject)
  })

  expect(result.current.currentMap.objects).toContainEqual(newObject)
})
```

## Store Composition

### Cross-Store Communication
Use effects in components for coordination:
```typescript
useEffect(() => {
  // When tool changes, clear selection
  if (tool === 'eraser') {
    clearSelection()
  }
}, [tool, clearSelection])
```

### Avoid Direct Store Dependencies
Bad:
```typescript
// In mapStore
import { useToolStore } from './toolStore'
```

Good:
```typescript
// In component
const tool = useToolStore(state => state.currentTool)
const clearSelection = useMapStore(state => state.clearSelection)

useEffect(() => {
  // Coordinate stores in component
}, [tool, clearSelection])
```

## Store Development Checklist

When creating or modifying a store:
- [ ] Clear domain boundaries defined
- [ ] TypeScript interfaces complete
- [ ] Immer middleware applied
- [ ] Actions are pure (no side effects)
- [ ] Computed values use getters
- [ ] No circular dependencies
- [ ] Performance optimized
- [ ] Tests written
- [ ] Documentation updated
- [ ] Migration strategy if breaking changes