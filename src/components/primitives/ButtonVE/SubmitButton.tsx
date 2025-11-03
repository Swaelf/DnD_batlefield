import { forwardRef } from 'react'
import { Button, type ButtonProps } from './Button'

// Submit Button variant with form handling
export type SubmitButtonProps = Omit<ButtonProps, 'type'> & {
  form?: string
  formAction?: string
}

export const SubmitButton = forwardRef<HTMLButtonElement, SubmitButtonProps>(
  ({ loading = false, children = 'Submit', ...props }, ref) => (
    <Button
      ref={ref}
      type="submit"
      loading={loading}
      {...props}
    >
      {children}
    </Button>
  )
)

SubmitButton.displayName = 'SubmitButton'
