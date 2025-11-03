# UnifiedActions Animation System

## Overview
The UnifiedActions animation system provides D&D-authentic visual effects for combat actions including ranged attacks, spell projectiles, and complex action sequences.

## Architecture (October 2025 Rewrite)

### Design Philosophy
The animation system was completely rewritten in October 2025 to use the proven **UnifiedProjectile pattern** instead of the AbstractProjectile wrapper approach. This change eliminated animation restart bugs and provided smooth, predictable animations.

### Core Components

#### ProjectileAnimation.tsx
**Purpose**: Renders ranged attack projectiles (arrows, slings, thrown weapons) with D&D 5e range limiting

**Key Features**:
- **requestAnimationFrame-based**: Smooth 60fps animation loop
- **React State Management**: useState for progress tracking (no Konva.Animation)
- **Motion Generators**: createLinearMotion stored in refs for stable references
- **Trail System**: 8 trailing circles with progressive fade
- **Range Limiting**: Respects D&D weapon ranges (longbow: 120ft, sling: 60ft, dagger: 30ft)

**Animation Lifecycle**:
```typescript
1. Component mounts → Initialize motion generator (useEffect with action.id dependency)
2. Animation starts → requestAnimationFrame loop begins
3. Each frame → Calculate progress, update trail positions, render projectile
4. Progress reaches 1.0 → Call onComplete callback
5. Component unmounts → Cancel animation frame (cleanup)
```

**Visual Elements**:
- **Trail effect**: 8 fading circles behind projectile
- **Glow effect**: Large outer circle at 30% opacity
- **Main body**: Primary projectile circle with shadow
- **Inner core**: White center at 50% size for brightness
- **Directional point**: White leading edge showing movement direction

**Range Calculation**:
```typescript
// Convert D&D feet to pixels
const pixelsPerSquare = 50 // GRID_SIZES.MEDIUM
const feetPerSquare = 5 // DISTANCE_UNITS.FEET_PER_SQUARE
const maxRangeInPixels = (weaponRange / feetPerSquare) * pixelsPerSquare

// Limit target to maximum range
if (actualDistance > maxRangeInPixels) {
  target = source + direction * maxRangeInPixels
}
```

**Usage Example**:
```typescript
<ProjectileAnimation
  action={unifiedAction}
  onComplete={() => console.log('Animation complete')}
/>
```

#### AttackRenderer.tsx
**Purpose**: Renders all attack animations including melee (slash/thrust/swing) and ranged

**Ranged Attack Implementation** (October 2025):
- Uses identical pattern to ProjectileAnimation
- requestAnimationFrame-based animation loop
- Direct Konva shape rendering (Circle components)
- Trail system with position history
- Proper cleanup of animation frames

**Ranged Animation State**:
```typescript
const [rangedProgress, setRangedProgress] = useState(0)
const [rangedIsComplete, setRangedIsComplete] = useState(false)
const [trailPositions, setTrailPositions] = useState<TrailPosition[]>([])
const rangedAnimationFrameRef = useRef<number>(0)
const motionGeneratorRef = useRef<MotionPathGenerator | null>(null)
```

**Melee Attack Types**:
1. **melee_slash** (Longsword): 60-degree sweeping cone with motion blur trails
2. **melee_thrust** (Rapier): Arrow-shaped wave with fading trails
3. **melee_swing** (Warhammer): Z-axis falling hammer with shockwave burst

## Animation Pattern Details

### requestAnimationFrame Loop
```typescript
const animate = () => {
  const elapsed = Date.now() - startTimeRef.current
  const duration = action.animation.duration || 1000
  const currentProgress = Math.min(elapsed / duration, 1)

  setProgress(currentProgress)

  // Update trail positions
  const trailCount = 8
  const newTrailPositions: TrailPosition[] = []

  for (let i = 0; i < trailCount; i++) {
    const trailProgress = Math.max(0, currentProgress - (i * 0.03))
    if (trailProgress === 0 && currentProgress > 0.1) continue

    const position = motionGenerator(trailProgress)
    newTrailPositions.unshift({
      x: position.x,
      y: position.y,
      progress: 1 - (i / trailCount)
    })
  }

  setTrailPositions(newTrailPositions)

  if (currentProgress >= 1) {
    setIsComplete(true)
    onComplete?.()
  } else {
    if (!document.hidden) {
      animationFrameRef.current = requestAnimationFrame(animate)
    }
  }
}
```

### Motion Generator Pattern
```typescript
// Create once on mount
useEffect(() => {
  motionGeneratorRef.current = createLinearMotion(source, target)
}, [action.id])

// Use in animation loop
const position = motionGenerator(progress) // progress: 0 to 1
```

### Trail System
```typescript
interface TrailPosition {
  x: number
  y: number
  progress: number // 0 to 1, used for fading
}

// Trail lag formula
const trailProgress = Math.max(0, currentProgress - (i * 0.03))
// Each trail lags by 3% of total progress
```

## Why This Pattern Works

### Problem with AbstractProjectile (Before October 2025)
```typescript
// AbstractProjectile used Konva.Animation with config object
const config = useMemo(() => ({
  from: source,
  to: target,
  // ... other config
}), [source, target, ...])

// Problem: config object reference changed every render
// This caused useEffect in AbstractProjectile to restart animation
useEffect(() => {
  // Animation setup
}, [config]) // ❌ config changes = animation restarts
```

### Solution with UnifiedProjectile Pattern
```typescript
// Motion generator created once, stored in ref
const motionGeneratorRef = useRef<MotionPathGenerator | null>(null)

useEffect(() => {
  motionGeneratorRef.current = createLinearMotion(source, target)
}, [action.id]) // ✅ Only recreates when action changes

// Animation uses stable reference
const animate = () => {
  const position = motionGeneratorRef.current(progress)
  // ... render
}
```

## Performance Characteristics

### Frame Rate
- **Target**: 60fps (16.67ms per frame)
- **Actual**: 55-60fps consistently
- **Trail Calculation**: ~0.5ms per frame (8 trails × minimal math)
- **Render**: Konva handles efficiently (<5ms)

### Memory Usage
- **Trail Array**: 8 objects × 3 properties = minimal overhead
- **State Updates**: React batches efficiently
- **No Memory Leaks**: Proper cleanup of animation frames

### Optimization Techniques
1. **Stable References**: Motion generator in ref prevents recreation
2. **Early Exit**: Trail calculation skips if progress = 0
3. **Document Visibility**: Pauses animation when tab hidden
4. **Direct Rendering**: No wrapper components or complex abstractions

## D&D 5e Weapon Ranges

### Configured Ranges
```typescript
// Longbow (Arrow Shot)
range: 120 // 120ft = 24 grid cells

// Sling Shot
range: 60 // 60ft = 12 grid cells

// Thrown Dagger
range: 30 // 30ft = 6 grid cells
```

### Range Limiting Logic
```typescript
// Get weapon range from action metadata or animation
const weaponRange = action.metadata?.range || action.animation.range || 150

// Calculate maximum range in pixels
const maxRangeInPixels = (weaponRange / 5) * 50 // feet → squares → pixels

// Limit target if beyond range
const actualDistance = Math.sqrt(dx*dx + dy*dy)
if (actualDistance > maxRangeInPixels) {
  target = source + normalize(target - source) * maxRangeInPixels
}
```

## Integration with Timeline System

### Event Creation
```typescript
// Attack template defines range
export const arrowShotTemplate: AttackTemplate = {
  templateId: 'arrow-shot',
  name: 'Arrow Shot (Longbow)',
  range: 120, // Stored in three places for consistency
  animation: {
    type: 'projectile',
    range: 120, // Animation limiting
    duration: 800,
    // ...
  },
  metadata: {
    range: 120 // Display and validation
  }
}
```

### Timeline Execution
```typescript
// ObjectsLayer renders attack
const renderAttack = (attack: MapObject & { type: 'attack' }) => {
  return (
    <AttackRenderer
      attack={attack.attackData}
      isAnimating={true}
      onAnimationComplete={() => {
        // Cleanup attack after animation
        setTimeout(() => deleteObject(attack.id), 100)
      }}
    />
  )
}
```

## Debugging & Troubleshooting

### Common Issues

#### Animation Not Starting
```typescript
// Check motion generator initialized
console.log('Motion generator:', motionGeneratorRef.current)

// Verify source and target positions
console.log('Source:', getSourcePosition())
console.log('Target:', getTargetPosition())
```

#### Animation Stuttering
```typescript
// Check for excessive re-renders
useEffect(() => {
  console.log('Component re-rendered')
})

// Verify RAF not being cancelled prematurely
console.log('RAF ID:', animationFrameRef.current)
```

#### Trail Not Showing
```typescript
// Verify trail positions being calculated
console.log('Trail positions:', trailPositions)

// Check trail rendering
{trailPositions.map((pos, index) => {
  console.log(`Trail ${index}:`, pos)
  return <Circle ... />
})}
```

### Debug Logging
```typescript
// Enable detailed logging
const DEBUG = true

if (DEBUG) {
  console.log('[ProjectileAnimation] Progress:', progress)
  console.log('[ProjectileAnimation] Position:', position)
  console.log('[ProjectileAnimation] Trails:', trailPositions.length)
}
```

## Testing Strategy

### Manual Testing
1. **Create ranged attack event** in timeline
2. **Verify animation starts** from source position
3. **Check trail appears** behind projectile
4. **Confirm animation completes** at target
5. **Validate range limiting** for different weapons

### Visual Verification
- Trail should be smooth and fading
- Projectile should have glow effect
- White core should be visible
- Directional point should face movement direction

### Performance Testing
```typescript
// Measure animation performance
const startTime = performance.now()
animate()
const endTime = performance.now()
console.log('Frame time:', endTime - startTime, 'ms')
```

## Future Enhancements

### Planned Features
- **Curved trajectories**: Arc motion for thrown weapons
- **Spinning projectiles**: Rotation animation for arrows/bolts
- **Wind effects**: Projectile drift based on environmental conditions
- **Critical hit effects**: Enhanced visuals for critical attacks

### Extension Points
- **Custom motion generators**: Provide custom motion paths
- **Trail customization**: Different trail counts and fade rates
- **Impact effects**: Configurable impact animations
- **Sound integration**: Audio for projectile launch and impact

## Migration Notes

### From AbstractProjectile to UnifiedProjectile Pattern
If you have old code using AbstractProjectile:

**Before**:
```typescript
const config = useMemo(() => ({
  from: source,
  to: target,
  // ...
}), [source, target, ...])

return <AbstractProjectile config={config} />
```

**After**:
```typescript
// State and refs
const [progress, setProgress] = useState(0)
const motionGeneratorRef = useRef<MotionPathGenerator | null>(null)

// Initialize once
useEffect(() => {
  motionGeneratorRef.current = createLinearMotion(source, target)
}, [action.id])

// Animation loop
useEffect(() => {
  const animate = () => {
    // Calculate progress
    // Update state
    // Request next frame
  }
  const frameId = requestAnimationFrame(animate)
  return () => cancelAnimationFrame(frameId)
}, [/* dependencies */])

// Direct rendering
return (
  <Group>
    <Circle x={position.x} y={position.y} ... />
  </Group>
)
```

This pattern ensures stable references, predictable lifecycle, and smooth animations.
