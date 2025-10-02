import type { UnifiedAction } from '@/types/unifiedAction'

export const spellTemplates: UnifiedAction[] = [
  // Fire Spells
  {
    id: 'fireball-template',
    name: 'Fireball',
    description: 'A magical spell effect',
    type: 'spell',
    category: 'fire',
    tags: ["spell","magic"],
    source: { x: 0, y: 0 }, // Will be set when used
    target: { x: 0, y: 0 }, // Will be set when used
    animation: {
      type: 'projectile_burst',
      duration: 1500, // Total animation duration
      color: '#FF6B35',
      size: 20, // Projectile size (explosion size is separate)
      speed: 500, // Projectile speed (px/s)
      trail: true,
      trailLength: 8, // Number of trail segments
      trailFade: 0.8, // Trail opacity decay
      // Target tracking properties (can be disabled via customization)
      trackTarget: true, // Enable dynamic target following by default
      targetTokenId: '', // Will be set when targeting a token
      // Burst animation details
      burstSize: 80, // Explosion radius
      burstDuration: 600, // How long the explosion lasts
      burstColor: '#FF4500', // Explosion color (slightly different from projectile)
      // Post-effect properties
      persistDuration: 2, // Lingering fire effects duration (rounds)
      persistColor: '#CC2500', // Darker fire for lingering effects
      persistOpacity: 0.4, // Opacity of lingering effects
      // Animation phases
      projectilePhase: 400, // Time for projectile travel (calculated based on distance/speed)
      explosionPhase: 600, // Time for explosion animation
      lingerPhase: 2000 // Time for post-explosion effects
    },
    effects: {
      affectedTargets: [],
      highlightColor: '#FF6B35',
      areaOfEffect: {
        type: 'circle',
        center: { x: 0, y: 0 },
        radius: 80 // 20-foot radius in D&D terms
      }
    },
    metadata: {
      name: 'Fireball',
      description: 'A bright streak flashes from your pointing finger to a point you choose within range and then blossoms with a low roar into an explosion of flame. Can track moving targets.'
    },
    // D&D 5e Fireball properties
    range: 150, // 150 feet range
    areaOfEffect: 80, // 20-foot radius (4 pixels per foot)
    damage: '8d6',
    damageType: 'fire',
    spellLevel: 3,
    castingTime: 'action',
    timestamp: 0,
    duration: 1500
  },

  // Force Spells
  {
    id: 'magic-missile-template',
    name: 'Magic Missile',
    description: 'A magical spell effect',
    type: 'spell',
    category: 'force',
    tags: ["spell","magic"],
    source: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    animation: {
      type: 'projectile',
      duration: 1200, // Slightly longer for the curved path
      color: '#9370DB', // Purple/violet for force magic
      size: 8, // Smaller than fireball
      speed: 400, // Slower than fire bolt for more visible curve
      trail: true,
      trailLength: 12,
      trailFade: 0.75,
      // Curved path properties
      curved: true,
      curveHeight: 60, // Base height of the arc in pixels (will be varied ±40 pixels)
      curveDirection: 'auto', // 'up', 'down', or 'auto' for dynamic
      curveRandomSeed: 0.5, // Random seed for curve variation (will be randomized per dart)
      // Target tracking properties
      trackTarget: true, // Enable dynamic target following
      targetTokenId: '' // Will be set when targeting a token
    },
    effects: {
      affectedTargets: [],
      highlightColor: '#9370DB'
    },
    metadata: {
      name: 'Magic Missile',
      description: 'You create three glowing darts of magical force. Each dart hits a creature of your choice that you can see within range and follows them if they move.'
    },
    // D&D 5e Magic Missile properties
    range: 120, // 120 feet range
    damage: '1d4+1',
    damageType: 'force',
    spellLevel: 1,
    castingTime: 'action',
    timestamp: 0,
    duration: 1200
  },

  // Darkness Spell
  {
    id: 'darkness-template',
    name: 'Darkness',
    description: 'A magical spell effect',
    type: 'spell',
    category: 'illusion',
    tags: ["spell","magic"],
    source: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    animation: {
      type: 'area',
      duration: 800, // Initial expanding animation
      color: '#3D3D2E', // Dark gray with yellow tint
      secondaryColor: '#4A4A20', // Dark yellow
      size: 60, // 15-foot radius (4 pixels per foot)
      particles: false,
      // Persistent effect properties
      persistDuration: 10, // 10 rounds (D&D 5e darkness duration)
      persistColor: '#3D3D2E', // Same dark gray with yellow tint as animation
      persistOpacity: 0.7 // Slightly lower opacity to match animation feel
    },
    effects: {
      affectedTargets: [],
      highlightColor: '#2F2F2F',
      areaOfEffect: {
        type: 'circle',
        center: { x: 0, y: 0 },
        radius: 60 // 15-foot radius
      }
    },
    metadata: {
      name: 'Darkness',
      description: 'Magical darkness spreads from a point you choose within range to fill a 15-foot-radius sphere for the duration.'
    },
    // D&D 5e Darkness properties
    range: 60, // 60 feet range
    areaOfEffect: 60, // 15-foot radius (4 pixels per foot)
    spellLevel: 2,
    castingTime: 'action',
    timestamp: 0,
    duration: 800 // Initial animation duration
  },
  {
    id: 'ray-of-frost-template',
    name: 'Ray Of Frost',
    description: 'A magical spell effect',
    type: 'spell',
    category: 'ice',
    tags: ["spell","magic"],
    source: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    animation: {
      type: 'ray',
      duration: 600,
      color: '#B0E0E6',
      size: 8,
      speed: 800,
      // Target tracking properties
      trackTarget: true, // Enable dynamic target following
      targetTokenId: '' // Will be set when targeting a token
    },
    effects: {
      affectedTargets: [],
      highlightColor: '#B0E0E6'
    },
    metadata: {
      name: 'Ray of Frost',
      description: 'A frigid beam of blue-white light streaks toward a creature within range and follows them if they move.'
    },
    timestamp: 0,
    duration: 600
  },

  // Lightning Spells
  {
    id: 'lightning-bolt-template',
    name: 'Lightning Bolt',
    description: 'A magical spell effect',
    type: 'spell',
    category: 'lightning',
    tags: ["spell","magic"],
    source: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    animation: {
      type: 'line',
      duration: 400,
      color: '#FFD700',
      size: 15,
      speed: 1000
    },
    effects: {
      affectedTargets: [],
      highlightColor: '#FFD700',
      areaOfEffect: {
        type: 'line',
        start: { x: 0, y: 0 },
        end: { x: 0, y: 0 },
        width: 15
      }
    },
    metadata: {
      name: 'Lightning Bolt',
      description: 'A stroke of lightning forming a line 100 feet long and 5 feet wide blasts out from you in a direction you choose.'
    },
    timestamp: 0,
    duration: 400
  },
  {
    id: 'shocking-grasp-template',
    name: 'Shocking Grasp',
    description: 'A magical spell effect',
    type: 'spell',
    category: 'lightning',
    tags: ["spell","magic"],
    source: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    animation: {
      type: 'touch',
      duration: 500,
      color: '#FFFF00',
      size: 20,
      sparks: true
    },
    effects: {
      affectedTargets: [],
      highlightColor: '#FFFF00'
    },
    metadata: {
      name: 'Shocking Grasp',
      description: 'Lightning springs from your hand to deliver a shock to a creature you try to touch.'
    },
    timestamp: 0,
    duration: 500
  },

  // Healing Spells
  {
    id: 'cure-wounds-template',
    name: 'Cure Wounds',
    description: 'A magical spell effect',
    type: 'spell',
    category: 'healing',
    tags: ["spell","magic"],
    source: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    animation: {
      type: 'touch',
      duration: 800,
      color: '#FFD700',
      size: 30,
      glow: true
    },
    effects: {
      affectedTargets: [],
      highlightColor: '#FFD700'
    },
    metadata: {
      name: 'Cure Wounds',
      description: 'A creature you touch regains a number of hit points equal to 1d8 + your spellcasting ability modifier.'
    },
    timestamp: 0,
    duration: 800
  },

  // Poison Spells
  {
    id: 'poison-spray-template',
    name: 'Poison Spray',
    description: 'A magical spell effect',
    type: 'spell',
    category: 'poison',
    tags: ["spell","magic"],
    source: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    animation: {
      type: 'cone',
      duration: 700,
      color: '#9ACD32',
      size: 40,
      particles: true
    },
    effects: {
      affectedTargets: [],
      highlightColor: '#9ACD32',
      areaOfEffect: {
        type: 'cone',
        origin: { x: 0, y: 0 },
        direction: 0,
        angle: 45,
        range: 40
      }
    },
    metadata: {
      name: 'Poison Spray',
      description: 'You extend your hand toward a creature you can see within range and project a puff of noxious gas from your palm.'
    },
    timestamp: 0,
    duration: 700
  },

  // Earth/Elemental Spells
  {
    id: 'stone-rain-template',
    name: 'Stone Rain',
    description: 'A magical spell effect',
    type: 'spell',
    category: 'earth',
    tags: ["spell","magic"],
    source: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    animation: {
      type: 'burst',  // New type for multiple bursts
      duration: 2000,       // Total duration for all stone impacts
      color: '#8B7355',     // Stone brown color
      secondaryColor: '#696969',  // Gray for stone variety
      size: 100,            // Large area radius
      burstSize: 15,        // Individual stone impact size
      burstCount: 12,       // Number of stone impacts
      burstInterval: 150,   // Time between impacts in ms
      particles: true,
      // No persistent effects
      persistDuration: 0
    },
    effects: {
      affectedTargets: [],
      highlightColor: '#8B7355',
      areaOfEffect: {
        type: 'circle',
        center: { x: 0, y: 0 },
        radius: 100  // 25-foot radius
      }
    },
    metadata: {
      name: 'Stone Rain',
      description: 'A barrage of stones rains down in a large area, striking multiple locations with small impacts.'
    },
    // D&D-style properties
    range: 120,           // 120 feet range
    areaOfEffect: 100,    // 25-foot radius
    damage: '3d8',        // Bludgeoning damage
    damageType: 'bludgeoning',
    spellLevel: 3,
    castingTime: 'action',
    timestamp: 0,
    duration: 2000
  },

  // Divine Spells
  {
    id: 'sacred-flame-template',
    name: 'Sacred Flame',
    description: 'A magical spell effect',
    type: 'spell',
    category: 'divine',
    tags: ["spell","magic"],
    source: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    animation: {
      type: 'pillar',
      duration: 800,
      color: '#FFD700',
      size: 25,
      radiance: true
    },
    effects: {
      affectedTargets: [],
      highlightColor: '#FFD700'
    },
    metadata: {
      name: 'Sacred Flame',
      description: 'Flame-like radiance descends on a creature that you can see within range.'
    },
    timestamp: 0,
    duration: 800
  },
  {
    id: 'guiding-bolt-template',
    name: 'Guiding Bolt',
    description: 'A magical spell effect',
    type: 'spell',
    category: 'divine',
    tags: ["spell","magic"],
    source: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    animation: {
      type: 'projectile',
      duration: 900,
      color: '#F0E68C',
      size: 16,
      speed: 450,
      trail: true
    },
    effects: {
      affectedTargets: [],
      highlightColor: '#F0E68C'
    },
    metadata: {
      name: 'Guiding Bolt',
      description: 'A flash of light streaks toward a creature of your choice within range.'
    },
    timestamp: 0,
    duration: 900
  },

  // Fire Cone Spells
  {
    id: 'burning-hands-template',
    name: 'Burning Hands',
    description: 'A magical spell effect',
    type: 'spell',
    category: 'fire',
    tags: ["spell","magic"],
    source: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    animation: {
      type: 'cone',
      duration: 800,
      color: '#ff4500',
      secondaryColor: '#FFA500',
      size: 15, // 15ft cone length
      coneAngle: 60,
      particles: true
    },
    effects: {
      affectedTargets: [],
      highlightColor: '#ff4500',
      areaOfEffect: {
        type: 'cone',
        origin: { x: 0, y: 0 },
        direction: 0,
        angle: 60,
        range: 15
      }
    },
    metadata: {
      name: 'Burning Hands',
      description: 'A thin sheet of flames shoots forth from your outstretched fingertips.'
    },
    range: 5, // Touch range (self)
    areaOfEffect: 15,
    damage: '3d6',
    damageType: 'fire',
    spellLevel: 1,
    castingTime: 'action',
    timestamp: 0,
    duration: 800
  },
  {
    id: 'breath-of-the-dragon-template',
    name: 'Breath of the Dragon',
    description: 'A magical spell effect',
    type: 'spell',
    category: 'fire',
    tags: ["spell","magic"],
    source: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    animation: {
      type: 'cone',
      duration: 1200,
      color: '#ff4500',
      secondaryColor: '#FF6B00',
      size: 30, // 30ft cone length
      coneAngle: 60,
      particles: true,
      persistDuration: 1,
      persistColor: '#CC2500',
      persistOpacity: 0.4
    },
    effects: {
      affectedTargets: [],
      highlightColor: '#ff4500',
      areaOfEffect: {
        type: 'cone',
        origin: { x: 0, y: 0 },
        direction: 0,
        angle: 60,
        range: 30
      }
    },
    metadata: {
      name: 'Breath of the Dragon',
      description: 'Channel the power of dragons to unleash a devastating wave of fire in a cone, leaving burning embers for one round.'
    },
    range: 5, // Touch range (self)
    areaOfEffect: 30,
    damage: '6d6',
    damageType: 'fire',
    spellLevel: 3,
    castingTime: 'action',
    timestamp: 0,
    duration: 1200
  },

  // Ice Cone Spells
  {
    id: 'cone-of-cold-template',
    name: 'Cone of Cold',
    description: 'A magical spell effect',
    type: 'spell',
    category: 'ice',
    tags: ["spell","magic"],
    source: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    animation: {
      type: 'cone',
      duration: 1000,
      color: '#00bfff',
      secondaryColor: '#B0E0E6',
      size: 60, // 60ft cone length
      coneAngle: 60,
      particles: true
    },
    effects: {
      affectedTargets: [],
      highlightColor: '#00bfff',
      areaOfEffect: {
        type: 'cone',
        origin: { x: 0, y: 0 },
        direction: 0,
        angle: 60,
        range: 60
      }
    },
    metadata: {
      name: 'Cone of Cold',
      description: 'A blast of cold air erupts from your hands in a 60-foot cone.'
    },
    range: 5, // Touch range (self)
    areaOfEffect: 60,
    damage: '8d8',
    damageType: 'cold',
    spellLevel: 5,
    castingTime: 'action',
    timestamp: 0,
    duration: 1000
  },

  // Additional missing spells
  {
    id: 'thunderwave-template',
    name: 'Thunderwave',
    description: 'A magical spell effect',
    type: 'spell',
    category: 'thunder',
    tags: ["spell","magic"],
    source: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    animation: {
      type: 'burst',
      duration: 600,
      color: '#4169e1',
      size: 15,
      burstSize: 60
    },
    effects: {
      affectedTargets: [],
      highlightColor: '#4169e1',
      areaOfEffect: {
        type: 'circle',
        center: { x: 0, y: 0 },
        radius: 15
      }
    },
    metadata: {
      name: 'Thunderwave',
      description: 'A wave of thunderous force sweeps out from you.'
    },
    range: 5, // Self
    areaOfEffect: 15,
    damage: '2d8',
    damageType: 'thunder',
    spellLevel: 1,
    castingTime: 'action',
    timestamp: 0,
    duration: 600
  },
  {
    id: 'eldritch-blast-template',
    name: 'Eldritch Blast',
    description: 'A magical spell effect',
    type: 'spell',
    category: 'force',
    tags: ["spell","magic"],
    source: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    animation: {
      type: 'projectile',
      duration: 1000,
      color: '#8B00FF',
      size: 10,
      speed: 900,
      trail: true,
      trackTarget: true,
      targetTokenId: ''
    },
    effects: {
      affectedTargets: [],
      highlightColor: '#8B00FF'
    },
    metadata: {
      name: 'Eldritch Blast',
      description: 'A beam of crackling energy streaks toward a creature within range.'
    },
    range: 120,
    damage: '1d10',
    damageType: 'force',
    spellLevel: 0,
    castingTime: 'action',
    timestamp: 0,
    duration: 1000
  },
  {
    id: 'web-template',
    name: 'Web',
    description: 'A magical spell effect',
    type: 'spell',
    category: 'conjuration',
    tags: ["spell","magic"],
    source: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    animation: {
      type: 'area',
      duration: 800,
      color: '#F5F5DC',
      size: 20,
      persistDuration: 10,
      persistColor: '#F5F5DC',
      persistOpacity: 0.6
    },
    effects: {
      affectedTargets: [],
      highlightColor: '#F5F5DC',
      areaOfEffect: {
        type: 'circle',
        center: { x: 0, y: 0 },
        radius: 20
      }
    },
    metadata: {
      name: 'Web',
      description: 'You conjure a mass of thick, sticky webbing at a point of your choice within range.'
    },
    range: 60,
    areaOfEffect: 20,
    spellLevel: 2,
    castingTime: 'action',
    timestamp: 0,
    duration: 800
  }
]