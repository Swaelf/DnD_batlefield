import { useEffect, useCallback, Fragment, type FC, type ReactNode, type MouseEvent } from 'react'
import { X, HelpCircle } from '@/utils/optimizedIcons'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Button } from '@/components/primitives/ButtonVE'

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

const KeyboardKey: FC<{ children: ReactNode }> = ({ children }) => (
  <Box
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4px 8px',
      backgroundColor: 'var(--colors-gray800)',
      border: '1px solid var(--colors-gray600)',
      borderRadius: '4px',
      fontSize: '12px',
      fontFamily: 'monospace',
      color: 'var(--colors-gray200)',
      minWidth: '24px',
      height: '24px'
    }}
  >
    <Text variant="body" size="xs" style={{ margin: 0, fontFamily: 'monospace' }}>
      {children}
    </Text>
  </Box>
)

export const HelpDialog: FC<HelpDialogProps> = ({ isOpen, onClose }) => {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }, [onClose])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
      }
    }
    return undefined
  }, [isOpen, handleKeyDown])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <Box
        style={{
          position: 'fixed',
          inset: '0',
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onClick={onClose}
      />

      {/* Dialog */}
      <Box
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1001,
          width: '90vw',
          maxWidth: '800px',
          maxHeight: '85vh',
          backgroundColor: 'var(--colors-dndBlack)',
          border: '1px solid var(--colors-gray700)',
          borderRadius: '12px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
          overflow: 'hidden'
        }}
        onClick={(e: MouseEvent) => e.stopPropagation()}
      >
        {/* Header */}
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid var(--colors-gray700)',
            backgroundColor: 'var(--colors-gray900)'
          }}
        >
          <Box style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <HelpCircle size={24} style={{ color: 'var(--colors-secondary)' }} />
            <Text
              variant="heading"
              size="lg"
              style={{
                margin: 0,
                color: 'var(--colors-gray100)',
                fontWeight: '600'
              }}
            >
              Keyboard Shortcuts
            </Text>
          </Box>
          <Button
            variant="ghost"
            onClick={onClose}
            style={{
              padding: '8px',
              color: 'var(--colors-gray400)',
              backgroundColor: 'transparent',
              border: 'none'
            }}
            onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.backgroundColor = 'var(--colors-gray800)'
              e.currentTarget.style.color = 'var(--colors-gray100)'
            }}
            onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = 'var(--colors-gray400)'
            }}
          >
            <X size={20} />
          </Button>
        </Box>

        {/* Body */}
        <Box
          style={{
            padding: '24px',
            maxHeight: 'calc(85vh - 140px)',
            overflowY: 'auto'
          }}
        >
          <Box style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {shortcutGroups.map((group) => (
              <Box key={group.title}>
                <Text
                  variant="heading"
                  size="sm"
                  style={{
                    color: 'var(--colors-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '16px',
                    margin: 0,
                    fontWeight: '600'
                  }}
                >
                  {group.title}
                </Text>
                <Box style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {group.shortcuts.map((shortcut, index) => (
                    <Box
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={(e: MouseEvent<HTMLDivElement>) => {
                        e.currentTarget.style.backgroundColor = 'rgba(75, 85, 99, 0.5)'
                      }}
                      onMouseLeave={(e: MouseEvent<HTMLDivElement>) => {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }}
                    >
                      <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {shortcut.keys.map((key, keyIndex) => (
                          <Fragment key={keyIndex}>
                            {keyIndex > 0 && (
                              <Text
                                variant="body"
                                size="xs"
                                style={{
                                  margin: 0,
                                  color: 'var(--colors-gray500)'
                                }}
                              >
                                +
                              </Text>
                            )}
                            <KeyboardKey>{key}</KeyboardKey>
                          </Fragment>
                        ))}
                      </Box>
                      <Text
                        variant="body"
                        size="sm"
                        style={{
                          margin: 0,
                          color: 'var(--colors-gray400)',
                          marginLeft: '16px'
                        }}
                      >
                        {shortcut.description}
                      </Text>
                    </Box>
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Footer */}
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            borderTop: '1px solid var(--colors-gray700)',
            backgroundColor: 'var(--colors-gray900)'
          }}
        >
          <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Text
              variant="body"
              size="xs"
              style={{
                margin: 0,
                color: 'var(--colors-gray500)'
              }}
            >
              Press <KeyboardKey>?</KeyboardKey> anytime to show this help
            </Text>
          </Box>
          <Button
            variant="primary"
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: 'var(--colors-secondary)',
              color: 'var(--colors-dndBlack)',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '500'
            }}
            onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.backgroundColor = 'var(--colors-gray300)'
            }}
            onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.backgroundColor = 'var(--colors-secondary)'
            }}
          >
            Close
          </Button>
        </Box>
      </Box>
    </>
  )
}

