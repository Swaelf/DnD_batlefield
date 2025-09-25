import React, { useState } from 'react'
import {
  Trees,
  Home,
  Mountain,
  Package,
  ChevronDown,
  ChevronRight,
  TreePine,
  DoorOpen,
  Square,
  Droplet,
  Flame,
  Church,
  Shield,
  Sword,
  Coins,
  Gem
} from 'lucide-react'
import useToolStore from '@/store/toolStore'
import {
  Panel,
  PanelHeader,
  PanelTitle,
  PanelBody,
  PanelSection,
  Button,
  Grid,
  Box,
  Text
} from '@/components/ui'

type StaticObjectTemplate = {
  id: string
  name: string
  category: 'structures' | 'nature' | 'furniture' | 'dungeon'
  icon: React.ReactNode
  width: number
  height: number
  fillColor: string
  strokeColor: string
  strokeWidth: number
  shape: 'rectangle' | 'circle' | 'polygon'
  points?: number[] // For polygon shapes
  metadata?: {
    isStatic: boolean
    effectType?: 'tree' | 'rock' | 'wall' | 'furniture' | 'water' | 'fire'
  }
}

const staticObjectTemplates: StaticObjectTemplate[] = [
  // Structures
  { id: 'wall-stone', name: 'Stone Wall', category: 'structures', icon: <Square />, width: 200, height: 20, fillColor: '#5c5c5c', strokeColor: '#2c2c2c', strokeWidth: 2, shape: 'rectangle', metadata: { isStatic: true, effectType: 'wall' } },
  { id: 'wall-wood', name: 'Wooden Wall', category: 'structures', icon: <Square />, width: 200, height: 15, fillColor: '#8B4513', strokeColor: '#654321', strokeWidth: 2, shape: 'rectangle', metadata: { isStatic: true, effectType: 'wall' } },
  { id: 'door', name: 'Door', category: 'structures', icon: <DoorOpen />, width: 40, height: 10, fillColor: '#654321', strokeColor: '#4a3018', strokeWidth: 2, shape: 'rectangle' },
  { id: 'window', name: 'Window', category: 'structures', icon: <Square />, width: 30, height: 10, fillColor: '#87CEEB', strokeColor: '#5c5c5c', strokeWidth: 2, shape: 'rectangle' },
  { id: 'altar', name: 'Altar', category: 'structures', icon: <Church />, width: 60, height: 40, fillColor: '#8b8b8b', strokeColor: '#5c5c5c', strokeWidth: 2, shape: 'rectangle' },
  { id: 'pillar', name: 'Pillar', category: 'structures', icon: <Square />, width: 30, height: 30, fillColor: '#808080', strokeColor: '#5c5c5c', strokeWidth: 2, shape: 'circle' },

  // Nature - Enhanced with more variety
  { id: 'tree-oak', name: 'Oak Tree (Summer)', category: 'nature', icon: <Trees />, width: 60, height: 60, fillColor: '#228B22', strokeColor: '#1a5c1a', strokeWidth: 3, shape: 'circle', metadata: { isStatic: true, effectType: 'tree' } },
  { id: 'tree-oak-autumn', name: 'Oak Tree (Autumn)', category: 'nature', icon: <Trees />, width: 60, height: 60, fillColor: '#CD853F', strokeColor: '#8B4513', strokeWidth: 3, shape: 'circle', metadata: { isStatic: true, effectType: 'tree' } },
  { id: 'tree-pine', name: 'Pine Tree', category: 'nature', icon: <TreePine />, width: 45, height: 45, fillColor: '#0F5132', strokeColor: '#0a3820', strokeWidth: 3, shape: 'circle', metadata: { isStatic: true, effectType: 'tree' } },
  { id: 'tree-willow', name: 'Willow Tree', category: 'nature', icon: <Trees />, width: 65, height: 65, fillColor: '#8FBC8F', strokeColor: '#556B2F', strokeWidth: 2, shape: 'circle', metadata: { isStatic: true, effectType: 'tree' } },
  { id: 'tree-cherry', name: 'Cherry Blossom', category: 'nature', icon: <Trees />, width: 50, height: 50, fillColor: '#FFB6C1', strokeColor: '#FF1493', strokeWidth: 2, shape: 'circle', metadata: { isStatic: true, effectType: 'tree' } },
  { id: 'tree-dead', name: 'Dead Tree', category: 'nature', icon: <Trees />, width: 55, height: 55, fillColor: '#8B7D6B', strokeColor: '#5C4033', strokeWidth: 3, shape: 'circle', metadata: { isStatic: true, effectType: 'tree' } },
  { id: 'tree-maple', name: 'Maple Tree (Red)', category: 'nature', icon: <Trees />, width: 55, height: 55, fillColor: '#DC143C', strokeColor: '#8B0000', strokeWidth: 3, shape: 'circle', metadata: { isStatic: true, effectType: 'tree' } },
  { id: 'tree-birch', name: 'Birch Tree', category: 'nature', icon: <Trees />, width: 45, height: 45, fillColor: '#90EE90', strokeColor: '#F5F5DC', strokeWidth: 3, shape: 'circle', metadata: { isStatic: true, effectType: 'tree' } },
  { id: 'tree-jungle', name: 'Jungle Tree', category: 'nature', icon: <Trees />, width: 70, height: 70, fillColor: '#006400', strokeColor: '#003300', strokeWidth: 4, shape: 'circle', metadata: { isStatic: true, effectType: 'tree' } },
  { id: 'bush', name: 'Bush (Green)', category: 'nature', icon: <Trees />, width: 35, height: 35, fillColor: '#3CB371', strokeColor: '#2E8B57', strokeWidth: 2, shape: 'circle', metadata: { isStatic: true, effectType: 'tree' } },
  { id: 'bush-berry', name: 'Berry Bush', category: 'nature', icon: <Trees />, width: 35, height: 35, fillColor: '#8B008B', strokeColor: '#4B0082', strokeWidth: 2, shape: 'circle', metadata: { isStatic: true, effectType: 'tree' } },
  { id: 'bush-flower', name: 'Flowering Bush', category: 'nature', icon: <Trees />, width: 35, height: 35, fillColor: '#FF69B4', strokeColor: '#FF1493', strokeWidth: 2, shape: 'circle', metadata: { isStatic: true, effectType: 'tree' } },
  { id: 'rock', name: 'Rock', category: 'nature', icon: <Mountain />, width: 45, height: 35, fillColor: '#696969', strokeColor: '#404040', strokeWidth: 2, shape: 'polygon', points: [0, 20, 15, 0, 30, 5, 45, 15, 40, 35, 5, 30], metadata: { isStatic: true, effectType: 'rock' } },
  { id: 'water-well', name: 'Well', category: 'nature', icon: <Droplet />, width: 50, height: 50, fillColor: '#4682B4', strokeColor: '#5c5c5c', strokeWidth: 3, shape: 'circle', metadata: { isStatic: true, effectType: 'water' } },

  // Furniture
  { id: 'table-rect', name: 'Table (Rectangular)', category: 'furniture', icon: <Square />, width: 80, height: 50, fillColor: '#8B4513', strokeColor: '#654321', strokeWidth: 2, shape: 'rectangle', metadata: { isStatic: true, effectType: 'furniture' } },
  { id: 'table-round', name: 'Table (Round)', category: 'furniture', icon: <Square />, width: 60, height: 60, fillColor: '#8B4513', strokeColor: '#654321', strokeWidth: 2, shape: 'circle', metadata: { isStatic: true, effectType: 'furniture' } },
  { id: 'chair', name: 'Chair', category: 'furniture', icon: <Square />, width: 20, height: 20, fillColor: '#A0522D', strokeColor: '#654321', strokeWidth: 1, shape: 'rectangle' },
  { id: 'bed', name: 'Bed', category: 'furniture', icon: <Square />, width: 60, height: 90, fillColor: '#DEB887', strokeColor: '#8B4513', strokeWidth: 2, shape: 'rectangle' },
  { id: 'bookshelf', name: 'Bookshelf', category: 'furniture', icon: <Square />, width: 80, height: 20, fillColor: '#654321', strokeColor: '#4a3018', strokeWidth: 2, shape: 'rectangle' },

  // Dungeon
  { id: 'chest', name: 'Chest', category: 'dungeon', icon: <Package />, width: 40, height: 30, fillColor: '#8B4513', strokeColor: '#654321', strokeWidth: 2, shape: 'rectangle' },
  { id: 'barrel', name: 'Barrel', category: 'dungeon', icon: <Package />, width: 30, height: 30, fillColor: '#654321', strokeColor: '#4a3018', strokeWidth: 2, shape: 'circle' },
  { id: 'crate', name: 'Crate', category: 'dungeon', icon: <Package />, width: 35, height: 35, fillColor: '#8B7355', strokeColor: '#654321', strokeWidth: 2, shape: 'rectangle' },
  { id: 'campfire', name: 'Campfire', category: 'dungeon', icon: <Flame />, width: 40, height: 40, fillColor: '#FF6347', strokeColor: '#8B0000', strokeWidth: 2, shape: 'circle', metadata: { isStatic: true, effectType: 'fire' } },
  { id: 'statue', name: 'Statue', category: 'dungeon', icon: <Shield />, width: 40, height: 40, fillColor: '#C0C0C0', strokeColor: '#808080', strokeWidth: 2, shape: 'circle' },
  { id: 'weapon-rack', name: 'Weapon Rack', category: 'dungeon', icon: <Sword />, width: 60, height: 20, fillColor: '#654321', strokeColor: '#4a3018', strokeWidth: 2, shape: 'rectangle' },
  { id: 'treasure', name: 'Treasure Pile', category: 'dungeon', icon: <Coins />, width: 50, height: 40, fillColor: '#FFD700', strokeColor: '#B8860B', strokeWidth: 2, shape: 'circle' },
  { id: 'crystal', name: 'Crystal', category: 'dungeon', icon: <Gem />, width: 30, height: 30, fillColor: '#9370DB', strokeColor: '#6A0DAD', strokeWidth: 2, shape: 'polygon', points: [15, 0, 30, 15, 15, 30, 0, 15] }
]

const categories = [
  { id: 'structures', name: 'Structures', icon: <Home size={16} /> },
  { id: 'nature', name: 'Nature', icon: <Trees size={16} /> },
  { id: 'furniture', name: 'Furniture', icon: <Package size={16} /> },
  { id: 'dungeon', name: 'Dungeon', icon: <Shield size={16} /> }
]

export const StaticObjectLibrary: React.FC = () => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['structures', 'nature', 'furniture', 'dungeon'])
  )
  const [selectedTemplate, setSelectedTemplate] = useState<StaticObjectTemplate | null>(null)
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

  const handleSelectTemplate = (template: StaticObjectTemplate) => {
    setSelectedTemplate(template)
    setTool('staticObject')
    // Store the template in the tool store
    const { setStaticObjectTemplate } = useToolStore.getState()
    setStaticObjectTemplate(template)
  }


  return (
    <Panel size="sidebar" css={{ borderLeft: '1px solid $gray800' }}>
      <PanelHeader>
        <Box display="flex" alignItems="center" gap="2">
          <Home size={20} />
          <PanelTitle>Static Objects</PanelTitle>
        </Box>
        <Text size="xs" color="gray500" css={{ marginTop: '$1' }}>
          Click an object then click on the map to place
        </Text>
      </PanelHeader>

      <PanelBody>
        {categories.map(category => {
          const categoryObjects = staticObjectTemplates.filter(
            obj => obj.category === category.id
          )
          const isExpanded = expandedCategories.has(category.id)

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
                <Grid columns={3} gap={2} css={{ marginTop: '$2' }}>
                  {categoryObjects.map(template => (
                    <Button
                      key={template.id}
                      onClick={() => handleSelectTemplate(template)}
                      variant="ghost"
                      css={{
                        height: 'auto',
                        padding: '$3',
                        flexDirection: 'column',
                        gap: '$1',
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
                      title={template.name}
                    >
                      <Box display="flex" flexDirection="column" alignItems="center" gap="1">
                        <Box css={{ color: '$gray400' }}>
                          {template.icon}
                        </Box>
                        <Text size="xs" color="gray400" align="center" css={{ wordBreak: 'break-words' }}>
                          {template.name}
                        </Text>
                      </Box>
                    </Button>
                  ))}
                </Grid>
              )}
            </PanelSection>
          )
        })}
      </PanelBody>

      {/* Selected Object Info */}
      {selectedTemplate && (
        <PanelSection divider css={{ backgroundColor: '$gray800/50' }}>
          <Box display="flex" flexDirection="column" gap="2">
            <Text size="sm" weight="semibold" color="secondary">
              {selectedTemplate.name}
            </Text>
            <Box display="flex" flexDirection="column" gap="1">
              <Text size="xs" color="gray400">
                Size: {selectedTemplate.width}x{selectedTemplate.height || selectedTemplate.width}
              </Text>
              <Text size="xs" color="gray400">
                Click on the map to place
              </Text>
            </Box>
          </Box>
        </PanelSection>
      )}
    </Panel>
  )
}

export default StaticObjectLibrary