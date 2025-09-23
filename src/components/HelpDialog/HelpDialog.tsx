import React from 'react'
import { Modal, ModalBody, ModalFooter, Button, Box, Text, Heading } from '@/components/ui'
import { Kbd } from '@/components/ui/Kbd'

type HelpDialogProps = {
  isOpen: boolean
  onClose: () => void
}

type ShortcutGroup = {
  title: string
  shortcuts: {
    keys: string[]
    description: string
  }[]
}

const shortcutGroups: ShortcutGroup[] = [
  {
    title: 'Tools',
    shortcuts: [
      { keys: ['V'], description: 'Select tool' },
      { keys: ['R'], description: 'Rectangle tool' },
      { keys: ['C'], description: 'Circle tool' },
      { keys: ['T'], description: 'Token tool' },
      { keys: ['O'], description: 'Static Objects tool' },
      { keys: ['S'], description: 'Spell Effects tool' },
      { keys: ['H'], description: 'Pan tool' },
      { keys: ['M'], description: 'Measure tool' },
      { keys: ['X'], description: 'Text tool' },
      { keys: ['E'], description: 'Eraser tool' },
      { keys: ['Space'], description: 'Temporary pan (hold)' }
    ]
  },
  {
    title: 'Canvas Navigation',
    shortcuts: [
      { keys: ['Scroll'], description: 'Zoom in/out' },
      { keys: ['Middle Click + Drag'], description: 'Pan view' },
      { keys: ['Shift + Drag'], description: 'Alternative pan' },
      { keys: ['Ctrl', '0'], description: 'Reset view to 100%' },
      { keys: ['G'], description: 'Toggle grid visibility' },
      { keys: ['Shift', 'G'], description: 'Toggle snap to grid' }
    ]
  },
  {
    title: 'Object Manipulation',
    shortcuts: [
      { keys: ['Delete'], description: 'Delete selected objects' },
      { keys: ['Backspace'], description: 'Delete selected objects' },
      { keys: ['Escape'], description: 'Clear selection' },
      { keys: ['Ctrl', 'A'], description: 'Select all' },
      { keys: ['Ctrl', 'D'], description: 'Duplicate selected' },
      { keys: ['Shift + Click'], description: 'Add to selection' }
    ]
  },
  {
    title: 'File Operations',
    shortcuts: [
      { keys: ['Ctrl', 'S'], description: 'Save map' },
      { keys: ['Ctrl', 'Z'], description: 'Undo' },
      { keys: ['Ctrl', 'Shift', 'Z'], description: 'Redo' },
      { keys: ['Ctrl', 'O'], description: 'Open map' },
      { keys: ['Ctrl', 'N'], description: 'New map' }
    ]
  },
  {
    title: 'Help',
    shortcuts: [
      { keys: ['?'], description: 'Show this help dialog' },
      { keys: ['F1'], description: 'Show help' }
    ]
  }
]

export const HelpDialog: React.FC<HelpDialogProps> = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title="Keyboard Shortcuts"
      showCloseButton
    >
      <ModalBody scrollable>
        <Box display="flex" flexDirection="column" gap="6">
          {shortcutGroups.map((group) => (
            <Box key={group.title}>
              <Heading
                level={4}
                css={{
                  color: '$secondary',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '$3',
                  fontSize: '$sm',
                  fontWeight: '$bold'
                }}
              >
                {group.title}
              </Heading>
              <Box display="flex" flexDirection="column" gap="2">
                {group.shortcuts.map((shortcut, index) => (
                  <Box
                    key={index}
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    css={{
                      paddingY: '$2',
                      paddingX: '$3',
                      borderRadius: '$md',
                      '&:hover': {
                        backgroundColor: 'rgba($colors$gray800, 0.5)',
                      },
                      transition: '$fast',
                    }}
                  >
                    <Box display="flex" alignItems="center" gap="2">
                      {shortcut.keys.map((key, keyIndex) => (
                        <React.Fragment key={keyIndex}>
                          {keyIndex > 0 && (
                            <Text size="xs" color="gray500">+</Text>
                          )}
                          <Kbd>{key}</Kbd>
                        </React.Fragment>
                      ))}
                    </Box>
                    <Text size="sm" color="gray400" css={{ marginLeft: '$4' }}>
                      {shortcut.description}
                    </Text>
                  </Box>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      </ModalBody>

      <ModalFooter>
        <Box display="flex" alignItems="center" justifyContent="space-between" width="full">
          <Box display="flex" alignItems="center" gap="2">
            <Text size="xs" color="gray500">
              Press <Kbd size="sm">?</Kbd> anytime to show this help
            </Text>
          </Box>
          <Button onClick={onClose} variant="primary">
            Close
          </Button>
        </Box>
      </ModalFooter>
    </Modal>
  )
}

