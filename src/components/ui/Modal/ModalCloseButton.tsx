import { forwardRef, type CSSProperties, type MouseEvent } from 'react'

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
