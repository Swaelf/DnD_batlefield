import { forwardRef } from 'react'
import { clsx } from 'clsx'
import { Button, type ButtonProps } from './Button'

// Tool Button variant for toolbar usage
export type ToolButtonProps = Omit<ButtonProps, 'variant' | 'size'> & {
  active?: boolean
  tooltip?: string
}

export const ToolButton = forwardRef<HTMLButtonElement, ToolButtonProps>(
  ({ active = false, tooltip, className, ...props }, ref) => (
    <Button
      ref={ref}
      variant={active ? 'primary' : 'outline'}
      size="icon"
      data-active={active}
      title={tooltip}
      className={clsx(
        'transition-colors duration-150',
        active && 'shadow-md',
        className
      )}
      {...props}
    />
  )
)

ToolButton.displayName = 'ToolButton'
