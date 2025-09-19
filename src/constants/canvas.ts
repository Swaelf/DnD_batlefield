/**
 * Canvas Constants
 * Configuration for canvas dimensions, zoom, and rendering
 */

// Default Canvas Dimensions
export const CANVAS_DIMENSIONS = {
  DEFAULT_WIDTH: 1920,
  DEFAULT_HEIGHT: 1080,
  MIN_WIDTH: 640,
  MIN_HEIGHT: 480,
  MAX_WIDTH: 7680, // 8K width
  MAX_HEIGHT: 4320, // 8K height
} as const

// Zoom Configuration
export const ZOOM = {
  MIN: 0.1,      // 10%
  MAX: 5.0,      // 500%
  DEFAULT: 1.0,  // 100%
  STEP: 0.1,     // 10% increments
  WHEEL_FACTOR: 0.001,
  PINCH_FACTOR: 0.02,
  DOUBLE_CLICK: 2.0,
  FIT_PADDING: 50, // pixels
} as const

// Pan Configuration
export const PAN = {
  MOUSE_SENSITIVITY: 1.0,
  TOUCH_SENSITIVITY: 1.0,
  KEYBOARD_STEP: 50, // pixels
  EDGE_SCROLL_ZONE: 50, // pixels from edge
  EDGE_SCROLL_SPEED: 10, // pixels per frame
} as const

// Canvas Layers (z-index)
export const CANVAS_LAYERS = {
  BACKGROUND: 0,
  GRID: 1,
  SHAPES: 10,
  TOKENS: 20,
  EFFECTS: 30,
  MEASUREMENTS: 40,
  UI: 50,
  TOOLTIPS: 100,
  MODALS: 1000,
} as const

// Rendering Configuration
export const RENDERING = {
  PIXEL_RATIO: window.devicePixelRatio || 1,
  ANTIALIAS: true,
  SMOOTH_IMAGE: true,
  HIT_STROKE_WIDTH: 10, // pixels for hit detection
  SELECTION_PADDING: 5, // pixels
  HANDLE_SIZE: 8, // pixels for resize handles
} as const

// Performance Settings
export const PERFORMANCE = {
  BATCH_RENDER_THRESHOLD: 100, // objects
  DEBOUNCE_DELAY: 16, // ms (60fps)
  THROTTLE_DELAY: 100, // ms
  MAX_UNDO_STATES: 50,
  CACHE_SHAPES: true,
  USE_OFFSCREEN_CANVAS: true,
} as const

// Cursor Types
export const CURSOR = {
  DEFAULT: 'default',
  POINTER: 'pointer',
  CROSSHAIR: 'crosshair',
  GRAB: 'grab',
  GRABBING: 'grabbing',
  MOVE: 'move',
  COPY: 'copy',
  NOT_ALLOWED: 'not-allowed',
  TEXT: 'text',
  RESIZE_NS: 'ns-resize',
  RESIZE_EW: 'ew-resize',
  RESIZE_NESW: 'nesw-resize',
  RESIZE_NWSE: 'nwse-resize',
} as const

// Selection Modes
export const SELECTION_MODE = {
  SINGLE: 'single',
  MULTIPLE: 'multiple',
  BOX: 'box',
  LASSO: 'lasso',
} as const