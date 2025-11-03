# Spell Templates - Unified Spell System

## Overview

All spells in the application are defined in `spellTemplates.ts`. This file is the **single source of truth** for all spell data.

## ⚠️ Important Notes

### Removed: `src/constants/spells.ts`
The old `constants/spells.ts` file has been **deleted** as it was not being used anywhere in the codebase. All spell definitions are now consolidated here.

### Why One Source?
- ✅ No duplicate definitions
- ✅ Complete D&D 5e properties included
- ✅ Unified with attacks and interactions
- ✅ Automatic UI integration
- ✅ Type-safe with TypeScript
- ✅ Easy to maintain

## Complete Spell List (20 Spells)

### Fire Spells
- **Fireball** (3rd level) - Projectile-burst with 20ft radius
- **Burning Hands** (1st level) - 15ft fire cone
- **Breath of the Dragon** (3rd level) - 30ft fire cone with 1 round persist

### Ice Spells
- **Ray of Frost** (cantrip) - Ice beam
- **Cone of Cold** (5th level) - 60ft ice cone
- **Ice Storm** (4th level) - Multi-burst ice spell with difficult terrain

### Lightning Spells
- **Lightning Bolt** (3rd level) - 100ft line
- **Shocking Grasp** (cantrip) - Touch attack

### Force Spells
- **Magic Missile** (1st level) - Curved projectile with tracking
- **Eldritch Blast** (cantrip) - Force projectile

### Divine Spells
- **Sacred Flame** (cantrip) - Radiant pillar
- **Guiding Bolt** (1st level) - Light projectile
- **Cure Wounds** (1st level) - Healing touch

### Other
- **Darkness** (2nd level) - 15ft radius, 10 rounds
- **Poison Spray** (cantrip) - 40ft poison cone
- **Ice Storm** (4th level) - Multi-burst ice spell with difficult terrain
- **Thunderwave** (1st level) - Thunder burst
- **Web** (2nd level) - 20ft area, 10 rounds

## Animation Types

Each spell uses one of these animation types:

| Type | Description | Examples |
|------|-------------|----------|
| `projectile` | Linear or curved projectile | Magic Missile, Eldritch Blast |
| `projectile_burst` | Projectile + explosion | Fireball |
| `ray` / `beam` | Instant beam | Ray of Frost |
| `area` | Persistent area effect | Darkness, Web |
| `burst` | Explosion at target | Thunderwave, Ice Storm |
| `cone` | Cone-shaped wave | Burning Hands, Breath of Dragon |
| `line` | Linear bolt | Lightning Bolt |
| `touch` | Melee touch spell | Cure Wounds, Shocking Grasp |
| `pillar` | Vertical pillar | Sacred Flame |

## Adding a New Spell

### 1. Choose Animation Type
Decide which animation type best represents your spell (see table above).

### 2. Add to spellTemplates.ts
```typescript
{
  id: 'my-spell-template',
  name: 'My Spell',
  description: 'A magical spell effect',
  type: 'spell',
  category: 'fire', // fire, ice, lightning, force, divine, etc.
  tags: ["spell","magic"],
  source: { x: 0, y: 0 }, // Set when used
  target: { x: 0, y: 0 }, // Set when used

  // Animation configuration
  animation: {
    type: 'projectile', // Choose from animation types above
    duration: 1000,     // Animation duration in ms
    color: '#FF0000',   // Primary color
    size: 15,           // Spell size in pixels

    // Additional properties based on type:
    // For projectiles:
    speed: 500,
    trail: true,
    trackTarget: true,

    // For cones:
    coneAngle: 60,
    particles: true,

    // For area effects:
    persistDuration: 5,
    persistOpacity: 0.5,
  },

  // Area of effect (if applicable)
  effects: {
    affectedTargets: [],
    highlightColor: '#FF0000',
    areaOfEffect: {
      type: 'circle', // circle, cone, line
      center: { x: 0, y: 0 },
      radius: 20
    }
  },

  // D&D 5e properties
  metadata: {
    name: 'My Spell',
    description: 'D&D spell description from the PHB'
  },
  range: 120,          // Range in feet
  damage: '3d8',       // Damage dice
  damageType: 'fire',  // fire, ice, lightning, force, etc.
  spellLevel: 2,       // 0-9
  castingTime: 'action',

  timestamp: 0,
  duration: 1000
}
```

### 3. Test Your Spell
The spell will automatically appear in the "Add Action Event" menu. Test it by:
1. Starting combat
2. Opening event editor
3. Selecting your spell from the list
4. Casting it and verifying the animation

## Cone Spells (Special Case)

Cone spells have additional properties:

```typescript
animation: {
  type: 'cone',
  size: 30,        // Cone length in feet
  coneAngle: 60,   // Cone angle in degrees (usually 60° for D&D)
  particles: true, // Enable fire/ice particles

  // For persistent cones (like Breath of Dragon):
  persistDuration: 1,      // Rounds to persist
  persistColor: '#CC2500', // Color for lingering effect
  persistOpacity: 0.4      // Opacity of lingering effect
}
```

### Cone Rendering Features
- Wave animation from source to target
- Multiple wave fronts (4 waves at different progress points)
- Particle effects for fire/ice/poison spells
- Origin glow at caster position
- Proper opacity fade-out

## Color Constants

Use predefined colors from `/src/constants/colors.ts`:
- `SPELL_COLORS.FIRE` = '#ff4500'
- `SPELL_COLORS.ICE` = '#00bfff'
- `SPELL_COLORS.LIGHTNING` = '#FFD700'
- `SPELL_COLORS.FORCE` = '#9370DB'
- `SPELL_COLORS.THUNDER` = '#4169e1'
- `SPELL_COLORS.POISON` = '#9ACD32'
- `SPELL_COLORS.NECROTIC` = '#8B008B'
- `SPELL_COLORS.RADIANT` = '#FFD700'
- `SPELL_COLORS.PSYCHIC` = '#FF1493'

## Example: Complete Spell Definition

```typescript
{
  id: 'fireball-template',
  name: 'Fireball',
  description: 'A magical spell effect',
  type: 'spell',
  category: 'fire',
  tags: ["spell","magic"],
  source: { x: 0, y: 0 },
  target: { x: 0, y: 0 },
  animation: {
    type: 'projectile_burst',
    duration: 1500,
    color: '#FF6B35',
    size: 20,
    speed: 500,
    trail: true,
    trackTarget: true,
    burstSize: 80,
    burstDuration: 600,
    persistDuration: 2,
    persistColor: '#CC2500',
    persistOpacity: 0.4
  },
  effects: {
    affectedTargets: [],
    highlightColor: '#FF6B35',
    areaOfEffect: {
      type: 'circle',
      center: { x: 0, y: 0 },
      radius: 80
    }
  },
  metadata: {
    name: 'Fireball',
    description: 'A bright streak flashes from your pointing finger...'
  },
  range: 150,
  areaOfEffect: 80,
  damage: '8d6',
  damageType: 'fire',
  spellLevel: 3,
  castingTime: 'action',
  timestamp: 0,
  duration: 1500
}
```

## Files to Know

### Spell Definition
- **This file** - All spell templates defined here

### Rendering
- `/src/components/Spells/SimpleSpellComponent.tsx` - Renders all spell animations

### UI
- `/src/components/Timeline/ActionSelectionModal.tsx` - Spell selection interface
- `/src/components/Timeline/UnifiedEventEditor.tsx` - Event editor integration

### Types
- `/src/types/unifiedAction.ts` - UnifiedAction type definition
- `/src/types/timeline.ts` - SpellEventData type (legacy, still used for animation)

## Migration from constants/spells.ts

If you see old code referencing `constants/spells.ts`:
- ❌ **OLD:** `import { SPELL_PRESETS } from '@/constants/spells'`
- ✅ **NEW:** `import { spellTemplates } from '@/data/unifiedActions/spellTemplates'`

The old file has been removed. All spell data is now here.
