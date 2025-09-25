/**
 * useTokenTemplate Hook - Template management and selection
 *
 * Provides template operations and library state management.
 * Integrates with TemplateService and TokenStore.
 */

import { useCallback, useMemo, useState } from 'react'
import { useTokenStore } from '../store'
import { TemplateService } from '../services'
import type { TokenTemplate, TemplateId, CreateTemplateData, TemplateCategory, TemplateSearchCriteria } from '../types'
import type { Point } from '@/types/geometry'

export interface UseTokenTemplateResult {
  // Template data
  readonly templates: readonly TokenTemplate[]
  readonly customTemplates: readonly TokenTemplate[]
  readonly activeTemplate: TokenTemplate | null
  readonly filteredTemplates: readonly TokenTemplate[]

  // Template operations
  readonly setActiveTemplate: (template: TokenTemplate | null) => void
  readonly createFromTemplate: (position: Point, name?: string) => void
  readonly saveCustomTemplate: (data: CreateTemplateData) => TokenTemplate
  readonly deleteCustomTemplate: (id: TemplateId) => void
  readonly duplicateTemplate: (template: TokenTemplate) => TokenTemplate

  // Library state
  readonly isLibraryOpen: boolean
  readonly toggleLibrary: () => void
  readonly closeLibrary: () => void
  readonly openLibrary: () => void

  // Search and filtering
  readonly searchTerm: string
  readonly setSearchTerm: (term: string) => void
  readonly selectedCategory: TemplateCategory | null
  readonly setSelectedCategory: (category: TemplateCategory | null) => void
  readonly searchCriteria: TemplateSearchCriteria
  readonly setSearchCriteria: (criteria: Partial<TemplateSearchCriteria>) => void

  // Template validation and stats
  readonly validateTemplate: (template: Partial<TokenTemplate>) => any
  readonly getTemplateStats: (template: TokenTemplate) => any
  readonly getMostUsedTemplates: (limit?: number) => readonly TokenTemplate[]
  readonly getRecentTemplates: (limit?: number) => readonly TokenTemplate[]
}

export function useTokenTemplate(): UseTokenTemplateResult {
  const [templateService] = useState(() => TemplateService.getInstance())

  // Store state
  const activeTemplate = useTokenStore(state => state.activeTemplate)
  const customTemplates = useTokenStore(state => state.customTemplates)
  const isLibraryOpen = useTokenStore(state => state.isLibraryOpen)
  const librarySearch = useTokenStore(state => state.librarySearch)
  const libraryCategory = useTokenStore(state => state.libraryCategory)

  // Store actions
  const setActiveTemplateAction = useTokenStore(state => state.setActiveTemplate)
  const saveCustomTemplateAction = useTokenStore(state => state.saveCustomTemplate)
  const deleteCustomTemplateAction = useTokenStore(state => state.deleteCustomTemplate)
  const toggleLibraryAction = useTokenStore(state => state.toggleLibrary)
  const setLibrarySearchAction = useTokenStore(state => state.setLibrarySearch)
  const setLibraryCategoryAction = useTokenStore(state => state.setLibraryCategory)
  const createTokenAction = useTokenStore(state => state.createToken)

  // Local state for search criteria
  const [searchCriteria, setSearchCriteriaState] = useState<TemplateSearchCriteria>({
    query: librarySearch,
    category: libraryCategory as TemplateCategory | undefined
  })

  // Get all templates (built-in + custom)
  const allTemplates = useMemo(() => {
    const builtInTemplates = templateService.getDefaultTemplates()
    return [...builtInTemplates, ...customTemplates]
  }, [templateService, customTemplates])

  // Filter templates based on search criteria
  const filteredTemplates = useMemo(() => {
    return templateService.searchTemplates(allTemplates, searchCriteria)
  }, [templateService, allTemplates, searchCriteria])

  // Template operations
  const setActiveTemplate = useCallback((template: TokenTemplate | null) => {
    setActiveTemplateAction(template)
  }, [setActiveTemplateAction])

  const createFromTemplate = useCallback((position: Point, name?: string) => {
    if (!activeTemplate) return

    const tokenName = name || activeTemplate.name
    createTokenAction({
      name: tokenName,
      position,
      size: activeTemplate.defaults.size,
      shape: activeTemplate.defaults.shape,
      color: activeTemplate.defaults.color,
      category: activeTemplate.defaults.tokenCategory,
      isPlayer: activeTemplate.defaults.isPlayer,
      templateId: activeTemplate.id
    })
  }, [activeTemplate, createTokenAction])

  const saveCustomTemplate = useCallback((data: CreateTemplateData): TokenTemplate => {
    const template = templateService.createTemplate(data)
    saveCustomTemplateAction(template)
    return template
  }, [templateService, saveCustomTemplateAction])

  const deleteCustomTemplate = useCallback((id: TemplateId) => {
    deleteCustomTemplateAction(id)
  }, [deleteCustomTemplateAction])

  const duplicateTemplate = useCallback((template: TokenTemplate): TokenTemplate => {
    const duplicatedData: CreateTemplateData = {
      name: `${template.name} (Copy)`,
      description: template.description,
      category: template.category,
      tags: [...template.tags],
      defaults: { ...template.defaults },
      dndDefaults: template.dndDefaults ? { ...template.dndDefaults } : undefined,
      customization: { ...template.customization },
      preview: template.preview
    }

    return saveCustomTemplate(duplicatedData)
  }, [saveCustomTemplate])

  // Library state management
  const toggleLibrary = useCallback(() => {
    toggleLibraryAction()
  }, [toggleLibraryAction])

  const closeLibrary = useCallback(() => {
    if (isLibraryOpen) {
      toggleLibraryAction()
    }
  }, [isLibraryOpen, toggleLibraryAction])

  const openLibrary = useCallback(() => {
    if (!isLibraryOpen) {
      toggleLibraryAction()
    }
  }, [isLibraryOpen, toggleLibraryAction])

  // Search and filtering
  const setSearchTerm = useCallback((term: string) => {
    setLibrarySearchAction(term)
    setSearchCriteriaState(prev => ({ ...prev, query: term }))
  }, [setLibrarySearchAction])

  const setSelectedCategory = useCallback((category: TemplateCategory | null) => {
    setLibraryCategoryAction(category)
    setSearchCriteriaState(prev => ({ ...prev, category: category || undefined }))
  }, [setLibraryCategoryAction])

  const setSearchCriteria = useCallback((criteria: Partial<TemplateSearchCriteria>) => {
    setSearchCriteriaState(prev => ({ ...prev, ...criteria }))
  }, [])

  // Template validation and statistics
  const validateTemplate = useCallback((template: Partial<TokenTemplate>) => {
    return templateService.validateTemplate(template)
  }, [templateService])

  const getTemplateStats = useCallback((template: TokenTemplate) => {
    return templateService.getTemplateStats(template)
  }, [templateService])

  const getMostUsedTemplates = useCallback((limit = 10) => {
    return templateService.getMostUsedTemplates(allTemplates, limit)
  }, [templateService, allTemplates])

  const getRecentTemplates = useCallback((limit = 5) => {
    return templateService.getRecentTemplates(allTemplates, limit)
  }, [templateService, allTemplates])

  return {
    // Template data
    templates: allTemplates,
    customTemplates,
    activeTemplate,
    filteredTemplates,

    // Template operations
    setActiveTemplate,
    createFromTemplate,
    saveCustomTemplate,
    deleteCustomTemplate,
    duplicateTemplate,

    // Library state
    isLibraryOpen,
    toggleLibrary,
    closeLibrary,
    openLibrary,

    // Search and filtering
    searchTerm: librarySearch,
    setSearchTerm,
    selectedCategory: libraryCategory as TemplateCategory | null,
    setSelectedCategory,
    searchCriteria,
    setSearchCriteria,

    // Template validation and stats
    validateTemplate,
    getTemplateStats,
    getMostUsedTemplates,
    getRecentTemplates
  }
}

// Hook for template creation workflow
export interface UseTemplateCreationResult {
  readonly isCreating: boolean
  readonly templateData: Partial<CreateTemplateData>
  readonly setTemplateData: (data: Partial<CreateTemplateData>) => void
  readonly validateData: () => any
  readonly createTemplate: () => TokenTemplate | null
  readonly resetData: () => void
  readonly startCreation: () => void
  readonly cancelCreation: () => void
}

export function useTemplateCreation(): UseTemplateCreationResult {
  const [isCreating, setIsCreating] = useState(false)
  const [templateData, setTemplateDataState] = useState<Partial<CreateTemplateData>>({})
  const { saveCustomTemplate, validateTemplate } = useTokenTemplate()

  const setTemplateData = useCallback((data: Partial<CreateTemplateData>) => {
    setTemplateDataState(prev => ({ ...prev, ...data }))
  }, [])

  const validateData = useCallback(() => {
    return validateTemplate(templateData as any)
  }, [templateData, validateTemplate])

  const createTemplate = useCallback((): TokenTemplate | null => {
    const validation = validateData()
    if (!validation.isValid) {
      return null
    }

    try {
      const template = saveCustomTemplate(templateData as CreateTemplateData)
      setIsCreating(false)
      setTemplateDataState({})
      return template
    } catch (error) {
      console.error('Failed to create template:', error)
      return null
    }
  }, [templateData, validateData, saveCustomTemplate])

  const resetData = useCallback(() => {
    setTemplateDataState({})
  }, [])

  const startCreation = useCallback(() => {
    setIsCreating(true)
    resetData()
  }, [resetData])

  const cancelCreation = useCallback(() => {
    setIsCreating(false)
    resetData()
  }, [resetData])

  return {
    isCreating,
    templateData,
    setTemplateData,
    validateData,
    createTemplate,
    resetData,
    startCreation,
    cancelCreation
  }
}