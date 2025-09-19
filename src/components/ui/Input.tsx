import React, { forwardRef } from 'react'
import { styled } from '@/styles/theme.config'
import type { ComponentProps } from '@/types'
import { Box, Text } from '@/components/primitives'

const InputBase = styled('input', {
  all: 'unset',
  width: '100%',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '$base',
  fontFamily: '$system',
  color: '$gray100',
  backgroundColor: '$gray800',
  border: '1px solid $gray600',
  borderRadius: '$md',
  padding: '$3',
  transition: '$base',
  boxSizing: 'border-box',

  '&::placeholder': {
    color: '$gray500',
  },

  '&:focus': {
    borderColor: '$primary',
    boxShadow: '0 0 0 2px rgba($colors$primary, 0.2)',
  },

  '&:hover:not(:focus)': {
    borderColor: '$gray500',
  },

  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
    '&:hover': {
      borderColor: '$gray600',
    },
  },

  variants: {
    size: {
      sm: {
        fontSize: '$sm',
        padding: '$2',
        height: '32px',
      },
      md: {
        fontSize: '$base',
        padding: '$3',
        height: '40px',
      },
      lg: {
        fontSize: '$md',
        padding: '$4',
        height: '48px',
      },
    },

    variant: {
      default: {
        backgroundColor: '$gray800',
        borderColor: '$gray600',
      },
      outlined: {
        backgroundColor: 'transparent',
        borderColor: '$gray600',
      },
      filled: {
        backgroundColor: '$gray700',
        borderColor: 'transparent',
      },
      ghost: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        '&:hover': {
          backgroundColor: '$gray800',
        },
        '&:focus': {
          backgroundColor: '$gray800',
          borderColor: '$primary',
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
      warning: {
        borderColor: '$warning',
        '&:focus': {
          borderColor: '$warning',
          boxShadow: '0 0 0 2px rgba($colors$warning, 0.2)',
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

export const Input = forwardRef<
  React.ElementRef<typeof InputBase>,
  ComponentProps<typeof InputBase>
>(({ ...props }, ref) => {
  return <InputBase ref={ref} {...props} />
})

Input.displayName = 'Input'

// Number input with built-in controls
export const NumberInput = forwardRef<
  React.ElementRef<typeof InputBase>,
  ComponentProps<typeof InputBase> & {
    min?: number
    max?: number
    step?: number
  }
>(({ min, max, step = 1, ...props }, ref) => {
  return (
    <InputBase
      ref={ref}
      type="number"
      min={min}
      max={max}
      step={step}
      {...props}
    />
  )
})

NumberInput.displayName = 'NumberInput'

// Color input
export const ColorInput = forwardRef<
  React.ElementRef<typeof InputBase>,
  ComponentProps<typeof InputBase>
>(({ ...props }, ref) => {
  return (
    <InputBase
      ref={ref}
      type="color"
      css={{
        padding: '$1',
        cursor: 'pointer',
        '&::-webkit-color-swatch-wrapper': {
          padding: 0,
          border: 'none',
        },
        '&::-webkit-color-swatch': {
          border: 'none',
          borderRadius: '$sm',
        },
      }}
      {...props}
    />
  )
})

ColorInput.displayName = 'ColorInput'

// Search input with icon
const SearchInputContainer = styled(Box, {
  position: 'relative',
  width: '100%',
})

const SearchIcon = styled('div', {
  position: 'absolute',
  left: '$3',
  top: '50%',
  transform: 'translateY(-50%)',
  color: '$gray500',
  pointerEvents: 'none',
  zIndex: 1,
})

export const SearchInput = forwardRef<
  React.ElementRef<typeof InputBase>,
  ComponentProps<typeof InputBase> & {
    icon?: React.ReactNode
  }
>(({ icon, ...props }, ref) => {
  return (
    <SearchInputContainer>
      {icon && <SearchIcon>{icon}</SearchIcon>}
      <InputBase
        ref={ref}
        type="search"
        css={{
          paddingLeft: icon ? '$10' : '$3',
        }}
        {...props}
      />
    </SearchInputContainer>
  )
})

SearchInput.displayName = 'SearchInput'

// Textarea
export const Textarea = styled('textarea', {
  all: 'unset',
  width: '100%',
  minHeight: '80px',
  fontSize: '$base',
  fontFamily: '$system',
  color: '$gray100',
  backgroundColor: '$gray800',
  border: '1px solid $gray600',
  borderRadius: '$md',
  padding: '$3',
  transition: '$base',
  resize: 'vertical',
  boxSizing: 'border-box',

  '&::placeholder': {
    color: '$gray500',
  },

  '&:focus': {
    borderColor: '$primary',
    boxShadow: '0 0 0 2px rgba($colors$primary, 0.2)',
  },

  '&:hover:not(:focus)': {
    borderColor: '$gray500',
  },

  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
    resize: 'none',
  },

  variants: {
    size: {
      sm: {
        fontSize: '$sm',
        padding: '$2',
        minHeight: '60px',
      },
      md: {
        fontSize: '$base',
        padding: '$3',
        minHeight: '80px',
      },
      lg: {
        fontSize: '$md',
        padding: '$4',
        minHeight: '120px',
      },
    },

    resize: {
      none: { resize: 'none' },
      both: { resize: 'both' },
      horizontal: { resize: 'horizontal' },
      vertical: { resize: 'vertical' },
    },
  },

  defaultVariants: {
    size: 'md',
    resize: 'vertical',
  },
})

// Field wrapper for labels and validation messages
export const Field = styled(Box, {
  display: 'flex',
  flexDirection: 'column',
  gap: '$2',
  width: '100%',
})

export const FieldLabel = styled('label', {
  fontSize: '$sm',
  fontWeight: '$medium',
  color: '$gray300',
  userSelect: 'none',
  cursor: 'pointer',

  variants: {
    required: {
      true: {
        '&::after': {
          content: ' *',
          color: '$error',
        },
      },
    },

    disabled: {
      true: {
        opacity: 0.5,
        cursor: 'not-allowed',
      },
    },
  },
})

export const FieldMessage = styled(Text, {
  variants: {
    state: {
      default: { color: '$gray500' },
      error: { color: '$error' },
      success: { color: '$success' },
      warning: { color: '$warning' },
    },
  },

  defaultVariants: {
    size: 'sm',
    state: 'default',
  },
})

export type InputProps = ComponentProps<typeof Input>
export type NumberInputProps = ComponentProps<typeof NumberInput>
export type ColorInputProps = ComponentProps<typeof ColorInput>
export type SearchInputProps = ComponentProps<typeof SearchInput>
export type TextareaProps = ComponentProps<typeof Textarea>
export type FieldProps = ComponentProps<typeof Field>
export type FieldLabelProps = ComponentProps<typeof FieldLabel>
export type FieldMessageProps = ComponentProps<typeof FieldMessage>