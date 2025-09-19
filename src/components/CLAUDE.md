# Components Directory

## Overview
This directory contains all React components for the MapMaker application. Components are organized by feature/domain into subdirectories.

## Directory Structure
```
components/
├── Canvas/           # Core canvas rendering components
├── ContextMenu/      # Right-click context menus
├── HelpDialog/       # Help and documentation dialogs
├── Menu/             # Application menus (File, Edit, etc.)
├── Properties/       # Property editing panels
├── Spells/           # D&D spell effect animations
├── StatusBar/        # Status information display
├── Timeline/         # Timeline and event management
├── Token/            # Token-specific components
├── Toolbar/          # Tool selection and controls
└── Tools/            # Drawing tool implementations
```

## Component Rules & Guidelines

### 1. Component Structure
- **One component per file** - Each component should have its own .tsx file
- **Folder organization** - Related components grouped in feature folders
- **Index exports** - Use index.ts for clean imports when multiple related components exist
- **Type definitions** - Component props should be defined as interfaces, not types

### 2. Naming Conventions
- **PascalCase** for component names (e.g., `MapCanvas`, `TokenLibrary`)
- **Props interfaces** should end with `Props` (e.g., `MapCanvasProps`)
- **Event handlers** should start with `handle` or `on` (e.g., `handleClick`, `onClose`)
- **Boolean props** should start with `is`, `has`, or `show` (e.g., `isOpen`, `hasError`)

### 3. Component Best Practices
- **Functional components only** - No class components
- **TypeScript strict mode** - All props must be typed
- **React.FC discouraged** - Use explicit typing: `const Component: React.FC<Props>` → `const Component = (props: Props) => {}`
- **Memoization** - Use React.memo for expensive renders, especially canvas components
- **Hooks organization** - Custom hooks at top, then useState, useEffect, etc.

### 4. State Management
- **Local state** for UI-only concerns (modals, tooltips, hover states)
- **Zustand stores** for shared application state
- **Prop drilling limit** - Maximum 2 levels, otherwise use store
- **Controlled components** - Form inputs should always be controlled

### 5. Canvas Components (Canvas/)
- **Konva integration** - Use React-Konva components
- **Performance critical** - Always memoize and optimize re-renders
- **Stage reference** - Pass stageRef for external control
- **Event delegation** - Handle events at Stage level when possible
- **Coordinate systems** - Always document whether using canvas or screen coordinates

### 6. Context Menus (ContextMenu/)
- **Position calculation** - Account for viewport boundaries
- **Backdrop click** - Always close on backdrop click
- **Keyboard navigation** - Support arrow keys and escape
- **Z-index management** - Use z-50 for menus

### 7. Dialogs (HelpDialog/, etc.)
- **Modal behavior** - Use backdrop and prevent background scroll
- **Escape key** - Always close on Escape press
- **Animation** - Use Tailwind animation classes (animate-fadeIn, animate-slideIn)
- **Focus management** - Trap focus within dialog

### 8. Tool Components (Tools/, Toolbar/)
- **Tool state** - Read from toolStore, never local state
- **Cursor management** - Each tool should set appropriate cursor
- **Keyboard shortcuts** - Register in useKeyboardShortcuts hook
- **Visual feedback** - Show active tool state clearly

### 9. Property Panels (Properties/)
- **Context-aware** - Show relevant controls based on selection
- **Immediate updates** - No "Apply" button, update on change
- **Type guards** - Use proper type guards for different object types
- **Number inputs** - Include min/max/step attributes

### 10. Spell Components (Spells/)
- **Animation-focused** - Use Konva animations for visual effects
- **Category-based** - Different components for area, burst, projectile, ray spells
- **Performance critical** - Animations must be smooth and efficient
- **Auto-cleanup** - Components handle their own animation lifecycle
- **Radius guards** - Always use Math.max() to prevent negative radius errors
- **D&D authentic** - Visual effects match D&D spell descriptions
- **State management** - Complex multi-phase animations (projectile → burst)
- **Memory management** - Proper cleanup prevents animation memory leaks

### 11. Timeline Components (Timeline/)
- **Event-driven** - Manage sequences of map events and animations
- **Round-based** - D&D combat round structure
- **Token integration** - Coordinate with token movement and spell casting
- **Animation queuing** - Sequence multiple events with proper timing
- **State persistence** - Track event history and current round state

### 12. Token Components (Token/)
- **D&D specific** - Follow D&D 5e size conventions
- **Grid snapping** - Respect grid settings from mapStore
- **Performance** - Tokens can be numerous, optimize rendering
- **Templates** - Support both preset and custom tokens

## Import Guidelines

### Import Order
1. React and React-related imports
2. Third-party libraries (lucide-react, konva, etc.)
3. Store imports (@/store/)
4. Type imports (@/types/)
5. Utility imports (@/utils/)
6. Component imports
7. Style imports (if any)

### Example:
```typescript
import React, { useState, useCallback } from 'react'
import { Save, FileDown } from 'lucide-react'
import { useMapStore } from '@/store/mapStore'
import type { BattleMap } from '@/types/map'
import { exportToJSON } from '@/utils/export'
import { Button } from '../Button/Button'
```

## Testing Considerations
- Components should be testable in isolation
- Mock store dependencies for unit tests
- Canvas components may need integration tests
- Accessibility testing for interactive components

## Performance Guidelines
- Memoize expensive computations with useMemo
- Use React.memo for components that re-render frequently
- Lazy load large components (dialogs, panels)
- Virtual scrolling for long lists
- Debounce rapid state updates (property changes)

## Accessibility Requirements
- ARIA labels for icon buttons
- Keyboard navigation for all interactive elements
- Focus indicators visible
- Screen reader support for important state changes
- Color contrast meeting WCAG AA standards

## Style Guidelines
- **Tailwind CSS only** - No separate CSS files
- **D&D Theme colors** - Use theme colors from tailwind.config
- **Consistent spacing** - Use Tailwind spacing scale
- **Responsive design** - Consider different screen sizes
- **Dark theme only** - Application is dark-themed by design

## Common Patterns

### Modal Component Pattern
```typescript
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
        {children}
      </div>
    </>
  )
}
```

### Tool Component Pattern
```typescript
interface ToolProps {
  isActive: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  shortcut?: string
}
```

## Spell Component Patterns

### Animation Component Pattern
```typescript
interface SpellProps {
  spell: SpellEventData
  isAnimating: boolean
  onAnimationComplete?: () => void
}

export const SpellComponent: React.FC<SpellProps> = ({
  spell,
  isAnimating,
  onAnimationComplete
}) => {
  const groupRef = useRef<Konva.Group>(null)
  const animationRef = useRef<Konva.Animation | null>(null)
  const hasStartedRef = useRef(false)

  useEffect(() => {
    if (!isAnimating || !groupRef.current || hasStartedRef.current) return

    hasStartedRef.current = true
    const group = groupRef.current

    // Position at target
    group.position(spell.toPosition)
    group.visible(true)

    // Create animation
    const anim = new Konva.Animation((frame) => {
      if (!frame) return

      const progress = Math.min(frame.time / spell.duration, 1)

      // Animation logic here...

      if (progress >= 1) {
        anim.stop()
        onAnimationComplete?.()
      }
    })

    animationRef.current = anim
    anim.start()

    // Cleanup
    return () => {
      if (animationRef.current) {
        animationRef.current.stop()
        animationRef.current = null
      }
    }
  }, [isAnimating, spell])

  return (
    <Group ref={groupRef} visible={false}>
      <Circle
        radius={Math.max(1, spell.size)}
        fill={spell.color}
      />
    </Group>
  )
}
```

### Spell Integration Pattern
```typescript
// In ObjectsLayer.tsx
const renderSpell = (spell: MapObject & { type: 'spell' }) => {
  const spellProps = {
    spell: spell.spellData,
    isAnimating: true,
    onAnimationComplete: () => {
      // Remove spell after animation
      if (!spell.spellData?.persistDuration) {
        setTimeout(() => deleteObject(spell.id), 100)
      }
    }
  }

  switch (spell.spellData.category) {
    case 'area':
      return <AreaSpell key={spell.id} {...spellProps} />
    // ... other cases
  }
}
```

### Performance Guards Pattern
```typescript
// Always guard against negative radius
radius={Math.max(1, spell.size)}
innerRadius={Math.max(0, spell.size * 0.7)}
outerRadius={Math.max(innerRadius + 1, spell.size)}

// Guard animation calculations
const progress = Math.min(Math.max(0, frame.time / duration), 1)
const scale = Math.max(0.1, progress)
```

## Timeline Component Patterns

### Event Management Pattern
```typescript
interface TimelineProps {
  timeline: Timeline
  onEventExecute: (event: RoundEvent) => void
  onRoundAdvance: () => void
}

// Event execution with proper sequencing
const executeRound = async (round: Round) => {
  const sortedEvents = round.events.sort((a, b) => (a.order || 0) - (b.order || 0))

  for (const event of sortedEvents) {
    await executeEvent(event)
    await waitForAnimation()
  }
}
```

## Component Lifecycle Notes
- Mount: Initialize subscriptions, register shortcuts
- Update: Handle prop changes, update canvas
- Unmount: Clean up subscriptions, remove event listeners
- Error boundaries: Wrap risky components (canvas, file operations)
- **Spell animations**: Must handle cleanup to prevent memory leaks
- **Timeline events**: Coordinate with animation system for proper sequencing