# Types Directory - TypeScript Type System

## Overview
This directory contains the complete TypeScript type system for the MapMaker application. All type definitions are centralized here to provide a single source of truth, eliminate duplication, and maintain strict type safety throughout the codebase.

## Directory Structure
```
types/
├── index.ts          # Barrel export file - import all types from here
├── geometry.ts       # Geometric primitives (Point, Rectangle, Circle, etc.)
├── map.ts           # Core map and object types
├── grid.ts          # Grid system types
├── token.ts         # D&D token types
├── timeline.ts      # Timeline and combat event types
├── spells.ts        # Spell effect types and templates
├── tools.ts         # Drawing tool types
├── stores.ts        # Zustand store type definitions
├── components.ts    # React component prop types
├── hooks.ts         # Custom hook parameter and return types
└── utils.ts         # Utility function types
```

## Core Type System Rules

### 1. Single Source of Truth
- **All types must be defined in `/src/types/`** - No type definitions in other directories
- **No duplicate type definitions** - Each type has exactly one canonical definition
- **Centralized geometric types** - Use `geometry.ts` for all spatial/mathematical types
- **Domain-based organization** - Group related types by business domain, not technical usage

### 2. Import Patterns
```typescript
// ✅ Correct - Always import from barrel export
import { MapObject, Token, Point, SpellEffect } from '@/types'

// ❌ Incorrect - No direct file imports
import { MapObject } from '@/types/map'
import { Token } from '@/types/token'

// ✅ Exception - Internal imports within types directory
// (Only within /src/types/ files themselves)
import { Point } from './geometry'
```

### 3. Type Declaration Style
```typescript
// ✅ Preferred - Use type declarations
export type MapObject = {
  id: string
  type: 'token' | 'shape' | 'spell'
  position: Point
}

// ✅ Composition via intersection
export type Token = MapObject & {
  type: 'token'
  size: TokenSize
  name: string
}

// ❌ Avoid - Interface declarations
interface MapObject {
  id: string
}

// ❌ Avoid - Interface extension
interface Token extends MapObject {
  size: TokenSize
}
```

### 4. No Any Types Policy
```typescript
// ✅ Specific types
export type StageRef = React.MutableRefObject<Konva.Stage | null>
export type EventHandler = (e: Konva.KonvaEventObject<MouseEvent>) => void

// ✅ Unknown for truly generic values
export type StorageValue = unknown
export type ValidationRule = (value: unknown) => boolean

// ❌ Never use any
export type BadRef = React.MutableRefObject<any>
export type BadHandler = (e: any) => void
```

## File-by-File Documentation

### geometry.ts - Geometric Primitives
**Purpose**: Centralized geometric types used throughout the application

**Key Types**:
- `Point` - Basic x,y coordinate
- `Size` - Width and height dimensions
- `Rectangle` - Point + Size for rectangular areas
- `Circle` - Point + radius for circular areas
- `Line` - Start and end points
- `Vector2D` - Alias for Point, used in mathematical contexts
- `Bounds` - Top, left, bottom, right boundaries
- `Transform` - Translation, rotation, and scale

**Usage**: Import geometric types from here, never redefine them
```typescript
import { Point, Rectangle } from '@/types'

// Use Point for all coordinate data
const tokenPosition: Point = { x: 100, y: 200 }

// Use Rectangle for all rectangular areas
const mapBounds: Rectangle = { x: 0, y: 0, width: 1920, height: 1080 }
```

### map.ts - Core Domain Types
**Purpose**: Central map and object type definitions

**Key Types**:
- `Position` - Alias for Point (backward compatibility)
- `MapObject` - Base type for all map objects
- `Shape` - Geometric shapes (rectangles, circles, polygons)
- `Text` - Text objects on the map
- `BattleMap` - Complete map structure
- `StaticObjectTemplate` - Template for placing static objects

**Type Hierarchy**:
```
MapObject (base)
├── Shape (geometric objects)
├── Token (game pieces) - defined in token.ts
├── Text (text labels)
└── Spell (effects) - defined in spells.ts
```

### token.ts - D&D Token System
**Purpose**: D&D 5e compliant token types

**Key Types**:
- `TokenSize` - D&D creature sizes (tiny through gargantuan)
- `Token` - Complete token definition extending MapObject
- `TokenTemplate` - Preset token configurations

**D&D 5e Size Mapping**:
- `tiny`: 0.5 grid squares (2.5 feet)
- `small/medium`: 1 grid square (5 feet)
- `large`: 2x2 grid squares (10 feet)
- `huge`: 3x3 grid squares (15 feet)
- `gargantuan`: 4x4 grid squares (20 feet)

### timeline.ts - Combat System
**Purpose**: D&D combat encounter management

**Key Types**:
- `Timeline` - Complete encounter timeline
- `Round` - Individual combat round
- `RoundEvent` - Events within rounds
- `EventData` - Union of all event data types
- `AnimationState` - Runtime animation tracking

**Event System**:
```
EventData = MoveEventData | AppearEventData | DisappearEventData | SpellEventData
```

Each event type has specific data structures for different animation needs.

### spells.ts - Spell Effect System
**Purpose**: D&D spell visual effects

**Key Types**:
- `SpellEffect` - Runtime spell effect state
- `SpellTemplate` - Predefined spell configurations
- `SpellAnimation` - Animation configuration
- `SpellSize` - Effect dimensions

**Spell Categories**:
- `area` - Area of effect spells (fireball, web)
- `line` - Linear effects (lightning bolt)
- `cone` - Cone-shaped effects (cone of cold)
- `wall` - Wall/barrier effects (wall of fire)

### tools.ts - Drawing Tools
**Purpose**: Map editor tool system

**Key Types**:
- `ToolType` - Available tools (select, rectangle, circle, etc.)
- `Tool` - Tool configuration with icons and shortcuts
- `DrawingState` - Active drawing operation state

**Drawing State Structure**:
```typescript
export type DrawingState = {
  isDrawing: boolean
  startPoint: Point | null      // Mouse down position
  currentPoint: Point | null    // Current mouse position
  points: Point[]              // For polygon/complex shapes
}
```

### stores.ts - State Management Types
**Purpose**: Zustand store type definitions

**Key Store Types**:
- `MapStore` - Map data and selection state
- `ToolStore` - Tool selection and drawing settings
- `RoundStore` - Timeline and combat state
- `AnimationStore` - Token animation coordination
- `EventCreationState` - Event creation workflow

**Store Pattern**:
```typescript
export type StoreType = {
  // State properties
  data: DataType

  // Action methods
  updateData: (data: Partial<DataType>) => void
  reset: () => void
}
```

### components.ts - React Component Types
**Purpose**: Component prop type definitions

**Key Types**:
- `MapCanvasProps` - Main canvas component props
- `ObjectsLayerProps` - Object rendering layer props
- `TokenProps` - Token component props
- `SpellComponentProps` - Spell effect component props

**Konva Integration**:
```typescript
export type KonvaEventHandler<T> = (e: Konva.KonvaEventObject<T>) => void
export type StageRef = React.MutableRefObject<Konva.Stage | null>
```

### hooks.ts - Hook Types
**Purpose**: Custom hook parameter and return types

**Key Types**:
- `UseCanvasControlsReturn` - Canvas control hook return type
- `UseTokenAnimationReturn` - Animation hook return type
- `UseKeyboardShortcutsProps` - Keyboard hook parameters

### utils.ts - Utility Types
**Purpose**: Utility function type definitions

**Key Categories**:
- **File Operations**: Import/export types
- **Validation**: Form validation and rules
- **Storage**: Local storage value types
- **Color**: Color format and manipulation types

## Type Safety Enforcement

### TypeScript Configuration
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noImplicitThis": true
  }
}
```

### ESLint Rules
```javascript
{
  "@typescript-eslint/no-explicit-any": "error",
  "@typescript-eslint/no-unsafe-any": "error",
  "@typescript-eslint/prefer-unknown-to-any": "error"
}
```

## Development Patterns

### Adding New Types
1. **Determine Domain**: Which file should contain the new type?
2. **Check Dependencies**: Does it need existing types?
3. **Add to Appropriate File**: Follow domain organization
4. **Export in index.ts**: Add to barrel exports
5. **Update Documentation**: Document the new type's purpose

### Type Composition
```typescript
// ✅ Use intersection for composition
export type AnimatedToken = Token & {
  animation: AnimationState
  isAnimating: boolean
}

// ✅ Use union for variants
export type MapEvent = MoveEvent | SpellEvent | AppearEvent
```

### Type Guards
```typescript
// Co-locate type guards with their types
export const isToken = (obj: MapObject): obj is Token => obj.type === 'token'
export const isSpell = (obj: MapObject): obj is SpellEffect => obj.type === 'spell'
```

## Migration Guidelines

### When Changing Types
1. **Assess Impact**: Check all usage locations
2. **Create Migration**: Add conversion functions if needed
3. **Update Incrementally**: Change one module at a time
4. **Run Tests**: Verify no runtime breakage
5. **Update Documentation**: Keep docs current

### Backward Compatibility
```typescript
// ✅ Provide aliases during migration
export type Position = Point  // Legacy alias
export type { Point as Coordinate }  // Alternative name
```

## Common Pitfalls

### ❌ Anti-Patterns to Avoid
```typescript
// Don't scatter types in random files
// src/components/SomeComponent.tsx
export interface ComponentProps { ... }  // ❌

// Don't use any types
export type Handler = (data: any) => void  // ❌

// Don't create circular dependencies
// types/a.ts imports types/b.ts imports types/a.ts  // ❌

// Don't duplicate geometric types
export type Point = { x: number; y: number }  // ❌ (use geometry.ts)
```

### ✅ Best Practices
```typescript
// Centralize all types
// src/types/components.ts
export type ComponentProps = { ... }  // ✅

// Use specific types
export type Handler = (data: EventData) => void  // ✅

// Use barrel imports
import { Point, Token, SpellEffect } from '@/types'  // ✅
```

## Performance Considerations

### Tree Shaking
- Barrel exports are optimized for tree shaking
- Only imported types are included in bundle
- TypeScript performs compile-time elimination

### Build Performance
- Centralized types improve TypeScript compilation speed
- No circular dependency resolution overhead
- Clear dependency graph enables parallel checking

## Validation Integration

### Runtime Type Checking
```typescript
import { z } from 'zod'

// Define Zod schemas alongside types
export const PointSchema = z.object({
  x: z.number(),
  y: z.number()
})

export type Point = z.infer<typeof PointSchema>
```

### Type Guards
```typescript
// Provide type guards for complex unions
export const isSpellEffect = (obj: unknown): obj is SpellEffect => {
  return typeof obj === 'object' &&
         obj !== null &&
         'type' in obj &&
         obj.type === 'spell'
}
```

This type system provides a robust foundation for the MapMaker application with excellent developer experience, compile-time safety, and runtime reliability.