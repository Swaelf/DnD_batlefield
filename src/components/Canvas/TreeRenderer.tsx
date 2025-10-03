/**
 * TreeRenderer - Optimized tree rendering with canvas caching
 *
 * Performance Optimization:
 * - Before: 12 trees × 4 circles = 48 Konva nodes
 * - After: 12 trees × 1 cached image = 12 nodes (75% reduction)
 * - Expected gain: +3-5 fps
 */

import { memo, useMemo, useRef, useEffect } from 'react'
import { Group, Circle, Image } from 'react-konva'
import type { Shape } from '@/types/map'

type TreeRendererProps = {
  shape: Shape
  isSelected: boolean
  commonProps: {
    x: number
    y: number
    fill: string
    stroke: string
    strokeWidth: number
    opacity: number
    rotation: number
    draggable: boolean
    onClick?: any
    onDragStart?: any
    onDragMove?: any
    onDragEnd?: any
    onContextMenu?: any
  }
}

// 🚀 PERFORMANCE: Cache tree images by configuration
const treeImageCache = new Map<string, HTMLImageElement>()

const TreeRendererComponent = ({ shape, isSelected, commonProps }: TreeRendererProps) => {
  const imageRef = useRef<any>(null)

  // Calculate tree properties
  const validRadius = shape.radius || (shape.width ? shape.width / 2 : 30)
  const isFlowering = shape.fill?.includes('#FFB6C1') || shape.fill?.includes('#FF69B4')
  const isAutumn = shape.fill?.includes('#CD853F') || shape.fill?.includes('#DC143C')
  const isDead = shape.fill?.includes('#8B7D6B')

  // 🚀 PERFORMANCE: Create cache key from tree properties
  const cacheKey = useMemo(() => {
    return `tree_${validRadius}_${shape.fill}_${isDead ? 'dead' : ''}_${isFlowering ? 'flower' : ''}_${isAutumn ? 'autumn' : ''}`
  }, [validRadius, shape.fill, isDead, isFlowering, isAutumn])

  // 🚀 PERFORMANCE: Generate or retrieve cached tree image
  const treeImage = useMemo(() => {
    // Check cache first
    if (treeImageCache.has(cacheKey)) {
      return treeImageCache.get(cacheKey)!
    }

    // Create offscreen canvas for rendering
    const size = validRadius * 2.4 // Enough for shadow effect
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')!

    const centerX = size / 2
    const centerY = size / 2

    // Render tree layers to canvas (same as original)

    // 1. Outer shadow/canopy effect
    ctx.fillStyle = shape.fill || '#10B981'
    ctx.globalAlpha = 0.15
    ctx.beginPath()
    ctx.arc(centerX, centerY, validRadius * 1.2, 0, Math.PI * 2)
    ctx.fill()

    // 2. Main tree circle with dashed border
    ctx.globalAlpha = commonProps.opacity
    ctx.fillStyle = shape.fill || '#10B981'
    ctx.strokeStyle = shape.stroke || '#10B981'
    ctx.lineWidth = (commonProps.strokeWidth || 2) * 1.5

    // Create dash pattern
    const dashPattern = isDead ? [5, 5] : [3, 2]
    ctx.setLineDash(dashPattern)

    ctx.beginPath()
    ctx.arc(centerX, centerY, validRadius, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    // Reset line dash
    ctx.setLineDash([])

    // 3. Inner texture circle for depth
    ctx.globalAlpha = isDead ? 0.2 : 0.3
    ctx.fillStyle = shape.fill || '#10B981'
    ctx.beginPath()
    ctx.arc(centerX, centerY, validRadius * 0.7, 0, Math.PI * 2)
    ctx.fill()

    // 4. Special effects for flowering/autumn trees
    if (isFlowering || isAutumn) {
      ctx.globalAlpha = 0.4
      ctx.fillStyle = isFlowering ? '#FFC0CB' : '#FF8C00'
      ctx.beginPath()
      ctx.arc(
        centerX + validRadius * 0.2,
        centerY - validRadius * 0.2,
        validRadius * 0.4,
        0,
        Math.PI * 2
      )
      ctx.fill()
    }

    // Convert to image
    const img = new window.Image()
    img.src = canvas.toDataURL()

    // Cache for reuse
    treeImageCache.set(cacheKey, img)

    return img
  }, [cacheKey, validRadius, shape.fill, shape.stroke, commonProps.opacity, commonProps.strokeWidth, isDead, isFlowering, isAutumn])

  // Track image loading
  const [imageLoaded, setImageLoaded] = React.useState(false)

  useEffect(() => {
    if (treeImage.complete) {
      setImageLoaded(true)
    } else {
      treeImage.onload = () => setImageLoaded(true)
    }
  }, [treeImage])

  const size = validRadius * 2.4

  return (
    <Group
      x={commonProps.x}
      y={commonProps.y}
      rotation={commonProps.rotation}
      draggable={commonProps.draggable}
      onClick={commonProps.onClick}
      onDragStart={commonProps.onDragStart}
      onDragMove={commonProps.onDragMove}
      onDragEnd={commonProps.onDragEnd}
      onContextMenu={commonProps.onContextMenu}
    >
      {/* Cached tree image */}
      {imageLoaded && (
        <Image
          ref={imageRef}
          image={treeImage}
          x={-size / 2}
          y={-size / 2}
          width={size}
          height={size}
          listening={true}
        />
      )}

      {/* Fallback: Show simple circle while image loads */}
      {!imageLoaded && (
        <Circle
          radius={validRadius}
          fill={commonProps.fill}
          stroke={commonProps.stroke}
          strokeWidth={commonProps.strokeWidth}
          opacity={commonProps.opacity}
        />
      )}

      {/* Selection indicator */}
      {isSelected && (
        <Circle
          radius={validRadius + 4}
          stroke="#C9AD6A"
          strokeWidth={3}
          dash={[8, 4]}
          listening={false}
        />
      )}
    </Group>
  )
}

// Fix: Import React for useState
import React from 'react'

export const TreeRenderer = memo(TreeRendererComponent, (prev, next) => {
  // Custom comparison for optimal re-rendering
  return (
    prev.shape.id === next.shape.id &&
    prev.isSelected === next.isSelected &&
    prev.shape.position.x === next.shape.position.x &&
    prev.shape.position.y === next.shape.position.y &&
    prev.shape.fill === next.shape.fill &&
    prev.shape.opacity === next.shape.opacity
  )
})

TreeRenderer.displayName = 'TreeRenderer'
