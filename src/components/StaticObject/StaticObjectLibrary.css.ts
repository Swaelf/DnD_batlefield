import { style, styleVariants } from '@vanilla-extract/css'
import { vars } from '@/styles/theme.css'

export const objectPanel = style({
  borderLeft: `1px solid ${vars.colors.gray800}`,
  display: 'flex',
  flexDirection: 'column',
  height: '100%'
})

export const categoryToggle = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  padding: '8px 12px',
  textAlign: 'left',
  cursor: 'pointer',
  borderRadius: '6px',
  transition: 'background-color 0.2s',
  ':hover': {
    backgroundColor: vars.colors.gray800
  }
})

const objectButtonBase = style({
  padding: '8px',
  borderRadius: '6px',
  cursor: 'pointer',
  transition: 'all 0.2s',
  border: `1px solid transparent`,
  ':hover': {
    backgroundColor: vars.colors.gray800,
    borderColor: vars.colors.gray700
  }
})

export const objectButton = styleVariants({
  selected: [objectButtonBase, {
    backgroundColor: 'rgba(201, 173, 106, 0.1)',
    borderColor: vars.colors.secondary
  }],
  unselected: [objectButtonBase]
})

export const configSection = style({
  borderTop: `1px solid ${vars.colors.gray700}`,
  backgroundColor: 'rgba(55, 65, 81, 0.3)',
  flexShrink: 0
})