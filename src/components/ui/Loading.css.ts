import { keyframes, style } from '@vanilla-extract/css'

// Animations
export const spin = keyframes({
  '0%': { transform: 'rotate(0deg)' },
  '100%': { transform: 'rotate(360deg)' }
})

export const pulse = keyframes({
  '0%, 100%': { opacity: 1 },
  '50%': { opacity: 0.5 }
})

export const bounce = keyframes({
  '0%, 100%': { transform: 'translateY(0)' },
  '50%': { transform: 'translateY(-10px)' }
})

export const fadeIn = keyframes({
  '0%': { opacity: 0 },
  '100%': { opacity: 1 }
})

// Styles
export const spinnerStyles = style({
  animation: `${spin} 1s linear infinite`
})

export const pulseStyles = style({
  animation: `${pulse} 2s cubic-bezier(0.4, 0, 0.6, 1) infinite`
})

export const dotStyles = style({
  animation: `${bounce} 1.4s ease-in-out infinite`
})

export const fadeInStyles = style({
  animation: `${fadeIn} 0.3s ease-in`
})