/**
 * Environmental Effects Constants
 * Configuration for weather, terrain, lighting, and environmental hazards
 */

// Environmental Effect Types
export const ENVIRONMENTAL_TYPES = {
  WEATHER: 'weather',
  TERRAIN: 'terrain',
  LIGHTING: 'lighting',
  HAZARD: 'hazard',
  ATMOSPHERE: 'atmosphere',
} as const

// Weather Types
export const WEATHER_TYPES = {
  CLEAR: 'clear',
  RAIN: 'rain',
  STORM: 'storm',
  SNOW: 'snow',
  FOG: 'fog',
  WIND: 'wind',
  HAIL: 'hail',
  BLIZZARD: 'blizzard',
  SANDSTORM: 'sandstorm',
  MAGICAL_STORM: 'magical_storm',
} as const

// Weather Intensities
export const WEATHER_INTENSITIES = {
  LIGHT: 'light',
  MODERATE: 'moderate',
  HEAVY: 'heavy',
  SEVERE: 'severe',
} as const

// Terrain Types
export const TERRAIN_TYPES = {
  DIFFICULT: 'difficult',
  HAZARDOUS: 'hazardous',
  MAGICAL: 'magical',
  ELEVATED: 'elevated',
  UNDERWATER: 'underwater',
  SWAMP: 'swamp',
  ICE: 'ice',
  LAVA: 'lava',
  QUICKSAND: 'quicksand',
  THORNS: 'thorns',
} as const

// Lighting Types
export const LIGHTING_TYPES = {
  BRIGHT: 'bright',
  DIM: 'dim',
  DARK: 'dark',
  MAGICAL: 'magical',
  COLORED: 'colored',
  FLICKERING: 'flickering',
  SPOTLIGHT: 'spotlight',
  SHADOW: 'shadow',
} as const

// Hazard Types
export const HAZARD_TYPES = {
  FIRE: 'fire',
  POISON: 'poison',
  ACID: 'acid',
  COLD: 'cold',
  LIGHTNING: 'lightning',
  RADIATION: 'radiation',
  NECROTIC: 'necrotic',
  PSYCHIC: 'psychic',
} as const

// Atmosphere Types
export const ATMOSPHERE_TYPES = {
  PEACEFUL: 'peaceful',
  TENSE: 'tense',
  OMINOUS: 'ominous',
  MAGICAL: 'magical',
  HOLY: 'holy',
  CURSED: 'cursed',
  ANCIENT: 'ancient',
  ALIEN: 'alien',
} as const

// Effect Durations (in rounds, 0 = permanent until changed)
export const ENVIRONMENTAL_DURATIONS = {
  INSTANT: 1,
  SHORT: 5,
  MEDIUM: 10,
  LONG: 25,
  PERMANENT: 0,
} as const

// Effect Intensities
export const EFFECT_INTENSITIES = {
  SUBTLE: 0.3,
  MODERATE: 0.6,
  STRONG: 0.8,
  OVERWHELMING: 1.0,
} as const

// Visual Effect Parameters
export const ENVIRONMENTAL_VISUALS = {
  PARTICLE_COUNT: {
    LIGHT: 20,
    MODERATE: 50,
    HEAVY: 100,
    SEVERE: 200,
  },
  OPACITY_RANGES: {
    SUBTLE: { min: 0.1, max: 0.3 },
    MODERATE: { min: 0.3, max: 0.6 },
    STRONG: { min: 0.6, max: 0.8 },
    OVERWHELMING: { min: 0.8, max: 1.0 },
  },
  ANIMATION_SPEEDS: {
    SLOW: 0.5,
    NORMAL: 1.0,
    FAST: 2.0,
    VERY_FAST: 3.0,
  },
} as const

// Color Schemes for Environmental Effects
export const ENVIRONMENTAL_COLORS = {
  // Weather Colors
  RAIN: '#4682B4',
  STORM: '#2F4F4F',
  SNOW: '#F0F8FF',
  FOG: '#D3D3D3',
  WIND: '#87CEEB',
  HAIL: '#E6E6FA',
  SANDSTORM: '#F4A460',

  // Terrain Colors
  FIRE: '#FF6347',
  ICE: '#B0E0E6',
  POISON: '#9ACD32',
  ACID: '#ADFF2F',
  LAVA: '#FF4500',
  SWAMP: '#556B2F',

  // Lighting Colors
  BRIGHT_LIGHT: '#FFFACD',
  DIM_LIGHT: '#F5DEB3',
  MAGICAL_LIGHT: '#DA70D6',
  HOLY_LIGHT: '#FFD700',
  CURSED_LIGHT: '#8B0000',

  // Hazard Colors
  LIGHTNING: '#00FFFF',
  NECROTIC: '#800080',
  RADIATION: '#32CD32',
  PSYCHIC: '#FF69B4',
} as const

// Environmental Effect Presets
export const ENVIRONMENTAL_PRESETS = {
  // Weather Presets
  LIGHT_RAIN: {
    name: 'Light Rain',
    type: ENVIRONMENTAL_TYPES.WEATHER,
    weatherType: WEATHER_TYPES.RAIN,
    intensity: WEATHER_INTENSITIES.LIGHT,
    color: ENVIRONMENTAL_COLORS.RAIN,
    opacity: EFFECT_INTENSITIES.SUBTLE,
    particleCount: ENVIRONMENTAL_VISUALS.PARTICLE_COUNT.LIGHT,
    duration: ENVIRONMENTAL_DURATIONS.LONG,
    effects: {
      visibility: 'normal',
      movement: 'normal',
      disadvantage: [],
    },
    description: 'Light rainfall that creates a peaceful atmosphere',
  },

  HEAVY_STORM: {
    name: 'Heavy Storm',
    type: ENVIRONMENTAL_TYPES.WEATHER,
    weatherType: WEATHER_TYPES.STORM,
    intensity: WEATHER_INTENSITIES.HEAVY,
    color: ENVIRONMENTAL_COLORS.STORM,
    opacity: EFFECT_INTENSITIES.STRONG,
    particleCount: ENVIRONMENTAL_VISUALS.PARTICLE_COUNT.HEAVY,
    duration: ENVIRONMENTAL_DURATIONS.MEDIUM,
    effects: {
      visibility: 'heavily_obscured_beyond_60ft',
      movement: 'difficult_terrain',
      disadvantage: ['perception_hearing'],
      lightning: true,
    },
    description: 'Violent storm with heavy rain, wind, and lightning',
  },

  THICK_FOG: {
    name: 'Thick Fog',
    type: ENVIRONMENTAL_TYPES.WEATHER,
    weatherType: WEATHER_TYPES.FOG,
    intensity: WEATHER_INTENSITIES.HEAVY,
    color: ENVIRONMENTAL_COLORS.FOG,
    opacity: EFFECT_INTENSITIES.STRONG,
    particleCount: ENVIRONMENTAL_VISUALS.PARTICLE_COUNT.MODERATE,
    duration: ENVIRONMENTAL_DURATIONS.LONG,
    effects: {
      visibility: 'heavily_obscured_beyond_5ft',
      movement: 'normal',
      disadvantage: ['perception_sight', 'ranged_attacks'],
    },
    description: 'Dense fog that severely limits visibility',
  },

  BLIZZARD: {
    name: 'Blizzard',
    type: ENVIRONMENTAL_TYPES.WEATHER,
    weatherType: WEATHER_TYPES.BLIZZARD,
    intensity: WEATHER_INTENSITIES.SEVERE,
    color: ENVIRONMENTAL_COLORS.SNOW,
    opacity: EFFECT_INTENSITIES.OVERWHELMING,
    particleCount: ENVIRONMENTAL_VISUALS.PARTICLE_COUNT.SEVERE,
    duration: ENVIRONMENTAL_DURATIONS.LONG,
    effects: {
      visibility: 'heavily_obscured_beyond_30ft',
      movement: 'difficult_terrain',
      disadvantage: ['perception', 'ranged_attacks'],
      cold_damage: '1d4_per_hour',
      wind_speed: 'strong',
    },
    description: 'Severe snowstorm with freezing winds and poor visibility',
  },

  // Terrain Presets
  LAVA_FIELD: {
    name: 'Lava Field',
    type: ENVIRONMENTAL_TYPES.TERRAIN,
    terrainType: TERRAIN_TYPES.LAVA,
    color: ENVIRONMENTAL_COLORS.LAVA,
    opacity: EFFECT_INTENSITIES.STRONG,
    duration: ENVIRONMENTAL_DURATIONS.PERMANENT,
    effects: {
      damage: '3d6_fire_per_round',
      movement: 'difficult_terrain',
      heat_effects: true,
    },
    description: 'Molten lava that deals fire damage to anything touching it',
  },

  ICY_TERRAIN: {
    name: 'Icy Terrain',
    type: ENVIRONMENTAL_TYPES.TERRAIN,
    terrainType: TERRAIN_TYPES.ICE,
    color: ENVIRONMENTAL_COLORS.ICE,
    opacity: EFFECT_INTENSITIES.MODERATE,
    duration: ENVIRONMENTAL_DURATIONS.PERMANENT,
    effects: {
      movement: 'difficult_terrain',
      dexterity_save: 'DC_10_or_prone',
      cold_resistance_needed: true,
    },
    description: 'Slippery ice that makes movement treacherous',
  },

  POISONOUS_SWAMP: {
    name: 'Poisonous Swamp',
    type: ENVIRONMENTAL_TYPES.TERRAIN,
    terrainType: TERRAIN_TYPES.SWAMP,
    color: ENVIRONMENTAL_COLORS.SWAMP,
    opacity: EFFECT_INTENSITIES.MODERATE,
    duration: ENVIRONMENTAL_DURATIONS.PERMANENT,
    effects: {
      movement: 'difficult_terrain',
      poison_save: 'DC_15_or_poisoned',
      damage: '1d6_poison_per_round',
    },
    description: 'Toxic swampland that can poison those who enter',
  },

  // Lighting Presets
  BRIGHT_DAYLIGHT: {
    name: 'Bright Daylight',
    type: ENVIRONMENTAL_TYPES.LIGHTING,
    lightingType: LIGHTING_TYPES.BRIGHT,
    color: ENVIRONMENTAL_COLORS.BRIGHT_LIGHT,
    opacity: EFFECT_INTENSITIES.MODERATE,
    duration: ENVIRONMENTAL_DURATIONS.PERMANENT,
    effects: {
      visibility: 'bright_light',
      advantage: ['perception_sight'],
    },
    description: 'Bright natural sunlight illuminating the area',
  },

  DIM_TWILIGHT: {
    name: 'Dim Twilight',
    type: ENVIRONMENTAL_TYPES.LIGHTING,
    lightingType: LIGHTING_TYPES.DIM,
    color: ENVIRONMENTAL_COLORS.DIM_LIGHT,
    opacity: EFFECT_INTENSITIES.SUBTLE,
    duration: ENVIRONMENTAL_DURATIONS.PERMANENT,
    effects: {
      visibility: 'dim_light',
      disadvantage: ['perception_sight'],
    },
    description: 'Fading light of dusk or dawn',
  },

  MAGICAL_AURA: {
    name: 'Magical Aura',
    type: ENVIRONMENTAL_TYPES.LIGHTING,
    lightingType: LIGHTING_TYPES.MAGICAL,
    color: ENVIRONMENTAL_COLORS.MAGICAL_LIGHT,
    opacity: EFFECT_INTENSITIES.MODERATE,
    duration: ENVIRONMENTAL_DURATIONS.LONG,
    effects: {
      visibility: 'bright_light',
      magic_enhancement: true,
      spell_save_dc_bonus: 1,
    },
    description: 'Shimmering magical energy that enhances spellcasting',
  },

  // Hazard Presets
  LIGHTNING_STORM: {
    name: 'Lightning Storm',
    type: ENVIRONMENTAL_TYPES.HAZARD,
    hazardType: HAZARD_TYPES.LIGHTNING,
    color: ENVIRONMENTAL_COLORS.LIGHTNING,
    opacity: EFFECT_INTENSITIES.STRONG,
    duration: ENVIRONMENTAL_DURATIONS.MEDIUM,
    effects: {
      lightning_chance: '20_percent_per_round',
      damage: '4d6_lightning',
      dexterity_save: 'DC_18',
      metal_attraction: true,
    },
    description: 'Violent electrical storm with frequent lightning strikes',
  },

  TOXIC_CLOUD: {
    name: 'Toxic Cloud',
    type: ENVIRONMENTAL_TYPES.HAZARD,
    hazardType: HAZARD_TYPES.POISON,
    color: ENVIRONMENTAL_COLORS.POISON,
    opacity: EFFECT_INTENSITIES.STRONG,
    duration: ENVIRONMENTAL_DURATIONS.MEDIUM,
    effects: {
      poison_save: 'DC_16_per_round',
      damage: '2d6_poison',
      visibility: 'lightly_obscured',
    },
    description: 'Poisonous gas cloud that damages and obscures vision',
  },

  NECROTIC_FIELD: {
    name: 'Necrotic Field',
    type: ENVIRONMENTAL_TYPES.HAZARD,
    hazardType: HAZARD_TYPES.NECROTIC,
    color: ENVIRONMENTAL_COLORS.NECROTIC,
    opacity: EFFECT_INTENSITIES.STRONG,
    duration: ENVIRONMENTAL_DURATIONS.LONG,
    effects: {
      necrotic_damage: '1d8_per_round',
      max_hp_reduction: true,
      undead_immunity: true,
      healing_resistance: 'half_effectiveness',
    },
    description: 'Dark energy field that drains life force',
  },

  // Atmosphere Presets
  HOLY_GROUND: {
    name: 'Holy Ground',
    type: ENVIRONMENTAL_TYPES.ATMOSPHERE,
    atmosphereType: ATMOSPHERE_TYPES.HOLY,
    color: ENVIRONMENTAL_COLORS.HOLY_LIGHT,
    opacity: EFFECT_INTENSITIES.SUBTLE,
    duration: ENVIRONMENTAL_DURATIONS.PERMANENT,
    effects: {
      undead_disadvantage: true,
      fiend_disadvantage: true,
      healing_bonus: '50_percent',
      turn_undead_bonus: true,
    },
    description: 'Sacred ground blessed by divine power',
  },

  CURSED_LAND: {
    name: 'Cursed Land',
    type: ENVIRONMENTAL_TYPES.ATMOSPHERE,
    atmosphereType: ATMOSPHERE_TYPES.CURSED,
    color: ENVIRONMENTAL_COLORS.CURSED_LIGHT,
    opacity: EFFECT_INTENSITIES.MODERATE,
    duration: ENVIRONMENTAL_DURATIONS.PERMANENT,
    effects: {
      saving_throw_penalty: -1,
      healing_resistance: 'half_effectiveness',
      fear_susceptibility: true,
      undead_advantage: true,
    },
    description: 'Land tainted by dark magic and malevolent forces',
  },
} as const

// Environmental Effect Areas
export const EFFECT_AREAS = {
  POINT: 'point',           // Single 5ft square
  SMALL: 'small',          // 10ft radius (4 squares)
  MEDIUM: 'medium',        // 20ft radius (8 squares)
  LARGE: 'large',          // 30ft radius (12 squares)
  HUGE: 'huge',           // 60ft radius (24 squares)
  MAP_WIDE: 'map_wide',   // Entire map
} as const

// Effect Area Sizes (in pixels for 50px grid)
export const EFFECT_AREA_SIZES = {
  [EFFECT_AREAS.POINT]: { radius: 25 },      // 0.5 squares
  [EFFECT_AREAS.SMALL]: { radius: 100 },     // 2 squares
  [EFFECT_AREAS.MEDIUM]: { radius: 200 },    // 4 squares
  [EFFECT_AREAS.LARGE]: { radius: 300 },     // 6 squares
  [EFFECT_AREAS.HUGE]: { radius: 600 },      // 12 squares
  [EFFECT_AREAS.MAP_WIDE]: { radius: 9999 }, // Entire map
} as const

// Movement Speed Modifiers
export const MOVEMENT_MODIFIERS = {
  NORMAL: 1.0,
  DIFFICULT: 0.5,
  ENHANCED: 1.5,
  SLOWED: 0.25,
  STOPPED: 0.0,
} as const

// Visibility Ranges (in feet)
export const VISIBILITY_RANGES = {
  NORMAL: 9999,
  LIGHTLY_OBSCURED: 500,
  HEAVILY_OBSCURED_60FT: 60,
  HEAVILY_OBSCURED_30FT: 30,
  HEAVILY_OBSCURED_5FT: 5,
  BLIND: 0,
} as const