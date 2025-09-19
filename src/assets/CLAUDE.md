# Assets Directory

## Overview
Static assets including images, icons, fonts, and other media files used throughout the MapMaker application.

## Directory Structure
```
assets/
├── react.svg         # Default React/Vite logo
├── images/          # (future) Image assets
├── icons/           # (future) Custom icon files
├── tokens/          # (future) Default token images
├── textures/        # (future) Map textures
└── fonts/           # (future) Custom fonts
```

## Asset Management Rules & Guidelines

### 1. File Organization
- **Subdirectories by type** - Group similar assets together
- **Descriptive names** - Clear, lowercase, hyphenated (e.g., `orc-warrior.png`)
- **Version control** - Include version in filename if needed (e.g., `logo-v2.svg`)
- **No spaces** - Use hyphens or underscores instead

### 2. Naming Conventions
```
Pattern: [category]-[descriptor]-[variant].[extension]

Examples:
- token-goblin-archer.png
- texture-stone-floor.jpg
- icon-sword-crossed.svg
- cursor-pan-tool.png
```

### 3. Image Formats & Usage

**SVG** - Vector graphics (preferred for icons):
- Icons and simple graphics
- Scalable without quality loss
- Small file size
- Can be styled with CSS

**PNG** - Raster with transparency:
- Complex images with transparency
- Token artwork
- UI elements requiring transparency
- Screenshots and examples

**JPG/JPEG** - Compressed raster:
- Backgrounds and textures
- Photos without transparency
- Large images where size matters

**WebP** - Modern format:
- Better compression than PNG/JPG
- Supports transparency
- Fallback required for older browsers

### 4. Size & Optimization Guidelines

**File Sizes**:
- Icons: < 10KB (SVG preferred)
- Tokens: < 100KB per image
- Textures: < 500KB per tile
- Backgrounds: < 1MB

**Image Dimensions**:
- Token images: 256x256px (will be scaled)
- Texture tiles: 512x512px (repeatable)
- Icons: 24x24px or 48x48px base size
- Cursors: 32x32px with hotspot defined

**Optimization Requirements**:
- Run through image optimizer before commit
- Remove metadata from images
- Use appropriate compression levels
- Consider lazy loading for large assets

### 5. Import Patterns

**Static Imports** (preferred):
```typescript
import swordIcon from '@/assets/icons/sword.svg'
import orcToken from '@/assets/tokens/orc-warrior.png'

// Usage
<img src={swordIcon} alt="Sword" />
```

**Dynamic Imports** (for conditional loading):
```typescript
const loadTexture = async (name: string) => {
  const module = await import(`@/assets/textures/${name}.jpg`)
  return module.default
}
```

**Public Assets** (avoid if possible):
```typescript
// Files in public/ directory
// Accessed via absolute path
<img src="/tokens/goblin.png" />
```

## Asset Categories

### Icons
**Purpose**: UI elements, tool icons, status indicators

**Requirements**:
- SVG format preferred
- Monochrome for theming flexibility
- Consistent stroke width (2px)
- 24x24px viewBox standard
- Include title element for accessibility

**Example SVG Structure**:
```svg
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
  <title>Sword Icon</title>
  <path d="..." stroke-width="2" stroke-linecap="round" />
</svg>
```

### Tokens
**Purpose**: Character and creature representations on map

**Structure**:
```
tokens/
├── players/
│   ├── human-fighter.png
│   ├── elf-wizard.png
│   └── dwarf-cleric.png
├── monsters/
│   ├── goblin.png
│   ├── orc.png
│   └── dragon-red.png
└── objects/
    ├── chest.png
    ├── door.png
    └── trap.png
```

**Token Requirements**:
- Square aspect ratio
- Transparent background
- Centered subject
- Border space for effects
- Consistent art style

### Textures
**Purpose**: Repeatable patterns for map backgrounds

**Types**:
- Floor textures (stone, wood, grass)
- Wall textures (brick, cave, dungeon)
- Terrain textures (water, lava, sand)
- Special effects (fog, shadows)

**Requirements**:
- Seamlessly tileable
- Power of 2 dimensions (512px, 1024px)
- Neutral lighting (no strong shadows)
- High enough resolution for zooming

### Cursors
**Purpose**: Custom cursors for different tools

**Format Requirements**:
```css
.cursor-draw {
  cursor: url('@/assets/cursors/pencil.png') 4 20, crosshair;
  /* Hotspot at x=4, y=20, fallback to crosshair */
}
```

**Cursor Guidelines**:
- 32x32px maximum size
- Define hotspot precisely
- Include OS fallback cursor
- High contrast for visibility

### Fonts
**Purpose**: Custom typography for D&D theme

**Font Loading**:
```css
@font-face {
  font-family: 'Scala Sans';
  src: url('@/assets/fonts/ScalaSans-Regular.woff2') format('woff2'),
       url('@/assets/fonts/ScalaSans-Regular.woff') format('woff');
  font-weight: 400;
  font-display: swap;
}
```

**Font Requirements**:
- WOFF2 and WOFF formats
- Subset for used characters
- License for web use
- Fallback font stack defined

## Asset Loading Strategies

### Eager Loading
For critical assets needed immediately:
```typescript
// Loaded at build time
import logo from '@/assets/logo.svg'
```

### Lazy Loading
For assets needed conditionally:
```typescript
const [texture, setTexture] = useState<string>()

useEffect(() => {
  import(`@/assets/textures/${textureName}.jpg`)
    .then(module => setTexture(module.default))
}, [textureName])
```

### Preloading
For assets needed soon:
```typescript
const preloadImage = (src: string) => {
  const img = new Image()
  img.src = src
}

// Preload common tokens
tokenList.forEach(token => preloadImage(token.src))
```

### Asset Caching
```typescript
const assetCache = new Map<string, string>()

export async function getCachedAsset(path: string): Promise<string> {
  if (!assetCache.has(path)) {
    const module = await import(path)
    assetCache.set(path, module.default)
  }
  return assetCache.get(path)!
}
```

## Performance Considerations

### Image Sprites
For many small icons:
```css
.icon {
  background-image: url('@/assets/sprites/icons.png');
  background-size: 500px 100px;
}
.icon-sword {
  background-position: -50px 0;
  width: 24px;
  height: 24px;
}
```

### Responsive Images
```typescript
<picture>
  <source srcSet={tokenWebP} type="image/webp" />
  <source srcSet={tokenPng} type="image/png" />
  <img src={tokenPng} alt="Token" />
</picture>
```

### Progressive Loading
```typescript
// Load low-quality placeholder first
const [imageSrc, setImageSrc] = useState(lowQualityPlaceholder)

useEffect(() => {
  const img = new Image()
  img.onload = () => setImageSrc(highQualityImage)
  img.src = highQualityImage
}, [])
```

## Asset Pipeline

### Build-time Optimization
Configure Vite for asset optimization:
```javascript
// vite.config.ts
export default {
  build: {
    assetsInlineLimit: 4096, // Inline small assets
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    }
  }
}
```

### Image Optimization Tools
- **imagemin** - General optimization
- **svgo** - SVG optimization
- **sharp** - Image resizing and conversion
- **squoosh** - Advanced compression

## Licensing & Attribution

### License Requirements
- Track licenses for all assets
- Include attribution where required
- Store license info in assets/LICENSE.md
- Verify commercial use rights

### Attribution Format
```markdown
## Asset Attributions

### Icons
- Sword icon by [Author] from [Source] - [License]
- Shield icon by [Author] from [Source] - [License]

### Tokens
- Orc Warrior by [Artist] - [License]
- Goblin Archer by [Artist] - [License]
```

## Asset Sources

### Recommended Sources
- **Icons**: Lucide, Heroicons, Feather Icons
- **Tokens**: OpenGameArt, Game-Icons.net
- **Textures**: TextureHaven, CC0 Textures
- **Fonts**: Google Fonts, Font Squirrel

### Creating Custom Assets
- Use consistent style guide
- Export at multiple resolutions
- Maintain source files (AI, PSD, etc.)
- Document creation process

## Future Asset Additions

### Planned Additions
```
assets/
├── animations/      # Spell effects, transitions
├── sounds/         # Sound effects, ambience
├── maps/          # Preset map templates
├── themes/        # Visual theme packs
└── localization/ # Translated assets
```

## Asset Checklist

When adding new assets:
- [ ] Optimized file size
- [ ] Appropriate format chosen
- [ ] Descriptive filename
- [ ] License verified
- [ ] Attribution added if required
- [ ] Imported correctly in code
- [ ] Tested on different screens
- [ ] Fallback provided if needed
- [ ] Added to version control
- [ ] Documentation updated