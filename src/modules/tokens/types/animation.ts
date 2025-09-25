/**
 * Token Animation Types - Animation system for token movement and effects
 */

import type { Point } from '@/types/geometry'
import type { TokenId } from './token'

// Animation handle for control
export type AnimationHandle = string & { readonly _brand: 'AnimationHandle' }

// Create animation handle
export const createAnimationHandle = (id: string): AnimationHandle => id as AnimationHandle

// Animation types
export type AnimationType =
  | 'movement'
  | 'teleport'
  | 'rotation'
  | 'scale'
  | 'fade'
  | 'condition'
  | 'damage'
  | 'heal'

// Animation status
export type AnimationStatus = 'pending' | 'running' | 'paused' | 'completed' | 'cancelled'

// Easing functions
export type EasingFunction =
  | 'linear'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'bounce'
  | 'elastic'

// Base animation interface
export interface Animation {
  readonly id: AnimationHandle
  readonly tokenId: TokenId
  readonly type: AnimationType
  readonly status: AnimationStatus
  readonly duration: number
  readonly easing: EasingFunction
  readonly delay: number
  readonly startTime?: number
  readonly priority: number
  readonly onStart?: () => void
  readonly onUpdate?: (progress: number) => void
  readonly onComplete?: () => void
  readonly onCancel?: () => void
}

// Movement animation
export interface MovementAnimation extends Animation {
  readonly type: 'movement'
  readonly from: Point
  readonly to: Point
  readonly path?: readonly Point[]
  readonly speed?: number // pixels per second
  readonly rotateToDirection: boolean
}

// Teleport animation
export interface TeleportAnimation extends Animation {
  readonly type: 'teleport'
  readonly from: Point
  readonly to: Point
  readonly fadeOut: boolean
  readonly fadeIn: boolean
}

// Rotation animation
export interface RotationAnimation extends Animation {
  readonly type: 'rotation'
  readonly fromAngle: number
  readonly toAngle: number
  readonly clockwise: boolean
}

// Scale animation
export interface ScaleAnimation extends Animation {
  readonly type: 'scale'
  readonly fromScale: number
  readonly toScale: number
  readonly scaleCenter: Point
  readonly maintainAspectRatio: boolean
}

// Fade animation
export interface FadeAnimation extends Animation {
  readonly type: 'fade'
  readonly fromOpacity: number
  readonly toOpacity: number
}

// Condition animation
export interface ConditionAnimation extends Animation {
  readonly type: 'condition'
  readonly condition: string
  readonly isAdding: boolean
  readonly flashColor?: string
  readonly pulseEffect: boolean
}

// Damage animation
export interface DamageAnimation extends Animation {
  readonly type: 'damage'
  readonly amount: number
  readonly damageType?: string
  readonly color: string
  readonly fontSize: number
  readonly movement: Point // relative offset
}

// Heal animation
export interface HealAnimation extends Animation {
  readonly type: 'heal'
  readonly amount: number
  readonly color: string
  readonly fontSize: number
  readonly sparkles: boolean
}

// Union type for all animation types
export type TokenAnimation =
  | MovementAnimation
  | TeleportAnimation
  | RotationAnimation
  | ScaleAnimation
  | FadeAnimation
  | ConditionAnimation
  | DamageAnimation
  | HealAnimation

// Animation queue entry
export interface AnimationQueueEntry {
  readonly animation: TokenAnimation
  readonly priority: number
  readonly queuedAt: Date
}

// Animation state for a token
export interface TokenAnimationState {
  readonly tokenId: TokenId
  readonly activeAnimations: readonly TokenAnimation[]
  readonly queuedAnimations: readonly AnimationQueueEntry[]
  readonly isAnimating: boolean
  readonly currentPosition: Point
  readonly targetPosition: Point
  readonly animationProgress: number
}

// Animation manager state
export interface AnimationManagerState {
  readonly activeAnimations: Map<AnimationHandle, TokenAnimation>
  readonly tokenStates: Map<TokenId, TokenAnimationState>
  readonly globalQueue: readonly AnimationQueueEntry[]
  readonly isPlaying: boolean
  readonly playbackSpeed: number
}

// Animation configuration
export interface AnimationConfig {
  readonly enabled: boolean
  readonly globalSpeed: number
  readonly maxConcurrentAnimations: number
  readonly defaultDuration: number
  readonly defaultEasing: EasingFunction
  readonly enableParticleEffects: boolean
  readonly enableSoundEffects: boolean
  readonly performanceMode: 'low' | 'medium' | 'high'
}

// Animation performance metrics
export interface AnimationMetrics {
  readonly fps: number
  readonly frameTime: number
  readonly activeAnimationCount: number
  readonly queuedAnimationCount: number
  readonly averageFrameTime: number
  readonly droppedFrames: number
}

// Path finding for movement
export interface PathfindingOptions {
  readonly avoidTokens: boolean
  readonly avoidObstacles: boolean
  readonly smoothPath: boolean
  readonly maxPathLength: number
  readonly pathfindingAlgorithm: 'straight' | 'astar' | 'dijkstra'
}

// Animation event data
export interface AnimationEvent {
  readonly type: 'start' | 'update' | 'complete' | 'cancel' | 'error'
  readonly animationId: AnimationHandle
  readonly tokenId: TokenId
  readonly progress?: number
  readonly timestamp: number
  readonly data?: unknown
}

// Animation creation helpers
export interface CreateAnimationOptions {
  readonly duration?: number
  readonly easing?: EasingFunction
  readonly delay?: number
  readonly priority?: number
  readonly onStart?: () => void
  readonly onUpdate?: (progress: number) => void
  readonly onComplete?: () => void
  readonly onCancel?: () => void
}

// Batch animation operations
export interface BatchAnimation {
  readonly animations: readonly TokenAnimation[]
  readonly sequenceType: 'parallel' | 'sequence'
  readonly staggerDelay?: number // for sequence animations
  readonly onAllComplete?: () => void
}