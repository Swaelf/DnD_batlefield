/**
 * MeasurementOverlay - Real-time D&D distance measurement display
 *
 * Provides visual feedback for measurement tool with D&D 5e distance calculations,
 * grid-aware snapping, and professional measurement display.
 */

import React from 'react'
import { Line, Text as KonvaText, Circle, Group } from 'react-konva'
import type { Point } from '@/types/geometry'
import {
  calculateDnDDistance,
  formatDistance,
  calculatePathDistance,
  DEFAULT_GRID_SIZE_PIXELS
} from '@/utils/measurement'

export interface MeasurementOverlayProps {
  /** Measurement points for the current measurement */
  points: Point[]
  /** Current mouse position for preview */
  currentPoint?: Point
  /** Grid size in pixels for distance calculations */
  gridSize?: number
  /** Whether to show individual segment distances */
  showSegmentDistances?: boolean
  /** Whether to show total path distance */
  showTotalDistance?: boolean
  /** Measurement line color */
  lineColor?: string
  /** Text color for distance labels */
  textColor?: string
}

export const MeasurementOverlay: React.FC<MeasurementOverlayProps> = ({
  points,
  currentPoint,
  gridSize = DEFAULT_GRID_SIZE_PIXELS,
  showSegmentDistances = true,
  showTotalDistance = true,
  lineColor = '#F59E0B', // Amber-500 for measurement lines
  textColor = '#FFFFFF'
}) => {
  // Don't render if no points
  if (points.length === 0) return null

  const allPoints = currentPoint ? [...points, currentPoint] : points

  // Create line points array for Konva
  const linePoints: number[] = []
  allPoints.forEach(point => {
    linePoints.push(point.x, point.y)
  })

  // Calculate total distance
  const totalDistance = calculatePathDistance(allPoints, gridSize)

  return (
    <Group>
      {/* Measurement line */}
      {allPoints.length >= 2 && (
        <Line
          points={linePoints}
          stroke={lineColor}
          strokeWidth={2}
          dash={[10, 5]}
          lineCap="round"
          lineJoin="round"
          listening={false}
        />
      )}

      {/* Point markers */}
      {allPoints.map((point, index) => (
        <Circle
          key={`point-${index}`}
          x={point.x}
          y={point.y}
          radius={4}
          fill={lineColor}
          stroke={'#FFFFFF'}
          strokeWidth={2}
          listening={false}
        />
      ))}

      {/* Segment distance labels */}
      {showSegmentDistances && allPoints.length >= 2 && allPoints.map((point, index) => {
        if (index === 0) return null

        const prevPoint = allPoints[index - 1]
        const distance = calculateDnDDistance(prevPoint, point, gridSize)
        const midPoint = {
          x: (prevPoint.x + point.x) / 2,
          y: (prevPoint.y + point.y) / 2
        }

        return (
          <Group key={`segment-${index}`}>
            {/* Background for better readability */}
            <KonvaText
              x={midPoint.x - 25}
              y={midPoint.y - 20}
              text={formatDistance(distance)}
              fontSize={12}
              fontFamily="'Segoe UI', Arial, sans-serif"
              fontStyle="bold"
              fill="#000000"
              align="center"
              width={50}
              listening={false}
              offsetX={-2}
              offsetY={-2}
            />
            {/* Main text */}
            <KonvaText
              x={midPoint.x - 25}
              y={midPoint.y - 20}
              text={formatDistance(distance)}
              fontSize={12}
              fontFamily="'Segoe UI', Arial, sans-serif"
              fontStyle="bold"
              fill={textColor}
              align="center"
              width={50}
              listening={false}
            />
          </Group>
        )
      })}

      {/* Total distance label */}
      {showTotalDistance && allPoints.length >= 2 && (
        <Group>
          {/* Position at the end point */}
          {(() => {
            const endPoint = allPoints[allPoints.length - 1]
            const labelX = endPoint.x + 15
            const labelY = endPoint.y - 30

            return (
              <>
                {/* Background rectangle for better readability */}
                <KonvaText
                  x={labelX}
                  y={labelY}
                  text={`Total: ${formatDistance(totalDistance)}`}
                  fontSize={14}
                  fontFamily="'Segoe UI', Arial, sans-serif"
                  fontStyle="bold"
                  fill="#000000"
                  padding={4}
                  listening={false}
                  offsetX={-2}
                  offsetY={-2}
                />
                {/* Main text */}
                <KonvaText
                  x={labelX}
                  y={labelY}
                  text={`Total: ${formatDistance(totalDistance)}`}
                  fontSize={14}
                  fontFamily="'Segoe UI', Arial, sans-serif"
                  fontStyle="bold"
                  fill={textColor}
                  padding={4}
                  listening={false}
                />
              </>
            )
          })()}
        </Group>
      )}
    </Group>
  )
}

export default React.memo(MeasurementOverlay)