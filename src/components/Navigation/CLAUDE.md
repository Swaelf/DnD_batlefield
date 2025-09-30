# Navigation Components

## Overview
Navigation components provide map navigation controls and environment token system for viewport-relative spell effects.

## Components

### NavigationPad
**Purpose**: Circular D-pad control for panning the map canvas

**Features**:
- Fixed position in bottom-left corner (left: 80px, bottom: 80px)
- Circular design (110px diameter) with 4 directional arrow buttons
- Blue center indicator dot for visual reference
- Smooth 0.2s transitions on hover/press
- Consistent with D&D theme dark palette

**Props**:
```typescript
interface NavigationPadProps {
  onPanUp: () => void
  onPanDown: () => void
  onPanLeft: () => void
  onPanRight: () => void
}
```

**Usage**:
```typescript
<NavigationPad
  onPanUp={() => panStage(0, PAN_AMOUNT)}
  onPanDown={() => panStage(0, -PAN_AMOUNT)}
  onPanLeft={() => panStage(PAN_AMOUNT, 0)}
  onPanRight={() => panStage(-PAN_AMOUNT, 0)}
/>
```

### EnvironmentToken
**Purpose**: Visual indicator for environment spell source with viewport-relative positioning

**Features**:
- Fixed position in bottom-left corner (left: 16px, bottom: 16px)
- 60px circular icon with cloud symbol
- Blue border (#3B82F6) matching environment theme
- "Environment" label below icon
- Always visible, locked to viewport (not map)

**Implementation**:
```typescript
<Box
  style={{
    position: 'fixed',
    bottom: '16px',
    left: '16px',
    zIndex: 100
  }}
>
  <Box style={{ /* 60px circle with cloud icon */ }}>
    <Cloud size={32} color="#3B82F6" />
  </Box>
  <Text>Environment</Text>
</Box>
```

**Integration**:
- Works with void-token system in mapStore
- Position calculated dynamically via stageRegistry utility
- Spells originate from icon center regardless of pan/zoom

## Environment Token System

### Architecture

**Components**:
1. **EnvironmentToken** (visual): Fixed-position UI element showing spell source
2. **void-token** (data): Invisible token object with `isVoid: true` flag
3. **stageRegistry** (utility): Global stage reference and coordinate conversion
4. **Event Editor Integration**: Toggle button to enable environment source

### Viewport-Relative Positioning

The environment token uses a sophisticated coordinate system to ensure spells always originate from the visible icon:

**Coordinate Transformation Pipeline**:
```
Screen Coordinates (viewport)
  ↓ (subtract canvas container offset)
Canvas-Relative Coordinates
  ↓ (apply inverse stage transform)
Canvas Coordinates (map space)
```

**Implementation** (`stageRegistry.ts`):
```typescript
// 1. Get screen position of icon center
const screenLeft = 16 + 30 // left margin + half of 60px icon
const screenTop = window.innerHeight - 16 - 30 // bottom margin + half icon

// 2. Convert to canvas-relative coordinates
const containerRect = stage.container().getBoundingClientRect()
const canvasRelativeX = screenLeft - containerRect.left
const canvasRelativeY = screenTop - containerRect.top

// 3. Apply inverse stage transform (pan/zoom)
const scale = stage.scaleX()
const stagePos = stage.position()
const canvasX = (canvasRelativeX - stagePos.x) / scale
const canvasY = (canvasRelativeY - stagePos.y) / scale
```

### void-token Configuration

**Purpose**: Invisible token object for event system integration

**Properties**:
```typescript
{
  id: 'void-token',
  type: 'token',
  name: 'Environment',
  position: { x: -10000, y: -10000 }, // Off-screen, calculated dynamically
  visible: false, // Never rendered on canvas
  locked: true, // Cannot be moved
  isVoid: true, // Special environment flag
  allowedEvents: ['spell'], // Only spell events allowed
  layer: -999 // Always below everything
}
```

**Event Validation** (`roundStore.ts`):
```typescript
// Prevent movement events on environment token
addEvent: (tokenId, type, data) => {
  const token = mapStore.getState().currentMap?.objects.find(obj => obj.id === tokenId)
  if (token?.allowedEvents && !token.allowedEvents.includes(type)) {
    console.warn(`Event type '${type}' not allowed for token '${tokenId}'`)
    return // Reject event
  }
  // ... add event
}
```

### Event Editor Integration

**Toggle Button** (`SelectToken.tsx`):
- Full-width button with active/inactive states
- Active: Blue background (#1E3A5F), "ACTIVE" badge
- Inactive: Gray background (#2A2A2A)
- Automatically selects void-token when enabled
- Disables regular token selection UI

**Dynamic Source Calculation** (`UnifiedEventEditor.tsx`):
```typescript
// Calculate source position based on token type
let sourcePosition = token.position
if (useEnvironmentToken && token.id === 'void-token') {
  // Get viewport-relative position
  sourcePosition = getEnvironmentTokenCanvasPosition()
}
```

## Stage Registry System

**Purpose**: Global access to Konva stage for coordinate transformations

**Module**: `src/utils/stageRegistry.ts`

**Functions**:

```typescript
// Register stage on mount
registerStage(stage: Konva.Stage | null): void

// Get registered stage
getStage(): Konva.Stage | null

// Convert screen to canvas coordinates
screenToCanvasPosition(screenX: number, screenY: number): Position

// Get environment token canvas position
getEnvironmentTokenCanvasPosition(): Position
```

**Registration** (`MapCanvas.tsx`):
```typescript
const handleStageRef = useCallback((node: any) => {
  stageRef.current = node
  if (node) {
    registerStage(node) // Register on mount
  } else {
    registerStage(null) // Unregister on unmount
  }
}, [])

<Stage ref={handleStageRef} />
```

## Usage Examples

### Creating Environment Spell

1. Open Combat Tracker and click "Add Event"
2. Click "Environment Token" button (turns blue with "ACTIVE" badge)
3. Pick target position on map
4. Select spell action (e.g., Fireball)
5. Click "Add Event"
6. Spell will animate from environment token icon to target

### Pan/Zoom Behavior

- Pan map: Environment token stays in bottom-left corner (viewport-locked)
- Zoom in/out: Environment token size stays constant (UI element)
- Create spell: Originates from current screen position of icon
- Animation path: Calculated in real canvas coordinates

## Best Practices

1. **Always use stageRegistry** for viewport-relative positioning
2. **Test at different zoom levels** to ensure correct coordinate transformation
3. **Never render void-token** on canvas (keep visible: false)
4. **Validate event types** against allowedEvents array
5. **Document coordinate systems** when adding new features

## Troubleshooting

**Problem**: Spells start from wrong position
- Check: Stage registered properly in MapCanvas
- Check: Container rect calculation in stageRegistry
- Check: Stage transform (position and scale)

**Problem**: Environment token not visible
- Check: Z-index (should be 100)
- Check: Position (left: 16px, bottom: 16px)
- Check: Not hidden by other UI elements

**Problem**: Movement events on environment token
- Check: allowedEvents validation in roundStore.addEvent
- Check: void-token has allowedEvents: ['spell']
- Check: Event type matches allowed types