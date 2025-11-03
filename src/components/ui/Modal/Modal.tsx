import { useEffect, type ReactNode, type CSSProperties, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { ModalHeader } from './ModalHeader'
import { ModalTitle } from './ModalTitle'
import { ModalCloseButton } from './ModalCloseButton'

// Modal event handlers
type ModalEventHandlers = {
  onClose: () => void
  onOpen?: () => void
  onOverlayClick?: (event: MouseEvent<HTMLDivElement>) => void
  onContentClick?: (event: MouseEvent<HTMLDivElement>) => void
  onEscapeKeyDown?: (event: KeyboardEvent) => void
}

// Modal component props with exact typing
export type ModalProps = {
  isOpen: boolean
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'auto'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  centered?: boolean
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  blur?: 'none' | 'sm' | 'md' | 'lg'
  title?: string
  showCloseButton?: boolean
  className?: string
  style?: CSSProperties

  // HTML attributes
  id?: string
  role?: string

  // ARIA attributes
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  'aria-modal'?: boolean

  // Data attributes
  'data-testid'?: string
  'data-test-id'?: string
  'data-state'?: string
} & ModalEventHandlers

export const Modal = ({
  isOpen,
  children,
  size = 'md',
  padding = 'md',
  centered = false,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  blur = 'sm',
  title,
  showCloseButton = true,
  className,
  style,
  id,
  role = 'dialog',
  onClose,
  onOpen,
  onOverlayClick,
  onContentClick,
  onEscapeKeyDown,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  'aria-describedby': ariaDescribedby,
  'aria-modal': ariaModal = true,
  'data-testid': dataTestId,
  'data-test-id': dataTestId2,
  'data-state': dataState,
}: ModalProps) => {
  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onEscapeKeyDown?.(e)
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, closeOnEscape, onClose, onEscapeKeyDown])

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
      onOpen?.()
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
    // Return undefined cleanup function for else case
    return undefined
  }, [isOpen, onOpen])

  if (!isOpen) return null

  const handleOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onOverlayClick?.(e)
      onClose()
    }
  }

  // Overlay styles
  const blurStyles = {
    none: { backdropFilter: 'none' },
    sm: { backdropFilter: 'blur(2px)' },
    md: { backdropFilter: 'blur(4px)' },
    lg: { backdropFilter: 'blur(8px)' },
  }

  const overlayStyles: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
    animation: 'modalFadeIn 150ms ease-out',
    ...blurStyles[blur],
  }

  // Content styles
  const sizeStyles = {
    sm: { width: '400px', maxWidth: '90vw' },
    md: { width: '500px', maxWidth: '90vw' },
    lg: { width: '700px', maxWidth: '90vw' },
    xl: { width: '900px', maxWidth: '95vw' },
    full: { width: '95vw', height: '95vh' },
    auto: { width: 'auto', minWidth: '300px' },
  }

  const paddingStyles = {
    none: { padding: '0' },
    sm: { padding: '16px' },
    md: { padding: '24px' },
    lg: { padding: '32px' },
  }

  const contentStyles: CSSProperties = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 1001,
    backgroundColor: 'var(--surface)',
    border: '1px solid var(--gray700)',
    borderRadius: '12px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    animation: 'modalSlideIn 200ms ease-out',
    maxHeight: '90vh',
    maxWidth: '90vw',
    outline: 'none',
    display: 'flex',
    flexDirection: 'column',
    ...(centered && {
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
    }),
    ...sizeStyles[size],
    ...paddingStyles[padding],
    ...style,
  }

  const modalContent = (
    <>
      <div style={overlayStyles} onClick={handleOverlayClick} />
      <div
        style={contentStyles}
        className={className}
        id={id}
        role={role}
        tabIndex={-1}
        onClick={onContentClick}
        aria-label={ariaLabel || title}
        aria-labelledby={ariaLabelledby}
        aria-describedby={ariaDescribedby}
        aria-modal={ariaModal}
        data-modal-content
        data-testid={dataTestId}
        data-test-id={dataTestId2}
        data-state={dataState || (isOpen ? 'open' : 'closed')}
        data-size={size}
        data-padding={padding}
        data-centered={centered}
      >
        {(title || showCloseButton) && (
          <ModalHeader>
            {title && <ModalTitle>{title}</ModalTitle>}
            {showCloseButton && (
              <ModalCloseButton onClick={onClose} aria-label="Close modal" />
            )}
          </ModalHeader>
        )}
        {children}
      </div>

      {/* Add CSS animations */}
      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
      `}</style>
    </>
  )

  // Render to portal
  return createPortal(modalContent, document.body)
}

Modal.displayName = 'Modal'
