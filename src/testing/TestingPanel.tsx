import React, { useState, useRef, useEffect } from 'react'
import { Play, StopCircle, Download, Bug, Camera, CheckCircle, XCircle } from 'lucide-react'
import { TestRunner } from './TestRunner'
import { canvasCapture } from './CanvasCapture'
import { VisualAssertions } from './VisualAssertions'
import { BugDetector } from './BugDetector'
import { ReportGenerator } from './ReportGenerator'
import { testScenarios } from './TestScenarios'
import { Box, Button, Text } from '@/components/ui'
import Konva from 'konva'

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
        testResults = await testRunnerRef.current.runCategory(selectedCategory)
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
      css={{
        position: 'fixed',
        right: 0,
        top: 0,
        bottom: 0,
        width: '400px',
        background: '$background',
        borderLeft: '1px solid $gray700',
        padding: '$4',
        overflowY: 'auto',
        zIndex: 1000
      }}
    >
      <Box css={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '$4' }}>
        <Text size="xl" weight="bold" color="white">Visual Testing</Text>
        <Button onClick={onClose} variant="ghost" size="sm">✕</Button>
      </Box>

      {/* Test Controls */}
      <Box css={{ marginBottom: '$4' }}>
        <Text size="sm" color="gray400" css={{ marginBottom: '$2' }}>Test Category</Text>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
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
          <option value="movement">Movement</option>
          <option value="spells">Spells</option>
          <option value="selection">Selection</option>
          <option value="combat">Combat</option>
          <option value="visual">Visual</option>
        </select>

        <Text size="sm" color="gray400" css={{ marginBottom: '$2' }}>Test Scenario</Text>
        <select
          value={selectedScenario}
          onChange={(e) => setSelectedScenario(e.target.value)}
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
      <Box css={{ display: 'flex', gap: '$2', marginBottom: '$4' }}>
        <Button
          onClick={runTests}
          disabled={isRunning || !stage}
          variant="primary"
          css={{ flex: 1 }}
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
        <Box css={{
          background: '$gray800',
          padding: '$3',
          borderRadius: '$md',
          marginBottom: '$4'
        }}>
          <Text size="sm" color="gray300">{currentStep}</Text>
        </Box>
      )}

      {/* Test Results */}
      {results.length > 0 && (
        <Box css={{ marginBottom: '$4' }}>
          <Text size="lg" weight="bold" color="white" css={{ marginBottom: '$3' }}>
            Test Results
          </Text>

          {results.map((result, index) => (
            <Box
              key={index}
              css={{
                background: '$gray800',
                padding: '$3',
                borderRadius: '$md',
                marginBottom: '$2',
                border: result.success ? '1px solid $success' : '1px solid $error'
              }}
            >
              <Box css={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text size="sm" weight="medium" color="white">
                  {result.scenarioName}
                </Text>
                {result.success ? (
                  <CheckCircle size={16} color="#4ade80" />
                ) : (
                  <XCircle size={16} color="#f87171" />
                )}
              </Box>
              <Text size="xs" color="gray400" css={{ marginTop: '$1' }}>
                Duration: {result.duration}ms | Steps: {result.steps.length}
              </Text>
              {result.errors.length > 0 && (
                <Box css={{ marginTop: '$2' }}>
                  {result.errors.map((error: string, i: number) => (
                    <Text key={i} size="xs" color="error">• {error}</Text>
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
          <Text size="lg" weight="bold" color="white" css={{ marginBottom: '$3' }}>
            <Bug size={16} /> Bugs Detected ({bugs.length})
          </Text>

          {bugs.map((bug, index) => (
            <Box
              key={index}
              css={{
                background: '$gray800',
                padding: '$3',
                borderRadius: '$md',
                marginBottom: '$2',
                borderLeft: `3px solid ${
                  bug.severity === 'critical' ? '#dc2626' :
                  bug.severity === 'high' ? '#f97316' :
                  bug.severity === 'medium' ? '#fbbf24' :
                  '#60a5fa'
                }`
              }}
            >
              <Box css={{ display: 'flex', gap: '$2', alignItems: 'center', marginBottom: '$1' }}>
                <Text
                  size="xs"
                  css={{
                    background: bug.severity === 'critical' ? '#dc2626' :
                               bug.severity === 'high' ? '#f97316' :
                               bug.severity === 'medium' ? '#fbbf24' :
                               '#60a5fa',
                    color: bug.severity === 'medium' ? '#1a1a1a' : 'white',
                    padding: '2px 6px',
                    borderRadius: '$sm',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}
                >
                  {bug.severity}
                </Text>
                <Text size="xs" color="gray400">{bug.type}</Text>
              </Box>
              <Text size="sm" color="gray200">{bug.description}</Text>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  )
}