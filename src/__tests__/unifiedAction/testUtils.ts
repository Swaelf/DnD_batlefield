import type { ReactElement } from 'react'
import { render } from '@testing-library/react'
import type { UnifiedAction, ActionHistoryEntry } from '@/types/unifiedAction'
import type { Token, BattleMap } from '@/types'
import type { Point } from '@/types/geometry'
import { useUnifiedActionStore } from '@/store/unifiedActionStore'

// Mock data generators
export const createMockAction = (overrides?: Partial<UnifiedAction>): UnifiedAction => ({
  id: 'action-1',
  type: 'spell',
  category: 'projectile',
  source: { x: 0, y: 0 },
  target: { x: 100, y: 100 },
  animation: {
    type: 'projectile',
    duration: 1000,
    color: '#FF0000',
    size: 20
  },
  effects: {
    affectedTargets: [],
    highlightColor: '#FFD700'
  },
  metadata: {
    name: 'Test Action',
    description: 'A test action'
  },
  timestamp: Date.now(),
  duration: 1000,
  ...overrides
})

export const createMockToken = (positionOrOverrides?: Point | Partial<Token>, overrides?: Partial<Token>): Token => {
  // Handle both call signatures
  let position: Point
  let finalOverrides: Partial<Token>

  if (positionOrOverrides && 'x' in positionOrOverrides && 'y' in positionOrOverrides && !('id' in positionOrOverrides)) {
    // First argument is a Point
    position = positionOrOverrides as Point
    finalOverrides = overrides || {}
  } else {
    // First argument is overrides
    position = (positionOrOverrides as Partial<Token>)?.position || { x: 0, y: 0 }
    finalOverrides = (positionOrOverrides as Partial<Token>) || {}
  }

  return {
    id: `token-${Math.random()}`,
    type: 'token' as const,
    position,
    rotation: 0,
    layer: 5,
    size: 'medium',
    name: 'Test Token',
    image: '/test-token.png',
    ...finalOverrides
  }
}

export const createMockMap = (tokens: Token[]): BattleMap => ({
  id: 'test-map',
  name: 'Test Map',
  width: 1920,
  height: 1080,
  objects: tokens,
  grid: {
    size: 50,
    type: 'square',
    visible: true,
    snap: true,
    color: '#333333',
    opacity: 0.3,
    offset: { x: 0, y: 0 }
  },
  background: {
    color: '#1a1a1a',
    image: null
  },
  version: 1
})

// Test helpers
export const renderWithStore = (
  component: ReactElement,
  initialState?: Partial<ReturnType<typeof useUnifiedActionStore.getState>>
) => {
  // Set initial store state if provided
  if (initialState) {
    useUnifiedActionStore.setState(initialState as any)
  }

  return render(component)
}

export const waitForAnimation = (duration: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, duration))
}

export const getMockCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas')
  canvas.width = 1920
  canvas.height = 1080
  return canvas
}

// Assertion helpers
export const expectHighlighted = (tokenId: string): void => {
  const state = useUnifiedActionStore.getState()
  const highlighted = state.highlightedTargets.some(h => h.tokenId === tokenId)
  expect(highlighted).toBe(true)
}

export const expectInHistory = (actionId: string): void => {
  const state = useUnifiedActionStore.getState()
  const found = state.actionHistory.find(entry => entry.id === actionId)
  expect(found).toBeDefined()
}

export const expectAnimationComplete = (actionId: string): void => {
  const state = useUnifiedActionStore.getState()
  const historyEntry = state.actionHistory.find(entry => entry.id === actionId)
  expect(historyEntry?.status).toBe('completed')
}

// Store reset helper
export const resetStore = () => {
  useUnifiedActionStore.setState({
    activeActions: [],
    actionHistory: [],
    highlightedTargets: [],
    maxHistorySize: 100,
    isExecuting: false
  })
}