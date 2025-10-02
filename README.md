# 🐉 MapMaker - D&D Battle Map Editor

**A professional, browser-based battle map editor for Dungeons & Dragons 5th Edition and tabletop RPGs.**

MapMaker is a powerful, feature-rich tool that allows Dungeon Masters and players to create dynamic battle maps with tokens, spell effects, environmental features, and animated combat timelines. Built with modern web technologies for smooth 60 FPS performance even with hundreds of objects.

![MapMaker Screenshot](docs/screenshot.png)

---

## 📋 Table of Contents

- [Features](#-features)
- [Quick Start](#-quick-start)
- [User Guide](#-user-guide)
  - [Basic Map Creation](#basic-map-creation)
  - [Working with Tokens](#working-with-tokens)
  - [Drawing Tools](#drawing-tools)
  - [Spell Effects](#spell-effects)
  - [Combat Timeline](#combat-timeline)
  - [Keyboard Shortcuts](#keyboard-shortcuts)
- [Feature Status](#-feature-status)
- [System Requirements](#-system-requirements)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)

---

## ✨ Features

### Core Features (✅ Fully Working)

#### Map Editing
- **📐 Grid System**: Square grids with customizable size (default 50px)
- **🎨 Drawing Tools**: Rectangle, circle, line, polygon, and freehand drawing
- **🖼️ Background Images**: Import custom battle map images
- **📏 Measurement Tool**: Measure distances in feet (D&D 5e compliant)
- **🎯 Snap to Grid**: Toggle grid snapping for precise placement
- **🔄 Pan & Zoom**: Smooth canvas navigation with mouse/trackpad

#### Token Management
- **🎭 D&D Token Sizes**: Support for all D&D 5e creature sizes
  - Tiny (2.5ft), Small/Medium (5ft), Large (10ft), Huge (15ft), Gargantuan (20ft)
- **🖼️ Custom Token Images**: Upload and use your own token artwork
- **💚 HP Tracking**: Visual HP bars and status tracking
- **🎯 Token Selection**: Click to select, multi-select with Ctrl/Cmd
- **🚶 Token Movement**: Drag tokens with grid snapping support
- **🎨 Token Customization**: Name, size, color, and image settings

#### Spell Effects & Animations
- **✨ D&D Spell Library**: Pre-configured templates for popular spells
  - Fireball, Magic Missile, Ray of Frost, Web, Thunderwave, and more
- **🎆 Spell Categories**: Area effects, projectiles, rays, bursts
- **⏱️ Persistent Areas**: Web, Entangle, and other lasting effects
- **🎬 Smooth Animations**: 60 FPS spell animations and transitions
- **🎨 Customizable Effects**: Adjust size, color, duration, and speed

#### Combat Timeline (✅ Fully Functional)
- **📅 Round-Based System**: D&D 5e initiative tracking
- **🎬 Event Sequencing**: Plan complex combat scenarios
  - Movement events
  - Attack actions with D&D weapon support
  - Spell casting with visual effects
  - Custom action sequences
- **▶️ Timeline Playback**: Execute combat rounds with animations
- **⏯️ Playback Controls**: Play, pause, skip forward/backward

#### Professional Features
- **📊 Layer Management**: Organize objects into layers
  - Background, terrain, tokens, effects, fog of war, UI layers
  - Layer visibility, locking, opacity control
  - Drag-and-drop layer reordering
- **💾 Save/Load System**: JSON format for map persistence
- **📸 Export Options**: Export maps as PNG images
- **🎨 Static Object Library**: Pre-built D&D assets (doors, chests, furniture)
- **⌨️ Keyboard Shortcuts**: Full keyboard support for all tools

### Advanced Features (✅ Implemented)

#### Action Sequencing System
- **🎯 Complex Action Builder**: Create multi-step combat actions
- **🔄 Sequence Types**: Simple, conditional, parallel, loop, and branch sequences
- **📚 Template Library**: 20+ pre-built D&D action patterns
  - Charge Attack, Full Attack, Fighting Retreat
  - Stealth Scout, Trap Detection
  - Weather Ambush, Terrain Control
- **✅ Real-time Validation**: Instant feedback on action configuration

#### Performance Optimizations
- **⚡ 60 FPS Performance**: Smooth rendering with 500+ objects
- **🎯 Viewport Culling**: Only render visible objects (60-90% performance gain)
- **💾 Memory Efficiency**: Object pooling and smart caching
- **🚀 Zero-Runtime CSS**: Vanilla Extract for optimal bundle size

### Known Limitations & Future Features

#### Working But Needs Polish
- **Text Tool** (Need Fix): Basic text placement works, styling limited
- **Polygon Tool** (Need Fix): Can create polygons, UX needs improvement
- **Undo/Redo** (Need Fix): Basic functionality present, some edge cases

#### Not Yet Implemented
- **🌐 Multiplayer/Collaboration**: Real-time multi-user editing (planned)
- **☁️ Cloud Sync**: Online storage and cross-device sync (planned)
- **📱 Mobile Support**: Touch-optimized interface (planned)
- **🔊 Sound Effects**: Audio for spell impacts and actions (planned)
- **🌫️ Fog of War**: Dynamic vision system for players (planned)
- **🎲 Dice Rolling**: Integrated dice roller with D&D rules (planned)

---

## 🚀 Quick Start

### Prerequisites

**Required:**
- Node.js 16.13+ (recommended: 18.x or 20.x)
- pnpm 8.15.0 (package manager)

**Installing pnpm:**
```bash
# Option 1: Using npm
npm install -g pnpm@8.15.0

# Option 2: Using corepack (Node.js 16.13+)
corepack enable
corepack prepare pnpm@8.15.0 --activate
```

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/mapmaker.git
cd mapmaker
```

2. **Install dependencies:**
```bash
pnpm install
```

3. **Start development server:**
```bash
pnpm dev
```

4. **Open your browser:**
Navigate to `http://localhost:3000`

### Building for Production

```bash
# Build optimized production bundle
pnpm build

# Preview production build
pnpm preview
```

---

## 📖 User Guide

### Basic Map Creation

1. **Start a New Map**
   - Click **File → New Map** (or press `Ctrl+N`)
   - Set map dimensions (default: 1920x1080)
   - Choose grid size (default: 50px = 5 feet in D&D)

2. **Import Background Image**
   - Click **File → Import Image**
   - Select your battle map image
   - Image will be placed as background layer

3. **Grid Configuration**
   - Toggle grid visibility with **G** key
   - Enable/disable grid snapping with **Shift+G**
   - Adjust grid size in Properties panel

### Working with Tokens

1. **Place a Token**
   - Press **T** key or click Token tool
   - Click on map to place token
   - Token appears with default settings

2. **Customize Token**
   - Select token (click or press **V** for select tool)
   - Properties panel shows on right side:
     - **Name**: Give your token a name
     - **Size**: Choose D&D size (Tiny to Gargantuan)
     - **HP**: Set current/max HP (shows colored bar)
     - **Image**: Click to upload custom token art
     - **Color**: Set border/background color

3. **Move Tokens**
   - Click and drag token to new position
   - Grid snapping automatically aligns to squares
   - Turn off snapping with **Shift+G** for free movement

4. **Multi-Select**
   - Hold **Ctrl/Cmd** and click multiple tokens
   - Or use **Ctrl+A** to select all
   - Drag to move all selected tokens together

### Drawing Tools

Access tools via toolbar (left side) or keyboard shortcuts:

- **V** - Select Tool: Click to select objects, drag to move
- **R** - Rectangle Tool: Draw rectangular walls/areas
- **C** - Circle Tool: Draw circular areas
- **L** - Line Tool: Draw straight lines
- **P** - Polygon Tool: Click points to create custom shapes
- **X** - Text Tool: Click to add text labels *(Need Fix: Styling limited)*
- **M** - Measure Tool: Click and drag to measure distance in feet
- **E** - Eraser Tool: Click objects to delete

**Drawing Workflow:**
1. Select a drawing tool (R, C, L, or P)
2. Click on canvas to start
3. Drag (or click additional points for polygon)
4. Release to finish
5. Object appears with properties panel

**Shape Customization:**
- **Fill Color**: Solid color fill
- **Stroke Color**: Border color
- **Stroke Width**: Border thickness
- **Opacity**: Transparency level

### Spell Effects

1. **Open Timeline Panel**
   - Click **Timeline** button in toolbar
   - Timeline editor appears at bottom

2. **Add Spell Event**
   - Click **+ Add Event** button
   - Select **Spell** event type
   - Choose spell from dropdown:
     - Fireball (projectile-burst)
     - Magic Missile (projectile)
     - Ray of Frost (ray)
     - Web (persistent area)
     - Thunderwave (burst)
     - And more...

3. **Configure Spell**
   - **From**: Click to set caster position
   - **To**: Click to set target position
   - **Size**: Effect radius (for area spells)
   - **Range**: Maximum spell range (for projectiles)
   - **Color**: Primary spell color
   - **Duration**: How long effect lasts (rounds)

4. **Execute Spell**
   - Click **Play** button in timeline
   - Spell animates on map
   - Persistent areas remain visible

**Spell Categories:**
- **Projectile-Burst**: Travels to target then explodes (Fireball)
- **Projectile**: Simple projectile (Magic Missile)
- **Ray**: Instant beam effect (Ray of Frost)
- **Area**: Persistent ground effect (Web, Entangle)
- **Burst**: Instant explosion at location (Thunderwave)

### Combat Timeline

The timeline system enables planning and executing entire combat encounters.

**Basic Timeline Usage:**

1. **Create Initiative Order**
   - Click **New Round** to start combat
   - Add events in initiative order
   - Events execute sequentially

2. **Event Types**
   - **Move**: Token movement with animation
   - **Attack**: Melee/ranged weapon attacks
   - **Spell**: Spell effects (see above)
   - **Sequence**: Complex multi-action combinations

3. **Movement Events**
   - Select **Move** event type
   - Choose token to move
   - Click destination on map
   - Token animates smoothly during playback

4. **Attack Events**
   - Select **Attack** event type
   - Choose attacker and target tokens
   - Select weapon type:
     - Melee weapons (Longsword, Greatsword, Dagger)
     - Ranged weapons (Longbow, Crossbow)
   - Animation shows attack trajectory

5. **Action Sequences** (Advanced)
   - Select **Sequence** event type
   - Choose from templates:
     - **Charge Attack**: Move + attack with bonus
     - **Full Attack**: Multiple attacks with penalties
     - **Fighting Retreat**: Attack + defensive movement
   - Or build custom sequences with Action Builder

**Timeline Controls:**
- **▶️ Play**: Execute current round
- **⏸️ Pause**: Stop playback
- **⏭️ Next**: Skip to next event
- **⏮️ Previous**: Go back to previous event
- **🔄 Loop**: Repeat current round

### Keyboard Shortcuts

**Tool Selection:**
- `V` - Select Tool
- `T` - Token Tool
- `R` - Rectangle Tool
- `C` - Circle Tool
- `L` - Line Tool
- `P` - Polygon Tool
- `X` - Text Tool
- `M` - Measure Tool
- `E` - Eraser Tool
- `H` - Pan Tool (hand)

**View Controls:**
- `G` - Toggle grid visibility
- `Shift+G` - Toggle grid snapping
- `+` / `-` - Zoom in/out
- `0` - Reset zoom to 100%
- `Space + Drag` - Pan canvas

**Selection & Editing:**
- `Ctrl+A` - Select all objects
- `Ctrl+D` - Duplicate selected
- `Delete` - Delete selected objects
- `Escape` - Deselect all
- `Ctrl+Z` - Undo *(Need Fix)*
- `Ctrl+Shift+Z` - Redo *(Need Fix)*

**File Operations:**
- `Ctrl+N` - New map
- `Ctrl+S` - Save map
- `Ctrl+O` - Open map
- `Ctrl+E` - Export as PNG

**Help:**
- `?` or `F1` - Show help dialog

---

## 📊 Feature Status

### ✅ Fully Working Features

**Map Editing:**
- ✅ Grid system (square grids, customizable size)
- ✅ Drawing tools (rectangle, circle, line)
- ✅ Background images
- ✅ Pan and zoom
- ✅ Measurement tool
- ✅ Grid snapping

**Token System:**
- ✅ D&D 5e token sizes (all 6 sizes)
- ✅ Custom token images
- ✅ HP tracking with visual bars
- ✅ Token selection and movement
- ✅ Multi-select operations
- ✅ Token properties editing

**Spell Effects:**
- ✅ 10+ pre-configured spell templates
- ✅ All 5 spell categories (area, projectile, ray, burst, projectile-burst)
- ✅ Smooth 60 FPS animations
- ✅ Persistent area effects
- ✅ Custom spell creation

**Combat Timeline:**
- ✅ Round-based initiative system
- ✅ Movement events with animation
- ✅ Attack events with weapon types
- ✅ Spell events with visual effects
- ✅ Timeline playback controls
- ✅ Event sequencing

**Professional Features:**
- ✅ Layer management system
- ✅ Save/Load JSON maps
- ✅ Export to PNG
- ✅ Static object library
- ✅ Keyboard shortcuts
- ✅ Performance optimization (60 FPS with 500+ objects)

### 🔧 Working But Needs Polish (Need Fix)

- 🔧 **Text Tool**: Basic functionality works, advanced styling limited
  - ✅ Place text on map
  - ✅ Edit text content
  - 🔧 Font selection limited
  - 🔧 Text effects basic

- 🔧 **Polygon Tool**: Can create polygons but UX needs improvement
  - ✅ Click to add points
  - ✅ Double-click to finish
  - 🔧 Point editing after creation
  - 🔧 Visual feedback during drawing

- 🔧 **Undo/Redo System**: Basic functionality present with edge cases
  - ✅ Undo object creation/deletion
  - ✅ Undo property changes
  - 🔧 Some complex operations not tracked
  - 🔧 Occasional state inconsistencies

### 🚧 Not Yet Implemented

**Planned for Future Releases:**
- 🚧 **Multiplayer Collaboration**: Real-time multi-user editing
- 🚧 **Cloud Storage**: Online map storage and sharing
- 🚧 **Mobile Support**: Touch-optimized interface
- 🚧 **Sound Effects**: Audio for actions and spells
- 🚧 **Fog of War**: Dynamic vision system
- 🚧 **Dice Roller**: Integrated D&D dice rolling
- 🚧 **Template Gallery**: Community-shared map templates
- 🚧 **Monster Database**: D&D monster stat integration
- 🚧 **Campaign Management**: Multi-session map organization

---

## 💻 System Requirements

### Minimum Requirements
- **Browser**: Modern browser with WebGL support
  - Chrome 90+
  - Firefox 88+
  - Safari 14+
  - Edge 90+
- **RAM**: 4 GB
- **Display**: 1280x720 resolution

### Recommended Requirements
- **Browser**: Latest Chrome or Firefox
- **RAM**: 8 GB or more
- **Display**: 1920x1080 or higher
- **Graphics**: Dedicated GPU for 60 FPS with many objects

### Performance Tips
1. **Use Chrome/Firefox**: Best performance and compatibility
2. **Close Unused Tabs**: Free up browser memory
3. **Reduce Object Count**: For older hardware, keep under 200 objects
4. **Enable Hardware Acceleration**: Check browser settings
5. **Update Graphics Drivers**: Ensure WebGL support is current

---

## 🔧 Troubleshooting

### Common Issues

**Map Not Loading**
- Check browser console for errors (F12)
- Verify browser supports WebGL
- Try refreshing the page (Ctrl+R)
- Clear browser cache

**Performance Issues / Low FPS**
- Reduce number of objects on map
- Disable spell animations in settings
- Close other browser tabs
- Check if hardware acceleration is enabled

**Tokens Not Appearing**
- Verify token is not on hidden layer
- Check token opacity (might be set to 0%)
- Ensure token is within canvas bounds
- Try zooming out to locate token

**Spell Animations Not Playing**
- Check timeline playback controls
- Verify spell event is configured correctly
- Ensure spell has valid from/to positions
- Check browser console for animation errors

**Grid Not Snapping**
- Press `Shift+G` to toggle grid snapping
- Verify grid size is set correctly
- Check that grid is visible (`G` key)

**Save/Load Issues**
- Ensure browser allows file downloads
- Check file permissions for selected directory
- Try exporting to different location
- Verify JSON file is not corrupted

### Getting Help

1. **Check Documentation**: Review relevant sections above
2. **Browser Console**: Press F12, check for error messages
3. **GitHub Issues**: Report bugs at [GitHub Issues](https://github.com/yourusername/mapmaker/issues)
4. **Community Forum**: Ask questions on Discord/Reddit

---

## 🤝 Contributing

We welcome contributions! MapMaker is open-source and community-driven.

### Development Setup

1. **Fork the repository**
2. **Clone your fork:**
```bash
git clone https://github.com/yourusername/mapmaker.git
cd mapmaker
```

3. **Install dependencies:**
```bash
pnpm install
```

4. **Create a feature branch:**
```bash
git checkout -b feature/my-new-feature
```

5. **Make your changes**
6. **Test thoroughly:**
```bash
pnpm type-check
pnpm lint
pnpm build
```

7. **Commit and push:**
```bash
git add .
git commit -m "feat: add my new feature"
git push origin feature/my-new-feature
```

8. **Create Pull Request** on GitHub

### Code Standards
- **TypeScript**: All code must be type-safe (zero `any` types)
- **ESLint**: Follow project linting rules
- **Performance**: Maintain 60 FPS target
- **Accessibility**: Support keyboard navigation
- **Documentation**: Update CLAUDE.md for significant changes

### Priority Areas for Contribution
1. **Bug Fixes**: Issues marked with "Need Fix" label
2. **Mobile Support**: Touch interface implementation
3. **Test Coverage**: Unit and integration tests
4. **Accessibility**: WCAG compliance improvements
5. **Documentation**: Tutorials and guides

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 🙏 Acknowledgments

**Technologies Used:**
- [React 19](https://react.dev/) - UI framework
- [TypeScript 5.8](https://www.typescriptlang.org/) - Type safety
- [Konva](https://konvajs.org/) - Canvas rendering
- [Zustand](https://zustand-demo.pmnd.rs/) - State management
- [Vanilla Extract](https://vanilla-extract.style/) - Zero-runtime CSS
- [Radix UI](https://www.radix-ui.com/) - Accessible components
- [Vite](https://vitejs.dev/) - Build tool

**Special Thanks:**
- D&D community for feature requests and feedback
- Open-source contributors
- Beta testers for bug reports

---

## 📞 Contact & Support

- **GitHub**: [https://github.com/yourusername/mapmaker](https://github.com/yourusername/mapmaker)
- **Issues**: [Report a bug](https://github.com/yourusername/mapmaker/issues)
- **Discussions**: [Community forum](https://github.com/yourusername/mapmaker/discussions)
- **Email**: mapmaker@example.com

---

**Built with ❤️ for the D&D community**

*Roll for initiative!* 🎲
