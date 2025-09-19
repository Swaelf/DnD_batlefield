import { useEffect, useRef, useState } from 'react'
import useMapStore from '@store/mapStore'
import useToolStore from '@store/toolStore'
import { useCanvas } from '@hooks/useCanvas'
import { useKeyboardShortcuts } from '@hooks/useKeyboardShortcuts'
import { useAutoSave } from '@hooks/useAutoSave'
import MapCanvas from './components/Canvas/MapCanvas'
import Toolbar from './components/Toolbar/Toolbar'
import { PropertiesPanel } from './components/Properties/PropertiesPanel'
import { TokenLibrary } from './components/Token/TokenLibrary'
import { StaticObjectLibrary } from './components/StaticObject/StaticObjectLibrary'
import { SpellEffectsPanel } from './components/SpellEffect/SpellEffectsPanel'
import { FileMenu } from './components/Menu/FileMenu'
import { StatusBar } from './components/StatusBar/StatusBar'
import { HelpDialog } from './components/HelpDialog/HelpDialog'
import { CombatTracker } from './components/Timeline/CombatTracker'
import { Save, HelpCircle } from 'lucide-react'

function App() {
  const { createNewMap, currentMap } = useMapStore()
  const { currentTool } = useToolStore()
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
    // Create default map on load
    if (!currentMap) {
      createNewMap('Untitled Map')
    }
  }, [currentMap, createNewMap])

  return (
    <div className="h-screen w-screen bg-dnd-gray-900 text-white overflow-hidden flex flex-col">
      {/* Header */}
      <div className="h-12 bg-dnd-black border-b border-dnd-gray-800 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-dnd-gold">D&D Map Maker</h1>
          {currentMap && (
            <span className="text-sm text-gray-400">
              {currentMap.name} ({currentMap.width}x{currentMap.height})
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Auto-save indicator */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {isSaving ? (
              <>
                <Save className="h-3 w-3 animate-pulse" />
                <span>Saving...</span>
              </>
            ) : lastSaved ? (
              <>
                <Save className="h-3 w-3 text-green-500" />
                <span>Saved</span>
              </>
            ) : null}
          </div>

          {/* File Menu */}
          <FileMenu stageRef={stageRef} />

          {/* Help Button */}
          <button
            onClick={() => setShowHelp(true)}
            className="p-2 hover:bg-gray-800 rounded transition-colors"
            title="Keyboard Shortcuts (?)">
            <HelpCircle className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Toolbar */}
        <Toolbar />

        {/* Canvas Area */}
        <div ref={containerRef} className="flex-1 bg-dnd-gray-800 relative">
          <MapCanvas
            width={canvasSize.width}
            height={canvasSize.height}
            stageRef={stageRef}
            onMouseMove={(pos) => setMousePosition(pos)}
            onZoomChange={(z) => setZoom(z)}
          />

          {/* Combat Tracker */}
          <CombatTracker />
        </div>

        {/* Sidebar - Show appropriate panel based on current tool */}
        {currentTool === 'token' ? (
          <TokenLibrary />
        ) : currentTool === 'staticObject' ? (
          <StaticObjectLibrary />
        ) : currentTool === 'spellEffect' ? (
          <SpellEffectsPanel />
        ) : (
          <PropertiesPanel />
        )}
      </div>

      {/* Status Bar */}
      <StatusBar mousePosition={mousePosition} zoom={zoom} />

      {/* Help Dialog */}
      <HelpDialog isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  )
}

export default App