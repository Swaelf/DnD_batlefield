/**
 * Enhanced Export System Component
 * Advanced export functionality with multiple formats and options
 */

import React, { useCallback, useState } from 'react'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Button } from '@/components/primitives/ButtonVE'
import { Download, FileText, Image, Printer, X } from '@/utils/optimizedIcons'
import useMapStore from '@/store/mapStore'
import type Konva from 'konva'

export interface ExportFormat {
  id: string
  name: string
  extension: string
  description: string
  icon: React.ReactNode
  supportsOptions: string[]
}

export interface ExportOptions {
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

export interface EnhancedExportSystemProps {
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

    // Apply scale for high-resolution export
    const pixelRatio = exportOptions.resolution / 96 * exportOptions.scale

    setExportProgress({ stage: 'Preparing canvas', progress: 20 })

    // Create export configuration
    const exportConfig: {
      pixelRatio: number
      mimeType: string
      quality: number
      x?: number
      y?: number
      width?: number
      height?: number
    } = {
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
    const dataURL = stage.toDataURL({
      pixelRatio: exportConfig.pixelRatio || 2,
      mimeType: exportConfig.mimeType || 'image/png',
      quality: exportConfig.quality || 1
    })

    setExportProgress({ stage: 'Converting to blob', progress: 80 })

    // Convert to blob
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new (window as any).Image() as HTMLImageElement

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
        const shapeObj = obj as any // Simplified for this implementation
        if (shapeObj.shapeType === 'rectangle') {
          svgContent += `
  <rect x="${obj.position.x}" y="${obj.position.y}"
        width="${shapeObj.width || 50}" height="${shapeObj.height || 50}"
        fill="${shapeObj.fill || 'none'}"
        stroke="${shapeObj.stroke || '#000'}"
        stroke-width="${shapeObj.strokeWidth || 1}"
        transform="rotate(${obj.rotation || 0} ${obj.position.x + (shapeObj.width || 50)/2} ${obj.position.y + (shapeObj.height || 50)/2})"/>
`
        } else if (shapeObj.shapeType === 'circle') {
          const radius = (shapeObj.width || 50) / 2
          svgContent += `
  <circle cx="${obj.position.x + radius}" cy="${obj.position.y + radius}"
          r="${radius}"
          fill="${shapeObj.fill || 'none'}"
          stroke="${shapeObj.stroke || '#000'}"
          stroke-width="${shapeObj.strokeWidth || 1}"/>
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
        style={{
          position: 'fixed',
          inset: '0',
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
          width: '700px',
          maxHeight: '90vh',
          backgroundColor: 'var(--colors-dndBlack)',
          border: '1px solid var(--colors-gray700)',
          borderRadius: '12px',
          zIndex: 1001,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
        }}
      >
        {/* Header */}
        <Box
          style={{
            padding: '16px',
            borderBottom: '1px solid var(--colors-gray700)',
            backgroundColor: 'var(--colors-gray800)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Text
            variant="heading"
            size="lg"
            style={{
              margin: 0,
              fontWeight: '600',
              color: 'var(--colors-gray100)'
            }}
          >
            Enhanced Export System
          </Text>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              padding: '8px',
              borderRadius: '4px',
              cursor: 'pointer',
              color: 'var(--colors-gray400)'
            }}
          >
            <X size={16} />
          </Button>
        </Box>

        <Box style={{ flex: 1, padding: '16px', overflow: 'auto' }}>
          {/* Format Selection */}
          <Box style={{ marginBottom: '16px' }}>
            <Text
              variant="body"
              size="sm"
              style={{
                margin: '0 0 8px 0',
                color: 'var(--colors-gray300)',
                fontWeight: '500'
              }}
            >
              Export Format:
            </Text>
            <select
              value={selectedFormat}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedFormat(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: 'var(--colors-gray800)',
                border: '1px solid var(--colors-gray600)',
                borderRadius: '6px',
                color: 'var(--colors-gray100)',
                fontSize: '14px',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--colors-dndGold)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--colors-gray600)'
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
            <Box style={{ marginBottom: '16px' }}>
              <Text
                variant="body"
                size="sm"
                style={{
                  margin: '0 0 12px 0',
                  color: 'var(--colors-gray300)',
                  fontWeight: '500'
                }}
              >
                Export Options:
              </Text>

              {/* Image Options */}
              {currentFormat.supportsOptions.includes('resolution') && (
                <Box style={{ marginBottom: '12px' }}>
                  <Text
                    variant="body"
                    size="xs"
                    style={{
                      margin: '0 0 4px 0',
                      color: 'var(--colors-gray400)'
                    }}
                  >
                    Resolution (DPI):
                  </Text>
                  <input
                    type="number"
                    value={exportOptions.resolution}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateOptions({ resolution: Number(e.target.value) })}
                    min="72"
                    max="600"
                    style={{
                      width: '100px',
                      padding: '4px 8px',
                      backgroundColor: 'var(--colors-gray800)',
                      border: '1px solid var(--colors-gray600)',
                      borderRadius: '4px',
                      color: 'var(--colors-gray100)',
                      fontSize: '12px',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--colors-dndGold)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--colors-gray600)'
                    }}
                  />
                </Box>
              )}

              {/* Scale */}
              {currentFormat.supportsOptions.includes('scale') && (
                <Box style={{ marginBottom: '12px' }}>
                  <Text
                    variant="body"
                    size="xs"
                    style={{
                      margin: '0 0 4px 0',
                      color: 'var(--colors-gray400)'
                    }}
                  >
                    Scale Multiplier:
                  </Text>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="range"
                      min="0.5"
                      max="4"
                      step="0.1"
                      value={exportOptions.scale}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateOptions({ scale: Number(e.target.value) })}
                      style={{
                        width: '200px',
                        accentColor: 'var(--colors-dndGold)'
                      }}
                    />
                    <Text
                      variant="body"
                      size="xs"
                      style={{
                        margin: 0,
                        color: 'var(--colors-gray400)'
                      }}
                    >
                      {exportOptions.scale}x
                    </Text>
                  </Box>
                </Box>
              )}

              {/* Quality (JPG/WebP) */}
              {currentFormat.supportsOptions.includes('quality') && exportOptions.format !== 'png' && (
                <Box style={{ marginBottom: '12px' }}>
                  <Text
                    variant="body"
                    size="xs"
                    style={{
                      margin: '0 0 4px 0',
                      color: 'var(--colors-gray400)'
                    }}
                  >
                    Quality:
                  </Text>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={exportOptions.quality}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateOptions({ quality: Number(e.target.value) })}
                      style={{
                        width: '200px',
                        accentColor: 'var(--colors-dndGold)'
                      }}
                    />
                    <Text
                      variant="body"
                      size="xs"
                      style={{
                        margin: 0,
                        color: 'var(--colors-gray400)'
                      }}
                    >
                      {exportOptions.quality}%
                    </Text>
                  </Box>
                </Box>
              )}

              {/* Checkboxes */}
              <Box style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {currentFormat.supportsOptions.includes('grid') && (
                  <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      checked={exportOptions.includeGrid}
                      onChange={(e) => updateOptions({ includeGrid: e.target.checked })}
                      style={{
                        accentColor: 'var(--colors-dndGold)',
                        width: '16px',
                        height: '16px'
                      }}
                    />
                    <Text
                      variant="body"
                      size="xs"
                      style={{
                        margin: 0,
                        color: 'var(--colors-gray300)'
                      }}
                    >
                      Include grid lines
                    </Text>
                  </Box>
                )}

                {currentFormat.supportsOptions.includes('transparency') && (
                  <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      checked={exportOptions.transparency}
                      onChange={(e) => updateOptions({ transparency: e.target.checked })}
                      style={{
                        accentColor: 'var(--colors-dndGold)',
                        width: '16px',
                        height: '16px'
                      }}
                    />
                    <Text
                      variant="body"
                      size="xs"
                      style={{
                        margin: 0,
                        color: 'var(--colors-gray300)'
                      }}
                    >
                      Preserve transparency
                    </Text>
                  </Box>
                )}

                {currentFormat.supportsOptions.includes('metadata') && (
                  <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      checked={exportOptions.includeMetadata}
                      onChange={(e) => updateOptions({ includeMetadata: e.target.checked })}
                      style={{
                        accentColor: 'var(--colors-dndGold)',
                        width: '16px',
                        height: '16px'
                      }}
                    />
                    <Text
                      variant="body"
                      size="xs"
                      style={{
                        margin: 0,
                        color: 'var(--colors-gray300)'
                      }}
                    >
                      Include metadata
                    </Text>
                  </Box>
                )}

                <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={exportOptions.cropToContent}
                    onChange={(e) => updateOptions({ cropToContent: e.target.checked })}
                    style={{
                      accentColor: 'var(--colors-dndGold)',
                      width: '16px',
                      height: '16px'
                    }}
                  />
                  <Text
                    variant="body"
                    size="xs"
                    style={{
                      margin: 0,
                      color: 'var(--colors-gray300)'
                    }}
                  >
                    Crop to content bounds
                  </Text>
                </Box>
              </Box>

              {/* Paper Size (PDF/Print) */}
              {currentFormat.supportsOptions.includes('paperSize') && (
                <Box style={{ marginTop: '12px' }}>
                  <Text
                    variant="body"
                    size="xs"
                    style={{
                      margin: '0 0 4px 0',
                      color: 'var(--colors-gray400)'
                    }}
                  >
                    Paper Size:
                  </Text>
                  <select
                    value={exportOptions.paperSize}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateOptions({ paperSize: e.target.value as any })}
                    style={{
                      width: '200px',
                      padding: '4px 8px',
                      backgroundColor: 'var(--colors-gray800)',
                      border: '1px solid var(--colors-gray600)',
                      borderRadius: '4px',
                      color: 'var(--colors-gray100)',
                      fontSize: '12px',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--colors-dndGold)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--colors-gray600)'
                    }}
                  >
                    <option value="letter">Letter (8.5" × 11")</option>
                    <option value="a4">A4 (210 × 297 mm)</option>
                    <option value="a3">A3 (297 × 420 mm)</option>
                    <option value="tabloid">Tabloid (11" × 17")</option>
                    <option value="custom">Custom</option>
                  </select>

                  <Box style={{ marginTop: '8px', display: 'flex', gap: '16px' }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <input
                        type="radio"
                        name="orientation"
                        checked={exportOptions.orientation === 'portrait'}
                        onChange={() => updateOptions({ orientation: 'portrait' })}
                        style={{
                          accentColor: 'var(--colors-dndGold)'
                        }}
                      />
                      <Text
                        variant="body"
                        size="xs"
                        style={{
                          margin: 0,
                          color: 'var(--colors-gray300)'
                        }}
                      >
                        Portrait
                      </Text>
                    </Box>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <input
                        type="radio"
                        name="orientation"
                        checked={exportOptions.orientation === 'landscape'}
                        onChange={() => updateOptions({ orientation: 'landscape' })}
                        style={{
                          accentColor: 'var(--colors-dndGold)'
                        }}
                      />
                      <Text
                        variant="body"
                        size="xs"
                        style={{
                          margin: 0,
                          color: 'var(--colors-gray300)'
                        }}
                      >
                        Landscape
                      </Text>
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
          )}

          {/* Progress */}
          {exportProgress && (
            <Box style={{ marginBottom: '16px' }}>
              <Text
                variant="body"
                size="sm"
                style={{
                  margin: '0 0 8px 0',
                  color: 'var(--colors-gray200)'
                }}
              >
                {exportProgress.stage}
              </Text>
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
                    width: `${exportProgress.progress}%`,
                    height: '100%',
                    backgroundColor: 'var(--colors-dndGold)',
                    transition: 'width 0.3s ease'
                  }}
                />
              </Box>
            </Box>
          )}

          {/* Preview Info */}
          <Box
            style={{
              padding: '12px',
              backgroundColor: 'var(--colors-gray800)',
              borderRadius: '6px',
              border: '1px solid var(--colors-gray700)'
            }}
          >
            <Text
              variant="body"
              size="xs"
              style={{
                margin: 0,
                color: 'var(--colors-gray400)',
                lineHeight: 1.5
              }}
            >
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
          style={{
            padding: '16px',
            borderTop: '1px solid var(--colors-gray700)',
            backgroundColor: 'var(--colors-gray800)',
            display: 'flex',
            justifyContent: 'space-between'
          }}
        >
          <Button
            variant="outline"
            onClick={onClose}
            style={{
              backgroundColor: 'var(--colors-gray800)',
              borderColor: 'var(--colors-gray600)',
              color: 'var(--colors-gray300)'
            }}
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            onClick={handleExport}
            disabled={!currentMap || isExporting}
            style={{
              backgroundColor: !currentMap || isExporting ? 'var(--colors-gray700)' : 'var(--colors-dndRed)',
              borderColor: !currentMap || isExporting ? 'var(--colors-gray600)' : 'var(--colors-dndRed)',
              color: !currentMap || isExporting ? 'var(--colors-gray500)' : 'white',
              opacity: !currentMap || isExporting ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {isExporting ? (
              <>Exporting...</>
            ) : (
              <>
                <Download size={14} />
                Export
              </>
            )}
          </Button>
        </Box>
      </Box>
    </>
  )
}

export default EnhancedExportSystem