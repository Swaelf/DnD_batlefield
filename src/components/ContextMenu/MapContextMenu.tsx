import React, { useEffect, useRef, useCallback } from 'react'
import {
  Square,
  Circle,
  Type,
  Users,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  MousePointer2
} from 'lucide-react'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Button } from '@/components/primitives/ButtonVE'
import useMapStore from '@/store/mapStore'
import useToolStore from '@/store/toolStore'
import { nanoid } from 'nanoid'
import type { ToolType } from '@/types'

type MapContextMenuProps = {
  position: { x: number; y: number }
  canvasPosition: { x: number; y: number }
  onClose: () => void
}

export const MapContextMenu: React.FC<MapContextMenuProps> = ({
  position,
  canvasPosition,
  onClose
}) => {
  const menuRef = useRef<HTMLDivElement>(null)

  // Use specific selectors to prevent unnecessary re-renders
  const currentMap = useMapStore(state => state.currentMap)
  const addObject = useMapStore(state => state.addObject)
  const toggleGridVisibility = useMapStore(state => state.toggleGridVisibility)
  const toggleGridSnap = useMapStore(state => state.toggleGridSnap)
  const setTool = useToolStore(state => state.setTool)
  const fillColor = useToolStore(state => state.fillColor)
  const strokeColor = useToolStore(state => state.strokeColor)
  const strokeWidth = useToolStore(state => state.strokeWidth)

  // Handle clicks outside menu
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      onClose()
    }
  }, [onClose])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }, [onClose])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [handleKeyDown, handleClickOutside])

  const handleAddRectangle = useCallback(() => {
    const rect = {
      id: nanoid(),
      type: 'shape' as const,
      shapeType: 'rectangle' as const,
      position: canvasPosition,
      width: 100,
      height: 100,
      rotation: 0,
      layer: 1,
      fill: fillColor,
      fillColor: fillColor,
      stroke: strokeColor,
      strokeColor: strokeColor,
      strokeWidth: strokeWidth,
      opacity: 1
    }
    addObject(rect)
    onClose()
  }, [canvasPosition, fillColor, strokeColor, strokeWidth, addObject, onClose])

  const handleAddCircle = useCallback(() => {
    const circle = {
      id: nanoid(),
      type: 'shape' as const,
      shapeType: 'circle' as const,
      position: canvasPosition,
      radius: 50,
      rotation: 0,
      layer: 1,
      fill: fillColor,
      fillColor: fillColor,
      stroke: strokeColor,
      strokeColor: strokeColor,
      strokeWidth: strokeWidth,
      opacity: 1
    }
    addObject(circle)
    onClose()
  }, [canvasPosition, fillColor, strokeColor, strokeWidth, addObject, onClose])

  const handleAddToken = useCallback(() => {
    const token = {
      id: nanoid(),
      type: 'token' as const,
      position: canvasPosition,
      rotation: 0,
      layer: 2,
      size: 'medium' as const,
      name: 'New Token',
      color: fillColor,
      shape: 'circle' as const,
      showLabel: true,
      labelPosition: 'bottom' as const,
      opacity: 1,
      borderColor: '#000000',
      borderWidth: 2
    }
    addObject(token)
    onClose()
  }, [canvasPosition, fillColor, addObject, onClose])

  const handleAddText = useCallback(() => {
    const text = {
      id: nanoid(),
      type: 'text' as const,
      position: canvasPosition,
      rotation: 0,
      layer: 3,
      text: 'New Text',
      fontSize: 16,
      fontFamily: 'Scala Sans',
      color: fillColor
    }
    addObject(text)
    onClose()
  }, [canvasPosition, fillColor, addObject, onClose])

  const handleToggleGrid = useCallback(() => {
    toggleGridVisibility()
    onClose()
  }, [toggleGridVisibility, onClose])

  const handleToggleSnap = useCallback(() => {
    toggleGridSnap()
    onClose()
  }, [toggleGridSnap, onClose])

  const handleToolSelect = useCallback((tool: string) => {
    setTool(tool as ToolType)
    onClose()
  }, [setTool, onClose])

  return (
    <>
      {/* Backdrop */}
      <Box
        style={{
          position: 'fixed',
          inset: '0',
          zIndex: 999
        }}
        onClick={onClose}
        onContextMenu={(e: React.MouseEvent) => {
          e.preventDefault()
          onClose()
        }}
      />

      {/* Menu */}
      <Box
        ref={menuRef}
        style={{
          position: 'fixed',
          left: position.x,
          top: position.y,
          zIndex: 1000,
          width: '192px',
          backgroundColor: 'var(--colors-dndBlack)',
          border: '1px solid var(--colors-gray700)',
          borderRadius: '8px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          padding: '4px 0',
          overflow: 'hidden'
        }}
      >
        {/* Add objects */}
        <Box style={{ padding: '4px 8px' }}>
          <Text
            variant="body"
            size="xs"
            style={{
              color: 'var(--colors-gray500)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              padding: '4px 8px',
              margin: 0,
              fontWeight: '500'
            }}
          >
            Add
          </Text>

          <Button
            variant="ghost"
            onClick={handleAddRectangle}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 8px',
              justifyContent: 'flex-start',
              fontSize: '14px',
              color: 'var(--colors-gray200)',
              backgroundColor: 'transparent',
              border: 'none'
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.backgroundColor = 'var(--colors-gray800)'
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <Square size={12} style={{ color: 'var(--colors-gray400)' }} />
            <Text variant="body" size="sm" style={{ margin: 0 }}>Rectangle</Text>
          </Button>

          <Button
            variant="ghost"
            onClick={handleAddCircle}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 8px',
              justifyContent: 'flex-start',
              fontSize: '14px',
              color: 'var(--colors-gray200)',
              backgroundColor: 'transparent',
              border: 'none'
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.backgroundColor = 'var(--colors-gray800)'
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <Circle size={12} style={{ color: 'var(--colors-gray400)' }} />
            <Text variant="body" size="sm" style={{ margin: 0 }}>Circle</Text>
          </Button>

          <Button
            variant="ghost"
            onClick={handleAddToken}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 8px',
              justifyContent: 'flex-start',
              fontSize: '14px',
              color: 'var(--colors-gray200)',
              backgroundColor: 'transparent',
              border: 'none'
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.backgroundColor = 'var(--colors-gray800)'
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <Users size={12} style={{ color: 'var(--colors-gray400)' }} />
            <Text variant="body" size="sm" style={{ margin: 0 }}>Token</Text>
          </Button>

          <Button
            variant="ghost"
            onClick={handleAddText}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 8px',
              justifyContent: 'flex-start',
              fontSize: '14px',
              color: 'var(--colors-gray200)',
              backgroundColor: 'transparent',
              border: 'none'
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.backgroundColor = 'var(--colors-gray800)'
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <Type size={12} style={{ color: 'var(--colors-gray400)' }} />
            <Text variant="body" size="sm" style={{ margin: 0 }}>Text</Text>
          </Button>
        </Box>

        <Box style={{ height: '1px', backgroundColor: 'var(--colors-gray800)', margin: '4px 0' }} />

        {/* Tools */}
        <Box style={{ padding: '4px 8px' }}>
          <Text
            variant="body"
            size="xs"
            style={{
              color: 'var(--colors-gray500)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              padding: '4px 8px',
              margin: 0,
              fontWeight: '500'
            }}
          >
            Tools
          </Text>

          <Button
            variant="ghost"
            onClick={() => handleToolSelect('select')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 8px',
              justifyContent: 'flex-start',
              fontSize: '14px',
              color: 'var(--colors-gray200)',
              backgroundColor: 'transparent',
              border: 'none'
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.backgroundColor = 'var(--colors-gray800)'
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <MousePointer2 size={12} style={{ color: 'var(--colors-gray400)' }} />
            <Text variant="body" size="sm" style={{ margin: 0, flex: 1 }}>Select Tool</Text>
            <Text variant="body" size="xs" style={{ margin: 0, color: 'var(--colors-gray500)', fontFamily: 'monospace' }}>V</Text>
          </Button>

          <Button
            variant="ghost"
            onClick={() => handleToolSelect('rectangle')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 8px',
              justifyContent: 'flex-start',
              fontSize: '14px',
              color: 'var(--colors-gray200)',
              backgroundColor: 'transparent',
              border: 'none'
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.backgroundColor = 'var(--colors-gray800)'
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <Square size={12} style={{ color: 'var(--colors-gray400)' }} />
            <Text variant="body" size="sm" style={{ margin: 0, flex: 1 }}>Rectangle Tool</Text>
            <Text variant="body" size="xs" style={{ margin: 0, color: 'var(--colors-gray500)', fontFamily: 'monospace' }}>R</Text>
          </Button>

          <Button
            variant="ghost"
            onClick={() => handleToolSelect('circle')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 8px',
              justifyContent: 'flex-start',
              fontSize: '14px',
              color: 'var(--colors-gray200)',
              backgroundColor: 'transparent',
              border: 'none'
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.backgroundColor = 'var(--colors-gray800)'
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <Circle size={12} style={{ color: 'var(--colors-gray400)' }} />
            <Text variant="body" size="sm" style={{ margin: 0, flex: 1 }}>Circle Tool</Text>
            <Text variant="body" size="xs" style={{ margin: 0, color: 'var(--colors-gray500)', fontFamily: 'monospace' }}>C</Text>
          </Button>
        </Box>

        <Box style={{ height: '1px', backgroundColor: 'var(--colors-gray800)', margin: '4px 0' }} />

        {/* Grid options */}
        <Box style={{ padding: '4px 8px' }}>
          <Button
            variant="ghost"
            onClick={handleToggleGrid}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 8px',
              justifyContent: 'flex-start',
              fontSize: '14px',
              color: 'var(--colors-gray200)',
              backgroundColor: 'transparent',
              border: 'none'
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.backgroundColor = 'var(--colors-gray800)'
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            {currentMap?.grid.visible ? (
              <EyeOff size={12} style={{ color: 'var(--colors-gray400)' }} />
            ) : (
              <Eye size={12} style={{ color: 'var(--colors-gray400)' }} />
            )}
            <Text variant="body" size="sm" style={{ margin: 0, flex: 1 }}>
              {currentMap?.grid.visible ? 'Hide Grid' : 'Show Grid'}
            </Text>
            <Text variant="body" size="xs" style={{ margin: 0, color: 'var(--colors-gray500)', fontFamily: 'monospace' }}>G</Text>
          </Button>

          <Button
            variant="ghost"
            onClick={handleToggleSnap}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 8px',
              justifyContent: 'flex-start',
              fontSize: '14px',
              color: 'var(--colors-gray200)',
              backgroundColor: 'transparent',
              border: 'none'
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.backgroundColor = 'var(--colors-gray800)'
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            {currentMap?.grid.snap ? (
              <Unlock size={12} style={{ color: 'var(--colors-gray400)' }} />
            ) : (
              <Lock size={12} style={{ color: 'var(--colors-gray400)' }} />
            )}
            <Text variant="body" size="sm" style={{ margin: 0, flex: 1 }}>
              {currentMap?.grid.snap ? 'Disable Snap' : 'Enable Snap'}
            </Text>
            <Text variant="body" size="xs" style={{ margin: 0, color: 'var(--colors-gray500)', fontFamily: 'monospace' }}>Shift+G</Text>
          </Button>
        </Box>
      </Box>
    </>
  )
}