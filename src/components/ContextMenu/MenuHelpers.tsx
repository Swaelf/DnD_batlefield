import {
  Copy,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Layers,
  Move,
  ArrowUp,
  ArrowDown,
  MousePointer2,
  ZoomIn,
  Grid3X3
} from '@/utils/optimizedIcons'
import type { ContextMenuItem } from './ContextMenuItem'

// Predefined context menu configurations
export const createObjectContextMenu = (
  _objectId: string,
  _objectType: string,
  isVisible: boolean,
  isLocked: boolean,
  _isSelected: boolean,
  callbacks: {
    onCopy: () => void
    onDelete: () => void
    onDuplicate: () => void
    onToggleVisibility: () => void
    onToggleLock: () => void
    onMoveToLayer: () => void
    onBringForward: () => void
    onSendBackward: () => void
    onEdit?: () => void
  }
): ContextMenuItem[] => [
  {
    id: 'copy',
    label: 'Copy',
    icon: <Copy />,
    shortcut: 'Ctrl+C',
    onClick: callbacks.onCopy
  },
  {
    id: 'duplicate',
    label: 'Duplicate',
    icon: <Copy />,
    shortcut: 'Ctrl+D',
    onClick: callbacks.onDuplicate
  },
  {
    id: 'edit',
    label: 'Edit Properties',
    icon: <Edit />,
    onClick: callbacks.onEdit || (() => {}),
    disabled: !callbacks.onEdit,
    divider: true
  },
  {
    id: 'visibility',
    label: isVisible ? 'Hide' : 'Show',
    icon: isVisible ? <EyeOff /> : <Eye />,
    onClick: callbacks.onToggleVisibility
  },
  {
    id: 'lock',
    label: isLocked ? 'Unlock' : 'Lock',
    icon: isLocked ? <Unlock /> : <Lock />,
    onClick: callbacks.onToggleLock
  },
  {
    id: 'layer',
    label: 'Move to Layer...',
    icon: <Layers />,
    onClick: callbacks.onMoveToLayer,
    divider: true
  },
  {
    id: 'bring-forward',
    label: 'Bring Forward',
    icon: <ArrowUp />,
    shortcut: 'Ctrl+]',
    onClick: callbacks.onBringForward
  },
  {
    id: 'send-backward',
    label: 'Send Backward',
    icon: <ArrowDown />,
    shortcut: 'Ctrl+[',
    onClick: callbacks.onSendBackward,
    divider: true
  },
  {
    id: 'delete',
    label: 'Delete',
    icon: <Trash2 />,
    shortcut: 'Del',
    onClick: callbacks.onDelete
  }
]

export const createCanvasContextMenu = (
  callbacks: {
    onPaste: () => void
    onSelectAll: () => void
    onClearSelection: () => void
    onResetZoom: () => void
    onToggleGrid: () => void
  }
): ContextMenuItem[] => [
  {
    id: 'paste',
    label: 'Paste',
    icon: <Move />,
    shortcut: 'Ctrl+V',
    onClick: callbacks.onPaste
  },
  {
    id: 'select-all',
    label: 'Select All',
    icon: <MousePointer2 />,
    shortcut: 'Ctrl+A',
    onClick: callbacks.onSelectAll,
    divider: true
  },
  {
    id: 'clear-selection',
    label: 'Clear Selection',
    icon: <MousePointer2 />,
    shortcut: 'Esc',
    onClick: callbacks.onClearSelection
  },
  {
    id: 'reset-zoom',
    label: 'Reset Zoom',
    icon: <ZoomIn />,
    shortcut: 'Ctrl+0',
    onClick: callbacks.onResetZoom,
    divider: true
  },
  {
    id: 'toggle-grid',
    label: 'Toggle Grid',
    icon: <Grid3X3 />,
    shortcut: 'G',
    onClick: callbacks.onToggleGrid
  }
]
