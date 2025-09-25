/**
 * PerformanceMonitor Molecule - Real-time performance dashboard
 *
 * Displays comprehensive canvas performance metrics using PerformanceMetric atoms
 * with real-time updates and visual indicators for optimization.
 */

import React from 'react'
import { Activity, Zap, Database, Clock } from 'lucide-react'
import { Box, Text } from '@/components/ui'
import { styled } from '@/styles/theme.config'
import { PerformanceMetric } from '../../atoms'
import type { CanvasPerformance } from '../../../types'

export interface PerformanceMonitorProps {
  readonly performance: CanvasPerformance
  readonly showAll?: boolean
  readonly compact?: boolean
  readonly updateInterval?: number
  readonly thresholds?: PerformanceThresholds
}

export interface PerformanceThresholds {
  readonly fps: { warning: number; error: number }
  readonly frameTime: { warning: number; error: number }
  readonly memory: { warning: number; error: number }
  readonly objectCount: { warning: number; error: number }
}

const MonitorContainer = styled(Box, {
  display: 'flex',
  flexDirection: 'column',
  gap: '$2',
  padding: '$3',
  backgroundColor: '$dndBlack/90',
  borderRadius: '$md',
  border: '1px solid $gray800',
  backdropFilter: 'blur(8px)',
  minWidth: '200px'
})

const MonitorHeader = styled(Box, {
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
  paddingBottom: '$2',
  borderBottom: '1px solid $gray800'
})

const MetricsGrid = styled(Box, {
  display: 'grid',
  gap: '$2',

  variants: {
    compact: {
      true: { gridTemplateColumns: '1fr 1fr' },
      false: { gridTemplateColumns: '1fr' }
    }
  }
})

const defaultThresholds: PerformanceThresholds = {
  fps: { warning: 45, error: 30 },
  frameTime: { warning: 20, error: 33 },
  memory: { warning: 50 * 1024 * 1024, error: 100 * 1024 * 1024 }, // 50MB / 100MB
  objectCount: { warning: 500, error: 1000 }
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = React.memo(({
  performance,
  showAll = false,
  compact = false,
  thresholds = defaultThresholds
}) => {
  const formatMemory = (bytes: number): { value: number; unit: string } => {
    if (bytes >= 1024 * 1024) {
      return { value: bytes / (1024 * 1024), unit: 'MB' }
    }
    if (bytes >= 1024) {
      return { value: bytes / 1024, unit: 'KB' }
    }
    return { value: bytes, unit: 'B' }
  }

  const memory = formatMemory(performance.memoryUsage)
  const cachePercentage = performance.cacheHitRatio * 100

  return (
    <MonitorContainer>
      <MonitorHeader>
        <Activity size={16} color="var(--colors-dndRed)" />
        <Text size="sm" weight="semibold" color="gray100">
          Performance
        </Text>
      </MonitorHeader>

      <MetricsGrid compact={compact}>
        {/* FPS - Always shown */}
        <PerformanceMetric
          label="FPS"
          value={performance.fps}
          unit=""
          warningThreshold={thresholds.fps.warning}
          errorThreshold={thresholds.fps.error}
          precision={0}
          showBar={true}
          maxValue={60}
        />

        {/* Frame Time - Always shown */}
        <PerformanceMetric
          label="Frame"
          value={performance.frameTime}
          unit="ms"
          warningThreshold={thresholds.frameTime.warning}
          errorThreshold={thresholds.frameTime.error}
          precision={1}
          showBar={true}
          maxValue={33}
        />

        {/* Object Count - Show if showAll or many objects */}
        {(showAll || performance.objectCount > 50) && (
          <PerformanceMetric
            label="Objects"
            value={performance.objectCount}
            unit=""
            warningThreshold={thresholds.objectCount.warning}
            errorThreshold={thresholds.objectCount.error}
            precision={0}
            showBar={showAll}
            maxValue={1000}
          />
        )}

        {/* Visible Objects - Show if showAll */}
        {showAll && (
          <PerformanceMetric
            label="Visible"
            value={performance.visibleObjectCount}
            unit=""
            precision={0}
          />
        )}

        {/* Memory Usage - Show if showAll or high usage */}
        {(showAll || performance.memoryUsage > 10 * 1024 * 1024) && (
          <PerformanceMetric
            label="Memory"
            value={memory.value}
            unit={memory.unit}
            warningThreshold={memory.unit === 'MB' ? 50 : undefined}
            errorThreshold={memory.unit === 'MB' ? 100 : undefined}
            precision={memory.unit === 'MB' ? 1 : 0}
            showBar={showAll}
            maxValue={memory.unit === 'MB' ? 200 : undefined}
          />
        )}

        {/* Cache Hit Ratio - Show if showAll */}
        {showAll && (
          <PerformanceMetric
            label="Cache"
            value={cachePercentage}
            unit="%"
            warningThreshold={70}
            errorThreshold={50}
            precision={0}
            showBar={true}
            maxValue={100}
          />
        )}
      </MetricsGrid>

      {/* Performance status summary */}
      {!compact && (
        <Box display="flex" alignItems="center" justifyContent="center" gap="$2">
          {performance.fps < thresholds.fps.error ? (
            <Text size="xs" color="error">
              Performance Issues
            </Text>
          ) : performance.fps < thresholds.fps.warning ? (
            <Text size="xs" color="warning">
              Performance Warning
            </Text>
          ) : (
            <Text size="xs" color="success">
              Performance Good
            </Text>
          )}
        </Box>
      )}
    </MonitorContainer>
  )
})

PerformanceMonitor.displayName = 'PerformanceMonitor'