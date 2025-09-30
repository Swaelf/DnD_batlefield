import { style, styleVariants } from '@vanilla-extract/css'
import { vars } from '@/styles/theme.css'

export const staticPanel = style({
  borderLeft: `1px solid ${vars.colors.gray800}`,
  display: 'flex',
  flexDirection: 'column',
  height: '100%'
})

export const categoryToggle = style({
  justifyContent: 'space-between',
  padding: '0.5rem',
  selectors: {
    '&:hover': {
      backgroundColor: vars.colors.gray800
    }
  }
})

export const effectButtonBase = style({
  padding: '0.75rem',
  textAlign: 'left',
  border: '2px solid',
  backgroundColor: 'transparent',
  width: '100%',
  wordWrap: 'break-word'
})

export const effectButton = styleVariants({
  selected: [effectButtonBase, {
    borderColor: vars.colors.secondary,
    backgroundColor: vars.colors.gray800,
    selectors: {
      '&:hover': {
        borderColor: vars.colors.secondary
      }
    }
  }],
  unselected: [effectButtonBase, {
    borderColor: vars.colors.gray700,
    selectors: {
      '&:hover': {
        borderColor: vars.colors.gray600
      }
    }
  }]
})

export const configSection = style({
  backgroundColor: 'rgba(31, 31, 31, 0.5)' // gray800 with 50% opacity
})