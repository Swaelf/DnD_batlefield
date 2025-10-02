import { Component, type ErrorInfo, type ReactNode, type FC } from 'react'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Button } from '@/components/primitives/ButtonVE'
import { AlertTriangle, RefreshCw, Copy, Bug, Home } from '@/utils/optimizedIcons'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo, errorId: string) => void
  level?: 'app' | 'feature' | 'component'
  name?: string
}

interface ErrorReport {
  timestamp: string
  errorId: string
  level: string
  component: string
  error: {
    name: string
    message: string
    stack?: string
  }
  errorInfo: {
    componentStack: string
  }
  userAgent: string
  url: string
  mapData?: {
    objectCount?: number
    mapSize?: string
    currentTool?: string
  }
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `ERR_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`

    return {
      hasError: true,
      error,
      errorId
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, level = 'component', name = 'Unknown' } = this.props
    const errorId = this.state.errorId

    // Update state with error info
    this.setState({
      errorInfo
    })

    // Create error report
    const errorReport: ErrorReport = {
      timestamp: new Date().toISOString(),
      errorId,
      level,
      component: name,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      errorInfo: {
        componentStack: errorInfo.componentStack || ''
      },
      userAgent: navigator.userAgent,
      url: window.location.href,
      mapData: this.getMapData()
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Error Boundary: ${name}`)
      console.error('Error:', error)
      console.error('Error Info:', errorInfo)
      console.error('Error Report:', errorReport)
      console.groupEnd()
    }

    // Store in localStorage for later retrieval
    try {
      const existingReports = JSON.parse(localStorage.getItem('mapmaker_error_reports') || '[]')
      existingReports.push(errorReport)
      // Keep only last 10 reports
      const recentReports = existingReports.slice(-10)
      localStorage.setItem('mapmaker_error_reports', JSON.stringify(recentReports))
    } catch (e) {
      console.error('Failed to store error report:', e)
    }

    // Call custom error handler
    if (onError) {
      onError(error, errorInfo, errorId)
    }

    // Send to error tracking service (if configured)
    this.reportToService(errorReport)
  }

  private getMapData() {
    try {
      // Try to get map data from stores
      const mapStore = (window as any).__mapStore?.getState?.()
      const toolStore = (window as any).__toolStore?.getState?.()

      return {
        objectCount: mapStore?.currentMap?.objects?.length,
        mapSize: mapStore?.currentMap ? `${mapStore.currentMap.width}x${mapStore.currentMap.height}` : undefined,
        currentTool: toolStore?.currentTool
      }
    } catch {
      return {}
    }
  }

  private reportToService = (_errorReport: ErrorReport) => {
    // In a real application, you would send this to an error tracking service
    // like Sentry, Bugsnag, or your own endpoint
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to your error tracking service
      // fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorReport)
      // }).catch(console.error)
    }
  }

  private handleReload = () => {
    window.location.reload()
  }

  private handleGoHome = () => {
    window.location.href = '/'
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    })
  }

  private handleCopyError = () => {
    const { error, errorInfo, errorId } = this.state
    const errorText = `
Error ID: ${errorId}
Component: ${this.props.name || 'Unknown'}
Time: ${new Date().toISOString()}

Error: ${error?.name}: ${error?.message}

Component Stack:
${errorInfo?.componentStack}

Stack Trace:
${error?.stack}
    `.trim()

    navigator.clipboard.writeText(errorText).then(() => {
      alert('Error details copied to clipboard')
    }).catch(() => {
      alert('Failed to copy error details')
    })
  }

  render() {
    const { hasError, error, errorId } = this.state
    const { children, fallback, level = 'component', name = 'Unknown' } = this.props

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback
      }

      // Different error UIs based on level
      const isAppLevel = level === 'app'
      const isFeatureLevel = level === 'feature'

      return (
        <Box
          style={{
            padding: isAppLevel ? '32px' : '24px',
            textAlign: 'center',
            backgroundColor: isAppLevel ? 'var(--colors-background)' : 'var(--colors-gray900)',
            borderRadius: isAppLevel ? '0' : '8px',
            border: isAppLevel ? 'none' : '1px solid var(--colors-error)',
            minHeight: isAppLevel ? '100vh' : 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: isAppLevel ? 'center' : 'flex-start',
            gap: '16px'
          }}
        >
          {/* Error Icon */}
          <Box
            style={{
              width: isAppLevel ? '80px' : '60px',
              height: isAppLevel ? '80px' : '60px',
              borderRadius: '50%',
              backgroundColor: 'var(--colors-error)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '8px'
            }}
          >
            <AlertTriangle size={isAppLevel ? 40 : 30} color="white" />
          </Box>

          {/* Error Title */}
          <Text
            variant="heading"
            size={isAppLevel ? '2xl' : 'lg'}
            style={{
              fontWeight: '700',
              color: 'var(--colors-error)',
              marginBottom: '8px'
            }}
          >
            {isAppLevel && 'Application Error'}
            {isFeatureLevel && `${name} Error`}
            {level === 'component' && 'Component Error'}
          </Text>

          {/* Error Message */}
          <Text variant="body" size="md" style={{ color: 'var(--colors-gray300)', maxWidth: '500px', marginBottom: '16px' }}>
            {isAppLevel && 'The application has encountered an unexpected error and needs to restart.'}
            {isFeatureLevel && `The ${name} feature encountered an error and couldn't load properly.`}
            {level === 'component' && `A component in ${name} has crashed. You can try refreshing or continue using other features.`}
          </Text>

          {/* Error Details (Development) */}
          {process.env.NODE_ENV === 'development' && error && (
            <Box
              style={{
                padding: '12px',
                backgroundColor: 'var(--colors-gray800)',
                borderRadius: '8px',
                border: '1px solid var(--colors-gray700)',
                maxWidth: '100%',
                overflow: 'auto',
                marginBottom: '16px'
              }}
            >
              <Text variant="body" size="xs" style={{ fontFamily: 'monospace', color: 'var(--colors-gray400)' }}>
                {error.name}: {error.message}
              </Text>
            </Box>
          )}

          {/* Error ID */}
          <Text variant="body" size="xs" style={{ color: 'var(--colors-gray500)', fontFamily: 'monospace' }}>
            Error ID: {errorId}
          </Text>

          {/* Action Buttons */}
          <Box style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {level === 'component' && (
              <Button variant="primary" onClick={this.handleReset}>
                <RefreshCw size={16} />
                Try Again
              </Button>
            )}

            {(isFeatureLevel || isAppLevel) && (
              <Button variant="primary" onClick={this.handleReload}>
                <RefreshCw size={16} />
                Reload Page
              </Button>
            )}

            {isAppLevel && (
              <Button variant="outline" onClick={this.handleGoHome}>
                <Home size={16} />
                Go Home
              </Button>
            )}

            <Button variant="outline" onClick={this.handleCopyError}>
              <Copy size={16} />
              Copy Error
            </Button>
          </Box>

          {/* Development Tools */}
          {process.env.NODE_ENV === 'development' && (
            <Box style={{ marginTop: '16px' }}>
              <Text variant="body" size="xs" style={{ color: 'var(--colors-gray500)', marginBottom: '8px' }}>
                Development Tools:
              </Text>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                }}
              >
                <Bug size={14} />
                Log to Console
              </Button>
            </Box>
          )}

          {/* Recovery Instructions */}
          {!isAppLevel && (
            <Box
              style={{
                marginTop: '24px',
                padding: '12px',
                backgroundColor: 'var(--colors-gray800)',
                borderRadius: '8px',
                maxWidth: '400px',
                textAlign: 'left'
              }}
            >
              <Text variant="body" size="sm" style={{ fontWeight: '500', marginBottom: '8px' }}>
                What you can try:
              </Text>
              <Text variant="body" size="xs" style={{ color: 'var(--colors-gray400)', display: 'block', marginBottom: '4px' }}>
                • Refresh the page to restore functionality
              </Text>
              <Text variant="body" size="xs" style={{ color: 'var(--colors-gray400)', display: 'block', marginBottom: '4px' }}>
                • Save your work and restart the application
              </Text>
              <Text variant="body" size="xs" style={{ color: 'var(--colors-gray400)', display: 'block', marginBottom: '4px' }}>
                • Report this error with the Error ID above
              </Text>
              {level === 'component' && (
                <Text variant="body" size="xs" style={{ color: 'var(--colors-gray400)', display: 'block' }}>
                  • Continue using other features normally
                </Text>
              )}
            </Box>
          )}
        </Box>
      )
    }

    return children
  }
}

// Convenience wrapper components for different levels
export const AppErrorBoundary: FC<{ children: ReactNode; onError?: ErrorBoundaryProps['onError'] }> = ({
  children,
  onError
}) => (
  <ErrorBoundary level="app" name="MapMaker" onError={onError}>
    {children}
  </ErrorBoundary>
)

export const FeatureErrorBoundary: FC<{
  children: ReactNode
  name: string
  onError?: ErrorBoundaryProps['onError']
}> = ({ children, name, onError }) => (
  <ErrorBoundary level="feature" name={name} onError={onError}>
    {children}
  </ErrorBoundary>
)

export const ComponentErrorBoundary: FC<{
  children: ReactNode
  name: string
  fallback?: ReactNode
}> = ({ children, name, fallback }) => (
  <ErrorBoundary level="component" name={name} fallback={fallback}>
    {children}
  </ErrorBoundary>
)

export default ErrorBoundary