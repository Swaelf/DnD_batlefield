import { useState, useCallback } from 'react'

export const usePopover = (initialOpen = false) => {
  const [open, setOpen] = useState(initialOpen)

  const show = useCallback(() => setOpen(true), [])
  const hide = useCallback(() => setOpen(false), [])
  const toggle = useCallback(() => setOpen(prev => !prev), [])

  return {
    open,
    setOpen,
    show,
    hide,
    toggle,
  }
}
