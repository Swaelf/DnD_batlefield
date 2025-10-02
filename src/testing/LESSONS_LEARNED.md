# Testing Lessons Learned

## Spell Position Tracking Bug (October 2025)

### The Bug
Spells and attacks were starting from tokens' initial positions instead of their current positions after movement, even when movement and spell were in the same timeline event.

### Why Tests Didn't Catch It

**Test Code (TestScenarios.ts):**
```typescript
roundStore.addAction('moving-caster', 'spell', {
  tokenId: 'moving-caster',  // ✅ Manually set in test
  spellName: 'Fireball',
  fromPosition: { x: 300, y: 200 },
  // ...
}, 1)
```

**UI Code (UnifiedEventEditor.tsx - before fix):**
```typescript
const result = {
  type: 'spell',
  // ❌ tokenId was MISSING!
  spellName: action.metadata.name,
  fromPosition: action.source,
  // ...
}
```

**The Gap:**
- Tests created action data **directly** with all required fields
- UI created action data through **conversion layer** that was missing fields
- Tests validated **execution logic** but not **data creation logic**

### Root Causes

1. **Tests bypassed the UI layer**
   - Tests called `roundStore.addAction()` directly
   - Real users go through `UnifiedEventEditor.tsx` → conversion → `addAction()`
   - Conversion layer had the bug

2. **Tests didn't validate data structure**
   - Tests checked final token positions (✓)
   - Tests checked spell existence (✓)
   - Tests did NOT check spell origin position (✗)
   - Tests did NOT check action.data contained required fields (✗)

3. **Missing integration tests**
   - No tests for UI → Store conversion
   - No tests for the `convertActionToLegacyData()` function
   - No end-to-end tests simulating actual user workflow

### The Fix

**Two-part fix required:**

1. **Timeline Execution (timelineStore.ts):**
```typescript
// Look up caster token's CURRENT position
if (spellData.tokenId) {
  const casterToken = mapStore.currentMap?.objects.find(obj => obj.id === spellData.tokenId)
  if (casterToken) {
    actualFromPosition = casterToken.position  // Use current position
  }
}
```

2. **UI Conversion (UnifiedEventEditor.tsx):**
```typescript
const result = {
  type: 'spell',
  tokenId: selectedToken,  // ✅ ADDED - required for position lookup
  spellName: action.metadata.name,
  // ...
}
```

### Prevention Strategy

**1. Add Data Structure Validation**
```typescript
// Validate the action was created with tokenId
if (spellAction) {
  const spellData = spellAction.data as any
  if (!spellData.tokenId) {
    throw new Error('Spell action missing tokenId field!')
  }
}
```

**2. Add Assertion Type for Spell Origin**
```typescript
case 'spellOriginPosition':
  const spell = mapStore.currentMap?.objects.find(...)
  if (spell.spellData.fromPosition !== expected) {
    return { success: false, error: 'Spell origin mismatch' }
  }
```

**3. Integration Tests**
Test the full UI → Store → Execution path:
- Create action through UI components
- Verify action data structure
- Execute and verify spell behavior

### Updated Test Coverage

**Before (insufficient):**
```typescript
{
  type: 'assert',
  assert: {
    type: 'tokenPosition',
    params: { tokenId: 'wizard' },
    expected: { x: 300, y: 200 }
  }
}
// ✓ Checks wizard moved
// ✗ Doesn't check where spell came from
```

**After (comprehensive):**
```typescript
{
  type: 'assert',
  assert: {
    type: 'spellOriginPosition',
    params: { spellName: 'Fireball' },
    expected: { x: 300, y: 200 }  // Must match wizard's final position
  }
}
// ✓ Checks wizard moved
// ✓ Checks spell originated from wizard's FINAL position
```

### Key Takeaways

1. **Test the actual code path users take**
   - Don't bypass UI layers in integration tests
   - Test conversion/transformation functions explicitly

2. **Validate data structures, not just outcomes**
   - Check that action.data contains required fields
   - Verify intermediate data transformations

3. **Add specific assertions for critical behavior**
   - "Token moved" ≠ "Spell came from correct position"
   - Each critical behavior needs its own assertion

4. **Console logs helped debug**
   - Added debug logging showed `tokenId: undefined` in UI path
   - Immediately revealed the UI vs Test difference

5. **Two bugs required two fixes**
   - Execution logic fix (look up token position)
   - Data creation fix (include tokenId in action data)
   - Both were necessary for complete solution

### Documentation Impact

Updated files:
- `TestScenarios.ts` - Added spellOriginPosition assertions
- `TestRunner.ts` - Added spellOriginPosition assertion handler
- `visual-testing-analysis.md` - Documented assertion types
- This file - Lessons learned for future reference

### Future Testing Improvements

1. **Add unit tests for conversion functions**
   ```typescript
   test('convertActionToLegacyData includes tokenId', () => {
     const result = convertActionToLegacyData(spellAction, 'target')
     expect(result.tokenId).toBeDefined()
   })
   ```

2. **Add E2E tests simulating real user workflows**
   - Open event editor
   - Select token
   - Add movement
   - Add spell
   - Execute
   - Verify spell origin

3. **Add data structure schema validation**
   - Use Zod or similar to validate action.data structure
   - Enforce required fields at type level

4. **Monitor for similar patterns**
   - Any UI → Store conversion could have this issue
   - Attack actions also needed same fix
   - Interaction events might have similar gaps

## General Testing Principles

### Test Pyramid for MapMaker

**Unit Tests (Missing - TODO):**
- Conversion functions (convertActionToLegacyData)
- Utility functions (position calculations, etc.)
- Store actions in isolation

**Integration Tests (Current - Visual Tests):**
- Timeline execution flow
- Token movement + spell coordination
- Multi-action sequences

**E2E Tests (Missing - TODO):**
- Full user workflows
- UI → Store → Canvas rendering
- Error handling and edge cases

### When Tests Miss Bugs

Tests can miss bugs when:
1. **They bypass layers** - Testing Store directly instead of UI → Store
2. **They don't validate intermediate state** - Only checking final outcomes
3. **They use different code paths** - Test setup vs real user actions
4. **They lack specific assertions** - Generic checks miss specific bugs
5. **They don't test transformations** - Conversion/mapping logic untested

### How to Catch These Gaps

1. **Add logging** - Console logs reveal which code path is executing
2. **Compare test vs UI** - Run both and check for differences
3. **Validate data structures** - Check intermediate data, not just outcomes
4. **Test conversion layers** - Explicitly test transformation functions
5. **Add integration points** - Test where components connect

This bug taught us that **comprehensive testing requires validating both the logic AND the data flow through the system**.
