import { memo, useMemo } from 'react'
import { Group, Rect, Circle, Path } from 'react-konva'
import { structureVariants } from '../variants/structureVariants'
import type { AbstractStructureProps } from '../types'
import { isRectangleSize, isCircleSize } from '../types'

export const AbstractStructure = memo(({
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
}: AbstractStructureProps) => {
  const variantConfig = structureVariants[variant]

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

  if (variant === 'door' && isRectangleSize(size)) {
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
        <Group rotation={rotation} offsetX={size.width / 2} offsetY={size.height / 2} x={size.width / 2} y={size.height / 2}>
          <Rect x={size.width * 0.1} y={size.height * 0.05} width={size.width * 0.8} height={size.height * 0.4} fill="rgba(0,0,0,0.15)" cornerRadius={1} listening={false} />
          <Rect x={size.width * 0.1} y={size.height * 0.5} width={size.width * 0.8} height={size.height * 0.4} fill="rgba(0,0,0,0.15)" cornerRadius={1} listening={false} />
          <Circle x={size.width * 0.85} y={size.height * 0.5} radius={Math.min(size.width, size.height) * 0.05} fill="#C9AD6A" listening={false} />
        </Group>
      </Group>
    )
  }

  if (variant === 'pillar' && isCircleSize(size)) {
    return (
      <Group {...commonProps} x={position.x} y={position.y}>
        <Circle
          radius={size.radius}
          rotation={rotation}
          fill={variantConfig.color}
          {...strokeConfig}
          {...shadowConfig}
        />
        <Circle radius={size.radius * 0.6} fill="rgba(0,0,0,0.3)" listening={false} />
      </Group>
    )
  }

  if (variant === 'stairs' && isRectangleSize(size)) {
    const stepCount = 5
    const stepHeight = size.height / stepCount

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
        <Group rotation={rotation} offsetX={size.width / 2} offsetY={size.height / 2} x={size.width / 2} y={size.height / 2}>
          {Array.from({ length: stepCount }).map((_, i) => (
            <Rect
              key={i}
              y={i * stepHeight}
              width={size.width}
              height={stepHeight * 0.15}
              fill="rgba(0,0,0,0.2)"
              listening={false}
            />
          ))}
          <Path
            data={`M ${size.width * 0.5} ${size.height * 0.2}
                   L ${size.width * 0.7} ${size.height * 0.5}
                   L ${size.width * 0.6} ${size.height * 0.5}
                   L ${size.width * 0.6} ${size.height * 0.8}
                   L ${size.width * 0.4} ${size.height * 0.8}
                   L ${size.width * 0.4} ${size.height * 0.5}
                   L ${size.width * 0.3} ${size.height * 0.5} Z`}
            fill="rgba(255,255,255,0.3)"
            listening={false}
          />
        </Group>
      </Group>
    )
  }

  if (variant === 'spiral-stairs' && isCircleSize(size)) {
    return (
      <Group {...commonProps} x={position.x} y={position.y} rotation={rotation}>
        <Circle
          radius={size.radius}
          fill={variantConfig.color}
          {...strokeConfig}
          {...shadowConfig}
        />
        <Circle radius={size.radius * 0.75} fill="rgba(0,0,0,0.2)" listening={false} />
        <Path
          data={`M ${size.radius * 0} ${-size.radius * 0.95} Q ${size.radius * 0.7} ${-size.radius * 0.5}, ${size.radius * 0.95} ${size.radius * 0}`}
          stroke="rgba(255,255,255,0.3)"
          strokeWidth={2}
          fill="none"
          listening={false}
        />
        <Path
          data={`M ${size.radius * 0.95} ${size.radius * 0} Q ${size.radius * 0.5} ${size.radius * 0.7}, ${size.radius * 0} ${size.radius * 0.95}`}
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={2}
          fill="none"
          listening={false}
        />
        <Path
          data={`M ${size.radius * 0} ${size.radius * 0.95} Q ${-size.radius * 0.7} ${size.radius * 0.5}, ${-size.radius * 0.95} ${size.radius * 0}`}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={2}
          fill="none"
          listening={false}
        />
        <Circle radius={size.radius * 0.25} fill="rgba(0,0,0,0.4)" listening={false} />
      </Group>
    )
  }

  return null
})

AbstractStructure.displayName = 'AbstractStructure'
