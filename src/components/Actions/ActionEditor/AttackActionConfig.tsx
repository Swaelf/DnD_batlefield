import React, { memo, useState, useCallback } from 'react'
import { Sword, Target, Dices, Zap } from 'lucide-react'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Button } from '@/components/primitives/ButtonVE'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import {
  WEAPON_PRESETS,
  ATTACK_TYPES,
  DAMAGE_TYPE_COLORS,
  DAMAGE_TYPES
} from '@/constants/attacks'
import type { AttackEventData } from '@/types/timeline'

export type AttackActionConfigProps = {
  selectedAttack: Partial<AttackEventData> | null
  onAttackChange: (attack: Partial<AttackEventData>) => void
  disabled?: boolean
}

const AttackActionConfigComponent: React.FC<AttackActionConfigProps> = ({
  selectedAttack,
  onAttackChange,
  disabled = false
}) => {
  const [customWeapon, setCustomWeapon] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [criticalRange, setCriticalRange] = useState(20)

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
    <Box
      style={{
        padding: '16px',
        marginTop: '8px',
        backgroundColor: 'var(--colors-gray800)',
        borderRadius: '8px',
        border: '1px solid var(--colors-gray700)'
      }}
    >
      <Box style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Header */}
        <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sword size={16} />
          <Text
            variant="body"
            size="md"
            style={{
              fontWeight: '500',
              margin: 0,
              color: 'var(--colors-gray100)'
            }}
          >
            Attack Configuration
          </Text>
        </Box>

        {/* Weapon Selection */}
        <Box>
          <Box style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
            <Target size={14} style={{ marginRight: '8px' }} />
            <Text
              variant="label"
              size="sm"
              style={{
                margin: 0,
                color: 'var(--colors-gray200)',
                fontWeight: '500'
              }}
            >
              Weapon
            </Text>
          </Box>
          <Select
            value={selectedAttack?.weaponType || 'none'}
            onValueChange={handleWeaponPresetChange}
            disabled={disabled}
          >
            {weaponOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Box>

        {/* Custom Weapon Fields */}
        {customWeapon && (
          <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            <Box>
              <Text
                variant="label"
                size="sm"
                style={{
                  display: 'block',
                  marginBottom: '4px',
                  color: 'var(--colors-gray200)',
                  fontWeight: '500'
                }}
              >
                Weapon Name
              </Text>
              <Input
                value={selectedAttack?.weaponName || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('weaponName', e.target.value)}
                placeholder="Custom weapon name"
                disabled={disabled}
              />
            </Box>
            <Box>
              <Text
                variant="label"
                size="sm"
                style={{
                  display: 'block',
                  marginBottom: '4px',
                  color: 'var(--colors-gray200)',
                  fontWeight: '500'
                }}
              >
                Attack Type
              </Text>
              <Select
                value={selectedAttack?.attackType || 'melee'}
                onValueChange={(value) => handleFieldChange('attackType', value)}
                disabled={disabled}
              >
                <option value="melee">Melee</option>
                <option value="ranged">Ranged</option>
                <option value="natural">Natural</option>
                <option value="spell">Spell Attack</option>
                <option value="unarmed">Unarmed</option>
              </Select>
            </Box>
          </Box>
        )}

        {/* Attack Properties */}
        <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          <Box>
            <Box style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
              <Dices size={14} style={{ marginRight: '8px' }} />
              <Text
                variant="label"
                size="sm"
                style={{
                  margin: 0,
                  color: 'var(--colors-gray200)',
                  fontWeight: '500'
                }}
              >
                Damage
              </Text>
            </Box>
            <Input
              value={selectedAttack?.damage || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('damage', e.target.value)}
              placeholder="e.g., 1d8, 2d6+3"
              disabled={disabled || !customWeapon}
            />
          </Box>
          <Box>
            <Text
              variant="label"
              size="sm"
              style={{
                display: 'block',
                marginBottom: '4px',
                color: 'var(--colors-gray200)',
                fontWeight: '500'
              }}
            >
              Damage Type
            </Text>
            <Select
              value={selectedAttack?.damageType || DAMAGE_TYPES.SLASHING}
              onValueChange={handleDamageTypeChange}
              disabled={disabled || !customWeapon}
            >
              {damageTypeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Box>
        </Box>

        {/* Attack Bonus and Range */}
        <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          <Box>
            <Text
              variant="label"
              size="sm"
              style={{
                display: 'block',
                marginBottom: '4px',
                color: 'var(--colors-gray200)',
                fontWeight: '500'
              }}
            >
              Attack Bonus
            </Text>
            <Input
              type="number"
              value={selectedAttack?.attackBonus || 0}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('attackBonus', parseInt(e.target.value) || 0)}
              placeholder="0"
              disabled={disabled}
            />
          </Box>
          <Box>
            <Text
              variant="label"
              size="sm"
              style={{
                display: 'block',
                marginBottom: '4px',
                color: 'var(--colors-gray200)',
                fontWeight: '500'
              }}
            >
              Range (feet)
            </Text>
            <Input
              type="number"
              value={selectedAttack?.range || 5}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('range', parseInt(e.target.value) || 5)}
              placeholder="5"
              disabled={disabled}
            />
          </Box>
        </Box>

        {/* Critical Hit Range */}
        <Box>
          <Text
            variant="label"
            size="sm"
            style={{
              display: 'block',
              marginBottom: '4px',
              color: 'var(--colors-gray200)',
              fontWeight: '500'
            }}
          >
            Critical Hit Range
          </Text>
          <Select
            value={criticalRange.toString()}
            onValueChange={(value) => setCriticalRange(parseInt(value))}
            disabled={disabled}
          >
            <option value="20">20 (Natural 20 only)</option>
            <option value="19">19-20 (Improved Critical)</option>
            <option value="18">18-20 (Champion Fighter)</option>
          </Select>
        </Box>

        {/* Advanced Options Toggle */}
        <Box
          style={{
            paddingTop: '8px',
            borderTop: '1px solid var(--colors-gray600)'
          }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            disabled={disabled}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Zap size={14} />
            Advanced Options
          </Button>
        </Box>

        {/* Advanced Options */}
        {showAdvanced && (
          <Box style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              <Box>
                <Text
                  variant="label"
                  size="sm"
                  style={{
                    display: 'block',
                    marginBottom: '4px',
                    color: 'var(--colors-gray200)',
                    fontWeight: '500'
                  }}
                >
                  Animation Duration (ms)
                </Text>
                <Input
                  type="number"
                  value={selectedAttack?.duration || 800}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('duration', parseInt(e.target.value) || 800)}
                  placeholder="800"
                  disabled={disabled}
                />
              </Box>
              <Box>
                <Text
                  variant="label"
                  size="sm"
                  style={{
                    display: 'block',
                    marginBottom: '4px',
                    color: 'var(--colors-gray200)',
                    fontWeight: '500'
                  }}
                >
                  Effect Color
                </Text>
                <Input
                  type="color"
                  value={selectedAttack?.color || '#FFFFFF'}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('color', e.target.value)}
                  disabled={disabled}
                />
              </Box>
            </Box>
          </Box>
        )}

        {/* Preview */}
        {selectedAttack?.weaponName && (
          <Box
            style={{
              padding: '8px',
              backgroundColor: 'var(--colors-gray100)',
              borderRadius: '4px',
              marginTop: '8px'
            }}
          >
            <Text
              variant="body"
              size="sm"
              style={{
                margin: 0,
                color: 'var(--colors-gray700)'
              }}
            >
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