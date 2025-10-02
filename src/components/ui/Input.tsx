import { forwardRef, type ReactNode, type CSSProperties, type ChangeEvent, type FormEvent, type FocusEvent, type KeyboardEvent, type MouseEvent, type UIEvent } from 'react'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'

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

// Number input with built-in controls
export type NumberInputProps = Omit<InputProps, 'type'> & {
  min?: number
  max?: number
  step?: number | 'any'
  precision?: number
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ min, max, step = 1, precision, onChange, ...props }, ref) => {
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      if (precision !== undefined) {
        const value = parseFloat(event.target.value)
        if (!isNaN(value)) {
          event.target.value = value.toFixed(precision)
        }
      }
      onChange?.(event)
    }

    return (
      <Input
        ref={ref}
        type="number"
        min={min}
        max={max}
        step={step}
        onChange={handleChange}
        {...props}
      />
    )
  }
)

NumberInput.displayName = 'NumberInput'

// Color input
export type ColorInputProps = Omit<InputProps, 'type'>

export const ColorInput = forwardRef<HTMLInputElement, ColorInputProps>(
  ({ style, ...props }, ref) => {
    const colorInputStyles = {
      padding: '4px',
      cursor: 'pointer',
      height: '40px',
      ...style,
    }

    return (
      <Input
        ref={ref}
        type="color"
        style={colorInputStyles}
        {...props}
      />
    )
  }
)

ColorInput.displayName = 'ColorInput'

// Search input with icon
export type SearchInputProps = Omit<InputProps, 'type'> & {
  icon?: ReactNode
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ icon, style, ...props }, ref) => {
    const searchStyles = {
      paddingLeft: icon ? '40px' : '12px',
      ...style,
    }

    return (
      <Box style={{ position: 'relative', width: '100%' }}>
        {icon && (
          <Box
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--gray500)',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          >
            {icon}
          </Box>
        )}
        <Input
          ref={ref}
          type="search"
          style={searchStyles}
          {...props}
        />
      </Box>
    )
  }
)

SearchInput.displayName = 'SearchInput'

// Textarea component
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

// Field wrapper for labels and validation messages
export type FieldProps = {
  children: ReactNode
  className?: string
  style?: CSSProperties
}

export const Field = ({ children, className, style }: FieldProps) => (
  <Box
    style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      width: '100%',
      ...style,
    }}
    className={className}
  >
    {children}
  </Box>
)

Field.displayName = 'Field'

// Field label
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

// Field message for help text and validation
export type FieldMessageProps = {
  children: ReactNode
  state?: 'default' | 'error' | 'success' | 'warning'
  className?: string
  style?: CSSProperties
}

export const FieldMessage = ({ children, state = 'default', className, style }: FieldMessageProps) => {
  const stateColors = {
    default: 'var(--gray500)',
    error: 'var(--error)',
    success: 'var(--success)',
    warning: 'var(--warning)',
  }

  return (
    <Text
      size="sm"
      className={className}
      style={{
        color: stateColors[state],
        ...style,
      }}
    >
      {children}
    </Text>
  )
}

FieldMessage.displayName = 'FieldMessage'