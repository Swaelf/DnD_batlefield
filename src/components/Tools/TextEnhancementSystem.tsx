import React, { useCallback, useState, useRef } from 'react'
import { Group, Text as KonvaText, Rect } from 'react-konva'
import type Konva from 'konva'
import useMapStore from '@store/mapStore'
import type { Point, MapObject } from '@/types'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Button } from '@/components/primitives/ButtonVE'
import { Bold, Italic, AlignLeft, AlignCenter, AlignRight } from 'lucide-react'

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
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            width: '300px',
            backgroundColor: 'var(--colors-gray900)',
            border: '1px solid var(--colors-gray700)',
            borderRadius: '8px',
            padding: '16px',
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
          }}
        >
          <Box
            style={{
              marginBottom: '12px'
            }}
          >
            <Text
              variant="heading"
              size="lg"
              style={{
                fontWeight: '600',
                color: 'var(--colors-gray100)'
              }}
            >
              Text Editor
            </Text>
          </Box>

          {/* Text input */}
          <Box
            style={{
              marginBottom: '12px'
            }}
          >
            <Box
              style={{
                marginBottom: '4px'
              }}
            >
              <Text
                variant="label"
                size="sm"
                style={{
                  color: 'var(--colors-gray300)'
                }}
              >
                Content:
              </Text>
            </Box>
            <textarea
              value={currentText}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCurrentText(e.target.value)}
              placeholder="Enter your text..."
              style={{
                width: '100%',
                height: '80px',
                padding: '8px',
                backgroundColor: 'var(--colors-gray800)',
                border: '1px solid var(--colors-gray600)',
                borderRadius: '4px',
                color: 'var(--colors-gray100)',
                fontSize: '14px',
                resize: 'vertical',
                outline: 'none'
              }}
            />
          </Box>

          {/* Quick presets */}
          <Box
            style={{
              marginBottom: '12px'
            }}
          >
            <Box
              style={{
                marginBottom: '8px'
              }}
            >
              <Text
                variant="label"
                size="sm"
                style={{
                  color: 'var(--colors-gray300)'
                }}
              >
                Presets:
              </Text>
            </Box>
            <Box
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '4px'
              }}
            >
              {textPresets.map(preset => (
                <Button
                  key={preset.name}
                  variant="outline"
                  size="sm"
                  onClick={() => applyPreset(preset)}
                  style={{
                    fontSize: '12px',
                    padding: '4px 8px',
                    backgroundColor: 'var(--colors-gray800)',
                    borderColor: 'var(--colors-gray600)',
                    color: 'var(--colors-gray300)'
                  }}
                >
                  {preset.name}
                </Button>
              ))}
            </Box>
          </Box>

          {/* Font settings */}
          <Box
            style={{
              marginBottom: '12px'
            }}
          >
            <Box
              style={{
                marginBottom: '4px'
              }}
            >
              <Text
                variant="label"
                size="sm"
                style={{
                  color: 'var(--colors-gray300)'
                }}
              >
                Font:
              </Text>
            </Box>
            <select
              value={textStyle.fontFamily}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateTextStyle({ fontFamily: e.target.value })}
              style={{
                width: '100%',
                padding: '6px 8px',
                backgroundColor: 'var(--colors-gray800)',
                border: '1px solid var(--colors-gray600)',
                borderRadius: '4px',
                color: 'var(--colors-gray100)',
                fontSize: '14px',
                outline: 'none'
              }}
            >
              {dndFonts.map(font => (
                <option key={font.value} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>
          </Box>

          {/* Size and color */}
          <Box
            style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '12px'
            }}
          >
            <Box
              style={{
                flex: 1
              }}
            >
              <Box
                style={{
                  marginBottom: '4px'
                }}
              >
                <Text
                  variant="label"
                  size="sm"
                  style={{
                    color: 'var(--colors-gray300)'
                  }}
                >
                  Size:
                </Text>
              </Box>
              <input
                type="number"
                value={textStyle.fontSize}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateTextStyle({ fontSize: Number(e.target.value) })}
                min="8"
                max="72"
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  backgroundColor: 'var(--colors-gray800)',
                  border: '1px solid var(--colors-gray600)',
                  borderRadius: '4px',
                  color: 'var(--colors-gray100)',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </Box>
            <Box
              style={{
                flex: 1
              }}
            >
              <Box
                style={{
                  marginBottom: '4px'
                }}
              >
                <Text
                  variant="label"
                  size="sm"
                  style={{
                    color: 'var(--colors-gray300)'
                  }}
                >
                  Color:
                </Text>
              </Box>
              <input
                type="color"
                value={textStyle.fill}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateTextStyle({ fill: e.target.value })}
                style={{
                  width: '100%',
                  height: '32px',
                  backgroundColor: 'var(--colors-gray800)',
                  border: '1px solid var(--colors-gray600)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              />
            </Box>
          </Box>

          {/* Style toggles */}
          <Box
            style={{
              marginBottom: '12px'
            }}
          >
            <Box
              style={{
                marginBottom: '8px'
              }}
            >
              <Text
                variant="label"
                size="sm"
                style={{
                  color: 'var(--colors-gray300)'
                }}
              >
                Style:
              </Text>
            </Box>
            <Box
              style={{
                display: 'flex',
                gap: '4px'
              }}
            >
              <Button
                variant={textStyle.fontVariant === 'bold' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => updateTextStyle({
                  fontVariant: textStyle.fontVariant === 'bold' ? 'normal' : 'bold'
                })}
                style={{
                  padding: '6px',
                  backgroundColor: textStyle.fontVariant === 'bold' ? 'var(--colors-dndRed)' : 'var(--colors-gray800)',
                  borderColor: textStyle.fontVariant === 'bold' ? 'var(--colors-dndRed)' : 'var(--colors-gray600)',
                  color: textStyle.fontVariant === 'bold' ? 'white' : 'var(--colors-gray300)'
                }}
              >
                <Bold size={14} />
              </Button>
              <Button
                variant={textStyle.fontStyle === 'italic' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => updateTextStyle({
                  fontStyle: textStyle.fontStyle === 'italic' ? 'normal' : 'italic'
                })}
                style={{
                  padding: '6px',
                  backgroundColor: textStyle.fontStyle === 'italic' ? 'var(--colors-dndRed)' : 'var(--colors-gray800)',
                  borderColor: textStyle.fontStyle === 'italic' ? 'var(--colors-dndRed)' : 'var(--colors-gray600)',
                  color: textStyle.fontStyle === 'italic' ? 'white' : 'var(--colors-gray300)'
                }}
              >
                <Italic size={14} />
              </Button>
              <Button
                variant={textStyle.align === 'left' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => updateTextStyle({ align: 'left' })}
                style={{
                  padding: '6px',
                  backgroundColor: textStyle.align === 'left' ? 'var(--colors-dndRed)' : 'var(--colors-gray800)',
                  borderColor: textStyle.align === 'left' ? 'var(--colors-dndRed)' : 'var(--colors-gray600)',
                  color: textStyle.align === 'left' ? 'white' : 'var(--colors-gray300)'
                }}
              >
                <AlignLeft size={14} />
              </Button>
              <Button
                variant={textStyle.align === 'center' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => updateTextStyle({ align: 'center' })}
                style={{
                  padding: '6px',
                  backgroundColor: textStyle.align === 'center' ? 'var(--colors-dndRed)' : 'var(--colors-gray800)',
                  borderColor: textStyle.align === 'center' ? 'var(--colors-dndRed)' : 'var(--colors-gray600)',
                  color: textStyle.align === 'center' ? 'white' : 'var(--colors-gray300)'
                }}
              >
                <AlignCenter size={14} />
              </Button>
              <Button
                variant={textStyle.align === 'right' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => updateTextStyle({ align: 'right' })}
                style={{
                  padding: '6px',
                  backgroundColor: textStyle.align === 'right' ? 'var(--colors-dndRed)' : 'var(--colors-gray800)',
                  borderColor: textStyle.align === 'right' ? 'var(--colors-dndRed)' : 'var(--colors-gray600)',
                  color: textStyle.align === 'right' ? 'white' : 'var(--colors-gray300)'
                }}
              >
                <AlignRight size={14} />
              </Button>
            </Box>
          </Box>

          {/* Effects */}
          <Box
            style={{
              marginBottom: '16px'
            }}
          >
            <Box
              style={{
                marginBottom: '8px'
              }}
            >
              <Text
                variant="label"
                size="sm"
                style={{
                  color: 'var(--colors-gray300)'
                }}
              >
                Effects:
              </Text>
            </Box>
            <Box
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '4px'
              }}
            >
              {effects.map(effect => (
                <Button
                  key={effect.type}
                  variant={effect.enabled ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => toggleEffect(effect.type)}
                  style={{
                    fontSize: '12px',
                    padding: '4px 8px',
                    backgroundColor: effect.enabled ? 'var(--colors-dndRed)' : 'var(--colors-gray800)',
                    borderColor: effect.enabled ? 'var(--colors-dndRed)' : 'var(--colors-gray600)',
                    color: effect.enabled ? 'white' : 'var(--colors-gray300)',
                    textTransform: 'capitalize'
                  }}
                >
                  {effect.type}
                </Button>
              ))}
            </Box>
          </Box>

          {/* Action buttons */}
          <Box
            style={{
              display: 'flex',
              gap: '8px'
            }}
          >
            <Box
              style={{
                flex: 1
              }}
            >
              <Button
                variant="outline"
                onClick={cancelEdit}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--colors-gray800)',
                  borderColor: 'var(--colors-gray600)',
                  color: 'var(--colors-gray300)'
                }}
              >
                Cancel
              </Button>
            </Box>
            <Box
              style={{
                flex: 1
              }}
            >
              <Button
                variant="primary"
                onClick={completeText}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--colors-dndRed)',
                  borderColor: 'var(--colors-dndRed)',
                  color: 'white'
                }}
              >
                Apply
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </Group>
  )
}

export default TextEnhancementSystem