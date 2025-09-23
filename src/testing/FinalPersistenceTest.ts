import useMapStore from '@/store/mapStore'
import useRoundStore from '@/store/roundStore'

/**
 * Final comprehensive test for spell persistence cleanup
 */
export async function runFinalPersistenceTest() {
  console.log('\n' + '='.repeat(60))
  console.log('🏁 FINAL PERSISTENCE TEST')
  console.log('='.repeat(60))

  const mapStore = useMapStore.getState()
  const roundStore = useRoundStore.getState()

  // Ensure we have a map
  if (!mapStore.currentMap) {
    mapStore.createNewMap('Test Map')
  }

  // Clear any existing persistent areas
  const existingAreas = mapStore.currentMap!.objects.filter(obj => obj.type === 'persistent-area')
  existingAreas.forEach(area => mapStore.deleteObject(area.id))

  console.log('\n📝 Test Setup:')
  console.log('  - Creating 3 spells with different durations')
  console.log('  - Fireball: 1 round')
  console.log('  - Darkness: 3 rounds')
  console.log('  - Web: 5 rounds')

  // Start combat at round 1
  if (!roundStore.isInCombat) {
    roundStore.startCombat(mapStore.currentMap!.id)
  }
  roundStore.goToRound(1)

  const startRound = roundStore.currentRound
  console.log('\n  Starting at round:', startRound)

  // Create test spells
  const spells = [
    {
      name: 'Fireball',
      duration: 1,
      color: '#ff4500',
      position: { x: 200, y: 200 }
    },
    {
      name: 'Darkness',
      duration: 3,
      color: '#000000',
      position: { x: 300, y: 200 }
    },
    {
      name: 'Web',
      duration: 5,
      color: '#f0f0f0',
      position: { x: 400, y: 200 }
    }
  ]

  const createdSpells: any[] = []

  console.log('\n🎯 Creating persistent areas:')
  spells.forEach(spell => {
    const spellArea = {
      id: `test-${spell.name.toLowerCase()}-${Date.now()}`,
      type: 'persistent-area' as const,
      position: spell.position,
      rotation: 0,
      layer: 0,
      isSpellEffect: true,
      roundCreated: startRound,
      spellDuration: spell.duration,
      persistentAreaData: {
        position: spell.position,
        radius: 40,
        color: spell.color,
        opacity: 0.4,
        spellName: spell.name,
        roundCreated: startRound
      }
    }

    mapStore.addSpellEffect(spellArea)
    createdSpells.push(spellArea)
    console.log(`  ✓ ${spell.name} created (${spell.duration} rounds)`)
  })

  // Verify all were created
  const verifyExistence = (round: number) => {
    const results: any = {}
    createdSpells.forEach(spell => {
      const exists = mapStore.currentMap?.objects.some(obj => obj.id === spell.id)
      results[spell.persistentAreaData.spellName] = exists
    })
    return results
  }

  console.log('\n🔄 Testing round progression:')
  const roundTests = [
    { round: 1, expected: { Fireball: true, Darkness: true, Web: true } },
    { round: 2, expected: { Fireball: false, Darkness: true, Web: true } },
    { round: 3, expected: { Fireball: false, Darkness: true, Web: true } },
    { round: 4, expected: { Fireball: false, Darkness: false, Web: true } },
    { round: 5, expected: { Fireball: false, Darkness: false, Web: true } },
    { round: 6, expected: { Fireball: false, Darkness: false, Web: false } }
  ]

  let allPassed = true

  for (const test of roundTests) {
    // Go to the round
    roundStore.goToRound(test.round)
    await new Promise(resolve => setTimeout(resolve, 100))

    const actual = verifyExistence(test.round)
    const passed = JSON.stringify(actual) === JSON.stringify(test.expected)

    console.log(`\n  Round ${test.round}:`)
    Object.entries(actual).forEach(([name, exists]) => {
      const expected = (test.expected as any)[name]
      const icon = exists === expected ? '✅' : '❌'
      console.log(`    ${icon} ${name}: ${exists ? 'exists' : 'removed'} (expected: ${expected ? 'exists' : 'removed'})`)
    })

    if (!passed) {
      allPassed = false
      console.log('    ⚠️ FAILED!')

      // Debug why it failed
      const areas = mapStore.currentMap?.objects.filter(obj => obj.type === 'persistent-area')
      if (areas && areas.length > 0) {
        console.log('\n    📋 Current persistent areas:')
        areas.forEach(area => {
          const expires = (area.roundCreated || 0) + (area.spellDuration || 0)
          console.log(`      - ${area.persistentAreaData?.spellName}: expires at round ${expires}`)
        })
      }
    }
  }

  console.log('\n' + '='.repeat(60))
  if (allPassed) {
    console.log('✅ ALL TESTS PASSED!')
    console.log('Spell persistence cleanup is working correctly.')
  } else {
    console.log('❌ SOME TESTS FAILED!')
    console.log('There are still issues with spell persistence cleanup.')

    // Additional debugging
    console.log('\n🔍 Debug Information:')
    const currentAreas = mapStore.currentMap?.objects.filter(obj => obj.type === 'persistent-area')
    console.log('  Persistent areas remaining:', currentAreas?.length || 0)

    if (currentAreas && currentAreas.length > 0) {
      console.log('\n  Details of remaining areas:')
      currentAreas.forEach(area => {
        console.log(`\n    ${area.persistentAreaData?.spellName}:`)
        console.log('      ID:', area.id)
        console.log('      isSpellEffect:', area.isSpellEffect)
        console.log('      roundCreated:', area.roundCreated)
        console.log('      spellDuration:', area.spellDuration)
        console.log('      Should expire at:', (area.roundCreated || 0) + (area.spellDuration || 0))
      })
    }
  }
  console.log('='.repeat(60))

  // Cleanup
  createdSpells.forEach(spell => mapStore.deleteObject(spell.id))

  return allPassed
}

// Quick test for a single spell
export async function quickSpellTest(spellName: string, duration: number) {
  const mapStore = useMapStore.getState()
  const roundStore = useRoundStore.getState()

  console.log(`\n🧪 Quick test: ${spellName} (${duration} rounds)`)

  // Start combat if needed
  if (!roundStore.isInCombat) {
    roundStore.startCombat(mapStore.currentMap!.id)
  }

  const startRound = roundStore.currentRound
  const testId = `quick-test-${Date.now()}`

  // Create spell
  const spell = {
    id: testId,
    type: 'persistent-area' as const,
    position: { x: 250, y: 250 },
    rotation: 0,
    layer: 0,
    isSpellEffect: true,
    roundCreated: startRound,
    spellDuration: duration,
    persistentAreaData: {
      position: { x: 250, y: 250 },
      radius: 50,
      color: '#9370db',
      opacity: 0.5,
      spellName: spellName,
      roundCreated: startRound
    }
  }

  mapStore.addSpellEffect(spell)
  console.log(`  Created at round ${startRound}`)

  // Test at expiration round
  const expirationRound = startRound + duration
  roundStore.goToRound(expirationRound)
  await new Promise(resolve => setTimeout(resolve, 100))

  const stillExists = mapStore.currentMap?.objects.some(obj => obj.id === testId)
  console.log(`  At round ${expirationRound}: ${stillExists ? '❌ Still exists (WRONG)' : '✅ Removed (CORRECT)'}`)

  // Cleanup
  mapStore.deleteObject(testId)

  return !stillExists
}

// Make available in console
if (typeof window !== 'undefined') {
  (window as any).runFinalPersistenceTest = runFinalPersistenceTest
  (window as any).quickSpellTest = quickSpellTest

  // Convenience shortcuts
  (window as any).testPersistence = runFinalPersistenceTest
  (window as any).testSpell = quickSpellTest
}