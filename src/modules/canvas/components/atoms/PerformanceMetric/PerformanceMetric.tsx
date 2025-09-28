/**
 * PerformanceMetric Atom - Individual performance indicator
 *
 * Displays a single performance metric with visual indicator
 * and color-coded status based on performance thresholds.
 */

import React from 'react'
import { Box, Text } from '@/components/primitives'

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

// Component uses primitive components with style prop for styling

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

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'good': return 'var(--success)'
      case 'warning': return 'var(--warning)'
      case 'error': return 'var(--error)'
      default: return 'var(--gray-100)'
    }
  }

  const getStatusBgColor = (status: string): string => {
    switch (status) {
      case 'good': return 'var(--success)'
      case 'warning': return 'var(--warning)'
      case 'error': return 'var(--error)'
      default: return 'var(--gray-600)'
    }
  }

  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        padding: '8px',
        backgroundColor: 'rgba(17, 24, 39, 0.6)',
        borderRadius: '4px',
        border: '1px solid var(--gray-800)',
        minWidth: '80px'
      }}
    >
      {/* Header */}
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '4px'
        }}
      >
        <Text
          style={{
            fontSize: '12px',
            color: 'var(--gray-400)',
            fontWeight: '500',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
        >
          {label}
        </Text>
        <Box
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: getStatusBgColor(status)
          }}
        />
      </Box>

      {/* Value */}
      <Text
        style={{
          fontSize: '14px',
          fontFamily: 'monospace',
          fontWeight: 'bold',
          color: getStatusColor(status)
        }}
      >
        {formatValue(value)} {unit}
      </Text>

      {/* Performance Bar */}
      {showBar && (
        <Box
          style={{
            width: '100%',
            height: '4px',
            backgroundColor: 'var(--gray-800)',
            borderRadius: '2px',
            overflow: 'hidden'
          }}
        >
          <Box
            style={{
              height: '100%',
              borderRadius: '2px',
              transition: 'all 0.3s ease',
              backgroundColor: getStatusBgColor(status),
              width: `${percentage}%`
            }}
          />
        </Box>
      )}
    </Box>
  )
})

PerformanceMetric.displayName = 'PerformanceMetric'