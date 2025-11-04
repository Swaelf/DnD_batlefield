import { forwardRef, type ReactNode } from 'react'
import { clsx } from 'clsx'
import { Button, type ButtonProps } from './Button'

// Icon Button variant for icon-only buttons
export type IconButtonProps = Omit<ButtonProps, 'children'> & {
  icon: ReactNode
  'aria-label': string // Required for accessibility
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, className, size = 'icon', ...props }, ref) => (
    <Button
      ref={ref}
      size={size}
      className={clsx('p-0', className)}
      {...props}
    >
      {icon}
    </Button>
  )
)

IconButton.displayName = 'IconButton'
