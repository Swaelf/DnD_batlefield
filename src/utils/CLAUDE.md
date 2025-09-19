# Utils Directory

## Overview
Utility functions and helpers that provide reusable functionality across the MapMaker application. Pure functions with no side effects.

## Directory Structure
```
utils/
├── canvas.ts    # Canvas rendering and manipulation utilities
├── export.ts    # File export/import functionality
└── grid.ts      # Grid calculations and snapping logic
```

## Utility Function Rules & Guidelines

### 1. General Principles
- **Pure functions only** - No side effects, same input = same output
- **Single responsibility** - Each function does one thing well
- **Explicit types** - All parameters and returns fully typed
- **No external dependencies** - Utils shouldn't depend on stores or components
- **Defensive programming** - Validate inputs, handle edge cases

### 2. Function Naming Conventions
- **Verb prefixes** - Start with action verb (calculate, convert, format, validate)
- **Descriptive names** - Clear about what function does
- **Camel case** - e.g., `calculateDistance`, `snapToGrid`
- **Boolean returns** - Prefix with is/has/can (e.g., `isValidColor`)

### 3. Organization Patterns
```typescript
// Group related functions together
// Canvas utilities
export function clearCanvas(ctx: CanvasRenderingContext2D): void { }
export function drawGrid(ctx: CanvasRenderingContext2D, settings: GridSettings): void { }

// Conversion utilities
export function pixelsToGrid(pixels: number, gridSize: number): number { }
export function gridToPixels(grid: number, gridSize: number): number { }

// Validation utilities
export function isValidHexColor(color: string): boolean { }
export function isWithinBounds(point: Point, bounds: Rectangle): boolean { }
```

## Individual Utility Documentation

### canvas.ts - Canvas Utilities

**Purpose**: Canvas rendering, transformation, and manipulation functions

**Key Functions**:

```typescript
/**
 * Clear and reset canvas context
 */
export function clearCanvas(ctx: CanvasRenderingContext2D): void

/**
 * Convert screen coordinates to canvas coordinates
 */
export function screenToCanvas(
  point: Point,
  scale: number,
  offset: Point
): Point

/**
 * Convert canvas coordinates to screen coordinates
 */
export function canvasToScreen(
  point: Point,
  scale: number,
  offset: Point
): Point

/**
 * Draw a grid on the canvas
 */
export function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  gridSize: number,
  color: string,
  lineWidth: number
): void

/**
 * Calculate bounding box for multiple objects
 */
export function calculateBounds(objects: MapObject[]): Rectangle

/**
 * Check if point is inside shape
 */
export function pointInShape(
  point: Point,
  shape: Shape
): boolean

/**
 * Calculate distance between two points
 */
export function distance(p1: Point, p2: Point): number

/**
 * Calculate angle between two points in degrees
 */
export function angle(from: Point, to: Point): number

/**
 * Rotate point around origin
 */
export function rotatePoint(
  point: Point,
  origin: Point,
  degrees: number
): Point

/**
 * Apply transformation matrix to point
 */
export function transformPoint(
  point: Point,
  matrix: DOMMatrix
): Point
```

**Rules**:
- Always save/restore context state when modifying
- Use requestAnimationFrame for animations
- Handle high DPI displays with devicePixelRatio
- Clear sub-pixel rendering with translate(0.5, 0.5)
- Batch draw operations for performance

### grid.ts - Grid System Utilities

**Purpose**: Grid calculations, snapping, and hex grid math

**Key Functions**:

```typescript
/**
 * Snap point to nearest grid intersection
 */
export function snapToGrid(
  point: Point,
  gridSize: number,
  enabled: boolean = true
): Point

/**
 * Calculate grid cell from point
 */
export function pointToGridCell(
  point: Point,
  gridSize: number
): GridCell

/**
 * Get center point of grid cell
 */
export function gridCellCenter(
  cell: GridCell,
  gridSize: number
): Point

/**
 * Convert pixels to grid units (D&D squares/hexes)
 */
export function pixelsToGridUnits(
  pixels: number,
  gridSize: number
): number

/**
 * Convert grid units to feet (D&D 5ft squares)
 */
export function gridUnitsToFeet(
  units: number,
  scale: number = 5
): number

/**
 * Calculate hex grid coordinates
 */
export function pixelToHex(
  point: Point,
  hexSize: number
): HexCoordinate

/**
 * Get hex center from coordinates
 */
export function hexToPixel(
  hex: HexCoordinate,
  hexSize: number
): Point

/**
 * Get neighboring hex cells
 */
export function hexNeighbors(
  hex: HexCoordinate
): HexCoordinate[]

/**
 * Calculate line of sight on grid
 */
export function calculateLineOfSight(
  from: GridCell,
  to: GridCell,
  obstacles: GridCell[]
): boolean

/**
 * Calculate movement path on grid
 */
export function calculatePath(
  start: GridCell,
  end: GridCell,
  gridSize: number,
  diagonal: boolean = true
): GridCell[]
```

**Grid Math Constants**:
```typescript
const SQRT_3 = Math.sqrt(3)
const HEX_ANGLES = [0, 60, 120, 180, 240, 300]
const DIAGONAL_COST = Math.sqrt(2)
```

**Rules**:
- Snap tolerance is 40% of grid size
- Hex grids use flat-top orientation
- Diagonal movement costs 1.5 squares (D&D 5e)
- Grid coordinates are zero-indexed
- Always validate grid boundaries

### export.ts - Import/Export Utilities

**Purpose**: File operations, serialization, and data conversion

**Key Functions**:

```typescript
/**
 * Export map as JSON file
 */
export function exportMapAsJSON(
  map: BattleMap,
  filename?: string
): void

/**
 * Import map from JSON file
 */
export function importMapFromJSON(
  file: File
): Promise<BattleMap>

/**
 * Export map as PNG image
 */
export function exportMapAsPNG(
  canvas: HTMLCanvasElement,
  filename?: string,
  quality?: number
): void

/**
 * Export visible viewport as image
 */
export function exportViewportAsPNG(
  stage: Konva.Stage,
  filename?: string
): void

/**
 * Create campaign file with multiple maps
 */
export function exportCampaign(
  maps: BattleMap[],
  metadata: CampaignMetadata
): Blob

/**
 * Import campaign file
 */
export function importCampaign(
  file: File
): Promise<Campaign>

/**
 * Validate map data structure
 */
export function validateMapData(
  data: unknown
): data is BattleMap

/**
 * Compress map data for storage
 */
export function compressMapData(
  map: BattleMap
): string

/**
 * Decompress stored map data
 */
export function decompressMapData(
  data: string
): BattleMap

/**
 * Generate unique filename
 */
export function generateFilename(
  baseName: string,
  extension: string
): string

/**
 * Convert base64 to blob
 */
export function base64ToBlob(
  base64: string,
  mimeType: string
): Blob

/**
 * Sanitize filename for saving
 */
export function sanitizeFilename(
  filename: string
): string
```

**File Format Specs**:
```typescript
interface MapFile {
  version: string     // Format version
  created: number     // Timestamp
  modified: number    // Timestamp
  map: BattleMap      // Map data
  thumbnail?: string  // Base64 preview
}
```

**Rules**:
- Always validate imported data
- Use semantic versioning for format versions
- Handle large files with streaming/chunks
- Compress images before export
- Sanitize filenames for OS compatibility
- Include metadata for tracking

## Utility Patterns

### Error Handling
```typescript
export function safeParseJSON<T>(
  json: string,
  fallback: T
): T {
  try {
    return JSON.parse(json)
  } catch {
    console.error('Failed to parse JSON')
    return fallback
  }
}
```

### Validation
```typescript
export function isValidHexColor(color: string): boolean {
  return /^#[0-9A-F]{6}$/i.test(color)
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}
```

### Memoization
```typescript
const memoize = <T extends (...args: any[]) => any>(fn: T): T => {
  const cache = new Map()
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args)
    if (!cache.has(key)) {
      cache.set(key, fn(...args))
    }
    return cache.get(key)
  }) as T
}

export const expensiveCalculation = memoize(calculateComplexValue)
```

### Debouncing
```typescript
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}
```

### Throttling
```typescript
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): T {
  let lastCall = 0
  return ((...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastCall >= limit) {
      lastCall = now
      return fn(...args)
    }
  }) as T
}
```

## Performance Utilities

### Batch Processing
```typescript
export async function processBatch<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  batchSize: number = 10
): Promise<R[]> {
  const results: R[] = []
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const batchResults = await Promise.all(batch.map(processor))
    results.push(...batchResults)
  }
  return results
}
```

### Object Pooling
```typescript
class ObjectPool<T> {
  private pool: T[] = []
  private create: () => T
  private reset: (obj: T) => void

  constructor(create: () => T, reset: (obj: T) => void) {
    this.create = create
    this.reset = reset
  }

  acquire(): T {
    return this.pool.pop() || this.create()
  }

  release(obj: T): void {
    this.reset(obj)
    this.pool.push(obj)
  }
}
```

## Testing Utilities

### Test Helpers
```typescript
export function createMockMap(overrides?: Partial<BattleMap>): BattleMap {
  return {
    id: 'test-map',
    name: 'Test Map',
    width: 1920,
    height: 1080,
    objects: [],
    ...overrides
  }
}

export function createMockToken(overrides?: Partial<Token>): Token {
  return {
    id: 'test-token',
    type: 'token',
    position: { x: 0, y: 0 },
    // ... other defaults
    ...overrides
  }
}
```

## Common Algorithms

### Collision Detection
```typescript
export function rectanglesIntersect(r1: Rectangle, r2: Rectangle): boolean {
  return !(
    r1.x + r1.width < r2.x ||
    r2.x + r2.width < r1.x ||
    r1.y + r1.height < r2.y ||
    r2.y + r2.height < r1.y
  )
}

export function circlesIntersect(c1: Circle, c2: Circle): boolean {
  const dx = c1.x - c2.x
  const dy = c1.y - c2.y
  const distance = Math.sqrt(dx * dx + dy * dy)
  return distance < c1.radius + c2.radius
}
```

### Path Finding (A* for grid)
```typescript
export function findPath(
  start: GridCell,
  goal: GridCell,
  grid: Grid,
  obstacles: Set<string>
): GridCell[] {
  // A* implementation
  // Returns optimal path or empty array
}
```

## Utility Development Checklist

When creating new utilities:
- [ ] Pure function (no side effects)
- [ ] Fully typed parameters and return
- [ ] Documented with JSDoc
- [ ] Handle edge cases
- [ ] Unit tests written
- [ ] Performance considered
- [ ] No external dependencies
- [ ] Exported from file
- [ ] Added to documentation
- [ ] Example usage provided