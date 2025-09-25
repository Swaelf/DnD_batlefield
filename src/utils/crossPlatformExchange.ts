import { BattleMap, MapObject, Point } from '@/types'

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
      const universalObj: UniversalVTTObject = {
        id: obj.id,
        type: obj.type,
        position: obj.position,
        rotation: obj.rotation,
        visible: obj.visible,
        locked: obj.locked,
        layer: obj.layer?.toString()
      }

      // Convert type-specific properties
      if (obj.type === 'token') {
        universalObj.token = {
          name: obj.name || 'Token',
          image_url: obj.image || '',
          size: { width: obj.width || 50, height: obj.height || 50 }
        }
      } else if (obj.type === 'shape') {
        universalObj.shape = {
          shape_type: obj.shapeType === 'rect' ? 'rectangle' :
                     obj.shapeType === 'circle' ? 'circle' :
                     obj.shapeType === 'polygon' ? 'polygon' : 'line',
          fill_color: obj.fill,
          stroke_color: obj.stroke,
          stroke_width: obj.strokeWidth,
          points: obj.points ? this.arrayToPoints(obj.points) : undefined
        }
      } else if (obj.type === 'text') {
        universalObj.text = {
          content: obj.text || '',
          font_family: obj.fontFamily,
          font_size: obj.fontSize,
          color: obj.fill || obj.stroke
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
      .map(obj => ({
        _id: obj.id,
        _type: 'graphic' as const,
        name: obj.name,
        imgsrc: obj.image,
        left: obj.position.x + (obj.width || 50) / 2,
        top: obj.position.y + (obj.height || 50) / 2,
        width: obj.width || 50,
        height: obj.height || 50,
        rotation: obj.rotation || 0,
        layer: obj.type === 'token' ? 'objects' : 'map',
        stroke: obj.stroke,
        stroke_width: obj.strokeWidth,
        fill: obj.fill,
        isdrawing: obj.type === 'shape'
      }))

    const texts: Roll20Text[] = map.objects
      .filter(obj => obj.type === 'text')
      .map(obj => ({
        _id: obj.id,
        _type: 'text' as const,
        text: obj.text || '',
        left: obj.position.x,
        top: obj.position.y,
        width: obj.width || 200,
        height: obj.height || 50,
        font_family: obj.fontFamily || 'Arial',
        font_size: obj.fontSize || 16,
        color: obj.fill || '#000000'
      }))

    const page: Roll20Page = {
      _id: crypto.randomUUID(),
      name: map.name,
      width: map.width,
      height: map.height,
      background_color: map.background || '#ffffff',
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
      .map(obj => ({
        _id: obj.id,
        name: obj.name || 'Token',
        x: obj.position.x,
        y: obj.position.y,
        width: obj.width || 50,
        height: obj.height || 50,
        rotation: obj.rotation || 0,
        hidden: !obj.visible,
        locked: obj.locked || false,
        texture: {
          src: obj.image || '',
          scaleX: 1,
          scaleY: 1
        }
      }))

    const drawings: FoundryDrawing[] = map.objects
      .filter(obj => obj.type === 'shape')
      .map(obj => {
        let type: FoundryDrawing['type'] = 'rectangle'
        let shape: FoundryDrawing['shape'] = {}

        if (obj.shapeType === 'circle') {
          type = 'ellipse'
          shape = { radius: (obj.width || 50) / 2 }
        } else if (obj.shapeType === 'polygon' && obj.points) {
          type = 'polygon'
          shape = { points: obj.points }
        } else {
          shape = { width: obj.width || 50, height: obj.height || 50 }
        }

        return {
          _id: obj.id,
          type,
          x: obj.position.x,
          y: obj.position.y,
          shape,
          strokeColor: obj.stroke || '#000000',
          strokeWidth: obj.strokeWidth || 1,
          fillColor: obj.fill,
          fillType: obj.fill ? 1 : 0,
          hidden: !obj.visible,
          locked: obj.locked || false
        }
      })

    return {
      _id: crypto.randomUUID(),
      name: map.name,
      width: map.width,
      height: map.height,
      background: map.background ? {
        src: map.background,
        offsetX: 0,
        offsetY: 0,
        scaleX: 1,
        scaleY: 1
      } : undefined,
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
      const mapObj: MapObject = {
        id: obj.id,
        type: obj.type === 'token' ? 'token' :
              obj.type === 'shape' ? 'shape' :
              obj.type === 'text' ? 'text' : 'shape',
        position: obj.position,
        rotation: obj.rotation || 0,
        visible: obj.visible !== false,
        locked: obj.locked || false,
        layer: parseInt(obj.layer || '30') || 30,
        width: 50,
        height: 50
      }

      // Convert type-specific properties
      if (obj.token) {
        mapObj.name = obj.token.name
        mapObj.image = obj.token.image_url
        mapObj.width = obj.token.size.width
        mapObj.height = obj.token.size.height
      } else if (obj.shape) {
        mapObj.shapeType = obj.shape.shape_type === 'rectangle' ? 'rect' :
                          obj.shape.shape_type === 'circle' ? 'circle' :
                          obj.shape.shape_type === 'polygon' ? 'polygon' : 'line'
        mapObj.fill = obj.shape.fill_color
        mapObj.stroke = obj.shape.stroke_color
        mapObj.strokeWidth = obj.shape.stroke_width
        if (obj.shape.points) {
          mapObj.points = this.pointsToArray(obj.shape.points)
        }
      } else if (obj.text) {
        mapObj.text = obj.text.content
        mapObj.fontFamily = obj.text.font_family
        mapObj.fontSize = obj.text.font_size
        mapObj.fill = obj.text.color
      }

      return mapObj
    })

    return {
      id: crypto.randomUUID(),
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
      const obj: MapObject = {
        id: graphic._id,
        type: graphic.layer === 'objects' && graphic.imgsrc ? 'token' : 'shape',
        position: {
          x: graphic.left - graphic.width / 2,
          y: graphic.top - graphic.height / 2
        },
        width: graphic.width,
        height: graphic.height,
        rotation: graphic.rotation,
        visible: true,
        locked: false,
        layer: graphic.layer === 'gmlayer' ? 20 : graphic.layer === 'objects' ? 40 : 30,
        name: graphic.name,
        image: graphic.imgsrc,
        stroke: graphic.stroke,
        strokeWidth: graphic.stroke_width,
        fill: graphic.fill
      }

      if (obj.type === 'shape') {
        obj.shapeType = graphic.isdrawing ? 'path' : 'rect'
      }

      objects.push(obj)
    })

    // Convert text objects
    if (page.text) {
      page.text.forEach(text => {
        objects.push({
          id: text._id,
          type: 'text',
          position: { x: text.left, y: text.top },
          width: text.width,
          height: text.height,
          rotation: 0,
          visible: true,
          locked: false,
          layer: 35,
          text: text.text,
          fontFamily: text.font_family,
          fontSize: text.font_size,
          fill: text.color
        })
      })
    }

    return {
      id: crypto.randomUUID(),
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
      objects,
      background: page.background_color
    }
  }

  // Convert from Foundry to MapMaker
  static fromFoundry(foundry: FoundryScene): BattleMap {
    const objects: MapObject[] = []

    // Convert tokens
    foundry.tokens.forEach(token => {
      objects.push({
        id: token._id,
        type: 'token',
        position: { x: token.x, y: token.y },
        width: token.width,
        height: token.height,
        rotation: token.rotation,
        visible: !token.hidden,
        locked: token.locked,
        layer: 40,
        name: token.name,
        image: token.texture.src
      })
    })

    // Convert drawings
    foundry.drawings.forEach(drawing => {
      const obj: MapObject = {
        id: drawing._id,
        type: 'shape',
        position: { x: drawing.x, y: drawing.y },
        rotation: 0,
        visible: !drawing.hidden,
        locked: drawing.locked,
        layer: 30,
        stroke: drawing.strokeColor,
        strokeWidth: drawing.strokeWidth,
        fill: drawing.fillColor,
        width: 50,
        height: 50
      }

      if (drawing.type === 'ellipse') {
        obj.shapeType = 'circle'
        obj.width = obj.height = (drawing.shape.radius || 25) * 2
      } else if (drawing.type === 'polygon') {
        obj.shapeType = 'polygon'
        obj.points = drawing.shape.points
      } else {
        obj.shapeType = 'rect'
        obj.width = drawing.shape.width || 50
        obj.height = drawing.shape.height || 50
      }

      objects.push(obj)
    })

    return {
      id: crypto.randomUUID(),
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
      objects,
      background: foundry.background?.src
    }
  }

  // Helper utilities
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