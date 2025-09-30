/**
 * Global registry for Konva stage reference
 * Allows components to access stage transform without prop drilling
 */

import type Konva from 'konva'

let globalStageRef: Konva.Stage | null = null

export const registerStage = (stage: Konva.Stage | null) => {
  globalStageRef = stage
}

export const getStage = (): Konva.Stage | null => {
  return globalStageRef
}

/**
 * Calculate viewport-relative canvas coordinates
 * Converts screen position to canvas coordinates based on current viewport transform
 */
export const screenToCanvasPosition = (screenX: number, screenY: number): { x: number; y: number } => {
  if (!globalStageRef) {
    return { x: screenX, y: screenY }
  }

  const scale = globalStageRef.scaleX()
  const stagePos = globalStageRef.position()

  return {
    x: (screenX - stagePos.x) / scale,
    y: (screenY - stagePos.y) / scale
  }
}

/**
 * Get bottom-left corner of viewport in canvas coordinates
 * This is where the environment token visual is displayed
 */
export const getEnvironmentTokenCanvasPosition = (): { x: number; y: number } => {
  if (!globalStageRef) {
    return { x: 56, y: 1020 } // Fallback to default position
  }

  const scale = globalStageRef.scaleX()
  const stagePos = globalStageRef.position()

  // Get canvas container offset (accounts for toolbar and other UI elements)
  const container = globalStageRef.container()
  const containerRect = container.getBoundingClientRect()

  // Screen position of environment token icon center (relative to viewport)
  // Icon is 60px wide/tall, positioned at left: 16px, bottom: 16px from viewport edges
  const screenLeft = 16 + 30 // 16px left margin + 30px to center of 60px icon
  const screenTop = window.innerHeight - 16 - 30 // window height - 16px bottom margin - 30px to center

  // Convert viewport coordinates to canvas container-relative coordinates
  const canvasRelativeX = screenLeft - containerRect.left
  const canvasRelativeY = screenTop - containerRect.top

  // Convert to canvas coordinates accounting for pan/zoom transform
  const canvasPos = {
    x: (canvasRelativeX - stagePos.x) / scale,
    y: (canvasRelativeY - stagePos.y) / scale
  }

  return canvasPos
}