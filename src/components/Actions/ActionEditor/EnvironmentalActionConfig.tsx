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
} from 'lucide-react'
import {
  ENVIRONMENTAL_TYPES,
  WEATHER_TYPES,
  TERRAIN_TYPES,
  LIGHTING_TYPES,
  HAZARD_TYPES,
  ATMOSPHERE_TYPES,
  WEATHER_INTENSITIES,
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
      environmentalType: environmentalType as any,
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
      environmentalType: preset.type as any,
      effectName: preset.name,
      category: getPresetCategory(preset),
      intensity: preset.opacity <= 0.3 ? 'subtle' :
                 preset.opacity <= 0.6 ? 'moderate' :
                 preset.opacity <= 0.8 ? 'strong' : 'overwhelming',
      area: 'map_wide', // Most environmental effects are map-wide
      color: preset.color,
      opacity: preset.opacity,
      duration: preset.duration || ENVIRONMENTAL_DURATIONS.PERMANENT,
      particleCount: preset.particleCount,
      effects: preset.effects,
      description: preset.description
    })
  }

  const getPresetCategory = (preset: any): string => {
    if (preset.weatherType) return preset.weatherType
    if (preset.terrainType) return preset.terrainType
    if (preset.lightingType) return preset.lightingType
    if (preset.hazardType) return preset.hazardType
    if (preset.atmosphereType) return preset.atmosphereType
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
      case WEATHER_TYPES.LIGHTNING:
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

  const getPresetIcon = (preset: any) => {
    if (preset.weatherType) return getWeatherIcon(preset.weatherType)
    if (preset.terrainType) return getTerrainIcon(preset.terrainType)
    if (preset.lightingType) return getLightingIcon(preset.lightingType)
    if (preset.hazardType) return getHazardIcon(preset.hazardType)
    if (preset.atmosphereType) return getAtmosphereIcon(preset.atmosphereType)
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
    .filter(([key, preset]) =>
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
    <Panel size="sidebar" css={{ borderLeft: '1px solid $gray800' }}>
      <PanelBody>
        <PanelSection>
          <Box display="flex" alignItems="center" gap="2" css={{ marginBottom: '$3' }}>
            <Cloud size={20} />
            <Text size="md" weight="medium">Environmental Effects</Text>
          </Box>

          {/* Environmental Type Selection */}
          <Box css={{ marginBottom: '$4' }}>
            <FieldLabel css={{ marginBottom: '$2' }}>Effect Type</FieldLabel>
            <Select
              value={environmental.environmentalType || ''}
              onValueChange={handleTypeChange}
              placeholder="Select effect type..."
            >
              {Object.values(ENVIRONMENTAL_TYPES).map((type) => (
                <SelectOption key={type} value={type}>
                  <Box display="flex" alignItems="center" gap="2">
                    {getEnvironmentalIcon(type)}
                    <Text>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
                  </Box>
                </SelectOption>
              ))}
            </Select>
          </Box>

          {/* Preset Selection */}
          <Box css={{ marginBottom: '$4' }}>
            <FieldLabel css={{ marginBottom: '$2' }}>Environmental Presets</FieldLabel>
            <Box display="grid" css={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '$2', maxHeight: '200px', overflowY: 'auto' }}>
              {filteredPresets.map((preset) => (
                <Button
                  key={preset.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handlePresetSelect(preset.id)}
                  css={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '$1',
                    padding: '$2',
                    height: 'auto',
                    backgroundColor: '$gray800',
                    '&:hover': {
                      backgroundColor: '$gray700'
                    }
                  }}
                >
                  {preset.icon}
                  <Text size="xs" css={{ textAlign: 'center' }}>{preset.name}</Text>
                </Button>
              ))}
            </Box>
          </Box>

          {/* Category Selection */}
          {environmental.environmentalType && (
            <Box css={{ marginBottom: '$4' }}>
              <FieldLabel css={{ marginBottom: '$2' }}>Category</FieldLabel>
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
          <Box css={{ marginBottom: '$4' }}>
            <FieldLabel css={{ marginBottom: '$2' }}>Effect Name</FieldLabel>
            <Input
              placeholder="Custom effect name..."
              value={environmental.effectName || ''}
              onChange={(e) => onEnvironmentalChange({ ...environmental, effectName: e.target.value })}
              size="sm"
            />
          </Box>

          {/* Intensity */}
          <Box css={{ marginBottom: '$4' }}>
            <FieldLabel css={{ marginBottom: '$2' }}>Intensity</FieldLabel>
            <Select
              value={environmental.intensity || 'moderate'}
              onValueChange={(intensity) => onEnvironmentalChange({ ...environmental, intensity: intensity as any })}
            >
              {Object.keys(EFFECT_INTENSITIES).map((intensity) => (
                <SelectOption key={intensity} value={intensity.toLowerCase()}>
                  <Text>{intensity.charAt(0) + intensity.slice(1).toLowerCase()}</Text>
                </SelectOption>
              ))}
            </Select>
          </Box>

          {/* Area of Effect */}
          <Box css={{ marginBottom: '$4' }}>
            <FieldLabel css={{ marginBottom: '$2' }}>Area of Effect</FieldLabel>
            <Select
              value={environmental.area || 'medium'}
              onValueChange={(area) => onEnvironmentalChange({ ...environmental, area: area as any })}
            >
              {Object.values(EFFECT_AREAS).map((area) => (
                <SelectOption key={area} value={area}>
                  <Text>{area.replace('_', ' ').toLowerCase()}</Text>
                </SelectOption>
              ))}
            </Select>
          </Box>

          {/* Color */}
          <Box css={{ marginBottom: '$4' }}>
            <FieldLabel css={{ marginBottom: '$2' }}>Effect Color</FieldLabel>
            <Box display="flex" gap="2" alignItems="center">
              <Input
                type="color"
                value={environmental.color || '#FFFFFF'}
                onChange={(e) => onEnvironmentalChange({ ...environmental, color: e.target.value })}
                css={{ width: '60px', height: '32px', padding: '2px' }}
              />
              <Input
                type="text"
                value={environmental.color || '#FFFFFF'}
                onChange={(e) => onEnvironmentalChange({ ...environmental, color: e.target.value })}
                placeholder="#FFFFFF"
                size="sm"
                css={{ flex: 1 }}
              />
            </Box>
          </Box>

          {/* Duration */}
          <Box css={{ marginBottom: '$4' }}>
            <FieldLabel css={{ marginBottom: '$2' }}>Duration</FieldLabel>
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
          <Box css={{ marginBottom: '$4' }}>
            <FieldLabel css={{ marginBottom: '$2' }}>Effect Description</FieldLabel>
            <Input
              placeholder="Describe the environmental effect..."
              value={environmental.description || ''}
              onChange={(e) => onEnvironmentalChange({ ...environmental, description: e.target.value })}
              size="sm"
            />
          </Box>
        </PanelSection>
      </PanelBody>
    </Panel>
  )
}

export const EnvironmentalActionConfig = memo(EnvironmentalActionConfigComponent)
EnvironmentalActionConfig.displayName = 'EnvironmentalActionConfig'