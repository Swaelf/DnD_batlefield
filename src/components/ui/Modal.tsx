import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { styled, keyframes } from '@/styles/theme.config'
import type { ComponentProps } from '@/types'
import { Box } from '@/components/primitives'

// Animations
const fadeIn = keyframes({
  '0%': { opacity: 0 },
  '100%': { opacity: 1 },
})

const slideIn = keyframes({
  '0%': {
    opacity: 0,
    transform: 'translate(-50%, -50%) scale(0.95)',
  },
  '100%': {
    opacity: 1,
    transform: 'translate(-50%, -50%) scale(1)',
  },
})

const slideOut = keyframes({
  '0%': {
    opacity: 1,
    transform: 'translate(-50%, -50%) scale(1)',
  },
  '100%': {
    opacity: 0,
    transform: 'translate(-50%, -50%) scale(0.95)',
  },
})

// Overlay/Backdrop
const ModalOverlay = styled('div', {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  zIndex: '$modal',
  animation: `${fadeIn} 150ms ease-out`,
  backdropFilter: 'blur(2px)',

  variants: {
    blur: {
      none: { backdropFilter: 'none' },
      sm: { backdropFilter: 'blur(2px)' },
      md: { backdropFilter: 'blur(4px)' },
      lg: { backdropFilter: 'blur(8px)' },
    },
  },

  defaultVariants: {
    blur: 'sm',
  },
})

// Modal Content Container
const ModalContent = styled(Box, {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: '$modal',
  backgroundColor: '$surface',
  border: '1px solid $gray700',
  borderRadius: '$xl',
  boxShadow: '$2xl',
  animation: `${slideIn} 200ms ease-out`,
  maxHeight: '90vh',
  maxWidth: '90vw',

  // Focus management
  '&:focus': {
    outline: 'none',
  },

  variants: {
    size: {
      sm: {
        width: '400px',
        maxWidth: '90vw',
      },
      md: {
        width: '500px',
        maxWidth: '90vw',
      },
      lg: {
        width: '700px',
        maxWidth: '90vw',
      },
      xl: {
        width: '900px',
        maxWidth: '95vw',
      },
      full: {
        width: '95vw',
        height: '95vh',
      },
      auto: {
        width: 'auto',
        minWidth: '300px',
      },
    },

    padding: {
      none: { padding: 0 },
      sm: { padding: '$4' },
      md: { padding: '$6' },
      lg: { padding: '$8' },
    },

    centered: {
      true: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      },
    },
  },

  defaultVariants: {
    size: 'md',
    padding: 'md',
  },
})

const ModalHeader = styled(Box, {
  borderBottom: '1px solid $gray700',
  marginBottom: '$6',
  paddingBottom: '$4',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
})

const ModalTitle = styled('h2', {
  margin: 0,
  fontSize: '$xl',
  fontWeight: '$semibold',
  color: '$gray100',
  fontFamily: '$dnd',
})

const ModalCloseButton = styled('button', {
  all: 'unset',
  width: '32px',
  height: '32px',
  borderRadius: '$md',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '$gray400',
  cursor: 'pointer',
  transition: '$fast',

  '&:hover': {
    backgroundColor: '$gray800',
    color: '$gray200',
  },

  '&:focus': {
    backgroundColor: '$gray700',
    color: '$gray100',
  },
})

const ModalBody = styled(Box, {
  flex: 1,
  overflow: 'auto',

  variants: {
    scrollable: {
      true: {
        maxHeight: '60vh',
        overflowY: 'auto',
      },
    },
  },
})

const ModalFooter = styled(Box, {
  borderTop: '1px solid $gray700',
  marginTop: '$6',
  paddingTop: '$4',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: '$3',
})

// Main Modal Component
type ModalProps = {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  size?: ComponentProps<typeof ModalContent>['size']
  padding?: ComponentProps<typeof ModalContent>['padding']
  centered?: boolean
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  blur?: ComponentProps<typeof ModalOverlay>['blur']
  title?: string
  showCloseButton?: boolean
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  size = 'md',
  padding = 'md',
  centered = false,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  blur = 'sm',
  title,
  showCloseButton = true,
}) => {
  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, closeOnEscape, onClose])

  // Focus management
  useEffect(() => {
    if (!isOpen) return

    const previouslyFocused = document.activeElement as HTMLElement
    const modalElement = document.querySelector('[data-modal-content]') as HTMLElement

    if (modalElement) {
      modalElement.focus()
    }

    return () => {
      if (previouslyFocused && previouslyFocused.focus) {
        previouslyFocused.focus()
      }
    }
  }, [isOpen])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose()
    }
  }

  const modalContent = (
    <>
      <ModalOverlay blur={blur} onClick={handleOverlayClick} />
      <ModalContent
        size={size}
        padding={padding}
        centered={centered}
        data-modal-content
        data-test-id="modal-content"
        display="flex"
        flexDirection="column"
      >
        {(title || showCloseButton) && (
          <ModalHeader>
            {title && <ModalTitle>{title}</ModalTitle>}
            {showCloseButton && (
              <ModalCloseButton onClick={onClose}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M12.207 3.793a1 1 0 0 0-1.414 0L8 6.586 5.207 3.793a1 1 0 0 0-1.414 1.414L6.586 8l-2.793 2.793a1 1 0 1 0 1.414 1.414L8 9.414l2.793 2.793a1 1 0 0 0 1.414-1.414L9.414 8l2.793-2.793a1 1 0 0 0 0-1.414z"/>
                </svg>
              </ModalCloseButton>
            )}
          </ModalHeader>
        )}
        {children}
      </ModalContent>
    </>
  )

  // Render to portal
  return createPortal(modalContent, document.body)
}

// Dialog variant (simpler modal)
export const Dialog: React.FC<Omit<ModalProps, 'title' | 'showCloseButton'>> = (props) => {
  return <Modal {...props} showCloseButton={false} />
}

// Confirmation Dialog
type ConfirmDialogProps = {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'danger'
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
}) => {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      centered
    >
      <ModalBody>
        <div style={{ marginBottom: '24px', color: 'var(--colors-gray300)' }}>
          {message}
        </div>
      </ModalBody>
      <ModalFooter>
        <button
          onClick={onClose}
          style={{
            padding: '8px 16px',
            border: '1px solid var(--colors-gray600)',
            borderRadius: '6px',
            backgroundColor: 'transparent',
            color: 'var(--colors-gray200)',
            cursor: 'pointer',
          }}
        >
          {cancelLabel}
        </button>
        <button
          onClick={handleConfirm}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: '6px',
            backgroundColor: variant === 'danger' ? 'var(--colors-error)' : 'var(--colors-primary)',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          {confirmLabel}
        </button>
      </ModalFooter>
    </Modal>
  )
}

// Export individual components for composition
export {
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
}

export type ModalProps_Export = ModalProps
export type ConfirmDialogProps_Export = ConfirmDialogProps