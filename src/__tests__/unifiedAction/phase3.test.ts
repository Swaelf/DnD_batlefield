import { describe, test, expect, beforeEach, vi } from 'vitest'
import { useUnifiedActionStore } from '@/store/unifiedActionStore'
import { createMockAction, createMockToken, resetStore } from './testUtils'
import {
  isPointInArea,
  isPointInCircle,
  isPointInSquare,
  isPointInCone,
  isPointNearLine,
  getTokensInArea,
  getAreaBounds,
  getAreaCenter,
  getAreaSize,
  doAreasOverlap
} from '@/utils/areaCalculations'
import {
  detectAffectedTokens,
  generateActionArea,
  requiresLineOfSight,
  groupTokensByDistance,
  calculateOptimalTargetPoint
} from '@/utils/targetDetection'
import type { CircularArea, SquareArea, ConeArea, LineArea } from '@/types/unifiedAction'

describe('Phase 3: Target Detection & Highlighting', () => {
  beforeEach(() => {
    resetStore()
    vi.clearAllMocks()
  })

  describe('Area Calculation Utilities', () => {
    describe('Point in Area Detection', () => {
      test('should detect point in circle', () => {
        const circle: CircularArea = {
          type: 'circle',
          center: { x: 100, y: 100 },
          radius: 50
        }

        expect(isPointInCircle({ x: 100, y: 100 }, circle)).toBe(true) // Center
        expect(isPointInCircle({ x: 120, y: 100 }, circle)).toBe(true) // Inside
        expect(isPointInCircle({ x: 150, y: 100 }, circle)).toBe(true) // On edge
        expect(isPointInCircle({ x: 151, y: 100 }, circle)).toBe(false) // Outside
      })

      test('should detect point in square', () => {
        const square: SquareArea = {
          type: 'square',
          center: { x: 100, y: 100 },
          size: 100
        }

        expect(isPointInSquare({ x: 100, y: 100 }, square)).toBe(true) // Center
        expect(isPointInSquare({ x: 120, y: 120 }, square)).toBe(true) // Inside
        expect(isPointInSquare({ x: 150, y: 150 }, square)).toBe(true) // On edge
        expect(isPointInSquare({ x: 151, y: 151 }, square)).toBe(false) // Outside
      })

      test('should detect point in cone', () => {
        const cone: ConeArea = {
          type: 'cone',
          origin: { x: 100, y: 100 },
          direction: 0, // Pointing right
          angle: 60,
          range: 100
        }

        expect(isPointInCone({ x: 150, y: 100 }, cone)).toBe(true) // Direct ahead
        expect(isPointInCone({ x: 150, y: 120 }, cone)).toBe(true) // Within angle
        expect(isPointInCone({ x: 150, y: 160 }, cone)).toBe(false) // Outside angle
        expect(isPointInCone({ x: 250, y: 100 }, cone)).toBe(false) // Out of range
      })

      test('should detect point near line', () => {
        const line: LineArea = {
          type: 'line',
          start: { x: 100, y: 100 },
          end: { x: 200, y: 100 },
          width: 20
        }

        expect(isPointNearLine({ x: 150, y: 100 }, line)).toBe(true) // On line
        expect(isPointNearLine({ x: 150, y: 109 }, line)).toBe(true) // Within width
        expect(isPointNearLine({ x: 150, y: 111 }, line)).toBe(false) // Outside width
        expect(isPointNearLine({ x: 50, y: 100 }, line)).toBe(false) // Before start
      })

      test('should handle generic point in area check', () => {
        const circle: CircularArea = {
          type: 'circle',
          center: { x: 100, y: 100 },
          radius: 50
        }

        const square: SquareArea = {
          type: 'square',
          center: { x: 200, y: 200 },
          size: 100
        }

        expect(isPointInArea({ x: 100, y: 100 }, circle)).toBe(true)
        expect(isPointInArea({ x: 200, y: 200 }, square)).toBe(true)
        expect(isPointInArea({ x: 300, y: 300 }, circle)).toBe(false)
      })
    })

    describe('Token Detection', () => {
      test('should find tokens in circular area', () => {
        const tokens = [
          createMockToken({ id: 't1', position: { x: 100, y: 100 } }),
          createMockToken({ id: 't2', position: { x: 120, y: 100 } }),
          createMockToken({ id: 't3', position: { x: 200, y: 200 } })
        ]

        const area: CircularArea = {
          type: 'circle',
          center: { x: 100, y: 100 },
          radius: 50
        }

        const result = getTokensInArea(tokens, area)
        expect(result).toHaveLength(2)
        expect(result.map(t => t.id)).toContain('t1')
        expect(result.map(t => t.id)).toContain('t2')
      })

      test('should exclude source token when specified', () => {
        const tokens = [
          createMockToken({ id: 'source', position: { x: 100, y: 100 } }),
          createMockToken({ id: 'target', position: { x: 120, y: 100 } })
        ]

        const area: CircularArea = {
          type: 'circle',
          center: { x: 100, y: 100 },
          radius: 50
        }

        const result = getTokensInArea(tokens, area, 'source')
        expect(result).toHaveLength(1)
        expect(result[0].id).toBe('target')
      })
    })

    describe('Area Bounds Calculation', () => {
      test('should calculate circle bounds', () => {
        const circle: CircularArea = {
          type: 'circle',
          center: { x: 100, y: 100 },
          radius: 50
        }

        const bounds = getAreaBounds(circle)
        expect(bounds.min).toEqual({ x: 50, y: 50 })
        expect(bounds.max).toEqual({ x: 150, y: 150 })
      })

      test('should calculate square bounds', () => {
        const square: SquareArea = {
          type: 'square',
          center: { x: 100, y: 100 },
          size: 100
        }

        const bounds = getAreaBounds(square)
        expect(bounds.min).toEqual({ x: 50, y: 50 })
        expect(bounds.max).toEqual({ x: 150, y: 150 })
      })

      test('should calculate cone bounds', () => {
        const cone: ConeArea = {
          type: 'cone',
          origin: { x: 100, y: 100 },
          direction: 0,
          angle: 60,
          range: 50
        }

        const bounds = getAreaBounds(cone)
        expect(bounds.min).toEqual({ x: 50, y: 50 })
        expect(bounds.max).toEqual({ x: 150, y: 150 })
      })

      test('should calculate line bounds', () => {
        const line: LineArea = {
          type: 'line',
          start: { x: 100, y: 100 },
          end: { x: 200, y: 150 },
          width: 20
        }

        const bounds = getAreaBounds(line)
        expect(bounds.min.x).toBeLessThanOrEqual(100)
        expect(bounds.min.y).toBeLessThanOrEqual(100)
        expect(bounds.max.x).toBeGreaterThanOrEqual(200)
        expect(bounds.max.y).toBeGreaterThanOrEqual(150)
      })
    })

    describe('Area Properties', () => {
      test('should calculate area center', () => {
        const circle: CircularArea = {
          type: 'circle',
          center: { x: 100, y: 100 },
          radius: 50
        }

        const line: LineArea = {
          type: 'line',
          start: { x: 100, y: 100 },
          end: { x: 200, y: 100 },
          width: 20
        }

        expect(getAreaCenter(circle)).toEqual({ x: 100, y: 100 })
        expect(getAreaCenter(line)).toEqual({ x: 150, y: 100 })
      })

      test('should calculate area size', () => {
        const circle: CircularArea = {
          type: 'circle',
          center: { x: 100, y: 100 },
          radius: 50
        }

        const square: SquareArea = {
          type: 'square',
          center: { x: 100, y: 100 },
          size: 100
        }

        const circleSize = getAreaSize(circle)
        expect(circleSize).toBeCloseTo(Math.PI * 50 * 50, 1)

        const squareSize = getAreaSize(square)
        expect(squareSize).toBe(10000)
      })

      test('should detect area overlap', () => {
        const circle1: CircularArea = {
          type: 'circle',
          center: { x: 100, y: 100 },
          radius: 50
        }

        const circle2: CircularArea = {
          type: 'circle',
          center: { x: 120, y: 100 },
          radius: 50
        }

        const circle3: CircularArea = {
          type: 'circle',
          center: { x: 300, y: 300 },
          radius: 50
        }

        expect(doAreasOverlap(circle1, circle2)).toBe(true)
        expect(doAreasOverlap(circle1, circle3)).toBe(false)
      })
    })
  })

  describe('Target Detection Algorithms', () => {
    test('should detect directly targeted tokens', () => {
      const tokens = [
        createMockToken({ id: 't1' }),
        createMockToken({ id: 't2' }),
        createMockToken({ id: 't3' })
      ]

      const action = createMockAction({
        target: ['t1', 't3']
      })

      const affected = detectAffectedTokens(action, tokens)
      expect(affected).toHaveLength(2)
      expect(affected.map(t => t.id)).toContain('t1')
      expect(affected.map(t => t.id)).toContain('t3')
    })

    test('should detect tokens in area of effect', () => {
      const tokens = [
        createMockToken({ id: 't1', position: { x: 100, y: 100 } }),
        createMockToken({ id: 't2', position: { x: 120, y: 100 } }),
        createMockToken({ id: 't3', position: { x: 200, y: 200 } })
      ]

      const action = createMockAction({
        effects: {
          affectedTargets: [],
          areaOfEffect: {
            type: 'circle',
            center: { x: 100, y: 100 },
            radius: 50
          }
        }
      })

      const affected = detectAffectedTokens(action, tokens, false)
      expect(affected).toHaveLength(2)
    })

    test('should generate spell area based on category', () => {
      const fireAction = createMockAction({
        type: 'spell',
        category: 'fire',
        target: ['token-1'], // String array target
        animation: { type: 'burst', duration: 1000, color: '#FF0000', size: 100 }
      })

      const healingAction = createMockAction({
        type: 'spell',
        category: 'healing',
        animation: { type: 'area', duration: 1000, color: '#00FF00', size: 60 }
      })

      const fireAreaWithoutTarget = generateActionArea(fireAction, { x: 0, y: 0 })
      const fireAreaWithTarget = generateActionArea({ ...fireAction, target: { x: 200, y: 200 } }, { x: 0, y: 0 })
      const healingArea = generateActionArea(healingAction, { x: 100, y: 100 })

      expect(fireAreaWithoutTarget).toBeNull() // Fire needs target
      expect(fireAreaWithTarget).not.toBeNull() // Fire with target creates area
      expect(healingArea?.type).toBe('circle')
      if (healingArea?.type === 'circle') {
        expect(healingArea.radius).toBe(60)
      }
    })

    test('should generate attack area based on type', () => {
      const swordAction = createMockAction({
        type: 'attack',
        category: 'sword'
      })

      const area = generateActionArea(swordAction, { x: 100, y: 100 })
      expect(area?.type).toBe('circle')
      if (area?.type === 'circle') {
        expect(area.radius).toBe(50) // Melee reach
      }
    })

    test('should determine line of sight requirements', () => {
      const fireSpell = createMockAction({ type: 'spell', category: 'fire' })
      const arrowAttack = createMockAction({ type: 'attack', category: 'arrow' })
      const doorInteraction = createMockAction({ type: 'interaction', category: 'door' })

      expect(requiresLineOfSight(fireSpell)).toBe(false) // Area spell
      expect(requiresLineOfSight(arrowAttack)).toBe(true) // Ranged attack
      expect(requiresLineOfSight(doorInteraction)).toBe(false) // Interaction
    })

    test('should group tokens by distance', () => {
      const tokens = [
        createMockToken({ id: 't1', position: { x: 30, y: 30 } }), // distance ~42 (near)
        createMockToken({ id: 't2', position: { x: 100, y: 0 } }),  // distance 100 (medium)
        createMockToken({ id: 't3', position: { x: 200, y: 200 } }) // distance ~283 (far)
      ]

      const groups = groupTokensByDistance(tokens, { x: 0, y: 0 })
      expect(groups.near).toHaveLength(1) // t1
      expect(groups.medium).toHaveLength(1) // t2
      expect(groups.far).toHaveLength(1) // t3
    })

    test('should calculate optimal target point', () => {
      const enemy1 = createMockToken({ id: 'enemy1', position: { x: 100, y: 100 } })
      const enemy2 = createMockToken({ id: 'enemy2', position: { x: 120, y: 100 } })
      const friend = createMockToken({ id: 'friend', position: { x: 110, y: 110 } })

      const optimal = calculateOptimalTargetPoint(
        { x: 0, y: 0 }, // caster position
        [enemy1, enemy2], // enemies
        [friend], // allies
        50 // area radius
      )

      // Should favor hitting enemies while avoiding friend
      expect(optimal.x).toBeGreaterThan(0)
      expect(optimal.y).toBeGreaterThan(0)
    })
  })

  describe('Highlighting Integration', () => {
    test('should highlight targets when action executes', () => {
      const store = useUnifiedActionStore.getState()

      const action = createMockAction({
        id: 'highlight-test',
        animation: { type: 'burst', duration: 1000, color: '#FF0000' }
      })

      store.executeAction(action)
      store.highlightTargets(['token-1'], 'highlight-test', '#FF0000')

      const state = useUnifiedActionStore.getState()
      expect(state.highlightedTargets).toHaveLength(1)
      expect(state.highlightedTargets[0].tokenId).toBe('token-1')
      expect(state.highlightedTargets[0].actionId).toBe('highlight-test')
    })

    test('should clear highlights when action completes', () => {
      const store = useUnifiedActionStore.getState()

      store.highlightTargets(['token-1', 'token-2'], 'action-1', '#FF0000')
      store.highlightTargets(['token-3'], 'action-2', '#00FF00')

      store.clearHighlight('action-1')

      const state = useUnifiedActionStore.getState()
      expect(state.highlightedTargets).toHaveLength(1)
      expect(state.highlightedTargets[0].actionId).toBe('action-2')
    })

    test('should clear all highlights', () => {
      const store = useUnifiedActionStore.getState()

      store.highlightTargets(['token-1'], 'action-1', '#FF0000')
      store.highlightTargets(['token-2'], 'action-2', '#00FF00')

      store.clearAllHighlights()

      const state = useUnifiedActionStore.getState()
      expect(state.highlightedTargets).toHaveLength(0)
    })
  })

  describe('Complex Scenarios', () => {
    test('should handle cone spell affecting multiple tokens', () => {
      const tokens = [
        createMockToken({ id: 't1', position: { x: 150, y: 100 } }),
        createMockToken({ id: 't2', position: { x: 150, y: 120 } }),
        createMockToken({ id: 't3', position: { x: 150, y: 200 } }),
        createMockToken({ id: 'caster', position: { x: 100, y: 100 } })
      ]

      const action = createMockAction({
        type: 'spell',
        category: 'divine',
        source: 'caster',
        target: { x: 200, y: 100 },
        effects: {
          affectedTargets: [],
          areaOfEffect: {
            type: 'cone',
            origin: { x: 100, y: 100 },
            direction: 0,
            angle: 60,
            range: 100
          }
        }
      })

      const affected = detectAffectedTokens(action, tokens, true)
      expect(affected).toHaveLength(2) // t1 and t2, not t3 or caster
      expect(affected.map(t => t.id)).not.toContain('caster')
      expect(affected.map(t => t.id)).not.toContain('t3')
    })

    test('should handle line attack hitting tokens along path', () => {
      const tokens = [
        createMockToken({ id: 't1', position: { x: 150, y: 100 } }),
        createMockToken({ id: 't2', position: { x: 150, y: 110 } }),
        createMockToken({ id: 't3', position: { x: 100, y: 200 } })
      ]

      const action = createMockAction({
        type: 'attack',
        category: 'arrow',
        effects: {
          affectedTargets: [],
          areaOfEffect: {
            type: 'line',
            start: { x: 100, y: 100 },
            end: { x: 200, y: 100 },
            width: 20
          }
        }
      })

      const affected = detectAffectedTokens(action, tokens)
      expect(affected).toHaveLength(2) // t1 and t2 along the line
      expect(affected.map(t => t.id)).not.toContain('t3')
    })

    test('should handle area overlap detection', () => {
      const store = useUnifiedActionStore.getState()

      const action1 = createMockAction({
        id: 'area-1',
        effects: {
          affectedTargets: [],
          areaOfEffect: {
            type: 'circle',
            center: { x: 100, y: 100 },
            radius: 50
          }
        }
      })

      const action2 = createMockAction({
        id: 'area-2',
        effects: {
          affectedTargets: [],
          areaOfEffect: {
            type: 'circle',
            center: { x: 120, y: 100 },
            radius: 50
          }
        }
      })

      store.executeAction(action1)
      store.executeAction(action2)

      const state = useUnifiedActionStore.getState()
      expect(state.activeActions).toHaveLength(2)

      // Areas overlap
      const overlap = doAreasOverlap(
        action1.effects.areaOfEffect!,
        action2.effects.areaOfEffect!
      )
      expect(overlap).toBe(true)
    })
  })
})