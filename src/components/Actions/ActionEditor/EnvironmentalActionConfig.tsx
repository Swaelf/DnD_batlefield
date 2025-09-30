import React, { memo } from 'react'
import {
  Cloud,
  CloudRain,
  CloudSnow,
  Sun,
  Moon,
  Zap,
  AlertTriangle,
  Mountain,
  Flame,
  Snowflake,
  TreePine,
  Sparkles,
  Eye,
  Shield
} from '@/utils/optimizedIcons'
import {
  ENVIRONMENTAL_TYPES,
  WEATHER_TYPES,
  TERRAIN_TYPES,
  LIGHTING_TYPES,
  HAZARD_TYPES,
  ATMOSPHERE_TYPES,
  EFFECT_INTENSITIES,
  EFFECT_AREAS,
  ENVIRONMENTAL_DURATIONS,
  ENVIRONMENTAL_PRESETS
} from '@/constants'
import type { EnvironmentalEventData } from '@/types'
import {
  Box,
  Button,
  Text,
  Select,
  SelectOption,
  Input,
  FieldLabel,
  Panel,
  PanelBody,
  PanelSection
} from '@/components/ui'

type EnvironmentalActionConfigProps = {
  selectedEnvironmental: Partial<EnvironmentalEventData> | null
  onEnvironmentalChange: (environmental: Partial<EnvironmentalEventData>) => void
}

const EnvironmentalActionConfigComponent: React.FC<EnvironmentalActionConfigProps> = ({
  selectedEnvironmental,
  onEnvironmentalChange
}) => {
  const environmental = selectedEnvironmental || {}

  const handleTypeChange = (environmentalType: string) => {
    // Reset configuration when type changes
    onEnvironmentalChange({
      type: 'environmental',
      environmentalType: environmentalType as EnvironmentalEventData['environmentalType'],
      effectName: '',
      category: '',
      intensity: 'moderate',
      area: 'medium',
      color: '#FFFFFF',
      opacity: 0.6,
      duration: ENVIRONMENTAL_DURATIONS.LONG,
      description: ''
    })
  }

  const handlePresetSelect = (presetKey: string) => {
    const preset = ENVIRONMENTAL_PRESETS[presetKey as keyof typeof ENVIRONMENTAL_PRESETS]
    onEnvironmentalChange({
      type: 'environmental',
      environmentalType: preset.type as EnvironmentalEventData['environmentalType'],
      effectName: preset.name,
      category: getPresetCategory(preset),
      intensity: preset.opacity <= 0.3 ? 'subtle' :
                 preset.opacity <= 0.6 ? 'moderate' :
                 preset.opacity <= 0.8 ? 'strong' : 'overwhelming',
      area: 'map_wide', // Most environmental effects are map-wide
      color: preset.color,
      opacity: preset.opacity,
      duration: preset.duration || ENVIRONMENTAL_DURATIONS.PERMANENT,
      particleCount: 'particleCount' in preset ? preset.particleCount : 20,
      effects: preset.effects ? {
        ...preset.effects,
        disadvantage: 'disadvantage' in preset.effects && Array.isArray(preset.effects.disadvantage) ? [...preset.effects.disadvantage] : undefined,
        advantage: 'advantage' in preset.effects && Array.isArray(preset.effects.advantage) ? [...preset.effects.advantage] : undefined,
        conditions: 'conditions' in preset.effects && Array.isArray(preset.effects.conditions) ? [...preset.effects.conditions] : undefined
      } : {},
      description: preset.description
    })
  }

  const getPresetCategory = (preset: typeof ENVIRONMENTAL_PRESETS[keyof typeof ENVIRONMENTAL_PRESETS]): string => {
    if ('weatherType' in preset) return preset.weatherType
    if ('terrainType' in preset) return preset.terrainType
    if ('lightingType' in preset) return preset.lightingType
    if ('hazardType' in preset) return preset.hazardType
    if ('atmosphereType' in preset) return preset.atmosphereType
    return 'custom'
  }

  const getEnvironmentalIcon = (type: string) => {
    switch (type) {
      case ENVIRONMENTAL_TYPES.WEATHER:
        return <CloudRain size={16} />
      case ENVIRONMENTAL_TYPES.TERRAIN:
        return <Mountain size={16} />
      case ENVIRONMENTAL_TYPES.LIGHTING:
        return <Sun size={16} />
      case ENVIRONMENTAL_TYPES.HAZARD:
        return <AlertTriangle size={16} />
      case ENVIRONMENTAL_TYPES.ATMOSPHERE:
        return <Sparkles size={16} />
      default:
        return <Cloud size={16} />
    }
  }

  const getWeatherIcon = (weatherType: string) => {
    switch (weatherType) {
      case WEATHER_TYPES.RAIN:
        return <CloudRain size={16} />
      case WEATHER_TYPES.SNOW:
      case WEATHER_TYPES.BLIZZARD:
        return <CloudSnow size={16} />
      case WEATHER_TYPES.STORM:
      case WEATHER_TYPES.MAGICAL_STORM:
        return <Zap size={16} />
      case WEATHER_TYPES.FOG:
        return <Eye size={16} />
      default:
        return <Cloud size={16} />
    }
  }

  const getTerrainIcon = (terrainType: string) => {
    switch (terrainType) {
      case TERRAIN_TYPES.LAVA:
        return <Flame size={16} />
      case TERRAIN_TYPES.ICE:
        return <Snowflake size={16} />
      case TERRAIN_TYPES.SWAMP:
        return <TreePine size={16} />
      default:
        return <Mountain size={16} />
    }
  }

  const getLightingIcon = (lightingType: string) => {
    switch (lightingType) {
      case LIGHTING_TYPES.BRIGHT:
        return <Sun size={16} />
      case LIGHTING_TYPES.DIM:
      case LIGHTING_TYPES.DARK:
        return <Moon size={16} />
      case LIGHTING_TYPES.MAGICAL:
        return <Sparkles size={16} />
      default:
        return <Sun size={16} />
    }
  }

  const getHazardIcon = (hazardType: string) => {
    switch (hazardType) {
      case HAZARD_TYPES.FIRE:
        return <Flame size={16} />
      case HAZARD_TYPES.LIGHTNING:
        return <Zap size={16} />
      case HAZARD_TYPES.COLD:
        return <Snowflake size={16} />
      default:
        return <AlertTriangle size={16} />
    }
  }

  const getAtmosphereIcon = (atmosphereType: string) => {
    switch (atmosphereType) {
      case ATMOSPHERE_TYPES.HOLY:
        return <Shield size={16} />
      case ATMOSPHERE_TYPES.CURSED:
        return <AlertTriangle size={16} />
      default:
        return <Sparkles size={16} />
    }
  }

  const getPresetIcon = (preset: typeof ENVIRONMENTAL_PRESETS[keyof typeof ENVIRONMENTAL_PRESETS]) => {
    if ('weatherType' in preset) return getWeatherIcon(preset.weatherType)
    if ('terrainType' in preset) return getTerrainIcon(preset.terrainType)
    if ('lightingType' in preset) return getLightingIcon(preset.lightingType)
    if ('hazardType' in preset) return getHazardIcon(preset.hazardType)
    if ('atmosphereType' in preset) return getAtmosphereIcon(preset.atmosphereType)
    return <Cloud size={16} />
  }

  const getAvailableCategories = (environmentalType: string): string[] => {
    switch (environmentalType) {
      case ENVIRONMENTAL_TYPES.WEATHER:
        return Object.values(WEATHER_TYPES)
      case ENVIRONMENTAL_TYPES.TERRAIN:
        return Object.values(TERRAIN_TYPES)
      case ENVIRONMENTAL_TYPES.LIGHTING:
        return Object.values(LIGHTING_TYPES)
      case ENVIRONMENTAL_TYPES.HAZARD:
        return Object.values(HAZARD_TYPES)
      case ENVIRONMENTAL_TYPES.ATMOSPHERE:
        return Object.values(ATMOSPHERE_TYPES)
      default:
        return []
    }
  }

  const filteredPresets = Object.entries(ENVIRONMENTAL_PRESETS)
    .filter(([, preset]) =>
      !environmental.environmentalType || preset.type === environmental.environmentalType
    )
    .map(([key, preset]) => ({
      id: key,
      name: preset.name,
      type: preset.type,
      preset,
      icon: getPresetIcon(preset)
    }))

  return (
    <Panel size="sidebar" style={{ borderLeft: '1px solid var(--colors-gray800)' }}>
      <PanelBody>
        <PanelSection>
          <Box display="flex" alignItems="center" gap={2} marginBottom={3}>
            <Cloud size={20} />
            <Text size="md" weight="medium">Environmental Effects</Text>
          </Box>

          {/* Environmental Type Selection */}
          <Box marginBottom={4} >
            <FieldLabel style={{ marginBottom: 'var(--space-2)' }}>Effect Type</FieldLabel>
            <Select
              value={environmental.environmentalType || ''}
              onValueChange={handleTypeChange}
              placeholder="Select effect type..."
            >
              {Object.values(ENVIRONMENTAL_TYPES).map((type) => (
                <SelectOption key={type} value={type}>
                  <Box display="flex" alignItems="center" gap={2}>
                    {getEnvironmentalIcon(type)}
                    <Text>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
                  </Box>
                </SelectOption>
              ))}
            </Select>
          </Box>

          {/* Preset Selection */}
          <Box marginBottom={4} >
            <FieldLabel style={{ marginBottom: 'var(--space-2)' }}>Environmental Presets</FieldLabel>
            <Box display="grid" gridTemplateColumns={2} gap={2} style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {filteredPresets.map((preset) => (
                <Button
                  key={preset.id}
                  variant="outline" size="sm"
                  onClick={() => handlePresetSelect(preset.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 'var(--space-1)',
                    padding: 'var(--space-2)',
                    height: 'auto',
                    backgroundColor: 'var(--colors-gray800)'
                  }}
                >
                  {preset.icon}
                  <Text size="xs" align="center">{preset.name}</Text>
                </Button>
              ))}
            </Box>
          </Box>

          {/* Category Selection */}
          {environmental.environmentalType && (
            <Box marginBottom={4} >
              <FieldLabel style={{ marginBottom: 'var(--space-2)' }}>Category</FieldLabel>
              <Select
                value={environmental.category || ''}
                onValueChange={(category) => onEnvironmentalChange({ ...environmental, category })}
                placeholder="Select category..."
              >
                {getAvailableCategories(environmental.environmentalType).map((category) => (
                  <SelectOption key={category} value={category}>
                    <Text>{category.charAt(0).toUpperCase() + category.slice(1)}</Text>
                  </SelectOption>
                ))}
              </Select>
            </Box>
          )}

          {/* Effect Name */}
          <Box marginBottom={4} >
            <FieldLabel style={{ marginBottom: 'var(--space-2)' }}>Effect Name</FieldLabel>
            <Input
              placeholder="Custom effect name..."
              value={environmental.effectName || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onEnvironmentalChange({ ...environmental, effectName: e.target.value })}
            />
          </Box>

          {/* Intensity */}
          <Box marginBottom={4} >
            <FieldLabel style={{ marginBottom: 'var(--space-2)' }}>Intensity</FieldLabel>
            <Select
              value={environmental.intensity || 'moderate'}
              onValueChange={(intensity) => onEnvironmentalChange({ ...environmental, intensity: intensity as EnvironmentalEventData['intensity'] })}
            >
              {Object.keys(EFFECT_INTENSITIES).map((intensity) => (
                <SelectOption key={intensity} value={intensity.toLowerCase()}>
                  <Text>{intensity.charAt(0) + intensity.slice(1).toLowerCase()}</Text>
                </SelectOption>
              ))}
            </Select>
          </Box>

          {/* Area of Effect */}
          <Box marginBottom={4} >
            <FieldLabel style={{ marginBottom: 'var(--space-2)' }}>Area of Effect</FieldLabel>
            <Select
              value={environmental.area || 'medium'}
              onValueChange={(area) => onEnvironmentalChange({ ...environmental, area: area as EnvironmentalEventData['area'] })}
            >
              {Object.values(EFFECT_AREAS).map((area) => (
                <SelectOption key={area} value={area}>
                  <Text>{area.replace('_', ' ').toLowerCase()}</Text>
                </SelectOption>
              ))}
            </Select>
          </Box>

          {/* Color */}
          <Box marginBottom={4} >
            <FieldLabel style={{ marginBottom: 'var(--space-2)' }}>Effect Color</FieldLabel>
            <Box display="flex" gap={2} alignItems="center">
              <Input
                type="color"
                value={environmental.color || '#FFFFFF'}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onEnvironmentalChange({ ...environmental, color: e.target.value })}
                style={{ width: '60px', height: '32px', padding: '2px' }}
              />
              <Input
                type="text"
                value={environmental.color || '#FFFFFF'}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onEnvironmentalChange({ ...environmental, color: e.target.value })}
                placeholder="#FFFFFF"
                style={{ flex: 1 }}
              />
            </Box>
          </Box>

          {/* Duration */}
          <Box marginBottom={4} >
            <FieldLabel style={{ marginBottom: 'var(--space-2)' }}>Duration</FieldLabel>
            <Select
              value={environmental.duration?.toString() || ENVIRONMENTAL_DURATIONS.LONG.toString()}
              onValueChange={(duration) => onEnvironmentalChange({ ...environmental, duration: parseInt(duration) })}
            >
              <SelectOption value={ENVIRONMENTAL_DURATIONS.INSTANT.toString()}>Instant (1 round)</SelectOption>
              <SelectOption value={ENVIRONMENTAL_DURATIONS.SHORT.toString()}>Short (5 rounds)</SelectOption>
              <SelectOption value={ENVIRONMENTAL_DURATIONS.MEDIUM.toString()}>Medium (10 rounds)</SelectOption>
              <SelectOption value={ENVIRONMENTAL_DURATIONS.LONG.toString()}>Long (25 rounds)</SelectOption>
              <SelectOption value={ENVIRONMENTAL_DURATIONS.PERMANENT.toString()}>Permanent</SelectOption>
            </Select>
          </Box>

          {/* Description */}
          <Box marginBottom={4} >
            <FieldLabel style={{ marginBottom: 'var(--space-2)' }}>Effect Description</FieldLabel>
            <Input
              placeholder="Describe the environmental effect..."
              value={environmental.description || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onEnvironmentalChange({ ...environmental, description: e.target.value })}
            />
          </Box>
        </PanelSection>
      </PanelBody>
    </Panel>
  )
}

export const EnvironmentalActionConfig = memo(EnvironmentalActionConfigComponent)
EnvironmentalActionConfig.displayName = 'EnvironmentalActionConfig'