import { memo, useMemo } from 'react'
import { Group, Rect, Circle, Path, Line as KonvaLine } from 'react-konva'
import { furnitureVariants } from '../variants/furnitureVariants'
import type { AbstractFurnitureProps } from '../types'
import { isRectangleSize, isCircleSize } from '../types'

export const AbstractFurniture = memo(({
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
}: AbstractFurnitureProps) => {
  const variantConfig = furnitureVariants[variant]

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

  if (variant === 'table' && isRectangleSize(size)) {
    return (
      <Group {...commonProps} x={position.x} y={position.y} rotation={rotation}>
        <Rect width={size.width} height={size.height} fill={variantConfig.color} {...strokeConfig} cornerRadius={2} {...shadowConfig} />
        <Rect x={size.width * 0.05} y={size.height * 0.1} width={size.width * 0.9} height={size.height * 0.15} fill="rgba(255,255,255,0.2)" cornerRadius={1} listening={false} />
        <Rect x={size.width * 0.1} y={size.height * 0.9} width={size.width * 0.1} height={size.height * 0.3} fill={variantConfig.color} listening={false} />
        <Rect x={size.width * 0.8} y={size.height * 0.9} width={size.width * 0.1} height={size.height * 0.3} fill={variantConfig.color} listening={false} />
      </Group>
    )
  }

  if (variant === 'chair' && isRectangleSize(size)) {
    return (
      <Group {...commonProps} x={position.x} y={position.y} rotation={rotation}>
        <Rect x={size.width * 0.1} y={-size.height * 0.2} width={size.width * 0.8} height={size.height * 0.25} fill={variantConfig.color} cornerRadius={1} listening={false} />
        <Rect width={size.width} height={size.height} fill={variantConfig.color} {...strokeConfig} cornerRadius={2} {...shadowConfig} />
        <Rect x={size.width * 0.05} y={size.height * 0.1} width={size.width * 0.9} height={size.height * 0.15} fill="rgba(255,255,255,0.2)" cornerRadius={1} listening={false} />
        <Rect x={size.width * 0.15} y={size.height * 0.9} width={size.width * 0.12} height={size.height * 0.3} fill={variantConfig.color} listening={false} />
        <Rect x={size.width * 0.73} y={size.height * 0.9} width={size.width * 0.12} height={size.height * 0.3} fill={variantConfig.color} listening={false} />
      </Group>
    )
  }

  if (variant === 'chest' && isRectangleSize(size)) {
    return (
      <Group {...commonProps} x={position.x} y={position.y} rotation={rotation}>
        <Rect width={size.width} height={size.height} fill={variantConfig.color} {...strokeConfig} cornerRadius={3} {...shadowConfig} />
        <Path data={`M 0 0 Q ${size.width / 2} ${-size.height * 0.35}, ${size.width} 0`} fill={variantConfig.color} stroke="rgba(0,0,0,0.4)" strokeWidth={1.5} listening={false} />
        <Path data={`M ${size.width * 0.15} ${-size.height * 0.2} Q ${size.width / 2} ${-size.height * 0.3}, ${size.width * 0.85} ${-size.height * 0.2}`} stroke="rgba(255,255,255,0.2)" strokeWidth={2} fill="none" listening={false} />
        <Rect x={size.width * 0.05} y={size.height * 0.05} width={size.width * 0.12} height={size.height * 0.12} fill="rgba(0,0,0,0.3)" cornerRadius={1} listening={false} />
        <Rect x={size.width * 0.83} y={size.height * 0.05} width={size.width * 0.12} height={size.height * 0.12} fill="rgba(0,0,0,0.3)" cornerRadius={1} listening={false} />
        <Rect x={size.width * 0.05} y={size.height * 0.83} width={size.width * 0.12} height={size.height * 0.12} fill="rgba(0,0,0,0.3)" cornerRadius={1} listening={false} />
        <Rect x={size.width * 0.83} y={size.height * 0.83} width={size.width * 0.12} height={size.height * 0.12} fill="rgba(0,0,0,0.3)" cornerRadius={1} listening={false} />
        <Rect x={size.width * 0.05} y={size.height * 0.25} width={size.width * 0.9} height={size.height * 0.06} fill="rgba(0,0,0,0.35)" cornerRadius={1} listening={false} />
        <Rect x={size.width * 0.05} y={size.height * 0.69} width={size.width * 0.9} height={size.height * 0.06} fill="rgba(0,0,0,0.3)" cornerRadius={1} listening={false} />
        <Rect x={size.width * 0.38} y={size.height * 0.42} width={size.width * 0.24} height={size.height * 0.35} fill="#C9AD6A" cornerRadius={2} listening={false} />
        <Rect x={size.width * 0.38} y={size.height * 0.42} width={size.width * 0.24} height={size.height * 0.35} fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth={1} cornerRadius={2} listening={false} />
        <Circle x={size.width * 0.5} y={size.height * 0.55} radius={Math.min(size.width, size.height) * 0.08} fill="rgba(0,0,0,0.6)" listening={false} />
        <Rect x={size.width * 0.485} y={size.height * 0.57} width={size.width * 0.03} height={size.height * 0.1} fill="rgba(0,0,0,0.6)" listening={false} />
        <Circle x={size.width * 0.48} y={size.height * 0.52} radius={Math.min(size.width, size.height) * 0.03} fill="rgba(255,255,255,0.4)" listening={false} />
      </Group>
    )
  }

  if (variant === 'barrel' && isCircleSize(size)) {
    return (
      <Group {...commonProps} x={position.x} y={position.y} rotation={rotation}>
        <Circle radius={size.radius} fill={variantConfig.color} {...strokeConfig} {...shadowConfig} />
        <Circle radius={size.radius * 0.9} fill="rgba(0,0,0,0.2)" listening={false} />
        <KonvaLine points={[-size.radius, 0, size.radius, 0]} stroke="rgba(0,0,0,0.4)" strokeWidth={2} listening={false} />
        <KonvaLine points={[-size.radius * 0.9, -size.radius * 0.4, size.radius * 0.9, -size.radius * 0.4]} stroke="rgba(0,0,0,0.3)" strokeWidth={1.5} listening={false} />
        <KonvaLine points={[-size.radius * 0.9, size.radius * 0.4, size.radius * 0.9, size.radius * 0.4]} stroke="rgba(0,0,0,0.3)" strokeWidth={1.5} listening={false} />
        <Circle y={-size.radius * 0.7} radius={size.radius * 0.3} fill="rgba(255,255,255,0.1)" listening={false} />
      </Group>
    )
  }

  return null
})

AbstractFurniture.displayName = 'AbstractFurniture'
