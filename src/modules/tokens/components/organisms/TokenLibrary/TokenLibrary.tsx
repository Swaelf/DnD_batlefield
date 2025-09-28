/**
 * TokenLibrary Organism Component
 * Complete token template browser and custom token creation interface
 */

import React from 'react'
import { X, Search } from 'lucide-react'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Button } from '@/components/primitives/ButtonVE'
import { TokenTemplate } from '../../molecules'
import type { TokenTemplate as TemplateType, TemplateCategory } from '../../../types'
import { TemplateService } from '../../../services'

export interface TokenLibraryProps {
  readonly isOpen?: boolean
  readonly onClose?: () => void
  readonly onSelectTemplate?: (template: TemplateType) => void
  readonly activeTemplate?: TemplateType | null
}


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
    <Box
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: isOpen ? 'flex' : 'none',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
      onClick={handleClose}
    >
      <Box
        style={{
          backgroundColor: 'var(--colors-gray900)',
          borderRadius: '8px',
          width: '90vw',
          maxWidth: '800px',
          height: '80vh',
          maxHeight: '600px',
          display: 'flex',
          flexDirection: 'column',
          border: '2px solid var(--colors-dndGold)'
        }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
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
          <Text
            variant="heading"
            size="lg"
            style={{
              color: 'var(--colors-dndGold)',
              fontWeight: '600',
              margin: 0
            }}
          >
            Token Library
          </Text>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              color: 'var(--colors-gray400)',
              padding: '8px'
            }}
          >
            <X size={20} />
          </Button>
        </Box>

        {/* Controls */}
        <Box
          style={{
            padding: '12px',
            borderBottom: '1px solid var(--colors-gray700)',
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}
        >
          {/* Search Input */}
          <Box
            style={{
              position: 'relative',
              flex: 1,
              minWidth: '200px'
            }}
          >
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
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                minWidth: '200px',
                padding: '8px',
                paddingLeft: '32px',
                backgroundColor: 'var(--colors-gray800)',
                border: '1px solid var(--colors-gray600)',
                borderRadius: '6px',
                color: 'var(--colors-gray100)',
                fontSize: '14px',
                width: '100%'
              }}
            />
          </Box>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCategory(e.target.value as TemplateCategory | 'all')}
            style={{
              padding: '8px',
              backgroundColor: 'var(--colors-gray800)',
              border: '1px solid var(--colors-gray600)',
              borderRadius: '6px',
              color: 'var(--colors-gray100)',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </Box>

        {/* Content */}
        <Box
          style={{
            flex: 1,
            padding: '16px',
            overflowY: 'auto'
          }}
        >
          {/* Template Grid */}
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '12px'
            }}
          >
            {filteredTemplates.map(template => (
              <TokenTemplate
                key={template.id}
                template={template}
                onClick={handleTemplateClick}
                isActive={activeTemplate?.id === template.id}
                showDescription={true}
              />
            ))}
          </Box>

          {/* Empty State */}
          {filteredTemplates.length === 0 && (
            <Box
              style={{
                textAlign: 'center',
                color: '#9CA3AF',
                padding: '2rem',
                fontSize: '14px'
              }}
            >
              <Text
                variant="body"
                size="sm"
                style={{ color: 'var(--colors-gray400)' }}
              >
                No templates found matching your criteria
              </Text>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  )
})