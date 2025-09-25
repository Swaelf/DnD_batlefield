import React, { useState, useEffect, useRef } from 'react'
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor'
import { Box, Text, Button } from '@/components/ui'
import { Modal } from '@/components/ui'
import {
  Activity,
  Cpu,
  HardDrive,
  Clock,
  TrendingUp,
  AlertTriangle,
  Download,
  Play,
  Square,
  BarChart3
} from 'lucide-react'

interface PerformanceDashboardProps {
  isOpen: boolean
  onClose: () => void
}

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  isOpen,
  onClose
}) => {
  const {
    metrics,
    history,
    isRecording,
    warnings,
    score,
    startRecording,
    stopRecording,
    exportMetrics
  } = usePerformanceMonitor(isOpen)

  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Performance Chart Rendering
  useEffect(() => {
    if (!canvasRef.current || !history.samples.length) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = canvas
    ctx.clearRect(0, 0, width, height)

    // Draw FPS Chart
    const samples = history.samples.slice(-50) // Last 50 samples
    if (samples.length < 2) return

    const maxFPS = 60
    const minFPS = 0

    // Grid lines
    ctx.strokeStyle = '#374151'
    ctx.lineWidth = 1
    for (let i = 0; i <= 6; i++) {
      const y = (i / 6) * height
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    // FPS Line
    ctx.strokeStyle = '#10B981' // Green
    ctx.lineWidth = 2
    ctx.beginPath()

    samples.forEach((sample, index) => {
      const x = (index / (samples.length - 1)) * width
      const y = height - ((sample.fps - minFPS) / (maxFPS - minFPS)) * height

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()

    // Memory Usage Line (scaled to fit)
    const maxMemory = Math.max(...samples.map(s => s.memoryUsage)) || 100
    ctx.strokeStyle = '#F59E0B' // Yellow
    ctx.lineWidth = 2
    ctx.beginPath()

    samples.forEach((sample, index) => {
      const x = (index / (samples.length - 1)) * width
      const y = height - (sample.memoryUsage / maxMemory) * height

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()

  }, [history.samples])

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '$success'
    if (score >= 60) return '$warning'
    return '$error'
  }

  const getScoreLabel = (score: number): string => {
    if (score >= 90) return 'Excellent'
    if (score >= 80) return 'Good'
    if (score >= 70) return 'Fair'
    if (score >= 60) return 'Poor'
    return 'Critical'
  }

  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Performance Dashboard">
      <Box css={{ display: 'flex', flexDirection: 'column', gap: '$4', minWidth: 700, maxHeight: '80vh', overflow: 'auto' }}>

        {/* Performance Score */}
        <Box
          css={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '$4',
            backgroundColor: '$gray800',
            borderRadius: '$md',
            border: `2px solid var(--colors-${getScoreColor(score)})`
          }}
        >
          <Box css={{ textAlign: 'center' }}>
            <Text css={{ fontSize: '$2xl', fontWeight: '$bold', color: getScoreColor(score) }}>
              {score}
            </Text>
            <Text css={{ fontSize: '$sm', color: '$gray400' }}>
              Performance Score - {getScoreLabel(score)}
            </Text>
          </Box>
        </Box>

        {/* Current Metrics */}
        {metrics && (
          <Box css={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '$3' }}>
            <Box
              css={{
                padding: '$3',
                backgroundColor: '$gray900',
                borderRadius: '$md',
                display: 'flex',
                alignItems: 'center',
                gap: '$2'
              }}
            >
              <Activity size={20} color="#10B981" />
              <Box>
                <Text css={{ fontSize: '$lg', fontWeight: '$semibold' }}>{metrics.fps}</Text>
                <Text css={{ fontSize: '$xs', color: '$gray400' }}>FPS</Text>
              </Box>
            </Box>

            <Box
              css={{
                padding: '$3',
                backgroundColor: '$gray900',
                borderRadius: '$md',
                display: 'flex',
                alignItems: 'center',
                gap: '$2'
              }}
            >
              <HardDrive size={20} color="#F59E0B" />
              <Box>
                <Text css={{ fontSize: '$lg', fontWeight: '$semibold' }}>{metrics.memoryUsage}MB</Text>
                <Text css={{ fontSize: '$xs', color: '$gray400' }}>Memory</Text>
              </Box>
            </Box>

            <Box
              css={{
                padding: '$3',
                backgroundColor: '$gray900',
                borderRadius: '$md',
                display: 'flex',
                alignItems: 'center',
                gap: '$2'
              }}
            >
              <Clock size={20} color="#8B5CF6" />
              <Box>
                <Text css={{ fontSize: '$lg', fontWeight: '$semibold' }}>{metrics.renderTime.toFixed(2)}ms</Text>
                <Text css={{ fontSize: '$xs', color: '$gray400' }}>Render Time</Text>
              </Box>
            </Box>

            <Box
              css={{
                padding: '$3',
                backgroundColor: '$gray900',
                borderRadius: '$md',
                display: 'flex',
                alignItems: 'center',
                gap: '$2'
              }}
            >
              <Cpu size={20} color="#EC4899" />
              <Box>
                <Text css={{ fontSize: '$lg', fontWeight: '$semibold' }}>{metrics.canvasObjects}</Text>
                <Text css={{ fontSize: '$xs', color: '$gray400' }}>Objects</Text>
              </Box>
            </Box>
          </Box>
        )}

        {/* Performance Chart */}
        <Box
          css={{
            padding: '$3',
            backgroundColor: '$gray900',
            borderRadius: '$md'
          }}
        >
          <Box css={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '$3' }}>
            <Text css={{ fontSize: '$sm', fontWeight: '$medium' }}>Performance History</Text>
            <Box css={{ display: 'flex', alignItems: 'center', gap: '$2' }}>
              <Box css={{ display: 'flex', alignItems: 'center', gap: '$1' }}>
                <Box css={{ width: 12, height: 2, backgroundColor: '$success' }} />
                <Text css={{ fontSize: '$xs', color: '$gray400' }}>FPS</Text>
              </Box>
              <Box css={{ display: 'flex', alignItems: 'center', gap: '$1' }}>
                <Box css={{ width: 12, height: 2, backgroundColor: '$warning' }} />
                <Text css={{ fontSize: '$xs', color: '$gray400' }}>Memory</Text>
              </Box>
            </Box>
          </Box>

          <canvas
            ref={canvasRef}
            width={650}
            height={200}
            style={{ width: '100%', height: '200px', backgroundColor: '#111827', borderRadius: '4px' }}
          />
        </Box>

        {/* Performance History Stats */}
        {history.samples.length > 0 && (
          <Box css={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '$3' }}>
            <Box css={{ textAlign: 'center', padding: '$2', backgroundColor: '$gray800', borderRadius: '$sm' }}>
              <Text css={{ fontSize: '$lg', fontWeight: '$semibold', color: '$success' }}>{history.averageFPS}</Text>
              <Text css={{ fontSize: '$xs', color: '$gray400' }}>Avg FPS</Text>
            </Box>

            <Box css={{ textAlign: 'center', padding: '$2', backgroundColor: '$gray800', borderRadius: '$sm' }}>
              <Text css={{ fontSize: '$lg', fontWeight: '$semibold', color: '$warning' }}>{history.peakMemory}MB</Text>
              <Text css={{ fontSize: '$xs', color: '$gray400' }}>Peak Memory</Text>
            </Box>

            <Box css={{ textAlign: 'center', padding: '$2', backgroundColor: '$gray800', borderRadius: '$sm' }}>
              <Text css={{ fontSize: '$lg', fontWeight: '$semibold', color: '$primary' }}>{history.averageRenderTime}ms</Text>
              <Text css={{ fontSize: '$xs', color: '$gray400' }}>Avg Render</Text>
            </Box>
          </Box>
        )}

        {/* Performance Warnings */}
        {warnings.length > 0 && (
          <Box
            css={{
              padding: '$3',
              backgroundColor: '$gray900',
              border: '1px solid $warning',
              borderRadius: '$md'
            }}
          >
            <Box css={{ display: 'flex', alignItems: 'center', gap: '$2', marginBottom: '$2' }}>
              <AlertTriangle size={16} color="#F59E0B" />
              <Text css={{ fontSize: '$sm', fontWeight: '$medium', color: '$warning' }}>
                Performance Warnings
              </Text>
            </Box>
            {warnings.map((warning, index) => (
              <Text key={index} css={{ fontSize: '$xs', color: '$gray400', display: 'block', marginBottom: '$1' }}>
                • {warning}
              </Text>
            ))}
          </Box>
        )}

        {/* Controls */}
        <Box css={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box css={{ display: 'flex', gap: '$2' }}>
            <Button
              variant={isRecording ? 'destructive' : 'primary'}
              size="sm"
              onClick={isRecording ? stopRecording : startRecording}
            >
              {isRecording ? <Square size={16} /> : <Play size={16} />}
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </Button>

            {history.samples.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={exportMetrics}
              >
                <Download size={16} />
                Export Data
              </Button>
            )}
          </Box>

          <Text css={{ fontSize: '$xs', color: '$gray500' }}>
            {history.samples.length} samples recorded
          </Text>
        </Box>

        {/* Performance Tips */}
        <Box
          css={{
            padding: '$3',
            backgroundColor: '$gray800',
            borderRadius: '$md',
            border: '1px solid $gray700'
          }}
        >
          <Text css={{ fontSize: '$sm', fontWeight: '$medium', marginBottom: '$2' }}>
            Performance Tips:
          </Text>
          <Box css={{ display: 'flex', flexDirection: 'column', gap: '$1' }}>
            <Text css={{ fontSize: '$xs', color: '$gray400' }}>
              • Target 60 FPS for smooth interactions
            </Text>
            <Text css={{ fontSize: '$xs', color: '$gray400' }}>
              • Keep memory usage under 300MB for best performance
            </Text>
            <Text css={{ fontSize: '$xs', color: '$gray400' }}>
              • Limit canvas objects to under 1000 for optimal rendering
            </Text>
            <Text css={{ fontSize: '$xs', color: '$gray400' }}>
              • Use layers to organize and hide complex objects when not needed
            </Text>
          </Box>
        </Box>
      </Box>
    </Modal>
  )
}

export default PerformanceDashboard