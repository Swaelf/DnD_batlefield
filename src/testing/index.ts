// Visual Testing System Exports
export { CanvasCapture, canvasCapture } from './CanvasCapture'
export type { Screenshot, StateSnapshot } from './CanvasCapture'

export { TestRunner } from './TestRunner'
export type { TestResult, StepResult } from './TestRunner'

export { testScenarios, getScenarioById, getScenariosByCategory } from './TestScenarios'
export type { TestScenario, TestStep, TestAction, TestAssertion, CaptureOptions } from './TestScenarios'

export { VisualAssertions } from './VisualAssertions'
export type { VisualElement, AnimationState } from './VisualAssertions'

export { BugDetector } from './BugDetector'
export type { BugReport, BugType } from './BugDetector'

export { ReportGenerator } from './ReportGenerator'
export type { TestReport } from './ReportGenerator'

export { TestingPanel } from './TestingPanel'