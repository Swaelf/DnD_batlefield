import React, { useState, memo } from 'react'
import { ChevronDown, ChevronRight, Sparkles } from 'lucide-react'
import useToolStore from '@/store/toolStore'
import {
  Panel,
  PanelHeader,
  PanelTitle,
  PanelBody,
  PanelSection,
  Box,
  Text,
  Button,
  Input
} from '@/components/ui'
import { spellEffectTemplates, spellCategories } from './constants.tsx'
import type { SpellEffectTemplate } from './types'

export const SpellEffectsPanel = memo(() => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['area', 'line', 'wall'])
  )
  const [selectedTemplate, setSelectedTemplate] = useState<SpellEffectTemplate | null>(null)
  const [effectColor, setEffectColor] = useState('#FF6347')
  const [effectOpacity, setEffectOpacity] = useState(0.4)
  // Use specific selectors to prevent unnecessary re-renders
  const setTool = useToolStore(state => state.setTool)

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const handleSelectTemplate = (template: SpellEffectTemplate) => {
    setSelectedTemplate(template)
    setEffectColor(template.color)
    setEffectOpacity(template.opacity)
    setTool('spellEffect')
    // Store the template in the tool store
    const { setSpellEffectTemplate } = useToolStore.getState()
    setSpellEffectTemplate(template)
  }

  return (
    <Panel size="sidebar" css={{ borderLeft: '1px solid $gray800' }}>
      <PanelHeader>
        <Box display="flex" alignItems="center" gap="2">
          <Sparkles size={20} />
          <PanelTitle>Spell Effects</PanelTitle>
        </Box>
        <Text size="xs" color="gray500" css={{ marginTop: '$1' }}>
          D&D 5e spell areas and effects
        </Text>
      </PanelHeader>

      <PanelBody>
        {spellCategories.map(category => {
          const categoryEffects = spellEffectTemplates.filter(
            effect => effect.category === category.id
          )
          const isExpanded = expandedCategories.has(category.id)

          if (categoryEffects.length === 0) return null

          return (
            <PanelSection key={category.id} css={{ marginBottom: '$4' }}>
              <Button
                onClick={() => toggleCategory(category.id)}
                variant="ghost"
                fullWidth
                css={{
                  justifyContent: 'space-between',
                  padding: '$2',
                  '&:hover': {
                    backgroundColor: '$gray800',
                  },
                }}
              >
                <Box display="flex" alignItems="center" gap="2">
                  {category.icon}
                  <Text size="sm" weight="semibold" color="gray300">
                    {category.name}
                  </Text>
                  <Text size="xs" color="gray500">
                    ({categoryEffects.length})
                  </Text>
                </Box>
                {isExpanded ? (
                  <ChevronDown size={16} color="#6B7280" />
                ) : (
                  <ChevronRight size={16} color="#6B7280" />
                )}
              </Button>

              {isExpanded && (
                <Box display="flex" flexDirection="column" gap="2" css={{ marginTop: '$2' }}>
                  {categoryEffects.map(template => (
                    <Button
                      key={template.id}
                      onClick={() => handleSelectTemplate(template)}
                      variant="ghost"
                      fullWidth
                      css={{
                        padding: '$3',
                        textAlign: 'left',
                        border: '2px solid',
                        borderColor: selectedTemplate?.id === template.id
                          ? '$secondary'
                          : '$gray700',
                        backgroundColor: selectedTemplate?.id === template.id
                          ? '$gray800'
                          : 'transparent',
                        '&:hover': {
                          borderColor: selectedTemplate?.id === template.id
                            ? '$secondary'
                            : '$gray600',
                          backgroundColor: '$gray800',
                        },
                      }}
                    >
                      <Box display="flex" alignItems="start" gap="3">
                        <Box css={{ color: '$gray400', marginTop: '2px' }}>
                          {template.icon}
                        </Box>
                        <Box css={{ flex: 1 }}>
                          <Text weight="semibold" color="gray200">
                            {template.name}
                          </Text>
                          <Text size="xs" color="gray500">
                            {template.description}
                          </Text>
                          {template.dndSpell && (
                            <Text size="xs" color="secondary" css={{ marginTop: '$1' }}>
                              {template.dndSpell}
                            </Text>
                          )}
                        </Box>
                      </Box>
                    </Button>
                  ))}
                </Box>
              )}
            </PanelSection>
          )
        })}
      </PanelBody>

      {/* Selected Effect Controls */}
      {selectedTemplate && (
        <PanelSection divider css={{ backgroundColor: '$gray800/50' }}>
          <Box display="flex" flexDirection="column" gap="3">
            <Box>
              <Text weight="semibold" color="secondary" css={{ marginBottom: '$2' }}>
                {selectedTemplate.name}
              </Text>
              <Text size="xs" color="gray400">
                {selectedTemplate.dndSpell || selectedTemplate.description}
              </Text>
            </Box>

            <Box>
              <Text size="xs" color="gray400" css={{ marginBottom: '$1' }}>
                Color
              </Text>
              <Box display="flex" alignItems="center" gap="2">
                <input
                  type="color"
                  value={effectColor}
                  onChange={(e) => setEffectColor(e.target.value)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    backgroundColor: 'transparent',
                    border: '1px solid #3a3a3a'
                  }}
                />
                <Input
                  value={effectColor}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEffectColor(e.target.value)}
                  size="sm"
                  fullWidth
                />
              </Box>
            </Box>

            <Box>
              <Text size="xs" color="gray400">
                Opacity: {Math.round(effectOpacity * 100)}%
              </Text>
              <input
                type="range"
                min="10"
                max="90"
                value={effectOpacity * 100}
                onChange={(e) => setEffectOpacity(Number(e.target.value) / 100)}
                style={{
                  width: '100%',
                  marginTop: '4px'
                }}
              />
            </Box>

            <Text size="xs" color="gray400">
              Click on the map to place effect
            </Text>
          </Box>
        </PanelSection>
      )}
    </Panel>
  )
})

SpellEffectsPanel.displayName = 'SpellEffectsPanel'

export default SpellEffectsPanel