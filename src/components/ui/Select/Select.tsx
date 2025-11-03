import { forwardRef, type FC, type ReactNode, type CSSProperties, type MouseEvent } from 'react'
import * as SelectPrimitive from '@radix-ui/react-select'
import { ChevronDown, ChevronUp, Check } from '@/utils/optimizedIcons'

// TODO: Convert to Vanilla Extract CSS
// Temporarily using inline styles and classes to fix build errors

// Select Component Types
export interface SelectProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  children: ReactNode
  name?: string
  required?: boolean
  'aria-label'?: string
  size?: string
  fullWidth?: boolean
}

export interface SelectOptionProps {
  value: string
  disabled?: boolean
  children: ReactNode
}

export interface SelectGroupProps {
  label?: string
  children: ReactNode
}

// Temporary styled components using inline styles
interface SelectTriggerProps {
  style?: CSSProperties
  'aria-label'?: string
  children?: ReactNode
}

const SelectTrigger = forwardRef<HTMLButtonElement, SelectTriggerProps>((props, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: '8px',
      padding: '8px 12px',
      fontSize: '14px',
      lineHeight: '1',
      gap: '8px',
      backgroundColor: 'var(--colors-surface)',
      color: 'var(--colors-text)',
      border: '1px solid var(--colors-border)',
      cursor: 'pointer',
      minWidth: '160px',
      ...props.style
    }}
    {...props}
  />
))
SelectTrigger.displayName = 'SelectTrigger'

interface SelectContentProps {
  style?: CSSProperties
  children?: ReactNode
}

const SelectContent = forwardRef<HTMLDivElement, SelectContentProps>((props, ref) => (
  <SelectPrimitive.Content
    ref={ref}
    style={{
      overflow: 'hidden',
      backgroundColor: 'var(--colors-surface)',
      borderRadius: '8px',
      border: '1px solid var(--colors-border)',
      boxShadow: '0 10px 38px -10px rgba(0, 0, 0, 0.35), 0 10px 20px -15px rgba(0, 0, 0, 0.2)',
      ...props.style
    }}
    {...props}
  />
))
SelectContent.displayName = 'SelectContent'

interface SelectViewportProps {
  style?: CSSProperties
  children?: ReactNode
}

const SelectViewport = forwardRef<HTMLDivElement, SelectViewportProps>((props, ref) => (
  <SelectPrimitive.Viewport
    ref={ref}
    style={{
      padding: '4px',
      ...props.style
    }}
    {...props}
  />
))
SelectViewport.displayName = 'SelectViewport'

interface SelectItemProps {
  style?: CSSProperties
  onMouseEnter?: (e: MouseEvent<HTMLDivElement>) => void
  onMouseLeave?: (e: MouseEvent<HTMLDivElement>) => void
  value: string
  disabled?: boolean
  children?: ReactNode
}

const SelectItem = forwardRef<HTMLDivElement, SelectItemProps>(({ style, onMouseEnter, onMouseLeave, value, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    value={value}
    style={{
      fontSize: '14px',
      lineHeight: '1',
      color: 'var(--colors-text)',
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      padding: '8px 8px 8px 32px',
      position: 'relative',
      userSelect: 'none',
      cursor: 'pointer',
      ...style
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = 'var(--colors-gray800)'
      onMouseEnter?.(e)
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = 'transparent'
      onMouseLeave?.(e)
    }}
    {...props}
  />
))
SelectItem.displayName = 'SelectItem'

interface SelectLabelProps {
  style?: CSSProperties
  children?: ReactNode
}

const SelectLabel = forwardRef<HTMLDivElement, SelectLabelProps>((props, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    style={{
      padding: '8px 8px 4px 8px',
      fontSize: '12px',
      lineHeight: '20px',
      color: 'var(--colors-gray500)',
      ...props.style
    }}
    {...props}
  />
))
SelectLabel.displayName = 'SelectLabel'

interface SelectSeparatorProps {
  style?: CSSProperties
}

const SelectSeparator = forwardRef<HTMLDivElement, SelectSeparatorProps>((props, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    style={{
      height: '1px',
      backgroundColor: 'var(--colors-gray700)',
      margin: '4px',
      ...props.style
    }}
    {...props}
  />
))
SelectSeparator.displayName = 'SelectSeparator'

interface StyledItemIndicatorProps {
  style?: CSSProperties
  children?: ReactNode
}

const StyledItemIndicator = forwardRef<HTMLSpanElement, StyledItemIndicatorProps>((props, ref) => (
  <SelectPrimitive.ItemIndicator
    ref={ref}
    style={{
      position: 'absolute',
      left: '0',
      width: '32px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      ...props.style
    }}
    {...props}
  />
))
StyledItemIndicator.displayName = 'StyledItemIndicator'

interface StyledScrollUpButtonProps {
  style?: CSSProperties
  children?: ReactNode
}

const StyledScrollUpButton = forwardRef<HTMLDivElement, StyledScrollUpButtonProps>((props, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '24px',
      backgroundColor: 'var(--colors-surface)',
      color: 'var(--colors-secondary)',
      cursor: 'default',
      ...props.style
    }}
    {...props}
  />
))
StyledScrollUpButton.displayName = 'StyledScrollUpButton'

interface StyledScrollDownButtonProps {
  style?: CSSProperties
  children?: ReactNode
}

const StyledScrollDownButton = forwardRef<HTMLDivElement, StyledScrollDownButtonProps>((props, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '24px',
      backgroundColor: 'var(--colors-surface)',
      color: 'var(--colors-secondary)',
      cursor: 'default',
      ...props.style
    }}
    {...props}
  />
))
StyledScrollDownButton.displayName = 'StyledScrollDownButton'

// Main Select component
export const Select: FC<SelectProps> = ({
  value,
  defaultValue,
  onValueChange,
  placeholder = 'Select an option...',
  disabled,
  children,
  name,
  required,
  'aria-label': ariaLabel,
  size: _size, // Prefix with underscore to indicate intentionally unused
  fullWidth,
}) => {
  return (
    <SelectPrimitive.Root
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      disabled={disabled}
      name={name}
      required={required}
    >
      <SelectTrigger
        aria-label={ariaLabel}
        style={{
          width: fullWidth ? '100%' : 'auto',
          minWidth: fullWidth ? '100%' : '160px',
        }}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon>
          <ChevronDown size={16} />
        </SelectPrimitive.Icon>
      </SelectTrigger>

      <SelectPrimitive.Portal>
        <SelectContent>
          <StyledScrollUpButton>
            <ChevronUp size={16} />
          </StyledScrollUpButton>
          <SelectViewport>{children}</SelectViewport>
          <StyledScrollDownButton>
            <ChevronDown size={16} />
          </StyledScrollDownButton>
        </SelectContent>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}

// Select Option component
export const SelectOption: FC<SelectOptionProps> = ({
  value,
  disabled,
  children,
}) => {
  return (
    <SelectItem value={value} disabled={disabled}>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <StyledItemIndicator>
        <Check size={16} />
      </StyledItemIndicator>
    </SelectItem>
  )
}

// Select Group component for grouping options
export const SelectGroup: FC<SelectGroupProps> = ({ children, label }) => {
  return (
    <SelectPrimitive.Group>
      {label && <SelectLabel>{label}</SelectLabel>}
      {children}
    </SelectPrimitive.Group>
  )
}