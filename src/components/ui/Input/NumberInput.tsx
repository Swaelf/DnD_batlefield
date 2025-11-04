import { forwardRef, type ChangeEvent } from 'react'
import { Input } from './Input'
import type { InputProps } from './Input'

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
