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
  // Use base path for GitHub Pages
  const swPath = import.meta.env.BASE_URL + 'sw.js'
  void swManager.register(swPath).then(() => {
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
      runTimelineNavigationTest?: () => void
      runRoundReplayTest?: () => void
    }
    if (globalWindow.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      globalWindow.__REACT_DEVTOOLS_GLOBAL_HOOK__.isDisabled = false
    }

    // Make tests available globally in development
    import('./testing/TestTimelineNavigation').then(module => {
      globalWindow.runTimelineNavigationTest = module.runTimelineNavigationTest
      console.log('🧪 Timeline Navigation Test loaded!')
      console.log('💡 Run test: runTimelineNavigationTest()')
    }).catch(err => {
      console.error('Failed to load timeline navigation test:', err)
    })

    import('./testing/TestRoundReplay').then(module => {
      globalWindow.runRoundReplayTest = module.runRoundReplayTest
      console.log('🧪 Round Replay Test loaded!')
      console.log('💡 Run test: runRoundReplayTest()')
    }).catch(err => {
      console.error('Failed to load round replay test:', err)
    })
  }
}
