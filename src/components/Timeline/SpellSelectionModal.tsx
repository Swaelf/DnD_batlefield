import React, { useState, useCallback, useMemo } from 'react'
import { Zap, Flame, Snowflake, Shield, Heart, Skull, Eye, Wind, Search, X } from 'lucide-react'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Button } from '@/components/primitives/ButtonVE'
import { Input } from '@/components/ui/Input'
import { FieldLabel } from '@/components/ui/FieldLabel'
import { Modal } from '@/components/ui/Modal'
import type { SpellCategory, SpellEventData } from '@/types/timeline'

type SpellSelectionModalProps = {
  isOpen: boolean
  onClose: () => void
  onSelect: (spell: Partial<SpellEventData>) => void
}

// Spell presets with proper syntax
const spellPresets = [
  {
    id: 'fireball',
    name: 'Fireball',
    category: 'projectile-burst' as SpellCategory,
    color: '#ff4500',
    size: 20,
    range: 150,
    duration: 2,
    persistDuration: 1,
    icon: Flame,
    description: 'A bright streak flashes from your pointing finger to a point you choose',
    level: 3,
    school: 'Evocation'
  },
  {
    id: 'magicMissile',
    name: 'Magic Missile',
    category: 'projectile' as SpellCategory,
    color: '#9370db',
    size: 5,
    range: 120,
    duration: 1,
    icon: Zap,
    description: 'Three glowing darts of magical force strike your target',
    level: 1,
    school: 'Evocation'
  },
  {
    id: 'iceStorm',
    name: 'Ice Storm',
    category: 'area' as SpellCategory,
    color: '#87ceeb',
    size: 40,
    range: 300,
    duration: 3,
    persistDuration: 2,
    icon: Snowflake,
    description: 'A hail of rock-hard ice pounds to the ground in a cylinder',
    level: 4,
    school: 'Evocation'
  },
  {
    id: 'shield',
    name: 'Shield',
    category: 'area' as SpellCategory,
    color: '#4169e1',
    size: 10,
    range: 0,
    duration: 1,
    icon: Shield,
    description: 'An invisible barrier of magical force appears and protects you',
    level: 1,
    school: 'Abjuration'
  },
  {
    id: 'heal',
    name: 'Heal',
    category: 'area' as SpellCategory,
    color: '#32cd32',
    size: 15,
    range: 60,
    duration: 1,
    icon: Heart,
    description: 'Choose a creature that you can see within range',
    level: 6,
    school: 'Evocation'
  },
  {
    id: 'vampiricTouch',
    name: 'Vampiric Touch',
    category: 'projectile' as SpellCategory,
    color: '#8b0000',
    size: 8,
    range: 60,
    duration: 2,
    icon: Skull,
    description: 'The touch of your shadow-wreathed hand can siphon life force',
    level: 3,
    school: 'Necromancy'
  },
  {
    id: 'trueSeeing',
    name: 'True Seeing',
    category: 'area' as SpellCategory,
    color: '#ffd700',
    size: 12,
    range: 120,
    duration: 1,
    icon: Eye,
    description: 'This spell gives the willing creature you touch the ability to see things as they are',
    level: 6,
    school: 'Divination'
  },
  {
    id: 'gustOfWind',
    name: 'Gust of Wind',
    category: 'ray' as SpellCategory,
    color: '#e0e0e0',
    size: 25,
    range: 60,
    duration: 2,
    icon: Wind,
    description: 'A line of strong wind 60 feet long and 10 feet wide blasts from you',
    level: 2,
    school: 'Evocation'
  }
]

const spellSchools = [
  'All Schools',
  'Abjuration',
  'Conjuration',
  'Divination',
  'Enchantment',
  'Evocation',
  'Illusion',
  'Necromancy',
  'Transmutation'
]

export const SpellSelectionModal = ({
  isOpen,
  onClose,
  onSelect
}: SpellSelectionModalProps) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSchool, setSelectedSchool] = useState('All Schools')
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null)
  const [customSpell, setCustomSpell] = useState<Partial<SpellEventData>>({
    spellName: '',
    category: 'projectile',
    color: '#9370db',
    size: 20,
    range: 60,
    duration: 2
  })

  // Filter spells based on search and filters
  const filteredSpells = useMemo(() => {
    let filtered = spellPresets

    // Filter by search term
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(spell =>
        spell.name.toLowerCase().includes(search) ||
        spell.school.toLowerCase().includes(search) ||
        spell.description.toLowerCase().includes(search)
      )
    }

    // Filter by school
    if (selectedSchool !== 'All Schools') {
      filtered = filtered.filter(spell => spell.school === selectedSchool)
    }

    // Filter by level
    if (selectedLevel !== null) {
      filtered = filtered.filter(spell => spell.level === selectedLevel)
    }

    return filtered
  }, [searchTerm, selectedSchool, selectedLevel])

  const handleClose = useCallback(() => {
    setSearchTerm('')
    setSelectedSchool('All Schools')
    setSelectedLevel(null)
    onClose()
  }, [onClose])

  const handleSelectPreset = useCallback((spell: typeof spellPresets[0]) => {
    const spellData: Partial<SpellEventData> = {
      spellName: spell.name,
      category: spell.category,
      color: spell.color,
      size: spell.size,
      range: spell.range,
      duration: spell.duration,
      persistDuration: spell.persistDuration
    }
    onSelect(spellData)
    handleClose()
  }, [onSelect, handleClose])

  const handleSelectCustom = useCallback(() => {
    if (customSpell.spellName?.trim()) {
      onSelect(customSpell)
      handleClose()
    }
  }, [customSpell, onSelect, handleClose])

  const handleCustomSpellChange = useCallback((updates: Partial<SpellEventData>) => {
    setCustomSpell(prev => ({ ...prev, ...updates }))
  }, [])

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <Box
        style={{
          width: '800px',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <Box
          padding={4}
          style={{
            borderBottom: '1px solid var(--gray700)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={20} />
            <Text size="lg" weight="semibold">
              Select Spell
            </Text>
          </Box>
          <Button onClick={handleClose} variant="ghost" size="sm">
            <X size={16} />
          </Button>
        </Box>

        {/* Search and Filters */}
        <Box padding={4} style={{ borderBottom: '1px solid var(--gray700)' }}>
          {/* Search */}
          <Box marginBottom={3} style={{ position: 'relative' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--gray400)',
                pointerEvents: 'none'
              }}
            />
            <Input
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              placeholder="Search spells..."
              style={{ paddingLeft: '40px' }}
            />
          </Box>

          {/* Filters */}
          <Box display="grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }} gap={3}>
            <Box>
              <FieldLabel htmlFor="school">School</FieldLabel>
              <select
                id="school"
                value={selectedSchool}
                onChange={(e) => setSelectedSchool(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'var(--gray700)',
                  border: '1px solid var(--gray600)',
                  borderRadius: 'var(--radii-md)',
                  color: 'var(--white)',
                  fontSize: '14px'
                }}
              >
                {spellSchools.map(school => (
                  <option key={school} value={school}>{school}</option>
                ))}
              </select>
            </Box>

            <Box>
              <FieldLabel htmlFor="level">Level</FieldLabel>
              <select
                id="level"
                value={selectedLevel ?? ''}
                onChange={(e) => setSelectedLevel(e.target.value ? parseInt(e.target.value) : null)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'var(--gray700)',
                  border: '1px solid var(--gray600)',
                  borderRadius: 'var(--radii-md)',
                  color: 'var(--white)',
                  fontSize: '14px'
                }}
              >
                <option value="">All Levels</option>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => (
                  <option key={level} value={level}>Level {level}</option>
                ))}
              </select>
            </Box>
          </Box>
        </Box>

        {/* Content */}
        <Box
          style={{
            flex: 1,
            overflow: 'auto',
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '16px',
            padding: '16px'
          }}
        >
          {/* Spell Presets */}
          <Box>
            <Text size="md" weight="medium">
              Spell Presets ({filteredSpells.length})
            </Text>
            <Box style={{ display: 'grid', gap: '8px' }}>
              {filteredSpells.map((spell) => {
                const IconComponent = spell.icon
                return (
                  <Box
                    key={spell.id}
                    onClick={() => handleSelectPreset(spell)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px',
                      backgroundColor: 'var(--gray800)',
                      borderRadius: 'var(--radii-md)',
                      border: '1px solid var(--gray700)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--gray700)'
                      e.currentTarget.style.borderColor = spell.color
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--gray800)'
                      e.currentTarget.style.borderColor = 'var(--gray700)'
                    }}
                  >
                    {/* Spell Icon */}
                    <Box
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: 'var(--radii-lg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: spell.color,
                        color: 'white',
                        marginRight: '12px',
                        flexShrink: 0
                      }}
                    >
                      <IconComponent size={20} />
                    </Box>

                    {/* Spell Details */}
                    <Box style={{ flex: 1 }}>
                      <Text weight="medium">
                        {spell.name}
                      </Text>
                      <Text size="sm" color="textSecondary">
                        {spell.school} • Level {spell.level} • {spell.category}
                      </Text>
                      <Text size="xs" color="textTertiary">
                        {spell.description}
                      </Text>
                    </Box>

                    {/* Spell Properties */}
                    <Box style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'right' }}>
                      <Text size="xs" color="textSecondary">
                        Range: {spell.range}ft
                      </Text>
                      <Text size="xs" color="textSecondary">
                        Size: {spell.size}
                      </Text>
                      {spell.persistDuration && (
                        <Text size="xs" color="warning">
                          Persists: {spell.persistDuration}r
                        </Text>
                      )}
                    </Box>
                  </Box>
                )
              })}
            </Box>
          </Box>

          {/* Custom Spell */}
          <Box>
            <Text size="md" weight="medium">
              Custom Spell
            </Text>
            <Box
              padding={3}
              style={{
                backgroundColor: 'var(--gray800)',
                borderRadius: 'var(--radii-md)',
                border: '1px solid var(--gray700)'
              }}
            >
              <Box marginBottom={3}>
                <FieldLabel htmlFor="customName">Name</FieldLabel>
                <Input
                  id="customName"
                  value={customSpell.spellName || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleCustomSpellChange({ spellName: e.target.value })
                  }
                  placeholder="Custom spell name"
                  size="sm"
                />
              </Box>

              <Box marginBottom={3}>
                <FieldLabel htmlFor="customCategory">Category</FieldLabel>
                <select
                  id="customCategory"
                  value={customSpell.category || 'projectile'}
                  onChange={(e) =>
                    handleCustomSpellChange({ category: e.target.value as SpellCategory })
                  }
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: 'var(--gray700)',
                    border: '1px solid var(--gray600)',
                    borderRadius: 'var(--radii-md)',
                    color: 'var(--white)',
                    fontSize: '14px'
                  }}
                >
                  <option value="projectile">Projectile</option>
                  <option value="area">Area Effect</option>
                  <option value="ray">Ray</option>
                  <option value="projectile-burst">Projectile + Burst</option>
                </select>
              </Box>

              <Box marginBottom={3}>
                <FieldLabel htmlFor="customColor">Color</FieldLabel>
                <Input
                  id="customColor"
                  type="color"
                  value={customSpell.color || '#9370db'}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleCustomSpellChange({ color: e.target.value })
                  }
                  size="sm"
                />
              </Box>

              <Box display="grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }} gap={2} marginBottom={3}>
                <Box>
                  <FieldLabel htmlFor="customSize">Size</FieldLabel>
                  <Input
                    id="customSize"
                    type="number"
                    value={customSpell.size || 20}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleCustomSpellChange({ size: parseFloat(e.target.value) || 20 })
                    }
                    min="1"
                    max="100"
                    size="sm"
                  />
                </Box>

                <Box>
                  <FieldLabel htmlFor="customRange">Range</FieldLabel>
                  <Input
                    id="customRange"
                    type="number"
                    value={customSpell.range || 60}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleCustomSpellChange({ range: parseInt(e.target.value) || 60 })
                    }
                    min="0"
                    max="1000"
                    size="sm"
                  />
                </Box>
              </Box>

              <Box marginBottom={3}>
                <FieldLabel htmlFor="customDescription">Description</FieldLabel>
                <textarea
                  id="customDescription"
                  value={''}
                  onChange={() => {
                    // Description field not supported by SpellEventData
                  }}
                  placeholder="Describe the spell effect..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: 'var(--gray700)',
                    border: '1px solid var(--gray600)',
                    borderRadius: 'var(--radii-md)',
                    color: 'var(--white)',
                    fontSize: '14px',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </Box>

              <Button
                onClick={handleSelectCustom}
                variant="primary"
                size="sm"
                disabled={!customSpell.spellName?.trim()}
                style={{ width: '100%' }}
              >
                Use Custom Spell
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Footer */}
        <Box
          padding={3}
          style={{
            borderTop: '1px solid var(--gray700)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Text size="sm" color="textSecondary">
            Select a preset spell or create a custom one
          </Text>
          <Button onClick={handleClose} variant="outline" size="sm">
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  )
}

export default SpellSelectionModal