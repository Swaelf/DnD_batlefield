import { type FC, useState, useEffect } from 'react'
import type { Shape } from '@/types'
import { EffectPropertiesPanel, type EffectProperties } from '@/components/Properties/EffectPropertiesPanel'

type StaticObjectPropertiesEditorProps = {
  staticObject: Shape
  onUpdate: (updates: Partial<Shape>) => void
}

/**
 * Reusable component for editing static object properties
 * Uses the same EffectPropertiesPanel as the StaticObjectLibrary for consistency
 */
export const StaticObjectPropertiesEditor: FC<StaticObjectPropertiesEditorProps> = ({
  staticObject,
  onUpdate
}) => {
  // Local state for properties that update immediately in the UI
  const [properties, setProperties] = useState<EffectProperties>({
    color: staticObject.fill || staticObject.fillColor || '#6B7280',
    opacity: staticObject.opacity || 1,
    rotation: staticObject.rotation || 0,
    dimensions: {
      radius: staticObject.radius || 30,
      width: staticObject.width || 100,
      height: staticObject.height || 60
    }
  })

  // Update local state when the selected object changes
  useEffect(() => {
    setProperties({
      color: staticObject.fill || staticObject.fillColor || '#6B7280',
      opacity: staticObject.opacity || 1,
      rotation: staticObject.rotation || 0,
      dimensions: {
        radius: staticObject.radius || 30,
        width: staticObject.width || 100,
        height: staticObject.height || 60
      }
    })
  }, [staticObject.id, staticObject.fill, staticObject.fillColor, staticObject.opacity, staticObject.rotation, staticObject.radius, staticObject.width, staticObject.height])

  const handlePropertiesChange = (newProperties: EffectProperties) => {
    setProperties(newProperties)

    // Build updates object based on shape type
    const updates: Partial<Shape> = {
      fill: newProperties.color,
      fillColor: newProperties.color,
      opacity: newProperties.opacity,
      rotation: newProperties.rotation
    }

    // Add dimension updates based on shape type
    if (staticObject.shapeType === 'circle') {
      updates.radius = newProperties.dimensions.radius
    } else if (staticObject.shapeType === 'rect' || staticObject.shapeType === 'rectangle') {
      updates.width = newProperties.dimensions.width
      updates.height = newProperties.dimensions.height
    }

    // Call the parent's update function
    onUpdate(updates)
  }

  // Determine the effect type based on shape type
  const effectType = staticObject.shapeType === 'circle' ? 'circle' : 'rectangle'

  return (
    <EffectPropertiesPanel
      effectType={effectType}
      properties={properties}
      onChange={handlePropertiesChange}
    />
  )
}