import { forwardRef, type ReactNode, type CSSProperties } from 'react'

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
