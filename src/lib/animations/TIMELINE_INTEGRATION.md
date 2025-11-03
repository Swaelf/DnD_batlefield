# Animation Library - Timeline Integration Guide

## Overview

The Universal Animation Library now integrates with MapMaker's timeline system through enhanced spell templates in `src/data/unifiedActions/spellTemplates.ts`.

## Integration Architecture

### Dual Animation System

MapMaker now supports **two animation systems** running side-by-side:

1. **Legacy System** (existing):
   - `UnifiedProjectile.tsx`
   - `SpellRenderer.tsx`
   - `SimpleSpellComponent.tsx`

2. **Animation Library** (new):
   - `src/lib/animations/`
   - Promise-based execution
   - Timeline integration
   - Concentration management

### How It Works

Spell templates now include `metadata.useAnimationLibrary` flag and `metadata.libraryConfig` for enhanced spells:

```typescript
{
  id: 'fireball-template',
  name: 'Fireball',
  // ... existing properties ...
  metadata: {
    name: 'Fireball',
    description: '...',
    // NEW: Animation library integration
    useAnimationLibrary: true,
    animationLibrarySpell: 'Fireball',
    libraryConfig: {
      curveAmount: 0.3,
      power: 'normal'
    }
  }
}
```

## Integrated Spells

### 1. Fireball
**Library Spell**: `Fireball` (AbstractProjectile)
**Features**:
- Curved projectile path
- Explosion burst on impact
- Lingering fire effects
- Screen shake
- Power variants: `normal` | `empowered` | `maximized`

**Configuration**:
```typescript
libraryConfig: {
  curveAmount: 0.3, // Arc height multiplier
  power: 'normal'   // Spell power level
}
```

### 2. Magic Missile
**Library Spell**: `Magic Missile` (AbstractProjectile)
**Features**:
- Automatic volley creation (3 darts at level 1)
- Curved homing paths
- Staggered playback
- Level scaling (more darts at higher levels)

**Configuration**:
```typescript
libraryConfig: {
  spellLevel: 1, // Determines number of missiles
  stagger: 150   // ms delay between missiles
}
```

### 3. Darkness
**Library Spell**: `Darkness` (AbstractAreaEffect)
**Features**:
- Pulsing circular area
- Persistent spell effect
- Multiple duration types (time, rounds, events)
- Target tracking capability
- Intensity variants

**Configuration**:
```typescript
libraryConfig: {
  durationType: 'rounds', // 'time' | 'rounds' | 'events'
  duration: 10,           // 10 rounds (concentration)
  intensity: 'normal',    // 'normal' | 'deeper'
  trackTarget: false      // Follow moving object
}
```

### 4. Ray of Frost
**Library Spell**: `Ray of Frost` (AbstractRay)
**Features**:
- Tapering icy beam
- Flickering effect
- Flowing frost particles
- Cantrip scaling (1d8 → 4d8)

**Configuration**:
```typescript
libraryConfig: {
  casterLevel: 1,  // Cantrip damage scaling
  power: 'normal'  // 'normal' | 'empowered'
}
```

### 5. Thunderwave
**Library Spell**: `Thunderwave` (AbstractBurst)
**Features**:
- Square burst (15-foot cube)
- Directional casting
- Screen shake and shockwave
- Electric particle effects
- Level scaling

**Configuration**:
```typescript
libraryConfig: {
  spellLevel: 1,        // Level scaling
  direction: 'north',   // 'north' | 'south' | 'east' | 'west'
  power: 'normal'       // 'normal' | 'empowered'
}
```

## Usage in Timeline Events

### Creating Spell Events

When creating spell events in the timeline, the system will automatically detect `useAnimationLibrary: true` and use the enhanced animation library.

**Example Timeline Event**:
```typescript
import { timelineStore } from '@/store/timelineStore'

// Add Fireball event to timeline
timelineStore.getState().addAction({
  tokenId: 'wizard-123',
  type: 'spell',
  data: {
    type: 'spell',
    spellName: 'Fireball', // Matches template name
    fromPosition: { x: 200, y: 300 },
    toPosition: { x: 800, y: 500 },
    // ... other spell properties
  }
})
```

### Event Execution Flow

1. **Timeline Advances**: User clicks "Next Event"
2. **Event Retrieved**: System gets next event from timeline
3. **Template Lookup**: Finds spell template by name
4. **Library Check**: Checks `metadata.useAnimationLibrary`
5. **Animation Creation**:
   - If `true`: Uses animation library (`AnimationFactory.create()`)
   - If `false`: Uses legacy system (`UnifiedProjectile`)
6. **Execution**: Plays animation with promise-based flow
7. **Completion**: Marks event as executed

## Integration Code Example

### Timeline Store Integration

```typescript
// In timelineStore.ts or event execution logic
import { AnimationFactory } from '@/lib/animations'
import { spellTemplates } from '@/data/unifiedActions/spellTemplates'

async function executeSpellEvent(event: TimelineAction) {
  const template = spellTemplates.find(t => t.name === event.data.spellName)

  if (template?.metadata?.useAnimationLibrary) {
    // Use animation library
    const spellName = template.metadata.animationLibrarySpell
    const config = {
      fromPosition: event.data.fromPosition,
      toPosition: event.data.toPosition,
      ...template.metadata.libraryConfig
    }

    const animation = AnimationFactory.create(spellName, config)
    if (animation) {
      animation.play()

      // Wait for completion if needed
      await new Promise<void>(resolve => {
        const checkComplete = () => {
          if (!animation.isAnimating()) {
            resolve()
          } else {
            requestAnimationFrame(checkComplete)
          }
        }
        checkComplete()
      })
    }
  } else {
    // Use legacy system
    // ... existing UnifiedProjectile logic
  }
}
```

### Event Editor Integration

```typescript
// In UnifiedEventEditor.tsx or SpellConfiguration.tsx
import { spellTemplates } from '@/data/unifiedActions/spellTemplates'

function SpellSelector() {
  const availableSpells = spellTemplates.filter(
    template => template.type === 'spell'
  )

  return (
    <select>
      {availableSpells.map(spell => (
        <option key={spell.id} value={spell.name}>
          {spell.name}
          {spell.metadata?.useAnimationLibrary && ' ✨'} {/* Indicator */}
        </option>
      ))}
    </select>
  )
}
```

## Benefits of Integration

### 1. Backward Compatibility
- Existing spells continue working
- No breaking changes to timeline system
- Gradual migration path

### 2. Enhanced Features
Spells using the animation library get:
- Promise-based async/await execution
- Better animation quality
- More customization options
- Concentration tracking
- Multiple duration types

### 3. Developer Experience
- Single source of truth (spell templates)
- Type-safe configuration
- Easy to add new spells
- Consistent API

### 4. Performance
- Optimized RAF-based animations
- Efficient memory management
- Smooth 60fps playback

## Migration Guide

### Adding New Spells

To add a new spell with animation library support:

1. **Create spell class** in `src/lib/animations/spells/`:
```typescript
// src/lib/animations/spells/projectile/AcidArrow.ts
export class AcidArrow extends AbstractProjectile {
  // ... implementation
}
```

2. **Export from library**:
```typescript
// src/lib/animations/index.ts
export { AcidArrow } from './spells/projectile/AcidArrow'
```

3. **Register in AnimationRegistry**:
```typescript
// src/lib/animations/registry/AnimationRegistry.ts
AnimationRegistry.register('Acid Arrow', {
  name: 'Acid Arrow',
  category: 'projectile',
  defaults: { /* ... */ },
  factory: (config) => new AcidArrow(config)
})
```

4. **Add spell template**:
```typescript
// src/data/unifiedActions/spellTemplates.ts
{
  id: 'acid-arrow-template',
  name: 'Acid Arrow',
  // ... standard properties
  metadata: {
    name: 'Acid Arrow',
    description: '...',
    useAnimationLibrary: true,
    animationLibrarySpell: 'Acid Arrow',
    libraryConfig: {
      // Spell-specific config
    }
  }
}
```

### Migrating Existing Spells

To migrate an existing spell to the animation library:

1. **Implement spell** in animation library
2. **Add `useAnimationLibrary` flag** to template
3. **Add `libraryConfig`** with spell-specific settings
4. **Test** both legacy and library versions
5. **Enable** by setting `useAnimationLibrary: true`

## Testing

### Manual Testing Checklist

- [ ] Spell appears in "Add Action" menu
- [ ] Event editor shows spell correctly
- [ ] Animation plays when event executes
- [ ] Animation completes successfully
- [ ] Persistent effects (if any) remain correct duration
- [ ] Timeline advances properly after spell
- [ ] No console errors

### Automated Testing

```typescript
// Example test
import { AnimationFactory } from '@/lib/animations'
import { spellTemplates } from '@/data/unifiedActions/spellTemplates'

test('Fireball template integrates with animation library', () => {
  const template = spellTemplates.find(t => t.id === 'fireball-template')

  expect(template?.metadata?.useAnimationLibrary).toBe(true)
  expect(template?.metadata?.animationLibrarySpell).toBe('Fireball')

  // Test creating animation
  const config = {
    fromPosition: { x: 0, y: 0 },
    toPosition: { x: 100, y: 100 },
    ...template?.metadata?.libraryConfig
  }

  const animation = AnimationFactory.create('Fireball', config)
  expect(animation).toBeTruthy()
})
```

## Future Enhancements

### Phase 5: Complete Integration
- [ ] Update ObjectsLayer to use animation library
- [ ] Add animation library toggle in settings
- [ ] Migrate all spells to animation library
- [ ] Remove legacy animation system

### Phase 6: Advanced Features
- [ ] Spell customization UI
- [ ] Animation preview in event editor
- [ ] Spell effect persistence visualization
- [ ] Concentration indicator in UI

## Troubleshooting

### Animation Doesn't Play
**Check**:
1. Is `useAnimationLibrary: true`?
2. Is spell registered in AnimationRegistry?
3. Is `animationLibrarySpell` name correct?
4. Are `libraryConfig` parameters valid?

### Animation Plays But Looks Wrong
**Check**:
1. Compare `libraryConfig` with spell class expected config
2. Verify positions are correct (not swapped)
3. Check color values are valid CSS colors
4. Verify size/radius values are reasonable

### Persistent Effect Doesn't Persist
**Check**:
1. Is `durationType` set correctly?
2. Is `duration` > 0?
3. Is cleanup logic respecting duration type?
4. Check timeline advancement logic

## API Reference

See comprehensive API documentation in:
- `API_EXAMPLES.md` - 50+ usage examples
- `PHASE_4_SUMMARY.md` - Complete Phase 4 features
- `README.md` - Architecture overview

## Summary

The animation library integration provides a smooth migration path from the legacy system to the new, more powerful animation framework. Spells can be migrated incrementally, and both systems work side-by-side without conflicts.

**Key Integration Points**:
1. **Spell Templates** (`spellTemplates.ts`) - Single source of truth
2. **Animation Registry** - Spell catalog
3. **Animation Factory** - Spell instantiation
4. **Timeline Store** - Execution coordination

This architecture ensures MapMaker can leverage the new animation library's advanced features while maintaining full backward compatibility with existing spell implementations.
