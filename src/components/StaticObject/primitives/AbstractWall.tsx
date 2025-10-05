import { memo, useMemo } from 'react'
import { Group, Rect } from 'react-konva'
import { wallVariants } from '../variants/wallVariants'
import type { AbstractWallProps } from '../types'

export const AbstractWall = memo(({
  variant,
  position,
  size,
  rotation,
  isSelected,
  isDraggable,
  onClick,
  onDragEnd,
  onContextMenu,
  onMouseEnter,
  onMouseLeave
}: AbstractWallProps) => {
  const variantConfig = wallVariants[variant]

  const shadowConfig = useMemo(() => ({
    shadowColor: '#000000',
    shadowBlur: isSelected ? 10 : 4,
    shadowOpacity: variantConfig.shadowIntensity || 0.6,
    shadowOffset: { x: 4, y: 6 }
  }), [isSelected, variantConfig.shadowIntensity])

  const strokeConfig = useMemo(() => ({
    stroke: isSelected ? '#C9AD6A' : variantConfig.stroke,
    strokeWidth: isSelected ? 3 : 2
  }), [isSelected, variantConfig.stroke])

  const commonProps = useMemo(() => ({
    draggable: isDraggable,
    onClick,
    onDragEnd,
    onContextMenu,
    onMouseEnter,
    onMouseLeave
  }), [isDraggable, onClick, onDragEnd, onContextMenu, onMouseEnter, onMouseLeave])

  return (
    <Group {...commonProps} x={position.x} y={position.y}>
      <Rect
        width={size.width}
        height={size.height}
        rotation={rotation}
        offsetX={size.width / 2}
        offsetY={size.height / 2}
        x={size.width / 2}
        y={size.height / 2}
        fill={variantConfig.color}
        {...strokeConfig}
        cornerRadius={2}
        {...shadowConfig}
      />
      {/* Brick pattern (only for brick and stone variants) */}
      {(variant === 'brick' || variant === 'stone') && (
        <>
          <Rect
            rotation={rotation}
            offsetX={size.width * 0.225}
            offsetY={0.5}
            x={size.width * 0.225}
            y={size.height * 0.25}
            width={size.width * 0.45}
            height={1}
            fill="rgba(0,0,0,0.2)"
            listening={false}
          />
          <Rect
            rotation={rotation}
            offsetX={size.width * 0.225}
            offsetY={0.5}
            x={size.width * 0.775}
            y={size.height * 0.25}
            width={size.width * 0.45}
            height={1}
            fill="rgba(0,0,0,0.2)"
            listening={false}
          />
          <Rect
            rotation={rotation}
            offsetX={size.width * 0.225}
            offsetY={0.5}
            x={size.width * 0.225}
            y={size.height * 0.75}
            width={size.width * 0.45}
            height={1}
            fill="rgba(0,0,0,0.2)"
            listening={false}
          />
          <Rect
            rotation={rotation}
            offsetX={size.width * 0.225}
            offsetY={0.5}
            x={size.width * 0.775}
            y={size.height * 0.75}
            width={size.width * 0.45}
            height={1}
            fill="rgba(0,0,0,0.2)"
            listening={false}
          />
        </>
      )}
    </Group>
  )
})

AbstractWall.displayName = 'AbstractWall'
