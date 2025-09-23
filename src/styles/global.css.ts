import { globalStyle } from '@vanilla-extract/css'
import { vars } from './theme.css'

// Reset styles
globalStyle('*, *::before, *::after', {
  boxSizing: 'border-box',
  margin: 0,
  padding: 0,
})

globalStyle('html', {
  fontSize: '16px',
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
  textRendering: 'optimizeLegibility',
})

globalStyle('body', {
  margin: 0,
  padding: 0,
  fontFamily: vars.fonts.base,
  fontSize: vars.fontSizes.md,
  lineHeight: vars.lineHeights.normal,
  color: vars.colors.text,
  backgroundColor: vars.colors.background,
  minHeight: '100vh',
})

// Typography resets
globalStyle('h1, h2, h3, h4, h5, h6', {
  margin: 0,
  fontFamily: vars.fonts.heading,
  fontWeight: vars.fontWeights.bold,
  lineHeight: vars.lineHeights.tight,
})

globalStyle('p', {
  margin: 0,
})

globalStyle('a', {
  color: 'inherit',
  textDecoration: 'none',
})

globalStyle('button', {
  font: 'inherit',
  color: 'inherit',
  background: 'none',
  border: 'none',
  padding: 0,
  cursor: 'pointer',
})

globalStyle('input, textarea, select', {
  font: 'inherit',
  color: 'inherit',
  background: 'none',
  border: 'none',
  padding: 0,
})

globalStyle('img, video', {
  display: 'block',
  maxWidth: '100%',
  height: 'auto',
})

globalStyle('svg', {
  display: 'block',
})

// Scrollbar styles
globalStyle('::-webkit-scrollbar', {
  width: '8px',
  height: '8px',
})

globalStyle('::-webkit-scrollbar-track', {
  background: vars.colors.backgroundSecondary,
})

globalStyle('::-webkit-scrollbar-thumb', {
  background: vars.colors.gray600,
  borderRadius: vars.radii.sm,
})

globalStyle('::-webkit-scrollbar-thumb:hover', {
  background: vars.colors.gray500,
})

// Selection styles
globalStyle('::selection', {
  backgroundColor: vars.colors.primary,
  color: vars.colors.text,
})

// Focus visible styles
globalStyle(':focus-visible', {
  outline: `2px solid ${vars.colors.primary}`,
  outlineOffset: '2px',
})

// Disable focus outline for mouse users
globalStyle(':focus:not(:focus-visible)', {
  outline: 'none',
})

// Root app container
globalStyle('#root', {
  width: '100vw',
  height: '100vh',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
})