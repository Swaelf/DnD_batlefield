# Spell System Documentation

## Overview
The spell system provides D&D-style magical effect animations for the MapMaker battle map editor. It supports various spell categories with realistic visual effects, timing, and persistence options.

## Architecture

### Core Components
```
Spells/
├── AreaSpell.tsx           # Area of effect spells (Web, Entangle, etc.)
├── BurstSpell.tsx          # Instant burst effects (Thunderwave, etc.)
├── ProjectileSpell.tsx     # Projectile spells with optional burst
├── RaySpell.tsx            # Instant ray effects (Ray of Frost, etc.)
└── index.ts               # Barrel exports
```

### Data Flow
1. **Event Creation** - EventEditor creates SpellEventData
2. **Map Integration** - Spell objects added to map via mapStore
3. **Rendering** - ObjectsLayer renders appropriate spell component
4. **Animation** - Konva animations handle visual effects
5. **Cleanup** - Auto-removal after animation completion

## Spell Categories

### 1. Area Effects (`area`)
**Purpose**: Persistent area effects that remain on the battlefield
**Examples**: Web, Entangle, Grease, Spike Growth
**Properties**:
- `size` - Effect radius in feet
- `persistDuration` - How long effect stays (in rounds)
- Shows size field in editor (not range)

**Visual Behavior**:
- Fade-in animation (500ms)
- Semi-transparent with border for persistent effects
- Hexagonal shape for Web, circular for others
- Particle effects optional

### 2. Burst Effects (`burst`)
**Purpose**: Instant explosion effects centered on target
**Examples**: Thunderwave, Shatter, Fireball (explosion part)
**Properties**:
- `size` - Burst radius in feet
- Shows size field in editor (not range)

**Visual Behavior**:
- Exponential expansion animation
- Core flash effect
- Multiple expanding rings
- Star particle effects
- Quick fade-out (600ms total)

### 3. Projectile (`projectile`)
**Purpose**: Simple projectiles that travel to target
**Examples**: Magic Missile, Eldritch Blast, Guiding Bolt
**Properties**:
- `range` - Maximum spell range in feet
- `projectileSpeed` - Travel speed (pixels/second)
- Shows range field in editor (not size)

**Visual Behavior**:
- Linear travel animation
- Trailing effect
- Directional arrow/point
- Disappears on impact

### 4. Projectile-Burst (`projectile-burst`)
**Purpose**: Projectiles that explode on impact
**Examples**: Fireball, Chromatic Orb
**Properties**:
- `range` - Projectile travel range in feet
- `size` - Burst explosion radius in feet
- `burstRadius` - Explosion size in pixels
- Shows both range AND size fields in editor

**Visual Behavior**:
- Phase 1: Projectile travel animation
- Phase 2: Burst explosion on impact
- Combined effect duration

### 5. Ray Effects (`ray`)
**Purpose**: Instant beam effects from caster to target
**Examples**: Ray of Frost, Scorching Ray, Disintegrate
**Properties**:
- `range` - Maximum beam range in feet
- Shows range field in editor (not size)

**Visual Behavior**:
- Instant beam appearance
- Pulsing/fading effect
- Quick duration (800ms)

## TypeScript Interfaces

### SpellEventData
```typescript
export interface SpellEventData {
  type: 'spell'
  spellName: string
  category: SpellCategory
  fromPosition: Position      // Caster position
  toPosition: Position        // Target position
  color: string              // Primary spell color
  secondaryColor?: string    // Optional secondary color
  size: number              // Effect size/radius in pixels (for area/burst effects)
  range?: number            // Spell range in feet (for projectile/ray spells)
  duration: number          // Animation duration in ms
  projectileSpeed?: number  // Pixels per second for projectiles
  burstRadius?: number      // Burst effect radius in pixels
  persistDuration?: number  // Rounds for area effects
  particleEffect?: boolean  // Enable particle effects
}
```

### SpellCategory
```typescript
export type SpellCategory =
  | 'projectile-burst'  // Projectile that explodes on impact
  | 'projectile'        // Simple projectile without burst
  | 'ray'              // Instant beam effect
  | 'area'             // Area effect that appears at location
  | 'burst'            // Explosion at target location
```

## Component APIs

### Common Props
All spell components share this interface:
```typescript
interface SpellProps {
  spell: SpellEventData
  isAnimating: boolean
  onAnimationComplete?: () => void
}
```

### Component-Specific Features

#### AreaSpell
- **Persistent Mode**: When `persistDuration > 0`, effect remains visible
- **Shape Variants**: Hexagon for web spells, circle for others
- **Opacity**: Lower opacity (0.5-0.7) for persistent effects
- **Border**: Visible stroke for persistent area boundaries

#### BurstSpell
- **Multi-Ring Animation**: 3 expanding rings with staggered timing
- **Star Particles**: 12 animated star particles (if enabled)
- **Core Flash**: Central bright flash effect
- **Exponential Scaling**: Power-law expansion for dramatic effect

#### ProjectileSpell
- **Two-Phase Animation**: Travel → Burst (for projectile-burst)
- **Trail Effect**: Fading line trail behind projectile
- **Directional Indicator**: Arrow pointing toward target
- **State Management**: Complex state machine for multi-phase spells

#### RaySpell
- **Instant Effect**: No travel time, immediate appearance
- **Beam Rendering**: Line with varying opacity and width
- **Pulse Animation**: Rhythmic intensity changes
- **Quick Duration**: Typically 800ms for snappy feel

## Integration with MapMaker

### Event Creation (EventEditor)
```typescript
// Conditional field rendering based on spell category
{(spellCategory === 'projectile' || spellCategory === 'projectile-burst' || spellCategory === 'ray') && (
  <div>
    <label>Range (ft)</label>
    <input type="number" value={spellRange} onChange={...} />
  </div>
)}

{(spellCategory === 'area' || spellCategory === 'burst' || spellCategory === 'projectile-burst') && (
  <div>
    <label>{spellCategory === 'projectile-burst' ? 'Burst Size (ft)' : 'Effect Size (ft)'}</label>
    <input type="number" value={spellSize} onChange={...} />
  </div>
)}
```

### Map Rendering (ObjectsLayer)
```typescript
const renderSpell = (spell: MapObject & { type: 'spell'; spellData?: SpellEventData }) => {
  const spellProps = {
    spell: spell.spellData,
    isAnimating: true,
    onAnimationComplete: handleAnimationComplete
  }

  switch (spell.spellData.category) {
    case 'projectile':
    case 'projectile-burst':
      return <ProjectileSpell key={spell.id} {...spellProps} />
    case 'ray':
      return <RaySpell key={spell.id} {...spellProps} />
    case 'area':
      return <AreaSpell key={spell.id} {...spellProps} />
    case 'burst':
      return <BurstSpell key={spell.id} {...spellProps} />
  }
}
```

### State Management (mapStore)
```typescript
// Add spell effect to map
addSpellEffect: (spellData: SpellEventData) => {
  const spellObject: MapObject = {
    id: nanoid(),
    type: 'spell',
    position: spellData.fromPosition,
    rotation: 0,
    layer: 1000, // Always on top
    spellData
  }

  set((state) => {
    state.currentMap?.objects.push(spellObject)
    state.mapVersion++ // Force re-render
  })
}
```

## Spell Presets

### Built-in Presets
```typescript
const spellPresets = {
  fireball: {
    name: 'Fireball',
    category: 'projectile-burst',
    color: '#ff4500',
    size: 20,
    range: 150,
    duration: 0
  },
  magicMissile: {
    name: 'Magic Missile',
    category: 'projectile',
    color: '#9370db',
    range: 120,
    duration: 0
  },
  rayOfFrost: {
    name: 'Ray of Frost',
    category: 'ray',
    color: '#00bfff',
    range: 60,
    duration: 0
  },
  web: {
    name: 'Web',
    category: 'area',
    color: '#f5f5dc',
    size: 20,
    duration: 10
  },
  thunderwave: {
    name: 'Thunderwave',
    category: 'burst',
    color: '#4169e1',
    size: 15,
    duration: 0
  },
  entangle: {
    name: 'Entangle',
    category: 'area',
    color: '#228b22',
    size: 20,
    duration: 10
  },
  grease: {
    name: 'Grease',
    category: 'area',
    color: '#708090',
    size: 10,
    duration: 10
  }
}
```

## Performance Considerations

### Optimization Techniques
1. **Animation Cleanup**: Always stop Konva animations in useEffect cleanup
2. **Radius Guards**: Use `Math.max()` to prevent negative radius errors
3. **Memory Management**: Auto-remove spell objects after animation
4. **Render Limiting**: Only animate when `isAnimating` is true

### Performance Guards
```typescript
// Prevent negative radius canvas errors
radius={Math.max(1, spell.size)}
innerRadius={Math.max(0, spell.size * 0.7)}
outerRadius={Math.max(innerRadius + 1, spell.size)}

// Cleanup animations
useEffect(() => {
  return () => {
    if (currentAnimationRef.current) {
      currentAnimationRef.current.stop()
      currentAnimationRef.current = null
    }
  }
}, [])
```

## Animation Timing

### Standard Durations
- **Ray spells**: 800ms (quick and snappy)
- **Projectiles**: Variable based on distance and speed
- **Bursts**: 600ms (dramatic but not slow)
- **Area effects**: 500ms fade-in, then persistent
- **Projectile-burst**: Travel time + 300ms burst

### Easing Functions
- **Linear**: For projectile travel
- **Power curves**: For burst expansion (`Math.pow(progress, 0.5)`)
- **Sine waves**: For pulsing effects (`Math.sin(progress * Math.PI)`)

## Error Handling

### Common Issues
1. **Negative Radius**: Fixed with Math.max guards
2. **Missing Spell Data**: Component returns null gracefully
3. **Animation Conflicts**: Proper cleanup prevents memory leaks
4. **Invalid Positions**: Validated in event creation

### Debugging
```typescript
// Enable spell debug logging
console.log('SpellAnimation:', spell.spellName, 'Progress:', progress)

// Animation state tracking
const [animationState, setAnimationState] = useState<'travel' | 'burst' | 'complete'>('travel')
```

## Future Enhancements

### Planned Features
- **Sound Effects**: Audio integration for spell impacts
- **Damage Numbers**: Floating damage text animation
- **Spell School Colors**: Automatic color schemes by magic school
- **Custom Animations**: User-defined spell effect patterns
- **Concentration Tracking**: Visual indicators for concentration spells
- **Spell Resistance**: Visual feedback for spell saves

### Extension Points
- **New Categories**: Easy to add new spell types
- **Custom Components**: Plugin system for user spell effects
- **Animation Curves**: Configurable easing functions
- **Particle Systems**: More complex particle effects

## Development Guidelines

### Adding New Spell Categories
1. Update `SpellCategory` type in `timeline.ts`
2. Create new component in `Spells/` directory
3. Add case to `ObjectsLayer.renderSpell()`
4. Update `EventEditor` conditional rendering
5. Add preset examples

### Best Practices
- Always use `Math.max()` for radius calculations
- Implement proper animation cleanup
- Use consistent naming for animation refs
- Document timing and visual behavior
- Test with various spell sizes and ranges
- Handle edge cases gracefully

### Code Review Checklist
- [ ] Negative radius guards implemented
- [ ] Animation cleanup in useEffect
- [ ] Proper TypeScript typing
- [ ] Performance optimizations
- [ ] Error boundary compatibility
- [ ] Accessibility considerations
- [ ] Visual consistency with theme