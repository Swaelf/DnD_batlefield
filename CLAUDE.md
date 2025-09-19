# MapMaker - D&D Battle Map Editor

## Project Overview

MapMaker is a web-based battle map editor designed for Dungeons & Dragons (D&D) and other tabletop RPGs. The application allows users to create, edit, and manage battle maps with grid systems, tokens, and various map objects.

## Technology Stack

### Core Technologies
- **React 19.1.1** - UI framework
- **TypeScript 5.8.3** - Type-safe JavaScript
- **Vite 7.1.6** - Build tool and dev server
- **Zustand 5.0.8** - State management
- **Immer 10.1.3** - Immutable state updates

### UI Libraries
- **Konva 10.0.2 & React-Konva 19.0.10** - Canvas rendering for map editor
- **Tailwind CSS 3** - Utility-first CSS framework
- **Radix UI** - Headless UI components (context menu, select, slider, toolbar, tooltip)
- **Lucide React** - Icon library
- **React Colorful 5.6.1** - Color picker component

### Utilities
- **react-hotkeys-hook 5.1.0** - Keyboard shortcuts
- **file-saver 2.0.5** - File download utilities
- **uuid 13.0.0** - Unique ID generation
- **nanoid 5.1.5** - URL-safe unique ID generation
- **clsx 2.1.1 & tailwind-merge 3.3.1** - CSS class utilities

## Project Structure

```
MapMaker/
├── src/
│   ├── App.tsx              # Main application component
│   ├── main.tsx            # Application entry point
│   ├── assets/             # Static assets
│   ├── hooks/              # Custom React hooks
│   │   ├── useAutoSave.ts
│   │   ├── useCanvas.ts
│   │   └── useKeyboardShortcuts.ts
│   ├── store/              # Zustand state stores
│   │   ├── mapStore.ts     # Map state management
│   │   ├── historyStore.ts # Undo/redo functionality (placeholder)
│   │   └── uiStore.ts      # UI state (placeholder)
│   ├── types/              # TypeScript type definitions
│   │   ├── index.ts
│   │   ├── map.ts          # Map-related types
│   │   ├── grid.ts
│   │   └── token.ts
│   └── utils/              # Utility functions
│       ├── canvas.ts
│       ├── export.ts
│       └── grid.ts
├── public/                 # Public assets
├── .claude/               # Claude AI configuration
└── Configuration files
```

## Key Features & Components

### 1. Map Management (mapStore.ts)
The core state management for maps using Zustand with Immer middleware:

**State:**
- `currentMap`: Active BattleMap object
- `selectedObjects`: Array of selected object IDs
- `tool`: Current selected tool (select/token/shape/measure)

**Actions:**
- `createNewMap(name)`: Creates new map with default settings
- `addObject(object)`: Adds object to current map
- `selectObject(id)`: Selects object by ID
- `deleteSelected()`: Removes selected objects
- `setTool(tool)`: Changes active tool

### 2. Data Models

**BattleMap:**
```typescript
{
  id: string
  name: string
  width: number (default: 1920)
  height: number (default: 1080)
  grid: GridSettings
  objects: MapObject[]
}
```

**GridSettings:**
```typescript
{
  size: number (pixels per cell, default: 50)
  type: 'square' | 'hex'
  visible: boolean
  snap: boolean
  color: string
}
```

**MapObject:**
Base type for all map objects with properties:
- `id`: Unique identifier
- `type`: 'token' | 'shape' | 'tile'
- `position`: {x, y} coordinates
- `rotation`: Angle in degrees
- `layer`: Z-order layer number

**Token:** (extends MapObject)
- `size`: D&D creature sizes (tiny/small/medium/large/huge/gargantuan)
- `image`: Token image URL
- `name`: Token display name

### 3. Application Layout (App.tsx)

The main layout consists of three sections:
1. **Left Toolbar (16px)**: Tool selection panel
2. **Center Canvas (flex-1)**: Main map editing area
3. **Right Sidebar (320px)**: Object properties panel

### 4. Theming & Styling

**D&D Theme Colors:**
- Red: `#922610` (classic D&D red)
- Gold: `#C9AD6A` (accent color)
- Black: `#1A1A1A` (dark backgrounds)
- Gray scale: 9 levels from `#171717` to `#F5F5F5`

**Font:**
- Primary: Scala Sans (D&D-style font)
- Fallback: system-ui, sans-serif

### 5. Development Configuration

**Path Aliases:**
- `@/` → `./src/`
- `@components/` → `./src/components/`
- `@store/` → `./src/store/`
- `@types/` → `./src/types/`
- `@utils/` → `./src/utils/`
- `@hooks/` → `./src/hooks/`
- `@assets/` → `./src/assets/`

**Build Configuration:**
- Dev server: Port 3000, network accessible
- Source maps enabled
- Code splitting for vendor libraries:
  - react-vendor: React core
  - konva-vendor: Canvas library
  - ui-vendor: Radix UI components

## Current Implementation Status

### ✅ Completed
- Basic project structure
- TypeScript configuration
- Tailwind CSS with D&D theme
- Zustand store setup
- Map data model
- Basic app layout skeleton

### 🚧 In Progress
- Canvas implementation (hooks prepared but empty)
- Keyboard shortcuts (hook structure ready)
- Auto-save functionality (hook structure ready)

### 📋 Planned Features
- History/Undo system (historyStore.ts placeholder)
- UI state management (uiStore.ts placeholder)
- Token management
- Shape drawing tools
- Grid rendering and snapping
- Map export functionality
- File save/load operations

## Development Commands

```bash
# Install dependencies (using pnpm)
pnpm install

# Start development server
pnpm dev

# Type checking
pnpm type-check

# Linting
pnpm lint

# Build for production
pnpm build

# Preview production build
pnpm preview

# Clean and reinstall
pnpm clean:install

# Update dependencies interactively
pnpm update:deps
```

## Type System Architecture

The MapMaker project uses a **unified TypeScript type system** with strict rules and centralized organization. This system eliminates type duplication, enforces consistency, and provides excellent developer experience.

### Type System Rules

1. **Single Source of Truth**: All types live in `/src/types/` directory - no scattered type files
2. **Barrel Imports**: Always import from `@/types` using the index.ts barrel export
3. **Domain Organization**: Types organized by business domain (map, tokens, spells) not technical usage
4. **No Any Types**: Strict `any` prohibition with ESLint enforcement
5. **Type Over Interface**: Use `type` declarations with intersection (`&`) for composition
6. **Geometric Centralization**: All spatial types (Point, Rectangle, Circle) in `geometry.ts`

### Import Examples

```typescript
// ✅ Correct - Barrel import
import { MapObject, Token, Point, SpellEffect } from '@/types'

// ❌ Incorrect - Direct file imports
import { MapObject } from '@/types/map'

// ✅ Type composition via intersection
export type AnimatedToken = Token & {
  isAnimating: boolean
  animationPath: Point[]
}
```

### Key Type Categories

- **geometry.ts**: Point, Rectangle, Circle, Line, Vector2D
- **map.ts**: BattleMap, MapObject, Shape, Text
- **token.ts**: Token, TokenSize, TokenTemplate
- **spells.ts**: SpellEffect, SpellTemplate, SpellAnimation
- **timeline.ts**: Timeline, Round, RoundEvent, EventData
- **stores.ts**: MapStore, ToolStore, RoundStore, AnimationStore

## Architecture Notes

1. **State Management**: Using Zustand with Immer for immutable updates, providing a clean API for complex state modifications.

2. **Canvas Rendering**: Konva.js chosen for its powerful 2D canvas capabilities and React integration, ideal for interactive map editing.

3. **Type Safety**: Strict TypeScript configuration ensures type safety across the application.

4. **Type Declarations**: Always prefer `type` declarations over `interface` declarations throughout the codebase. Use type intersection (`&`) instead of interface extension (`extends`) for composing types. This provides better consistency and works well with discriminated unions.

5. **No Any Types**: Never use `any` types in production code. Use specific types, `unknown` for truly generic values, or proper type unions/intersections. The ESLint configuration enforces this with `@typescript-eslint/no-explicit-any`. Use proper Konva types (`Konva.Stage`, `Konva.Node`, etc.) for canvas-related code.

6. **Unified Type System**: All TypeScript types are centralized in `/src/types/` directory with strict organization rules:
   - **Single Source of Truth**: All type definitions live in `/src/types/` - no scattered type files
   - **Domain Organization**: Types organized by domain (geometry, map, spells, etc.) not by usage
   - **Barrel Exports**: Always import from `@/types` using the index.ts barrel export
   - **No Circular Dependencies**: Types follow a unidirectional dependency graph
   - **Geometric Primitives**: Use centralized geometric types from `geometry.ts` (Point, Rectangle, Circle, etc.)
   - **Type Over Interface**: Use `type` declarations exclusively, with intersection (`&`) for composition
   - **Konva Integration**: Proper Konva types (`Konva.Stage`, `Konva.KonvaEventObject<T>`) for canvas code
   - **Strict Enforcement**: ESLint and TypeScript strict mode prevent type system violations

7. **Component Architecture**: Currently monolithic in App.tsx, ready to be split into smaller components as features are implemented.

8. **Hooks Pattern**: Custom hooks prepared for separation of concerns (canvas logic, keyboard handling, auto-save).

## Next Steps for Development

1. **Implement Canvas Component**: Create the main map canvas using React-Konva
2. **Grid System**: Implement grid rendering and snapping logic
3. **Token System**: Add token placement and management
4. **Tool Implementation**: Build select, token, shape, and measure tools
5. **Property Panel**: Create UI for editing selected objects
6. **Save/Load**: Implement map serialization and file operations
7. **Keyboard Shortcuts**: Add hotkeys for common operations
8. **History System**: Implement undo/redo functionality

## Technical Debt & Considerations

- Empty hook files need implementation
- Component extraction needed from App.tsx
- Error boundaries should be added
- Loading states need to be implemented
- Performance optimization for large maps pending
- Accessibility features to be added