import React, { useState, useEffect } from 'react';
import useMapStore from '@/store/mapStore';
import { Shape } from '@/types/map';
import { Token } from '@/types/token';
import { ColorPicker } from './ColorPicker';
import { LayerControls } from './LayerControls';
import { Trash2, Eye, EyeOff, Copy } from 'lucide-react';
import { nanoid } from 'nanoid';

export const PropertiesPanel: React.FC = () => {
  const { selectedObjects, currentMap, updateObject, deleteSelected, addObject } = useMapStore();

  // Get selected object
  const selectedObject = selectedObjects.length === 1
    ? currentMap?.objects.find(obj => obj.id === selectedObjects[0])
    : null;

  const [localPosition, setLocalPosition] = useState({ x: 0, y: 0 });
  const [localRotation, setLocalRotation] = useState(0);
  const [localOpacity, setLocalOpacity] = useState(1);
  const [isVisible, setIsVisible] = useState(true);

  // Update local state when selection changes
  useEffect(() => {
    if (selectedObject) {
      setLocalPosition(selectedObject.position);
      setLocalRotation(selectedObject.rotation || 0);
      setLocalOpacity(selectedObject.opacity || 1);
      setIsVisible(selectedObject.visible !== false);
    }
  }, [selectedObject]);

  const handlePositionChange = (axis: 'x' | 'y', value: number) => {
    if (!selectedObject) return;
    const newPosition = { ...localPosition, [axis]: value };
    setLocalPosition(newPosition);
    updateObject(selectedObject.id, { position: newPosition });
  };

  const handleRotationChange = (value: number) => {
    if (!selectedObject) return;
    setLocalRotation(value);
    updateObject(selectedObject.id, { rotation: value });
  };

  const handleOpacityChange = (value: number) => {
    if (!selectedObject) return;
    setLocalOpacity(value);
    updateObject(selectedObject.id, { opacity: value });
  };

  const handleVisibilityToggle = () => {
    if (!selectedObject) return;
    const newVisible = !isVisible;
    setIsVisible(newVisible);
    updateObject(selectedObject.id, { visible: newVisible });
  };

  const handleColorChange = (property: 'fill' | 'stroke' | 'color', color: string) => {
    if (!selectedObject) return;
    updateObject(selectedObject.id, { [property]: color });
  };

  const handleDuplicate = () => {
    if (!selectedObject) return;
    const newObject = {
      ...selectedObject,
      id: nanoid(),
      position: {
        x: selectedObject.position.x + 20,
        y: selectedObject.position.y + 20,
      }
    };
    addObject(newObject);
  };

  const renderShapeProperties = (shape: Shape) => (
    <>
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Fill Color</label>
          <ColorPicker
            color={shape.fill}
            onChange={(color) => handleColorChange('fill', color)}
          />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Stroke Color</label>
          <ColorPicker
            color={shape.stroke}
            onChange={(color) => handleColorChange('stroke', color)}
          />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Stroke Width</label>
          <input
            type="number"
            value={shape.strokeWidth}
            onChange={(e) => updateObject(selectedObject!.id, { strokeWidth: Number(e.target.value) } as Partial<Shape>)}
            min="0"
            max="20"
            className="w-full px-2 py-1 bg-gray-800 text-white rounded text-sm focus:outline-none focus:ring-1 focus:ring-d20-gold"
          />
        </div>

        {(shape.shapeType === 'rect' || shape.shapeType === 'rectangle') && (
          <>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Width</label>
              <input
                type="number"
                value={shape.width}
                onChange={(e) => updateObject(selectedObject!.id, { width: Number(e.target.value) } as Partial<Shape>)}
                className="w-full px-2 py-1 bg-gray-800 text-white rounded text-sm focus:outline-none focus:ring-1 focus:ring-d20-gold"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Height</label>
              <input
                type="number"
                value={shape.height}
                onChange={(e) => updateObject(selectedObject!.id, { height: Number(e.target.value) } as Partial<Shape>)}
                className="w-full px-2 py-1 bg-gray-800 text-white rounded text-sm focus:outline-none focus:ring-1 focus:ring-d20-gold"
              />
            </div>
          </>
        )}

        {shape.shapeType === 'circle' && (
          <div>
            <label className="block text-xs text-gray-400 mb-1">Radius</label>
            <input
              type="number"
              value={shape.radius}
              onChange={(e) => updateObject(selectedObject!.id, { radius: Number(e.target.value) } as Partial<Shape>)}
              className="w-full px-2 py-1 bg-gray-800 text-white rounded text-sm focus:outline-none focus:ring-1 focus:ring-d20-gold"
            />
          </div>
        )}
      </div>
    </>
  );

  const renderTokenProperties = (token: Token) => (
    <>
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Name</label>
          <input
            type="text"
            value={token.name || ''}
            onChange={(e) => updateObject(selectedObject!.id, { name: e.target.value })}
            placeholder="Token name"
            className="w-full px-2 py-1 bg-gray-800 text-white rounded text-sm focus:outline-none focus:ring-1 focus:ring-d20-gold"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Size</label>
          <select
            value={token.size}
            onChange={(e) => updateObject(selectedObject!.id, { size: e.target.value as Token['size'] } as Partial<Token>)}
            className="w-full px-2 py-1 bg-gray-800 text-white rounded text-sm focus:outline-none focus:ring-1 focus:ring-d20-gold"
          >
            <option value="tiny">Tiny (2.5ft)</option>
            <option value="small">Small (5ft)</option>
            <option value="medium">Medium (5ft)</option>
            <option value="large">Large (10ft)</option>
            <option value="huge">Huge (15ft)</option>
            <option value="gargantuan">Gargantuan (20ft+)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Color</label>
          <ColorPicker
            color={token.color}
            onChange={(color) => handleColorChange('color', color)}
          />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Shape</label>
          <div className="flex gap-2">
            <button
              onClick={() => updateObject(selectedObject!.id, { shape: 'circle' } as Partial<Token>)}
              className={`flex-1 px-3 py-1 rounded text-sm ${
                token.shape === 'circle'
                  ? 'bg-d20-red text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Circle
            </button>
            <button
              onClick={() => updateObject(selectedObject!.id, { shape: 'square' } as Partial<Token>)}
              className={`flex-1 px-3 py-1 rounded text-sm ${
                token.shape === 'square'
                  ? 'bg-d20-red text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Square
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="showLabel"
            checked={token.showLabel || false}
            onChange={(e) => updateObject(selectedObject!.id, { showLabel: e.target.checked } as Partial<Token>)}
            className="w-4 h-4 bg-gray-800 border-gray-600 rounded focus:ring-d20-gold"
          />
          <label htmlFor="showLabel" className="text-sm text-gray-300">Show Label</label>
        </div>

        {token.showLabel && (
          <div>
            <label className="block text-xs text-gray-400 mb-1">Label Position</label>
            <select
              value={token.labelPosition || 'bottom'}
              onChange={(e) => updateObject(selectedObject!.id, { labelPosition: e.target.value as Token['labelPosition'] } as Partial<Token>)}
              className="w-full px-2 py-1 bg-gray-800 text-white rounded text-sm focus:outline-none focus:ring-1 focus:ring-d20-gold"
            >
              <option value="top">Top</option>
              <option value="bottom">Bottom</option>
            </select>
          </div>
        )}
      </div>
    </>
  );

  if (selectedObjects.length === 0) {
    return (
      <div className="w-80 bg-gray-900 border-l border-gray-800 p-4 overflow-y-auto">
        <h3 className="text-lg font-bold text-d20-gold mb-4">Properties</h3>
        <p className="text-sm text-gray-400">Select an object to edit its properties</p>
      </div>
    );
  }

  if (selectedObjects.length > 1) {
    return (
      <div className="w-80 bg-gray-900 border-l border-gray-800 p-4 overflow-y-auto">
        <h3 className="text-lg font-bold text-d20-gold mb-4">Multiple Selection</h3>
        <p className="text-sm text-gray-300 mb-4">{selectedObjects.length} objects selected</p>

        <div className="space-y-2">
          <button
            onClick={deleteSelected}
            className="w-full px-3 py-2 bg-red-900 hover:bg-red-800 text-white rounded text-sm font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Delete Selected
          </button>
        </div>
      </div>
    );
  }

  if (!selectedObject) return null;

  return (
    <div className="w-80 bg-gray-900 border-l border-gray-800 p-4 overflow-y-auto">
      <h3 className="text-lg font-bold text-d20-gold mb-4">Properties</h3>

      {/* Object Type */}
      <div className="mb-4">
        <span className="text-xs text-gray-400">Type:</span>
        <span className="ml-2 text-sm text-white capitalize">{selectedObject.type}</span>
      </div>

      {/* Position */}
      <div className="space-y-3 mb-6">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-400 mb-1">X Position</label>
            <input
              type="number"
              value={Math.round(localPosition.x)}
              onChange={(e) => handlePositionChange('x', Number(e.target.value))}
              className="w-full px-2 py-1 bg-gray-800 text-white rounded text-sm focus:outline-none focus:ring-1 focus:ring-d20-gold"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Y Position</label>
            <input
              type="number"
              value={Math.round(localPosition.y)}
              onChange={(e) => handlePositionChange('y', Number(e.target.value))}
              className="w-full px-2 py-1 bg-gray-800 text-white rounded text-sm focus:outline-none focus:ring-1 focus:ring-d20-gold"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Rotation</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              value={localRotation}
              onChange={(e) => handleRotationChange(Number(e.target.value))}
              min="0"
              max="360"
              className="flex-1"
            />
            <span className="text-sm text-white w-10">{localRotation}°</span>
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Opacity</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              value={localOpacity}
              onChange={(e) => handleOpacityChange(Number(e.target.value))}
              min="0"
              max="1"
              step="0.1"
              className="flex-1"
            />
            <span className="text-sm text-white w-10">{Math.round(localOpacity * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Type-specific properties */}
      <div className="border-t border-gray-800 pt-4 mb-6">
        {selectedObject.type === 'shape' && renderShapeProperties(selectedObject as Shape)}
        {selectedObject.type === 'token' && renderTokenProperties(selectedObject as Token)}
      </div>

      {/* Layer Controls */}
      <div className="border-t border-gray-800 pt-4 mb-6">
        <LayerControls selectedObject={selectedObject} />
      </div>

      {/* Actions */}
      <div className="space-y-2 border-t border-gray-800 pt-4">
        <button
          onClick={handleVisibilityToggle}
          className="w-full px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded text-sm font-medium flex items-center justify-center gap-2 transition-colors"
        >
          {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {isVisible ? 'Hide' : 'Show'}
        </button>

        <button
          onClick={handleDuplicate}
          className="w-full px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded text-sm font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <Copy className="h-4 w-4" />
          Duplicate
        </button>

        <button
          onClick={deleteSelected}
          className="w-full px-3 py-2 bg-red-900 hover:bg-red-800 text-white rounded text-sm font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      </div>
    </div>
  );
};