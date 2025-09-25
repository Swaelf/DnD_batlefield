/**
 * useTokenAnimation Hook - Animation coordination for tokens
 *
 * Provides animation control with service integration.
 * Manages animation state and cleanup.
 */

import { useCallback, useEffect, useState } from 'react'
import { useTokenStore } from '../store'
import { AnimationService } from '../services'
import type { TokenId, AnimationHandle, EasingFunction } from '../types'
import type { Point } from '@/types/geometry'

export interface UseTokenAnimationOptions {
  readonly tokenId: TokenId
  readonly onAnimationStart?: () => void
  readonly onAnimationComplete?: () => void
  readonly onAnimationCancel?: () => void
}

export interface UseTokenAnimationResult {
  readonly isAnimating: boolean
  readonly activeAnimations: number
  readonly animateMovement: (to: Point, duration?: number, easing?: EasingFunction) => Promise<void>
  readonly animateTeleport: (to: Point, duration?: number) => Promise<void>
  readonly animateCondition: (condition: string, isAdding: boolean, duration?: number) => Promise<void>
  readonly animateDamage: (amount: number, damageType?: string, duration?: number) => Promise<void>
  readonly animateHeal: (amount: number, duration?: number) => Promise<void>
  readonly cancelAnimations: () => void
  readonly pauseAnimations: () => void
  readonly resumeAnimations: () => void
}

export function useTokenAnimation(options: UseTokenAnimationOptions): UseTokenAnimationResult {
  const { tokenId, onAnimationStart, onAnimationComplete, onAnimationCancel } = options

  const [animationService] = useState(() => AnimationService.getInstance())
  const [activeHandles, setActiveHandles] = useState<Set<AnimationHandle>>(new Set())

  // Store integration
  const isAnimating = useTokenStore(state => state.animatingTokens.has(tokenId))
  const startAnimation = useTokenStore(state => state.startAnimation)
  const endAnimation = useTokenStore(state => state.endAnimation)
  const cancelTokenAnimations = useTokenStore(state => state.cancelTokenAnimations)
  const token = useTokenStore(state => state.tokens.get(tokenId))

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (activeHandles.size > 0) {
        activeHandles.forEach(handle => {
          animationService.cancelAnimation(handle)
        })
      }
    }
  }, [animationService, activeHandles])

  // Animation wrapper for common functionality
  const createAnimation = useCallback(async <T extends any[]>(
    animationFn: (token: any, ...args: T) => AnimationHandle,
    ...args: T
  ): Promise<void> => {
    if (!token) {
      throw new Error(`Token ${tokenId} not found`)
    }

    return new Promise<void>((resolve, reject) => {
      try {
        const handle = animationFn(token, ...args)

        setActiveHandles(prev => new Set([...prev, handle]))
        startAnimation(tokenId, handle)
        onAnimationStart?.()

        // Set up completion handling
        const originalAnimation = animationService.getTokenAnimations(tokenId).find(a => a.id === handle)
        if (originalAnimation) {
          const originalOnComplete = originalAnimation.onComplete
          const originalOnCancel = originalAnimation.onCancel

          // Override callbacks
          ;(originalAnimation as any).onComplete = () => {
            setActiveHandles(prev => {
              const next = new Set(prev)
              next.delete(handle)
              return next
            })
            endAnimation(tokenId, handle)
            originalOnComplete?.()
            onAnimationComplete?.()
            resolve()
          }

          ;(originalAnimation as any).onCancel = () => {
            setActiveHandles(prev => {
              const next = new Set(prev)
              next.delete(handle)
              return next
            })
            endAnimation(tokenId, handle)
            originalOnCancel?.()
            onAnimationCancel?.()
            resolve()
          }
        } else {
          // Fallback if animation not found
          setTimeout(() => {
            setActiveHandles(prev => {
              const next = new Set(prev)
              next.delete(handle)
              return next
            })
            endAnimation(tokenId, handle)
            onAnimationComplete?.()
            resolve()
          }, 1000)
        }
      } catch (error) {
        onAnimationCancel?.()
        reject(error)
      }
    })
  }, [token, tokenId, animationService, startAnimation, endAnimation, onAnimationStart, onAnimationComplete, onAnimationCancel])

  // Animation functions
  const animateMovement = useCallback(async (
    to: Point,
    duration = 500,
    easing: EasingFunction = 'ease-out'
  ) => {
    return createAnimation(
      (token, to: Point) => animationService.animateMovement(token, to, { duration, easing }),
      to
    )
  }, [createAnimation, animationService])

  const animateTeleport = useCallback(async (
    to: Point,
    duration = 300
  ) => {
    return createAnimation(
      (token, to: Point) => animationService.animateTeleport(token, to, { duration }),
      to
    )
  }, [createAnimation, animationService])

  const animateCondition = useCallback(async (
    condition: string,
    isAdding: boolean,
    duration = 800
  ) => {
    return createAnimation(
      (token, condition: string, isAdding: boolean) =>
        animationService.animateCondition(token, condition, isAdding, { duration }),
      condition,
      isAdding
    )
  }, [createAnimation, animationService])

  const animateDamage = useCallback(async (
    amount: number,
    damageType?: string,
    duration = 1000
  ) => {
    return createAnimation(
      (token, amount: number, damageType?: string) =>
        animationService.animateDamage(token, amount, damageType, { duration }),
      amount,
      damageType
    )
  }, [createAnimation, animationService])

  const animateHeal = useCallback(async (
    amount: number,
    duration = 1200
  ) => {
    return createAnimation(
      (token, amount: number) =>
        animationService.animateHeal(token, amount, { duration }),
      amount
    )
  }, [createAnimation, animationService])

  // Animation control
  const cancelAnimations = useCallback(() => {
    cancelTokenAnimations(tokenId)
    setActiveHandles(new Set())
    onAnimationCancel?.()
  }, [tokenId, cancelTokenAnimations, onAnimationCancel])

  const pauseAnimations = useCallback(() => {
    // Would implement pause functionality in real animation service
    console.log(`Pausing animations for token ${tokenId}`)
  }, [tokenId])

  const resumeAnimations = useCallback(() => {
    // Would implement resume functionality in real animation service
    console.log(`Resuming animations for token ${tokenId}`)
  }, [tokenId])

  return {
    isAnimating,
    activeAnimations: activeHandles.size,
    animateMovement,
    animateTeleport,
    animateCondition,
    animateDamage,
    animateHeal,
    cancelAnimations,
    pauseAnimations,
    resumeAnimations
  }
}

// Hook for managing global animation state
export interface UseAnimationManagerResult {
  readonly isGloballyAnimating: boolean
  readonly totalActiveAnimations: number
  readonly animationMetrics: any // Would be proper metrics type
  readonly globalSpeed: number
  readonly setGlobalSpeed: (speed: number) => void
  readonly pauseAllAnimations: () => void
  readonly resumeAllAnimations: () => void
  readonly cancelAllAnimations: () => void
}

export function useAnimationManager(): UseAnimationManagerResult {
  const [animationService] = useState(() => AnimationService.getInstance())
  const [metrics, setMetrics] = useState(animationService.getMetrics())

  const animatingTokens = useTokenStore(state => state.animatingTokens)
  const totalAnimations = useTokenStore(state => state.activeAnimations.size)

  // Update metrics periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(animationService.getMetrics())
    }, 1000)

    return () => clearInterval(interval)
  }, [animationService])

  // Global animation control
  const setGlobalSpeed = useCallback((speed: number) => {
    animationService.updateConfig({ globalSpeed: speed })
  }, [animationService])

  const pauseAllAnimations = useCallback(() => {
    // Would implement in real service
    console.log('Pausing all animations')
  }, [])

  const resumeAllAnimations = useCallback(() => {
    // Would implement in real service
    console.log('Resuming all animations')
  }, [])

  const cancelAllAnimations = useCallback(() => {
    animationService.cancelAllAnimations()
  }, [animationService])

  return {
    isGloballyAnimating: animatingTokens.size > 0,
    totalActiveAnimations: totalAnimations,
    animationMetrics: metrics,
    globalSpeed: animationService.getConfig().globalSpeed,
    setGlobalSpeed,
    pauseAllAnimations,
    resumeAllAnimations,
    cancelAllAnimations
  }
}