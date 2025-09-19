import { styled } from '@/styles/theme.config'

export const Kbd = styled('kbd', {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  paddingX: '$2',
  paddingY: '$1',
  backgroundColor: '$gray800',
  border: '1px solid $gray700',
  borderRadius: '$sm',
  fontSize: '$xs',
  fontFamily: '$mono',
  color: '$gray300',
  fontWeight: '$medium',
  lineHeight: '$none',
  minWidth: '24px',
  minHeight: '20px',
  userSelect: 'none',

  variants: {
    size: {
      sm: {
        paddingX: '$1',
        paddingY: '2px',
        fontSize: '10px',
        minWidth: '20px',
        minHeight: '18px',
      },
      md: {
        paddingX: '$2',
        paddingY: '$1',
        fontSize: '$xs',
        minWidth: '24px',
        minHeight: '20px',
      },
      lg: {
        paddingX: '$3',
        paddingY: '$1',
        fontSize: '$sm',
        minWidth: '32px',
        minHeight: '24px',
      },
    },

    variant: {
      default: {
        backgroundColor: '$gray800',
        borderColor: '$gray700',
        color: '$gray300',
      },
      dark: {
        backgroundColor: '$gray700',
        borderColor: '$gray600',
        color: '$gray200',
      },
      accent: {
        backgroundColor: 'rgba($colors$primary, 0.1)',
        borderColor: '$primary',
        color: '$primary',
      },
    },
  },

  defaultVariants: {
    size: 'md',
    variant: 'default',
  },
})

export type KbdProps = React.ComponentProps<typeof Kbd>