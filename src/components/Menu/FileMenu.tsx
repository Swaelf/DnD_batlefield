import React, { useRef, useState } from 'react'
import {
  Save,
  Download,
  Upload,
  Image,
  Trash2,
  Clock,
  Plus
} from 'lucide-react'
import Konva from 'konva'
import useMapStore from '@/store/mapStore'
import { useAutoSave } from '@/hooks/useAutoSave'
import {
  exportMapAsJSON,
  importMapFromJSON,
  exportMapAsPNG,
  exportVisibleAreaAsPNG
} from '@/utils/export'

interface FileMenuProps {
  stageRef?: React.RefObject<Konva.Stage>
}

export const FileMenu: React.FC<FileMenuProps> = ({ stageRef }) => {
  const { currentMap, loadMap, createNewMap } = useMapStore()
  const { lastSaved, isSaving, manualSave, clearAutoSave } = useAutoSave()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showNewMapDialog, setShowNewMapDialog] = useState(false)
  const [newMapName, setNewMapName] = useState('Untitled Map')

  const handleSaveJSON = () => {
    if (!currentMap) return
    exportMapAsJSON(currentMap)
    setIsMenuOpen(false)
  }

  const handleLoadJSON = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const map = await importMapFromJSON(file)
      loadMap(map)
      setIsMenuOpen(false)
    } catch (error) {
      console.error('Failed to load map:', error)
      alert('Failed to load map file. Please check the file format.')
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleExportPNG = async () => {
    if (!stageRef?.current) {
      alert('Canvas not ready for export')
      return
    }

    try {
      await exportMapAsPNG(stageRef.current, `${currentMap?.name || 'map'}_full.png`)
      setIsMenuOpen(false)
    } catch (error) {
      console.error('Failed to export PNG:', error)
      alert('Failed to export map as image')
    }
  }

  const handleExportVisiblePNG = async () => {
    if (!stageRef?.current) {
      alert('Canvas not ready for export')
      return
    }

    try {
      await exportVisibleAreaAsPNG(stageRef.current, `${currentMap?.name || 'map'}_view.png`)
      setIsMenuOpen(false)
    } catch (error) {
      console.error('Failed to export PNG:', error)
      alert('Failed to export visible area as image')
    }
  }

  const handleNewMap = () => {
    setShowNewMapDialog(true)
  }

  const confirmNewMap = () => {
    createNewMap(newMapName)
    setNewMapName('Untitled Map')
    setShowNewMapDialog(false)
    setIsMenuOpen(false)
  }

  const handleClearData = () => {
    if (confirm('This will clear all saved data. Are you sure?')) {
      clearAutoSave()
      createNewMap('Untitled Map')
      setIsMenuOpen(false)
    }
  }

  const formatLastSaved = () => {
    if (!lastSaved) return 'Never'
    const now = new Date()
    const diff = now.getTime() - lastSaved.getTime()
    const minutes = Math.floor(diff / 60000)

    if (minutes < 1) return 'Just now'
    if (minutes === 1) return '1 minute ago'
    if (minutes < 60) return `${minutes} minutes ago`

    const hours = Math.floor(minutes / 60)
    if (hours === 1) return '1 hour ago'
    if (hours < 24) return `${hours} hours ago`

    return lastSaved.toLocaleDateString()
  }

  return (
    <div className="relative">
      {/* File Menu Button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm font-medium flex items-center gap-2 transition-colors"
      >
        <Save className="h-4 w-4" />
        File
      </button>

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 w-64 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50">
            {/* Auto-save Status */}
            <div className="px-4 py-2 border-b border-gray-800">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Auto-save</span>
                <span className={`flex items-center gap-1 ${isSaving ? 'text-yellow-500' : 'text-green-500'}`}>
                  <Clock className="h-3 w-3" />
                  {isSaving ? 'Saving...' : formatLastSaved()}
                </span>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <button
                onClick={handleNewMap}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-800 flex items-center gap-3 transition-colors"
              >
                <Plus className="h-4 w-4 text-gray-400" />
                New Map
              </button>

              <button
                onClick={manualSave}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-800 flex items-center gap-3 transition-colors"
              >
                <Save className="h-4 w-4 text-gray-400" />
                Save Now
                <span className="ml-auto text-xs text-gray-500">Ctrl+S</span>
              </button>

              <div className="h-px bg-gray-800 my-2" />

              <button
                onClick={handleSaveJSON}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-800 flex items-center gap-3 transition-colors"
              >
                <Download className="h-4 w-4 text-gray-400" />
                Export as JSON
              </button>

              <button
                onClick={handleLoadJSON}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-800 flex items-center gap-3 transition-colors"
              >
                <Upload className="h-4 w-4 text-gray-400" />
                Import from JSON
              </button>

              <div className="h-px bg-gray-800 my-2" />

              <button
                onClick={handleExportPNG}
                disabled={!stageRef?.current}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-800 flex items-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Image className="h-4 w-4 text-gray-400" />
                Export Full Map as PNG
              </button>

              <button
                onClick={handleExportVisiblePNG}
                disabled={!stageRef?.current}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-800 flex items-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Image className="h-4 w-4 text-gray-400" />
                Export View as PNG
              </button>

              <div className="h-px bg-gray-800 my-2" />

              <button
                onClick={handleClearData}
                className="w-full px-4 py-2 text-left text-sm hover:bg-red-900/50 flex items-center gap-3 transition-colors text-red-400"
              >
                <Trash2 className="h-4 w-4" />
                Clear All Data
              </button>
            </div>
          </div>
        </>
      )}

      {/* New Map Dialog */}
      {showNewMapDialog && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowNewMapDialog(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 bg-gray-900 border border-gray-700 rounded-lg p-6 z-50">
            <h3 className="text-lg font-bold text-d20-gold mb-4">Create New Map</h3>

            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">Map Name</label>
              <input
                type="text"
                value={newMapName}
                onChange={(e) => setNewMapName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-d20-gold"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && confirmNewMap()}
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowNewMapDialog(false)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmNewMap}
                className="px-4 py-2 bg-d20-red hover:bg-red-800 text-white rounded text-sm transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}