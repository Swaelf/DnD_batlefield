import { memo, useState, useCallback } from 'react'
import { Sword, Target, Dices, Zap } from 'lucide-react'
import {
  Box,
  Text,
  Button,
  Select,
  SelectOption,
  Input,
  Label,
  FieldLabel,
  Grid
} from '@/components/ui'
import {
  WEAPON_PRESETS,
  ATTACK_TYPES,
  CRITICAL_HIT,
  DAMAGE_TYPE_COLORS,
  DAMAGE_TYPES
} from '@/constants/attacks'
import type { AttackEventData } from '@/types'

type AttackActionConfigProps = {
  selectedAttack: Partial<AttackEventData> | null
  onAttackChange: (attack: Partial<AttackEventData>) => void
  disabled?: boolean
}

const AttackActionConfigComponent = ({
  selectedAttack,
  onAttackChange,
  disabled = false
}: AttackActionConfigProps) => {
  const [customWeapon, setCustomWeapon] = useState(false)

  const handleWeaponPresetChange = useCallback((weaponKey: string) => {
    if (weaponKey === 'none') {
      // Reset to no weapon selected
      onAttackChange({
        ...selectedAttack,
        weaponName: '',
        weaponType: '',
        damage: '',
        damageType: DAMAGE_TYPES.SLASHING,
        attackType: 'melee',
        animation: 'melee_swing',
        color: DAMAGE_TYPE_COLORS[DAMAGE_TYPES.SLASHING],
        attackBonus: 0,
        range: 5,
        duration: 800,
      })
      setCustomWeapon(false)
      return
    }

    if (weaponKey === 'custom') {
      setCustomWeapon(true)
      onAttackChange({
        ...selectedAttack,
        weaponName: 'Custom Weapon',
        weaponType: 'custom',
        damage: '1d6',
        damageType: DAMAGE_TYPES.SLASHING,
        attackType: 'melee',
        animation: 'melee_slash',
        color: DAMAGE_TYPE_COLORS[DAMAGE_TYPES.SLASHING],
        attackBonus: 0,
        range: 5,
        duration: 800,
      })
      return
    }

    const weaponData = WEAPON_PRESETS[weaponKey as keyof typeof WEAPON_PRESETS]
    if (weaponData) {
      onAttackChange({
        ...selectedAttack,
        weaponName: weaponData.name,
        weaponType: weaponKey,
        damage: weaponData.damage,
        damageType: weaponData.damageType,
        attackType: weaponData.type === ATTACK_TYPES.MELEE_WEAPON ? 'melee' :
                   weaponData.type === ATTACK_TYPES.RANGED_WEAPON ? 'ranged' :
                   weaponData.type === ATTACK_TYPES.NATURAL_WEAPON ? 'natural' : 'melee',
        animation: weaponData.animation,
        color: DAMAGE_TYPE_COLORS[weaponData.damageType] || weaponData.color,
        attackBonus: 0, // Will be set by user
        range: typeof weaponData.range === 'number' ? weaponData.range : weaponData.range?.short || 5,
        duration: 800, // Default animation duration
        properties: Array.from(weaponData.properties || []),
      })
    }
  }, [selectedAttack, onAttackChange])

  const handleFieldChange = useCallback((field: keyof AttackEventData, value: any) => {
    onAttackChange({
      ...selectedAttack,
      [field]: value
    })
  }, [selectedAttack, onAttackChange])

  const handleDamageTypeChange = useCallback((damageType: string) => {
    const color = DAMAGE_TYPE_COLORS[damageType as keyof typeof DAMAGE_TYPE_COLORS]
    onAttackChange({
      ...selectedAttack,
      damageType,
      color: color || '#FFFFFF'
    })
  }, [selectedAttack, onAttackChange])

  const weaponOptions = [
    { value: 'none', label: 'Select Weapon...' },
    { value: 'LONGSWORD', label: '🗡️ Longsword (1d8 slashing)' },
    { value: 'SHORTSWORD', label: '🗡️ Shortsword (1d6 piercing)' },
    { value: 'DAGGER', label: '🗡️ Dagger (1d4 piercing)' },
    { value: 'RAPIER', label: '🗡️ Rapier (1d8 piercing)' },
    { value: 'BATTLEAXE', label: '🪓 Battleaxe (1d8 slashing)' },
    { value: 'GREATAXE', label: '🪓 Greataxe (1d12 slashing)' },
    { value: 'GREATSWORD', label: '⚔️ Greatsword (2d6 slashing)' },
    { value: 'MACE', label: '🔨 Mace (1d6 bludgeoning)' },
    { value: 'CLUB', label: '🏏 Club (1d4 bludgeoning)' },
    { value: 'HANDAXE', label: '🪓 Handaxe (1d6 slashing)' },
    { value: 'SHORTBOW', label: '🏹 Shortbow (1d6 piercing)' },
    { value: 'LONGBOW', label: '🏹 Longbow (1d8 piercing)' },
    { value: 'LIGHT_CROSSBOW', label: '🏹 Light Crossbow (1d8 piercing)' },
    { value: 'HEAVY_CROSSBOW', label: '🏹 Heavy Crossbow (1d10 piercing)' },
    { value: 'BITE', label: '🦷 Bite (1d6 piercing)' },
    { value: 'CLAW', label: '🐾 Claw (1d4 slashing)' },
    { value: 'TAIL_SLAP', label: '🐉 Tail Slap (1d8 bludgeoning)' },
    { value: 'UNARMED_STRIKE', label: '👊 Unarmed Strike (1 bludgeoning)' },
    { value: 'custom', label: '⚙️ Custom Weapon...' },
  ]

  const damageTypeOptions = Object.values(DAMAGE_TYPES).map(type => ({
    value: type,
    label: type.charAt(0).toUpperCase() + type.slice(1)
  }))

  return (
    <Box css={{ padding: '$3', marginTop: '$2', backgroundColor: '$gray800', borderRadius: '$md', border: '1px solid $gray700' }}>
      <Box css={{ display: 'flex', flexDirection: 'column', gap: '$3' }}>
        {/* Header */}
        <Box css={{ display: 'flex', alignItems: 'center', gap: '$2' }}>
          <Sword size={16} />
          <Text size="md" weight="medium">Attack Configuration</Text>
        </Box>

        {/* Weapon Selection */}
        <Box>
          <FieldLabel>
            <Target size={14} style={{ marginRight: '8px' }} />
            Weapon
          </FieldLabel>
          <Select
            value={selectedAttack?.weaponType || 'none'}
            onValueChange={handleWeaponPresetChange}
            disabled={disabled}
            placeholder="Select Weapon..."
          >
            {weaponOptions.map(option => (
              <SelectOption key={option.value} value={option.value}>
                {option.label}
              </SelectOption>
            ))}
          </Select>
        </Box>

        {/* Custom Weapon Fields */}
        {customWeapon && (
          <Grid columns="2" gap="$2">
            <Box>
              <Label htmlFor="weapon-name">Weapon Name</Label>
              <Input
                id="weapon-name"
                value={selectedAttack?.weaponName || ''}
                onChange={(e) => handleFieldChange('weaponName', e.target.value)}
                placeholder="Custom weapon name"
                disabled={disabled}
              />
            </Box>
            <Box>
              <Label htmlFor="attack-type">Attack Type</Label>
              <Select
                value={selectedAttack?.attackType || 'melee'}
                onValueChange={(value) => handleFieldChange('attackType', value)}
                disabled={disabled}
              >
                <SelectOption value="melee">Melee</SelectOption>
                <SelectOption value="ranged">Ranged</SelectOption>
                <SelectOption value="natural">Natural</SelectOption>
                <SelectOption value="spell">Spell Attack</SelectOption>
                <SelectOption value="unarmed">Unarmed</SelectOption>
              </Select>
            </Box>
          </Grid>
        )}

        {/* Attack Properties */}
        <Grid columns="2" gap="$2">
          <Box>
            <Label htmlFor="damage">
              <Dices size={14} style={{ marginRight: '8px' }} />
              Damage
            </Label>
            <Input
              id="damage"
              value={selectedAttack?.damage || ''}
              onChange={(e) => handleFieldChange('damage', e.target.value)}
              placeholder="e.g., 1d8, 2d6+3"
              disabled={disabled || !customWeapon}
            />
          </Box>
          <Box>
            <Label htmlFor="damage-type">Damage Type</Label>
            <Select
              value={selectedAttack?.damageType || DAMAGE_TYPES.SLASHING}
              onValueChange={handleDamageTypeChange}
              disabled={disabled || !customWeapon}
            >
              {damageTypeOptions.map(option => (
                <SelectOption key={option.value} value={option.value}>
                  <Box css={{ display: 'flex', alignItems: 'center', gap: '$2' }}>
                    <Box
                      css={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: DAMAGE_TYPE_COLORS[option.value as keyof typeof DAMAGE_TYPE_COLORS]
                      }}
                    />
                    {option.label}
                  </Box>
                </SelectOption>
              ))}
            </Select>
          </Box>
        </Grid>

        {/* Attack Bonus and Range */}
        <Grid columns="2" gap="$2">
          <Box>
            <Label htmlFor="attack-bonus">Attack Bonus</Label>
            <Input
              id="attack-bonus"
              type="number"
              value={selectedAttack?.attackBonus || 0}
              onChange={(e) => handleFieldChange('attackBonus', parseInt(e.target.value) || 0)}
              placeholder="0"
              disabled={disabled}
            />
          </Box>
          <Box>
            <Label htmlFor="range">Range (feet)</Label>
            <Input
              id="range"
              type="number"
              value={selectedAttack?.range || 5}
              onChange={(e) => handleFieldChange('range', parseInt(e.target.value) || 5)}
              placeholder="5"
              disabled={disabled}
            />
          </Box>
        </Grid>

        {/* Critical Hit Range */}
        <Box>
          <Label htmlFor="crit-range">Critical Hit Range</Label>
          <Select
            value={selectedAttack?.criticalRange?.toString() || CRITICAL_HIT.DEFAULT_RANGE.toString()}
            onValueChange={(value) => handleFieldChange('criticalRange', parseInt(value))}
            disabled={disabled}
          >
            <SelectOption value="20">20 (Natural 20 only)</SelectOption>
            <SelectOption value="19">19-20 (Improved Critical)</SelectOption>
            <SelectOption value="18">18-20 (Champion Fighter)</SelectOption>
          </Select>
        </Box>

        {/* Advanced Options Toggle */}
        <Box css={{ paddingTop: '$2', borderTop: '1px solid $colors$gray300' }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleFieldChange('showAdvanced', !selectedAttack?.showAdvanced)}
            disabled={disabled}
          >
            <Zap size={14} />
            Advanced Options
          </Button>
        </Box>

        {/* Advanced Options */}
        {selectedAttack?.showAdvanced && (
          <Box css={{ display: 'flex', flexDirection: 'column', gap: '$2' }}>
            <Grid columns="2" gap="$2">
              <Box>
                <Label htmlFor="duration">Animation Duration (ms)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={selectedAttack?.duration || 800}
                  onChange={(e) => handleFieldChange('duration', parseInt(e.target.value) || 800)}
                  placeholder="800"
                  disabled={disabled}
                />
              </Box>
              <Box>
                <Label htmlFor="color">Effect Color</Label>
                <Input
                  id="color"
                  type="color"
                  value={selectedAttack?.color || '#FFFFFF'}
                  onChange={(e) => handleFieldChange('color', e.target.value)}
                  disabled={disabled}
                />
              </Box>
            </Grid>
          </Box>
        )}

        {/* Preview */}
        {selectedAttack?.weaponName && (
          <Box css={{
            padding: '$2',
            backgroundColor: '$gray100',
            borderRadius: '$2',
            marginTop: '$2'
          }}>
            <Text size="$2" color="$gray700">
              Preview: {selectedAttack.weaponName} - {selectedAttack.damage} {selectedAttack.damageType} damage,
              +{selectedAttack.attackBonus} to hit, {selectedAttack.range}ft range
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  )
}

export const AttackActionConfig = memo(AttackActionConfigComponent)