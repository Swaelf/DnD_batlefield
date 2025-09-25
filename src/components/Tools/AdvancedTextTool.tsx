import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Group, Text, Rect } from 'react-konva'
import Konva from 'konva'
import type { Point } from '@/types/geometry'
import { snapToGrid } from '@/utils/grid'

interface AdvancedTextToolProps {
  isActive: boolean
  gridSize: number
  gridSnap: boolean
  onTextComplete?: (text: {
    x: number
    y: number
    text: string
    fontSize: number
    fontFamily: string
    fill: string
    align: string
    fontStyle: string
  }) => void
  onCancel?: () => void
}

const FONT_FAMILIES = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Courier New',
  'Verdana',
  'Georgia',
  'Scala Sans',
  'serif',
  'sans-serif',
  'monospace'
]

const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 60, 72]

export const AdvancedTextTool: React.FC<AdvancedTextToolProps> = ({
  isActive,
  gridSize,
  gridSnap,
  onTextComplete,
  onCancel
}) => {
  const groupRef = useRef<Konva.Group>(null)
  const textRef = useRef<Konva.Text>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [position, setPosition] = useState<Point | null>(null)
  const [text, setText] = useState('')
  const [fontSize, setFontSize] = useState(16)
  const [fontFamily, setFontFamily] = useState('Arial')
  const [fontColor, setFontColor] = useState('#FFFFFF')
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left')
  const [fontStyle, setFontStyle] = useState<'normal' | 'bold' | 'italic'>('normal')
  const [currentFontIndex, setCurrentFontIndex] = useState(0)
  const [currentSizeIndex, setCurrentSizeIndex] = useState(4) // 16px

  // Handle keyboard shortcuts for formatting
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isActive || !isEditing) return

      // Font size controls
      if (e.key === 'ArrowUp' && e.ctrlKey) {
        e.preventDefault()
        setCurrentSizeIndex(prev => Math.min(FONT_SIZES.length - 1, prev + 1))
        setFontSize(FONT_SIZES[Math.min(FONT_SIZES.length - 1, currentSizeIndex + 1)])
      } else if (e.key === 'ArrowDown' && e.ctrlKey) {
        e.preventDefault()
        setCurrentSizeIndex(prev => Math.max(0, prev - 1))
        setFontSize(FONT_SIZES[Math.max(0, currentSizeIndex - 1)])
      }

      // Font family cycling
      else if (e.key === 'ArrowLeft' && e.ctrlKey) {
        e.preventDefault()
        setCurrentFontIndex(prev => (prev - 1 + FONT_FAMILIES.length) % FONT_FAMILIES.length)
        setFontFamily(FONT_FAMILIES[(currentFontIndex - 1 + FONT_FAMILIES.length) % FONT_FAMILIES.length])
      } else if (e.key === 'ArrowRight' && e.ctrlKey) {
        e.preventDefault()
        setCurrentFontIndex(prev => (prev + 1) % FONT_FAMILIES.length)
        setFontFamily(FONT_FAMILIES[(currentFontIndex + 1) % FONT_FAMILIES.length])
      }

      // Text alignment
      else if (e.key === '1' && e.ctrlKey) {
        e.preventDefault()
        setTextAlign('left')
      } else if (e.key === '2' && e.ctrlKey) {
        e.preventDefault()
        setTextAlign('center')
      } else if (e.key === '3' && e.ctrlKey) {
        e.preventDefault()
        setTextAlign('right')
      }

      // Font style toggles
      else if (e.key === 'b' && e.ctrlKey) {
        e.preventDefault()
        setFontStyle(prev => prev === 'bold' ? 'normal' : 'bold')
      } else if (e.key === 'i' && e.ctrlKey) {
        e.preventDefault()
        setFontStyle(prev => prev === 'italic' ? 'normal' : 'italic')
      }

      // Complete text
      else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleComplete()
      }

      // Cancel
      else if (e.key === 'Escape') {
        handleCancel()
      }

      // Color shortcuts
      else if (e.key === 'w' && e.ctrlKey) {
        e.preventDefault()
        setFontColor('#FFFFFF')
      } else if (e.key === 'k' && e.ctrlKey) {
        e.preventDefault()
        setFontColor('#000000')
      } else if (e.key === 'r' && e.ctrlKey) {
        e.preventDefault()
        setFontColor('#FF0000')
      }
    }

    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isActive || !isEditing) return

      // Regular text input
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        setText(prev => prev + e.key)
      } else if (e.key === 'Backspace') {
        setText(prev => prev.slice(0, -1))
      } else if (e.key === 'Enter' && e.shiftKey) {
        setText(prev => prev + '\n')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keypress', handleKeyPress)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keypress', handleKeyPress)
    }
  }, [isActive, isEditing, currentSizeIndex, currentFontIndex])

  const handleCancel = useCallback(() => {
    setIsEditing(false)
    setPosition(null)
    setText('')
    setFontSize(16)
    setFontFamily('Arial')
    setFontColor('#FFFFFF')
    setTextAlign('left')
    setFontStyle('normal')
    setCurrentFontIndex(0)
    setCurrentSizeIndex(4)
    onCancel?.()
  }, [onCancel])

  const handleComplete = useCallback(() => {
    if (!position || !text.trim()) {
      handleCancel()
      return
    }

    onTextComplete?.({
      x: position.x,
      y: position.y,
      text: text.trim(),
      fontSize,
      fontFamily,
      fill: fontColor,
      align: textAlign,
      fontStyle
    })

    // Reset state
    setIsEditing(false)
    setPosition(null)
    setText('')
    setFontSize(16)
    setFontFamily('Arial')
    setFontColor('#FFFFFF')
    setTextAlign('left')
    setFontStyle('normal')
    setCurrentFontIndex(0)
    setCurrentSizeIndex(4)
  }, [position, text, fontSize, fontFamily, fontColor, textAlign, fontStyle, onTextComplete, handleCancel])

  const handleClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isActive || isEditing) return

    const stage = e.target.getStage()
    if (!stage) return

    const pointer = stage.getPointerPosition()
    if (!pointer) return

    const transform = stage.getAbsoluteTransform().copy().invert()
    const pos = transform.point(pointer)

    const snappedPos = gridSnap ? snapToGrid(pos, gridSize) : pos

    setPosition(snappedPos)
    setIsEditing(true)
    setText('Type here...')
  }, [isActive, isEditing, gridSnap, gridSize])

  if (!isActive || !isEditing || !position) {
    return (
      <Group onClick={handleClick} />
    )
  }

  // Calculate text metrics for background
  const textWidth = text.length * fontSize * 0.6 // Rough approximation
  const textHeight = fontSize * 1.2

  return (
    <Group ref={groupRef}>
      {/* Text background */}
      <Rect
        x={position.x - 5}
        y={position.y - 5}
        width={textWidth + 10}
        height={textHeight + 10}
        fill="rgba(0, 0, 0, 0.3)"
        cornerRadius={4}
        listening={false}
      />

      {/* Text preview */}
      <Text
        ref={textRef}
        x={position.x}
        y={position.y}
        text={text || 'Type here...'}
        fontSize={fontSize}
        fontFamily={fontFamily}
        fill={text ? fontColor : '#888888'}
        align={textAlign}
        fontStyle={fontStyle}
        opacity={text ? 1 : 0.7}
        listening={false}
      />

      {/* Cursor */}
      <Rect
        x={position.x + textWidth}
        y={position.y}
        width={2}
        height={fontSize}
        fill={fontColor}
        opacity={0.8}
        listening={false}
      />

      {/* Format panel */}
      <Group x={position.x} y={position.y - 80}>
        {/* Background */}
        <Rect
          width={200}
          height={70}
          fill="rgba(0, 0, 0, 0.8)"
          cornerRadius={8}
          stroke="#C9AD6A"
          strokeWidth={1}
        />

        {/* Font info */}
        <Text
          x={10}
          y={10}
          text={`Font: ${fontFamily}`}
          fontSize={12}
          fill="#FFFFFF"
          listening={false}
        />

        <Text
          x={10}
          y={25}
          text={`Size: ${fontSize}px`}
          fontSize={12}
          fill="#FFFFFF"
          listening={false}
        />

        <Text
          x={10}
          y={40}
          text={`Style: ${fontStyle} | Align: ${textAlign}`}
          fontSize={12}
          fill="#FFFFFF"
          listening={false}
        />

        {/* Color indicator */}
        <Rect
          x={170}
          y={10}
          width={20}
          height={20}
          fill={fontColor}
          stroke="#FFFFFF"
          strokeWidth={1}
        />
      </Group>

      {/* Instructions panel */}
      <Group x={position.x + 220} y={position.y - 80}>
        <Rect
          width={180}
          height={140}
          fill="rgba(0, 0, 0, 0.9)"
          cornerRadius={8}
          stroke="#C9AD6A"
          strokeWidth={1}
        />

        <Text
          x={10}
          y={10}
          text="Text Tool Controls:"
          fontSize={14}
          fill="#C9AD6A"
          fontStyle="bold"
          listening={false}
        />

        <Text
          x={10}
          y={30}
          text={`Ctrl+↑/↓: Font size
Ctrl+←/→: Font family
Ctrl+1/2/3: Align L/C/R
Ctrl+B: Bold toggle
Ctrl+I: Italic toggle
Ctrl+W/K/R: White/Black/Red
Enter: Complete
Esc: Cancel`}
          fontSize={10}
          fill="#FFFFFF"
          listening={false}
        />
      </Group>
    </Group>
  )
}

export default AdvancedTextTool