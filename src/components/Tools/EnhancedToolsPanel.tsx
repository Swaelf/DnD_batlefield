import React, { useState } from 'react'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Button } from '@/components/primitives/ButtonVE'
import {
  Square,
  Circle,
  Minus,
  Type,
  Hexagon, // Using Hexagon instead of Polygon
  Settings,
  Palette,
  Move3D,
  Grid3X3
} from '@/utils/optimizedIcons'
import useToolStore from '@store/toolStore'


export const EnhancedToolsPanel: React.FC = () => {
  const currentTool = useToolStore(state => state.currentTool)
  const setTool = useToolStore(state => state.setTool)
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)

  const tools = [
    {
      id: 'rectangle' as const,
      name: 'Enhanced Rectangle',
      icon: <Square size={20} />,
      description: 'Draw rectangles with corner radius, proportional scaling (Shift), center-point mode (Alt)'
    },
    {
      id: 'circle' as const,
      name: 'Enhanced Circle',
      icon: <Circle size={20} />,
      description: 'Draw circles/ellipses with perfect circle mode (Shift), center-point mode (Alt)'
    },
    {
      id: 'line' as const,
      name: 'Enhanced Line',
      icon: <Minus size={20} />,
      description: 'Draw lines/polylines with angle snapping (Shift), arrow heads (A key)'
    },
    {
      id: 'text' as const,
      name: 'Enhanced Text',
      icon: <Type size={20} />,
      description: 'Rich text with live formatting, font controls, and color options'
    },
    {
      id: 'polygon' as const,
      name: 'Enhanced Polygon',
      icon: <Hexagon size={20} />,
      description: 'Draw polygons with vertex manipulation and precise control'
    }
  ]

  return (
    <Box
      style={{
        width: '320px',
        height: '100%',
        backgroundColor: 'var(--colors-dndBlack)',
        borderLeft: '1px solid var(--colors-gray700)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Panel Header */}
      <Box
        style={{
          padding: '16px',
          borderBottom: '1px solid var(--colors-gray700)',
          backgroundColor: 'var(--colors-gray900)'
        }}
      >
        <Text
          variant="heading"
          size="lg"
          style={{
            fontWeight: '600',
            color: 'var(--colors-secondary)',
            marginBottom: '4px'
          }}
        >
          Enhanced Drawing Tools
        </Text>
        <Text
          variant="body"
          size="xs"
          style={{
            color: 'var(--colors-gray400)'
          }}
        >
          Phase 17: Advanced drawing capabilities
        </Text>
      </Box>

      {/* Panel Content */}
      <Box
        style={{
          flex: 1,
          padding: '16px',
          overflow: 'auto'
        }}
      >
        {/* Tool Selection */}
        <Box
          style={{
            marginBottom: '24px'
          }}
        >
          <Text
            variant="label"
            size="sm"
            style={{
              fontWeight: '600',
              color: 'var(--colors-secondary)',
              marginBottom: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            Select Tool
          </Text>
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '8px',
              marginBottom: '16px'
            }}
          >
            {tools.map(tool => (
              <Button
                key={tool.id}
                variant={currentTool === tool.id ? 'primary' : 'outline'}
                onClick={() => setTool(tool.id)}
                title={tool.description}
                style={{
                  height: '60px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  padding: '8px',
                  backgroundColor: currentTool === tool.id ? 'var(--colors-secondary)' : 'var(--colors-gray800)',
                  borderColor: currentTool === tool.id ? 'var(--colors-secondary)' : 'var(--colors-gray600)',
                  color: currentTool === tool.id ? 'var(--colors-dndBlack)' : 'var(--colors-gray300)'
                }}
              >
                {tool.icon}
                <Text
                  variant="label"
                  size="xs"
                  style={{
                    color: 'inherit'
                  }}
                >
                  {tool.name.replace('Enhanced ', '')}
                </Text>
              </Button>
            ))}
          </Box>
        </Box>

        {/* Current Tool Info */}
        {tools.find(t => t.id === currentTool) && (
          <Box style={{ marginBottom: '16px' }}>
            <Text size="sm" weight="semibold" style={{ marginBottom: '8px' }}>Current Tool: {tools.find(t => t.id === currentTool)?.name}</Text>
            <Box
              style={{
                padding: '12px',
                backgroundColor: 'var(--colors-gray800)',
                borderRadius: '4px',
                borderLeft: '3px solid var(--colors-secondary)'
              }}
            >
              <Text size="xs" color="gray300">
                {tools.find(t => t.id === currentTool)?.description}
              </Text>
            </Box>
          </Box>
        )}

        {/* Enhanced Features */}
        <Box
          style={{
            marginBottom: '24px'
          }}
        >
          <Text
            variant="label"
            size="sm"
            style={{
              fontWeight: '600',
              color: 'var(--colors-secondary)',
              marginBottom: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            Enhanced Features
          </Text>
          <Box
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            <Box
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px',
                borderRadius: '4px',
                backgroundColor: 'var(--colors-gray800)'
              }}
            >
              <Grid3X3 size={16} color="#C9AD6A" />
              <Text
                variant="body"
                size="xs"
                style={{
                  color: 'var(--colors-gray300)'
                }}
              >
                Grid snapping with visual indicators
              </Text>
            </Box>
            <Box
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px',
                borderRadius: '4px',
                backgroundColor: 'var(--colors-gray800)'
              }}
            >
              <Move3D size={16} color="#C9AD6A" />
              <Text
                variant="body"
                size="xs"
                style={{
                  color: 'var(--colors-gray300)'
                }}
              >
                Live preview during drawing
              </Text>
            </Box>
            <Box
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px',
                borderRadius: '4px',
                backgroundColor: 'var(--colors-gray800)'
              }}
            >
              <Palette size={16} color="#C9AD6A" />
              <Text
                variant="body"
                size="xs"
                style={{
                  color: 'var(--colors-gray300)'
                }}
              >
                Real-time style customization
              </Text>
            </Box>
            <Box
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px',
                borderRadius: '4px',
                backgroundColor: 'var(--colors-gray800)'
              }}
            >
              <Settings size={16} color="#C9AD6A" />
              <Text
                variant="body"
                size="xs"
                style={{
                  color: 'var(--colors-gray300)'
                }}
              >
                Advanced drawing modes
              </Text>
            </Box>
          </Box>
        </Box>

        {/* Rectangle Tool Features */}
        {currentTool === 'rectangle' && (
          <Box style={{ marginBottom: '24px' }}>
            <Text variant="label" size="sm" style={{ fontWeight: '600', color: 'var(--colors-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rectangle Tool</Text>
            <Box style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', borderRadius: '4px', backgroundColor: 'var(--colors-gray800)' }}>
                <Text variant="code" size="xs" style={{ color: 'var(--colors-gray400)', fontFamily: 'monospace', backgroundColor: 'var(--colors-gray700)', padding: '2px 4px', borderRadius: '2px' }}>Shift</Text>
                <Text variant="body" size="xs" style={{ color: 'var(--colors-gray300)' }}>Proportional scaling (square)</Text>
              </Box>
              <Box style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', borderRadius: '4px', backgroundColor: 'var(--colors-gray800)' }}>
                <Text variant="code" size="xs" style={{ color: 'var(--colors-gray400)', fontFamily: 'monospace', backgroundColor: 'var(--colors-gray700)', padding: '2px 4px', borderRadius: '2px' }}>Alt</Text>
                <Text variant="body" size="xs" style={{ color: 'var(--colors-gray300)' }}>Center-point drawing</Text>
              </Box>
              <Box style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', borderRadius: '4px', backgroundColor: 'var(--colors-gray800)' }}>
                <Text variant="code" size="xs" style={{ color: 'var(--colors-gray400)', fontFamily: 'monospace', backgroundColor: 'var(--colors-gray700)', padding: '2px 4px', borderRadius: '2px' }}>Scroll</Text>
                <Text variant="body" size="xs" style={{ color: 'var(--colors-gray300)' }}>Adjust corner radius while drawing</Text>
              </Box>
              <Box style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', borderRadius: '4px', backgroundColor: 'var(--colors-gray800)' }}>
                <Text variant="code" size="xs" style={{ color: 'var(--colors-gray400)', fontFamily: 'monospace', backgroundColor: 'var(--colors-gray700)', padding: '2px 4px', borderRadius: '2px' }}>Esc</Text>
                <Text variant="body" size="xs" style={{ color: 'var(--colors-gray300)' }}>Cancel current operation</Text>
              </Box>
            </Box>
          </Box>
        )}

        {/* Circle Tool Features */}
        {currentTool === 'circle' && (
          <Box style={{ marginBottom: '16px' }}>
            <Text size="sm" weight="semibold" style={{ marginBottom: '8px' }}>Circle Tool</Text>
            <Box style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Text size="xs" style={{ fontFamily: 'monospace', backgroundColor: 'var(--gray800)', padding: '2px 6px', borderRadius: '4px' }}>Shift</Text>
                <Text size="xs">Perfect circle mode</Text>
              </Box>
              <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Text size="xs" style={{ fontFamily: 'monospace', backgroundColor: 'var(--gray800)', padding: '2px 6px', borderRadius: '4px' }}>Alt</Text>
                <Text size="xs">Center-point drawing</Text>
              </Box>
              <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Text size="xs" style={{ fontFamily: 'monospace', backgroundColor: 'var(--gray800)', padding: '2px 6px', borderRadius: '4px' }}>Default</Text>
                <Text size="xs">Ellipse mode (independent radii)</Text>
              </Box>
              <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Text size="xs" style={{ fontFamily: 'monospace', backgroundColor: 'var(--gray800)', padding: '2px 6px', borderRadius: '4px' }}>Esc</Text>
                <Text size="xs">Cancel current operation</Text>
              </Box>
            </Box>
          </Box>
        )}

        {/* Line Tool Features */}
        {currentTool === 'line' && (
          <Box style={{ marginBottom: '16px' }}>
            <Text size="sm" weight="semibold" style={{ marginBottom: '8px' }}>Line Tool</Text>
            <Box style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Box
                  style={{
                    padding: '2px 6px',
                    backgroundColor: 'var(--gray800)',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    fontWeight: 500,
                    color: 'var(--gray200)'
                  }}
                >
                  Click
                </Box>
                <Text size="xs">Add points for multi-segment line</Text>
              </Box>
              <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Box
                  style={{
                    padding: '2px 6px',
                    backgroundColor: 'var(--gray800)',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    fontWeight: 500,
                    color: 'var(--gray200)'
                  }}
                >
                  Shift
                </Box>
                <Text size="xs">Constrain to 45° angles</Text>
              </Box>
              <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Box
                  style={{
                    padding: '2px 6px',
                    backgroundColor: 'var(--gray800)',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    fontWeight: 500,
                    color: 'var(--gray200)'
                  }}
                >
                  Ctrl+Click
                </Box>
                <Text size="xs">Finish line</Text>
              </Box>
              <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Box
                  style={{
                    padding: '2px 6px',
                    backgroundColor: 'var(--gray800)',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    fontWeight: 500,
                    color: 'var(--gray200)'
                  }}
                >
                  A
                </Box>
                <Text size="xs">Toggle arrow head</Text>
              </Box>
              <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Box
                  style={{
                    padding: '2px 6px',
                    backgroundColor: 'var(--gray800)',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    fontWeight: 500,
                    color: 'var(--gray200)'
                  }}
                >
                  Enter/Space
                </Box>
                <Text size="xs">Complete line</Text>
              </Box>
              <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Box
                  style={{
                    padding: '2px 6px',
                    backgroundColor: 'var(--gray800)',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    fontWeight: 500,
                    color: 'var(--gray200)'
                  }}
                >
                  Backspace
                </Box>
                <Text size="xs">Remove last point</Text>
              </Box>
            </Box>
          </Box>
        )}

        {/* Text Tool Features */}
        {currentTool === 'text' && (
          <Box style={{ marginBottom: '16px' }}>
            <Text size="sm" weight="semibold" style={{ marginBottom: '8px' }}>Text Tool</Text>
            <Box style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Box
                  style={{
                    padding: '2px 6px',
                    backgroundColor: 'var(--gray800)',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    fontWeight: 500,
                    color: 'var(--gray200)'
                  }}
                >
                  Ctrl+↑/↓
                </Box>
                <Text size="xs">Font size up/down</Text>
              </Box>
              <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Box
                  style={{
                    padding: '2px 6px',
                    backgroundColor: 'var(--gray800)',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    fontWeight: 500,
                    color: 'var(--gray200)'
                  }}
                >
                  Ctrl+←/→
                </Box>
                <Text size="xs">Cycle font families</Text>
              </Box>
              <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Box
                  style={{
                    padding: '2px 6px',
                    backgroundColor: 'var(--gray800)',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    fontWeight: 500,
                    color: 'var(--gray200)'
                  }}
                >
                  Ctrl+1/2/3
                </Box>
                <Text size="xs">Align left/center/right</Text>
              </Box>
              <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Box
                  style={{
                    padding: '2px 6px',
                    backgroundColor: 'var(--gray800)',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    fontWeight: 500,
                    color: 'var(--gray200)'
                  }}
                >
                  Ctrl+B
                </Box>
                <Text size="xs">Toggle bold</Text>
              </Box>
              <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Box
                  style={{
                    padding: '2px 6px',
                    backgroundColor: 'var(--gray800)',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    fontWeight: 500,
                    color: 'var(--gray200)'
                  }}
                >
                  Ctrl+I
                </Box>
                <Text size="xs">Toggle italic</Text>
              </Box>
              <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Box
                  style={{
                    padding: '2px 6px',
                    backgroundColor: 'var(--gray800)',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    fontWeight: 500,
                    color: 'var(--gray200)'
                  }}
                >
                  Ctrl+W/K/R
                </Box>
                <Text size="xs">White/Black/Red color</Text>
              </Box>
              <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Box
                  style={{
                    padding: '2px 6px',
                    backgroundColor: 'var(--gray800)',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    fontWeight: 500,
                    color: 'var(--gray200)'
                  }}
                >
                  Enter
                </Box>
                <Text size="xs">Complete text</Text>
              </Box>
              <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Box
                  style={{
                    padding: '2px 6px',
                    backgroundColor: 'var(--gray800)',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    fontWeight: 500,
                    color: 'var(--gray200)'
                  }}
                >
                  Shift+Enter
                </Box>
                <Text size="xs">New line</Text>
              </Box>
            </Box>
          </Box>
        )}

        {/* Global Shortcuts */}
        <Box style={{ marginBottom: '24px' }}>
          <Text variant="label" size="sm" style={{ fontWeight: '600', color: 'var(--colors-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Global Shortcuts</Text>
          <Button
            variant="outline"
            onClick={() => setShowKeyboardShortcuts(!showKeyboardShortcuts)}
            style={{
              width: '100%',
              justifyContent: 'space-between',
              backgroundColor: 'var(--colors-gray800)',
              borderColor: 'var(--colors-gray600)',
              color: 'var(--colors-gray300)'
            }}
          >
            <Text variant="body" size="xs" style={{ color: 'inherit' }}>Keyboard Shortcuts</Text>
            <Text variant="body" size="xs" style={{ color: 'inherit' }}>{showKeyboardShortcuts ? '▲' : '▼'}</Text>
          </Button>

          {showKeyboardShortcuts && (
            <Box style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', borderRadius: '4px', backgroundColor: 'var(--colors-gray800)' }}>
                <Text variant="code" size="xs" style={{ color: 'var(--colors-gray400)', fontFamily: 'monospace', backgroundColor: 'var(--colors-gray700)', padding: '2px 4px', borderRadius: '2px' }}>R</Text>
                <Text variant="body" size="xs" style={{ color: 'var(--colors-gray300)' }}>Rectangle tool</Text>
              </Box>
              <Box style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', borderRadius: '4px', backgroundColor: 'var(--colors-gray800)' }}>
                <Text variant="code" size="xs" style={{ color: 'var(--colors-gray400)', fontFamily: 'monospace', backgroundColor: 'var(--colors-gray700)', padding: '2px 4px', borderRadius: '2px' }}>C</Text>
                <Text variant="body" size="xs" style={{ color: 'var(--colors-gray300)' }}>Circle tool</Text>
              </Box>
              <Box style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', borderRadius: '4px', backgroundColor: 'var(--colors-gray800)' }}>
                <Text variant="code" size="xs" style={{ color: 'var(--colors-gray400)', fontFamily: 'monospace', backgroundColor: 'var(--colors-gray700)', padding: '2px 4px', borderRadius: '2px' }}>L</Text>
                <Text variant="body" size="xs" style={{ color: 'var(--colors-gray300)' }}>Line tool</Text>
              </Box>
              <Box style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', borderRadius: '4px', backgroundColor: 'var(--colors-gray800)' }}>
                <Text variant="code" size="xs" style={{ color: 'var(--colors-gray400)', fontFamily: 'monospace', backgroundColor: 'var(--colors-gray700)', padding: '2px 4px', borderRadius: '2px' }}>T</Text>
                <Text variant="body" size="xs" style={{ color: 'var(--colors-gray300)' }}>Text tool</Text>
              </Box>
              <Box style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', borderRadius: '4px', backgroundColor: 'var(--colors-gray800)' }}>
                <Text variant="code" size="xs" style={{ color: 'var(--colors-gray400)', fontFamily: 'monospace', backgroundColor: 'var(--colors-gray700)', padding: '2px 4px', borderRadius: '2px' }}>P</Text>
                <Text variant="body" size="xs" style={{ color: 'var(--colors-gray300)' }}>Polygon tool</Text>
              </Box>
              <Box style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', borderRadius: '4px', backgroundColor: 'var(--colors-gray800)' }}>
                <Text variant="code" size="xs" style={{ color: 'var(--colors-gray400)', fontFamily: 'monospace', backgroundColor: 'var(--colors-gray700)', padding: '2px 4px', borderRadius: '2px' }}>V</Text>
                <Text variant="body" size="xs" style={{ color: 'var(--colors-gray300)' }}>Select tool</Text>
              </Box>
              <Box style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', borderRadius: '4px', backgroundColor: 'var(--colors-gray800)' }}>
                <Text variant="code" size="xs" style={{ color: 'var(--colors-gray400)', fontFamily: 'monospace', backgroundColor: 'var(--colors-gray700)', padding: '2px 4px', borderRadius: '2px' }}>Esc</Text>
                <Text variant="body" size="xs" style={{ color: 'var(--colors-gray300)' }}>Return to select tool</Text>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default EnhancedToolsPanel