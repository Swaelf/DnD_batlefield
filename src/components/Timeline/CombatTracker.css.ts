import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/theme.css'

export const trackerContainer = style({
  position: 'fixed',
  bottom: vars.space[16], // Moved higher to avoid status bar overlap
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 20
})

export const startCombatButton = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space[2],
  padding: `${vars.space[4]} ${vars.space[8]}`,
  minHeight: '52px',
  backgroundColor: vars.colors.dndRed,
  color: vars.colors.text,
  fontSize: vars.fontSizes.lg,
  fontWeight: vars.fontWeights.bold,
  borderRadius: vars.radii.lg,
  border: 'none',
  cursor: 'pointer',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  transition: 'all 0.2s ease',
  ':hover': {
    backgroundColor: vars.colors.error,
    transform: 'translateY(-1px)'
  },
  ':active': {
    transform: 'scale(0.98)'
  }
})

export const combatPanel = style({
  backgroundColor: 'rgba(26, 26, 26, 0.95)',
  backdropFilter: 'blur(8px)',
  borderRadius: vars.radii.xl,
  border: `1px solid rgba(201, 173, 106, 0.2)`,
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
  padding: vars.space[5],
  minWidth: '600px'
})

export const combatBar = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space[4],
  width: '100%',
  padding: vars.space[2],
  borderRadius: vars.radii.lg,
  backgroundColor: 'rgba(55, 65, 81, 0.3)'
})

export const roundCounter = style({
  backgroundColor: 'rgba(31, 41, 55, 0.8)',
  borderRadius: vars.radii.lg,
  padding: `${vars.space[3]}`,
  border: `2px solid ${vars.colors.secondary}`,
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
})

export const navControls = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space[1]
})

export const navButton = style({
  padding: `${vars.space[3]} ${vars.space[4]}`,
  minWidth: '48px',
  minHeight: '48px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(55, 65, 81, 0.8)',
  color: vars.colors.gray300,
  borderRadius: vars.radii.lg,
  border: '1px solid rgba(107, 114, 128, 0.3)',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  ':hover': {
    backgroundColor: 'rgba(75, 85, 99, 0.9)',
    color: vars.colors.text,
    borderColor: 'rgba(156, 163, 175, 0.5)',
    transform: 'translateY(-1px)'
  },
  ':active': {
    transform: 'translateY(0)'
  },
  ':disabled': {
    opacity: 0.5,
    cursor: 'not-allowed'
  }
})

export const nextRoundButton = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space[2],
  padding: `${vars.space[3]} ${vars.space[6]}`,
  minHeight: '48px',
  backgroundColor: vars.colors.secondary,
  color: vars.colors.dndBlack,
  fontWeight: vars.fontWeights.semibold,
  fontSize: vars.fontSizes.md,
  borderRadius: vars.radii.lg,
  border: '2px solid transparent',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  ':hover': {
    backgroundColor: vars.colors.warning,
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(201, 173, 106, 0.3)'
  },
  ':active': {
    transform: 'translateY(0)'
  }
})

export const statusSection = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space[2],
  marginLeft: 'auto'
})

export const eventsButton = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space[2],
  padding: `${vars.space[3]} ${vars.space[5]}`,
  minHeight: '48px',
  backgroundColor: vars.colors.secondary,
  color: vars.colors.dndBlack,
  borderRadius: vars.radii.lg,
  fontWeight: vars.fontWeights.semibold,
  fontSize: vars.fontSizes.md,
  border: '2px solid transparent',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  ':hover': {
    backgroundColor: vars.colors.warning,
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(201, 173, 106, 0.3)'
  },
  ':active': {
    transform: 'translateY(0)'
  }
})

export const statusIndicator = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space[2],
  padding: `${vars.space[2]} ${vars.space[3]}`,
  borderRadius: vars.radii.lg,
  fontSize: vars.fontSizes.sm,
  fontWeight: vars.fontWeights.medium,
  border: '1px solid transparent'
})

export const statusIndicatorEvents = style([statusIndicator, {
  backgroundColor: 'rgba(59, 130, 246, 0.15)',
  borderColor: 'rgba(59, 130, 246, 0.3)',
  color: vars.colors.info
}])

export const statusIndicatorSpells = style([statusIndicator, {
  backgroundColor: 'rgba(168, 85, 247, 0.15)',
  borderColor: 'rgba(168, 85, 247, 0.3)',
  color: vars.colors.secondary
}])

export const controlButton = style({
  padding: `${vars.space[3]} ${vars.space[4]}`,
  minWidth: '48px',
  minHeight: '48px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(55, 65, 81, 0.8)',
  color: vars.colors.gray300,
  borderRadius: vars.radii.lg,
  border: '1px solid rgba(107, 114, 128, 0.3)',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  ':hover': {
    backgroundColor: 'rgba(75, 85, 99, 0.9)',
    color: vars.colors.text,
    borderColor: 'rgba(156, 163, 175, 0.5)',
    transform: 'translateY(-1px)'
  },
  ':active': {
    transform: 'translateY(0)'
  }
})

export const expandedSection = style({
  borderTop: '1px solid rgba(75, 85, 99, 0.5)',
  padding: vars.space[4],
  marginTop: vars.space[3],
  borderRadius: vars.radii.lg,
  backgroundColor: 'rgba(31, 41, 55, 0.3)'
})

export const speedControl = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: vars.space[3]
})

export const speedLabel = style({
  fontSize: vars.fontSizes.sm,
  color: vars.colors.gray400
})

export const speedInput = style({
  width: '96px',
  padding: vars.space[2],
  backgroundColor: 'rgba(55, 65, 81, 0.8)',
  color: vars.colors.text,
  border: '1px solid rgba(107, 114, 128, 0.3)',
  borderRadius: vars.radii.md,
  fontSize: vars.fontSizes.sm
})

export const speedValue = style({
  fontSize: vars.fontSizes.sm,
  color: vars.colors.gray300,
  width: '40px',
  textAlign: 'right'
})

export const timelineContainer = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space[1],
  overflowX: 'auto',
  paddingBottom: vars.space[2],
  maxWidth: '600px'
})

export const roundButton = style({
  minWidth: '40px',
  padding: `${vars.space[1]} ${vars.space[2]}`,
  position: 'relative',
  backgroundColor: vars.colors.gray700,
  color: vars.colors.gray400,
  fontSize: vars.fontSizes.xs,
  borderRadius: vars.radii.sm,
  border: 'none',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  ':hover': {
    backgroundColor: vars.colors.gray600,
    color: vars.colors.text
  }
})

export const roundButtonCurrent = style([roundButton, {
  backgroundColor: vars.colors.secondary,
  color: vars.colors.dndBlack,
  fontWeight: vars.fontWeights.bold
}])

export const roundButtonExecuted = style([roundButton, {
  backgroundColor: vars.colors.gray700,
  color: vars.colors.gray500
}])

export const roundButtonPending = style([roundButton, {
  backgroundColor: vars.colors.gray800,
  color: vars.colors.gray300,
  ':hover': {
    backgroundColor: vars.colors.gray700
  }
}])

export const eventIndicator = style({
  height: '4px',
  width: '100%',
  backgroundColor: vars.colors.info,
  position: 'absolute',
  bottom: 0,
  left: 0
})

export const statsGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: vars.space[2],
  marginTop: vars.space[3],
  paddingTop: vars.space[3],
  borderTop: `1px solid ${vars.colors.gray700}`
})

export const statCard = style({
  backgroundColor: vars.colors.gray800,
  borderRadius: vars.radii.md,
  padding: vars.space[2],
  textAlign: 'center'
})

export const statLabel = style({
  color: vars.colors.gray400,
  fontSize: vars.fontSizes.xs
})

export const statValue = style({
  color: vars.colors.text,
  fontWeight: vars.fontWeights.bold,
  fontSize: vars.fontSizes.sm
})