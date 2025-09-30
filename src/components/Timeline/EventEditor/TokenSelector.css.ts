import { style, styleVariants } from '@vanilla-extract/css'
import { vars } from '@/styles/theme.css'

const pickerButtonBase = style({
  backgroundColor: vars.colors.gray700,
  color: vars.colors.gray300,
  border: `1px solid ${vars.colors.gray600}`,
  selectors: {
    '&:hover': {
      backgroundColor: vars.colors.gray600,
      borderColor: vars.colors.secondary
    }
  }
})

export const pickerButton = styleVariants({
  normal: [pickerButtonBase],
  picking: [pickerButtonBase, {
    backgroundColor: vars.colors.primary,
    color: vars.colors.textInverse,
    borderColor: vars.colors.primaryHover,
    selectors: {
      '&:hover': {
        backgroundColor: vars.colors.primaryHover
      }
    }
  }]
})