import React, { useCallback, useState, useRef } from 'react'
import { Group, Text as KonvaText, Rect, Circle } from 'react-konva'
import Konva from 'konva'
import useMapStore from '@store/mapStore'
import useToolStore from '@store/toolStore'
import { Point, MapObject } from '@/types'
import { Box, Text, Button, Select, Input } from '@/components/ui'
import { Type, Bold, Italic, AlignLeft, AlignCenter, AlignRight, Palette, RotateCw } from 'lucide-react'

interface TextStyle {
  fontFamily: string
  fontSize: number
  fontStyle: 'normal' | 'italic'
  fontVariant: 'normal' | 'bold'
  fill: string
  stroke?: string
  strokeWidth?: number
  align: 'left' | 'center' | 'right'
  verticalAlign: 'top' | 'middle' | 'bottom'
  lineHeight: number
  letterSpacing: number
  rotation: number
  wrap: 'word' | 'char' | 'none'
  width?: number
  height?: number
}

interface TextEffect {
  type: 'shadow' | 'outline' | 'glow' | 'gradient' | 'underline' | 'strikethrough'
  enabled: boolean
  settings: Record<string, any>
}

interface EnhancedTextObject extends MapObject {
  type: 'text'
  text: string
  textStyle: TextStyle
  effects: TextEffect[]
}

interface TextEnhancementSystemProps {
  isActive: boolean
  onTextComplete?: (textObject: EnhancedTextObject) => void
}

export const TextEnhancementSystem: React.FC<TextEnhancementSystemProps> = ({
  isActive,
  onTextComplete
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [currentText, setCurrentText] = useState('')
  const [textPosition, setTextPosition] = useState<Point>({ x: 100, y: 100 })
  const [textStyle, setTextStyle] = useState<TextStyle>({
    fontFamily: 'Cinzel',
    fontSize: 24,
    fontStyle: 'normal',
    fontVariant: 'normal',
    fill: '#C9AD6A',
    align: 'left',
    verticalAlign: 'top',
    lineHeight: 1.2,
    letterSpacing: 0,
    rotation: 0,
    wrap: 'word',
    width: 300
  })
  const [effects, setEffects] = useState<TextEffect[]>([
    { type: 'shadow', enabled: false, settings: { offsetX: 2, offsetY: 2, color: '#000000', blur: 4 } },
    { type: 'outline', enabled: false, settings: { width: 2, color: '#000000' } },
    { type: 'glow', enabled: false, settings: { blur: 8, color: '#FFD700' } }
  ])

  const textRef = useRef<Konva.Text>(null)
  const groupRef = useRef<Konva.Group>(null)

  const { addObject } = useMapStore()

  // D&D themed font families
  const dndFonts = [
    { value: 'Cinzel', label: 'Cinzel (Fantasy)' },
    { value: 'Uncial Antiqua', label: 'Uncial Antiqua (Medieval)' },
    { value: 'Luminari', label: 'Luminari (Magical)' },
    { value: 'Papyrus', label: 'Papyrus (Ancient)' },
    { value: 'Trattatello', label: 'Trattatello (Elegant)' },
    { value: 'Herculanum', label: 'Herculanum (Stone)' },
    { value: 'Chalkduster', label: 'Chalkduster (Rustic)' },
    { value: 'Bradley Hand', label: 'Bradley Hand (Handwritten)' },
    { value: 'serif', label: 'Times New Roman (Classic)' },
    { value: 'sans-serif', label: 'Arial (Modern)' },
    { value: 'monospace', label: 'Courier (Typewriter)' }
  ]

  // Text presets for D&D content
  const textPresets = [
    {
      name: 'Title',
      style: {
        ...textStyle,
        fontFamily: 'Cinzel',
        fontSize: 36,
        fontVariant: 'bold' as const,
        fill: '#C9AD6A',
        align: 'center' as const
      }
    },
    {
      name: 'Subtitle',
      style: {
        ...textStyle,
        fontFamily: 'Cinzel',
        fontSize: 24,
        fontStyle: 'italic' as const,
        fill: '#B8860B'
      }
    },
    {
      name: 'Body Text',
      style: {
        ...textStyle,
        fontFamily: 'serif',
        fontSize: 16,
        fill: '#F5F5F5',
        lineHeight: 1.4
      }
    },
    {
      name: 'Magical Script',
      style: {
        ...textStyle,
        fontFamily: 'Luminari',
        fontSize: 20,
        fill: '#9932CC',
        letterSpacing: 2
      }
    },
    {
      name: 'Ancient Runes',
      style: {
        ...textStyle,
        fontFamily: 'Papyrus',
        fontSize: 18,
        fill: '#8B4513',
        letterSpacing: 4
      }
    }
  ]

  // Handle canvas click to place text
  const handleCanvasClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isActive) return

    const stage = e.target.getStage()
    if (!stage) return

    const pointer = stage.getPointerPosition()
    if (!pointer) return

    const transform = stage.getAbsoluteTransform().copy().invert()
    const pos = transform.point(pointer)

    setTextPosition(pos)
    setIsEditing(true)
    setCurrentText('Click to edit text')
  }, [isActive])

  // Apply text style updates
  const updateTextStyle = useCallback((updates: Partial<TextStyle>) => {
    setTextStyle(prev => ({ ...prev, ...updates }))
  }, [])

  // Apply text preset
  const applyPreset = useCallback((preset: typeof textPresets[0]) => {
    setTextStyle(preset.style)
  }, [])

  // Toggle text effect
  const toggleEffect = useCallback((effectType: TextEffect['type']) => {
    setEffects(prev => prev.map(effect =>
      effect.type === effectType
        ? { ...effect, enabled: !effect.enabled }
        : effect
    ))
  }, [])

  // Complete text creation
  const completeText = useCallback(() => {
    if (!currentText.trim()) return

    const textObject: EnhancedTextObject = {
      id: crypto.randomUUID(),
      type: 'text',
      text: currentText,
      position: textPosition,
      width: textStyle.width || 300,
      height: textStyle.height || textStyle.fontSize * 1.2,
      textStyle,
      effects: effects.filter(e => e.enabled),
      layer: 30,
      rotation: textStyle.rotation,
      visible: true,
      locked: false
    }

    addObject(textObject)
    onTextComplete?.(textObject)

    // Reset for next text
    setIsEditing(false)
    setCurrentText('')
  }, [currentText, textPosition, textStyle, effects, addObject, onTextComplete])

  // Cancel text editing
  const cancelEdit = useCallback(() => {
    setIsEditing(false)
    setCurrentText('')
  }, [])

  if (!isActive) return null

  return (
    <Group onMouseDown={handleCanvasClick}>
      {/* Active text being edited */}
      {isEditing && (
        <Group x={textPosition.x} y={textPosition.y}>
          {/* Shadow effect */}
          {effects.find(e => e.type === 'shadow')?.enabled && (
            <KonvaText
              text={currentText}
              {...textStyle}
              x={effects.find(e => e.type === 'shadow')?.settings.offsetX || 2}
              y={effects.find(e => e.type === 'shadow')?.settings.offsetY || 2}
              fill={effects.find(e => e.type === 'shadow')?.settings.color || '#000000'}
              opacity={0.6}
            />
          )}

          {/* Main text */}
          <KonvaText
            ref={textRef}
            text={currentText}
            {...textStyle}
            stroke={effects.find(e => e.type === 'outline')?.enabled ?
              effects.find(e => e.type === 'outline')?.settings.color : undefined}
            strokeWidth={effects.find(e => e.type === 'outline')?.enabled ?
              effects.find(e => e.type === 'outline')?.settings.width : undefined}
          />

          {/* Glow effect */}
          {effects.find(e => e.type === 'glow')?.enabled && (
            <KonvaText
              text={currentText}
              {...textStyle}
              fill={effects.find(e => e.type === 'glow')?.settings.color || '#FFD700'}
              shadowBlur={effects.find(e => e.type === 'glow')?.settings.blur || 8}
              shadowColor={effects.find(e => e.type === 'glow')?.settings.color || '#FFD700'}
              shadowOpacity={0.8}
            />
          )}

          {/* Text bounds indicator */}
          <Rect
            width={textStyle.width || 300}
            height={textStyle.fontSize * 1.5}
            stroke="#60A5FA"
            strokeWidth={1}
            dash={[4, 4]}
            opacity={0.5}
          />
        </Group>
      )}

      {/* Text editing controls */}
      {isEditing && (
        <Box
          css={{
            position: 'fixed',
            top: 20,
            right: 20,
            width: 300,
            backgroundColor: '$dndBlack',
            border: '1px solid $gray800',
            borderRadius: '$md',
            padding: '$4',
            zIndex: 1000
          }}
        >
          <Text size="lg" weight="semibold" css={{ marginBottom: '$3' }}>
            Text Editor
          </Text>

          {/* Text input */}
          <Box css={{ marginBottom: '$3' }}>
            <Text size="sm" css={{ marginBottom: '$1' }}>Content:</Text>
            <textarea
              value={currentText}
              onChange={(e) => setCurrentText(e.target.value)}
              placeholder="Enter your text..."
              style={{
                width: '100%',
                height: 80,
                padding: '8px',
                backgroundColor: 'var(--colors-gray800)',
                border: '1px solid var(--colors-gray700)',
                borderRadius: '4px',
                color: 'var(--colors-gray100)',
                fontSize: '14px',
                resize: 'vertical'
              }}
            />
          </Box>

          {/* Quick presets */}
          <Box css={{ marginBottom: '$3' }}>
            <Text size="sm" css={{ marginBottom: '$2' }}>Presets:</Text>
            <Box css={{ display: 'flex', flexWrap: 'wrap', gap: '$1' }}>
              {textPresets.map(preset => (
                <Button
                  key={preset.name}
                  variant="ghost"
                  size="xs"
                  onClick={() => applyPreset(preset)}
                >
                  {preset.name}
                </Button>
              ))}
            </Box>
          </Box>

          {/* Font settings */}
          <Box css={{ marginBottom: '$3' }}>
            <Text size="sm" css={{ marginBottom: '$1' }}>Font:</Text>
            <select
              value={textStyle.fontFamily}
              onChange={(e) => updateTextStyle({ fontFamily: e.target.value })}
              style={{
                width: '100%',
                padding: '4px 8px',
                backgroundColor: 'var(--colors-gray800)',
                border: '1px solid var(--colors-gray700)',
                borderRadius: '4px',
                color: 'var(--colors-gray100)',
                fontSize: '12px'
              }}
            >
              {dndFonts.map(font => (
                <option key={font.value} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>
          </Box>

          {/* Size and alignment */}
          <Box css={{ display: 'flex', gap: '$2', marginBottom: '$3' }}>
            <Box css={{ flex: 1 }}>
              <Text size="sm" css={{ marginBottom: '$1' }}>Size:</Text>
              <input
                type="number"
                value={textStyle.fontSize}
                onChange={(e) => updateTextStyle({ fontSize: Number(e.target.value) })}
                min="8"
                max="72"
                style={{
                  width: '100%',
                  padding: '4px 8px',
                  backgroundColor: 'var(--colors-gray800)',
                  border: '1px solid var(--colors-gray700)',
                  borderRadius: '4px',
                  color: 'var(--colors-gray100)',
                  fontSize: '12px'
                }}
              />
            </Box>
            <Box css={{ flex: 1 }}>
              <Text size="sm" css={{ marginBottom: '$1' }}>Color:</Text>
              <input
                type="color"
                value={textStyle.fill}
                onChange={(e) => updateTextStyle({ fill: e.target.value })}
                style={{
                  width: '100%',
                  height: 28,
                  backgroundColor: 'var(--colors-gray800)',
                  border: '1px solid var(--colors-gray700)',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              />
            </Box>
          </Box>

          {/* Style toggles */}
          <Box css={{ marginBottom: '$3' }}>
            <Text size="sm" css={{ marginBottom: '$2' }}>Style:</Text>
            <Box css={{ display: 'flex', gap: '$1' }}>
              <Button
                variant={textStyle.fontVariant === 'bold' ? 'default' : 'ghost'}
                size="xs"
                onClick={() => updateTextStyle({
                  fontVariant: textStyle.fontVariant === 'bold' ? 'normal' : 'bold'
                })}
              >
                <Bold size={12} />
              </Button>
              <Button
                variant={textStyle.fontStyle === 'italic' ? 'default' : 'ghost'}
                size="xs"
                onClick={() => updateTextStyle({
                  fontStyle: textStyle.fontStyle === 'italic' ? 'normal' : 'italic'
                })}
              >
                <Italic size={12} />
              </Button>
              <Button
                variant={textStyle.align === 'left' ? 'default' : 'ghost'}
                size="xs"
                onClick={() => updateTextStyle({ align: 'left' })}
              >
                <AlignLeft size={12} />
              </Button>
              <Button
                variant={textStyle.align === 'center' ? 'default' : 'ghost'}
                size="xs"
                onClick={() => updateTextStyle({ align: 'center' })}
              >
                <AlignCenter size={12} />
              </Button>
              <Button
                variant={textStyle.align === 'right' ? 'default' : 'ghost'}
                size="xs"
                onClick={() => updateTextStyle({ align: 'right' })}
              >
                <AlignRight size={12} />
              </Button>
            </Box>
          </Box>

          {/* Effects */}
          <Box css={{ marginBottom: '$4' }}>
            <Text size="sm" css={{ marginBottom: '$2' }}>Effects:</Text>
            <Box css={{ display: 'flex', flexWrap: 'wrap', gap: '$1' }}>
              {effects.map(effect => (
                <Button
                  key={effect.type}
                  variant={effect.enabled ? 'default' : 'ghost'}
                  size="xs"
                  onClick={() => toggleEffect(effect.type)}
                >
                  {effect.type}
                </Button>
              ))}
            </Box>
          </Box>

          {/* Action buttons */}
          <Box css={{ display: 'flex', gap: '$2' }}>
            <Button variant="ghost" onClick={cancelEdit} css={{ flex: 1 }}>
              Cancel
            </Button>
            <Button onClick={completeText} css={{ flex: 1 }}>
              Apply
            </Button>
          </Box>
        </Box>
      )}
    </Group>
  )
}

export default TextEnhancementSystem