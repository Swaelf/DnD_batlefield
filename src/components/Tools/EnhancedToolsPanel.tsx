import React, { useState } from 'react'
import { Box, Text, Button } from '@/components/ui'
import { styled } from '@/styles/theme.config'
import {
  Square,
  Circle,
  Minus,
  Type,
  Polygon,
  Settings,
  Palette,
  Move3D,
  Grid3X3
} from 'lucide-react'
import useToolStore from '@store/toolStore'

const ToolsPanelContainer = styled(Box, {
  width: 320,
  height: '100%',
  backgroundColor: '$dndBlack',
  borderLeft: '1px solid $gray800',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden'
})

const PanelHeader = styled(Box, {
  padding: '$4',
  borderBottom: '1px solid $gray800',
  backgroundColor: '$gray900'
})

const PanelContent = styled(Box, {
  flex: 1,
  padding: '$4',
  overflow: 'auto'
})

const ToolGrid = styled(Box, {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '$2',
  marginBottom: '$4'
})

const ToolButton = styled(Button, {
  height: 60,
  display: 'flex',
  flexDirection: 'column',
  gap: '$1',
  padding: '$2',

  variants: {
    active: {
      true: {
        backgroundColor: '$secondary',
        color: '$dndBlack',
        '&:hover': {
          backgroundColor: '$secondary'
        }
      }
    }
  }
})

const Section = styled(Box, {
  marginBottom: '$6'
})

const SectionTitle = styled(Text, {
  fontSize: '$sm',
  fontWeight: '$semibold',
  color: '$secondary',
  marginBottom: '$3',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
})

const FeatureList = styled(Box, {
  display: 'flex',
  flexDirection: 'column',
  gap: '$2'
})

const FeatureItem = styled(Box, {
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
  padding: '$2',
  borderRadius: '$sm',
  backgroundColor: '$gray800',
  fontSize: '$xs'
})

const KeyboardShortcut = styled(Text, {
  fontSize: '$xs',
  color: '$gray400',
  fontFamily: '$mono',
  backgroundColor: '$gray700',
  padding: '2px 4px',
  borderRadius: '$xs'
})

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
      icon: <Polygon size={20} />,
      description: 'Draw polygons with vertex manipulation and precise control'
    }
  ]

  return (
    <ToolsPanelContainer>
      <PanelHeader>
        <Text size="lg" weight="semibold" color="secondary">
          Enhanced Drawing Tools
        </Text>
        <Text size="xs" color="gray400">
          Phase 17: Advanced drawing capabilities
        </Text>
      </PanelHeader>

      <PanelContent>
        {/* Tool Selection */}
        <Section>
          <SectionTitle>Select Tool</SectionTitle>
          <ToolGrid>
            {tools.map(tool => (
              <ToolButton
                key={tool.id}
                active={currentTool === tool.id}
                onClick={() => setTool(tool.id)}
                title={tool.description}
              >
                {tool.icon}
                <Text size="xs">{tool.name.replace('Enhanced ', '')}</Text>
              </ToolButton>
            ))}
          </ToolGrid>
        </Section>

        {/* Current Tool Info */}
        {tools.find(t => t.id === currentTool) && (
          <Section>
            <SectionTitle>Current Tool: {tools.find(t => t.id === currentTool)?.name}</SectionTitle>
            <Box
              padding="$3"
              backgroundColor="$gray800"
              borderRadius="$sm"
              borderLeft="3px solid $secondary"
            >
              <Text size="xs" color="gray300">
                {tools.find(t => t.id === currentTool)?.description}
              </Text>
            </Box>
          </Section>
        )}

        {/* Enhanced Features */}
        <Section>
          <SectionTitle>Enhanced Features</SectionTitle>
          <FeatureList>
            <FeatureItem>
              <Grid3X3 size={16} color="#C9AD6A" />
              <Text size="xs">Grid snapping with visual indicators</Text>
            </FeatureItem>
            <FeatureItem>
              <Move3D size={16} color="#C9AD6A" />
              <Text size="xs">Live preview during drawing</Text>
            </FeatureItem>
            <FeatureItem>
              <Palette size={16} color="#C9AD6A" />
              <Text size="xs">Real-time style customization</Text>
            </FeatureItem>
            <FeatureItem>
              <Settings size={16} color="#C9AD6A" />
              <Text size="xs">Advanced drawing modes</Text>
            </FeatureItem>
          </FeatureList>
        </Section>

        {/* Rectangle Tool Features */}
        {currentTool === 'rectangle' && (
          <Section>
            <SectionTitle>Rectangle Tool</SectionTitle>
            <FeatureList>
              <FeatureItem>
                <KeyboardShortcut>Shift</KeyboardShortcut>
                <Text size="xs">Proportional scaling (square)</Text>
              </FeatureItem>
              <FeatureItem>
                <KeyboardShortcut>Alt</KeyboardShortcut>
                <Text size="xs">Center-point drawing</Text>
              </FeatureItem>
              <FeatureItem>
                <KeyboardShortcut>Scroll</KeyboardShortcut>
                <Text size="xs">Adjust corner radius while drawing</Text>
              </FeatureItem>
              <FeatureItem>
                <KeyboardShortcut>Esc</KeyboardShortcut>
                <Text size="xs">Cancel current operation</Text>
              </FeatureItem>
            </FeatureList>
          </Section>
        )}

        {/* Circle Tool Features */}
        {currentTool === 'circle' && (
          <Section>
            <SectionTitle>Circle Tool</SectionTitle>
            <FeatureList>
              <FeatureItem>
                <KeyboardShortcut>Shift</KeyboardShortcut>
                <Text size="xs">Perfect circle mode</Text>
              </FeatureItem>
              <FeatureItem>
                <KeyboardShortcut>Alt</KeyboardShortcut>
                <Text size="xs">Center-point drawing</Text>
              </FeatureItem>
              <FeatureItem>
                <KeyboardShortcut>Default</KeyboardShortcut>
                <Text size="xs">Ellipse mode (independent radii)</Text>
              </FeatureItem>
              <FeatureItem>
                <KeyboardShortcut>Esc</KeyboardShortcut>
                <Text size="xs">Cancel current operation</Text>
              </FeatureItem>
            </FeatureList>
          </Section>
        )}

        {/* Line Tool Features */}
        {currentTool === 'line' && (
          <Section>
            <SectionTitle>Line Tool</SectionTitle>
            <FeatureList>
              <FeatureItem>
                <KeyboardShortcut>Click</KeyboardShortcut>
                <Text size="xs">Add points for multi-segment line</Text>
              </FeatureItem>
              <FeatureItem>
                <KeyboardShortcut>Shift</KeyboardShortcut>
                <Text size="xs">Constrain to 45° angles</Text>
              </FeatureItem>
              <FeatureItem>
                <KeyboardShortcut>Ctrl+Click</KeyboardShortcut>
                <Text size="xs">Finish line</Text>
              </FeatureItem>
              <FeatureItem>
                <KeyboardShortcut>A</KeyboardShortcut>
                <Text size="xs">Toggle arrow head</Text>
              </FeatureItem>
              <FeatureItem>
                <KeyboardShortcut>Enter/Space</KeyboardShortcut>
                <Text size="xs">Complete line</Text>
              </FeatureItem>
              <FeatureItem>
                <KeyboardShortcut>Backspace</KeyboardShortcut>
                <Text size="xs">Remove last point</Text>
              </FeatureItem>
            </FeatureList>
          </Section>
        )}

        {/* Text Tool Features */}
        {currentTool === 'text' && (
          <Section>
            <SectionTitle>Text Tool</SectionTitle>
            <FeatureList>
              <FeatureItem>
                <KeyboardShortcut>Ctrl+↑/↓</KeyboardShortcut>
                <Text size="xs">Font size up/down</Text>
              </FeatureItem>
              <FeatureItem>
                <KeyboardShortcut>Ctrl+←/→</KeyboardShortcut>
                <Text size="xs">Cycle font families</Text>
              </FeatureItem>
              <FeatureItem>
                <KeyboardShortcut>Ctrl+1/2/3</KeyboardShortcut>
                <Text size="xs">Align left/center/right</Text>
              </FeatureItem>
              <FeatureItem>
                <KeyboardShortcut>Ctrl+B</KeyboardShortcut>
                <Text size="xs">Toggle bold</Text>
              </FeatureItem>
              <FeatureItem>
                <KeyboardShortcut>Ctrl+I</KeyboardShortcut>
                <Text size="xs">Toggle italic</Text>
              </FeatureItem>
              <FeatureItem>
                <KeyboardShortcut>Ctrl+W/K/R</KeyboardShortcut>
                <Text size="xs">White/Black/Red color</Text>
              </FeatureItem>
              <FeatureItem>
                <KeyboardShortcut>Enter</KeyboardShortcut>
                <Text size="xs">Complete text</Text>
              </FeatureItem>
              <FeatureItem>
                <KeyboardShortcut>Shift+Enter</KeyboardShortcut>
                <Text size="xs">New line</Text>
              </FeatureItem>
            </FeatureList>
          </Section>
        )}

        {/* Global Shortcuts */}
        <Section>
          <SectionTitle>Global Shortcuts</SectionTitle>
          <Button
            onClick={() => setShowKeyboardShortcuts(!showKeyboardShortcuts)}
            css={{ width: '100%', justifyContent: 'space-between' }}
          >
            <Text size="xs">Keyboard Shortcuts</Text>
            <Text size="xs">{showKeyboardShortcuts ? '▲' : '▼'}</Text>
          </Button>

          {showKeyboardShortcuts && (
            <FeatureList css={{ marginTop: '$2' }}>
              <FeatureItem>
                <KeyboardShortcut>R</KeyboardShortcut>
                <Text size="xs">Rectangle tool</Text>
              </FeatureItem>
              <FeatureItem>
                <KeyboardShortcut>C</KeyboardShortcut>
                <Text size="xs">Circle tool</Text>
              </FeatureItem>
              <FeatureItem>
                <KeyboardShortcut>L</KeyboardShortcut>
                <Text size="xs">Line tool</Text>
              </FeatureItem>
              <FeatureItem>
                <KeyboardShortcut>T</KeyboardShortcut>
                <Text size="xs">Text tool</Text>
              </FeatureItem>
              <FeatureItem>
                <KeyboardShortcut>P</KeyboardShortcut>
                <Text size="xs">Polygon tool</Text>
              </FeatureItem>
              <FeatureItem>
                <KeyboardShortcut>V</KeyboardShortcut>
                <Text size="xs">Select tool</Text>
              </FeatureItem>
              <FeatureItem>
                <KeyboardShortcut>Esc</KeyboardShortcut>
                <Text size="xs">Return to select tool</Text>
              </FeatureItem>
            </FeatureList>
          )}
        </Section>
      </PanelContent>
    </ToolsPanelContainer>
  )
}

export default EnhancedToolsPanel