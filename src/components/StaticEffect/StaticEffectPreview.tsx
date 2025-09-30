import React from 'react'
import { Group, Circle, Rect, Line as KonvaLine, Shape } from 'react-konva'
import type { StaticEffectTemplate } from './types'

type StaticEffectPreviewProps = {
  template: StaticEffectTemplate
  position: { x: number; y: number }
  visible: boolean
}

export const StaticEffectPreview: React.FC<StaticEffectPreviewProps> = ({
  template,
  position,
  visible
}) => {
  if (!visible) return null

  const rotation = template.rotation || 0

  const renderPreview = () => {
    switch (template.type) {
      case 'circle':
        return (
          <Circle
            x={position.x}
            y={position.y}
            radius={template.sizeProperties.radius || 50}
            fill={template.defaultColor}
            opacity={template.defaultOpacity * 0.7} // Slightly more transparent for preview
            stroke={template.defaultColor}
            strokeWidth={2}
            dash={[5, 5]} // Dashed border for preview indication
          />
        )

      case 'rectangle':
        const width = template.sizeProperties.width || 100
        const height = template.sizeProperties.height || 60
        return (
          <Rect
            x={position.x}
            y={position.y}
            width={width}
            height={height}
            fill={template.defaultColor}
            opacity={template.defaultOpacity * 0.7}
            stroke={template.defaultColor}
            strokeWidth={2}
            dash={[5, 5]}
            offsetX={width / 2}
            offsetY={height / 2}
            rotation={rotation}
          />
        )

      case 'cone':
        const length = template.sizeProperties.length || 80
        const angle = (template.sizeProperties.angle || 60) * Math.PI / 180
        const halfAngle = angle / 2
        return (
          <Shape
            x={position.x}
            y={position.y}
            sceneFunc={(context, shape) => {
              context.beginPath()
              context.moveTo(0, 0)
              context.lineTo(length, -length * Math.tan(halfAngle))
              context.lineTo(length, length * Math.tan(halfAngle))
              context.closePath()
              context.fillStrokeShape(shape)
            }}
            fill={template.defaultColor}
            opacity={template.defaultOpacity * 0.7}
            stroke={template.defaultColor}
            strokeWidth={2}
            dash={[5, 5]}
            rotation={rotation}
          />
        )

      case 'line':
        const lineLength = template.sizeProperties.length || 100
        return (
          <KonvaLine
            x={position.x}
            y={position.y}
            points={[0, 0, lineLength, 0]}
            stroke={template.defaultColor}
            strokeWidth={template.sizeProperties.width || 10}
            opacity={template.defaultOpacity * 0.7}
            dash={[5, 5]}
            lineCap="round"
            rotation={rotation}
          />
        )

      default:
        return null
    }
  }

  return <Group listening={false}>{renderPreview()}</Group>
}