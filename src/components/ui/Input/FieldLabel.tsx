import { forwardRef, type ReactNode, type CSSProperties, type MouseEvent } from 'react'

export type FieldLabelProps = {
  children: ReactNode
  htmlFor?: string
  required?: boolean
  disabled?: boolean
  className?: string
  style?: CSSProperties
  onClick?: (event: MouseEvent<HTMLLabelElement>) => void
}

export const FieldLabel = forwardRef<HTMLLabelElement, FieldLabelProps>(
  ({ children, htmlFor, required = false, disabled = false, className, style, onClick }, ref) => (
    <label
      ref={ref}
      htmlFor={htmlFor}
      onClick={disabled ? undefined : onClick}
      className={className}
      style={{
        fontSize: '12px',
        fontWeight: '500',
        color: disabled ? 'var(--gray500)' : 'var(--gray300)',
        userSelect: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...style,
      }}
    >
      {children}
      {required && <span style={{ color: 'var(--error)' }}> *</span>}
    </label>
  )
)

FieldLabel.displayName = 'FieldLabel'
