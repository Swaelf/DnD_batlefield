import { style } from '@vanilla-extract/css'
import { sprinkles } from '@/styles/sprinkles.css'
import { vars } from '@/styles/theme.css'

export const timelineContainer = style([
  sprinkles({
    position: 'absolute',
    zIndex: 'sticky'
  }),
  {
    bottom: '1rem',
    left: '50%',
    transform: 'translateX(-50%)',
    transition: 'all 0.3s ease'
  }
])

export const timelinePanel = style([
  sprinkles({
    backgroundColor: 'dndBlack',
    borderRadius: 'lg'
  }),
  {
    backgroundColor: 'rgba(26, 26, 26, 0.9)',
    backdropFilter: 'blur(8px)',
    border: `1px solid rgba(201, 173, 106, 0.2)`,
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    maxHeight: '8rem',
    transition: 'all 0.3s ease'
  }
])

export const timelinePanelExpanded = style({
  maxHeight: '24rem'
})

export const timelineContent = style([
  sprinkles({
    padding: 3
  })
])

export const timelineHeader = style([
  sprinkles({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4
  }),
  {
    marginBottom: '0.5rem'
  }
])

export const combatButton = style([
  sprinkles({
    borderRadius: 'md',
    fontWeight: 'medium',
    px: 4,
    py: 2
  }),
  {
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    border: 'none'
  }
])

export const combatButtonActive = style({
  backgroundColor: vars.colors.primary,
  color: vars.colors.text
})

export const combatButtonInactive = style({
  backgroundColor: vars.colors.backgroundSecondary,
  color: vars.colors.textSecondary
})

export const roundInfo = style([
  sprinkles({
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    fontSize: 'sm',
    color: 'textSecondary'
  })
])

export const roundControls = style([
  sprinkles({
    display: 'flex',
    alignItems: 'center',
    gap: 2
  })
])

export const roundButton = style([
  sprinkles({
    backgroundColor: 'backgroundSecondary',
    color: 'textSecondary',
    borderRadius: 'md',
    padding: 2
  }),
  {
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    selectors: {
      '&:hover': {
        backgroundColor: vars.colors.backgroundTertiary,
        color: vars.colors.text
      },
      '&:disabled': {
        opacity: 0.5,
        cursor: 'not-allowed'
      }
    }
  }
])

export const animationControls = style([
  sprinkles({
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    fontSize: 'xs',
    color: 'textTertiary'
  })
])

export const speedSlider = style([
  sprinkles({
    borderRadius: 'md'
  }),
  {
    width: '80px',
    height: '4px',
    background: vars.colors.backgroundTertiary,
    outline: 'none',
    appearance: 'none',
    cursor: 'pointer',
    selectors: {
      '&::-webkit-slider-thumb': {
        appearance: 'none',
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        background: vars.colors.secondary,
        cursor: 'pointer'
      },
      '&::-moz-range-thumb': {
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        background: vars.colors.secondary,
        cursor: 'pointer',
        border: 'none'
      }
    }
  }
])

export const eventIndicator = style([
  sprinkles({
    backgroundColor: 'secondary',
    borderRadius: 'full',
    fontSize: 'xs',
    fontWeight: 'semibold'
  }),
  {
    color: vars.colors.textInverse,
    minWidth: '1.5rem',
    height: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
])

// Round display styles
export const roundDisplay = style([
  sprinkles({
    backgroundColor: 'backgroundSecondary',
    borderRadius: 'lg',
    px: 4,
    py: 2
  })
])

export const roundDisplayContent = style([
  sprinkles({
    display: 'flex',
    alignItems: 'center',
    gap: 2
  })
])

export const roundNumber = style([
  sprinkles({
    fontSize: 'md',
    fontWeight: 'bold',
    color: 'text'
  })
])

export const roundName = style([
  sprinkles({
    fontSize: 'sm',
    color: 'textTertiary',
    marginLeft: 1
  })
])

// Navigation controls
export const nextRoundButton = style([
  sprinkles({
    backgroundColor: 'secondary',
    borderRadius: 'md',
    px: 4,
    py: 2,
    fontWeight: 'bold'
  }),
  {
    color: vars.colors.textInverse,
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    selectors: {
      '&:hover:not(:disabled)': {
        backgroundColor: '#F59E0B' // yellow-500
      },
      '&:disabled': {
        opacity: 0.5,
        cursor: 'not-allowed'
      }
    }
  }
])

export const roundInput = style([
  sprinkles({
    backgroundColor: 'backgroundSecondary',
    color: 'text',
    borderRadius: 'md',
    px: 2,
    py: 1
  }),
  {
    width: '4rem',
    textAlign: 'center',
    border: 'none',
    outline: 'none'
  }
])

// Event management styles
export const eventManagementBar = style([
  sprinkles({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 3
  }),
  {
    borderTop: `1px solid ${vars.colors.backgroundSecondary}`
  }
])

export const eventControls = style([
  sprinkles({
    display: 'flex',
    alignItems: 'center',
    gap: 2
  })
])

export const eventCount = style([
  sprinkles({
    backgroundColor: 'backgroundSecondary',
    borderRadius: 'md',
    px: 3,
    py: 1,
    fontSize: 'sm',
    color: 'textSecondary'
  })
])

export const eventButtons = style([
  sprinkles({
    display: 'flex',
    alignItems: 'center',
    gap: 1
  })
])

export const eventButton = style([
  sprinkles({
    backgroundColor: 'backgroundSecondary',
    color: 'textSecondary',
    borderRadius: 'md',
    padding: 2
  }),
  {
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    selectors: {
      '&:hover': {
        backgroundColor: vars.colors.backgroundTertiary
      }
    }
  }
])

export const editEventsButton = style([
  sprinkles({
    backgroundColor: 'backgroundSecondary',
    color: 'textSecondary',
    borderRadius: 'md',
    px: 3,
    py: 1,
    fontSize: 'sm'
  }),
  {
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    selectors: {
      '&:hover': {
        backgroundColor: vars.colors.backgroundTertiary
      }
    }
  }
])

// Animation speed controls
export const speedLabel = style([
  sprinkles({
    fontSize: 'sm',
    color: 'textTertiary'
  })
])

export const speedValue = style([
  sprinkles({
    fontSize: 'sm',
    color: 'textSecondary'
  }),
  {
    width: '2.5rem'
  }
])

// Event preview/timeline styles
export const eventPreview = style([
  sprinkles({
    marginTop: 3,
    paddingTop: 3
  }),
  {
    borderTop: `1px solid ${vars.colors.backgroundSecondary}`
  }
])

export const eventPreviewContent = style([
  sprinkles({
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    paddingBottom: 2
  }),
  {
    overflowX: 'auto'
  }
])

export const roundPreviewButton = style([
  sprinkles({
    borderRadius: 'md',
    px: 3,
    py: 2,
    fontSize: 'sm',
    fontWeight: 'medium'
  }),
  {
    minWidth: '60px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  }
])

export const roundPreviewButtonCurrent = style({
  backgroundColor: vars.colors.secondary,
  color: vars.colors.dndBlack
})

export const roundPreviewButtonExecuted = style({
  backgroundColor: vars.colors.backgroundSecondary,
  color: vars.colors.textTertiary
})

export const roundPreviewButtonPending = style([
  {
    backgroundColor: vars.colors.backgroundTertiary,
    color: vars.colors.textSecondary,
    selectors: {
      '&:hover:not(:disabled)': {
        backgroundColor: vars.colors.backgroundSecondary
      }
    }
  }
])

export const roundPreviewNumber = style([
  sprinkles({
    fontSize: 'xs'
  })
])

export const eventIndicators = style([
  sprinkles({
    display: 'flex',
    justifyContent: 'center',
    gap: 1,
    marginTop: 1
  })
])

export const eventDot = style([
  sprinkles({
    borderRadius: 'full'
  }),
  {
    width: '6px',
    height: '6px'
  }
])

export const eventDotMove = style({
  backgroundColor: '#60A5FA' // blue-400
})

export const eventDotAppear = style({
  backgroundColor: '#34D399' // green-400
})

export const eventDotDisappear = style({
  backgroundColor: '#F87171' // red-400
})

export const eventDotOther = style({
  backgroundColor: vars.colors.textTertiary
})

export const moreEventsIndicator = style([
  sprinkles({
    fontSize: 'xs',
    color: 'textTertiary'
  })
])

// Icon styles for consistent sizing
export const icon = style({
  width: '1rem',
  height: '1rem'
})

export const iconGold = style({
  width: '1rem',
  height: '1rem',
  color: vars.colors.secondary // D&D gold color
})

export const iconInline = style({
  display: 'inline-block',
  width: '1rem',
  height: '1rem',
  marginRight: '0.5rem'
})

export const iconAnimated = style({
  animation: 'pulse 2s infinite'
})

// Utility classes
export const flex = style({
  display: 'flex'
})

export const itemsCenter = style({
  alignItems: 'center'
})

export const gap2 = style({
  gap: '0.5rem'
})