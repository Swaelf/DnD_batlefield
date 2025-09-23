import React, { useState } from 'react'
import { Zap, Flame, Snowflake, Shield, Heart, Skull, Eye, Wind } from 'lucide-react'
import { SpellCategory, SpellEventData } from '@/types/timeline'
import { Modal, ModalBody, Box, Text, Button, Input, Field, FieldLabel, ColorInput, Grid } from '@/components/ui'

type SpellSelectionModalProps = {
  isOpen: boolean
  onClose: () => void
  onSelect: (spell: Partial<SpellEventData>) => void
}

// Spell presets with icons
const spellPresets = [
  {
    id: 'fireball',
    name: 'Fireball',
    category: 'projectile-burst' as SpellCategory,
    color: '#ff4500',
    size: 20,
    range: 150,
    duration: 2,
    persistDuration: 1, // Burning ground persists for 1 round
    icon: Flame,
    description: 'A bright streak flashes from your pointing finger to a point you choose'
  },
  {
    id: 'magicMissile',
    name: 'Magic Missile',
    category: 'projectile' as SpellCategory,
    color: '#9370db',
    size: 8,
    range: 120,
    duration: 1.5,
    persistDuration: 0, // No persistent area
    projectileSpeed: 400,
    particleEffect: true,
    icon: Zap,
    description: 'Three glowing darts of magical force'
  },
  {
    id: 'lightningBolt',
    name: 'Lightning Bolt',
    category: 'ray' as SpellCategory,
    color: '#00bfff',
    size: 10,
    range: 100,
    duration: 1,
    persistDuration: 0, // No persistent area
    icon: Zap,
    description: 'A stroke of lightning forming a line'
  },
  {
    id: 'healingWord',
    name: 'Healing Word',
    category: 'burst' as SpellCategory,
    color: '#00ff00',
    size: 10,
    range: 60,
    duration: 1.5,
    persistDuration: 0, // No persistent area
    icon: Heart,
    description: 'A creature of your choice regains hit points'
  },
  {
    id: 'web',
    name: 'Web',
    category: 'area' as SpellCategory,
    color: '#f0f0f0',
    size: 20,
    duration: 0,
    persistDuration: 10, // 1 minute = 10 rounds (for testing, normally 600 for 1 hour)
    icon: Shield,
    description: 'Conjure a mass of thick, sticky webbing'
  },
  {
    id: 'coneOfCold',
    name: 'Cone of Cold',
    category: 'cone' as SpellCategory,
    color: '#87ceeb',
    size: 60,
    duration: 2,
    persistDuration: 0, // No persistent area
    icon: Snowflake,
    description: 'A blast of cold air erupts from your hands'
  },
  {
    id: 'cloudOfDaggers',
    name: 'Cloud of Daggers',
    category: 'area' as SpellCategory,
    color: '#708090',
    size: 5,
    duration: 0,
    persistDuration: 10, // 1 minute = 10 rounds
    icon: Wind,
    description: 'Fill the air with spinning daggers'
  },
  {
    id: 'darkness',
    name: 'Darkness',
    category: 'area' as SpellCategory,
    color: '#000000',
    size: 15,
    duration: 0,
    persistDuration: 10, // Using 10 rounds for testing (normally 100 for 10 minutes)
    icon: Eye,
    description: 'Magical darkness spreads from a point'
  },
  {
    id: 'blight',
    name: 'Blight',
    category: 'burst' as SpellCategory,
    color: '#8b008b',
    size: 30,
    duration: 3,
    persistDuration: 0, // No persistent area
    icon: Skull,
    description: 'Necromantic energy washes over a creature'
  }
]

const categoryDescriptions: Record<SpellCategory, string> = {
  'projectile': 'Single-target projectile',
  'projectile-burst': 'Projectile that explodes on impact',
  'ray': 'Line effect from caster',
  'cone': 'Cone-shaped area',
  'burst': 'Circular explosion',
  'area': 'Persistent area effect'
}

export const SpellSelectionModal: React.FC<SpellSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelect
}) => {
  const [selectedCategory, setSelectedCategory] = useState<SpellCategory | 'all'>('all')
  const [customSpell, setCustomSpell] = useState({
    name: '',
    category: 'burst' as SpellCategory,
    color: '#ff0000',
    size: 20,
    range: 120,
    duration: 3,
    persistDuration: 0,
    particleEffect: true,
    projectileSpeed: 500,
    trackTarget: true // Default to tracking for projectile and ray spells
  })
  const [isCustomMode, setIsCustomMode] = useState(false)

  const filteredPresets = selectedCategory === 'all'
    ? spellPresets
    : spellPresets.filter(spell => spell.category === selectedCategory)

  const handlePresetSelect = (preset: typeof spellPresets[0]) => {
    const spellData: Partial<SpellEventData> = {
      type: 'spell',
      spellName: preset.name,
      category: preset.category,
      color: preset.color,
      size: preset.size,
      range: preset.range,
      duration: preset.duration * 1000, // Convert to milliseconds
      persistDuration: preset.persistDuration,
      particleEffect: preset.particleEffect !== false, // Default to true unless explicitly false
      projectileSpeed: preset.projectileSpeed,
      // Default to tracking for projectile and ray spells
      trackTarget: preset.category === 'projectile' || preset.category === 'projectile-burst' || preset.category === 'ray'
    }

    // For projectile-burst spells, set the burstRadius as the area of effect radius in feet
    if (preset.category === 'projectile-burst') {
      spellData.burstRadius = 20 // Fireball has a 20 ft radius burst
    }

    onSelect(spellData)
    onClose()
  }

  const handleCustomSpellCreate = () => {
    const spellData: Partial<SpellEventData> = {
      type: 'spell',
      spellName: customSpell.name || 'Custom Spell',
      category: customSpell.category,
      color: customSpell.color,
      size: customSpell.size,
      range: customSpell.range,
      duration: customSpell.duration * 1000, // Convert to milliseconds
      persistDuration: customSpell.persistDuration,
      particleEffect: customSpell.particleEffect,
      projectileSpeed: customSpell.projectileSpeed,
      trackTarget: customSpell.trackTarget
    }

    // For projectile-burst spells, set the burstRadius as the area size
    if (customSpell.category === 'projectile-burst') {
      spellData.burstRadius = customSpell.size // Size is already in feet for area effects
    }

    onSelect(spellData)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title="Select Spell Effect"
      showCloseButton
    >
      <ModalBody display="flex" flexDirection="column" css={{ padding: '$4' }}>
        {/* Category Filter */}
        <Box css={{ marginBottom: '$4' }}>
          <Text size="sm" weight="medium" color="gray400" css={{ marginBottom: '$2' }}>
            Filter by Category
          </Text>
          <Box display="flex" css={{ gap: '$2', flexWrap: 'wrap' }}>
            <Button
              onClick={() => setSelectedCategory('all')}
              variant={selectedCategory === 'all' ? 'primary' : 'outline'}
              size="sm"
            >
              All Spells
            </Button>
            {Object.keys(categoryDescriptions).map((cat) => (
              <Button
                key={cat}
                onClick={() => setSelectedCategory(cat as SpellCategory)}
                variant={selectedCategory === cat ? 'primary' : 'outline'}
                size="sm"
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
              </Button>
            ))}
          </Box>
        </Box>

        {/* Toggle Custom Mode */}
        <Box css={{ marginBottom: '$4' }}>
          <Button
            onClick={() => setIsCustomMode(!isCustomMode)}
            variant={isCustomMode ? 'secondary' : 'outline'}
            size="sm"
          >
            {isCustomMode ? 'Show Presets' : 'Create Custom Spell'}
          </Button>
        </Box>

        {isCustomMode ? (
          /* Custom Spell Creator */
          <Box css={{ padding: '$4', backgroundColor: '$gray800', borderRadius: '$lg' }}>
            <Text size="lg" weight="medium" color="white" css={{ marginBottom: '$3' }}>
              Create Custom Spell
            </Text>

            <Grid columns="2" gap="4">
              <Field>
                <FieldLabel>Spell Name</FieldLabel>
                <Input
                  value={customSpell.name}
                  onChange={(e) => setCustomSpell({ ...customSpell, name: e.target.value })}
                  placeholder="Enter spell name"
                />
              </Field>

              <Field>
                <FieldLabel>Category</FieldLabel>
                <select
                  value={customSpell.category}
                  onChange={(e) => setCustomSpell({ ...customSpell, category: e.target.value as SpellCategory })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    backgroundColor: '#1a1a1a',
                    color: '#e5e5e5',
                    border: '1px solid #3a3a3a',
                    borderRadius: '6px'
                  }}
                >
                  {Object.entries(categoryDescriptions).map(([key, desc]) => (
                    <option key={key} value={key}>{desc}</option>
                  ))}
                </select>
              </Field>

              <Field>
                <FieldLabel>Color</FieldLabel>
                <ColorInput
                  value={customSpell.color}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomSpell({ ...customSpell, color: e.target.value })}
                />
              </Field>

              {/* Size field for area, burst, and projectile-burst spells */}
              {(customSpell.category === 'area' || customSpell.category === 'burst' || customSpell.category === 'projectile-burst') && (
                <Field>
                  <FieldLabel>Effect Size (ft)</FieldLabel>
                  <Input
                    type="number"
                    value={customSpell.size}
                    onChange={(e) => setCustomSpell({ ...customSpell, size: Number(e.target.value) })}
                    min={5}
                    max={100}
                  />
                </Field>
              )}

              {/* Range field for projectile, ray, and projectile-burst spells */}
              {(customSpell.category === 'projectile' || customSpell.category === 'ray' || customSpell.category === 'projectile-burst') && (
                <Field>
                  <FieldLabel>Spell Range (ft)</FieldLabel>
                  <Input
                    type="number"
                    value={customSpell.range}
                    onChange={(e) => setCustomSpell({ ...customSpell, range: Number(e.target.value) })}
                    min={5}
                    max={300}
                  />
                </Field>
              )}

              <Field>
                <FieldLabel>Duration (seconds)</FieldLabel>
                <Input
                  type="number"
                  value={customSpell.duration}
                  onChange={(e) => setCustomSpell({ ...customSpell, duration: Number(e.target.value) })}
                  min={0}
                  max={10}
                  step={0.5}
                />
              </Field>

              <Field>
                <FieldLabel>Persist Duration (rounds)</FieldLabel>
                <Input
                  type="number"
                  value={customSpell.persistDuration}
                  onChange={(e) => setCustomSpell({ ...customSpell, persistDuration: Number(e.target.value) })}
                  min={0}
                  max={100}
                />
              </Field>

              {/* Projectile-specific options */}
              {(customSpell.category === 'projectile' || customSpell.category === 'projectile-burst') && (
                <>
                  <Field>
                    <FieldLabel>Projectile Speed</FieldLabel>
                    <Input
                      type="number"
                      value={customSpell.projectileSpeed}
                      onChange={(e) => setCustomSpell({ ...customSpell, projectileSpeed: Number(e.target.value) })}
                      min={100}
                      max={1000}
                      step={50}
                    />
                  </Field>

                  <Field>
                    <FieldLabel css={{ display: 'flex', alignItems: 'center', gap: '$2' }}>
                      <input
                        type="checkbox"
                        checked={customSpell.particleEffect}
                        onChange={(e) => setCustomSpell({ ...customSpell, particleEffect: e.target.checked })}
                      />
                      Particle Trail Effect
                    </FieldLabel>
                  </Field>

                  <Field>
                    <FieldLabel css={{ display: 'flex', alignItems: 'center', gap: '$2' }}>
                      <input
                        type="checkbox"
                        checked={customSpell.trackTarget}
                        onChange={(e) => setCustomSpell({ ...customSpell, trackTarget: e.target.checked })}
                      />
                      Track Moving Target
                    </FieldLabel>
                  </Field>
                </>
              )}

              {/* Ray-specific options */}
              {customSpell.category === 'ray' && (
                <Field>
                  <FieldLabel css={{ display: 'flex', alignItems: 'center', gap: '$2' }}>
                    <input
                      type="checkbox"
                      checked={customSpell.trackTarget}
                      onChange={(e) => setCustomSpell({ ...customSpell, trackTarget: e.target.checked })}
                    />
                    Track Moving Target
                  </FieldLabel>
                </Field>
              )}
            </Grid>

            <Box display="flex" css={{ marginTop: '$4', justifyContent: 'flex-end' }}>
              <Button onClick={handleCustomSpellCreate} variant="primary">
                Use Custom Spell
              </Button>
            </Box>
          </Box>
        ) : (
          /* Spell Presets Grid */
          <Grid columns="3" gap="3">
            {filteredPresets.map((spell) => {
              const Icon = spell.icon
              return (
                <Box
                  key={spell.id}
                  css={{
                    padding: '$3',
                    backgroundColor: '$gray800',
                    borderRadius: '$lg',
                    border: '1px solid $gray700',
                    cursor: 'pointer',
                    transition: '$base',
                    '&:hover': {
                      backgroundColor: '$gray700',
                      borderColor: '$primary',
                      transform: 'translateY(-2px)'
                    }
                  }}
                  onClick={() => handlePresetSelect(spell)}
                >
                  <Box display="flex" css={{ alignItems: 'center', marginBottom: '$2' }}>
                    <Box
                      css={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '$md',
                        backgroundColor: spell.color + '20',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '$2'
                      }}
                    >
                      <Icon size={20} color={spell.color} />
                    </Box>
                    <Box css={{ flex: 1 }}>
                      <Text weight="medium" color="white" size="sm">
                        {spell.name}
                      </Text>
                      <Text size="xs" color="gray400">
                        {categoryDescriptions[spell.category]}
                      </Text>
                    </Box>
                  </Box>
                  <Text size="xs" color="gray300" css={{ lineHeight: 1.4 }}>
                    {spell.description}
                  </Text>
                </Box>
              )
            })}
          </Grid>
        )}
      </ModalBody>
    </Modal>
  )
}