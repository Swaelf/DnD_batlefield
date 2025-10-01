import { useRef, useState, type FC, type RefObject, type ChangeEvent, type KeyboardEvent } from 'react'
import {
  Save,
  Download,
  Upload,
  Image,
  Trash2,
  Clock,
  Plus,
  FileImage,
  Import,
  Share
} from '@/utils/optimizedIcons'
import type Konva from 'konva'
import useMapStore from '@/store/mapStore'
import { useAutoSave } from '@/hooks/useAutoSave'
import {
  exportMapAsJSON,
  importMapFromJSON,
  exportMapAsPNG,
  exportVisibleAreaAsPNG
} from '@/utils/export'
import { UniversalMapImporter } from '@/components/Import/UniversalMapImporter'
import { EnhancedExportSystem } from '@/components/Export/EnhancedExportSystem'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Button } from '@/components/primitives/ButtonVE'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import {
  Dropdown,
  MenuItem,
  MenuSeparator
} from '@/components/ui/Popover'
import {
  MenuHeader,
  MenuStatus,
  MenuGroup,
} from '@/components/ui/Menu'
import { vars } from '@/styles/theme.css'

type FileMenuProps = {
  stageRef?: RefObject<Konva.Stage>
}


export const FileMenu: FC<FileMenuProps> = ({ stageRef }) => {
  // Use specific selectors to prevent unnecessary re-renders
  const currentMap = useMapStore(state => state.currentMap)
  const loadMap = useMapStore(state => state.loadMap)
  const createNewMap = useMapStore(state => state.createNewMap)
  const { lastSaved, isSaving, manualSave, clearAutoSave } = useAutoSave()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showNewMapDialog, setShowNewMapDialog] = useState(false)
  const [showImporter, setShowImporter] = useState(false)
  const [showExporter, setShowExporter] = useState(false)
  const [newMapName, setNewMapName] = useState('Untitled Map')

  const handleSaveJSON = () => {
    if (!currentMap) return
    exportMapAsJSON(currentMap)
    setIsMenuOpen(false)
  }

  const handleLoadJSON = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
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
    <>
      <Dropdown
        trigger={
          <Button variant="ghost" size="sm">
            <Save size={16} />
            File
          </Button>
        }
        open={isMenuOpen}
        onOpenChange={setIsMenuOpen}
      >
        {/* Auto-save Status */}
        <MenuHeader>
          <MenuStatus>
            <Text size="xs" color="gray400">Auto-save</Text>
            <Box
              className="status-indicator"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: isSaving ? vars.colors.warning : vars.colors.success
              }}
            >
              <Clock size={12} />
              <Text size="xs">
                {isSaving ? 'Saving...' : formatLastSaved()}
              </Text>
            </Box>
          </MenuStatus>
        </MenuHeader>

        {/* File Operations */}
        <MenuGroup>
          <MenuItem onClick={handleNewMap}>
            <Plus size={16} />
            New Map
          </MenuItem>

          <MenuItem onClick={manualSave}>
            <Save size={16} />
            Save Now
            <Box style={{ marginLeft: 'auto' }}>
              <Text size="xs" color="gray500">Ctrl+S</Text>
            </Box>
          </MenuItem>
        </MenuGroup>

        <MenuSeparator />

        {/* Advanced Import/Export */}
        <MenuGroup>
          <MenuItem onClick={() => { setShowImporter(true); setIsMenuOpen(false) }}>
            <Import size={16} />
            Universal Import...
            <Box style={{ marginLeft: 'auto' }}>
              <Text size="xs" color="gray500">Roll20, Foundry, etc.</Text>
            </Box>
          </MenuItem>

          <MenuItem onClick={() => { setShowExporter(true); setIsMenuOpen(false) }}>
            <Share size={16} />
            Enhanced Export...
            <Box style={{ marginLeft: 'auto' }}>
              <Text size="xs" color="gray500">PDF, SVG, Print</Text>
            </Box>
          </MenuItem>
        </MenuGroup>

        <MenuSeparator />

        {/* Legacy Import/Export */}
        <MenuGroup>
          <MenuItem onClick={handleSaveJSON}>
            <Download size={16} />
            Export as JSON
          </MenuItem>

          <MenuItem onClick={handleLoadJSON}>
            <Upload size={16} />
            Import from JSON
          </MenuItem>
        </MenuGroup>

        <MenuSeparator />

        {/* Quick Image Export */}
        <MenuGroup>
          <MenuItem
            onClick={handleExportPNG}
            disabled={!stageRef?.current}
          >
            <Image size={16} />
            Quick PNG Export (Full)
          </MenuItem>

          <MenuItem
            onClick={handleExportVisiblePNG}
            disabled={!stageRef?.current}
          >
            <FileImage size={16} />
            Quick PNG Export (View)
          </MenuItem>
        </MenuGroup>

        <MenuSeparator />

        {/* Destructive Actions */}
        <MenuGroup>
          <MenuItem
            onClick={handleClearData}
            variant="destructive"
          >
            <Trash2 size={16} />
            Clear All Data
          </MenuItem>
        </MenuGroup>
      </Dropdown>

      {/* New Map Dialog */}
      <Modal
        isOpen={showNewMapDialog}
        onClose={() => setShowNewMapDialog(false)}
        title="Create New Map"
        size="sm"
      >
        <Box style={{ display: 'block', marginBottom: '16px' }}>
          <Text
            variant="label"
            size="sm"
            style={{
              marginBottom: '8px',
              color: vars.colors.gray400
            }}
          >
            Map Name
          </Text>
          <Input
            value={newMapName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setNewMapName(e.target.value)}
            fullWidth
            autoFocus
            onKeyDown={(e: KeyboardEvent) => e.key === 'Enter' && confirmNewMap()}
          />
        </Box>

        <Box display="flex" justifyContent="flex-end" gap={2}>
          <Button
            onClick={() => setShowNewMapDialog(false)}
            variant="outline"
            size="sm"
          >
            Cancel
          </Button>
          <Button
            onClick={confirmNewMap}
            variant="primary"
            size="sm"
          >
            Create
          </Button>
        </Box>
      </Modal>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* Universal Map Importer */}
      <UniversalMapImporter
        isOpen={showImporter}
        onClose={() => setShowImporter(false)}
        onImportComplete={(map) => {
          loadMap(map)
          setShowImporter(false)
        }}
      />

      {/* Enhanced Export System */}
      <EnhancedExportSystem
        isOpen={showExporter}
        onClose={() => setShowExporter(false)}
        stageRef={stageRef}
      />
    </>
  )
}