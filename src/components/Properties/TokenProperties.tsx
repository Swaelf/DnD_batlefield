import { memo, type FC, type ChangeEvent } from 'react'
import type { Token } from '@/types'
import { Heart, Shield, Plus, Minus } from '@/utils/optimizedIcons'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Button } from '@/components/primitives/ButtonVE'
import { Input } from '@/components/ui/Input'

type TokenPropertiesProps = {
  token: Token
  onUpdate: (updates: Partial<Token>) => void
}

const TokenPropertiesComponent: FC<TokenPropertiesProps> = ({
  token,
  onUpdate
}) => {
  return (
    <Box display="flex" flexDirection="column" gap={3} padding={3} data-testid="token-properties">
      {/* Token Information */}
      <Box display="flex" flexDirection="column" gap={2}>
        <Text size="xs" weight="semibold" color="gray300">Token Information</Text>

        <Box display="flex" flexDirection="column" gap={2}>
          {/* Name */}
          <Box>
            <Box marginBottom={1}>
              <Text size="xs" color="gray400">Name</Text>
            </Box>
            <Input
              value={token.name || ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onUpdate({ name: e.target.value })}
              placeholder="Token name"
              size="sm"
              fullWidth
              style={{ border: '1px solid #525252' }}
            />
          </Box>

          {/* Size and Shape Row */}
          <Box display="flex" gap={2}>
            <Box flexGrow={1}>
              <Box marginBottom={1}>
                <Text size="xs" color="gray400">Size</Text>
              </Box>
              <Box display="flex" gap={1}>
                <select
                  value={token.size}
                  onChange={(e) => onUpdate({ size: e.target.value as Token['size'] })}
                  style={{
                    width: '100%',
                    padding: '4px 8px',
                    fontSize: '12px',
                    backgroundColor: '#262626',
                    border: '1px solid #525252',
                    borderRadius: '4px',
                    color: '#F5F5F5',
                    cursor: 'pointer'
                  }}
                >
                  <option value="tiny">Tiny</option>
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                  <option value="huge">Huge</option>
                  <option value="gargantuan">Gargantuan</option>
                </select>
              </Box>
            </Box>

            <Box style={{ width: '80px' }}>
              <Box marginBottom={1}>
                <Text size="xs" color="gray400">Shape</Text>
              </Box>
              <Box display="flex" gap={1}>
                <Button
                  onClick={() => onUpdate({ shape: 'circle' })}
                  size="sm"
                  variant={token.shape === 'circle' ? 'primary' : 'outline'}
                  style={{
                    flex: 1,
                    padding: '4px',
                    minWidth: '0',
                    backgroundColor: token.shape === 'circle' ? '#C9AD6A' : 'transparent',
                    borderColor: token.shape === 'circle' ? '#C9AD6A' : '#525252',
                    color: token.shape === 'circle' ? '#1A1A1A' : '#D4D4D4'
                  }}
                >
                  ○
                </Button>
                <Button
                  onClick={() => onUpdate({ shape: 'square' })}
                  size="sm"
                  variant={token.shape === 'square' ? 'primary' : 'outline'}
                  style={{
                    flex: 1,
                    padding: '4px',
                    minWidth: '0',
                    backgroundColor: token.shape === 'square' ? '#C9AD6A' : 'transparent',
                    borderColor: token.shape === 'square' ? '#C9AD6A' : '#525252',
                    color: token.shape === 'square' ? '#1A1A1A' : '#D4D4D4'
                  }}
                >
                  □
                </Button>
              </Box>
            </Box>
          </Box>

          {/* Color */}
          <Box>
            <Box marginBottom={1}>
              <Text size="xs" color="gray400">Color</Text>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <input
                type="color"
                value={token.color}
                onChange={(e) => onUpdate({ color: e.target.value })}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  backgroundColor: 'transparent',
                  border: '1px solid #525252'
                }}
              />
              <Input
                value={token.color}
                onChange={(e: ChangeEvent<HTMLInputElement>) => onUpdate({ color: e.target.value })}
                size="sm"
                fullWidth
                style={{ border: '1px solid #525252' }}
              />
            </Box>
          </Box>

          {/* Show Label Checkbox */}
          <Box display="flex" alignItems="center" gap={2}>
            <input
              type="checkbox"
              id="showLabel"
              checked={token.showLabel || false}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onUpdate({ showLabel: e.target.checked })}
              style={{
                width: '14px',
                height: '14px',
                cursor: 'pointer'
              }}
            />
            <label
              htmlFor="showLabel"
              style={{
                cursor: 'pointer',
                fontSize: '12px',
                color: '#D4D4D4'
              }}
            >
              Show Label
            </label>
          </Box>

          {/* Label Position - only show if showLabel is true */}
          {token.showLabel && (
            <Box>
              <Box marginBottom={1}>
                <Text size="xs" color="gray400">Label Position</Text>
              </Box>
              <select
                value={token.labelPosition || 'bottom'}
                onChange={(e) => onUpdate({ labelPosition: e.target.value as Token['labelPosition'] })}
                style={{
                  width: '100%',
                  padding: '4px 8px',
                  fontSize: '12px',
                  backgroundColor: '#262626',
                  border: '1px solid #525252',
                  borderRadius: '4px',
                  color: '#F5F5F5',
                  cursor: 'pointer'
                }}
              >
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
              </select>
            </Box>
          )}
        </Box>
      </Box>

      {/* Divider */}
      <Box style={{
        height: '1px',
        backgroundColor: '#404040',
        margin: '8px 0'
      }} />

      {/* HP Management */}
      <Box display="flex" flexDirection="column" gap={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <Heart size={14} color="#EF4444" />
          <Text size="xs" weight="semibold" color="gray300">Hit Points</Text>
        </Box>

        {/* Visual HP Indicator - Linear Progress Bar */}
        {token.maxHP && token.maxHP > 0 && (
          <Box display="flex" flexDirection="column" gap={1} data-testid="hp-indicator">
            <Box
              style={{
                height: '8px',
                backgroundColor: '#404040',
                borderRadius: '4px',
                overflow: 'hidden',
                border: '1px solid #525252'
              }}
            >
              <Box
                style={{
                  height: '100%',
                  width: `${Math.min(100, Math.max(0, ((token.currentHP || 0) / token.maxHP) * 100))}%`,
                  backgroundColor: !token.currentHP || token.currentHP <= 0
                    ? '#737373'
                    : token.currentHP <= (token.maxHP / 4)
                      ? '#EF4444'
                      : token.currentHP <= (token.maxHP / 2)
                        ? '#F59E0B'
                        : '#10B981',
                  transition: 'width 0.3s ease'
                }}
              />
            </Box>
            <Text
              size="xs"
              weight="semibold"
              style={{
                color: !token.currentHP || token.currentHP <= 0
                  ? '#737373'
                  : token.currentHP <= (token.maxHP / 4)
                    ? '#EF4444'
                    : token.currentHP <= (token.maxHP / 2)
                      ? '#F59E0B'
                      : '#10B981'
              }}
            >
              {token.currentHP || 0} / {token.maxHP}{token.tempHP ? ` (+${token.tempHP})` : ''}
            </Text>
          </Box>
        )}

        {/* Show HP Ring Checkbox */}
        <Box display="flex" alignItems="center" gap={2}>
          <input
            type="checkbox"
            id="showHP"
            checked={token.showHP || false}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onUpdate({ showHP: e.target.checked })}
            style={{
              width: '14px',
              height: '14px',
              cursor: 'pointer'
            }}
          />
          <label
            htmlFor="showHP"
            style={{
              cursor: 'pointer',
              fontSize: '12px',
              color: '#D4D4D4'
            }}
          >
            Show HP Ring
          </label>
        </Box>

        {/* Current and Max HP */}
        <Box display="flex" gap={2}>
          <Box flexGrow={1}>
            <Box marginBottom={1}>
              <Text size="xs" color="gray400">Current HP</Text>
            </Box>
            <Box display="flex" gap={1}>
              <Input
                type="number"
                value={token.currentHP || 0}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  onUpdate({ currentHP: parseInt(e.target.value) || 0 })}
                size="sm"
                fullWidth
                style={{ border: '1px solid #525252' }}
              />
              <Button
                onClick={() => onUpdate({ currentHP: Math.max(0, (token.currentHP || 0) - 1) })}
                size="sm"
                variant="outline"
                title="Decrease by 1"
                style={{ padding: '4px 6px' }}
              >
                <Minus size={12} />
              </Button>
              <Button
                onClick={() => onUpdate({ currentHP: (token.currentHP || 0) + 1 })}
                size="sm"
                variant="outline"
                title="Increase by 1"
                style={{ padding: '4px 6px' }}
              >
                <Plus size={12} />
              </Button>
            </Box>
          </Box>

          <Box style={{ width: '80px' }}>
            <Box marginBottom={1}>
              <Text size="xs" color="gray400">Max HP</Text>
            </Box>
            <Input
              type="number"
              value={token.maxHP || 0}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                onUpdate({ maxHP: parseInt(e.target.value) || 0 })}
              size="sm"
              fullWidth
              style={{ border: '1px solid #525252' }}
            />
          </Box>
        </Box>

        {/* Temp HP */}
        <Box>
          <Box marginBottom={1} display="flex" alignItems="center" gap={1}>
            <Shield size={12} color="#3B82F6" />
            <Text size="xs" color="gray400">Temporary HP</Text>
          </Box>
          <Input
            type="number"
            value={token.tempHP || 0}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onUpdate({ tempHP: parseInt(e.target.value) || 0 })}
            size="sm"
            fullWidth
            style={{ border: '1px solid #525252' }}
          />
        </Box>

        {/* Quick Actions */}
        <Box>
          <Box marginBottom={1}>
            <Text size="xs" color="gray400">Quick Actions</Text>
          </Box>
          <Box display="flex" gap={1}>
            <Button
              onClick={() => onUpdate({ currentHP: Math.max(0, (token.currentHP || 0) - 5) })}
              size="sm"
              variant="outline"
              title="Damage 5"
              style={{ flex: 1, fontSize: '11px', padding: '4px' }}
            >
              -5
            </Button>
            <Button
              onClick={() => onUpdate({ currentHP: (token.currentHP || 0) + 5 })}
              size="sm"
              variant="outline"
              title="Heal 5"
              style={{ flex: 1, fontSize: '11px', padding: '4px' }}
            >
              +5
            </Button>
            <Button
              onClick={() => onUpdate({ currentHP: token.maxHP || 0 })}
              size="sm"
              variant="outline"
              title="Heal to full"
              style={{ flex: 1, fontSize: '11px', padding: '4px' }}
            >
              Full
            </Button>
            <Button
              onClick={() => onUpdate({ currentHP: 0 })}
              size="sm"
              variant="outline"
              title="Knock out"
              style={{ flex: 1, fontSize: '11px', padding: '4px' }}
            >
              KO
            </Button>
          </Box>
        </Box>

      </Box>
    </Box>
  )
}

export const TokenProperties = memo(TokenPropertiesComponent)
TokenProperties.displayName = 'TokenProperties'