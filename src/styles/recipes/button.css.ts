import { recipe, type RecipeVariants } from '@vanilla-extract/recipes'
import { vars } from '../theme.css'

export const button = recipe({
  base: {
    // Reset
    all: 'unset',
    boxSizing: 'border-box',

    // Layout
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    gap: vars.space[2],

    // Typography
    fontFamily: vars.fonts.base,
    fontWeight: vars.fontWeights.medium,
    lineHeight: '1',
    textAlign: 'center',
    textDecoration: 'none',
    whiteSpace: 'nowrap',

    // Interaction
    cursor: 'pointer',
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent',

    // Visual
    borderRadius: vars.radii.md,
    transition: vars.transitions.fast,

    // States
    ':hover': {
      transform: 'scale(1.02)',
    },

    ':active': {
      transform: 'scale(0.98)',
    },

    ':focus-visible': {
      outline: `2px solid ${vars.colors.primary}`,
      outlineOffset: '2px',
    },

    ':disabled': {
      opacity: 0.6,
      cursor: 'not-allowed',
      transform: 'none',
    },

    selectors: {
      '&:disabled:hover': {
        transform: 'none',
      },
    },
  },

  variants: {
    variant: {
      primary: {
        backgroundColor: vars.colors.primary,
        color: vars.colors.textInverse,
        border: `1px solid ${vars.colors.primary}`,

        ':hover': {
          backgroundColor: vars.colors.primaryHover,
          borderColor: vars.colors.primaryHover,
        },

        ':active': {
          backgroundColor: vars.colors.primaryActive,
          borderColor: vars.colors.primaryActive,
        },
      },

      secondary: {
        backgroundColor: vars.colors.secondary,
        color: vars.colors.textInverse,
        border: `1px solid ${vars.colors.secondary}`,

        ':hover': {
          backgroundColor: vars.colors.secondaryHover,
          borderColor: vars.colors.secondaryHover,
        },

        ':active': {
          backgroundColor: vars.colors.secondaryActive,
          borderColor: vars.colors.secondaryActive,
        },
      },

      outline: {
        backgroundColor: 'transparent',
        color: vars.colors.text,
        border: `1px solid ${vars.colors.border}`,

        ':hover': {
          backgroundColor: vars.colors.surfaceHover,
          borderColor: vars.colors.borderHover,
        },

        ':active': {
          backgroundColor: vars.colors.surface,
          borderColor: vars.colors.borderActive,
        },
      },

      ghost: {
        backgroundColor: 'transparent',
        color: vars.colors.text,
        border: '1px solid transparent',

        ':hover': {
          backgroundColor: vars.colors.surfaceHover,
        },

        ':active': {
          backgroundColor: vars.colors.surface,
        },
      },

      destructive: {
        backgroundColor: vars.colors.error,
        color: vars.colors.textInverse,
        border: `1px solid ${vars.colors.error}`,

        ':hover': {
          backgroundColor: '#DC2626', // Darker red
          borderColor: '#DC2626',
        },

        ':active': {
          backgroundColor: '#B91C1C', // Even darker red
          borderColor: '#B91C1C',
        },
      },

      success: {
        backgroundColor: vars.colors.success,
        color: vars.colors.textInverse,
        border: `1px solid ${vars.colors.success}`,

        ':hover': {
          backgroundColor: '#059669', // Darker green
          borderColor: '#059669',
        },

        ':active': {
          backgroundColor: '#047857', // Even darker green
          borderColor: '#047857',
        },
      },
    },

    size: {
      xs: {
        height: '24px',
        minWidth: '24px',
        padding: `0 ${vars.space[2]}`,
        fontSize: vars.fontSizes.xs,
        borderRadius: vars.radii.sm,
      },

      sm: {
        height: '32px',
        minWidth: '32px',
        padding: `0 ${vars.space[3]}`,
        fontSize: vars.fontSizes.sm,
        borderRadius: vars.radii.sm,
      },

      md: {
        height: '40px',
        minWidth: '40px',
        padding: `0 ${vars.space[4]}`,
        fontSize: vars.fontSizes.md,
      },

      lg: {
        height: '48px',
        minWidth: '48px',
        padding: `0 ${vars.space[6]}`,
        fontSize: vars.fontSizes.lg,
        borderRadius: vars.radii.lg,
      },

      xl: {
        height: '56px',
        minWidth: '56px',
        padding: `0 ${vars.space[8]}`,
        fontSize: vars.fontSizes.xl,
        borderRadius: vars.radii.lg,
      },

      icon: {
        width: '40px',
        height: '40px',
        minWidth: '40px',
        padding: '0',
      },
    },

    fullWidth: {
      true: {
        width: '100%',
      },
    },

    loading: {
      true: {
        cursor: 'wait',
        opacity: '0.8',
      },
    },
  },

  compoundVariants: [
    // Icon button variants
    {
      variants: { size: 'xs', variant: 'primary' },
      style: {
        width: '24px',
        height: '24px',
        padding: '0',
      },
    },
    {
      variants: { size: 'sm', variant: 'primary' },
      style: {
        width: '32px',
        height: '32px',
        padding: '0',
      },
    },
    {
      variants: { size: 'icon' },
      style: {
        width: '40px',
        height: '40px',
        padding: '0',
      },
    },
  ],

  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
})

export type ButtonVariants = RecipeVariants<typeof button>