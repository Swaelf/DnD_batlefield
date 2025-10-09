# Animation Library API Examples

Complete usage examples for the Universal Animation Library's public API.

## Table of Contents
1. [Basic Spell Casting](#basic-spell-casting)
2. [Promise-Based Casting](#promise-based-casting)
3. [Sequential & Parallel Casting](#sequential--parallel-casting)
4. [Timeline Integration](#timeline-integration)
5. [Persistent Effects](#persistent-effects)
6. [Concentration Management](#concentration-management)
7. [Advanced Scenarios](#advanced-scenarios)

---

## Basic Spell Casting

### Simple Spell Cast (Fire and Forget)

```typescript
import { cast } from '@/lib/animations'

// Cast a fireball
const fireball = cast.fireball(
  { x: 200, y: 300 },  // From wizard
  { x: 800, y: 500 }   // To orc
)
fireball.play()

// Cast ray of frost
const ray = cast.rayOfFrost(
  { x: 200, y: 300 },
  { x: 700, y: 400 }
)
ray.play()

// Cast thunderwave
const thunder = cast.thunderwave({ x: 400, y: 400 })
thunder.play()

// Cast darkness
const darkness = cast.darkness({ x: 500, y: 500 })
darkness.play()
```

### Using AnimationCaster with Callbacks

```typescript
import { animationCaster } from '@/lib/animations'

// Cast with lifecycle callbacks
await animationCaster.spell.fireball(
  { x: 200, y: 300 },
  { x: 800, y: 500 },
  {
    onStart: () => console.log('Fireball launched!'),
    onUpdate: (progress) => console.log(`Progress: ${progress * 100}%`),
    onComplete: () => console.log('Fireball hit target!'),
    onError: (error) => console.error('Spell failed:', error)
  }
)
```

---

## Promise-Based Casting

### Async/Await Pattern

```typescript
import { animationCaster } from '@/lib/animations'

async function castSpellCombo() {
  // Wait for fireball to complete
  await animationCaster.spell.fireball(
    { x: 200, y: 300 },
    { x: 800, y: 500 }
  )

  console.log('Fireball complete, now casting ray of frost')

  // Then cast ray of frost
  await animationCaster.spell.rayOfFrost(
    { x: 200, y: 300 },
    { x: 700, y: 400 }
  )

  console.log('All spells complete!')
}

castSpellCombo()
```

### Manual Control with CastResult

```typescript
import { animationCaster } from '@/lib/animations'

const result = animationCaster.castWithControl(
  'Fireball',
  {
    fromPosition: { x: 200, y: 300 },
    toPosition: { x: 800, y: 500 }
  }
)

if (result) {
  const { animation, promise, stop, pause, resume } = result

  // Manually control animation
  setTimeout(() => stop(), 500) // Stop after 500ms

  // Wait for completion
  await promise
  console.log('Animation stopped or completed')
}
```

---

## Sequential & Parallel Casting

### Cast Spells in Sequence

```typescript
import { animationCaster } from '@/lib/animations'

// Cast one after another
await animationCaster.castSequence([
  {
    name: 'Fireball',
    config: { fromPosition: { x: 200, y: 300 }, toPosition: { x: 800, y: 500 } }
  },
  {
    name: 'Ray of Frost',
    config: { fromPosition: { x: 200, y: 300 }, toPosition: { x: 700, y: 400 } }
  },
  {
    name: 'Thunderwave',
    config: { position: { x: 400, y: 400 } }
  }
])

console.log('All spells cast in sequence!')
```

### Cast Spells in Parallel

```typescript
import { animationCaster } from '@/lib/animations'

// Cast all at once
await animationCaster.castParallel([
  {
    name: 'Fireball',
    config: { fromPosition: { x: 200, y: 300 }, toPosition: { x: 800, y: 500 } }
  },
  {
    name: 'Magic Missile',
    config: { fromPosition: { x: 250, y: 300 }, toPosition: { x: 850, y: 550 } }
  },
  {
    name: 'Ray of Frost',
    config: { fromPosition: { x: 300, y: 300 }, toPosition: { x: 900, y: 600 } }
  }
])

console.log('All spells completed simultaneously!')
```

### Staggered Casting

```typescript
import { animationCaster } from '@/lib/animations'

// Cast with 200ms delay between each
await animationCaster.castStaggered([
  {
    name: 'Magic Missile',
    config: { fromPosition: { x: 200, y: 300 }, toPosition: { x: 700, y: 400 } }
  },
  {
    name: 'Magic Missile',
    config: { fromPosition: { x: 200, y: 300 }, toPosition: { x: 750, y: 450 } }
  },
  {
    name: 'Magic Missile',
    config: { fromPosition: { x: 200, y: 300 }, toPosition: { x: 800, y: 500 } }
  }
], 200) // 200ms stagger

console.log('Staggered magic missile volley complete!')
```

---

## Timeline Integration

### Schedule Spells for Specific Rounds

```typescript
import { timelineIntegration } from '@/lib/animations'

// Schedule fireball for round 2, event 3
const eventId = timelineIntegration.scheduleAnimation(
  2,  // Round number
  3,  // Event number
  'Fireball',
  {
    fromPosition: { x: 200, y: 300 },
    toPosition: { x: 800, y: 500 }
  }
)

console.log(`Scheduled event: ${eventId}`)

// Later, when round 2 event 3 occurs:
await timelineIntegration.executeEventsForRound(2, 3)
```

### Using Quick Schedule Helpers

```typescript
import { timelineIntegration } from '@/lib/animations'

// Schedule fireball
timelineIntegration.schedule.fireball(
  2,  // Round
  3,  // Event
  { x: 200, y: 300 },  // From
  { x: 800, y: 500 },  // To
  { casterId: 'wizard-token-id' }
)

// Schedule thunderwave
timelineIntegration.schedule.thunderwave(
  3,  // Round
  1,  // Event
  { x: 400, y: 400 }  // Position
)

// Schedule ray of frost
timelineIntegration.schedule.rayOfFrost(
  2,  // Round
  5,  // Event
  { x: 200, y: 300 },
  { x: 700, y: 400 }
)
```

### Advance Timeline

```typescript
import { timelineIntegration } from '@/lib/animations'

// Advance to next round
timelineIntegration.advanceRound()
console.log(`Current round: ${timelineIntegration.getCurrentRound()}`)

// Advance to next event
timelineIntegration.advanceEvent()
console.log(`Current event: ${timelineIntegration.getCurrentEvent()}`)

// Set specific round/event
timelineIntegration.setCurrentRound(5, 2) // Round 5, Event 2
```

---

## Persistent Effects

### Create Persistent Darkness Spell

```typescript
import { timelineIntegration } from '@/lib/animations'

// Darkness that lasts 10 rounds
timelineIntegration.schedule.darkness(
  2,  // Cast in round 2
  3,  // Event 3
  { x: 500, y: 500 },  // Position
  {
    durationType: 'rounds',
    duration: 10,  // 10 rounds
    concentration: true,
    casterId: 'wizard-token-id'
  }
)

// Execute when round 2 event 3 occurs
await timelineIntegration.executeEventsForRound(2, 3)

// Darkness will persist for 10 rounds
// It will automatically be removed after 10 rounds
```

### Event-Based Duration

```typescript
import { timelineIntegration } from '@/lib/animations'

// Darkness that lasts 5 events
timelineIntegration.schedule.darkness(
  1,  // Cast in round 1
  1,  // Event 1
  { x: 500, y: 500 },
  {
    durationType: 'events',
    duration: 5,  // 5 events
    concentration: true,
    casterId: 'wizard-token-id'
  }
)

// Will expire after 5 events have passed
```

### Time-Based Duration

```typescript
import { timelineIntegration } from '@/lib/animations'

// Darkness that lasts 30 seconds (real-time)
timelineIntegration.schedule.darkness(
  1,
  1,
  { x: 500, y: 500 },
  {
    durationType: 'time',
    duration: 30000,  // 30 seconds in ms
    concentration: true,
    casterId: 'wizard-token-id'
  }
)

// Will expire after 30 seconds
```

---

## Concentration Management

### Break Concentration

```typescript
import { timelineIntegration } from '@/lib/animations'

// Wizard casts darkness (concentration)
timelineIntegration.schedule.darkness(
  2, 3,
  { x: 500, y: 500 },
  {
    durationType: 'rounds',
    duration: 10,
    concentration: true,
    casterId: 'wizard-123'
  }
)

// Later, wizard takes damage and loses concentration
timelineIntegration.breakConcentration('wizard-123')

// All concentration spells from wizard-123 are immediately removed
```

### Check Caster's Active Effects

```typescript
import { timelineIntegration } from '@/lib/animations'

// Get all persistent effects for a caster
const wizardEffects = timelineIntegration.getEffectsForCaster('wizard-123')

console.log(`Wizard has ${wizardEffects.length} active concentration spells`)

wizardEffects.forEach(effect => {
  console.log(`- ${effect.animation.getAnimation().name}`)
  console.log(`  Created at round ${effect.createdAtRound}`)
  console.log(`  Expires: ${effect.isExpired() ? 'Yes' : 'No'}`)
})
```

---

## Advanced Scenarios

### Full Combat Round Example

```typescript
import { timelineIntegration, animationCaster } from '@/lib/animations'

async function executeCombatRound(round: number) {
  console.log(`=== Round ${round} ===`)

  // Event 1: Wizard casts fireball
  await timelineIntegration.executeEventsForRound(round, 1)

  // Event 2: Cleric casts darkness
  await timelineIntegration.executeEventsForRound(round, 2)

  // Event 3: Rogue attacks (using animationCaster directly)
  await animationCaster.spell.rayOfFrost(
    { x: 300, y: 400 },
    { x: 700, y: 500 }
  )

  // Event 4: Enemy wizard counterspells (instant)
  await timelineIntegration.executeEventsForRound(round, 4)

  // Advance to next round
  timelineIntegration.advanceRound()

  console.log(`Round ${round} complete!`)
}

// Execute rounds
executeCombatRound(1)
  .then(() => executeCombatRound(2))
  .then(() => executeCombatRound(3))
```

### Spell Queue System

```typescript
import { animationCaster } from '@/lib/animations'

// Queue spells for sequential playback
animationCaster.queueCast('Fireball', {
  fromPosition: { x: 200, y: 300 },
  toPosition: { x: 800, y: 500 }
})

animationCaster.queueCast('Magic Missile', {
  fromPosition: { x: 200, y: 300 },
  toPosition: { x: 750, y: 450 }
})

animationCaster.queueCast('Ray of Frost', {
  fromPosition: { x: 200, y: 300 },
  toPosition: { x: 700, y: 400 }
})

// Queue will process automatically
// Wait for all to complete
await animationCaster.waitForAll()
```

### Complex Spell Combo

```typescript
import { animationCaster, AnimationFactory } from '@/lib/animations'

async function executeSpellCombo() {
  // Step 1: Cast darkness for cover
  const darkness = cast.darkness({ x: 500, y: 500 })
  darkness.play()

  await new Promise(resolve => setTimeout(resolve, 500))

  // Step 2: Magic missile volley (3 targets)
  await animationCaster.castStaggered([
    {
      name: 'Magic Missile',
      config: { fromPosition: { x: 200, y: 300 }, toPosition: { x: 700, y: 400 } }
    },
    {
      name: 'Magic Missile',
      config: { fromPosition: { x: 200, y: 300 }, toPosition: { x: 750, y: 450 } }
    },
    {
      name: 'Magic Missile',
      config: { fromPosition: { x: 200, y: 300 }, toPosition: { x: 800, y: 500 } }
    }
  ], 150)

  // Step 3: Finish with fireball
  await animationCaster.spell.fireball(
    { x: 200, y: 300 },
    { x: 800, y: 500 }
  )

  console.log('Spell combo complete!')
}

executeSpellCombo()
```

### Clean Up and Reset

```typescript
import { timelineIntegration, animationCaster } from '@/lib/animations'

// Stop all active animations
animationCaster.stopAll()

// Clear animation queue
animationCaster.clearQueue()

// Clear all timeline events and effects
timelineIntegration.clear()

// Reset timeline to round 1
timelineIntegration.reset(1, 0)

console.log('Animation system reset!')
```

---

## Integration with MapMaker

### Example: Button Click to Cast Spell

```typescript
import { animationCaster } from '@/lib/animations'
import { useMapStore } from '@/store/mapStore'

function CastFireballButton() {
  const selectedToken = useMapStore(state => state.selectedObjects[0])
  const targetPosition = { x: 800, y: 500 }

  const handleCast = async () => {
    if (!selectedToken) return

    await animationCaster.spell.fireball(
      selectedToken.position,
      targetPosition,
      {
        onStart: () => console.log('Casting fireball!'),
        onComplete: () => console.log('Fireball hit!')
      }
    )
  }

  return <button onClick={handleCast}>Cast Fireball</button>
}
```

### Example: Timeline Event Execution

```typescript
import { timelineIntegration } from '@/lib/animations'
import { useRoundStore } from '@/store/roundStore'

function executeCurrentEvent() {
  const { currentRound, currentEventIndex } = useRoundStore.getState()

  // Execute animations for current round/event
  timelineIntegration.executeEventsForRound(currentRound, currentEventIndex)
}

// Call when timeline advances
executeCurrentEvent()
```

---

## Best Practices

1. **Always use async/await** for sequential spell execution
2. **Use castParallel** for simultaneous effects
3. **Use castStaggered** for visual volley effects
4. **Track concentration spells** with casterId
5. **Clean up animations** when combat ends
6. **Use timeline integration** for turn-based gameplay
7. **Leverage callbacks** for sound effects and game state updates
8. **Queue spells** for automatic sequential playback

---

## Summary

The Animation Library API provides three levels of abstraction:

1. **Direct Instantiation** (`cast.*`) - Quick, fire-and-forget
2. **AnimationCaster** - Promise-based with callbacks
3. **TimelineIntegration** - Full D&D combat timeline support

Choose the level that matches your use case!
