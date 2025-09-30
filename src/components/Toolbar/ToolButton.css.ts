import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/theme.css'

export const shortcutLabel = style({
  position: 'absolute',
  bottom: '2px',
  right: '2px',
  fontSize: '9px',
  color: vars.colors.gray500,
  fontFamily: vars.fonts.mono,
  pointerEvents: 'none',
  userSelect: 'none',
})

export const relativeToolButton = style({
  position: 'relative'
})