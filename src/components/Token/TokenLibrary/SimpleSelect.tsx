import { forwardRef, type ReactNode, type CSSProperties } from 'react'

export type SimpleSelectProps = {
  value: string
  onChange: (value: string) => void
  children: ReactNode
  className?: string
  style?: CSSProperties
}

export const SimpleSelect = forwardRef<HTMLSelectElement, SimpleSelectProps>(
  ({ value, onChange, children, className, style }, ref) => {
    const selectStyles: CSSProperties = {
      width: '100%',
      padding: '8px 12px',
      fontSize: '14px',
      backgroundColor: 'var(--gray800)',
      border: '1px solid var(--gray600)',
      borderRadius: '6px',
      color: 'var(--gray100)',
      outline: 'none',
      cursor: 'pointer',
      ...style,
    }

    return (
      <select
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={selectStyles}
        className={className}
      >
        {children}
      </select>
    )
  }
)

SimpleSelect.displayName = 'SimpleSelect'
