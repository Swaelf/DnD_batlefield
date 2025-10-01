import { useEffect, useRef, useCallback } from 'react'
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Button } from '@/components/primitives/ButtonVE'
import { Modal } from '@/components/ui/Modal'
import { vars } from '@/styles/theme.css'
import {
  Activity,
  Cpu,
  HardDrive,
  Clock,
  AlertTriangle,
  Download,
  Play,
  Square
} from '@/utils/optimizedIcons'

type PerformanceDashboardProps = {
  isOpen: boolean
  onClose: () => void
}

export const PerformanceDashboard = ({
  isOpen,
  onClose
}: PerformanceDashboardProps) => {
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

  const getScoreColor = useCallback((score: number): string => {
    if (score >= 80) return vars.colors.success
    if (score >= 60) return vars.colors.warning
    return vars.colors.error
  }, [])

  const getScoreLabel = useCallback((score: number): string => {
    if (score >= 90) return 'Excellent'
    if (score >= 80) return 'Good'
    if (score >= 70) return 'Fair'
    if (score >= 60) return 'Poor'
    return 'Critical'
  }, [])

  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Box
        padding={4}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          minWidth: '700px',
          maxHeight: '80vh',
          overflow: 'auto'
        }}
      >
        <Text variant="heading" size="lg" style={{ marginBottom: '8px' }}>
          Performance Dashboard
        </Text>

        {/* Performance Score */}
        <Box
          padding={4}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: vars.colors.gray800,
            borderRadius: '8px',
            border: `2px solid ${getScoreColor(score)}`
          }}
        >
          <Box style={{ textAlign: 'center' }}>
            <Text
              variant="heading"
              size="xl"
              style={{
                color: getScoreColor(score),
                fontWeight: 'bold',
                marginBottom: '4px'
              }}
            >
              {score}
            </Text>
            <Text
              variant="body"
              size="sm"
              style={{ color: vars.colors.gray400 }}
            >
              Performance Score - {getScoreLabel(score)}
            </Text>
          </Box>
        </Box>

        {/* Current Metrics */}
        {metrics && (
          <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <Box
              padding={3}
              style={{
                backgroundColor: vars.colors.gray900,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Activity size={20} color="#10B981" />
              <Box>
                <Text variant="body" size="lg" style={{ fontWeight: '600' }}>
                  {metrics.fps}
                </Text>
                <Text variant="body" size="xs" style={{ color: vars.colors.gray400 }}>
                  FPS
                </Text>
              </Box>
            </Box>

            <Box
              padding={3}
              style={{
                backgroundColor: vars.colors.gray900,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <HardDrive size={20} color="#F59E0B" />
              <Box>
                <Text variant="body" size="lg" style={{ fontWeight: '600' }}>
                  {metrics.memoryUsage}MB
                </Text>
                <Text variant="body" size="xs" style={{ color: vars.colors.gray400 }}>
                  Memory
                </Text>
              </Box>
            </Box>

            <Box
              padding={3}
              style={{
                backgroundColor: vars.colors.gray900,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Clock size={20} color="#8B5CF6" />
              <Box>
                <Text variant="body" size="lg" style={{ fontWeight: '600' }}>
                  {metrics.renderTime.toFixed(2)}ms
                </Text>
                <Text variant="body" size="xs" style={{ color: vars.colors.gray400 }}>
                  Render Time
                </Text>
              </Box>
            </Box>

            <Box
              padding={3}
              style={{
                backgroundColor: vars.colors.gray900,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Cpu size={20} color="#EC4899" />
              <Box>
                <Text variant="body" size="lg" style={{ fontWeight: '600' }}>
                  {metrics.canvasObjects}
                </Text>
                <Text variant="body" size="xs" style={{ color: vars.colors.gray400 }}>
                  Objects
                </Text>
              </Box>
            </Box>
          </Box>
        )}

        {/* Performance Chart */}
        <Box
          padding={3}
          style={{
            backgroundColor: vars.colors.gray900,
            borderRadius: '8px'
          }}
        >
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px'
            }}
          >
            <Text
              variant="body"
              size="sm"
              style={{ fontWeight: '500' }}
            >
              Performance History
            </Text>
            <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Box
                  style={{
                    width: '12px',
                    height: '2px',
                    backgroundColor: vars.colors.success
                  }}
                />
                <Text
                  variant="body"
                  size="xs"
                  style={{ color: vars.colors.gray400 }}
                >
                  FPS
                </Text>
              </Box>
              <Box style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Box
                  style={{
                    width: '12px',
                    height: '2px',
                    backgroundColor: vars.colors.warning
                  }}
                />
                <Text
                  variant="body"
                  size="xs"
                  style={{ color: vars.colors.gray400 }}
                >
                  Memory
                </Text>
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
          <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            <Box
              padding={2}
              style={{
                textAlign: 'center',
                backgroundColor: vars.colors.gray800,
                borderRadius: '4px'
              }}
            >
              <Text
                variant="body"
                size="lg"
                style={{
                  fontWeight: '600',
                  color: vars.colors.success
                }}
              >
                {history.averageFPS}
              </Text>
              <Text
                variant="body"
                size="xs"
                style={{ color: vars.colors.gray400 }}
              >
                Avg FPS
              </Text>
            </Box>

            <Box
              padding={2}
              style={{
                textAlign: 'center',
                backgroundColor: vars.colors.gray800,
                borderRadius: '4px'
              }}
            >
              <Text
                variant="body"
                size="lg"
                style={{
                  fontWeight: '600',
                  color: vars.colors.warning
                }}
              >
                {history.peakMemory}MB
              </Text>
              <Text
                variant="body"
                size="xs"
                style={{ color: vars.colors.gray400 }}
              >
                Peak Memory
              </Text>
            </Box>

            <Box
              padding={2}
              style={{
                textAlign: 'center',
                backgroundColor: vars.colors.gray800,
                borderRadius: '4px'
              }}
            >
              <Text
                variant="body"
                size="lg"
                style={{
                  fontWeight: '600',
                  color: vars.colors.primary
                }}
              >
                {history.averageRenderTime}ms
              </Text>
              <Text
                variant="body"
                size="xs"
                style={{ color: vars.colors.gray400 }}
              >
                Avg Render
              </Text>
            </Box>
          </Box>
        )}

        {/* Performance Warnings */}
        {warnings.length > 0 && (
          <Box
            padding={3}
            style={{
              backgroundColor: vars.colors.gray900,
              border: `1px solid ${vars.colors.warning}`,
              borderRadius: '8px'
            }}
          >
            <Box
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px'
              }}
            >
              <AlertTriangle size={16} color="#F59E0B" />
              <Text
                variant="body"
                size="sm"
                style={{
                  fontWeight: '500',
                  color: vars.colors.warning
                }}
              >
                Performance Warnings
              </Text>
            </Box>
            {warnings.map((warning, index) => (
              <Text
                key={index}
                variant="body"
                size="xs"
                style={{
                  color: vars.colors.gray400,
                  display: 'block',
                  marginBottom: '4px'
                }}
              >
                • {warning}
              </Text>
            ))}
          </Box>
        )}

        {/* Controls */}
        <Box
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Box style={{ display: 'flex', gap: '8px' }}>
            <Button
              variant={isRecording ? 'destructive' : 'primary'}
              size="sm"
              onClick={isRecording ? stopRecording : startRecording}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {isRecording ? <Square size={16} /> : <Play size={16} />}
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </Button>

            {history.samples.length > 0 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={exportMetrics}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Download size={16} />
                Export Data
              </Button>
            )}
          </Box>

          <Text
            variant="body"
            size="xs"
            style={{ color: vars.colors.gray500 }}
          >
            {history.samples.length} samples recorded
          </Text>
        </Box>

        {/* Performance Tips */}
        <Box
          padding={3}
          style={{
            backgroundColor: vars.colors.gray800,
            borderRadius: '8px',
            border: `1px solid ${vars.colors.gray700}`
          }}
        >
          <Text
            variant="body"
            size="sm"
            style={{
              fontWeight: '500',
              marginBottom: '8px'
            }}
          >
            Performance Tips:
          </Text>
          <Box
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            <Text
              variant="body"
              size="xs"
              style={{ color: vars.colors.gray400 }}
            >
              • Target 60 FPS for smooth interactions
            </Text>
            <Text
              variant="body"
              size="xs"
              style={{ color: vars.colors.gray400 }}
            >
              • Keep memory usage under 300MB for best performance
            </Text>
            <Text
              variant="body"
              size="xs"
              style={{ color: vars.colors.gray400 }}
            >
              • Limit canvas objects to under 1000 for optimal rendering
            </Text>
            <Text
              variant="body"
              size="xs"
              style={{ color: vars.colors.gray400 }}
            >
              • Use layers to organize and hide complex objects when not needed
            </Text>
          </Box>
        </Box>
      </Box>
    </Modal>
  )
}

export default PerformanceDashboard