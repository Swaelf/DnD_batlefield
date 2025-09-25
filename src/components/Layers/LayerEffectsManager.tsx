import React, { useState, useCallback, useMemo } from 'react'
import { Box, Text, Button } from '@/components/ui'
import { styled } from '@/styles/theme.config'
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
  Eye,
  Palette,
  Sliders,
  RotateCcw,
  Settings
} from 'lucide-react'
import { useLayerStore, LayerDefinition, LayerEffect } from '@store/layerStore'
import useMapStore from '@store/mapStore'

const EffectsContainer = styled(Box, {
  padding: '$4',
  backgroundColor: '$gray900',
  borderRadius: '$sm',
  border: '1px solid $gray700'
})

const EffectsGrid = styled(Box, {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '$2',
  marginBottom: '$4'
})

const EffectButton = styled(Button, {
  height: 60,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '$1',
  padding: '$2',

  variants: {
    active: {
      true: {
        backgroundColor: '$secondary',
        color: '$dndBlack',
        '&:hover': {
          backgroundColor: '$secondary'
        }
      }
    }
  }
})

const SliderContainer = styled(Box, {
  display: 'flex',
  alignItems: 'center',
  gap: '$3',
  marginBottom: '$3'
})

const Slider = styled('input', {
  flex: 1,
  height: 4,
  borderRadius: 2,
  background: '$gray700',
  outline: 'none',
  appearance: 'none',

  '&::-webkit-slider-thumb': {
    appearance: 'none',
    width: 16,
    height: 16,
    borderRadius: '50%',
    background: '$secondary',
    cursor: 'pointer'
  },

  '&::-moz-range-thumb': {
    width: 16,
    height: 16,
    borderRadius: '50%',
    background: '$secondary',
    cursor: 'pointer',
    border: 'none'
  }
})

const BlendModeSelect = styled('select', {
  width: '100%',
  padding: '$2',
  backgroundColor: '$gray800',
  border: '1px solid $gray600',
  borderRadius: '$sm',
  color: '$gray100',
  fontSize: '$sm',

  '&:focus': {
    outline: 'none',
    borderColor: '$secondary'
  }
})

type BlendMode = 'normal' | 'multiply' | 'screen' | 'overlay' | 'soft-light' | 'hard-light' | 'color-dodge' | 'color-burn'

interface LayerEffectsManagerProps {
  layerId: string
  onEffectChange?: (layerId: string, effects: LayerEffect[]) => void
}

export const LayerEffectsManager: React.FC<LayerEffectsManagerProps> = ({
  layerId,
  onEffectChange
}) => {
  const [selectedEffect, setSelectedEffect] = useState<string | null>(null)

  const { layers, updateLayer } = useLayerStore()
  const layer = layers.find(l => l.id === layerId)

  const availableEffects = [
    { id: 'drop-shadow', name: 'Drop Shadow', icon: <Droplets size={16} />, color: '#1F2937' },
    { id: 'inner-shadow', name: 'Inner Shadow', icon: <Moon size={16} />, color: '#4B5563' },
    { id: 'glow', name: 'Glow', icon: <Sun size={16} />, color: '#FBBF24' },
    { id: 'blur', name: 'Blur', icon: <Wind size={16} />, color: '#60A5FA' },
    { id: 'sharpen', name: 'Sharpen', icon: <Zap size={16} />, color: '#F87171' },
    { id: 'noise', name: 'Noise', icon: <Sparkles size={16} />, color: '#A78BFA' },
    { id: 'frost', name: 'Frost', icon: <Snowflake size={16} />, color: '#93C5FD' },
    { id: 'fire', name: 'Fire', icon: <Flame size={16} />, color: '#FB923C' },
    { id: 'water', name: 'Water', icon: <Waves size={16} />, color: '#06B6D4' }
  ]

  const blendModes: { value: BlendMode; label: string }[] = [
    { value: 'normal', label: 'Normal' },
    { value: 'multiply', label: 'Multiply' },
    { value: 'screen', label: 'Screen' },
    { value: 'overlay', label: 'Overlay' },
    { value: 'soft-light', label: 'Soft Light' },
    { value: 'hard-light', label: 'Hard Light' },
    { value: 'color-dodge', label: 'Color Dodge' },
    { value: 'color-burn', label: 'Color Burn' }
  ]

  // Get current layer effects
  const layerEffects = useMemo(() => {
    return layer?.effects || []
  }, [layer])

  // Check if an effect is active
  const isEffectActive = useCallback((effectId: string): boolean => {
    return layerEffects.some(effect => effect.type === effectId && effect.enabled)
  }, [layerEffects])

  // Get effect settings
  const getEffectSettings = useCallback((effectId: string) => {
    const effect = layerEffects.find(e => e.type === effectId)
    return effect?.settings || {}
  }, [layerEffects])

  // Toggle effect
  const toggleEffect = useCallback((effectId: string) => {
    if (!layer) return

    const existingEffects = layer.effects || []
    const existingIndex = existingEffects.findIndex(e => e.type === effectId)

    let newEffects: LayerEffect[]

    if (existingIndex >= 0) {
      // Toggle existing effect
      newEffects = existingEffects.map((effect, index) =>
        index === existingIndex ? { ...effect, enabled: !effect.enabled } : effect
      )
    } else {
      // Add new effect with default settings
      const defaultSettings = getDefaultEffectSettings(effectId)
      newEffects = [
        ...existingEffects,
        {
          id: crypto.randomUUID(),
          type: effectId,
          enabled: true,
          settings: defaultSettings
        }
      ]
    }

    updateLayer(layerId, { effects: newEffects })
    onEffectChange?.(layerId, newEffects)
  }, [layer, layerId, updateLayer, onEffectChange])

  // Update effect setting
  const updateEffectSetting = useCallback((effectId: string, setting: string, value: any) => {
    if (!layer) return

    const existingEffects = layer.effects || []
    const effectIndex = existingEffects.findIndex(e => e.type === effectId)

    if (effectIndex >= 0) {
      const newEffects = existingEffects.map((effect, index) =>
        index === effectIndex
          ? {
              ...effect,
              settings: {
                ...effect.settings,
                [setting]: value
              }
            }
          : effect
      )

      updateLayer(layerId, { effects: newEffects })
      onEffectChange?.(layerId, newEffects)
    }
  }, [layer, layerId, updateLayer, onEffectChange])

  // Update blend mode
  const updateBlendMode = useCallback((blendMode: BlendMode) => {
    updateLayer(layerId, { blendMode })
  }, [layerId, updateLayer])

  // Clear all effects
  const clearAllEffects = useCallback(() => {
    updateLayer(layerId, { effects: [] })
    onEffectChange?.(layerId, [])
    setSelectedEffect(null)
  }, [layerId, updateLayer, onEffectChange])

  if (!layer) {
    return null
  }

  return (
    <EffectsContainer>
      <Box display="flex" alignItems="center" justifyContent="space-between" marginBottom="$4">
        <Text size="sm" weight="semibold" color="secondary">
          Layer Effects
        </Text>
        <Box display="flex" gap="$2">
          <Button onClick={clearAllEffects} title="Clear All Effects">
            <RotateCcw size={12} />
          </Button>
          <Button title="Effect Settings">
            <Settings size={12} />
          </Button>
        </Box>
      </Box>

      {/* Blend Mode */}
      <Box marginBottom="$4">
        <Text size="xs" color="gray400" marginBottom="$2">
          Blend Mode:
        </Text>
        <BlendModeSelect
          value={layer.blendMode || 'normal'}
          onChange={(e) => updateBlendMode(e.target.value as BlendMode)}
        >
          {blendModes.map(mode => (
            <option key={mode.value} value={mode.value}>
              {mode.label}
            </option>
          ))}
        </BlendModeSelect>
      </Box>

      {/* Effect Buttons */}
      <EffectsGrid>
        {availableEffects.map(effect => (
          <EffectButton
            key={effect.id}
            active={isEffectActive(effect.id)}
            onClick={() => toggleEffect(effect.id)}
            title={effect.name}
          >
            <Box style={{ color: effect.color }}>
              {effect.icon}
            </Box>
            <Text size="xs">{effect.name.split(' ')[0]}</Text>
          </EffectButton>
        ))}
      </EffectsGrid>

      {/* Active Effect Settings */}
      {layerEffects
        .filter(effect => effect.enabled)
        .map(effect => (
          <Box key={effect.id} marginBottom="$4">
            <Text size="xs" color="secondary" marginBottom="$2" weight="semibold">
              {availableEffects.find(e => e.id === effect.type)?.name} Settings
            </Text>

            {renderEffectSettings(effect.type, effect.settings, (setting, value) =>
              updateEffectSetting(effect.type, setting, value)
            )}
          </Box>
        ))}
    </EffectsContainer>
  )

  // Render settings for specific effect types
  function renderEffectSettings(
    effectType: string,
    settings: Record<string, any>,
    updateSetting: (setting: string, value: any) => void
  ) {
    switch (effectType) {
      case 'drop-shadow':
        return (
          <>
            <SliderContainer>
              <Text size="xs" css={{ minWidth: 60 }}>Offset X:</Text>
              <Slider
                type="range"
                min="-20"
                max="20"
                value={settings.offsetX || 5}
                onChange={(e) => updateSetting('offsetX', parseInt(e.target.value))}
              />
              <Text size="xs" css={{ minWidth: 20 }}>{settings.offsetX || 5}</Text>
            </SliderContainer>

            <SliderContainer>
              <Text size="xs" css={{ minWidth: 60 }}>Offset Y:</Text>
              <Slider
                type="range"
                min="-20"
                max="20"
                value={settings.offsetY || 5}
                onChange={(e) => updateSetting('offsetY', parseInt(e.target.value))}
              />
              <Text size="xs" css={{ minWidth: 20 }}>{settings.offsetY || 5}</Text>
            </SliderContainer>

            <SliderContainer>
              <Text size="xs" css={{ minWidth: 60 }}>Blur:</Text>
              <Slider
                type="range"
                min="0"
                max="20"
                value={settings.blur || 3}
                onChange={(e) => updateSetting('blur', parseInt(e.target.value))}
              />
              <Text size="xs" css={{ minWidth: 20 }}>{settings.blur || 3}px</Text>
            </SliderContainer>

            <SliderContainer>
              <Text size="xs" css={{ minWidth: 60 }}>Opacity:</Text>
              <Slider
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.opacity || 0.5}
                onChange={(e) => updateSetting('opacity', parseFloat(e.target.value))}
              />
              <Text size="xs" css={{ minWidth: 20 }}>{Math.round((settings.opacity || 0.5) * 100)}%</Text>
            </SliderContainer>

            <Box display="flex" alignItems="center" gap="$2">
              <Text size="xs" css={{ minWidth: 60 }}>Color:</Text>
              <input
                type="color"
                value={settings.color || '#000000'}
                onChange={(e) => updateSetting('color', e.target.value)}
                style={{ width: 30, height: 20, border: 'none', borderRadius: 4 }}
              />
            </Box>
          </>
        )

      case 'glow':
        return (
          <>
            <SliderContainer>
              <Text size="xs" css={{ minWidth: 60 }}>Radius:</Text>
              <Slider
                type="range"
                min="1"
                max="50"
                value={settings.radius || 10}
                onChange={(e) => updateSetting('radius', parseInt(e.target.value))}
              />
              <Text size="xs" css={{ minWidth: 20 }}>{settings.radius || 10}px</Text>
            </SliderContainer>

            <SliderContainer>
              <Text size="xs" css={{ minWidth: 60 }}>Intensity:</Text>
              <Slider
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={settings.intensity || 1}
                onChange={(e) => updateSetting('intensity', parseFloat(e.target.value))}
              />
              <Text size="xs" css={{ minWidth: 20 }}>{settings.intensity || 1}</Text>
            </SliderContainer>

            <Box display="flex" alignItems="center" gap="$2">
              <Text size="xs" css={{ minWidth: 60 }}>Color:</Text>
              <input
                type="color"
                value={settings.color || '#FBBF24'}
                onChange={(e) => updateSetting('color', e.target.value)}
                style={{ width: 30, height: 20, border: 'none', borderRadius: 4 }}
              />
            </Box>
          </>
        )

      case 'blur':
        return (
          <SliderContainer>
            <Text size="xs" css={{ minWidth: 60 }}>Amount:</Text>
            <Slider
              type="range"
              min="0"
              max="20"
              value={settings.amount || 2}
              onChange={(e) => updateSetting('amount', parseInt(e.target.value))}
            />
            <Text size="xs" css={{ minWidth: 20 }}>{settings.amount || 2}px</Text>
          </SliderContainer>
        )

      default:
        return (
          <Text size="xs" color="gray400">
            No settings available for this effect.
          </Text>
        )
    }
  }
}

// Default settings for each effect type
function getDefaultEffectSettings(effectType: string): Record<string, any> {
  switch (effectType) {
    case 'drop-shadow':
      return {
        offsetX: 5,
        offsetY: 5,
        blur: 3,
        opacity: 0.5,
        color: '#000000'
      }

    case 'inner-shadow':
      return {
        offsetX: 0,
        offsetY: 0,
        blur: 5,
        opacity: 0.3,
        color: '#000000'
      }

    case 'glow':
      return {
        radius: 10,
        intensity: 1,
        color: '#FBBF24'
      }

    case 'blur':
      return {
        amount: 2
      }

    case 'sharpen':
      return {
        amount: 1
      }

    case 'noise':
      return {
        amount: 0.1,
        type: 'gaussian'
      }

    default:
      return {}
  }
}

export default LayerEffectsManager