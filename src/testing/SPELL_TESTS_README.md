# Dynamic Spell Tests

## Overview

The spell testing system **automatically generates test scenarios** for every spell defined in `spellTemplates.ts`. When you add or remove spells, the tests update automatically without any manual changes.

## How It Works

### Automatic Generation

The `TestAllSpells.ts` file imports all spells from `spellTemplates.ts` and generates a test scenario for each one:

```typescript
import { spellTemplates } from '@/data/unifiedActions/spellTemplates'

export const allSpellTestScenarios = generateSpellTestScenarios()
```

### Test Pattern

Each generated test follows this pattern:

1. **Add Token 1** at (200, 200) - Target token
2. **Add Token 2** at (500, 200) - Caster token
3. **Move Token 1** to (300, 400) - Simulates movement during combat
4. **Cast Spell (Tracking)** - Token 2 casts spell at Token 1, tracks movement
5. **Cast Spell (Static)** - Token 2 casts spell at Token 1's INITIAL position (200, 200)
6. **Execute Event** - Run all actions
7. **Verify** - Check token positions and spell origins

### What Each Test Validates

✅ Token movement works correctly
✅ Spell originates from caster's position
✅ Spell with `targetTokenId` tracks moving target
✅ Spell without `targetTokenId` targets static position
✅ Spell animation plays with correct parameters
✅ Different spell categories render correctly

## Current Spell Coverage

As of now, **20 spells** are automatically tested:

### Fire (3)
- Fireball
- Burning Hands
- Breath of the Dragon

### Ice (2)
- Ray of Frost
- Cone of Cold

### Lightning (2)
- Lightning Bolt
- Shocking Grasp

### Force (2)
- Magic Missile
- Eldritch Blast

### Divine (3)
- Sacred Flame
- Guiding Bolt
- Cure Wounds

### Other (8)
- Darkness
- Poison Spray
- Stone Rain
- Thunderwave
- Web
- (and others...)

## Adding a New Spell

### Step 1: Add Spell to spellTemplates.ts

```typescript
// In /src/data/unifiedActions/spellTemplates.ts
{
  id: 'my-new-spell-template',
  name: 'My New Spell',
  type: 'spell',
  category: 'fire',
  animation: {
    type: 'projectile',
    duration: 1000,
    color: '#FF0000',
    size: 15
  },
  // ... other properties
}
```

### Step 2: Test Automatically Created!

That's it! The test system will automatically:
- ✅ Generate a new test scenario
- ✅ Add it to the test suite
- ✅ Test movement tracking
- ✅ Test static position targeting

### Step 3: Run Tests

```bash
# The new spell test is now included
pnpm test
```

## Removing a Spell

If you remove a spell from `spellTemplates.ts`:
- ✅ Test automatically removed
- ✅ No manual test cleanup needed
- ✅ Test count updates automatically

## Test Details

### Test Naming

Tests are named automatically:
```
spell-movement-tracking-{spell-id}
```

Example:
```
spell-movement-tracking-fireball-template
spell-movement-tracking-magic-missile-template
spell-movement-tracking-breath-of-the-dragon-template
```

### Animation Type Mapping

The test system automatically maps animation types to spell categories:

| Animation Type | Spell Category |
|---------------|----------------|
| `projectile` | `projectile` |
| `projectile_burst` | `projectile-burst` |
| `ray` / `beam` | `beam` |
| `area` | `area` |
| `burst` | `burst` |
| `cone` | `cone` |
| `line` | `line` |
| `touch` | `touch` |
| `pillar` | `pillar` |

### Special Parameters

Tests automatically include special parameters based on spell type:

**Projectile-Burst Spells:**
```typescript
{ burstRadius: 30 }
```

**Cone Spells:**
```typescript
{ coneAngle: 60 }
```

## Utility Functions

### Get Test Count
```typescript
import { getDynamicSpellTestCount } from './TestScenarios'

const count = getDynamicSpellTestCount()
console.log(`${count} spell tests`) // "20 spell tests"
```

### Get All Test IDs
```typescript
import { getAllSpellTestIds } from './TestScenarios'

const ids = getAllSpellTestIds()
// ['spell-movement-tracking-fireball-template', ...]
```

### Get Tests by Spell Category
```typescript
import { getSpellTestsByCategory } from './TestAllSpells'

const fireTests = getSpellTestsByCategory('fire')
// Returns tests for Fireball, Burning Hands, Breath of Dragon
```

### Get Specific Spell Test
```typescript
import { getSpellTest } from './TestAllSpells'

const fireballTest = getSpellTest('fireball-template')
```

## Test Execution

### Run All Tests
```bash
pnpm test
```

### Run Only Spell Tests
The spell tests are in the 'spells' category:
```typescript
import { getScenariosByCategory } from './TestScenarios'

const spellTests = getScenariosByCategory('spells')
```

### Test Duration

Each spell test takes approximately:
- Setup: ~300ms
- Movement animation: ~600ms
- Spell animation 1: ~spell.duration
- Spell animation 2: ~spell.duration
- Verification: ~500ms

**Total per spell:** ~2-4 seconds depending on spell duration

**Total for all 20 spells:** ~40-80 seconds

## Files

### Test Generation
- `TestAllSpells.ts` - Generates tests dynamically from spellTemplates
- `TestScenarios.ts` - Integrates generated tests into main test suite

### Spell Definitions
- `/src/data/unifiedActions/spellTemplates.ts` - Source of truth for all spells

### Test Runner
- `TestRunner.ts` - Executes test scenarios
- `CanvasCapture.ts` - Captures screenshots for visual verification

## Benefits

### ✅ Zero Maintenance
- Add spell → Test automatically created
- Remove spell → Test automatically removed
- No manual test updates needed

### ✅ Complete Coverage
- Every spell is tested
- All animation types covered
- Movement tracking validated

### ✅ Consistent Testing
- Same test pattern for all spells
- Standardized validation
- Predictable behavior

### ✅ Easy Debugging
- Each spell tested independently
- Clear test names
- Visual screenshots captured

## Example Test Output

```
🧪 Running test: Fireball + Movement Tracking
  Step 1: Add target token at initial position
  Step 2: Add caster token
  Step 3: Wait for tokens to render
  Step 4: Start combat
  Step 5: Add movement + Fireball sequence
  Step 6: Capture initial positions
  Step 7: Execute all actions
  Step 8: Wait for all animations to complete
  Step 9: Capture final state
  Step 10: Verify target token moved to final position
  Step 11: Verify caster token stayed in place
  Step 12: Pause to observe Fireball effects
✅ Test completed in 3245ms

🧪 Running test: Magic Missile + Movement Tracking
  ...
✅ Test completed in 2890ms

... (18 more tests)
```

## Troubleshooting

### Test Failing for New Spell?

1. Check `spellTemplates.ts` - Ensure all required fields are present:
   - `id`, `name`, `type`, `category`
   - `animation.type`, `animation.duration`, `animation.color`, `animation.size`
   - `duration` (top-level)

2. Check animation type mapping - Is your animation type in the mapping table?

3. Check special parameters - Does your spell need `burstRadius` or `coneAngle`?

### Test Count Wrong?

```typescript
import { spellTemplates } from '@/data/unifiedActions/spellTemplates'
console.log(`Spells defined: ${spellTemplates.length}`)

import { getDynamicSpellTestCount } from './TestScenarios'
console.log(`Tests generated: ${getDynamicSpellTestCount()}`)
```

These should match!

### Test Not Appearing?

Make sure you imported the tests in `TestScenarios.ts`:
```typescript
import { allSpellTestScenarios } from './TestAllSpells'

export const testScenarios: TestScenario[] = [
  // ... other tests
  ...allSpellTestScenarios  // ← This must be present
]
```

## Future Enhancements

Potential improvements:
- [ ] Damage number validation
- [ ] Area of effect size verification
- [ ] Persistent spell cleanup testing
- [ ] Multiple target tracking tests
- [ ] Spell slot consumption tests
- [ ] Concentration spell interruption tests
