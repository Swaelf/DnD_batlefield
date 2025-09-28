import React, { useState, useCallback, useMemo } from 'react'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Button } from '@/components/primitives/ButtonVE'
import {
  Droplets,
  Sun,
  Moon,
  Sparkles,
  Zap,
  Wind,
  Snowflake,
  Flame,
  Waves,
  RotateCcw,
  Settings,
  Trash2
} from 'lucide-react'
import type { LayerEffect } from '@/store/layerStore'
import { useLayerStore } from '@/store/layerStore'

type BlendMode = 'normal' | 'multiply' | 'screen' | 'overlay' | 'soft-light' | 'hard-light' | 'color-dodge' | 'color-burn'

interface EffectTemplate {
  id: string
  name: string
  icon: React.ReactNode
  color: string
  defaultSettings: Record<string, any>
}

interface LayerEffectsManagerProps {
  layerId: string
  onEffectChange?: (layerId: string, effects: LayerEffect[]) => void
}

export const LayerEffectsManager: React.FC<LayerEffectsManagerProps> = ({
  layerId,
  onEffectChange
}) => {
  const [selectedEffect, setSelectedEffect] = useState<string | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const { layers, updateLayer } = useLayerStore()
  const layer = layers.find(l => l.id === layerId)

  const availableEffects: EffectTemplate[] = useMemo(() => [
    {
      id: 'drop-shadow',
      name: 'Drop Shadow',
      icon: <Droplets size={16} />,
      color: '#1F2937',
      defaultSettings: {
        offsetX: 4,
        offsetY: 4,
        blur: 8,
        color: '#000000',
        opacity: 0.5
      }
    },
    {
      id: 'inner-shadow',
      name: 'Inner Shadow',
      icon: <Moon size={16} />,
      color: '#4B5563',
      defaultSettings: {
        offsetX: 2,
        offsetY: 2,
        blur: 6,
        color: '#000000',
        opacity: 0.3
      }
    },
    {
      id: 'glow',
      name: 'Glow',
      icon: <Sun size={16} />,
      color: '#FBBF24',
      defaultSettings: {
        blur: 10,
        color: '#FBBF24',
        opacity: 0.8,
        spread: 2
      }
    },
    {
      id: 'blur',
      name: 'Blur',
      icon: <Wind size={16} />,
      color: '#60A5FA',
      defaultSettings: {
        amount: 5,
        quality: 1
      }
    },
    {
      id: 'sharpen',
      name: 'Sharpen',
      icon: <Zap size={16} />,
      color: '#F87171',
      defaultSettings: {
        amount: 0.5,
        radius: 1
      }
    },
    {
      id: 'noise',
      name: 'Noise',
      icon: <Sparkles size={16} />,
      color: '#A78BFA',
      defaultSettings: {
        amount: 0.2,
        size: 1,
        monochrome: false
      }
    },
    {
      id: 'frost',
      name: 'Frost',
      icon: <Snowflake size={16} />,
      color: '#93C5FD',
      defaultSettings: {
        intensity: 0.5,
        pattern: 'crystalline',
        opacity: 0.7
      }
    },
    {
      id: 'fire',
      name: 'Fire',
      icon: <Flame size={16} />,
      color: '#FB923C',
      defaultSettings: {
        intensity: 0.6,
        flicker: true,
        heat: 0.8
      }
    },
    {
      id: 'water',
      name: 'Water',
      icon: <Waves size={16} />,
      color: '#06B6D4',
      defaultSettings: {
        ripple: 0.3,
        flow: 0.5,
        transparency: 0.6
      }
    }
  ], [])

  const blendModes: { value: BlendMode; label: string }[] = useMemo(() => [
    { value: 'normal', label: 'Normal' },
    { value: 'multiply', label: 'Multiply' },
    { value: 'screen', label: 'Screen' },
    { value: 'overlay', label: 'Overlay' },
    { value: 'soft-light', label: 'Soft Light' },
    { value: 'hard-light', label: 'Hard Light' },
    { value: 'color-dodge', label: 'Color Dodge' },
    { value: 'color-burn', label: 'Color Burn' }
  ], [])

  // Add effect to layer
  const addEffect = useCallback((effectTemplate: EffectTemplate) => {
    if (!layer) return

    const newEffect: LayerEffect = {
      id: crypto.randomUUID(),
      type: effectTemplate.id,
      enabled: true,
      settings: effectTemplate.defaultSettings
    }

    const updatedEffects = [...(layer.effects || []), newEffect]
    updateLayer(layerId, { effects: updatedEffects })
    onEffectChange?.(layerId, updatedEffects)
    setSelectedEffect(newEffect.id)
  }, [layer, layerId, updateLayer, onEffectChange])

  // Remove effect from layer
  const removeEffect = useCallback((effectId: string) => {
    if (!layer) return

    const updatedEffects = (layer.effects || []).filter(effect => effect.id !== effectId)
    updateLayer(layerId, { effects: updatedEffects })
    onEffectChange?.(layerId, updatedEffects)

    if (selectedEffect === effectId) {
      setSelectedEffect(null)
    }
  }, [layer, layerId, updateLayer, onEffectChange, selectedEffect])

  // Update effect setting
  const updateEffectSetting = useCallback((effectId: string, setting: string, value: any) => {
    if (!layer) return

    const updatedEffects = (layer.effects || []).map(effect =>
      effect.id === effectId
        ? { ...effect, settings: { ...effect.settings, [setting]: value } }
        : effect
    )

    updateLayer(layerId, { effects: updatedEffects })
    onEffectChange?.(layerId, updatedEffects)
  }, [layer, layerId, updateLayer, onEffectChange])

  // Toggle effect enabled state
  const toggleEffect = useCallback((effectId: string) => {
    if (!layer) return

    const updatedEffects = (layer.effects || []).map(effect =>
      effect.id === effectId
        ? { ...effect, enabled: !effect.enabled }
        : effect
    )

    updateLayer(layerId, { effects: updatedEffects })
    onEffectChange?.(layerId, updatedEffects)
  }, [layer, layerId, updateLayer, onEffectChange])

  // Reset all effects
  const resetEffects = useCallback(() => {
    updateLayer(layerId, { effects: [] })
    onEffectChange?.(layerId, [])
    setSelectedEffect(null)
  }, [layerId, updateLayer, onEffectChange])

  // Render effect settings based on type
  const renderEffectSettings = useCallback((effect: LayerEffect) => {
    const template = availableEffects.find(t => t.id === effect.type)
    if (!template) return null

    return (
      <Box style={{ padding: '12px', borderTop: '1px solid var(--colors-gray700)' }}>
        <Text variant="body" size="sm" style={{ marginBottom: '12px', fontWeight: '500' }}>
          {template.name} Settings
        </Text>

        {/* Common settings for all effects */}
        <Box style={{ marginBottom: '12px' }}>
          <Text variant="body" size="xs" style={{ marginBottom: '4px' }}>
            Layer Opacity: {Math.round((layer?.opacity ?? 1) * 100)}%
          </Text>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={layer?.opacity ?? 1}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateLayer(layerId, { opacity: Number(e.target.value) })
            }
            style={{
              width: '100%',
              accentColor: template.color
            }}
          />
        </Box>

        <Box style={{ marginBottom: '12px' }}>
          <Text variant="body" size="xs" style={{ marginBottom: '4px' }}>
            Blend Mode
          </Text>
          <select
            value={layer?.blendMode || 'normal'}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              updateLayer(layerId, { blendMode: e.target.value as BlendMode })
            }
            style={{
              width: '100%',
              padding: '4px',
              backgroundColor: 'var(--colors-gray800)',
              color: 'var(--colors-gray200)',
              border: '1px solid var(--colors-gray600)',
              borderRadius: '4px'
            }}
          >
            {blendModes.map(mode => (
              <option key={mode.value} value={mode.value}>
                {mode.label}
              </option>
            ))}
          </select>
        </Box>

        {/* Effect-specific settings */}
        {effect.type === 'drop-shadow' && (
          <>
            <Box style={{ marginBottom: '8px' }}>
              <Text variant="body" size="xs">Offset X: {effect.settings.offsetX || 4}</Text>
              <input
                type="range"
                min="-20"
                max="20"
                value={effect.settings.offsetX || 4}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  updateEffectSetting(effect.id, 'offsetX', Number(e.target.value))
                }
                style={{ width: '100%', accentColor: template.color }}
              />
            </Box>
            <Box style={{ marginBottom: '8px' }}>
              <Text variant="body" size="xs">Offset Y: {effect.settings.offsetY || 4}</Text>
              <input
                type="range"
                min="-20"
                max="20"
                value={effect.settings.offsetY || 4}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  updateEffectSetting(effect.id, 'offsetY', Number(e.target.value))
                }
                style={{ width: '100%', accentColor: template.color }}
              />
            </Box>
            <Box style={{ marginBottom: '8px' }}>
              <Text variant="body" size="xs">Blur: {effect.settings.blur || 8}</Text>
              <input
                type="range"
                min="0"
                max="50"
                value={effect.settings.blur || 8}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  updateEffectSetting(effect.id, 'blur', Number(e.target.value))
                }
                style={{ width: '100%', accentColor: template.color }}
              />
            </Box>
          </>
        )}

        {effect.type === 'glow' && (
          <>
            <Box style={{ marginBottom: '8px' }}>
              <Text variant="body" size="xs">Blur: {effect.settings.blur || 10}</Text>
              <input
                type="range"
                min="0"
                max="50"
                value={effect.settings.blur || 10}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  updateEffectSetting(effect.id, 'blur', Number(e.target.value))
                }
                style={{ width: '100%', accentColor: template.color }}
              />
            </Box>
            <Box style={{ marginBottom: '8px' }}>
              <Text variant="body" size="xs">Spread: {effect.settings.spread || 2}</Text>
              <input
                type="range"
                min="0"
                max="20"
                value={effect.settings.spread || 2}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  updateEffectSetting(effect.id, 'spread', Number(e.target.value))
                }
                style={{ width: '100%', accentColor: template.color }}
              />
            </Box>
          </>
        )}

        {effect.type === 'blur' && (
          <Box style={{ marginBottom: '8px' }}>
            <Text variant="body" size="xs">Amount: {effect.settings.amount || 5}</Text>
            <input
              type="range"
              min="0"
              max="50"
              value={effect.settings.amount || 5}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updateEffectSetting(effect.id, 'amount', Number(e.target.value))
              }
              style={{ width: '100%', accentColor: template.color }}
            />
          </Box>
        )}

        {effect.type === 'noise' && (
          <>
            <Box style={{ marginBottom: '8px' }}>
              <Text variant="body" size="xs">Amount: {Math.round((effect.settings.amount || 0.2) * 100)}%</Text>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={effect.settings.amount || 0.2}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  updateEffectSetting(effect.id, 'amount', Number(e.target.value))
                }
                style={{ width: '100%', accentColor: template.color }}
              />
            </Box>
            <Box style={{ marginBottom: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                <input
                  type="checkbox"
                  checked={effect.settings.monochrome || false}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    updateEffectSetting(effect.id, 'monochrome', e.target.checked)
                  }
                />
                Monochrome
              </label>
            </Box>
          </>
        )}
      </Box>
    )
  }, [availableEffects, blendModes, updateEffectSetting, updateLayer, layerId])

  if (!layer) return null

  const activeEffects = layer.effects || []

  return (
    <Box
      style={{
        width: '100%',
        backgroundColor: 'var(--colors-gray900)',
        border: '1px solid var(--colors-gray700)',
        borderRadius: '8px'
      }}
    >
      {/* Header */}
      <Box
        style={{
          padding: '12px',
          borderBottom: '1px solid var(--colors-gray700)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Text variant="heading" size="sm" style={{ fontWeight: '600' }}>
          Layer Effects
        </Text>
        <Box style={{ display: 'flex', gap: '8px' }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Settings size={14} />
          </Button>
          {activeEffects.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetEffects}
            >
              <RotateCcw size={14} />
            </Button>
          )}
        </Box>
      </Box>

      {/* Effect Grid */}
      <Box style={{ padding: '12px' }}>
        <Text variant="body" size="xs" style={{ marginBottom: '8px', color: 'var(--colors-gray400)' }}>
          Available Effects
        </Text>

        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            marginBottom: '16px'
          }}
        >
          {availableEffects.map(effect => (
            <Button
              key={effect.id}
              variant="outline"
              size="sm"
              onClick={() => addEffect(effect)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                padding: '8px 4px',
                height: 'auto',
                fontSize: '10px'
              }}
            >
              <Box style={{ color: effect.color }}>
                {effect.icon}
              </Box>
              {effect.name}
            </Button>
          ))}
        </Box>

        {/* Active Effects */}
        {activeEffects.length > 0 && (
          <>
            <Text variant="body" size="xs" style={{ marginBottom: '8px', color: 'var(--colors-gray400)' }}>
              Active Effects ({activeEffects.length})
            </Text>

            {activeEffects.map(effect => {
              const template = availableEffects.find(t => t.id === effect.type)
              if (!template) return null

              return (
                <Box
                  key={effect.id}
                  style={{
                    backgroundColor: selectedEffect === effect.id ? 'var(--colors-gray800)' : 'var(--colors-gray850)',
                    border: '1px solid var(--colors-gray700)',
                    borderRadius: '6px',
                    marginBottom: '8px'
                  }}
                >
                  {/* Effect Header */}
                  <Box
                    style={{
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer'
                    }}
                    onClick={() => setSelectedEffect(selectedEffect === effect.id ? null : effect.id)}
                  >
                    <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Box style={{ color: template.color }}>
                        {template.icon}
                      </Box>
                      <Text variant="body" size="sm">
                        {template.name}
                      </Text>
                    </Box>

                    <Box style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation()
                          toggleEffect(effect.id)
                        }}
                        style={{
                          padding: '2px',
                          opacity: effect.enabled ? 1 : 0.5
                        }}
                      >
                        {effect.enabled ? '👁️' : '🙈'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation()
                          removeEffect(effect.id)
                        }}
                        style={{ padding: '2px' }}
                      >
                        <Trash2 size={12} />
                      </Button>
                    </Box>
                  </Box>

                  {/* Effect Settings */}
                  {selectedEffect === effect.id && renderEffectSettings(effect)}
                </Box>
              )
            })}
          </>
        )}

        {/* Advanced Settings */}
        {showAdvanced && (
          <Box
            style={{
              marginTop: '16px',
              padding: '12px',
              backgroundColor: 'var(--colors-gray800)',
              borderRadius: '6px'
            }}
          >
            <Text variant="body" size="sm" style={{ marginBottom: '8px', fontWeight: '500' }}>
              Advanced Settings
            </Text>

            <Text variant="body" size="xs" style={{ color: 'var(--colors-gray400)' }}>
              • Effects are applied in order from top to bottom
              • Use blend modes to change how effects interact
              • Disable effects temporarily with the eye icon
              • Reset all effects with the refresh button
            </Text>
          </Box>
        )}

        {/* Status */}
        <Box
          style={{
            marginTop: '12px',
            padding: '8px',
            backgroundColor: 'var(--colors-gray800)',
            borderRadius: '4px'
          }}
        >
          <Text variant="body" size="xs" style={{ color: 'var(--colors-gray300)' }}>
            Layer: {layer.name} • Effects: {activeEffects.filter(e => e.enabled).length}/{activeEffects.length}
          </Text>
        </Box>
      </Box>
    </Box>
  )
}

export default LayerEffectsManager