# Spell System Refactoring Plan

## Current Architecture Problems

1. **Monolithic Components**: Each spell type (ProjectileSpell, AreaSpell, etc.) contains both business logic and rendering
2. **Code Duplication**: Similar animation logic repeated across components
3. **Limited Reusability**: Can't easily compose complex spells from simple parts
4. **Tight Coupling**: Animation logic mixed with React rendering concerns
5. **Hard to Test**: Business logic embedded in React components

## Proposed Architecture

### Core Principles
- **Separation of Concerns**: Business logic in models, rendering in views
- **Composition over Inheritance**: Build complex spells from simple effects
- **Single Responsibility**: Each class/component does one thing well
- **Testability**: Pure functions and classes that can be unit tested
- **Performance**: Efficient animation updates without React re-renders

## Class Hierarchy

```typescript
// Base abstract class for all spell effects
abstract class SpellEffect {
  id: string
  position: Position
  duration: number
  startTime: number

  abstract update(deltaTime: number): void
  abstract render(ctx: Konva.Group): void
  abstract isComplete(): boolean
  abstract cleanup(): void
}

// Concrete effect implementations
class ProjectileEffect extends SpellEffect {
  private velocity: Vector2D
  private trail: Position[]
  private target: Position
  private speed: number
  private trackTarget: boolean
  private targetTokenId?: string

  update(deltaTime: number): void
  calculateTrajectory(): void
  updateTrail(): void
}

class BurstEffect extends SpellEffect {
  private radius: number
  private maxRadius: number
  private expandSpeed: number
  private fadeRate: number

  update(deltaTime: number): void
  calculateScale(): number
  calculateOpacity(): number
}

class AreaEffect extends SpellEffect {
  private radius: number
  private persistDuration: number
  private pulseAnimation?: PulseConfig

  update(deltaTime: number): void
  isPersistent(): boolean
}

class RayEffect extends SpellEffect {
  private startPos: Position
  private endPos: Position
  private width: number
  private pulseIntensity: number

  update(deltaTime: number): void
  calculateBeamPath(): Position[]
}

// Composite effect for complex spells
class CompositeEffect extends SpellEffect {
  private effects: SpellEffect[]
  private currentPhase: number
  private phaseTransitions: TransitionConfig[]

  addEffect(effect: SpellEffect, phase: number): void
  update(deltaTime: number): void
  transitionToNextPhase(): void
}
```

## Effect Factory Pattern

```typescript
class SpellEffectFactory {
  static createFireball(config: FireballConfig): CompositeEffect {
    const composite = new CompositeEffect()

    // Phase 1: Projectile
    const projectile = new ProjectileEffect({
      speed: config.projectileSpeed,
      color: config.color,
      trail: true,
      trackTarget: config.trackTarget
    })
    composite.addEffect(projectile, 0)

    // Phase 2: Burst on impact
    const burst = new BurstEffect({
      radius: config.burstRadius,
      color: config.burstColor,
      expandSpeed: config.burstSpeed
    })
    composite.addEffect(burst, 1)

    // Phase 3: Lingering area (optional)
    if (config.persistDuration > 0) {
      const area = new AreaEffect({
        radius: config.burstRadius * 0.8,
        persistDuration: config.persistDuration,
        color: config.persistColor
      })
      composite.addEffect(area, 2)
    }

    return composite
  }

  static createMagicMissile(config: MagicMissileConfig): ProjectileEffect {
    return new ProjectileEffect({
      speed: config.speed,
      color: config.color,
      curved: true,
      curveHeight: config.curveHeight,
      trail: true,
      trackTarget: true
    })
  }

  static createDarkness(config: DarknessConfig): AreaEffect {
    return new AreaEffect({
      radius: config.radius,
      persistDuration: config.duration,
      color: config.color,
      expandAnimation: true,
      particles: false
    })
  }
}
```

## React Component Architecture

```typescript
// Pure view components that only handle rendering
interface SpellViewProps {
  effect: SpellEffect
  layer: Konva.Group
}

// Generic spell renderer that delegates to effect
const SpellRenderer: React.FC<SpellViewProps> = ({ effect, layer }) => {
  const frameRef = useRef<number>()
  const lastTimeRef = useRef<number>(Date.now())

  useEffect(() => {
    const animate = () => {
      const now = Date.now()
      const deltaTime = now - lastTimeRef.current
      lastTimeRef.current = now

      // Update effect state
      effect.update(deltaTime)

      // Render to Konva
      effect.render(layer)

      if (!effect.isComplete()) {
        frameRef.current = requestAnimationFrame(animate)
      } else {
        effect.cleanup()
      }
    }

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
      effect.cleanup()
    }
  }, [effect, layer])

  return null // Effects render directly to Konva
}

// Specific view components for custom rendering needs
const ProjectileView: React.FC<{ effect: ProjectileEffect }> = ({ effect }) => {
  // Custom projectile rendering with React-Konva if needed
  return (
    <Group>
      <Circle
        x={effect.position.x}
        y={effect.position.y}
        radius={effect.size}
        fill={effect.color}
      />
      {/* Trail rendering */}
      {effect.trail.map((pos, i) => (
        <Circle
          key={i}
          x={pos.x}
          y={pos.y}
          radius={effect.size * (1 - i / effect.trailLength)}
          opacity={1 - i / effect.trailLength}
          fill={effect.color}
        />
      ))}
    </Group>
  )
}
```

## Animation Manager

```typescript
// Centralized animation management
class SpellAnimationManager {
  private activeEffects: Map<string, SpellEffect> = new Map()
  private animationLoop: number | null = null
  private lastFrameTime: number = 0

  addEffect(effect: SpellEffect): void {
    this.activeEffects.set(effect.id, effect)
    this.startAnimationLoop()
  }

  removeEffect(id: string): void {
    const effect = this.activeEffects.get(id)
    if (effect) {
      effect.cleanup()
      this.activeEffects.delete(id)
    }
  }

  private startAnimationLoop(): void {
    if (this.animationLoop !== null) return

    const animate = (timestamp: number) => {
      const deltaTime = timestamp - this.lastFrameTime
      this.lastFrameTime = timestamp

      // Update all active effects
      for (const [id, effect] of this.activeEffects) {
        effect.update(deltaTime)

        if (effect.isComplete()) {
          this.removeEffect(id)
        }
      }

      if (this.activeEffects.size > 0) {
        this.animationLoop = requestAnimationFrame(animate)
      } else {
        this.stopAnimationLoop()
      }
    }

    this.animationLoop = requestAnimationFrame(animate)
  }

  private stopAnimationLoop(): void {
    if (this.animationLoop !== null) {
      cancelAnimationFrame(this.animationLoop)
      this.animationLoop = null
    }
  }
}
```

## Implementation Phases

### Phase 1: Core Infrastructure
1. Create base `SpellEffect` abstract class
2. Implement `SpellAnimationManager` singleton
3. Create effect update/render lifecycle
4. Set up effect factory pattern

### Phase 2: Basic Effects
1. Implement `ProjectileEffect` class
2. Implement `BurstEffect` class
3. Implement `AreaEffect` class
4. Implement `RayEffect` class

### Phase 3: Composite Effects
1. Create `CompositeEffect` class for multi-phase spells
2. Implement phase transitions
3. Create factory methods for complex spells

### Phase 4: React Integration
1. Create `SpellRenderer` component
2. Update `ObjectsLayer` to use new system
3. Create view components for special cases
4. Integrate with timeline system

### Phase 5: Migration
1. Refactor Fireball (projectile → burst → area)
2. Refactor Magic Missile (projectile only)
3. Refactor Darkness (area only)
4. Refactor Ray of Frost (ray only)
5. Remove old spell components

## Benefits of New Architecture

### 1. Reusability
- Projectile logic shared between Fireball and Magic Missile
- Burst effect reusable for explosions, thunder damage, etc.
- Area effect used for persistent spells and environmental hazards

### 2. Composition
```typescript
// Easy to create new spell combinations
const lightningStrike = new CompositeEffect([
  new RayEffect({ /* lightning bolt from sky */ }),
  new BurstEffect({ /* thunder explosion */ }),
  new AreaEffect({ /* electrified ground */ })
])
```

### 3. Testability
```typescript
// Pure business logic tests
test('ProjectileEffect reaches target', () => {
  const effect = new ProjectileEffect({
    start: { x: 0, y: 0 },
    target: { x: 100, y: 0 },
    speed: 50
  })

  effect.update(1000) // 1 second
  expect(effect.position.x).toBe(50)

  effect.update(1000) // 2 seconds total
  expect(effect.position.x).toBe(100)
  expect(effect.isComplete()).toBe(true)
})
```

### 4. Performance
- Animation logic runs outside React render cycle
- Batch updates to Konva layer
- Efficient memory management with cleanup

### 5. Extensibility
- Easy to add new effect types
- Simple to create spell variants
- Plugin system for custom effects

## Example: Fireball Decomposition

```typescript
// Current monolithic approach
<ProjectileSpell
  spell={{
    category: 'projectile-burst',
    // ... many mixed properties
  }}
/>

// New composable approach
const fireball = SpellEffectFactory.createFireball({
  // Projectile phase
  projectileSpeed: 500,
  projectileColor: '#FF6B35',
  trackTarget: true,

  // Burst phase
  burstRadius: 80,
  burstDuration: 600,
  burstColor: '#FF4500',

  // Area phase
  persistDuration: 2000,
  persistColor: '#CC2500',
  persistOpacity: 0.4
})

animationManager.addEffect(fireball)
```

## Migration Strategy

1. **Parallel Development**: Build new system alongside existing
2. **Gradual Migration**: Convert one spell at a time
3. **Feature Flag**: Toggle between old/new system for testing
4. **Backwards Compatibility**: Adapter layer for existing data
5. **Performance Testing**: Ensure new system is faster
6. **Documentation**: Update all spell documentation

## Success Criteria

- [ ] All existing spells work with new architecture
- [ ] Performance improved (60fps maintained)
- [ ] Code reduction of at least 30%
- [ ] Unit test coverage > 80% for effect models
- [ ] New spells can be created in < 50 lines of code
- [ ] Animation manager handles 50+ simultaneous effects

## Next Steps

1. Review and approve this plan
2. Create base classes in `/src/models/spells/`
3. Implement ProjectileEffect as proof of concept
4. Test with Magic Missile (simplest case)
5. Expand to Fireball (complex case)
6. Full migration of all spells