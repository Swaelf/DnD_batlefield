import { useState, type FC } from 'react'
import { Trash2, RotateCw } from '@/utils/optimizedIcons'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Button } from '@/components/primitives/ButtonVE'
import { RotationIndicator } from '@/components/ui/RotationIndicator'
import useMapStore from '@/store/mapStore'

type MultiSelectPropertiesProps = {
  selectedCount: number
  onDelete: () => void
}

export const MultiSelectProperties: FC<MultiSelectPropertiesProps> = ({
  selectedCount,
  onDelete
}) => {
  const [relativeRotation, setRelativeRotation] = useState(0)
  const selectedObjects = useMapStore(state => state.selectedObjects)
  const currentMap = useMapStore(state => state.currentMap)
  const updateObject = useMapStore(state => state.updateObject)

  const handleBatchRotation = (angle: number) => {
    setRelativeRotation(angle)

    // Apply relative rotation to all selected objects
    if (angle !== 0) {
      selectedObjects.forEach(objId => {
        const obj = currentMap?.objects.find(o => o.id === objId)
        if (obj) {
          const currentRotation = obj.rotation || 0
          const newRotation = (currentRotation + angle) % 360
          updateObject(objId, { rotation: newRotation })
        }
      })

      // Reset the control after applying
      setTimeout(() => setRelativeRotation(0), 100)
    }
  }

  const handleAlignRotation = (targetAngle: number) => {
    // Set all selected objects to the same rotation
    selectedObjects.forEach(objId => {
      updateObject(objId, { rotation: targetAngle })
    })
  }

  const handleResetRotation = () => {
    // Reset all selected objects to 0 rotation
    selectedObjects.forEach(objId => {
      updateObject(objId, { rotation: 0 })
    })
  }

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Selection info */}
      <Box
        style={{
          padding: '12px',
          backgroundColor: 'var(--colors-gray900)',
          borderRadius: '6px',
          border: '1px solid var(--colors-gray700)'
        }}
      >
        <Text style={{ fontSize: '14px', color: 'var(--colors-gray300)' }}>
          {selectedCount} objects selected
        </Text>
      </Box>

      {/* Batch Rotation Controls */}
      <Box
        style={{
          padding: '16px',
          backgroundColor: 'var(--colors-gray900)',
          borderRadius: '6px',
          border: '1px solid var(--colors-gray700)',
          borderTop: '2px solid var(--colors-secondary)'
        }}
      >
        <Box style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <RotateCw size={16} />
          <Text
            variant="body"
            size="sm"
            style={{
              margin: 0,
              fontWeight: '500',
              color: 'var(--colors-gray200)'
            }}
          >
            Batch Rotation
          </Text>
        </Box>

        {/* Rotation Control */}
        <Box style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <RotationIndicator
            value={relativeRotation}
            onChange={handleBatchRotation}
            label="Relative Rotation"
            size={70}
          />
        </Box>

        {/* Quick Actions */}
        <Box style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Text
            variant="label"
            size="sm"
            style={{
              display: 'block',
              marginBottom: '4px',
              color: 'var(--colors-gray400)',
              fontWeight: '500'
            }}
          >
            Quick Actions
          </Text>

          <Box style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAlignRotation(0)}
              style={{ flex: 1, minWidth: '60px' }}
            >
              Align 0°
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAlignRotation(90)}
              style={{ flex: 1, minWidth: '60px' }}
            >
              Align 90°
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAlignRotation(180)}
              style={{ flex: 1, minWidth: '60px' }}
            >
              Align 180°
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAlignRotation(270)}
              style={{ flex: 1, minWidth: '60px' }}
            >
              Align 270°
            </Button>
          </Box>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetRotation}
            style={{ width: '100%', marginTop: '8px' }}
          >
            <RotateCw size={14} />
            Reset All Rotations
          </Button>
        </Box>
      </Box>

      {/* Batch Actions */}
      <Box
        style={{
          padding: '16px',
          backgroundColor: 'var(--colors-gray900)',
          borderRadius: '6px',
          border: '1px solid var(--colors-gray700)'
        }}
      >
        <Text
          variant="label"
          size="sm"
          style={{
            display: 'block',
            marginBottom: '12px',
            color: 'var(--colors-gray400)',
            fontWeight: '500'
          }}
        >
          Batch Actions
        </Text>

        <Box style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Trash2 size={16} />
            Delete Selected
          </Button>
        </Box>
      </Box>
    </Box>
  )
}