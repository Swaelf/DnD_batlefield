# Timeline & Events System Documentation

## Overview
The Timeline & Events system provides D&D combat management with round-based event sequencing, token animations, and spell effects. It enables DMs to pre-plan events, execute them in sequence, and create dynamic battle narratives.

## Architecture

### Core Components
```
Timeline/
├── Timeline.tsx           # Main timeline UI and combat controls
├── CombatTracker.tsx      # Round management and initiative tracking
├── EventEditor.tsx        # Event creation and editing interface
└── index.ts              # Barrel exports
```

### State Management
```
store/
├── roundStore.ts          # Round and timeline state management
├── eventCreationStore.ts  # Event creation workflow state
├── animationStore.ts      # Token animation coordination
└── mapStore.ts           # Map objects and spell effects
```

### Data Flow
1. **Combat Start** - DM initiates combat, creates timeline
2. **Event Planning** - Events added to specific rounds via EventEditor
3. **Round Execution** - Timeline processes events in sequence
4. **Animation Coordination** - Multiple stores coordinate visual effects
5. **State Persistence** - Round history maintained for review/replay

## Combat System

### Round-Based Structure
The system follows D&D 5e combat structure:
- **Rounds** - Combat turns containing multiple events
- **Initiative Order** - Token-based turn sequences
- **Event Timing** - Coordinated animations within rounds
- **History Tracking** - Completed rounds stored for replay

### Timeline States
```typescript
interface Timeline {
  id: string
  mapId: string
  rounds: Round[]
  currentRound: number
  isActive: boolean
  history: Round[] // Completed rounds
}

interface Round {
  id: string
  number: number
  name?: string // "Ambush!", "Dragon arrives", etc.
  timestamp: number
  events: RoundEvent[]
  executed: boolean
}
```

## Event System

### Event Types
```typescript
export type EventType = 'move' | 'appear' | 'disappear' | 'spell'
```

#### 1. Move Events (`move`)
**Purpose**: Token movement with pathfinding and animation
**Use Cases**: Character movement, repositioning, charges
**Properties**:
- `fromPosition` - Starting coordinates
- `toPosition` - Ending coordinates
- `path` - Optional waypoints for complex routes
- `duration` - Animation timing
- `easing` - Movement curve (linear, ease-in, etc.)

#### 2. Appear Events (`appear`)
**Purpose**: Token summoning, reinforcements, reveals
**Use Cases**: Summon creatures, ambush reveals, teleportation arrivals
**Properties**:
- `position` - Spawn location
- `fadeIn` - Gradual appearance vs instant
- `duration` - Fade-in timing

#### 3. Disappear Events (`disappear`)
**Purpose**: Token removal, death, teleportation
**Use Cases**: Death, banishment, stealth, teleportation departures
**Properties**:
- `fadeOut` - Gradual vs instant removal
- `duration` - Fade-out timing

#### 4. Spell Events (`spell`)
**Purpose**: Magical effects with visual animations
**Use Cases**: All D&D spells with appropriate visual effects
**Properties**: *See [Spell System Documentation](../Spells/CLAUDE.md)*

### Event Data Structure
```typescript
export interface RoundEvent {
  id: string
  roundNumber: number
  tokenId: string
  type: EventType
  data: EventData
  executed: boolean
  order?: number // For sequencing events within a round
}

export type EventData = MoveEventData | AppearEventData | DisappearEventData | SpellEventData
```

## Store Architecture

### RoundStore (roundStore.ts)
**Purpose**: Central timeline and round management
**Responsibilities**:
- Combat state (in/out of combat)
- Round progression and navigation
- Event management and execution
- Animation speed control

**Key Actions**:
```typescript
interface RoundStore {
  // Combat Control
  startCombat: (mapId: string) => void
  endCombat: () => void
  nextRound: () => Promise<void>
  previousRound: () => void
  goToRound: (roundNumber: number) => void

  // Event Management
  addEvent: (tokenId: string, type: EventType, data: EventData, roundNumber?: number) => void
  updateEvent: (eventId: string, updates: Partial<RoundEvent>) => void
  removeEvent: (eventId: string) => void

  // Event Execution
  executeRoundEvents: (roundNumber: number) => Promise<void>
  previewEvent: (event: RoundEvent) => void

  // Configuration
  setAnimationSpeed: (speed: number) => void
  clearTimeline: () => void
}
```

### EventCreationStore (eventCreationStore.ts)
**Purpose**: Manages event creation workflow and UI state
**Responsibilities**:
- Token/position selection workflow
- Event creation form state
- Path preview for movement events
- Interactive picking modes

**Key States**:
```typescript
interface EventCreationState {
  isCreatingEvent: boolean
  isPicking: 'from' | 'to' | 'token' | null // Interactive selection mode
  selectedTokenId: string | null
  fromPosition: Position | null
  toPosition: Position | null
  pathPreview: Position[]
}
```

### AnimationStore (animationStore.ts)
**Purpose**: Coordinates token movement animations
**Responsibilities**:
- Active animation paths tracking
- Animation progress updates
- Collision avoidance (future)
- Performance optimization

**Key Features**:
```typescript
interface AnimationPath {
  tokenId: string
  from: Position
  to: Position
  progress: number // 0 to 1
  isAnimating: boolean
}
```

## Component Details

### Timeline.tsx
**Purpose**: Main timeline interface and combat controls
**Features**:
- Combat start/end controls
- Round navigation (previous/next/jump)
- Animation speed slider
- Event count indicators
- Compact/expanded views

**UI Elements**:
```typescript
// Combat Controls
<button onClick={handleStartCombat}>Start Combat</button>
<button onClick={handleNextRound}>Next Round</button>
<button onClick={previousRound}>Previous Round</button>

// Animation Speed
<input
  type="range"
  min="0.5" max="3" step="0.1"
  value={animationSpeed}
  onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
/>
```

### EventEditor.tsx
**Purpose**: Event creation and editing interface
**Features**:
- Event type selection (move/appear/disappear/spell)
- Interactive position/token picking
- Spell configuration with presets
- Event preview and validation
- Batch event operations

**Event Creation Flow**:
1. **Token Selection** - Pick token to animate
2. **Event Type** - Choose event category
3. **Configuration** - Set positions, timing, effects
4. **Preview** - Test event animation
5. **Commit** - Add to timeline round

### CombatTracker.tsx
**Purpose**: Initiative and round management
**Features**:
- Initiative order tracking
- Token turn indicators
- Round counter and history
- Combat state management

## Integration Patterns

### Event Execution Pipeline
```typescript
const executeRoundEvents = async (roundNumber: number) => {
  const round = timeline.rounds.find(r => r.number === roundNumber)
  if (!round) return

  // Sort events by order property
  const sortedEvents = round.events.sort((a, b) => (a.order || 0) - (b.order || 0))

  for (const event of sortedEvents) {
    await executeEvent(event)
    await waitForAnimationComplete(event)
  }

  // Mark round as executed
  markRoundExecuted(roundNumber)
}
```

### Event-to-Animation Mapping
```typescript
const executeEvent = async (event: RoundEvent) => {
  switch (event.type) {
    case 'move':
      const moveData = event.data as MoveEventData
      animationStore.startAnimation(
        event.tokenId,
        moveData.fromPosition,
        moveData.toPosition
      )
      break

    case 'spell':
      const spellData = event.data as SpellEventData
      mapStore.addSpellEffect(spellData)
      break

    case 'appear':
      mapStore.setTokenVisibility(event.tokenId, true)
      break

    case 'disappear':
      mapStore.setTokenVisibility(event.tokenId, false)
      break
  }
}
```

### Store Coordination Pattern
```typescript
// Components coordinate multiple stores
const EventComponent = () => {
  const { addEvent } = useRoundStore()
  const { selectedTokenId, fromPosition, toPosition } = useEventCreationStore()
  const { currentMap } = useMapStore()

  const handleCreateMoveEvent = () => {
    const eventData: MoveEventData = {
      type: 'move',
      fromPosition: fromPosition!,
      toPosition: toPosition!,
      duration: 1000,
      easing: 'ease-in-out'
    }

    addEvent(selectedTokenId!, 'move', eventData)
  }
}
```

## Animation Coordination

### Token Movement Animation
```typescript
// useTokenAnimation hook coordinates movement
const useTokenAnimation = (token: Token) => {
  const { activePaths } = useAnimationStore()
  const activePath = activePaths.find(p => p.tokenId === token.id)

  useEffect(() => {
    if (!activePath?.isAnimating) return

    const animation = new Konva.Animation((frame) => {
      const progress = Math.min(frame.time / ANIMATION_DURATION, 1)

      // Interpolate position
      const currentPos = {
        x: activePath.from.x + (activePath.to.x - activePath.from.x) * progress,
        y: activePath.from.y + (activePath.to.y - activePath.from.y) * progress
      }

      // Update token position
      updateTokenPosition(token.id, currentPos)

      if (progress >= 1) {
        animation.stop()
        endAnimation(token.id)
      }
    })

    animation.start()
    return () => animation.stop()
  }, [activePath])
}
```

### Spell Effect Integration
```typescript
// Spells are added to map objects for rendering
const addSpellEffect = (spellData: SpellEventData) => {
  const spellObject: MapObject = {
    id: nanoid(),
    type: 'spell',
    position: spellData.fromPosition,
    rotation: 0,
    layer: 1000, // Always on top
    spellData
  }

  // Auto-cleanup after animation
  setTimeout(() => {
    if (!spellData.persistDuration) {
      removeObject(spellObject.id)
    }
  }, spellData.duration + 100)
}
```

## Event Creation Workflow

### Interactive Position Picking
```typescript
const usePositionPicking = () => {
  const { isPicking, setPosition } = useEventCreationStore()

  const handleCanvasClick = (position: Position) => {
    if (isPicking === 'from') {
      setPosition('from', position)
    } else if (isPicking === 'to') {
      setPosition('to', position)
    }
  }

  return { handleCanvasClick, isPicking }
}
```

### Event Validation
```typescript
const validateEvent = (event: Partial<RoundEvent>): string[] => {
  const errors: string[] = []

  if (!event.tokenId) errors.push('Token required')
  if (!event.type) errors.push('Event type required')

  if (event.type === 'move') {
    const data = event.data as MoveEventData
    if (!data.fromPosition) errors.push('From position required')
    if (!data.toPosition) errors.push('To position required')
  }

  return errors
}
```

## Performance Considerations

### Animation Optimization
- **RequestAnimationFrame**: Use Konva's optimized animation system
- **Batching**: Group simultaneous events to reduce render calls
- **Cleanup**: Always stop animations to prevent memory leaks
- **Throttling**: Limit animation updates based on speed setting

### Memory Management
```typescript
// Proper animation cleanup
useEffect(() => {
  return () => {
    // Stop all active animations for this component
    currentAnimations.forEach(anim => anim.stop())
    clearAllPaths()
  }
}, [])
```

### State Optimization
- **Event Ordering**: Pre-sort events to avoid runtime sorting
- **Round Caching**: Cache computed round data
- **Selective Updates**: Only re-render affected tokens during animation

## Future Enhancements

### Planned Features
- **Initiative Integration** - Automatic turn order with initiative rolls
- **Condition Tracking** - Visual status effects on tokens
- **Macro Events** - Compound events (move + attack + spell)
- **Event Templates** - Reusable event patterns
- **Combat Analytics** - Round timing and statistics
- **Import/Export** - Save/load combat scenarios

### Extension Points
- **Custom Event Types** - Plugin system for new event categories
- **Animation Curves** - Bezier and custom easing functions
- **Trigger System** - Conditional event execution
- **Scripting** - Event automation with conditions

## Development Guidelines

### Adding New Event Types
1. Update `EventType` union in `timeline.ts`
2. Create new `EventData` interface
3. Add execution logic in `roundStore.executeEvent()`
4. Update `EventEditor` UI for new type
5. Add validation rules
6. Create animation integration

### Error Handling
```typescript
const executeEvent = async (event: RoundEvent) => {
  try {
    await processEvent(event)
    markEventExecuted(event.id)
  } catch (error) {
    console.error(`Event execution failed:`, event, error)
    // Graceful fallback - continue with next event
  }
}
```

### Testing Patterns
```typescript
// Mock timeline for testing
const mockTimeline: Timeline = {
  id: 'test-timeline',
  mapId: 'test-map',
  rounds: [
    {
      id: 'round-1',
      number: 1,
      timestamp: Date.now(),
      events: [
        {
          id: 'move-1',
          tokenId: 'token-1',
          type: 'move',
          data: { /* move data */ },
          executed: false
        }
      ],
      executed: false
    }
  ],
  currentRound: 1,
  isActive: true,
  history: []
}
```

## Best Practices

### Event Design
- **Atomic Events** - Each event should be a single, complete action
- **Predictable Timing** - Consistent animation durations
- **Graceful Failures** - Continue execution if individual events fail
- **Visual Feedback** - Clear indicators for event states

### Store Management
- **Separation of Concerns** - Keep event creation separate from execution
- **State Consistency** - Ensure stores stay synchronized
- **Performance** - Avoid unnecessary re-renders during animation

### User Experience
- **Preview Mode** - Allow testing events before committing
- **Undo/Redo** - Support event modification and removal
- **Visual Clarity** - Clear indicators for current round and active events
- **Accessibility** - Keyboard shortcuts for common operations

## Troubleshooting

### Common Issues
1. **Animation Stuttering** - Check for render loops or excessive updates
2. **Event Order** - Verify `order` property is set correctly
3. **Memory Leaks** - Ensure animations are properly stopped
4. **State Sync** - Multiple stores may get out of sync during rapid changes

### Debug Tools
```typescript
// Enable timeline debugging
const DEBUG_TIMELINE = process.env.NODE_ENV === 'development'

if (DEBUG_TIMELINE) {
  console.log('Executing event:', event)
  console.log('Round state:', currentRound)
  console.log('Animation queue:', activeAnimations)
}
```