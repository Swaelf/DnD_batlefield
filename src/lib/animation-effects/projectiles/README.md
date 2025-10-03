# Abstract Projectile System

## Overview

The Abstract Projectile System provides a configurable, mutation-capable projectile component for D&D battle map animations. It supports:

- **Generic shapes** (circle, triangle, rectangle, star, custom)
- **Motion path integration** (linear, curved, arc, wave, orbit, bounce)
- **Effect attachment** (trail, glow, pulse, flash, particles)
- **Runtime mutations** (transform during flight)
- **Multi-phase lifecycle** (spawn → travel → impact → aftermath)

## Architecture

```
projectiles/
├── AbstractProjectile.tsx    # Main component (308 lines)
├── ProjectileMutator.ts       # Mutation logic (179 lines)
├── presets.ts                 # Common projectile configs (292 lines)
├── index.ts                   # Barrel exports (41 lines)
└── README.md                  # Documentation
```

## Usage Examples

### Simple Arrow

```typescript
import { AbstractProjectile, ArrowProjectile } from '@/lib/animation-effects';

const config = ArrowProjectile({ x: 0, y: 0 }, { x: 100, y: 100 });

<AbstractProjectile config={config} />
```

### Fireball with Mutation

```typescript
import { AbstractProjectile, FireballProjectile } from '@/lib/animation-effects';

const config = FireballProjectile({ x: 0, y: 0 }, { x: 100, y: 100 });
// Automatically includes mutation at 95% progress to explode

<AbstractProjectile config={config} />
```

### Custom Projectile with Advanced Effects

```typescript
import { AbstractProjectile, createArc } from '@/lib/animation-effects';

const config: AbstractProjectileConfig = {
  from: { x: 0, y: 0 },
  to: { x: 200, y: 100 },
  shape: 'star',
  color: '#4169E1',
  size: 12,
  motion: createArc({ x: 0, y: 0 }, { x: 200, y: 100 }, 40),
  effects: ['trail', 'glow', 'pulse'],
  mutations: [
    {
      trigger: { type: 'progress', value: 0.5 },
      color: '#FF4500',
      size: 18,
    },
    {
      trigger: { type: 'progress', value: 0.9 },
      shape: 'circle',
      size: 30,
      effects: ['flash', 'glow'],
    },
  ],
  duration: 1200,
  onProgress: (progress, position) => {
    console.log(`Progress: ${progress}, Position:`, position);
  },
  onMutate: (mutation) => {
    console.log('Mutation triggered:', mutation);
  },
  onComplete: () => {
    console.log('Projectile completed');
  },
};

<AbstractProjectile config={config} />
```

## Mutation System

### Trigger Types

1. **Progress-based**: Trigger at specific animation progress (0-1)
   ```typescript
   { type: 'progress', value: 0.9 }  // At 90% complete
   ```

2. **Distance-based**: Trigger after traveling X pixels
   ```typescript
   { type: 'distance', value: 150 }  // After 150 pixels
   ```

3. **Time-based**: Trigger after X milliseconds
   ```typescript
   { type: 'time', value: 800 }  // After 800ms
   ```

4. **Position-based**: Trigger when near a specific point
   ```typescript
   { type: 'position', value: { x: 100, y: 50 }, threshold: 10 }
   ```

### Mutation Properties

Mutations can change any combination of:
- `shape`: New shape type
- `color`: New color (hex)
- `size`: New size in pixels
- `effects`: New effect array
- `transitionDuration`: Smooth transition time (ms)

## Preset Configurations

### Basic Ranged Weapons
- `ArrowProjectile` - Triangle, linear, trail
- `CrossbowBoltProjectile` - Rectangle, faster linear, short trail
- `ThrowingDaggerProjectile` - Triangle, arc, minimal trail
- `ThrowingAxeProjectile` - Rectangle, high arc, trail

### Magic Projectiles
- `MagicMissileProjectile` - Star, curved, trail + glow + pulse
- `EldritchBlastProjectile` - Circle, linear, trail + glow + flash
- `GuidingBoltProjectile` - Star, linear, all effects

### Explosive Projectiles
- `FireballProjectile` - Circle → Star mutation, arc, full effects
- `AcidSplashProjectile` - Circle → larger Circle mutation, arc
- `ScorchingRayProjectile` - Rectangle beam, linear, intense glow

### Advanced Projectiles
- `ChromaticOrbProjectile` - Color-shifting (red → green → blue)

## Effect Types

- **trail**: Motion trail following projectile path
- **glow**: Radial glow around projectile
- **pulse**: Pulsing size/opacity effect
- **flash**: Intermittent flashing
- **particles**: Particle emission (placeholder - full implementation in later tasks)

## Performance

- **Optimized rendering**: React.memo, minimal re-renders
- **Efficient effects**: Smart visibility toggling
- **Proper cleanup**: Animation stop on unmount
- **Smooth transitions**: RequestAnimationFrame-based

## Integration with Motion System

All motion path generators work seamlessly:

```typescript
import {
  createLinearMotion,
  createArc,
  createOrbit,
  createBounce,
  createWave,
} from '@/lib/animation-effects';

// Use any motion generator
const config = {
  // ... other config
  motion: createOrbit(center, radius, startAngle, endAngle),
};
```

## Type Safety

- **Zero `any` types**: Complete TypeScript safety
- **Exhaustive checks**: All switch statements are exhaustive
- **Exact types**: No loose or implicit types
- **Proper generics**: Type-safe mutation system

## Success Criteria ✓

- [x] AbstractProjectile component supports all shape types
- [x] Motion path integration works with all 5 generators
- [x] Effect system can attach multiple effects simultaneously
- [x] Mutation system triggers correctly (progress/distance/time/position)
- [x] Smooth transitions during mutations
- [x] Preset configurations provided (11 presets)
- [x] Zero TypeScript errors, zero `any` types
- [x] React.memo optimization applied
- [x] Proper cleanup prevents memory leaks

## File Statistics

- **Total lines**: 820
- **Type definitions**: 98 lines
- **Component logic**: 308 lines
- **Mutation system**: 179 lines
- **Presets**: 292 lines (11 presets)

## Next Steps (Tasks 11-12)

- Registry system for projectile templates
- Factory pattern for projectile creation
- Template validation and caching
