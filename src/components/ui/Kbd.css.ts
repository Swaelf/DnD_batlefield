import { recipe } from '@vanilla-extract/recipes'
import { vars } from '@/styles/theme.css'

export const kbdRecipe = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: vars.colors.gray800,
    border: `1px solid ${vars.colors.gray700}`,
    borderRadius: vars.radii.sm,
    fontFamily: vars.fonts.mono,
    fontWeight: vars.fontWeights.medium,
    lineHeight: vars.lineHeights.none,
    userSelect: 'none'
  },

  variants: {
    size: {
      sm: {
        paddingLeft: vars.space[1],
        paddingRight: vars.space[1],
        paddingTop: '2px',
        paddingBottom: '2px',
        fontSize: '10px',
        minWidth: '20px',
        minHeight: '18px'
      },
      md: {
        paddingLeft: vars.space[2],
        paddingRight: vars.space[2],
        paddingTop: vars.space[1],
        paddingBottom: vars.space[1],
        fontSize: vars.fontSizes.xs,
        minWidth: '24px',
        minHeight: '20px'
      },
      lg: {
        paddingLeft: vars.space[3],
        paddingRight: vars.space[3],
        paddingTop: vars.space[1],
        paddingBottom: vars.space[1],
        fontSize: vars.fontSizes.sm,
        minWidth: '32px',
        minHeight: '24px'
      }
    },

    variant: {
      default: {
        backgroundColor: vars.colors.gray800,
        borderColor: vars.colors.gray700,
        color: vars.colors.gray300
      },
      dark: {
        backgroundColor: vars.colors.gray700,
        borderColor: vars.colors.gray600,
        color: vars.colors.gray200
      },
      accent: {
        backgroundColor: 'rgba(146, 38, 16, 0.1)',
        borderColor: vars.colors.primary,
        color: vars.colors.primary
      }
    }
  },

  defaultVariants: {
    size: 'md',
    variant: 'default'
  }
})