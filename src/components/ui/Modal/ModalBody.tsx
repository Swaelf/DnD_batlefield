import { forwardRef, type ReactNode, type CSSProperties, type UIEvent } from 'react'

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
