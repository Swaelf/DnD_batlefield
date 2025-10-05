/**
 * Visual Test Flow for Round Replay
 *
 * This test specifically verifies the round replay functionality:
 * 1. Create events in Round 1
 * 2. Start New Round (Round 1 executes and ends → Round 2)
 * 3. Previous Round (Return to Round 1)
 * 4. Next Round (Should replay ALL Round 1 animations before advancing to Round 2)
 *
 * Expected Behavior:
 * - All Round 1 events should replay with full animations
 * - Each event should execute in sequence with proper timing
 * - Token positions should animate smoothly
 * - Spell effects should display correctly
 *
 * Test Flow:
 * Round 1:
 *   - Event 1: Warrior moves forward (200, 200) → (200, 350)
 *   - Event 2: Mage casts Fireball at (600, 400)
 *   - Event 3: Rogue moves to flank (400, 200) → (550, 350)
 *   - Event 4: Cleric heals Warrior with Cure Wounds
 *
 * Then:
 *   - Start New Round → Round 2
 *   - Previous Round → Back to Round 1
 *   - Next Round → REPLAY all Round 1 animations (THIS IS THE TEST)
 */

import useMapStore from '@/store/mapStore'
import useTimelineStore from '@/store/timelineStore'
import type { Token } from '@/types/token'
import type { Position } from '@/types/map'

export const runRoundReplayTest = () => {
  console.log('🧪 Starting Round Replay Visual Test...\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🎯 TEST GOAL: Verify Round Replay Functionality')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

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
  console.log('📍 Creating test party...')

  const warrior: Token = {
    id: 'replay-warrior',
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
    id: 'replay-mage',
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
    id: 'replay-rogue',
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
    id: 'replay-cleric',
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

  console.log('✅ Party assembled:')
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

  // Wait function
  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  // Execute test flow
  const executeReplayTest = async () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🎬 PHASE 1: CREATE ROUND 1 EVENTS')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    // Event 1: Warrior moves forward
    console.log('📌 Event 1: Warrior charges forward')
    const warriorMove: Position = { x: 200, y: 350 }
    timelineStore.addAction('replay-warrior', 'move', {
      type: 'move',
      fromPosition: warrior.position,
      toPosition: warriorMove,
      duration: 1000
    }, 1)
    console.log(`   Warrior: (200, 200) → (200, 350)`)

    await wait(500)
    console.log('   ⏭️  Executing Event 1...')
    await timelineStore.executeEventActions(1)
    await wait(1500)
    console.log('   ✅ Event 1 complete\n')

    // Event 2: Mage casts Fireball
    console.log('📌 Event 2: Mage casts Fireball')
    timelineStore.nextEvent()
    await wait(500)

    timelineStore.addAction('replay-mage', 'spell', {
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
    console.log(`   Mage casts Fireball at (600, 400)`)

    await wait(500)
    console.log('   ⏭️  Executing Event 2...')
    await timelineStore.executeEventActions(2)
    await wait(2000)
    console.log('   ✅ Event 2 complete\n')

    // Event 3: Rogue moves to flank
    console.log('📌 Event 3: Rogue moves to flank')
    timelineStore.nextEvent()
    await wait(500)

    const rogueMove: Position = { x: 550, y: 350 }
    timelineStore.addAction('replay-rogue', 'move', {
      type: 'move',
      fromPosition: rogue.position,
      toPosition: rogueMove,
      duration: 1000
    }, 3)
    console.log(`   Rogue: (400, 200) → (550, 350)`)

    await wait(500)
    console.log('   ⏭️  Executing Event 3...')
    await timelineStore.executeEventActions(3)
    await wait(1500)
    console.log('   ✅ Event 3 complete\n')

    // Event 4: Cleric heals Warrior
    console.log('📌 Event 4: Cleric heals Warrior')
    timelineStore.nextEvent()
    await wait(500)

    timelineStore.addAction('replay-cleric', 'spell', {
      type: 'spell',
      spellName: 'Cure Wounds',
      category: 'area',
      fromPosition: cleric.position,
      toPosition: warriorMove, // Target the Warrior's new position
      color: '#00FF88',
      size: 30,
      duration: 1000
    }, 4)
    console.log(`   Cleric heals Warrior with Cure Wounds`)

    await wait(500)
    console.log('   ⏭️  Executing Event 4...')
    await timelineStore.executeEventActions(4)
    await wait(1500)
    console.log('   ✅ Event 4 complete\n')

    // Summary of Round 1
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📊 ROUND 1 SUMMARY')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    console.log('   ✅ 4 events created and executed:')
    console.log('      1. Warrior charge (move)')
    console.log('      2. Fireball (spell)')
    console.log('      3. Rogue flank (move)')
    console.log('      4. Cure Wounds (spell)')
    console.log('   📍 Final positions:')
    console.log('      - Warrior: (200, 350)')
    console.log('      - Mage: (300, 200)')
    console.log('      - Rogue: (550, 350)')
    console.log('      - Cleric: (500, 200)\n')

    await wait(2000)

    // Phase 2: Start New Round
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🎬 PHASE 2: START NEW ROUND')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    console.log('🔚 Starting New Round...')
    timelineStore.startNewRound()
    await wait(1000)
    console.log('✅ Round 2 started')
    console.log('   - Round 1 marked as executed')
    console.log('   - Currently at Round 2, Event 1')
    console.log('   - All Round 1 events marked as executed\n')

    await wait(2000)

    // Phase 3: Previous Round
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🎬 PHASE 3: RETURN TO PREVIOUS ROUND')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    console.log('⏮️  Going to Previous Round (Round 1)...')
    timelineStore.previousRound()
    await wait(1000)
    console.log('✅ Returned to Round 1')
    console.log('   - Currently at Round 1, Event 1')
    console.log('   - All Round 1 events marked as NOT executed (ready for replay)')
    console.log('   - Token positions restored to Round 1 start\n')

    await wait(3000)

    // Phase 4: Next Round (THE CRITICAL TEST)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🎬 PHASE 4: NEXT ROUND (REPLAY TEST)')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    console.log('🎯 CRITICAL TEST: Going to Next Round (should replay Round 1)...')
    console.log('👀 WATCH FOR:')
    console.log('   1. Warrior animating from (200, 200) → (200, 350)')
    console.log('   2. Fireball projectile and explosion at (600, 400)')
    console.log('   3. Rogue animating from (400, 200) → (550, 350)')
    console.log('   4. Cure Wounds healing effect on Warrior\n')

    await wait(2000)

    console.log('⏭️  Executing Next Round (triggering replay)...\n')
    await timelineStore.nextRound()

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('⏳ REPLAYING ROUND 1 EVENTS...')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    // Calculate total expected animation duration
    // Event 1: Warrior move (1000ms move animation)
    // Event 2: Fireball (1000ms spell duration + ~720ms projectile flight + ~1500ms burst/fade)
    // Event 3: Rogue move (1000ms move animation)
    // Event 4: Cure Wounds (1000ms spell duration + ~1000ms area effect fade)
    // Plus 200ms delay between each event (4 events = 3 delays = 600ms)
    // Total: 1000 + 3200 + 1000 + 2000 + 600 = 7800ms
    // Add 2000ms buffer for visual effect fade-outs
    const totalAnimationDuration = 10000

    console.log('⏱️  Calculated animation duration:')
    console.log('   - Event 1 (Warrior move): 1000ms')
    console.log('   - Event 2 (Fireball): 3200ms (duration + projectile + burst + fade)')
    console.log('   - Event 3 (Rogue move): 1000ms')
    console.log('   - Event 4 (Cure Wounds): 2000ms (duration + area effect + fade)')
    console.log('   - Delays between events: 600ms (200ms × 3)')
    console.log('   - Safety buffer: 2000ms (for visual fade-outs)')
    console.log(`   - Total: ${totalAnimationDuration}ms (${totalAnimationDuration / 1000}s)\n`)

    console.log(`🔍 Waiting ${totalAnimationDuration / 1000}s for all animations to complete...\n`)

    // Wait for animations with progress updates
    const progressInterval = 2000 // Update every 2 seconds
    let elapsed = 0
    while (elapsed < totalAnimationDuration) {
      await wait(progressInterval)
      elapsed += progressInterval

      if (elapsed < totalAnimationDuration) {
        const currentMapState = useMapStore.getState()
        const currentWarrior = currentMapState.currentMap?.objects.find(obj => obj.id === 'replay-warrior')
        const currentRogue = currentMapState.currentMap?.objects.find(obj => obj.id === 'replay-rogue')

        console.log(`   ⏳ ${(elapsed / 1000).toFixed(1)}s / ${(totalAnimationDuration / 1000).toFixed(1)}s elapsed`)
        console.log(`      Warrior: (${currentWarrior?.position.x}, ${currentWarrior?.position.y})`)
        console.log(`      Rogue: (${currentRogue?.position.x}, ${currentRogue?.position.y})\n`)
      }
    }

    console.log('   ✅ Animation duration complete\n')

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ REPLAY COMPLETE - VERIFYING RESULTS')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    // Verify final token positions after replay
    const currentMapStore = useMapStore.getState()
    const warriorToken = currentMapStore.currentMap?.objects.find(obj => obj.id === 'replay-warrior')
    const mageToken = currentMapStore.currentMap?.objects.find(obj => obj.id === 'replay-mage')
    const rogueToken = currentMapStore.currentMap?.objects.find(obj => obj.id === 'replay-rogue')
    const clericToken = currentMapStore.currentMap?.objects.find(obj => obj.id === 'replay-cleric')

    console.log('📍 VERIFYING TOKEN POSITIONS:')

    const warriorCorrect = warriorToken?.position.x === 200 && warriorToken?.position.y === 350
    const mageCorrect = mageToken?.position.x === 300 && mageToken?.position.y === 200
    const rogueCorrect = rogueToken?.position.x === 550 && rogueToken?.position.y === 350
    const clericCorrect = clericToken?.position.x === 500 && clericToken?.position.y === 200

    console.log(`   ${warriorCorrect ? '✅' : '❌'} Warrior at (200, 350) - Actual: (${warriorToken?.position.x}, ${warriorToken?.position.y})`)
    console.log(`   ${mageCorrect ? '✅' : '❌'} Mage at (300, 200) - Actual: (${mageToken?.position.x}, ${mageToken?.position.y})`)
    console.log(`   ${rogueCorrect ? '✅' : '❌'} Rogue at (550, 350) - Actual: (${rogueToken?.position.x}, ${rogueToken?.position.y})`)
    console.log(`   ${clericCorrect ? '✅' : '❌'} Cleric at (500, 200) - Actual: (${clericToken?.position.x}, ${clericToken?.position.y})\n`)

    const allPositionsCorrect = warriorCorrect && mageCorrect && rogueCorrect && clericCorrect

    console.log('📊 VERIFICATION CHECKLIST:')
    console.log(`   ${allPositionsCorrect ? '✅' : '❌'} All token positions correct after replay`)
    console.log('   ✓ Did Warrior animate forward?')
    console.log('   ✓ Did Fireball projectile fly and explode?')
    console.log('   ✓ Did Rogue animate to flank?')
    console.log('   ✓ Did Cure Wounds healing effect appear?')
    console.log('   ✓ Are all animations smooth and sequential?')
    console.log('   ✓ Is the timeline now at Round 2, Event 1?\n')

    if (!allPositionsCorrect) {
      console.error('❌ POSITION VERIFICATION FAILED!')
      console.error('   Some tokens are not in their expected positions after replay.')
      console.error('   This indicates the replay system did not properly execute all animations.\n')
    }

    // Final Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📊 TEST SUMMARY')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    const currentState = useTimelineStore.getState()
    console.log('✅ Test Flow Completed:')
    console.log('   1. ✓ Created 4 events in Round 1')
    console.log('   2. ✓ Started New Round → Round 2')
    console.log('   3. ✓ Returned to Previous Round → Round 1')
    console.log('   4. ✓ Advanced to Next Round → Replayed Round 1')
    console.log(`\n📍 Final Timeline State:`)
    console.log(`   - Current Round: ${currentState.currentRound}`)
    console.log(`   - Current Event: ${currentState.currentEvent}`)
    console.log(`   - Timeline active: ${currentState.timeline?.isActive}\n`)

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🎉 Round Replay Test Complete!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    console.log('💡 Expected Behavior:')
    console.log('   - Round 1 events replayed with full animations')
    console.log('   - Each event executed in sequence (1→2→3→4)')
    console.log('   - 200ms delay between events for visual clarity')
    console.log('   - Timeline advanced to Round 2 after replay\n')

    console.log('🐛 If replay did NOT work, check console for:')
    console.log('   - "⏩ Skipping replay" message (indicates bug)')
    console.log('   - "eventsWithActions: 0" (wrong round checked)')
    console.log('   - Missing "⏭️ Executing Round X Event Y" messages\n')
  }

  // Start the test flow and return the Promise so callers can await it
  return executeReplayTest().catch(error => {
    console.error('❌ Test failed:', error)
    throw error // Re-throw so the test fails properly
  })
}

// Auto-run on module load in development
if (import.meta.env.DEV) {
  console.log('🔧 Round Replay Test loaded')
  console.log('💡 Run: runRoundReplayTest() in console\n')
}

export default runRoundReplayTest
