# Hooks Directory

## Overview
Custom React hooks that encapsulate reusable logic for the MapMaker application. These hooks abstract complex behaviors and state management patterns.

## Directory Structure
```
hooks/
├── useAutoSave.ts           # Automatic saving to localStorage
├── useCanvas.ts             # Canvas container sizing and refs
├── useCanvasControls.ts     # Pan, zoom, and navigation controls
└── useKeyboardShortcuts.ts  # Global keyboard shortcut handling
```

## Hook Rules & Guidelines

### 1. Hook Naming Conventions
- **Always prefix with `use`** - This is a React requirement
- **Descriptive names** - Hook name should clearly indicate its purpose
- **Camel case** - e.g., `useAutoSave`, `useKeyboardShortcuts`
- **Return value naming** - Be explicit about what's returned

### 2. Hook Structure Pattern
```typescript
export function useHookName(param1: Type1, param2?: Type2) {
  // 1. Hooks declarations (useState, useRef, etc.)
  const [state, setState] = useState<StateType>(initialValue)

  // 2. Derived state / memoizations
  const derivedValue = useMemo(() => compute(state), [state])

  // 3. Callbacks
  const handleAction = useCallback(() => {
    // action logic
  }, [dependencies])

  // 4. Effects
  useEffect(() => {
    // side effects
    return () => {
      // cleanup
    }
  }, [dependencies])

  // 5. Return object with clear interface
  return {
    state,
    derivedValue,
    handleAction
  }
}
```

### 3. Dependency Management
- **Exhaustive deps** - ESLint rule must be enabled and followed
- **Stable references** - Use useCallback for functions passed as deps
- **Primitive values** - Prefer primitive deps over objects when possible
- **Custom comparators** - Use for complex dependency checking

### 4. Performance Considerations
- **Memoize expensive operations** - Use useMemo for computations
- **Stable callbacks** - useCallback for event handlers
- **Cleanup properly** - Always return cleanup functions in useEffect
- **Avoid excessive re-renders** - Split hooks if they cause unnecessary updates

## Individual Hook Documentation

### useAutoSave
**Purpose**: Automatically saves map state to localStorage with debouncing

**Rules**:
- Debounce delay: 2 seconds minimum
- Max history: 5 saves
- Storage key: Prefix with 'mapmaker_'
- Handle quota exceeded errors gracefully
- Clear old saves periodically

**Returns**:
```typescript
{
  lastSaved: Date | null
  isSaving: boolean
  saveNow: () => void
  clearSaves: () => void
}
```

### useCanvas
**Purpose**: Manages canvas container sizing and references

**Rules**:
- Use ResizeObserver for size tracking
- Debounce resize events (100ms)
- Provide stable refs
- Handle cleanup on unmount
- Account for pixel ratio

**Returns**:
```typescript
{
  containerRef: RefObject<HTMLDivElement>
  canvasSize: { width: number; height: number }
  pixelRatio: number
}
```

### useCanvasControls
**Purpose**: Handles pan, zoom, and navigation for the canvas

**Rules**:
- Zoom limits: 10% to 500%
- Zoom step: 10% increments
- Pan with middle mouse or Shift+drag
- Support touch gestures
- Maintain zoom center point
- Smooth animations for programmatic moves

**Returns**:
```typescript
{
  scale: number
  position: { x: number; y: number }
  handleWheel: (e: WheelEvent) => void
  handleMouseDown: (e: MouseEvent) => void
  handleMouseMove: (e: MouseEvent) => void
  handleMouseUp: () => void
  resetView: () => void
  zoomIn: () => void
  zoomOut: () => void
  centerView: () => void
  panTo: (x: number, y: number) => void
}
```

### useKeyboardShortcuts
**Purpose**: Global keyboard shortcut management

**Rules**:
- Prevent defaults for registered shortcuts
- Check for input focus (don't trigger in text fields)
- Support modifier keys (Ctrl, Shift, Alt)
- Register/unregister dynamically
- Handle key combinations
- Respect platform differences (Cmd vs Ctrl)

**Shortcuts Map**:
```typescript
{
  'v': 'select tool'
  'r': 'rectangle tool'
  'c': 'circle tool'
  't': 'token tool'
  'h': 'pan tool'
  'm': 'measure tool'
  'x': 'text tool'
  'e': 'eraser tool'
  'Delete': 'delete selected'
  'Escape': 'clear selection'
  'Ctrl+A': 'select all'
  'Ctrl+D': 'duplicate'
  'Ctrl+Z': 'undo'
  'Ctrl+Shift+Z': 'redo'
  'Ctrl+S': 'save'
  'Ctrl+O': 'open'
  'Ctrl+N': 'new map'
  '?': 'help'
  'F1': 'help'
}
```

## Hook Composition

### Composing Hooks
Hooks can use other hooks, but follow these rules:
1. Only call hooks at the top level
2. Don't call hooks conditionally
3. Extract common logic into shared hooks
4. Keep composed hooks focused

Example:
```typescript
function useMapEditor() {
  const { canvasSize } = useCanvas()
  const controls = useCanvasControls()
  const { saveNow } = useAutoSave()

  // Combine logic from multiple hooks
  return {
    ...controls,
    canvasSize,
    save: saveNow
  }
}
```

## Testing Hooks

### Testing Strategy
- Use @testing-library/react-hooks
- Test in isolation when possible
- Mock external dependencies (localStorage, etc.)
- Test cleanup functions
- Verify re-render behavior

### Test Pattern
```typescript
import { renderHook, act } from '@testing-library/react-hooks'

test('useHookName works correctly', () => {
  const { result } = renderHook(() => useHookName())

  act(() => {
    result.current.action()
  })

  expect(result.current.state).toBe(expected)
})
```

## Error Handling

### Error Boundaries
Hooks themselves can't catch errors, but they should:
- Return error states when applicable
- Use try-catch in async operations
- Provide error recovery methods
- Log errors appropriately

### Pattern:
```typescript
function useAsyncOperation() {
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(false)

  const execute = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // async operation
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [])

  return { execute, error, loading }
}
```

## Performance Optimization

### Optimization Techniques
1. **Debouncing** - For rapid fire events (resize, scroll, input)
2. **Throttling** - For consistent rate limiting
3. **Memoization** - For expensive computations
4. **Lazy initialization** - For expensive initial state
5. **Ref for mutable values** - Avoid unnecessary re-renders

### Anti-patterns to Avoid
- Creating new objects/arrays in render
- Inline function definitions in deps
- Missing dependencies in effects
- Not cleaning up subscriptions
- Excessive state splitting

## Future Hooks to Consider

### Potential Additions
- `useWebSocket` - For multiplayer support
- `useCloudSync` - For cloud storage
- `useAnimation` - For smooth transitions
- `useGestures` - For touch support
- `useHistory` - Enhanced undo/redo
- `useTheme` - For theme switching
- `useI18n` - For internationalization
- `useMeasure` - For element measurements
- `useDebounce` - Generic debouncing
- `useThrottle` - Generic throttling

## Hook Development Checklist

When creating a new hook:
- [ ] Named with 'use' prefix
- [ ] Clear return interface
- [ ] Proper TypeScript types
- [ ] Exhaustive dependencies
- [ ] Cleanup in effects
- [ ] Error handling
- [ ] Performance optimized
- [ ] Documented purpose and usage
- [ ] Unit tests written
- [ ] Added to this documentation