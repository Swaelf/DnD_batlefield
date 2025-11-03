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
