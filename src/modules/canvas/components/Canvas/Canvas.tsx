/**
 * Canvas Component - Main canvas component for the new architecture
 * Provides a clean, composable canvas with proper lifecycle management
 */

import React, { useEffect } from 'react'
import { styled } from '@/foundation/theme'
import { Box } from '@/shared/components'
import { useCanvasModule, type CanvasEventHandlers } from '../../hooks'
import type { CanvasSettings } from '../../types'

export type CanvasProps = {
  settings: CanvasSettings
  eventHandlers?: CanvasEventHandlers
  onInitialized?: () => void
  onError?: (error: Error) => void
  children?: React.ReactNode
}

const CanvasContainer = styled(Box, {
  position: 'relative',
  width: '100%',
  height: '100%',
  backgroundColor: '$background',
  overflow: 'hidden',

  '& canvas': {
    display: 'block'
  }
})

const CanvasWrapper = styled('div', {
  width: '100%',
  height: '100%',
  position: 'relative'
})

export const Canvas = ({
  settings,
  eventHandlers,
  onInitialized,
  onError,
  children
}: CanvasProps) => {
  const canvas = useCanvasModule({
    settings,
    eventHandlers,
    onInitialized: (stage) => {
      console.log('Canvas initialized:', stage.size())
      onInitialized?.()
    },
    onError: (error) => {
      console.error('Canvas error:', error)
      onError?.(error)
    }
  })

  // Auto-initialize when component mounts
  useEffect(() => {
    if (!canvas.isInitialized && canvas.containerRef.current) {
      canvas.initialize()
    }
  }, [canvas])

  // Handle settings changes
  useEffect(() => {
    if (canvas.isInitialized && settings.viewport) {
      canvas.setViewport(settings.viewport)
    }
  }, [canvas, settings.viewport])

  return (
    <CanvasContainer>
      <CanvasWrapper ref={canvas.containerRef} />
      {children}
    </CanvasContainer>
  )
}