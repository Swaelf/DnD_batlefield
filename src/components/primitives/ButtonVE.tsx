import React, { forwardRef } from 'react'
import { clsx } from 'clsx'
import { button, type ButtonVariants } from '@/styles/recipes/button.css'

export interface ButtonProps extends ButtonVariants {
  children?: React.ReactNode
  className?: string
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  onMouseDown?: (event: React.MouseEvent<HTMLButtonElement>) => void
  onMouseUp?: (event: React.MouseEvent<HTMLButtonElement>) => void
  onMouseEnter?: (event: React.MouseEvent<HTMLButtonElement>) => void
  onMouseLeave?: (event: React.MouseEvent<HTMLButtonElement>) => void
  onFocus?: (event: React.FocusEvent<HTMLButtonElement>) => void
  onBlur?: (event: React.FocusEvent<HTMLButtonElement>) => void
  'data-active'?: boolean
  'data-loading'?: boolean
  'aria-label'?: string
  'aria-pressed'?: boolean
  'aria-expanded'?: boolean
  title?: string
  id?: string
  role?: string
  tabIndex?: number
  // Additional props for compatibility
  css?: React.CSSProperties | Record<string, any>
  style?: React.CSSProperties
  'data-testid'?: string
  'data-test-id'?: string
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant,
      size,
      fullWidth,
      loading,
      disabled,
      type = 'button',
      css,
      style,
      ...props
    },
    ref
  ) => {
    // Handle CSS prop by converting it to inline styles (basic support)
    let combinedStyle = style
    if (css && typeof css === 'object') {
      combinedStyle = { ...style, ...css }
    }

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        data-loading={loading}
        style={combinedStyle}
        className={clsx(
          button({
            variant,
            size,
            fullWidth,
            loading,
          }),
          className
        )}
        {...props}
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <LoadingSpinner />
            {children}
          </span>
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

// Loading spinner component
const LoadingSpinner: React.FC = () => (
  <svg
    className="animate-spin h-4 w-4"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
)

// Tool Button variant for toolbar usage
export interface ToolButtonProps extends Omit<ButtonProps, 'variant' | 'size'> {
  active?: boolean
}

export const ToolButton = forwardRef<HTMLButtonElement, ToolButtonProps>(
  ({ active, className, ...props }, ref) => (
    <Button
      ref={ref}
      variant={active ? 'primary' : 'outline'}
      size="icon"
      data-active={active}
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

// Icon Button variant for icon-only buttons
export interface IconButtonProps extends Omit<ButtonProps, 'children'> {
  icon: React.ReactNode
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

// Export types for use elsewhere
export type ButtonVEProps = ButtonProps
export type ToolButtonVEProps = ToolButtonProps
export type IconButtonVEProps = IconButtonProps