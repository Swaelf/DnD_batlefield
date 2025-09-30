# Testing the Spell Animation System

## Prerequisites
1. Create a new map or load an existing one
2. Add at least one token to the map (or use environment caster)

## Test Steps

### 1. Start Combat
- Click the "Start Combat" button at the bottom of the screen
- You should see "Round 1" appear

### 2. Open Event Editor
- Click the calendar/event icon in the combat tracker
- The Event Editor popup will open

### 3. Create a Spell Event
- Select a token (or check "Environment Caster" in the spell sidebar)
- Click the "Spell" event type button (lightning icon)
- In the left sidebar, configure your spell:
  - Choose a preset (e.g., "Fireball") or set custom settings
  - Select animation type (projectile-burst, ray, etc.)
  - Choose colors and size
- Set the target position (click the map pin button or enter coordinates)
- Click "Add Event"
- You should see the event listed on the right side

### 4. Trigger the Animation
- Close the Event Editor
- Click the "Next Round" button (forward arrow) in the combat tracker
- The spell animation should play when you enter Round 2

## Console Debugging
Open the browser console (F12) to see debug messages:
- "Round changed from X to Y" - confirms round advancement
- "Processing spell event" - confirms spell event detection
- "Creating spell effect" - confirms spell object creation
- "MapStore: Adding spell to map" - confirms spell added to map
- "Rendering spell" - confirms spell is being rendered
- "ProjectileSpell component mounted" - confirms animation component loaded

## Common Issues

### Animation Not Playing
1. **Not in combat**: Must start combat first
2. **Wrong round**: Events are scheduled for NEXT round, not current
3. **No token selected**: Either select a token or use environment caster
4. **Missing target position**: Must set where spell should go

### Visual Issues
1. **Spell too small**: Increase size in spell configuration
2. **Color not visible**: Choose a contrasting color
3. **Animation too fast**: Currently fixed at 1 second duration

## Expected Behavior
When working correctly:
1. Spell object is added to the map when round advances
2. Animation plays (projectile flies, ray beams, area appears, etc.)
3. Effect disappears after animation completes
4. Console shows all debug messages in sequence