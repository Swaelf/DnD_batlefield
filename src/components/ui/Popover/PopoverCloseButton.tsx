import { forwardRef, type MouseEvent, type CSSProperties } from 'react'
import { X } from '@/utils/optimizedIcons'
import { vars } from '@/styles/theme.css'

export type PopoverCloseButtonProps = {
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void
  className?: string
  style?: CSSProperties
  'aria-label'?: string
}

export const PopoverCloseButton = forwardRef<HTMLButtonElement, PopoverCloseButtonProps>(
  ({ onClick, className, style, 'aria-label': ariaLabel = 'Close' }, ref) => {
    const buttonStyles: CSSProperties = {
      width: '24px',
      height: '24px',
      borderRadius: '6px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      color: vars.colors.gray400,
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
          e.currentTarget.style.backgroundColor = vars.colors.gray800
          e.currentTarget.style.color = vars.colors.gray200
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent'
          e.currentTarget.style.color = vars.colors.gray400
        }}
        onFocus={(e) => {
          e.currentTarget.style.backgroundColor = vars.colors.gray700
          e.currentTarget.style.color = vars.colors.gray100
        }}
        onBlur={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent'
          e.currentTarget.style.color = vars.colors.gray400
        }}
      >
        <X size={14} />
      </button>
    )
  }
)

PopoverCloseButton.displayName = 'PopoverCloseButton'
