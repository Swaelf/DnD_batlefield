import { memo, useMemo } from 'react'
import { Group, Rect, Circle, Ellipse, Path } from 'react-konva'
import { natureVariants } from '../variants/natureVariants'
import type { AbstractNatureProps } from '../types'
import { isRectangleSize, isCircleSize } from '../types'

export const AbstractNature = memo(({
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
}: AbstractNatureProps) => {
  const variantConfig = natureVariants[variant]

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

  if (variant === 'tree' && isCircleSize(size)) {
    return (
      <Group {...commonProps} x={position.x} y={position.y} rotation={rotation}>
        <Circle radius={size.radius * 1.2} fill={variantConfig.color} opacity={0.15} listening={false} />
        <Circle
          radius={size.radius}
          fill={variantConfig.color}
          {...strokeConfig}
          strokeWidth={(strokeConfig.strokeWidth || 2) * 1.5}
          dash={[3, 2]}
          {...shadowConfig}
        />
        <Circle radius={size.radius * 0.7} fill={variantConfig.color} opacity={0.3} listening={false} />
        <Circle x={-size.radius * 0.3} y={size.radius * 0.1} radius={size.radius * 0.4} fill="rgba(0,0,0,0.15)" listening={false} />
        <Circle x={size.radius * 0.3} y={size.radius * 0.1} radius={size.radius * 0.4} fill="rgba(0,0,0,0.15)" listening={false} />
        <Circle x={0} y={-size.radius * 0.2} radius={size.radius * 0.4} fill="rgba(255,255,255,0.15)" listening={false} />
        <Rect x={-size.radius * 0.1} y={size.radius * 0.6} width={size.radius * 0.2} height={size.radius * 0.8} fill="#8B4513" listening={false} />
        <Rect x={-size.radius * 0.05} y={size.radius * 0.6} width={size.radius * 0.05} height={size.radius * 0.8} fill="rgba(0,0,0,0.3)" listening={false} />
      </Group>
    )
  }

  if (variant === 'bush' && isCircleSize(size)) {
    return (
      <Group {...commonProps} x={position.x} y={position.y} rotation={rotation}>
        <Circle x={-size.radius * 0.4} y={size.radius * 0.3} radius={size.radius * 0.8} fill={variantConfig.color} opacity={0.9} listening={false} />
        <Circle x={size.radius * 0.4} y={size.radius * 0.3} radius={size.radius * 0.8} fill={variantConfig.color} opacity={0.9} listening={false} />
        <Circle
          radius={size.radius * 0.7}
          fill={variantConfig.color}
          {...strokeConfig}
          {...shadowConfig}
        />
        <Circle x={-size.radius * 0.4} y={size.radius * 0.3} radius={size.radius * 0.5} fill="rgba(0,0,0,0.2)" listening={false} />
        <Circle x={size.radius * 0.4} y={size.radius * 0.3} radius={size.radius * 0.5} fill="rgba(0,0,0,0.2)" listening={false} />
        <Circle x={0} y={-size.radius * 0.1} radius={size.radius * 0.3} fill="rgba(255,255,255,0.2)" listening={false} />
      </Group>
    )
  }

  if (variant === 'rock' && isCircleSize(size)) {
    return (
      <Group {...commonProps} x={position.x} y={position.y} rotation={rotation}>
        <Ellipse y={size.radius * 0.8} radiusX={size.radius * 1.4} radiusY={size.radius * 0.2} fill="rgba(0,0,0,0.3)" listening={false} />
        <Circle
          radius={size.radius}
          fill={variantConfig.color}
          {...strokeConfig}
          {...shadowConfig}
        />
        <Path data="M 0 -0.8 L 0.6 0.2 L -0.6 0.2 Z" fill="rgba(0,0,0,0.2)" scaleX={size.radius} scaleY={size.radius} listening={false} />
        <Path data="M -0.4 -0.4 L 0 -0.8 L 0.4 -0.4 Z" fill="rgba(255,255,255,0.15)" scaleX={size.radius} scaleY={size.radius} listening={false} />
      </Group>
    )
  }

  if (variant === 'water' && isRectangleSize(size)) {
    return (
      <Group {...commonProps} x={position.x} y={position.y} rotation={rotation}>
        <Rect
          width={size.width}
          height={size.height}
          fill={variantConfig.color}
          {...strokeConfig}
          opacity={variantConfig.opacity}
          cornerRadius={4}
          {...shadowConfig}
        />
        <Path
          data={`M 0 ${size.height * 0.2} Q ${size.width * 0.25} ${size.height * 0.15}, ${size.width * 0.5} ${size.height * 0.2} T ${size.width} ${size.height * 0.2}`}
          stroke="rgba(255,255,255,0.3)"
          strokeWidth={1}
          listening={false}
        />
        <Path
          data={`M 0 ${size.height * 0.5} Q ${size.width * 0.2} ${size.height * 0.45}, ${size.width * 0.4} ${size.height * 0.5} T ${size.width * 0.8} ${size.height * 0.5} T ${size.width} ${size.height * 0.5}`}
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={1}
          listening={false}
        />
        <Circle x={size.width * 0.3} y={size.height * 0.4} radius={Math.min(size.width, size.height) * 0.02} fill="rgba(255,255,255,0.4)" listening={false} />
        <Circle x={size.width * 0.7} y={size.height * 0.6} radius={Math.min(size.width, size.height) * 0.015} fill="rgba(255,255,255,0.3)" listening={false} />
      </Group>
    )
  }

  return null
})

AbstractNature.displayName = 'AbstractNature'
