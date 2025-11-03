import { useEffect, forwardRef, createElement, type ReactNode, type CSSProperties, type MouseEvent, type UIEvent } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/primitives/ButtonVE'

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

// Modal Header component
export type ModalHeaderProps = {
  children: ReactNode
  className?: string
  style?: CSSProperties
}

export const ModalHeader = forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ children, className, style }, ref) => {
    const headerStyles: CSSProperties = {
      borderBottom: '1px solid var(--gray700)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      ...style,
    }

    return (
      <div ref={ref} style={headerStyles} className={className}>
        {children}
      </div>
    )
  }
)

ModalHeader.displayName = 'ModalHeader'

// Modal Title component
export type ModalTitleProps = {
  children: ReactNode
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  className?: string
  style?: CSSProperties
  id?: string
}

export const ModalTitle = forwardRef<HTMLHeadingElement, ModalTitleProps>(
  ({ children, as: Component = 'h2', className, style, id }, ref) => {
    const titleStyles: CSSProperties = {
      margin: 0,
      fontSize: '20px',
      fontWeight: '600',
      color: 'var(--gray100)',
      fontFamily: 'system-ui, sans-serif',
      lineHeight: 1.2,
      ...style,
    }

    return createElement(
      Component,
      {
        ref,
        style: titleStyles,
        className,
        id,
      },
      children
    )
  }
)

ModalTitle.displayName = 'ModalTitle'

// Modal Close Button component
export type ModalCloseButtonProps = {
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void
  className?: string
  style?: CSSProperties
  'aria-label'?: string
}

export const ModalCloseButton = forwardRef<HTMLButtonElement, ModalCloseButtonProps>(
  ({ onClick, className, style, 'aria-label': ariaLabel = 'Close' }, ref) => {
    const buttonStyles: CSSProperties = {
      width: '32px',
      height: '32px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--gray400)',
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      outline: 'none',
      ...style,
    }

    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        style={buttonStyles}
        className={className}
        aria-label={ariaLabel}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--gray800)'
          e.currentTarget.style.color = 'var(--gray200)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent'
          e.currentTarget.style.color = 'var(--gray400)'
        }}
        onFocus={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--gray700)'
          e.currentTarget.style.color = 'var(--gray100)'
        }}
        onBlur={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent'
          e.currentTarget.style.color = 'var(--gray400)'
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M12.207 3.793a1 1 0 0 0-1.414 0L8 6.586 5.207 3.793a1 1 0 0 0-1.414 1.414L6.586 8l-2.793 2.793a1 1 0 1 0 1.414 1.414L8 9.414l2.793 2.793a1 1 0 0 0 1.414-1.414L9.414 8l2.793-2.793a1 1 0 0 0 0-1.414z" />
        </svg>
      </button>
    )
  }
)

ModalCloseButton.displayName = 'ModalCloseButton'

// Modal Body component
export type ModalBodyProps = {
  children: ReactNode
  scrollable?: boolean
  className?: string
  style?: CSSProperties
  onScroll?: (event: UIEvent<HTMLDivElement>) => void
}

export const ModalBody = forwardRef<HTMLDivElement, ModalBodyProps>(
  ({ children, scrollable = false, className, style, onScroll }, ref) => {
    const bodyStyles: CSSProperties = {
      flex: 1,
      ...(scrollable && {
        maxHeight: '60vh',
        overflowY: 'auto',
        overflowX: 'hidden',
      }),
      ...style,
    }

    return (
      <div
        ref={ref}
        style={bodyStyles}
        className={className}
        onScroll={onScroll}
        data-scrollable={scrollable}
      >
        {children}
      </div>
    )
  }
)

ModalBody.displayName = 'ModalBody'

// Modal Footer component
export type ModalFooterProps = {
  children: ReactNode
  justify?: 'start' | 'center' | 'end' | 'between'
  className?: string
  style?: CSSProperties
}

export const ModalFooter = forwardRef<HTMLDivElement, ModalFooterProps>(
  ({ children, justify = 'end', className, style }, ref) => {
    const justifyContentValues = {
      start: 'flex-start',
      center: 'center',
      end: 'flex-end',
      between: 'space-between',
    }

    const footerStyles: CSSProperties = {
      borderTop: '1px solid var(--gray700)',
      marginTop: '24px',
      paddingTop: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: justifyContentValues[justify],
      gap: '12px',
      ...style,
    }

    return (
      <div ref={ref} style={footerStyles} className={className} data-justify={justify}>
        {children}
      </div>
    )
  }
)

ModalFooter.displayName = 'ModalFooter'

// Dialog variant (simpler modal)
export type DialogProps = Omit<ModalProps, 'title' | 'showCloseButton'>

export const Dialog = (props: DialogProps) => {
  return <Modal {...props} showCloseButton={false} />
}

Dialog.displayName = 'Dialog'

// Confirmation Dialog
export type ConfirmDialogProps = {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'danger'
  className?: string
  style?: CSSProperties
}

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  className,
  style,
}: ConfirmDialogProps) => {
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
      className={className}
      style={style}
    >
      <ModalBody>
        <div style={{ marginBottom: '24px', color: 'var(--gray300)', lineHeight: 1.5 }}>
          {message}
        </div>
      </ModalBody>
      <ModalFooter>
        <Button
          variant="outline"
          onClick={onClose}
          style={{
            borderColor: 'var(--gray600)',
            color: 'var(--gray200)',
          }}
        >
          {cancelLabel}
        </Button>
        <Button
          variant={variant === 'danger' ? 'destructive' : 'primary'}
          onClick={handleConfirm}
        >
          {confirmLabel}
        </Button>
      </ModalFooter>
    </Modal>
  )
}

ConfirmDialog.displayName = 'ConfirmDialog'