/**
 * ActionLogEntry Component
 * Individual action entry display with expandable details
 */

import { memo } from 'react'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import type { ActionHistoryEntry } from '@/types/unifiedAction'
import {
  Sword,
  Sparkles,
  Hand,
  Move,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'

type ActionLogEntryProps = {
  entry: ActionHistoryEntry
  isExpanded?: boolean
  onToggleExpand?: () => void
}


const ActionLogEntryComponent = ({
  entry,
  isExpanded = false,
  onToggleExpand
}: ActionLogEntryProps) => {
  const getTypeIcon = () => {
    switch (entry.type) {
      case 'spell':
        return <Sparkles size={14} />
      case 'attack':
        return <Sword size={14} />
      case 'interaction':
        return <Hand size={14} />
      case 'move':
        return <Move size={14} />
      default:
        return <Target size={14} />
    }
  }

  const getStatusIcon = () => {
    switch (entry.status) {
      case 'completed':
        return <CheckCircle size={16} />
      case 'failed':
        return <XCircle size={16} />
      case 'executing':
        return <AlertCircle size={16} />
      default:
        return null
    }
  }

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    if (diff < 60000) {
      return 'Just now'
    } else if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000)
      return `${minutes}m ago`
    } else if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000)
      return `${hours}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const getActionDescription = () => {
    const { metadata, category } = entry

    switch (entry.type) {
      case 'spell':
        return `Cast ${metadata.name || category}`
      case 'attack':
        return `${category} Attack`
      case 'interaction':
        return `Interact with ${category}`
      case 'move':
        return 'Movement'
      default:
        return metadata.name || 'Unknown Action'
    }
  }

  const getDuration = () => {
    if (entry.completedAt && entry.executedAt) {
      return `${entry.completedAt - entry.executedAt}ms`
    }
    return `${entry.duration}ms`
  }

  const getTypeIconStyle = () => {
    const baseStyle = {
      width: '24px',
      height: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '4px',
      flexShrink: 0
    }

    switch (entry.type) {
      case 'spell':
        return { ...baseStyle, backgroundColor: 'var(--colors-purple600)', color: 'white' }
      case 'attack':
        return { ...baseStyle, backgroundColor: 'var(--colors-dndRed)', color: 'white' }
      case 'interaction':
        return { ...baseStyle, backgroundColor: 'var(--colors-secondary)', color: 'var(--colors-gray900)' }
      case 'move':
        return { ...baseStyle, backgroundColor: 'var(--colors-gray600)', color: 'white' }
      default:
        return { ...baseStyle, backgroundColor: 'var(--colors-gray600)', color: 'white' }
    }
  }

  const getStatusColor = () => {
    switch (entry.status) {
      case 'completed':
        return 'var(--colors-success)'
      case 'failed':
        return 'var(--colors-error)'
      case 'executing':
        return 'var(--colors-warning)'
      default:
        return 'var(--colors-gray400)'
    }
  }

  const getContainerStyle = () => {
    let borderLeftColor = 'transparent'
    let backgroundColor = 'transparent'

    switch (entry.status) {
      case 'completed':
        borderLeftColor = 'var(--colors-success)'
        break
      case 'failed':
        borderLeftColor = 'var(--colors-error)'
        break
      case 'executing':
        borderLeftColor = 'var(--colors-warning)'
        backgroundColor = 'var(--colors-gray800)'
        break
    }

    return {
      padding: '8px 12px',
      borderBottom: '1px solid var(--colors-gray700)',
      borderLeft: `3px solid ${borderLeftColor}`,
      backgroundColor,
      cursor: 'pointer',
      transition: 'background-color 0.2s'
    }
  }

  return (
    <Box
      style={getContainerStyle()}
      onClick={onToggleExpand}
    >
      {/* Entry Header */}
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        {/* Type Icon */}
        <Box style={getTypeIconStyle()}>
          {getTypeIcon()}
        </Box>

        {/* Title */}
        <Text
          variant="body"
          size="sm"
          style={{
            flex: 1,
            fontWeight: '500',
            color: 'var(--colors-gray200)'
          }}
        >
          {getActionDescription()}
        </Text>

        {/* Status Icon */}
        <Box
          style={{
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: getStatusColor()
          }}
        >
          {getStatusIcon()}
        </Box>

        {/* Timestamp */}
        <Box
          style={{
            fontSize: '10px',
            color: 'var(--colors-gray500)',
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Clock size={12} />
          {formatTimestamp(entry.timestamp)}
        </Box>
      </Box>

      {/* Expanded Details */}
      {isExpanded && (
        <Box
          style={{
            marginTop: '8px',
            marginLeft: '32px',
            padding: '8px',
            backgroundColor: 'var(--colors-gray850)',
            borderRadius: '4px',
            fontSize: '14px',
            color: 'var(--colors-gray400)'
          }}
        >
          {/* Category */}
          <Box
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '4px 0'
            }}
          >
            <Text
              variant="body"
              size="xs"
              style={{ color: 'var(--colors-gray500)' }}
            >
              Category:
            </Text>
            <Text
              variant="body"
              size="xs"
              style={{
                color: 'var(--colors-gray200)',
                fontFamily: 'monospace'
              }}
            >
              {entry.category}
            </Text>
          </Box>

          {/* Duration */}
          <Box
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '4px 0'
            }}
          >
            <Text
              variant="body"
              size="xs"
              style={{ color: 'var(--colors-gray500)' }}
            >
              Duration:
            </Text>
            <Text
              variant="body"
              size="xs"
              style={{
                color: 'var(--colors-gray200)',
                fontFamily: 'monospace'
              }}
            >
              {getDuration()}
            </Text>
          </Box>

          {/* Animation */}
          {entry.animation && (
            <Box
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '4px 0'
              }}
            >
              <Text
                variant="body"
                size="xs"
                style={{ color: 'var(--colors-gray500)' }}
              >
                Animation:
              </Text>
              <Text
                variant="body"
                size="xs"
                style={{
                  color: 'var(--colors-gray200)',
                  fontFamily: 'monospace'
                }}
              >
                {entry.animation.type}
              </Text>
            </Box>
          )}

          {/* Affected Targets */}
          {entry.effects?.affectedTargets && entry.effects.affectedTargets.length > 0 && (
            <>
              <Box
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '4px 0'
                }}
              >
                <Text
                  variant="body"
                  size="xs"
                  style={{ color: 'var(--colors-gray500)' }}
                >
                  Affected Targets:
                </Text>
              </Box>
              <Box
                style={{
                  marginTop: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  flexWrap: 'wrap'
                }}
              >
                {entry.effects.affectedTargets.map(targetId => (
                  <Text
                    key={targetId}
                    variant="body"
                    size="xs"
                    style={{
                      padding: '2px 6px',
                      backgroundColor: 'var(--colors-gray700)',
                      borderRadius: '4px',
                      color: 'var(--colors-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px'
                    }}
                  >
                    <Target size={10} />
                    {targetId}
                  </Text>
                ))}
              </Box>
            </>
          )}

          {/* Error */}
          {entry.error && (
            <Box
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '4px 0',
                color: 'var(--colors-error)'
              }}
            >
              <Text
                variant="body"
                size="xs"
                style={{ color: 'var(--colors-gray500)' }}
              >
                Error:
              </Text>
              <Text
                variant="body"
                size="xs"
                style={{
                  color: 'var(--colors-error)',
                  fontFamily: 'monospace'
                }}
              >
                {entry.error}
              </Text>
            </Box>
          )}

          {/* Description */}
          {entry.metadata.description && (
            <Box
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '4px 0'
              }}
            >
              <Text
                variant="body"
                size="xs"
                style={{ color: 'var(--colors-gray500)' }}
              >
                Description:
              </Text>
              <Text
                variant="body"
                size="xs"
                style={{
                  color: 'var(--colors-gray200)',
                  fontFamily: 'monospace'
                }}
              >
                {entry.metadata.description}
              </Text>
            </Box>
          )}
        </Box>
      )}
    </Box>
  )
}

export const ActionLogEntry = memo(ActionLogEntryComponent)