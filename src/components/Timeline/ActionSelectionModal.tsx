import React, { useState, memo } from 'react'
import { Search, Zap, Sword, Users, X, Move, Edit } from 'lucide-react'
import { Modal, ModalBody, Box, Text, Button } from '@/components/ui'
import { styled } from '@/styles/theme.config'
import { UnifiedAction } from '@/types/unifiedAction'
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

const SearchInput = styled('input', {
  width: '100%',
  padding: '12px 16px 12px 40px',
  backgroundColor: '$gray800',
  border: '1px solid $gray600',
  borderRadius: '$lg',
  color: '$white',
  fontSize: '$sm',
  outline: 'none',
  transition: 'all 0.2s',

  '&::placeholder': {
    color: '$gray400'
  },

  '&:focus': {
    borderColor: '$secondary',
    backgroundColor: '$gray700',
    boxShadow: '0 0 0 3px rgba(201, 173, 106, 0.1)'
  }
})

const StyledModalHeader = styled(Box, {
  padding: '$6',
  borderBottom: '1px solid $gray700',
  backgroundColor: '$gray900',
  borderRadius: '$lg $lg 0 0'
})

const StyledModalBody = styled(Box, {
  padding: '$6',
  backgroundColor: '$gray900'
})

const ActionCard = styled(Box, {
  display: 'flex',
  alignItems: 'center',
  gap: '$3',
  padding: '$4',
  backgroundColor: '$gray800',
  border: '1px solid $gray700',
  borderRadius: '$lg',
  transition: 'all 0.2s',
  cursor: 'pointer',

  '&:hover': {
    backgroundColor: '$gray700',
    borderColor: '$secondary',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)'
  }
})

const CategoryCount = styled(Box, {
  fontSize: '$xs',
  opacity: 0.8,
  marginLeft: '$2',
  padding: '2px 6px',
  borderRadius: '$sm'
})

const AnimationType = styled(Text, {
  fontSize: '$xs'
})

const CategoryTab = styled(Button, {
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
  padding: '$2 $4',
  borderRadius: '$lg',
  transition: '$fast',

  variants: {
    active: {
      true: {
        backgroundColor: '$secondary',
        color: '$dndBlack',
        border: 'none',
        '&:hover': {
          backgroundColor: '$yellow500'
        }
      },
      false: {
        backgroundColor: '$gray700',
        color: '$gray300',
        border: '1px solid $gray600',
        '&:hover': {
          backgroundColor: '$gray600'
        }
      }
    }
  }
})

const ActionSelectionModalComponent: React.FC<ActionSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  onEdit
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ActionCategory>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Combine all templates
  const allActions: UnifiedAction[] = [
    ...spellTemplates,
    ...attackTemplates,
    ...interactionTemplates,
    ...moveTemplates
  ]

  // Filter actions by category and search
  const filteredActions = allActions.filter(action => {
    const matchesCategory = selectedCategory === 'all' || action.type === selectedCategory
    const matchesSearch = searchQuery === '' ||
      action.metadata.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      action.category.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesCategory && matchesSearch
  })

  const handleActionSelect = (action: UnifiedAction) => {
    onSelect(action)
    onClose()
  }

  const handleActionEdit = (action: UnifiedAction, event: React.MouseEvent) => {
    event.stopPropagation()
    if (onEdit) {
      onEdit(action)
    }
  }

  const canEdit = (action: UnifiedAction) => {
    return action.type === 'spell' || action.type === 'attack'
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'spell': return <Zap size={16} />
      case 'attack': return <Sword size={16} />
      case 'interaction': return <Users size={16} />
      case 'move': return <Move size={16} />
      default: return null
    }
  }

  const getCategoryColor = (type: string) => {
    switch (type) {
      case 'spell': return '$blue500'
      case 'attack': return '$red500'
      case 'interaction': return '$green500'
      case 'move': return '$purple500'
      default: return '$gray500'
    }
  }

  const getCategoryCount = (category: ActionCategory) => {
    if (category === 'all') return allActions.length
    return allActions.filter(action => action.type === category).length
  }

  if (!isOpen) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="xl"
      closeOnOverlayClick={true}
      closeOnEscape={true}
    >
      <ModalBody css={{ padding: 0, height: '80vh', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <StyledModalHeader
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          css={{ flexShrink: 0 }}
        >
          <Box>
            <Text css={{ fontSize: '$xl', fontWeight: '$semibold', color: '$white' }}>
              Select Action
            </Text>
            <Text css={{ fontSize: '$sm', color: '$gray400', marginTop: '$1' }}>
              Choose a spell, attack, or interaction
            </Text>
          </Box>
          <Button
            onClick={onClose}
            css={{
              color: '$gray400',
              backgroundColor: '$gray700',
              border: '1px solid $gray600',
              borderRadius: '$lg',
              '&:hover': {
                color: '$white',
                backgroundColor: '$gray600'
              }
            }}
          >
            <X size={18} />
          </Button>
        </StyledModalHeader>

        {/* Search and Categories */}
        <StyledModalBody css={{ flexShrink: 0 }}>
          {/* Search */}
          <Box css={{ position: 'relative', marginBottom: '$6' }}>
            <Box css={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 1,
              color: '$gray400',
              pointerEvents: 'none'
            }}>
              <Search size={18} />
            </Box>
            <SearchInput
              type="text"
              placeholder="Search actions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Box>

          {/* Category Tabs */}
          <Box display="flex" gap="3" css={{ marginBottom: '$6', flexWrap: 'wrap' }}>
            {[
              { id: 'all' as ActionCategory, label: 'All', icon: null },
              { id: 'spell' as ActionCategory, label: 'Spells', icon: <Zap size={14} /> },
              { id: 'attack' as ActionCategory, label: 'Attacks', icon: <Sword size={14} /> },
              { id: 'interaction' as ActionCategory, label: 'Interactions', icon: <Users size={14} /> },
              { id: 'move' as ActionCategory, label: 'Movement', icon: <Move size={14} /> }
            ].map(category => (
              <CategoryTab
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                active={selectedCategory === category.id}
              >
                {category.icon}
                {category.label}
                <CategoryCount css={{
                  backgroundColor: selectedCategory === category.id ? '$dndBlack/20' : '$gray600'
                }}>
                  {getCategoryCount(category.id)}
                </CategoryCount>
              </CategoryTab>
            ))}
          </Box>
        </StyledModalBody>

        {/* Actions List */}
        <Box
          css={{
            flex: 1,
            overflowY: 'auto',
            padding: '0 $6 $6',
            backgroundColor: '$gray900',
            minHeight: 0  // Important: allows flex child to shrink
          }}
        >
          {filteredActions.length === 0 ? (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              css={{
                padding: '$8',
                color: '$gray500',
                textAlign: 'center'
              }}
            >
              <Search size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
              <Text css={{ fontSize: '$lg', marginBottom: '$2' }}>
                No actions found
              </Text>
              <Text css={{ fontSize: '$sm' }}>
                Try adjusting your search or category filter
              </Text>
            </Box>
          ) : (
            <Box display="flex" flexDirection="column" gap="3">
              {filteredActions.map(action => (
                <ActionCard
                  key={action.id}
                >
                  {/* Action Content */}
                  <Box
                    onClick={() => handleActionSelect(action)}
                    css={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '$4',
                      flex: 1,
                      cursor: 'pointer'
                    }}
                  >
                    {/* Icon */}
                    <Box
                      css={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '$xl',
                        backgroundColor: getCategoryColor(action.type),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
                      }}
                    >
                      {getCategoryIcon(action.type)}
                    </Box>

                    {/* Content */}
                    <Box display="flex" flexDirection="column" alignItems="flex-start" css={{ flex: 1 }}>
                      <Text css={{ fontSize: '$md', fontWeight: '$semibold', color: '$white' }}>
                        {action.metadata.name}
                      </Text>
                      <Text css={{ fontSize: '$sm', color: '$gray400', marginBottom: '$1' }}>
                        {action.category} • {action.type}
                      </Text>
                      {action.metadata.description && (
                        <Text css={{ fontSize: '$xs', color: '$gray500', lineHeight: '1.4' }}>
                          {action.metadata.description}
                        </Text>
                      )}
                    </Box>

                    {/* Animation info */}
                    <Box display="flex" flexDirection="column" alignItems="flex-end" css={{ fontSize: '$xs', color: '$gray500' }}>
                      <AnimationType>
                        {action.animation.type}
                      </AnimationType>
                      <AnimationType>
                        {action.animation.duration}ms
                      </AnimationType>
                    </Box>
                  </Box>

                  {/* Edit button for spells and attacks */}
                  {canEdit(action) && (
                    <Button
                      onClick={(e) => handleActionEdit(action, e)}
                      css={{
                        padding: '$3',
                        color: '$gray400',
                        backgroundColor: '$gray700',
                        border: '1px solid $gray600',
                        borderRadius: '$lg',
                        flexShrink: 0,
                        transition: '$fast',
                        '&:hover': {
                          color: '$white',
                          backgroundColor: '$secondary',
                          borderColor: '$secondary'
                        }
                      }}
                      title="Customize this action"
                    >
                      <Edit size={16} />
                    </Button>
                  )}
                </ActionCard>
              ))}
            </Box>
          )}
        </Box>
      </ModalBody>
    </Modal>
  )
}

export const ActionSelectionModal = memo(ActionSelectionModalComponent)
ActionSelectionModal.displayName = 'ActionSelectionModal'