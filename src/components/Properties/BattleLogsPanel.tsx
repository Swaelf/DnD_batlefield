import { memo, useState, useMemo, type FC } from 'react'
import useBattleLogStore from '@/store/battleLogStore'
import useTimelineStore from '@/store/timelineStore'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Button } from '@/components/primitives/ButtonVE'
import {
  Panel,
  PanelHeader,
  PanelTitle,
  PanelBody,
  PanelSection
} from '@/components/ui/Panel'
import { Trash2, Filter, Circle } from '@/utils/optimizedIcons'
import type { BattleLogEntry } from '@/types/timeline'

const BattleLogsPanelComponent: FC = () => {
  const entries = useBattleLogStore(state => state.entries)
  const currentRound = useTimelineStore(state => state.currentRound)
  const currentEvent = useTimelineStore(state => state.currentEvent)
  const clearAll = useBattleLogStore(state => state.clearAll)
  const clearRound = useBattleLogStore(state => state.clearRound)

  const [filterType, setFilterType] = useState<BattleLogEntry['type'] | 'all'>('all')
  const [filterRound, setFilterRound] = useState<number | 'all'>('all')

  // Filter and sort entries
  const filteredEntries = useMemo(() => {
    let filtered = [...entries]

    if (filterType !== 'all') {
      filtered = filtered.filter(e => e.type === filterType)
    }

    if (filterRound !== 'all') {
      filtered = filtered.filter(e => e.roundNumber === filterRound)
    }

    // Sort by timestamp (newest first)
    return filtered.sort((a, b) => b.timestamp - a.timestamp)
  }, [entries, filterType, filterRound])

  // Get unique rounds for filter dropdown
  const availableRounds = useMemo(() => {
    const rounds = new Set(entries.map(e => e.roundNumber))
    return Array.from(rounds).sort((a, b) => b - a)
  }, [entries])

  // Get severity color
  const getSeverityColor = (severity?: BattleLogEntry['severity']) => {
    switch (severity) {
      case 'critical': return 'var(--color-error)'
      case 'high': return 'var(--color-warning)'
      case 'normal': return 'var(--color-text)'
      case 'low': return 'var(--color-textMuted)'
      default: return 'var(--color-text)'
    }
  }

  // Get type badge color
  const getTypeBadgeColor = (type: BattleLogEntry['type']) => {
    switch (type) {
      case 'action': return '#4ade80' // green
      case 'damage': return '#f87171' // red
      case 'heal': return '#60a5fa' // blue
      case 'spell': return '#c084fc' // purple
      case 'movement': return '#fbbf24' // yellow
      case 'round': return '#f97316' // orange
      case 'info': return '#94a3b8' // gray
      default: return '#94a3b8'
    }
  }

  return (
    <Panel size="sidebar" data-testid="battle-logs-panel">
      <PanelHeader>
        <PanelTitle>Battle Logs</PanelTitle>
      </PanelHeader>

      <PanelBody scrollable style={{ maxHeight: 'calc(100vh - 80px)', overflowY: 'auto' }} className="custom-scrollbar">
        {/* Current Round/Event Info */}
        <PanelSection>
          <Box
            padding={3}
            style={{
              backgroundColor: 'var(--color-surfaceHover)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)'
            }}
          >
            <Text size="sm" weight="bold" color="primary">
              Round {currentRound} • Event {currentEvent}
            </Text>
            <Text size="xs" color="textSecondary" style={{ marginTop: '4px' }}>
              {entries.length} total log {entries.length === 1 ? 'entry' : 'entries'}
            </Text>
          </Box>
        </PanelSection>

        {/* Filters */}
        <PanelSection>
          <Box display="flex" flexDirection="column" gap={2}>
            <Text size="sm" weight="bold" color="text">
              <Filter size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              Filters
            </Text>

            {/* Type Filter */}
            <Box display="flex" flexDirection="column" gap={1}>
              <Text size="xs" color="textSecondary">Type:</Text>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as typeof filterType)}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px'
                }}
              >
                <option value="all">All Types</option>
                <option value="action">Actions</option>
                <option value="damage">Damage</option>
                <option value="heal">Healing</option>
                <option value="spell">Spells</option>
                <option value="movement">Movement</option>
                <option value="round">Round Events</option>
                <option value="info">Info</option>
              </select>
            </Box>

            {/* Round Filter */}
            <Box display="flex" flexDirection="column" gap={1}>
              <Text size="xs" color="textSecondary">Round:</Text>
              <select
                value={filterRound}
                onChange={(e) => setFilterRound(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px'
                }}
              >
                <option value="all">All Rounds</option>
                {availableRounds.map(round => (
                  <option key={round} value={round}>Round {round}</option>
                ))}
              </select>
            </Box>
          </Box>
        </PanelSection>

        {/* Action Buttons */}
        <PanelSection>
          <Box display="flex" gap={2}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => clearRound(currentRound)}
              disabled={entries.filter(e => e.roundNumber === currentRound).length === 0}
            >
              <Trash2 size={14} />
              Clear Round
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={clearAll}
              disabled={entries.length === 0}
            >
              <Trash2 size={14} />
              Clear All
            </Button>
          </Box>
        </PanelSection>

        {/* Log Entries */}
        <PanelSection>
          {filteredEntries.length === 0 ? (
            <Box padding={4} style={{ textAlign: 'center' }}>
              <Text size="sm" color="textSecondary">
                No battle log entries
                {filterType !== 'all' || filterRound !== 'all' ? ' matching filters' : ''}
              </Text>
            </Box>
          ) : (
            <Box display="flex" flexDirection="column" gap={2}>
              {filteredEntries.map(entry => (
                <Box
                  key={entry.id}
                  padding={3}
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    borderLeft: `3px solid ${getSeverityColor(entry.severity)}`
                  }}
                >
                  {/* Header: Round/Event + Type Badge */}
                  <Box display="flex" alignItems="center" justifyContent="space-between" style={{ marginBottom: '6px' }}>
                    <Text size="xs" color="textSecondary">
                      R{entry.roundNumber} • E{entry.eventNumber}
                    </Text>
                    <Box
                      style={{
                        padding: '2px 8px',
                        backgroundColor: getTypeBadgeColor(entry.type),
                        borderRadius: 'var(--radius-sm)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Circle size={6} fill="white" />
                      <Text size="xs" weight="medium" style={{ color: 'white' }}>
                        {entry.type.toUpperCase()}
                      </Text>
                    </Box>
                  </Box>

                  {/* Message */}
                  <Text
                    size="sm"
                    color="text"
                    style={{
                      marginBottom: entry.tokenName ? '4px' : 0,
                      color: getSeverityColor(entry.severity)
                    }}
                  >
                    {entry.message}
                  </Text>

                  {/* Token Name (if present) */}
                  {entry.tokenName && (
                    <Text size="xs" color="textSecondary">
                      {entry.tokenName}
                    </Text>
                  )}

                  {/* Details (if present) */}
                  {entry.details && Object.keys(entry.details).length > 0 && (
                    <Box
                      style={{
                        marginTop: '6px',
                        padding: '6px',
                        backgroundColor: 'var(--color-surfaceHover)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '11px',
                        fontFamily: 'monospace',
                        color: 'var(--color-textMuted)'
                      }}
                    >
                      {JSON.stringify(entry.details, null, 2)}
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          )}
        </PanelSection>
      </PanelBody>
    </Panel>
  )
}

export const BattleLogsPanel = memo(BattleLogsPanelComponent)
BattleLogsPanel.displayName = 'BattleLogsPanel'
