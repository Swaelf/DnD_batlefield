import { forwardRef, type ReactNode, type ReactElement, type CSSProperties, type MouseEvent, type FocusEvent, type KeyboardEvent } from 'react'
import { clsx } from 'clsx'
import { button } from '@/styles/recipes/button.css'

// Exact button event handlers
export type ButtonEventHandlers = {
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void
  onDoubleClick?: (event: MouseEvent<HTMLButtonElement>) => void
  onMouseDown?: (event: MouseEvent<HTMLButtonElement>) => void
  onMouseUp?: (event: MouseEvent<HTMLButtonElement>) => void
  onMouseEnter?: (event: MouseEvent<HTMLButtonElement>) => void
  onMouseLeave?: (event: MouseEvent<HTMLButtonElement>) => void
  onFocus?: (event: FocusEvent<HTMLButtonElement>) => void
  onBlur?: (event: FocusEvent<HTMLButtonElement>) => void
  onKeyDown?: (event: KeyboardEvent<HTMLButtonElement>) => void
  onKeyUp?: (event: KeyboardEvent<HTMLButtonElement>) => void
  onKeyPress?: (event: KeyboardEvent<HTMLButtonElement>) => void
}

// ARIA attributes for button
export type ButtonAriaAttributes = {
  'aria-label'?: string
  'aria-pressed'?: boolean
  'aria-expanded'?: boolean
  'aria-describedby'?: string
  'aria-labelledby'?: string
  'aria-controls'?: string
  'aria-haspopup'?: boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog'
  'aria-current'?: boolean | 'page' | 'step' | 'location' | 'date' | 'time'
  'aria-disabled'?: boolean
  'aria-hidden'?: boolean
  'aria-invalid'?: boolean | 'grammar' | 'spelling'
  'aria-live'?: 'off' | 'polite' | 'assertive'
  'aria-busy'?: boolean
}

// Data attributes for testing and state
export type ButtonDataAttributes = {
  'data-active'?: boolean
  'data-loading'?: boolean
  'data-disabled'?: boolean
  'data-testid'?: string
  'data-test-id'?: string
  'data-id'?: string
  'data-state'?: string
}

// Pure Button component using only Vanilla Extract recipes
export type ButtonProps = {
  // Recipe variants
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'success'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'icon'
  fullWidth?: boolean
  children?: ReactNode
  className?: string
  disabled?: boolean
  loading?: boolean

  // HTML button attributes
  type?: 'button' | 'submit' | 'reset'
  form?: string
  formAction?: string
  formMethod?: 'get' | 'post'
  formTarget?: '_blank' | '_self' | '_parent' | '_top'
  formNoValidate?: boolean
  name?: string
  value?: string | number | readonly string[]
  autoFocus?: boolean

  // General HTML attributes
  id?: string
  role?: string
  title?: string
  tabIndex?: number
  style?: CSSProperties
} & ButtonEventHandlers & ButtonAriaAttributes & ButtonDataAttributes

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      disabled = false,
      type = 'button',
      style,
      // Event handlers
      onClick,
      onDoubleClick,
      onMouseDown,
      onMouseUp,
      onMouseEnter,
      onMouseLeave,
      onFocus,
      onBlur,
      onKeyDown,
      onKeyUp,
      onKeyPress,
      // ARIA attributes
      'aria-label': ariaLabel,
      'aria-pressed': ariaPressed,
      'aria-expanded': ariaExpanded,
      'aria-describedby': ariaDescribedby,
      'aria-labelledby': ariaLabelledby,
      'aria-controls': ariaControls,
      'aria-haspopup': ariaHaspopup,
      'aria-current': ariaCurrent,
      'aria-disabled': ariaDisabled,
      'aria-hidden': ariaHidden,
      'aria-invalid': ariaInvalid,
      'aria-live': ariaLive,
      'aria-busy': ariaBusy,
      // Data attributes
      'data-active': dataActive,
      'data-loading': dataLoading,
      'data-disabled': dataDisabled,
      'data-testid': dataTestId,
      'data-test-id': dataTestId2,
      'data-id': dataId,
      'data-state': dataState,
      ...htmlProps
    },
    ref
  ) => {
    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={clsx(
          button({
            variant,
            size,
            fullWidth,
            loading,
          }),
          className
        )}
        style={style}
        onClick={isDisabled ? undefined : onClick}
        onDoubleClick={isDisabled ? undefined : onDoubleClick}
        onMouseDown={isDisabled ? undefined : onMouseDown}
        onMouseUp={isDisabled ? undefined : onMouseUp}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={isDisabled ? undefined : onKeyDown}
        onKeyUp={isDisabled ? undefined : onKeyUp}
        onKeyPress={isDisabled ? undefined : onKeyPress}
        aria-label={ariaLabel}
        aria-pressed={ariaPressed}
        aria-expanded={ariaExpanded}
        aria-describedby={ariaDescribedby}
        aria-labelledby={ariaLabelledby}
        aria-controls={ariaControls}
        aria-haspopup={ariaHaspopup}
        aria-current={ariaCurrent}
        aria-disabled={ariaDisabled || isDisabled}
        aria-hidden={ariaHidden}
        aria-invalid={ariaInvalid}
        aria-live={ariaLive}
        aria-busy={ariaBusy || loading}
        data-active={dataActive}
        data-loading={dataLoading || loading}
        data-disabled={dataDisabled || isDisabled}
        data-testid={dataTestId}
        data-test-id={dataTestId2}
        data-id={dataId}
        data-state={dataState}
        {...htmlProps}
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

// Loading spinner component with proper typing
const LoadingSpinner = (): ReactElement => (
  <svg
    className="animate-spin h-4 w-4"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    role="img"
    aria-label="Loading"
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
