import { styled } from '@/styles/theme.config'
import { Box, Button, Text } from '@/components/ui'

export const TrackerContainer = styled(Box, {
  position: 'fixed',
  bottom: '$4',
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 20,
})

export const StartCombatButton = styled(Button, {
  paddingX: '$6',
  paddingY: '$3',
  backgroundColor: '$dndRed',
  color: '$white',
  fontSize: '$lg',
  fontWeight: '$bold',
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  '&:hover': {
    backgroundColor: '$red600',
  },
  '&:active': {
    transform: 'scale(0.98)',
  },
})

export const CombatPanel = styled(Box, {
  backgroundColor: '$dndBlack',
  backdropFilter: 'blur(4px)',
  borderRadius: '$lg',
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  padding: '$4',
})

export const CombatBar = styled(Box, {
  display: 'flex',
  alignItems: 'center',
  gap: '$3',
  width: '100%',
})

export const RoundCounter = styled(Box, {
  backgroundColor: '$gray800',
  borderRadius: '$md',
  paddingX: '$4',
  paddingY: '$2',
  borderWidth: '2px',
  borderStyle: 'solid',
  borderColor: '$secondary',
})

export const NavControls = styled(Box, {
  display: 'flex',
  alignItems: 'center',
  gap: '$1',
})

export const NavButton = styled(Button, {
  padding: '$2',
  backgroundColor: '$gray700',
  color: '$gray300',
  borderRadius: '$md',
  '&:hover': {
    backgroundColor: '$gray600',
    color: '$white',
  },
  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
})

export const NextRoundButton = styled(Button, {
  paddingX: '$6',
  paddingY: '$2',
  backgroundColor: '$secondary',
  color: '$dndBlack',
  fontWeight: '$semibold',
  display: 'flex',
  alignItems: 'center',
  gap: '$1',
  '&:hover': {
    backgroundColor: '$yellow500',
  },
  '&:active': {
    transform: 'scale(0.98)',
  },
})

export const StatusSection = styled(Box, {
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
  marginLeft: 'auto',
})

export const EventsButton = styled(Button, {
  display: 'flex',
  alignItems: 'center',
  gap: '$1',
  paddingX: '$3',
  paddingY: '$2',
  backgroundColor: '$gray700',
  color: '$gray300',
  borderRadius: '$md',
  '&:hover': {
    backgroundColor: '$gray600',
    color: '$white',
  },
})

export const StatusIndicator = styled(Box, {
  display: 'flex',
  alignItems: 'center',
  gap: '$1',
  paddingX: '$3',
  paddingY: '$2',
  borderRadius: '$md',
  variants: {
    type: {
      events: {
        backgroundColor: 'rgba(37, 99, 235, 0.2)',
        color: '$blue400',
      },
      spells: {
        backgroundColor: 'rgba(147, 51, 234, 0.2)',
        color: '$purple400',
      },
    },
  },
})

export const ControlButton = styled(Button, {
  padding: '$2',
  backgroundColor: '$gray700',
  color: '$gray300',
  borderRadius: '$md',
  '&:hover': {
    backgroundColor: '$gray600',
    color: '$white',
  },
})

export const ExpandedSection = styled(Box, {
  borderTop: '1px solid $gray700',
  padding: '$3',
})

export const SpeedControl = styled(Box, {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '$3',
})

export const SpeedLabel = styled(Text, {
  fontSize: '$sm',
  color: '$gray400',
})

export const SpeedInput = styled('input', {
  width: '96px', // w-24
})

export const SpeedValue = styled(Text, {
  fontSize: '$sm',
  color: '$gray300',
  width: '40px', // w-10
  textAlign: 'right',
})

export const TimelineContainer = styled(Box, {
  display: 'flex',
  alignItems: 'center',
  gap: '$1',
  overflowX: 'auto',
  paddingBottom: '$2',
  maxWidth: '600px',
})

export const RoundButton = styled(Button, {
  minWidth: '40px',
  paddingX: '$2',
  paddingY: '$1',
  position: 'relative',
  backgroundColor: '$gray700',
  color: '$gray400',
  fontSize: '$xs',
  borderRadius: '$sm',
  '&:hover': {
    backgroundColor: '$gray600',
    color: '$white',
  },
  variants: {
    state: {
      current: {
        backgroundColor: '$secondary',
        color: '$dndBlack',
        fontWeight: '$bold',
      },
      executed: {
        backgroundColor: '$gray700',
        color: '$gray500',
      },
      pending: {
        backgroundColor: '$gray800',
        color: '$gray300',
        '&:hover': {
          backgroundColor: '$gray700',
        },
      },
    },
  },
})

export const EventIndicator = styled(Box, {
  height: '4px',
  width: '100%',
  backgroundColor: '$blue400',
  position: 'absolute',
  bottom: 0,
  left: 0,
})

export const StatsGrid = styled(Box, {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '$2',
  marginTop: '$3',
  paddingTop: '$3',
  borderTop: '1px solid $gray700',
})

export const StatCard = styled(Box, {
  backgroundColor: '$gray800',
  borderRadius: '$md',
  padding: '$2',
  textAlign: 'center',
})

export const StatLabel = styled(Box, {
  color: '$gray400',
})

export const StatValue = styled(Box, {
  color: '$white',
  fontWeight: '$bold',
})