# Animation Registry System

Centralized registry for managing animation templates and presets with efficient indexing and search capabilities.

## Overview

The Animation Registry provides:
- **O(1) lookup** by template ID
- **Fast filtering** by category and tags using indices
- **Powerful search** combining multiple criteria
- **Pre-populated templates** for all D&D projectiles

## Usage

### Importing

```typescript
import {
  EffectRegistry,
  getAllAnimations,
  getSpellAnimations,
  getAttackAnimations,
  searchAnimations,
} from '@/lib/animation-effects';
```

### Basic Operations

#### Get Template by ID

```typescript
const fireball = EffectRegistry.get('fireball');

if (fireball) {
  // Use template to create projectile config
  const config = fireball.template(
    { x: 100, y: 100 },  // from position
    { x: 500, y: 500 }   // to position
  );
}
```

#### Get All Templates

```typescript
const all = EffectRegistry.getAll();
console.log(`${all.length} templates registered`);
```

#### Get by Category

```typescript
// Get all spell animations
const spells = EffectRegistry.getByCategory('spell');

// Get all attack animations
const attacks = EffectRegistry.getByCategory('attack');
```

#### Get by Tag

```typescript
// Get all fire effects
const fireEffects = EffectRegistry.getByTag('fire');

// Get all projectiles
const projectiles = EffectRegistry.getByTag('projectile');
```

### Advanced Search

#### Search by Multiple Criteria

```typescript
// Find all fire spells
const fireSpells = EffectRegistry.search({
  category: 'spell',
  tags: ['fire'],
});

// Find all explosive projectiles
const explosives = EffectRegistry.search({
  tags: ['explosive', 'projectile'],
});

// Search by name (partial, case-insensitive)
const bolts = EffectRegistry.search({
  name: 'bolt',  // Finds "Crossbow Bolt", "Guiding Bolt", etc.
});

// Combine multiple filters
const holyRangedSpells = EffectRegistry.search({
  category: 'spell',
  tags: ['holy', 'projectile'],
  name: 'bolt',
});
```

### Registering Custom Templates

```typescript
import { EffectRegistry } from '@/lib/animation-effects';

// Register a custom template
EffectRegistry.register('custom-lightning', {
  name: 'Lightning Strike',
  description: 'Electric bolt from the sky',
  category: 'spell',
  tags: ['lightning', 'vertical', 'aoe'],
  template: (from, to) => ({
    from,
    to,
    shape: 'rectangle',
    color: '#4169E1',
    size: 8,
    motion: createLinearMotion(from, to),
    effects: ['flash', 'glow'],
    duration: 500,
  }),
  metadata: {
    spellLevel: 2,
    damage: '3d8',
    damageType: 'lightning',
    range: 120,
  },
});
```

### Convenience Functions

```typescript
// Get all registered animations
const all = getAllAnimations();

// Get spell animations only
const spells = getSpellAnimations();

// Get attack animations only
const attacks = getAttackAnimations();

// Get movement animations only
const movements = getMovementAnimations();

// Search with criteria
const results = searchAnimations({
  category: ['spell', 'attack'],
  tags: ['fire'],
});
```

## Pre-Registered Templates

### Physical Attacks (4 templates)

- `arrow` - Simple bow arrow
- `crossbow-bolt` - Fast crossbow projectile
- `throwing-dagger` - Spinning thrown dagger
- `throwing-axe` - Heavy thrown weapon

### Magic Spells (7 templates)

- `magic-missile` - Force damage cantrip
- `eldritch-blast` - Warlock force beam
- `fireball` - Explosive fire spell (3rd level)
- `acid-splash` - Acid cantrip
- `scorching-ray` - Fire beam (2nd level)
- `chromatic-orb` - Color-shifting elemental spell
- `guiding-bolt` - Radiant holy projectile

## Template Structure

```typescript
interface AnimationTemplate {
  id: string                    // Unique identifier
  name: string                  // Display name
  description?: string          // Description
  category: AnimationCategory   // spell, attack, movement, etc.
  tags: string[]               // Search tags
  template: (...args) => Config // Factory function
  metadata?: Record<string, any> // D&D stats, etc.
  version?: string             // Template version
  deprecated?: boolean         // Deprecation flag
}
```

## Performance Characteristics

- **Get by ID**: O(1) - Direct Map lookup
- **Get by Category**: O(1) - Indexed Set lookup
- **Get by Tag**: O(1) - Indexed Set lookup
- **Search**: O(n) where n = matching templates (with early filtering)

## Registry Statistics

```typescript
// Get registry info
console.log('Total templates:', EffectRegistry.getCount());
console.log('Categories:', EffectRegistry.getCategories());
console.log('All tags:', EffectRegistry.getTags());

// Check if template exists
if (EffectRegistry.has('fireball')) {
  console.log('Fireball template is registered');
}
```

## Integration with Application

The registry is automatically populated on module import:

```typescript
// In your app initialization or main file
import '@/lib/animation-effects/registry/templates';

// Or through the main export
import { EffectRegistry, logRegistryStats } from '@/lib/animation-effects';

// Log what's available
logRegistryStats();
```

## Next Steps

- **Task 12**: Animation Factory - Create animation instances from templates
- **Task 13-18**: Migrate existing systems to use registry
