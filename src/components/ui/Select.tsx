import React from 'react'
import * as SelectPrimitive from '@radix-ui/react-select'
import { styled, keyframes } from '@/styles/theme.config'
import { ChevronDown, ChevronUp, Check } from 'lucide-react'

// Animations
const slideDownAndFade = keyframes({
  '0%': { opacity: 0, transform: 'translateY(-2px)' },
  '100%': { opacity: 1, transform: 'translateY(0)' },
})

const slideUpAndFade = keyframes({
  '0%': { opacity: 0, transform: 'translateY(2px)' },
  '100%': { opacity: 1, transform: 'translateY(0)' },
})

// Select trigger (the main button that shows the selected value)
const SelectTrigger = styled(SelectPrimitive.Trigger, {
  all: 'unset',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderRadius: '$md',
  padding: '$3',
  fontSize: '$base',
  lineHeight: 1,
  height: '40px',
  gap: '$2',
  backgroundColor: '$gray800',
  color: '$gray100',
  border: '1px solid $gray600',
  cursor: 'pointer',
  transition: '$base',
  boxSizing: 'border-box',

  '&:hover': {
    borderColor: '$gray500',
  },

  '&:focus': {
    borderColor: '$primary',
    boxShadow: '0 0 0 2px rgba($colors$primary, 0.2)',
  },

  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
    '&:hover': {
      borderColor: '$gray600',
    },
  },

  '&[data-placeholder]': {
    color: '$gray500',
  },

  variants: {
    size: {
      sm: {
        height: '32px',
        padding: '$2',
        fontSize: '$sm',
      },
      md: {
        height: '40px',
        padding: '$3',
        fontSize: '$base',
      },
      lg: {
        height: '48px',
        padding: '$4',
        fontSize: '$md',
      },
    },

    variant: {
      default: {
        backgroundColor: '$gray800',
        borderColor: '$gray600',
      },
      outline: {
        backgroundColor: 'transparent',
        borderColor: '$gray600',
      },
      ghost: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        '&:hover': {
          backgroundColor: '$gray800',
          borderColor: '$gray600',
        },
      },
    },

    state: {
      default: {},
      error: {
        borderColor: '$error',
        '&:focus': {
          borderColor: '$error',
          boxShadow: '0 0 0 2px rgba($colors$error, 0.2)',
        },
      },
      success: {
        borderColor: '$success',
        '&:focus': {
          borderColor: '$success',
          boxShadow: '0 0 0 2px rgba($colors$success, 0.2)',
        },
      },
    },

    fullWidth: {
      true: {
        width: '100%',
      },
    },
  },

  defaultVariants: {
    size: 'md',
    variant: 'default',
    state: 'default',
  },
})

const SelectIcon = styled(SelectPrimitive.Icon, {
  color: '$gray400',
  transition: '$fast',

  '[data-state=open] &': {
    transform: 'rotate(180deg)',
  },
})

// Content container (the dropdown)
const SelectContent = styled(SelectPrimitive.Content, {
  overflow: 'hidden',
  backgroundColor: '$gray800',
  borderRadius: '$md',
  boxShadow: '$lg',
  border: '1px solid $gray600',
  zIndex: '$popover',
  minWidth: 'var(--radix-select-trigger-width)',
  maxHeight: 'var(--radix-select-content-available-height)',

  '&[data-side=top]': {
    animationName: slideUpAndFade,
    animationDuration: '200ms',
  },

  '&[data-side=bottom]': {
    animationName: slideDownAndFade,
    animationDuration: '200ms',
  },

  variants: {
    size: {
      sm: {
        maxHeight: '200px',
      },
      md: {
        maxHeight: '300px',
      },
      lg: {
        maxHeight: '400px',
      },
    },
  },

  defaultVariants: {
    size: 'md',
  },
})

const SelectViewport = styled(SelectPrimitive.Viewport, {
  padding: '$1',
})

// Individual option items
const SelectItem = styled(SelectPrimitive.Item, {
  all: 'unset',
  fontSize: '$base',
  lineHeight: 1,
  color: '$gray200',
  borderRadius: '$sm',
  display: 'flex',
  alignItems: 'center',
  height: '36px',
  paddingX: '$3',
  position: 'relative',
  userSelect: 'none',
  cursor: 'pointer',
  transition: '$fast',

  '&[data-disabled]': {
    color: '$gray600',
    pointerEvents: 'none',
  },

  '&[data-highlighted]': {
    backgroundColor: '$primary',
    color: '$white',
  },

  variants: {
    size: {
      sm: {
        height: '28px',
        paddingX: '$2',
        fontSize: '$sm',
      },
      md: {
        height: '36px',
        paddingX: '$3',
        fontSize: '$base',
      },
      lg: {
        height: '44px',
        paddingX: '$4',
        fontSize: '$md',
      },
    },
  },

  defaultVariants: {
    size: 'md',
  },
})

const SelectItemIndicator = styled(SelectPrimitive.ItemIndicator, {
  position: 'absolute',
  right: '$3',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'inherit',
})

const SelectItemText = styled(SelectPrimitive.ItemText, {
  flex: 1,
})

// Label for option groups
const SelectLabel = styled(SelectPrimitive.Label, {
  padding: '$2 $3',
  fontSize: '$sm',
  color: '$gray400',
  fontWeight: '$medium',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
})

// Separator between groups
const SelectSeparator = styled(SelectPrimitive.Separator, {
  height: '1px',
  backgroundColor: '$gray700',
  margin: '$1',
})

// Scroll buttons
const SelectScrollUpButton = styled(SelectPrimitive.ScrollUpButton, {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '$6',
  backgroundColor: '$gray800',
  color: '$gray400',
  cursor: 'default',
})

const SelectScrollDownButton = styled(SelectPrimitive.ScrollDownButton, {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '$6',
  backgroundColor: '$gray800',
  color: '$gray400',
  cursor: 'default',
})

// Main Select component
type SelectProps = {
  children: React.ReactNode
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  placeholder?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline' | 'ghost'
  state?: 'default' | 'error' | 'success'
  fullWidth?: boolean
}

export const Select: React.FC<SelectProps> = ({
  children,
  value,
  defaultValue,
  onValueChange,
  disabled,
  placeholder,
  size = 'md',
  variant = 'default',
  state = 'default',
  fullWidth = false,
}) => {
  return (
    <SelectPrimitive.Root
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <SelectTrigger
        size={size}
        variant={variant}
        state={state}
        fullWidth={fullWidth}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectIcon>
          <ChevronDown size={16} />
        </SelectIcon>
      </SelectTrigger>

      <SelectPrimitive.Portal>
        <SelectContent size={size}>
          <SelectScrollUpButton>
            <ChevronUp size={14} />
          </SelectScrollUpButton>
          <SelectViewport>
            {children}
          </SelectViewport>
          <SelectScrollDownButton>
            <ChevronDown size={14} />
          </SelectScrollDownButton>
        </SelectContent>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}

// Select Option component
type SelectOptionProps = {
  value: string
  children: React.ReactNode
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export const SelectOption: React.FC<SelectOptionProps> = ({
  value,
  children,
  disabled,
  size = 'md',
}) => {
  return (
    <SelectItem value={value} disabled={disabled} size={size}>
      <SelectItemText>{children}</SelectItemText>
      <SelectItemIndicator>
        <Check size={14} />
      </SelectItemIndicator>
    </SelectItem>
  )
}

// Select Group component
type SelectGroupProps = {
  children: React.ReactNode
  label?: string
}

export const SelectGroup: React.FC<SelectGroupProps> = ({ children, label }) => {
  return (
    <SelectPrimitive.Group>
      {label && <SelectLabel>{label}</SelectLabel>}
      {children}
    </SelectPrimitive.Group>
  )
}

// Export separator for convenience
export const SelectSeparator_Export = SelectSeparator

// Typed exports
export type SelectProps_Export = SelectProps
export type SelectOptionProps_Export = SelectOptionProps
export type SelectGroupProps_Export = SelectGroupProps