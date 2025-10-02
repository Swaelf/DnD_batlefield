import { useState, memo, type FC, type ChangeEvent, type KeyboardEvent } from 'react'
import { Box } from '@/components/primitives/BoxVE'
import { Button } from '@/components/primitives/ButtonVE'
import { Input } from '@/components/ui/Input'

type LayerCreateFormProps = {
  isVisible: boolean
  onClose: () => void
  onCreate: (name: string) => void
}

const LayerCreateFormComponent: FC<LayerCreateFormProps> = ({
  isVisible,
  onClose,
  onCreate
}) => {
  const [layerName, setLayerName] = useState('')

  if (!isVisible) {
    return null
  }

  const handleCreate = () => {
    if (layerName.trim()) {
      onCreate(layerName.trim())
      setLayerName('')
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCreate()
    }
    if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <Box
      style={{
        marginBottom: '12px',
        padding: '8px',
        backgroundColor: 'var(--colors-gray800)',
        borderRadius: '4px'
      }}
    >
      <Input
        type="text"
        placeholder="Layer name..."
        value={layerName}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setLayerName(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{
          width: '100%',
          marginBottom: '8px',
          fontSize: '12px'
        }}
        autoFocus
      />
      <Box style={{ display: 'flex', gap: '8px' }}>
        <Button
          variant="primary"
          onClick={handleCreate}
          style={{
            fontSize: '12px',
            padding: '4px 8px',
            height: 'auto'
          }}
        >
          Create
        </Button>
        <Button
          variant="ghost"
          onClick={onClose}
          style={{
            fontSize: '12px',
            padding: '4px 8px',
            height: 'auto'
          }}
        >
          Cancel
        </Button>
      </Box>
    </Box>
  )
}

export const LayerCreateForm = memo(LayerCreateFormComponent)
LayerCreateForm.displayName = 'LayerCreateForm'
