import { forwardRef, type CSSProperties } from 'react'
import { Input } from './Input'
import type { InputProps } from './Input'

export type ColorInputProps = Omit<InputProps, 'type'>

export const ColorInput = forwardRef<HTMLInputElement, ColorInputProps>(
  ({ style, ...props }, ref) => {
    const colorInputStyles: CSSProperties = {
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
