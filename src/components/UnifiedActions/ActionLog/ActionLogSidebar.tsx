import { memo, useState, useMemo, useRef, useEffect } from 'react'
import { styled } from '@/styles/theme.config'
import { useUnifiedActionStore } from '@/store/unifiedActionStore'
import { ActionLogEntry } from './ActionLogEntry'
import {
  Search,
  Filter,
  X,
  Trash2,
  Download,
  ChevronDown,
  Activity
} from 'lucide-react'
import type { ActionFilter, ActionHistoryEntry } from '@/types/unifiedAction'

type ActionLogSidebarProps = {
  isOpen?: boolean
  onClose?: () => void
  maxHeight?: string
}

const SidebarContainer = styled('div', {
  position: 'fixed',
  right: 0,
  top: 0,
  width: 320,
  height: '100vh',
  backgroundColor: '$gray900',
  borderLeft: '1px solid $gray700',
  display: 'flex',
  flexDirection: 'column',
  transform: 'translateX(100%)',
  transition: 'transform 0.3s ease',
  zIndex: 40,

  variants: {
    isOpen: {
      true: {
        transform: 'translateX(0)'
      }
    }
  }
})

const Header = styled('div', {
  padding: '$3',
  borderBottom: '1px solid $gray700',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: '$gray850'
})

const Title = styled('h3', {
  fontSize: '$medium',
  fontWeight: 600,
  color: '$text',
  display: 'flex',
  alignItems: 'center',
  gap: '$2'
})

const CloseButton = styled('button', {
  background: 'none',
  border: 'none',
  color: '$gray400',
  cursor: 'pointer',
  padding: '$1',
  borderRadius: '$small',
  transition: 'background-color 0.2s',

  '&:hover': {
    backgroundColor: '$gray700',
    color: '$text'
  }
})

const SearchContainer = styled('div', {
  padding: '$2 $3',
  borderBottom: '1px solid $gray700',
  backgroundColor: '$gray850'
})

const SearchInput = styled('input', {
  width: '100%',
  padding: '$2',
  paddingLeft: 32,
  backgroundColor: '$gray800',
  border: '1px solid $gray700',
  borderRadius: '$small',
  color: '$text',
  fontSize: '$small',

  '&::placeholder': {
    color: '$gray500'
  },

  '&:focus': {
    outline: 'none',
    borderColor: '$primary'
  }
})

const SearchIcon = styled(Search, {
  position: 'absolute',
  left: '$3',
  top: '50%',
  transform: 'translateY(-50%)',
  color: '$gray500',
  pointerEvents: 'none'
})

const FilterBar = styled('div', {
  padding: '$2 $3',
  borderBottom: '1px solid $gray700',
  display: 'flex',
  gap: '$2',
  flexWrap: 'wrap',
  backgroundColor: '$gray850'
})

const FilterChip = styled('button', {
  padding: '$1 $2',
  backgroundColor: '$gray700',
  border: '1px solid $gray600',
  borderRadius: '$small',
  color: '$gray400',
  fontSize: '$tiny',
  cursor: 'pointer',
  transition: 'all 0.2s',

  '&:hover': {
    borderColor: '$gray500',
    color: '$text'
  },

  variants: {
    active: {
      true: {
        backgroundColor: '$primary',
        borderColor: '$primary',
        color: 'white'
      }
    }
  }
})

const LogList = styled('div', {
  flex: 1,
  overflowY: 'auto',
  overflowX: 'hidden'
})

const EmptyState = styled('div', {
  padding: '$8',
  textAlign: 'center',
  color: '$gray500'
})

const Footer = styled('div', {
  padding: '$2 $3',
  borderTop: '1px solid $gray700',
  display: 'flex',
  gap: '$2',
  backgroundColor: '$gray850'
})

const FooterButton = styled('button', {
  flex: 1,
  padding: '$2',
  backgroundColor: '$gray700',
  border: 'none',
  borderRadius: '$small',
  color: '$text',
  fontSize: '$small',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '$1',
  transition: 'background-color 0.2s',

  '&:hover': {
    backgroundColor: '$gray600'
  },

  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed'
  }
})

const Stats = styled('div', {
  padding: '$2 $3',
  backgroundColor: '$gray850',
  borderBottom: '1px solid $gray700',
  display: 'flex',
  justifyContent: 'space-around',
  fontSize: '$tiny'
})

const StatItem = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '$1',

  '& span:first-child': {
    color: '$gray500'
  },

  '& span:last-child': {
    color: '$text',
    fontWeight: 500
  }
})

const ActionLogSidebarComponent = ({
  isOpen = false,
  onClose,
  maxHeight
}: ActionLogSidebarProps) => {
  const actionHistory = useUnifiedActionStore(state => state.actionHistory)
  const activeActions = useUnifiedActionStore(state => state.activeActions)
  const clearHistory = useUnifiedActionStore(state => state.clearHistory)
  const filterHistory = useUnifiedActionStore(state => state.filterHistory)

  const [searchQuery, setSearchQuery] = useState('')
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set())
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set())
  const listRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new entries are added
  useEffect(() => {
    if (listRef.current && actionHistory.length > 0) {
      listRef.current.scrollTop = 0
    }
  }, [actionHistory.length])

  // Filter logic
  const filteredHistory = useMemo(() => {
    let filtered = [...actionHistory]

    // Apply type filters
    if (activeFilters.size > 0) {
      const filter: ActionFilter = {
        types: Array.from(activeFilters) as any[]
      }
      filtered = filterHistory(filter)
    }

    // Apply search query
    if (searchQuery) {
      filtered = filtered.filter(entry => {
        const searchLower = searchQuery.toLowerCase()
        return (
          entry.metadata.name?.toLowerCase().includes(searchLower) ||
          entry.category.toLowerCase().includes(searchLower) ||
          entry.type.toLowerCase().includes(searchLower)
        )
      })
    }

    return filtered
  }, [actionHistory, activeFilters, searchQuery, filterHistory])

  // Statistics
  const stats = useMemo(() => {
    const total = actionHistory.length
    const completed = actionHistory.filter(e => e.status === 'completed').length
    const failed = actionHistory.filter(e => e.status === 'failed').length
    const executing = activeActions.length

    return { total, completed, failed, executing }
  }, [actionHistory, activeActions])

  const toggleFilter = (type: string) => {
    setActiveFilters(prev => {
      const newFilters = new Set(prev)
      if (newFilters.has(type)) {
        newFilters.delete(type)
      } else {
        newFilters.add(type)
      }
      return newFilters
    })
  }

  const toggleExpanded = (entryId: string) => {
    setExpandedEntries(prev => {
      const newExpanded = new Set(prev)
      if (newExpanded.has(entryId)) {
        newExpanded.delete(entryId)
      } else {
        newExpanded.add(entryId)
      }
      return newExpanded
    })
  }

  const exportHistory = () => {
    const data = JSON.stringify(actionHistory, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `action-history-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleClearHistory = () => {
    if (window.confirm('Clear all action history? This cannot be undone.')) {
      clearHistory()
      setExpandedEntries(new Set())
    }
  }

  return (
    <SidebarContainer isOpen={isOpen} style={{ maxHeight }}>
      <Header>
        <Title>
          <Activity size={18} />
          Action Log
        </Title>
        <CloseButton onClick={onClose}>
          <X size={18} />
        </CloseButton>
      </Header>

      <SearchContainer style={{ position: 'relative' }}>
        <SearchIcon size={16} />
        <SearchInput
          type="text"
          placeholder="Search actions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </SearchContainer>

      <FilterBar>
        <FilterChip
          active={activeFilters.has('spell')}
          onClick={() => toggleFilter('spell')}
        >
          Spells
        </FilterChip>
        <FilterChip
          active={activeFilters.has('attack')}
          onClick={() => toggleFilter('attack')}
        >
          Attacks
        </FilterChip>
        <FilterChip
          active={activeFilters.has('interaction')}
          onClick={() => toggleFilter('interaction')}
        >
          Interactions
        </FilterChip>
        <FilterChip
          active={activeFilters.has('move')}
          onClick={() => toggleFilter('move')}
        >
          Movement
        </FilterChip>
      </FilterBar>

      <Stats>
        <StatItem>
          <span>Total</span>
          <span>{stats.total}</span>
        </StatItem>
        <StatItem>
          <span>Success</span>
          <span style={{ color: '$success' }}>{stats.completed}</span>
        </StatItem>
        <StatItem>
          <span>Failed</span>
          <span style={{ color: '$error' }}>{stats.failed}</span>
        </StatItem>
        <StatItem>
          <span>Active</span>
          <span style={{ color: '$warning' }}>{stats.executing}</span>
        </StatItem>
      </Stats>

      <LogList ref={listRef}>
        {filteredHistory.length === 0 ? (
          <EmptyState>
            {searchQuery || activeFilters.size > 0
              ? 'No actions match your filters'
              : 'No actions recorded yet'}
          </EmptyState>
        ) : (
          <>
            {/* Show active actions first */}
            {activeActions.map(action => (
              <ActionLogEntry
                key={action.id}
                entry={{
                  ...action,
                  executedAt: action.timestamp,
                  status: 'executing'
                } as ActionHistoryEntry}
                isExpanded={expandedEntries.has(action.id)}
                onToggleExpand={() => toggleExpanded(action.id)}
              />
            ))}

            {/* Then show history */}
            {filteredHistory.map(entry => (
              <ActionLogEntry
                key={entry.id}
                entry={entry}
                isExpanded={expandedEntries.has(entry.id)}
                onToggleExpand={() => toggleExpanded(entry.id)}
              />
            ))}
          </>
        )}
      </LogList>

      <Footer>
        <FooterButton onClick={exportHistory} disabled={actionHistory.length === 0}>
          <Download size={14} />
          Export
        </FooterButton>
        <FooterButton onClick={handleClearHistory} disabled={actionHistory.length === 0}>
          <Trash2 size={14} />
          Clear
        </FooterButton>
      </Footer>
    </SidebarContainer>
  )
}

export const ActionLogSidebar = memo(ActionLogSidebarComponent)