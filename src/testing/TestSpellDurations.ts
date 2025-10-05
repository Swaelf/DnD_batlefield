import type { TestScenario } from './TestScenarios'

/**
 * Spell Duration Tests
 *
 * Tests continuous spells (persistDuration > 0) to verify they:
 * 1. Persist for the correct number of rounds
 * 2. Are automatically removed after duration expires
 * 3. Remain visible across round transitions
 *
 * Tests durationType='rounds' spells (continuous effects)
 */

export const spellDurationTests: TestScenario[] = [
  {
    id: 'spell-duration-bless-3rounds',
    name: 'Bless - 3 Round Duration',
    description: 'Verifies Bless spell persists for exactly 3 rounds and is removed on round 4',
    category: 'spells',
    steps: [
      // Setup: Add caster token
      {
        type: 'action',
        action: {
          type: 'addToken',
          params: {
            id: 'duration-test-cleric',
            name: 'Cleric',
            position: { x: 300, y: 300 },
            size: 'medium',
            color: '#FFD700',
            shape: 'circle'
          }
        },
        description: 'Add cleric token'
      },
      // Start combat
      {
        type: 'action',
        action: {
          type: 'startCombat',
          params: {}
        },
        description: 'Start combat'
      },
      // Wait for combat to initialize
      {
        type: 'wait',
        wait: 500,
        description: 'Wait for combat initialization'
      },
      // Cast Bless with 3-round duration
      {
        type: 'action',
        action: {
          type: 'custom',
          params: {
            execute: async () => {
              const roundStore = (await import('@/store/timelineStore')).default.getState()
              roundStore.addAction('duration-test-cleric', 'spell', {
                type: 'spell',
                spellName: 'Bless',
                category: 'area',
                fromPosition: { x: 300, y: 300 },
                toPosition: { x: 300, y: 300 },
                color: '#FFD700',
                size: 60,
                duration: 1000,
                persistDuration: 3, // 3 rounds
                persistColor: '#FFD700',
                persistOpacity: 0.3
              }, 1)
            }
          }
        },
        description: 'Cast Bless (3 round duration)'
      },
      // Execute Round 1
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
        description: 'Execute Round 1 Event 1'
      },
      {
        type: 'wait',
        wait: 1500,
        description: 'Wait for Bless animation'
      },
      // Assert: Bless exists in Round 1
      {
        type: 'assert',
        assert: {
          type: 'spellActive',
          params: { spellName: 'Bless' },
          expected: true
        },
        description: 'Verify Bless active in Round 1'
      },
      // Advance to Round 2
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
      // Assert: Bless still exists in Round 2
      {
        type: 'assert',
        assert: {
          type: 'spellActive',
          params: { spellName: 'Bless' },
          expected: true
        },
        description: 'Verify Bless still active in Round 2'
      },
      // Advance to Round 3
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
      // Assert: Bless still exists in Round 3
      {
        type: 'assert',
        assert: {
          type: 'spellActive',
          params: { spellName: 'Bless' },
          expected: true
        },
        description: 'Verify Bless still active in Round 3'
      },
      // Advance to Round 4
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
        description: 'Wait for round transition and cleanup'
      },
      // Assert: Bless removed in Round 4 (duration expired)
      {
        type: 'assert',
        assert: {
          type: 'spellActive',
          params: { spellName: 'Bless' },
          expected: false
        },
        description: 'Verify Bless removed in Round 4 (expired)'
      },
      {
        type: 'wait',
        wait: 500,
        description: 'Pause to observe final state'
      }
    ]
  },
  {
    id: 'spell-duration-haste-10rounds',
    name: 'Haste - 10 Round Duration',
    description: 'Verifies Haste spell persists for 10 rounds and is removed on round 11',
    category: 'spells',
    steps: [
      // Setup
      {
        type: 'action',
        action: {
          type: 'addToken',
          params: {
            id: 'duration-test-wizard',
            name: 'Wizard',
            position: { x: 400, y: 300 },
            size: 'medium',
            color: '#4169E1',
            shape: 'circle'
          }
        },
        description: 'Add wizard token'
      },
      {
        type: 'action',
        action: {
          type: 'startCombat',
          params: {}
        },
        description: 'Start combat'
      },
      {
        type: 'wait',
        wait: 500,
        description: 'Wait for combat initialization'
      },
      // Cast Haste with 10-round duration
      {
        type: 'action',
        action: {
          type: 'custom',
          params: {
            execute: async () => {
              const roundStore = (await import('@/store/timelineStore')).default.getState()
              roundStore.addAction('duration-test-wizard', 'spell', {
                type: 'spell',
                spellName: 'Haste',
                category: 'area',
                fromPosition: { x: 400, y: 300 },
                toPosition: { x: 400, y: 300 },
                color: '#00FFFF',
                size: 50,
                duration: 1000,
                persistDuration: 10, // 10 rounds
                persistColor: '#00FFFF',
                persistOpacity: 0.2
              }, 1)
            }
          }
        },
        description: 'Cast Haste (10 round duration)'
      },
      // Execute Round 1
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
        description: 'Execute Round 1'
      },
      {
        type: 'wait',
        wait: 1500,
        description: 'Wait for Haste animation'
      },
      // Assert: Haste active in Round 1
      {
        type: 'assert',
        assert: {
          type: 'spellActive',
          params: { spellName: 'Haste' },
          expected: true
        },
        description: 'Verify Haste active in Round 1'
      },
      // Fast-forward through rounds 2-10
      {
        type: 'action',
        action: {
          type: 'custom',
          params: {
            execute: async () => {
              const roundStore = (await import('@/store/timelineStore')).default.getState()
              // Advance 9 more rounds (to reach Round 10)
              for (let i = 0; i < 9; i++) {
                roundStore.startNewRound()
                await new Promise(resolve => setTimeout(resolve, 100))
              }
            }
          }
        },
        description: 'Fast-forward to Round 10'
      },
      {
        type: 'wait',
        wait: 1000,
        description: 'Wait for round transitions'
      },
      // Assert: Haste still active in Round 10
      {
        type: 'assert',
        assert: {
          type: 'spellActive',
          params: { spellName: 'Haste' },
          expected: true
        },
        description: 'Verify Haste still active in Round 10'
      },
      // Advance to Round 11
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
        description: 'Advance to Round 11'
      },
      {
        type: 'wait',
        wait: 500,
        description: 'Wait for cleanup'
      },
      // Assert: Haste removed in Round 11
      {
        type: 'assert',
        assert: {
          type: 'spellActive',
          params: { spellName: 'Haste' },
          expected: false
        },
        description: 'Verify Haste removed in Round 11 (expired)'
      },
      {
        type: 'wait',
        wait: 500,
        description: 'Pause to observe final state'
      }
    ]
  }
]

// Export single test or all tests
export const allSpellDurationTests = spellDurationTests
