/**
 * Universal Animation Library - Type Definitions
 *
 * This file contains all type definitions for the animation system.
 * Used for spells, attacks, movement, environmental effects, and more.
 *
 * IMPORTANT: All types use 'type' declarations, not 'interface'
 */

// =============================================================================
// GEOMETRY & PRIMITIVES
// =============================================================================

export type Point = {
  x: number
  y: number
}

export type Vector2D = {
  x: number
  y: number
}

export type Rectangle = {
  x: number
  y: number
  width: number
  height: number
}

export type Circle = {
  x: number
  y: number
  radius: number
}

export type Color = string // CSS color string (hex, rgb, rgba)

// =============================================================================
// ANIMATION CATEGORIES
// =============================================================================

export type AnimationCategory =
  | 'projectile'    // Moving objects (arrows, fireballs, magic missiles)
  | 'burst'         // Instant explosions (thunderwave, shatter)
  | 'area'          // Persistent ground effects (fog, darkness)
  | 'cone'          // Cone-shaped area effects (burning hands, poison spray)
  | 'ray'           // Beam-like effects (ray of frost, laser)
  | 'movement'      // Token/object movement
  | 'environmental' // Weather, lighting, ambient effects
  | 'status'        // Status effect visuals (poison, burning)

// =============================================================================
// MOTION & PATHS
// =============================================================================

export type MotionType =
  | 'linear'        // Straight line
  | 'curved'        // Bezier curve
  | 'arc'           // Parabolic arc
  | 'spiral'        // Spiral path
  | 'wave'          // Sine wave
  | 'orbit'         // Circular orbit
  | 'zigzag'        // Zigzag pattern
  | 'homing'        // Follows moving target

export type EasingType =
  | 'linear'
  | 'easeIn'
  | 'easeOut'
  | 'easeInOut'
  | 'easeInCubic'
  | 'easeOutCubic'
  | 'easeInOutCubic'
  | 'easeInElastic'
  | 'easeOutElastic'
  | 'easeInBounce'
  | 'easeOutBounce'

export type MotionPath = {
  type: MotionType
  startPosition: Point
  endPosition: Point
  duration: number
  easing?: EasingType
  // Curve-specific options
  curveHeight?: number      // For curved/arc paths
  curveDirection?: 'up' | 'down' | 'left' | 'right'
  controlPoints?: Point[]   // For bezier curves
  // Wave-specific options
  frequency?: number        // For wave/zigzag
  amplitude?: number        // For wave/zigzag
  // Orbit-specific options
  radius?: number           // For orbit/spiral
  rotations?: number        // For spiral
}

// =============================================================================
// VISUAL EFFECTS
// =============================================================================

export type TrailEffect = {
  enabled: boolean
  length: number            // Number of trail segments
  fadeSpeed: number         // 0-1, how fast trail fades
  width?: number            // Trail thickness
  color?: Color             // Trail color (inherits if not specified)
  opacity?: number          // Trail opacity (0-1)
}

export type GlowEffect = {
  enabled: boolean
  color: Color
  intensity: number         // 0-1
  radius: number            // Glow spread radius
  pulsing?: boolean         // Whether glow pulses
  pulseSpeed?: number       // Pulses per second
}

export type ParticleEffect = {
  enabled: boolean
  count: number             // Number of particles
  size: number              // Particle size range
  speed: number             // Particle emission speed
  lifetime: number          // How long particles live (ms)
  color?: Color             // Particle color
  spread?: number           // Particle spread angle (degrees)
  gravity?: boolean         // Whether particles fall
}

export type SoundEffect = {
  enabled: boolean
  soundId: string           // Reference to sound asset
  volume?: number           // 0-1
  pitch?: number            // Pitch modifier
  delay?: number            // Delay before playing (ms)
}

// =============================================================================
// BASE ANIMATION
// =============================================================================

export type BaseAnimation = {
  id: string
  category: AnimationCategory
  name: string              // Display name (e.g., "Fireball", "Arrow Shot")
  duration: number          // Total animation duration (ms)

  // Visual properties
  color: Color
  size: number              // Base size (pixels or radius)
  opacity?: number          // 0-1, defaults to 1

  // Effects
  trail?: TrailEffect
  glow?: GlowEffect
  particles?: ParticleEffect
  sound?: SoundEffect

  // Lifecycle callbacks
  onStart?: () => void
  onComplete?: () => void
  onUpdate?: (progress: number) => void

  // Metadata
  metadata?: Record<string, unknown>
}

// =============================================================================
// PROJECTILE ANIMATIONS
// =============================================================================

export type ProjectileAnimation = BaseAnimation & {
  category: 'projectile'

  // Motion
  fromPosition: Point
  toPosition: Point
  motionPath: MotionPath
  speed: number             // Pixels per second
  rotateToDirection?: boolean // Rotate projectile to face movement direction

  // Impact effect
  impactEffect?: BurstConfig
  onImpact?: (position: Point) => void

  // Range limiting (for D&D weapon ranges)
  maxRange?: number         // Maximum distance in feet

  // Targeting
  targetTokenId?: string    // If targeting a token
  trackTarget?: boolean     // Follow target if it moves
}

// =============================================================================
// BURST ANIMATIONS
// =============================================================================

export type BurstShape = 'circle' | 'ring' | 'square' | 'star' | 'custom'

export type BurstAnimation = BaseAnimation & {
  category: 'burst'

  // Position and shape
  position: Point
  shape: BurstShape
  radius: number            // Final radius

  // Animation timing
  expansionDuration: number // How fast burst expands (ms)
  peakDuration?: number     // How long at full size (ms)
  fadeDuration?: number     // How fast it fades out (ms)

  // Visual effects
  shockwave?: boolean       // Visible shockwave effect
  shake?: {                 // Screen shake
    intensity: number       // 0-1
    duration: number        // ms
  }

  // Custom shape points (for BurstShape = 'custom')
  customPoints?: Point[]
}

export type BurstConfig = Partial<BurstAnimation> // For embedding in other animations

// =============================================================================
// AREA EFFECT ANIMATIONS
// =============================================================================

export type AreaShape =
  | 'circle'
  | 'cone'
  | 'cube'
  | 'line'
  | 'cylinder'
  | 'sphere'

export type AreaAnimation = BaseAnimation & {
  category: 'area'

  // Position and shape
  position: Point
  shape: AreaShape
  size: number              // Radius for circle, length for cone/line, side for cube

  // Cone-specific
  coneAngle?: number        // Cone spread angle (degrees)
  coneDirection?: number    // Cone facing direction (radians)

  // Line-specific
  lineWidth?: number        // Width of line effect
  lineEndPosition?: Point   // End point for line

  // Duration
  persistDuration?: number  // How long effect lasts (ms or rounds/events)
  durationType?: 'time' | 'rounds' | 'events'
  persistColor?: Color      // Color during persistent phase
  persistOpacity?: number   // Opacity during persistent phase (0-1)

  // Visual behavior
  pulsing?: boolean         // Whether effect pulses
  pulseSpeed?: number       // Pulses per second
  rotating?: boolean        // Whether effect rotates
  rotationSpeed?: number    // Rotations per second
  billowing?: boolean       // Fog-like billowing effect

  // Targeting
  trackTarget?: boolean     // Follow target token
  targetTokenId?: string
}

// =============================================================================
// CONE ANIMATIONS
// =============================================================================

export type ConeAnimation = BaseAnimation & {
  category: 'cone'

  // Position and targeting
  position: Point           // Source position (caster)
  targetPosition: Point     // Direction target point

  // Cone properties
  size: number              // Cone length/range in pixels
  coneAngle: number         // Cone spread angle (degrees)

  // Duration and persistence
  persistDuration?: number  // How long effect lasts (rounds or events)
  durationType?: 'time' | 'rounds' | 'events'
  persistColor?: Color      // Color during persistent phase
  persistOpacity?: number   // Opacity during persistent phase (0-1)

  // Visual effects
  particles?: boolean       // Enable particle effects
}

// =============================================================================
// RAY ANIMATIONS
// =============================================================================

export type RayAnimation = BaseAnimation & {
  category: 'ray'

  // Path
  fromPosition: Point
  toPosition: Point

  // Appearance
  width: number             // Ray thickness
  segments?: number         // Number of beam segments (for jagged rays)
  taper?: boolean           // Taper from thick to thin

  // Animation style
  flickering?: boolean      // Ray flickers
  flowing?: boolean         // Particles flow along ray
  expanding?: boolean       // Ray expands/contracts

  // Multi-ray (for spells like Scorching Ray)
  rayCount?: number         // Number of parallel rays
  spread?: number           // Spread between rays (degrees)
}

// =============================================================================
// MOVEMENT ANIMATIONS
// =============================================================================

export type MovementAnimation = BaseAnimation & {
  category: 'movement'

  // Path
  fromPosition: Point
  toPosition: Point
  motionPath: MotionPath

  // Token reference
  tokenId: string

  // Movement style
  gliding?: boolean         // Smooth gliding
  walking?: boolean         // Walking bobbing effect
  flying?: boolean          // Flying floating effect
  teleporting?: boolean     // Instant with fade effect

  // Effects during movement
  dustTrail?: boolean       // Dust particles while moving
  afterImage?: boolean      // Leave brief afterimages
}

// =============================================================================
// ENVIRONMENTAL ANIMATIONS
// =============================================================================

export type EnvironmentalType =
  | 'weather'       // Rain, snow, wind
  | 'lighting'      // Lightning, sunbeams, darkness
  | 'ambient'       // Floating particles, mist, fog
  | 'destruction'   // Crumbling walls, explosions
  | 'magical'       // Magical auras, runes

export type EnvironmentalAnimation = BaseAnimation & {
  category: 'environmental'
  environmentalType: EnvironmentalType

  // Coverage area
  area?: Rectangle | Circle
  fullScreen?: boolean      // Covers entire viewport

  // Intensity
  intensity: number         // 0-1
  density?: number          // For particle-based effects

  // Behavior
  looping: boolean          // Whether effect loops
  windDirection?: number    // Wind direction (radians)
  windSpeed?: number        // Wind strength
}

// =============================================================================
// STATUS EFFECT ANIMATIONS
// =============================================================================

export type StatusEffectType =
  | 'poison'
  | 'burning'
  | 'frozen'
  | 'stunned'
  | 'blessed'
  | 'cursed'
  | 'invisible'
  | 'hasted'
  | 'slowed'

export type StatusAnimation = BaseAnimation & {
  category: 'status'
  statusType: StatusEffectType

  // Attachment
  attachedToTokenId: string
  offset?: Vector2D         // Offset from token center

  // Behavior
  looping: boolean
  fadeIn?: number           // Fade in duration (ms)
  fadeOut?: number          // Fade out duration (ms)
}

// =============================================================================
// ANIMATION COMPOSITION
// =============================================================================

export type CompositeAnimation = {
  id: string
  name: string
  animations: Animation[]   // Animations to play
  sequence: 'parallel' | 'sequential' | 'staggered'
  staggerDelay?: number     // For staggered sequence (ms between animations)
  onComplete?: () => void
}

// Union type for all animation types
export type Animation =
  | ProjectileAnimation
  | BurstAnimation
  | AreaAnimation
  | ConeAnimation
  | RayAnimation
  | MovementAnimation
  | EnvironmentalAnimation
  | StatusAnimation

// =============================================================================
// REGISTRY & FACTORY
// =============================================================================

export type AnimationDefinition = {
  name: string
  category: AnimationCategory
  defaults: Partial<Animation>
  create: (options: Partial<Animation>) => Animation
}

export type AnimationTemplate = Omit<Animation, 'id' | 'fromPosition' | 'toPosition' | 'position'>

// =============================================================================
// TIMELINE INTEGRATION
// =============================================================================

export type TimelineAnimationEvent = {
  round: number
  event: number
  animation: Animation
  delay?: number            // Delay before playing (ms)
}

export type CastOptions = {
  power?: 'normal' | 'empowered' | 'quickened' | 'maximized'
  color?: Color             // Override default color
  size?: number             // Override default size
  speed?: number            // Override default speed
  silent?: boolean          // No sound effects
}

// =============================================================================
// UTILITIES
// =============================================================================

export type AnimationState = 'idle' | 'playing' | 'paused' | 'completed' | 'cancelled'

export type AnimationController = {
  state: AnimationState
  progress: number          // 0-1
  play: () => void
  pause: () => void
  resume: () => void
  stop: () => void
  reset: () => void
}

// =============================================================================
// EXPORTS TYPE HELPERS
// =============================================================================

// Type guards
export type IsProjectile = (anim: Animation) => anim is ProjectileAnimation
export type IsBurst = (anim: Animation) => anim is BurstAnimation
export type IsArea = (anim: Animation) => anim is AreaAnimation
export type IsCone = (anim: Animation) => anim is ConeAnimation
export type IsRay = (anim: Animation) => anim is RayAnimation
export type IsMovement = (anim: Animation) => anim is MovementAnimation
export type IsEnvironmental = (anim: Animation) => anim is EnvironmentalAnimation
export type IsStatus = (anim: Animation) => anim is StatusAnimation
