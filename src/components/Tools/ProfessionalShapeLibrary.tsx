import React, { useCallback, useMemo, useState } from 'react'
import { Group, Line, Circle, Rect, RegularPolygon, Arrow, Text as KonvaText } from 'react-konva'
import Konva from 'konva'
import useMapStore from '@store/mapStore'
import useToolStore from '@store/toolStore'
import { Point, MapObject } from '@/types'
import { Box, Text, Button, Grid } from '@/components/ui'
import { Shapes, ArrowRight, MessageSquare, Star, Hexagon, Triangle, Square, Circle as CircleIcon, Minus } from 'lucide-react'

interface ShapeTemplate {
  id: string
  name: string
  icon: React.ReactNode
  category: 'basic' | 'arrows' | 'callouts' | 'borders' | 'frames' | 'symbols'
  generator: (position: Point, size: number) => ShapeData
}

interface ShapeData {
  points?: number[]
  pathData?: string
  shapeType: 'polygon' | 'path' | 'circle' | 'rect' | 'arrow' | 'star'
  width: number
  height: number
}

interface ProfessionalShapeLibraryProps {
  isOpen: boolean
  onClose: () => void
}

export const ProfessionalShapeLibrary: React.FC<ProfessionalShapeLibraryProps> = ({
  isOpen,
  onClose
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ShapeTemplate['category']>('basic')
  const [previewSize, setPreviewSize] = useState(100)

  const { addObject } = useMapStore()
  const { fillColor, strokeColor, strokeWidth } = useToolStore()

  // Shape template definitions
  const shapeTemplates: ShapeTemplate[] = useMemo(() => [
    // Basic Shapes
    {
      id: 'rectangle',
      name: 'Rectangle',
      icon: <Square size={16} />,
      category: 'basic',
      generator: (pos, size) => ({
        shapeType: 'rect',
        width: size,
        height: size * 0.6,
        points: [pos.x, pos.y, size, size * 0.6]
      })
    },
    {
      id: 'circle',
      name: 'Circle',
      icon: <CircleIcon size={16} />,
      category: 'basic',
      generator: (pos, size) => ({
        shapeType: 'circle',
        width: size,
        height: size,
        points: [pos.x + size/2, pos.y + size/2, size/2]
      })
    },
    {
      id: 'triangle',
      name: 'Triangle',
      icon: <Triangle size={16} />,
      category: 'basic',
      generator: (pos, size) => ({
        shapeType: 'polygon',
        width: size,
        height: size * 0.866,
        points: [
          pos.x + size/2, pos.y,
          pos.x + size, pos.y + size * 0.866,
          pos.x, pos.y + size * 0.866
        ]
      })
    },
    {
      id: 'hexagon',
      name: 'Hexagon',
      icon: <Hexagon size={16} />,
      category: 'basic',
      generator: (pos, size) => {
        const centerX = pos.x + size/2
        const centerY = pos.y + size/2
        const radius = size/2
        const points: number[] = []

        for (let i = 0; i < 6; i++) {
          const angle = (i * 60 - 90) * Math.PI / 180
          points.push(
            centerX + radius * Math.cos(angle),
            centerY + radius * Math.sin(angle)
          )
        }

        return {
          shapeType: 'polygon',
          width: size,
          height: size,
          points
        }
      }
    },
    {
      id: 'star',
      name: 'Star',
      icon: <Star size={16} />,
      category: 'basic',
      generator: (pos, size) => {
        const centerX = pos.x + size/2
        const centerY = pos.y + size/2
        const outerRadius = size/2
        const innerRadius = size/4
        const points: number[] = []

        for (let i = 0; i < 10; i++) {
          const angle = (i * 36 - 90) * Math.PI / 180
          const radius = i % 2 === 0 ? outerRadius : innerRadius
          points.push(
            centerX + radius * Math.cos(angle),
            centerY + radius * Math.sin(angle)
          )
        }

        return {
          shapeType: 'polygon',
          width: size,
          height: size,
          points
        }
      }
    },

    // Arrow Shapes
    {
      id: 'arrow-right',
      name: 'Right Arrow',
      icon: <ArrowRight size={16} />,
      category: 'arrows',
      generator: (pos, size) => ({
        shapeType: 'polygon',
        width: size * 1.4,
        height: size * 0.6,
        points: [
          pos.x, pos.y + size * 0.2,
          pos.x + size, pos.y + size * 0.2,
          pos.x + size, pos.y,
          pos.x + size * 1.4, pos.y + size * 0.3,
          pos.x + size, pos.y + size * 0.6,
          pos.x + size, pos.y + size * 0.4,
          pos.x, pos.y + size * 0.4
        ]
      })
    },
    {
      id: 'arrow-double',
      name: 'Double Arrow',
      icon: <Minus size={16} style={{ transform: 'rotate(90deg)' }} />,
      category: 'arrows',
      generator: (pos, size) => ({
        shapeType: 'polygon',
        width: size * 1.4,
        height: size * 0.6,
        points: [
          pos.x + size * 0.2, pos.y,
          pos.x + size * 0.6, pos.y + size * 0.2,
          pos.x + size * 0.6, pos.y + size * 0.1,
          pos.x + size * 1.2, pos.y + size * 0.1,
          pos.x + size * 1.2, pos.y,
          pos.x + size * 1.4, pos.y + size * 0.3,
          pos.x + size * 1.2, pos.y + size * 0.6,
          pos.x + size * 1.2, pos.y + size * 0.5,
          pos.x + size * 0.6, pos.y + size * 0.5,
          pos.x + size * 0.6, pos.y + size * 0.4,
          pos.x + size * 0.2, pos.y + size * 0.6,
          pos.x, pos.y + size * 0.3
        ]
      })
    },

    // Callout Shapes
    {
      id: 'speech-bubble',
      name: 'Speech Bubble',
      icon: <MessageSquare size={16} />,
      category: 'callouts',
      generator: (pos, size) => ({
        shapeType: 'path',
        width: size,
        height: size * 0.8,
        pathData: `M ${pos.x + 10} ${pos.y}
                   L ${pos.x + size - 10} ${pos.y}
                   Q ${pos.x + size} ${pos.y} ${pos.x + size} ${pos.y + 10}
                   L ${pos.x + size} ${pos.y + size * 0.5 - 10}
                   Q ${pos.x + size} ${pos.y + size * 0.5} ${pos.x + size - 10} ${pos.y + size * 0.5}
                   L ${pos.x + size * 0.3} ${pos.y + size * 0.5}
                   L ${pos.x + size * 0.2} ${pos.y + size * 0.8}
                   L ${pos.x + size * 0.25} ${pos.y + size * 0.5}
                   L ${pos.x + 10} ${pos.y + size * 0.5}
                   Q ${pos.x} ${pos.y + size * 0.5} ${pos.x} ${pos.y + size * 0.5 - 10}
                   L ${pos.x} ${pos.y + 10}
                   Q ${pos.x} ${pos.y} ${pos.x + 10} ${pos.y} Z`
      })
    },

    // Border Shapes
    {
      id: 'rounded-border',
      name: 'Rounded Border',
      icon: <Square size={16} />,
      category: 'borders',
      generator: (pos, size) => ({
        shapeType: 'path',
        width: size,
        height: size * 0.7,
        pathData: `M ${pos.x + 20} ${pos.y}
                   L ${pos.x + size - 20} ${pos.y}
                   Q ${pos.x + size} ${pos.y} ${pos.x + size} ${pos.y + 20}
                   L ${pos.x + size} ${pos.y + size * 0.7 - 20}
                   Q ${pos.x + size} ${pos.y + size * 0.7} ${pos.x + size - 20} ${pos.y + size * 0.7}
                   L ${pos.x + 20} ${pos.y + size * 0.7}
                   Q ${pos.x} ${pos.y + size * 0.7} ${pos.x} ${pos.y + size * 0.7 - 20}
                   L ${pos.x} ${pos.y + 20}
                   Q ${pos.x} ${pos.y} ${pos.x + 20} ${pos.y} Z`
      })
    },

    // Frame Shapes
    {
      id: 'ornate-frame',
      name: 'Ornate Frame',
      icon: <Square size={16} />,
      category: 'frames',
      generator: (pos, size) => ({
        shapeType: 'path',
        width: size,
        height: size * 0.75,
        pathData: `M ${pos.x + 15} ${pos.y}
                   L ${pos.x + size - 15} ${pos.y}
                   L ${pos.x + size - 10} ${pos.y + 5}
                   L ${pos.x + size} ${pos.y + 15}
                   L ${pos.x + size} ${pos.y + size * 0.75 - 15}
                   L ${pos.x + size - 10} ${pos.y + size * 0.75 - 5}
                   L ${pos.x + size - 15} ${pos.y + size * 0.75}
                   L ${pos.x + 15} ${pos.y + size * 0.75}
                   L ${pos.x + 10} ${pos.y + size * 0.75 - 5}
                   L ${pos.x} ${pos.y + size * 0.75 - 15}
                   L ${pos.x} ${pos.y + 15}
                   L ${pos.x + 10} ${pos.y + 5} Z`
      })
    }
  ], [])

  // Filter templates by category
  const filteredTemplates = useMemo(() =>
    shapeTemplates.filter(template => template.category === selectedCategory),
    [shapeTemplates, selectedCategory]
  )

  // Categories for navigation
  const categories = [
    { id: 'basic' as const, name: 'Basic', icon: <Shapes size={16} /> },
    { id: 'arrows' as const, name: 'Arrows', icon: <ArrowRight size={16} /> },
    { id: 'callouts' as const, name: 'Callouts', icon: <MessageSquare size={16} /> },
    { id: 'borders' as const, name: 'Borders', icon: <Square size={16} /> },
    { id: 'frames' as const, name: 'Frames', icon: <Square size={16} /> }
  ]

  // Add shape to map
  const handleAddShape = useCallback((template: ShapeTemplate) => {
    const centerPos = { x: 400, y: 300 } // Default center position
    const shapeData = template.generator(centerPos, previewSize)

    const shapeObject: MapObject = {
      id: crypto.randomUUID(),
      type: 'shape',
      shapeType: shapeData.shapeType,
      position: centerPos,
      width: shapeData.width,
      height: shapeData.height,
      points: shapeData.points,
      pathData: shapeData.pathData,
      fill: fillColor,
      stroke: strokeColor,
      strokeWidth,
      layer: 30,
      rotation: 0,
      visible: true,
      locked: false
    }

    addObject(shapeObject)
    onClose()
  }, [previewSize, fillColor, strokeColor, strokeWidth, addObject, onClose])

  if (!isOpen) return null

  return (
    <Box
      css={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 600,
        height: 500,
        backgroundColor: '$dndBlack',
        border: '1px solid $gray800',
        borderRadius: '$md',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column'
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
        <Text size="lg" weight="semibold">Professional Shape Library</Text>
        <Button variant="ghost" size="icon" onClick={onClose}>×</Button>
      </Box>

      <Box css={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Category Navigation */}
        <Box
          css={{
            width: 120,
            backgroundColor: '$gray900',
            borderRight: '1px solid $gray800',
            padding: '$2',
            display: 'flex',
            flexDirection: 'column',
            gap: '$1'
          }}
        >
          {categories.map(category => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'ghost'}
              size="sm"
              css={{
                justifyContent: 'flex-start',
                gap: '$2',
                fontSize: '$xs'
              }}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.icon}
              {category.name}
            </Button>
          ))}
        </Box>

        {/* Shape Grid */}
        <Box css={{ flex: 1, padding: '$4', overflow: 'auto' }}>
          <Grid
            css={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
              gap: '$3'
            }}
          >
            {filteredTemplates.map(template => (
              <Box
                key={template.id}
                css={{
                  border: '1px solid $gray700',
                  borderRadius: '$sm',
                  padding: '$3',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: '$gray800',
                    borderColor: '$primary',
                    transform: 'translateY(-2px)'
                  }
                }}
                onClick={() => handleAddShape(template)}
              >
                <Box
                  css={{
                    width: 60,
                    height: 60,
                    margin: '0 auto $2',
                    backgroundColor: '$gray800',
                    borderRadius: '$sm',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '$xl',
                    color: '$secondary'
                  }}
                >
                  {template.icon}
                </Box>
                <Text size="xs" css={{ color: '$gray300' }}>
                  {template.name}
                </Text>
              </Box>
            ))}
          </Grid>
        </Box>
      </Box>

      {/* Footer Controls */}
      <Box
        css={{
          padding: '$4',
          borderTop: '1px solid $gray800',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box css={{ display: 'flex', alignItems: 'center', gap: '$3' }}>
          <Text size="sm">Size:</Text>
          <input
            type="range"
            min="50"
            max="300"
            value={previewSize}
            onChange={(e) => setPreviewSize(Number(e.target.value))}
            style={{
              width: 120,
              accentColor: 'var(--colors-secondary)'
            }}
          />
          <Text size="sm" css={{ color: '$gray400' }}>
            {previewSize}px
          </Text>
        </Box>

        <Box css={{ display: 'flex', gap: '$2' }}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="default">Add Shape</Button>
        </Box>
      </Box>

      {/* Backdrop */}
      <Box
        css={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: -1
        }}
        onClick={onClose}
      />
    </Box>
  )
}

export default ProfessionalShapeLibrary