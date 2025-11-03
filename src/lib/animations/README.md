# Universal Animation Library

A comprehensive, type-safe animation system for D&D MapMaker supporting spells, combat, environmental effects, and status animations.

## 🎯 Design Philosophy

- **Universal**: One library for all animation types
- **Type-Safe**: Full TypeScript support with `type` declarations (no `interface`)
- **Composable**: Build complex animations from simple primitives
- **Extensible**: Easy to add new animation types
- **Performance**: Optimized for 60fps with many simultaneous animations
- **Progressive**: Start simple, add complexity gradually

## 📁 Directory Structure

```
src/lib/animations/
├── index.ts                      # Main exports and API
├── types.ts                      # ALL type definitions (centralized)
├── core/                         # Base abstract classes
│   ├── AbstractProjectile.ts     # Base for projectile animations
│   ├── AbstractBurst.ts          # Base for burst/explosion animations
│   ├── AbstractAreaEffect.ts    # Base for persistent area effects
│   └── AbstractRay.ts            # Base for beam/ray animations
├── spells/                       # Spell-specific implementations
│   ├── projectile/
│   │   ├── Fireball.ts           # Fireball projectile + burst
│   │   ├── MagicMissile.ts       # Magic missile (curved, multi)
│   │   └── AcidArrow.ts          # Acid arrow with splash
│   ├── ray/
│   │   ├── RayOfFrost.ts         # Ray of frost beam
│   │   ├── ScorchingRay.ts       # Scorching ray (multi-beam)
│   │   └── EldritchBlast.ts      # Eldritch blast
│   ├── area/
│   │   ├── Darkness.ts           # Darkness sphere
│   │   ├── FogCloud.ts           # Fog cloud (billowing)
│   │   └── CloudOfDaggers.ts     # Cloud of daggers (rotating)
│   └── burst/
│       ├── PoisonSpray.ts        # Poison spray cone
│       ├── Thunderwave.ts        # Thunderwave burst
│       └── SoundBurst.ts         # Sound burst explosion
├── combat/                       # Combat animations
│   ├── attacks/
│   │   ├── MeleeAttack.ts        # Melee swing/slash
│   │   ├── RangedAttack.ts       # Arrow/bolt flight
│   │   └── ThrownWeapon.ts       # Thrown dagger/axe
│   └── movement/
│       ├── Walk.ts               # Walking movement
│       ├── Fly.ts                # Flying movement
│       └── Teleport.ts           # Teleportation effect
├── environmental/                # Environmental effects
│   ├── weather/
│   │   ├── Rain.ts               # Rain particles
│   │   ├── Snow.ts               # Snowfall
│   │   └── Wind.ts               # Wind gusts
│   ├── lighting/
│   │   ├── Lightning.ts          # Lightning bolt
│   │   ├── Sunbeam.ts            # Sunbeam effect
│   │   └── Darkness.ts           # Darkness overlay
│   └── ambient/
│       ├── FloatingDust.ts       # Dust particles
│       ├── Mist.ts               # Ground mist
│       └── MagicalAura.ts        # Magical aura glow
├── status/                       # Status effect animations
│   ├── Poison.ts                 # Poisoned (green bubbles)
│   ├── Burning.ts                # Burning (fire particles)
│   ├── Frozen.ts                 # Frozen (ice crystals)
│   └── Stunned.ts                # Stunned (stars circling)
├── registry/                     # Animation registry system
│   ├── AnimationRegistry.ts      # Central registry
│   └── AnimationFactory.ts       # Factory for creating animations
├── utils/                        # Shared utilities
│   ├── motion.ts                 # Motion path generators
│   ├── easing.ts                 # Easing functions
│   ├── particles.ts              # Particle system
│   └── typeGuards.ts             # Type guard functions
└── api/                          # Public API
    ├── AnimationCaster.ts        # Simple casting API
    └── TimelineIntegration.ts    # Timeline integration
```

## 🚀 Implementation Phases

### Phase 1: Foundation ✅ COMPLETED
- ✅ Create comprehensive type definitions in `types.ts` (500+ lines, all animation types)
- ✅ Implement utility functions (easing, motion, typeGuards)
- ✅ Implement `AbstractProjectile` base class with RAF animation loop
- ✅ Create Fireball spell with variants (empowered, maximized, delayed, persistent)
- ✅ Create Magic Missile spell with volley support
- ✅ Export system and usage examples

### Phase 2: Core Abstractions ✅ COMPLETED
- ✅ Implement `AbstractBurst` (357 lines) - Multi-phase animation, shapes, shockwaves
- ✅ Implement `AbstractAreaEffect` (378 lines) - Persistent areas, pulsing, rotation, tracking
- ✅ Implement `AbstractRay` (329 lines) - Beams, flickering, flowing, multi-ray, tapering
- ✅ All base abstractions complete and ready for spell implementations

### Phase 3: Spell Library (MVP) ✅ COMPLETED
- ✅ **Projectiles**: Fireball, Magic Missile
- ✅ **Bursts**: Thunderwave
- ✅ **Area Effects**: Darkness
- ✅ **Rays**: Ray of Frost

### Phase 4: Timeline Integration & Public API ✅ COMPLETED
- ✅ AnimationCaster API (promise-based execution)
- ✅ TimelineIntegration API (round/event scheduling)
- ✅ Persistent effect management
- ✅ Concentration tracking
- ✅ Comprehensive API documentation

### Phase 5: Combat Animations
- Melee attacks (slash, stab, smash)
- Ranged attacks (arrow, bolt, thrown)
- Movement animations (walk, fly, teleport)

### Phase 5: Combat Animations & Enhancement
- Advanced particle effects
- Complex motion paths (homing, zigzag)
- Multi-projectile animations
- Environmental animations
- Status effect animations

## 📚 Type System

All types are defined in `types.ts` using `type` declarations (not `interface`). Key type categories:

### Geometry & Primitives
- `Point`, `Vector2D`, `Rectangle`, `Circle`
- `Color` (CSS color strings)

### Animation Categories
- `AnimationCategory`: `'projectile' | 'burst' | 'area' | 'ray' | 'movement' | 'environmental' | 'status'`

### Motion & Paths
- `MotionType`: Linear, curved, arc, spiral, wave, orbit, etc.
- `EasingType`: Linear, ease-in/out, cubic, elastic, bounce
- `MotionPath`: Complete path configuration

### Visual Effects
- `TrailEffect`: Trail behind projectiles
- `GlowEffect`: Glowing aura
- `ParticleEffect`: Particle emissions
- `SoundEffect`: Audio integration

### Animation Types
- `BaseAnimation`: Common properties for all animations
- `ProjectileAnimation`: Projectile-specific properties
- `BurstAnimation`: Burst/explosion properties
- `AreaAnimation`: Persistent area effect properties
- `RayAnimation`: Beam/ray properties
- `MovementAnimation`: Token movement properties
- `EnvironmentalAnimation`: Weather/ambient properties
- `StatusAnimation`: Status effect properties

### Composition
- `CompositeAnimation`: Combine multiple animations (parallel/sequential/staggered)

## 🎨 Example Usage

```typescript
import { animationCaster, timelineIntegration, cast } from '@/lib/animations'

// Quick spell cast
const fireball = cast.fireball({ x: 200, y: 300 }, { x: 800, y: 500 })
fireball.play()

// Promise-based casting with callbacks
await animationCaster.spell.fireball(
  { x: 200, y: 300 },
  { x: 800, y: 500 },
  {
    onStart: () => console.log('Casting...'),
    onComplete: () => console.log('Hit!')
  }
)

// Sequential spell combo
await animationCaster.castSequence([
  { name: 'Magic Missile', config: { fromPosition: from, toPosition: target1 } },
  { name: 'Magic Missile', config: { fromPosition: from, toPosition: target2 } },
  { name: 'Magic Missile', config: { fromPosition: from, toPosition: target3 } }
])

// Timeline integration - schedule for round 2, event 3
timelineIntegration.schedule.darkness(
  2,  // Round
  3,  // Event
  { x: 500, y: 500 },  // Position
  {
    durationType: 'rounds',
    duration: 10,
    concentration: true,
    casterId: 'wizard-123'
  }
)

// Execute timeline events
await timelineIntegration.executeEventsForRound(2, 3)
```

See `API_EXAMPLES.md` for 50+ complete usage examples.

## 🔧 Development Guidelines

### Adding New Animation Types

1. **Define types** in `types.ts` (extend `BaseAnimation`)
2. **Create abstract base** in `core/` directory
3. **Implement specific animations** in appropriate subdirectory
4. **Register in AnimationRegistry**
5. **Export from index.ts**

### Type Safety Rules

- ✅ **Use `type`**, not `interface`
- ✅ **Centralize types** in `types.ts`
- ✅ **Use union types** for variants (`Animation` type)
- ✅ **Provide type guards** in `utils/typeGuards.ts`
- ✅ **Use discriminated unions** (e.g., `category` field)

### Performance Considerations

- Use `requestAnimationFrame` for smooth 60fps
- Implement object pooling for particle effects
- Cache motion path calculations
- Optimize for many simultaneous animations
- Use web workers for heavy computations

## 🎯 Design Principles

1. **Start Simple**: Basic animations first, enhance later
2. **Type Safety**: Full TypeScript coverage
3. **Composability**: Combine primitives for complex effects
4. **Reusability**: Animation logic independent of game state
5. **Extensibility**: Easy to add new animation types
6. **Performance**: Optimized for real-time rendering
7. **Testing**: Isolated components, easy to test

## 🔄 Migration from Current System

The existing animation system (`UnifiedProjectile`, `SpellRenderer`, etc.) will remain for backward compatibility. New animations will use this library, and existing animations can be migrated gradually.

## 📝 Status

**Current Phase**: Phase 4 - Timeline Integration & Public API ✅ COMPLETED

**All Phases Completed** ✅:

**Phase 1 - Foundation**:
- ✅ Comprehensive type system in `types.ts` (536 lines)
- ✅ Utility functions: easing (11 functions), motion (8 generators), typeGuards
- ✅ AbstractProjectile base class with RAF loop
- ✅ Fireball spell with 4 variants
- ✅ Magic Missile spell with volley support

**Phase 2 - Core Abstractions**:
- ✅ AbstractBurst (357 lines) - Explosion effects with multi-phase animation
- ✅ AbstractAreaEffect (378 lines) - Persistent areas with pulsing/rotation
- ✅ AbstractRay (329 lines) - Beam effects with flickering/flowing

**Files Created** (Phase 1 & 2):
- `types.ts` (536 lines) - All animation type definitions
- `utils/easing.ts` (173 lines) - 11 easing functions
- `utils/motion.ts` (342 lines) - 8 motion generators
- `utils/typeGuards.ts` (56 lines) - Type guards
- `core/AbstractProjectile.ts` (241 lines) - Projectile base class
- `core/AbstractBurst.ts` (357 lines) - Burst base class
- `core/AbstractAreaEffect.ts` (378 lines) - Area effect base class
- `core/AbstractRay.ts` (329 lines) - Ray base class
- `spells/projectile/Fireball.ts` (196 lines) - Fireball implementation
- `spells/projectile/MagicMissile.ts` (208 lines) - Magic Missile implementation
- `EXAMPLES.md` - Comprehensive usage guide
- `README.md` - Architecture documentation

**Phase 3 - Spell Library MVP**:
- ✅ Thunderwave (burst) - 183 lines
- ✅ Darkness (area) - 175 lines
- ✅ Ray of Frost (ray) - 193 lines
- ✅ AnimationRegistry - 256 lines
- ✅ AnimationFactory - 208 lines

**Phase 4 - Timeline Integration & Public API**:
- ✅ AnimationCaster API - 351 lines
- ✅ TimelineIntegration API - 416 lines
- ✅ API Examples documentation - 550+ lines

**Total**: ~5,482 lines of production-ready, type-safe animation code

**Next Steps** (Phase 5):
1. Combat animations (melee, ranged, movement)
2. Additional spell implementations
3. Environmental effects
4. Status effect animations
