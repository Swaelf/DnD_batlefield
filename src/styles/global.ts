import { globalCss } from './theme.config'

export const globalStyles = globalCss({
  // CSS Reset and normalize
  '*': {
    boxSizing: 'border-box',
    margin: 0,
    padding: 0,
  },

  '*::before, *::after': {
    boxSizing: 'border-box',
  },

  'html, body': {
    height: '100%',
    fontFamily: '$dnd',
    fontSize: '$base',
    lineHeight: '$normal',
    color: '$gray100',
    backgroundColor: '$background',
    '-webkit-font-smoothing': 'antialiased',
    '-moz-osx-font-smoothing': 'grayscale',
  },

  '#root': {
    height: '100%',
    isolation: 'isolate',
  },

  // Remove default button styles
  'button, input, optgroup, select, textarea': {
    fontFamily: 'inherit',
    fontSize: '100%',
    lineHeight: 1.15,
    margin: 0,
  },

  button: {
    appearance: 'none',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    '&:focus': {
      outline: 'none',
    },
  },

  // Remove default link styles
  a: {
    color: 'inherit',
    textDecoration: 'none',
  },

  // Image defaults
  'img, svg': {
    display: 'block',
    maxWidth: '100%',
  },

  // List defaults
  'ol, ul': {
    listStyle: 'none',
  },

  // Table defaults
  table: {
    borderCollapse: 'collapse',
    borderSpacing: 0,
  },

  // Focus outline defaults
  ':focus': {
    outline: '2px solid $primary',
    outlineOffset: '2px',
  },

  ':focus:not(:focus-visible)': {
    outline: 'none',
  },

  // Disable text selection for UI elements
  '.no-select': {
    userSelect: 'none',
    '-webkit-user-select': 'none',
    '-moz-user-select': 'none',
    '-ms-user-select': 'none',
  },

  // Canvas specific styles
  '.konvajs-content': {
    width: '100% !important',
    height: '100% !important',
  },

  // Scrollbar styling for webkit browsers
  '::-webkit-scrollbar': {
    width: '8px',
    height: '8px',
  },

  '::-webkit-scrollbar-track': {
    backgroundColor: '$gray800',
  },

  '::-webkit-scrollbar-thumb': {
    backgroundColor: '$gray600',
    borderRadius: '$md',
    '&:hover': {
      backgroundColor: '$gray500',
    },
  },

  // Selection styling
  '::selection': {
    backgroundColor: '$primary',
    color: '$white',
  },

  '::-moz-selection': {
    backgroundColor: '$primary',
    color: '$white',
  },

  // Tooltip and popover z-index management
  '[data-radix-popper-content-wrapper]': {
    zIndex: '$tooltip !important',
  },

  // Prevent FOUC (Flash of Unstyled Content)
  '.stitches-loading': {
    visibility: 'hidden',
  },

  '.stitches-loaded': {
    visibility: 'visible',
  }
})