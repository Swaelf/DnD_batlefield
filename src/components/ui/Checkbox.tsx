import React, { useState, forwardRef } from 'react'
import { Check } from 'lucide-react'

// Exact checkbox event handlers
type CheckboxEventHandlers = {
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  onCheckedChange?: (checked: boolean) => void
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void
  onKeyUp?: (event: React.KeyboardEvent<HTMLInputElement>) => void
}

// Checkbox component props with exact typing
export type CheckboxProps = {
  checked?: boolean
  defaultChecked?: boolean
  disabled?: boolean
  label?: string
  children?: React.ReactNode
  indeterminate?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning' | 'error'

  // HTML input attributes
  id?: string
  name?: string
  value?: string
  form?: string
  required?: boolean
  autoFocus?: boolean

  // Styling
  className?: string
  style?: React.CSSProperties

  // ARIA attributes
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean
  'aria-required'?: boolean

  // Data attributes
  'data-testid'?: string
  'data-test-id'?: string
  'data-state'?: string
} & CheckboxEventHandlers

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      checked,
      defaultChecked = false,
      disabled = false,
      label,
      children,
      indeterminate = false,
      size = 'md',
      variant = 'default',
      id,
      name,
      value,
      form,
      required = false,
      autoFocus = false,
      className,
      style,
      onChange,
      onCheckedChange,
      onFocus,
      onBlur,
      onKeyDown,
      onKeyUp,
      // ARIA attributes
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledby,
      'aria-describedby': ariaDescribedby,
      'aria-invalid': ariaInvalid,
      'aria-required': ariaRequired,
      // Data attributes
      'data-testid': dataTestId,
      'data-test-id': dataTestId2,
      'data-state': dataState,
    },
    ref
  ) => {
    const isControlled = checked !== undefined
    const [internalChecked, setInternalChecked] = useState(defaultChecked)

    const actualChecked = isControlled ? checked : internalChecked

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return

      const newChecked = event.target.checked

      if (!isControlled) {
        setInternalChecked(newChecked)
      }

      onChange?.(event)
      onCheckedChange?.(newChecked)
    }

    // Size styles
    const sizeStyles = {
      sm: {
        indicator: { width: '14px', height: '14px' },
        icon: 10,
        label: { fontSize: '12px' },
        gap: '6px',
      },
      md: {
        indicator: { width: '16px', height: '16px' },
        icon: 12,
        label: { fontSize: '14px' },
        gap: '8px',
      },
      lg: {
        indicator: { width: '20px', height: '20px' },
        icon: 16,
        label: { fontSize: '16px' },
        gap: '10px',
      },
    }

    // Variant styles
    const variantStyles = {
      default: {
        checked: {
          backgroundColor: 'var(--primary)',
          borderColor: 'var(--primary)',
        },
        hover: {
          backgroundColor: 'var(--primaryHover)',
          borderColor: 'var(--primaryHover)',
        },
      },
      success: {
        checked: {
          backgroundColor: 'var(--success)',
          borderColor: 'var(--success)',
        },
        hover: {
          backgroundColor: 'var(--success)',
          borderColor: 'var(--success)',
        },
      },
      warning: {
        checked: {
          backgroundColor: 'var(--warning)',
          borderColor: 'var(--warning)',
        },
        hover: {
          backgroundColor: 'var(--warning)',
          borderColor: 'var(--warning)',
        },
      },
      error: {
        checked: {
          backgroundColor: 'var(--error)',
          borderColor: 'var(--error)',
        },
        hover: {
          backgroundColor: 'var(--error)',
          borderColor: 'var(--error)',
        },
      },
    }

    // Root styles
    const rootStyles: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      cursor: disabled ? 'not-allowed' : 'pointer',
      gap: sizeStyles[size].gap,
      userSelect: 'none',
      opacity: disabled ? 0.6 : 1,
      ...style,
    }

    // Indicator styles
    const indicatorStyles: React.CSSProperties = {
      ...sizeStyles[size].indicator,
      borderRadius: '4px',
      border: '2px solid var(--gray600)',
      backgroundColor: 'var(--gray900)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease',
      flexShrink: 0,
      position: 'relative',
      ...(actualChecked && variantStyles[variant].checked),
      ...(disabled && {
        borderColor: 'var(--gray700)',
        backgroundColor: 'var(--gray800)',
      }),
    }

    // Label styles
    const labelStyles: React.CSSProperties = {
      ...sizeStyles[size].label,
      color: disabled ? 'var(--gray500)' : 'var(--gray100)',
      lineHeight: 1.4,
    }

    // Hidden input styles
    const hiddenInputStyles: React.CSSProperties = {
      position: 'absolute',
      opacity: 0,
      width: '1px',
      height: '1px',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      border: 0,
    }

    const displayText = children || label

    return (
      <label
        style={rootStyles}
        className={className}
        htmlFor={id}
        data-disabled={disabled}
        data-checked={actualChecked}
        data-indeterminate={indeterminate}
        data-testid={dataTestId}
        data-test-id={dataTestId2}
        data-state={dataState || (actualChecked ? 'checked' : 'unchecked')}
      >
        <input
          ref={ref}
          type="checkbox"
          id={id}
          name={name}
          value={value}
          form={form}
          checked={actualChecked}
          disabled={disabled}
          required={required}
          autoFocus={autoFocus}
          style={hiddenInputStyles}
          onChange={handleChange}
          onFocus={onFocus}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledby}
          aria-describedby={ariaDescribedby}
          aria-invalid={ariaInvalid}
          aria-required={ariaRequired || required}
          aria-checked={indeterminate ? 'mixed' : actualChecked}
        />

        <div
          style={indicatorStyles}
          data-checked={actualChecked}
          data-disabled={disabled}
          data-indeterminate={indeterminate}
        >
          {actualChecked && !indeterminate && (
            <Check
              size={sizeStyles[size].icon}
              color="white"
              style={{ pointerEvents: 'none' }}
            />
          )}
          {indeterminate && (
            <div
              style={{
                width: '8px',
                height: '2px',
                backgroundColor: 'white',
                borderRadius: '1px',
                pointerEvents: 'none',
              }}
            />
          )}
        </div>

        {displayText && (
          <span
            style={labelStyles}
            data-disabled={disabled}
          >
            {displayText}
          </span>
        )}
      </label>
    )
  }
)

Checkbox.displayName = 'Checkbox'

// Checkbox Group for managing multiple checkboxes
export type CheckboxGroupProps = {
  children: React.ReactNode
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  disabled?: boolean
  orientation?: 'horizontal' | 'vertical'
  className?: string
  style?: React.CSSProperties
  'aria-label'?: string
  'aria-labelledby'?: string
}

export const CheckboxGroup = forwardRef<HTMLDivElement, CheckboxGroupProps>(
  (
    {
      children,
      value,
      defaultValue = [],
      onValueChange,
      disabled = false,
      orientation = 'vertical',
      className,
      style,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledby,
    },
    ref
  ) => {
    const isControlled = value !== undefined
    const [internalValue, setInternalValue] = useState<string[]>(defaultValue)

    const actualValue = isControlled ? value : internalValue

    const handleValueChange = (checkboxValue: string, checked: boolean) => {
      if (disabled) return

      const newValue = checked
        ? [...actualValue, checkboxValue]
        : actualValue.filter(v => v !== checkboxValue)

      if (!isControlled) {
        setInternalValue(newValue)
      }

      onValueChange?.(newValue)
    }

    const groupStyles: React.CSSProperties = {
      display: 'flex',
      flexDirection: orientation === 'horizontal' ? 'row' : 'column',
      gap: orientation === 'horizontal' ? '16px' : '8px',
      ...style,
    }

    return (
      <div
        ref={ref}
        role="group"
        className={className}
        style={groupStyles}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        data-disabled={disabled}
        data-orientation={orientation}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child) && child.type === Checkbox) {
            const childProps = child.props as CheckboxProps & {
              value?: string
              onCheckedChange?: (checked: boolean) => void
            }
            const childValue = childProps.value
            if (!childValue) return child

            return React.cloneElement(child as React.ReactElement<CheckboxProps>, {
              checked: actualValue.includes(childValue),
              disabled: disabled || childProps.disabled,
              onCheckedChange: (checked: boolean) => {
                handleValueChange(childValue, checked)
                childProps.onCheckedChange?.(checked)
              },
            })
          }
          return child
        })}
      </div>
    )
  }
)

CheckboxGroup.displayName = 'CheckboxGroup'