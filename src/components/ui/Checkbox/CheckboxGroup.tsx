import { useState, Children, isValidElement, cloneElement, forwardRef, type ReactNode, type ReactElement, type CSSProperties } from 'react'
import { Checkbox, type CheckboxProps } from './Checkbox'

// Checkbox Group for managing multiple checkboxes
export type CheckboxGroupProps = {
  children: ReactNode
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  disabled?: boolean
  orientation?: 'horizontal' | 'vertical'
  className?: string
  style?: CSSProperties
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

    const groupStyles: CSSProperties = {
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
        {Children.map(children, (child) => {
          if (isValidElement(child) && child.type === Checkbox) {
            const childProps = child.props as CheckboxProps & {
              value?: string
              onCheckedChange?: (checked: boolean) => void
            }
            const childValue = childProps.value
            if (!childValue) return child

            return cloneElement(child as ReactElement<CheckboxProps>, {
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
