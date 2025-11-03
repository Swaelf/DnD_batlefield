import type { BattleMap, MapObject, Shape, Text, Token, Point } from '@/types'
import { v4 as uuidv4 } from 'uuid'

// Universal VTT format interfaces
export interface UniversalVTTMap {
  format: 'universal-vtt'
  version: '1.0'
  name: string
  resolution: {
    map_origin: Point
    map_size: { width: number; height: number }
    pixels_per_grid: number
  }
  line_of_sight?: Array<{
    x: number
    y: number
    points: Point[]
  }>
  portals?: Array<{
    x: number
    y: number
    bounds: Point[]
    closed: boolean
  }>
  environment_lighting?: {
    lights: Array<{
      position: Point
      range: number
      color: string
      intensity: number
    }>
    ambient_color: string
    ambient_intensity: number
  }
  objects: UniversalVTTObject[]
}

export interface UniversalVTTObject {
  id: string
  type: 'token' | 'shape' | 'text' | 'image' | 'wall' | 'light'
  position: Point
  rotation?: number
  scale?: { x: number; y: number }
  visible?: boolean
  locked?: boolean
  layer?: string
  properties?: Record<string, any>

  // Type-specific properties
  token?: {
    name: string
    image_url: string
    size: { width: number; height: number }
    hp?: { current: number; max: number }
    ac?: number
    speed?: number
    conditions?: string[]
  }
  shape?: {
    shape_type: 'rectangle' | 'circle' | 'polygon' | 'line'
    fill_color?: string
    stroke_color?: string
    stroke_width?: number
    points?: Point[]
    radius?: number
  }
  text?: {
    content: string
    font_family?: string
    font_size?: number
    color?: string
    style?: 'normal' | 'bold' | 'italic'
  }
  image?: {
    url: string
    size: { width: number; height: number }
    opacity?: number
  }
}

// Roll20 format interfaces
export interface Roll20Export {
  pages: Roll20Page[]
  characters?: Roll20Character[]
  handouts?: Roll20Handout[]
}

export interface Roll20Page {
  _id: string
  name: string
  width: number
  height: number
  background_color?: string
  grid_opacity: number
  grid_size: number
  snapping_increment: number
  scale_number: number
  graphics: Roll20Graphic[]
  text?: Roll20Text[]
}

export interface Roll20Graphic {
  _id: string
  _type: 'graphic'
  name?: string
  imgsrc?: string
  left: number
  top: number
  width: number
  height: number
  rotation: number
  layer: 'gmlayer' | 'objects' | 'map'
  isdrawing?: boolean
  stroke?: string
  stroke_width?: number
  fill?: string
}

export interface Roll20Text {
  _id: string
  _type: 'text'
  text: string
  left: number
  top: number
  width: number
  height: number
  font_family: string
  font_size: number
  color: string
}

export interface Roll20Character {
  _id: string
  name: string
  avatar: string
  bio: string
  attributes: Record<string, { current: string; max: string }>
}

export interface Roll20Handout {
  _id: string
  name: string
  notes: string
  gmnotes: string
}

// Foundry VTT format interfaces
export interface FoundryScene {
  _id: string
  name: string
  width: number
  height: number
  background?: {
    src: string
    offsetX: number
    offsetY: number
    scaleX: number
    scaleY: number
  }
  grid: {
    type: number // 1 = square, 2 = hex
    size: number
    color: string
    alpha: number
  }
  tokens: FoundryToken[]
  drawings: FoundryDrawing[]
  walls: FoundryWall[]
  lights: FoundryLight[]
  sounds: FoundrySound[]
  templates: FoundryTemplate[]
}

export interface FoundryToken {
  _id: string
  name: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  hidden: boolean
  locked: boolean
  texture: {
    src: string
    scaleX: number
    scaleY: number
  }
  actorId?: string
}

export interface FoundryDrawing {
  _id: string
  type: 'rectangle' | 'ellipse' | 'polygon' | 'freehand'
  x: number
  y: number
  shape: {
    width?: number
    height?: number
    points?: number[]
    radius?: number
  }
  strokeColor: string
  strokeWidth: number
  fillColor?: string
  fillType?: number
  hidden: boolean
  locked: boolean
}

export interface FoundryWall {
  _id: string
  c: [number, number, number, number] // [x1, y1, x2, y2]
  move: number // Movement restriction
  sense: number // Sight restriction
  sound: number // Sound restriction
  door: number // Door type
  ds: number // Door state
}

export interface FoundryLight {
  _id: string
  x: number
  y: number
  config: {
    dim: number
    bright: number
    angle: number
    rotation: number
    color: string
    alpha: number
    animation: {
      type: string
      speed: number
      intensity: number
    }
  }
  hidden: boolean
}

export interface FoundrySound {
  _id: string
  x: number
  y: number
  path: string
  radius: number
  volume: number
}

export interface FoundryTemplate {
  _id: string
  type: 'circle' | 'cone' | 'rectangle' | 'ray'
  x: number
  y: number
  direction: number
  distance: number
  angle?: number
  width?: number
  fillColor: string
  borderColor: string
}

// Conversion utilities
export class CrossPlatformExchange {
  // Convert MapMaker to Universal VTT format
  static toUniversalVTT(map: BattleMap): UniversalVTTMap {
    const objects: UniversalVTTObject[] = map.objects.map(obj => {
      // Map MapMaker types to Universal VTT types
      let universalType: UniversalVTTObject['type'] = 'image'
      if (obj.type === 'token') universalType = 'token'
      else if (obj.type === 'shape') universalType = 'shape'
      else if (obj.type === 'text') universalType = 'text'
      else if (obj.type === 'tile') universalType = 'image'
      else if (obj.type === 'spell' || obj.type === 'persistent-area' || obj.type === 'attack') universalType = 'shape'

      const universalObj: UniversalVTTObject = {
        id: obj.id,
        type: universalType,
        position: obj.position,
        rotation: obj.rotation,
        visible: obj.visible,
        locked: obj.locked,
        layer: obj.layer?.toString()
      }

      // Convert type-specific properties
      if (obj.type === 'token') {
        const token = obj as Token
        const pixelSize = this.tokenSizeToPixels(token.size)

        universalObj.token = {
          name: token.name || 'Token',
          image_url: token.image || '',
          size: { width: pixelSize, height: pixelSize }
        }
      } else if (obj.type === 'shape') {
        const shape = obj as Shape
        universalObj.shape = {
          shape_type: shape.shapeType === 'rect' ? 'rectangle' :
                     shape.shapeType === 'circle' ? 'circle' :
                     shape.shapeType === 'polygon' ? 'polygon' : 'line',
          fill_color: shape.fill,
          stroke_color: shape.stroke,
          stroke_width: shape.strokeWidth,
          points: shape.points ? this.arrayToPoints(shape.points) : undefined
        }
      } else if (obj.type === 'text') {
        const textObj = obj as Text
        universalObj.text = {
          content: textObj.text || '',
          font_family: textObj.fontFamily,
          font_size: textObj.fontSize,
          color: textObj.color
        }
      }

      return universalObj
    })

    return {
      format: 'universal-vtt',
      version: '1.0',
      name: map.name,
      resolution: {
        map_origin: { x: 0, y: 0 },
        map_size: { width: map.width, height: map.height },
        pixels_per_grid: map.grid?.size || 50
      },
      objects
    }
  }

  // Convert MapMaker to Roll20 format
  static toRoll20(map: BattleMap): Roll20Export {
    const graphics: Roll20Graphic[] = map.objects
      .filter(obj => obj.type === 'token' || obj.type === 'shape')
      .map(obj => {
        if (obj.type === 'token') {
          const token = obj as Token
          const pixelSize = CrossPlatformExchange.tokenSizeToPixels(token.size)
          return {
            _id: obj.id,
            _type: 'graphic' as const,
            name: token.name,
            imgsrc: token.image,
            left: obj.position.x + pixelSize / 2,
            top: obj.position.y + pixelSize / 2,
            width: pixelSize,
            height: pixelSize,
            rotation: obj.rotation || 0,
            layer: 'objects',
            stroke: undefined,
            stroke_width: undefined,
            fill: undefined,
            isdrawing: false
          }
        } else {
          const shape = obj as Shape
          return {
            _id: obj.id,
            _type: 'graphic' as const,
            name: undefined,
            imgsrc: undefined,
            left: obj.position.x + (shape.width || 50) / 2,
            top: obj.position.y + (shape.height || 50) / 2,
            width: shape.width || 50,
            height: shape.height || 50,
            rotation: obj.rotation || 0,
            layer: 'map',
            stroke: shape.stroke,
            stroke_width: shape.strokeWidth,
            fill: shape.fill,
            isdrawing: true
          }
        }
      })

    const texts: Roll20Text[] = map.objects
      .filter(obj => obj.type === 'text')
      .map(obj => {
        const textObj = obj as Text
        return {
          _id: obj.id,
          _type: 'text' as const,
          text: textObj.text || '',
          left: obj.position.x,
          top: obj.position.y,
          width: textObj.text.length * (textObj.fontSize * 0.6) || 200,
          height: textObj.fontSize * 1.2 || 50,
          font_family: textObj.fontFamily || 'Arial',
          font_size: textObj.fontSize || 16,
          color: textObj.color || '#000000'
        }
      })

    const page: Roll20Page = {
      _id: uuidv4(),
      name: map.name,
      width: map.width,
      height: map.height,
      background_color: '#ffffff',
      grid_opacity: map.grid?.visible ? 0.5 : 0,
      grid_size: map.grid?.size || 50,
      snapping_increment: map.grid?.size || 50,
      scale_number: 5,
      graphics,
      text: texts.length > 0 ? texts : undefined
    }

    return {
      pages: [page]
    }
  }

  // Convert MapMaker to Foundry VTT format
  static toFoundry(map: BattleMap): FoundryScene {
    const tokens: FoundryToken[] = map.objects
      .filter(obj => obj.type === 'token')
      .map(obj => {
        const token = obj as Token
        const pixelSize = CrossPlatformExchange.tokenSizeToPixels(token.size)
        return {
          _id: obj.id,
          name: token.name || 'Token',
          x: obj.position.x,
          y: obj.position.y,
          width: pixelSize,
          height: pixelSize,
          rotation: obj.rotation || 0,
          hidden: !obj.visible,
          locked: obj.locked || false,
          texture: {
            src: token.image || '',
            scaleX: 1,
            scaleY: 1
          }
        }
      })

    const drawings: FoundryDrawing[] = map.objects
      .filter(obj => obj.type === 'shape')
      .map(obj => {
        const shape = obj as Shape
        let type: FoundryDrawing['type'] = 'rectangle'
        let shapeData: FoundryDrawing['shape'] = {}

        if (shape.shapeType === 'circle') {
          type = 'ellipse'
          shapeData = { radius: (shape.width || 50) / 2 }
        } else if (shape.shapeType === 'polygon' && shape.points) {
          type = 'polygon'
          shapeData = { points: shape.points }
        } else {
          shapeData = { width: shape.width || 50, height: shape.height || 50 }
        }

        return {
          _id: obj.id,
          type,
          x: obj.position.x,
          y: obj.position.y,
          shape: shapeData,
          strokeColor: shape.stroke || '#000000',
          strokeWidth: shape.strokeWidth || 1,
          fillColor: shape.fill,
          fillType: shape.fill ? 1 : 0,
          hidden: !obj.visible,
          locked: obj.locked || false
        }
      })

    return {
      _id: uuidv4(),
      name: map.name,
      width: map.width,
      height: map.height,
      background: undefined,
      grid: {
        type: map.grid?.type === 'hex' ? 2 : 1,
        size: map.grid?.size || 50,
        color: map.grid?.color || '#000000',
        alpha: map.grid?.visible ? 0.5 : 0
      },
      tokens,
      drawings,
      walls: [],
      lights: [],
      sounds: [],
      templates: []
    }
  }

  // Convert from Universal VTT to MapMaker
  static fromUniversalVTT(uvtt: UniversalVTTMap): BattleMap {
    const objects: MapObject[] = uvtt.objects.map(obj => {
      const baseObj = {
        id: obj.id,
        position: obj.position,
        rotation: obj.rotation || 0,
        visible: obj.visible !== false,
        locked: obj.locked || false,
        layer: parseInt(obj.layer || '30') || 30
      }

      // Create type-specific objects
      if (obj.token) {
        const token: Token = {
          ...baseObj,
          type: 'token',
          name: obj.token.name,
          image: obj.token.image_url,
          size: 'medium', // Convert from pixel size to TokenSize
          color: '#ffffff',
          opacity: 1,
          shape: 'circle'
        }
        return token
      } else if (obj.shape) {
        const shape: Shape = {
          ...baseObj,
          type: 'shape',
          shapeType: obj.shape.shape_type === 'rectangle' ? 'rect' :
                    obj.shape.shape_type === 'circle' ? 'circle' :
                    obj.shape.shape_type === 'polygon' ? 'polygon' : 'line',
          fill: obj.shape.fill_color || '#ffffff',
          fillColor: obj.shape.fill_color || '#ffffff',
          stroke: obj.shape.stroke_color || '#000000',
          strokeColor: obj.shape.stroke_color || '#000000',
          strokeWidth: obj.shape.stroke_width || 1,
          opacity: 1,
          width: 50,
          height: 50,
          points: obj.shape.points ? this.pointsToArray(obj.shape.points) : undefined
        }
        return shape
      } else if (obj.text) {
        const textObj: Text = {
          ...baseObj,
          type: 'text',
          text: obj.text.content,
          fontFamily: obj.text.font_family || 'Arial',
          fontSize: obj.text.font_size || 16,
          color: obj.text.color || '#000000'
        }
        return textObj
      }

      // Fallback to basic shape
      const fallbackShape: Shape = {
        ...baseObj,
        type: 'shape',
        shapeType: 'rect',
        fill: '#ffffff',
        fillColor: '#ffffff',
        stroke: '#000000',
        strokeColor: '#000000',
        strokeWidth: 1,
        opacity: 1,
        width: 50,
        height: 50
      }
      return fallbackShape
    })

    return {
      id: uuidv4(),
      name: uvtt.name,
      width: uvtt.resolution.map_size.width,
      height: uvtt.resolution.map_size.height,
      grid: {
        size: uvtt.resolution.pixels_per_grid,
        type: 'square',
        visible: true,
        snap: true,
        color: '#666666'
      },
      objects
    }
  }

  // Convert from Roll20 to MapMaker
  static fromRoll20(roll20: Roll20Export): BattleMap {
    const page = roll20.pages[0]
    if (!page) {
      throw new Error('No pages found in Roll20 export')
    }

    const objects: MapObject[] = []

    // Convert graphics
    page.graphics.forEach(graphic => {
      if (graphic.layer === 'objects' && graphic.imgsrc) {
        // This is a token
        const tokenObj: Token = {
          id: graphic._id,
          type: 'token',
          position: {
            x: graphic.left - graphic.width / 2,
            y: graphic.top - graphic.height / 2
          },
          rotation: graphic.rotation,
          layer: 40,
          visible: true,
          locked: false,
          name: graphic.name || 'Token',
          image: graphic.imgsrc,
          size: 'medium',
          color: '#ffffff',
          opacity: 1,
          shape: 'circle'
        }
        objects.push(tokenObj)
      } else {
        // This is a shape
        const shapeObj: Shape = {
          id: graphic._id,
          type: 'shape',
          position: {
            x: graphic.left - graphic.width / 2,
            y: graphic.top - graphic.height / 2
          },
          rotation: graphic.rotation,
          layer: graphic.layer === 'gmlayer' ? 20 : 30,
          visible: true,
          locked: false,
          name: graphic.name,
          shapeType: graphic.isdrawing ? 'polygon' : 'rect',
          width: graphic.width,
          height: graphic.height,
          fill: graphic.fill || '#000000',
          fillColor: graphic.fill || '#000000',
          stroke: graphic.stroke || '#000000',
          strokeColor: graphic.stroke || '#000000',
          strokeWidth: graphic.stroke_width || 1,
          opacity: 1
        }
        objects.push(shapeObj)
      }
    })

    // Convert text objects
    if (page.text) {
      page.text.forEach(text => {
        const textObj: Text = {
          id: text._id,
          type: 'text',
          position: { x: text.left, y: text.top },
          rotation: 0,
          visible: true,
          locked: false,
          layer: 35,
          text: text.text,
          fontFamily: text.font_family,
          fontSize: text.font_size,
          color: text.color
        }
        objects.push(textObj)
      })
    }

    return {
      id: uuidv4(),
      name: page.name,
      width: page.width,
      height: page.height,
      grid: {
        size: page.grid_size,
        type: 'square',
        visible: page.grid_opacity > 0,
        snap: true,
        color: '#666666'
      },
      objects
    }
  }

  // Convert from Foundry to MapMaker
  static fromFoundry(foundry: FoundryScene): BattleMap {
    const objects: MapObject[] = []

    // Convert tokens
    foundry.tokens.forEach(token => {
      const tokenObj: Token = {
        id: token._id,
        type: 'token',
        position: { x: token.x, y: token.y },
        rotation: token.rotation,
        visible: !token.hidden,
        locked: token.locked,
        layer: 40,
        name: token.name,
        image: token.texture.src,
        size: 'medium',
        color: '#ffffff',
        opacity: 1,
        shape: 'circle'
      }
      objects.push(tokenObj)
    })

    // Convert drawings
    foundry.drawings.forEach(drawing => {
      const shapeObj: Shape = {
        id: drawing._id,
        type: 'shape',
        position: { x: drawing.x, y: drawing.y },
        rotation: 0,
        visible: !drawing.hidden,
        locked: drawing.locked,
        layer: 30,
        stroke: drawing.strokeColor || '#000000',
        strokeColor: drawing.strokeColor || '#000000',
        strokeWidth: drawing.strokeWidth || 1,
        fill: drawing.fillColor || '#000000',
        fillColor: drawing.fillColor || '#000000',
        width: 50,
        height: 50,
        shapeType: 'rect',
        opacity: 1
      }

      if (drawing.type === 'ellipse') {
        shapeObj.shapeType = 'circle'
        shapeObj.width = shapeObj.height = (drawing.shape.radius || 25) * 2
      } else if (drawing.type === 'polygon') {
        shapeObj.shapeType = 'polygon'
        shapeObj.points = drawing.shape.points
      } else {
        shapeObj.shapeType = 'rect'
        shapeObj.width = drawing.shape.width || 50
        shapeObj.height = drawing.shape.height || 50
      }

      objects.push(shapeObj)
    })

    return {
      id: uuidv4(),
      name: foundry.name,
      width: foundry.width,
      height: foundry.height,
      grid: {
        size: foundry.grid.size,
        type: foundry.grid.type === 2 ? 'hex' : 'square',
        visible: foundry.grid.alpha > 0,
        snap: true,
        color: foundry.grid.color
      },
      objects
    }
  }

  // Helper utilities
  private static tokenSizeToPixels(tokenSize: import('@/types').TokenSize): number {
    const sizeMap = {
      'tiny': 25,
      'small': 50,
      'medium': 50,
      'large': 100,
      'huge': 150,
      'gargantuan': 200
    }
    return sizeMap[tokenSize] || 50
  }

  private static arrayToPoints(arr: number[]): Point[] {
    const points: Point[] = []
    for (let i = 0; i < arr.length; i += 2) {
      points.push({ x: arr[i], y: arr[i + 1] })
    }
    return points
  }

  private static pointsToArray(points: Point[]): number[] {
    return points.flatMap(p => [p.x, p.y])
  }
}

export default CrossPlatformExchange