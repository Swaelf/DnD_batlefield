// Temporary compatibility layer for components not yet migrated to Vanilla Extract
// This provides the old styled() function for components still using Stitches

import { createStitches } from '@stitches/react'

export const { styled, css, globalCss, keyframes, getCssText, createTheme } =
  createStitches({
    theme: {
      colors: {
        // Basic colors to prevent errors
        primary: '#922610',
        secondary: '#C9AD6A',
        background: '#171717',
        surface: '#2A2A2A',
        text: '#F5F5F5',
        white: '#FFFFFF',
        black: '#000000',
        gray100: '#F5F5F5',
        gray200: '#E5E5E5',
        gray300: '#D4D4D4',
        gray400: '#A3A3A3',
        gray500: '#737373',
        gray600: '#525252',
        gray700: '#404040',
        gray800: '#262626',
        gray900: '#171717',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
        transparent: 'transparent',
      },
      space: {
        1: '0.25rem',
        2: '0.5rem',
        3: '0.75rem',
        4: '1rem',
        5: '1.25rem',
        6: '1.5rem',
        8: '2rem',
        10: '2.5rem',
        12: '3rem',
        16: '4rem',
        20: '5rem',
        toolButtonSize: '40px',
      },
      fonts: {
        dnd: '"Scala Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        mono: 'Menlo, Monaco, "Courier New", monospace',
        system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      },
      fontSizes: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        md: '1.125rem',
        lg: '1.25rem',
        xl: '1.5rem',
        '2xl': '1.875rem',
        '3xl': '2.25rem',
      },
      fontWeights: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      lineHeights: {
        none: '1',
        tight: '1.25',
        snug: '1.375',
        normal: '1.5',
        relaxed: '1.625',
        loose: '2',
      },
      radii: {
        sm: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        round: '9999px',
      },
      shadows: {
        none: 'none',
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        dnd: '0 0 0 1px rgba(146, 38, 16, 0.5), 0 4px 8px rgba(0, 0, 0, 0.5)',
        gold: '0 0 0 1px rgba(201, 173, 106, 0.5), 0 4px 8px rgba(0, 0, 0, 0.5)',
        panel: '0 4px 12px rgba(0, 0, 0, 0.6)',
        tooltip: '0 2px 8px rgba(0, 0, 0, 0.8)',
      },
      transitions: {
        base: 'all 0.2s ease',
        fast: 'all 0.15s ease',
      },
      zIndices: {
        1: '1',
        10: '10',
        20: '20',
        30: '30',
        40: '40',
        50: '50',
        sticky: '100',
        tooltip: '200',
        popover: '300',
        modal: '9999',
      },
    },
  })

// Re-install Stitches temporarily to make this work
console.warn(
  'Using compatibility layer for Stitches. This is temporary during migration.'
)