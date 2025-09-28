import type { Screenshot } from './CanvasCapture'
import type { VisualAssertions, VisualElement } from './VisualAssertions'
import type { TestResult } from './TestRunner'

export interface BugReport {
  id: string
  type: BugType
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  location?: { x: number; y: number }
  screenshot?: Screenshot
  context: any
  timestamp: number
}

export type BugType =
  | 'rendering-artifact'
  | 'missing-element'
  | 'incorrect-position'
  | 'animation-glitch'
  | 'overlap-error'
  | 'color-mismatch'
  | 'size-incorrect'
  | 'state-inconsistency'
  | 'performance-issue'
  | 'interaction-failure'

export class BugDetector {
  private assertions: VisualAssertions
  private bugs: BugReport[] = []

  constructor(assertions: VisualAssertions) {
    this.assertions = assertions
  }

  async detectBugs(testResult: TestResult): Promise<BugReport[]> {
    const detectedBugs: BugReport[] = []

    // Check for step failures
    for (const step of testResult.steps) {
      if (!step.success && step.error) {
        detectedBugs.push({
          id: `bug-${Date.now()}-${Math.random()}`,
          type: 'state-inconsistency',
          severity: 'high',
          description: `Test step failed: ${step.description}. Error: ${step.error}`,
          screenshot: step.screenshot,
          context: { step },
          timestamp: Date.now()
        })
      }
    }

    // Analyze screenshots for visual bugs
    for (const screenshot of testResult.screenshots) {
      const visualBugs = await this.analyzeScreenshot(screenshot)
      detectedBugs.push(...visualBugs)
    }

    // Check for state inconsistencies
    if (testResult.startState && testResult.endState) {
      const stateBugs = this.analyzeStateTransition(testResult.startState, testResult.endState)
      detectedBugs.push(...stateBugs)
    }

    this.bugs = detectedBugs
    return detectedBugs
  }

  private async analyzeScreenshot(screenshot: Screenshot): Promise<BugReport[]> {
    const bugs: BugReport[] = []

    // Check for common rendering issues
    const renderingIssues = this.detectRenderingArtifacts(screenshot)
    bugs.push(...renderingIssues)

    // Check for missing elements based on metadata
    if (screenshot.metadata?.mapState) {
      const missingElements = this.detectMissingElements(screenshot)
      bugs.push(...missingElements)
    }

    return bugs
  }

  private detectRenderingArtifacts(screenshot: Screenshot): BugReport[] {
    const bugs: BugReport[] = []

    // Check for black/empty screenshots
    if (this.isScreenshotEmpty(screenshot)) {
      bugs.push({
        id: `bug-render-${Date.now()}`,
        type: 'rendering-artifact',
        severity: 'critical',
        description: 'Screenshot appears to be empty or black',
        screenshot,
        context: { dataUrl: screenshot.dataUrl.substring(0, 100) },
        timestamp: Date.now()
      })
    }

    // Check for partial rendering (would need pixel analysis)
    // In a real implementation, this would analyze pixel data

    return bugs
  }

  private detectMissingElements(screenshot: Screenshot): BugReport[] {
    const bugs: BugReport[] = []
    const mapState = screenshot.metadata?.mapState

    if (!mapState) return bugs

    // Check if all expected tokens are visible
    const expectedTokens = mapState.objects.filter(obj => obj.type === 'token')

    for (const token of expectedTokens) {
      if (!this.assertions.assertElementVisible(token.id)) {
        bugs.push({
          id: `bug-missing-${token.id}`,
          type: 'missing-element',
          severity: 'high',
          description: `Token "${token.name || token.id}" is not visible but should be`,
          location: token.position,
          screenshot,
          context: { token },
          timestamp: Date.now()
        })
      }
    }

    return bugs
  }

  private analyzeStateTransition(startState: any, endState: any): BugReport[] {
    const bugs: BugReport[] = []

    // Check for unexpected object disappearance
    const startObjects = new Set(startState.map.objects.map((o: any) => o.id))
    const endObjects = new Set(endState.map.objects.map((o: any) => o.id))

    for (const id of startObjects) {
      if (!endObjects.has(id)) {
        // Check if this was expected (like spell completion)
        const obj = startState.map.objects.find((o: any) => o.id === id)
        if (obj.type === 'token') {
          bugs.push({
            id: `bug-disappear-${id}`,
            type: 'missing-element',
            severity: 'high',
            description: `Token unexpectedly disappeared: ${obj.name || id}`,
            location: obj.position,
            context: { object: obj },
            timestamp: Date.now()
          })
        }
      }
    }

    // Check for position inconsistencies
    for (const endObj of endState.map.objects) {
      const startObj = startState.map.objects.find((o: any) => o.id === endObj.id)
      if (startObj && startObj.type === 'token') {
        // Check if position changed unexpectedly
        if (this.hasUnexpectedPositionChange(startObj, endObj)) {
          bugs.push({
            id: `bug-position-${endObj.id}`,
            type: 'incorrect-position',
            severity: 'medium',
            description: `Token position changed unexpectedly`,
            location: endObj.position,
            context: {
              startPosition: startObj.position,
              endPosition: endObj.position
            },
            timestamp: Date.now()
          })
        }
      }
    }

    return bugs
  }

  // Check for animation-related bugs
  async detectAnimationBugs(elementId: string, expectedDuration: number): Promise<BugReport[]> {
    const bugs: BugReport[] = []
    const startTime = Date.now()

    // Monitor animation progress
    const checkInterval = 100 // ms
    const maxChecks = Math.ceil(expectedDuration / checkInterval) + 5

    let lastProgress = 0
    let stuckCount = 0

    for (let i = 0; i < maxChecks; i++) {
      await new Promise(resolve => setTimeout(resolve, checkInterval))

      const progress = await this.assertions.getAnimationProgress(elementId)

      // Check if animation is stuck
      if (progress === lastProgress) {
        stuckCount++
        if (stuckCount > 3) {
          bugs.push({
            id: `bug-anim-stuck-${elementId}`,
            type: 'animation-glitch',
            severity: 'high',
            description: `Animation appears to be stuck for element ${elementId}`,
            context: { elementId, progress, duration: Date.now() - startTime },
            timestamp: Date.now()
          })
          break
        }
      } else {
        stuckCount = 0
      }

      lastProgress = progress

      // Check if animation completed
      if (progress >= 1) break
    }

    // Check if animation took too long
    const actualDuration = Date.now() - startTime
    if (actualDuration > expectedDuration * 1.5) {
      bugs.push({
        id: `bug-anim-slow-${elementId}`,
        type: 'performance-issue',
        severity: 'medium',
        description: `Animation took ${actualDuration}ms, expected ~${expectedDuration}ms`,
        context: { elementId, actualDuration, expectedDuration },
        timestamp: Date.now()
      })
    }

    return bugs
  }

  // Check for overlapping elements that shouldn't overlap
  detectOverlapBugs(elements: VisualElement[]): BugReport[] {
    const bugs: BugReport[] = []

    for (let i = 0; i < elements.length; i++) {
      for (let j = i + 1; j < elements.length; j++) {
        const elem1 = elements[i]
        const elem2 = elements[j]

        // Tokens shouldn't overlap (except during animation)
        if (elem1.type === 'token' && elem2.type === 'token') {
          if (this.elementsOverlap(elem1, elem2)) {
            bugs.push({
              id: `bug-overlap-${elem1.id}-${elem2.id}`,
              type: 'overlap-error',
              severity: 'medium',
              description: `Tokens are overlapping: ${elem1.id} and ${elem2.id}`,
              location: elem1.position,
              context: { element1: elem1, element2: elem2 },
              timestamp: Date.now()
            })
          }
        }
      }
    }

    return bugs
  }

  // Helper methods
  private isScreenshotEmpty(screenshot: Screenshot): boolean {
    // Check if data URL suggests empty/black image
    // This is simplified - real implementation would analyze pixel data
    return screenshot.dataUrl.length < 1000 // Very short data URL suggests empty image
  }

  private hasUnexpectedPositionChange(startObj: any, endObj: any): boolean {
    // Allow small position changes due to grid snapping
    const tolerance = 5
    const dx = Math.abs(startObj.position.x - endObj.position.x)
    const dy = Math.abs(startObj.position.y - endObj.position.y)

    // If position changed significantly without being part of a movement event
    return dx > tolerance || dy > tolerance
  }

  private elementsOverlap(elem1: VisualElement, elem2: VisualElement): boolean {
    const rect1 = {
      x: elem1.position.x - elem1.bounds.width / 2,
      y: elem1.position.y - elem1.bounds.height / 2,
      width: elem1.bounds.width,
      height: elem1.bounds.height
    }

    const rect2 = {
      x: elem2.position.x - elem2.bounds.width / 2,
      y: elem2.position.y - elem2.bounds.height / 2,
      width: elem2.bounds.width,
      height: elem2.bounds.height
    }

    return !(
      rect1.x + rect1.width < rect2.x ||
      rect2.x + rect2.width < rect1.x ||
      rect1.y + rect1.height < rect2.y ||
      rect2.y + rect2.height < rect1.y
    )
  }

  // Performance monitoring
  detectPerformanceIssues(frameRates: number[]): BugReport[] {
    const bugs: BugReport[] = []

    const avgFrameRate = frameRates.reduce((a, b) => a + b, 0) / frameRates.length
    const minFrameRate = Math.min(...frameRates)

    if (avgFrameRate < 30) {
      bugs.push({
        id: `bug-perf-fps-${Date.now()}`,
        type: 'performance-issue',
        severity: avgFrameRate < 15 ? 'critical' : 'high',
        description: `Low average frame rate: ${avgFrameRate.toFixed(1)} FPS`,
        context: { avgFrameRate, minFrameRate, samples: frameRates.length },
        timestamp: Date.now()
      })
    }

    if (minFrameRate < 10) {
      bugs.push({
        id: `bug-perf-stutter-${Date.now()}`,
        type: 'performance-issue',
        severity: 'high',
        description: `Severe frame drops detected: ${minFrameRate} FPS minimum`,
        context: { minFrameRate, frameRates },
        timestamp: Date.now()
      })
    }

    return bugs
  }

  getBugs(): BugReport[] {
    return this.bugs
  }

  getBugsBySeverity(severity: BugReport['severity']): BugReport[] {
    return this.bugs.filter(bug => bug.severity === severity)
  }

  getBugsByType(type: BugType): BugReport[] {
    return this.bugs.filter(bug => bug.type === type)
  }

  clearBugs(): void {
    this.bugs = []
  }
}