import { memo, useState, useEffect } from 'react'
import { useUnifiedActionStore } from '@/store/unifiedActionStore'
import { Activity, ChevronUp, ChevronDown } from '@/utils/optimizedIcons'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import type { ActionHistoryEntry } from '@/types/unifiedAction'

type ActionLogPanelProps = {
  maxItems?: number
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'
}


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

  const getPositionStyles = () => {
    switch (position) {
      case 'bottom-right':
        return { bottom: '12px', right: '12px' }
      case 'top-left':
        return { top: '12px', left: '12px' }
      case 'top-right':
        return { top: '12px', right: '12px' }
      default: // bottom-left
        return { bottom: '12px', left: '12px' }
    }
  }

  const getActionIcon = (type: string) => {
    const iconStyle = {
      width: '16px',
      height: '16px',
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      fontSize: '10px'
    }

    switch (type) {
      case 'spell':
        return <Box style={{ ...iconStyle, backgroundColor: 'var(--colors-purple)' }}>✨</Box>
      case 'attack':
        return <Box style={{ ...iconStyle, backgroundColor: 'var(--colors-dndRed)' }}>⚔</Box>
      case 'interaction':
        return <Box style={{ ...iconStyle, backgroundColor: 'var(--colors-secondary)' }}>✋</Box>
      case 'move':
        return <Box style={{ ...iconStyle, backgroundColor: 'var(--colors-gray600)' }}>➜</Box>
      default:
        return <Box style={{ ...iconStyle, backgroundColor: 'var(--colors-gray600)' }}>•</Box>
    }
  }

  return (
    <Box
      style={{
        position: 'fixed',
        ...getPositionStyles(),
        width: '280px',
        maxHeight: isCollapsed ? '40px' : '200px',
        backgroundColor: 'var(--colors-gray900)',
        border: '1px solid var(--colors-gray700)',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 30,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        transition: 'all 0.3s ease'
      }}
    >
      {/* Header */}
      <Box
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{
          padding: '8px',
          borderBottom: '1px solid var(--colors-gray700)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          userSelect: 'none'
        }}
      >
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Activity size={14} />
          <Text
            variant="body"
            size="sm"
            style={{
              fontWeight: '500',
              color: 'var(--colors-text)'
            }}
          >
            Action Log
          </Text>
          {recentActions.length > 0 && (
            <Text
              variant="body"
              size="xs"
              style={{
                padding: '2px 6px',
                backgroundColor: 'var(--colors-primary)',
                borderRadius: '4px',
                color: 'white',
                marginLeft: '4px'
              }}
            >
              {recentActions.length}
            </Text>
          )}
        </Box>
        {isCollapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </Box>

      {/* Content */}
      {!isCollapsed && (
        <Box
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '4px',
            maxHeight: '150px'
          }}
        >
          {recentActions.length === 0 ? (
            <Box
              style={{
                padding: '12px',
                textAlign: 'center',
                color: 'var(--colors-gray600)',
                fontSize: '12px'
              }}
            >
              <Text variant="body" size="xs">No recent actions</Text>
            </Box>
          ) : (
            recentActions.map(entry => (
              <Box
                key={entry.id}
                style={{
                  padding: '4px 8px',
                  fontSize: '12px',
                  color: 'var(--colors-gray400)',
                  borderRadius: '4px',
                  marginBottom: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'background-color 0.2s'
                }}
              >
                {getActionIcon(entry.type)}
                <Text
                  variant="body"
                  size="xs"
                  style={{
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {getActionLabel(entry)}
                </Text>
                <Text
                  variant="body"
                  size="xs"
                  style={{
                    color: 'var(--colors-gray600)',
                    flexShrink: 0
                  }}
                >
                  {formatTime(entry.timestamp)}
                </Text>
              </Box>
            ))
          )}
        </Box>
      )}
    </Box>
  )
}

export const ActionLogPanel = memo(ActionLogPanelComponent)