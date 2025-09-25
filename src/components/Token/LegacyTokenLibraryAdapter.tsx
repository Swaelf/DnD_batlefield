/**
 * Legacy TokenLibrary Adapter - Phase 8 Migration Component
 *
 * Provides seamless integration between legacy TokenLibrary API and new atomic architecture.
 * Maintains 100% compatibility while leveraging atomic TokenLibrary with enhanced features.
 */

import React from 'react'
import { TokenLibrary as AtomicTokenLibrary } from '@/modules/tokens'
import { useTokenTemplate } from '@/modules/tokens/hooks'
import { useToolStore } from '@/store/toolStore'
import type { TokenTemplate } from '@/types/token'

// Legacy TokenLibrary props for backward compatibility
export interface LegacyTokenLibraryProps {
  readonly isOpen?: boolean
  readonly onClose?: () => void
  readonly onSelectToken?: (template: TokenTemplate) => void
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
    setActiveTemplate,
    templates,
    filteredTemplates,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory
  } = useTokenTemplate()

  // Integration with legacy toolStore workflow
  const setSelectedTemplate = useToolStore(state => state.setSelectedTemplate)
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

    // Maintain legacy toolStore integration
    setSelectedTemplate(template)
    setTool('token')

    // Legacy callback
    onSelectToken?.(template)

    // Close library after selection (legacy behavior)
    handleClose()
  }, [setActiveTemplate, setSelectedTemplate, setTool, onSelectToken, handleClose])

  // Use atomic TokenLibrary with enhanced features
  return (
    <AtomicTokenLibrary
      isOpen={isLibraryOpen}
      onClose={handleClose}
      onSelectTemplate={handleSelectTemplate}
      activeTemplate={activeTemplate}
      // Enhanced features from atomic architecture (non-breaking additions)
      templates={templates}
      filteredTemplates={filteredTemplates}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      selectedCategory={selectedCategory}
      onCategoryChange={setSelectedCategory}
      // Legacy features maintained
      showBuiltInTemplates={true}
      showCustomTemplates={true}
      allowCustomCreation={true}
      enableSearch={true}
      enableCategoryFilter={true}
    />
  )
})

TokenLibrary.displayName = 'LegacyTokenLibraryAdapter'