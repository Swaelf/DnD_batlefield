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
        console.log(`🔄 Moving token ${action.params.tokenId} to`, action.params.toPosition)
        mapStore.updateObjectPosition(action.params.tokenId, action.params.toPosition)

        // Wait for next tick to ensure Zustand state update has propagated
        await new Promise(resolve => setTimeout(resolve, 0))

        // Verify position was updated
        const updatedToken = mapStore.currentMap?.objects.find(obj => obj.id === action.params.tokenId)
        console.log(`✓ Token position after update:`, updatedToken?.position)
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
        await roundStore.startNewRound()
        break

      case 'nextEvent':
        await roundStore.nextEvent()
        break

      case 'selectTool':
        toolStore.setTool(action.params.tool)
        break

      case 'addStaticObject':
        // Add static object (wall, tree, furniture, etc.)
        const staticObject: any = {
          id: action.params.id || nanoid(),
          type: 'shape',
          shapeType: action.params.type === 'circle' ? 'circle' : 'rectangle',
          position: action.params.position,
          rotation: 0,
          layer: 5,
          fill: action.params.color,
          fillColor: action.params.color,
          stroke: action.params.color,
          strokeColor: action.params.color,
          strokeWidth: 2,
          opacity: 1,
          name: action.params.name,
          // Circle properties
          radius: action.params.radius,
          // Rectangle properties
          width: action.params.width,
          height: action.params.height,
          metadata: {
            isStatic: true
          }
        }
        mapStore.addObject(staticObject)
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
          console.log(`🔍 Checking position for ${assertion.params.tokenId}: expected`, assertion.expected, 'got', token.position)
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
          // Check both 'spell' type (during animation) and 'persistent-area' type (after animation)
          const spellActive = mapStore.currentMap?.objects.some(obj => {
            // Check spell objects (during animation)
            if (obj.type === 'spell' && (obj as any).spellData?.spellName === assertion.params.spellName) {
              return true
            }
            // Check persistent-area objects (after animation completes with persistDuration > 0)
            if (obj.type === 'persistent-area' && (obj as any).persistentAreaData?.spellName === assertion.params.spellName) {
              return true
            }
            return false
          })

          if (spellActive !== assertion.expected) {
            // Debug logging on failure
            const allSpells = mapStore.currentMap?.objects.filter(obj =>
              obj.type === 'spell' || obj.type === 'persistent-area'
            ) || []
            console.log(`🔍 [spellActive] Looking for "${assertion.params.spellName}", found ${allSpells.length} spell/persistent objects:`,
              allSpells.map(obj => ({
                id: obj.id,
                type: obj.type,
                spellName: obj.type === 'spell'
                  ? (obj as any).spellData?.spellName
                  : (obj as any).persistentAreaData?.spellName
              }))
            )

            return {
              success: false,
              error: `Expected spell active: ${assertion.expected}, got: ${spellActive}`
            }
          }
          break

        case 'spellOriginPosition':
          // Validate that a spell's fromPosition matches expected value
          const spell = mapStore.currentMap?.objects.find(
            obj => obj.type === 'spell' && (obj as any).spellData?.spellName === assertion.params.spellName
          )
          if (!spell) {
            return {
              success: false,
              error: `Spell ${assertion.params.spellName} not found`
            }
          }
          const spellFromPos = (spell as any).spellData?.fromPosition
          if (!spellFromPos) {
            return {
              success: false,
              error: `Spell ${assertion.params.spellName} has no fromPosition`
            }
          }
          if (spellFromPos.x !== assertion.expected.x || spellFromPos.y !== assertion.expected.y) {
            return {
              success: false,
              error: `Spell origin mismatch: expected ${JSON.stringify(assertion.expected)}, got ${JSON.stringify(spellFromPos)}`
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