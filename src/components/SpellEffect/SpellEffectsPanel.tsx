import React, { useState } from 'react'
import {
  Sparkles,
  Zap,
  Flame,
  Wind,
  Snowflake,
  Circle,
  Square,
  Minus,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import useToolStore from '@/store/toolStore'

interface SpellEffectTemplate {
  id: string
  name: string
  category: 'area' | 'line' | 'wall' | 'emanation'
  shape: 'sphere' | 'cone' | 'cube' | 'line' | 'wall'
  icon: React.ReactNode
  color: string
  opacity: number
  size: {
    radius?: number      // For spheres
    length?: number      // For cones, lines, walls
    width?: number       // For lines, walls, cubes
    height?: number      // For walls, cubes
    angle?: number       // For cones (in degrees)
  }
  description: string
  dndSpell?: string      // Associated D&D spell
}

const spellEffectTemplates: SpellEffectTemplate[] = [
  // Area Effects - Spheres
  {
    id: 'fireball',
    name: 'Fireball',
    category: 'area',
    shape: 'sphere',
    icon: <Flame />,
    color: '#FF6347',
    opacity: 0.4,
    size: { radius: 100 }, // 20ft radius = 4 squares * 50px/square / 2
    description: '20-foot radius sphere',
    dndSpell: 'Fireball (3rd level)'
  },
  {
    id: 'darkness',
    name: 'Darkness',
    category: 'area',
    shape: 'sphere',
    icon: <Circle />,
    color: '#000000',
    opacity: 0.7,
    size: { radius: 75 }, // 15ft radius
    description: '15-foot radius sphere',
    dndSpell: 'Darkness (2nd level)'
  },
  {
    id: 'fog-cloud',
    name: 'Fog Cloud',
    category: 'area',
    shape: 'sphere',
    icon: <Wind />,
    color: '#D3D3D3',
    opacity: 0.5,
    size: { radius: 100 }, // 20ft radius
    description: '20-foot radius sphere',
    dndSpell: 'Fog Cloud (1st level)'
  },
  {
    id: 'ice-storm',
    name: 'Ice Storm',
    category: 'area',
    shape: 'sphere',
    icon: <Snowflake />,
    color: '#87CEEB',
    opacity: 0.4,
    size: { radius: 100 }, // 20ft radius
    description: '20-foot radius, 40-foot high cylinder',
    dndSpell: 'Ice Storm (4th level)'
  },

  // Cone Effects
  {
    id: 'burning-hands',
    name: 'Burning Hands',
    category: 'area',
    shape: 'cone',
    icon: <Flame />,
    color: '#FFA500',
    opacity: 0.4,
    size: { length: 75, angle: 60 }, // 15ft cone
    description: '15-foot cone',
    dndSpell: 'Burning Hands (1st level)'
  },
  {
    id: 'cone-of-cold',
    name: 'Cone of Cold',
    category: 'area',
    shape: 'cone',
    icon: <Snowflake />,
    color: '#4169E1',
    opacity: 0.4,
    size: { length: 300, angle: 60 }, // 60ft cone
    description: '60-foot cone',
    dndSpell: 'Cone of Cold (5th level)'
  },
  {
    id: 'color-spray',
    name: 'Color Spray',
    category: 'area',
    shape: 'cone',
    icon: <Sparkles />,
    color: '#FF69B4',
    opacity: 0.3,
    size: { length: 75, angle: 60 }, // 15ft cone
    description: '15-foot cone',
    dndSpell: 'Color Spray (1st level)'
  },

  // Cube Effects
  {
    id: 'thunderwave',
    name: 'Thunderwave',
    category: 'area',
    shape: 'cube',
    icon: <Zap />,
    color: '#4B0082',
    opacity: 0.4,
    size: { width: 75, height: 75 }, // 15ft cube
    description: '15-foot cube',
    dndSpell: 'Thunderwave (1st level)'
  },
  {
    id: 'hypnotic-pattern',
    name: 'Hypnotic Pattern',
    category: 'area',
    shape: 'cube',
    icon: <Sparkles />,
    color: '#9370DB',
    opacity: 0.3,
    size: { width: 150, height: 150 }, // 30ft cube
    description: '30-foot cube',
    dndSpell: 'Hypnotic Pattern (3rd level)'
  },
  {
    id: 'web',
    name: 'Web',
    category: 'area',
    shape: 'cube',
    icon: <Square />,
    color: '#F5F5DC',
    opacity: 0.5,
    size: { width: 100, height: 100 }, // 20ft cube
    description: '20-foot cube',
    dndSpell: 'Web (2nd level)'
  },

  // Line Effects
  {
    id: 'lightning-bolt',
    name: 'Lightning Bolt',
    category: 'line',
    shape: 'line',
    icon: <Zap />,
    color: '#00FFFF',
    opacity: 0.6,
    size: { length: 500, width: 25 }, // 100ft long, 5ft wide
    description: '100-foot long, 5-foot wide line',
    dndSpell: 'Lightning Bolt (3rd level)'
  },
  {
    id: 'gust-of-wind',
    name: 'Gust of Wind',
    category: 'line',
    shape: 'line',
    icon: <Wind />,
    color: '#87CEFA',
    opacity: 0.3,
    size: { length: 300, width: 50 }, // 60ft long, 10ft wide
    description: '60-foot long, 10-foot wide line',
    dndSpell: 'Gust of Wind (2nd level)'
  },
  {
    id: 'disintegrate',
    name: 'Disintegrate',
    category: 'line',
    shape: 'line',
    icon: <Minus />,
    color: '#32CD32',
    opacity: 0.7,
    size: { length: 500, width: 5 }, // Thin beam
    description: 'Thin green beam',
    dndSpell: 'Disintegrate (6th level)'
  },

  // Wall Effects
  {
    id: 'wall-of-fire',
    name: 'Wall of Fire',
    category: 'wall',
    shape: 'wall',
    icon: <Flame />,
    color: '#FF4500',
    opacity: 0.6,
    size: { length: 300, width: 5, height: 100 }, // 60ft long, 1ft thick, 20ft high
    description: '60-foot long, 20-foot high wall',
    dndSpell: 'Wall of Fire (4th level)'
  },
  {
    id: 'wall-of-ice',
    name: 'Wall of Ice',
    category: 'wall',
    shape: 'wall',
    icon: <Snowflake />,
    color: '#ADD8E6',
    opacity: 0.7,
    size: { length: 500, width: 5, height: 50 }, // 100ft long, 1ft thick, 10ft high
    description: '100-foot long, 10-foot high wall',
    dndSpell: 'Wall of Ice (6th level)'
  },
  {
    id: 'wall-of-force',
    name: 'Wall of Force',
    category: 'wall',
    shape: 'wall',
    icon: <Square />,
    color: '#6495ED',
    opacity: 0.2,
    size: { length: 500, width: 2, height: 50 }, // 100ft long, invisible
    description: '100-foot long invisible wall',
    dndSpell: 'Wall of Force (5th level)'
  },
  {
    id: 'blade-barrier',
    name: 'Blade Barrier',
    category: 'wall',
    shape: 'wall',
    icon: <Zap />,
    color: '#C0C0C0',
    opacity: 0.5,
    size: { length: 500, width: 25, height: 100 }, // 100ft long, 5ft thick, 20ft high
    description: '100-foot long wall of blades',
    dndSpell: 'Blade Barrier (6th level)'
  }
]

const categories = [
  { id: 'area', name: 'Area Effects', icon: <Circle className="h-4 w-4" /> },
  { id: 'line', name: 'Line Effects', icon: <Minus className="h-4 w-4" /> },
  { id: 'wall', name: 'Wall Effects', icon: <Square className="h-4 w-4" /> },
  { id: 'emanation', name: 'Emanations', icon: <Sparkles className="h-4 w-4" /> }
]

export const SpellEffectsPanel: React.FC = () => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['area', 'line', 'wall'])
  )
  const [selectedTemplate, setSelectedTemplate] = useState<SpellEffectTemplate | null>(null)
  const [effectColor, setEffectColor] = useState('#FF6347')
  const [effectOpacity, setEffectOpacity] = useState(0.4)
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
    <div className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-lg font-bold text-d20-gold flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Spell Effects
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          D&D 5e spell areas and effects
        </p>
      </div>

      {/* Effect List */}
      <div className="flex-1 overflow-y-auto p-4">
        {categories.map(category => {
          const categoryEffects = spellEffectTemplates.filter(
            effect => effect.category === category.id
          )
          const isExpanded = expandedCategories.has(category.id)

          if (categoryEffects.length === 0) return null

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
                    ({categoryEffects.length})
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                )}
              </button>

              {isExpanded && (
                <div className="space-y-2 mt-2">
                  {categoryEffects.map(template => (
                    <button
                      key={template.id}
                      onClick={() => handleSelectTemplate(template)}
                      className={`
                        w-full p-3 rounded-lg border-2 transition-all text-left
                        ${selectedTemplate?.id === template.id
                          ? 'border-d20-gold bg-gray-800'
                          : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800'
                        }
                      `}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-gray-400 mt-0.5">
                          {template.icon}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-200">
                            {template.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {template.description}
                          </div>
                          {template.dndSpell && (
                            <div className="text-xs text-d20-gold mt-1">
                              {template.dndSpell}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Selected Effect Controls */}
      {selectedTemplate && (
        <div className="p-4 border-t border-gray-800 bg-gray-800/50">
          <div className="space-y-3">
            <div>
              <div className="font-semibold text-d20-gold mb-2">
                {selectedTemplate.name}
              </div>
              <div className="text-xs text-gray-400">
                {selectedTemplate.dndSpell || selectedTemplate.description}
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400">Color</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="color"
                  value={effectColor}
                  onChange={(e) => setEffectColor(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={effectColor}
                  onChange={(e) => setEffectColor(e.target.value)}
                  className="flex-1 px-2 py-1 bg-gray-700 rounded text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400">
                Opacity: {Math.round(effectOpacity * 100)}%
              </label>
              <input
                type="range"
                min="10"
                max="90"
                value={effectOpacity * 100}
                onChange={(e) => setEffectOpacity(Number(e.target.value) / 100)}
                className="w-full mt-1"
              />
            </div>

            <div className="text-xs text-gray-400">
              Click on the map to place effect
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SpellEffectsPanel