import { useEffect, useRef, useState, useCallback } from 'react'
import useMapStore from '@/store/mapStore'

interface PerformanceMetrics {
  fps: number
  memoryUsage: number
  renderTime: number
  canvasObjects: number
  totalTime: number
  timestamp: number
}

interface PerformanceHistory {
  samples: PerformanceMetrics[]
  averageFPS: number
  averageMemory: number
  averageRenderTime: number
  peakMemory: number
  minFPS: number
}

export const usePerformanceMonitor = (enabled: boolean = true) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [history, setHistory] = useState<PerformanceHistory>({
    samples: [],
    averageFPS: 0,
    averageMemory: 0,
    averageRenderTime: 0,
    peakMemory: 0,
    minFPS: 60
  })
  const [isRecording, setIsRecording] = useState(false)

  const frameRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(performance.now())
  const frameCountRef = useRef<number>(0)
  const renderStartRef = useRef<number>(0)

  // 🚀 PERFORMANCE FIX: Track actual frame times instead of accumulated time
  const frameTimesRef = useRef<number[]>([])
  const lastFrameRef = useRef<number>(performance.now())

  const { currentMap } = useMapStore()

  // FPS Calculation
  const calculateFPS = useCallback(() => {
    const now = performance.now()
    const delta = now - lastTimeRef.current

    if (delta >= 1000) { // Update every second
      const fps = Math.round((frameCountRef.current * 1000) / delta)

      frameCountRef.current = 0
      lastTimeRef.current = now

      return fps
    }

    frameCountRef.current++
    return null
  }, [])

  // Memory Usage Calculation
  const getMemoryUsage = useCallback((): number => {
    if ('memory' in performance) {
      // Chrome specific API
      const memory = (performance as any).memory as { usedJSHeapSize: number }
      return Math.round(memory.usedJSHeapSize / 1024 / 1024) // MB
    }
    return 0
  }, [])

  // Render Time Tracking
  const startRenderTracking = useCallback(() => {
    renderStartRef.current = performance.now()
  }, [])

  const endRenderTracking = useCallback((): number => {
    return performance.now() - renderStartRef.current
  }, [])

  // 🚀 PERFORMANCE FIX: Measure actual per-frame time
  const measureFrameTime = useCallback((): number => {
    const now = performance.now()
    const frameTime = now - lastFrameRef.current
    lastFrameRef.current = now

    // Keep rolling average of last 60 frames
    frameTimesRef.current.push(frameTime)
    if (frameTimesRef.current.length > 60) {
      frameTimesRef.current.shift()
    }

    // Return average of recent frames for stability
    return frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length
  }, [])

  // Performance Collection Loop
  const collectMetrics = useCallback(() => {
    if (!enabled) return

    // 🚀 PERFORMANCE FIX: Measure frame time on EVERY frame, not just FPS updates
    const currentFrameTime = measureFrameTime()

    const fps = calculateFPS()
    if (fps !== null) {
      const memoryUsage = getMemoryUsage()
      const canvasObjects = currentMap?.objects.length || 0
      const totalTime = performance.now()

      const newMetrics: PerformanceMetrics = {
        fps,
        memoryUsage,
        renderTime: currentFrameTime, // Use the frame time we just measured
        canvasObjects,
        totalTime,
        timestamp: Date.now()
      }

      setMetrics(newMetrics)

      // Update history if recording
      if (isRecording) {
        setHistory(prev => {
          const newSamples = [...prev.samples, newMetrics].slice(-100) // Keep last 100 samples

          const averageFPS = newSamples.reduce((sum, s) => sum + s.fps, 0) / newSamples.length
          const averageMemory = newSamples.reduce((sum, s) => sum + s.memoryUsage, 0) / newSamples.length
          const averageRenderTime = newSamples.reduce((sum, s) => sum + s.renderTime, 0) / newSamples.length
          const peakMemory = Math.max(prev.peakMemory, memoryUsage)
          const minFPS = Math.min(prev.minFPS, fps)

          return {
            samples: newSamples,
            averageFPS: Math.round(averageFPS),
            averageMemory: Math.round(averageMemory),
            averageRenderTime: Math.round(averageRenderTime * 100) / 100,
            peakMemory,
            minFPS
          }
        })
      }
    }

    frameRef.current = requestAnimationFrame(collectMetrics)
  }, [enabled, calculateFPS, measureFrameTime, getMemoryUsage, currentMap, isRecording])

  // Performance Warning Detection
  const getPerformanceWarnings = useCallback((): string[] => {
    if (!metrics) return []

    const warnings: string[] = []

    if (metrics.fps < 30) {
      warnings.push('Low FPS detected - consider reducing canvas objects or effects')
    }

    if (metrics.memoryUsage > 500) {
      warnings.push('High memory usage - consider optimizing large images or objects')
    }

    if (metrics.renderTime > 16.67) { // ~60fps threshold
      warnings.push('Slow render times - canvas operations may need optimization')
    }

    if (metrics.canvasObjects > 1000) {
      warnings.push('High object count - consider using object pooling or culling')
    }

    return warnings
  }, [metrics])

  // Performance Score (0-100)
  const getPerformanceScore = useCallback((): number => {
    if (!metrics) return 100

    let score = 100

    // FPS impact (40% of score)
    if (metrics.fps < 30) score -= 40
    else if (metrics.fps < 45) score -= 20
    else if (metrics.fps < 55) score -= 10

    // Memory impact (30% of score)
    if (metrics.memoryUsage > 1000) score -= 30
    else if (metrics.memoryUsage > 500) score -= 15
    else if (metrics.memoryUsage > 300) score -= 5

    // Render time impact (20% of score)
    if (metrics.renderTime > 33) score -= 20 // 30fps threshold
    else if (metrics.renderTime > 20) score -= 10
    else if (metrics.renderTime > 16.67) score -= 5

    // Object count impact (10% of score)
    if (metrics.canvasObjects > 2000) score -= 10
    else if (metrics.canvasObjects > 1000) score -= 5

    return Math.max(0, Math.round(score))
  }, [metrics])

  // Control Functions
  const startRecording = useCallback(() => {
    setIsRecording(true)
    setHistory({
      samples: [],
      averageFPS: 0,
      averageMemory: 0,
      averageRenderTime: 0,
      peakMemory: 0,
      minFPS: 60
    })
  }, [])

  const stopRecording = useCallback(() => {
    setIsRecording(false)
  }, [])

  const exportMetrics = useCallback(async (options?: {
    includeConsoleLogs?: boolean
    includeScreenshots?: boolean
    consoleLogs?: any[]
    screenshots?: string[]
  }) => {
    const data: any = {
      timestamp: new Date().toISOString(),
      session: {
        duration: history.samples.length,
        mapObjects: currentMap?.objects.length || 0,
        mapSize: currentMap ? `${currentMap.width}x${currentMap.height}` : 'N/A'
      },
      performance: history
    }

    // Include console logs if provided or requested
    if (options?.includeConsoleLogs && options?.consoleLogs) {
      data.consoleLogs = options.consoleLogs
    }

    // Include screenshots if provided or requested
    if (options?.includeScreenshots && options?.screenshots) {
      data.screenshots = options.screenshots
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mapmaker-performance-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [history, currentMap])

  // Lifecycle
  useEffect(() => {
    if (enabled) {
      startRenderTracking()
      frameRef.current = requestAnimationFrame(collectMetrics)
    }

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [enabled, collectMetrics, startRenderTracking])

  return {
    metrics,
    history,
    isRecording,
    warnings: getPerformanceWarnings(),
    score: getPerformanceScore(),
    startRecording,
    stopRecording,
    exportMetrics,
    // Utility functions for components
    startRenderTracking,
    endRenderTracking
  }
}

export default usePerformanceMonitor