import { style, keyframes } from '@vanilla-extract/css'
import { sprinkles } from '@/styles/sprinkles.css'
import { vars } from '@/styles/theme.css'

const pulse = keyframes({
  '0%, 100%': { opacity: 1 },
  '50%': { opacity: 0.5 }
})

export const appContainer = style([
  sprinkles({
    height: 'full',
    width: 'full',
    backgroundColor: 'background',
    color: 'text',
    display: 'flex',
    flexDirection: 'column'
  }),
  {
    overflow: 'hidden'
  }
])

export const appHeader = style([
  sprinkles({
    backgroundColor: 'dndBlack',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 4
  }),
  {
    height: '40px',
    borderBottom: `1px solid ${vars.colors.gray800}`
  }
])

export const appTitle = style([
  sprinkles({
    fontSize: 'lg',
    fontWeight: 'semibold',
    color: 'secondary'
  }),
  {
    fontFamily: vars.fonts.heading
  }
])

export const appBody = style([
  sprinkles({
    display: 'flex'
  }),
  {
    flex: 1,
    overflow: 'hidden'
  }
])

export const canvasArea = style([
  sprinkles({
    backgroundColor: 'backgroundTertiary',
    position: 'relative'
  }),
  {
    flex: 1
  }
])

export const autoSaveIndicator = style([
  sprinkles({
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    fontSize: 'xs',
    color: 'textTertiary'
  }),
  {
    selectors: {
      '&[data-saved="true"]': {
        color: vars.colors.success
      }
    }
  }
])

export const autoSaveSpinner = style({
  selectors: {
    [`${autoSaveIndicator}[data-saving="true"] &`]: {
      animation: `${pulse} 1s infinite`
    }
  }
})