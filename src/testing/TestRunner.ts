import type { TestScenario, TestStep, TestAction, TestAssertion } from './TestScenarios'
import type { CanvasCapture, Screenshot, StateSnapshot } from './CanvasCapture'
import useMapStore from '@/store/mapStore'
import useTimelineStore from '@/store/timelineStore'
import useToolStore from '@/store/toolStore'
import type { Token } from '@/types/token'
import type { SpellEventData } from '@/types/timeline'
import { nanoid } from 'nanoid'

export interface TestResult {
  scenarioId: string
  scenarioName: string
  success: boolean
  duration: number
  steps: StepResult[]
  screenshots: Screenshot[]
  errors: string[]
  startState?: StateSnapshot
  endState?: StateSnapshot
}

export interface StepResult {
  stepIndex: number
  description: string
  success: boolean
  error?: string
  screenshot?: Screenshot
  duration: number
}

export class TestRunner {
  private canvasCapture: CanvasCapture
  private results: TestResult[] = []
  private currentResult: TestResult | null = null

  constructor(canvasCapture: CanvasCapture) {
    this.canvasCapture = canvasCapture
  }

  async runScenario(scenario: TestScenario): Promise<TestResult> {
    console.log(`🧪 Running test: ${scenario.name}`)

    const startTime = Date.now()
    const screenshots: Screenshot[] = []
    const stepResults: StepResult[] = []
    const errors: string[] = []

    // ✅ CLEANUP: Clear battlefield before running test
    const mapStore = useMapStore.getState()
    const roundStore = useTimelineStore.getState()
    const toolStore = useToolStore.getState()

    // Clear all objects from map (keeps void-token)
    mapStore.clearMapObjects()

    // Clear selection
    mapStore.clearSelection()

    // End any active combat
    if (roundStore.isInCombat) {
      roundStore.endCombat()
    }

    // Clear timeline
    roundStore.clearTimeline()

    // Reset tool to select mode
    toolStore.setTool('select')

    // Wait for cleanup to complete
    await this.wait(100)

    console.log('🧹 Battlefield cleaned before test')

    // Capture initial state
    const startState = this.canvasCapture.captureState(
      mapStore.currentMap!,
      roundStore.timeline || undefined,
      mapStore.selectedObjects,
      toolStore.currentTool
    )

    this.currentResult = {
      scenarioId: scenario.id,
      scenarioName: scenario.name,
      success: true,
      duration: 0,
      steps: stepResults,
      screenshots,
      errors,
      startState
    }

    // Execute each step
    for (let i = 0; i < scenario.steps.length; i++) {
      const step = scenario.steps[i]
      const stepResult = await this.executeStep(step, i)
      stepResults.push(stepResult)

      if (stepResult.screenshot) {
        screenshots.push(stepResult.screenshot)
      }

      if (!stepResult.success) {
        this.currentResult.success = false
        if (stepResult.error) {
          errors.push(`Step ${i + 1}: ${stepResult.error}`)
        }
      }
    }

    // Capture final state
    const endState = this.canvasCapture.captureState(
      mapStore.currentMap!,
      roundStore.timeline || undefined,
      mapStore.selectedObjects,
      useToolStore.getState().currentTool
    )

    // Cleanup if provided
    if (scenario.cleanup) {
      scenario.cleanup()
    }

    this.currentResult.duration = Date.now() - startTime
    this.currentResult.endState = endState

    this.results.push(this.currentResult)
    console.log(`✅ Test completed in ${this.currentResult.duration}ms`)

    return this.currentResult
  }

  private async executeStep(step: TestStep, index: number): Promise<StepResult> {
    console.log(`  Step ${index + 1}: ${step.description}`)
    const startTime = Date.now()
    let success = true
    let error: string | undefined
    let screenshot: Screenshot | undefined

    try {
      switch (step.type) {
        case 'action':
          await this.executeAction(step.action!)
          break

        case 'wait':
          await this.wait(step.wait!)
          break

        case 'assert':
          const assertResult = await this.executeAssertion(step.assert!)
          if (!assertResult.success) {
            success = false
            error = assertResult.error
          }
          break

        case 'capture':
          screenshot = await this.canvasCapture.captureScreenshot({
            testName: this.currentResult?.scenarioName,
            description: step.capture!.name
          })
          break
      }
    } catch (err) {
      success = false
      error = err instanceof Error ? err.message : 'Unknown error'
    }

    return {
      stepIndex: index,
      description: step.description,
      success,
      error,
      screenshot,
      duration: Date.now() - startTime
    }
  }

  private async executeAction(action: TestAction): Promise<void> {
    const mapStore = useMapStore.getState()
    const roundStore = useTimelineStore.getState()
    const toolStore = useToolStore.getState()

    switch (action.type) {
      case 'addToken':
        const token: Token = {
          id: action.params.id || nanoid(),
          type: 'token',
          name: action.params.name,
          position: action.params.position,
          size: action.params.size || 'medium',
          rotation: 0,
          layer: 1,
          image: action.params.image || '',
          visible: true,
          color: action.params.color || '#3D82AB',
          opacity: 1,
          shape: 'circle'
        }
        mapStore.addObject(token)
        break

      case 'moveToken':
        // Use updateObjectPosition for direct position updates
        mapStore.updateObjectPosition(action.params.tokenId, action.params.toPosition)
        break

      case 'selectToken':
        if (action.params.addToSelection) {
          // Multi-select by adding to existing selection
          const currentSelection = mapStore.selectedObjects
          mapStore.selectMultiple([...currentSelection, action.params.tokenId])
        } else {
          mapStore.selectObject(action.params.tokenId)
        }
        break

      case 'castSpell':
        const spellEventData = action.params.spell as SpellEventData
        const spellObject: any = {
          id: nanoid(),
          type: 'spell',
          position: spellEventData.fromPosition,
          rotation: 0,
          layer: 1000,
          spellData: spellEventData
        }
        mapStore.addObject(spellObject)
        break

      case 'startCombat':
        roundStore.startCombat(mapStore.currentMap!.id)
        break

      case 'nextRound':
        await roundStore.nextEvent()
        break

      case 'selectTool':
        toolStore.setTool(action.params.tool)
        break

      case 'custom':
        // Execute custom function if provided
        if (action.params.execute && typeof action.params.execute === 'function') {
          await action.params.execute()
        }
        break
    }
  }

  private async executeAssertion(assertion: TestAssertion): Promise<{ success: boolean; error?: string }> {
    const mapStore = useMapStore.getState()
    const roundStore = useTimelineStore.getState()
    const toolStore = useToolStore.getState()

    try {
      switch (assertion.type) {
        case 'tokenPosition':
          const token = mapStore.currentMap?.objects.find(
            obj => obj.id === assertion.params.tokenId
          )
          if (!token) {
            return { success: false, error: `Token ${assertion.params.tokenId} not found` }
          }
          if (token.position.x !== assertion.expected.x || token.position.y !== assertion.expected.y) {
            return {
              success: false,
              error: `Expected position ${JSON.stringify(assertion.expected)}, got ${JSON.stringify(token.position)}`
            }
          }
          break

        case 'tokenExists':
          const exists = mapStore.currentMap?.objects.some(
            obj => obj.id === assertion.params.tokenId
          )
          if (exists !== assertion.expected) {
            return {
              success: false,
              error: `Expected token exists: ${assertion.expected}, got: ${exists}`
            }
          }
          break

        case 'spellActive':
          const spellActive = mapStore.currentMap?.objects.some(
            obj => obj.type === 'spell' && (obj as any).spellData?.spellName === assertion.params.spellName
          )
          if (spellActive !== assertion.expected) {
            return {
              success: false,
              error: `Expected spell active: ${assertion.expected}, got: ${spellActive}`
            }
          }
          break

        case 'roundNumber':
          if (roundStore.currentEvent !== assertion.expected) {
            return {
              success: false,
              error: `Expected round ${assertion.expected}, got ${roundStore.currentEvent}`
            }
          }
          break

        case 'selectionCount':
          const count = mapStore.selectedObjects.length
          if (count !== assertion.expected) {
            return {
              success: false,
              error: `Expected ${assertion.expected} selected objects, got ${count}`
            }
          }
          break

        case 'toolActive':
          if (toolStore.currentTool !== assertion.expected) {
            return {
              success: false,
              error: `Expected tool ${assertion.expected}, got ${toolStore.currentTool}`
            }
          }
          break

        case 'custom':
          // Execute custom check function if provided
          if (assertion.params.check && typeof assertion.params.check === 'function') {
            const result = await assertion.params.check()
            if (result !== assertion.expected) {
              return {
                success: false,
                error: `Custom assertion failed: expected ${assertion.expected}, got ${result}`
              }
            }
          }
          break
      }

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Assertion failed'
      }
    }
  }

  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async runAll(): Promise<TestResult[]> {
    const { testScenarios } = await import('./TestScenarios')

    for (const scenario of testScenarios) {
      await this.runScenario(scenario)
    }

    return this.results
  }

  async runCategory(category: string): Promise<TestResult[]> {
    const { getScenariosByCategory } = await import('./TestScenarios')
    const scenarios = getScenariosByCategory(category as any)

    for (const scenario of scenarios) {
      await this.runScenario(scenario)
    }

    return this.results
  }

  getResults(): TestResult[] {
    return this.results
  }

  clearResults(): void {
    this.results = []
  }

  getLastResult(): TestResult | null {
    return this.results[this.results.length - 1] || null
  }
}