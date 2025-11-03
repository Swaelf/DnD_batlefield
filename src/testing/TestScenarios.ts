import { allAttackTestScenarios } from './TestAllAttacks'
import { allSpellTestScenarios } from './TestAllSpells'
import { persistentSpellTests } from './TestPersistentSpells'
import { runTimelineNavigationTest } from './TestTimelineNavigation'
import { runRoundReplayTest } from './TestRoundReplay'
import { animationTests } from './TestAnimationComponents'
import { tokenTransformationTests } from './TestTokenTransformations'
import { staticLayerPerformanceTests } from './TestStaticLayerPerformance'
import { statusEffectTests } from './TestStatusEffects'

export interface TestStep {
  type: 'action' | 'wait' | 'assert' | 'capture'
  action?: TestAction
  wait?: number
  assert?: TestAssertion
  capture?: CaptureOptions
  description: string
}

export interface TestAction {
  type: 'addToken' | 'moveToken' | 'selectToken' | 'castSpell' | 'startCombat' | 'nextRound' | 'nextEvent' | 'selectTool' | 'addStaticObject' | 'custom'
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
  category: 'movement' | 'spells' | 'selection' | 'attacks' | 'timeline' | 'animations' | 'visual' | 'tokens'
  steps: TestStep[]
  cleanup?: () => void
}

export const testScenarios: TestScenario[] = [
  // ============================================================================
  // TOKEN TRANSFORMATION TESTS - Visual token property changes
  // ============================================================================
  // Tests visual token transformations:
  // - Rotation (with directional appearance)
  // - Size changes (tiny → small → medium → large → huge → gargantuan)
  // - Opacity changes (full → transparent → invisible)
  // - Shape changes (circle ↔ square)
  // Total: 4 token transformation tests
  ...tokenTransformationTests,

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
    id: 'timeline-navigation',
    name: 'Timeline Navigation - Event & Round Changes',
    description: 'Comprehensive test for timeline navigation: event/round changes, position restoration, post-effect cleanup, and snapshot system',
    category: 'timeline',
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
    category: 'timeline',
    steps: [
      {
        type: 'action',
        action: {
          type: 'custom',
          params: {
            execute: async () => {
              // Run the round replay test and WAIT for it to complete
              await runRoundReplayTest()
            }
          }
        },
        description: 'Execute round replay test: create events, advance, go back, replay forward (waits for completion)'
      }
    ]
  },

  // ============================================================================
  // SPELL MOVEMENT TRACKING TESTS - Auto-generated spell animation tests
  // ============================================================================
  // These tests are automatically generated for all registered spells in AnimationRegistry
  // Each test follows the SAME pattern as attack tests (movement + spell casting):
  // 1. Add token 1 (target) at (200, 200)
  // 2. Add token 2 (caster) at (500, 200)
  // 3. Move token 1 to (300, 400)
  // 4. Move token 2 to (600, 300)
  // 5. Token 2 casts spell at token 1 (tracking - follows movement)
  // 6. Token 2 casts spell at token 1's INITIAL position (static - no tracking)
  // 7. Execute event
  //
  // Categories: projectile, burst, area, ray, cone
  // Total tests: ~19 spells (Fireball, Magic Missile, Thunderwave, Ray of Frost, etc.)
  // NOTE: Tests automatically update when spells are added/removed from AnimationRegistry
  ...allSpellTestScenarios,

  // ============================================================================
  // PERSISTENT SPELL TESTS - Post-effect and continuous area spell tests
  // ============================================================================
  // These tests verify persistent spell effects (burning ground, area effects, etc.)
  // Two categories:
  // 1. EVENT-BASED persistence (durationType: 'events'):
  //    - Fireball, Burning Hands, Poison Spray, Cone of Cold, Breath Weapon, Ice Storm
  //    - Tests that post-effect persists for 1 event and is removed after next event
  //    - Flow: Cast spell → Execute Event 1 → Post-effect visible → Advance to Event 2 → Add dummy action → Execute Event 2 → Post-effect removed
  // 2. ROUND-BASED persistence (durationType: 'rounds'):
  //    - Darkness, Web (both persist for 10 rounds)
  //    - Tests that area effect persists across all rounds and is removed after duration expires
  //    - Flow: Cast spell (Round 1) → Advance through Rounds 2-10 → Area visible throughout → Advance to Round 11 → Area removed
  //    - Captures: Round 1 (visible), Round 2 (visible), Round 10 (visible - last round), Round 11 (removed)
  // Total tests: 8 persistent spell tests (6 event-based + 2 round-based)
  ...persistentSpellTests,

  // ============================================================================
  // DYNAMIC ATTACK TESTS - Auto-generated weapon attack scenarios
  // ============================================================================
  // These tests are automatically generated for various weapon types
  // Each test validates: movement + attack animations for melee and ranged weapons
  // Covers slashing, piercing, and bludgeoning damage types
  // Total tests: ~12 weapon types (6 melee + 6 ranged)
  ...allAttackTestScenarios,

  // ============================================================================
  // ANIMATION TESTS - Visual animation rendering tests
  // ============================================================================

  // ANIMATION COMPONENT TESTS
  // Tests that each animation category renders and animates correctly:
  // - Projectile (arrows, missiles)
  // - Burst (explosions, impacts)
  // - Projectile-Burst (fireball pattern)
  // - Cone (breath weapons, sprays)
  // - Ray (instant beams)
  // - Beam (sustained beams)
  // - Area (circles, auras)
  // - Multi-Projectile (magic missile)
  // Total: 8 animation component tests
  ...animationTests,

  // STATUS EFFECT ANIMATION TESTS
  // Tests all status effect animations and behavior:
  // - Individual effect tests (12 effects: stunned, poisoned, prone, entangled, dying, flaming, chilled, dazed, blessed, regenerating, sleeping, frightened)
  // - Effect stacking (multiple effects on one token)
  // - Effect expiration (timeline-based cleanup)
  // - Intensity variations (low vs high intensity rendering)
  // Total tests: 16 status effect tests (12 individual + 4 functional)
  ...statusEffectTests,

  // ============================================================================
  // STATIC LAYER PERFORMANCE TESTS - Visual performance tests with many objects
  // ============================================================================
  // Tests the performance optimization of StaticObjectsLayer and StaticEffectsLayer
  // Test 1: Static Objects (25 objects: 15 trees + 5 walls + 5 furniture) + 2 tokens + animations
  // Test 2: Static Effects (5 persistent spell zones) + 2 tokens + animations
  // Expected gains: 22-50% FPS improvement (static objects), 20-40% FPS improvement (static effects)
  // Total tests: 2 performance tests
  ...staticLayerPerformanceTests
]

export function getScenarioById(id: string): TestScenario | undefined {
  return testScenarios.find(s => s.id === id)
}

export function getScenariosByCategory(category: TestScenario['category']): TestScenario[] {
  return testScenarios.filter(s => s.category === category)
}

// Get count of dynamically generated attack tests
export function getDynamicAttackTestCount(): number {
  return allAttackTestScenarios.length
}

// Get all attack test IDs for reference
export function getAllAttackTestIds(): string[] {
  return allAttackTestScenarios.map(scenario => scenario.id)
}