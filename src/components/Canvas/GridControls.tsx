import React, { memo, forwardRef } from 'react'
import { Grid3x3, Magnet, Eye, EyeOff, Sparkles } from 'lucide-react'
import useMapStore from '@/store/mapStore'
import { Text } from '@/components/primitives/TextVE'

export type GridControlsProps = {
  className?: string
  style?: React.CSSProperties
}

// Grid Button component
export type GridButtonProps = {
  onClick: () => void
  active: boolean
  title: string
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export const GridButton = forwardRef<HTMLButtonElement, GridButtonProps>(
  ({ onClick, active, title, children, className, style }, ref) => {
    const buttonStyles: React.CSSProperties = {
      padding: '8px',
      borderRadius: '12px',
      border: '1px solid var(--gray700)',
      backgroundColor: active ? 'var(--gray700)' : 'var(--gray800)',
      color: active ? 'var(--secondary)' : 'var(--gray500)',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      outline: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      ...style,
    }

    return (
      <button
        ref={ref}
        onClick={onClick}
        title={title}
        style={buttonStyles}
        className={className}
        onMouseEnter={(e) => {
          if (!active) {
            e.currentTarget.style.backgroundColor = 'var(--gray700)'
          }
        }}
        onMouseLeave={(e) => {
          if (!active) {
            e.currentTarget.style.backgroundColor = 'var(--gray800)'
          }
        }}
      >
        {children}
      </button>
    )
  }
)

GridButton.displayName = 'GridButton'

// Snap Indicator component
export type SnapIndicatorProps = {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export const SnapIndicator = forwardRef<HTMLDivElement, SnapIndicatorProps>(
  ({ children, className, style }, ref) => {
    const indicatorStyles: React.CSSProperties = {
      marginLeft: '8px',
      paddingLeft: '8px',
      paddingRight: '8px',
      paddingTop: '4px',
      paddingBottom: '4px',
      borderRadius: '6px',
      backgroundColor: 'var(--gray800)',
      border: '1px solid var(--gray700)',
      ...style,
    }

    return (
      <div ref={ref} style={indicatorStyles} className={className}>
        {children}
      </div>
    )
  }
)

SnapIndicator.displayName = 'SnapIndicator'

const GridControlsComponent = ({ className, style }: GridControlsProps) => {
  // Use specific selectors to prevent unnecessary re-renders
  const currentMap = useMapStore((state: any) => state.currentMap)
  const spellPreviewEnabled = useMapStore((state: any) => state.spellPreviewEnabled)
  const toggleGridSnap = useMapStore((state: any) => state.toggleGridSnap)
  const toggleGridVisibility = useMapStore((state: any) => state.toggleGridVisibility)
  const toggleSpellPreview = useMapStore((state: any) => state.toggleSpellPreview)

  if (!currentMap) return null

  const { grid } = currentMap

  const containerStyles: React.CSSProperties = {
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

  const rowStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  }

  const labelContainerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginRight: '8px',
  }

  const dividerStyles: React.CSSProperties = {
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