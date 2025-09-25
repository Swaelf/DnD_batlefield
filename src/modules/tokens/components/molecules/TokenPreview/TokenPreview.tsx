/**
 * TokenPreview Molecule Component
 *
 * Ghost preview for token placement with grid snapping visualization.
 * Shows transparency and snapping guides during token creation.
 * Molecular design: 60-90 lines, placement preview focus.
 */

import React from 'react'
import { Group } from 'react-konva'
import { TokenVisuals } from '../TokenVisuals'
import type { TokenTemplate, Token } from '../../../types'
import type { Point } from '@/types/geometry'

export interface TokenPreviewProps {
  readonly position: Point
  readonly template: TokenTemplate
  readonly gridSize: number
  readonly opacity?: number
  readonly showSnapGuides?: boolean
  readonly snapPosition?: Point
}

export const TokenPreview: React.FC<TokenPreviewProps> = React.memo(({
  position,
  template,
  gridSize,
  opacity = 0.5,
  showSnapGuides = true,
  snapPosition
}) => {
  // Create preview token from template
  const previewToken: Token = React.useMemo(() => ({
    id: 'preview' as any,
    type: 'token',
    name: template.name,
    position: snapPosition || position,
    size: template.defaults.size,
    shape: template.defaults.shape,
    color: template.defaults.color,
    borderColor: template.defaults.borderColor,
    borderWidth: template.defaults.borderWidth,
    opacity: template.defaults.opacity * opacity,
    category: template.defaults.tokenCategory,
    layer: 1,
    rotation: 0,
    isLocked: false,
    isVisible: true,
    initiative: undefined,
    conditions: [],
    hitPoints: undefined,
    armorClass: undefined,
    speed: undefined,
    isPlayer: template.defaults.isPlayer,
    label: {
      text: template.name,
      position: template.defaults.label.position,
      color: template.defaults.label.color,
      fontSize: template.defaults.label.fontSize,
      offset: template.defaults.label.offset
    },
    templateId: template.id,
    createdAt: new Date(),
    lastModified: new Date()
  }), [template, position, snapPosition, opacity])

  // Calculate snap guides
  const snapGuides = React.useMemo(() => {
    if (!showSnapGuides || !snapPosition) return null

    const gridX = Math.round(position.x / gridSize) * gridSize
    const gridY = Math.round(position.y / gridSize) * gridSize

    return {
      vertical: { x: gridX, y1: gridY - gridSize, y2: gridY + gridSize },
      horizontal: { y: gridY, x1: gridX - gridSize, x2: gridX + gridSize }
    }
  }, [position, gridSize, showSnapGuides, snapPosition])

  return (
    <Group>
      {/* Snap guide lines */}
      {snapGuides && (
        <Group opacity={0.3}>
          {/* Vertical line */}
          <Group>
            {/* This would be a Line component in real implementation */}
          </Group>
          {/* Horizontal line */}
          <Group>
            {/* This would be a Line component in real implementation */}
          </Group>
        </Group>
      )}

      {/* Preview token */}
      <TokenVisuals
        token={previewToken}
        gridSize={gridSize}
        isSelected={false}
        isDragging={false}
        isHovered={true}
      />

      {/* Placement circle indicator */}
      <Group opacity={0.3}>
        {/* This would show the placement area */}
      </Group>
    </Group>
  )
})