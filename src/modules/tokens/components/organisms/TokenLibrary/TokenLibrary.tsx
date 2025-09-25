/**
 * TokenLibrary Organism Component
 *
 * Complete token template browser and custom token creation interface.
 * Replaces the legacy TokenLibrary.tsx with modular architecture.
 * Organism design: 100-150 lines, full library functionality.
 */

import React from 'react'
import { styled } from '@/styles/theme.config'
import { X, Search, Plus, Filter } from 'lucide-react'
import { TokenTemplate } from '../../molecules'
import type { TokenTemplate as TemplateType, TemplateCategory } from '../../../types'
import { TemplateService } from '../../../services'

export interface TokenLibraryProps {
  readonly isOpen?: boolean
  readonly onClose?: () => void
  readonly onSelectTemplate?: (template: TemplateType) => void
  readonly activeTemplate?: TemplateType | null
}

const LibraryContainer = styled('div', {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,

  variants: {
    open: {
      true: {
        display: 'flex'
      },
      false: {
        display: 'none'
      }
    }
  }
})

const LibraryModal = styled('div', {
  backgroundColor: '$gray900',
  borderRadius: '$lg',
  width: '90vw',
  maxWidth: '800px',
  height: '80vh',
  maxHeight: '600px',
  display: 'flex',
  flexDirection: 'column',
  border: '2px solid $dndGold'
})

const LibraryHeader = styled('div', {
  padding: '$4',
  borderBottom: '1px solid $gray700',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between'
})

const LibraryTitle = styled('h2', {
  color: '$dndGold',
  fontSize: '$lg',
  fontWeight: '600',
  margin: 0
})

const CloseButton = styled('button', {
  backgroundColor: 'transparent',
  border: 'none',
  color: '$gray400',
  cursor: 'pointer',
  padding: '$2',

  '&:hover': {
    color: '$gray100'
  }
})

const LibraryControls = styled('div', {
  padding: '$3',
  borderBottom: '1px solid $gray700',
  display: 'flex',
  gap: '$3',
  alignItems: 'center',
  flexWrap: 'wrap'
})

const SearchInput = styled('input', {
  flex: 1,
  minWidth: '200px',
  padding: '$2',
  backgroundColor: '$gray800',
  border: '1px solid $gray600',
  borderRadius: '$md',
  color: '$gray100',
  fontSize: '$sm',

  '&::placeholder': {
    color: '$gray400'
  },

  '&:focus': {
    outline: 'none',
    borderColor: '$dndGold'
  }
})

const CategoryFilter = styled('select', {
  padding: '$2',
  backgroundColor: '$gray800',
  border: '1px solid $gray600',
  borderRadius: '$md',
  color: '$gray100',
  fontSize: '$sm',
  cursor: 'pointer',

  '&:focus': {
    outline: 'none',
    borderColor: '$dndGold'
  }
})

const LibraryContent = styled('div', {
  flex: 1,
  padding: '$4',
  overflowY: 'auto'
})

const TemplateGrid = styled('div', {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
  gap: '$3'
})

const categories: TemplateCategory[] = ['players', 'enemies', 'npcs', 'objects', 'environment']

export const TokenLibrary: React.FC<TokenLibraryProps> = React.memo(({
  isOpen = false,
  onClose,
  onSelectTemplate,
  activeTemplate
}) => {
  const [searchTerm, setSearchTerm] = React.useState('')
  const [selectedCategory, setSelectedCategory] = React.useState<TemplateCategory | 'all'>('all')
  const [templates, setTemplates] = React.useState<TemplateType[]>([])

  // Load templates on mount
  React.useEffect(() => {
    const templateService = TemplateService.getInstance()
    const allTemplates = templateService.getDefaultTemplates()
    setTemplates(allTemplates)
  }, [])

  // Filter templates based on search and category
  const filteredTemplates = React.useMemo(() => {
    let filtered = templates

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory)
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(term) ||
        template.description?.toLowerCase().includes(term) ||
        template.tags.some(tag => tag.toLowerCase().includes(term))
      )
    }

    return filtered
  }, [templates, selectedCategory, searchTerm])

  const handleTemplateClick = React.useCallback((template: TemplateType) => {
    onSelectTemplate?.(template)
    // Keep library open for multiple selections
  }, [onSelectTemplate])

  const handleClose = React.useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose?.()
    }
  }, [onClose])

  if (!isOpen) return null

  return (
    <LibraryContainer open={isOpen} onClick={handleClose}>
      <LibraryModal>
        <LibraryHeader>
          <LibraryTitle>Token Library</LibraryTitle>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </LibraryHeader>

        <LibraryControls>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9CA3AF'
              }}
            />
            <SearchInput
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '32px' }}
            />
          </div>

          <CategoryFilter
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as TemplateCategory | 'all')}
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </CategoryFilter>
        </LibraryControls>

        <LibraryContent>
          <TemplateGrid>
            {filteredTemplates.map(template => (
              <TokenTemplate
                key={template.id}
                template={template}
                onClick={handleTemplateClick}
                isActive={activeTemplate?.id === template.id}
                showDescription={true}
              />
            ))}
          </TemplateGrid>

          {filteredTemplates.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                color: '#9CA3AF',
                padding: '2rem',
                fontSize: '14px'
              }}
            >
              No templates found matching your criteria
            </div>
          )}
        </LibraryContent>
      </LibraryModal>
    </LibraryContainer>
  )
})