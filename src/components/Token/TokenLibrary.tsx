import React, { useState } from 'react';
import { TokenSize } from '@/types/token';
import useToolStore from '@/store/toolStore';

interface TokenTemplate {
  name: string;
  size: TokenSize;
  color: string;
  shape: 'circle' | 'square';
  category: 'player' | 'enemy' | 'npc' | 'object';
}

const DEFAULT_TOKENS: TokenTemplate[] = [
  // Player tokens
  { name: 'Fighter', size: 'medium', color: '#1E40AF', shape: 'circle', category: 'player' },
  { name: 'Wizard', size: 'medium', color: '#7C3AED', shape: 'circle', category: 'player' },
  { name: 'Rogue', size: 'medium', color: '#374151', shape: 'circle', category: 'player' },
  { name: 'Cleric', size: 'medium', color: '#F59E0B', shape: 'circle', category: 'player' },

  // Enemy tokens
  { name: 'Goblin', size: 'small', color: '#16A34A', shape: 'circle', category: 'enemy' },
  { name: 'Orc', size: 'medium', color: '#65A30D', shape: 'circle', category: 'enemy' },
  { name: 'Ogre', size: 'large', color: '#A16207', shape: 'circle', category: 'enemy' },
  { name: 'Dragon', size: 'gargantuan', color: '#DC2626', shape: 'circle', category: 'enemy' },
  { name: 'Wolf', size: 'medium', color: '#6B7280', shape: 'circle', category: 'enemy' },

  // NPC tokens
  { name: 'Merchant', size: 'medium', color: '#8B5CF6', shape: 'square', category: 'npc' },
  { name: 'Guard', size: 'medium', color: '#3B82F6', shape: 'square', category: 'npc' },
  { name: 'Noble', size: 'medium', color: '#A855F7', shape: 'square', category: 'npc' },

  // Objects
  { name: 'Barrel', size: 'small', color: '#92400E', shape: 'square', category: 'object' },
  { name: 'Chest', size: 'small', color: '#A16207', shape: 'square', category: 'object' },
  { name: 'Door', size: 'medium', color: '#451A03', shape: 'square', category: 'object' },
];

const SIZE_LABELS: Record<TokenSize, string> = {
  tiny: 'Tiny (2.5ft)',
  small: 'Small (5ft)',
  medium: 'Medium (5ft)',
  large: 'Large (10ft)',
  huge: 'Huge (15ft)',
  gargantuan: 'Gargantuan (20ft+)',
};

export const TokenLibrary: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'player' | 'enemy' | 'npc' | 'object'>('all');
  const [customName, setCustomName] = useState('');
  const [customSize, setCustomSize] = useState<TokenSize>('medium');
  const [customColor, setCustomColor] = useState('#FF0000');
  const [customShape, setCustomShape] = useState<'circle' | 'square'>('circle');

  const { currentTool } = useToolStore();

  const filteredTokens = selectedCategory === 'all'
    ? DEFAULT_TOKENS
    : DEFAULT_TOKENS.filter(t => t.category === selectedCategory);

  const handleTokenClick = (template: TokenTemplate) => {
    if (currentTool !== 'token') {
      useToolStore.getState().setTool('token');
    }

    // Store the template for placement
    useToolStore.getState().setTokenTemplate({
      ...template,
      showLabel: true,
      labelPosition: 'bottom',
      opacity: 1,
      borderColor: '#000000',
      borderWidth: 2,
    });
  };

  const createCustomToken = () => {
    if (!customName.trim()) return;

    const template = {
      name: customName,
      size: customSize,
      color: customColor,
      shape: customShape,
      category: 'player' as const,
      showLabel: true,
      labelPosition: 'bottom' as const,
      opacity: 1,
      borderColor: '#000000',
      borderWidth: 2,
    };

    useToolStore.getState().setTool('token');
    useToolStore.getState().setTokenTemplate(template);

    // Reset form
    setCustomName('');
    setCustomSize('medium');
    setCustomColor('#FF0000');
    setCustomShape('circle');
  };

  if (currentTool !== 'token') return null;

  return (
    <div className="bg-gray-900 border-l border-gray-800 p-4 h-full overflow-y-auto">
      <h3 className="text-lg font-bold text-d20-gold mb-4">Token Library</h3>

      {/* Category Filter */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {(['all', 'player', 'enemy', 'npc', 'object'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-d20-red text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Token Grid */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {filteredTokens.map((token, index) => (
          <button
            key={index}
            onClick={() => handleTokenClick(token)}
            className="bg-gray-800 hover:bg-gray-700 p-3 rounded-lg transition-colors group"
            title={`${token.name} (${SIZE_LABELS[token.size]})`}
          >
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 ${token.shape === 'square' ? 'rounded' : 'rounded-full'} mb-2 border-2 border-black group-hover:border-d20-gold transition-colors`}
                style={{ backgroundColor: token.color }}
              />
              <span className="text-xs text-gray-300 text-center">{token.name}</span>
              <span className="text-xs text-gray-500">{token.size}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Custom Token Creator */}
      <div className="border-t border-gray-800 pt-4">
        <h4 className="text-sm font-bold text-d20-gold mb-3">Create Custom Token</h4>

        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Name</label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Token name"
              className="w-full px-2 py-1 bg-gray-800 text-white rounded text-sm focus:outline-none focus:ring-1 focus:ring-d20-gold"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Size</label>
            <select
              value={customSize}
              onChange={(e) => setCustomSize(e.target.value as TokenSize)}
              className="w-full px-2 py-1 bg-gray-800 text-white rounded text-sm focus:outline-none focus:ring-1 focus:ring-d20-gold"
            >
              {Object.entries(SIZE_LABELS).map(([size, label]) => (
                <option key={size} value={size}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                className="h-8 w-16 bg-gray-800 rounded cursor-pointer"
              />
              <input
                type="text"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                className="flex-1 px-2 py-1 bg-gray-800 text-white rounded text-sm focus:outline-none focus:ring-1 focus:ring-d20-gold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Shape</label>
            <div className="flex gap-2">
              <button
                onClick={() => setCustomShape('circle')}
                className={`flex-1 px-3 py-1 rounded text-sm ${
                  customShape === 'circle'
                    ? 'bg-d20-red text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Circle
              </button>
              <button
                onClick={() => setCustomShape('square')}
                className={`flex-1 px-3 py-1 rounded text-sm ${
                  customShape === 'square'
                    ? 'bg-d20-red text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Square
              </button>
            </div>
          </div>

          <button
            onClick={createCustomToken}
            disabled={!customName.trim()}
            className="w-full py-2 bg-d20-red text-white rounded text-sm font-medium hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Create Token
          </button>
        </div>
      </div>
    </div>
  );
};