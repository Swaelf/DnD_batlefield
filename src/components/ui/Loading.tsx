/**
 * Loading Component - Comprehensive loading states for the MapMaker application
 *
 * Provides multiple loading variants for different use cases:
 * - Spinner: Simple rotating spinner
 * - Skeleton: Content placeholder loading
 * - Progress: Progress bar with percentage
 * - Dots: Animated dots for inline loading
 * - Full Screen: Overlay loading for async operations
 */

import React from 'react'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { sprinkles } from '@/styles/sprinkles.css'
import { spinnerStyles, pulseStyles, dotStyles, fadeInStyles } from './Loading.css'

// Loading Spinner Component
export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'secondary' | 'white' | 'current'
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'primary'
}) => {
  const sizes = {
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48
  }

  const colors = {
    primary: 'var(--colors-primary)',
    secondary: 'var(--colors-secondary)',
    white: 'var(--colors-white)',
    current: 'currentColor'
  }

  const dimension = sizes[size]

  return (
    <Box
      className={spinnerStyles}
      style={{
        width: `${dimension}px`,
        height: `${dimension}px`,
        display: 'inline-block'
      }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%' }}
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke={colors[color]}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="31.4 31.4"
        />
      </svg>
    </Box>
  )
}

// Skeleton Loading Component
export interface SkeletonProps {
  width?: string | number
  height?: string | number
  variant?: 'text' | 'rectangular' | 'circular'
  className?: string
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '20px',
  variant = 'rectangular',
  className
}) => {
  const getWidth = () => typeof width === 'number' ? `${width}px` : width
  const getHeight = () => typeof height === 'number' ? `${height}px` : height
  const getBorderRadius = () => {
    switch (variant) {
      case 'circular': return '50%'
      case 'text': return '4px'
      default: return '8px'
    }
  }

  return (
    <Box
      className={`${pulseStyles} ${className || ''}`}
      style={{
        width: getWidth(),
        height: getHeight(),
        backgroundColor: 'var(--colors-gray800)',
        borderRadius: getBorderRadius(),
        display: 'inline-block'
      }}
    />
  )
}

// Progress Loading Component
export interface ProgressProps {
  value: number // 0 to 100
  label?: string
  showPercentage?: boolean
  height?: number
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  label,
  showPercentage = true,
  height = 8,
  color = 'primary'
}) => {
  const colors = {
    primary: 'var(--colors-primary)',
    secondary: 'var(--colors-secondary)',
    success: 'var(--colors-success)',
    warning: 'var(--colors-warning)',
    error: 'var(--colors-error)'
  }

  const clampedValue = Math.max(0, Math.min(100, value))

  return (
    <Box style={{ width: '100%' }}>
      {(label || showPercentage) && (
        <Box
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px'
          }}
        >
          {label && (
            <Text variant="body" size="sm">
              {label}
            </Text>
          )}
          {showPercentage && (
            <Text variant="body" size="sm" style={{ color: 'var(--colors-gray400)' }}>
              {Math.round(clampedValue)}%
            </Text>
          )}
        </Box>
      )}
      <Box
        style={{
          width: '100%',
          height: `${height}px`,
          backgroundColor: 'var(--colors-gray800)',
          borderRadius: `${height / 2}px`,
          overflow: 'hidden'
        }}
      >
        <Box
          style={{
            width: `${clampedValue}%`,
            height: '100%',
            backgroundColor: colors[color],
            transition: 'width 0.3s ease',
            borderRadius: `${height / 2}px`
          }}
        />
      </Box>
    </Box>
  )
}

// Dots Loading Component
export interface DotsProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'secondary' | 'white' | 'current'
}

export const LoadingDots: React.FC<DotsProps> = ({
  size = 'md',
  color = 'primary'
}) => {
  const sizes = {
    sm: 4,
    md: 6,
    lg: 8
  }

  const colors = {
    primary: 'var(--colors-primary)',
    secondary: 'var(--colors-secondary)',
    white: 'var(--colors-white)',
    current: 'currentColor'
  }

  const dotSize = sizes[size]

  return (
    <Box style={{ display: 'inline-flex', gap: `${dotSize / 2}px` }}>
      {[0, 1, 2].map((index) => (
        <Box
          key={index}
          className={dotStyles}
          style={{
            width: `${dotSize}px`,
            height: `${dotSize}px`,
            borderRadius: '50%',
            backgroundColor: colors[color],
            animationDelay: `${index * 0.15}s`
          }}
        />
      ))}
    </Box>
  )
}

// Full Screen Loading Component
export interface FullScreenLoadingProps {
  message?: string
  description?: string
  progress?: number
  onCancel?: () => void
}

export const FullScreenLoading: React.FC<FullScreenLoadingProps> = ({
  message = 'Loading...',
  description,
  progress,
  onCancel
}) => {
  return (
    <Box
      className={fadeInStyles}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}
    >
      <Box
        className={sprinkles({
          padding: 8,
          backgroundColor: 'surface',
          borderRadius: 'lg'
        })}
        style={{
          minWidth: '300px',
          maxWidth: '400px',
          textAlign: 'center',
          border: '1px solid var(--colors-gray700)'
        }}
      >
        <Spinner size="xl" color="primary" />

        <Text
          variant="heading"
          size="lg"
          style={{ marginTop: '24px', marginBottom: '8px' }}
        >
          {message}
        </Text>

        {description && (
          <Text
            variant="body"
            size="sm"
            style={{ color: 'var(--colors-gray400)', marginBottom: '16px' }}
          >
            {description}
          </Text>
        )}

        {progress !== undefined && (
          <Box style={{ marginTop: '16px' }}>
            <Progress value={progress} showPercentage color="primary" />
          </Box>
        )}

        {onCancel && (
          <Box style={{ marginTop: '24px' }}>
            <button
              onClick={onCancel}
              className={sprinkles({
                padding: 3,
                backgroundColor: 'surface',
                borderRadius: 'md'
              })}
              style={{
                border: '1px solid var(--colors-gray600)',
                color: 'var(--colors-gray300)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Cancel
            </button>
          </Box>
        )}
      </Box>
    </Box>
  )
}

// Loading State Wrapper Component
export interface LoadingStateProps {
  isLoading: boolean
  error?: Error | null
  children: React.ReactNode
  loadingComponent?: React.ReactNode
  errorComponent?: React.ReactNode
  showError?: boolean
  minLoadingTime?: number // Minimum time to show loading state (prevents flashing)
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  isLoading,
  error,
  children,
  loadingComponent = <Spinner size="lg" />,
  errorComponent,
  showError = true,
  minLoadingTime = 0
}) => {
  const [showLoading, setShowLoading] = React.useState(isLoading)
  const loadingStartTime = React.useRef<number>(0)

  React.useEffect(() => {
    if (isLoading) {
      loadingStartTime.current = Date.now()
      setShowLoading(true)
    } else if (showLoading && minLoadingTime > 0) {
      const elapsed = Date.now() - loadingStartTime.current
      const remaining = minLoadingTime - elapsed

      if (remaining > 0) {
        const timer = setTimeout(() => setShowLoading(false), remaining)
        return () => clearTimeout(timer)
      } else {
        setShowLoading(false)
      }
    } else {
      setShowLoading(false)
    }
    return undefined
  }, [isLoading, minLoadingTime, showLoading])

  if (error && showError) {
    return (
      <>
        {errorComponent || (
          <Box
            className={sprinkles({
              padding: 4,
              backgroundColor: 'surface',
              borderRadius: 'md'
            })}
            style={{
              border: '1px solid var(--colors-error)',
              textAlign: 'center'
            }}
          >
            <Text variant="body" size="sm" style={{ color: 'var(--colors-error)' }}>
              Error: {error.message}
            </Text>
          </Box>
        )}
      </>
    )
  }

  if (showLoading) {
    return (
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}
      >
        {loadingComponent}
      </Box>
    )
  }

  return <>{children}</>
}

// Export all loading components
export const Loading = {
  Spinner,
  Skeleton,
  Progress,
  Dots: LoadingDots,
  FullScreen: FullScreenLoading,
  State: LoadingState
}

export default Loading