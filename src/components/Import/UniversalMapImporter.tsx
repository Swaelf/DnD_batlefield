import React, { useCallback, useState, useRef } from 'react'
import useMapStore from '@store/mapStore'
import type { BattleMap, MapObject, Shape } from '@/types'

// Extended types for import operations
type ImportedMapObject = MapObject & {
  // Additional properties that might come from external formats
  image?: string
  points?: number[]
  path?: string
}
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Button } from '@/components/primitives/ButtonVE'
import { Checkbox } from '@/components/ui/Checkbox'
import { Upload, FileText, Map, AlertTriangle, CheckCircle, X } from '@/utils/optimizedIcons'

// Supported map formats
interface MapFormat {
  id: string
  name: string
  extension: string
  description: string
  icon: React.ReactNode
}

interface ImportedMapData {
  name: string
  width: number
  height: number
  gridSize: number
  objects: ImportedMapObject[]
  background?: string
  layers?: any[]
  metadata?: Record<string, any>
}

interface ImportOptions {
  preserveIds: boolean
  scaleToFit: boolean
  targetSize: { width: number; height: number }
  importLayers: boolean
  importBackground: boolean
  convertTokens: boolean
}

interface UniversalMapImporterProps {
  isOpen: boolean
  onClose: () => void
  onImportComplete?: (map: BattleMap) => void
}

export const UniversalMapImporter = ({
  isOpen,
  onClose,
  onImportComplete
}: UniversalMapImporterProps) => {
  const [selectedFormat, setSelectedFormat] = useState<string>('auto')
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importOptions, setImportOptions] = useState<ImportOptions>({
    preserveIds: false,
    scaleToFit: true,
    targetSize: { width: 1920, height: 1080 },
    importLayers: true,
    importBackground: true,
    convertTokens: true
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [importProgress, setImportProgress] = useState<{
    stage: string
    progress: number
    message: string
  } | null>(null)
  const [importResults, setImportResults] = useState<{
    success: boolean
    message: string
    warnings: string[]
    imported: ImportedMapData | null
  } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const { loadMap } = useMapStore()

  // Supported formats
  const mapFormats: MapFormat[] = [
    {
      id: 'auto',
      name: 'Auto-detect',
      extension: '*',
      description: 'Automatically detect format',
      icon: <FileText size={16} />
    },
    {
      id: 'roll20',
      name: 'Roll20',
      extension: '.json',
      description: 'Roll20 campaign export',
      icon: <Map size={16} />
    },
    {
      id: 'foundry',
      name: 'Foundry VTT',
      extension: '.db',
      description: 'Foundry scene database',
      icon: <Map size={16} />
    },
    {
      id: 'mapmaker',
      name: 'MapMaker',
      extension: '.json',
      description: 'Native MapMaker format',
      icon: <Map size={16} />
    },
    {
      id: 'dd2vtt',
      name: 'D&D 2VTT',
      extension: '.dd2vtt',
      description: 'Universal VTT format',
      icon: <Map size={16} />
    },
    {
      id: 'image',
      name: 'Image Map',
      extension: '.jpg,.png,.webp',
      description: 'Convert image to map',
      icon: <Upload size={16} />
    }
  ]

  // File selection handler
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setImportFile(file)
      setImportResults(null)

      // Auto-detect format if needed
      if (selectedFormat === 'auto') {
        const extension = file.name.toLowerCase()
        if (extension.endsWith('.json')) {
          // Try to determine if Roll20 or MapMaker by content later
          setSelectedFormat('mapmaker')
        } else if (extension.endsWith('.db')) {
          setSelectedFormat('foundry')
        } else if (extension.endsWith('.dd2vtt')) {
          setSelectedFormat('dd2vtt')
        } else if (extension.match(/\.(jpg|jpeg|png|webp)$/)) {
          setSelectedFormat('image')
        }
      }
    }
  }, [selectedFormat])

  // Parse Roll20 format
  const parseRoll20Format = useCallback(async (content: string): Promise<ImportedMapData> => {
    try {
      const roll20Data = JSON.parse(content)

      // Roll20 structure: pages contain objects
      const page = roll20Data.pages?.[0] || roll20Data
      const objects: ImportedMapObject[] = []

      // Convert Roll20 objects to MapMaker objects
      if (page.graphics) {
        page.graphics.forEach((graphic: any) => {
          const obj: ImportedMapObject = {
            id: importOptions.preserveIds ? graphic._id : crypto.randomUUID(),
            type: graphic._type === 'image' ? 'token' : 'shape',
            position: {
              x: parseFloat(graphic.left) || 0,
              y: parseFloat(graphic.top) || 0
            },
            width: parseFloat(graphic.width) || 50,
            height: parseFloat(graphic.height) || 50,
            rotation: parseFloat(graphic.rotation) || 0,
            layer: graphic.layer === 'gmlayer' ? 20 : 30,
            visible: true,
            locked: false
          }

          // Add Roll20-specific properties
          if (graphic.imgsrc) {
            obj.image = graphic.imgsrc
          }
          if (graphic.name) {
            obj.name = graphic.name
          }

          objects.push(obj)
        })
      }

      return {
        name: page.name || 'Imported Roll20 Map',
        width: parseFloat(page.width) || 1920,
        height: parseFloat(page.height) || 1080,
        gridSize: parseFloat(page.snapping_increment) || 50,
        objects,
        background: page.background_color,
        metadata: {
          source: 'roll20',
          originalId: page._id,
          scale: page.scale_number
        }
      }
    } catch (error) {
      throw new Error(`Failed to parse Roll20 format: ${error}`)
    }
  }, [importOptions.preserveIds])

  // Parse Foundry VTT format
  const parseFoundryFormat = useCallback(async (content: string): Promise<ImportedMapData> => {
    try {
      const foundryData = JSON.parse(content)
      const scene = foundryData.scenes?.[0] || foundryData
      const objects: ImportedMapObject[] = []

      // Convert Foundry tokens
      if (scene.tokens) {
        scene.tokens.forEach((token: any) => {
          const obj: ImportedMapObject = {
            id: importOptions.preserveIds ? token._id : crypto.randomUUID(),
            type: 'token',
            position: {
              x: token.x || 0,
              y: token.y || 0
            },
            width: token.width || 50,
            height: token.height || 50,
            rotation: token.rotation || 0,
            layer: 40, // Tokens layer
            visible: !token.hidden,
            locked: token.locked || false,
            name: token.name,
            image: token.texture?.src
          }
          objects.push(obj)
        })
      }

      // Convert Foundry drawings
      if (scene.drawings) {
        scene.drawings.forEach((drawing: any) => {
          const obj: Shape = {
            id: importOptions.preserveIds ? drawing._id : crypto.randomUUID(),
            type: 'shape',
            shapeType: drawing.type || 'line',
            position: {
              x: drawing.x || 0,
              y: drawing.y || 0
            },
            rotation: 0,
            width: drawing.shape?.width || 100,
            height: drawing.shape?.height || 100,
            stroke: drawing.strokeColor || '#000000',
            strokeColor: drawing.strokeColor || '#000000',
            strokeWidth: drawing.strokeWidth || 1,
            fill: drawing.fillColor || 'transparent',
            fillColor: drawing.fillColor || 'transparent',
            opacity: 1,
            layer: 30,
            visible: true,
            locked: false
          }

          // Handle shape-specific data
          if (drawing.shape?.points) {
            obj.points = drawing.shape.points
          }

          objects.push(obj)
        })
      }

      return {
        name: scene.name || 'Imported Foundry Scene',
        width: scene.width || 1920,
        height: scene.height || 1080,
        gridSize: scene.grid?.size || 50,
        objects,
        background: scene.background?.src,
        metadata: {
          source: 'foundry',
          originalId: scene._id,
          gridType: scene.grid?.type
        }
      }
    } catch (error) {
      throw new Error(`Failed to parse Foundry format: ${error}`)
    }
  }, [importOptions.preserveIds])

  // Parse MapMaker native format
  const parseMapMakerFormat = useCallback(async (content: string): Promise<ImportedMapData> => {
    try {
      const mapData = JSON.parse(content)

      // Native format - direct conversion
      return {
        name: mapData.name || 'Imported MapMaker Map',
        width: mapData.width || 1920,
        height: mapData.height || 1080,
        gridSize: mapData.grid?.size || 50,
        objects: mapData.objects || [],
        background: mapData.background,
        metadata: {
          source: 'mapmaker',
          version: mapData.version
        }
      }
    } catch (error) {
      throw new Error(`Failed to parse MapMaker format: ${error}`)
    }
  }, [])

  // Parse image as background map
  const parseImageFormat = useCallback(async (file: File): Promise<ImportedMapData> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      // Canvas element might be needed for future image processing
      // const canvas = document.createElement('canvas')
      // Canvas context might be needed for future image processing
      // const _ctx = canvas.getContext('2d')

      img.onload = () => {
        try {
          // Create background object from image
          const reader = new FileReader()
          reader.onload = (e) => {
            const dataUrl = e.target?.result as string

            const backgroundObj: ImportedMapObject = {
              id: crypto.randomUUID(),
              type: 'tile',
              position: { x: 0, y: 0 },
              image: dataUrl,
              layer: -10, // Background layer
              rotation: 0,
              visible: true,
              locked: false
            }

            resolve({
              name: file.name.replace(/\.[^/.]+$/, ""),
              width: img.width,
              height: img.height,
              gridSize: 50,
              objects: [backgroundObj],
              metadata: {
                source: 'image',
                originalDimensions: { width: img.width, height: img.height }
              }
            })
          }
          reader.readAsDataURL(file)
        } catch (error) {
          reject(new Error(`Failed to process image: ${error}`))
        }
      }

      img.onerror = () => reject(new Error('Invalid image file'))
      img.src = URL.createObjectURL(file)
    })
  }, [])

  // Main import processor
  const processImport = useCallback(async () => {
    if (!importFile) return

    setIsProcessing(true)
    setImportProgress({ stage: 'Reading file', progress: 10, message: 'Loading file content...' })

    try {
      let importedData: ImportedMapData

      if (selectedFormat === 'image') {
        setImportProgress({ stage: 'Processing image', progress: 30, message: 'Converting image to map...' })
        importedData = await parseImageFormat(importFile)
      } else {
        const content = await importFile.text()
        setImportProgress({ stage: 'Parsing format', progress: 40, message: `Parsing ${selectedFormat} format...` })

        switch (selectedFormat) {
          case 'roll20':
            importedData = await parseRoll20Format(content)
            break
          case 'foundry':
            importedData = await parseFoundryFormat(content)
            break
          case 'mapmaker':
            importedData = await parseMapMakerFormat(content)
            break
          default:
            throw new Error(`Unsupported format: ${selectedFormat}`)
        }
      }

      setImportProgress({ stage: 'Processing objects', progress: 70, message: 'Converting objects...' })

      // Apply import options
      if (importOptions.scaleToFit && importedData.width && importedData.height) {
        const scaleX = importOptions.targetSize.width / importedData.width
        const scaleY = importOptions.targetSize.height / importedData.height
        const scale = Math.min(scaleX, scaleY)

        if (scale !== 1) {
          importedData.objects = importedData.objects.map(obj => ({
            ...obj,
            position: {
              x: obj.position.x * scale,
              y: obj.position.y * scale
            },
            width: (obj.width || 50) * scale,
            height: (obj.height || 50) * scale
          }))
          importedData.width = importOptions.targetSize.width
          importedData.height = importOptions.targetSize.height
        }
      }

      setImportProgress({ stage: 'Finalizing', progress: 90, message: 'Creating map...' })

      const warnings: string[] = []
      if (!importOptions.importBackground && importedData.background) {
        warnings.push('Background image was not imported')
      }
      if (!importOptions.importLayers && importedData.layers) {
        warnings.push('Layer information was not imported')
      }

      setImportResults({
        success: true,
        message: `Successfully imported ${importedData.objects.length} objects`,
        warnings,
        imported: importedData
      })

      setImportProgress({ stage: 'Complete', progress: 100, message: 'Import successful!' })

    } catch (error) {
      setImportResults({
        success: false,
        message: error instanceof Error ? error.message : 'Import failed',
        warnings: [],
        imported: null
      })
    } finally {
      setIsProcessing(false)
      setTimeout(() => setImportProgress(null), 2000)
    }
  }, [importFile, selectedFormat, importOptions, parseRoll20Format, parseFoundryFormat, parseMapMakerFormat, parseImageFormat])

  // Create map from imported data
  const createMapFromImport = useCallback(() => {
    if (!importResults?.imported) return

    const imported = importResults.imported
    const newMap: BattleMap = {
      id: crypto.randomUUID(),
      name: imported.name,
      width: imported.width,
      height: imported.height,
      grid: {
        size: imported.gridSize,
        type: 'square',
        visible: true,
        snap: true,
        color: '#666666'
      },
      objects: imported.objects
    }

    loadMap(newMap)
    onImportComplete?.(newMap)
    onClose()
  }, [importResults, importOptions.importBackground, loadMap, onImportComplete, onClose])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <Box
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000
        }}
        onClick={onClose}
      />

      {/* Main Dialog */}
      <Box
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          maxHeight: '80vh',
          backgroundColor: 'var(--colors-dndBlack)',
          border: '1px solid var(--colors-gray800)',
          borderRadius: '8px',
          zIndex: 1001,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <Box
          style={{
            padding: '16px',
            borderBottom: '1px solid var(--colors-gray800)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Text variant="heading" size="lg" style={{ fontWeight: '600' }}>Universal Map Importer</Text>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={16} />
          </Button>
        </Box>

        <Box style={{ flex: 1, padding: '16px', overflow: 'auto' }}>
          {!importResults ? (
            <>
              {/* Format Selection */}
              <Box style={{ marginBottom: '16px' }}>
                <Text variant="body" size="sm" style={{ marginBottom: '8px' }}>Map Format:</Text>
                <select
                  value={selectedFormat}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedFormat(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: 'var(--colors-gray800)',
                    border: '1px solid var(--colors-gray700)',
                    borderRadius: '4px',
                    color: 'var(--colors-gray100)',
                    fontSize: '14px'
                  }}
                >
                  {mapFormats.map(format => (
                    <option key={format.id} value={format.id}>
                      {format.name} - {format.description}
                    </option>
                  ))}
                </select>
              </Box>

              {/* File Selection */}
              <Box style={{ marginBottom: '16px' }}>
                <Text variant="body" size="sm" style={{ marginBottom: '8px' }}>Select File:</Text>
                <Box
                  style={{
                    border: '2px dashed var(--colors-gray700)',
                    borderRadius: '8px',
                    padding: '24px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s'
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={32} style={{ margin: '0 auto 8px', color: 'var(--colors-gray500)' }} />
                  {importFile ? (
                    <Text size="sm">{importFile.name}</Text>
                  ) : (
                    <Text variant="body" size="sm" style={{ color: 'var(--colors-gray500)' }}>
                      Click to select or drag file here
                    </Text>
                  )}
                </Box>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.db,.dd2vtt,.jpg,.jpeg,.png,.webp"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
              </Box>

              {/* Import Options */}
              <Box style={{ marginBottom: '16px' }}>
                <Text variant="body" size="sm" style={{ marginBottom: '8px' }}>Import Options:</Text>
                <Box style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Checkbox
                      checked={importOptions.preserveIds}
                      onCheckedChange={(checked) =>
                        setImportOptions(prev => ({ ...prev, preserveIds: !!checked }))
                      }
                    />
                    <Text variant="body" size="sm">Preserve original IDs</Text>
                  </Box>

                  <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Checkbox
                      checked={importOptions.scaleToFit}
                      onCheckedChange={(checked) =>
                        setImportOptions(prev => ({ ...prev, scaleToFit: !!checked }))
                      }
                    />
                    <Text variant="body" size="sm">Scale to fit canvas size</Text>
                  </Box>

                  <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Checkbox
                      checked={importOptions.importBackground}
                      onCheckedChange={(checked) =>
                        setImportOptions(prev => ({ ...prev, importBackground: !!checked }))
                      }
                    />
                    <Text variant="body" size="sm">Import background images</Text>
                  </Box>

                  <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Checkbox
                      checked={importOptions.convertTokens}
                      onCheckedChange={(checked) =>
                        setImportOptions(prev => ({ ...prev, convertTokens: !!checked }))
                      }
                    />
                    <Text variant="body" size="sm">Convert tokens to MapMaker format</Text>
                  </Box>
                </Box>
              </Box>

              {/* Progress */}
              {importProgress && (
                <Box style={{ marginBottom: '16px' }}>
                  <Text variant="body" size="sm" style={{ marginBottom: '8px' }}>{importProgress.stage}</Text>
                  <Box
                    style={{
                      width: '100%',
                      height: '8px',
                      backgroundColor: 'var(--colors-gray800)',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}
                  >
                    <Box
                      style={{
                        width: `${importProgress.progress}%`,
                        height: '100%',
                        backgroundColor: 'var(--colors-secondary)',
                        transition: 'width 0.3s'
                      }}
                    />
                  </Box>
                  <Text variant="body" size="xs" style={{ color: 'var(--colors-gray500)', marginTop: '4px' }}>
                    {importProgress.message}
                  </Text>
                </Box>
              )}
            </>
          ) : (
            /* Import Results */
            <Box>
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '12px'
                }}
              >
                {importResults.success ? (
                  <CheckCircle size={20} color="var(--colors-success)" />
                ) : (
                  <AlertTriangle size={20} color="var(--colors-error)" />
                )}
                <Text
                  variant="body"
                  size="md"
                  style={{
                    fontWeight: '600',
                    color: importResults.success ? 'var(--colors-success)' : 'var(--colors-error)'
                  }}
                >
                  {importResults.success ? 'Import Successful' : 'Import Failed'}
                </Text>
              </Box>

              <Text variant="body" size="sm" style={{ marginBottom: '12px' }}>
                {importResults.message}
              </Text>

              {importResults.warnings.length > 0 && (
                <Box style={{ marginBottom: '12px' }}>
                  <Text variant="body" size="sm" style={{ fontWeight: '600', color: 'var(--colors-warning)', marginBottom: '4px' }}>
                    Warnings:
                  </Text>
                  {importResults.warnings.map((warning, index) => (
                    <Text key={index} variant="body" size="xs" style={{ color: 'var(--colors-gray400)', marginLeft: '8px' }}>
                      • {warning}
                    </Text>
                  ))}
                </Box>
              )}

              {importResults.imported && (
                <Box style={{ padding: '12px', backgroundColor: 'var(--colors-gray800)', borderRadius: '4px' }}>
                  <Text variant="body" size="xs" style={{ color: 'var(--colors-gray400)' }}>
                    Map: {importResults.imported.name}<br />
                    Size: {importResults.imported.width}×{importResults.imported.height}<br />
                    Objects: {importResults.imported.objects.length}<br />
                    Source: {importResults.imported.metadata?.source}
                  </Text>
                </Box>
              )}
            </Box>
          )}
        </Box>

        {/* Footer */}
        <Box
          style={{
            padding: '16px',
            borderTop: '1px solid var(--colors-gray800)',
            display: 'flex',
            justifyContent: 'space-between'
          }}
        >
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>

          <Box style={{ display: 'flex', gap: '8px' }}>
            {importResults?.success ? (
              <Button onClick={createMapFromImport}>
                Create Map
              </Button>
            ) : (
              <Button
                onClick={processImport}
                disabled={!importFile || isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Import'}
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </>
  )
}

export default UniversalMapImporter