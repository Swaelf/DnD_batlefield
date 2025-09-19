# Manual Test for Spell Animation System

## Test Date: 2025-09-18

### Pre-Test Setup
1. Start development server: `pnpm dev`
2. Open browser console (F12) to monitor for errors
3. Navigate to http://localhost:3000

### Test Steps

#### Step 1: Create Map
- [ ] Click "New Map" or use existing map
- [ ] Verify map is created/loaded
- [ ] Check console for any errors

#### Step 2: Add Token (Optional)
- [ ] Add a token to the map
- [ ] Position it somewhere visible
- [ ] Note: Can also use Environment Caster

#### Step 3: Start Combat
- [ ] Click "Start Combat" button at bottom
- [ ] Verify "Round 1" appears
- [ ] Console should show: "Is in combat: true"

#### Step 4: Open Event Editor
- [ ] Click the calendar icon in combat tracker
- [ ] Verify Event Editor popup opens
- [ ] Check layout: spell config should be in left sidebar

#### Step 5: Create Spell Event
- [ ] Select a token OR check "Environment Caster"
- [ ] Click "Spell" event type (lightning icon)
- [ ] In left sidebar, configure spell:
  - [ ] Choose preset: "Fireball"
  - [ ] Or set custom: Projectile-Burst, Red color, Size 20
- [ ] Set target position (click map or enter coords)
- [ ] Click "Add Event"
- [ ] Verify event appears in right panel list

#### Step 6: Trigger Animation
- [ ] Close Event Editor
- [ ] Click "Next Round" button (forward arrow)
- [ ] Watch for spell animation when entering Round 2

### Expected Results

#### Console Output (in order):
1. "Round changed from 1 to 2"
2. "Executing animations for round: 2"
3. "Processing spell event"
4. "Creating spell effect: Fireball"
5. "MapStore: Adding spell to map"
6. "Rendering spell: spell-[id]"
7. "ProjectileSpell component mounted"

#### Visual Results:
- Spell projectile should appear at cast position
- Projectile should animate toward target
- Burst effect should trigger at target (if projectile-burst)
- Effect should disappear after animation

### Error Checks

#### Previous Error (FIXED):
- ❌ "Cannot read properties of null (reading 'className')"
- ✅ This error should NOT appear anymore

#### Current Status:
- [ ] No TypeErrors in console
- [ ] Spell animation plays correctly
- [ ] Animation completes without errors
- [ ] Spell object is cleaned up after animation

### Test Result: [PASS/FAIL]

### Notes:
- Fixed null tokenNode handling in useTokenAnimation.ts
- Spell events now correctly handle environment casting
- Added comprehensive test coverage in spellSystem.test.ts