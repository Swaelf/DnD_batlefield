/**
 * Legacy TokenLibrary Adapter - Phase 8 Migration Component
 *
 * Provides seamless integration between legacy TokenLibrary API and new atomic architecture.
 * Maintains 100% compatibility while leveraging atomic TokenLibrary with enhanced features.
 */

import React from 'react'
import { TokenLibrary as AtomicTokenLibrary } from '@/modules/tokens'
import { useTokenTemplate } from '@/modules/tokens/hooks'
import useToolStore from '@/store/toolStore'
import type { TokenTemplate } from '@/modules/tokens/types/template'
import type { TokenTemplate as LegacyTokenTemplate } from '@/types/token'

// Legacy TokenLibrary props for backward compatibility
export interface LegacyTokenLibraryProps {
  readonly isOpen?: boolean
  readonly onClose?: () => void
  readonly onSelectToken?: (template: LegacyTokenTemplate) => void
}

/**
 * Legacy TokenLibrary Adapter Component
 *
 * Wraps atomic TokenLibrary with legacy-compatible interface.
 * Integrates with existing toolStore workflow while providing enhanced features.
 */
export const TokenLibrary: React.FC<LegacyTokenLibraryProps> = React.memo(({
  isOpen = false,
  onClose,
  onSelectToken
}) => {
  // Integration with new atomic template system
  const {
    isLibraryOpen,
    toggleLibrary,
    closeLibrary,
    activeTemplate,
    setActiveTemplate
    // templates, filteredTemplates, searchTerm, setSearchTerm, selectedCategory, setSelectedCategory - unused
  } = useTokenTemplate()

  // Integration with legacy toolStore workflow
  const setTokenTemplate = useToolStore(state => state.setTokenTemplate)
  const setTool = useToolStore(state => state.setTool)

  // Sync legacy isOpen prop with atomic state
  React.useEffect(() => {
    if (isOpen !== isLibraryOpen) {
      toggleLibrary()
    }
  }, [isOpen, isLibraryOpen, toggleLibrary])

  // Handle legacy onClose callback
  const handleClose = React.useCallback(() => {
    if (isLibraryOpen) {
      closeLibrary()
    }
    onClose?.()
  }, [isLibraryOpen, closeLibrary, onClose])

  // Handle template selection with legacy workflow integration
  const handleSelectTemplate = React.useCallback((template: TokenTemplate) => {
    // Set template in atomic system
    setActiveTemplate(template)

    // Maintain legacy toolStore integration - convert to simpler TokenTemplate type
    const simpleTemplate = {
      name: template.name,
      size: template.defaults.size,
      color: template.defaults.color,
      shape: template.defaults.shape as 'circle' | 'square',
      category: template.category as 'player' | 'enemy' | 'npc' | 'object' | undefined
    }
    setTokenTemplate(simpleTemplate)
    setTool('token')

    // Legacy callback - convert to legacy type
    if (onSelectToken) {
      const legacyTemplate: LegacyTokenTemplate = {
        name: template.name,
        size: template.defaults.size,
        color: template.defaults.color,
        shape: template.defaults.shape as 'circle' | 'square',
        category: template.category as 'player' | 'enemy' | 'npc' | 'object' | undefined
        // Note: image property doesn't exist in simple TokenTemplate
      }
      onSelectToken(legacyTemplate)
    }

    // Close library after selection (legacy behavior)
    handleClose()
  }, [setActiveTemplate, setTokenTemplate, setTool, onSelectToken, handleClose])

  // Use atomic TokenLibrary with only the supported props
  return (
    <AtomicTokenLibrary
      isOpen={isLibraryOpen}
      onClose={handleClose}
      onSelectTemplate={handleSelectTemplate}
      activeTemplate={activeTemplate}
    />
  )
})

TokenLibrary.displayName = 'LegacyTokenLibraryAdapter'