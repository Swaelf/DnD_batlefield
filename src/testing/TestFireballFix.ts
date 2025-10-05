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
    {
      type: 'wait',
      wait: 500,
      description: 'Wait for combat initialization'
    },

    // Cast Fireball
    {
      type: 'action',
      action: {
        type: 'custom',
        params: {
          execute: async () => {
            const roundStore = (await import('@/store/timelineStore')).default.getState()
            roundStore.addAction('void-token', 'spell', {
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
              durationType: 'rounds',
              burstRadius: 40,
              persistColor: '#ff4500',
              persistOpacity: 0.3
            }, 1)
          }
        }
      },
      description: 'Add Fireball to Event 1'
    },
    {
      type: 'action',
      action: {
        type: 'custom',
        params: {
          execute: async () => {
            const roundStore = (await import('@/store/timelineStore')).default.getState()
            await roundStore.executeEventActions(1)
          }
        }
      },
      description: 'Execute Event 1 (Cast Fireball)'
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
      description: 'Verify Fireball burn area exists in Round 1'
    },

    // Advance to next round
    {
      type: 'action',
      action: {
        type: 'custom',
        params: {
          execute: async () => {
            const roundStore = (await import('@/store/timelineStore')).default.getState()
            roundStore.startNewRound()
          }
        }
      },
      description: 'Advance to Round 2'
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
        type: 'custom',
        params: {
          execute: async () => {
            const roundStore = (await import('@/store/timelineStore')).default.getState()
            roundStore.addAction('void-token', 'spell', {
              type: 'spell',
              spellName: 'Darkness',
              category: 'area',
              fromPosition: { x: 400, y: 400 },
              toPosition: { x: 400, y: 400 },
              color: '#000000',
              size: 60,
              duration: 1000,
              persistDuration: 3, // 3 rounds for testing
              durationType: 'rounds',
              persistColor: '#000000',
              persistOpacity: 0.7
            }, 1)
          }
        }
      },
      description: 'Add Darkness to Event 1 (Round 2)'
    },
    {
      type: 'action',
      action: {
        type: 'custom',
        params: {
          execute: async () => {
            const roundStore = (await import('@/store/timelineStore')).default.getState()
            await roundStore.executeEventActions(1)
          }
        }
      },
      description: 'Execute Event 1 (Cast Darkness)'
    },

    // Wait for initial animation
    {
      type: 'wait',
      wait: 1500,
      description: 'Wait for Darkness to appear'
    },

    // Capture Darkness at round 2
    {
      type: 'capture',
      capture: { name: 'darkness-round-2' },
      description: 'Capture Darkness at round 2'
    },

    // Verify Darkness is active
    {
      type: 'assert',
      assert: {
        type: 'spellActive',
        params: { spellName: 'Darkness' },
        expected: true
      },
      description: 'Verify Darkness is active in Round 2'
    },

    // Advance to round 3
    {
      type: 'action',
      action: {
        type: 'custom',
        params: {
          execute: async () => {
            const roundStore = (await import('@/store/timelineStore')).default.getState()
            roundStore.startNewRound()
          }
        }
      },
      description: 'Advance to Round 3'
    },

    {
      type: 'wait',
      wait: 500,
      description: 'Wait for round transition'
    },

    // Verify Darkness still active in round 3
    {
      type: 'assert',
      assert: {
        type: 'spellActive',
        params: { spellName: 'Darkness' },
        expected: true
      },
      description: 'Verify Darkness still active in Round 3'
    },

    // Advance to round 4
    {
      type: 'action',
      action: {
        type: 'custom',
        params: {
          execute: async () => {
            const roundStore = (await import('@/store/timelineStore')).default.getState()
            roundStore.startNewRound()
          }
        }
      },
      description: 'Advance to Round 4'
    },

    {
      type: 'wait',
      wait: 500,
      description: 'Wait for round transition'
    },

    // Verify Darkness still active in round 4
    {
      type: 'assert',
      assert: {
        type: 'spellActive',
        params: { spellName: 'Darkness' },
        expected: true
      },
      description: 'Verify Darkness still active in Round 4'
    },

    // Advance to round 5 (Darkness should expire)
    {
      type: 'action',
      action: {
        type: 'custom',
        params: {
          execute: async () => {
            const roundStore = (await import('@/store/timelineStore')).default.getState()
            roundStore.startNewRound()
          }
        }
      },
      description: 'Advance to Round 5'
    },

    {
      type: 'wait',
      wait: 500,
      description: 'Wait for Darkness cleanup'
    },

    // Verify Darkness removed after 3 rounds
    {
      type: 'assert',
      assert: {
        type: 'spellActive',
        params: { spellName: 'Darkness' },
        expected: false
      },
      description: 'Verify Darkness removed after 3 rounds (expires in Round 5)'
    },

    {
      type: 'capture',
      capture: { name: 'darkness-expired' },
      description: 'Capture after Darkness expires'
    }
  ]
}
