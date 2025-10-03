# Animation Effects Library

A comprehensive, performance-optimized animation system for D&D battle map effects built on atomic primitives with compositional architecture.

## Overview

This library provides a flexible and powerful system for creating complex spell effects, projectile animations, and environmental effects in the MapMaker D&D Battle Map Editor. The architecture follows a compositional approach where simple atomic primitives can be combined to create sophisticated animations.

## Architecture

### Core Principles

1. **Atomic Primitives**: Small, focused animation building blocks
2. **Composition Over Configuration**: Combine primitives rather than complex configs
3. **Performance First**: 60fps target with 10+ concurrent animations
4. **Type Safety**: Zero `any` types, comprehensive TypeScript coverage
5. **Reusability**: Abstract patterns shared across all 6 spell effect animations

### Directory Structure

```
animation-effects/
├── types/              # TypeScript type definitions
│   ├── primitives.ts   # Primitive type definitions
│   ├── composers.ts    # Composition type definitions
│   └── config.ts       # Configuration types
├── primitives/         # Atomic animation components
│   ├── motion/         # Motion primitives (Move, Rotate, Scale, Color)
│   └── effects/        # Visual effect primitives (Trail, Glow, Pulse, Flash, Particles)
├── motion/             # Motion path generators
├── composers/          # Composition systems (Sequential, Parallel, Conditional)
├── projectiles/        # Abstract projectile system
├── registry/           # Effect registry and factory
├── hooks/              # React hooks for animation management
├── utils/              # Utility functions (easing, math, pooling)
└── constants/          # Animation constants and defaults
```

## Design Patterns

### 1. Motion Primitives

Fundamental motion transformations:

- **Move**: Translate object from start to end position
- **Rotate**: Rotate object around a pivot point
- **Scale**: Change object size with anchor point
- **Color**: Transition object color and opacity

### 2. Effect Primitives

Visual effect enhancements:

- **Trail**: Motion trail with fade effect
- **Glow**: Aura/glow with optional pulse
- **Pulse**: Pulsing scale/opacity animation
- **Flash**: Quick flash effect
- **Particles**: Particle emission system

### 3. Composition Strategies

Combine primitives in various ways:

- **Sequential**: Execute primitives one after another
- **Parallel**: Execute primitives simultaneously
- **Conditional**: Execute based on runtime conditions

### 4. Motion Path Generators

Mathematical path generation:

- **Linear**: Straight line movement
- **Curved**: Bezier curve paths
- **Arc**: Parabolic arc motion
- **Wave**: Sinusoidal wave motion
- **Orbit**: Circular orbit paths
- **Bounce**: Bouncing ball physics

## Usage Examples

### Basic Motion Animation

```tsx
import { Move, DURATIONS, EASING } from '@/lib/animation-effects';

<Move
  config={{
    type: 'move',
    from: { x: 0, y: 0 },
    to: { x: 100, y: 100 },
    duration: DURATIONS.NORMAL,
    easing: EASING.easeInOut,
  }}
>
  {children}
</Move>
```

### Composed Animation

```tsx
import { SequentialComposer, ParallelComposer } from '@/lib/animation-effects';

// Move then rotate
<SequentialComposer
  config={{
    id: 'move-rotate',
    type: 'sequential',
    primitives: [moveConfig, rotateConfig],
  }}
>
  {children}
</SequentialComposer>

// Move and glow simultaneously
<ParallelComposer
  config={{
    id: 'move-glow',
    type: 'parallel',
    primitives: [moveConfig, glowConfig],
  }}
>
  {children}
</ParallelComposer>
```

### Abstract Projectile

```tsx
import { AbstractProjectile, PROJECTILE_SPEEDS } from '@/lib/animation-effects';

<AbstractProjectile
  config={{
    position: sourcePosition,
    target: targetPosition,
    speed: PROJECTILE_SPEEDS.FAST,
    motionType: 'arc',
    motionParams: { type: 'arc', height: 0.3 },
    appearance: {
      trail: { enabled: true, length: 10, fadeRate: 0.05 },
      glow: { enabled: true, radius: 10, intensity: 0.8 },
    },
  }}
/>
```

## Performance Considerations

### Targets

- **60fps**: Smooth animation with 10+ concurrent effects
- **Memory**: Object pooling reduces GC pressure
- **RAF Control**: Single requestAnimationFrame loop

### Optimization Techniques

1. **Object Pooling**: Reuse frequently created objects
2. **Batch Updates**: Combine multiple updates in single frame
3. **Progressive Rendering**: Render only visible effects
4. **Smart Cleanup**: Automatic cleanup of completed animations

## TypeScript Integration

All types are fully typed with zero `any` types:

```typescript
import type {
  PrimitiveConfig,
  CompositionConfig,
  AnimationPrimitive,
  EffectTemplate,
} from '@/lib/animation-effects';
```

## Development Phases

### Phase 1: Research & Analysis ✅
- Pattern identification across 6 animations
- Primitive type design (21 types)
- Migration strategy planning
- Performance requirements

### Phase 2: Foundation (Current)
- Directory structure setup
- Type definitions
- Constants and utilities
- Placeholder implementations

### Phase 3: Core Implementation
- Motion primitive implementation
- Effect primitive implementation
- Motion path generators
- Composition systems

### Phase 4: Advanced Features
- Abstract projectile system
- Registry and factory
- Performance optimization
- Testing and validation

### Phase 5: Migration
- Migrate existing spell effects
- Deprecate old implementations
- Documentation updates
- Performance benchmarking

## Contributing

When adding new primitives or features:

1. **Follow Type Safety**: No `any` types allowed
2. **Add Tests**: Unit tests for all new functionality
3. **Document**: Update README and inline documentation
4. **Performance**: Profile and ensure 60fps target
5. **Reusability**: Design for composition and reuse

## References

- **Research Documents**: `.notes/animation-patterns.md`
- **Design Document**: `.notes/animation-primitives-design.md`
- **Migration Guide**: `.notes/migration-strategy.md`
- **Performance Guide**: `.notes/performance-requirements.md`

## License

Part of the MapMaker D&D Battle Map Editor project.
