import React, { memo, useState, useMemo, useRef, useEffect } from 'react'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Button } from '@/components/primitives/ButtonVE'
import { useUnifiedActionStore } from '@/store/unifiedActionStore'
import type { ActionHistoryEntry } from '@/types/unifiedAction'
import { ActionLogEntry } from './ActionLogEntry'
import {
  Search,
  Filter,
  X,
  Trash2,
  Download,
  // ChevronDown, // unused
  Activity,
  // Calendar, // unused
  Clock
} from '@/utils/optimizedIcons'
import type { ActionFilter } from '@/types/unifiedAction'

type ActionLogSidebarProps = {
  isOpen?: boolean
  onClose?: () => void
  maxHeight?: string
}

const ActionLogSidebarComponent: React.FC<ActionLogSidebarProps> = ({
  isOpen = false,
  onClose,
  maxHeight = '100vh'
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'timestamp' | 'type' | 'name'>('timestamp')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [showFilters, setShowFilters] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const {
    actionHistory,
    clearHistory
    // exportHistory, // TODO: Add to store
    // getFilteredHistory, // TODO: Add to store
    // getHistoryStats // TODO: Add to store
  } = useUnifiedActionStore()

  // Temporary implementations until store methods are added
  const exportHistory = (_history?: ActionHistoryEntry[]) => {
  }

  const getFilteredHistory = (_filter: ActionFilter, _searchTerm: string) => {
    return actionHistory // Return unfiltered for now
  }

  const getHistoryStats = () => ({
    total: actionHistory.length,
    totalActions: actionHistory.length,
    successCount: 0,
    failureCount: 0,
    byType: {
      spell: actionHistory.filter(a => a.type === 'spell').length,
      attack: actionHistory.filter(a => a.type === 'attack').length,
      move: actionHistory.filter(a => a.type === 'move').length,
      interaction: actionHistory.filter(a => a.type === 'interaction').length
    }
  })

  // Filtered and sorted action history
  const filteredActions = useMemo(() => {
    // Create filter object based on filterType string
    const filter: ActionFilter = filterType === 'all' ? {} : { types: [filterType as any] }
    const filtered = getFilteredHistory(filter, searchTerm)

    // Sort actions
    filtered.sort((a: any, b: any) => {
      let comparison = 0

      switch (sortBy) {
        case 'timestamp':
          comparison = a.timestamp - b.timestamp
          break
        case 'type':
          comparison = a.action.type.localeCompare(b.action.type)
          break
        case 'name':
          comparison = a.action.name.localeCompare(b.action.name)
          break
        default:
          comparison = 0
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [actionHistory, filterType, searchTerm, sortBy, sortOrder, getFilteredHistory])

  // History statistics
  const stats = useMemo(() => getHistoryStats(), [actionHistory, getHistoryStats])

  // Auto-scroll to bottom when new actions are added
  useEffect(() => {
    if (scrollContainerRef.current && sortOrder === 'desc') {
      scrollContainerRef.current.scrollTop = 0
    }
  }, [actionHistory.length, sortOrder])

  // Handle search input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  // Handle filter change
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterType(e.target.value)
  }

  // Handle sort change
  const handleSortChange = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  // Export history to file
  const handleExport = () => {
    try {
      exportHistory(filteredActions)
    } catch (error) {
      console.error('Failed to export action history:', error)
    }
  }

  // Clear all history with confirmation
  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all action history? This cannot be undone.')) {
      clearHistory()
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <Box
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 39
        }}
        onClick={onClose}
      />

      {/* Sidebar */}
      <Box
        style={{
          position: 'fixed',
          right: 0,
          top: 0,
          width: '380px',
          height: maxHeight,
          backgroundColor: 'var(--colors-gray900)',
          borderLeft: '1px solid var(--colors-gray700)',
          display: 'flex',
          flexDirection: 'column',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease',
          zIndex: 40
        }}
      >
        {/* Header */}
        <Box
          style={{
            padding: '16px',
            borderBottom: '1px solid var(--colors-gray700)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={20} color="var(--colors-secondary)" />
            <Text variant="heading" size="lg" style={{ fontWeight: '600' }}>
              Action Log
            </Text>
          </Box>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <X size={16} />
          </Button>
        </Box>

        {/* Stats Summary */}
        <Box
          style={{
            padding: '12px 16px',
            backgroundColor: 'var(--colors-gray800)',
            borderBottom: '1px solid var(--colors-gray700)'
          }}
        >
          <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text variant="body" size="sm" style={{ color: 'var(--colors-gray300)' }}>
              Total Actions: {stats.total}
            </Text>
            <Text variant="body" size="xs" style={{ color: 'var(--colors-gray400)' }}>
              {filteredActions.length} shown
            </Text>
          </Box>

          <Box style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
            <Text variant="body" size="xs" style={{ color: 'var(--colors-blue400)' }}>
              Spells: {stats.byType.spell || 0}
            </Text>
            <Text variant="body" size="xs" style={{ color: 'var(--colors-red400)' }}>
              Attacks: {stats.byType.attack || 0}
            </Text>
            <Text variant="body" size="xs" style={{ color: 'var(--colors-green400)' }}>
              Moves: {stats.byType.move || 0}
            </Text>
            <Text variant="body" size="xs" style={{ color: 'var(--colors-purple400)' }}>
              Other: {stats.byType.interaction || 0}
            </Text>
          </Box>
        </Box>

        {/* Search and Filters */}
        <Box
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--colors-gray700)'
          }}
        >
          {/* Search Bar */}
          <Box style={{ position: 'relative', marginBottom: '12px' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--colors-gray400)'
              }}
            />
            <input
              type="text"
              placeholder="Search actions..."
              value={searchTerm}
              onChange={handleSearch}
              style={{
                width: '100%',
                padding: '8px 8px 8px 32px',
                backgroundColor: 'var(--colors-gray800)',
                border: '1px solid var(--colors-gray600)',
                borderRadius: '6px',
                color: 'var(--colors-gray200)',
                fontSize: '14px'
              }}
            />
          </Box>

          {/* Filter Controls */}
          <Box style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <select
              value={filterType}
              onChange={handleFilterChange}
              style={{
                flex: 1,
                padding: '6px 8px',
                backgroundColor: 'var(--colors-gray800)',
                border: '1px solid var(--colors-gray600)',
                borderRadius: '4px',
                color: 'var(--colors-gray200)',
                fontSize: '12px'
              }}
            >
              <option value="all">All Types</option>
              <option value="spell">Spells</option>
              <option value="attack">Attacks</option>
              <option value="move">Movement</option>
              <option value="interaction">Interactions</option>
            </select>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={14} />
            </Button>
          </Box>

          {/* Advanced Filters */}
          {showFilters && (
            <Box
              style={{
                padding: '8px',
                backgroundColor: 'var(--colors-gray800)',
                borderRadius: '4px',
                border: '1px solid var(--colors-gray600)'
              }}
            >
              <Text variant="body" size="xs" style={{ marginBottom: '8px', color: 'var(--colors-gray400)' }}>
                Sort Options
              </Text>

              <Box style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                <Button
                  variant={sortBy === 'timestamp' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => handleSortChange('timestamp')}
                  style={{ fontSize: '11px', padding: '4px 8px' }}
                >
                  <Clock size={12} style={{ marginRight: '4px' }} />
                  Time {sortBy === 'timestamp' && (sortOrder === 'asc' ? '↑' : '↓')}
                </Button>

                <Button
                  variant={sortBy === 'type' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => handleSortChange('type')}
                  style={{ fontSize: '11px', padding: '4px 8px' }}
                >
                  Type {sortBy === 'type' && (sortOrder === 'asc' ? '↑' : '↓')}
                </Button>

                <Button
                  variant={sortBy === 'name' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => handleSortChange('name')}
                  style={{ fontSize: '11px', padding: '4px 8px' }}
                >
                  Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </Button>
              </Box>
            </Box>
          )}
        </Box>

        {/* Actions List */}
        <Box
          ref={scrollContainerRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '8px'
          }}
        >
          {filteredActions.length === 0 ? (
            <Box
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '200px',
                textAlign: 'center'
              }}
            >
              <Activity size={48} color="var(--colors-gray600)" style={{ marginBottom: '16px' }} />
              <Text variant="body" size="md" style={{ color: 'var(--colors-gray400)', marginBottom: '8px' }}>
                {searchTerm || filterType !== 'all' ? 'No matching actions found' : 'No actions recorded yet'}
              </Text>
              <Text variant="body" size="sm" style={{ color: 'var(--colors-gray500)' }}>
                {searchTerm || filterType !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Actions will appear here as they are executed'}
              </Text>
            </Box>
          ) : (
            filteredActions.map((entry: any, index: number) => (
              <ActionLogEntry
                key={`${entry.id}-${index}`}
                entry={entry}
              />
            ))
          )}
        </Box>

        {/* Footer Actions */}
        <Box
          style={{
            padding: '12px 16px',
            borderTop: '1px solid var(--colors-gray700)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px'
          }}
        >
          <Box style={{ display: 'flex', gap: '8px' }}>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={filteredActions.length === 0}
            >
              <Download size={14} style={{ marginRight: '4px' }} />
              Export
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleClearHistory}
              disabled={actionHistory.length === 0}
            >
              <Trash2 size={14} style={{ marginRight: '4px' }} />
              Clear
            </Button>
          </Box>

          <Text variant="body" size="xs" style={{ color: 'var(--colors-gray500)' }}>
            Last updated: {actionHistory.length > 0
              ? new Date(actionHistory[actionHistory.length - 1].timestamp).toLocaleTimeString()
              : 'Never'
            }
          </Text>
        </Box>
      </Box>
    </>
  )
}

export const ActionLogSidebar = memo(ActionLogSidebarComponent)
export default ActionLogSidebar