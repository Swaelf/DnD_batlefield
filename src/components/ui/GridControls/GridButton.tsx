import { forwardRef, type ReactNode, type CSSProperties } from 'react'

export type GridButtonProps = {
  onClick: () => void
  active: boolean
  title: string
  children: ReactNode
  className?: string
  style?: CSSProperties
}

export const GridButton = forwardRef<HTMLButtonElement, GridButtonProps>(
  ({ onClick, active, title, children, className, style }, ref) => {
    const buttonStyles: CSSProperties = {
      padding: '8px',
      borderRadius: '12px',
      border: '1px solid var(--gray700)',
      backgroundColor: active ? 'var(--gray700)' : 'var(--gray800)',
      color: active ? 'var(--secondary)' : 'var(--gray500)',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      outline: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
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
          if (!active) {
            e.currentTarget.style.backgroundColor = 'var(--gray700)'
          }
        }}
        onMouseLeave={(e) => {
          if (!active) {
            e.currentTarget.style.backgroundColor = 'var(--gray800)'
          }
        }}
      >
        {children}
      </button>
    )
  }
)

GridButton.displayName = 'GridButton'
