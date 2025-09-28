import React, { memo } from 'react'
import {
  DoorOpen,
  AlertTriangle,
  Settings,
  Box as BoxIcon,
  ToggleLeft,
  ToggleRight,
  CircleDot,
  Zap
} from 'lucide-react'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Button } from '@/components/primitives/ButtonVE'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import {
  INTERACTION_TYPES,
  DIFFICULTY_CLASSES,
  INTERACTION_DURATIONS,
  INTERACTION_EFFECTS,
  INTERACTION_PRESETS
} from '@/constants'
import type { InteractionEventData } from '@/types/timeline'

export type InteractionActionConfigProps = {
  selectedInteraction: Partial<InteractionEventData> | null
  onInteractionChange: (interaction: Partial<InteractionEventData>) => void
}

const InteractionActionConfigComponent: React.FC<InteractionActionConfigProps> = ({
  selectedInteraction,
  onInteractionChange
}) => {
  const interaction = selectedInteraction || {}

  const handleInteractionTypeChange = (interactionType: string) => {
    // Load preset when type changes
    const presetKey = Object.keys(INTERACTION_PRESETS).find(key =>
      INTERACTION_PRESETS[key as keyof typeof INTERACTION_PRESETS].type === interactionType
    )

    if (presetKey) {
      const preset = INTERACTION_PRESETS[presetKey as keyof typeof INTERACTION_PRESETS]
      onInteractionChange({
        ...preset,
        type: 'interaction',
        interactionType: interactionType as InteractionEventData['interactionType'],
        action: getDefaultAction(interactionType),
        duration: INTERACTION_DURATIONS.NORMAL,
        effect: INTERACTION_EFFECTS.GLOW
      })
    } else {
      onInteractionChange({
        ...interaction,
        interactionType: interactionType as InteractionEventData['interactionType'],
        action: getDefaultAction(interactionType)
      })
    }
  }

  const getDefaultAction = (interactionType: string): InteractionEventData['action'] => {
    switch (interactionType) {
      case INTERACTION_TYPES.DOOR:
        return 'open'
      case INTERACTION_TYPES.TRAP:
        return 'search'
      case INTERACTION_TYPES.LEVER:
      case INTERACTION_TYPES.SWITCH:
      case INTERACTION_TYPES.BUTTON:
        return 'activate'
      case INTERACTION_TYPES.CHEST:
        return 'open'
      case INTERACTION_TYPES.PORTAL:
        return 'use'
      case INTERACTION_TYPES.SHRINE:
        return 'use'
      default:
        return 'use'
    }
  }

  const getAvailableActions = (interactionType: string): string[] => {
    switch (interactionType) {
      case INTERACTION_TYPES.DOOR:
        return ['open', 'close', 'lock', 'unlock', 'search']
      case INTERACTION_TYPES.TRAP:
        return ['search', 'disarm', 'trigger']
      case INTERACTION_TYPES.LEVER:
      case INTERACTION_TYPES.SWITCH:
      case INTERACTION_TYPES.BUTTON:
        return ['activate', 'deactivate']
      case INTERACTION_TYPES.CHEST:
        return ['open', 'close', 'lock', 'unlock', 'search']
      case INTERACTION_TYPES.PORTAL:
        return ['activate', 'deactivate', 'use']
      case INTERACTION_TYPES.SHRINE:
        return ['use']
      default:
        return ['use']
    }
  }

  const getInteractionIcon = (interactionType: string) => {
    switch (interactionType) {
      case INTERACTION_TYPES.DOOR:
        return <DoorOpen size={16} />
      case INTERACTION_TYPES.TRAP:
        return <AlertTriangle size={16} />
      case INTERACTION_TYPES.LEVER:
        return <ToggleLeft size={16} />
      case INTERACTION_TYPES.SWITCH:
        return <ToggleRight size={16} />
      case INTERACTION_TYPES.BUTTON:
        return <CircleDot size={16} />
      case INTERACTION_TYPES.CHEST:
        return <BoxIcon size={16} />
      case INTERACTION_TYPES.PORTAL:
        return <Zap size={16} />
      case INTERACTION_TYPES.SHRINE:
        return <Settings size={16} />
      default:
        return <BoxIcon size={16} />
    }
  }

  const interactionPresets = Object.entries(INTERACTION_PRESETS).map(([key, preset]) => ({
    id: key,
    name: preset.name,
    type: preset.type,
    icon: getInteractionIcon(preset.type)
  }))

  return (
    <Box
      style={{
        padding: '16px',
        backgroundColor: 'var(--colors-gray900)',
        borderLeft: '1px solid var(--colors-gray800)',
        width: '320px',
        height: '100%',
        overflowY: 'auto'
      }}
    >
      <Box style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Box style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Settings size={20} />
          <Text
            variant="body"
            size="md"
            style={{
              fontWeight: '500',
              margin: 0,
              color: 'var(--colors-gray100)'
            }}
          >
            Object Interaction
          </Text>
        </Box>

        {/* Interaction Type Selection */}
        <Box style={{ marginBottom: '16px' }}>
          <Text
            variant="label"
            size="sm"
            style={{
              display: 'block',
              marginBottom: '8px',
              color: 'var(--colors-gray200)',
              fontWeight: '500'
            }}
          >
            Interaction Type
          </Text>
          <Select
            value={interaction.interactionType || ''}
            onValueChange={handleInteractionTypeChange}
          >
            <option value="">Select interaction type...</option>
            {Object.values(INTERACTION_TYPES).map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </Select>
        </Box>

        {/* Preset Selection */}
        <Box style={{ marginBottom: '16px' }}>
          <Text
            variant="label"
            size="sm"
            style={{
              display: 'block',
              marginBottom: '8px',
              color: 'var(--colors-gray200)',
              fontWeight: '500'
            }}
          >
            Preset Objects
          </Text>
          <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {interactionPresets
              .filter(preset => !interaction.interactionType || preset.type === interaction.interactionType)
              .map((preset) => (
              <Button
                key={preset.id}
                variant="outline"
                size="sm"
                onClick={() => {
                  const presetData = INTERACTION_PRESETS[preset.id as keyof typeof INTERACTION_PRESETS]
                  onInteractionChange({
                    ...presetData,
                    type: 'interaction',
                    interactionType: presetData.type as InteractionEventData['interactionType'],
                    action: getDefaultAction(presetData.type),
                    duration: INTERACTION_DURATIONS.NORMAL,
                    effect: INTERACTION_EFFECTS.GLOW,
                    dc: 'lockDC' in presetData ? (presetData.lockDC as number) : ('detectionDC' in presetData ? (presetData.detectionDC as number) : ('disarmDC' in presetData ? (presetData.disarmDC as number) : 15))
                  })
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '8px',
                  height: 'auto',
                  backgroundColor: 'var(--colors-gray800)'
                }}
              >
                {preset.icon}
                <Text
                  variant="body"
                  size="xs"
                  style={{
                    margin: 0,
                    color: 'var(--colors-gray200)'
                  }}
                >
                  {preset.name}
                </Text>
              </Button>
            ))}
          </Box>
        </Box>

        {/* Action Selection */}
        {interaction.interactionType && (
          <Box style={{ marginBottom: '16px' }}>
            <Text
              variant="label"
              size="sm"
              style={{
                display: 'block',
                marginBottom: '8px',
                color: 'var(--colors-gray200)',
                fontWeight: '500'
              }}
            >
              Action
            </Text>
            <Select
              value={interaction.action || ''}
              onValueChange={(action) => onInteractionChange({ ...interaction, action: action as InteractionEventData['action'] })}
            >
              <option value="">Select action...</option>
              {getAvailableActions(interaction.interactionType).map((action) => (
                <option key={action} value={action}>
                  {action.charAt(0).toUpperCase() + action.slice(1)}
                </option>
              ))}
            </Select>
          </Box>
        )}

        {/* Skill Check Configuration */}
        <Box style={{ marginBottom: '16px' }}>
          <Text
            variant="label"
            size="sm"
            style={{
              display: 'block',
              marginBottom: '8px',
              color: 'var(--colors-gray200)',
              fontWeight: '500'
            }}
          >
            Skill Check
          </Text>
          <Box style={{ display: 'flex', gap: '8px' }}>
            <Box style={{ flex: 1 }}>
              <Input
                placeholder="Skill (e.g., lockpicking)"
                value={interaction.skill || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onInteractionChange({ ...interaction, skill: e.target.value })}
              />
            </Box>
            <Box style={{ width: '80px' }}>
              <Select
                value={interaction.dc?.toString() || ''}
                onValueChange={(dc) => onInteractionChange({ ...interaction, dc: parseInt(dc) })}
              >
                <option value="">DC</option>
                <option value={DIFFICULTY_CLASSES.EASY.toString()}>DC {DIFFICULTY_CLASSES.EASY}</option>
                <option value={DIFFICULTY_CLASSES.MODERATE.toString()}>DC {DIFFICULTY_CLASSES.MODERATE}</option>
                <option value={DIFFICULTY_CLASSES.HARD.toString()}>DC {DIFFICULTY_CLASSES.HARD}</option>
                <option value={DIFFICULTY_CLASSES.VERY_HARD.toString()}>DC {DIFFICULTY_CLASSES.VERY_HARD}</option>
              </Select>
            </Box>
          </Box>
        </Box>

        {/* Visual Effect */}
        <Box style={{ marginBottom: '16px' }}>
          <Text
            variant="label"
            size="sm"
            style={{
              display: 'block',
              marginBottom: '8px',
              color: 'var(--colors-gray200)',
              fontWeight: '500'
            }}
          >
            Visual Effect
          </Text>
          <Select
            value={interaction.effect || INTERACTION_EFFECTS.GLOW}
            onValueChange={(effect) => onInteractionChange({ ...interaction, effect })}
          >
            {Object.values(INTERACTION_EFFECTS).map((effect) => (
              <option key={effect} value={effect}>
                {effect.replace('_', ' ').toLowerCase()}
              </option>
            ))}
          </Select>
        </Box>

        {/* Duration */}
        <Box style={{ marginBottom: '16px' }}>
          <Text
            variant="label"
            size="sm"
            style={{
              display: 'block',
              marginBottom: '8px',
              color: 'var(--colors-gray200)',
              fontWeight: '500'
            }}
          >
            Animation Duration
          </Text>
          <Select
            value={interaction.duration?.toString() || INTERACTION_DURATIONS.NORMAL.toString()}
            onValueChange={(duration) => onInteractionChange({ ...interaction, duration: parseInt(duration) })}
          >
            <option value={INTERACTION_DURATIONS.INSTANT.toString()}>Instant</option>
            <option value={INTERACTION_DURATIONS.QUICK.toString()}>Quick (300ms)</option>
            <option value={INTERACTION_DURATIONS.NORMAL.toString()}>Normal (600ms)</option>
            <option value={INTERACTION_DURATIONS.SLOW.toString()}>Slow (1s)</option>
            <option value={INTERACTION_DURATIONS.VERY_SLOW.toString()}>Very Slow (1.5s)</option>
          </Select>
        </Box>

        {/* Result Description */}
        <Box style={{ marginBottom: '16px' }}>
          <Text
            variant="label"
            size="sm"
            style={{
              display: 'block',
              marginBottom: '8px',
              color: 'var(--colors-gray200)',
              fontWeight: '500'
            }}
          >
            Result Description
          </Text>
          <Input
            placeholder="Describe what happens..."
            value={interaction.result || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onInteractionChange({ ...interaction, result: e.target.value })}
          />
        </Box>
      </Box>
    </Box>
  )
}

export const InteractionActionConfig = memo(InteractionActionConfigComponent)
InteractionActionConfig.displayName = 'InteractionActionConfig'