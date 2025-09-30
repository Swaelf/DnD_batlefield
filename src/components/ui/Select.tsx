import React from 'react'
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
  children: React.ReactNode
  name?: string
  required?: boolean
  'aria-label'?: string
  size?: string
  fullWidth?: boolean
}

export interface SelectOptionProps {
  value: string
  disabled?: boolean
  children: React.ReactNode
}

export interface SelectGroupProps {
  label?: string
  children: React.ReactNode
}

// Temporary styled components using inline styles
const SelectTrigger = React.forwardRef<HTMLButtonElement, any>((props, ref) => (
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

const SelectContent = React.forwardRef<HTMLDivElement, any>((props, ref) => (
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

const SelectViewport = React.forwardRef<HTMLDivElement, any>((props, ref) => (
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

const SelectItem = React.forwardRef<HTMLDivElement, any>(({ style, onMouseEnter, onMouseLeave, value, ...props }, ref) => (
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

const SelectLabel = React.forwardRef<HTMLDivElement, any>((props, ref) => (
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

const SelectSeparator = React.forwardRef<HTMLDivElement, any>((props, ref) => (
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

const StyledItemIndicator = React.forwardRef<HTMLSpanElement, any>((props, ref) => (
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

const StyledScrollUpButton = React.forwardRef<HTMLDivElement, any>((props, ref) => (
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

const StyledScrollDownButton = React.forwardRef<HTMLDivElement, any>((props, ref) => (
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
export const Select: React.FC<SelectProps> = ({
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
export const SelectOption: React.FC<SelectOptionProps> = ({
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
export const SelectGroup: React.FC<SelectGroupProps> = ({ children, label }) => {
  return (
    <SelectPrimitive.Group>
      {label && <SelectLabel>{label}</SelectLabel>}
      {children}
    </SelectPrimitive.Group>
  )
}

// Export renamed to avoid conflicts
export const SelectSeparator_Export = SelectSeparator

// Export types
export type SelectProps_Export = SelectProps
export type SelectOptionProps_Export = SelectOptionProps
export type SelectGroupProps_Export = SelectGroupProps