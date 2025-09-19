import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { globalStyles } from '@/styles/global'
import { TooltipProvider } from '@/components/ui'

// Apply global styles
globalStyles()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TooltipProvider>
      <App />
    </TooltipProvider>
  </StrictMode>,
)
