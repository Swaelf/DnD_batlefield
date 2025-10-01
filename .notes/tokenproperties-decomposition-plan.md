# TokenProperties.tsx Decomposition Plan

## Current State
- **File**: `src/components/Properties/TokenProperties.tsx`
- **Lines**: 398 (too large for single component)
- **Complexity**: Multiple UI sections with different concerns
- **Issue**: Violates single responsibility principle

## Decomposition Strategy

### Principle: Extract by Comment Block
Each section starting with `{/* Comment */}` becomes a separate component.

---

## Components to Create

### 1. TokenInfoSection.tsx
**Purpose**: Basic token information (name, size, shape, color)

**Lines to extract**: 22-110

**Props**:
```typescript
type TokenInfoSectionProps = {
  token: Token
  onUpdate: (updates: Partial<Token>) => void
}
```

**Sections included**:
- Name input field
- Size selector dropdown
- Shape selector (circle/square buttons)
- Color picker with hex input

**Dependencies**:
- Input, Button, Box, Text from primitives
- Token type

**Estimated size**: ~90 lines

---

### 2. TokenLabelSettings.tsx
**Purpose**: Label display configuration

**Lines to extract**: 140-189

**Props**:
```typescript
type TokenLabelSettingsProps = {
  token: Token
  onUpdate: (updates: Partial<Token>) => void
}
```

**Sections included**:
- Show Label checkbox
- Label Position selector (conditional rendering based on showLabel)

**Dependencies**:
- Input, Box, Text from primitives
- Token type

**Estimated size**: ~50 lines

---

### 3. TokenHPIndicator.tsx
**Purpose**: Visual HP progress bar with color-coded display

**Lines to extract**: 206-249

**Props**:
```typescript
type TokenHPIndicatorProps = {
  currentHP: number
  maxHP: number
  tempHP?: number
}
```

**Sections included**:
- Linear progress bar with color coding
- HP text display with color (shows current/max/temp)

**Color logic**:
- Dead (HP ≤ 0): gray (#737373)
- Critical (HP ≤ 25%): red (#EF4444)
- Wounded (HP ≤ 50%): orange (#F59E0B)
- Healthy (HP > 50%): green (#10B981)

**Dependencies**:
- Box, Text from primitives
- No external types needed

**Estimated size**: ~45 lines

---

### 4. TokenHPControls.tsx
**Purpose**: HP value management (current, max, temp)

**Lines to extract**: 251-345

**Props**:
```typescript
type TokenHPControlsProps = {
  token: Token
  onUpdate: (updates: Partial<Token>) => void
}
```

**Sections included**:
- Show HP Ring checkbox
- Current HP input with +/- increment buttons
- Max HP input
- Temporary HP input with shield icon

**Dependencies**:
- Input, Button, Box, Text from primitives
- Shield, Plus, Minus icons
- Token type

**Estimated size**: ~95 lines

---

### 5. TokenQuickActions.tsx
**Purpose**: Quick HP adjustment buttons

**Lines to extract**: 347-389

**Props**:
```typescript
type TokenQuickActionsProps = {
  currentHP: number
  maxHP: number
  onUpdate: (updates: { currentHP: number }) => void
}
```

**Sections included**:
- Damage -5 button
- Heal +5 button
- Full heal button
- Knock out (set to 0) button

**Dependencies**:
- Button, Box, Text from primitives

**Estimated size**: ~45 lines

---

## Refactored TokenProperties.tsx

### New Structure (~130 lines)
```typescript
import { memo, type FC } from 'react'
import type { Token } from '@/types'
import { Heart } from '@/utils/optimizedIcons'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { TokenInfoSection } from './TokenInfoSection'
import { TokenLabelSettings } from './TokenLabelSettings'
import { TokenHPIndicator } from './TokenHPIndicator'
import { TokenHPControls } from './TokenHPControls'
import { TokenQuickActions } from './TokenQuickActions'

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
        <TokenInfoSection token={token} onUpdate={onUpdate} />
        <TokenLabelSettings token={token} onUpdate={onUpdate} />
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

        <TokenHPIndicator
          currentHP={token.currentHP || 0}
          maxHP={token.maxHP || 0}
          tempHP={token.tempHP}
        />

        <TokenHPControls token={token} onUpdate={onUpdate} />

        <TokenQuickActions
          currentHP={token.currentHP || 0}
          maxHP={token.maxHP || 0}
          onUpdate={(updates) => onUpdate(updates)}
        />
      </Box>
    </Box>
  )
}

export const TokenProperties = memo(TokenPropertiesComponent)
TokenProperties.displayName = 'TokenProperties'
```

---

## Implementation Order

### Phase 1: Extract Independent Components
1. **TokenHPIndicator** - No dependencies on other extracted components
2. **TokenQuickActions** - No dependencies on other extracted components

### Phase 2: Extract Form Controls
3. **TokenInfoSection** - Uses standard form inputs
4. **TokenLabelSettings** - Uses standard form inputs
5. **TokenHPControls** - Uses standard form inputs

### Phase 3: Refactor Main Component
6. **Update TokenProperties.tsx** - Import and compose all extracted components

---

## Testing Strategy

### Unit Tests for Each Component
Each extracted component should have:
- Snapshot test
- Props rendering test
- Callback invocation test
- Conditional rendering test (where applicable)

### Integration Test
- TokenProperties.tsx should test full composition
- Verify all onUpdate calls propagate correctly
- Test data-testid attributes

---

## Benefits of Decomposition

### Code Quality
- ✅ Each component < 100 lines
- ✅ Single responsibility per component
- ✅ Clear separation of concerns
- ✅ Easier to understand and maintain

### Reusability
- ✅ TokenHPIndicator can be used elsewhere (e.g., token hover tooltip)
- ✅ TokenQuickActions can be reused in combat tracker
- ✅ Form sections can be reused in token templates

### Testing
- ✅ Smaller test files
- ✅ Isolated component testing
- ✅ Faster test execution
- ✅ Better code coverage

### Performance
- ✅ Better memoization opportunities
- ✅ Granular re-rendering
- ✅ Easier to optimize individual sections

### Developer Experience
- ✅ Easier to find specific functionality
- ✅ Reduced cognitive load
- ✅ Better IDE navigation
- ✅ Clearer git diffs

---

## File Structure After Decomposition

```
src/components/Properties/
├── TokenProperties.tsx          (130 lines - main composition)
├── TokenInfoSection.tsx         (90 lines - NEW)
├── TokenLabelSettings.tsx       (50 lines - NEW)
├── TokenHPIndicator.tsx         (45 lines - NEW)
├── TokenHPControls.tsx          (95 lines - NEW)
├── TokenQuickActions.tsx        (45 lines - NEW)
├── BaseProperties.tsx
├── ShapeProperties.tsx
├── StaticObjectProperties.tsx
├── StaticObjectPropertiesEditor.tsx
├── MultiSelectProperties.tsx
├── PropertiesPanel.tsx
└── index.ts                     (export barrel - UPDATE)
```

---

## Migration Checklist

- [ ] Create TokenHPIndicator.tsx
- [ ] Create TokenQuickActions.tsx
- [ ] Create TokenInfoSection.tsx
- [ ] Create TokenLabelSettings.tsx
- [ ] Create TokenHPControls.tsx
- [ ] Update TokenProperties.tsx to use new components
- [ ] Update index.ts barrel export
- [ ] Verify all functionality still works
- [ ] Add unit tests for each component
- [ ] Update CLAUDE.md documentation
- [ ] Commit with descriptive message
