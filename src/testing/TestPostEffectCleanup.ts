import type { TestScenario } from './TestScenarios'

/**
 * Post-Effect Cleanup Tests
 *
 * Tests post-effect spells (durationType='events' or no persistDuration) to verify they:
 * 1. Display correctly during animation
 * 2. Are removed after next event in same round
 * 3. Are removed at end of round if no more events
 *
 * Examples: Fireball burst, Lightning Bolt line, Cone of Cold cone
 */

export const postEffectCleanupTests: TestScenario[] = [
  {
    id: 'post-effect-fireball-event-cleanup',
    name: 'Fireball - Event Cleanup',
    description: 'Verifies Fireball burst effect is removed after next event in same round',
    category: 'spells',
    steps: [
      // Setup: Add tokens
      {
        type: 'action',
        action: {
          type: 'addToken',
          params: {
            id: 'post-effect-mage',
            name: 'Mage',
            position: { x: 200, y: 300 },
            size: 'medium',
            color: '#4169E1',
            shape: 'circle'
          }
        },
        description: 'Add mage token'
      },
      {
        type: 'action',
        action: {
          type: 'addToken',
          params: {
            id: 'post-effect-target',
            name: 'Target',
            position: { x: 500, y: 300 },
            size: 'medium',
            color: '#922610',
            shape: 'circle'
          }
        },
        description: 'Add target token'
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
      {
        type: 'wait',
        wait: 500,
        description: 'Wait for combat initialization'
      },
      // Event 1: Cast Fireball (creates burst effect)
      {
        type: 'action',
        action: {
          type: 'custom',
          params: {
            execute: async () => {
              const roundStore = (await import('@/store/timelineStore')).default.getState()
              roundStore.addAction('post-effect-mage', 'spell', {
                type: 'spell',
                spellName: 'Fireball',
                category: 'projectile-burst',
                fromPosition: { x: 200, y: 300 },
                toPosition: { x: 500, y: 300 },
                color: '#FF6600',
                size: 20,
                duration: 1000,
                burstRadius: 40
                // NO persistDuration - this is a post effect
              }, 1)
            }
          }
        },
        description: 'Add Fireball to Event 1'
      },
      // Execute Event 1
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
        description: 'Execute Event 1 (Fireball)'
      },
      {
        type: 'wait',
        wait: 1500,
        description: 'Wait for Fireball animation'
      },
      // Assert: Burst effect exists after Event 1
      {
        type: 'assert',
        assert: {
          type: 'spellActive',
          params: { spellName: 'Fireball' },
          expected: true
        },
        description: 'Verify Fireball burst visible after Event 1'
      },
      {
        type: 'capture',
        capture: { name: 'fireball-burst-visible' },
        description: 'Capture burst effect'
      },
      // Event 2: Move target token (triggers cleanup)
      {
        type: 'action',
        action: {
          type: 'custom',
          params: {
            execute: async () => {
              const roundStore = (await import('@/store/timelineStore')).default.getState()
              roundStore.nextEvent() // Move to Event 2
              await new Promise(resolve => setTimeout(resolve, 100))

              roundStore.addAction('post-effect-target', 'move', {
                type: 'move',
                fromPosition: { x: 500, y: 300 },
                toPosition: { x: 600, y: 300 },
                duration: 600
              }, 2)
            }
          }
        },
        description: 'Add movement to Event 2'
      },
      // Execute Event 2 (should trigger cleanup of Event 1 post effects)
      {
        type: 'action',
        action: {
          type: 'custom',
          params: {
            execute: async () => {
              const roundStore = (await import('@/store/timelineStore')).default.getState()
              await roundStore.executeEventActions(2)
            }
          }
        },
        description: 'Execute Event 2 (triggers cleanup)'
      },
      {
        type: 'wait',
        wait: 1000,
        description: 'Wait for movement and cleanup'
      },
      // Assert: Burst effect removed after Event 2
      {
        type: 'assert',
        assert: {
          type: 'spellActive',
          params: { spellName: 'Fireball' },
          expected: false
        },
        description: 'Verify Fireball burst removed after Event 2'
      },
      {
        type: 'wait',
        wait: 500,
        description: 'Pause to observe cleanup'
      }
    ]
  },
  {
    id: 'post-effect-fireball-round-cleanup',
    name: 'Fireball - Round End Cleanup',
    description: 'Verifies Fireball burst effect is removed at end of round',
    category: 'spells',
    steps: [
      // Setup
      {
        type: 'action',
        action: {
          type: 'addToken',
          params: {
            id: 'round-cleanup-mage',
            name: 'Mage',
            position: { x: 250, y: 300 },
            size: 'medium',
            color: '#4169E1',
            shape: 'circle'
          }
        },
        description: 'Add mage token'
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
      // Round 1 Event 1: Cast Fireball (only event in round)
      {
        type: 'action',
        action: {
          type: 'custom',
          params: {
            execute: async () => {
              const roundStore = (await import('@/store/timelineStore')).default.getState()
              roundStore.addAction('round-cleanup-mage', 'spell', {
                type: 'spell',
                spellName: 'Fireball',
                category: 'projectile-burst',
                fromPosition: { x: 250, y: 300 },
                toPosition: { x: 550, y: 300 },
                color: '#FF6600',
                size: 20,
                duration: 1000,
                burstRadius: 40
              }, 1)
            }
          }
        },
        description: 'Add Fireball to Round 1'
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
        description: 'Execute Round 1 (Fireball)'
      },
      {
        type: 'wait',
        wait: 1500,
        description: 'Wait for Fireball animation'
      },
      // Assert: Effect exists in Round 1
      {
        type: 'assert',
        assert: {
          type: 'spellActive',
          params: { spellName: 'Fireball' },
          expected: true
        },
        description: 'Verify Fireball effect visible in Round 1'
      },
      // Start New Round (triggers cleanup)
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
        description: 'Start Round 2 (triggers cleanup)'
      },
      {
        type: 'wait',
        wait: 500,
        description: 'Wait for round transition and cleanup'
      },
      // Assert: Effect removed at round end
      {
        type: 'assert',
        assert: {
          type: 'spellActive',
          params: { spellName: 'Fireball' },
          expected: false
        },
        description: 'Verify Fireball effect removed at round end'
      },
      {
        type: 'wait',
        wait: 500,
        description: 'Pause to observe cleanup'
      }
    ]
  }
]

export const allPostEffectCleanupTests = postEffectCleanupTests
