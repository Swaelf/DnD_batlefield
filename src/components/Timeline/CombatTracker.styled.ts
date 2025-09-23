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
  backgroundColor: 'rgba(26, 26, 26, 0.95)',
  backdropFilter: 'blur(8px)',
  borderRadius: '$xl',
  border: '1px solid rgba(201, 173, 106, 0.2)',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
  padding: '$5',
  minWidth: '600px',
})

export const CombatBar = styled(Box, {
  display: 'flex',
  alignItems: 'center',
  gap: '$4',
  width: '100%',
  padding: '$2',
  borderRadius: '$lg',
  backgroundColor: 'rgba(55, 65, 81, 0.3)',
})

export const RoundCounter = styled(Box, {
  backgroundColor: 'rgba(31, 41, 55, 0.8)',
  borderRadius: '$lg',
  paddingX: '$5',
  paddingY: '$3',
  borderWidth: '2px',
  borderStyle: 'solid',
  borderColor: '$secondary',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
})

export const NavControls = styled(Box, {
  display: 'flex',
  alignItems: 'center',
  gap: '$1',
})

export const NavButton = styled(Button, {
  padding: '$3',
  backgroundColor: 'rgba(55, 65, 81, 0.8)',
  color: '$gray300',
  borderRadius: '$lg',
  border: '1px solid rgba(107, 114, 128, 0.3)',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: 'rgba(75, 85, 99, 0.9)',
    color: '$white',
    borderColor: 'rgba(156, 163, 175, 0.5)',
    transform: 'translateY(-1px)',
  },
  '&:active': {
    transform: 'translateY(0)',
  },
  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
    '&:hover': {
      transform: 'none',
    },
  },
})

export const NextRoundButton = styled(Button, {
  paddingX: '$6',
  paddingY: '$3',
  backgroundColor: '$secondary',
  color: '$dndBlack',
  fontWeight: '$semibold',
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
  borderRadius: '$lg',
  border: '2px solid transparent',
  transition: 'all 0.2s ease',
  fontSize: '$sm',
  '&:hover': {
    backgroundColor: '$yellow500',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(201, 173, 106, 0.3)',
  },
  '&:active': {
    transform: 'translateY(0)',
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
  gap: '$2',
  paddingX: '$4',
  paddingY: '$3',
  backgroundColor: '$secondary',
  color: '$dndBlack',
  borderRadius: '$lg',
  fontWeight: '$semibold',
  fontSize: '$sm',
  border: '2px solid transparent',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: '$yellow500',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(201, 173, 106, 0.3)',
  },
  '&:active': {
    transform: 'translateY(0)',
  },
})

export const StatusIndicator = styled(Box, {
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
  paddingX: '$3',
  paddingY: '$2',
  borderRadius: '$lg',
  fontSize: '$sm',
  fontWeight: '$medium',
  border: '1px solid transparent',
  variants: {
    type: {
      events: {
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        borderColor: 'rgba(59, 130, 246, 0.3)',
        color: '$blue400',
      },
      spells: {
        backgroundColor: 'rgba(168, 85, 247, 0.15)',
        borderColor: 'rgba(168, 85, 247, 0.3)',
        color: '$purple400',
      },
    },
  },
})

export const ControlButton = styled(Button, {
  padding: '$3',
  backgroundColor: 'rgba(55, 65, 81, 0.8)',
  color: '$gray300',
  borderRadius: '$lg',
  border: '1px solid rgba(107, 114, 128, 0.3)',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: 'rgba(75, 85, 99, 0.9)',
    color: '$white',
    borderColor: 'rgba(156, 163, 175, 0.5)',
    transform: 'translateY(-1px)',
  },
  '&:active': {
    transform: 'translateY(0)',
  },
})

export const ExpandedSection = styled(Box, {
  borderTop: '1px solid rgba(75, 85, 99, 0.5)',
  padding: '$4',
  marginTop: '$3',
  borderRadius: '$lg',
  backgroundColor: 'rgba(31, 41, 55, 0.3)',
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