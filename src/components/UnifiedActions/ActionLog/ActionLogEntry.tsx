import { memo } from 'react'
import { styled } from '@/styles/theme.config'
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

const EntryContainer = styled('div', {
  padding: '$2 $3',
  borderBottom: '1px solid $gray700',
  cursor: 'pointer',
  transition: 'background-color 0.2s',

  '&:hover': {
    backgroundColor: '$gray800'
  },

  variants: {
    status: {
      completed: {
        borderLeft: '3px solid $success'
      },
      failed: {
        borderLeft: '3px solid $error'
      },
      executing: {
        borderLeft: '3px solid $warning',
        backgroundColor: '$gray800'
      }
    }
  }
})

const EntryHeader = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$2'
})

const TypeIcon = styled('div', {
  width: 24,
  height: 24,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '$small',
  flexShrink: 0,

  variants: {
    type: {
      spell: {
        backgroundColor: '$purple',
        color: 'white'
      },
      attack: {
        backgroundColor: '$dndRed',
        color: 'white'
      },
      interaction: {
        backgroundColor: '$secondary',
        color: '$gray900'
      },
      move: {
        backgroundColor: '$gray600',
        color: 'white'
      }
    }
  }
})

const EntryTitle = styled('div', {
  flex: 1,
  fontSize: '$small',
  fontWeight: 500,
  color: '$text'
})

const StatusIcon = styled('div', {
  width: 20,
  height: 20,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  variants: {
    status: {
      completed: {
        color: '$success'
      },
      failed: {
        color: '$error'
      },
      executing: {
        color: '$warning'
      }
    }
  }
})

const Timestamp = styled('div', {
  fontSize: '$tiny',
  color: '$gray500',
  marginLeft: 'auto',
  display: 'flex',
  alignItems: 'center',
  gap: '$1'
})

const EntryDetails = styled('div', {
  marginTop: '$2',
  marginLeft: 32,
  padding: '$2',
  backgroundColor: '$gray850',
  borderRadius: '$small',
  fontSize: '$small',
  color: '$gray400'
})

const DetailRow = styled('div', {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '$1 0',

  '& span:first-child': {
    color: '$gray500',
    marginRight: '$2'
  },

  '& span:last-child': {
    color: '$text',
    fontFamily: '$mono',
    fontSize: '$tiny'
  }
})

const AffectedTargets = styled('div', {
  marginTop: '$1',
  display: 'flex',
  alignItems: 'center',
  gap: '$1',
  flexWrap: 'wrap'
})

const TargetChip = styled('span', {
  padding: '2px 6px',
  backgroundColor: '$gray700',
  borderRadius: '$small',
  fontSize: '$tiny',
  color: '$secondary'
})

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

  return (
    <EntryContainer
      status={entry.status}
      onClick={onToggleExpand}
    >
      <EntryHeader>
        <TypeIcon type={entry.type}>
          {getTypeIcon()}
        </TypeIcon>

        <EntryTitle>
          {getActionDescription()}
        </EntryTitle>

        <StatusIcon status={entry.status}>
          {getStatusIcon()}
        </StatusIcon>

        <Timestamp>
          <Clock size={12} />
          {formatTimestamp(entry.timestamp)}
        </Timestamp>
      </EntryHeader>

      {isExpanded && (
        <EntryDetails>
          <DetailRow>
            <span>Category:</span>
            <span>{entry.category}</span>
          </DetailRow>

          <DetailRow>
            <span>Duration:</span>
            <span>{getDuration()}</span>
          </DetailRow>

          {entry.animation && (
            <DetailRow>
              <span>Animation:</span>
              <span>{entry.animation.type}</span>
            </DetailRow>
          )}

          {entry.effects?.affectedTargets && entry.effects.affectedTargets.length > 0 && (
            <>
              <DetailRow>
                <span>Affected Targets:</span>
              </DetailRow>
              <AffectedTargets>
                {entry.effects.affectedTargets.map(targetId => (
                  <TargetChip key={targetId}>
                    <Target size={10} style={{ display: 'inline', marginRight: 2 }} />
                    {targetId}
                  </TargetChip>
                ))}
              </AffectedTargets>
            </>
          )}

          {entry.error && (
            <DetailRow style={{ color: '$error' }}>
              <span>Error:</span>
              <span>{entry.error}</span>
            </DetailRow>
          )}

          {entry.metadata.description && (
            <DetailRow>
              <span>Description:</span>
              <span>{entry.metadata.description}</span>
            </DetailRow>
          )}
        </EntryDetails>
      )}
    </EntryContainer>
  )
}

export const ActionLogEntry = memo(ActionLogEntryComponent)