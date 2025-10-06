import Konva from 'konva'
import type { Position } from '@/types/map'
import type { Screenshot } from './CanvasCapture'

export interface VisualElement {
  type: 'token' | 'spell' | 'area' | 'shape' | 'text'
  id?: string
  position: Position
  bounds: { width: number; height: number }
  visible: boolean
  color?: string
}

export interface AnimationState {
  element: VisualElement
  progress: number // 0 to 1
  isAnimating: boolean
  startPosition?: Position
  endPosition?: Position
}

export class VisualAssertions {
  private stage: Konva.Stage | null = null
  private tolerance = 5 // pixels

  setStage(stage: Konva.Stage) {
    this.stage = stage
  }

  setTolerance(pixels: number) {
    this.tolerance = pixels
  }

  // Check if element exists at position
  async assertElementAt(position: Position, type?: string): Promise<boolean> {
    if (!this.stage) return false

    const shapes = this.stage.find('Shape')

    for (const shape of shapes) {
      const pos = shape.getAbsolutePosition()
      const distance = Math.sqrt(
        Math.pow(pos.x - position.x, 2) +
        Math.pow(pos.y - position.y, 2)
      )

      if (distance <= this.tolerance) {
        if (!type || shape.getClassName() === type) {
          return true
        }
      }
    }

    return false
  }

  // Check if element is visible
  assertElementVisible(elementId: string): boolean {
    if (!this.stage) return false

    const element = this.stage.findOne(`#${elementId}`)
    if (!element) return false

    return element.visible() && element.opacity() > 0
  }

  // Check element position
  assertElementPosition(elementId: string, expectedPosition: Position): boolean {
    if (!this.stage) return false

    const element = this.stage.findOne(`#${elementId}`)
    if (!element) return false

    const pos = element.getAbsolutePosition()
    const distance = Math.sqrt(
      Math.pow(pos.x - expectedPosition.x, 2) +
      Math.pow(pos.y - expectedPosition.y, 2)
    )

    return distance <= this.tolerance
  }

  // Check if animation is running
  assertAnimationActive(elementId: string): boolean {
    if (!this.stage) return false

    const element = this.stage.findOne(`#${elementId}`)
    if (!element) return false

    // Check if element has active tweens or animations
    const layer = element.getLayer()
    if (!layer) return false

    // Konva doesn't expose animation state directly, so we check for changes
    const initialPos = element.position()

    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        const newPos = element.position()
        const moved = initialPos.x !== newPos.x || initialPos.y !== newPos.y
        resolve(moved)
      }, 100)
    }) as any
  }

  // Check element color/fill
  assertElementColor(elementId: string, expectedColor: string): boolean {
    if (!this.stage) return false

    const element = this.stage.findOne(`#${elementId}`) as Konva.Shape
    if (!element) return false

    const fill = element.fill()
    return fill === expectedColor
  }

  // Check element size
  assertElementSize(elementId: string, expectedSize: { width: number; height: number }): boolean {
    if (!this.stage) return false

    const element = this.stage.findOne(`#${elementId}`)
    if (!element) return false

    const size = element.getClientRect()
    const widthMatch = Math.abs(size.width - expectedSize.width) <= this.tolerance
    const heightMatch = Math.abs(size.height - expectedSize.height) <= this.tolerance

    return widthMatch && heightMatch
  }

  // Check if area contains elements
  assertAreaContains(area: { x: number; y: number; width: number; height: number }, minElements: number = 1): boolean {
    if (!this.stage) return false

    const shapes = this.stage.find('Shape')
    let count = 0

    for (const shape of shapes) {
      const pos = shape.getAbsolutePosition()
      if (
        pos.x >= area.x &&
        pos.x <= area.x + area.width &&
        pos.y >= area.y &&
        pos.y <= area.y + area.height
      ) {
        count++
      }
    }

    return count >= minElements
  }

  // Check if elements overlap
  assertElementsOverlap(elementId1: string, elementId2: string): boolean {
    if (!this.stage) return false

    const elem1 = this.stage.findOne(`#${elementId1}`)
    const elem2 = this.stage.findOne(`#${elementId2}`)

    if (!elem1 || !elem2) return false

    const rect1 = elem1.getClientRect()
    const rect2 = elem2.getClientRect()

    return !(
      rect1.x + rect1.width < rect2.x ||
      rect2.x + rect2.width < rect1.x ||
      rect1.y + rect1.height < rect2.y ||
      rect2.y + rect2.height < rect1.y
    )
  }

  // Check selection state (visual feedback)
  assertElementSelected(elementId: string): boolean {
    if (!this.stage) return false

    const element = this.stage.findOne(`#${elementId}`) as Konva.Shape
    if (!element) return false

    // Check for selection indicators (stroke, transformer, etc)
    const hasStroke = element.stroke() !== null && element.strokeWidth() > 0
    const transformer = this.stage.findOne('Transformer')
    const isAttached = transformer ? (transformer as any).nodes && (transformer as any).nodes().includes(element) : false

    return hasStroke || isAttached
  }

  // Count visible elements of type
  countVisibleElements(type: string): number {
    if (!this.stage) return 0

    const elements = this.stage.find(`.${type}`)
    return elements.filter(el => el.visible() && el.opacity() > 0).length
  }

  // Get all elements in region
  getElementsInRegion(region: { x: number; y: number; width: number; height: number }): VisualElement[] {
    if (!this.stage) return []

    const shapes = this.stage.find('Shape')
    const elements: VisualElement[] = []

    for (const shape of shapes) {
      const pos = shape.getAbsolutePosition()
      const rect = shape.getClientRect()

      if (
        pos.x >= region.x &&
        pos.x <= region.x + region.width &&
        pos.y >= region.y &&
        pos.y <= region.y + region.height
      ) {
        elements.push({
          type: this.getElementType(shape),
          id: shape.id(),
          position: pos,
          bounds: { width: rect.width, height: rect.height },
          visible: shape.visible(),
          color: (shape as Konva.Shape).fill() as string
        })
      }
    }

    return elements
  }

  // Helper to determine element type
  private getElementType(shape: Konva.Node): VisualElement['type'] {
    const className = shape.getClassName()
    const id = shape.id() || ''

    if (id.includes('token')) return 'token'
    if (id.includes('spell')) return 'spell'
    if (className === 'Circle' || className === 'Rect') return 'area'
    if (className === 'Text') return 'text'

    return 'shape'
  }

  // Compare screenshots for visual regression
  async compareScreenshots(before: Screenshot, after: Screenshot): Promise<{
    match: boolean
    difference: number
    areas?: { x: number; y: number; width: number; height: number }[]
  }> {
    // For a real implementation, you would use a library like pixelmatch or resemble.js
    // This is a simplified version that just checks if they're identical
    const match = before.dataUrl === after.dataUrl

    return {
      match,
      difference: match ? 0 : 1,
      areas: match ? [] : [{ x: 0, y: 0, width: before.width, height: before.height }]
    }
  }

  // Check animation progress
  async getAnimationProgress(elementId: string): Promise<number> {
    if (!this.stage) return 0

    const element = this.stage.findOne(`#${elementId}`)
    if (!element) return 0

    // This would need access to the animation system
    // For now, return a placeholder
    return 0.5
  }

  // Validate spell effect rendering
  assertSpellEffect(expectedState: {
    visible?: boolean
    position?: Position
    size?: number
    color?: string
  }): boolean {
    if (!this.stage) return false

    const spells = this.stage.find('.spell')

    for (const spell of spells) {
      // Check spell properties
      if (expectedState.visible !== undefined && spell.visible() !== expectedState.visible) {
        continue
      }

      if (expectedState.position) {
        const pos = spell.getAbsolutePosition()
        const distance = Math.sqrt(
          Math.pow(pos.x - expectedState.position.x, 2) +
          Math.pow(pos.y - expectedState.position.y, 2)
        )
        if (distance > this.tolerance) continue
      }

      if (expectedState.color) {
        const shape = spell as Konva.Shape
        if (shape.fill() !== expectedState.color) continue
      }

      return true
    }

    return false
  }

  // ============================================================================
  // STATUS EFFECT ASSERTIONS
  // ============================================================================

  /**
   * Check if a token has a specific status effect overlay rendered
   * @param tokenId The token's ID
   * @param effectType The status effect type to check for (e.g., 'flaming', 'stunned')
   * @returns True if the effect overlay is found and visible
   */
  assertTokenHasStatusEffect(tokenId: string, effectType: string): boolean {
    if (!this.stage) return false

    // Find status effect overlay group for this token
    const effectGroup = this.stage.findOne(`#status-effect-${tokenId}-${effectType}`)
    if (!effectGroup) return false

    // Verify the effect is visible and has opacity > 0
    return effectGroup.visible() && effectGroup.opacity() > 0
  }

  /**
   * Count the number of active status effect overlays on a token
   * @param tokenId The token's ID
   * @returns The number of visible status effect overlays
   */
  countTokenStatusEffects(tokenId: string): number {
    if (!this.stage) return 0

    // Find all status effect overlays for this token
    const effectGroups = this.stage.find((node: Konva.Node) => {
      const nodeId = node.id()
      return nodeId && nodeId.startsWith(`status-effect-${tokenId}-`) && node.visible() && node.opacity() > 0
    })

    return effectGroups.length
  }

  /**
   * Verify that a token has the expected set of status effects rendered
   * @param tokenId The token's ID
   * @param expectedEffects Array of effect types that should be present
   * @returns True if all expected effects are found (order doesn't matter)
   */
  assertStatusEffectRendering(tokenId: string, expectedEffects: string[]): boolean {
    if (!this.stage) return false

    // Check each expected effect
    for (const effectType of expectedEffects) {
      if (!this.assertTokenHasStatusEffect(tokenId, effectType)) {
        return false
      }
    }

    // Verify count matches (no extra effects)
    const actualCount = this.countTokenStatusEffects(tokenId)
    return actualCount === expectedEffects.length
  }

  /**
   * Check if a status effect overlay is animating
   * @param tokenId The token's ID
   * @param effectType The status effect type
   * @returns True if the effect appears to be animating (has animation-related attributes)
   */
  assertStatusEffectAnimating(tokenId: string, effectType: string): boolean {
    if (!this.stage) return false

    const effectGroup = this.stage.findOne(`#status-effect-${tokenId}-${effectType}`)
    if (!effectGroup) return false

    // Check if the effect group has children (particles, pulses, etc.)
    const children = (effectGroup as Konva.Group).getChildren()
    if (children.length === 0) return false

    // Check if any child elements have opacity or scale that suggests animation
    for (const child of children) {
      const opacity = child.opacity()
      const scale = child.scaleX()

      // Animation typically involves varying opacity or scale
      if (opacity > 0 && opacity < 1) return true
      if (scale !== 1) return true
    }

    return false
  }

  /**
   * Verify status effect visual properties match expected values
   * @param tokenId The token's ID
   * @param effectType The status effect type
   * @param expectedProps Expected visual properties
   * @returns True if properties match within tolerance
   */
  assertStatusEffectProperties(
    tokenId: string,
    effectType: string,
    expectedProps: {
      opacity?: number
      visible?: boolean
      hasParticles?: boolean
      particleCount?: number
    }
  ): boolean {
    if (!this.stage) return false

    const effectGroup = this.stage.findOne(`#status-effect-${tokenId}-${effectType}`)
    if (!effectGroup) return false

    // Check visibility
    if (expectedProps.visible !== undefined && effectGroup.visible() !== expectedProps.visible) {
      return false
    }

    // Check opacity (with tolerance)
    if (expectedProps.opacity !== undefined) {
      const actualOpacity = effectGroup.opacity()
      const opacityTolerance = 0.1
      if (Math.abs(actualOpacity - expectedProps.opacity) > opacityTolerance) {
        return false
      }
    }

    // Check for particles
    if (expectedProps.hasParticles !== undefined) {
      const children = (effectGroup as Konva.Group).getChildren()
      const hasParticles = children.length > 1 // More than just base overlay
      if (hasParticles !== expectedProps.hasParticles) {
        return false
      }
    }

    // Check particle count
    if (expectedProps.particleCount !== undefined) {
      const children = (effectGroup as Konva.Group).getChildren()
      // Subtract 1 for base overlay, rest are particles
      const particleCount = Math.max(0, children.length - 1)
      if (particleCount !== expectedProps.particleCount) {
        return false
      }
    }

    return true
  }

  /**
   * Get all status effects currently rendered on a token
   * @param tokenId The token's ID
   * @returns Array of effect types found
   */
  getTokenStatusEffects(tokenId: string): string[] {
    if (!this.stage) return []

    const effects: string[] = []
    const effectGroups = this.stage.find((node: Konva.Node) => {
      const nodeId = node.id()
      return nodeId && nodeId.startsWith(`status-effect-${tokenId}-`)
    })

    for (const group of effectGroups) {
      const nodeId = group.id()
      if (nodeId && group.visible()) {
        // Extract effect type from ID: "status-effect-{tokenId}-{effectType}"
        const parts = nodeId.split('-')
        if (parts.length >= 3) {
          const effectType = parts.slice(3).join('-') // Handle effect types with hyphens
          effects.push(effectType)
        }
      }
    }

    return effects
  }
}