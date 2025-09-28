import type { TestScenario } from './TestScenarios'

/**
 * Test scenario to verify Fireball leaves a 1-round persistent burn area
 * and Darkness persists for multiple rounds
 */
export const fireballPersistenceBugTest: TestScenario = {
  id: 'fireball-persistence-test',
  name: 'Fireball and Darkness Persistence Test',
  description: 'Verifies Fireball leaves 1-round burn area and Darkness persists correctly',
  category: 'spells',
  steps: [
    // Start combat
    {
      type: 'action',
      action: {
        type: 'startCombat',
        params: {}
      },
      description: 'Start combat mode'
    },

    // Cast Fireball
    {
      type: 'action',
      action: {
        type: 'castSpell',
        params: {
          spell: {
            type: 'spell',
            spellName: 'Fireball',
            category: 'projectile-burst',
            fromPosition: { x: 200, y: 300 },
            toPosition: { x: 500, y: 300 },
            color: '#ff4500',
            size: 20,
            range: 150,
            duration: 2000,
            persistDuration: 1, // Should persist for 1 round
            burstRadius: 40
          }
        }
      },
      description: 'Cast Fireball spell'
    },

    // Wait for projectile and burst to complete
    {
      type: 'wait',
      wait: 2500,
      description: 'Wait for Fireball animation to complete'
    },

    // Capture after Fireball completes
    {
      type: 'capture',
      capture: { name: 'fireball-complete' },
      description: 'Capture after Fireball animation'
    },

    // Check that persistent burn area EXISTS from Fireball (for 1 round)
    {
      type: 'assert',
      assert: {
        type: 'spellActive',
        params: { spellName: 'Fireball' },
        expected: true
      },
      description: 'Verify Fireball burn area exists'
    },

    // Advance to next round
    {
      type: 'action',
      action: {
        type: 'nextRound',
        params: {}
      },
      description: 'Advance to round 2'
    },

    {
      type: 'wait',
      wait: 500,
      description: 'Wait for round transition'
    },

    // Check that Fireball burn area is now gone (after 1 round)
    {
      type: 'assert',
      assert: {
        type: 'spellActive',
        params: { spellName: 'Fireball' },
        expected: false
      },
      description: 'Verify Fireball burn area removed after 1 round'
    },

    // Now cast Darkness spell
    {
      type: 'action',
      action: {
        type: 'castSpell',
        params: {
          spell: {
            type: 'spell',
            spellName: 'Darkness',
            category: 'area',
            fromPosition: { x: 400, y: 400 },
            toPosition: { x: 400, y: 400 },
            color: '#000000',
            size: 15,
            duration: 0,
            persistDuration: 3 // 3 rounds for testing
          }
        }
      },
      description: 'Cast Darkness spell'
    },

    // Wait for initial animation
    {
      type: 'wait',
      wait: 1000,
      description: 'Wait for Darkness to appear'
    },

    // Capture Darkness at round 1
    {
      type: 'capture',
      capture: { name: 'darkness-round-1' },
      description: 'Capture Darkness at round 1'
    },

    // Verify Darkness is active
    {
      type: 'assert',
      assert: {
        type: 'spellActive',
        params: { spellName: 'Darkness' },
        expected: true
      },
      description: 'Verify Darkness is active'
    },

    // Advance to round 2
    {
      type: 'action',
      action: {
        type: 'nextRound',
        params: {}
      },
      description: 'Advance to round 2'
    },

    {
      type: 'wait',
      wait: 500,
      description: 'Wait for round transition'
    },

    // Capture Darkness at round 2
    {
      type: 'capture',
      capture: { name: 'darkness-round-2' },
      description: 'Capture Darkness at round 2'
    },

    // Verify Darkness is still active
    {
      type: 'assert',
      assert: {
        type: 'spellActive',
        params: { spellName: 'Darkness' },
        expected: true
      },
      description: 'Verify Darkness still active at round 2'
    },

    // Advance to round 3
    {
      type: 'action',
      action: {
        type: 'nextRound',
        params: {}
      },
      description: 'Advance to round 3'
    },

    // Advance to round 4 (Darkness should expire after round 3)
    {
      type: 'action',
      action: {
        type: 'nextRound',
        params: {}
      },
      description: 'Advance to round 4'
    },

    {
      type: 'wait',
      wait: 500,
      description: 'Wait for spell cleanup'
    },

    // Capture after Darkness expires
    {
      type: 'capture',
      capture: { name: 'darkness-expired' },
      description: 'Capture after Darkness expires'
    },

    // Verify Darkness is removed
    {
      type: 'assert',
      assert: {
        type: 'spellActive',
        params: { spellName: 'Darkness' },
        expected: false
      },
      description: 'Verify Darkness is removed after expiration'
    }
  ]
}

// Add to test scenarios
export function addFireballTestToScenarios(scenarios: TestScenario[]): TestScenario[] {
  return [...scenarios, fireballPersistenceBugTest]
}