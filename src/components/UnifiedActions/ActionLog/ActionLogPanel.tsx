import { memo, useState, useEffect } from 'react'
import { styled } from '@/styles/theme.config'
import { useUnifiedActionStore } from '@/store/unifiedActionStore'
import { Activity, ChevronUp, ChevronDown } from 'lucide-react'
import type { ActionHistoryEntry } from '@/types/unifiedAction'

type ActionLogPanelProps = {
  maxItems?: number
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'
}

const PanelContainer = styled('div', {
  position: 'fixed',
  width: 280,
  maxHeight: 200,
  backgroundColor: '$gray900',
  border: '1px solid $gray700',
  borderRadius: '$medium',
  display: 'flex',
  flexDirection: 'column',
  zIndex: 30,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
  transition: 'all 0.3s ease',

  variants: {
    position: {
      'bottom-left': {
        bottom: '$3',
        left: '$3'
      },
      'bottom-right': {
        bottom: '$3',
        right: '$3'
      },
      'top-left': {
        top: '$3',
        left: '$3'
      },
      'top-right': {
        top: '$3',
        right: '$3'
      }
    },
    collapsed: {
      true: {
        maxHeight: 40
      }
    }
  },

  defaultVariants: {
    position: 'bottom-left'
  }
})

const Header = styled('div', {
  padding: '$2',
  borderBottom: '1px solid $gray700',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  cursor: 'pointer',
  userSelect: 'none',

  '&:hover': {
    backgroundColor: '$gray850'
  }
})

const Title = styled('div', {
  fontSize: '$small',
  fontWeight: 500,
  color: '$text',
  display: 'flex',
  alignItems: 'center',
  gap: '$1'
})

const Badge = styled('span', {
  padding: '2px 6px',
  backgroundColor: '$primary',
  borderRadius: '$small',
  fontSize: '$tiny',
  color: 'white',
  marginLeft: '$1'
})

const LogContent = styled('div', {
  flex: 1,
  overflowY: 'auto',
  padding: '$1',
  maxHeight: 150
})

const LogItem = styled('div', {
  padding: '$1 $2',
  fontSize: '$tiny',
  color: '$gray400',
  borderRadius: '$small',
  marginBottom: '$1',
  display: 'flex',
  alignItems: 'center',
  gap: '$1',
  transition: 'background-color 0.2s',

  '&:hover': {
    backgroundColor: '$gray850'
  },

  '&:last-child': {
    marginBottom: 0
  }
})

const ActionIcon = styled('span', {
  width: 16,
  height: 16,
  borderRadius: '$small',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,

  variants: {
    type: {
      spell: {
        backgroundColor: '$purple',
        '&::before': {
          content: '"✨"',
          fontSize: 10
        }
      },
      attack: {
        backgroundColor: '$dndRed',
        '&::before': {
          content: '"⚔"',
          fontSize: 10
        }
      },
      interaction: {
        backgroundColor: '$secondary',
        '&::before': {
          content: '"✋"',
          fontSize: 10
        }
      },
      move: {
        backgroundColor: '$gray600',
        '&::before': {
          content: '"➜"',
          fontSize: 10
        }
      }
    }
  }
})

const ActionText = styled('span', {
  flex: 1,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
})

const TimeStamp = styled('span', {
  fontSize: '$tiny',
  color: '$gray600',
  flexShrink: 0
})

const EmptyState = styled('div', {
  padding: '$3',
  textAlign: 'center',
  color: '$gray600',
  fontSize: '$tiny'
})

const ActionLogPanelComponent = ({
  maxItems = 5,
  position = 'bottom-left'
}: ActionLogPanelProps) => {
  const actionHistory = useUnifiedActionStore(state => state.actionHistory)
  const activeActions = useUnifiedActionStore(state => state.activeActions)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [recentActions, setRecentActions] = useState<ActionHistoryEntry[]>([])

  useEffect(() => {
    // Combine active actions and recent history
    const active = activeActions.map(action => ({
      ...action,
      executedAt: action.timestamp,
      status: 'executing' as const
    }))

    const recent = actionHistory.slice(0, maxItems - active.length)
    setRecentActions([...active, ...recent] as ActionHistoryEntry[])
  }, [actionHistory, activeActions, maxItems])

  const formatTime = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp

    if (diff < 1000) return 'now'
    if (diff < 60000) return `${Math.floor(diff / 1000)}s`
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`
    return `${Math.floor(diff / 3600000)}h`
  }

  const getActionLabel = (entry: ActionHistoryEntry) => {
    const name = entry.metadata.name || entry.category

    switch (entry.type) {
      case 'spell':
        return `Cast ${name}`
      case 'attack':
        return `${name} Attack`
      case 'interaction':
        return `Used ${name}`
      case 'move':
        return 'Moved'
      default:
        return name
    }
  }

  return (
    <PanelContainer position={position} collapsed={isCollapsed}>
      <Header onClick={() => setIsCollapsed(!isCollapsed)}>
        <Title>
          <Activity size={14} />
          Action Log
          {recentActions.length > 0 && (
            <Badge>{recentActions.length}</Badge>
          )}
        </Title>
        {isCollapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </Header>

      {!isCollapsed && (
        <LogContent>
          {recentActions.length === 0 ? (
            <EmptyState>No recent actions</EmptyState>
          ) : (
            recentActions.map(entry => (
              <LogItem key={entry.id}>
                <ActionIcon type={entry.type} />
                <ActionText>{getActionLabel(entry)}</ActionText>
                <TimeStamp>{formatTime(entry.timestamp)}</TimeStamp>
              </LogItem>
            ))
          )}
        </LogContent>
      )}
    </PanelContainer>
  )
}

export const ActionLogPanel = memo(ActionLogPanelComponent)