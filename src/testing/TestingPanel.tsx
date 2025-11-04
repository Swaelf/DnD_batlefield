import React, { useState, useRef, useEffect } from 'react'
import { Play, StopCircle, Download, Bug, Camera, CheckCircle, XCircle } from '@/utils/optimizedIcons'
import { TestRunner } from './TestRunner'
import { canvasCapture } from './CanvasCapture'
import { VisualAssertions } from './VisualAssertions'
import { BugDetector } from './BugDetector'
import { ReportGenerator } from './ReportGenerator'
import { testScenarios } from './TestScenarios'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Button } from '@/components/primitives/ButtonVE'
import { vars } from '@/styles/theme.css'
import type Konva from 'konva'

interface TestingPanelProps {
  stage?: Konva.Stage
  isOpen: boolean
  onClose: () => void
}

export const TestingPanel: React.FC<TestingPanelProps> = ({ stage, isOpen, onClose }) => {
  const [isRunning, setIsRunning] = useState(false)
  const [selectedScenario, setSelectedScenario] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [results, setResults] = useState<any[]>([])
  const [bugs, setBugs] = useState<any[]>([])
  const [currentStep, setCurrentStep] = useState<string>('')

  const testRunnerRef = useRef<TestRunner | null>(null)
  const assertionsRef = useRef<VisualAssertions | null>(null)
  const bugDetectorRef = useRef<BugDetector | null>(null)
  const reportGeneratorRef = useRef<ReportGenerator | null>(null)

  useEffect(() => {
    if (stage) {
      // Initialize testing tools
      canvasCapture.setStage(stage)

      const assertions = new VisualAssertions()
      assertions.setStage(stage)
      assertionsRef.current = assertions

      testRunnerRef.current = new TestRunner(canvasCapture)
      bugDetectorRef.current = new BugDetector(assertions)
      reportGeneratorRef.current = new ReportGenerator()
    }
  }, [stage])

  const runTests = async () => {
    if (!testRunnerRef.current || !bugDetectorRef.current) return

    setIsRunning(true)
    setResults([])
    setBugs([])
    setCurrentStep('Starting tests...')

    try {
      let testResults: any[] = []

      if (selectedScenario) {
        // Run single scenario
        const scenario = testScenarios.find(s => s.id === selectedScenario)
        if (scenario) {
          const result = await testRunnerRef.current.runScenario(scenario)
          testResults = [result]
        }
      } else if (selectedCategory === 'all') {
        // Run all tests
        testResults = await testRunnerRef.current.runAll()
      } else {
        // Run category
        testResults = await testRunnerRef.current.runCategory(selectedCategory as 'movement' | 'tokens' | 'selection' | 'timeline' | 'spells' | 'attacks' | 'animations' | 'visual')
      }

      // Detect bugs
      const allBugs: any[] = []
      for (const result of testResults) {
        const detectedBugs = await bugDetectorRef.current.detectBugs(result)
        allBugs.push(...detectedBugs)
      }

      setResults(testResults)
      setBugs(allBugs)
      setCurrentStep('Tests complete!')
    } catch (error) {
      console.error('Test execution failed:', error)
      setCurrentStep('Test execution failed')
    } finally {
      setIsRunning(false)
    }
  }

  const generateReport = () => {
    if (!reportGeneratorRef.current || results.length === 0) return

    const report = reportGeneratorRef.current.generateReport(results, bugs)
    reportGeneratorRef.current.saveReport(report)
  }

  const captureScreenshot = async () => {
    try {
      const screenshot = await canvasCapture.captureScreenshot({
        testName: 'Manual capture',
        description: 'Manual screenshot capture'
      })

      // Create download link
      const link = document.createElement('a')
      link.href = screenshot.dataUrl
      link.download = `screenshot-${Date.now()}.png`
      link.click()
    } catch (error) {
      console.error('Screenshot capture failed:', error)
    }
  }

  if (!isOpen) return null

  const filteredScenarios = selectedCategory === 'all'
    ? testScenarios
    : testScenarios.filter(s => s.category === selectedCategory)

  return (
    <Box
      style={{
        position: 'fixed',
        right: 0,
        top: 0,
        bottom: 0,
        width: '400px',
        background: vars.colors.background,
        borderLeft: `1px solid ${vars.colors.gray700}`,
        padding: '16px',
        overflowY: 'auto',
        zIndex: 1000
      }}
    >
      <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Text variant="heading" size="xl" style={{ fontWeight: '700', color: 'white' }}>Visual Testing</Text>
        <Button onClick={onClose} variant="ghost" size="sm">✕</Button>
      </Box>

      {/* Test Controls */}
      <Box style={{ marginBottom: '16px' }}>
        <Text variant="body" size="sm" style={{ color: vars.colors.gray400, marginBottom: '8px' }}>Test Category</Text>
        <select
          value={selectedCategory}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCategory(e.target.value)}
          disabled={isRunning}
          style={{
            width: '100%',
            padding: '8px',
            background: '#2a2a2a',
            color: '#e5e5e5',
            border: '1px solid #3a3a3a',
            borderRadius: '6px',
            marginBottom: '12px'
          }}
        >
          <option value="all">All Tests</option>
          <option value="tokens">Tokens</option>
          <option value="movement">Movement</option>
          <option value="selection">Selection</option>
          <option value="attacks">Attacks</option>
          <option value="spells">Spells</option>
          <option value="timeline">Timeline</option>
          <option value="animations">Animations</option>
          <option value="visual">Visual</option>
        </select>

        <Text variant="body" size="sm" style={{ color: vars.colors.gray400, marginBottom: '8px' }}>Test Scenario</Text>
        <select
          value={selectedScenario}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedScenario(e.target.value)}
          disabled={isRunning}
          style={{
            width: '100%',
            padding: '8px',
            background: '#2a2a2a',
            color: '#e5e5e5',
            border: '1px solid #3a3a3a',
            borderRadius: '6px'
          }}
        >
          <option value="">Run Category/All</option>
          {filteredScenarios.map(scenario => (
            <option key={scenario.id} value={scenario.id}>
              {scenario.name}
            </option>
          ))}
        </select>
      </Box>

      {/* Action Buttons */}
      <Box style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <Button
          onClick={runTests}
          disabled={isRunning || !stage}
          variant="primary"
          style={{ flex: 1 }}
        >
          {isRunning ? (
            <>
              <StopCircle size={16} /> Running...
            </>
          ) : (
            <>
              <Play size={16} /> Run Tests
            </>
          )}
        </Button>

        <Button
          onClick={captureScreenshot}
          disabled={!stage}
          variant="outline"
        >
          <Camera size={16} />
        </Button>

        <Button
          onClick={generateReport}
          disabled={results.length === 0}
          variant="outline"
        >
          <Download size={16} />
        </Button>
      </Box>

      {/* Current Status */}
      {currentStep && (
        <Box
          style={{
            background: vars.colors.gray800,
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '16px'
          }}
        >
          <Text variant="body" size="sm" style={{ color: vars.colors.gray300 }}>{currentStep}</Text>
        </Box>
      )}

      {/* Test Results */}
      {results.length > 0 && (
        <Box style={{ marginBottom: '16px' }}>
          <Text variant="heading" size="lg" style={{ fontWeight: '700', color: 'white', marginBottom: '12px' }}>
            Test Results
          </Text>

          {results.map((result, index) => (
            <Box
              key={index}
              style={{
                background: vars.colors.gray800,
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '8px',
                border: result.success ? `1px solid ${vars.colors.success}` : `1px solid ${vars.colors.error}`
              }}
            >
              <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text variant="body" size="sm" style={{ fontWeight: '500', color: 'white' }}>
                  {result.scenarioName}
                </Text>
                {result.success ? (
                  <CheckCircle size={16} color="#4ade80" />
                ) : (
                  <XCircle size={16} color="#f87171" />
                )}
              </Box>
              <Text variant="body" size="xs" style={{ color: vars.colors.gray400, marginTop: '4px' }}>
                Duration: {result.duration}ms | Steps: {result.steps.length}
              </Text>
              {result.errors.length > 0 && (
                <Box style={{ marginTop: '8px' }}>
                  {result.errors.map((error: string, i: number) => (
                    <Text key={i} variant="body" size="xs" style={{ color: vars.colors.error }}>• {error}</Text>
                  ))}
                </Box>
              )}
            </Box>
          ))}
        </Box>
      )}

      {/* Bug Reports */}
      {bugs.length > 0 && (
        <Box>
          <Text variant="heading" size="lg" style={{ fontWeight: '700', color: 'white', marginBottom: '12px' }}>
            <Bug size={16} /> Bugs Detected ({bugs.length})
          </Text>

          {bugs.map((bug, index) => (
            <Box
              key={index}
              style={{
                background: vars.colors.gray800,
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '8px',
                borderLeft: `3px solid ${
                  bug.severity === 'critical' ? '#dc2626' :
                  bug.severity === 'high' ? '#f97316' :
                  bug.severity === 'medium' ? '#fbbf24' :
                  '#60a5fa'
                }`
              }}
            >
              <Box style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                <Text
                  size="xs"
                  style={{
                    background: bug.severity === 'critical' ? '#dc2626' :
                               bug.severity === 'high' ? '#f97316' :
                               bug.severity === 'medium' ? '#fbbf24' :
                               '#60a5fa',
                    color: bug.severity === 'medium' ? '#1a1a1a' : 'white',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}
                >
                  {bug.severity}
                </Text>
                <Text variant="body" size="xs" style={{ color: vars.colors.gray400 }}>{bug.type}</Text>
              </Box>
              <Text variant="body" size="sm" style={{ color: vars.colors.gray200 }}>{bug.description}</Text>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  )
}