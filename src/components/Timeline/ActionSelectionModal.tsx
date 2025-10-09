import { useState, useMemo, useCallback, useEffect, type ReactNode, type MouseEvent, type ChangeEvent } from 'react'
import { Search, Zap, Sword, Users, X, Move, Edit } from '@/utils/optimizedIcons'
import useAnimationStore from '@/store/animationStore'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Button } from '@/components/primitives/ButtonVE'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import type { UnifiedAction } from '@/types/unifiedAction'
import { AnimationRegistry, type RegisteredAnimationName } from '@/lib/animations'
import { animationToUnifiedAction } from '@/lib/animations/adapters/toUnifiedAction'
import { interactionTemplates } from '@/data/unifiedActions/interactionTemplates'

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
  const pauseAnimations = useAnimationStore(state => state.pauseAnimations)
  const resumeAnimations = useAnimationStore(state => state.resumeAnimations)

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<ActionCategory>('all')

  // Performance optimization: Pause animations when modal is open
  useEffect(() => {
    if (isOpen) {
      pauseAnimations()
    } else {
      resumeAnimations()
    }

    // Cleanup: Resume animations when component unmounts
    return () => {
      resumeAnimations()
    }
  }, [isOpen, pauseAnimations, resumeAnimations])

  // Get all action templates - combining animation library with interactions
  const allActions = useMemo(() => {
    // Get all animation templates from library
    const animationTemplates = AnimationRegistry.getAllTemplates()

    // Convert to UnifiedAction format using adapter
    // Use dummy positions (0, 0) - will be set when action is actually used
    const dummyPosition = { x: 0, y: 0 }
    const animationActions: UnifiedAction[] = animationTemplates.map(template => {
      try {
        return animationToUnifiedAction(
          template.name as RegisteredAnimationName,
          dummyPosition,
          dummyPosition
        )
      } catch (error) {
        console.error(`Failed to convert animation template ${template.name}:`, error)
        return null
      }
    }).filter((action): action is UnifiedAction => action !== null)

    // Add interaction templates (not in animation library yet)
    return [
      ...animationActions,
      ...Object.values(interactionTemplates)
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

  const handleEdit = useCallback((action: UnifiedAction, e: MouseEvent) => {
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

  const categories: { key: ActionCategory; label: string; icon: ReactNode }[] = [
    { key: 'all', label: 'All Actions', icon: <Users size={16} /> },
    { key: 'spell', label: 'Spells', icon: <Zap size={16} /> },
    { key: 'attack', label: 'Attacks', icon: <Sword size={16} /> },
    { key: 'interaction', label: 'Interactions', icon: <Users size={16} /> },
    { key: 'move', label: 'Movement', icon: <Move size={16} /> }
  ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
      padding="none"
      style={{
        backgroundColor: '#1A1A1A',
        border: '1px solid #374151'
      }}
    >
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
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #374151',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#1A1A1A'
          }}
        >
          <Text
            size="lg"
            weight="semibold"
            style={{ color: '#FFFFFF' }}
          >
            Select Action
          </Text>
          <Button
            onClick={handleClose}
            variant="ghost"
            size="sm"
            style={{
              backgroundColor: 'transparent',
              color: '#9CA3AF',
              border: 'none'
            }}
          >
            <X size={16} />
          </Button>
        </Box>

        {/* Search and Filters */}
        <Box
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #374151',
            backgroundColor: '#1A1A1A'
          }}
        >
          {/* Search Input */}
          <Box style={{ marginBottom: '16px', position: 'relative' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9CA3AF',
                pointerEvents: 'none'
              }}
            />
            <Input
              value={searchTerm}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              placeholder="Search actions..."
              style={{
                paddingLeft: '40px',
                backgroundColor: '#374151',
                border: '1px solid #4B5563',
                borderRadius: '6px',
                color: '#FFFFFF',
                width: '100%'
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
                  gap: '4px',
                  backgroundColor: selectedCategory === category.key ? '#C9AD6A' : '#374151',
                  color: selectedCategory === category.key ? '#000000' : '#D1D5DB',
                  border: selectedCategory === category.key ? '1px solid #C9AD6A' : '1px solid #4B5563',
                  borderRadius: '6px'
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
            padding: '20px 24px',
            backgroundColor: '#111827',
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
                    padding: '14px',
                    backgroundColor: '#1F2937',
                    borderRadius: '8px',
                    border: '1px solid #374151',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#374151'
                    e.currentTarget.style.borderColor = '#C9AD6A'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#1F2937'
                    e.currentTarget.style.borderColor = '#374151'
                  }}
                >
                  {/* Action Icon */}
                  <Box
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
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
                    <Text
                      weight="medium"
                      style={{ color: '#FFFFFF' }}
                    >
                      {action.metadata.name}
                    </Text>
                    <Text
                      size="sm"
                      style={{ color: '#9CA3AF' }}
                    >
                      {action.category} • {action.type}
                    </Text>
                    {action.metadata?.description && (
                      <Text
                        size="xs"
                        style={{ color: '#6B7280' }}
                      >
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
                          backgroundColor: '#374151',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}
                      >
                        <Text size="xs" style={{ color: '#D1D5DB' }}>
                          Level {(action.metadata as any).level}
                        </Text>
                      </Box>
                    )}

                    {action.metadata?.damage && (
                      <Box
                        style={{
                          padding: '2px 8px',
                          backgroundColor: '#DC2626',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}
                      >
                        <Text size="xs" style={{ color: '#FFFFFF' }}>
                          {action.metadata.damage}
                        </Text>
                      </Box>
                    )}

                    {(action.metadata as any)?.range && (
                      <Text size="xs" style={{ color: '#6B7280' }}>
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
                      style={{
                        marginLeft: '8px',
                        backgroundColor: 'transparent',
                        color: '#9CA3AF',
                        border: 'none'
                      }}
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
                color: '#6B7280'
              }}
            >
              <Search size={48} style={{ marginBottom: '16px', opacity: 0.5, color: '#6B7280' }} />
              <Text
                size="lg"
                weight="medium"
                style={{ color: '#D1D5DB' }}
              >
                No actions found
              </Text>
              <Text
                size="sm"
                style={{ color: '#9CA3AF' }}
              >
                Try adjusting your search terms or category filters
              </Text>
            </Box>
          )}
        </Box>

        {/* Footer */}
        <Box
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #374151',
            backgroundColor: '#1A1A1A',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Text
            size="sm"
            style={{ color: '#9CA3AF' }}
          >
            {filteredActions.length} action{filteredActions.length !== 1 ? 's' : ''} available
          </Text>
          <Button
            onClick={handleClose}
            variant="outline"
            size="sm"
            style={{
              backgroundColor: '#374151',
              color: '#D1D5DB',
              border: '1px solid #4B5563',
              borderRadius: '6px'
            }}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  )
}

export default ActionSelectionModal