/**
 * Action Customization Modal Component
 * Advanced spell and attack customization interface
 */

import { useState, useEffect, useCallback, type FC, type ChangeEvent } from 'react'
import { Save, X, Wand2, Sword, Palette, Settings } from '@/utils/optimizedIcons'
import useAnimationStore from '@/store/animationStore'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Button } from '@/components/primitives/ButtonVE'
import { Input } from '@/components/ui/Input'
import { FieldLabel } from '@/components/ui/FieldLabel'
import { Modal } from '@/components/ui/Modal'
import type { UnifiedAction, ActionMetadata, ActionCategory } from '@/types/unifiedAction'

// ActionId is just a string identifier
type ActionId = string

// Extended metadata type for spell and attack customization
type ExtendedMetadata = ActionMetadata & {
  // Spell-specific properties
  level?: number
  school?: string
  range?: string
  components?: string
  castingTime?: string
  duration?: string
  concentration?: boolean
  ritual?: boolean
  areaSize?: number
  persistDuration?: number
  effectDescription?: string

  // Attack-specific properties
  damageType?: string
  weaponType?: string
  attackBonus?: number
  criticalRange?: number
  reach?: string
  properties?: string[]
}

export type ActionCustomizationModalProps = {
  isOpen: boolean
  onClose: () => void
  onSave: (customAction: UnifiedAction) => void
  baseAction: UnifiedAction | null
}

export const ActionCustomizationModal: FC<ActionCustomizationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  baseAction
}) => {
  const pauseAnimations = useAnimationStore(state => state.pauseAnimations)
  const resumeAnimations = useAnimationStore(state => state.resumeAnimations)

  const [customAction, setCustomAction] = useState<UnifiedAction | null>(null)
  const [isModified, setIsModified] = useState(false)

  // Performance optimization: Pause animations when modal is open
  useEffect(() => {
    if (isOpen) {
      pauseAnimations()
    } else {
      resumeAnimations()
    }

    // Cleanup: Resume animations when component unmounts
    return () => {
      resumeAnimations()
    }
  }, [isOpen, pauseAnimations, resumeAnimations])

  // Initialize customAction when baseAction changes
  useEffect(() => {
    if (baseAction) {
      setCustomAction({
        ...baseAction,
        id: `custom-${baseAction.id}-${Date.now()}` as ActionId,
        metadata: {
          ...baseAction.metadata,
          name: baseAction.metadata?.name || ''
        }
      })
      setIsModified(false)
    }
  }, [baseAction])

  const handleClose = useCallback(() => {
    setCustomAction(null)
    setIsModified(false)
    onClose()
  }, [onClose])

  const handleSave = useCallback(() => {
    if (customAction) {
      onSave(customAction)
      handleClose()
    }
  }, [customAction, onSave, handleClose])

  const handleActionChange = useCallback((updates: Partial<UnifiedAction>) => {
    if (customAction) {
      setCustomAction(prev => prev ? { ...prev, ...updates } : null)
      setIsModified(true)
    }
  }, [customAction])

  const handleMetadataChange = useCallback((metadataUpdates: Record<string, any>) => {
    if (customAction) {
      setCustomAction(prev => prev ? {
        ...prev,
        metadata: { ...prev.metadata, ...metadataUpdates }
      } : null)
      setIsModified(true)
    }
  }, [customAction])

  const handleAnimationChange = useCallback((animationUpdates: Record<string, any>) => {
    if (customAction) {
      setCustomAction(prev => prev ? {
        ...prev,
        animation: { ...prev.animation, ...animationUpdates }
      } : null)
      setIsModified(true)
    }
  }, [customAction])

  if (!customAction) return null

  const isSpell = customAction.type === 'spell'
  const isAttack = customAction.type === 'attack'

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
      padding="none"
      style={{
        backgroundColor: '#1A1A1A',
        border: '1px solid #374151'
      }}
    >
      <Box
        style={{
          width: '600px',
          maxHeight: '80vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--colors-gray900)',
          borderRadius: '12px',
          border: '1px solid var(--colors-gray700)'
        }}
      >
        {/* Header */}
        <Box
          style={{
            padding: '16px',
            borderBottom: '1px solid var(--colors-gray700)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'var(--colors-gray800)'
          }}
        >
          <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isSpell ? (
              <Wand2 size={20} color="var(--colors-purple400)" />
            ) : (
              <Sword size={20} color="var(--colors-red400)" />
            )}
            <Text
              variant="heading"
              size="lg"
              style={{
                margin: 0,
                fontWeight: '600',
                color: 'var(--colors-gray100)'
              }}
            >
              Customize {isSpell ? 'Spell' : 'Attack'}
            </Text>
          </Box>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              padding: '8px',
              borderRadius: '4px',
              cursor: 'pointer',
              color: 'var(--colors-gray400)'
            }}
          >
            <X size={16} />
          </Button>
        </Box>

        {/* Content */}
        <Box
          style={{
            padding: '16px',
            flex: 1,
            overflow: 'auto'
          }}
        >
          {/* Basic Information */}
          <Box style={{ marginBottom: '16px' }}>
            <Text
              variant="heading"
              size="md"
              style={{
                margin: '0 0 12px 0',
                fontWeight: '500',
                color: 'var(--colors-gray200)'
              }}
            >
              Basic Information
            </Text>

            <Box style={{ marginBottom: '12px' }}>
              <FieldLabel htmlFor="actionName" required>
                Name
              </FieldLabel>
              <Input
                id="actionName"
                value={customAction.metadata?.name || ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleActionChange({ metadata: { ...customAction.metadata, name: e.target.value } })
                }
                placeholder="Enter custom name..."
                size="sm"
              />
            </Box>

            <Box style={{ marginBottom: '12px' }}>
              <FieldLabel htmlFor="description">
                Description
              </FieldLabel>
              <Input
                id="description"
                value={customAction.metadata?.description || ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleMetadataChange({ description: e.target.value })
                }
                placeholder="Enter description..."
                size="sm"
              />
            </Box>

            <Box style={{ marginBottom: '12px' }}>
              <FieldLabel htmlFor="category">
                Category
              </FieldLabel>
              <Input
                id="category"
                value={customAction.category}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleActionChange({ category: e.target.value as ActionCategory })
                }
                placeholder="Enter category..."
                size="sm"
              />
            </Box>
          </Box>

          {/* Animation Properties */}
          <Box style={{ marginBottom: '16px' }}>
            <Box style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
              <Palette size={16} color="var(--colors-blue400)" style={{ marginRight: '8px' }} />
              <Text
                variant="heading"
                size="md"
                style={{
                  margin: 0,
                  fontWeight: '500',
                  color: 'var(--colors-gray200)'
                }}
              >
                Animation Properties
              </Text>
            </Box>

            <Box
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
                marginBottom: '12px'
              }}
            >
              <Box>
                <FieldLabel htmlFor="color">
                  Color
                </FieldLabel>
                <Input
                  id="color"
                  type="color"
                  value={customAction.animation?.color || '#ffffff'}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleAnimationChange({ color: e.target.value })
                  }
                  size="sm"
                />
              </Box>

              <Box>
                <FieldLabel htmlFor="size">
                  Size
                </FieldLabel>
                <Input
                  id="size"
                  type="number"
                  value={customAction.animation?.size || 50}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleAnimationChange({ size: parseFloat(e.target.value) || 50 })
                  }
                  min="1"
                  max="500"
                  size="sm"
                />
              </Box>

              <Box>
                <FieldLabel htmlFor="duration">
                  Duration (ms)
                </FieldLabel>
                <Input
                  id="duration"
                  type="number"
                  value={customAction.animation?.duration || 1000}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleAnimationChange({ duration: parseInt(e.target.value) || 1000 })
                  }
                  min="100"
                  max="10000"
                  size="sm"
                />
              </Box>

              <Box>
                <FieldLabel htmlFor="opacity">
                  Opacity
                </FieldLabel>
                <Input
                  id="opacity"
                  type="number"
                  value={customAction.animation?.customParams?.opacity || 1}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleAnimationChange({ customParams: { ...customAction.animation?.customParams, opacity: parseFloat(e.target.value) || 1 } })
                  }
                  min="0"
                  max="1"
                  step={0.1}
                  size="sm"
                />
              </Box>
            </Box>

            {/* Animation Type Selection */}
            <Box>
              <FieldLabel htmlFor="animationType">
                Animation Type
              </FieldLabel>
              <select
                id="animationType"
                value={customAction.animation?.type || 'projectile'}
                onChange={(e) =>
                  handleAnimationChange({ type: e.target.value })
                }
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'var(--colors-gray700)',
                  border: '1px solid var(--colors-gray600)',
                  borderRadius: '6px',
                  color: 'var(--colors-gray100)',
                  fontSize: '14px',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--colors-dndGold)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--colors-gray600)'
                }}
              >
                <option value="projectile">Projectile</option>
                <option value="area">Area Effect</option>
                <option value="beam">Beam</option>
                <option value="burst">Burst</option>
                <option value="ray">Ray</option>
                <option value="cone">Cone</option>
              </select>
            </Box>
          </Box>

          {/* Spell/Attack Specific Properties */}
          {(isSpell || isAttack) && (
            <Box style={{ marginBottom: '16px' }}>
              <Box style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                <Settings size={16} color="var(--colors-green400)" style={{ marginRight: '8px' }} />
                <Text
                  variant="heading"
                  size="md"
                  style={{
                    margin: 0,
                    fontWeight: '500',
                    color: 'var(--colors-gray200)'
                  }}
                >
                  {isSpell ? 'Spell' : 'Combat'} Properties
                </Text>
              </Box>

              <Box
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '12px'
                }}
              >
                {isSpell && (
                  <>
                    <Box>
                      <FieldLabel htmlFor="level">
                        Spell Level
                      </FieldLabel>
                      <Input
                        id="level"
                        type="number"
                        value={(customAction.metadata as ExtendedMetadata)?.level || 1}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          handleMetadataChange({ level: parseInt(e.target.value) || 1 })
                        }
                        min="0"
                        max="9"
                        size="sm"
                      />
                    </Box>

                    <Box>
                      <FieldLabel htmlFor="school">
                        School
                      </FieldLabel>
                      <Input
                        id="school"
                        value={(customAction.metadata as ExtendedMetadata)?.school || ''}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          handleMetadataChange({ school: e.target.value })
                        }
                        placeholder="e.g., Evocation"
                        size="sm"
                      />
                    </Box>

                    <Box>
                      <FieldLabel htmlFor="range">
                        Range
                      </FieldLabel>
                      <Input
                        id="range"
                        value={(customAction.metadata as ExtendedMetadata)?.range || ''}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          handleMetadataChange({ range: e.target.value })
                        }
                        placeholder="e.g., 120 feet"
                        size="sm"
                      />
                    </Box>

                    <Box>
                      <FieldLabel htmlFor="components">
                        Components
                      </FieldLabel>
                      <Input
                        id="components"
                        value={(customAction.metadata as ExtendedMetadata)?.components || ''}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          handleMetadataChange({ components: e.target.value })
                        }
                        placeholder="e.g., V, S, M"
                        size="sm"
                      />
                    </Box>
                  </>
                )}

                {isAttack && (
                  <>
                    <Box>
                      <FieldLabel htmlFor="damage">
                        Damage
                      </FieldLabel>
                      <Input
                        id="damage"
                        value={customAction.metadata?.damage || ''}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          handleMetadataChange({ damage: e.target.value })
                        }
                        placeholder="e.g., 1d8+3"
                        size="sm"
                      />
                    </Box>

                    <Box>
                      <FieldLabel htmlFor="damageType">
                        Damage Type
                      </FieldLabel>
                      <Input
                        id="damageType"
                        value={(customAction.metadata as ExtendedMetadata)?.damageType || ''}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          handleMetadataChange({ damageType: e.target.value })
                        }
                        placeholder="e.g., slashing"
                        size="sm"
                      />
                    </Box>

                    <Box>
                      <FieldLabel htmlFor="weaponType">
                        Weapon Type
                      </FieldLabel>
                      <Input
                        id="weaponType"
                        value={(customAction.metadata as ExtendedMetadata)?.weaponType || ''}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          handleMetadataChange({ weaponType: e.target.value })
                        }
                        placeholder="e.g., longsword"
                        size="sm"
                      />
                    </Box>

                    <Box>
                      <FieldLabel htmlFor="attackBonus">
                        Attack Bonus
                      </FieldLabel>
                      <Input
                        id="attackBonus"
                        type="number"
                        value={(customAction.metadata as ExtendedMetadata)?.attackBonus || 0}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          handleMetadataChange({ attackBonus: parseInt(e.target.value) || 0 })
                        }
                        size="sm"
                      />
                    </Box>
                  </>
                )}
              </Box>
            </Box>
          )}

          {/* Effects and Special Properties */}
          <Box style={{ marginBottom: '16px' }}>
            <Text
              variant="heading"
              size="md"
              style={{
                margin: '0 0 12px 0',
                fontWeight: '500',
                color: 'var(--colors-gray200)'
              }}
            >
              Special Effects
            </Text>

            <Box style={{ marginBottom: '12px' }}>
              <FieldLabel htmlFor="effectDescription">
                Effect Description
              </FieldLabel>
              <textarea
                id="effectDescription"
                value={(customAction.metadata as ExtendedMetadata)?.effectDescription || ''}
                onChange={(e) =>
                  handleMetadataChange({ effectDescription: e.target.value })
                }
                placeholder="Describe the visual and mechanical effects..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'var(--colors-gray700)',
                  border: '1px solid var(--colors-gray600)',
                  borderRadius: '6px',
                  color: 'var(--colors-gray100)',
                  fontSize: '14px',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--colors-dndGold)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--colors-gray600)'
                }}
              />
            </Box>

            <Box
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px'
              }}
            >
              <Box>
                <FieldLabel htmlFor="persistDuration">
                  Persist Duration (ms)
                </FieldLabel>
                <Input
                  id="persistDuration"
                  type="number"
                  value={(customAction.metadata as ExtendedMetadata)?.persistDuration || 0}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleMetadataChange({ persistDuration: parseInt(e.target.value) || 0 })
                  }
                  min="0"
                  placeholder="0 = no persistence"
                  size="sm"
                />
              </Box>

              <Box>
                <FieldLabel htmlFor="areaSize">
                  Area Size
                </FieldLabel>
                <Input
                  id="areaSize"
                  type="number"
                  value={(customAction.metadata as ExtendedMetadata)?.areaSize || 0}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleMetadataChange({ areaSize: parseFloat(e.target.value) || 0 })
                  }
                  min="0"
                  placeholder="0 = point target"
                  size="sm"
                />
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Footer */}
        <Box
          style={{
            padding: '16px',
            borderTop: '1px solid var(--colors-gray700)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'var(--colors-gray800)'
          }}
        >
          <Text
            variant="body"
            size="sm"
            style={{
              margin: 0,
              color: isModified ? 'var(--colors-green400)' : 'var(--colors-gray500)'
            }}
          >
            {isModified ? 'Modified' : 'No changes'}
          </Text>

          <Box style={{ display: 'flex', gap: '8px' }}>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClose}
              style={{
                backgroundColor: 'var(--colors-gray800)',
                borderColor: 'var(--colors-gray600)',
                color: 'var(--colors-gray300)'
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={!isModified}
              style={{
                backgroundColor: isModified ? 'var(--colors-dndRed)' : 'var(--colors-gray700)',
                borderColor: isModified ? 'var(--colors-dndRed)' : 'var(--colors-gray600)',
                color: isModified ? 'white' : 'var(--colors-gray500)',
                opacity: isModified ? 1 : 0.6,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Save size={14} />
              Save Custom {isSpell ? 'Spell' : 'Attack'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  )
}

export default ActionCustomizationModal