/**
 * GridSystem Molecule - Complete grid rendering with sub-grids
 *
 * Renders a complete grid system using GridLine atoms with support
 * for major/minor lines, sub-grids, and D&D-appropriate styling.
 */

import React, { useMemo } from 'react'
import { Group } from 'react-konva'
import { GridLine } from '../../atoms'
import type { Rectangle, Point } from '@/types/geometry'
import type { GridConfig } from '../../../services'

export interface GridSystemProps {
  readonly config: GridConfig
  readonly viewport: Rectangle
  readonly offset?: Point
  readonly onGridClick?: (position: Point) => void
}

export const GridSystem: React.FC<GridSystemProps> = React.memo(({
  config,
  viewport,
  offset = { x: 0, y: 0 },
  onGridClick
}) => {
  const gridLines = useMemo(() => {
    if (!config.visible || config.size <= 0) return { major: [], minor: [] }

    const lines: {
      major: Array<{ start: Point; end: Point; key: string }>
      minor: Array<{ start: Point; end: Point; key: string }>
    } = { major: [], minor: [] }

    // Calculate visible grid bounds with padding for smooth scrolling
    const padding = config.size * 2
    const startX = Math.floor((viewport.x - padding - offset.x) / config.size) * config.size + offset.x
    const endX = Math.ceil((viewport.x + viewport.width + padding - offset.x) / config.size) * config.size + offset.x
    const startY = Math.floor((viewport.y - padding - offset.y) / config.size) * config.size + offset.y
    const endY = Math.ceil((viewport.y + viewport.height + padding - offset.y) / config.size) * config.size + offset.y

    if (config.type === 'square') {
      // Vertical lines
      for (let x = startX; x <= endX; x += config.size) {
        const isMajor = x % (config.size * 5) === 0 // Every 5th line is major
        const line = {
          start: { x, y: viewport.y - padding },
          end: { x, y: viewport.y + viewport.height + padding },
          key: `v-${x}`
        }

        if (isMajor) {
          lines.major.push(line)
        } else {
          lines.minor.push(line)
        }
      }

      // Horizontal lines
      for (let y = startY; y <= endY; y += config.size) {
        const isMajor = y % (config.size * 5) === 0 // Every 5th line is major
        const line = {
          start: { x: viewport.x - padding, y },
          end: { x: viewport.x + viewport.width + padding, y },
          key: `h-${y}`
        }

        if (isMajor) {
          lines.major.push(line)
        } else {
          lines.minor.push(line)
        }
      }

      // Sub-grid lines if configured
      if (config.subGrid && config.subGrid.visible && config.subGrid.subdivisions > 1) {
        const subSize = config.size / config.subGrid.subdivisions

        // Sub-grid vertical lines
        for (let x = startX; x <= endX; x += subSize) {
          if (x % config.size !== 0) { // Don't duplicate main grid lines
            lines.minor.push({
              start: { x, y: viewport.y - padding },
              end: { x, y: viewport.y + viewport.height + padding },
              key: `sub-v-${x}`
            })
          }
        }

        // Sub-grid horizontal lines
        for (let y = startY; y <= endY; y += subSize) {
          if (y % config.size !== 0) { // Don't duplicate main grid lines
            lines.minor.push({
              start: { x: viewport.x - padding, y },
              end: { x: viewport.x + viewport.width + padding, y },
              key: `sub-h-${y}`
            })
          }
        }
      }
    }

    // TODO: Implement hex, triangle, diamond grid types

    return lines
  }, [config, viewport, offset])

  const handleClick = (e: any) => {
    if (!onGridClick) return

    const stage = e.target.getStage()
    const point = stage.getPointerPosition()
    if (point) {
      onGridClick(point)
    }
  }

  if (!config.visible) return null

  return (
    <Group
      onClick={handleClick}
      listening={!!onGridClick}
    >
      {/* Minor/sub-grid lines */}
      {gridLines.minor.map(line => (
        <GridLine
          key={line.key}
          start={line.start}
          end={line.end}
          stroke={config.subGrid?.color || config.color}
          strokeWidth={config.subGrid?.strokeWidth || config.strokeWidth * 0.5}
          opacity={(config.subGrid?.opacity || config.opacity) * 0.6}
          _isMajor={false}
        />
      ))}

      {/* Major grid lines */}
      {gridLines.major.map(line => (
        <GridLine
          key={line.key}
          start={line.start}
          end={line.end}
          stroke={config.color}
          strokeWidth={config.strokeWidth}
          opacity={config.opacity}
          _isMajor={true}
        />
      ))}
    </Group>
  )
})

GridSystem.displayName = 'GridSystem'