/**
 * Action Selector Component
 * Main action selection interface - replaces ActionSelectionModal
 */

import React, { useEffect, useState, useMemo } from 'react'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Button } from '@/components/primitives/ButtonVE'
import { Search, X, Filter, Grid, List, Wand2, Sword, Move, Settings } from 'lucide-react'
import { useActionLibrary } from '../../../hooks'
import type { UnifiedAction } from '../../../types'

export type ActionSelectorProps = {
  isOpen: boolean
  onClose: () => void
  onSelect: (action: UnifiedAction) => void
  onEdit?: (action: UnifiedAction) => void
  className?: string
}

type ActionCategory = 'all' | 'spell' | 'attack' | 'move' | 'interaction'
type ViewMode = 'grid' | 'list'

export const ActionSelector: React.FC<ActionSelectorProps> = ({
  isOpen,
  onClose,
  onSelect,
  onEdit,
  className
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<ActionCategory>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [showFilters, setShowFilters] = useState(false)

  const {
    getAllActions,
    categories: _categories, // Available but not currently used
    isSearching: loading,
    searchResults: _searchResults, // Available but not currently used
    search: _searchActions, // Available but not currently used
    getActionsByCategory
  } = useActionLibrary()

  const actions = getAllActions()
  const error = null // No error state in current implementation

  // Reset search when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('')
      setSelectedCategory('all')
    }
  }, [isOpen])

  // Filter actions based on search and category
  const filteredActions = useMemo(() => {
    let filtered = actions

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = getActionsByCategory(selectedCategory)
    }

    // Filter by search term
    if (searchTerm) {
      // Use simple filter since searchActions is async
      filtered = filtered.filter((action: UnifiedAction) =>
        action.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        action.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        action.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    return filtered
  }, [actions, selectedCategory, searchTerm, getActionsByCategory])

  // Category options with icons
  const categoryOptions = [
    { value: 'all', label: 'All Actions', icon: <Filter size={16} />, count: actions.length },
    { value: 'spell', label: 'Spells', icon: <Wand2 size={16} />, count: getActionsByCategory('spell').length },
    { value: 'attack', label: 'Attacks', icon: <Sword size={16} />, count: getActionsByCategory('attack').length },
    { value: 'move', label: 'Movement', icon: <Move size={16} />, count: getActionsByCategory('move').length },
    { value: 'interaction', label: 'Interactions', icon: <Settings size={16} />, count: getActionsByCategory('interaction').length }
  ]

  // Handle search input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  // Handle category change
  const handleCategoryChange = (category: ActionCategory) => {
    setSelectedCategory(category)
  }

  // Handle action selection
  const handleActionSelect = (action: UnifiedAction) => {
    onSelect(action)
    onClose()
  }

  // Handle action edit
  const handleActionEdit = (action: UnifiedAction, e: React.MouseEvent) => {
    e.stopPropagation()
    if (onEdit) {
      onEdit(action)
    }
  }

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <Box
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <Box
        className={className}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90vw',
          maxWidth: '1200px',
          height: '90vh',
          backgroundColor: 'var(--colors-gray900)',
          borderRadius: '12px',
          border: '1px solid var(--colors-gray600)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          zIndex: 51
        }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {/* Header */}
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            borderBottom: '1px solid var(--colors-gray700)',
            backgroundColor: 'var(--colors-gray900)'
          }}
        >
          <Text variant="heading" size="xl" style={{ fontWeight: '700' }}>
            Select Action
          </Text>

          <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* View Mode Toggle */}
            <Box style={{ display: 'flex', border: '1px solid var(--colors-gray600)', borderRadius: '6px', overflow: 'hidden' }}>
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                style={{ borderRadius: 0, borderRight: '1px solid var(--colors-gray600)' }}
              >
                <Grid size={14} />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                style={{ borderRadius: 0 }}
              >
                <List size={14} />
              </Button>
            </Box>

            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={16} />
            </Button>
          </Box>
        </Box>

        {/* Search and Filters */}
        <Box
          style={{
            padding: '16px',
            borderBottom: '1px solid var(--colors-gray700)',
            backgroundColor: 'var(--colors-gray850)'
          }}
        >
          {/* Search Bar */}
          <Box style={{ position: 'relative', marginBottom: '12px' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--colors-gray400)'
              }}
            />
            <input
              type="text"
              placeholder="Search actions by name, type, or description..."
              value={searchTerm}
              onChange={handleSearch}
              style={{
                width: '100%',
                padding: '12px 12px 12px 40px',
                backgroundColor: 'var(--colors-gray800)',
                border: '1px solid var(--colors-gray600)',
                borderRadius: '8px',
                color: 'var(--colors-gray200)',
                fontSize: '14px'
              }}
            />
          </Box>

          {/* Category Filters */}
          <Box style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {categoryOptions.map(({ value, label, icon, count }) => (
              <Button
                key={value}
                variant={selectedCategory === value ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handleCategoryChange(value as ActionCategory)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px'
                }}
              >
                {icon}
                {label}
                <Text
                  variant="body"
                  size="xs"
                  style={{
                    backgroundColor: selectedCategory === value ? 'rgba(255,255,255,0.2)' : 'var(--colors-gray600)',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    marginLeft: '4px'
                  }}
                >
                  {count}
                </Text>
              </Button>
            ))}
          </Box>
        </Box>

        {/* Content */}
        <Box
          style={{
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Results Info */}
          <Box
            style={{
              padding: '12px 16px',
              backgroundColor: 'var(--colors-gray800)',
              borderBottom: '1px solid var(--colors-gray700)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Text variant="body" size="sm" style={{ color: 'var(--colors-gray300)' }}>
              {filteredActions.length} actions found
              {searchTerm && ` for "${searchTerm}"`}
              {selectedCategory !== 'all' && ` in ${categoryOptions.find(c => c.value === selectedCategory)?.label}`}
            </Text>

            {filteredActions.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={14} />
                Filters
              </Button>
            )}
          </Box>

          {/* Actions Grid/List */}
          <Box
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px'
            }}
          >
            {loading ? (
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '200px'
                }}
              >
                <Text variant="body" size="md" style={{ color: 'var(--colors-gray400)' }}>
                  Loading actions...
                </Text>
              </Box>
            ) : error ? (
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
                <Text variant="body" size="md" style={{ color: 'var(--colors-error)', marginBottom: '8px' }}>
                  Error loading actions
                </Text>
                <Text variant="body" size="sm" style={{ color: 'var(--colors-gray400)' }}>
                  {error}
                </Text>
              </Box>
            ) : filteredActions.length === 0 ? (
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
                <Search size={48} color="var(--colors-gray600)" style={{ marginBottom: '16px' }} />
                <Text variant="body" size="md" style={{ color: 'var(--colors-gray400)', marginBottom: '8px' }}>
                  No actions found
                </Text>
                <Text variant="body" size="sm" style={{ color: 'var(--colors-gray500)' }}>
                  Try adjusting your search terms or category filter
                </Text>
              </Box>
            ) : (
              <Box
                style={{
                  display: viewMode === 'grid' ? 'grid' : 'flex',
                  gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : undefined,
                  flexDirection: viewMode === 'list' ? 'column' : undefined,
                  gap: '12px'
                }}
              >
                {filteredActions.map((action: UnifiedAction) => (
                  <Box
                    key={action.id}
                    style={{
                      padding: '16px',
                      backgroundColor: 'var(--colors-gray800)',
                      border: '1px solid var(--colors-gray600)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => handleActionSelect(action)}
                  >
                    <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <Box>
                        <Text variant="body" size="md" style={{ fontWeight: '600', marginBottom: '4px' }}>
                          {action.name}
                        </Text>
                        <Text
                          variant="body"
                          size="xs"
                          style={{
                            padding: '2px 8px',
                            backgroundColor: action.type === 'spell' ? 'var(--colors-purple600)' :
                                           action.type === 'attack' ? 'var(--colors-red600)' :
                                           action.type === 'move' ? 'var(--colors-blue600)' :
                                           'var(--colors-green600)',
                            borderRadius: '12px',
                            textTransform: 'capitalize',
                            display: 'inline-block'
                          }}
                        >
                          {action.type}
                        </Text>
                      </Box>

                      {onEdit && (action.type === 'spell' || action.type === 'attack') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleActionEdit(action, e)}
                          style={{ padding: '4px' }}
                        >
                          <Settings size={14} />
                        </Button>
                      )}
                    </Box>

                    <Text variant="body" size="sm" style={{ color: 'var(--colors-gray300)', lineHeight: '1.4' }}>
                      {action.metadata?.description || 'No description available'}
                    </Text>

                    {action.range && (
                      <Box style={{ marginTop: '8px', display: 'flex', gap: '12px' }}>
                        <Text variant="body" size="xs" style={{ color: 'var(--colors-gray400)' }}>
                          Range: {action.range}
                        </Text>
                        {action.duration && (
                          <Text variant="body" size="xs" style={{ color: 'var(--colors-gray400)' }}>
                            Duration: {action.duration}ms
                          </Text>
                        )}
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Box>

        {/* Footer */}
        <Box
          style={{
            padding: '16px',
            borderTop: '1px solid var(--colors-gray700)',
            backgroundColor: 'var(--colors-gray850)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Text variant="body" size="sm" style={{ color: 'var(--colors-gray400)' }}>
            Click an action to select it for the timeline
          </Text>

          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </Box>
      </Box>
    </>
  )
}

export default ActionSelector