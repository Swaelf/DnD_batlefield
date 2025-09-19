import React from 'react'
import { X, Keyboard } from 'lucide-react'

interface HelpDialogProps {
  isOpen: boolean
  onClose: () => void
}

interface ShortcutGroup {
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
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-fadeIn"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] max-h-[80vh] bg-gray-900 border border-gray-700 rounded-lg shadow-2xl z-50 overflow-hidden animate-slideIn">
        {/* Header */}
        <div className="bg-gray-800 px-6 py-4 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Keyboard className="h-5 w-5 text-d20-gold" />
            <h2 className="text-xl font-bold text-white">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
          <div className="space-y-6">
            {shortcutGroups.map((group) => (
              <div key={group.title}>
                <h3 className="text-sm font-bold text-d20-gold uppercase tracking-wider mb-3">
                  {group.title}
                </h3>
                <div className="space-y-2">
                  {group.shortcuts.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-1.5 px-3 rounded hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {shortcut.keys.map((key, keyIndex) => (
                          <React.Fragment key={keyIndex}>
                            {keyIndex > 0 && (
                              <span className="text-gray-500 text-xs">+</span>
                            )}
                            <kbd className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs font-mono text-gray-300">
                              {key}
                            </kbd>
                          </React.Fragment>
                        ))}
                      </div>
                      <span className="text-sm text-gray-400 ml-4">
                        {shortcut.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-800 px-6 py-3 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Press <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-xs">?</kbd> anytime to show this help
            </p>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-d20-red hover:bg-red-800 text-white text-sm rounded transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

