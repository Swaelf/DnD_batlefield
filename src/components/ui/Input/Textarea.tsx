import { forwardRef, type CSSProperties, type ChangeEvent, type FormEvent, type FocusEvent, type KeyboardEvent, type MouseEvent, type UIEvent } from 'react'

// Vanilla Extract recipes (to be created)
// For now using inline styles with CSS variables
const inputStyles = {
  base: {
    width: '100%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontFamily: 'system-ui, sans-serif',
    color: 'var(--gray100)',
    backgroundColor: 'var(--gray800)',
    border: '1px solid var(--gray600)',
    borderRadius: '8px',
    padding: '12px',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box' as const,
    outline: 'none',
  },
  disabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
}

type TextareaEventHandlers = {
  onChange?: (event: ChangeEvent<HTMLTextAreaElement>) => void
  onInput?: (event: FormEvent<HTMLTextAreaElement>) => void
  onFocus?: (event: FocusEvent<HTMLTextAreaElement>) => void
  onBlur?: (event: FocusEvent<HTMLTextAreaElement>) => void
  onKeyDown?: (event: KeyboardEvent<HTMLTextAreaElement>) => void
  onKeyUp?: (event: KeyboardEvent<HTMLTextAreaElement>) => void
  onKeyPress?: (event: KeyboardEvent<HTMLTextAreaElement>) => void
  onClick?: (event: MouseEvent<HTMLTextAreaElement>) => void
  onMouseEnter?: (event: MouseEvent<HTMLTextAreaElement>) => void
  onMouseLeave?: (event: MouseEvent<HTMLTextAreaElement>) => void
  onScroll?: (event: UIEvent<HTMLTextAreaElement>) => void
}

// ARIA attributes for textarea
type InputAriaAttributes = {
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  'aria-required'?: boolean
  'aria-invalid'?: boolean | 'grammar' | 'spelling'
  'aria-errormessage'?: string
  'aria-expanded'?: boolean
  'aria-controls'?: string
  'aria-activedescendant'?: string
  'aria-autocomplete'?: 'none' | 'inline' | 'list' | 'both'
  'aria-multiline'?: boolean
  'aria-placeholder'?: string
  'aria-readonly'?: boolean
}

export type TextareaProps = {
  size?: 'sm' | 'md' | 'lg'
  resize?: 'none' | 'both' | 'horizontal' | 'vertical'
  rows?: number
  cols?: number
  wrap?: 'hard' | 'soft' | 'off'
  value?: string
  defaultValue?: string
  placeholder?: string
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  maxLength?: number
  minLength?: number
  name?: string
  id?: string
  form?: string
  autoFocus?: boolean
  className?: string
  style?: CSSProperties
} & TextareaEventHandlers & InputAriaAttributes & {
  'data-testid'?: string
  'data-test-id'?: string
  'data-state'?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      size = 'md',
      resize = 'vertical',
      rows = 4,
      disabled = false,
      className,
      style,
      onChange,
      onInput,
      onFocus,
      onBlur,
      onKeyDown,
      onKeyUp,
      onKeyPress,
      onClick,
      onMouseEnter,
      onMouseLeave,
      onScroll,
      ...htmlProps
    },
    ref
  ) => {
    const sizeStyles = {
      sm: { fontSize: '12px', padding: '8px', minHeight: '60px' },
      md: { fontSize: '14px', padding: '12px', minHeight: '80px' },
      lg: { fontSize: '16px', padding: '16px', minHeight: '120px' },
    }

    const textareaStyles = {
      ...inputStyles.base,
      ...sizeStyles[size],
      resize,
      minHeight: sizeStyles[size].minHeight,
      height: 'auto',
      lineHeight: '1.5',
      ...(disabled && inputStyles.disabled),
      ...style,
    }

    return (
      <textarea
        ref={ref}
        rows={rows}
        disabled={disabled}
        style={textareaStyles}
        className={className}
        onChange={disabled ? undefined : onChange}
        onInput={disabled ? undefined : onInput}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={disabled ? undefined : onKeyDown}
        onKeyUp={disabled ? undefined : onKeyUp}
        onKeyPress={disabled ? undefined : onKeyPress}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onScroll={onScroll}
        {...htmlProps}
      />
    )
  }
)

Textarea.displayName = 'Textarea'
