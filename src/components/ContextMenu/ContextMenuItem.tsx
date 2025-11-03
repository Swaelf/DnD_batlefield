import type { ReactNode } from 'react'

export interface ContextMenuItem {
  id: string
  label: string
  icon?: ReactNode
  shortcut?: string
  onClick: () => void
  disabled?: boolean
  divider?: boolean
}
