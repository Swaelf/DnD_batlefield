/**
 * StatusEffectsPanel - UI for managing token status effects
 *
 * Allows adding, removing, and configuring visual status effects on selected tokens
 */

import { type FC, useState } from 'react'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Flame, Snowflake, Droplets, TreePine, Skull, Sparkles, Zap, CircleDot, Star, Heart, Moon } from '@/utils/optimizedIcons'
import useMapStore from '@store/mapStore'
import useTimelineStore from '@store/timelineStore'
import { STATUS_EFFECT_CONFIGS, type StatusEffectType, type StatusEffect, type Token } from '@/types'

const EFFECT_ICONS: Record<StatusEffectType, typeof Flame> = {
  stunned: Zap,
  poisoned: Droplets,
  prone: CircleDot,
  entangled: TreePine,
  dying: Skull,
  flaming: Flame,
  chilled: Snowflake,
  dazed: Sparkles,
  blessed: Star,
  regenerating: Heart,
  sleeping: Moon,
  frightened: Skull,
}

export const StatusEffectsPanel: FC = () => {
  const selectedObjects = useMapStore(state => state.selectedObjects)
  const currentMap = useMapStore(state => state.currentMap)
  const addStatusEffect = useMapStore(state => state.addStatusEffect)
  const removeStatusEffect = useMapStore(state => state.removeStatusEffect)
  const clearStatusEffects = useMapStore(state => state.clearStatusEffects)

  // Get current round from timeline store
  const currentRound = useTimelineStore(state => state.currentRound)

  const [selectedEffectType, setSelectedEffectType] = useState<StatusEffectType | null>(null)
  const [duration, setDuration] = useState<number>(3)
  const [intensity, setIntensity] = useState<number>(1)

  // Get selected token
  const selectedObject = currentMap?.objects.find(
    obj => obj.type === 'token' && selectedObjects.includes(obj.id)
  )

  if (!selectedObject || selectedObject.type !== 'token') {
    return (
      <Box
        style={{
          backgroundColor: 'var(--colors-dndBlack)',
          borderRadius: '8px',
          border: '1px solid var(--colors-gray800)',
          padding: '12px',
          marginBottom: '16px'
        }}
      >
        <Text
          variant="label"
          style={{
            fontSize: '12px',
            color: 'var(--colors-gray500)',
            textAlign: 'center'
          }}
        >
          Select a token to manage status effects
        </Text>
      </Box>
    )
  }

  const selectedToken = selectedObject as Token
  const activeEffects = selectedToken.statusEffects || []

  const handleAddEffect = () => {
    if (!selectedEffectType) return

    const effect: StatusEffect = {
      type: selectedEffectType,
      duration: duration > 0 ? duration : undefined,
      intensity: intensity,
      source: 'manual',
      roundApplied: currentRound, // Track when effect was applied for expiration
    }

    addStatusEffect(selectedToken.id, effect)
    setSelectedEffectType(null)
  }

  const handleRemoveEffect = (effectType: StatusEffectType) => {
    removeStatusEffect(selectedToken.id, effectType)
  }

  const handleClearAll = () => {
    clearStatusEffects(selectedToken.id)
  }

  return (
    <Box
      style={{
        backgroundColor: 'var(--colors-dndBlack)',
        borderRadius: '8px',
        border: '1px solid var(--colors-gray800)',
        padding: '12px',
        marginBottom: '16px'
      }}
    >
      {/* Header */}
      <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <Text
          variant="heading"
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--colors-gray100)'
          }}
        >
          Status Effects
        </Text>
        {activeEffects.length > 0 && (
          <button
            onClick={handleClearAll}
            style={{
              padding: '4px 8px',
              backgroundColor: 'var(--colors-gray800)',
              color: 'var(--colors-error)',
              border: '1px solid var(--colors-gray700)',
              borderRadius: '4px',
              fontSize: '11px',
              cursor: 'pointer',
              transition: 'background-color 0.15s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--colors-gray700)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--colors-gray800)'
            }}
          >
            Clear All
          </button>
        )}
      </Box>

      {/* Active Effects */}
      {activeEffects.length > 0 && (
        <Box style={{ marginBottom: '12px' }}>
          <Text
            variant="label"
            style={{
              fontSize: '11px',
              color: 'var(--colors-gray400)',
              marginBottom: '6px',
              display: 'block'
            }}
          >
            Active Effects:
          </Text>
          <Box style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {activeEffects.map((effect) => {
              const config = STATUS_EFFECT_CONFIGS[effect.type]
              const Icon = EFFECT_ICONS[effect.type]
              return (
                <Box
                  key={effect.type}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 8px',
                    backgroundColor: 'var(--colors-gray900)',
                    borderRadius: '4px',
                    border: `1px solid ${config.color}40`
                  }}
                >
                  <Box style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Icon size={14} style={{ color: config.color }} />
                    <Text
                      variant="label"
                      style={{
                        fontSize: '12px',
                        color: 'var(--colors-gray200)'
                      }}
                    >
                      {config.name}
                    </Text>
                    {effect.duration && (
                      <Text
                        variant="label"
                        style={{
                          fontSize: '10px',
                          color: 'var(--colors-gray500)',
                          marginLeft: '4px'
                        }}
                      >
                        ({effect.duration} rounds)
                      </Text>
                    )}
                  </Box>
                  <button
                    onClick={() => handleRemoveEffect(effect.type)}
                    style={{
                      padding: '2px 6px',
                      backgroundColor: 'transparent',
                      color: 'var(--colors-error)',
                      border: 'none',
                      fontSize: '11px',
                      cursor: 'pointer',
                      opacity: 0.7,
                      transition: 'opacity 0.15s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '1'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '0.7'
                    }}
                  >
                    ✕
                  </button>
                </Box>
              )
            })}
          </Box>
        </Box>
      )}

      {/* Add Effect */}
      <Box style={{ borderTop: '1px solid var(--colors-gray800)', paddingTop: '12px' }}>
        <Text
          variant="label"
          style={{
            fontSize: '11px',
            color: 'var(--colors-gray400)',
            marginBottom: '6px',
            display: 'block'
          }}
        >
          Add Effect:
        </Text>

        {/* Effect Selection Grid */}
        <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '12px' }}>
          {(Object.keys(STATUS_EFFECT_CONFIGS) as StatusEffectType[]).map((effectType) => {
            const config = STATUS_EFFECT_CONFIGS[effectType]
            const Icon = EFFECT_ICONS[effectType]
            const isSelected = selectedEffectType === effectType
            const isActive = activeEffects.some(e => e.type === effectType)

            return (
              <button
                key={effectType}
                onClick={() => setSelectedEffectType(effectType)}
                disabled={isActive}
                title={`${config.name}\n${config.description}`}
                style={{
                  padding: '8px',
                  backgroundColor: isSelected ? `${config.color}20` : isActive ? 'var(--colors-gray900)' : 'var(--colors-gray800)',
                  border: isSelected ? `2px solid ${config.color}` : '1px solid var(--colors-gray700)',
                  borderRadius: '4px',
                  cursor: isActive ? 'not-allowed' : 'pointer',
                  opacity: isActive ? 0.5 : 1,
                  transition: 'all 0.15s',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = isSelected ? `${config.color}30` : 'var(--colors-gray700)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = isSelected ? `${config.color}20` : 'var(--colors-gray800)'
                  }
                }}
              >
                <Icon size={16} style={{ color: config.color }} />
                <Text
                  variant="label"
                  style={{
                    fontSize: '9px',
                    color: 'var(--colors-gray300)',
                    textAlign: 'center'
                  }}
                >
                  {config.name}
                </Text>
              </button>
            )
          })}
        </Box>

        {/* Effect Configuration */}
        {selectedEffectType && (
          <Box style={{ marginBottom: '12px', padding: '8px', backgroundColor: 'var(--colors-gray900)', borderRadius: '4px' }}>
            <Text
              variant="label"
              style={{
                fontSize: '11px',
                color: 'var(--colors-gray300)',
                marginBottom: '8px',
                display: 'block'
              }}
            >
              Configure {STATUS_EFFECT_CONFIGS[selectedEffectType].name}:
            </Text>

            {/* Duration Input */}
            <Box style={{ marginBottom: '8px' }}>
              <Text
                variant="label"
                style={{
                  fontSize: '10px',
                  color: 'var(--colors-gray400)',
                  marginBottom: '4px',
                  display: 'block'
                }}
              >
                Duration (rounds, 0 = indefinite):
              </Text>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Math.max(0, parseInt(e.target.value) || 0))}
                min={0}
                max={99}
                style={{
                  width: '100%',
                  padding: '4px 8px',
                  backgroundColor: 'var(--colors-gray800)',
                  color: 'var(--colors-gray100)',
                  border: '1px solid var(--colors-gray700)',
                  borderRadius: '4px',
                  fontSize: '11px'
                }}
              />
            </Box>

            {/* Intensity Input */}
            <Box style={{ marginBottom: '8px' }}>
              <Text
                variant="label"
                style={{
                  fontSize: '10px',
                  color: 'var(--colors-gray400)',
                  marginBottom: '4px',
                  display: 'block'
                }}
              >
                Intensity (0.1 - 1.0):
              </Text>
              <input
                type="range"
                value={intensity}
                onChange={(e) => setIntensity(parseFloat(e.target.value))}
                min={0.1}
                max={1}
                step={0.1}
                style={{
                  width: '100%'
                }}
              />
              <Text
                variant="label"
                style={{
                  fontSize: '10px',
                  color: 'var(--colors-gray500)',
                  textAlign: 'center',
                  display: 'block'
                }}
              >
                {intensity.toFixed(1)}
              </Text>
            </Box>

            {/* Apply Button */}
            <button
              onClick={handleAddEffect}
              style={{
                width: '100%',
                padding: '6px 12px',
                backgroundColor: STATUS_EFFECT_CONFIGS[selectedEffectType].color,
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'opacity 0.15s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.8'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1'
              }}
            >
              Apply {STATUS_EFFECT_CONFIGS[selectedEffectType].name}
            </button>
          </Box>
        )}
      </Box>
    </Box>
  )
}
