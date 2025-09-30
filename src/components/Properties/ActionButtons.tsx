import React, { memo } from 'react'
import { Eye, EyeOff, Copy, Trash2 } from '@/utils/optimizedIcons'
import {
  PanelSection,
  Button,
  Box
} from '@/components/ui'

type ActionButtonsProps = {
  isVisible: boolean
  onVisibilityToggle: () => void
  onDuplicate: () => void
  onDelete: () => void
}

const ActionButtonsComponent: React.FC<ActionButtonsProps> = ({
  isVisible,
  onVisibilityToggle,
  onDuplicate,
  onDelete
}) => {
  return (
    <PanelSection>
      <Box display="flex" flexDirection="column" gap={2}>
        <Button
          onClick={onVisibilityToggle}
          variant="ghost"
          fullWidth
          size="sm"
        >
          {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
          {isVisible ? 'Hide' : 'Show'}
        </Button>

        <Button
          onClick={onDuplicate}
          variant="ghost"
          fullWidth
          size="sm"
        >
          <Copy size={16} />
          Duplicate
        </Button>

        <Button
          onClick={onDelete}
          variant="destructive"
          fullWidth
          size="sm"
        >
          <Trash2 size={16} />
          Delete
        </Button>
      </Box>
    </PanelSection>
  )
}

export const ActionButtons = memo(ActionButtonsComponent)
ActionButtons.displayName = 'ActionButtons'