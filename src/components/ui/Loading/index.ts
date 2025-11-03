// Component exports
export { Spinner } from './Spinner'
export { Skeleton } from './Skeleton'
export { Progress } from './Progress'
export { LoadingDots } from './LoadingDots'
export { FullScreenLoading } from './FullScreenLoading'
export { LoadingState } from './LoadingState'

// Type exports
export type { SpinnerProps } from './Spinner'
export type { SkeletonProps } from './Skeleton'
export type { ProgressProps } from './Progress'
export type { DotsProps } from './LoadingDots'
export type { FullScreenLoadingProps } from './FullScreenLoading'
export type { LoadingStateProps } from './LoadingState'

// Re-import for default export object
import { Spinner } from './Spinner'
import { Skeleton } from './Skeleton'
import { Progress } from './Progress'
import { LoadingDots } from './LoadingDots'
import { FullScreenLoading } from './FullScreenLoading'
import { LoadingState } from './LoadingState'

// Default export object for convenience
export const Loading = {
  Spinner,
  Skeleton,
  Progress,
  Dots: LoadingDots,
  FullScreen: FullScreenLoading,
  State: LoadingState
}

export default Loading
