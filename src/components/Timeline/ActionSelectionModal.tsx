import React, { useState, useMemo, useCallback } from 'react'
import { Search, Zap, Sword, Users, X, Move, Edit } from 'lucide-react'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Button } from '@/components/primitives/ButtonVE'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import type { UnifiedAction } from '@/types/unifiedAction'
import { spellTemplates } from '@/data/unifiedActions/spellTemplates'
import { attackTemplates } from '@/data/unifiedActions/attackTemplates'
import { interactionTemplates } from '@/data/unifiedActions/interactionTemplates'
import { moveTemplates } from '@/data/unifiedActions/moveTemplates'

type ActionSelectionModalProps = {
  isOpen: boolean
  onClose: () => void
  onSelect: (action: UnifiedAction) => void
  onEdit?: (action: UnifiedAction) => void
}

type ActionCategory = 'all' | 'spell' | 'attack' | 'interaction' | 'move'

export const ActionSelectionModal = ({
  isOpen,
  onClose,
  onSelect,
  onEdit
}: ActionSelectionModalProps) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<ActionCategory>('all')

  // Combine all action templates
  const allActions = useMemo(() => {
    return [
      ...Object.values(spellTemplates),
      ...Object.values(attackTemplates),
      ...Object.values(interactionTemplates),
      ...Object.values(moveTemplates)
    ]
  }, [])

  // Filter actions based on search and category
  const filteredActions = useMemo(() => {
    let filtered = allActions

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(action => action.type === selectedCategory)
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(action =>
        action.metadata.name.toLowerCase().includes(search) ||
        action.category.toLowerCase().includes(search) ||
        action.metadata?.description?.toLowerCase().includes(search)
      )
    }

    return filtered
  }, [allActions, selectedCategory, searchTerm])

  const handleClose = useCallback(() => {
    setSearchTerm('')
    setSelectedCategory('all')
    onClose()
  }, [onClose])

  const handleSelect = useCallback((action: UnifiedAction) => {
    onSelect(action)
    handleClose()
  }, [onSelect, handleClose])

  const handleEdit = useCallback((action: UnifiedAction, e: React.MouseEvent) => {
    e.stopPropagation()
    if (onEdit) {
      onEdit(action)
    }
  }, [onEdit])

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'spell': return <Zap size={20} />
      case 'attack': return <Sword size={20} />
      case 'interaction': return <Users size={20} />
      case 'move': return <Move size={20} />
      default: return <Zap size={20} />
    }
  }

  const getCategoryColor = (type: string) => {
    switch (type) {
      case 'spell': return '#9333ea' // Purple
      case 'attack': return '#dc2626' // Red
      case 'interaction': return '#059669' // Green
      case 'move': return '#2563eb' // Blue
      default: return '#6b7280' // Gray
    }
  }

  const categories: { key: ActionCategory; label: string; icon: React.ReactNode }[] = [
    { key: 'all', label: 'All Actions', icon: <Users size={16} /> },
    { key: 'spell', label: 'Spells', icon: <Zap size={16} /> },
    { key: 'attack', label: 'Attacks', icon: <Sword size={16} /> },
    { key: 'interaction', label: 'Interactions', icon: <Users size={16} /> },
    { key: 'move', label: 'Movement', icon: <Move size={16} /> }
  ]

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <Box
        style={{
          width: '700px',
          maxHeight: '80vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <Box
          padding={4}
          style={{
            borderBottom: '1px solid var(--gray700)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Text size="lg" weight="semibold">
            Select Action
          </Text>
          <Button onClick={handleClose} variant="ghost" size="sm">
            <X size={16} />
          </Button>
        </Box>

        {/* Search and Filters */}
        <Box padding={4} style={{ borderBottom: '1px solid var(--gray700)' }}>
          {/* Search Input */}
          <Box marginBottom={3} style={{ position: 'relative' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--gray400)',
                pointerEvents: 'none'
              }}
            />
            <Input
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              placeholder="Search actions..."
              style={{
                paddingLeft: '40px',
                backgroundColor: 'var(--gray800)',
                border: '1px solid var(--gray600)'
              }}
            />
          </Box>

          {/* Category Filters */}
          <Box style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {categories.map((category) => (
              <Button
                key={category.key}
                onClick={() => setSelectedCategory(category.key)}
                variant={selectedCategory === category.key ? 'primary' : 'outline'}
                size="sm"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {category.icon}
                {category.label}
              </Button>
            ))}
          </Box>
        </Box>

        {/* Actions List */}
        <Box
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '16px',
            backgroundColor: 'var(--gray900)',
            minHeight: '400px'
          }}
        >
          {filteredActions.length > 0 ? (
            <Box style={{ display: 'grid', gap: '8px' }}>
              {filteredActions.map((action) => (
                <Box
                  key={action.id}
                  onClick={() => handleSelect(action)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px',
                    backgroundColor: 'var(--gray800)',
                    borderRadius: 'var(--radii-md)',
                    border: '1px solid var(--gray700)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--gray700)'
                    e.currentTarget.style.borderColor = 'var(--secondary)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--gray800)'
                    e.currentTarget.style.borderColor = 'var(--gray700)'
                  }}
                >
                  {/* Action Icon */}
                  <Box
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: 'var(--radii-xl)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      backgroundColor: getCategoryColor(action.type),
                      color: 'white',
                      marginRight: '12px',
                      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
                    }}
                  >
                    {getCategoryIcon(action.type)}
                  </Box>

                  {/* Action Details */}
                  <Box style={{ flex: 1 }}>
                    <Text weight="medium">
                      {action.metadata.name}
                    </Text>
                    <Text size="sm" color="textSecondary">
                      {action.category} • {action.type}
                    </Text>
                    {action.metadata?.description && (
                      <Text size="xs" color="textTertiary">
                        {action.metadata.description}
                      </Text>
                    )}
                  </Box>

                  {/* Action Metadata */}
                  <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    {(action.metadata as any)?.level && (
                      <Box
                        style={{
                          padding: '2px 8px',
                          backgroundColor: 'var(--gray700)',
                          borderRadius: 'var(--radii-sm)',
                          fontSize: '12px'
                        }}
                      >
                        <Text size="xs">Level {(action.metadata as any).level}</Text>
                      </Box>
                    )}

                    {action.metadata?.damage && (
                      <Box
                        style={{
                          padding: '2px 8px',
                          backgroundColor: 'var(--error)',
                          borderRadius: 'var(--radii-sm)',
                          fontSize: '12px'
                        }}
                      >
                        <Text size="xs" color="textInverse">{action.metadata.damage}</Text>
                      </Box>
                    )}

                    {(action.metadata as any)?.range && (
                      <Text size="xs" color="textTertiary">
                        Range: {(action.metadata as any).range}
                      </Text>
                    )}
                  </Box>

                  {/* Edit Button */}
                  {onEdit && (action.type === 'spell' || action.type === 'attack') && (
                    <Button
                      onClick={(e) => handleEdit(action, e)}
                      variant="ghost"
                      size="sm"
                      style={{ marginLeft: '8px' }}
                    >
                      <Edit size={14} />
                    </Button>
                  )}
                </Box>
              ))}
            </Box>
          ) : (
            <Box
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '200px',
                color: 'var(--gray500)'
              }}
            >
              <Search size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <Text size="lg" weight="medium">
                No actions found
              </Text>
              <Text size="sm" color="textSecondary">
                Try adjusting your search terms or category filters
              </Text>
            </Box>
          )}
        </Box>

        {/* Footer */}
        <Box
          padding={3}
          style={{
            borderTop: '1px solid var(--gray700)',
            backgroundColor: 'var(--gray800)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Text size="sm" color="textSecondary">
            {filteredActions.length} action{filteredActions.length !== 1 ? 's' : ''} available
          </Text>
          <Button onClick={handleClose} variant="outline" size="sm">
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  )
}

export default ActionSelectionModal