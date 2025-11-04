import { Modal } from './Modal'
import type { ModalProps } from './Modal'

export type DialogProps = Omit<ModalProps, 'title' | 'showCloseButton'>

export const Dialog = (props: DialogProps) => {
  return <Modal {...props} showCloseButton={false} />
}

Dialog.displayName = 'Dialog'
