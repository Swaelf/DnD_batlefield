import { type CSSProperties } from 'react'
import { Button } from '@/components/primitives/ButtonVE'
import { Modal } from './Modal'
import { ModalBody } from './ModalBody'
import { ModalFooter } from './ModalFooter'

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
