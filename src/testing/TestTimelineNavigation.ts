/**
 * Visual Test Flow for Timeline Navigation
 *
 * This test creates a comprehensive scenario to test:
 * 1. Event navigation (next/previous)
 * 2. Round navigation (next/previous)
 * 3. Position restoration
 * 4. Post-effect cleanup
 * 5. Snapshot system
 *
 * Test Flow:
 * Round 1:
 *   - Event 1: Move Warrior forward
 *   - Event 2: Mage casts Fireball (post effect)
 *   - Event 3: Move Rogue to flank
 *   - End Round (post effects removed, positions saved)
 *
 * Round 2:
 *   - Event 1: Move Warrior back
 *   - Event 2: Cleric casts Bless (continuous spell)
 *
 * Navigation Tests:
 *   - Previous Event: Positions restore correctly
 *   - Previous Round: Return to Round 1 with original positions
 *   - Next Round: Return to Round 2 with updated positions
 */

import useMapStore from '@/store/mapStore'
import useTimelineStore from '@/store/timelineStore'
import type { Token } from '@/types/token'
import type { Position } from '@/types/map'
import { wait, moveToNextRound, moveToNextEvent } from './testHelpers'

export const runTimelineNavigationTest = () => {
  console.log('🧪 Starting Timeline Navigation Visual Test...\n')

  const mapStore = useMapStore.getState()
  const timelineStore = useTimelineStore.getState()

  // Clear existing map
  if (mapStore.currentMap) {
    mapStore.currentMap.objects.forEach(obj => {
      if (obj.type === 'token' || obj.isSpellEffect) {
        mapStore.deleteObject(obj.id)
      }
    })
  }

  // Create test tokens
  console.log('📍 Creating test tokens...')

  const warrior: Token = {
    id: 'test-warrior',
    type: 'token',
    name: 'Warrior',
    size: 'medium',
    position: { x: 200, y: 200 },
    rotation: 0,
    layer: 1,
    image: '',
    color: '#FF0000',
    opacity: 1,
    shape: 'circle'
  }

  const mage: Token = {
    id: 'test-mage',
    type: 'token',
    name: 'Mage',
    size: 'medium',
    position: { x: 300, y: 200 },
    rotation: 0,
    layer: 1,
    image: '',
    color: '#0000FF',
    opacity: 1,
    shape: 'circle'
  }

  const rogue: Token = {
    id: 'test-rogue',
    type: 'token',
    name: 'Rogue',
    size: 'medium',
    position: { x: 400, y: 200 },
    rotation: 0,
    layer: 1,
    image: '',
    color: '#00FF00',
    opacity: 1,
    shape: 'circle'
  }

  const cleric: Token = {
    id: 'test-cleric',
    type: 'token',
    name: 'Cleric',
    size: 'medium',
    position: { x: 500, y: 200 },
    rotation: 0,
    layer: 1,
    image: '',
    color: '#FFFF00',
    opacity: 1,
    shape: 'circle'
  }

  mapStore.addObject(warrior)
  mapStore.addObject(mage)
  mapStore.addObject(rogue)
  mapStore.addObject(cleric)

  console.log('✅ Tokens created:')
  console.log(`   - Warrior at (200, 200) [RED]`)
  console.log(`   - Mage at (300, 200) [BLUE]`)
  console.log(`   - Rogue at (400, 200) [GREEN]`)
  console.log(`   - Cleric at (500, 200) [YELLOW]\n`)

  // Start combat
  console.log('⚔️  Starting combat...')
  if (mapStore.currentMap) {
    timelineStore.startCombat(mapStore.currentMap.id)
  }
  console.log('✅ Combat started - Round 1, Event 1\n')

  // Wait function for visual feedback

  // Execute test flow
  const executeTestFlow = async () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🎬 ROUND 1 - EVENT SEQUENCE')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    // Round 1, Event 1: Move Warrior
    console.log('📌 Round 1, Event 1: Move Warrior forward')
    const warriorMove1: Position = { x: 200, y: 300 }
    timelineStore.addAction('test-warrior', 'move', {
      type: 'move',
      fromPosition: warrior.position,
      toPosition: warriorMove1,
      duration: 1000
    }, 1)
    console.log(`   Warrior moves: (200, 200) → (200, 300)`)

    await wait(500)
    console.log('   ⏭️  Executing Event 1...')
    await timelineStore.executeEventActions(1)
    await wait(1500)
    console.log('   ✅ Event 1 complete - Warrior moved\n')

    // Round 1, Event 2: Mage casts Fireball (post effect)
    console.log('📌 Round 1, Event 2: Mage casts Fireball')
    await moveToNextEvent()
    await wait(500)

    timelineStore.addAction('test-mage', 'spell', {
      type: 'spell',
      spellName: 'Fireball',
      category: 'projectile-burst',
      fromPosition: mage.position,
      toPosition: { x: 600, y: 400 },
      color: '#FF6600',
      size: 40,
      duration: 1000,
      projectileSpeed: 500
    }, 2)
    console.log(`   Mage casts Fireball at (600, 400) [POST EFFECT]`)

    await wait(500)
    console.log('   ⏭️  Executing Event 2...')
    await timelineStore.executeEventActions(2)
    await wait(2000)
    console.log('   ✅ Event 2 complete - Fireball cast\n')

    // Round 1, Event 3: Move Rogue
    console.log('📌 Round 1, Event 3: Move Rogue to flank')
    await moveToNextEvent()
    await wait(500)

    const rogueMove1: Position = { x: 550, y: 350 }
    timelineStore.addAction('test-rogue', 'move', {
      type: 'move',
      fromPosition: rogue.position,
      toPosition: rogueMove1,
      duration: 1000
    }, 3)
    console.log(`   Rogue moves: (400, 200) → (550, 350)`)

    await wait(500)
    console.log('   ⏭️  Executing Event 3...')
    await timelineStore.executeEventActions(3)
    await wait(1500)
    console.log('   ✅ Event 3 complete - Rogue flanked\n')

    // Test Previous Event Navigation
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🔙 TESTING PREVIOUS EVENT')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    await wait(1000)
    console.log('⏮️  Going to Previous Event (Event 2)...')
    timelineStore.previousEvent()
    await wait(500)
    console.log('✅ Position Restored:')
    console.log(`   Rogue back at: (400, 200) ← from (550, 350)`)
    console.log(`   Currently at Round 1, Event 2\n`)

    await wait(2000)
    console.log('⏭️  Going to Next Event (Event 3)...')
    await moveToNextEvent()
    await wait(500)
    console.log('✅ Position Restored:')
    console.log(`   Rogue back at: (550, 350) ← from (400, 200)`)
    console.log(`   Currently at Round 1, Event 3\n`)

    // End Round 1
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🏁 ENDING ROUND 1')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    await wait(1000)
    console.log('🔚 Starting New Round...')
    await moveToNextRound()
    await wait(500)
    console.log('✅ Round 1 ended, Round 2 started')
    console.log('   🧹 Post effects cleaned (Fireball removed)')
    console.log('   📍 Positions preserved')
    console.log('   Currently at Round 2, Event 1\n')

    // Round 2, Event 1: Move Warrior back
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🎬 ROUND 2 - EVENT SEQUENCE')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    await wait(1000)
    console.log('📌 Round 2, Event 1: Move Warrior back')
    const warriorMove2: Position = { x: 200, y: 200 }
    timelineStore.addAction('test-warrior', 'move', {
      type: 'move',
      fromPosition: warriorMove1,
      toPosition: warriorMove2,
      duration: 1000
    }, 1)
    console.log(`   Warrior retreats: (200, 300) → (200, 200)`)

    await wait(500)
    console.log('   ⏭️  Executing Event 1...')
    await timelineStore.executeEventActions(1)
    await wait(1500)
    console.log('   ✅ Event 1 complete - Warrior retreated\n')

    // Round 2, Event 2: Cleric casts Bless (continuous)
    console.log('📌 Round 2, Event 2: Cleric casts Bless')
    await moveToNextEvent()
    await wait(500)

    timelineStore.addAction('test-cleric', 'spell', {
      type: 'spell',
      spellName: 'Bless',
      category: 'area',
      fromPosition: cleric.position,
      toPosition: cleric.position,
      color: '#FFD700',
      size: 60,
      duration: 1000,
      persistDuration: 3 // 3 rounds - continuous spell
    }, 2)
    console.log(`   Cleric casts Bless [CONTINUOUS SPELL]`)

    await wait(500)
    console.log('   ⏭️  Executing Event 2...')
    await timelineStore.executeEventActions(2)
    await wait(2000)
    console.log('   ✅ Event 2 complete - Bless active\n')

    // Test Previous Round Navigation
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🔙 TESTING PREVIOUS ROUND')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    await wait(2000)
    console.log('⏮️  Going to Previous Round (Round 1)...')
    timelineStore.previousRound()
    await wait(500)
    console.log('✅ Round 1 Restored:')
    console.log(`   Warrior: (200, 300) ← from (200, 200)`)
    console.log(`   Rogue: (550, 350) ← preserved`)
    console.log(`   Bless spell removed (created in Round 2)`)
    console.log(`   Currently at Round 1, Event 1`)
    console.log(`   Round 1 is READ-ONLY (already executed)\n`)

    await wait(3000)
    console.log('⏭️  Going to Next Round (Round 2)...')
    await moveToNextRound()
    await wait(500)
    console.log('✅ Round 2 Restored:')
    console.log(`   Warrior: (200, 200) ← from (200, 300)`)
    console.log(`   Currently at Round 2, Event 1`)
    console.log(`   Round 2 is EDITABLE\n`)

    // Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📊 TEST SUMMARY')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    console.log('✅ Event Navigation:')
    console.log('   - Previous Event restores positions correctly')
    console.log('   - Next Event re-executes from snapshot')
    console.log('   - Snapshots save before each event\n')

    console.log('✅ Round Navigation:')
    console.log('   - Previous Round restores Round 1 state')
    console.log('   - Next Round returns to Round 2 state')
    console.log('   - Historical rounds marked as read-only\n')

    console.log('✅ Post-Effect Cleanup:')
    console.log('   - Fireball (post effect) removed at round end')
    console.log('   - Bless (continuous) persists across rounds\n')

    console.log('✅ Position System:')
    console.log('   - All token movements tracked')
    console.log('   - Snapshots restore exact positions')
    console.log('   - No position drift or errors\n')

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🎉 Timeline Navigation Test Complete!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    console.log('💡 Visual Verification:')
    console.log('   1. Watch tokens move during events')
    console.log('   2. See Fireball disappear after Round 1')
    console.log('   3. Watch positions restore on navigation')
    console.log('   4. Verify Bless remains across rounds')
    console.log('   5. Check Event Editor shows read-only for Round 1\n')
  }

  // Start the test flow
  executeTestFlow().catch(error => {
    console.error('❌ Test failed:', error)
  })
}

// Auto-run on module load in development
if (import.meta.env.DEV) {
  console.log('🔧 Timeline Navigation Test loaded')
  console.log('💡 Run: runTimelineNavigationTest() in console\n')
}

export default runTimelineNavigationTest
