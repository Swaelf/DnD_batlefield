import { styled } from '@/styles/theme.config'
import type { ComponentProps } from '@/types'
import { Box } from '@/components/primitives'

export const Panel = styled(Box, {
  display: 'block',
  backgroundColor: '$surface',
  border: '1px solid $gray700',
  borderRadius: '$lg',
  boxShadow: '$panel',

  variants: {
    padding: {
      none: { padding: 0 },
      sm: { padding: '$3' },
      md: { padding: '$4' },
      lg: { padding: '$6' },
    },

    elevation: {
      none: { boxShadow: 'none' },
      sm: { boxShadow: '$sm' },
      md: { boxShadow: '$panel' },
      lg: { boxShadow: '$lg' },
      xl: { boxShadow: '$xl' },
    },

    variant: {
      default: {
        backgroundColor: '$surface',
        borderColor: '$gray700',
      },
      elevated: {
        backgroundColor: '$gray800',
        borderColor: '$gray600',
        boxShadow: '$lg',
      },
      outlined: {
        backgroundColor: 'transparent',
        borderColor: '$gray600',
        boxShadow: 'none',
      },
      ghost: {
        backgroundColor: 'transparent',
        border: 'none',
        boxShadow: 'none',
      },
    },

    size: {
      sm: {
        minWidth: '200px',
        minHeight: '150px',
      },
      md: {
        minWidth: '$sidebarWidth',
        minHeight: '200px',
      },
      lg: {
        minWidth: '400px',
        minHeight: '300px',
      },
      full: {
        width: '100%',
        height: '100%',
      },
      sidebar: {
        width: '$sidebarWidth',
        height: '100%',
      },
    },
  },

  defaultVariants: {
    padding: 'md',
    elevation: 'md',
    variant: 'default',
  },
})

export const PanelHeader = styled(Box, {
  display: 'block',
  borderBottom: '1px solid $gray700',
  marginBottom: '$4',
  paddingBottom: '$3',
  marginX: '-$4', // Negative margin to extend to panel edges
  paddingX: '$4',

  variants: {
    sticky: {
      true: {
        position: 'sticky',
        top: 0,
        backgroundColor: '$surface',
        zIndex: '$sticky',
      },
    },
  },
})

export const PanelTitle = styled('h2', {
  margin: 0,
  fontSize: '$lg',
  fontWeight: '$semibold',
  color: '$gray100',
  fontFamily: '$dnd',
})

export const PanelBody = styled(Box, {
  display: 'block',
  flex: 1,
  overflow: 'auto',

  variants: {
    scrollable: {
      true: {
        overflowY: 'auto',
        overflowX: 'hidden',
      },
    },

    padding: {
      none: { padding: 0 },
      sm: { padding: '$2' },
      md: { padding: '$4' },
    },
  },

  defaultVariants: {
    scrollable: true,
    padding: 'none',
  },
})

export const PanelFooter = styled(Box, {
  borderTop: '1px solid $gray700',
  marginTop: '$4',
  paddingTop: '$3',
  marginX: '-$4', // Negative margin to extend to panel edges
  paddingX: '$4',
  display: 'flex',
  alignItems: 'center',
  gap: '$3',
  justifyContent: 'flex-end',
})

export const PanelSection = styled(Box, {
  display: 'block',
  marginBottom: '$6',

  '&:last-child': {
    marginBottom: 0,
  },

  variants: {
    spacing: {
      none: { marginBottom: 0 },
      sm: { marginBottom: '$3' },
      md: { marginBottom: '$6' },
      lg: { marginBottom: '$8' },
    },

    divider: {
      true: {
        paddingBottom: '$4',
        borderBottom: '1px solid $gray800',
        marginBottom: '$4',
      },
    },
  },
})

export const PanelGroup = styled(Box, {
  display: 'flex',
  flexDirection: 'column',
  gap: '$4',

  variants: {
    direction: {
      row: { flexDirection: 'row' },
      column: { flexDirection: 'column' },
    },

    spacing: {
      sm: { gap: '$2' },
      md: { gap: '$4' },
      lg: { gap: '$6' },
    },
  },

  defaultVariants: {
    direction: 'column',
    spacing: 'md',
  },
})

// Card is a simpler variant of Panel
export const Card = styled(Panel, {
  variants: {
    ...Panel.variants,
    interactive: {
      true: {
        cursor: 'pointer',
        transition: '$base',
        '&:hover': {
          backgroundColor: '$gray750',
          borderColor: '$gray600',
          transform: 'translateY(-1px)',
          boxShadow: '$lg',
        },
        '&:active': {
          transform: 'translateY(0)',
        },
      },
    },

    selected: {
      true: {
        borderColor: '$primary',
        backgroundColor: 'rgba($colors$primary, 0.05)',
        boxShadow: '$dnd',
      },
    },
  },

  compoundVariants: [
    {
      interactive: true,
      selected: true,
      css: {
        '&:hover': {
          borderColor: '$primary',
          backgroundColor: 'rgba($colors$primary, 0.1)',
        },
      },
    },
  ],

  defaultVariants: {
    padding: 'sm',
    elevation: 'sm',
    variant: 'default',
  },
})

export type PanelProps = ComponentProps<typeof Panel>
export type PanelHeaderProps = ComponentProps<typeof PanelHeader>
export type PanelTitleProps = ComponentProps<typeof PanelTitle>
export type PanelBodyProps = ComponentProps<typeof PanelBody>
export type PanelFooterProps = ComponentProps<typeof PanelFooter>
export type PanelSectionProps = ComponentProps<typeof PanelSection>
export type PanelGroupProps = ComponentProps<typeof PanelGroup>
export type CardProps = ComponentProps<typeof Card>