import useMapStore from '@/store/mapStore'
import useTimelineStore from '@/store/timelineStore'
import type { SpellEventData } from '@/types/timeline'

interface TestResult {
  testName: string
  passed: boolean
  errors: string[]
  details: any
}

/**
 * Comprehensive unit tests for spell persistence and cleanup
 */
export class SpellPersistenceTests {
  private results: TestResult[] = []

  constructor() {
    // Ensure we have a map
    const mapStore = useMapStore.getState()
    if (!mapStore.currentMap) {
      mapStore.createNewMap('Test Map')
    }
  }

  /**
   * Run all spell persistence tests
   */
  async runAll(): Promise<TestResult[]> {
    console.log('🧪 Starting Spell Persistence Tests...\n')

    this.results = []

    // Run each test
    await this.testFireballPersistence()
    await this.testDarknessPersistence()
    await this.testWebPersistence()
    await this.testMagicMissileNoPersistence()
    await this.testCloudOfDaggersPersistence()
    await this.testMultipleSpellsCleanup()
    await this.testPersistenceWithRoundJumps()

    // Print summary
    this.printSummary()

    return this.results
  }

  /**
   * Test Fireball - should persist for exactly 1 round
   */
  async testFireballPersistence(): Promise<TestResult> {
    console.log('📍 Test: Fireball Persistence (1 round)')

    const mapStore = useMapStore.getState()
    const roundStore = useTimelineStore.getState()
    const errors: string[] = []
    const details: any = {}

    // Start fresh combat
    roundStore.startCombat(mapStore.currentMap!.id)
    const startRound = roundStore.currentEvent
    details.startRound = startRound

    // Create Fireball persistent area
    const fireballArea = this.createPersistentArea('Fireball', startRound, 1, {
      x: 300, y: 300
    }, '#ff4500', 40)

    mapStore.addSpellEffect(fireballArea)

    // Check it exists initially
    let exists = this.checkAreaExists(fireballArea.id)
    if (!exists) {
      errors.push('Fireball area not created')
    }
    details.existsAtCreation = exists

    // Advance to next round
    await roundStore.nextEvent()
    await this.wait(100)

    // Check if removed after 1 round
    exists = this.checkAreaExists(fireballArea.id)
    details.existsAfterRound1 = exists
    details.currentEvent = roundStore.currentEvent

    if (exists) {
      errors.push(`Fireball area still exists at round ${roundStore.currentEvent}, should be removed after 1 round`)

      // Debug info
      const area = mapStore.currentMap?.objects.find(obj => obj.id === fireballArea.id)
      if (area) {
        details.debugInfo = {
          roundCreated: area.roundCreated,
          spellDuration: area.spellDuration,
          isSpellEffect: area.isSpellEffect,
          expectedRemovalRound: (area.roundCreated || 0) + (area.spellDuration || 0)
        }
      }
    }

    // Cleanup
    mapStore.deleteObject(fireballArea.id)

    const result: TestResult = {
      testName: 'Fireball Persistence (1 round)',
      passed: errors.length === 0,
      errors,
      details
    }

    this.results.push(result)
    this.printTestResult(result)

    return result
  }

  /**
   * Test Darkness - should persist for 3 rounds
   */
  async testDarknessPersistence(): Promise<TestResult> {
    console.log('📍 Test: Darkness Persistence (3 rounds)')

    const mapStore = useMapStore.getState()
    const roundStore = useTimelineStore.getState()
    const errors: string[] = []
    const details: any = {}

    // Reset to round 1
    roundStore.goToEvent(1)
    const startRound = roundStore.currentEvent
    details.startRound = startRound

    // Create Darkness persistent area
    const darknessArea = this.createPersistentArea('Darkness', startRound, 3, {
      x: 400, y: 300
    }, '#000000', 60)

    mapStore.addSpellEffect(darknessArea)

    // Check through rounds 1-3 (should exist)
    for (let i = 0; i < 3; i++) {
      if (i > 0) {
        await roundStore.nextEvent()
        await this.wait(100)
      }

      const exists = this.checkAreaExists(darknessArea.id)
      details[`round${roundStore.currentEvent}Exists`] = exists

      if (!exists) {
        errors.push(`Darkness should exist at round ${roundStore.currentEvent} but was removed`)
      }
    }

    // Advance to round 4 (should be removed)
    await roundStore.nextEvent()
    await this.wait(100)

    const existsAfterExpiry = this.checkAreaExists(darknessArea.id)
    details.existsAtRound4 = existsAfterExpiry

    if (existsAfterExpiry) {
      errors.push(`Darkness still exists at round ${roundStore.currentEvent}, should be removed after 3 rounds`)
    }

    // Cleanup
    mapStore.deleteObject(darknessArea.id)

    const result: TestResult = {
      testName: 'Darkness Persistence (3 rounds)',
      passed: errors.length === 0,
      errors,
      details
    }

    this.results.push(result)
    this.printTestResult(result)

    return result
  }

  /**
   * Test Web - should persist for 10 rounds (simulating 1 minute)
   */
  async testWebPersistence(): Promise<TestResult> {
    console.log('📍 Test: Web Persistence (10 rounds)')

    const mapStore = useMapStore.getState()
    const roundStore = useTimelineStore.getState()
    const errors: string[] = []
    const details: any = {}

    // Reset to round 1
    roundStore.goToEvent(1)
    const startRound = roundStore.currentEvent
    details.startRound = startRound

    // Create Web persistent area
    const webArea = this.createPersistentArea('Web', startRound, 10, {
      x: 500, y: 300
    }, '#f0f0f0', 80)

    mapStore.addSpellEffect(webArea)

    // Check at rounds 1, 5, and 10 (should exist)
    const checkRounds = [1, 5, 10]
    for (const targetRound of checkRounds) {
      roundStore.goToEvent(targetRound)
      await this.wait(100)

      const exists = this.checkAreaExists(webArea.id)
      details[`round${targetRound}Exists`] = exists

      if (!exists) {
        errors.push(`Web should exist at round ${targetRound} but was removed`)
      }
    }

    // Check at round 11 (should be removed)
    roundStore.goToEvent(11)
    await this.wait(100)

    const existsAfterExpiry = this.checkAreaExists(webArea.id)
    details.existsAtRound11 = existsAfterExpiry

    if (existsAfterExpiry) {
      errors.push(`Web still exists at round 11, should be removed after 10 rounds`)
    }

    // Cleanup
    mapStore.deleteObject(webArea.id)

    const result: TestResult = {
      testName: 'Web Persistence (10 rounds)',
      passed: errors.length === 0,
      errors,
      details
    }

    this.results.push(result)
    this.printTestResult(result)

    return result
  }

  /**
   * Test Magic Missile - should have no persistent area
   */
  async testMagicMissileNoPersistence(): Promise<TestResult> {
    console.log('📍 Test: Magic Missile (no persistence)')

    const mapStore = useMapStore.getState()
    const roundStore = useTimelineStore.getState()
    const errors: string[] = []
    const details: any = {}

    // Reset to round 1
    roundStore.goToEvent(1)
    const startRound = roundStore.currentEvent

    // Count persistent areas before
    const areasBefore = mapStore.currentMap?.objects.filter(
      obj => obj.type === 'persistent-area'
    ).length || 0

    // Create Magic Missile spell (no persistence)
    const spellObject = {
      id: `spell-magic-missile-${Date.now()}`,
      type: 'spell' as const,
      position: { x: 300, y: 400 },
      rotation: 0,
      layer: 100,
      isSpellEffect: true,
      spellData: {
        type: 'spell' as const,
        spellName: 'Magic Missile',
        category: 'projectile' as const,
        fromPosition: { x: 200, y: 400 },
        toPosition: { x: 400, y: 400 },
        color: '#9370db',
        size: 8,
        duration: 1000,
        persistDuration: 0, // No persistence
        roundCreated: startRound
      } as SpellEventData,
      roundCreated: startRound,
      spellDuration: 0
    }

    mapStore.addSpellEffect(spellObject)
    await this.wait(200)

    // Count persistent areas after
    const areasAfter = mapStore.currentMap?.objects.filter(
      obj => obj.type === 'persistent-area'
    ).length || 0

    details.persistentAreasBefore = areasBefore
    details.persistentAreasAfter = areasAfter
    details.persistentAreaCreated = areasAfter > areasBefore

    if (areasAfter > areasBefore) {
      errors.push('Magic Missile should not create persistent areas')
    }

    // Cleanup
    mapStore.deleteObject(spellObject.id)

    const result: TestResult = {
      testName: 'Magic Missile (no persistence)',
      passed: errors.length === 0,
      errors,
      details
    }

    this.results.push(result)
    this.printTestResult(result)

    return result
  }

  /**
   * Test Cloud of Daggers - should persist for 10 rounds
   */
  async testCloudOfDaggersPersistence(): Promise<TestResult> {
    console.log('📍 Test: Cloud of Daggers Persistence (10 rounds)')

    const mapStore = useMapStore.getState()
    const roundStore = useTimelineStore.getState()
    const errors: string[] = []
    const details: any = {}

    // Reset to round 1
    roundStore.goToEvent(1)
    const startRound = roundStore.currentEvent

    // Create Cloud of Daggers area
    const cloudArea = this.createPersistentArea('Cloud of Daggers', startRound, 10, {
      x: 350, y: 350
    }, '#708090', 20)

    mapStore.addSpellEffect(cloudArea)

    // Jump to round 10 (should still exist)
    roundStore.goToEvent(10)
    await this.wait(100)

    let exists = this.checkAreaExists(cloudArea.id)
    details.existsAtRound10 = exists

    if (!exists) {
      errors.push('Cloud of Daggers removed too early at round 10')
    }

    // Jump to round 11 (should be removed)
    roundStore.goToEvent(11)
    await this.wait(100)

    exists = this.checkAreaExists(cloudArea.id)
    details.existsAtRound11 = exists

    if (exists) {
      errors.push('Cloud of Daggers not removed at round 11')
    }

    // Cleanup
    mapStore.deleteObject(cloudArea.id)

    const result: TestResult = {
      testName: 'Cloud of Daggers Persistence (10 rounds)',
      passed: errors.length === 0,
      errors,
      details
    }

    this.results.push(result)
    this.printTestResult(result)

    return result
  }

  /**
   * Test multiple spells with different durations
   */
  async testMultipleSpellsCleanup(): Promise<TestResult> {
    console.log('📍 Test: Multiple Spells Cleanup')

    const mapStore = useMapStore.getState()
    const roundStore = useTimelineStore.getState()
    const errors: string[] = []
    const details: any = {}

    // Reset to round 1
    roundStore.goToEvent(1)
    const startRound = roundStore.currentEvent

    // Create multiple spells with different durations
    const spell1 = this.createPersistentArea('Spell1', startRound, 1, { x: 200, y: 200 }, '#ff0000', 30)
    const spell2 = this.createPersistentArea('Spell2', startRound, 2, { x: 300, y: 200 }, '#00ff00', 30)
    const spell3 = this.createPersistentArea('Spell3', startRound, 3, { x: 400, y: 200 }, '#0000ff', 30)

    mapStore.addSpellEffect(spell1)
    mapStore.addSpellEffect(spell2)
    mapStore.addSpellEffect(spell3)

    // Round 2: spell1 should be gone, others remain
    await roundStore.nextEvent()
    await this.wait(100)

    details.round2 = {
      spell1Exists: this.checkAreaExists(spell1.id),
      spell2Exists: this.checkAreaExists(spell2.id),
      spell3Exists: this.checkAreaExists(spell3.id)
    }

    if (details.round2.spell1Exists) {
      errors.push('Spell1 should be removed at round 2')
    }
    if (!details.round2.spell2Exists) {
      errors.push('Spell2 should exist at round 2')
    }
    if (!details.round2.spell3Exists) {
      errors.push('Spell3 should exist at round 2')
    }

    // Round 3: spell2 should be gone, spell3 remains
    await roundStore.nextEvent()
    await this.wait(100)

    details.round3 = {
      spell2Exists: this.checkAreaExists(spell2.id),
      spell3Exists: this.checkAreaExists(spell3.id)
    }

    if (details.round3.spell2Exists) {
      errors.push('Spell2 should be removed at round 3')
    }
    if (!details.round3.spell3Exists) {
      errors.push('Spell3 should exist at round 3')
    }

    // Round 4: all should be gone
    await roundStore.nextEvent()
    await this.wait(100)

    details.round4 = {
      spell3Exists: this.checkAreaExists(spell3.id)
    }

    if (details.round4.spell3Exists) {
      errors.push('Spell3 should be removed at round 4')
    }

    // Cleanup
    mapStore.deleteObject(spell1.id)
    mapStore.deleteObject(spell2.id)
    mapStore.deleteObject(spell3.id)

    const result: TestResult = {
      testName: 'Multiple Spells Cleanup',
      passed: errors.length === 0,
      errors,
      details
    }

    this.results.push(result)
    this.printTestResult(result)

    return result
  }

  /**
   * Test persistence with round jumps (not just sequential)
   */
  async testPersistenceWithRoundJumps(): Promise<TestResult> {
    console.log('📍 Test: Persistence with Round Jumps')

    const mapStore = useMapStore.getState()
    const roundStore = useTimelineStore.getState()
    const errors: string[] = []
    const details: any = {}

    // Start at round 1
    roundStore.goToEvent(1)

    // Create a spell that lasts 5 rounds
    const testSpell = this.createPersistentArea('Jump Test', 1, 5, { x: 250, y: 250 }, '#ff00ff', 40)
    mapStore.addSpellEffect(testSpell)

    // Jump directly to round 5 (should still exist)
    roundStore.goToEvent(5)
    await this.wait(100)

    details.existsAtRound5 = this.checkAreaExists(testSpell.id)
    if (!details.existsAtRound5) {
      errors.push('Spell should exist at round 5')
    }

    // Jump back to round 3 (should still exist)
    roundStore.goToEvent(3)
    await this.wait(100)

    details.existsAtRound3 = this.checkAreaExists(testSpell.id)
    if (!details.existsAtRound3) {
      errors.push('Spell should exist at round 3')
    }

    // Jump to round 6 (should be removed)
    roundStore.goToEvent(6)
    await this.wait(100)

    details.existsAtRound6 = this.checkAreaExists(testSpell.id)
    if (details.existsAtRound6) {
      errors.push('Spell should be removed at round 6')
    }

    // Jump back to round 2 (should NOT reappear)
    roundStore.goToEvent(2)
    await this.wait(100)

    details.reappearsAtRound2 = this.checkAreaExists(testSpell.id)
    if (details.reappearsAtRound2) {
      errors.push('Removed spell should not reappear when jumping back')
    }

    // Cleanup
    mapStore.deleteObject(testSpell.id)

    const result: TestResult = {
      testName: 'Persistence with Round Jumps',
      passed: errors.length === 0,
      errors,
      details
    }

    this.results.push(result)
    this.printTestResult(result)

    return result
  }

  /**
   * Helper: Create a persistent area object
   */
  private createPersistentArea(
    spellName: string,
    roundCreated: number,
    duration: number,
    position: { x: number, y: number },
    color: string,
    radius: number
  ) {
    return {
      id: `test-${spellName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      type: 'persistent-area' as const,
      position,
      rotation: 0,
      layer: 0,
      isSpellEffect: true, // Critical for cleanup!
      persistentAreaData: {
        position,
        radius,
        color,
        opacity: 0.4,
        spellName,
        roundCreated
      },
      roundCreated,
      spellDuration: duration
    }
  }

  /**
   * Helper: Check if an area exists
   */
  private checkAreaExists(id: string): boolean {
    const mapStore = useMapStore.getState()
    return mapStore.currentMap?.objects.some(obj => obj.id === id) || false
  }

  /**
   * Helper: Wait for a duration
   */
  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Print individual test result
   */
  private printTestResult(result: TestResult) {
    const icon = result.passed ? '✅' : '❌'
    console.log(`${icon} ${result.testName}`)

    if (!result.passed) {
      result.errors.forEach(error => {
        console.log(`   ⚠️ ${error}`)
      })
      console.log('   📊 Details:', result.details)
    }
    console.log('')
  }

  /**
   * Print test summary
   */
  private printSummary() {
    const passed = this.results.filter(r => r.passed).length
    const failed = this.results.filter(r => !r.passed).length
    const total = this.results.length

    console.log('═'.repeat(50))
    console.log('📊 TEST SUMMARY')
    console.log('═'.repeat(50))
    console.log(`Total Tests: ${total}`)
    console.log(`✅ Passed: ${passed}`)
    console.log(`❌ Failed: ${failed}`)
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`)

    if (failed > 0) {
      console.log('\n🔴 Failed Tests:')
      this.results.filter(r => !r.passed).forEach(r => {
        console.log(`  - ${r.testName}`)
        r.errors.forEach(e => console.log(`    • ${e}`))
      })
    }

    console.log('═'.repeat(50))
  }

  /**
   * Debug helper: Log current persistent areas
   */
  debugCurrentAreas() {
    const mapStore = useMapStore.getState()
    const roundStore = useTimelineStore.getState()

    const areas = mapStore.currentMap?.objects.filter(
      obj => obj.type === 'persistent-area'
    ) || []

    console.log('\n🔍 Current Persistent Areas:')
    console.log(`Round: ${roundStore.currentEvent}`)
    console.log(`Total: ${areas.length}`)

    areas.forEach(area => {
      const expiresAt = (area.roundCreated || 0) + (area.spellDuration || 0)
      const shouldBeRemoved = roundStore.currentEvent >= expiresAt

      console.log(`\n  ${area.persistentAreaData?.spellName || 'Unknown'}:`)
      console.log(`    - ID: ${area.id}`)
      console.log(`    - Created: Round ${area.roundCreated}`)
      console.log(`    - Duration: ${area.spellDuration} rounds`)
      console.log(`    - Expires: Round ${expiresAt}`)
      console.log(`    - Should Remove: ${shouldBeRemoved}`)
      console.log(`    - Has isSpellEffect: ${area.isSpellEffect === true}`)
    })
  }
}

// Create singleton instance
export const spellTests = new SpellPersistenceTests()

// Make available in console for debugging
if (typeof window !== 'undefined') {
  (window as any).spellTests = spellTests
  (window as any).runSpellTests = () => spellTests.runAll()
  (window as any).debugSpellAreas = () => spellTests.debugCurrentAreas()
}