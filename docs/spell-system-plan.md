# Spell Casting System Implementation Plan

## Overview
This document outlines the implementation plan for adding a spell casting system to the MapMaker D&D combat timeline. The system supports various spell types with different animation patterns and introduces a "void token" concept for environmental/DM-initiated spells.

## 1. Spell Classification System

### Spell Categories

#### 1.1 Projectile with Burst
- **Animation**: Projectile travels from caster to target, explodes on impact
- **Examples**: Fireball, Ice Shard, Acid Splash
- **Visual**: Moving orb → explosion effect
- **Duration**: Travel time + burst animation

#### 1.2 Projectile (No Burst)
- **Animation**: Simple projectile from caster to target
- **Examples**: Magic Missile, Eldritch Blast, Guiding Bolt
- **Visual**: Moving energy bolt
- **Duration**: Travel time only

#### 1.3 Ray
- **Animation**: Instant beam from caster to target
- **Examples**: Ray of Frost, Scorching Ray, Disintegrate
- **Visual**: Continuous energy beam
- **Duration**: Beam sustain time

#### 1.4 Area Effect
- **Animation**: Effect appears at target location
- **Examples**: Web, Fog Cloud, Darkness, Entangle
- **Visual**: Persistent area overlay
- **Duration**: Can persist multiple rounds

#### 1.5 Burst
- **Animation**: Explosion at target location (no travel)
- **Examples**: Thunderwave, Shatter, Fireball (at location)
- **Visual**: Expanding circle/shockwave
- **Duration**: Explosion animation only

## 2. Void Token Concept

### Purpose
- Represents environmental or DM-initiated spell effects
- Always exists but remains invisible
- Located at map center by default
- Cannot be moved or have appear/disappear events
- Can only cast spell events

### Implementation
```typescript
interface VoidToken {
  id: 'void-token'
  type: 'token'
  name: 'Environment'
  position: { x: mapWidth/2, y: mapHeight/2 }
  isVoid: true
  visible: false
  locked: true
  allowedEvents: ['spell']
}
```

## 3. Data Structure Updates

### Type Definitions
```typescript
// Spell categories
export type SpellCategory =
  | 'projectile-burst'
  | 'projectile'
  | 'ray'
  | 'area'
  | 'burst'

// Spell event data
export interface SpellEventData {
  type: 'spell'
  spellName: string
  category: SpellCategory
  fromPosition: Position      // Caster position
  toPosition: Position        // Target position
  color: string              // Primary spell color
  secondaryColor?: string    // Optional secondary color
  size: number              // Effect size/radius in pixels
  duration: number          // Animation duration in ms
  projectileSpeed?: number  // Pixels per second
  burstRadius?: number      // Burst effect radius
  persistDuration?: number  // Rounds for area effects
  particleEffect?: boolean  // Enable particle effects
}

// Update event types
export type EventType = 'move' | 'appear' | 'disappear' | 'spell'
export type EventData = MoveEventData | AppearEventData | DisappearEventData | SpellEventData
```

## 4. Animation Specifications

### 4.1 Projectile with Burst
1. **Launch Phase** (200ms)
   - Create projectile at caster position
   - Scale up from 0 to full size
   - Add glow effect

2. **Travel Phase** (variable)
   - Move along path (arc or straight)
   - Particle trail effect
   - Rotation based on direction

3. **Impact Phase** (300ms)
   - Projectile scales down
   - Burst effect scales up
   - Flash effect at impact point

4. **Burst Phase** (500ms)
   - Expand burst radius
   - Fade out with particles

### 4.2 Projectile (No Burst)
1. **Launch Phase** (100ms)
   - Quick scale up at origin

2. **Travel Phase** (variable)
   - Linear or curved path
   - Trail effect

3. **Impact Phase** (200ms)
   - Scale down and fade

### 4.3 Ray
1. **Initiation** (100ms)
   - Line appears from caster

2. **Extension** (200ms)
   - Line extends to target

3. **Sustain** (300ms)
   - Pulsing/glowing effect

4. **Dissipate** (200ms)
   - Fade from caster to target

### 4.4 Area Effect
1. **Materialization** (500ms)
   - Fade in at location
   - Possible growth animation

2. **Active State** (persistent)
   - Subtle animation (pulse, swirl)
   - Semi-transparent overlay

3. **Dissipation** (500ms)
   - Fade out or shrink

### 4.5 Burst
1. **Initial Flash** (50ms)
   - Bright center point

2. **Expansion** (300ms)
   - Rapid radius increase

3. **Sustain** (200ms)
   - Hold at max size

4. **Fade** (250ms)
   - Gradual opacity decrease

## 5. UI/UX Updates

### EventEditor Enhancements

#### Spell Event UI Elements
1. **Event Type Selection**
   - Add "Cast Spell" button with wand icon

2. **Spell Configuration Panel**
   - Spell name input (with autocomplete from presets)
   - Category dropdown
   - Target position picker
   - Color selection (primary and secondary)
   - Size/radius slider (in grid units)
   - Duration controls

3. **Caster Selection**
   - Token dropdown (excluding void token)
   - "Cast from Environment" checkbox
   - When checked, automatically uses void token

### Visual Indicators
- Spell icon in timeline events
- Different colors for spell categories
- Preview of spell effect area on hover

## 6. Implementation Phases

### Phase 1: Core Infrastructure ✅
- [ ] Update type definitions
- [ ] Add SpellEventData interface
- [ ] Extend EventType union
- [ ] Create spell category types

### Phase 2: Void Token System
- [ ] Auto-create void token on map init
- [ ] Add isVoid flag to token type
- [ ] Filter void token from UI displays
- [ ] Special handling in event validation

### Phase 3: EventEditor Updates
- [ ] Add spell event type button
- [ ] Create spell configuration form
- [ ] Implement preset system
- [ ] Add color and size controls

### Phase 4: Animation Components
- [ ] Create SpellAnimationController
- [ ] Implement ProjectileSpell component
- [ ] Implement RaySpell component
- [ ] Implement AreaSpell component
- [ ] Implement BurstSpell component

### Phase 5: Animation Integration
- [ ] Update useTokenAnimation hook
- [ ] Add spell event handlers
- [ ] Coordinate multi-phase animations
- [ ] Handle persistent effects

### Phase 6: Visual Effects
- [ ] Add particle system
- [ ] Implement glow effects
- [ ] Create spell trails
- [ ] Add impact flashes

## 7. Spell Presets

### Common D&D Spells
```typescript
const spellPresets = {
  // Projectile with Burst
  fireball: {
    name: 'Fireball',
    category: 'projectile-burst',
    color: '#ff4500',
    secondaryColor: '#ffa500',
    projectileSpeed: 500,
    burstRadius: 20, // 20ft radius
    duration: 1500,
    particleEffect: true
  },

  // Projectile
  magicMissile: {
    name: 'Magic Missile',
    category: 'projectile',
    color: '#9370db',
    projectileSpeed: 800,
    duration: 800,
    particleEffect: true
  },

  // Ray
  rayOfFrost: {
    name: 'Ray of Frost',
    category: 'ray',
    color: '#00bfff',
    duration: 1000
  },

  // Area Effect
  web: {
    name: 'Web',
    category: 'area',
    color: '#f5f5dc',
    size: 20, // 20ft cube
    duration: 1000,
    persistDuration: 10 // 10 rounds
  },

  // Burst
  thunderwave: {
    name: 'Thunderwave',
    category: 'burst',
    color: '#4169e1',
    secondaryColor: '#ffffff',
    burstRadius: 15, // 15ft cube
    duration: 800
  }
}
```

## 8. Technical Considerations

### Performance
- Use React.memo for spell components
- Implement animation pooling for repeated effects
- Optimize particle systems with maximum particle counts
- Use requestAnimationFrame for smooth animations

### Accessibility
- Provide text descriptions of spell effects
- Option to reduce animation complexity
- Sound effect alternatives for visual effects

### Validation
- Ensure target position is within map bounds
- Validate spell range (if implementing)
- Check line of sight (optional feature)
- Prevent invalid spell/token combinations

## 9. Future Enhancements

### Version 2.0 Features
- Spell range validation
- Line of sight checking
- Spell slot tracking
- Concentration tracking
- Multiple target selection
- Chain lightning effects
- Cone/line area templates
- Spell save DC integration
- Damage roll automation

### Version 3.0 Features
- Custom spell creation UI
- Import spells from D&D Beyond
- Spell effect combinations
- Environmental interactions
- Dynamic lighting integration
- Sound effects library
- Spell component tracking
- Metamagic options

## 10. Testing Strategy

### Unit Tests
- Spell event creation
- Animation timing
- Position calculations
- Event validation

### Integration Tests
- Timeline integration
- Animation sequencing
- Multi-spell coordination
- Persistence across rounds

### Visual Tests
- Animation smoothness
- Effect rendering
- Color accuracy
- Performance benchmarks

## Appendix: Color Palette

### Damage Types
- **Fire**: #ff4500 (orange-red)
- **Cold**: #00bfff (ice blue)
- **Lightning**: #ffff00 (electric yellow)
- **Poison**: #228b22 (toxic green)
- **Acid**: #32cd32 (lime green)
- **Psychic**: #da70d6 (purple)
- **Necrotic**: #4b0082 (dark purple)
- **Radiant**: #ffd700 (golden)
- **Force**: #4169e1 (royal blue)
- **Thunder**: #708090 (slate gray)

---

*Document Version: 1.0*
*Last Updated: 2024*
*Author: MapMaker Development Team*