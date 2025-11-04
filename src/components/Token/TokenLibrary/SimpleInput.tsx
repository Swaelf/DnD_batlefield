import { forwardRef, type ChangeEvent, type CSSProperties } from 'react'

export type SimpleInputProps = {
  value: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  className?: string
  style?: CSSProperties
}

export const SimpleInput = forwardRef<HTMLInputElement, SimpleInputProps>(
  ({ value, onChange, placeholder, className, style }, ref) => {
    const inputStyles: CSSProperties = {
      width: '100%',
      padding: '8px 12px',
      fontSize: '14px',
      backgroundColor: 'var(--gray800)',
      border: '1px solid var(--gray600)',
      borderRadius: '6px',
      color: 'var(--gray100)',
      outline: 'none',
      transition: 'all 0.2s ease',
      ...style,
    }

    return (
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={inputStyles}
        className={className}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--primary)'
          e.currentTarget.style.backgroundColor = 'var(--gray750)'
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'var(--gray600)'
          e.currentTarget.style.backgroundColor = 'var(--gray800)'
        }}
      />
    )
  }
)

SimpleInput.displayName = 'SimpleInput'
