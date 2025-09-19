import { styled } from '@/styles/theme.config'
import type { ComponentProps } from '@/types'

export const Button = styled('button', {
  // Reset and base styles
  all: 'unset',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  userSelect: 'none',
  cursor: 'pointer',
  fontFamily: '$dnd',
  fontWeight: '$medium',
  borderRadius: '$md',
  border: '1px solid transparent',
  transition: '$base',
  textDecoration: 'none',
  outline: 'none',

  // Focus styles
  '&:focus-visible': {
    boxShadow: '0 0 0 2px $colors$background, 0 0 0 4px $colors$primary',
  },

  // Disabled styles
  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
    pointerEvents: 'none',
  },

  // Loading styles
  '&[data-loading="true"]': {
    color: 'transparent',
    cursor: 'default',
  },

  variants: {
    variant: {
      primary: {
        backgroundColor: '$primary',
        color: '$white',
        '&:hover': {
          backgroundColor: '#A12A14', // Darker red
          boxShadow: '$md',
        },
        '&:active': {
          backgroundColor: '#7A1F10', // Even darker red
          transform: 'translateY(1px)',
        },
      },
      secondary: {
        backgroundColor: '$secondary',
        color: '$black',
        '&:hover': {
          backgroundColor: '#D4B975', // Lighter gold
          boxShadow: '$md',
        },
        '&:active': {
          backgroundColor: '#B8985A', // Darker gold
          transform: 'translateY(1px)',
        },
      },
      outline: {
        backgroundColor: 'transparent',
        color: '$gray200',
        borderColor: '$gray600',
        '&:hover': {
          backgroundColor: '$gray800',
          borderColor: '$gray500',
        },
        '&:active': {
          backgroundColor: '$gray700',
        },
      },
      ghost: {
        backgroundColor: 'transparent',
        color: '$gray200',
        '&:hover': {
          backgroundColor: '$gray800',
        },
        '&:active': {
          backgroundColor: '$gray700',
        },
      },
      destructive: {
        backgroundColor: '$error',
        color: '$white',
        '&:hover': {
          backgroundColor: '#DC2626', // Darker red
          boxShadow: '$md',
        },
        '&:active': {
          backgroundColor: '#B91C1C', // Even darker red
          transform: 'translateY(1px)',
        },
      },
      success: {
        backgroundColor: '$success',
        color: '$white',
        '&:hover': {
          backgroundColor: '#059669', // Darker green
          boxShadow: '$md',
        },
        '&:active': {
          backgroundColor: '#047857', // Even darker green
          transform: 'translateY(1px)',
        },
      },
    },

    size: {
      xs: {
        height: '24px',
        px: '$2',
        fontSize: '$xs',
        gap: '$1',
      },
      sm: {
        height: '32px',
        px: '$3',
        fontSize: '$sm',
        gap: '$2',
      },
      md: {
        height: '40px',
        px: '$4',
        fontSize: '$base',
        gap: '$2',
      },
      lg: {
        height: '$toolButtonSize',
        px: '$5',
        fontSize: '$md',
        gap: '$3',
      },
      xl: {
        height: '56px',
        px: '$6',
        fontSize: '$lg',
        gap: '$3',
      },
      icon: {
        size: '$toolButtonSize',
        p: 0,
        borderRadius: '$md',
      },
    },

    fullWidth: {
      true: {
        width: '100%',
      },
    },

    rounded: {
      true: {
        borderRadius: '$round',
      },
    },

    elevation: {
      none: {},
      sm: {
        boxShadow: '$sm',
        '&:hover': {
          boxShadow: '$md',
        },
      },
      md: {
        boxShadow: '$md',
        '&:hover': {
          boxShadow: '$lg',
        },
      },
      dnd: {
        boxShadow: '$dnd',
        '&:hover': {
          boxShadow: '$lg, $dnd',
        },
      },
    },
  },

  // Compound variants for specific combinations
  compoundVariants: [
    {
      variant: 'outline',
      size: 'icon',
      css: {
        borderColor: '$gray600',
        '&:hover': {
          borderColor: '$primary',
          backgroundColor: 'rgba($colors$primary, 0.1)',
        },
      },
    },
    {
      variant: 'ghost',
      size: 'icon',
      css: {
        '&:hover': {
          backgroundColor: 'rgba($colors$primary, 0.1)',
          color: '$primary',
        },
      },
    },
  ],

  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
})

// Button with loading state
export const LoadingButton = styled(Button, {
  '&[data-loading="true"]::after': {
    content: '',
    position: 'absolute',
    width: '16px',
    height: '16px',
    border: '2px solid transparent',
    borderTop: '2px solid currentColor',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },

  '@keyframes spin': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
  },
})

// Icon button specifically for tools
export const ToolButton = styled(Button, {
  size: '$toolButtonSize',
  borderRadius: '$md',
  backgroundColor: 'transparent',
  color: '$gray300',
  border: '1px solid $gray700',
  transition: '$fast',

  '&:hover': {
    backgroundColor: '$gray800',
    borderColor: '$gray600',
    color: '$gray100',
  },

  '&[data-active="true"]': {
    backgroundColor: '$primary',
    borderColor: '$primary',
    color: '$white',
    boxShadow: '$dnd',
  },

  '&:active': {
    transform: 'scale(0.95)',
  },

  variants: {
    active: {
      true: {
        backgroundColor: '$primary',
        borderColor: '$primary',
        color: '$white',
        boxShadow: '$dnd',
      },
    },
  },
})

export type ButtonProps = ComponentProps<typeof Button>
export type LoadingButtonProps = ComponentProps<typeof LoadingButton> & {
  loading?: boolean
}
export type ToolButtonProps = ComponentProps<typeof ToolButton>