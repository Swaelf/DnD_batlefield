import { forwardRef, type ReactNode, type CSSProperties } from 'react'

export type ControlButtonProps = {
  onClick: () => void
  title: string
  children: ReactNode
  className?: string
  style?: CSSProperties
}

export const ControlButton = forwardRef<HTMLButtonElement, ControlButtonProps>(
  ({ onClick, title, children, className, style }, ref) => {
    const buttonStyles: CSSProperties = {
      padding: '6px 8px',
      backgroundColor: 'var(--gray800)',
      border: '1px solid var(--gray700)',
      borderRadius: '6px',
      color: 'var(--gray200)',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      outline: 'none',
      ...style,
    }

    return (
      <button
        ref={ref}
        onClick={onClick}
        title={title}
        style={buttonStyles}
        className={className}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--gray700)'
          e.currentTarget.style.color = 'var(--gray100)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--gray800)'
          e.currentTarget.style.color = 'var(--gray200)'
        }}
        onFocus={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--gray700)'
          e.currentTarget.style.color = 'var(--gray100)'
        }}
        onBlur={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--gray800)'
          e.currentTarget.style.color = 'var(--gray200)'
        }}
      >
        {children}
      </button>
    )
  }
)

ControlButton.displayName = 'ControlButton'
