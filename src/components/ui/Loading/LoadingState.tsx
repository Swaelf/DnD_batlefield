import { type FC, type ReactNode, useState, useRef, useEffect } from 'react'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { sprinkles } from '@/styles/sprinkles.css'
import { Spinner } from './Spinner'

export type LoadingStateProps = {
  isLoading: boolean
  error?: Error | null
  children: ReactNode
  loadingComponent?: ReactNode
  errorComponent?: ReactNode
  showError?: boolean
  minLoadingTime?: number // Minimum time to show loading state (prevents flashing)
}

export const LoadingState: FC<LoadingStateProps> = ({
  isLoading,
  error,
  children,
  loadingComponent = <Spinner size="lg" />,
  errorComponent,
  showError = true,
  minLoadingTime = 0
}) => {
  const [showLoading, setShowLoading] = useState(isLoading)
  const loadingStartTime = useRef<number>(0)

  useEffect(() => {
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
