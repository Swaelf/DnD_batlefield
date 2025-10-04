import { useState, memo } from 'react'
import { ChevronDown, ChevronRight, Package, Palette, Pipette } from '@/utils/optimizedIcons'
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
import { EffectPropertiesPanel } from '@/components/ui/EffectPropertiesPanel'
import type { EffectProperties } from '@/components/ui/EffectPropertiesPanel'
import { staticObjectTemplates, staticObjectCategories } from './constants.tsx'
import type { StaticObjectTemplate } from './types'
import * as styles from './StaticObjectLibrary.css'

export const StaticObjectLibrary = memo(() => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['structures', 'nature', 'furniture', 'dungeon'])
  )
  const [selectedTemplate, setSelectedTemplate] = useState<StaticObjectTemplate | null>(null)
  const [objectProperties, setObjectProperties] = useState<EffectProperties>({
    color: '#6B7280',
    opacity: 1,
    rotation: 0,
    dimensions: {
      radius: 30,
      width: 100,
      height: 60
    }
  })

  const setTool = useToolStore(state => state.setTool)
  const fillColor = useToolStore(state => state.fillColor)
  const strokeColor = useToolStore(state => state.strokeColor)
  const setFillColor = useToolStore(state => state.setFillColor)
  const setStrokeColor = useToolStore(state => state.setStrokeColor)

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const handleSelectTemplate = (template: StaticObjectTemplate) => {
    setSelectedTemplate(template)

    // Set properties from template defaults
    const newProperties: EffectProperties = {
      color: template.defaultColor,
      opacity: template.defaultOpacity,
      rotation: template.rotation || 0,
      dimensions: {
        radius: template.sizeProperties.radius || 30,
        width: template.sizeProperties.width || 100,
        height: template.sizeProperties.height || 60
      }
    }
    setObjectProperties(newProperties)

    setTool('staticObject')
    updateTemplateInStore(template, newProperties)
  }

  const updateTemplateInStore = (template: StaticObjectTemplate, properties: EffectProperties) => {
    const { setStaticObjectTemplate } = useToolStore.getState()
    const updatedTemplate: StaticObjectTemplate = {
      ...template,
      defaultColor: properties.color,
      defaultOpacity: properties.opacity,
      rotation: properties.rotation,
      sizeProperties: {
        ...template.sizeProperties,
        radius: template.type === 'circle' ? properties.dimensions.radius : undefined,
        width: template.type === 'rectangle' ? properties.dimensions.width : undefined,
        height: template.type === 'rectangle' ? properties.dimensions.height : undefined
      }
    }
    setStaticObjectTemplate(updatedTemplate)
  }

  const handlePropertiesChange = (properties: EffectProperties) => {
    setObjectProperties(properties)
    if (selectedTemplate) {
      updateTemplateInStore(selectedTemplate, properties)
    }
  }

  return (
    <Panel
      size="sidebar"
      className={styles.objectPanel}
      style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
    >
      <PanelHeader>
        <Box display="flex" alignItems="center" gap={2}>
          <Package size={20} />
          <PanelTitle>Static Objects</PanelTitle>
        </Box>
        <Text size="xs" color="gray500">
          Map objects and decorations
        </Text>
      </PanelHeader>

      {/* Color Selectors */}
      <PanelSection>
        <Box display="flex" gap={2} style={{ padding: '8px 0' }}>
          {/* Fill Color */}
          <Box flexGrow={1}>
            <Box display="flex" alignItems="center" gap={1} marginBottom={1}>
              <Palette size={14} color="#9CA3AF" />
              <Text size="xs" color="gray400" weight="medium">Fill</Text>
            </Box>
            <input
              type="color"
              value={fillColor}
              onChange={(e) => setFillColor(e.target.value)}
              style={{
                width: '100%',
                height: '36px',
                border: '1px solid var(--colors-gray700)',
                borderRadius: '4px',
                cursor: 'pointer',
                backgroundColor: fillColor
              }}
            />
          </Box>

          {/* Stroke Color */}
          <Box flexGrow={1}>
            <Box display="flex" alignItems="center" gap={1} marginBottom={1}>
              <Pipette size={14} color="#9CA3AF" />
              <Text size="xs" color="gray400" weight="medium">Stroke</Text>
            </Box>
            <input
              type="color"
              value={strokeColor}
              onChange={(e) => setStrokeColor(e.target.value)}
              style={{
                width: '100%',
                height: '36px',
                border: '1px solid var(--colors-gray700)',
                borderRadius: '4px',
                cursor: 'pointer',
                backgroundColor: strokeColor
              }}
            />
          </Box>
        </Box>
      </PanelSection>

      <PanelBody>
        {staticObjectCategories.map(category => {
          const categoryObjects = staticObjectTemplates.filter(
            obj => obj.category === category.id
          )
          const isExpanded = expandedCategories.has(category.id)

          if (categoryObjects.length === 0) return null

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
                    ({categoryObjects.length})
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
                  {categoryObjects.map(template => (
                    <Button
                      key={template.id}
                      onClick={() => handleSelectTemplate(template)}
                      variant="ghost"
                      fullWidth
                      className={selectedTemplate?.id === template.id ? styles.objectButton.selected : styles.objectButton.unselected}
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

      {/* Selected Object Controls */}
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
              properties={objectProperties}
              onChange={handlePropertiesChange}
            />

            <Text size="xs" color="gray400">
              Click on the map to place object
            </Text>
          </Box>
        </PanelSection>
      )}
    </Panel>
  )
})

StaticObjectLibrary.displayName = 'StaticObjectLibrary'

export default StaticObjectLibrary