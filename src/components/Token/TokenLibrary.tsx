import { useState, useMemo, useCallback, forwardRef, memo, type ReactNode, type CSSProperties, type ChangeEvent } from 'react'
import type { TokenSize } from '@/types/token'
import useToolStore from '@/store/toolStore'
import { Button } from '@/components/primitives/ButtonVE'
import { Text } from '@/components/primitives/TextVE'
import { Box } from '@/components/primitives/BoxVE'

// Token template type with exact typing
export type TokenTemplate = {
  name: string
  size: TokenSize
  color: string
  shape: 'circle' | 'square'
  category: 'player' | 'enemy' | 'npc' | 'object'
}

const DEFAULT_TOKENS: TokenTemplate[] = [
  // Player tokens
  { name: 'Fighter', size: 'medium', color: '#1E40AF', shape: 'circle', category: 'player' },
  { name: 'Wizard', size: 'medium', color: '#7C3AED', shape: 'circle', category: 'player' },
  { name: 'Rogue', size: 'medium', color: '#374151', shape: 'circle', category: 'player' },
  { name: 'Cleric', size: 'medium', color: '#F59E0B', shape: 'circle', category: 'player' },

  // Enemy tokens
  { name: 'Goblin', size: 'small', color: '#16A34A', shape: 'circle', category: 'enemy' },
  { name: 'Orc', size: 'medium', color: '#65A30D', shape: 'circle', category: 'enemy' },
  { name: 'Ogre', size: 'large', color: '#A16207', shape: 'circle', category: 'enemy' },
  { name: 'Dragon', size: 'gargantuan', color: '#DC2626', shape: 'circle', category: 'enemy' },
  { name: 'Wolf', size: 'medium', color: '#6B7280', shape: 'circle', category: 'enemy' },

  // NPC tokens
  { name: 'Merchant', size: 'medium', color: '#8B5CF6', shape: 'square', category: 'npc' },
  { name: 'Guard', size: 'medium', color: '#3B82F6', shape: 'square', category: 'npc' },
  { name: 'Noble', size: 'medium', color: '#A855F7', shape: 'square', category: 'npc' },

  // Objects
  { name: 'Barrel', size: 'small', color: '#92400E', shape: 'square', category: 'object' },
  { name: 'Chest', size: 'small', color: '#A16207', shape: 'square', category: 'object' },
  { name: 'Door', size: 'medium', color: '#451A03', shape: 'square', category: 'object' },
]

const SIZE_LABELS: Record<TokenSize, string> = {
  tiny: 'Tiny (2.5ft)',
  small: 'Small (5ft)',
  medium: 'Medium (5ft)',
  large: 'Large (10ft)',
  huge: 'Huge (15ft)',
  gargantuan: 'Gargantuan (20ft+)',
}

// Default HP values based on size and category
const getDefaultHP = (size: TokenSize, category: string): number => {
  const sizeHP: Record<TokenSize, number> = {
    tiny: 4,
    small: 10,
    medium: 20,
    large: 50,
    huge: 100,
    gargantuan: 200,
  }

  const categoryMultiplier = {
    player: 1.5,
    enemy: 1,
    npc: 0.8,
    object: 0.5,
  }

  const baseHP = sizeHP[size] || 20
  const multiplier = categoryMultiplier[category as keyof typeof categoryMultiplier] || 1
  return Math.floor(baseHP * multiplier)
}

// Token Icon component
export type TokenIconProps = {
  shape: 'circle' | 'square'
  color: string
  size?: number
  className?: string
  style?: CSSProperties
}

export const TokenIcon = forwardRef<HTMLDivElement, TokenIconProps>(
  ({ shape, color, size = 40, className, style }, ref) => {
    const iconStyles: CSSProperties = {
      width: `${size}px`,
      height: `${size}px`,
      backgroundColor: color,
      border: '2px solid var(--dndBlack)',
      borderRadius: shape === 'circle' ? '50%' : '8px',
      transition: 'all 0.2s ease',
      ...style,
    }

    return (
      <div ref={ref} style={iconStyles} className={className} />
    )
  }
)

TokenIcon.displayName = 'TokenIcon'

// Token Item component
export type TokenItemProps = {
  token: TokenTemplate
  onClick: (token: TokenTemplate) => void
  className?: string
  style?: CSSProperties
}

export const TokenItem = forwardRef<HTMLButtonElement, TokenItemProps>(
  ({ token, onClick, className, style }, ref) => {
    const itemStyles: CSSProperties = {
      height: 'auto',
      padding: '12px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px',
      backgroundColor: 'var(--gray800)',
      border: '1px solid var(--gray700)',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      ...style,
    }

    return (
      <button
        ref={ref}
        onClick={() => onClick(token)}
        style={itemStyles}
        className={className}
        title={`${token.name} (${SIZE_LABELS[token.size]})`}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--gray700)'
          e.currentTarget.style.borderColor = 'var(--secondary)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--gray800)'
          e.currentTarget.style.borderColor = 'var(--gray700)'
        }}
      >
        <TokenIcon shape={token.shape} color={token.color} />
        <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <Text
            style={{
              fontSize: '12px',
              color: 'var(--gray300)',
              textAlign: 'center',
              fontWeight: '500'
            }}
          >
            {token.name}
          </Text>
          <Text
            style={{
              fontSize: '10px',
              color: 'var(--gray500)',
              textTransform: 'capitalize'
            }}
          >
            {token.size}
          </Text>
        </Box>
      </button>
    )
  }
)

TokenItem.displayName = 'TokenItem'

// Category Button component
export type CategoryButtonProps = {
  children: ReactNode
  isSelected: boolean
  onClick: () => void
}

export const CategoryButton = forwardRef<HTMLButtonElement, CategoryButtonProps>(
  ({ children, isSelected, onClick }, ref) => {
    const buttonStyles: CSSProperties = {
      textTransform: 'capitalize',
      flex: '1 1 auto',
      minWidth: '60px',
      padding: '6px 12px',
      fontSize: '12px',
      fontWeight: '500',
      borderRadius: '6px',
      border: '1px solid var(--gray600)',
      backgroundColor: isSelected ? 'var(--primary)' : 'transparent',
      color: isSelected ? 'white' : 'var(--gray300)',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }

    return (
      <button
        ref={ref}
        onClick={onClick}
        style={buttonStyles}
        onMouseEnter={(e) => {
          if (!isSelected) {
            e.currentTarget.style.backgroundColor = 'var(--gray700)'
            e.currentTarget.style.color = 'var(--gray100)'
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected) {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = 'var(--gray300)'
          }
        }}
      >
        {children}
      </button>
    )
  }
)

CategoryButton.displayName = 'CategoryButton'

// Simple Input component for this component
export type SimpleInputProps = {
  value: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  className?: string
  style?: CSSProperties
}

export const SimpleInput = forwardRef<HTMLInputElement, SimpleInputProps>(
  ({ value, onChange, placeholder, className, style }, ref) => {
    const inputStyles: CSSProperties = {
      width: '100%',
      padding: '8px 12px',
      fontSize: '14px',
      backgroundColor: 'var(--gray800)',
      border: '1px solid var(--gray600)',
      borderRadius: '6px',
      color: 'var(--gray100)',
      outline: 'none',
      transition: 'all 0.2s ease',
      ...style,
    }

    return (
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={inputStyles}
        className={className}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--primary)'
          e.currentTarget.style.backgroundColor = 'var(--gray750)'
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'var(--gray600)'
          e.currentTarget.style.backgroundColor = 'var(--gray800)'
        }}
      />
    )
  }
)

SimpleInput.displayName = 'SimpleInput'

// Simple Select component
export type SimpleSelectProps = {
  value: string
  onChange: (value: string) => void
  children: ReactNode
  className?: string
  style?: CSSProperties
}

export const SimpleSelect = forwardRef<HTMLSelectElement, SimpleSelectProps>(
  ({ value, onChange, children, className, style }, ref) => {
    const selectStyles: CSSProperties = {
      width: '100%',
      padding: '8px 12px',
      fontSize: '14px',
      backgroundColor: 'var(--gray800)',
      border: '1px solid var(--gray600)',
      borderRadius: '6px',
      color: 'var(--gray100)',
      outline: 'none',
      cursor: 'pointer',
      ...style,
    }

    return (
      <select
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={selectStyles}
        className={className}
      >
        {children}
      </select>
    )
  }
)

SimpleSelect.displayName = 'SimpleSelect'

const TokenLibrary = () => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'player' | 'enemy' | 'npc' | 'object'>('all')
  const [customName, setCustomName] = useState('')
  const [customSize, setCustomSize] = useState<TokenSize>('medium')
  const [customColor, setCustomColor] = useState('#FF0000')
  const [customShape, setCustomShape] = useState<'circle' | 'square'>('circle')

  // Use specific selector to prevent unnecessary re-renders
  const currentTool = useToolStore((state: any) => state.currentTool)
  const setTool = useToolStore((state: any) => state.setTool)
  const setTokenTemplate = useToolStore((state: any) => state.setTokenTemplate)

  const filteredTokens = useMemo(
    () => selectedCategory === 'all'
      ? DEFAULT_TOKENS
      : DEFAULT_TOKENS.filter(t => t.category === selectedCategory),
    [selectedCategory]
  )

  const handleTokenClick = useCallback((template: TokenTemplate) => {
    if (currentTool !== 'token') {
      setTool('token')
    }

    // Store the template for placement with default HP values
    setTokenTemplate({
      ...template,
      showLabel: true,
      labelPosition: 'bottom',
      labelColor: '#E0E0E0', // Light gray - readable on dark background
      opacity: 1,
      borderColor: '#000000',
      borderWidth: 2,
      // Add default HP values based on size/type
      currentHP: getDefaultHP(template.size, template.category),
      maxHP: getDefaultHP(template.size, template.category),
      showHP: true, // Always show HP
    })
  }, [currentTool, setTool, setTokenTemplate])

  const createCustomToken = useCallback(() => {
    if (!customName.trim()) return

    const template = {
      name: customName,
      size: customSize,
      color: customColor,
      shape: customShape,
      category: 'player' as const,
      showLabel: true,
      labelPosition: 'bottom' as const,
      labelColor: '#E0E0E0',
      opacity: 1,
      borderColor: '#000000',
      borderWidth: 2,
      // Add default HP for custom tokens
      currentHP: getDefaultHP(customSize, 'player'),
      maxHP: getDefaultHP(customSize, 'player'),
      showHP: true,
    }

    setTool('token')
    setTokenTemplate(template)

    // Reset form
    setCustomName('')
    setCustomSize('medium')
    setCustomColor('#FF0000')
    setCustomShape('circle')
  }, [customName, customSize, customColor, customShape, setTool, setTokenTemplate])

  if (currentTool !== 'token') return null

  const containerStyles: CSSProperties = {
    width: '320px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    borderLeft: '1px solid var(--gray800)',
    backgroundColor: 'var(--surface)',
    overflow: 'hidden',
  }

  const headerStyles: CSSProperties = {
    padding: '16px',
    borderBottom: '1px solid var(--gray700)',
    flexShrink: 0,
  }

  const scrollAreaStyles: CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    padding: '16px',
  }

  const sectionStyles: CSSProperties = {
    marginBottom: '24px',
  }

  const gridStyles: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
  }

  const fieldStyles: CSSProperties = {
    marginBottom: '16px',
  }

  const labelStyles: CSSProperties = {
    fontSize: '12px',
    fontWeight: '500',
    color: 'var(--gray300)',
    marginBottom: '6px',
    display: 'block',
  }

  const flexStyles: CSSProperties = {
    display: 'flex',
    gap: '8px',
  }

  return (
    <div style={containerStyles}>
      <div style={headerStyles}>
        <Text style={{ fontSize: '18px', fontWeight: '600', color: 'var(--gray100)' }}>
          Token Library
        </Text>
      </div>

      <div style={scrollAreaStyles}>
        {/* Category Filter */}
        <div style={sectionStyles}>
          <div style={flexStyles}>
            {(['all', 'player', 'enemy', 'npc', 'object'] as const).map((cat) => (
              <CategoryButton
                key={cat}
                isSelected={selectedCategory === cat}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </CategoryButton>
            ))}
          </div>
        </div>

        {/* Token Grid */}
        <div style={sectionStyles}>
          <div style={gridStyles}>
            {filteredTokens.map((token, index) => (
              <TokenItem key={index} token={token} onClick={handleTokenClick} />
            ))}
          </div>
        </div>

        {/* Custom Token Creator */}
        <div style={{ ...sectionStyles, borderTop: '1px solid var(--gray700)', paddingTop: '16px' }}>
          <div style={{ marginBottom: '16px' }}>
            <Text style={{ fontSize: '14px', fontWeight: '600', color: 'var(--secondary)' }}>
              Create Custom Token
            </Text>
          </div>

          <div>
            <div style={fieldStyles}>
              <label style={labelStyles}>Name</label>
              <SimpleInput
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Token name"
              />
            </div>

            <div style={fieldStyles}>
              <label style={labelStyles}>Size</label>
              <SimpleSelect
                value={customSize}
                onChange={(value) => setCustomSize(value as TokenSize)}
              >
                {Object.entries(SIZE_LABELS).map(([size, label]) => (
                  <option key={size} value={size}>
                    {label}
                  </option>
                ))}
              </SimpleSelect>
            </div>

            <div style={fieldStyles}>
              <label style={labelStyles}>Color</label>
              <div style={flexStyles}>
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  style={{
                    width: '64px',
                    height: '36px',
                    border: '1px solid var(--gray600)',
                    borderRadius: '6px',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                  }}
                />
                <SimpleInput
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  style={{ flex: 1 }}
                />
              </div>
            </div>

            <div style={fieldStyles}>
              <label style={labelStyles}>Shape</label>
              <div style={flexStyles}>
                <Button
                  onClick={() => setCustomShape('circle')}
                  variant={customShape === 'circle' ? 'primary' : 'secondary'}
                  size="sm"
                  style={{ flex: 1 }}
                >
                  Circle
                </Button>
                <Button
                  onClick={() => setCustomShape('square')}
                  variant={customShape === 'square' ? 'primary' : 'secondary'}
                  size="sm"
                  style={{ flex: 1 }}
                >
                  Square
                </Button>
              </div>
            </div>

            <Button
              onClick={createCustomToken}
              disabled={!customName.trim()}
              variant="primary"
              size="sm"
              style={{ width: '100%' }}
            >
              Create Token
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

TokenLibrary.displayName = 'TokenLibrary'

export default memo(TokenLibrary)