import { useEffect, useRef, useState, lazy, Suspense } from 'react'
import useMapStore from '@store/mapStore'
import useToolStore from '@store/toolStore'
import { useCanvas } from '@hooks/useCanvas'
import { useKeyboardShortcuts } from '@hooks/useKeyboardShortcuts'
import { useAutoSave } from '@hooks/useAutoSave'
import MapCanvas from './components/Canvas/MapCanvas'
import Toolbar from './components/Toolbar/Toolbar'
// Lazy load heavy components for better initial load performance
const PropertiesPanel = lazy(() => import('./components/Properties/PropertiesPanel'))
const TokenLibrary = lazy(() => import('./components/Token/TokenLibrary'))
const StaticObjectLibrary = lazy(() => import('./components/StaticObject/StaticObjectLibrary').then(m => ({ default: m.StaticObjectLibrary })))
const AdvancedLayerPanel = lazy(() => import('./components/Layers/AdvancedLayerPanel').then(m => ({ default: m.AdvancedLayerPanel })))
const AdvancedSelectionManager = lazy(() => import('./components/Selection/AdvancedSelectionManager').then(m => ({ default: m.AdvancedSelectionManager })))
const RealTimeCollaborationManager = lazy(() => import('./components/Collaboration/RealTimeCollaborationManager').then(m => ({ default: m.RealTimeCollaborationManager })))
const UserManagementPanel = lazy(() => import('./components/Collaboration/UserManagementPanel').then(m => ({ default: m.UserManagementPanel })))
const ConflictResolutionSystem = lazy(() => import('./components/Collaboration/ConflictResolutionSystem').then(m => ({ default: m.ConflictResolutionSystem })))
const CollaborationSessionCreator = lazy(() => import('./components/Collaboration/CollaborationSessionCreator').then(m => ({ default: m.CollaborationSessionCreator })))
const PerformanceDashboard = lazy(() => import('./components/Performance/PerformanceDashboard').then(m => ({ default: m.PerformanceDashboard })))
const AccessibilityPanel = lazy(() => import('./components/Accessibility/AccessibilityPanel').then(m => ({ default: m.AccessibilityPanel })))
import { FeatureErrorBoundary } from './components/ErrorBoundary/ErrorBoundary'
import { usePerformanceMonitor } from './hooks/usePerformanceMonitor'
import { useAccessibility } from './hooks/useAccessibility'
import useCollaborationStore from '@store/collaborationStore'
// Lazy load heavy components for better initial load performance
const StaticEffectsPanel = lazy(() => import('./components/StaticEffect/StaticEffectsPanel').then(m => ({ default: m.StaticEffectsPanel })))
const FileMenu = lazy(() => import('./components/Menu/FileMenu').then(m => ({ default: m.FileMenu })))
import { StatusBar } from './components/StatusBar/StatusBar'
const HelpDialog = lazy(() => import('./components/HelpDialog/HelpDialog').then(m => ({ default: m.HelpDialog })))
const CombatTracker = lazy(() => import('./components/Timeline/CombatTracker').then(m => ({ default: m.CombatTracker })))
const TestingPanel = lazy(() => import('./testing/TestingPanel').then(m => ({ default: m.TestingPanel })))
import { Save, HelpCircle, Bug, Users, UserPlus, Activity, Accessibility, ZoomIn, ZoomOut, Maximize2, Grid3x3 } from '@/utils/optimizedIcons'
import { Box, Text } from '@/components/ui'
import { Button } from '@/components/primitives'
import { vars } from '@/styles/theme.css'
import { ContextMenuManager } from '@/components/ContextMenu/ContextMenuManager'
import { initializePerformanceOptimizations } from '@/utils/performanceOptimizations'
import { NavigationPad, EnvironmentToken } from '@/components/Navigation'

// Debug utilities available but not auto-imported to prevent startup animations
// These can be manually imported in TestingPanel or browser console if needed:
// - @/testing/DebugPersistentAreas
// - @/testing/QuickTestPersistence
// - @/testing/SpellPersistenceTests
// - @/testing/DetailedDebugCleanup
// - @/testing/FinalPersistenceTest
// - @/testing/RunAndDiagnose
// - @/testing/SimulateSpellCasting
// - @/testing/TestFireballSpecific
// - @/testing/VerifyCleanupCall
import * as styles from './App.css'

function App() {
  // Use specific selectors to prevent unnecessary re-renders
  const createNewMap = useMapStore(state => state.createNewMap)
  const currentMap = useMapStore(state => state.currentMap)
  const selectedObjects = useMapStore(state => state.selectedObjects)
  const currentTool = useToolStore(state => state.currentTool)
  const { containerRef, canvasSize } = useCanvas()
  const stageRef = useRef<any>(null)
  const { lastSaved, isSaving } = useAutoSave()
  const [showHelp, setShowHelp] = useState(false)
  const [showTesting, setShowTesting] = useState(false)
  const [showUserManagement, setShowUserManagement] = useState(false)
  const [showSessionCreator, setShowSessionCreator] = useState(false)
  const [showPerformance, setShowPerformance] = useState(false)
  const [showAccessibility, setShowAccessibility] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [canvasTransformVersion, setCanvasTransformVersion] = useState(0)

  // Collaboration state
  const { currentSession, isHost, connectedUsers, connectionStatus } = useCollaborationStore()
  const isCollaborating = currentSession && connectionStatus === 'connected'

  // Performance and accessibility
  // 🚀 OPTIMIZATION: Only monitor performance when dashboard is actually open
  const { score: performanceScore, warnings } = usePerformanceMonitor(showPerformance)
  const { preferences } = useAccessibility()
  useKeyboardShortcuts()

  // Navigation handlers
  const PAN_AMOUNT = 100 // pixels to pan per click

  const handleZoomIn = () => {
    if (!stageRef.current) return
    const newZoom = Math.min(zoom * 1.2, 3)
    stageRef.current.scale({ x: newZoom, y: newZoom })
    setZoom(newZoom)
    setCanvasTransformVersion(v => v + 1)
  }

  const handleZoomOut = () => {
    if (!stageRef.current) return
    const newZoom = Math.max(zoom / 1.2, 0.1)
    stageRef.current.scale({ x: newZoom, y: newZoom })
    setZoom(newZoom)
    setCanvasTransformVersion(v => v + 1)
  }

  const handleZoomReset = () => {
    if (!stageRef.current) return
    stageRef.current.scale({ x: 1, y: 1 })
    stageRef.current.position({ x: 0, y: 0 })
    setZoom(1)
    setCanvasTransformVersion(v => v + 1)
  }

  const handlePanUp = () => {
    if (!stageRef.current) return
    const pos = stageRef.current.position()
    stageRef.current.position({ x: pos.x, y: pos.y + PAN_AMOUNT })
    setCanvasTransformVersion(v => v + 1)
  }

  const handlePanDown = () => {
    if (!stageRef.current) return
    const pos = stageRef.current.position()
    stageRef.current.position({ x: pos.x, y: pos.y - PAN_AMOUNT })
    setCanvasTransformVersion(v => v + 1)
  }

  const handlePanLeft = () => {
    if (!stageRef.current) return
    const pos = stageRef.current.position()
    stageRef.current.position({ x: pos.x + PAN_AMOUNT, y: pos.y })
    setCanvasTransformVersion(v => v + 1)
  }

  const handlePanRight = () => {
    if (!stageRef.current) return
    const pos = stageRef.current.position()
    stageRef.current.position({ x: pos.x - PAN_AMOUNT, y: pos.y })
    setCanvasTransformVersion(v => v + 1)
  }

  // Smart preloading: Load commonly used components after initial render
  useEffect(() => {
    const preloadTimer = setTimeout(() => {
      // Preload properties panel (most common sidebar)
      void import('./components/Properties/PropertiesPanel')

      // Preload token library (2nd most common)
      void import('./components/Token/TokenLibrary')

      // Preload file menu (often used for save/export)
      void import('./components/Menu/FileMenu')

      // Preload help dialog (users often need shortcuts)
      void import('./components/HelpDialog/HelpDialog')
    }, 2000) // Wait 2s after initial load to avoid interfering with critical path

    return () => clearTimeout(preloadTimer)
  }, [])

  // Tool-based intelligent preloading
  useEffect(() => {
    const preloadBasedOnTool = () => {
      switch (currentTool) {
        case 'select':
          // When using select tool, they might switch to properties or layers
          void import('./components/Properties/PropertiesPanel')
          void import('./components/Layers/AdvancedLayerPanel')
          break
        case 'token':
          // When placing tokens, they might need static effects or static objects next
          void import('./components/StaticEffect/StaticEffectsPanel')
          void import('./components/StaticObject/StaticObjectLibrary')
          break
        case 'staticEffect':
          // When using static effects, they might need combat tracker
          void import('./components/Timeline/CombatTracker')
          break
      }
    }

    const timer = setTimeout(preloadBasedOnTool, 1000)
    return () => clearTimeout(timer)
  }, [currentTool])

  // Add keyboard shortcuts for help and testing dialogs
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '?' || e.key === 'F1') {
        e.preventDefault()
        setShowHelp(true)
      }
      // Ctrl/Cmd + Shift + T for testing panel
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
        e.preventDefault()
        setShowTesting(!showTesting)
      }
      // Ctrl/Cmd + Shift + P for performance dashboard
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
        e.preventDefault()
        setShowPerformance(true)
      }
      // Alt + A for accessibility panel
      if (e.altKey && e.key === 'a') {
        e.preventDefault()
        setShowAccessibility(true)
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [showTesting])

  useEffect(() => {
    // Initialize performance optimizations on app startup
    initializePerformanceOptimizations()

    // Create default map on load - only run when currentMap changes from null
    if (!currentMap) {
      createNewMap('Untitled Map')
    }
  }, [currentMap, createNewMap])

  return (
    <div className={styles.appContainer}>
      {/* Header */}
      <div className={styles.appHeader}>
        <Box display="flex" alignItems="center" gap={4}>
          <Text className={styles.appTitle}>D&D Map Maker</Text>
          {currentMap && (
            <Text size="sm" color="gray400">
              {currentMap.name} ({currentMap.width}x{currentMap.height})
            </Text>
          )}

          {/* Collaboration Status */}
          {isCollaborating && (
            <Box display="flex" alignItems="center" gap={2}>
              <Box
                  width={8}
                  height={8}
                  borderRadius="lg"
                  backgroundColor={connectionStatus === 'connected' ? 'success' : 'warning'}
              />
              <Text size='sm' color='success' >
                {connectedUsers.size} user{connectedUsers.size !== 1 ? 's' : ''} online
              </Text>
              {isHost && (
                <Text size='xs' color='secondary' >
                  (Host)
                </Text>
              )}
            </Box>
          )}
        </Box>

        <Box display="flex" alignItems="center" gap={4}>
          {/* Auto-save indicator */}
          <div
            className={styles.autoSaveIndicator}
            data-saving={isSaving}
            data-saved={!!lastSaved && !isSaving}
          >
            <Save size={12} className={styles.autoSaveSpinner} />
            <Text size="xs">
              {isSaving ? 'Saving...' : 'Saved'}
            </Text>
          </div>

          {/* File Menu */}
          <Suspense fallback={<Button variant="ghost" size="sm" disabled><Text size="sm">File</Text></Button>}>
            <FileMenu stageRef={stageRef} />
          </Suspense>

          {/* Zoom Controls */}
          <Box display="flex" alignItems="center" gap={2}>
            <Button
              onClick={handleZoomOut}
              variant="ghost"
              size="icon"
              title="Zoom out (-)"
              disabled={zoom <= 0.1}
            >
              <ZoomOut size={16} />
            </Button>

            <Button
              onClick={handleZoomReset}
              variant="ghost"
              size="sm"
              title="Reset zoom (0)"
              style={{ minWidth: '60px' }}
            >
              <Maximize2 size={14} />
              <Text size="xs" style={{ fontFamily: 'monospace' }}>
                {Math.round(zoom * 100)}%
              </Text>
            </Button>

            <Button
              onClick={handleZoomIn}
              variant="ghost"
              size="icon"
              title="Zoom in (+)"
              disabled={zoom >= 3}
            >
              <ZoomIn size={16} />
            </Button>
          </Box>

          {/* Grid Snap Toggle */}
          <Button
            onClick={() => useMapStore.getState().toggleGridSnap()}
            variant="ghost"
            size="sm"
            title={`Grid snap: ${currentMap?.grid?.snap ? 'ON' : 'OFF'} (G)`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: currentMap?.grid?.snap ? '#3B82F6' : 'transparent',
              color: currentMap?.grid?.snap ? 'white' : undefined,
              border: currentMap?.grid?.snap ? '1px solid #60A5FA' : undefined
            }}
          >
            <Grid3x3 size={14} />
            <Text size="xs">Grid</Text>
          </Button>

          {/* Collaboration Controls */}
          {isCollaborating && (
            <Button
              onClick={() => setShowUserManagement(true)}
              variant="ghost"
              size="sm"
              title="Manage Users"
            >
              <Users size={16} />
              <Text size='sm' >{connectedUsers.size}</Text>
            </Button>
          )}

          {!isCollaborating && (
            <Button
              onClick={() => setShowSessionCreator(true)}
              variant="ghost" size="sm"
              title="Start Collaboration"
            >
              <UserPlus size={16} />
              <Text size='sm' >Collaborate</Text>
            </Button>
          )}

          {/* Performance Button */}
          <Button
            onClick={() => setShowPerformance(true)}
            variant="ghost"
            size="icon"
            title="Performance Dashboard (Ctrl+Shift+P)"
            style={{
              color: performanceScore < 70 ? vars.colors.error :
                     warnings.length > 0 ? vars.colors.warning : vars.colors.gray400
            }}
          >
            <Activity size={16} />
          </Button>

          {/* Accessibility Button */}
          <Button
            onClick={() => setShowAccessibility(true)}
            variant="ghost"
            size="icon"
            title="Accessibility Settings (Alt+A)"
            style={{
              color: preferences.screenReaderMode ? vars.colors.primary : vars.colors.gray400
            }}
          >
            <Accessibility size={16} />
          </Button>

          {/* Testing Button */}
          <Button
            onClick={() => setShowTesting(true)}
            variant="ghost"
            size="icon"
            title="Visual Testing (Ctrl+Shift+T)"
            style={{
              color: showTesting ? vars.colors.primary : vars.colors.gray400
            }}
          >
            <Bug size={16} />
          </Button>

          {/* Help Button */}
          <Button
            onClick={() => setShowHelp(true)}
            {...({ variant: "ghost", size: "icon" } as any)}
            title="Keyboard Shortcuts (?)"
          >
            <HelpCircle size={16} />
          </Button>
        </Box>
      </div>

      <div className={styles.appBody}>
        {/* Toolbar */}
        <Toolbar />

        {/* Canvas Area */}
        <div className={styles.canvasArea} ref={containerRef}>
          <FeatureErrorBoundary name="Canvas">
          <MapCanvas
            width={canvasSize.width}
            height={canvasSize.height}
            stageRef={stageRef}
            onMouseMove={(pos) => setMousePosition(pos)}
            onZoomChange={(z) => setZoom(z)}
            onTransformChange={() => setCanvasTransformVersion(v => v + 1)}
            externalTransformVersion={canvasTransformVersion}
          />

          {/* Navigation Pad */}
          <NavigationPad
            onPanUp={handlePanUp}
            onPanDown={handlePanDown}
            onPanLeft={handlePanLeft}
            onPanRight={handlePanRight}
          />

          {/* Environment Token */}
          <EnvironmentToken />

          {/* Real-time Collaboration Layer */}
          {isCollaborating && (
            <Suspense fallback={null}>
              <RealTimeCollaborationManager
                stageRef={stageRef}
                isActive={isCollaborating}
              />
            </Suspense>
          )}

          {/* Conflict Resolution System */}
          <Suspense fallback={null}>
            <ConflictResolutionSystem isActive={!!isCollaborating} />
          </Suspense>
          </FeatureErrorBoundary>

          {/* Combat Tracker */}
          <Suspense fallback={<Box position='absolute' bottom={0} left={0} />}>
            <CombatTracker />
          </Suspense>
        </div>

        {/* Sidebar - Show appropriate panel based on current tool */}
        <div style={{ width: 320, flexShrink: 0, display: 'flex', flexDirection: 'column', backgroundColor: vars.colors.dndBlack, borderLeft: `1px solid ${vars.colors.gray700}` }}>
          <FeatureErrorBoundary
            name="Sidebar"
            onError={(error, errorInfo, errorId) => {
              console.error('Sidebar error:', error)
              console.error('Error info:', errorInfo)
              console.error('Error ID:', errorId)
            }}
          >
            <Suspense fallback={<Box style={{ width: '100%', height: '100%', backgroundColor: vars.colors.dndBlack }} />}>
              {currentTool === 'token' ? (
                <TokenLibrary />
              ) : currentTool === 'staticObject' ? (
                <StaticObjectLibrary />
              ) : currentTool === 'staticEffect' ? (
                <StaticEffectsPanel />
              ) : currentTool === 'layers' ? (
                <AdvancedLayerPanel />
              ) : currentTool === 'select' ? (
                // For select tool, show PropertiesPanel if something is selected, otherwise AdvancedSelectionManager
                selectedObjects.length > 0 ? <PropertiesPanel /> : <AdvancedSelectionManager />
              ) : (
                <PropertiesPanel />
              )}
            </Suspense>
          </FeatureErrorBoundary>
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar mousePosition={mousePosition} zoom={zoom} />

      {/* Help Dialog */}
      <Suspense fallback={null}>
        <HelpDialog isOpen={showHelp} onClose={() => setShowHelp(false)} />
      </Suspense>

      {/* Testing Panel */}
      <Suspense fallback={null}>
        <TestingPanel
          stage={stageRef.current}
          isOpen={showTesting}
          onClose={() => setShowTesting(false)}
        />
      </Suspense>

      {/* User Management Panel */}
      <Suspense fallback={null}>
        <UserManagementPanel
          isOpen={showUserManagement}
          onClose={() => setShowUserManagement(false)}
        />
      </Suspense>

      {/* Session Creator */}
      <Suspense fallback={null}>
        <CollaborationSessionCreator
          isOpen={showSessionCreator}
          onClose={() => setShowSessionCreator(false)}
          onSessionCreated={() => {
            // Session created successfully
          }}
        />
      </Suspense>

      {/* Performance Dashboard */}
      <Suspense fallback={null}>
        <PerformanceDashboard
          isOpen={showPerformance}
          onClose={() => setShowPerformance(false)}
        />
      </Suspense>

      {/* Accessibility Panel */}
      <Suspense fallback={null}>
        <AccessibilityPanel
          isOpen={showAccessibility}
          onClose={() => setShowAccessibility(false)}
        />
      </Suspense>
    </div>
  )
}

const AppWithContextMenu = () => {
  return (
    <ContextMenuManager>
      <App />
    </ContextMenuManager>
  )
}

export { AppWithContextMenu as App }