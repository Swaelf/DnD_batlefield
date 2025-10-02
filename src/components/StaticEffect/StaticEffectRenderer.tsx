import { type FC } from 'react'
import { Group, Circle, Rect, Wedge } from 'react-konva'
import type { StaticEffectTemplate } from './types'

type StaticEffectRendererProps = {
  effect: {
    id: string
    template: StaticEffectTemplate
    position: { x: number; y: number }
    rotation: number
    color: string
    opacity: number
  }
  gridSize?: number
  onSelect?: (id: string) => void
  onRemove?: (id: string) => void
}

export const StaticEffectRenderer: FC<StaticEffectRendererProps> = ({
  effect,
  onSelect,
}) => {
  const { template, position, rotation, color, opacity } = effect

  // Render static effect shape
  const renderShape = () => {
    const baseProps = {
      fill: color,
      opacity: opacity,
      stroke: color,
      strokeWidth: 2,
      strokeOpacity: 0.3
    }

    switch (template.type) {
      case 'circle':
        return (
          <Circle
            {...baseProps}
            radius={template.sizeProperties.radius || 50}
          />
        )

      case 'rectangle':
        const width = template.sizeProperties.width || 100
        const height = template.sizeProperties.height || 60
        return (
          <Rect
            {...baseProps}
            width={width}
            height={height}
            offsetX={width / 2}
            offsetY={height / 2}
          />
        )

      case 'cone':
        const length = template.sizeProperties.length || 80
        const angle = template.sizeProperties.angle || 60
        return (
          <Wedge
            {...baseProps}
            radius={length}
            angle={angle}
            rotation={-angle / 2}
          />
        )

      case 'line':
        const lineLength = template.sizeProperties.length || 100
        const lineWidth = template.sizeProperties.width || 10
        return (
          <Rect
            {...baseProps}
            width={lineLength}
            height={lineWidth}
            offsetY={lineWidth / 2}
          />
        )

      default:
        return <Circle {...baseProps} radius={50} />
    }
  }

  return (
    <Group
      x={position.x}
      y={position.y}
      rotation={rotation}
      onClick={() => onSelect?.(effect.id)}
      onTap={() => onSelect?.(effect.id)}
    >
      {renderShape()}
    </Group>
  )
}