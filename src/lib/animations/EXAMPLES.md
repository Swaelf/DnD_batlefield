# Animation Library - Usage Examples

## Phase 1: Projectile Animations

### Basic Fireball

```typescript
import { Fireball } from '@/lib/animations'

// Create a fireball from wizard to orc
const fireball = new Fireball({
  fromPosition: { x: 200, y: 300 },
  toPosition: { x: 800, y: 500 }
})

// Start the animation
fireball.play()

// Track progress
const interval = setInterval(() => {
  const progress = fireball.getProgress()
  const position = fireball.getCurrentPosition()

  console.log(`Fireball at ${Math.round(progress * 100)}%`, position)

  if (progress >= 1) {
    clearInterval(interval)
    console.log('Fireball exploded!')
  }
}, 100)
```

### Empowered Fireball

```typescript
import { Fireball } from '@/lib/animations'

// 25% larger fireball
const empoweredFireball = Fireball.createEmpowered(
  { x: 200, y: 300 },
  { x: 800, y: 500 }
)

empoweredFireball.play()
```

### Maximized Fireball

```typescript
import { Fireball } from '@/lib/animations'

// 50% larger fireball
const maximizedFireball = Fireball.createMaximized(
  { x: 200, y: 300 },
  { x: 800, y: 500 }
)

maximizedFireball.play()
```

### Custom Fireball

```typescript
import { Fireball } from '@/lib/animations'

// Customize all parameters
const customFireball = new Fireball({
  fromPosition: { x: 200, y: 300 },
  toPosition: { x: 800, y: 500 },
  speed: 300,              // Slower
  size: 30,                // Larger
  color: '#00FF00',        // Green fire!
  curveAmount: 0.5,        // More curved path
  trailLength: 15,         // Longer trail
  burstRadius: 300,        // Bigger explosion
  persistDuration: 5000    // Burning ground for 5 seconds
})

customFireball.play()
```

### Magic Missile - Single

```typescript
import { MagicMissile } from '@/lib/animations'

// Single magic missile
const missile = new MagicMissile({
  fromPosition: { x: 200, y: 300 },
  toPosition: { x: 800, y: 500 }
})

missile.play()
```

### Magic Missile - Volley (Multiple Targets)

```typescript
import { MagicMissile } from '@/lib/animations'

// Create volley targeting 3 different enemies
const targets = [
  { x: 700, y: 400 },  // Orc 1
  { x: 850, y: 450 },  // Orc 2
  { x: 900, y: 350 }   // Orc 3
]

const missiles = MagicMissile.createVolley(
  { x: 200, y: 300 },  // From wizard
  targets,
  3  // Spell level 3 = 5 missiles
)

// Play with 100ms stagger between missiles
MagicMissile.playVolleyStaggered(missiles, 100)
```

### Magic Missile - Quick Cast

```typescript
import { MagicMissile } from '@/lib/animations'

// Create and play immediately
const missiles = MagicMissile.castVolley(
  { x: 200, y: 300 },
  [
    { x: 700, y: 400 },
    { x: 850, y: 450 }
  ],
  1,    // Spell level
  150   // Stagger delay (ms)
)
```

### Using Lifecycle Hooks

```typescript
import { Fireball } from '@/lib/animations'

const fireball = new Fireball({
  fromPosition: { x: 200, y: 300 },
  toPosition: { x: 800, y: 500 }
})

// Get the animation configuration
const animation = fireball.getAnimation()

// Add lifecycle hooks
animation.onStart = () => {
  console.log('Fireball launched!')
  playSound('whoosh')
}

animation.onUpdate = (progress) => {
  if (progress > 0.5 && !halfway) {
    console.log('Halfway there!')
    halfway = true
  }
}

animation.onImpact = (position) => {
  console.log('Impact at', position)
  createExplosionParticles(position)
  shakeScreen(0.3, 200)
}

animation.onComplete = () => {
  console.log('Animation complete!')
  dealDamageToTargets()
}

fireball.play()
```

### Animation Control

```typescript
import { Fireball } from '@/lib/animations'

const fireball = new Fireball({
  fromPosition: { x: 200, y: 300 },
  toPosition: { x: 800, y: 500 }
})

// Start animation
fireball.play()

// Check if animating
if (fireball.isAnimating()) {
  console.log('Fireball is flying!')
}

// Get current state
const progress = fireball.getProgress() // 0-1
const position = fireball.getCurrentPosition() // {x, y}

// Stop animation
fireball.stop()

// Reset to beginning
fireball.reset()

// Cleanup when done
fireball.destroy()
```

### Custom Motion Paths

```typescript
import { Fireball } from '@/lib/animations'

// Straight line (no curve)
const straightFireball = new Fireball({
  fromPosition: { x: 200, y: 300 },
  toPosition: { x: 800, y: 500 },
  curveAmount: 0  // No curve
})

// Heavy curve
const curvedFireball = new Fireball({
  fromPosition: { x: 200, y: 300 },
  toPosition: { x: 800, y: 500 },
  curveAmount: 1  // Maximum curve
})

// Fast projectile
const fastFireball = new Fireball({
  fromPosition: { x: 200, y: 300 },
  toPosition: { x: 800, y: 500 },
  speed: 1000  // Very fast!
})
```

### Integration with Timeline (Future)

```typescript
import { Fireball, MagicMissile } from '@/lib/animations'
import { timelineIntegration } from '@/lib/animations/api/TimelineIntegration'

// Schedule fireball in combat round
const fireball = new Fireball({
  fromPosition: wizardToken.position,
  toPosition: orcToken.position
})

timelineIntegration.addAnimation({
  round: 1,
  event: 3,
  animation: fireball.getAnimation(),
  delay: 500  // 500ms delay before casting
})
```

### Using Utility Functions Directly

```typescript
import {
  createLinearMotion,
  createCurvedMotion,
  applyEasing,
  interpolatePoint
} from '@/lib/animations'

// Create custom motion path
const start = { x: 0, y: 0 }
const end = { x: 100, y: 100 }
const motionGenerator = createCurvedMotion(start, end, 50, 'up')

// Get position at 50% progress
const midpoint = motionGenerator(0.5)
console.log(midpoint) // { x: ~50, y: ~25 } (curved upward)

// Apply easing to progress
const linearProgress = 0.5
const easedProgress = applyEasing(linearProgress, 'easeOutElastic')
console.log(easedProgress) // ~0.65 (with bounce effect)

// Interpolate between two points
const interpolated = interpolatePoint(
  { x: 0, y: 0 },
  { x: 100, y: 100 },
  0.25,
  'easeInOut'
)
console.log(interpolated) // { x: 12.5, y: 12.5 } (eased)
```

## Next: Phase 2 Examples

Phase 2 will add:
- Burst animations (Thunderwave, explosions)
- Area effects (Darkness, Fog Cloud)
- Ray animations (Ray of Frost, beams)

Stay tuned!
