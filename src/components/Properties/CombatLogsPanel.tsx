import { type FC } from 'react'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import useTimelineStore from '@/store/timelineStore'

export const CombatLogsPanel: FC = () => {
  const timeline = useTimelineStore(state => state.timeline)

  // Get all completed rounds
  const completedRounds = timeline?.rounds.filter(round => round.executed) || []

  if (completedRounds.length === 0) {
    return (
      <Box
        style={{
          backgroundColor: 'var(--colors-dndBlack)',
          borderRadius: '8px',
          border: '1px solid var(--colors-gray800)',
          padding: '12px',
          marginBottom: '16px'
        }}
      >
        <Text
          size="sm"
          weight="semibold"
          style={{
            color: 'var(--colors-gray300)',
            marginBottom: '8px'
          }}
        >
          Combat Logs
        </Text>
        <Text
          size="xs"
          style={{
            color: 'var(--colors-gray500)'
          }}
        >
          No completed rounds yet. Actions from ended rounds will appear here.
        </Text>
      </Box>
    )
  }

  return (
    <Box
      style={{
        backgroundColor: 'var(--colors-dndBlack)',
        borderRadius: '8px',
        border: '1px solid var(--colors-gray800)',
        padding: '12px',
        marginBottom: '16px'
      }}
    >
      <Text
        size="sm"
        weight="semibold"
        style={{
          color: 'var(--colors-gray300)',
          marginBottom: '12px'
        }}
      >
        Combat Logs
      </Text>

      <Box
        style={{
          maxHeight: '400px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
        className="custom-scrollbar"
      >
        {completedRounds.map((round) => (
          <Box
            key={round.id}
            style={{
              padding: '8px',
              backgroundColor: 'var(--colors-gray900)',
              borderRadius: '4px',
              border: '1px solid var(--colors-gray800)'
            }}
          >
            <Text
              size="xs"
              weight="semibold"
              style={{
                color: 'var(--colors-dndRed)',
                marginBottom: '6px'
              }}
            >
              Round {round.number}
            </Text>

            {round.allActions.length === 0 ? (
              <Text
                size="xs"
                style={{
                  color: 'var(--colors-gray500)',
                  fontStyle: 'italic'
                }}
              >
                No actions
              </Text>
            ) : (
              <Box
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                {round.allActions.map((action, index) => (
                  <Text
                    key={`${round.id}-action-${index}`}
                    size="xs"
                    style={{
                      color: 'var(--colors-gray400)',
                      paddingLeft: '8px'
                    }}
                  >
                    • {formatActionDescription(action)}
                  </Text>
                ))}
              </Box>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  )
}

// Helper function to format action descriptions
function formatActionDescription(action: any): string {
  const type = action.type || 'Unknown'

  switch (type) {
    case 'move':
      return `Move to (${Math.round(action.data?.toPosition?.x || 0)}, ${Math.round(action.data?.toPosition?.y || 0)})`

    case 'attack':
      return `${action.data?.attackType || 'Attack'} - ${action.data?.damage || '?'} damage`

    case 'spell':
      return `Cast ${action.data?.spellName || 'spell'}`

    case 'appear':
      return 'Appear on battlefield'

    case 'disappear':
      return 'Disappear from battlefield'

    case 'interaction':
      return `${action.data?.interactionType || 'Interact'}`

    case 'environmental':
      return `${action.data?.environmentalType || 'Environmental effect'}`

    case 'sequence':
      return `Sequence: ${action.data?.steps?.length || 0} steps`

    default:
      return `${type} action`
  }
}
