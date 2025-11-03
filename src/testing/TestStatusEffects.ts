/**
 * Status Effect Visual Tests
 *
 * Tests all status effect animations and visual rendering
 * Integrates with existing TestScenarios system
 */

import type { TestScenario } from './TestScenarios'
import useMapStore from '@/store/mapStore'
import useTimelineStore from '@/store/timelineStore'
import type { StatusEffectType } from '@/types'
import { STATUS_EFFECT_CONFIGS } from '@/types'

// All status effect types
const allEffectTypes: StatusEffectType[] = [
  'stunned',
  'poisoned',
  'prone',
  'entangled',
  'dying',
  'flaming',
  'chilled',
  'dazed',
  'blessed',
  'regenerating',
  'sleeping',
  'frightened',
]

export const statusEffectTests: TestScenario[] = [
  // Test individual status effects
  ...allEffectTypes.map((effectType) => {
    const config = STATUS_EFFECT_CONFIGS[effectType]
    return {
      id: `status-effect-${effectType}`,
      name: `Status Effect: ${config.name}`,
      description: `Tests ${config.name} status effect animation and rendering`,
      category: 'animations' as const,
      steps: [
        {
          type: 'action' as const,
          action: {
            type: 'addToken' as const,
            params: {
              id: `test-token-${effectType}`,
              name: 'Test Token',
              position: { x: 400, y: 300 },
              size: 'medium',
              color: '#4A5568',
              shape: 'circle',
            },
          },
          description: 'Add test token',
        },
        {
          type: 'action' as const,
          action: {
            type: 'custom' as const,
            params: {
              execute: () => {
                const mapStore = useMapStore.getState()
                const timelineStore = useTimelineStore.getState()
                const currentRound = timelineStore.currentRound

                mapStore.addStatusEffect(`test-token-${effectType}`, {
                  type: effectType,
                  intensity: 1,
                  duration: 3,
                  source: 'test',
                  roundApplied: currentRound,
                })
              },
            },
          },
          description: `Apply ${config.name} effect`,
        },
        {
          type: 'wait' as const,
          wait: 2000,
          description: 'Wait for animation to run',
        },
        {
          type: 'capture' as const,
          capture: {
            name: `status-effect-${effectType}`,
          },
          description: `Capture ${config.name} visual`,
        },
        {
          type: 'assert' as const,
          assert: {
            type: 'custom' as const,
            params: {
              validate: () => {
                const mapStore = useMapStore.getState()
                const obj = mapStore.currentMap?.objects.find(
                  (o) => o.id === `test-token-${effectType}`
                )

                if (!obj || obj.type !== 'token') return false
                const token = obj as import('@/types').Token
                if (!token.statusEffects || token.statusEffects.length === 0) return false

                const hasEffect = token.statusEffects.some((e: import('@/types').StatusEffect) => e.type === effectType)
                return hasEffect
              },
            },
            expected: true,
          },
          description: `Verify ${config.name} effect is active`,
        },
      ],
      cleanup: () => {
        const mapStore = useMapStore.getState()
        mapStore.deleteObject(`test-token-${effectType}`)
      },
    }
  }),

  // Test multiple effects stacking
  {
    id: 'status-effects-stacking',
    name: 'Status Effects Stacking',
    description: 'Tests multiple status effects on a single token',
    category: 'animations',
    steps: [
      {
        type: 'action' as const,
        action: {
          type: 'addToken' as const,
          params: {
            id: 'test-token-stacking',
            name: 'Multi-Effect Token',
            position: { x: 400, y: 300 },
            size: 'medium',
            color: '#4A5568',
            shape: 'circle',
          },
        },
        description: 'Add test token',
      },
      {
        type: 'action' as const,
        action: {
          type: 'custom' as const,
          params: {
            execute: () => {
              const mapStore = useMapStore.getState()
              const timelineStore = useTimelineStore.getState()
              const currentRound = timelineStore.currentRound

              // Apply multiple effects
              const effects: StatusEffectType[] = ['flaming', 'poisoned', 'stunned']
              effects.forEach((effectType) => {
                mapStore.addStatusEffect('test-token-stacking', {
                  type: effectType,
                  intensity: 1,
                  duration: 5,
                  source: 'test',
                  roundApplied: currentRound,
                })
              })
            },
          },
        },
        description: 'Apply multiple effects (flaming, poisoned, stunned)',
      },
      {
        type: 'wait' as const,
        wait: 3000,
        description: 'Wait for animations to run',
      },
      {
        type: 'capture' as const,
        capture: {
          name: 'status-effects-stacking',
        },
        description: 'Capture stacked effects visual',
      },
      {
        type: 'assert' as const,
        assert: {
          type: 'custom' as const,
          params: {
            validate: () => {
              const mapStore = useMapStore.getState()
              const obj = mapStore.currentMap?.objects.find(
                (o) => o.id === 'test-token-stacking'
              )

              if (!obj || obj.type !== 'token') return false
              const token = obj as import('@/types').Token
              if (!token.statusEffects) return false

              return token.statusEffects.length === 3
            },
          },
          expected: true,
        },
        description: 'Verify 3 effects are active',
      },
    ],
    cleanup: () => {
      const mapStore = useMapStore.getState()
      mapStore.deleteObject('test-token-stacking')
    },
  },

  // Test effect expiration
  {
    id: 'status-effects-expiration',
    name: 'Status Effect Expiration',
    description: 'Tests that status effects expire after duration runs out',
    category: 'timeline',
    steps: [
      {
        type: 'action' as const,
        action: {
          type: 'startCombat',
          params: {},
        },
        description: 'Start combat',
      },
      {
        type: 'action' as const,
        action: {
          type: 'addToken',
          params: {
            id: 'test-token-expiration',
            name: 'Expiring Effect Token',
            position: { x: 400, y: 300 },
            size: 'medium',
            color: '#4A5568',
            shape: 'circle',
          },
        },
        description: 'Add test token',
      },
      {
        type: 'action' as const,
        action: {
          type: 'custom' as const,
          params: {
            execute: () => {
              const mapStore = useMapStore.getState()
              const timelineStore = useTimelineStore.getState()
              const currentRound = timelineStore.currentRound

              // Apply effect with 2-round duration
              mapStore.addStatusEffect('test-token-expiration', {
                type: 'chilled',
                intensity: 1,
                duration: 2,
                source: 'test',
                roundApplied: currentRound,
              })
            },
          },
        },
        description: 'Apply chilled effect (2 rounds)',
      },
      {
        type: 'wait' as const,
        wait: 1000,
        description: 'Wait a moment',
      },
      {
        type: 'assert' as const,
        assert: {
          type: 'custom' as const,
          params: {
            validate: () => {
              const mapStore = useMapStore.getState()
              const obj = mapStore.currentMap?.objects.find(
                (o) => o.id === 'test-token-expiration'
              )

              if (!obj || obj.type !== 'token') return false
              const token = obj as import('@/types').Token
              return token.statusEffects && token.statusEffects.length === 1
            },
          },
          expected: true,
        },
        description: 'Verify effect is active initially',
      },
      {
        type: 'action' as const,
        action: {
          type: 'nextRound',
          params: {},
        },
        description: 'Advance to round 2',
      },
      {
        type: 'wait' as const,
        wait: 500,
        description: 'Wait for cleanup',
      },
      {
        type: 'assert' as const,
        assert: {
          type: 'custom' as const,
          params: {
            validate: () => {
              const mapStore = useMapStore.getState()
              const obj = mapStore.currentMap?.objects.find(
                (o) => o.id === 'test-token-expiration'
              )

              if (!obj || obj.type !== 'token') return false
              const token = obj as import('@/types').Token
              return token.statusEffects && token.statusEffects.length === 1
            },
          },
          expected: true,
        },
        description: 'Verify effect still active in round 2',
      },
      {
        type: 'action' as const,
        action: {
          type: 'nextRound',
          params: {},
        },
        description: 'Advance to round 3',
      },
      {
        type: 'wait' as const,
        wait: 500,
        description: 'Wait for cleanup',
      },
      {
        type: 'assert' as const,
        assert: {
          type: 'custom' as const,
          params: {
            validate: () => {
              const mapStore = useMapStore.getState()
              const obj = mapStore.currentMap?.objects.find(
                (o) => o.id === 'test-token-expiration'
              )

              if (!obj || obj.type !== 'token') return false
              const token = obj as import('@/types').Token
              // Effect should be expired now (roundApplied=1, duration=2, now at round 3)
              return !token.statusEffects || token.statusEffects.length === 0
            },
          },
          expected: true,
        },
        description: 'Verify effect expired in round 3',
      },
    ],
    cleanup: () => {
      const mapStore = useMapStore.getState()
      const timelineStore = useTimelineStore.getState()
      mapStore.deleteObject('test-token-expiration')
      timelineStore.endCombat()
    },
  },

  // Test intensity variations
  {
    id: 'status-effects-intensity',
    name: 'Status Effect Intensity',
    description: 'Tests different intensity values for status effects',
    category: 'animations',
    steps: [
      {
        type: 'action' as const,
        action: {
          type: 'addToken',
          params: {
            id: 'test-token-intensity-low',
            name: 'Low Intensity',
            position: { x: 300, y: 300 },
            size: 'medium',
            color: '#4A5568',
            shape: 'circle',
          },
        },
        description: 'Add token for low intensity',
      },
      {
        type: 'action' as const,
        action: {
          type: 'addToken',
          params: {
            id: 'test-token-intensity-high',
            name: 'High Intensity',
            position: { x: 500, y: 300 },
            size: 'medium',
            color: '#4A5568',
            shape: 'circle',
          },
        },
        description: 'Add token for high intensity',
      },
      {
        type: 'action' as const,
        action: {
          type: 'custom' as const,
          params: {
            execute: () => {
              const mapStore = useMapStore.getState()
              const timelineStore = useTimelineStore.getState()
              const currentRound = timelineStore.currentRound

              // Low intensity
              mapStore.addStatusEffect('test-token-intensity-low', {
                type: 'flaming',
                intensity: 0.3,
                duration: 5,
                source: 'test',
                roundApplied: currentRound,
              })

              // High intensity
              mapStore.addStatusEffect('test-token-intensity-high', {
                type: 'flaming',
                intensity: 1.5,
                duration: 5,
                source: 'test',
                roundApplied: currentRound,
              })
            },
          },
        },
        description: 'Apply flaming effects with different intensities',
      },
      {
        type: 'wait' as const,
        wait: 2000,
        description: 'Wait for animations',
      },
      {
        type: 'capture' as const,
        capture: {
          name: 'status-effects-intensity',
        },
        description: 'Capture intensity comparison',
      },
    ],
    cleanup: () => {
      const mapStore = useMapStore.getState()
      mapStore.deleteObject('test-token-intensity-low')
      mapStore.deleteObject('test-token-intensity-high')
    },
  },
]
