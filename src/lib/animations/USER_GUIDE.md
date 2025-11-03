# Animation Library - User Guide

## How to Use Animation Library Spells in Timeline

### Quick Start

The new animation library spells are **already integrated** into the MapMaker timeline system! You can access them through the normal event creation workflow.

### Step-by-Step Guide

#### 1. Open Event Editor
- Click the **"Timeline"** button in the top bar
- Click **"Add Event"** button in the timeline panel
- The **UnifiedEventEditor** modal will open

#### 2. Select a Token
- Choose which character/token will cast the spell
- You can:
  - Select from the dropdown list of tokens
  - Click "Pick Token from Map" for visual selection

#### 3. Choose Spell Action
- Click the **"Select Action"** button
- The **Action Selection Modal** opens showing all available actions
- Click the **"Spell"** category filter (⚡ icon) to see only spells

#### 4. Enhanced Spells (with ✨)
Look for spells marked with a sparkle ✨ icon - these use the new animation library!

**Available Enhanced Spells:**
- **Fireball** ✨ - Curved projectile with explosion
- **Magic Missile** ✨ - Homing volley of force darts
- **Darkness** ✨ - Persistent pulsing darkness field
- **Ray of Frost** ✨ - Tapering icy beam
- **Thunderwave** ✨ - Directional burst with screen shake

#### 5. Select Target Position
- After selecting a spell, pick where it will hit
- Click "Pick Position from Map" for visual targeting
- Or manually enter coordinates

#### 6. (Optional) Customize Spell
- Click the **"Edit" button** (pencil icon) next to the spell name
- The **Action Customization Modal** opens
- Adjust properties like:
  - **Color** - Change spell color
  - **Size** - Adjust effect radius
  - **Duration** - Change animation length
  - **Power** - Select normal/empowered/maximized variants

#### 7. Add to Timeline
- Click **"Add Event"** button
- The spell is added to the next combat round
- It will execute when you advance to that round

### Enhanced Features

#### Fireball ✨
**What's Enhanced:**
- Curved projectile path for dramatic effect
- Explosive burst on impact
- Lingering fire effects
- Screen shake on explosion

**Customization Options:**
- `curveAmount`: 0-1 (controls arc height)
- `power`: 'normal' | 'empowered' | 'maximized'

**Usage Tips:**
- Default fireball has slight arc (0.3)
- Maximized version has larger explosion and darker color
- Empowered increases damage and visual intensity

#### Magic Missile ✨
**What's Enhanced:**
- Auto-creates 3 darts at spell level 1
- Each dart homes to target independently
- Curved paths with slight randomization
- Staggered launch (150ms between darts)
- Level scaling (more darts at higher levels)

**Customization Options:**
- `spellLevel`: 1-9 (determines dart count)
- `stagger`: delay in ms between darts

**Usage Tips:**
- Cast at 3rd level for 5 darts
- Increase stagger for more dramatic volley effect
- Darts automatically track moving targets

#### Darkness ✨
**What's Enhanced:**
- Pulsing "breathing" effect
- Persistent area for full duration
- Multiple duration types (time, rounds, events)
- Optional target tracking
- Concentration spell support

**Customization Options:**
- `durationType`: 'time' | 'rounds' | 'events'
- `duration`: 10 rounds default (D&D 5e)
- `intensity`: 'normal' | 'deeper'
- `trackTarget`: true/false (follow moving object)

**Usage Tips:**
- Use 'rounds' duration for D&D combat
- Enable `trackTarget` if cast on a moving token
- 'Deeper' intensity for upcasted version

#### Ray of Frost ✨
**What's Enhanced:**
- Tapering beam (thick to thin)
- Flickering icy effect
- Flowing frost particles (20 ice crystals)
- Cantrip damage scaling
- Icy blue glow

**Customization Options:**
- `casterLevel`: 1-20 (affects damage: 1d8 → 4d8)
- `power`: 'normal' | 'empowered'

**Usage Tips:**
- Beam appears instantly (no travel time)
- Scales automatically with caster level
- Empowered version has thicker beam

#### Thunderwave ✨
**What's Enhanced:**
- Square burst (15-foot cube from top-down)
- Directional casting (north/south/east/west)
- Screen shake effect
- Electric particle effects (40 white sparks)
- Shockwave rings

**Customization Options:**
- `spellLevel`: 1-9 (affects size and intensity)
- `direction`: 'north' | 'south' | 'east' | 'west'
- `power`: 'normal' | 'empowered'

**Usage Tips:**
- Default direction is 'north' (away from caster)
- Higher spell levels create larger burst
- Screen shake intensity scales with power

### Spell Behavior

#### Persistent Effects
Some spells remain on the map after casting:

**Darkness:**
- Stays for full duration (10 rounds default)
- Follows target if `trackTarget` enabled
- Automatically removed when duration expires
- Supports concentration (removed if caster loses concentration)

**Other Enhanced Spells:**
- Instant effects (Fireball, Magic Missile, Ray of Frost, Thunderwave)
- Animate and complete immediately
- No persistent map objects

#### Duration Types

Enhanced spells support three duration types:

1. **Time-based** (`durationType: 'time'`):
   - Duration in milliseconds (real-time)
   - Example: `duration: 30000` = 30 seconds

2. **Round-based** (`durationType: 'rounds'`):
   - Duration in D&D combat rounds
   - Example: `duration: 10` = 10 rounds

3. **Event-based** (`durationType: 'events'`):
   - Duration in timeline events
   - Example: `duration: 5` = 5 events

### Comparison: Enhanced vs Legacy

#### Enhanced Spells (Animation Library)
**Pros:**
- Advanced visual effects
- Smooth animations (60fps)
- Customizable properties
- Promise-based execution
- Multiple duration types
- Concentration tracking

**Cons:**
- Only 5 spells currently available

#### Legacy Spells (Old System)
**Pros:**
- More spell variety available
- Battle-tested and stable

**Cons:**
- Limited customization
- Simple animations
- No advanced features

### Tips & Tricks

#### Visual Indicators
- **✨ Sparkle Icon** - Uses animation library
- **No Icon** - Uses legacy system
- Both work perfectly fine!

#### Performance
- Animation library spells are optimized for 60fps
- Multiple spells can play simultaneously
- No performance impact with many spells

#### Customization Workflow
1. Select spell from modal
2. Click Edit button
3. Adjust properties in customization modal
4. Preview changes
5. Save or cancel

#### Best Practices
- **Darkness**: Use for area denial, blocking vision
- **Fireball**: Perfect for grouped enemies
- **Magic Missile**: Guaranteed hits on multiple targets
- **Ray of Frost**: Single-target damage with slow
- **Thunderwave**: Area control and crowd control

### Troubleshooting

#### Spell Doesn't Play
**Check:**
1. Is the event in the current or future round?
2. Did you select both source token and target position?
3. Is the spell within range?

#### Animation Looks Wrong
**Check:**
1. Color values are valid CSS colors (#RRGGBB)
2. Size/radius values are positive numbers
3. Duration is in milliseconds (not seconds)

#### Persistent Effect Won't Disappear
**Check:**
1. Duration type matches your intent
2. Duration value is correct (rounds vs events vs time)
3. Timeline is advancing properly

### Future Spell Additions

The animation library is designed for easy expansion. More spells coming soon:

**Planned Spells:**
- Acid Arrow (projectile with splash)
- Scorching Ray (multi-beam)
- Eldritch Blast (warlock cantrip)
- Cloud of Daggers (rotating area)
- Fog Cloud (billowing area)

### API for Developers

If you want to add custom spells programmatically:

```typescript
import { animationCaster } from '@/lib/animations'

// Cast fireball
await animationCaster.spell.fireball(
  { x: 200, y: 300 },  // From wizard
  { x: 800, y: 500 },  // To target
  {
    onComplete: () => console.log('Fireball hit!')
  }
)

// Cast darkness with concentration
await animationCaster.spell.darkness(
  { x: 500, y: 500 },  // Center position
  {
    // Callbacks for lifecycle events
  }
)
```

See `API_EXAMPLES.md` for complete developer documentation.

### Summary

**You can already use the new animation library spells!**

1. Open Timeline → Add Event
2. Filter by "Spell" category
3. Look for spells with ✨ icon
4. Select, customize, and add to timeline
5. Enjoy enhanced animations!

The integration is seamless - no configuration needed. The enhanced spells automatically use the animation library while maintaining full compatibility with the existing timeline system.
