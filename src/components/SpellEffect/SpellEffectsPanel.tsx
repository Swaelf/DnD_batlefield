import React, { useState, memo } from 'react'
import { ChevronDown, ChevronRight, Sparkles } from 'lucide-react'
import useToolStore from '@/store/toolStore'
import { styled } from '@/styles/theme.config'
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

const SpellPanel = styled(Panel, {
  borderLeft: '1px solid $gray800'
})

const CategoryToggle = styled(Button, {
  justifyContent: 'space-between',
  padding: 2,
  '&:hover': {
    backgroundColor: '$gray800'
  }
})

const EffectButton = styled(Button, {
  padding: 3,
  textAlign: 'left',
  border: '2px solid',
  backgroundColor: 'transparent',

  variants: {
    selected: {
      true: {
        borderColor: '$secondary',
        backgroundColor: '$gray800',
        '&:hover': {
          borderColor: '$secondary'
        }
      },
      false: {
        borderColor: '$gray700',
        '&:hover': {
          borderColor: '$gray600'
        }
      }
    }
  }
})

const ConfigSection = styled(PanelSection, {
  backgroundColor: '$gray800/50'
})

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
    <SpellPanel size="sidebar">
      <PanelHeader>
        <Box display="flex" alignItems="center" gap={2}>
          <Sparkles size={20} />
          <PanelTitle>Spell Effects</PanelTitle>
        </Box>
        <Text size="xs" color="gray500">
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
            <PanelSection key={category.id} spacing="md">
              <CategoryToggle
                onClick={() => toggleCategory(category.id)}
                variant="ghost"
                fullWidth
              >
                <Box display="flex" alignItems="center" gap={2}>
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
              </CategoryToggle>

              {isExpanded && (
                <Box display="flex" flexDirection="column" gap={2} marginTop={2}>
                  {categoryEffects.map(template => (
                    <EffectButton
                      key={template.id}
                      onClick={() => handleSelectTemplate(template)}
                      variant="ghost"
                      fullWidth
                      selected={selectedTemplate?.id === template.id}
                    >
                      <Box display="flex" alignItems="flex-start" gap={3}>
                        <Box color="textTertiary" marginTop={1}>
                          {template.icon}
                        </Box>
                        <Box flexGrow={1}>
                          <Text weight="semibold" color="gray200">
                            {template.name}
                          </Text>
                          <Text size="xs" color="gray500">
                            {template.description}
                          </Text>
                          {template.dndSpell && (
                            <Text size="xs" color="secondary">
                              {template.dndSpell}
                            </Text>
                          )}
                        </Box>
                      </Box>
                    </EffectButton>
                  ))}
                </Box>
              )}
            </PanelSection>
          )
        })}
      </PanelBody>

      {/* Selected Effect Controls */}
      {selectedTemplate && (
        <ConfigSection divider>
          <Box display="flex" flexDirection="column" gap={3}>
            <Box>
              <Text weight="semibold" color="secondary">
                {selectedTemplate.name}
              </Text>
              <Text size="xs" color="gray400">
                {selectedTemplate.dndSpell || selectedTemplate.description}
              </Text>
            </Box>

            <Box>
              <Text size="xs" color="gray400">
                Color
              </Text>
              <Box display="flex" alignItems="center" gap={2}>
                <input
                  type="color"
                  value={effectColor}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEffectColor(e.target.value)}
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEffectOpacity(Number(e.target.value) / 100)}
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
        </ConfigSection>
      )}
    </SpellPanel>
  )
})

SpellEffectsPanel.displayName = 'SpellEffectsPanel'

export default SpellEffectsPanel