/**
 * Enhanced Export System Component (Refactored with Strategy Pattern)
 * Advanced export functionality using format-specific exporters
 */

import { useCallback, useState, type FC, type RefObject } from 'react'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Button } from '@/components/primitives/ButtonVE'
import { Download, X } from '@/utils/optimizedIcons'
import useMapStore from '@/store/mapStore'
import type Konva from 'konva'
import { exporterRegistry, type ExportOptions, type ExportFormatId, type ExportContext } from './exporters'

// Re-export types for backward compatibility
export type { ExportOptions, ExportFormat } from './exporters'

export interface EnhancedExportSystemProps {
  isOpen: boolean
  onClose: () => void
  stageRef?: RefObject<Konva.Stage>
}

export const EnhancedExportSystemRefactored: FC<EnhancedExportSystemProps> = ({
  isOpen,
  onClose,
  stageRef
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormatId>('png')
  const [exportOptions] = useState<ExportOptions>({
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

  /**
   * Main export function using Strategy Pattern
   * O(1) exporter lookup via registry
   */
  const handleExport = useCallback(async () => {
    if (!currentMap || !stageRef) return

    setIsExporting(true)
    setExportProgress({ stage: 'Starting export', progress: 0 })

    try {
      // Get appropriate exporter using Strategy Pattern
      const exporter = exporterRegistry.getExporter(selectedFormat)

      // Validate options before export
      exporter.validateOptions(exportOptions)

      // Create export context
      const context: ExportContext = {
        stageRef,
        currentMap,
        options: exportOptions,
        onProgress: (stage, progress) => {
          setExportProgress({ stage, progress })
        }
      }

      // Execute export using selected strategy
      const blob = await exporter.export(context)

      setExportProgress({ stage: 'Downloading file', progress: 100 })

      // Get file extension
      const extensionMap: Record<ExportFormatId, string> = {
        png: '.png',
        jpg: '.jpg',
        webp: '.webp',
        svg: '.svg',
        pdf: '.pdf',
        print: '.pdf',
        json: '.json'
      }
      const extension = extensionMap[selectedFormat] || '.png'

      // Download the file
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${currentMap.name.replace(/[^a-zA-Z0-9]/g, '_')}_export${extension}`
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
  }, [currentMap, stageRef, selectedFormat, exportOptions, onClose])

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
          width: '600px',
          maxHeight: '80vh',
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
            style={{ margin: 0, fontWeight: '600', color: 'var(--colors-gray100)' }}
          >
            Export Map
          </Text>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={20} />
          </Button>
        </Box>

        {/* Content */}
        <Box style={{ padding: '16px', flex: '1', overflow: 'auto' }}>
          <Text style={{ marginBottom: '16px', color: 'var(--colors-gray300)' }}>
            Export system using Strategy Pattern for optimal performance
          </Text>

          {/* Format Selection - Simplified for demo */}
          <Box style={{ marginBottom: '16px' }}>
            <Text style={{ marginBottom: '8px', fontWeight: '600' }}>Export Format</Text>
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value as ExportFormatId)}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: 'var(--colors-gray800)',
                color: 'var(--colors-gray100)',
                border: '1px solid var(--colors-gray700)',
                borderRadius: '4px'
              }}
            >
              <option value="png">PNG Image</option>
              <option value="jpg">JPEG Image</option>
              <option value="webp">WebP Image</option>
              <option value="svg">SVG Vector</option>
              <option value="pdf">PDF Document</option>
              <option value="print">Print Layout</option>
              <option value="json">MapMaker Data (JSON)</option>
            </select>
          </Box>

          {/* Progress Indicator */}
          {exportProgress && (
            <Box
              style={{
                marginTop: '16px',
                padding: '12px',
                backgroundColor: 'var(--colors-gray800)',
                borderRadius: '8px'
              }}
            >
              <Text style={{ marginBottom: '8px', fontSize: '14px' }}>
                {exportProgress.stage}
              </Text>
              <Box
                style={{
                  width: '100%',
                  height: '4px',
                  backgroundColor: 'var(--colors-gray700)',
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}
              >
                <Box
                  style={{
                    width: `${exportProgress.progress}%`,
                    height: '100%',
                    backgroundColor: 'var(--colors-dndRed)',
                    transition: 'width 0.3s ease'
                  }}
                />
              </Box>
            </Box>
          )}
        </Box>

        {/* Footer */}
        <Box
          style={{
            padding: '16px',
            borderTop: '1px solid var(--colors-gray700)',
            backgroundColor: 'var(--colors-gray800)',
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end'
          }}
        >
          <Button variant="outline" onClick={onClose} disabled={isExporting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleExport} disabled={isExporting}>
            <Download size={16} style={{ marginRight: '8px' }} />
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
        </Box>
      </Box>
    </>
  )
}
