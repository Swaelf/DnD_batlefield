import { forwardRef } from 'react'
import { clsx } from 'clsx'
import { Button, type ButtonProps } from './Button'

// Link Button variant that looks like a link
export type LinkButtonProps = Omit<ButtonProps, 'variant'> & {
  underline?: boolean
}

export const LinkButton = forwardRef<HTMLButtonElement, LinkButtonProps>(
  ({ underline = false, className, ...props }, ref) => (
    <Button
      ref={ref}
      variant="ghost"
      className={clsx(
        'p-0 h-auto font-normal',
        underline && 'underline',
        'hover:underline',
        className
      )}
      {...props}
    />
  )
)

LinkButton.displayName = 'LinkButton'
