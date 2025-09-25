/**
 * TokenAnimator Organism Component
 *
 * Animation controller for smooth token movements and effects.
 * Handles complex animation sequences with easing and coordination.
 * Organism design: 100-150 lines, animation orchestration focus.
 */

import React from 'react'
import type { Point } from '@/types/geometry'
import type { TokenId, EasingFunction } from '../../../types'
import { AnimationService } from '../../../services'

export interface TokenAnimatorProps {
  readonly tokenId: TokenId
  readonly children: React.ReactNode
  readonly onAnimationStart?: () => void
  readonly onAnimationComplete?: () => void
  readonly onAnimationCancel?: () => void
}

export interface UseTokenAnimatorResult {
  readonly isAnimating: boolean
  readonly animateMovement: (to: Point, duration?: number, easing?: EasingFunction) => Promise<void>
  readonly animateTeleport: (to: Point, duration?: number) => Promise<void>
  readonly animateCondition: (condition: string, isAdding: boolean, duration?: number) => Promise<void>
  readonly animateDamage: (amount: number, damageType?: string, duration?: number) => Promise<void>
  readonly animateHeal: (amount: number, duration?: number) => Promise<void>
  readonly cancelAnimations: () => void
}

// Hook for using the animator functionality
export function useTokenAnimator(
  tokenId: TokenId,
  onAnimationStart?: () => void,
  onAnimationComplete?: () => void,
  onAnimationCancel?: () => void
): UseTokenAnimatorResult {
  const animationService = React.useMemo(() => AnimationService.getInstance(), [])
  const [isAnimating, setIsAnimating] = React.useState(false)

  // Check if token is currently animating
  React.useEffect(() => {
    const checkAnimating = () => {
      const animating = animationService.isTokenAnimating(tokenId)
      setIsAnimating(animating)
    }

    checkAnimating()

    // Poll animation status (in real implementation, this would use events)
    const interval = setInterval(checkAnimating, 100)
    return () => clearInterval(interval)
  }, [tokenId, animationService])

  // Animation functions
  const animateMovement = React.useCallback(async (
    to: Point,
    duration = 500,
    easing: EasingFunction = 'ease-out'
  ) => {
    const token = { id: tokenId, position: { x: 0, y: 0 } } as any // Simplified
    onAnimationStart?.()

    try {
      await new Promise<void>((resolve) => {
        animationService.animateMovement(token, to, {
          duration,
          easing,
          onComplete: () => {
            onAnimationComplete?.()
            resolve()
          },
          onCancel: () => {
            onAnimationCancel?.()
            resolve()
          }
        })
      })
    } catch (error) {
      onAnimationCancel?.()
    }
  }, [tokenId, animationService, onAnimationStart, onAnimationComplete, onAnimationCancel])

  const animateTeleport = React.useCallback(async (
    to: Point,
    duration = 300
  ) => {
    const token = { id: tokenId, position: { x: 0, y: 0 } } as any // Simplified
    onAnimationStart?.()

    try {
      await new Promise<void>((resolve) => {
        animationService.animateTeleport(token, to, {
          duration,
          onComplete: () => {
            onAnimationComplete?.()
            resolve()
          },
          onCancel: () => {
            onAnimationCancel?.()
            resolve()
          }
        })
      })
    } catch (error) {
      onAnimationCancel?.()
    }
  }, [tokenId, animationService, onAnimationStart, onAnimationComplete, onAnimationCancel])

  const animateCondition = React.useCallback(async (
    condition: string,
    isAdding: boolean,
    duration = 800
  ) => {
    const token = { id: tokenId } as any // Simplified
    onAnimationStart?.()

    try {
      await new Promise<void>((resolve) => {
        animationService.animateCondition(token, condition, isAdding, {
          duration,
          onComplete: () => {
            onAnimationComplete?.()
            resolve()
          },
          onCancel: () => {
            onAnimationCancel?.()
            resolve()
          }
        })
      })
    } catch (error) {
      onAnimationCancel?.()
    }
  }, [tokenId, animationService, onAnimationStart, onAnimationComplete, onAnimationCancel])

  const animateDamage = React.useCallback(async (
    amount: number,
    damageType?: string,
    duration = 1000
  ) => {
    const token = { id: tokenId } as any // Simplified
    onAnimationStart?.()

    try {
      await new Promise<void>((resolve) => {
        animationService.animateDamage(token, amount, damageType, {
          duration,
          onComplete: () => {
            onAnimationComplete?.()
            resolve()
          },
          onCancel: () => {
            onAnimationCancel?.()
            resolve()
          }
        })
      })
    } catch (error) {
      onAnimationCancel?.()
    }
  }, [tokenId, animationService, onAnimationStart, onAnimationComplete, onAnimationCancel])

  const animateHeal = React.useCallback(async (
    amount: number,
    duration = 1200
  ) => {
    const token = { id: tokenId } as any // Simplified
    onAnimationStart?.()

    try {
      await new Promise<void>((resolve) => {
        animationService.animateHeal(token, amount, {
          duration,
          onComplete: () => {
            onAnimationComplete?.()
            resolve()
          },
          onCancel: () => {
            onAnimationCancel?.()
            resolve()
          }
        })
      })
    } catch (error) {
      onAnimationCancel?.()
    }
  }, [tokenId, animationService, onAnimationStart, onAnimationComplete, onAnimationCancel])

  const cancelAnimations = React.useCallback(() => {
    animationService.cancelTokenAnimations(tokenId)
    onAnimationCancel?.()
  }, [tokenId, animationService, onAnimationCancel])

  return {
    isAnimating,
    animateMovement,
    animateTeleport,
    animateCondition,
    animateDamage,
    animateHeal,
    cancelAnimations
  }
}

// Component wrapper that provides animation context
export const TokenAnimator: React.FC<TokenAnimatorProps> = React.memo(({
  tokenId,
  children,
  onAnimationStart,
  onAnimationComplete,
  onAnimationCancel
}) => {
  const animator = useTokenAnimator(
    tokenId,
    onAnimationStart,
    onAnimationComplete,
    onAnimationCancel
  )

  // Provide animation context to children
  const contextValue = React.useMemo(() => ({
    tokenId,
    animator
  }), [tokenId, animator])

  return (
    <TokenAnimatorContext.Provider value={contextValue}>
      {children}
    </TokenAnimatorContext.Provider>
  )
})

// Context for sharing animator functionality
interface TokenAnimatorContextValue {
  readonly tokenId: TokenId
  readonly animator: UseTokenAnimatorResult
}

const TokenAnimatorContext = React.createContext<TokenAnimatorContextValue | null>(null)

// Hook to access animator from context
export function useTokenAnimatorContext(): TokenAnimatorContextValue {
  const context = React.useContext(TokenAnimatorContext)
  if (!context) {
    throw new Error('useTokenAnimatorContext must be used within TokenAnimator')
  }
  return context
}