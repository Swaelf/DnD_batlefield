import { useEffect, useRef, useState, lazy, Suspense } from 'react'
import useMapStore from '@store/mapStore'
import useToolStore from '@store/toolStore'
import { useCanvas } from '@hooks/useCanvas'
import { useKeyboardShortcuts } from '@hooks/useKeyboardShortcuts'
import { useAutoSave } from '@hooks/useAutoSave'
import MapCanvas from './components/Canvas/MapCanvas'
import Toolbar from './components/Toolbar/Toolbar'
import PropertiesPanel from './components/Properties/PropertiesPanel'
import TokenLibrary from './components/Token/TokenLibrary'
import { StaticObjectLibrary } from './components/StaticObject/StaticObjectLibrary'
import { AdvancedLayerPanel } from './components/Layers/AdvancedLayerPanel'
import { AdvancedSelectionManager } from './components/Selection/AdvancedSelectionManager'
import { RealTimeCollaborationManager } from './components/Collaboration/RealTimeCollaborationManager'
import { UserManagementPanel } from './components/Collaboration/UserManagementPanel'
import { ConflictResolutionSystem } from './components/Collaboration/ConflictResolutionSystem'
import { CollaborationSessionCreator } from './components/Collaboration/CollaborationSessionCreator'
import { PerformanceDashboard } from './components/Performance/PerformanceDashboard'
import { AccessibilityPanel } from './components/Accessibility/AccessibilityPanel'
import { FeatureErrorBoundary } from './components/ErrorBoundary/ErrorBoundary'
import { usePerformanceMonitor } from './hooks/usePerformanceMonitor'
import { useAccessibility } from './hooks/useAccessibility'
import useCollaborationStore from '@store/collaborationStore'
// Lazy load heavy components for better initial load performance
const SpellEffectsPanel = lazy(() => import('./components/SpellEffect/SpellEffectsPanel').then(m => ({ default: m.SpellEffectsPanel })))
import { FileMenu } from './components/Menu/FileMenu'
import StatusBar from './components/StatusBar/StatusBar'
const HelpDialog = lazy(() => import('./components/HelpDialog/HelpDialog').then(m => ({ default: m.HelpDialog })))
const CombatTracker = lazy(() => import('./components/Timeline/CombatTracker').then(m => ({ default: m.CombatTracker })))
const TestingPanel = lazy(() => import('./testing/TestingPanel').then(m => ({ default: m.TestingPanel })))
import { Save, HelpCircle, Bug, Users, UserPlus, Activity, Accessibility } from 'lucide-react'
import { Box, Text } from '@/components/ui'
import { Button } from '@/components/primitives'
import { ContextMenuManager } from '@/components/ContextMenu/ContextMenuManager'

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
import { styled } from '@/styles/theme.config'

// Move styled components outside to prevent re-creation on every render
const AppContainer = styled(Box, {
  height: '100vh',
  width: '100vw',
  backgroundColor: '$background',
  color: '$gray100',
  overflow: 'hidden',
  display:'flex',
  flexDirection: 'column',
})

const AppHeader = styled(Box, {
  height: '$toolButtonSize',
  backgroundColor: '$dndBlack',
  borderBottom: '1px solid $gray800',
  display:'flex',
 alignItems:'center',
  justifyContent: 'space-between',
  paddingX: "4",
})

const AppTitle = styled(Text, {
  fontSize:'$lg',
  fontWeight: '$semibold',
  color: '$secondary',
  fontFamily: '$dnd',
})

const AppBody = styled(Box, {
  display: 'flex',
  flex: 1,
  overflow: 'hidden',
})

const CanvasArea = styled(Box, {
  flex: 1,
  backgroundColor: '$gray800',
  position: 'relative',
})

const AutoSaveIndicator = styled(Box, {
  display:'flex',
  alignItems:'center',
  gap: "2",
  fontSize:'$xs',
  color:'$gray500',

  '&[data-saving="true"]': {
    '& svg': {
      animation: 'pulse 1s infinite',
    },
  },

  '&[data-saved="true"]': {
    color:'$success',
  },
})

function App() {
  // Use specific selectors to prevent unnecessary re-renders
  const createNewMap = useMapStore(state => state.createNewMap)
  const currentMap = useMapStore(state => state.currentMap)
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

  // Collaboration state
  const { currentSession, isHost, connectedUsers, connectionStatus } = useCollaborationStore()
  const isCollaborating = currentSession && connectionStatus === 'connected'

  // Performance and accessibility
  const { score: performanceScore, warnings } = usePerformanceMonitor()
  const { preferences } = useAccessibility()
  useKeyboardShortcuts()

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
    // Create default map on load - only run when currentMap changes from null
    if (!currentMap) {
      createNewMap('Untitled Map')
    }
  }, [currentMap, createNewMap])

  return (
    <AppContainer>
      {/* Header */}
      <AppHeader>
        <Box display="flex" alignItems="center" gap={4}>
          <AppTitle>D&D Map Maker</AppTitle>
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
          <AutoSaveIndicator
            data-saving={isSaving}
            data-saved={!!lastSaved && !isSaving}
          >
            <Save size={12} />
            <Text size="xs">
              {isSaving ? 'Saving...' : 'Saved'}
            </Text>
          </AutoSaveIndicator>

          {/* File Menu */}
          <FileMenu stageRef={stageRef} />

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
              color: performanceScore < 70 ? 'var(--colors-error)' :
                     warnings.length > 0 ? 'var(--colors-warning)' : 'var(--colors-gray400)'
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
              color: preferences.screenReaderMode ? 'var(--colors-primary)' : 'var(--colors-gray400)'
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
              color: showTesting ? 'var(--colors-primary)' : 'var(--colors-gray400)'
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
      </AppHeader>

      <AppBody>
        {/* Toolbar */}
        <Toolbar />

        {/* Canvas Area */}
        <CanvasArea ref={containerRef}>
          <FeatureErrorBoundary name="Canvas">
          <MapCanvas
            width={canvasSize.width}
            height={canvasSize.height}
            stageRef={stageRef}
            onMouseMove={(pos) => setMousePosition(pos)}
            onZoomChange={(z) => setZoom(z)}
          />

          {/* Real-time Collaboration Layer */}
          {isCollaborating && (
            <RealTimeCollaborationManager
              stageRef={stageRef}
              isActive={isCollaborating}
            />
          )}

          {/* Conflict Resolution System */}
          <ConflictResolutionSystem isActive={!!isCollaborating} />
          </FeatureErrorBoundary>

          {/* Combat Tracker */}
          <Suspense fallback={<Box position='absolute' bottom={0} left={0} />}>
            <CombatTracker />
          </Suspense>
        </CanvasArea>

        {/* Sidebar - Show appropriate panel based on current tool */}
        <FeatureErrorBoundary name="Sidebar">
          {currentTool === 'token' ? (
            <TokenLibrary />
        ) : currentTool === 'staticObject' ? (
          <StaticObjectLibrary />
        ) : currentTool === 'spellEffect' ? (
          <Suspense fallback={<Box width={64} backgroundColor="dndBlack"/>}>
            <SpellEffectsPanel />
          </Suspense>
        ) : currentTool === 'layers' ? (
          <AdvancedLayerPanel />
        ) : currentTool === 'select' ? (
          <AdvancedSelectionManager />
        ) : (
          <PropertiesPanel />
        )}
        </FeatureErrorBoundary>
      </AppBody>

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
      <UserManagementPanel
        isOpen={showUserManagement}
        onClose={() => setShowUserManagement(false)}
      />

      {/* Session Creator */}
      <CollaborationSessionCreator
        isOpen={showSessionCreator}
        onClose={() => setShowSessionCreator(false)}
        onSessionCreated={(sessionId) => {
          console.log('Session created:', sessionId)
        }}
      />

      {/* Performance Dashboard */}
      <PerformanceDashboard
        isOpen={showPerformance}
        onClose={() => setShowPerformance(false)}
      />

      {/* Accessibility Panel */}
      <AccessibilityPanel
        isOpen={showAccessibility}
        onClose={() => setShowAccessibility(false)}
      />
    </AppContainer>
  )
}

const AppWithContextMenu: React.FC = () => {
  return (
    <ContextMenuManager>
      <App />
    </ContextMenuManager>
  )
}

export default AppWithContextMenu