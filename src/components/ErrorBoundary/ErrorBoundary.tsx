import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Box, Text, Button } from '@/components/ui'
import { AlertTriangle, RefreshCw, Copy, Bug, Home } from 'lucide-react'

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
    const errorId = `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

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
        componentStack: errorInfo.componentStack
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

  private reportToService = (errorReport: ErrorReport) => {
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
          css={{
            padding: isAppLevel ? '$8' : '$6',
            textAlign: 'center',
            backgroundColor: isAppLevel ? '$background' : '$gray900',
            borderRadius: isAppLevel ? '0' : '$md',
            border: isAppLevel ? 'none' : '1px solid $error',
            minHeight: isAppLevel ? '100vh' : 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: isAppLevel ? 'center' : 'flex-start',
            gap: '$4'
          }}
        >
          {/* Error Icon */}
          <Box
            css={{
              width: isAppLevel ? 80 : 60,
              height: isAppLevel ? 80 : 60,
              borderRadius: '50%',
              backgroundColor: '$error',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '$2'
            }}
          >
            <AlertTriangle size={isAppLevel ? 40 : 30} color="white" />
          </Box>

          {/* Error Title */}
          <Text
            css={{
              fontSize: isAppLevel ? '$2xl' : '$lg',
              fontWeight: '$bold',
              color: '$error',
              marginBottom: '$2'
            }}
          >
            {isAppLevel && 'Application Error'}
            {isFeatureLevel && `${name} Error`}
            {level === 'component' && 'Component Error'}
          </Text>

          {/* Error Message */}
          <Text css={{ fontSize: '$md', color: '$gray300', maxWidth: 500, marginBottom: '$4' }}>
            {isAppLevel && 'The application has encountered an unexpected error and needs to restart.'}
            {isFeatureLevel && `The ${name} feature encountered an error and couldn't load properly.`}
            {level === 'component' && `A component in ${name} has crashed. You can try refreshing or continue using other features.`}
          </Text>

          {/* Error Details (Development) */}
          {process.env.NODE_ENV === 'development' && error && (
            <Box
              css={{
                padding: '$3',
                backgroundColor: '$gray800',
                borderRadius: '$md',
                border: '1px solid $gray700',
                maxWidth: '100%',
                overflow: 'auto',
                marginBottom: '$4'
              }}
            >
              <Text css={{ fontSize: '$xs', fontFamily: 'monospace', color: '$gray400' }}>
                {error.name}: {error.message}
              </Text>
            </Box>
          )}

          {/* Error ID */}
          <Text css={{ fontSize: '$xs', color: '$gray500', fontFamily: 'monospace' }}>
            Error ID: {errorId}
          </Text>

          {/* Action Buttons */}
          <Box css={{ display: 'flex', gap: '$3', flexWrap: 'wrap', justifyContent: 'center' }}>
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
            <Box css={{ marginTop: '$4' }}>
              <Text css={{ fontSize: '$xs', color: '$gray500', marginBottom: '$2' }}>
                Development Tools:
              </Text>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  console.log('Error State:', this.state)
                  console.log('Error Props:', this.props)
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
              css={{
                marginTop: '$6',
                padding: '$3',
                backgroundColor: '$gray800',
                borderRadius: '$md',
                maxWidth: 400,
                textAlign: 'left'
              }}
            >
              <Text css={{ fontSize: '$sm', fontWeight: '$medium', marginBottom: '$2' }}>
                What you can try:
              </Text>
              <Text css={{ fontSize: '$xs', color: '$gray400', display: 'block', marginBottom: '$1' }}>
                • Refresh the page to restore functionality
              </Text>
              <Text css={{ fontSize: '$xs', color: '$gray400', display: 'block', marginBottom: '$1' }}>
                • Save your work and restart the application
              </Text>
              <Text css={{ fontSize: '$xs', color: '$gray400', display: 'block', marginBottom: '$1' }}>
                • Report this error with the Error ID above
              </Text>
              {level === 'component' && (
                <Text css={{ fontSize: '$xs', color: '$gray400', display: 'block' }}>
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
export const AppErrorBoundary: React.FC<{ children: ReactNode; onError?: ErrorBoundaryProps['onError'] }> = ({
  children,
  onError
}) => (
  <ErrorBoundary level="app" name="MapMaker" onError={onError}>
    {children}
  </ErrorBoundary>
)

export const FeatureErrorBoundary: React.FC<{
  children: ReactNode
  name: string
  onError?: ErrorBoundaryProps['onError']
}> = ({ children, name, onError }) => (
  <ErrorBoundary level="feature" name={name} onError={onError}>
    {children}
  </ErrorBoundary>
)

export const ComponentErrorBoundary: React.FC<{
  children: ReactNode
  name: string
  fallback?: ReactNode
}> = ({ children, name, fallback }) => (
  <ErrorBoundary level="component" name={name} fallback={fallback}>
    {children}
  </ErrorBoundary>
)

export default ErrorBoundary