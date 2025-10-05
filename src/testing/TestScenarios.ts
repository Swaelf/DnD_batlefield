import { fireballPersistenceBugTest } from './TestFireballFix'
import { persistentAreaCleanupTest } from './TestPersistentAreaCleanup'
import { allSpellTestScenarios } from './TestAllSpells'
import { allAttackTestScenarios } from './TestAllAttacks'
import { runTimelineNavigationTest } from './TestTimelineNavigation'
import { runRoundReplayTest } from './TestRoundReplay'

export interface TestStep {
  type: 'action' | 'wait' | 'assert' | 'capture'
  action?: TestAction
  wait?: number
  assert?: TestAssertion
  capture?: CaptureOptions
  description: string
}

export interface TestAction {
  type: 'addToken' | 'moveToken' | 'selectToken' | 'castSpell' | 'startCombat' | 'nextRound' | 'selectTool' | 'custom'
  params: any
}

export interface TestAssertion {
  type: 'tokenPosition' | 'tokenExists' | 'spellActive' | 'spellOriginPosition' | 'roundNumber' | 'selectionCount' | 'toolActive' | 'custom'
  params: any
  expected: any
}

export interface CaptureOptions {
  name: string
  region?: { x: number; y: number; width: number; height: number }
}

export interface TestScenario {
  id: string
  name: string
  description: string
  category: 'movement' | 'spells' | 'selection' | 'combat' | 'visual'
  steps: TestStep[]
  cleanup?: () => void
}

export const testScenarios: TestScenario[] = [
  {
    id: 'token-movement-basic',
    name: 'Basic Token Movement',
    description: 'Tests token placement and direct position updates',
    category: 'movement',
    steps: [
      {
        type: 'action',
        action: {
          type: 'addToken',
          params: {
            id: 'test-token-1',
            name: 'Test Fighter',
            position: { x: 100, y: 100 },
            size: 'medium',
            color: '#3D82AB',
            shape: 'circle'
          }
        },
        description: 'Add token to map'
      },
      {
        type: 'wait',
        wait: 300,
        description: 'Wait for token to render'
      },
      {
        type: 'capture',
        capture: { name: 'token-placed' },
        description: 'Capture token placement'
      },
      {
        type: 'assert',
        assert: {
          type: 'tokenExists',
          params: { tokenId: 'test-token-1' },
          expected: true
        },
        description: 'Verify token exists'
      },
      {
        type: 'assert',
        assert: {
          type: 'tokenPosition',
          params: { tokenId: 'test-token-1' },
          expected: { x: 100, y: 100 }
        },
        description: 'Verify initial position'
      },
      {
        type: 'action',
        action: {
          type: 'moveToken',
          params: {
            tokenId: 'test-token-1',
            toPosition: { x: 300, y: 200 }
          }
        },
        description: 'Move token to new position'
      },
      {
        type: 'wait',
        wait: 300,
        description: 'Wait for state update and re-render'
      },
      {
        type: 'capture',
        capture: { name: 'token-moved' },
        description: 'Capture after movement'
      },
      {
        type: 'wait',
        wait: 500,
        description: 'Pause to observe final position'
      },
      {
        type: 'assert',
        assert: {
          type: 'tokenPosition',
          params: { tokenId: 'test-token-1' },
          expected: { x: 300, y: 200 }
        },
        description: 'Verify new position'
      }
    ]
  },
  {
    id: 'spell-fireball',
    name: 'Fireball Spell Effect',
    description: 'Tests fireball projectile and burst animation',
    category: 'spells',
    steps: [
      {
        type: 'action',
        action: {
          type: 'addToken',
          params: {
            id: 'caster',
            name: 'Wizard',
            position: { x: 200, y: 300 },
            size: 'medium',
            color: '#3D82AB',
            shape: 'circle'
          }
        },
        description: 'Add caster token'
      },
      {
        type: 'action',
        action: {
          type: 'addToken',
          params: {
            id: 'target',
            name: 'Goblin',
            position: { x: 500, y: 300 },
            size: 'small',
            color: '#922610',
            shape: 'circle'
          }
        },
        description: 'Add target token'
      },
      {
        type: 'action',
        action: {
          type: 'castSpell',
          params: {
            spell: {
              tokenId: 'caster',
              targetTokenId: 'target',
              spellName: 'Fireball',
              category: 'projectile-burst',
              fromPosition: { x: 200, y: 300 },
              toPosition: { x: 500, y: 300 },
              color: '#ff4500',
              size: 20,
              duration: 2000,
              burstRadius: 40
            }
          }
        },
        description: 'Cast fireball'
      },
      {
        type: 'wait',
        wait: 500,
        description: 'Wait for projectile start'
      },
      {
        type: 'capture',
        capture: { name: 'fireball-projectile' },
        description: 'Capture projectile phase'
      },
      {
        type: 'wait',
        wait: 1500,
        description: 'Wait for burst'
      },
      {
        type: 'capture',
        capture: { name: 'fireball-burst' },
        description: 'Capture burst phase'
      },
      {
        type: 'wait',
        wait: 1000,
        description: 'Wait for completion'
      },
      {
        type: 'assert',
        assert: {
          type: 'spellActive',
          params: { spellName: 'Fireball' },
          expected: false
        },
        description: 'Verify spell completed'
      }
    ]
  },
  {
    id: 'token-selection',
    name: 'Token Selection and Highlighting',
    description: 'Tests token selection with visual feedback',
    category: 'selection',
    steps: [
      {
        type: 'action',
        action: {
          type: 'selectTool',
          params: { tool: 'select' }
        },
        description: 'Select the selection tool'
      },
      {
        type: 'action',
        action: {
          type: 'addToken',
          params: {
            id: 'select-test-1',
            name: 'Fighter',
            position: { x: 200, y: 200 },
            size: 'medium',
            color: '#3D82AB',
            shape: 'circle'
          }
        },
        description: 'Add first token'
      },
      {
        type: 'action',
        action: {
          type: 'addToken',
          params: {
            id: 'select-test-2',
            name: 'Rogue',
            position: { x: 400, y: 200 },
            size: 'medium',
            color: '#10B981',
            shape: 'circle'
          }
        },
        description: 'Add second token'
      },
      {
        type: 'capture',
        capture: { name: 'tokens-unselected' },
        description: 'Capture unselected state'
      },
      {
        type: 'action',
        action: {
          type: 'selectToken',
          params: { tokenId: 'select-test-1' }
        },
        description: 'Select first token'
      },
      {
        type: 'capture',
        capture: { name: 'token-selected' },
        description: 'Capture selected state'
      },
      {
        type: 'assert',
        assert: {
          type: 'selectionCount',
          params: {},
          expected: 1
        },
        description: 'Verify one token selected'
      },
      {
        type: 'action',
        action: {
          type: 'selectToken',
          params: { tokenId: 'select-test-2', addToSelection: true }
        },
        description: 'Multi-select second token'
      },
      {
        type: 'capture',
        capture: { name: 'multi-selected' },
        description: 'Capture multi-selection'
      },
      {
        type: 'assert',
        assert: {
          type: 'selectionCount',
          params: {},
          expected: 2
        },
        description: 'Verify two tokens selected'
      }
    ]
  },
  {
    id: 'persistent-area-spell',
    name: 'Persistent Area Spell (Web)',
    description: 'Tests area spell that persists for multiple rounds',
    category: 'spells',
    steps: [
      {
        type: 'action',
        action: {
          type: 'startCombat',
          params: {}
        },
        description: 'Start combat'
      },
      {
        type: 'action',
        action: {
          type: 'castSpell',
          params: {
            spell: {
              type: 'spell',
              spellName: 'Web',
              category: 'area',
              fromPosition: { x: 300, y: 300 },
              toPosition: { x: 300, y: 300 },
              color: '#f0f0f0',
              size: 20,
              duration: 0,
              persistDuration: 3 // 3 rounds
            }
          }
        },
        description: 'Cast Web spell'
      },
      {
        type: 'capture',
        capture: { name: 'web-round-1' },
        description: 'Capture Web at round 1'
      },
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
      {
        type: 'capture',
        capture: { name: 'web-round-2' },
        description: 'Capture Web at round 2'
      },
      {
        type: 'assert',
        assert: {
          type: 'spellActive',
          params: { spellName: 'Web' },
          expected: true
        },
        description: 'Verify Web still active'
      },
      {
        type: 'action',
        action: {
          type: 'nextRound',
          params: {}
        },
        description: 'Advance to round 3'
      },
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
        description: 'Wait for spell removal'
      },
      {
        type: 'capture',
        capture: { name: 'web-expired' },
        description: 'Capture after Web expires'
      },
      {
        type: 'assert',
        assert: {
          type: 'spellActive',
          params: { spellName: 'Web' },
          expected: false
        },
        description: 'Verify Web removed'
      }
    ]
  },
  {
    id: 'ray-spell-tracking',
    name: 'Ray Spell with Target Tracking',
    description: 'Tests ray spell that follows moving target',
    category: 'spells',
    steps: [
      {
        type: 'action',
        action: {
          type: 'addToken',
          params: {
            id: 'ray-caster',
            name: 'Wizard',
            position: { x: 200, y: 300 },
            size: 'medium',
            color: '#3D82AB',
            shape: 'circle'
          }
        },
        description: 'Add caster'
      },
      {
        type: 'action',
        action: {
          type: 'addToken',
          params: {
            id: 'ray-target',
            name: 'Enemy',
            position: { x: 400, y: 300 },
            size: 'medium',
            color: '#922610',
            shape: 'circle'
          }
        },
        description: 'Add target'
      },
      {
        type: 'action',
        action: {
          type: 'castSpell',
          params: {
            spell: {
              tokenId: 'ray-caster',
              targetTokenId: 'ray-target',
              spellName: 'Lightning Bolt',
              category: 'ray',
              fromPosition: { x: 200, y: 300 },
              toPosition: { x: 400, y: 300 },
              trackTarget: true,
              color: '#00bfff',
              size: 10,
              duration: 1000
            }
          }
        },
        description: 'Cast ray spell with tracking'
      },
      {
        type: 'wait',
        wait: 200,
        description: 'Wait for ray start'
      },
      {
        type: 'action',
        action: {
          type: 'moveToken',
          params: {
            tokenId: 'ray-target',
            toPosition: { x: 400, y: 200 }
          }
        },
        description: 'Move target while ray active'
      },
      {
        type: 'wait',
        wait: 300,
        description: 'Wait during tracking'
      },
      {
        type: 'capture',
        capture: { name: 'ray-tracking' },
        description: 'Capture ray following target'
      },
      {
        type: 'wait',
        wait: 500,
        description: 'Wait for completion'
      }
    ]
  },
  {
    id: 'token-animated-movement',
    name: 'Animated Token Movement (Timeline)',
    description: 'Tests token movement with timeline-based animation',
    category: 'movement',
    steps: [
      {
        type: 'action',
        action: {
          type: 'addToken',
          params: {
            id: 'animated-token',
            name: 'Rogue',
            position: { x: 150, y: 150 },
            size: 'medium',
            color: '#10B981',
            shape: 'circle'
          }
        },
        description: 'Add token for animated movement'
      },
      {
        type: 'action',
        action: {
          type: 'startCombat',
          params: {}
        },
        description: 'Start combat to enable timeline'
      },
      {
        type: 'action',
        action: {
          type: 'custom',
          params: {
            execute: async () => {
              const roundStore = (await import('@/store/timelineStore')).default.getState()

              // Add movement action to timeline (correct method: addAction, not addEvent)
              if (roundStore.timeline) {
                roundStore.addAction('animated-token', 'move', {
                  type: 'move',
                  fromPosition: { x: 150, y: 150 },
                  toPosition: { x: 400, y: 300 },
                  duration: 1000
                }, 1)
              }
            }
          }
        },
        description: 'Add movement action to timeline'
      },
      {
        type: 'capture',
        capture: { name: 'before-animation' },
        description: 'Capture before animation'
      },
      {
        type: 'action',
        action: {
          type: 'custom',
          params: {
            execute: async () => {
              const roundStore = (await import('@/store/timelineStore')).default.getState()
              // Execute event actions for current round (triggers movement animation)
              await roundStore.executeEventActions(1)
            }
          }
        },
        description: 'Execute event actions (triggers animation)'
      },
      {
        type: 'wait',
        wait: 1200,
        description: 'Wait for animation to complete'
      },
      {
        type: 'capture',
        capture: { name: 'after-animation' },
        description: 'Capture after animation'
      },
      {
        type: 'assert',
        assert: {
          type: 'tokenPosition',
          params: { tokenId: 'animated-token' },
          expected: { x: 400, y: 300 }
        },
        description: 'Verify final position after animation'
      }
    ]
  },
  {
    id: 'token-multi-waypoint-movement',
    name: 'Multi-Waypoint Animated Movement',
    description: 'Tests token moving through multiple positions in one timeline event',
    category: 'movement',
    steps: [
      {
        type: 'action',
        action: {
          type: 'addToken',
          params: {
            id: 'waypoint-token',
            name: 'Scout',
            position: { x: 100, y: 100 },
            size: 'medium',
            color: '#10B981',
            shape: 'circle'
          }
        },
        description: 'Add token for waypoint movement'
      },
      {
        type: 'wait',
        wait: 300,
        description: 'Wait for token to render'
      },
      {
        type: 'action',
        action: {
          type: 'startCombat',
          params: {}
        },
        description: 'Start combat to enable timeline'
      },
      {
        type: 'action',
        action: {
          type: 'custom',
          params: {
            execute: async () => {
              const roundStore = (await import('@/store/timelineStore')).default.getState()

              if (roundStore.timeline) {
                // First movement: (100,100) -> (300,100)
                roundStore.addAction('waypoint-token', 'move', {
                  type: 'move',
                  fromPosition: { x: 100, y: 100 },
                  toPosition: { x: 300, y: 100 },
                  duration: 800
                }, 1)

                // Second movement: (300,100) -> (300,300)
                roundStore.addAction('waypoint-token', 'move', {
                  type: 'move',
                  fromPosition: { x: 300, y: 100 },
                  toPosition: { x: 300, y: 300 },
                  duration: 800
                }, 1)

                // Third movement: (300,300) -> (500,300)
                roundStore.addAction('waypoint-token', 'move', {
                  type: 'move',
                  fromPosition: { x: 300, y: 300 },
                  toPosition: { x: 500, y: 300 },
                  duration: 800
                }, 1)
              }
            }
          }
        },
        description: 'Add three sequential movement actions to timeline'
      },
      {
        type: 'capture',
        capture: { name: 'before-waypoint-movement' },
        description: 'Capture before movement starts'
      },
      {
        type: 'action',
        action: {
          type: 'custom',
          params: {
            execute: async () => {
              const roundStore = (await import('@/store/timelineStore')).default.getState()
              // Execute all movement actions in sequence
              await roundStore.executeEventActions(1)
            }
          }
        },
        description: 'Execute all waypoint movements'
      },
      {
        type: 'wait',
        wait: 2600,
        description: 'Wait for all three animations to complete (3 × 800ms + buffer)'
      },
      {
        type: 'capture',
        capture: { name: 'after-waypoint-movement' },
        description: 'Capture final position'
      },
      {
        type: 'assert',
        assert: {
          type: 'tokenPosition',
          params: { tokenId: 'waypoint-token' },
          expected: { x: 500, y: 300 }
        },
        description: 'Verify token reached final waypoint'
      },
      {
        type: 'wait',
        wait: 500,
        description: 'Pause to observe final position'
      }
    ]
  },
  {
    id: 'multi-token-interleaved-movement',
    name: 'Multi-Token Interleaved Movement',
    description: 'Tests two tokens moving in interleaved sequence within one event',
    category: 'movement',
    steps: [
      {
        type: 'action',
        action: {
          type: 'addToken',
          params: {
            id: 'fighter-token',
            name: 'Fighter',
            position: { x: 100, y: 100 },
            size: 'medium',
            color: '#3D82AB',
            shape: 'circle'
          }
        },
        description: 'Add first token (Fighter)'
      },
      {
        type: 'action',
        action: {
          type: 'addToken',
          params: {
            id: 'rogue-token',
            name: 'Rogue',
            position: { x: 100, y: 300 },
            size: 'medium',
            color: '#10B981',
            shape: 'circle'
          }
        },
        description: 'Add second token (Rogue)'
      },
      {
        type: 'wait',
        wait: 300,
        description: 'Wait for tokens to render'
      },
      {
        type: 'action',
        action: {
          type: 'startCombat',
          params: {}
        },
        description: 'Start combat to enable timeline'
      },
      {
        type: 'action',
        action: {
          type: 'custom',
          params: {
            execute: async () => {
              const roundStore = (await import('@/store/timelineStore')).default.getState()

              if (roundStore.timeline) {
                // Fighter moves first: (100,100) -> (250,100)
                roundStore.addAction('fighter-token', 'move', {
                  type: 'move',
                  fromPosition: { x: 100, y: 100 },
                  toPosition: { x: 250, y: 100 },
                  duration: 600
                }, 1)

                // Rogue moves: (100,300) -> (250,300)
                roundStore.addAction('rogue-token', 'move', {
                  type: 'move',
                  fromPosition: { x: 100, y: 300 },
                  toPosition: { x: 250, y: 300 },
                  duration: 600
                }, 1)

                // Fighter moves again: (250,100) -> (400,100)
                roundStore.addAction('fighter-token', 'move', {
                  type: 'move',
                  fromPosition: { x: 250, y: 100 },
                  toPosition: { x: 400, y: 100 },
                  duration: 600
                }, 1)
              }
            }
          }
        },
        description: 'Add interleaved movements: Fighter → Rogue → Fighter'
      },
      {
        type: 'capture',
        capture: { name: 'before-interleaved-movement' },
        description: 'Capture initial positions'
      },
      {
        type: 'action',
        action: {
          type: 'custom',
          params: {
            execute: async () => {
              const roundStore = (await import('@/store/timelineStore')).default.getState()
              // Execute all movement actions in sequence
              await roundStore.executeEventActions(1)
            }
          }
        },
        description: 'Execute interleaved movements'
      },
      {
        type: 'wait',
        wait: 2000,
        description: 'Wait for all animations to complete (3 × 600ms + buffer)'
      },
      {
        type: 'capture',
        capture: { name: 'after-interleaved-movement' },
        description: 'Capture final positions'
      },
      {
        type: 'assert',
        assert: {
          type: 'tokenPosition',
          params: { tokenId: 'fighter-token' },
          expected: { x: 400, y: 100 }
        },
        description: 'Verify Fighter reached final position'
      },
      {
        type: 'assert',
        assert: {
          type: 'tokenPosition',
          params: { tokenId: 'rogue-token' },
          expected: { x: 250, y: 300 }
        },
        description: 'Verify Rogue reached final position'
      },
      {
        type: 'wait',
        wait: 500,
        description: 'Pause to observe final positions'
      }
    ]
  },
  {
    id: 'complex-movement-spell-tracking',
    name: 'Complex Movement + Spell Tracking (Bug Test)',
    description: 'BUG: Spells should track moving targets and originate from caster\'s final position',
    category: 'spells',
    steps: [
      {
        type: 'action',
        action: {
          type: 'addToken',
          params: {
            id: 'wizard-1',
            name: 'Wizard 1',
            position: { x: 100, y: 100 },
            size: 'medium',
            color: '#3D82AB',
            shape: 'circle'
          }
        },
        description: 'Add first wizard'
      },
      {
        type: 'action',
        action: {
          type: 'addToken',
          params: {
            id: 'wizard-2',
            name: 'Wizard 2',
            position: { x: 500, y: 100 },
            size: 'medium',
            color: '#10B981',
            shape: 'circle'
          }
        },
        description: 'Add second wizard'
      },
      {
        type: 'wait',
        wait: 300,
        description: 'Wait for tokens to render'
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
        type: 'action',
        action: {
          type: 'custom',
          params: {
            execute: async () => {
              const roundStore = (await import('@/store/timelineStore')).default.getState()

              if (roundStore.timeline) {
                // 1. Wizard 1 moves: (100,100) -> (200,300)
                roundStore.addAction('wizard-1', 'move', {
                  type: 'move',
                  fromPosition: { x: 100, y: 100 },
                  toPosition: { x: 200, y: 300 },
                  duration: 600
                }, 1)

                // 2. Wizard 2 moves: (500,100) -> (400,300)
                roundStore.addAction('wizard-2', 'move', {
                  type: 'move',
                  fromPosition: { x: 500, y: 100 },
                  toPosition: { x: 400, y: 300 },
                  duration: 600
                }, 1)

                // 3. Wizard 1 casts Fireball at Wizard 2
                // EXPECTED: From (200,300) to (400,300) - both final positions
                // BUG: Likely starts from (100,100) to (500,100) - initial positions
                roundStore.addAction('wizard-1', 'spell', {
                  type: 'spell',
                  
                  targetTokenId: 'wizard-2',
                  spellName: 'Fireball',
                  category: 'projectile-burst',
                  fromPosition: { x: 200, y: 300 }, // Expected: Wizard 1's final position
                  toPosition: { x: 400, y: 300 },   // Expected: Wizard 2's final position
                  color: '#ff4500',
                  size: 15,
                  duration: 1000,
                  burstRadius: 30
                }, 1)

                // 4. Wizard 2 casts Fireball back at Wizard 1's INITIAL position (static target)
                // EXPECTED: From (400,300) to (100,100)
                roundStore.addAction('wizard-2', 'spell', {
                  type: 'spell',
                  
                  // NO targetTokenId - targets static position, not tracking wizard-1
                  spellName: 'Fireball',
                  category: 'projectile-burst',
                  fromPosition: { x: 400, y: 300 }, // Expected: Wizard 2's final position
                  toPosition: { x: 100, y: 100 },   // Wizard 1's starting position (static)
                  color: '#00ff00',
                  size: 15,
                  duration: 1000,
                  burstRadius: 30
                }, 1)
              }
            }
          }
        },
        description: 'Add complex movement + spell sequence'
      },
      {
        type: 'capture',
        capture: { name: 'before-complex-sequence' },
        description: 'Capture initial positions'
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
        description: 'Execute all actions'
      },
      {
        type: 'wait',
        wait: 3000,
        description: 'Wait for all animations to complete'
      },
      {
        type: 'capture',
        capture: { name: 'after-complex-sequence' },
        description: 'Capture final state'
      },
      {
        type: 'assert',
        assert: {
          type: 'tokenPosition',
          params: { tokenId: 'wizard-1' },
          expected: { x: 200, y: 300 }
        },
        description: 'Verify Wizard 1 final position'
      },
      {
        type: 'assert',
        assert: {
          type: 'tokenPosition',
          params: { tokenId: 'wizard-2' },
          expected: { x: 400, y: 300 }
        },
        description: 'Verify Wizard 2 final position'
      },
      {
        type: 'wait',
        wait: 500,
        description: 'Pause to observe (fireballs should reflect final positions)'
      }
    ]
  },
  {
    id: 'magic-missile-movement-tracking',
    name: 'Magic Missile + Movement Tracking',
    description: 'Magic Missile should track moving targets and originate from caster\'s final position',
    category: 'spells',
    steps: [
      {
        type: 'action',
        action: {
          type: 'addToken',
          params: {
            id: 'mm-wizard-1',
            name: 'Wizard A',
            position: { x: 150, y: 150 },
            size: 'medium',
            color: '#8B5CF6',
            shape: 'circle'
          }
        },
        description: 'Add first wizard'
      },
      {
        type: 'action',
        action: {
          type: 'addToken',
          params: {
            id: 'mm-wizard-2',
            name: 'Wizard B',
            position: { x: 450, y: 150 },
            size: 'medium',
            color: '#EC4899',
            shape: 'circle'
          }
        },
        description: 'Add second wizard'
      },
      {
        type: 'wait',
        wait: 300,
        description: 'Wait for tokens to render'
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
        type: 'action',
        action: {
          type: 'custom',
          params: {
            execute: async () => {
              const roundStore = (await import('@/store/timelineStore')).default.getState()

              if (roundStore.timeline) {
                // 1. Wizard A moves: (150,150) -> (250,350)
                roundStore.addAction('mm-wizard-1', 'move', {
                  type: 'move',
                  fromPosition: { x: 150, y: 150 },
                  toPosition: { x: 250, y: 350 },
                  duration: 600
                }, 1)

                // 2. Wizard B moves: (450,150) -> (350,350)
                roundStore.addAction('mm-wizard-2', 'move', {
                  type: 'move',
                  fromPosition: { x: 450, y: 150 },
                  toPosition: { x: 350, y: 350 },
                  duration: 600
                }, 1)

                // 3. Wizard A casts Magic Missile at Wizard B
                roundStore.addAction('mm-wizard-1', 'spell', {
                  type: 'spell',
                  
                  targetTokenId: 'mm-wizard-2',
                  spellName: 'Magic Missile',
                  category: 'projectile',
                  fromPosition: { x: 250, y: 350 },
                  toPosition: { x: 350, y: 350 },
                  color: '#a855f7',
                  size: 10,
                  duration: 800
                }, 1)

                // 4. Wizard B casts Magic Missile back at Wizard A's INITIAL position (static target)
                roundStore.addAction('mm-wizard-2', 'spell', {
                  type: 'spell',
                  
                  // NO targetTokenId - targets static position, not tracking wizard A
                  spellName: 'Magic Missile',
                  category: 'projectile',
                  fromPosition: { x: 350, y: 350 },
                  toPosition: { x: 150, y: 150 }, // Wizard A's starting position (static)
                  color: '#ec4899',
                  size: 10,
                  duration: 800
                }, 1)
              }
            }
          }
        },
        description: 'Add movement + Magic Missile sequence'
      },
      {
        type: 'capture',
        capture: { name: 'before-magic-missile-sequence' },
        description: 'Capture initial positions'
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
        description: 'Execute all actions'
      },
      {
        type: 'wait',
        wait: 3000,
        description: 'Wait for all animations to complete'
      },
      {
        type: 'capture',
        capture: { name: 'after-magic-missile-sequence' },
        description: 'Capture final state'
      },
      {
        type: 'assert',
        assert: {
          type: 'tokenPosition',
          params: { tokenId: 'mm-wizard-1' },
          expected: { x: 250, y: 350 }
        },
        description: 'Verify Wizard A final position'
      },
      {
        type: 'assert',
        assert: {
          type: 'tokenPosition',
          params: { tokenId: 'mm-wizard-2' },
          expected: { x: 350, y: 350 }
        },
        description: 'Verify Wizard B final position'
      },
      {
        type: 'wait',
        wait: 500,
        description: 'Pause to observe (Magic Missiles should reflect final positions)'
      }
    ]
  },
  {
    id: 'ray-of-frost-movement-tracking',
    name: 'Ray of Frost + Movement Tracking',
    description: 'Ray of Frost should track moving targets and originate from caster\'s final position',
    category: 'spells',
    steps: [
      {
        type: 'action',
        action: {
          type: 'addToken',
          params: {
            id: 'rof-wizard-1',
            name: 'Ice Mage A',
            position: { x: 120, y: 200 },
            size: 'medium',
            color: '#60A5FA',
            shape: 'circle'
          }
        },
        description: 'Add first ice mage'
      },
      {
        type: 'action',
        action: {
          type: 'addToken',
          params: {
            id: 'rof-wizard-2',
            name: 'Ice Mage B',
            position: { x: 480, y: 200 },
            size: 'medium',
            color: '#34D399',
            shape: 'circle'
          }
        },
        description: 'Add second ice mage'
      },
      {
        type: 'wait',
        wait: 300,
        description: 'Wait for tokens to render'
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
        type: 'action',
        action: {
          type: 'custom',
          params: {
            execute: async () => {
              const roundStore = (await import('@/store/timelineStore')).default.getState()

              if (roundStore.timeline) {
                // 1. Ice Mage A moves: (120,200) -> (220,400)
                roundStore.addAction('rof-wizard-1', 'move', {
                  type: 'move',
                  fromPosition: { x: 120, y: 200 },
                  toPosition: { x: 220, y: 400 },
                  duration: 600
                }, 1)

                // 2. Ice Mage B moves: (480,200) -> (380,400)
                roundStore.addAction('rof-wizard-2', 'move', {
                  type: 'move',
                  fromPosition: { x: 480, y: 200 },
                  toPosition: { x: 380, y: 400 },
                  duration: 600
                }, 1)

                // 3. Ice Mage A casts Ray of Frost at Ice Mage B
                roundStore.addAction('rof-wizard-1', 'spell', {
                  type: 'spell',
                  
                  targetTokenId: 'rof-wizard-2',
                  spellName: 'Ray of Frost',
                  category: 'ray',
                  fromPosition: { x: 220, y: 400 },
                  toPosition: { x: 380, y: 400 },
                  color: '#60a5fa',
                  size: 8,
                  duration: 1000
                }, 1)

                // 4. Ice Mage B casts Ray of Frost back at Ice Mage A's INITIAL position (static target)
                roundStore.addAction('rof-wizard-2', 'spell', {
                  type: 'spell',
                  
                  // NO targetTokenId - targets static position, not tracking ice mage A
                  spellName: 'Ray of Frost',
                  category: 'ray',
                  fromPosition: { x: 380, y: 400 },
                  toPosition: { x: 120, y: 200 }, // Ice Mage A's starting position (static)
                  color: '#34d399',
                  size: 8,
                  duration: 1000
                }, 1)
              }
            }
          }
        },
        description: 'Add movement + Ray of Frost sequence'
      },
      {
        type: 'capture',
        capture: { name: 'before-ray-of-frost-sequence' },
        description: 'Capture initial positions'
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
        description: 'Execute all actions'
      },
      {
        type: 'wait',
        wait: 3000,
        description: 'Wait for all animations to complete'
      },
      {
        type: 'capture',
        capture: { name: 'after-ray-of-frost-sequence' },
        description: 'Capture final state'
      },
      {
        type: 'assert',
        assert: {
          type: 'tokenPosition',
          params: { tokenId: 'rof-wizard-1' },
          expected: { x: 220, y: 400 }
        },
        description: 'Verify Ice Mage A final position'
      },
      {
        type: 'assert',
        assert: {
          type: 'tokenPosition',
          params: { tokenId: 'rof-wizard-2' },
          expected: { x: 380, y: 400 }
        },
        description: 'Verify Ice Mage B final position'
      },
      {
        type: 'wait',
        wait: 500,
        description: 'Pause to observe (Ray of Frost should reflect final positions)'
      }
    ]
  },
  {
    id: 'ui-spell-conversion-validation',
    name: 'UI Spell Conversion Validation',
    description: 'Validates that UI-created spell actions include required fields (tokenId, targetTokenId)',
    category: 'spells',
    steps: [
      {
        type: 'action',
        action: {
          type: 'addToken',
          params: {
            id: 'test-wizard',
            name: 'Test Wizard',
            position: { x: 100, y: 100 },
            size: 'medium',
            color: '#3D82AB',
            shape: 'circle'
          }
        },
        description: 'Add wizard token'
      },
      {
        type: 'wait',
        wait: 300,
        description: 'Wait for token to render'
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
        type: 'action',
        action: {
          type: 'custom',
          params: {
            execute: async () => {
              // Check the timeline store after UI interaction
              const roundStore = (await import('@/store/timelineStore')).default.getState()

              // Simulate what UI does: create action through timeline
              roundStore.addAction('test-wizard', 'spell', {
                  type: 'spell',
                 // This should be set by UI
                targetTokenId: '',
                spellName: 'Test Spell',
                category: 'projectile',
                fromPosition: { x: 100, y: 100 },
                toPosition: { x: 300, y: 300 },
                color: '#ff0000',
                size: 20,
                duration: 1000
              }, 1)

              // Validate the action was created with tokenId
              if (roundStore.timeline) {
                const roundData = roundStore.timeline.rounds.find(r => r.number === 1)
                const event = roundData?.events.find((e: { number: number }) => e.number === 1)
                if (event) {
                  const spellAction = event.actions.find((a: { type: string }) => a.type === 'spell')
                  if (spellAction) {
                    const spellData = spellAction.data as any
                    if (!spellData.tokenId) {
                      throw new Error('VALIDATION FAILED: Spell action missing tokenId field!')
                    }
                    console.log('✅ Spell action includes tokenId:', spellData.tokenId)
                  }
                }
              }
            }
          }
        },
        description: 'Validate spell action includes tokenId'
      },
      {
        type: 'wait',
        wait: 500,
        description: 'Test complete'
      }
    ]
  },
  fireballPersistenceBugTest,
  persistentAreaCleanupTest,
  {
    id: 'timeline-navigation',
    name: 'Timeline Navigation - Event & Round Changes',
    description: 'Comprehensive test for timeline navigation: event/round changes, position restoration, post-effect cleanup, and snapshot system',
    category: 'combat',
    steps: [
      {
        type: 'action',
        action: {
          type: 'custom',
          params: {
            execute: async () => {
              // Run the comprehensive timeline navigation test
              runTimelineNavigationTest()
            }
          }
        },
        description: 'Execute comprehensive timeline navigation test flow'
      },
      {
        type: 'wait',
        wait: 30000, // 30 seconds - enough time for the full test sequence
        description: 'Wait for complete test execution (Round 1 → Round 2 → Navigation tests)'
      }
    ]
  },
  {
    id: 'round-replay',
    name: 'Round Replay - Animation Replay System',
    description: 'Verifies round replay functionality: Round 1 events → Start New Round → Previous Round → Next Round (should replay all Round 1 animations)',
    category: 'combat',
    steps: [
      {
        type: 'action',
        action: {
          type: 'custom',
          params: {
            execute: async () => {
              // Run the round replay test
              runRoundReplayTest()
            }
          }
        },
        description: 'Execute round replay test: create events, advance, go back, replay forward'
      },
      {
        type: 'wait',
        wait: 25000, // 25 seconds - enough time for the full replay sequence
        description: 'Wait for complete replay test (4 events in Round 1 + navigation + replay)'
      }
    ]
  },

  // ============================================================================
  // DYNAMIC SPELL TESTS - Auto-generated from spellTemplates.ts
  // ============================================================================
  // These tests are automatically generated for ALL spells in spellTemplates.ts
  // When spells are added/removed from spellTemplates.ts, tests update automatically
  // Each test validates: movement + spell tracking + spell to static position
  // Total tests: One per spell (currently 20 spells = 20 tests)
  ...allSpellTestScenarios,

  // ============================================================================
  // DYNAMIC ATTACK TESTS - Auto-generated weapon attack scenarios
  // ============================================================================
  // These tests are automatically generated for various weapon types
  // Each test validates: movement + attack animations for melee and ranged weapons
  // Covers slashing, piercing, and bludgeoning damage types
  // Total tests: 12 weapon types (6 melee + 6 ranged)
  ...allAttackTestScenarios
]

export function getScenarioById(id: string): TestScenario | undefined {
  return testScenarios.find(s => s.id === id)
}

export function getScenariosByCategory(category: TestScenario['category']): TestScenario[] {
  return testScenarios.filter(s => s.category === category)
}

// Get count of dynamically generated spell tests
export function getDynamicSpellTestCount(): number {
  return allSpellTestScenarios.length
}

// Get all spell test IDs for reference
export function getAllSpellTestIds(): string[] {
  return allSpellTestScenarios.map(scenario => scenario.id)
}

// Get count of dynamically generated attack tests
export function getDynamicAttackTestCount(): number {
  return allAttackTestScenarios.length
}

// Get all attack test IDs for reference
export function getAllAttackTestIds(): string[] {
  return allAttackTestScenarios.map(scenario => scenario.id)
}