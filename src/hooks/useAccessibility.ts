import { useEffect, useCallback, useState } from 'react'
import useMapStore from '@/store/mapStore'
import useToolStore from '@/store/toolStore'

interface AccessibilityPreferences {
  highContrast: boolean
  reducedMotion: boolean
  screenReaderMode: boolean
  keyboardNavigation: boolean
  announcements: boolean
  fontSize: 'small' | 'medium' | 'large' | 'extra-large'
}

interface UseAccessibilityReturn {
  preferences: AccessibilityPreferences
  isScreenReaderActive: boolean
  announceMessage: (message: string, priority?: 'polite' | 'assertive') => void
  updatePreference: <K extends keyof AccessibilityPreferences>(
    key: K,
    value: AccessibilityPreferences[K]
  ) => void
  getAriaLabel: (element: string, context?: Record<string, any>) => string
  getFocusableElements: (container?: HTMLElement) => HTMLElement[]
  trapFocus: (container: HTMLElement) => () => void
}

const DEFAULT_PREFERENCES: AccessibilityPreferences = {
  highContrast: false,
  reducedMotion: false,
  screenReaderMode: false,
  keyboardNavigation: true,
  announcements: true,
  fontSize: 'medium'
}

export const useAccessibility = (): UseAccessibilityReturn => {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(() => {
    try {
      const stored = localStorage.getItem('mapmaker_accessibility_preferences')
      return stored ? { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) } : DEFAULT_PREFERENCES
    } catch {
      return DEFAULT_PREFERENCES
    }
  })

  const [isScreenReaderActive, setIsScreenReaderActive] = useState(false)
  const [announcementRegion, setAnnouncementRegion] = useState<HTMLDivElement | null>(null)

  const { currentMap, selectedObjects } = useMapStore()
  const { currentTool } = useToolStore()

  // Detect screen reader usage
  useEffect(() => {
    // Check for common screen reader indicators
    const checkScreenReader = () => {
      // Check for NVDA, JAWS, VoiceOver, etc.
      const hasScreenReader =
        window.navigator.userAgent.includes('NVDA') ||
        window.navigator.userAgent.includes('JAWS') ||
        window.speechSynthesis?.getVoices().length > 0 ||
        preferences.screenReaderMode

      setIsScreenReaderActive(hasScreenReader)
    }

    checkScreenReader()

    // Listen for screen reader activation
    if ('speechSynthesis' in window) {
      window.speechSynthesis.addEventListener('voiceschanged', checkScreenReader)
    }

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.removeEventListener('voiceschanged', checkScreenReader)
      }
    }
  }, [preferences.screenReaderMode])

  // Create announcement region
  useEffect(() => {
    const region = document.createElement('div')
    region.id = 'mapmaker-announcements'
    region.setAttribute('aria-live', 'polite')
    region.setAttribute('aria-atomic', 'true')
    region.style.cssText = `
      position: absolute;
      left: -9999px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `
    document.body.appendChild(region)
    setAnnouncementRegion(region)

    return () => {
      if (region.parentNode) {
        region.parentNode.removeChild(region)
      }
    }
  }, [])

  // Apply accessibility preferences to document
  useEffect(() => {
    const root = document.documentElement

    // High contrast mode
    if (preferences.highContrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }

    // Reduced motion
    if (preferences.reducedMotion) {
      root.style.setProperty('--animation-duration', '0.01ms')
      root.style.setProperty('--transition-duration', '0.01ms')
    } else {
      root.style.removeProperty('--animation-duration')
      root.style.removeProperty('--transition-duration')
    }

    // Font size
    const fontSizeMap = {
      small: '0.875rem',
      medium: '1rem',
      large: '1.125rem',
      'extra-large': '1.25rem'
    }
    root.style.setProperty('--base-font-size', fontSizeMap[preferences.fontSize])

    // Screen reader mode
    if (preferences.screenReaderMode) {
      root.classList.add('screen-reader-mode')
    } else {
      root.classList.remove('screen-reader-mode')
    }

  }, [preferences])

  // Update preferences
  const updatePreference = useCallback(<K extends keyof AccessibilityPreferences>(
    key: K,
    value: AccessibilityPreferences[K]
  ) => {
    setPreferences(prev => {
      const updated = { ...prev, [key]: value }
      try {
        localStorage.setItem('mapmaker_accessibility_preferences', JSON.stringify(updated))
      } catch {
        console.warn('Failed to save accessibility preferences')
      }
      return updated
    })
  }, [])

  // Announce messages to screen readers
  const announceMessage = useCallback((
    message: string,
    priority: 'polite' | 'assertive' = 'polite'
  ) => {
    if (!preferences.announcements || !announcementRegion) return

    announcementRegion.setAttribute('aria-live', priority)
    announcementRegion.textContent = message

    // Clear after announcement
    setTimeout(() => {
      if (announcementRegion) {
        announcementRegion.textContent = ''
      }
    }, 1000)
  }, [preferences.announcements, announcementRegion])

  // Generate contextual ARIA labels
  const getAriaLabel = useCallback((element: string, context?: Record<string, any>): string => {
    const labels: Record<string, (ctx?: Record<string, any>) => string> = {
      // Canvas elements
      canvas: () => `Map canvas, ${currentMap?.objects.length || 0} objects, ${currentTool} tool selected`,

      // Tool buttons
      tool_select: () => `Select tool${currentTool === 'select' ? ', currently active' : ''}`,
      tool_token: () => `Token tool${currentTool === 'token' ? ', currently active' : ''}`,
      tool_rectangle: () => `Rectangle tool${currentTool === 'rectangle' ? ', currently active' : ''}`,
      tool_circle: () => `Circle tool${currentTool === 'circle' ? ', currently active' : ''}`,

      // Map objects
      token: (ctx) => `Token: ${ctx?.name || 'Unnamed'} at ${ctx?.x || 0}, ${ctx?.y || 0}`,
      shape: (ctx) => `${ctx?.type || 'Shape'} at ${ctx?.x || 0}, ${ctx?.y || 0}`,

      // UI elements
      zoom_in: () => 'Zoom in',
      zoom_out: () => 'Zoom out',
      grid_toggle: (ctx) => `Grid ${ctx?.visible ? 'visible' : 'hidden'}, toggle visibility`,

      // Layers
      layer: (ctx) => `Layer: ${ctx?.name || 'Unnamed'}, ${ctx?.visible ? 'visible' : 'hidden'}`,

      // Properties
      property_position: (ctx) => `Position: ${ctx?.x || 0}, ${ctx?.y || 0}`,
      property_size: (ctx) => `Size: ${ctx?.width || 0} by ${ctx?.height || 0}`,

      // Collaboration
      user_cursor: (ctx) => `${ctx?.userName || 'User'} cursor at ${ctx?.x || 0}, ${ctx?.y || 0}`,
      chat_message: (ctx) => `${ctx?.userName || 'User'}: ${ctx?.message || ''}`,
    }

    const labelFn = labels[element]
    return labelFn ? labelFn(context) : element
  }, [currentMap, currentTool])

  // Find focusable elements
  const getFocusableElements = useCallback((container?: HTMLElement): HTMLElement[] => {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ')

    const searchContainer = container || document.body
    return Array.from(searchContainer.querySelectorAll(focusableSelectors))
  }, [])

  // Focus trap utility
  const trapFocus = useCallback((container: HTMLElement) => {
    const focusableElements = getFocusableElements(container)

    if (focusableElements.length === 0) return () => {}

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    // Focus first element
    firstElement.focus()

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    container.addEventListener('keydown', handleTabKey)

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleTabKey)
    }
  }, [getFocusableElements])

  // Announce tool changes
  useEffect(() => {
    if (currentTool && preferences.announcements) {
      const toolNames: Record<string, string> = {
        select: 'Select tool',
        token: 'Token placement tool',
        rectangle: 'Rectangle drawing tool',
        circle: 'Circle drawing tool',
        line: 'Line drawing tool',
        text: 'Text tool',
        pan: 'Pan tool',
        measure: 'Measurement tool',
        eraser: 'Eraser tool'
      }

      const toolName = toolNames[currentTool] || currentTool
      announceMessage(`${toolName} selected`)
    }
  }, [currentTool, preferences.announcements, announceMessage])

  // Announce selection changes
  useEffect(() => {
    if (selectedObjects.length > 0 && preferences.announcements) {
      if (selectedObjects.length === 1) {
        announceMessage(`Selected 1 object`)
      } else {
        announceMessage(`Selected ${selectedObjects.length} objects`)
      }
    }
  }, [selectedObjects.length, preferences.announcements, announceMessage])

  return {
    preferences,
    isScreenReaderActive,
    announceMessage,
    updatePreference,
    getAriaLabel,
    getFocusableElements,
    trapFocus
  }
}

export default useAccessibility