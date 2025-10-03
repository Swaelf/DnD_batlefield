/**
 * Automated Performance Testing Scenario
 *
 * Provides automated test scenarios for performance benchmarking
 * with console log capture and screenshot generation
 */

export type TestScenario = {
  id: string
  name: string
  description: string
  duration: number // seconds
  actions: TestAction[]
}

export type TestAction = {
  type: 'wait' | 'pan' | 'zoom' | 'select' | 'drag' | 'marker'
  delay: number // milliseconds
  params?: Record<string, any>
  description: string
}

export type TestResult = {
  scenario: TestScenario
  startTime: number
  endTime: number
  consoleLogs: ConsoleLog[]
  performanceMetrics: any[]
  screenshots: string[] // base64 encoded images
}

export type ConsoleLog = {
  timestamp: number
  level: 'log' | 'info' | 'warn' | 'error'
  message: string
  data?: any
}

// Predefined test scenarios
export const TEST_SCENARIOS: Record<string, TestScenario> = {
  baseline: {
    id: 'baseline',
    name: 'Baseline Performance',
    description: 'Measure baseline performance with no interactions',
    duration: 20,
    actions: [
      {
        type: 'marker',
        delay: 0,
        description: 'Test started - baseline measurement',
      },
      {
        type: 'wait',
        delay: 20000,
        description: 'Waiting 20 seconds to measure stable performance',
      },
      {
        type: 'marker',
        delay: 20000,
        description: 'Test completed',
      },
    ],
  },

  interactionStress: {
    id: 'interactionStress',
    name: 'Interaction Stress Test',
    description: 'Test performance during heavy user interactions',
    duration: 30,
    actions: [
      {
        type: 'marker',
        delay: 0,
        description: 'Starting interaction stress test',
      },
      {
        type: 'wait',
        delay: 2000,
        description: 'Initial stabilization',
      },
      {
        type: 'pan',
        delay: 3000,
        params: { dx: 100, dy: 100, duration: 500 },
        description: 'Pan canvas right-down',
      },
      {
        type: 'pan',
        delay: 4000,
        params: { dx: -100, dy: -100, duration: 500 },
        description: 'Pan canvas left-up',
      },
      {
        type: 'zoom',
        delay: 5000,
        params: { delta: 0.2, duration: 300 },
        description: 'Zoom in',
      },
      {
        type: 'zoom',
        delay: 6000,
        params: { delta: -0.2, duration: 300 },
        description: 'Zoom out',
      },
      {
        type: 'select',
        delay: 7000,
        params: { objectType: 'token', count: 1 },
        description: 'Select token',
      },
      {
        type: 'drag',
        delay: 8000,
        params: { dx: 200, dy: 0, duration: 1000 },
        description: 'Drag token horizontally',
      },
      {
        type: 'drag',
        delay: 10000,
        params: { dx: 0, dy: 200, duration: 1000 },
        description: 'Drag token vertically',
      },
      {
        type: 'select',
        delay: 12000,
        params: { objectType: 'shape', count: 3 },
        description: 'Multi-select shapes',
      },
      {
        type: 'wait',
        delay: 15000,
        description: 'Measure performance with selection',
      },
      {
        type: 'marker',
        delay: 30000,
        description: 'Test completed',
      },
    ],
  },

  treeOptimization: {
    id: 'treeOptimization',
    name: 'Tree Cache Optimization Test',
    description: 'Specifically tests tree rendering performance with cache',
    duration: 25,
    actions: [
      {
        type: 'marker',
        delay: 0,
        description: 'Starting tree optimization test - should show cached images',
      },
      {
        type: 'wait',
        delay: 5000,
        description: 'Initial measurement period',
      },
      {
        type: 'pan',
        delay: 7000,
        params: { dx: 300, dy: 300, duration: 1000 },
        description: 'Pan to tree-dense area',
      },
      {
        type: 'wait',
        delay: 10000,
        description: 'Measure tree rendering performance',
      },
      {
        type: 'zoom',
        delay: 12000,
        params: { delta: 0.3, duration: 500 },
        description: 'Zoom in on trees',
      },
      {
        type: 'wait',
        delay: 15000,
        description: 'Measure zoomed tree performance',
      },
      {
        type: 'zoom',
        delay: 17000,
        params: { delta: -0.3, duration: 500 },
        description: 'Zoom back out',
      },
      {
        type: 'wait',
        delay: 20000,
        description: 'Final measurement period',
      },
      {
        type: 'marker',
        delay: 25000,
        description: 'Test completed - check console for tree cache logs',
      },
    ],
  },

  visualVerification: {
    id: 'visualVerification',
    name: 'Visual Verification Test',
    description: 'Manual testing: interact with map while monitoring performance',
    duration: 60,
    actions: [
      {
        type: 'marker',
        delay: 0,
        description: '🎯 Visual Test Started - Please perform these actions manually:',
      },
      {
        type: 'marker',
        delay: 0,
        description: '1. Pan around the map and observe FPS',
      },
      {
        type: 'marker',
        delay: 0,
        description: '2. Zoom in/out and check render times',
      },
      {
        type: 'marker',
        delay: 0,
        description: '3. Select and drag tokens',
      },
      {
        type: 'marker',
        delay: 0,
        description: '4. Multi-select objects with Shift+click',
      },
      {
        type: 'marker',
        delay: 0,
        description: '5. Check console for tree cache messages',
      },
      {
        type: 'marker',
        delay: 0,
        description: '6. Watch memory usage during interactions',
      },
      {
        type: 'wait',
        delay: 60000,
        description: 'Recording for 60 seconds - interact freely with map',
      },
      {
        type: 'marker',
        delay: 60000,
        description: '✅ Visual test complete - click Stop Recording when ready',
      },
    ],
  },
}

/**
 * Console Log Capture System
 */
export class ConsoleCapture {
  private logs: ConsoleLog[] = []
  private originalConsole = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
  }

  start(): void {
    console.log = (...args: any[]) => {
      this.capture('log', args)
      this.originalConsole.log(...args)
    }

    console.info = (...args: any[]) => {
      this.capture('info', args)
      this.originalConsole.info(...args)
    }

    console.warn = (...args: any[]) => {
      this.capture('warn', args)
      this.originalConsole.warn(...args)
    }

    console.error = (...args: any[]) => {
      this.capture('error', args)
      this.originalConsole.error(...args)
    }
  }

  stop(): void {
    console.log = this.originalConsole.log
    console.info = this.originalConsole.info
    console.warn = this.originalConsole.warn
    console.error = this.originalConsole.error
  }

  private capture(level: ConsoleLog['level'], args: any[]): void {
    const message = args.map(arg => {
      if (typeof arg === 'string') return arg
      if (typeof arg === 'object') return JSON.stringify(arg)
      return String(arg)
    }).join(' ')

    this.logs.push({
      timestamp: Date.now(),
      level,
      message,
      data: args.length === 1 ? args[0] : args,
    })
  }

  getLogs(): ConsoleLog[] {
    return [...this.logs]
  }

  clear(): void {
    this.logs = []
  }

  filterByPattern(pattern: string | RegExp): ConsoleLog[] {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern
    return this.logs.filter(log => regex.test(log.message))
  }

  filterByLevel(level: ConsoleLog['level']): ConsoleLog[] {
    return this.logs.filter(log => log.level === level)
  }
}

/**
 * Screenshot Capture Utility
 */
export class ScreenshotCapture {
  /**
   * Capture screenshot of specific element
   */
  static async captureElement(element: HTMLElement): Promise<string> {
    try {
      // Use html2canvas if available, otherwise use canvas API
      if (typeof window !== 'undefined' && 'html2canvas' in window) {
        const canvas = await (window as any).html2canvas(element)
        return canvas.toDataURL('image/png')
      }

      // Fallback: Canvas screenshot for canvas elements
      if (element instanceof HTMLCanvasElement) {
        return element.toDataURL('image/png')
      }

      // For non-canvas elements, try to find canvas children
      const canvasElement = element.querySelector('canvas')
      if (canvasElement) {
        return canvasElement.toDataURL('image/png')
      }

      throw new Error('No suitable screenshot method available')
    } catch (error) {
      console.error('Screenshot capture failed:', error)
      return ''
    }
  }

  /**
   * Capture performance dashboard
   */
  static async captureDashboard(): Promise<string> {
    const dashboard = document.querySelector('[data-performance-dashboard]') as HTMLElement
    if (!dashboard) {
      throw new Error('Performance dashboard not found')
    }
    return this.captureElement(dashboard)
  }

  /**
   * Capture canvas
   */
  static async captureCanvas(): Promise<string> {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement
    if (!canvas) {
      throw new Error('Canvas not found')
    }
    return this.captureElement(canvas)
  }
}

/**
 * Test Scenario Runner
 */
export class TestScenarioRunner {
  private consoleCapture = new ConsoleCapture()
  private screenshots: string[] = []
  private performanceMetrics: any[] = []
  private startTime = 0

  async run(
    scenario: TestScenario,
    performanceMonitor: any,
    onProgress?: (progress: number, action: TestAction) => void
  ): Promise<TestResult> {
    this.consoleCapture.clear()
    this.screenshots = []
    this.performanceMetrics = []
    this.startTime = Date.now()

    // Start capturing
    this.consoleCapture.start()
    performanceMonitor.startRecording()

    console.info(`[Test Scenario] Starting: ${scenario.name}`)
    console.info(`[Test Scenario] ${scenario.description}`)

    // Execute actions
    let previousDelay = 0
    for (let i = 0; i < scenario.actions.length; i++) {
      const action = scenario.actions[i]

      const progress = ((i + 1) / scenario.actions.length) * 100
      onProgress?.(progress, action)

      await this.executeAction(action, previousDelay)
      previousDelay = action.delay
    }

    // Stop capturing
    performanceMonitor.stopRecording()
    this.consoleCapture.stop()

    // Capture final screenshots
    try {
      const dashboardScreenshot = await ScreenshotCapture.captureDashboard()
      if (dashboardScreenshot) {
        this.screenshots.push(dashboardScreenshot)
      }

      const canvasScreenshot = await ScreenshotCapture.captureCanvas()
      if (canvasScreenshot) {
        this.screenshots.push(canvasScreenshot)
      }
    } catch (error) {
      console.warn('Screenshot capture failed:', error)
    }

    // Collect performance metrics
    this.performanceMetrics = performanceMonitor.history.samples || []

    console.info(`[Test Scenario] Completed: ${scenario.name}`)
    console.info(`[Test Scenario] Duration: ${(Date.now() - this.startTime) / 1000}s`)
    console.info(`[Test Scenario] Performance samples: ${this.performanceMetrics.length}`)
    console.info(`[Test Scenario] Console logs captured: ${this.consoleCapture.getLogs().length}`)

    return {
      scenario,
      startTime: this.startTime,
      endTime: Date.now(),
      consoleLogs: this.consoleCapture.getLogs(),
      performanceMetrics: this.performanceMetrics,
      screenshots: this.screenshots,
    }
  }

  private async executeAction(action: TestAction, previousDelay: number): Promise<void> {
    console.log(`[Test Action] ${action.description}`)

    // Wait for specified delay
    if (action.delay > previousDelay) {
      await this.sleep(action.delay - previousDelay)
    }

    // Execute action based on type
    switch (action.type) {
      case 'marker':
        console.info(`[Test Marker] ${action.description}`)
        break

      case 'wait':
        // Just wait, already handled by delay
        break

      case 'pan':
      case 'zoom':
      case 'select':
      case 'drag':
        console.warn(`[Test Action] ${action.type} simulation not yet implemented`)
        break

      default:
        console.warn(`[Test Action] Unknown action type: ${action.type}`)
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
