import { useState, useMemo, useCallback, memo, type CSSProperties } from 'react'
import type { TokenSize } from '@/types/token'
import useToolStore from '@/store/toolStore'
import { Button } from '@/components/primitives/ButtonVE'
import { Text } from '@/components/primitives/TextVE'
import { CategoryButton } from './CategoryButton'
import { TokenItem } from './TokenItem'
import { SimpleInput } from './SimpleInput'
import { SimpleSelect } from './SimpleSelect'
import { DEFAULT_TOKENS, SIZE_LABELS, getDefaultHP, type TokenTemplate } from './types'

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
