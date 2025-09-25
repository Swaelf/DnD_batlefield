/**
 * Component variant definitions for the design system
 * These variants ensure consistent styling across components
 */

// Button variants
export const buttonVariants = {
  variant: {
    primary: {
      backgroundColor: '$dndRed',
      color: '$textPrimary',
      '&:hover': {
        backgroundColor: '#A82E16'
      },
      '&:active': {
        backgroundColor: '#7A1E0C'
      }
    },
    secondary: {
      backgroundColor: '$gray600',
      color: '$textPrimary',
      '&:hover': {
        backgroundColor: '$gray500'
      },
      '&:active': {
        backgroundColor: '$gray700'
      }
    },
    accent: {
      backgroundColor: '$accent',
      color: '$textPrimary',
      '&:hover': {
        backgroundColor: '#7C1FA2'
      },
      '&:active': {
        backgroundColor: '#5E1A78'
      }
    },
    ghost: {
      backgroundColor: 'transparent',
      color: '$textSecondary',
      '&:hover': {
        backgroundColor: '$gray800',
        color: '$textPrimary'
      },
      '&:active': {
        backgroundColor: '$gray700'
      }
    },
    danger: {
      backgroundColor: '$error',
      color: '$textPrimary',
      '&:hover': {
        backgroundColor: '#E53935'
      },
      '&:active': {
        backgroundColor: '#C62828'
      }
    }
  },
  size: {
    xs: {
      height: '24px',
      px: '$xs',
      fontSize: '$xs'
    },
    sm: {
      height: '32px',
      px: '$sm',
      fontSize: '$sm'
    },
    md: {
      height: '40px',
      px: '$md',
      fontSize: '$base'
    },
    lg: {
      height: '48px',
      px: '$lg',
      fontSize: '$lg'
    }
  }
} as const

// Input variants
export const inputVariants = {
  variant: {
    default: {
      backgroundColor: '$surface',
      border: '1px solid $border',
      color: '$textPrimary',
      '&:focus': {
        borderColor: '$accent',
        outline: 'none'
      },
      '&:disabled': {
        backgroundColor: '$gray800',
        color: '$textDisabled',
        cursor: 'not-allowed'
      }
    },
    error: {
      backgroundColor: '$surface',
      border: '1px solid $error',
      color: '$textPrimary',
      '&:focus': {
        borderColor: '$error',
        outline: 'none'
      }
    }
  },
  size: {
    sm: {
      height: '32px',
      px: '$sm',
      fontSize: '$sm'
    },
    md: {
      height: '40px',
      px: '$md',
      fontSize: '$base'
    },
    lg: {
      height: '48px',
      px: '$lg',
      fontSize: '$lg'
    }
  }
} as const

// Text variants
export const textVariants = {
  variant: {
    primary: {
      color: '$textPrimary'
    },
    secondary: {
      color: '$textSecondary'
    },
    tertiary: {
      color: '$textTertiary'
    },
    disabled: {
      color: '$textDisabled'
    },
    accent: {
      color: '$accent'
    },
    success: {
      color: '$success'
    },
    warning: {
      color: '$warning'
    },
    error: {
      color: '$error'
    }
  },
  size: {
    xs: {
      fontSize: '$xs',
      lineHeight: '$tight'
    },
    sm: {
      fontSize: '$sm',
      lineHeight: '$tight'
    },
    base: {
      fontSize: '$base',
      lineHeight: '$normal'
    },
    lg: {
      fontSize: '$lg',
      lineHeight: '$normal'
    },
    xl: {
      fontSize: '$xl',
      lineHeight: '$relaxed'
    },
    xxl: {
      fontSize: '$xxl',
      lineHeight: '$relaxed'
    }
  },
  weight: {
    normal: {
      fontWeight: '$normal'
    },
    medium: {
      fontWeight: '$medium'
    },
    semibold: {
      fontWeight: '$semibold'
    },
    bold: {
      fontWeight: '$bold'
    }
  }
} as const

// Panel/Card variants
export const panelVariants = {
  variant: {
    default: {
      backgroundColor: '$surface',
      border: '1px solid $border',
      borderRadius: '$md'
    },
    elevated: {
      backgroundColor: '$surface',
      borderRadius: '$md',
      boxShadow: '$md'
    },
    ghost: {
      backgroundColor: 'transparent'
    }
  },
  padding: {
    none: {
      p: 0
    },
    sm: {
      p: '$sm'
    },
    md: {
      p: '$md'
    },
    lg: {
      p: '$lg'
    }
  }
} as const

// Modal variants
export const modalVariants = {
  size: {
    sm: {
      width: '400px',
      maxWidth: '90vw'
    },
    md: {
      width: '600px',
      maxWidth: '90vw'
    },
    lg: {
      width: '800px',
      maxWidth: '95vw'
    },
    xl: {
      width: '1000px',
      maxWidth: '95vw'
    },
    full: {
      width: '100vw',
      height: '100vh'
    }
  }
} as const