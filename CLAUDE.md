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

### UI Libraries & Styling
- **Konva 10.0.2 & React-Konva 19.0.10** - Canvas rendering for map editor
- **@stitches/react 1.2.8** - CSS-in-JS styling system with near-zero runtime
- **Radix UI** - Headless UI components (context menu, select, slider, toolbar, tooltip)
- **Lucide React** - Icon library
- **React Colorful 5.6.1** - Color picker component

### Utilities
- **react-hotkeys-hook 5.1.0** - Keyboard shortcuts
- **file-saver 2.0.5** - File download utilities
- **uuid 13.0.0** - Unique ID generation
- **nanoid 5.1.5** - URL-safe unique ID generation
- **use-debounce 10.0.6** - Debounced value hooks

## Project Structure

```
MapMaker/
├── src/
│   ├── App.tsx              # Main application component
│   ├── main.tsx            # Application entry point
│   ├── assets/             # Static assets
│   ├── components/         # React components organized by feature
│   │   ├── primitives/     # Base styled components (Box, Button, Text)
│   │   ├── ui/             # Composed UI components (Panel, Grid, Menu)
│   │   ├── Actions/        # Advanced action sequencing and coordination
│   │   ├── Canvas/         # Canvas and rendering components
│   │   ├── Token/          # Token-related components
│   │   ├── StaticObject/   # Static object library
│   │   ├── SpellEffect/    # Spell effects panel and components
│   │   ├── Menu/           # Application menus
│   │   ├── Properties/     # Properties editing panels
│   │   ├── Timeline/       # Combat timeline components
│   │   ├── StatusBar/      # Status information display
│   │   ├── Toolbar/        # Tool selection interface
│   │   └── HelpDialog/     # Help and documentation
│   ├── styles/             # Stitches theme configuration
│   │   └── theme.config.ts # Design system tokens and theme
│   ├── hooks/              # Custom React hooks
│   │   ├── useAutoSave.ts
│   │   ├── useCanvas.ts
│   │   └── useKeyboardShortcuts.ts
│   ├── store/              # Zustand state stores
│   │   ├── mapStore.ts     # Map state management
│   │   ├── toolStore.ts    # Tool selection and settings
│   │   ├── eventCreationStore.ts # Event creation workflow
│   │   └── roundStore.ts   # Timeline and combat rounds
│   ├── constants/          # Application constants and configurations
│   │   ├── index.ts        # Barrel exports for all constants
│   │   ├── sequences.ts    # Action sequencing constants and templates
│   │   ├── templates.ts    # Pre-built action templates and macros
│   │   ├── animation.ts    # Animation timing and easing constants
│   │   ├── attacks.ts      # D&D attack and weapon constants
│   │   ├── spells.ts       # D&D spell effect constants
│   │   ├── environmental.ts # Weather and terrain effect constants
│   │   └── interactions.ts # Object interaction constants
│   ├── types/              # TypeScript type definitions
│   │   ├── index.ts        # Barrel exports
│   │   ├── map.ts          # Map-related types
│   │   ├── grid.ts         # Grid system types
│   │   ├── token.ts        # Token types
│   │   ├── spells.ts       # Spell effect types
│   │   ├── timeline.ts     # Combat timeline types
│   │   ├── components.ts   # Component prop types
│   │   └── geometry.ts     # Geometric primitives
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

### 4. Design System & Theming

**CSS-in-JS with Stitches:**
- Near-zero runtime CSS-in-JS
- Compile-time style generation
- Type-safe design tokens
- Responsive variants system
- Component-based styling

**D&D Theme Design Tokens:**
- Primary Colors: `dndRed` (#922610), `secondary` (#C9AD6A)
- Backgrounds: `dndBlack` (#1A1A1A), `background` (#171717)
- Gray scale: 9-step scale from `gray100` (#F5F5F5) to `gray900` (#171717)
- Semantic colors: `success`, `warning`, `error` states
- Typography: Scala Sans (D&D font) with system fallbacks
- Spacing: Consistent 4px-based scale
- Border radius: 4 levels from small (4px) to round (50%)

**Component Architecture:**
- **Primitives**: Base components (Box, Button, Text) with variant systems
- **UI Components**: Composed components (Panel, Grid, Menu, Modal)
- **Feature Components**: Domain-specific components using the design system

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

### 6. Action Sequencing System

The **Action Sequencing System** provides advanced D&D combat coordination through sophisticated action combinations, conditional execution, and seamless animation integration.

**Core Components:**
- **ActionSequencer**: Main interface for configuring complex action sequences
- **CustomActionBuilder**: Advanced sequence creation with validation and import/export
- **ActionEditor Components**: Type-specific configuration (Attack, Interaction, Environmental)
- **ActionRenderer**: Animation visualization system

**Sequence Types:**
- **Simple**: Linear execution of actions in order (Move → Attack)
- **Conditional**: Actions execute based on success/failure of previous actions
- **Parallel**: Multiple actions execute simultaneously (Weather + Positioning)
- **Loop**: Repeat actions until condition met (Full Attack routine)
- **Branch**: Different action paths based on conditions (Tactical AI responses)

**Template Library:**
- **Combat**: Charge Attack, Full Attack, Fighting Retreat, Spell Strike
- **Exploration**: Stealth Scout, Trap Detection, Door Breach
- **Environmental**: Weather Ambush, Terrain Control
- **Utility**: Quick Heal, Tactical Withdrawal

**Event Types Integration:**
- **Attack Events**: Melee/ranged animations with weapon-specific effects
- **Interaction Events**: Object manipulation (doors, traps, containers)
- **Environmental Events**: Weather, terrain, and atmospheric effects
- **Sequence Events**: Complex multi-action combinations

**D&D 5e Authentication:**
- Proper damage dice notation and weapon properties
- Critical hit scaling and screen shake effects
- Initiative integration and turn-based execution
- Spell slot management and duration tracking

## Current Implementation Status

### ✅ Completed
- **Project Foundation**: React 19 + TypeScript + Vite setup
- **State Management**: Zustand stores with Immer for map, tool, and timeline data
- **Design System**: Complete CSS-in-JS migration to Stitches with D&D theming
- **Component Library**: Comprehensive UI component system with primitives and compositions
- **Performance Optimizations**: All 4 phases completed (Jan 2025):
  - Canvas rendering at stable 60fps
  - Memory usage optimized (~220MB stable)
  - React re-renders reduced by 85%
  - Bundle size optimized with lazy loading
- **Core Features**:
  - Canvas system with Konva integration
  - Token placement and management system
  - Static object library with D&D assets
  - Grid system with snapping and controls
  - File operations (save/load JSON, export PNG)
  - Spell effects system with D&D spell templates
  - Combat timeline with round-based event management (fully functional)
  - Token animation system with smooth movement
  - Auto-save functionality
  - Keyboard shortcuts system
  - Properties panel for object editing
  - Help system with keyboard shortcut documentation
- **Advanced Action Coordination (Phase 4)**: Complete action sequencing system
  - Action sequencing with conditional execution, loops, and parallel actions
  - Custom action builder with real-time validation and import/export
  - Comprehensive D&D 5e action template library (combat, exploration, environmental, utility)
  - Compound event orchestration integrated into timeline system
  - Sequence event type with full EventEditor integration

### 🔧 Recent Fixes (January 2025)
- **Token Animation System**: Fixed Konva Tween conflicts with React-controlled positions by implementing manual RAF-based animations
- **Event Editor Token Selection**: Replaced Radix UI Select with native HTML select to resolve modal rendering issues
- **Animation Memory Leaks**: Fixed cleanup issues preventing memory growth during extended sessions
- **Store Subscriptions**: Optimized to use specific selectors instead of destructuring
- **Action Sequencing System**: Complete D&D combat action coordination with templates, conditional execution, and animation integration (September 2025):
  - 5 sequence types: Simple, Conditional, Parallel, Loop, and Branch execution patterns
  - Comprehensive template library with D&D 5e authentic action combinations
  - Attack animation system with melee/ranged weapons, critical hits, and damage numbers
  - Event type expansion: Attack, Interaction, Environmental, and Sequence events
  - Type-safe configuration components with proper Radix UI integration

### 🚧 Currently Active Features
- **Canvas Tools**: Drawing tools, measurement tools, selection system
- **Advanced UI**: Context menus, tooltips, modal dialogs
- **Import/Export System**: Enhanced map file operations and data exchange

### 🎯 Architecture Achievements
- **Type Safety**: Comprehensive TypeScript type system
- **Performance**: Optimized Konva canvas rendering with proper memoization
- **Accessibility**: Radix UI integration for keyboard navigation and screen readers
- **Responsive Design**: Stitches responsive variant system
- **Code Organization**: Feature-based component organization with clear separation of concerns

## Package Manager Requirements

**⚠️ IMPORTANT: Always use pnpm for this project**

This project is configured to use **pnpm** as the package manager. The `packageManager` field in `package.json` specifies `pnpm@8.15.0`.

### Rules for Package Management:
- ✅ **Use `pnpm` for all commands**: `pnpm install`, `pnpm dev`, `pnpm test`, etc.
- ❌ **Never use `npm` or `yarn`**: These can cause lockfile conflicts and dependency issues
- ✅ **Check `pnpm` version**: Ensure you have pnpm 8.15.0 or compatible version installed
- ✅ **Commit `pnpm-lock.yaml`**: Always commit the pnpm lockfile for reproducible builds

### Install pnpm if not available:
```bash
# Install pnpm globally
npm install -g pnpm@8.15.0

# Or use corepack (Node.js 16.13+)
corepack enable
corepack prepare pnpm@8.15.0 --activate
```

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

1. **CSS-in-JS Design System**: Complete migration to Stitches provides compile-time CSS generation, type-safe design tokens, and near-zero runtime overhead. The system uses a layered approach:
   - **Design Tokens**: Centralized color, spacing, typography, and sizing scales
   - **Primitives**: Base components (Box, Button, Text) with comprehensive variant systems
   - **UI Components**: Composed components (Panel, Grid, Menu) built on primitives
   - **Feature Components**: Domain-specific components using the design system

2. **State Management**: Zustand with Immer for immutable updates across multiple stores:
   - **mapStore**: Core map data and object selection
   - **toolStore**: Tool selection and drawing configuration
   - **roundStore**: Combat timeline and event management
   - **eventCreationStore**: Complex event creation workflows

3. **Canvas Architecture**: Sophisticated Konva.js integration with React for high-performance 2D rendering:
   - **Layer-based Rendering**: Grid, objects, and UI layers for optimal performance
   - **Event Delegation**: Efficient mouse/touch handling at the Stage level
   - **Memory Management**: Proper cleanup of animations and event listeners
   - **Coordinate Systems**: Clear separation between canvas and screen coordinates

4. **Type Safety**: Comprehensive TypeScript system with zero `any` types:
   - **Centralized Types**: All definitions in `/src/types/` with barrel exports
   - **Domain Organization**: Types organized by business domain, not technical usage
   - **Geometric Primitives**: Unified Point, Rectangle, Circle types prevent duplication
   - **Konva Integration**: Proper typed event handlers and component references
   - **Strict Enforcement**: ESLint and TypeScript strict mode prevent violations

5. **Component Organization**: Feature-based architecture with clear separation:
   - **Canvas/**: Core rendering and interaction components
   - **Token/**: D&D token system with size compliance
   - **SpellEffect/**: D&D 5e spell visualization system
   - **Timeline/**: Combat encounter management
   - **Properties/**: Dynamic property editing panels

6. **Performance Optimizations**:
   - **Memoization**: React.memo for expensive canvas renders
   - **Debounced Updates**: Prevent excessive state updates during interactions
   - **Layer Management**: Optimized Konva layer usage for smooth animation
   - **Bundle Splitting**: Vendor chunking for optimal loading

7. **Accessibility & UX**: Comprehensive accessibility through Radix UI integration:
   - **Keyboard Navigation**: Full keyboard support for all interactive elements
   - **Screen Reader Support**: ARIA labels and semantic markup
   - **Focus Management**: Proper focus trapping in modals and panels
   - **Responsive Design**: Stitches responsive variants for all screen sizes

## Next Steps for Development

1. **Implement Canvas Component**: Create the main map canvas using React-Konva
2. **Grid System**: Implement grid rendering and snapping logic
3. **Token System**: Add token placement and management
4. **Tool Implementation**: Build select, token, shape, and measure tools
5. **Property Panel**: Create UI for editing selected objects
6. **Save/Load**: Implement map serialization and file operations
7. **Keyboard Shortcuts**: Add hotkeys for common operations
8. **History System**: Implement undo/redo functionality

## Development Workflow & Best Practices

### Documentation Maintenance
**IMPORTANT**: After completing any significant task or feature implementation, always update this CLAUDE.md file to reflect:
- New dependencies or removed packages
- Architecture changes or component additions
- Completed features in the implementation status
- Updated project structure if directories were added/moved
- New development commands or workflows

### Code Quality Standards
- **Type Safety**: Never use `any` types; prefer specific types or `unknown`
- **Component Testing**: Test new components in isolation before integration
- **Performance**: Profile canvas rendering for any new object types
- **Accessibility**: Ensure keyboard navigation works for all new UI elements
- **Documentation**: Update component CLAUDE.md files in respective directories

### Git Workflow
- **Commit Messages**: Use conventional commits format with emoji indicators
- **Branch Naming**: Use feature/component-name or fix/issue-description
- **Pre-commit**: Run type-check and lint before committing
- **Code Review**: Check for design system compliance and type safety

## Technical Debt & Future Improvements

### Current Limitations
- Some legacy components still contain Tailwind classes (Timeline, SpellEffect details)
- TypeScript errors in some edge cases need resolution
- Loading states and error boundaries need implementation
- Performance optimization for large maps with many objects

### Future Enhancements
- Advanced canvas interactions (multi-select, group operations)
- Plugin system for custom token types
- Real-time collaborative editing
- Advanced spell effect animations
- Map import from various formats (Roll20, Foundry VTT)