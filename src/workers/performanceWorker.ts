/**
 * Web Worker for Performance Calculations
 * Handles heavy computational tasks for performance monitoring and analytics
 */

export interface PerformanceWorkerMessage {
  type: 'CALCULATE_METRICS' | 'PROCESS_HISTORY' | 'GENERATE_REPORT'
  payload: any
  id: string
}

export interface PerformanceWorkerResponse {
  type: 'PROGRESS' | 'COMPLETE' | 'ERROR'
  payload: any
  id: string
}

interface PerformanceDataPoint {
  fps: number
  memoryUsage: number
  renderTime: number
  jankEvents?: number
  timestamp: number
}

// Performance calculation functions
const calculatePerformanceScore = (metrics: any[]): number => {
  if (metrics.length === 0) return 0

  const weights = {
    fps: 0.4,        // 40% weight for FPS
    memory: 0.3,     // 30% weight for memory usage
    renderTime: 0.2, // 20% weight for render time
    jank: 0.1        // 10% weight for jank events
  }

  let totalScore = 0
  let validMetrics = 0

  for (const metric of metrics) {
    let score = 0

    // FPS Score (0-100)
    if (metric.fps !== undefined) {
      score += Math.min(100, (metric.fps / 60) * 100) * weights.fps
    }

    // Memory Score (inverse, lower is better)
    if (metric.memoryUsage !== undefined) {
      const memoryScore = Math.max(0, 100 - (metric.memoryUsage / (100 * 1024 * 1024)) * 100)
      score += memoryScore * weights.memory
    }

    // Render Time Score (inverse, lower is better)
    if (metric.renderTime !== undefined) {
      const renderScore = Math.max(0, 100 - (metric.renderTime / 16.67) * 100) // 16.67ms = 60fps
      score += renderScore * weights.renderTime
    }

    // Jank Score (inverse, fewer janks is better)
    if (metric.jankEvents !== undefined) {
      const jankScore = Math.max(0, 100 - metric.jankEvents * 10)
      score += jankScore * weights.jank
    }

    totalScore += score
    validMetrics++
  }

  return validMetrics > 0 ? totalScore / validMetrics : 0
}

const analyzePerformanceTrends = (history: any[]): any => {
  if (history.length < 2) return null

  const trends = {
    fps: { trend: 'stable', change: 0 },
    memory: { trend: 'stable', change: 0 },
    renderTime: { trend: 'stable', change: 0 }
  }

  // Calculate trends over the last 20 samples
  const recentSamples = history.slice(-20)
  const olderSamples = history.slice(-40, -20)

  if (olderSamples.length === 0 || recentSamples.length === 0) return trends

  // FPS trend
  const recentFps = recentSamples.reduce((sum, s) => sum + s.fps, 0) / recentSamples.length
  const olderFps = olderSamples.reduce((sum, s) => sum + s.fps, 0) / olderSamples.length
  const fpsChange = ((recentFps - olderFps) / olderFps) * 100

  trends.fps.change = fpsChange
  trends.fps.trend = fpsChange > 5 ? 'improving' : fpsChange < -5 ? 'degrading' : 'stable'

  // Memory trend
  const recentMemory = recentSamples.reduce((sum, s) => sum + s.memoryUsage, 0) / recentSamples.length
  const olderMemory = olderSamples.reduce((sum, s) => sum + s.memoryUsage, 0) / olderSamples.length
  const memoryChange = ((recentMemory - olderMemory) / olderMemory) * 100

  trends.memory.change = memoryChange
  trends.memory.trend = memoryChange > 10 ? 'degrading' : memoryChange < -10 ? 'improving' : 'stable'

  // Render time trend
  const recentRender = recentSamples.reduce((sum, s) => sum + s.renderTime, 0) / recentSamples.length
  const olderRender = olderSamples.reduce((sum, s) => sum + s.renderTime, 0) / olderSamples.length
  const renderChange = ((recentRender - olderRender) / olderRender) * 100

  trends.renderTime.change = renderChange
  trends.renderTime.trend = renderChange > 10 ? 'degrading' : renderChange < -10 ? 'improving' : 'stable'

  return trends
}

const generatePerformanceReport = (data: any): any => {
  const { metrics, history, warnings } = data

  const report = {
    timestamp: Date.now(),
    summary: {
      score: calculatePerformanceScore(metrics),
      totalSamples: history.length,
      warningCount: warnings.length
    },
    trends: analyzePerformanceTrends(history),
    recommendations: [] as string[],
    details: {
      averageFps: 0,
      memoryPeak: 0,
      averageRenderTime: 0,
      jankEvents: 0
    }
  }

  // Calculate detailed metrics
  if (history.length > 0) {
    report.details.averageFps = history.reduce((sum: number, h: PerformanceDataPoint) => sum + h.fps, 0) / history.length
    report.details.memoryPeak = Math.max(...history.map((h: PerformanceDataPoint) => h.memoryUsage))
    report.details.averageRenderTime = history.reduce((sum: number, h: PerformanceDataPoint) => sum + h.renderTime, 0) / history.length
    report.details.jankEvents = history.reduce((sum: number, h: PerformanceDataPoint) => sum + (h.jankEvents || 0), 0)
  }

  // Generate recommendations
  if (report.details.averageFps < 30) {
    report.recommendations.push('FPS is critically low. Consider reducing object count or complexity.')
  } else if (report.details.averageFps < 50) {
    report.recommendations.push('FPS could be improved. Check for expensive operations.')
  }

  if (report.details.memoryPeak > 200 * 1024 * 1024) { // 200MB
    report.recommendations.push('Memory usage is high. Check for memory leaks or large objects.')
  }

  if (report.details.averageRenderTime > 20) {
    report.recommendations.push('Render time is slow. Consider optimizing canvas operations.')
  }

  if (report.details.jankEvents > 10) {
    report.recommendations.push('Frequent jank detected. Review animation and interaction performance.')
  }

  if (report.trends?.fps.trend === 'degrading') {
    report.recommendations.push('FPS is degrading over time. Monitor for performance regressions.')
  }

  if (report.trends?.memory.trend === 'degrading') {
    report.recommendations.push('Memory usage is increasing. Check for potential memory leaks.')
  }

  return report
}

const processLargeDataSet = (data: any[], operation: string): any => {
  const batchSize = 1000
  const results = []

  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize)

    switch (operation) {
      case 'aggregate':
        const sum = batch.reduce((acc, item) => acc + (item.value || 0), 0)
        const avg = sum / batch.length
        results.push({ batchIndex: i / batchSize, sum, avg, count: batch.length })
        break

      case 'filter':
        const filtered = batch.filter(item => item.value > 0)
        results.push({ batchIndex: i / batchSize, filtered: filtered.length, total: batch.length })
        break

      case 'transform':
        const transformed = batch.map(item => ({
          ...item,
          normalized: (item.value || 0) / 100,
          timestamp: Date.now()
        }))
        results.push({ batchIndex: i / batchSize, items: transformed })
        break
    }

    // Send progress update every 10 batches
    if (i % (batchSize * 10) === 0) {
      self.postMessage({
        type: 'PROGRESS',
        payload: {
          stage: operation,
          progress: (i / data.length) * 100,
          message: `Processing batch ${Math.floor(i / batchSize) + 1}...`
        },
        id: 'current'
      })
    }
  }

  return results
}

// Worker message handler
self.onmessage = (event: MessageEvent<PerformanceWorkerMessage>) => {
  const { type, payload, id } = event.data

  try {
    let result: any

    switch (type) {
      case 'CALCULATE_METRICS':
        result = calculatePerformanceScore(payload.metrics)
        break

      case 'PROCESS_HISTORY':
        const { history, operation } = payload

        self.postMessage({
          type: 'PROGRESS',
          payload: { stage: 'processing', progress: 25, message: 'Processing performance history...' },
          id
        })

        if (operation === 'trends') {
          result = analyzePerformanceTrends(history)
        } else {
          result = processLargeDataSet(history, operation)
        }
        break

      case 'GENERATE_REPORT':
        self.postMessage({
          type: 'PROGRESS',
          payload: { stage: 'generating', progress: 50, message: 'Generating performance report...' },
          id
        })

        result = generatePerformanceReport(payload)
        break

      default:
        throw new Error(`Unknown message type: ${type}`)
    }

    // Send completion
    self.postMessage({
      type: 'COMPLETE',
      payload: result,
      id
    } as PerformanceWorkerResponse)

  } catch (error) {
    // Send error
    self.postMessage({
      type: 'ERROR',
      payload: { message: error instanceof Error ? error.message : 'Unknown error' },
      id
    } as PerformanceWorkerResponse)
  }
}

// Export types for TypeScript
export type {}