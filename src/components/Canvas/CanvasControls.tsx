import { memo, forwardRef, type ReactNode, type CSSProperties } from 'react'
import { Text } from '@/components/primitives/TextVE'

export type CanvasControlsProps = {
  stageScale: number
  zoomIn: () => void
  zoomOut: () => void
  resetView: () => void
  centerView: () => void
  className?: string
  style?: CSSProperties
}

// Control Button component
export type ControlButtonProps = {
  onClick: () => void
  title: string
  children: ReactNode
  className?: string
  style?: CSSProperties
}

export const ControlButton = forwardRef<HTMLButtonElement, ControlButtonProps>(
  ({ onClick, title, children, className, style }, ref) => {
    const buttonStyles: CSSProperties = {
      padding: '6px 8px',
      backgroundColor: 'var(--gray800)',
      border: '1px solid var(--gray700)',
      borderRadius: '6px',
      color: 'var(--gray200)',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      outline: 'none',
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
          e.currentTarget.style.backgroundColor = 'var(--gray700)'
          e.currentTarget.style.color = 'var(--gray100)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--gray800)'
          e.currentTarget.style.color = 'var(--gray200)'
        }}
        onFocus={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--gray700)'
          e.currentTarget.style.color = 'var(--gray100)'
        }}
        onBlur={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--gray800)'
          e.currentTarget.style.color = 'var(--gray200)'
        }}
      >
        {children}
      </button>
    )
  }
)

ControlButton.displayName = 'ControlButton'

const CanvasControlsComponent = ({
  stageScale,
  zoomIn,
  zoomOut,
  resetView,
  centerView,
  className,
  style
}: CanvasControlsProps) => {
  const panelStyles: CSSProperties = {
    position: 'absolute',
    top: '16px',
    right: '16px',
    zIndex: 50,
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    borderRadius: '12px',
    padding: '8px',
    backdropFilter: 'blur(4px)',
    border: '1px solid var(--gray700)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    ...style,
  }

  const containerStyles: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  }

  return (
    <div style={panelStyles} className={className}>
      <div style={containerStyles}>
        <Text style={{ fontSize: '14px', color: 'var(--gray300)' }}>
          Zoom: {Math.round(stageScale * 100)}%
        </Text>
        <ControlButton
          onClick={zoomOut}
          title="Zoom Out"
        >
          −
        </ControlButton>
        <ControlButton
          onClick={zoomIn}
          title="Zoom In"
        >
          +
        </ControlButton>
        <ControlButton
          onClick={resetView}
          title="Reset View (Ctrl+0)"
        >
          Reset
        </ControlButton>
        <ControlButton
          onClick={centerView}
          title="Fit to Screen"
        >
          Fit
        </ControlButton>
      </div>
    </div>
  )
}

export const CanvasControls = memo(CanvasControlsComponent)
CanvasControls.displayName = 'CanvasControls'