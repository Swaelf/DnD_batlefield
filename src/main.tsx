import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './App'
import { TooltipProvider } from '@/components/ui'
import { AppErrorBoundary } from '@/components/ErrorBoundary/ErrorBoundary'
import swManager from '@/utils/serviceWorker'

// Import Vanilla Extract styles
import '@/styles/global.css'
import { theme } from '@/styles/theme.css'

// Apply theme
document.body.className = theme

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary onError={(error, errorInfo, errorId) => {
      // Log errors to external service in production
      if (process.env.NODE_ENV === 'production') {
        console.error('[App Error]', { error, errorInfo, errorId })
      }
    }}>
      <TooltipProvider>
        <App />
      </TooltipProvider>
    </AppErrorBoundary>
  </StrictMode>,
)

// Register service worker and PWA functionality
if (process.env.NODE_ENV === 'production') {
  void swManager.register('/sw.js').then(() => {
  })
}

// Development-only performance monitoring
if (process.env.NODE_ENV === 'development') {
  // Enable React DevTools profiler
  if (typeof window !== 'undefined') {
    const globalWindow = window as Window & {
      __REACT_DEVTOOLS_GLOBAL_HOOK__?: {
        isDisabled?: boolean
      }
    }
    if (globalWindow.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      globalWindow.__REACT_DEVTOOLS_GLOBAL_HOOK__.isDisabled = false
    }
  }
}
