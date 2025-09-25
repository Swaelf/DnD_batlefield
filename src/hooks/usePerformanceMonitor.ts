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

  const frameRef = useRef<number>()
  const lastTimeRef = useRef<number>(performance.now())
  const frameCountRef = useRef<number>(0)
  const renderStartRef = useRef<number>(0)

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
      // @ts-ignore - Chrome specific API
      const memory = performance.memory
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

  // Performance Collection Loop
  const collectMetrics = useCallback(() => {
    if (!enabled) return

    const fps = calculateFPS()
    if (fps !== null) {
      const renderTime = endRenderTracking()
      const memoryUsage = getMemoryUsage()
      const canvasObjects = currentMap?.objects.length || 0
      const totalTime = performance.now()

      const newMetrics: PerformanceMetrics = {
        fps,
        memoryUsage,
        renderTime,
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

      // Start tracking next render
      startRenderTracking()
    }

    frameRef.current = requestAnimationFrame(collectMetrics)
  }, [enabled, calculateFPS, endRenderTracking, getMemoryUsage, currentMap, isRecording, startRenderTracking])

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

  const exportMetrics = useCallback(() => {
    const data = {
      timestamp: new Date().toISOString(),
      session: {
        duration: history.samples.length,
        mapObjects: currentMap?.objects.length || 0,
        mapSize: currentMap ? `${currentMap.width}x${currentMap.height}` : 'N/A'
      },
      performance: history
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