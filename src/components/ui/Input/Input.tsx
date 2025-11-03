import { forwardRef, type CSSProperties, type ChangeEvent, type FormEvent, type FocusEvent, type KeyboardEvent, type MouseEvent } from 'react'

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
  placeholder: {
    color: 'var(--gray500)',
  },
  focus: {
    borderColor: 'var(--primary)',
    boxShadow: '0 0 0 2px rgba(139, 69, 19, 0.2)',
  },
  hover: {
    borderColor: 'var(--gray500)',
  },
  disabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
}

// Exact input event handlers
type InputEventHandlers = {
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void
  onInput?: (event: FormEvent<HTMLInputElement>) => void
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void
  onKeyUp?: (event: KeyboardEvent<HTMLInputElement>) => void
  onKeyPress?: (event: KeyboardEvent<HTMLInputElement>) => void
  onClick?: (event: MouseEvent<HTMLInputElement>) => void
  onMouseEnter?: (event: MouseEvent<HTMLInputElement>) => void
  onMouseLeave?: (event: MouseEvent<HTMLInputElement>) => void
}

// Exact input HTML attributes
type InputHTMLAttributes = {
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search' | 'color' | 'date' | 'datetime-local' | 'month' | 'time' | 'week'
  value?: string | number | readonly string[]
  defaultValue?: string | number | readonly string[]
  placeholder?: string
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  autoComplete?: string
  autoFocus?: boolean
  name?: string
  id?: string
  form?: string
  maxLength?: number
  minLength?: number
  pattern?: string
  size?: number
  step?: number | 'any'
  min?: number | string
  max?: number | string
  multiple?: boolean
  accept?: string
  capture?: boolean | 'user' | 'environment'
  list?: string
}

// ARIA attributes for input
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

// Input component props
export type InputProps = {
  // Variants
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outlined' | 'filled' | 'ghost'
  state?: 'default' | 'error' | 'success' | 'warning'
  fullWidth?: boolean

  // Styling
  className?: string
  style?: CSSProperties

  // Data attributes
  'data-testid'?: string
  'data-test-id'?: string
  'data-state'?: string
} & InputEventHandlers & Omit<InputHTMLAttributes, 'size'> & InputAriaAttributes

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      size = 'md',
      variant = 'default',
      state = 'default',
      fullWidth = true,
      className,
      style,
      disabled = false,
      type = 'text',
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
      // ARIA attributes
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledby,
      'aria-describedby': ariaDescribedby,
      'aria-required': ariaRequired,
      'aria-invalid': ariaInvalid,
      'aria-errormessage': ariaErrormessage,
      'aria-expanded': ariaExpanded,
      'aria-controls': ariaControls,
      'aria-activedescendant': ariaActivedescendant,
      'aria-autocomplete': ariaAutocomplete,
      'aria-multiline': ariaMultiline,
      'aria-placeholder': ariaPlaceholder,
      'aria-readonly': ariaReadonly,
      // Data attributes
      'data-testid': dataTestId,
      'data-test-id': dataTestId2,
      'data-state': dataState,
      ...htmlProps
    },
    ref
  ) => {
    const sizeStyles = {
      sm: { fontSize: '12px', padding: '8px', height: '32px' },
      md: { fontSize: '14px', padding: '12px', height: '40px' },
      lg: { fontSize: '16px', padding: '16px', height: '48px' },
    }

    const variantStyles = {
      default: { backgroundColor: 'var(--gray800)', borderColor: 'var(--gray600)' },
      outlined: { backgroundColor: 'transparent', borderColor: 'var(--gray600)' },
      filled: { backgroundColor: 'var(--gray700)', borderColor: 'transparent' },
      ghost: { backgroundColor: 'transparent', borderColor: 'transparent' },
    }

    const stateStyles = {
      default: {},
      error: { borderColor: 'var(--error)' },
      success: { borderColor: 'var(--success)' },
      warning: { borderColor: 'var(--warning)' },
    }

    const combinedStyles = {
      ...inputStyles.base,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...stateStyles[state],
      ...(fullWidth && { width: '100%' }),
      ...(disabled && inputStyles.disabled),
      ...style,
    }

    return (
      <input
        ref={ref}
        type={type}
        disabled={disabled}
        style={combinedStyles}
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
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        aria-describedby={ariaDescribedby}
        aria-required={ariaRequired}
        aria-invalid={ariaInvalid}
        aria-errormessage={ariaErrormessage}
        aria-expanded={ariaExpanded}
        aria-controls={ariaControls}
        aria-activedescendant={ariaActivedescendant}
        aria-autocomplete={ariaAutocomplete}
        aria-multiline={ariaMultiline}
        aria-placeholder={ariaPlaceholder}
        aria-readonly={ariaReadonly}
        data-testid={dataTestId}
        data-test-id={dataTestId2}
        data-state={dataState || state}
        {...htmlProps}
      />
    )
  }
)

Input.displayName = 'Input'
