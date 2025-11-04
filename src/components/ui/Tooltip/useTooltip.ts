import { useState } from 'react'

// Hook for controlled tooltips
export const useTooltip = (initialOpen = false) => {
  const [isOpen, setIsOpen] = useState(initialOpen)

  const openTooltip = () => setIsOpen(true)
  const closeTooltip = () => setIsOpen(false)
  const toggleTooltip = () => setIsOpen(!isOpen)

  return {
    isOpen,
    openTooltip,
    closeTooltip,
    toggleTooltip,
    tooltipProps: {
      open: isOpen,
      onOpenChange: setIsOpen,
    },
  }
}
