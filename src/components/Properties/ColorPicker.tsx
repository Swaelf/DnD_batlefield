import React, { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Pipette } from 'lucide-react';

type ColorPickerProps = {
  color: string
  onChange: (color: string) => void
  label?: string
}

// Preset colors for quick selection
const PRESET_COLORS = [
  '#000000', // Black
  '#FFFFFF', // White
  '#922610', // D&D Red
  '#C9AD6A', // D&D Gold
  '#1E40AF', // Blue
  '#16A34A', // Green
  '#DC2626', // Red
  '#F59E0B', // Amber
  '#7C3AED', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#6B7280', // Gray
];

export const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempColor, setTempColor] = useState(color);

  const handleColorChange = (newColor: string) => {
    setTempColor(newColor);
    onChange(newColor);
  };

  const handlePresetClick = (presetColor: string) => {
    setTempColor(presetColor);
    onChange(presetColor);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {label && (
        <label className="block text-xs text-gray-400 mb-1">{label}</label>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-sm transition-colors"
        >
          <div
            className="w-6 h-6 rounded border-2 border-gray-600"
            style={{ backgroundColor: color }}
          />
          <span className="text-white font-mono text-xs">{color.toUpperCase()}</span>
          <Pipette className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Color picker popup */}
          <div className="absolute top-full left-0 mt-2 p-4 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50">
            {/* Main color picker */}
            <div className="mb-3">
              <HexColorPicker color={tempColor} onChange={handleColorChange} />
            </div>

            {/* Preset colors */}
            <div className="mb-3">
              <p className="text-xs text-gray-400 mb-2">Quick Colors</p>
              <div className="grid grid-cols-6 gap-1">
                {PRESET_COLORS.map((presetColor) => (
                  <button
                    key={presetColor}
                    onClick={() => handlePresetClick(presetColor)}
                    className={`w-8 h-8 rounded border-2 transition-all hover:scale-110 ${
                      color === presetColor
                        ? 'border-d20-gold'
                        : 'border-gray-600 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: presetColor }}
                    title={presetColor}
                  />
                ))}
              </div>
            </div>

            {/* Hex input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={tempColor}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = e.target.value;
                  if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                    setTempColor(value);
                    if (value.length === 7) {
                      onChange(value);
                    }
                  }
                }}
                placeholder="#000000"
                className="flex-1 px-2 py-1 bg-gray-700 text-white rounded text-sm font-mono focus:outline-none focus:ring-1 focus:ring-d20-gold"
              />
              <button
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 bg-d20-red hover:bg-red-800 text-white rounded text-sm font-medium transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};