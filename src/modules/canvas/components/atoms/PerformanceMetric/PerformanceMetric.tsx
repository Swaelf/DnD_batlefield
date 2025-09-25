/**
 * PerformanceMetric Atom - Individual performance indicator
 *
 * Displays a single performance metric with visual indicator
 * and color-coded status based on performance thresholds.
 */

import React from 'react'
import { Box, Text } from '@/components/ui'
import { styled } from '@/styles/theme.config'

export interface PerformanceMetricProps {
  readonly label: string
  readonly value: number
  readonly unit: string
  readonly warningThreshold?: number
  readonly errorThreshold?: number
  readonly precision?: number
  readonly showBar?: boolean
  readonly maxValue?: number
}

const MetricContainer = styled(Box, {
  display: 'flex',
  flexDirection: 'column',
  gap: '$1',
  padding: '$2',
  backgroundColor: '$gray900/60',
  borderRadius: '$sm',
  border: '1px solid $gray800',
  minWidth: '80px'
})

const MetricHeader = styled(Box, {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '$1'
})

const MetricLabel = styled(Text, {
  fontSize: '$xs',
  color: '$gray400',
  fontWeight: '$medium',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
})

const MetricValue = styled(Text, {
  fontSize: '$sm',
  fontFamily: '$mono',
  fontWeight: '$bold',

  variants: {
    status: {
      good: { color: '$success' },
      warning: { color: '$warning' },
      error: { color: '$error' },
      neutral: { color: '$gray100' }
    }
  }
})

const StatusIndicator = styled(Box, {
  width: '$2',
  height: '$2',
  borderRadius: '50%',

  variants: {
    status: {
      good: { backgroundColor: '$success' },
      warning: { backgroundColor: '$warning' },
      error: { backgroundColor: '$error' },
      neutral: { backgroundColor: '$gray600' }
    }
  }
})

const PerformanceBar = styled(Box, {
  width: '100%',
  height: '4px',
  backgroundColor: '$gray800',
  borderRadius: '$xs',
  overflow: 'hidden'
})

const PerformanceBarFill = styled(Box, {
  height: '100%',
  borderRadius: '$xs',
  transition: 'all 0.3s ease',

  variants: {
    status: {
      good: { backgroundColor: '$success' },
      warning: { backgroundColor: '$warning' },
      error: { backgroundColor: '$error' },
      neutral: { backgroundColor: '$gray600' }
    }
  }
})

export const PerformanceMetric: React.FC<PerformanceMetricProps> = React.memo(({
  label,
  value,
  unit,
  warningThreshold,
  errorThreshold,
  precision = 1,
  showBar = false,
  maxValue = 100
}) => {
  const getStatus = (): 'good' | 'warning' | 'error' | 'neutral' => {
    if (errorThreshold !== undefined && value >= errorThreshold) return 'error'
    if (warningThreshold !== undefined && value >= warningThreshold) return 'warning'
    if (warningThreshold !== undefined || errorThreshold !== undefined) return 'good'
    return 'neutral'
  }

  const formatValue = (val: number): string => {
    if (precision === 0) return Math.round(val).toString()
    return val.toFixed(precision)
  }

  const status = getStatus()
  const percentage = Math.min((value / maxValue) * 100, 100)

  return (
    <MetricContainer>
      <MetricHeader>
        <MetricLabel>{label}</MetricLabel>
        <StatusIndicator status={status} />
      </MetricHeader>

      <MetricValue status={status}>
        {formatValue(value)} {unit}
      </MetricValue>

      {showBar && (
        <PerformanceBar>
          <PerformanceBarFill
            status={status}
            css={{ width: `${percentage}%` }}
          />
        </PerformanceBar>
      )}
    </MetricContainer>
  )
})

PerformanceMetric.displayName = 'PerformanceMetric'