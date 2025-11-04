import { useState, memo } from 'react'
import { ChevronDown, ChevronRight, MapPin } from '@/utils/optimizedIcons'
import useToolStore from '@/store/toolStore'
import {
  Panel,
  PanelHeader,
  PanelTitle,
  PanelBody,
  PanelSection,
  Box,
  Text,
  Button
} from '@/components/ui'
import { EffectPropertiesPanel } from '@/components/Properties/EffectPropertiesPanel'
import type { EffectProperties } from '@/components/Properties/EffectPropertiesPanel'
import { staticEffectTemplates, staticEffectCategories } from './constants.tsx'
import type { StaticEffectTemplate } from './types'
import * as styles from './StaticEffectsPanel.css'

export const StaticEffectsPanel = memo(() => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['area', 'line', 'cone'])
  )
  const [selectedTemplate, setSelectedTemplate] = useState<StaticEffectTemplate | null>(null)
  const [effectProperties, setEffectProperties] = useState<EffectProperties>({
    color: '#3B82F6',
    opacity: 0.4,
    rotation: 0,
    dimensions: {
      radius: 50,
      width: 100,
      height: 60,
      length: 80,
      angle: 60
    }
  })

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

  const handleSelectTemplate = (template: StaticEffectTemplate) => {
    setSelectedTemplate(template)

    // Set properties from template defaults
    const newProperties: EffectProperties = {
      color: template.defaultColor,
      opacity: template.defaultOpacity,
      rotation: template.rotation || 0,
      dimensions: {
        radius: template.sizeProperties.radius || 50,
        width: template.sizeProperties.width || 100,
        height: template.sizeProperties.height || 60,
        length: template.sizeProperties.length || 80,
        angle: template.sizeProperties.angle || 60
      }
    }
    setEffectProperties(newProperties)

    setTool('staticEffect')
    updateTemplateInStore(template, newProperties)
  }

  const updateTemplateInStore = (template: StaticEffectTemplate, properties: EffectProperties) => {
    const { setStaticEffectTemplate } = useToolStore.getState()
    const updatedTemplate: StaticEffectTemplate = {
      ...template,
      defaultColor: properties.color,
      defaultOpacity: properties.opacity,
      rotation: properties.rotation,
      sizeProperties: {
        ...template.sizeProperties,
        radius: template.type === 'circle' ? properties.dimensions.radius : undefined,
        width: template.type === 'rectangle' ? properties.dimensions.width : template.type === 'line' ? template.sizeProperties.width : undefined,
        height: template.type === 'rectangle' ? properties.dimensions.height : undefined,
        length: template.type === 'cone' || template.type === 'line' ? properties.dimensions.length : undefined,
        angle: template.type === 'cone' ? properties.dimensions.angle : undefined
      }
    }
    setStaticEffectTemplate(updatedTemplate)
  }

  const handlePropertiesChange = (properties: EffectProperties) => {
    setEffectProperties(properties)
    if (selectedTemplate) {
      updateTemplateInStore(selectedTemplate, properties)
    }
  }

  return (
    <Panel
      size="sidebar"
      className={styles.staticPanel}
      style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
    >
      <PanelHeader>
        <Box display="flex" alignItems="center" gap={2}>
          <MapPin size={20} />
          <PanelTitle>Static Effects</PanelTitle>
        </Box>
        <Text size="xs" color="gray500">
          Map area markers and zones
        </Text>
      </PanelHeader>

      <PanelBody>
        {staticEffectCategories.map(category => {
          const categoryEffects = staticEffectTemplates.filter(
            effect => effect.category === category.id
          )
          const isExpanded = expandedCategories.has(category.id)

          if (categoryEffects.length === 0) return null

          return (
            <PanelSection key={category.id} spacing="md">
              <Button
                className={styles.categoryToggle}
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
              </Button>

              {isExpanded && (
                <Box display="flex" flexDirection="column" gap={2} marginTop={2}>
                  {categoryEffects.map(template => (
                    <Button
                      key={template.id}
                      onClick={() => handleSelectTemplate(template)}
                      variant="ghost"
                      fullWidth
                      className={selectedTemplate?.id === template.id ? styles.effectButton.selected : styles.effectButton.unselected}
                    >
                      <Box display="flex" alignItems="flex-start" gap={2} style={{ width: '100%', overflow: 'hidden' }}>
                        <Box color="textTertiary" marginTop={1} style={{ flexShrink: 0 }}>
                          {template.icon}
                        </Box>
                        <Box flexGrow={1} style={{ minWidth: 0 }}>
                          <Text weight="semibold" color="gray200" style={{ wordWrap: 'break-word' }}>
                            {template.name}
                          </Text>
                          <Text size="xs" color="gray500" style={{ wordWrap: 'break-word' }}>
                            {template.description}
                          </Text>
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
        <PanelSection divider className={styles.configSection}>
          <Box display="flex" flexDirection="column" gap={2}>
            <Box>
              <Text weight="semibold" color="secondary" size="sm">
                {selectedTemplate.name}
              </Text>
            </Box>

            <EffectPropertiesPanel
              effectType={selectedTemplate.type}
              properties={effectProperties}
              onChange={handlePropertiesChange}
            />

            <Text size="xs" color="gray400">
              Click on the map to place effect
            </Text>
          </Box>
        </PanelSection>
      )}
    </Panel>
  )
})

StaticEffectsPanel.displayName = 'StaticEffectsPanel'

export default StaticEffectsPanel