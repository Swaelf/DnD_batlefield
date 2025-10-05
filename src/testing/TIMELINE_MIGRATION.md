# Timeline Structure Migration Guide for Test Scenarios

## Overview
The timeline system has been migrated from an event-based structure to a **round-based structure** to better support D&D 5e combat mechanics.

## Old Structure (Deprecated)
```typescript
interface Timeline {
  events: Event[]  // Flat array of events
  currentEvent: number
}
```

## New Structure (Current)
```typescript
interface Timeline {
  rounds: Round[]      // Array of rounds
  currentRound: number // Current round number
  currentEvent: number // Current event within round
}

interface Round {
  id: string
  number: number
  events: Event[]      // Events within this round
  allActions: Action[] // All actions across events
  executed: boolean
  timestamp: number
}

interface Event {
  id: string
  number: number
  roundNumber: number  // NEW: Reference to parent round
  actions: Action[]
  executed: boolean
  timestamp: number
}
```

## Migration Status for Test Files

### ✅ Fully Updated
All test scenario files have been updated to use the new timeline structure:

1. **TestScenarios.ts** - Main test scenarios
   - Uses `addAction(tokenId, type, data, eventNumber)` API
   - Accesses timeline via `roundStore.timeline`
   - No direct event array access

2. **TestPersistentAreaCleanup.ts** - Spell persistence tests
   - Updated spell objects with `eventCreated` and `durationType` fields
   - Uses round-aware cleanup logic

3. **useTokenAnimation.test.ts** - Animation unit tests
   - Updated to access events via `rounds[0].events`

4. **useTokenAnimation.visual.test.ts** - Visual animation tests
   - Complete Round and Event objects with all required fields
   - Properly structured timeline mock

5. **timelineStore.test.ts** - Timeline store tests
   - All assertions updated to use `rounds[0].events`
   - Event creation and execution tests updated

6. **mapStore.test.ts** - Map store tests
   - Spell objects include required timeline fields

### API Usage Patterns

#### ✅ Correct Usage
```typescript
// Adding actions to timeline
roundStore.addAction(tokenId, 'move', {
  type: 'move',
  fromPosition: { x: 0, y: 0 },
  toPosition: { x: 100, y: 100 },
  duration: 1000
}, eventNumber)  // Event number within current round

// Advancing timeline
await roundStore.nextEvent()

// Accessing events
const currentRound = timeline.rounds.find(r => r.number === currentRoundNumber)
const event = currentRound?.events.find(e => e.number === eventNumber)
```

#### ❌ Deprecated Usage (No longer works)
```typescript
// Direct event access - NO LONGER EXISTS
timeline.events.find(e => e.number === eventNumber)

// Missing required spell fields - CAUSES TYPE ERRORS
const spell = {
  type: 'spell',
  roundCreated: 1,
  spellDuration: 2
  // Missing: eventCreated, durationType
}
```

## Required Spell Object Fields

All spell objects must include:
```typescript
{
  roundCreated: number      // Round when created
  eventCreated: number      // Event within round when created
  spellDuration: number     // Duration in rounds or events
  durationType: 'rounds' | 'events'  // How duration is measured
}
```

### Examples:

**Continuous spell (duration in rounds):**
```typescript
const fogCloud = {
  type: 'spell',
  roundCreated: 1,
  eventCreated: 1,
  spellDuration: 3,       // Lasts 3 rounds
  durationType: 'rounds'  // Measured in rounds
}
```

**Instant burst spell (duration in events):**
```typescript
const fireball = {
  type: 'persistent-area',
  roundCreated: 1,
  eventCreated: 2,
  spellDuration: 1,       // Lasts 1 event
  durationType: 'events'  // Measured in events
}
```

## Testing Considerations

### Timeline Initialization
When creating test timelines, ensure complete structure:
```typescript
const testTimeline: Timeline = {
  id: 'test-timeline',
  mapId: 'test-map',
  rounds: [{
    id: 'round-1',
    number: 1,
    allActions: [],
    executed: false,
    timestamp: Date.now(),
    events: [{
      id: 'event-1',
      number: 1,
      roundNumber: 1,  // Must reference parent round
      actions: [],
      executed: false,
      timestamp: Date.now()
    }]
  }],
  currentRound: 1,
  currentEvent: 1,
  isActive: true,
  history: []
}
```

### Event Execution
Events are executed within their round context:
```typescript
// Execute specific event
await roundStore.executeEventActions(eventNumber)

// Advance to next event (creates new event if needed)
await roundStore.nextEvent()
```

### Cleanup Testing
When testing spell cleanup:
```typescript
// Spells with durationType: 'rounds' cleanup based on round number
// Spells with durationType: 'events' cleanup based on event number

// Test round-based cleanup
await roundStore.nextEvent()  // Advances round
// Round-based spells may expire

// Test event-based cleanup
await roundStore.nextEvent()  // Advances event within round
// Event-based spells may expire
```

## Performance Considerations

The round-based structure provides:
- Better organization for D&D combat (rounds → events)
- Clearer spell duration tracking
- Improved cleanup logic
- Easier debugging of timeline state

## Common Issues and Solutions

### Issue: "Property 'events' does not exist on type 'Timeline'"
**Solution:** Access events via rounds:
```typescript
// Before: timeline.events
// After:  timeline.rounds[0].events
```

### Issue: Type error on spell object creation
**Solution:** Include all required fields:
```typescript
const spell = {
  // ... other fields
  roundCreated: currentRound,
  eventCreated: currentEvent,
  spellDuration: 3,
  durationType: 'rounds' as const
}
```

### Issue: Tests fail with "Cannot read property 'events' of undefined"
**Solution:** Ensure timeline is initialized before accessing:
```typescript
if (timeline && timeline.rounds.length > 0) {
  const events = timeline.rounds[0].events
}
```

## Migration Checklist

When updating test scenarios:
- [ ] Replace `timeline.events` with `timeline.rounds[x].events`
- [ ] Add `roundNumber` field to Event objects
- [ ] Add required Round fields (id, allActions, executed, timestamp)
- [ ] Add `eventCreated` and `durationType` to spell objects
- [ ] Update spell cleanup tests to consider round vs event duration
- [ ] Verify timeline initialization includes complete Round structure
- [ ] Test event execution within round context

## Status: ✅ Complete

All test files have been migrated successfully:
- 0 TypeScript errors
- 0 ESLint errors
- All tests use correct API patterns
- Spell objects properly typed
- Timeline structure fully migrated
