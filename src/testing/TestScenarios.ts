import { fireballPersistenceBugTest } from './TestFireballFix'
import { persistentAreaCleanupTest } from './TestPersistentAreaCleanup'

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
  type: 'tokenPosition' | 'tokenExists' | 'spellActive' | 'roundNumber' | 'selectionCount' | 'toolActive' | 'custom'
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
    description: 'Tests token placement and movement',
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
            size: 'medium'
          }
        },
        description: 'Add token to map'
      },
      {
        type: 'capture',
        capture: { name: 'token-placed' },
        description: 'Capture token placement'
      },
      {
        type: 'assert',
        assert: {
          type: 'tokenPosition',
          params: { tokenId: 'test-token-1' },
          expected: { x: 100, y: 100 }
        },
        description: 'Verify token position'
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
        description: 'Move token'
      },
      {
        type: 'wait',
        wait: 1500,
        description: 'Wait for animation'
      },
      {
        type: 'capture',
        capture: { name: 'token-moved' },
        description: 'Capture after movement'
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
            size: 'medium'
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
            size: 'small'
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
              type: 'spell',
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
        wait: 500,
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
            size: 'medium'
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
            size: 'medium'
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
            size: 'medium'
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
            size: 'medium'
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
              type: 'spell',
              spellName: 'Lightning Bolt',
              category: 'ray',
              fromPosition: { x: 200, y: 300 },
              toPosition: { x: 400, y: 300 },
              targetTokenId: 'ray-target',
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
  fireballPersistenceBugTest,
  persistentAreaCleanupTest
]

export function getScenarioById(id: string): TestScenario | undefined {
  return testScenarios.find(s => s.id === id)
}

export function getScenariosByCategory(category: TestScenario['category']): TestScenario[] {
  return testScenarios.filter(s => s.category === category)
}