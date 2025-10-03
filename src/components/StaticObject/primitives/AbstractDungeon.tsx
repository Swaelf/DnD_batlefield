import { memo, useMemo } from 'react'
import { Group, Rect, Circle, Path, Line as KonvaLine } from 'react-konva'
import { dungeonVariants } from '../variants/dungeonVariants'
import type { AbstractDungeonProps } from '../types'
import { isRectangleSize, isCircleSize } from '../types'

export const AbstractDungeon = memo(({
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
}: AbstractDungeonProps) => {
  const variantConfig = dungeonVariants[variant]

  const shadowConfig = useMemo(() => ({
    shadowColor: '#000000',
    shadowBlur: isSelected ? 10 : 4,
    shadowOpacity: variantConfig.shadowIntensity || 0.6,
    shadowOffset: { x: 4, y: 6 }
  }), [isSelected, variantConfig.shadowIntensity])

  const strokeConfig = useMemo(() => ({
    stroke: isSelected ? '#C9AD6A' : variantConfig.stroke,
    strokeWidth: isSelected ? 3 : (variant === 'trap' ? 1.5 : 2)
  }), [isSelected, variantConfig.stroke, variant])

  const commonProps = useMemo(() => ({
    draggable: isDraggable,
    onClick,
    onDragEnd,
    onContextMenu,
    onMouseEnter,
    onMouseLeave
  }), [isDraggable, onClick, onDragEnd, onContextMenu, onMouseEnter, onMouseLeave])

  if (variant === 'trap' && isRectangleSize(size)) {
    return (
      <Group {...commonProps} x={position.x} y={position.y} rotation={rotation}>
        <Rect width={size.width} height={size.height} fill="rgba(255,0,0,0.1)" {...strokeConfig} dash={[5, 5]} cornerRadius={2} {...shadowConfig} />
        <Path data={`M ${size.width * 0.5} ${size.height * 0.25} L ${size.width * 0.75} ${size.height * 0.5} L ${size.width * 0.5} ${size.height * 0.75} L ${size.width * 0.25} ${size.height * 0.5} Z`} fill="#922610" listening={false} />
        <Path data={`M ${size.width * 0.5} ${size.height * 0.35} L ${size.width * 0.65} ${size.height * 0.5} L ${size.width * 0.5} ${size.height * 0.65} L ${size.width * 0.35} ${size.height * 0.5} Z`} fill="rgba(0,0,0,0.3)" listening={false} />
        <Circle x={size.width * 0.5} y={size.height * 0.5} radius={Math.min(size.width, size.height) * 0.05} fill="#C9AD6A" listening={false} />
        <KonvaLine points={[size.width * 0.15, size.height * 0.15, size.width * 0.85, size.height * 0.85]} stroke="rgba(255,0,0,0.2)" strokeWidth={1} listening={false} />
        <KonvaLine points={[size.width * 0.85, size.height * 0.15, size.width * 0.15, size.height * 0.85]} stroke="rgba(255,0,0,0.2)" strokeWidth={1} listening={false} />
      </Group>
    )
  }

  if (variant === 'altar' && isRectangleSize(size)) {
    return (
      <Group {...commonProps} x={position.x} y={position.y} rotation={rotation}>
        <Rect y={size.height * 0.4} width={size.width} height={size.height * 0.6} fill={variantConfig.color} cornerRadius={2} {...shadowConfig} />
        <Rect y={size.height * 0.2} width={size.width * 1.2} height={size.height * 0.2} fill={variantConfig.color} cornerRadius={1} listening={false} />
        <Rect x={size.width * 0.05} y={size.height * 0.22} width={size.width * 1.1} height={size.height * 0.05} fill="rgba(255,255,255,0.2)" listening={false} />
        <Path data={`M ${size.width * 0.5} 0 L ${size.width * 0.7} ${size.height * 0.2} L ${size.width * 0.3} ${size.height * 0.2} Z`} fill="#C9AD6A" listening={false} />
        <Path data={`M ${size.width * 0.5} ${size.height * 0.03} L ${size.width * 0.65} ${size.height * 0.18} L ${size.width * 0.35} ${size.height * 0.18} Z`} fill="rgba(255,255,255,0.3)" listening={false} />
        <Circle x={size.width * 0.5} y={size.height * 0.1} radius={Math.min(size.width, size.height) * 0.05} fill="rgba(255,255,255,0.4)" listening={false} />
      </Group>
    )
  }

  if (variant === 'brazier' && isCircleSize(size)) {
    return (
      <Group {...commonProps} x={position.x} y={position.y} rotation={rotation}>
        <Rect x={size.radius * 0.7} y={size.radius * 0.4} width={size.radius * 0.6} height={size.radius * 1.2} fill={variantConfig.color} listening={false} />
        <Rect x={size.radius * 0.75} y={size.radius * 0.4} width={size.radius * 0.1} height={size.radius * 1.2} fill="rgba(255,255,255,0.2)" listening={false} />
        <Circle radius={size.radius * 0.9} fill="#DC143C" opacity={0.8} {...shadowConfig} />
        <Circle radius={size.radius * 0.7} fill="#FF4500" opacity={0.6} listening={false} />
        <Circle radius={size.radius * 0.5} fill="#FFD700" opacity={0.8} listening={false} />
        <Path data={`M 0 ${-size.radius * 0.6} L ${size.radius * 0.2} ${-size.radius * 0.2} L ${-size.radius * 0.2} ${-size.radius * 0.2} Z`} fill="#FFD700" listening={false} />
        <Path data={`M ${-size.radius * 0.4} ${-size.radius * 0.5} L ${-size.radius * 0.2} ${-size.radius * 0.1} L ${-size.radius * 0.6} ${-size.radius * 0.1} Z`} fill="#FFA500" listening={false} />
        <Path data={`M ${size.radius * 0.4} ${-size.radius * 0.5} L ${size.radius * 0.6} ${-size.radius * 0.1} L ${size.radius * 0.2} ${-size.radius * 0.1} Z`} fill="#FFA500" listening={false} />
      </Group>
    )
  }

  if (variant === 'statue' && isCircleSize(size)) {
    return (
      <Group {...commonProps} x={position.x} y={position.y} rotation={rotation}>
        <Circle radius={size.radius} fill={variantConfig.color} {...strokeConfig} {...shadowConfig} />
        <Circle radius={size.radius * 0.7} fill="rgba(0,0,0,0.2)" listening={false} />
        <Circle y={-size.radius * 0.3} radius={size.radius * 0.35} fill="rgba(255,255,255,0.1)" listening={false} />
        <Rect x={-size.radius * 0.15} y={size.radius * 0.2} width={size.radius * 0.3} height={size.radius * 0.8} fill={variantConfig.color} listening={false} />
      </Group>
    )
  }

  return null
})

AbstractDungeon.displayName = 'AbstractDungeon'
