import { forwardRef, type ReactNode, type CSSProperties, type MouseEvent } from 'react'
import { Text } from '@/components/primitives/TextVE'

// Field label event handlers
type FieldLabelEventHandlers = {
  onClick?: (event: MouseEvent<HTMLLabelElement>) => void
  onMouseEnter?: (event: MouseEvent<HTMLLabelElement>) => void
  onMouseLeave?: (event: MouseEvent<HTMLLabelElement>) => void
}

// Field label component props with exact typing
export type FieldLabelProps = {
  children: ReactNode
  htmlFor?: string
  required?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg'
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'
  color?: 'inherit' | 'primary' | 'secondary' | 'text' | 'textSecondary' | 'textTertiary' | 'error' | 'warning' | 'success'
  className?: string
  style?: CSSProperties

  // HTML attributes
  id?: string
  title?: string

  // ARIA attributes
  'aria-label'?: string
  'aria-describedby'?: string

  // Data attributes
  'data-testid'?: string
  'data-test-id'?: string
  'data-state'?: string
} & FieldLabelEventHandlers

export const FieldLabel = forwardRef<HTMLLabelElement, FieldLabelProps>(
  (
    {
      children,
      htmlFor,
      required = false,
      size = 'sm',
      weight = 'medium',
      color = 'textSecondary',
      className,
      style,
      onClick,
      onMouseEnter,
      onMouseLeave,
      id,
      title,
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedby,
      'data-testid': dataTestId,
      'data-test-id': dataTestId2,
      'data-state': dataState,
    },
    ref
  ) => {
    return (
      <Text
        ref={ref}
        as="label"
        htmlFor={htmlFor}
        size={size}
        weight={weight}
        color={color}
        className={className}
        style={style}
        onClick={onClick as ((event: MouseEvent<HTMLElement>) => void) | undefined}
        onMouseEnter={onMouseEnter as ((event: MouseEvent<HTMLElement>) => void) | undefined}
        onMouseLeave={onMouseLeave as ((event: MouseEvent<HTMLElement>) => void) | undefined}
        id={id}
        title={title}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedby}
        data-testid={dataTestId}
        data-test-id={dataTestId2}
        data-state={dataState}
        data-field-label="true"
        data-required={required}
      >
        {children}
        {required && (
          <Text as="span" color="error" weight="bold">
            {' *'}
          </Text>
        )}
      </Text>
    )
  }
)

FieldLabel.displayName = 'FieldLabel'

// Field group for organizing related fields
export type FieldGroupProps = {
  children: ReactNode
  orientation?: 'horizontal' | 'vertical'
  spacing?: 'tight' | 'normal' | 'loose'
  className?: string
  style?: CSSProperties
  'aria-label'?: string
  'aria-labelledby'?: string
}

export const FieldGroup = forwardRef<HTMLDivElement, FieldGroupProps>(
  (
    {
      children,
      orientation = 'vertical',
      spacing = 'normal',
      className,
      style,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledby,
    },
    ref
  ) => {
    const spacingMap = {
      tight: '8px',
      normal: '16px',
      loose: '24px',
    }

    const groupStyles: CSSProperties = {
      display: 'flex',
      flexDirection: orientation === 'horizontal' ? 'row' : 'column',
      gap: spacingMap[spacing],
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
        data-orientation={orientation}
        data-spacing={spacing}
      >
        {children}
      </div>
    )
  }
)

FieldGroup.displayName = 'FieldGroup'

// Error message component for field validation
export type FieldErrorProps = {
  children: ReactNode
  visible?: boolean
  className?: string
  style?: CSSProperties
  'aria-live'?: 'off' | 'polite' | 'assertive'
}

export const FieldError = forwardRef<HTMLDivElement, FieldErrorProps>(
  (
    {
      children,
      visible = true,
      className,
      style,
      'aria-live': ariaLive = 'polite',
    },
    ref
  ) => {
    if (!visible) return null

    const errorStyles: CSSProperties = {
      marginTop: '4px',
      ...style,
    }

    return (
      <Text
        ref={ref}
        size="xs"
        color="error"
        className={className}
        style={errorStyles}
        role="alert"
        aria-live={ariaLive}
        data-field-error="true"
      >
        {children}
      </Text>
    )
  }
)

FieldError.displayName = 'FieldError'