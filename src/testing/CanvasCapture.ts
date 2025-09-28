import type Konva from 'konva'
import type { BattleMap } from '@/types/map'
import type { Timeline } from '@/types/timeline'

export interface Screenshot {
  id: string
  timestamp: number
  dataUrl: string
  width: number
  height: number
  metadata: {
    mapState?: BattleMap
    timeline?: Timeline
    testName?: string
    description?: string
  }
}

export interface StateSnapshot {
  map: BattleMap
  timeline?: Timeline
  currentRound?: number
  selectedObjects: string[]
  tool: string
  timestamp: number
}

export class CanvasCapture {
  private stage: Konva.Stage | null = null

  setStage(stage: Konva.Stage) {
    this.stage = stage
  }

  async captureScreenshot(metadata?: Screenshot['metadata']): Promise<Screenshot> {
    if (!this.stage) {
      throw new Error('Stage not set. Call setStage() first.')
    }

    const dataUrl = await this.stage.toDataURL({
      pixelRatio: 2, // Higher quality
      mimeType: 'image/png'
    })

    return {
      id: `screenshot-${Date.now()}`,
      timestamp: Date.now(),
      dataUrl,
      width: this.stage.width(),
      height: this.stage.height(),
      metadata: metadata || {}
    }
  }

  async captureRegion(x: number, y: number, width: number, height: number): Promise<string> {
    if (!this.stage) {
      throw new Error('Stage not set')
    }

    return this.stage.toDataURL({
      x,
      y,
      width,
      height,
      pixelRatio: 2
    })
  }

  captureState(
    map: BattleMap,
    timeline?: Timeline,
    selectedObjects?: string[],
    tool?: string
  ): StateSnapshot {
    return {
      map: JSON.parse(JSON.stringify(map)), // Deep clone
      timeline: timeline ? JSON.parse(JSON.stringify(timeline)) : undefined,
      currentRound: timeline?.currentRound,
      selectedObjects: selectedObjects || [],
      tool: tool || 'select',
      timestamp: Date.now()
    }
  }

  async captureSequence(
    intervalMs: number,
    durationMs: number,
    metadata?: Screenshot['metadata']
  ): Promise<Screenshot[]> {
    const screenshots: Screenshot[] = []
    const startTime = Date.now()

    return new Promise((resolve) => {
      const interval = setInterval(async () => {
        const elapsed = Date.now() - startTime

        if (elapsed >= durationMs) {
          clearInterval(interval)
          resolve(screenshots)
          return
        }

        try {
          const screenshot = await this.captureScreenshot({
            ...metadata,
            description: `Frame at ${elapsed}ms`
          })
          screenshots.push(screenshot)
        } catch (error) {
          console.error('Failed to capture frame:', error)
        }
      }, intervalMs)
    })
  }

  compareScreenshots(before: Screenshot, after: Screenshot): boolean {
    // Simple comparison - in production, use image diffing library
    return before.dataUrl === after.dataUrl
  }

  exportToBlob(screenshot: Screenshot): Promise<Blob> {
    return new Promise((resolve, reject) => {
      fetch(screenshot.dataUrl)
        .then(res => res.blob())
        .then(resolve)
        .catch(reject)
    })
  }
}

export const canvasCapture = new CanvasCapture()