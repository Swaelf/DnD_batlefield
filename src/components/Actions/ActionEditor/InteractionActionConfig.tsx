import React, { memo } from 'react'
import {
  DoorOpen,
  DoorClosed,
  AlertTriangle,
  Settings,
  Box as BoxIcon,
  ToggleLeft,
  ToggleRight,
  CircleDot,
  Zap,
  Search
} from 'lucide-react'
import {
  INTERACTION_TYPES,
  DOOR_TYPES,
  DOOR_STATES,
  TRAP_TYPES,
  TRAP_STATES,
  CONTAINER_TYPES,
  CONTAINER_STATES,
  SWITCH_STATES,
  PORTAL_STATES,
  DIFFICULTY_CLASSES,
  INTERACTION_DURATIONS,
  INTERACTION_EFFECTS,
  INTERACTION_PRESETS
} from '@/constants'
import type { InteractionEventData } from '@/types'
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

type InteractionActionConfigProps = {
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
        type: 'interaction',
        interactionType: interactionType as any,
        action: getDefaultAction(interactionType),
        duration: INTERACTION_DURATIONS.NORMAL,
        effect: INTERACTION_EFFECTS.GLOW,
        ...preset
      })
    } else {
      onInteractionChange({
        ...interaction,
        interactionType: interactionType as any,
        action: getDefaultAction(interactionType)
      })
    }
  }

  const getDefaultAction = (interactionType: string): string => {
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
    <Panel size="sidebar" css={{ borderLeft: '1px solid $gray800' }}>
      <PanelBody>
        <PanelSection>
          <Box display="flex" alignItems="center" gap="2" css={{ marginBottom: '$3' }}>
            <Settings size={20} />
            <Text size="md" weight="medium">Object Interaction</Text>
          </Box>

          {/* Interaction Type Selection */}
          <Box css={{ marginBottom: '$4' }}>
            <FieldLabel css={{ marginBottom: '$2' }}>Interaction Type</FieldLabel>
            <Select
              value={interaction.interactionType || ''}
              onValueChange={handleInteractionTypeChange}
              placeholder="Select interaction type..."
            >
              {Object.values(INTERACTION_TYPES).map((type) => (
                <SelectOption key={type} value={type}>
                  <Box display="flex" alignItems="center" gap="2">
                    {getInteractionIcon(type)}
                    <Text>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
                  </Box>
                </SelectOption>
              ))}
            </Select>
          </Box>

          {/* Preset Selection */}
          <Box css={{ marginBottom: '$4' }}>
            <FieldLabel css={{ marginBottom: '$2' }}>Preset Objects</FieldLabel>
            <Box display="grid" css={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '$2' }}>
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
                      type: 'interaction',
                      interactionType: presetData.type as any,
                      action: getDefaultAction(presetData.type),
                      duration: INTERACTION_DURATIONS.NORMAL,
                      effect: INTERACTION_EFFECTS.GLOW,
                      dc: presetData.lockDC || presetData.detectionDC || presetData.disarmDC,
                      ...presetData
                    })
                  }}
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
                  <Text size="xs">{preset.name}</Text>
                </Button>
              ))}
            </Box>
          </Box>

          {/* Action Selection */}
          {interaction.interactionType && (
            <Box css={{ marginBottom: '$4' }}>
              <FieldLabel css={{ marginBottom: '$2' }}>Action</FieldLabel>
              <Select
                value={interaction.action || ''}
                onValueChange={(action) => onInteractionChange({ ...interaction, action })}
                placeholder="Select action..."
              >
                {getAvailableActions(interaction.interactionType).map((action) => (
                  <SelectOption key={action} value={action}>
                    <Text>{action.charAt(0).toUpperCase() + action.slice(1)}</Text>
                  </SelectOption>
                ))}
              </Select>
            </Box>
          )}

          {/* Skill Check Configuration */}
          <Box css={{ marginBottom: '$4' }}>
            <FieldLabel css={{ marginBottom: '$2' }}>Skill Check</FieldLabel>
            <Box display="flex" gap="2">
              <Box css={{ flex: 1 }}>
                <Input
                  placeholder="Skill (e.g., lockpicking)"
                  value={interaction.skill || ''}
                  onChange={(e) => onInteractionChange({ ...interaction, skill: e.target.value })}
                  size="sm"
                />
              </Box>
              <Box css={{ width: '80px' }}>
                <Select
                  value={interaction.dc?.toString() || ''}
                  onValueChange={(dc) => onInteractionChange({ ...interaction, dc: parseInt(dc) })}
                  placeholder="DC"
                  size="sm"
                >
                  <SelectOption value={DIFFICULTY_CLASSES.EASY.toString()}>DC {DIFFICULTY_CLASSES.EASY}</SelectOption>
                  <SelectOption value={DIFFICULTY_CLASSES.MODERATE.toString()}>DC {DIFFICULTY_CLASSES.MODERATE}</SelectOption>
                  <SelectOption value={DIFFICULTY_CLASSES.HARD.toString()}>DC {DIFFICULTY_CLASSES.HARD}</SelectOption>
                  <SelectOption value={DIFFICULTY_CLASSES.VERY_HARD.toString()}>DC {DIFFICULTY_CLASSES.VERY_HARD}</SelectOption>
                </Select>
              </Box>
            </Box>
          </Box>

          {/* Visual Effect */}
          <Box css={{ marginBottom: '$4' }}>
            <FieldLabel css={{ marginBottom: '$2' }}>Visual Effect</FieldLabel>
            <Select
              value={interaction.effect || INTERACTION_EFFECTS.GLOW}
              onValueChange={(effect) => onInteractionChange({ ...interaction, effect })}
            >
              {Object.values(INTERACTION_EFFECTS).map((effect) => (
                <SelectOption key={effect} value={effect}>
                  <Text>{effect.replace('_', ' ').toLowerCase()}</Text>
                </SelectOption>
              ))}
            </Select>
          </Box>

          {/* Duration */}
          <Box css={{ marginBottom: '$4' }}>
            <FieldLabel css={{ marginBottom: '$2' }}>Animation Duration</FieldLabel>
            <Select
              value={interaction.duration?.toString() || INTERACTION_DURATIONS.NORMAL.toString()}
              onValueChange={(duration) => onInteractionChange({ ...interaction, duration: parseInt(duration) })}
            >
              <SelectOption value={INTERACTION_DURATIONS.INSTANT.toString()}>Instant</SelectOption>
              <SelectOption value={INTERACTION_DURATIONS.QUICK.toString()}>Quick (300ms)</SelectOption>
              <SelectOption value={INTERACTION_DURATIONS.NORMAL.toString()}>Normal (600ms)</SelectOption>
              <SelectOption value={INTERACTION_DURATIONS.SLOW.toString()}>Slow (1s)</SelectOption>
              <SelectOption value={INTERACTION_DURATIONS.VERY_SLOW.toString()}>Very Slow (1.5s)</SelectOption>
            </Select>
          </Box>

          {/* Result Description */}
          <Box css={{ marginBottom: '$4' }}>
            <FieldLabel css={{ marginBottom: '$2' }}>Result Description</FieldLabel>
            <Input
              placeholder="Describe what happens..."
              value={interaction.result || ''}
              onChange={(e) => onInteractionChange({ ...interaction, result: e.target.value })}
              size="sm"
            />
          </Box>
        </PanelSection>
      </PanelBody>
    </Panel>
  )
}

export const InteractionActionConfig = memo(InteractionActionConfigComponent)
InteractionActionConfig.displayName = 'InteractionActionConfig'