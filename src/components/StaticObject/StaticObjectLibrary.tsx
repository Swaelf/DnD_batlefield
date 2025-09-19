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

interface StaticObjectTemplate {
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
}

const staticObjectTemplates: StaticObjectTemplate[] = [
  // Structures
  { id: 'wall-stone', name: 'Stone Wall', category: 'structures', icon: <Square />, width: 200, height: 20, fillColor: '#5c5c5c', strokeColor: '#2c2c2c', strokeWidth: 2, shape: 'rectangle' },
  { id: 'wall-wood', name: 'Wooden Wall', category: 'structures', icon: <Square />, width: 200, height: 15, fillColor: '#8B4513', strokeColor: '#654321', strokeWidth: 2, shape: 'rectangle' },
  { id: 'door', name: 'Door', category: 'structures', icon: <DoorOpen />, width: 40, height: 10, fillColor: '#654321', strokeColor: '#4a3018', strokeWidth: 2, shape: 'rectangle' },
  { id: 'window', name: 'Window', category: 'structures', icon: <Square />, width: 30, height: 10, fillColor: '#87CEEB', strokeColor: '#5c5c5c', strokeWidth: 2, shape: 'rectangle' },
  { id: 'altar', name: 'Altar', category: 'structures', icon: <Church />, width: 60, height: 40, fillColor: '#8b8b8b', strokeColor: '#5c5c5c', strokeWidth: 2, shape: 'rectangle' },
  { id: 'pillar', name: 'Pillar', category: 'structures', icon: <Square />, width: 30, height: 30, fillColor: '#808080', strokeColor: '#5c5c5c', strokeWidth: 2, shape: 'circle' },

  // Nature
  { id: 'tree-oak', name: 'Oak Tree', category: 'nature', icon: <Trees />, width: 60, height: 60, fillColor: '#228B22', strokeColor: '#006400', strokeWidth: 2, shape: 'circle' },
  { id: 'tree-pine', name: 'Pine Tree', category: 'nature', icon: <TreePine />, width: 40, height: 40, fillColor: '#0F5132', strokeColor: '#063d20', strokeWidth: 2, shape: 'circle' },
  { id: 'rock', name: 'Rock', category: 'nature', icon: <Mountain />, width: 45, height: 35, fillColor: '#696969', strokeColor: '#404040', strokeWidth: 2, shape: 'polygon', points: [0, 20, 15, 0, 30, 5, 45, 15, 40, 35, 5, 30] },
  { id: 'bush', name: 'Bush', category: 'nature', icon: <Trees />, width: 35, height: 35, fillColor: '#3CB371', strokeColor: '#2E8B57', strokeWidth: 1, shape: 'circle' },
  { id: 'water-well', name: 'Well', category: 'nature', icon: <Droplet />, width: 50, height: 50, fillColor: '#4682B4', strokeColor: '#5c5c5c', strokeWidth: 3, shape: 'circle' },

  // Furniture
  { id: 'table-rect', name: 'Table (Rectangular)', category: 'furniture', icon: <Square />, width: 80, height: 50, fillColor: '#8B4513', strokeColor: '#654321', strokeWidth: 2, shape: 'rectangle' },
  { id: 'table-round', name: 'Table (Round)', category: 'furniture', icon: <Square />, width: 60, height: 60, fillColor: '#8B4513', strokeColor: '#654321', strokeWidth: 2, shape: 'circle' },
  { id: 'chair', name: 'Chair', category: 'furniture', icon: <Square />, width: 20, height: 20, fillColor: '#A0522D', strokeColor: '#654321', strokeWidth: 1, shape: 'rectangle' },
  { id: 'bed', name: 'Bed', category: 'furniture', icon: <Square />, width: 60, height: 90, fillColor: '#DEB887', strokeColor: '#8B4513', strokeWidth: 2, shape: 'rectangle' },
  { id: 'bookshelf', name: 'Bookshelf', category: 'furniture', icon: <Square />, width: 80, height: 20, fillColor: '#654321', strokeColor: '#4a3018', strokeWidth: 2, shape: 'rectangle' },

  // Dungeon
  { id: 'chest', name: 'Chest', category: 'dungeon', icon: <Package />, width: 40, height: 30, fillColor: '#8B4513', strokeColor: '#654321', strokeWidth: 2, shape: 'rectangle' },
  { id: 'barrel', name: 'Barrel', category: 'dungeon', icon: <Package />, width: 30, height: 30, fillColor: '#654321', strokeColor: '#4a3018', strokeWidth: 2, shape: 'circle' },
  { id: 'crate', name: 'Crate', category: 'dungeon', icon: <Package />, width: 35, height: 35, fillColor: '#8B7355', strokeColor: '#654321', strokeWidth: 2, shape: 'rectangle' },
  { id: 'campfire', name: 'Campfire', category: 'dungeon', icon: <Flame />, width: 40, height: 40, fillColor: '#FF6347', strokeColor: '#8B0000', strokeWidth: 2, shape: 'circle' },
  { id: 'statue', name: 'Statue', category: 'dungeon', icon: <Shield />, width: 40, height: 40, fillColor: '#C0C0C0', strokeColor: '#808080', strokeWidth: 2, shape: 'circle' },
  { id: 'weapon-rack', name: 'Weapon Rack', category: 'dungeon', icon: <Sword />, width: 60, height: 20, fillColor: '#654321', strokeColor: '#4a3018', strokeWidth: 2, shape: 'rectangle' },
  { id: 'treasure', name: 'Treasure Pile', category: 'dungeon', icon: <Coins />, width: 50, height: 40, fillColor: '#FFD700', strokeColor: '#B8860B', strokeWidth: 2, shape: 'circle' },
  { id: 'crystal', name: 'Crystal', category: 'dungeon', icon: <Gem />, width: 30, height: 30, fillColor: '#9370DB', strokeColor: '#6A0DAD', strokeWidth: 2, shape: 'polygon', points: [15, 0, 30, 15, 15, 30, 0, 15] }
]

const categories = [
  { id: 'structures', name: 'Structures', icon: <Home className="h-4 w-4" /> },
  { id: 'nature', name: 'Nature', icon: <Trees className="h-4 w-4" /> },
  { id: 'furniture', name: 'Furniture', icon: <Package className="h-4 w-4" /> },
  { id: 'dungeon', name: 'Dungeon', icon: <Shield className="h-4 w-4" /> }
]

export const StaticObjectLibrary: React.FC = () => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['structures', 'nature', 'furniture', 'dungeon'])
  )
  const [selectedTemplate, setSelectedTemplate] = useState<StaticObjectTemplate | null>(null)
  const { setTool } = useToolStore()

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
    <div className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-lg font-bold text-d20-gold flex items-center gap-2">
          <Home className="h-5 w-5" />
          Static Objects
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Click an object then click on the map to place
        </p>
      </div>

      {/* Object List */}
      <div className="flex-1 overflow-y-auto p-4">
        {categories.map(category => {
          const categoryObjects = staticObjectTemplates.filter(
            obj => obj.category === category.id
          )
          const isExpanded = expandedCategories.has(category.id)

          return (
            <div key={category.id} className="mb-4">
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center justify-between p-2 hover:bg-gray-800 rounded transition-colors"
              >
                <div className="flex items-center gap-2">
                  {category.icon}
                  <span className="text-sm font-semibold text-gray-300">
                    {category.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({categoryObjects.length})
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                )}
              </button>

              {isExpanded && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {categoryObjects.map(template => (
                    <button
                      key={template.id}
                      onClick={() => handleSelectTemplate(template)}
                      className={`
                        p-3 rounded-lg border-2 transition-all
                        ${selectedTemplate?.id === template.id
                          ? 'border-d20-gold bg-gray-800'
                          : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800'
                        }
                      `}
                      title={template.name}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <div className="text-gray-400">
                          {template.icon}
                        </div>
                        <span className="text-xs text-gray-400 text-center break-words">
                          {template.name}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Selected Object Info */}
      {selectedTemplate && (
        <div className="p-4 border-t border-gray-800 bg-gray-800/50">
          <div className="text-sm">
            <div className="font-semibold text-d20-gold mb-2">
              {selectedTemplate.name}
            </div>
            <div className="text-xs text-gray-400 space-y-1">
              <div>Size: {selectedTemplate.width}x{selectedTemplate.height || selectedTemplate.width}</div>
              <div>Click on the map to place</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StaticObjectLibrary