import { memo, type CSSProperties } from 'react'
import { Grid3x3, Magnet, Eye, EyeOff, Sparkles } from '@/utils/optimizedIcons'
import useMapStore from '@/store/mapStore'
import { Text } from '@/components/primitives/TextVE'
import { GridButton } from './GridButton'
import { SnapIndicator } from './SnapIndicator'

export type GridControlsProps = {
  className?: string
  style?: CSSProperties
}

const GridControlsComponent = ({ className, style }: GridControlsProps) => {
  // Use specific selectors to prevent unnecessary re-renders
  const currentMap = useMapStore((state: any) => state.currentMap)
  const spellPreviewEnabled = useMapStore((state: any) => state.spellPreviewEnabled)
  const toggleGridSnap = useMapStore((state: any) => state.toggleGridSnap)
  const toggleGridVisibility = useMapStore((state: any) => state.toggleGridVisibility)
  const toggleSpellPreview = useMapStore((state: any) => state.toggleSpellPreview)

  if (!currentMap) return null

  const { grid } = currentMap

  const containerStyles: CSSProperties = {
    position: 'absolute',
    top: '16px',
    left: '16px',
    zIndex: 50,
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    borderRadius: '12px',
    padding: '8px',
    backdropFilter: 'blur(4px)',
    border: '1px solid var(--gray700)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    ...style,
  }

  const rowStyles: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  }

  const labelContainerStyles: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginRight: '8px',
  }

  const dividerStyles: CSSProperties = {
    width: '1px',
    height: '24px',
    backgroundColor: 'var(--gray600)',
    margin: '0 8px',
  }

  return (
    <div style={containerStyles} className={className}>
      <div style={rowStyles}>
        {/* Grid Label */}
        <div style={labelContainerStyles}>
          <Grid3x3 size={16} color="#9CA3AF" />
          <Text style={{ fontSize: '12px', color: 'var(--gray400)' }}>Grid</Text>
        </div>

        {/* Toggle Grid Visibility */}
        <GridButton
          onClick={toggleGridVisibility}
          active={grid.visible}
          title={grid.visible ? 'Hide Grid (G)' : 'Show Grid (G)'}
        >
          {grid.visible ? (
            <Eye size={16} />
          ) : (
            <EyeOff size={16} />
          )}
        </GridButton>

        {/* Toggle Grid Snap */}
        <GridButton
          onClick={toggleGridSnap}
          active={grid.snap}
          title={grid.snap ? 'Disable Snap (Shift+G)' : 'Enable Snap (Shift+G)'}
        >
          <Magnet size={16} />
        </GridButton>

        {/* Snap Indicator */}
        <SnapIndicator>
          <Text
            style={{
              fontSize: '12px',
              color: grid.snap ? 'var(--secondary)' : 'var(--gray500)'
            }}
          >
            Snap: {grid.snap ? 'ON' : 'OFF'}
          </Text>
        </SnapIndicator>

        {/* Divider */}
        <div style={dividerStyles} />

        {/* Action Preview Toggle */}
        <GridButton
          onClick={toggleSpellPreview}
          active={spellPreviewEnabled}
          title={spellPreviewEnabled ? 'Disable Action Preview' : 'Enable Action Preview'}
        >
          <Sparkles size={16} />
        </GridButton>

        {/* Action Preview Indicator */}
        <SnapIndicator>
          <Text
            style={{
              fontSize: '12px',
              color: spellPreviewEnabled ? 'var(--secondary)' : 'var(--gray500)'
            }}
          >
            Preview: {spellPreviewEnabled ? 'ON' : 'OFF'}
          </Text>
        </SnapIndicator>
      </div>
    </div>
  )
}

export const GridControls = memo(GridControlsComponent)
GridControls.displayName = 'GridControls'
