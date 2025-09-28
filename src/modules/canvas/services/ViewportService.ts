/**
 * Viewport Service - Canvas viewport and coordinate transformation service
 *
 * Provides viewport management, coordinate conversion, and camera controls
 * for optimal canvas navigation and rendering performance.
 */

import type Konva from 'konva'
import type {
  ViewportConfig,
  CameraState,
  CameraAnimation,
  CameraKeyframe,
  CameraEasing,
  CoordinateConversion,
  CoordinateSpace,
  UpdateViewportData,
  ViewportFitOptions
} from '../types'
import type { ViewportState } from '../types/viewport'
import type { Point, Rectangle } from '@/types/geometry'

export class ViewportService {
  private static instance: ViewportService | null = null
  private viewports = new Map<string, ViewportManager>()

  private constructor() {}

  static getInstance(): ViewportService {
    if (!ViewportService.instance) {
      ViewportService.instance = new ViewportService()
    }
    return ViewportService.instance
  }

  /**
   * Create viewport manager for a canvas
   */
  createViewportManager(canvasId: string, stage: Konva.Stage): ViewportManager {
    const manager = new ViewportManager(canvasId, stage)
    this.viewports.set(canvasId, manager)
    return manager
  }

  /**
   * Get viewport manager
   */
  getViewportManager(canvasId: string): ViewportManager | null {
    return this.viewports.get(canvasId) || null
  }

  /**
   * Destroy viewport manager
   */
  destroyViewportManager(canvasId: string): boolean {
    const manager = this.viewports.get(canvasId)
    if (!manager) return false

    manager.destroy()
    this.viewports.delete(canvasId)
    return true
  }

  /**
   * Convert coordinates between different spaces
   */
  convertCoordinates(
    canvasId: string,
    point: Point,
    fromSpace: CoordinateSpace,
    toSpace: CoordinateSpace
  ): CoordinateConversion | null {
    const manager = this.getViewportManager(canvasId)
    if (!manager) {
      return {
        source: point,
        target: point,
        sourceSpace: fromSpace,
        targetSpace: toSpace,
        isValid: false
      }
    }

    return manager.convertCoordinates(point, fromSpace, toSpace)
  }

  /**
   * Get all viewport managers
   */
  getAllViewportManagers(): ViewportManager[] {
    return Array.from(this.viewports.values())
  }
}

/**
 * Viewport Manager
 * Manages viewport state and transformations for a specific canvas
 */
export class ViewportManager {
  private stage: Konva.Stage
  private config: ViewportConfig
  private state: ViewportState
  private cameraState: CameraState
  private activeAnimation: CameraAnimation | null = null
  private animationFrame: number | null = null

  constructor(_canvasId: string, stage: Konva.Stage) {
    this.stage = stage

    this.config = {
      minZoom: 0.1,
      maxZoom: 10,
      zoomStep: 0.1,
      enablePanning: true,
      enableZooming: true,
      constrainPanning: false,
      smoothTransitions: true,
      transitionDuration: 300
    }

    const stageSize = stage.size()
    this.state = {
      position: { x: 0, y: 0 },
      zoom: 1,
      rotation: 0,
      bounds: {
        x: 0,
        y: 0,
        width: stageSize.width,
        height: stageSize.height
      },
      worldBounds: {
        x: 0,
        y: 0,
        width: stageSize.width,
        height: stageSize.height
      },
      isTransitioning: false,
      transitionId: null
    }

    this.cameraState = {
      target: { x: 0, y: 0 },
      position: { x: 0, y: 0 },
      zoom: 1,
      rotation: 0,
      isAnimating: false,
      animationId: null,
      easing: 'ease-out'
    }

    this.setupEventListeners()
  }

  /**
   * Set up stage event listeners for viewport control
   */
  private setupEventListeners(): void {
    // Wheel event for zooming
    this.stage.on('wheel', (e) => {
      if (!this.config.enableZooming) return

      e.evt.preventDefault()

      const pointer = this.stage.getPointerPosition()
      if (!pointer) return

      const zoomDelta = e.evt.deltaY > 0 ? -this.config.zoomStep : this.config.zoomStep
      this.zoomToPoint(pointer, zoomDelta)
    })

    // Drag events for panning
    this.stage.on('dragstart', () => {
      if (!this.config.enablePanning) return
      this.stage.container().style.cursor = 'grabbing'
    })

    this.stage.on('dragmove', () => {
      if (!this.config.enablePanning) return
      this.updateStateFromStage()
    })

    this.stage.on('dragend', () => {
      if (!this.config.enablePanning) return
      this.stage.container().style.cursor = 'default'
      this.updateStateFromStage()
    })
  }

  /**
   * Update viewport state
   */
  updateViewport(data: UpdateViewportData): boolean {
    if (data.position) {
      this.setPan(data.position, data.animate, data.duration, data.easing)
    }

    if (data.zoom !== undefined) {
      this.setZoom(data.zoom, undefined, data.animate, data.duration, data.easing)
    }

    if (data.rotation !== undefined) {
      this.setRotation(data.rotation, data.animate, data.duration, data.easing)
    }

    return true
  }

  /**
   * Set viewport zoom
   */
  setZoom(
    zoom: number,
    center?: Point,
    animate = false,
    duration = this.config.transitionDuration,
    easing: CameraEasing = 'ease-out'
  ): void {
    const clampedZoom = Math.max(this.config.minZoom, Math.min(this.config.maxZoom, zoom))

    if (animate && this.config.smoothTransitions) {
      this.animateCamera({
        zoom: clampedZoom,
        position: this.state.position ?? { x: 0, y: 0 },
        rotation: this.state.rotation ?? 0,
        timestamp: performance.now()
      }, duration, easing)
    } else {
      if (center) {
        this.zoomToPoint(center, clampedZoom - this.state.zoom)
      } else {
        this.stage.scale({ x: clampedZoom, y: clampedZoom })
        this.state = {
          ...this.state,
          zoom: clampedZoom
        }
        this.cameraState = {
          ...this.cameraState,
          zoom: clampedZoom
        }
      }
    }

    this.updateWorldBounds()
  }

  /**
   * Zoom to a specific point
   */
  private zoomToPoint(point: Point, zoomDelta: number): void {
    const oldScale = this.stage.scaleX()
    const newScale = Math.max(
      this.config.minZoom,
      Math.min(this.config.maxZoom, oldScale + zoomDelta)
    )

    if (newScale === oldScale) return

    const pos = this.stage.position()
    const newPos = {
      x: point.x - (point.x - pos.x) * (newScale / oldScale),
      y: point.y - (point.y - pos.y) * (newScale / oldScale)
    }

    this.stage.scale({ x: newScale, y: newScale })
    this.stage.position(newPos)

    this.state = {
      ...this.state,
      zoom: newScale,
      position: newPos
    }
    this.cameraState = {
      ...this.cameraState,
      zoom: newScale,
      position: newPos
    }

    this.updateWorldBounds()
  }

  /**
   * Set viewport pan position
   */
  setPan(
    position: Point,
    animate = false,
    duration = this.config.transitionDuration,
    easing: CameraEasing = 'ease-out'
  ): void {
    const constrainedPosition = this.config.constrainPanning
      ? this.constrainPanPosition(position)
      : position

    if (animate && this.config.smoothTransitions) {
      this.animateCamera({
        position: constrainedPosition,
        zoom: this.state.zoom,
        rotation: this.state.rotation ?? 0,
        timestamp: performance.now()
      }, duration, easing)
    } else {
      this.stage.position(constrainedPosition)
      this.state = {
        ...this.state,
        position: constrainedPosition
      }
      this.cameraState = {
        ...this.cameraState,
        position: constrainedPosition ?? { x: 0, y: 0 }
      }
    }

    this.updateWorldBounds()
  }

  /**
   * Set viewport rotation
   */
  setRotation(
    rotation: number,
    animate = false,
    duration = this.config.transitionDuration,
    easing: CameraEasing = 'ease-out'
  ): void {
    const normalizedRotation = ((rotation % 360) + 360) % 360

    if (animate && this.config.smoothTransitions) {
      this.animateCamera({
        rotation: normalizedRotation,
        position: this.state.position ?? { x: 0, y: 0 },
        zoom: this.state.zoom ?? 1,
        timestamp: performance.now()
      }, duration, easing)
    } else {
      this.stage.rotation(normalizedRotation)
      this.state = {
        ...this.state,
        rotation: normalizedRotation
      }
      this.cameraState = {
        ...this.cameraState,
        rotation: normalizedRotation
      }
    }
  }

  /**
   * Fit viewport to bounds
   */
  fitToBounds(bounds: Rectangle, options: Partial<ViewportFitOptions> = {}): void {
    const {
      padding = 50,
      animate = true,
      duration = this.config.transitionDuration,
      easing = 'ease-out'
    } = options

    // maintainAspectRatio is implicitly true in the scale calculation below

    const stageSize = this.stage.size()
    const availableWidth = stageSize.width - padding * 2
    const availableHeight = stageSize.height - padding * 2

    let scale = Math.min(
      availableWidth / bounds.width,
      availableHeight / bounds.height
    )

    // Don't zoom in beyond 100% unless explicitly allowed
    scale = Math.min(scale, 1)
    scale = Math.max(scale, this.config.minZoom)

    const centerX = bounds.x + bounds.width / 2
    const centerY = bounds.y + bounds.height / 2

    const x = stageSize.width / 2 - centerX * scale
    const y = stageSize.height / 2 - centerY * scale

    if (animate && this.config.smoothTransitions) {
      this.animateCamera({
        position: { x, y },
        zoom: scale,
        rotation: this.state.rotation ?? 0,
        timestamp: performance.now()
      }, duration, easing)
    } else {
      this.stage.scale({ x: scale, y: scale })
      this.stage.position({ x, y })
      this.updateStateFromStage()
    }
  }

  /**
   * Reset viewport to default state
   */
  reset(animate = true): void {
    const defaultState = {
      position: { x: 0, y: 0 },
      zoom: 1,
      rotation: 0,
      timestamp: performance.now()
    }

    if (animate && this.config.smoothTransitions) {
      this.animateCamera(defaultState, this.config.transitionDuration, 'ease-out')
    } else {
      this.stage.scale({ x: 1, y: 1 })
      this.stage.position({ x: 0, y: 0 })
      this.stage.rotation(0)
      this.updateStateFromStage()
    }
  }

  /**
   * Convert coordinates between different coordinate spaces
   */
  convertCoordinates(point: Point, fromSpace: CoordinateSpace, toSpace: CoordinateSpace): CoordinateConversion {
    let result: Point = { ...point }

    // Convert from source space to world coordinates first
    switch (fromSpace) {
      case 'screen':
        result = this.screenToWorld(point)
        break
      case 'stage':
        result = this.stageToWorld(point)
        break
      case 'world':
        // Already in world coordinates
        break
      case 'local':
        // Assume local = world for now
        break
    }

    // Convert from world coordinates to target space
    switch (toSpace) {
      case 'screen':
        result = this.worldToScreen(result)
        break
      case 'stage':
        result = this.worldToStage(result)
        break
      case 'world':
        // Already in world coordinates
        break
      case 'local':
        // Assume local = world for now
        break
    }

    return {
      source: point,
      target: result,
      sourceSpace: fromSpace,
      targetSpace: toSpace,
      isValid: true
    }
  }

  /**
   * Convert screen coordinates to world coordinates
   */
  private screenToWorld(point: Point): Point {
    const transform = this.stage.getAbsoluteTransform().copy().invert()
    return transform.point(point)
  }

  /**
   * Convert world coordinates to screen coordinates
   */
  private worldToScreen(point: Point): Point {
    const transform = this.stage.getAbsoluteTransform()
    return transform.point(point)
  }

  /**
   * Convert stage coordinates to world coordinates
   */
  private stageToWorld(point: Point): Point {
    const pos = this.stage.position()
    const scale = this.stage.scaleX()
    return {
      x: (point.x - pos.x) / scale,
      y: (point.y - pos.y) / scale
    }
  }

  /**
   * Convert world coordinates to stage coordinates
   */
  private worldToStage(point: Point): Point {
    const pos = this.stage.position()
    const scale = this.stage.scaleX()
    return {
      x: point.x * scale + pos.x,
      y: point.y * scale + pos.y
    }
  }

  /**
   * Animate camera to target state
   */
  private animateCamera(
    target: CameraKeyframe,
    duration: number,
    easing: CameraEasing
  ): void {
    if (this.activeAnimation) {
      this.stopAnimation()
    }

    const startState: CameraKeyframe = {
      position: { ...this.cameraState.position },
      zoom: this.cameraState.zoom,
      rotation: this.cameraState.rotation,
      timestamp: performance.now()
    }

    this.activeAnimation = {
      id: `anim-${Date.now()}`,
      fromState: startState,
      toState: target,
      duration,
      easing,
      startTime: performance.now()
    }

    // Use object spread to update readonly properties
    Object.assign(this.cameraState, {
      isAnimating: true,
      animationId: this.activeAnimation.id
    })
    Object.assign(this.state, {
      isTransitioning: true,
      transitionId: this.activeAnimation.id
    })

    this.animateFrame()
  }

  /**
   * Animation frame function
   */
  private animateFrame = (): void => {
    if (!this.activeAnimation) return

    const now = performance.now()
    const elapsed = now - this.activeAnimation.startTime
    const progress = Math.min(elapsed / this.activeAnimation.duration, 1)

    const easedProgress = this.applyEasing(progress, this.activeAnimation.easing)

    // Interpolate between start and end states
    const current = this.interpolateState(
      this.activeAnimation.fromState,
      this.activeAnimation.toState,
      easedProgress
    )

    // Apply to stage
    this.stage.scale({ x: current.zoom, y: current.zoom })
    this.stage.position(current.position)
    this.stage.rotation(current.rotation)

    // Update state
    this.state = {
      ...this.state,
      zoom: current.zoom,
      position: current.position,
      rotation: current.rotation
    }
    this.cameraState = {
      ...this.cameraState,
      zoom: current.zoom,
      position: current.position,
      rotation: current.rotation
    }

    if (progress >= 1) {
      this.stopAnimation()
      if (this.activeAnimation?.onComplete) {
        this.activeAnimation.onComplete()
      }
    } else {
      this.animationFrame = requestAnimationFrame(this.animateFrame)
    }

    this.updateWorldBounds()
  }

  /**
   * Stop current animation
   */
  private stopAnimation(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = null
    }

    this.activeAnimation = null
    this.cameraState = {
      ...this.cameraState,
      isAnimating: false,
      animationId: null
    }
    this.state = {
      ...this.state,
      isTransitioning: false,
      transitionId: null
    }
  }

  /**
   * Apply easing function to progress
   */
  private applyEasing(t: number, easing: CameraEasing): number {
    switch (easing) {
      case 'linear':
        return t
      case 'ease':
        return t * t * (3 - 2 * t)
      case 'ease-in':
        return t * t
      case 'ease-out':
        return 1 - (1 - t) * (1 - t)
      case 'ease-in-out':
        return t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t)
      case 'bounce':
        if (t < 1 / 2.75) {
          return 7.5625 * t * t
        } else if (t < 2 / 2.75) {
          return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75
        } else if (t < 2.5 / 2.75) {
          return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375
        } else {
          return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375
        }
      case 'elastic':
        if (t === 0 || t === 1) return t
        return -(Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI))
      default:
        return t
    }
  }

  /**
   * Interpolate between two camera states
   */
  private interpolateState(
    from: CameraKeyframe,
    to: CameraKeyframe,
    t: number
  ): CameraKeyframe {
    return {
      position: {
        x: from.position.x + (to.position.x - from.position.x) * t,
        y: from.position.y + (to.position.y - from.position.y) * t
      },
      zoom: from.zoom + (to.zoom - from.zoom) * t,
      rotation: from.rotation + (to.rotation - from.rotation) * t,
      timestamp: performance.now()
    }
  }

  /**
   * Update state from current stage transform
   */
  private updateStateFromStage(): void {
    const pos = this.stage.position()
    const scale = this.stage.scaleX()
    const rotation = this.stage.rotation()

    this.state = {
      ...this.state,
      position: pos,
      zoom: scale,
      rotation: rotation
    }
    this.cameraState = {
      ...this.cameraState,
      position: pos,
      zoom: scale,
      rotation: rotation
    }

    this.updateWorldBounds()
  }

  /**
   * Update world bounds based on current viewport
   */
  private updateWorldBounds(): void {
    const stageSize = this.stage.size()
    const pos = this.stage.position()
    const scale = this.stage.scaleX()

    this.state = {
      ...this.state,
      worldBounds: {
        x: -pos.x / scale,
        y: -pos.y / scale,
        width: stageSize.width / scale,
        height: stageSize.height / scale
      }
    }
  }

  /**
   * Constrain pan position to bounds
   */
  private constrainPanPosition(position: Point): Point {
    // Implementation depends on specific constraints
    // For now, return position unchanged
    return position
  }

  /**
   * Get current viewport state
   */
  getState(): ViewportState {
    return { ...this.state }
  }

  /**
   * Get current camera state
   */
  getCameraState(): CameraState {
    return { ...this.cameraState }
  }

  /**
   * Get viewport configuration
   */
  getConfig(): ViewportConfig {
    return { ...this.config }
  }

  /**
   * Update viewport configuration
   */
  updateConfig(config: Partial<ViewportConfig>): void {
    Object.assign(this.config, config)
  }

  /**
   * Destroy viewport manager
   */
  destroy(): void {
    this.stopAnimation()
    // Remove event listeners would go here if we stored references
  }
}