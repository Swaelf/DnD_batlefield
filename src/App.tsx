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
// Lazy load heavy components for better initial load performance
const SpellEffectsPanel = lazy(() => import('./components/SpellEffect/SpellEffectsPanel').then(m => ({ default: m.SpellEffectsPanel })))
import { FileMenu } from './components/Menu/FileMenu'
import StatusBar from './components/StatusBar/StatusBar'
const HelpDialog = lazy(() => import('./components/HelpDialog/HelpDialog').then(m => ({ default: m.HelpDialog })))
const CombatTracker = lazy(() => import('./components/Timeline/CombatTracker').then(m => ({ default: m.CombatTracker })))
import { Save, HelpCircle } from 'lucide-react'
import { Box, Text, Button } from '@/components/ui'
import { styled } from '@/styles/theme.config'

// Move styled components outside to prevent re-creation on every render
const AppContainer = styled(Box, {
  height: '100vh',
  width: '100vw',
  backgroundColor: '$background',
  color: '$gray100',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
})

const AppHeader = styled(Box, {
  height: '$toolButtonSize',
  backgroundColor: '$dndBlack',
  borderBottom: '1px solid $gray800',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingX: '$4',
})

const AppTitle = styled(Text, {
  fontSize: '$lg',
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
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
  fontSize: '$xs',
  color: '$gray500',

  '&[data-saving="true"]': {
    '& svg': {
      animation: 'pulse 1s infinite',
    },
  },

  '&[data-saved="true"]': {
    color: '$success',
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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  useKeyboardShortcuts()

  // Add keyboard shortcut for help dialog
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '?' || e.key === 'F1') {
        e.preventDefault()
        setShowHelp(true)
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  useEffect(() => {
    // Create default map on load - only run when currentMap changes from null
    if (!currentMap) {
      createNewMap('Untitled Map')
    }
  }, [currentMap]) // Removed createNewMap as zustand actions are stable

  return (
    <AppContainer>
      {/* Header */}
      <AppHeader>
        <Box display="flex" alignItems="center" gap="4">
          <AppTitle>D&D Map Maker</AppTitle>
          {currentMap && (
            <Text size="sm" color="gray400">
              {currentMap.name} ({currentMap.width}x{currentMap.height})
            </Text>
          )}
        </Box>

        <Box display="flex" alignItems="center" gap="4">
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

          {/* Help Button */}
          <Button
            onClick={() => setShowHelp(true)}
            variant="ghost"
            size="icon"
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
          <MapCanvas
            width={canvasSize.width}
            height={canvasSize.height}
            stageRef={stageRef}
            onMouseMove={(pos) => setMousePosition(pos)}
            onZoomChange={(z) => setZoom(z)}
          />

          {/* Combat Tracker */}
          <Suspense fallback={<Box css={{ position: 'absolute', bottom: 0, left: 0 }} />}>
            <CombatTracker />
          </Suspense>
        </CanvasArea>

        {/* Sidebar - Show appropriate panel based on current tool */}
        {currentTool === 'token' ? (
          <TokenLibrary />
        ) : currentTool === 'staticObject' ? (
          <StaticObjectLibrary />
        ) : currentTool === 'spellEffect' ? (
          <Suspense fallback={<Box css={{ width: 320, backgroundColor: '$dndBlack' }} />}>
            <SpellEffectsPanel />
          </Suspense>
        ) : (
          <PropertiesPanel />
        )}
      </AppBody>

      {/* Status Bar */}
      <StatusBar mousePosition={mousePosition} zoom={zoom} />

      {/* Help Dialog */}
      <Suspense fallback={null}>
        <HelpDialog isOpen={showHelp} onClose={() => setShowHelp(false)} />
      </Suspense>
    </AppContainer>
  )
}

export default App