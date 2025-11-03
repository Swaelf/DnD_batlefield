/**
 * Konva Object Pool
 * Implements object pooling for Konva shapes to reduce GC pressure and improve performance
 */

import Konva from 'konva'

interface PoolConfig {
  initialSize: number
  maxSize: number
  growthFactor: number
}

interface PooledObject<T> {
  object: T
  isInUse: boolean
  lastUsed: number
}

class ObjectPool<T> {
  private pool: PooledObject<T>[] = []
  private createFn: () => T
  private resetFn: (obj: T) => void
  private config: PoolConfig

  constructor(
    createFn: () => T,
    resetFn: (obj: T) => void,
    config: PoolConfig = { initialSize: 10, maxSize: 100, growthFactor: 1.5 }
  ) {
    this.createFn = createFn
    this.resetFn = resetFn
    this.config = config

    // Pre-populate pool
    for (let i = 0; i < config.initialSize; i++) {
      this.pool.push({
        object: createFn(),
        isInUse: false,
        lastUsed: 0
      })
    }
  }

  acquire(): T {
    // Find available object
    const pooled = this.pool.find(p => !p.isInUse)

    if (pooled) {
      pooled.isInUse = true
      pooled.lastUsed = Date.now()
      return pooled.object
    }

    // Create new object if pool can grow
    if (this.pool.length < this.config.maxSize) {
      const newObject = this.createFn()
      this.pool.push({
        object: newObject,
        isInUse: true,
        lastUsed: Date.now()
      })
      return newObject
    }

    // Force create if pool is at capacity (fallback)
    console.warn('Object pool at capacity, creating non-pooled object')
    return this.createFn()
  }

  release(obj: T): void {
    const pooled = this.pool.find(p => p.object === obj)
    if (pooled) {
      this.resetFn(obj)
      pooled.isInUse = false
      pooled.lastUsed = Date.now()
    }
  }

  cleanup(): void {
    const now = Date.now()
    const maxAge = 30000 // 30 seconds

    // Remove old unused objects
    this.pool = this.pool.filter(p => {
      if (!p.isInUse && (now - p.lastUsed) > maxAge) {
        // Destroy Konva object if it has destroy method
        const obj = p.object as unknown
        if (obj && typeof obj === 'object' && 'destroy' in obj) {
          const destroyable = obj as { destroy: () => void }
          if (typeof destroyable.destroy === 'function') {
            destroyable.destroy()
          }
        }
        return false
      }
      return true
    })
  }

  getStats() {
    const inUse = this.pool.filter(p => p.isInUse).length
    return {
      total: this.pool.length,
      inUse,
      available: this.pool.length - inUse,
      maxSize: this.config.maxSize
    }
  }
}

// Pre-configured pools for common Konva objects
export class KonvaObjectPools {
  private static instance: KonvaObjectPools

  private circlePool: ObjectPool<Konva.Circle>
  private rectPool: ObjectPool<Konva.Rect>
  private linePool: ObjectPool<Konva.Line>
  private textPool: ObjectPool<Konva.Text>
  private groupPool: ObjectPool<Konva.Group>
  private imagePool: ObjectPool<Konva.Image>

  private constructor() {
    // Circle pool
    this.circlePool = new ObjectPool(
      () => new Konva.Circle({
        radius: 25,
        fill: 'blue',
        visible: false
      }),
      (circle) => {
        circle.setAttrs({
          x: 0,
          y: 0,
          radius: 25,
          fill: 'blue',
          stroke: null,
          strokeWidth: 0,
          visible: false,
          opacity: 1,
          rotation: 0,
          scaleX: 1,
          scaleY: 1
        })
        circle.off() // Remove all event listeners
      },
      { initialSize: 20, maxSize: 200, growthFactor: 1.5 }
    )

    // Rectangle pool
    this.rectPool = new ObjectPool(
      () => new Konva.Rect({
        width: 50,
        height: 50,
        fill: 'red',
        visible: false
      }),
      (rect) => {
        rect.setAttrs({
          x: 0,
          y: 0,
          width: 50,
          height: 50,
          fill: 'red',
          stroke: null,
          strokeWidth: 0,
          visible: false,
          opacity: 1,
          rotation: 0,
          scaleX: 1,
          scaleY: 1
        })
        rect.off()
      },
      { initialSize: 20, maxSize: 200, growthFactor: 1.5 }
    )

    // Line pool
    this.linePool = new ObjectPool(
      () => {
        const line = new Konva.Line()
        line.setAttrs({
          points: [0, 0, 100, 100],
          stroke: 'black',
          strokeWidth: 2,
          visible: false
        })
        return line
      },
      (line) => {
        line.setAttrs({
          points: [0, 0, 100, 100],
          stroke: 'black',
          strokeWidth: 2,
          visible: false,
          opacity: 1,
          closed: false,
          tension: 0
        })
        line.off()
      },
      { initialSize: 15, maxSize: 150, growthFactor: 1.5 }
    )

    // Text pool
    this.textPool = new ObjectPool(
      () => new Konva.Text({
        text: '',
        fontSize: 14,
        fill: 'black',
        visible: false
      }),
      (text) => {
        text.setAttrs({
          x: 0,
          y: 0,
          text: '',
          fontSize: 14,
          fill: 'black',
          visible: false,
          opacity: 1,
          rotation: 0,
          align: 'left',
          verticalAlign: 'top'
        })
        text.off()
      },
      { initialSize: 10, maxSize: 100, growthFactor: 1.5 }
    )

    // Group pool
    this.groupPool = new ObjectPool(
      () => new Konva.Group({
        visible: false
      }),
      (group) => {
        group.destroyChildren() // Remove all children
        group.setAttrs({
          x: 0,
          y: 0,
          visible: false,
          opacity: 1,
          rotation: 0,
          scaleX: 1,
          scaleY: 1
        })
        group.off()
      },
      { initialSize: 15, maxSize: 100, growthFactor: 1.5 }
    )

    // Image pool
    this.imagePool = new ObjectPool(
      () => {
        // Create a 1x1 placeholder image to satisfy Konva.Image constructor
        const placeholderImage = new Image(1, 1)
        const image = new Konva.Image({
          image: placeholderImage,
          visible: false
        })
        return image
      },
      (image) => {
        image.setAttrs({
          x: 0,
          y: 0,
          image: null,
          visible: false,
          opacity: 1,
          rotation: 0,
          scaleX: 1,
          scaleY: 1
        })
        image.off()
      },
      { initialSize: 10, maxSize: 50, growthFactor: 1.5 }
    )

    // Cleanup interval
    setInterval(() => {
      this.cleanupAllPools()
    }, 30000) // Every 30 seconds
  }

  static getInstance(): KonvaObjectPools {
    if (!KonvaObjectPools.instance) {
      KonvaObjectPools.instance = new KonvaObjectPools()
    }
    return KonvaObjectPools.instance
  }

  // Acquire methods
  acquireCircle(): Konva.Circle {
    return this.circlePool.acquire()
  }

  acquireRect(): Konva.Rect {
    return this.rectPool.acquire()
  }

  acquireLine(): Konva.Line {
    return this.linePool.acquire()
  }

  acquireText(): Konva.Text {
    return this.textPool.acquire()
  }

  acquireGroup(): Konva.Group {
    return this.groupPool.acquire()
  }

  acquireImage(): Konva.Image {
    return this.imagePool.acquire()
  }

  // Release methods
  releaseCircle(circle: Konva.Circle): void {
    this.circlePool.release(circle)
  }

  releaseRect(rect: Konva.Rect): void {
    this.rectPool.release(rect)
  }

  releaseLine(line: Konva.Line): void {
    this.linePool.release(line)
  }

  releaseText(text: Konva.Text): void {
    this.textPool.release(text)
  }

  releaseGroup(group: Konva.Group): void {
    this.groupPool.release(group)
  }

  releaseImage(image: Konva.Image): void {
    this.imagePool.release(image)
  }

  // Utility methods
  cleanupAllPools(): void {
    this.circlePool.cleanup()
    this.rectPool.cleanup()
    this.linePool.cleanup()
    this.textPool.cleanup()
    this.groupPool.cleanup()
    this.imagePool.cleanup()
  }

  getPoolStats() {
    return {
      circle: this.circlePool.getStats(),
      rect: this.rectPool.getStats(),
      line: this.linePool.getStats(),
      text: this.textPool.getStats(),
      group: this.groupPool.getStats(),
      image: this.imagePool.getStats()
    }
  }

  // High-level helper for creating optimized shapes
  createOptimizedShape(type: 'circle' | 'rect' | 'line' | 'text' | 'group' | 'image', config: any): Konva.Node {
    let shape: Konva.Node

    switch (type) {
      case 'circle':
        shape = this.acquireCircle()
        shape.setAttrs(config)
        break
      case 'rect':
        shape = this.acquireRect()
        shape.setAttrs(config)
        break
      case 'line':
        shape = this.acquireLine()
        shape.setAttrs(config)
        break
      case 'text':
        shape = this.acquireText()
        shape.setAttrs(config)
        break
      case 'group':
        shape = this.acquireGroup()
        shape.setAttrs(config)
        break
      case 'image':
        shape = this.acquireImage()
        shape.setAttrs(config)
        break
      default:
        throw new Error(`Unknown shape type: ${type}`)
    }

    shape.visible(true)
    return shape
  }

  // Release shape back to appropriate pool
  releaseShape(shape: Konva.Node): void {
    if (shape instanceof Konva.Circle) {
      this.releaseCircle(shape)
    } else if (shape instanceof Konva.Rect) {
      this.releaseRect(shape)
    } else if (shape instanceof Konva.Line) {
      this.releaseLine(shape)
    } else if (shape instanceof Konva.Text) {
      this.releaseText(shape)
    } else if (shape instanceof Konva.Group) {
      this.releaseGroup(shape)
    } else if (shape instanceof Konva.Image) {
      this.releaseImage(shape)
    }
  }
}

// Export singleton instance
export const konvaPool = KonvaObjectPools.getInstance()

// Utility hook for managing pooled objects in React
import { useEffect } from 'react'

export function useKonvaPool() {
  const pooledObjects = new Set<Konva.Node>()

  const createShape = (type: 'circle' | 'rect' | 'line' | 'text' | 'group' | 'image', config: any) => {
    const shape = konvaPool.createOptimizedShape(type, config)
    pooledObjects.add(shape)
    return shape
  }

  const releaseShape = (shape: Konva.Node) => {
    if (pooledObjects.has(shape)) {
      konvaPool.releaseShape(shape)
      pooledObjects.delete(shape)
    }
  }

  const releaseAllShapes = () => {
    for (const shape of pooledObjects) {
      konvaPool.releaseShape(shape)
    }
    pooledObjects.clear()
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      releaseAllShapes()
    }
  }, [])

  return {
    createShape,
    releaseShape,
    releaseAllShapes,
    getStats: () => konvaPool.getPoolStats()
  }
}