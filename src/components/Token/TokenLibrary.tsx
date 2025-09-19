import React, { useState, ChangeEvent, useMemo, useCallback } from 'react';
import { TokenSize } from '@/types/token';
import useToolStore from '@/store/toolStore';
import {
  Panel,
  PanelHeader,
  PanelTitle,
  PanelBody,
  PanelSection,
  Button,
  Input,
  Select,
  SelectOption,
  ColorInput,
  Field,
  FieldLabel,
  Grid,
  Box,
  Text
} from '@/components/ui';

type TokenTemplate = {
  name: string;
  size: TokenSize;
  color: string;
  shape: 'circle' | 'square';
  category: 'player' | 'enemy' | 'npc' | 'object';
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
];

const SIZE_LABELS: Record<TokenSize, string> = {
  tiny: 'Tiny (2.5ft)',
  small: 'Small (5ft)',
  medium: 'Medium (5ft)',
  large: 'Large (10ft)',
  huge: 'Huge (15ft)',
  gargantuan: 'Gargantuan (20ft+)',
};

const TokenLibrary: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'player' | 'enemy' | 'npc' | 'object'>('all');
  const [customName, setCustomName] = useState('');
  const [customSize, setCustomSize] = useState<TokenSize>('medium');
  const [customColor, setCustomColor] = useState('#FF0000');
  const [customShape, setCustomShape] = useState<'circle' | 'square'>('circle');

  // Use specific selector to prevent unnecessary re-renders
  const currentTool = useToolStore(state => state.currentTool);
  const setTool = useToolStore(state => state.setTool);
  const setTokenTemplate = useToolStore(state => state.setTokenTemplate);

  const filteredTokens = useMemo(
    () => selectedCategory === 'all'
      ? DEFAULT_TOKENS
      : DEFAULT_TOKENS.filter(t => t.category === selectedCategory),
    [selectedCategory]
  );

  const handleTokenClick = useCallback((template: TokenTemplate) => {
    if (currentTool !== 'token') {
      setTool('token');
    }

    // Store the template for placement
    setTokenTemplate({
      ...template,
      showLabel: true,
      labelPosition: 'bottom',
      opacity: 1,
      borderColor: '#000000',
      borderWidth: 2,
    });
  }, [currentTool, setTool, setTokenTemplate]);

  const createCustomToken = useCallback(() => {
    if (!customName.trim()) return;

    const template = {
      name: customName,
      size: customSize,
      color: customColor,
      shape: customShape,
      category: 'player' as const,
      showLabel: true,
      labelPosition: 'bottom' as const,
      opacity: 1,
      borderColor: '#000000',
      borderWidth: 2,
    };

    setTool('token');
    setTokenTemplate(template);

    // Reset form
    setCustomName('');
    setCustomSize('medium');
    setCustomColor('#FF0000');
    setCustomShape('circle');
  }, [customName, customSize, customColor, customShape, setTool, setTokenTemplate]);

  if (currentTool !== 'token') return null;

  return (
    <Panel data-test-id="token-library" display="flex" flexDirection="column" size="sidebar" css={{ borderLeft: '1px solid $gray800' }}>
      <PanelHeader>
        <PanelTitle>Token Library</PanelTitle>
      </PanelHeader>

      <PanelBody data-test-id="token-library-inner" display="flex" flexDirection="column">
        {/* Category Filter */}
        <PanelSection data-test-id="token-library-category-filter" css={{ marginBottom: '$4' }}>
          <Box display="flex" css={{ flexWrap: 'wrap', gap: '$2' }}>
            {(['all', 'player', 'enemy', 'npc', 'object'] as const).map((cat) => (
              <Button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                variant={selectedCategory === cat ? 'primary' : 'outline'}
                size="sm"
                css={{
                  textTransform: 'capitalize',
                  flex: '1 1 auto',
                  minWidth: '60px',
                }}
              >
                {cat}
              </Button>
            ))}
          </Box>
        </PanelSection>

        {/* Token Grid */}
        <PanelSection data-test-id="token-library-token-grid" css={{ marginBottom: '$6' }}>
          <Grid columns={3} gap={2}>
            {filteredTokens.map((token, index) => (
              <TokenItem key={index} token={token} onClick={handleTokenClick} />
            ))}
          </Grid>
        </PanelSection>

        {/* Custom Token Creator */}
        <PanelSection data-test-id="token-library-custom-token-creator" display="flex" flexDirection="column" divider>
          <Text size="sm" weight="semibold" color="secondary" css={{ marginBottom: '$3' }}>
            Create Custom Token
          </Text>

          <Box display="flex" flexDirection="column" gap="3">
            <Field>
              <FieldLabel>Name</FieldLabel>
              <Input
                value={customName}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setCustomName(e.target.value)}
                placeholder="Token name"
                fullWidth
                size="sm"
              />
            </Field>

            <Field>
              <FieldLabel>Size</FieldLabel>
              <Select
                value={customSize}
                onValueChange={(value) => setCustomSize(value as TokenSize)}
                size="sm"
                fullWidth
              >
                {Object.entries(SIZE_LABELS).map(([size, label]) => (
                  <SelectOption key={size} value={size}>
                    {label}
                  </SelectOption>
                ))}
              </Select>
            </Field>

            <Field>
              <FieldLabel>Color</FieldLabel>
              <Box display="flex" gap="2">
                <ColorInput
                  value={customColor}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setCustomColor(e.target.value)}
                  css={{ width: '64px', flexShrink: 0 }}
                />
                <Input
                  value={customColor}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setCustomColor(e.target.value)}
                  size="sm"
                  css={{ flex: 1 }}
                />
              </Box>
            </Field>

            <Field>
              <FieldLabel>Shape</FieldLabel>
              <Box display="flex" gap="2">
                <Button
                  onClick={() => setCustomShape('circle')}
                  variant={customShape === 'circle' ? 'primary' : 'outline'}
                  size="sm"
                  fullWidth
                >
                  Circle
                </Button>
                <Button
                  onClick={() => setCustomShape('square')}
                  variant={customShape === 'square' ? 'primary' : 'outline'}
                  size="sm"
                  fullWidth
                >
                  Square
                </Button>
              </Box>
            </Field>

            <Button
              onClick={createCustomToken}
              disabled={!customName.trim()}
              variant="primary"
              fullWidth
              size="sm"
            >
              Create Token
            </Button>
          </Box>
        </PanelSection>
      </PanelBody>
    </Panel>
  );
};

// Memoize token item to prevent re-renders
const TokenItem = React.memo(({ token, onClick }: { token: TokenTemplate; onClick: (token: TokenTemplate) => void }) => (
  <Button
    onClick={() => onClick(token)}
    variant="ghost"
    css={{
      height: 'auto',
      padding: '$3',
      flexDirection: 'column',
      gap: '$2',
      backgroundColor: '$gray800',
      '&:hover': {
        backgroundColor: '$gray700',
      },
    }}
    title={`${token.name} (${SIZE_LABELS[token.size]})`}
  >
    <Box
      display="block"
      css={{
        width: '40px',
        height: '40px',
        borderRadius: token.shape === 'square' ? '$md' : '$round',
        backgroundColor: token.color,
        border: '2px solid $black',
        transition: '$fast',

        'button:hover &': {
          borderColor: '$secondary',
        },
      }}
    />
    <Box display="flex" flexDirection="column" alignItems="center">
      <Text size="xs" color="gray300" align="center">
        {token.name}
      </Text>
      <Text size="xs" color="gray500">
        {token.size}
      </Text>
    </Box>
  </Button>
));

TokenItem.displayName = 'TokenItem';

export default React.memo(TokenLibrary);