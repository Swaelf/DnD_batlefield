# Testing System Documentation

## Overview

The testing system provides comprehensive visual test scenarios for verifying D&D spell animations, timeline management, and combat mechanics.

## Test Helper Functions (`testHelpers.ts`)

Reusable helper functions for consistent test behavior across all test scenarios.

### Timeline Management

#### `moveToNextRound()`
Advances to the next round in the timeline.
- Executes all events in the current round
- Marks the round as executed
- Creates the next round automatically
- Advances the round counter

```typescript
await moveToNextRound()
```

**Usage**: Use for round-based spell durations (e.g., Darkness lasts 10 rounds)

#### `moveToNextEvent()`
Advances to the next event within the current round.
- Executes the current event
- Increments the event counter
- Stays within the same round

```typescript
await moveToNextEvent()
```

**Usage**: Use for multiple events within a single round

#### `getCurrentRound()`
Gets the current round number.

```typescript
const round = await getCurrentRound()
console.log(`Currently at Round ${round}`)
```

#### `getCurrentEventCount()`
Gets the number of events in the current round.

```typescript
const eventCount = await getCurrentEventCount()
console.log(`Round has ${eventCount} events`)
```

### Spell Verification

#### `hasPersistentAreaSpell(spellName: string)`
Checks if a persistent area spell exists on the map.

```typescript
const darknessExists = await hasPersistentAreaSpell('Darkness')
if (darknessExists) {
  console.log('✅ Darkness spell is active')
}
```

**Returns**: `boolean` - True if the spell exists

#### `countPersistentAreaSpells(spellName: string)`
Counts how many persistent area spells of a given name exist.

```typescript
const wallCount = await countPersistentAreaSpells('Wall of Fire')
console.log(`${wallCount} Wall of Fire spells active`)
```

**Returns**: `number` - Count of matching spells

### Map Object Management

#### `getObjectsByType(objectType: MapObject['type'])`
Gets all objects of a specific type from the map.

```typescript
const tokens = await getObjectsByType('token')
const spells = await getObjectsByType('spell')
const persistentAreas = await getObjectsByType('persistent-area')
```

**Valid Types**: `'token'`, `'shape'`, `'spell'`, `'attack'`, `'persistent-area'`, `'text'`, `'tile'`

#### `hasToken(tokenId: string)`
Checks if a token exists on the map.

```typescript
const warriorExists = await hasToken('warrior-1')
```

#### `getObjectCount()`
Gets the total number of objects on the map.

```typescript
const count = await getObjectCount()
console.log(`Map has ${count} objects`)
```

### Combat Management

#### `startCombat()`
Starts combat mode.

```typescript
await startCombat()
```

#### `endCombat()`
Ends combat mode.

```typescript
await endCombat()
```

### Utilities

#### `wait(ms: number)`
Waits for a specific duration.

```typescript
await wait(2000) // Wait 2 seconds
```

#### `logTestState(label: string)`
Logs debug information about the current test state.

```typescript
await logTestState('After Round 1')
// Output: [TEST STATE: After Round 1] { round: 1, eventCount: 3, objectCount: 5, inCombat: true }
```

## Test Scenarios

### Individual Spell Tests (`TestIndividualSpells.ts`)

Tests for each D&D spell with full lifecycle verification.

**Test Flow**:
1. Create tokens (caster and target)
2. Start combat
3. Cast spell
4. Execute round with `moveToNextRound()`
5. Verify spell effects
6. Verify status effects
7. Verify continuous effects
8. Verify cleanup after duration

**Example Test Structure**:
```typescript
{
  id: 'darkness-continuous-test',
  name: 'Darkness - Continuous Area Effect',
  description: 'Tests Darkness spell: area effect created, persists for 10 rounds, then removed',
  category: 'spells',
  steps: [
    // Create tokens
    { type: 'action', action: { type: 'addToken', params: {...} } },

    // Start combat
    { type: 'action', action: { type: 'startCombat', params: {} } },

    // Cast spell
    { type: 'action', action: { type: 'custom', params: {
      execute: async () => {
        timelineStore.addAction('caster', 'spell', {
          spellName: 'Darkness',
          category: 'area',
          persistDuration: 10,
          durationType: 'rounds',
          ...
        }, 1)
      }
    }}},

    // Execute Round 1
    { type: 'action', action: { type: 'nextRound', params: {} } },

    // Wait for animation
    { type: 'wait', wait: 2000 },

    // Verify spell exists
    { type: 'assert', assert: { type: 'custom', params: {
      check: async () => await hasPersistentAreaSpell('Darkness')
    }}},

    // Execute Rounds 2-10
    ...Array.from({ length: 9 }, () => [
      { type: 'action', action: { type: 'nextRound', params: {} } }
    ]).flat(),

    // Execute Round 11 (duration expires)
    { type: 'action', action: { type: 'nextRound', params: {} } },

    // Verify spell removed
    { type: 'assert', assert: { type: 'custom', params: {
      check: async () => !(await hasPersistentAreaSpell('Darkness'))
    }}}
  ]
}
```

### Round Replay Test (`TestRoundReplay.ts`)

Tests the round replay functionality.

**Test Flow**:
1. Create 4 events in Round 1
2. Start New Round → Round 2
3. Previous Round → Return to Round 1
4. Next Round → Replay all Round 1 animations

### Timeline Navigation Test (`TestTimelineNavigation.ts`)

Tests event and round navigation with position restoration.

**Test Flow**:
1. Create events in Round 1
2. Test Previous Event → positions restore
3. Start New Round → Round 2
4. Create events in Round 2
5. Previous Round → verify Round 1 state
6. Next Round → verify Round 2 state

## Test Action Types

### Standard Actions

#### `addToken`
Creates a token on the map.
```typescript
{
  type: 'addToken',
  params: {
    id: 'warrior-1',
    name: 'Warrior',
    position: { x: 200, y: 200 },
    size: 'medium',
    color: '#FF0000',
    shape: 'circle'
  }
}
```

#### `startCombat`
Starts combat mode.
```typescript
{
  type: 'startCombat',
  params: {}
}
```

#### `nextRound`
Executes current round and advances to next round.
```typescript
{
  type: 'nextRound',
  params: {}
}
```

**Important**: Uses `startNewRound()` internally which:
- Executes all events in current round
- Creates the next round
- Advances round counter

#### `nextEvent`
Executes next event within current round.
```typescript
{
  type: 'nextEvent',
  params: {}
}
```

#### `custom`
Executes custom async code.
```typescript
{
  type: 'custom',
  params: {
    execute: async () => {
      // Custom test logic
      await moveToNextRound()
      const exists = await hasPersistentAreaSpell('Darkness')
      console.log('Spell exists:', exists)
    }
  }
}
```

### Test Step Types

#### `action`
Performs an action.
```typescript
{
  type: 'action',
  action: { type: 'nextRound', params: {} },
  description: 'Execute Round 1'
}
```

#### `wait`
Waits for a duration.
```typescript
{
  type: 'wait',
  wait: 2000,
  description: 'Wait for animation to complete'
}
```

#### `assert`
Verifies a condition.
```typescript
{
  type: 'assert',
  assert: {
    type: 'custom',
    params: {
      check: async () => await hasPersistentAreaSpell('Darkness')
    },
    expected: true
  },
  description: 'Verify Darkness spell exists'
}
```

#### `capture`
Captures a screenshot.
```typescript
{
  type: 'capture',
  capture: { name: 'darkness-round-1' },
  description: 'Capture Darkness effect'
}
```

## Best Practices

### 1. Use Helper Functions
Always use helper functions instead of direct store calls:

```typescript
// ✅ Good
await moveToNextRound()
const exists = await hasPersistentAreaSpell('Darkness')

// ❌ Bad
await timelineStore.startNewRound()
const spells = mapStore.currentMap?.objects.filter(...)
```

### 2. Wait for Animations
Always wait sufficient time for animations to complete:

```typescript
// Cast spell (duration: 500ms)
{ type: 'action', action: { type: 'nextRound' } }

// Wait for animation + persistent area creation
{ type: 'wait', wait: 2000 } // 500ms animation + 1500ms buffer

// Then verify
{ type: 'assert', assert: { check: async () => ... } }
```

### 3. Use Descriptive Names
Use clear, descriptive names for test steps:

```typescript
{
  type: 'action',
  action: { type: 'nextRound' },
  description: 'Execute Round 1 - Darkness area appears'
}
```

### 4. Verify State Changes
Always verify that state changes occurred:

```typescript
// Execute round
await moveToNextRound()

// Verify round advanced
const round = await getCurrentRound()
console.log(`Now at Round ${round}`)

// Verify spell exists
const exists = await hasPersistentAreaSpell('Darkness')
console.log(`Spell exists: ${exists}`)
```

### 5. Clean Up Properly
Clean up test state to avoid interference:

```typescript
// At end of test
await endCombat()

// Remove test tokens
const tokens = await getObjectsByType('token')
tokens.forEach(token => mapStore.deleteObject(token.id))
```

## Common Patterns

### Testing Spell Duration
```typescript
// Cast spell with 10-round duration
timelineStore.addAction('caster', 'spell', {
  persistDuration: 10,
  durationType: 'rounds',
  ...
}, 1)

// Execute Round 1
await moveToNextRound()
await wait(2000)

// Verify exists
await hasPersistentAreaSpell('SpellName') // true

// Execute Rounds 2-10
for (let i = 0; i < 9; i++) {
  await moveToNextRound()
}

// Still exists at Round 10
await hasPersistentAreaSpell('SpellName') // true

// Execute Round 11 (duration expires)
await moveToNextRound()
await wait(1000)

// Removed after duration
await hasPersistentAreaSpell('SpellName') // false
```

### Testing Multiple Events per Round
```typescript
// Event 1
timelineStore.addAction('token1', 'move', {...}, 1)
await moveToNextEvent()

// Event 2
timelineStore.addAction('token2', 'spell', {...}, 2)
await moveToNextEvent()

// Event 3
timelineStore.addAction('token3', 'move', {...}, 3)

// End round (executes all events, creates Round 2)
await moveToNextRound()
```

### Verifying Spell Cleanup
```typescript
// Cast spell with duration
await moveToNextRound()
await wait(2000)

// Count spells before cleanup
const countBefore = await countPersistentAreaSpells('Darkness')

// Advance past duration
await moveToNextRound()
await wait(1000)

// Count spells after cleanup
const countAfter = await countPersistentAreaSpells('Darkness')

// Verify cleanup occurred
console.log(`Spells: ${countBefore} → ${countAfter}`)
```

## Debugging Tests

### Enable Debug Logging
Helper functions include built-in logging:

```typescript
await logTestState('Before casting spell')
// [TEST STATE: Before casting spell] { round: 1, eventCount: 0, objectCount: 2, inCombat: true }

await moveToNextRound()

await logTestState('After Round 1')
// [TEST STATE: After Round 1] { round: 2, eventCount: 0, objectCount: 3, inCombat: true }
```

### Check Object Counts
```typescript
const tokenCount = (await getObjectsByType('token')).length
const spellCount = (await getObjectsByType('spell')).length
const areaCount = (await getObjectsByType('persistent-area')).length

console.log(`Tokens: ${tokenCount}, Spells: ${spellCount}, Areas: ${areaCount}`)
```

### Verify Round State
```typescript
const round = await getCurrentRound()
const eventCount = await getCurrentEventCount()
console.log(`Round ${round}, ${eventCount} events`)
```

## Known Issues

### Issue: Spell Not Appearing
**Cause**: Animation hasn't completed before verification
**Solution**: Increase wait time after `moveToNextRound()`

```typescript
// ❌ Not enough time
await moveToNextRound()
await wait(500)

// ✅ Sufficient time
await moveToNextRound()
await wait(2000)
```

### Issue: Round Counter Not Advancing
**Cause**: Using `nextEvent()` instead of `moveToNextRound()`
**Solution**: Use `moveToNextRound()` for round advancement

```typescript
// ❌ Stays in Round 1
await moveToNextEvent()

// ✅ Advances to Round 2
await moveToNextRound()
```

### Issue: Persistent Area Not Found
**Cause**: Checking wrong object type
**Solution**: Use `hasPersistentAreaSpell()` helper

```typescript
// ❌ Checking wrong type
const spells = mapStore.currentMap?.objects.filter(obj => obj.type === 'spell')

// ✅ Using helper function
const exists = await hasPersistentAreaSpell('Darkness')
```

## Contributing

When adding new test scenarios:

1. Use helper functions from `testHelpers.ts`
2. Follow existing test patterns
3. Add descriptive step descriptions
4. Include sufficient wait times
5. Verify all state changes
6. Clean up test state
7. Document expected behavior

## See Also

- `testHelpers.ts` - Helper function implementations
- `TestIndividualSpells.ts` - Spell test examples
- `TestRunner.ts` - Test execution engine
- `TestScenarios.ts` - Test type definitions
