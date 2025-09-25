import React, { useCallback, useState, useRef } from 'react'
import useMapStore from '@store/mapStore'
import { BattleMap } from '@/types'
import { Box, Text, Button, Select, Input, Checkbox } from '@/components/ui'
import { Download, FileText, Image, Printer, Settings, X } from 'lucide-react'
import Konva from 'konva'

interface ExportFormat {
  id: string
  name: string
  extension: string
  description: string
  icon: React.ReactNode
  supportsOptions: string[]
}

interface ExportOptions {
  // Image options
  resolution: number // DPI
  format: 'png' | 'jpg' | 'webp' | 'svg'
  quality: number // 0-100 for JPG
  transparency: boolean
  scale: number // Export scale multiplier

  // Layout options
  includeGrid: boolean
  includeLayers: string[]
  cropToContent: boolean
  addMargins: number // pixels

  // Print options
  paperSize: 'letter' | 'a4' | 'a3' | 'tabloid' | 'custom'
  orientation: 'portrait' | 'landscape'
  customSize: { width: number; height: number }
  printScale: 'fit' | 'actual' | 'custom'
  customPrintScale: number

  // PDF options
  multiPage: boolean
  pageOverlap: number
  includeMetadata: boolean

  // Data options
  embedImages: boolean
  includeHistory: boolean
  compressData: boolean
}

interface EnhancedExportSystemProps {
  isOpen: boolean
  onClose: () => void
  stageRef?: React.RefObject<Konva.Stage>
}

export const EnhancedExportSystem: React.FC<EnhancedExportSystemProps> = ({
  isOpen,
  onClose,
  stageRef
}) => {
  const [selectedFormat, setSelectedFormat] = useState<string>('png')
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    resolution: 300,
    format: 'png',
    quality: 95,
    transparency: true,
    scale: 1,
    includeGrid: true,
    includeLayers: ['background', 'terrain', 'objects', 'tokens'],
    cropToContent: false,
    addMargins: 0,
    paperSize: 'letter',
    orientation: 'landscape',
    customSize: { width: 8.5, height: 11 },
    printScale: 'fit',
    customPrintScale: 1,
    multiPage: false,
    pageOverlap: 0.5,
    includeMetadata: true,
    embedImages: true,
    includeHistory: false,
    compressData: true
  })
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState<{
    stage: string
    progress: number
  } | null>(null)

  const { currentMap } = useMapStore()

  // Available export formats
  const exportFormats: ExportFormat[] = [
    {
      id: 'png',
      name: 'PNG Image',
      extension: '.png',
      description: 'High quality with transparency',
      icon: <Image size={16} />,
      supportsOptions: ['resolution', 'scale', 'transparency', 'layers', 'grid']
    },
    {
      id: 'jpg',
      name: 'JPEG Image',
      extension: '.jpg',
      description: 'Compressed format for smaller files',
      icon: <Image size={16} />,
      supportsOptions: ['resolution', 'scale', 'quality', 'layers', 'grid']
    },
    {
      id: 'webp',
      name: 'WebP Image',
      extension: '.webp',
      description: 'Modern format with good compression',
      icon: <Image size={16} />,
      supportsOptions: ['resolution', 'scale', 'quality', 'transparency', 'layers', 'grid']
    },
    {
      id: 'svg',
      name: 'SVG Vector',
      extension: '.svg',
      description: 'Scalable vector graphics',
      icon: <FileText size={16} />,
      supportsOptions: ['layers', 'grid', 'metadata']
    },
    {
      id: 'pdf',
      name: 'PDF Document',
      extension: '.pdf',
      description: 'Printable document format',
      icon: <FileText size={16} />,
      supportsOptions: ['resolution', 'paperSize', 'orientation', 'multiPage', 'metadata']
    },
    {
      id: 'print',
      name: 'Print Layout',
      extension: '.pdf',
      description: 'Optimized for physical printing',
      icon: <Printer size={16} />,
      supportsOptions: ['paperSize', 'orientation', 'printScale', 'margins']
    },
    {
      id: 'json',
      name: 'MapMaker Data',
      extension: '.json',
      description: 'Native format with all data',
      icon: <FileText size={16} />,
      supportsOptions: ['embedImages', 'includeHistory', 'compressData', 'metadata']
    }
  ]

  const currentFormat = exportFormats.find(f => f.id === selectedFormat)

  // Paper size dimensions (inches)
  const paperSizes = {
    letter: { width: 8.5, height: 11 },
    a4: { width: 8.27, height: 11.69 },
    a3: { width: 11.69, height: 16.54 },
    tabloid: { width: 11, height: 17 },
    custom: exportOptions.customSize
  }

  // Update export options
  const updateOptions = useCallback((updates: Partial<ExportOptions>) => {
    setExportOptions(prev => ({ ...prev, ...updates }))
  }, [])

  // Export to PNG/JPG/WebP
  const exportToImage = useCallback(async (): Promise<Blob> => {
    if (!stageRef?.current || !currentMap) {
      throw new Error('No stage or map available for export')
    }

    const stage = stageRef.current
    const originalSize = { width: stage.width(), height: stage.height() }

    // Apply scale for high-resolution export
    const pixelRatio = exportOptions.resolution / 96 * exportOptions.scale

    setExportProgress({ stage: 'Preparing canvas', progress: 20 })

    // Create export configuration
    const exportConfig: any = {
      pixelRatio,
      mimeType: `image/${exportOptions.format}`,
      quality: exportOptions.format === 'jpg' ? exportOptions.quality / 100 : 1
    }

    // Handle cropping to content
    if (exportOptions.cropToContent) {
      const contentBounds = stage.getClientRect({ skipTransform: true })
      exportConfig.x = contentBounds.x - exportOptions.addMargins
      exportConfig.y = contentBounds.y - exportOptions.addMargins
      exportConfig.width = contentBounds.width + exportOptions.addMargins * 2
      exportConfig.height = contentBounds.height + exportOptions.addMargins * 2
    }

    setExportProgress({ stage: 'Rendering image', progress: 60 })

    // Generate image data
    const dataURL = stage.toDataURL(exportConfig)

    setExportProgress({ stage: 'Converting to blob', progress: 80 })

    // Convert to blob
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx?.drawImage(img, 0, 0)

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to create blob'))
          }
        }, exportConfig.mimeType, exportConfig.quality)
      }

      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = dataURL
    })
  }, [stageRef, currentMap, exportOptions])

  // Export to PDF
  const exportToPDF = useCallback(async (): Promise<Blob> => {
    if (!stageRef?.current || !currentMap) {
      throw new Error('No stage or map available for export')
    }

    setExportProgress({ stage: 'Generating PDF', progress: 30 })

    // For now, convert to image first then embed in PDF
    const tempOptions = { ...exportOptions, format: 'png' as const }
    const originalOptions = exportOptions
    setExportOptions(tempOptions)

    try {
      const imageBlob = await exportToImage()
      setExportOptions(originalOptions)

      setExportProgress({ stage: 'Creating PDF document', progress: 70 })

      // This would normally use a PDF library like jsPDF
      // For now, return the image blob (simplified implementation)
      return imageBlob
    } finally {
      setExportOptions(originalOptions)
    }
  }, [stageRef, currentMap, exportOptions, exportToImage])

  // Export to SVG
  const exportToSVG = useCallback(async (): Promise<Blob> => {
    if (!currentMap) {
      throw new Error('No map available for export')
    }

    setExportProgress({ stage: 'Generating SVG', progress: 40 })

    // Create SVG content
    let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${currentMap.width}" height="${currentMap.height}"
     viewBox="0 0 ${currentMap.width} ${currentMap.height}"
     xmlns="http://www.w3.org/2000/svg">
`

    // Add grid if enabled
    if (exportOptions.includeGrid && currentMap.grid?.visible) {
      const gridSize = currentMap.grid.size
      svgContent += `
  <defs>
    <pattern id="grid" width="${gridSize}" height="${gridSize}" patternUnits="userSpaceOnUse">
      <path d="M ${gridSize} 0 L 0 0 0 ${gridSize}" fill="none" stroke="${currentMap.grid.color || '#666666'}" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#grid)" opacity="0.5"/>
`
    }

    setExportProgress({ stage: 'Converting objects', progress: 60 })

    // Convert map objects to SVG
    currentMap.objects.forEach(obj => {
      if (obj.type === 'shape') {
        if (obj.shapeType === 'rect') {
          svgContent += `
  <rect x="${obj.position.x}" y="${obj.position.y}"
        width="${obj.width || 50}" height="${obj.height || 50}"
        fill="${obj.fill || 'none'}"
        stroke="${obj.stroke || '#000'}"
        stroke-width="${obj.strokeWidth || 1}"
        transform="rotate(${obj.rotation || 0} ${obj.position.x + (obj.width || 50)/2} ${obj.position.y + (obj.height || 50)/2})"/>
`
        } else if (obj.shapeType === 'circle') {
          const radius = (obj.width || 50) / 2
          svgContent += `
  <circle cx="${obj.position.x + radius}" cy="${obj.position.y + radius}"
          r="${radius}"
          fill="${obj.fill || 'none'}"
          stroke="${obj.stroke || '#000'}"
          stroke-width="${obj.strokeWidth || 1}"/>
`
        } else if (obj.pathData) {
          svgContent += `
  <path d="${obj.pathData}"
        fill="${obj.fill || 'none'}"
        stroke="${obj.stroke || '#000'}"
        stroke-width="${obj.strokeWidth || 1}"
        transform="translate(${obj.position.x},${obj.position.y})"/>
`
        }
      }
    })

    // Add metadata if enabled
    if (exportOptions.includeMetadata) {
      svgContent += `
  <metadata>
    <mapmaker:export xmlns:mapmaker="https://mapmaker.app">
      <name>${currentMap.name}</name>
      <exportDate>${new Date().toISOString()}</exportDate>
      <resolution>${exportOptions.resolution}</resolution>
    </mapmaker:export>
  </metadata>
`
    }

    svgContent += '</svg>'

    setExportProgress({ stage: 'Creating SVG file', progress: 90 })

    return new Blob([svgContent], { type: 'image/svg+xml' })
  }, [currentMap, exportOptions])

  // Export to JSON
  const exportToJSON = useCallback(async (): Promise<Blob> => {
    if (!currentMap) {
      throw new Error('No map available for export')
    }

    setExportProgress({ stage: 'Preparing data', progress: 30 })

    const exportData = {
      ...currentMap,
      export: {
        version: '1.0',
        date: new Date().toISOString(),
        options: exportOptions,
        metadata: exportOptions.includeMetadata ? {
          created: new Date().toISOString(),
          software: 'MapMaker',
          version: '1.0'
        } : undefined
      }
    }

    setExportProgress({ stage: 'Serializing data', progress: 70 })

    const jsonString = JSON.stringify(
      exportData,
      null,
      exportOptions.compressData ? 0 : 2
    )

    return new Blob([jsonString], { type: 'application/json' })
  }, [currentMap, exportOptions])

  // Main export function
  const handleExport = useCallback(async () => {
    if (!currentMap) return

    setIsExporting(true)
    setExportProgress({ stage: 'Starting export', progress: 0 })

    try {
      let blob: Blob

      switch (selectedFormat) {
        case 'png':
        case 'jpg':
        case 'webp':
          blob = await exportToImage()
          break
        case 'pdf':
        case 'print':
          blob = await exportToPDF()
          break
        case 'svg':
          blob = await exportToSVG()
          break
        case 'json':
          blob = await exportToJSON()
          break
        default:
          throw new Error(`Unsupported export format: ${selectedFormat}`)
      }

      setExportProgress({ stage: 'Downloading file', progress: 100 })

      // Download the file
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${currentMap.name.replace(/[^a-zA-Z0-9]/g, '_')}_export${currentFormat?.extension}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      // Close dialog after short delay
      setTimeout(() => {
        onClose()
      }, 1000)

    } catch (error) {
      console.error('Export failed:', error)
      alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsExporting(false)
      setExportProgress(null)
    }
  }, [currentMap, selectedFormat, currentFormat, exportToImage, exportToPDF, exportToSVG, exportToJSON, onClose])

  if (!isOpen || !currentMap) return null

  return (
    <>
      {/* Backdrop */}
      <Box
        css={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000
        }}
        onClick={onClose}
      />

      {/* Main Dialog */}
      <Box
        css={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 700,
          maxHeight: '90vh',
          backgroundColor: '$dndBlack',
          border: '1px solid $gray800',
          borderRadius: '$md',
          zIndex: 1001,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <Box
          css={{
            padding: '$4',
            borderBottom: '1px solid $gray800',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Text size="lg" weight="semibold">Enhanced Export System</Text>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={16} />
          </Button>
        </Box>

        <Box css={{ flex: 1, padding: '$4', overflow: 'auto' }}>
          {/* Format Selection */}
          <Box css={{ marginBottom: '$4' }}>
            <Text size="sm" css={{ marginBottom: '$2' }}>Export Format:</Text>
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
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
              {exportFormats.map(format => (
                <option key={format.id} value={format.id}>
                  {format.name} - {format.description}
                </option>
              ))}
            </select>
          </Box>

          {/* Export Options */}
          {currentFormat && (
            <Box css={{ marginBottom: '$4' }}>
              <Text size="sm" css={{ marginBottom: '$3' }}>Export Options:</Text>

              {/* Image Options */}
              {currentFormat.supportsOptions.includes('resolution') && (
                <Box css={{ marginBottom: '$3' }}>
                  <Text size="xs" css={{ marginBottom: '$1' }}>Resolution (DPI):</Text>
                  <input
                    type="number"
                    value={exportOptions.resolution}
                    onChange={(e) => updateOptions({ resolution: Number(e.target.value) })}
                    min="72"
                    max="600"
                    style={{
                      width: '100px',
                      padding: '4px 8px',
                      backgroundColor: 'var(--colors-gray800)',
                      border: '1px solid var(--colors-gray700)',
                      borderRadius: '4px',
                      color: 'var(--colors-gray100)',
                      fontSize: '12px'
                    }}
                  />
                </Box>
              )}

              {/* Scale */}
              {currentFormat.supportsOptions.includes('scale') && (
                <Box css={{ marginBottom: '$3' }}>
                  <Text size="xs" css={{ marginBottom: '$1' }}>Scale Multiplier:</Text>
                  <input
                    type="range"
                    min="0.5"
                    max="4"
                    step="0.1"
                    value={exportOptions.scale}
                    onChange={(e) => updateOptions({ scale: Number(e.target.value) })}
                    style={{ width: '200px', accentColor: 'var(--colors-secondary)' }}
                  />
                  <Text size="xs" css={{ color: '$gray400', marginLeft: '$2' }}>
                    {exportOptions.scale}x
                  </Text>
                </Box>
              )}

              {/* Quality (JPG/WebP) */}
              {currentFormat.supportsOptions.includes('quality') && exportOptions.format !== 'png' && (
                <Box css={{ marginBottom: '$3' }}>
                  <Text size="xs" css={{ marginBottom: '$1' }}>Quality:</Text>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={exportOptions.quality}
                    onChange={(e) => updateOptions({ quality: Number(e.target.value) })}
                    style={{ width: '200px', accentColor: 'var(--colors-secondary)' }}
                  />
                  <Text size="xs" css={{ color: '$gray400', marginLeft: '$2' }}>
                    {exportOptions.quality}%
                  </Text>
                </Box>
              )}

              {/* Checkboxes */}
              <Box css={{ display: 'flex', flexDirection: 'column', gap: '$2' }}>
                {currentFormat.supportsOptions.includes('grid') && (
                  <Box css={{ display: 'flex', alignItems: 'center', gap: '$2' }}>
                    <Checkbox
                      checked={exportOptions.includeGrid}
                      onCheckedChange={(checked) => updateOptions({ includeGrid: !!checked })}
                    />
                    <Text size="xs">Include grid lines</Text>
                  </Box>
                )}

                {currentFormat.supportsOptions.includes('transparency') && (
                  <Box css={{ display: 'flex', alignItems: 'center', gap: '$2' }}>
                    <Checkbox
                      checked={exportOptions.transparency}
                      onCheckedChange={(checked) => updateOptions({ transparency: !!checked })}
                    />
                    <Text size="xs">Preserve transparency</Text>
                  </Box>
                )}

                {currentFormat.supportsOptions.includes('metadata') && (
                  <Box css={{ display: 'flex', alignItems: 'center', gap: '$2' }}>
                    <Checkbox
                      checked={exportOptions.includeMetadata}
                      onCheckedChange={(checked) => updateOptions({ includeMetadata: !!checked })}
                    />
                    <Text size="xs">Include metadata</Text>
                  </Box>
                )}

                {currentFormat.supportsOptions.includes('embedImages') && (
                  <Box css={{ display: 'flex', alignItems: 'center', gap: '$2' }}>
                    <Checkbox
                      checked={exportOptions.embedImages}
                      onCheckedChange={(checked) => updateOptions({ embedImages: !!checked })}
                    />
                    <Text size="xs">Embed images in file</Text>
                  </Box>
                )}

                <Box css={{ display: 'flex', alignItems: 'center', gap: '$2' }}>
                  <Checkbox
                    checked={exportOptions.cropToContent}
                    onCheckedChange={(checked) => updateOptions({ cropToContent: !!checked })}
                  />
                  <Text size="xs">Crop to content bounds</Text>
                </Box>
              </Box>

              {/* Paper Size (PDF/Print) */}
              {currentFormat.supportsOptions.includes('paperSize') && (
                <Box css={{ marginTop: '$3' }}>
                  <Text size="xs" css={{ marginBottom: '$1' }}>Paper Size:</Text>
                  <select
                    value={exportOptions.paperSize}
                    onChange={(e) => updateOptions({ paperSize: e.target.value as any })}
                    style={{
                      width: '150px',
                      padding: '4px 8px',
                      backgroundColor: 'var(--colors-gray800)',
                      border: '1px solid var(--colors-gray700)',
                      borderRadius: '4px',
                      color: 'var(--colors-gray100)',
                      fontSize: '12px'
                    }}
                  >
                    <option value="letter">Letter (8.5" × 11")</option>
                    <option value="a4">A4 (210 × 297 mm)</option>
                    <option value="a3">A3 (297 × 420 mm)</option>
                    <option value="tabloid">Tabloid (11" × 17")</option>
                    <option value="custom">Custom</option>
                  </select>

                  <Box css={{ marginTop: '$2', display: 'flex', gap: '$2' }}>
                    <Box css={{ display: 'flex', alignItems: 'center', gap: '$1' }}>
                      <Checkbox
                        checked={exportOptions.orientation === 'portrait'}
                        onCheckedChange={(checked) =>
                          updateOptions({ orientation: checked ? 'portrait' : 'landscape' })
                        }
                      />
                      <Text size="xs">Portrait</Text>
                    </Box>
                    <Box css={{ display: 'flex', alignItems: 'center', gap: '$1' }}>
                      <Checkbox
                        checked={exportOptions.orientation === 'landscape'}
                        onCheckedChange={(checked) =>
                          updateOptions({ orientation: checked ? 'landscape' : 'portrait' })
                        }
                      />
                      <Text size="xs">Landscape</Text>
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
          )}

          {/* Progress */}
          {exportProgress && (
            <Box css={{ marginBottom: '$4' }}>
              <Text size="sm" css={{ marginBottom: '$2' }}>{exportProgress.stage}</Text>
              <Box
                css={{
                  width: '100%',
                  height: 8,
                  backgroundColor: '$gray800',
                  borderRadius: '$sm',
                  overflow: 'hidden'
                }}
              >
                <Box
                  css={{
                    width: `${exportProgress.progress}%`,
                    height: '100%',
                    backgroundColor: '$primary',
                    transition: 'width 0.3s'
                  }}
                />
              </Box>
            </Box>
          )}

          {/* Preview Info */}
          <Box css={{ padding: '$3', backgroundColor: '$gray800', borderRadius: '$sm' }}>
            <Text size="xs" css={{ color: '$gray400' }}>
              Export Preview:<br />
              Map: {currentMap.name}<br />
              Size: {currentMap.width}×{currentMap.height}<br />
              Objects: {currentMap.objects.length}<br />
              {currentFormat && `Format: ${currentFormat.name}`}
            </Text>
          </Box>
        </Box>

        {/* Footer */}
        <Box
          css={{
            padding: '$4',
            borderTop: '1px solid $gray800',
            display: 'flex',
            justifyContent: 'space-between'
          }}
        >
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>

          <Button
            onClick={handleExport}
            disabled={!currentMap || isExporting}
          >
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
        </Box>
      </Box>
    </>
  )
}

export default EnhancedExportSystem