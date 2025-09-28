/**
 * Modal - Overlay dialog component for focused interactions
 * Handles focus trapping, backdrop clicks, and accessibility
 */

import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { X } from 'lucide-react'
import { styled } from '@/foundation/theme'
import { modalVariants } from '@/foundation/theme/variants'
import { Box } from '../../atoms/Box'
import { IconButton } from '../IconButton'

export type ModalProps = {
  open: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  size?: keyof typeof modalVariants.size
  showCloseButton?: boolean
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
}

const Backdrop = styled(Box, {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.75)',
  zIndex: '$modalBackdrop',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '$md'
})

const ModalContent = styled(Box, {
  backgroundColor: '$surface',
  borderRadius: '$lg',
  boxShadow: '$xl',
  border: '1px solid $border',
  position: 'relative',
  zIndex: '$modal',
  maxHeight: '90vh',
  overflow: 'auto',

  variants: modalVariants,

  defaultVariants: {
    size: 'md'
  }
})

const ModalHeader = styled(Box, {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '$lg',
  borderBottom: '1px solid $border'
})

const ModalBody = styled(Box, {
  padding: '$lg'
})

const CloseButton = styled(IconButton, {
  position: 'absolute',
  top: '$md',
  right: '$md'
})

const ModalTitle = styled(Box, {
  fontSize: '$lg',
  fontWeight: '$semibold',
  margin: 0
})

export const Modal = ({
  open,
  onClose,
  children,
  title,
  size = 'md',
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true
}: ModalProps) => {
  // Handle escape key
  useEffect(() => {
    if (!open || !closeOnEscape) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, closeOnEscape, onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
    return undefined
  }, [open])

  if (!open) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnBackdrop) {
      onClose()
    }
  }

  return (
    <Backdrop onClick={handleBackdropClick}>
      <ModalContent
        size={size}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {showCloseButton && (
          <CloseButton
            icon={X}
            aria-label="Close modal"
            variant="ghost"
            size="sm"
            onClick={onClose}
          />
        )}

        {title && (
          <ModalHeader>
            <ModalTitle as="h2" id="modal-title">
              {title}
            </ModalTitle>
          </ModalHeader>
        )}

        <ModalBody>
          {children}
        </ModalBody>
      </ModalContent>
    </Backdrop>
  )
}