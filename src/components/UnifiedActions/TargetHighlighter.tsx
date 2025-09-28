import { memo, useEffect, useState, useRef } from 'react'
import { Group, Circle, Rect, Line, Wedge } from 'react-konva'
import type Konva from 'konva'
import useMapStore from '@/store/mapStore'
import { useUnifiedActionStore } from '@/store/unifiedActionStore'
import { detectAffectedTokens, generateActionArea } from '@/utils/targetDetection'
// import { TOKEN_SIZES } from '@/components/Token/utils/tokenConstants'
// Temporary TOKEN_SIZES until the constants file is created
const TOKEN_SIZES = {
  tiny: 0.5,
  small: 1,
  medium: 1,
  large: 2,
  huge: 3,
  gargantuan: 4
}
import type { Token } from '@/types'
import type { UnifiedAction, AreaShape } from '@/types/unifiedAction'

type TargetHighlighterProps = {
  tokenIds?: string[]
  color?: string
  pulseAnimation?: boolean
  duration?: number
  showAreaPreviews?: boolean
}

const TargetHighlighterComponent = ({
  tokenIds,
  color = '#FFD700',
  pulseAnimation = true,
  duration,
  showAreaPreviews = true
}: TargetHighlighterProps) => {
  const highlightedTargets = useUnifiedActionStore(state => state.highlightedTargets)
  const activeActions = useUnifiedActionStore(state => state.activeActions)
  const currentMap = useMapStore(state => state.currentMap)
  const [animationPhase, setAnimationPhase] = useState(0)
  const [detectedTargets, setDetectedTargets] = useState<Set<string>>(new Set())
  const groupRef = useRef<Konva.Group>(null)

  // Get all tokens from map
  const allTokens = currentMap?.objects.filter(obj => obj.type === 'token') as Token[] || []

  // Detect affected tokens for active actions
  useEffect(() => {
    const newTargets = new Set<string>()

    activeActions.forEach(action => {
      const affected = detectAffectedTokens(action, allTokens)
      affected.forEach(token => newTargets.add(token.id))
    })

    setDetectedTargets(newTargets)
  }, [activeActions, allTokens])

  // Combine all highlighted targets
  const targetIds = new Set([
    ...(tokenIds || []),
    ...highlightedTargets.map(ht => ht.tokenId),
    ...detectedTargets
  ])

  // Get token objects from map
  const tokens = allTokens.filter(token => targetIds.has(token.id))

  useEffect(() => {
    if (!pulseAnimation || tokens.length === 0) return

    // Create pulse animation
    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 0.1) % (Math.PI * 2))
    }, 50)

    // Clean up after duration if specified
    let timeout: NodeJS.Timeout | undefined
    if (duration && duration > 0) {
      timeout = setTimeout(() => {
        clearInterval(interval)
      }, duration)
    }

    return () => {
      clearInterval(interval)
      if (timeout) clearTimeout(timeout)
    }
  }, [pulseAnimation, tokens.length, duration])

  const renderAreaPreview = (area: AreaShape, action: UnifiedAction) => {
    const previewColor = action.animation.color || color
    const key = `area-${action.id}`

    switch (area.type) {
      case 'circle':
        return (
          <Circle
            key={key}
            x={area.center.x}
            y={area.center.y}
            radius={area.radius}
            stroke={previewColor}
            strokeWidth={2}
            fill={previewColor}
            opacity={0.1}
            listening={false}
            dash={[10, 5]}
            dashOffset={animationPhase * 10}
          />
        )

      case 'square':
        return (
          <Rect
            key={key}
            x={area.center.x - area.size / 2}
            y={area.center.y - area.size / 2}
            width={area.size}
            height={area.size}
            stroke={previewColor}
            strokeWidth={2}
            fill={previewColor}
            opacity={0.1}
            listening={false}
            dash={[10, 5]}
            dashOffset={animationPhase * 10}
          />
        )

      case 'cone':
        return (
          <Wedge
            key={key}
            x={area.origin.x}
            y={area.origin.y}
            radius={area.range}
            angle={area.angle}
            rotation={area.direction - area.angle / 2}
            stroke={previewColor}
            strokeWidth={2}
            fill={previewColor}
            opacity={0.1}
            listening={false}
            dash={[10, 5]}
            dashOffset={animationPhase * 10}
          />
        )

      case 'line': {
        const dx = area.end.x - area.start.x
        const dy = area.end.y - area.start.y
        const length = Math.sqrt(dx * dx + dy * dy)
        const perpX = -dy / length * area.width / 2
        const perpY = dx / length * area.width / 2

        const points = [
          area.start.x + perpX, area.start.y + perpY,
          area.end.x + perpX, area.end.y + perpY,
          area.end.x - perpX, area.end.y - perpY,
          area.start.x - perpX, area.start.y - perpY
        ]

        return (
          <Line
            key={key}
            points={points}
            closed
            stroke={previewColor}
            strokeWidth={2}
            fill={previewColor}
            opacity={0.1}
            listening={false}
            dash={[10, 5]}
            dashOffset={animationPhase * 10}
          />
        )
      }

      default:
        return null
    }
  }

  const renderTokenHighlight = (token: Token) => {
    const gridSquares = TOKEN_SIZES[token.size || 'medium'] // Already represents grid squares
    const gridSize = currentMap?.grid.size || 50
    const tokenRadius = (gridSquares * gridSize) / 2

    // Determine highlight color based on source
    const highlightInfo = highlightedTargets.find(ht => ht.tokenId === token.id)
    const highlightColor = highlightInfo?.color || color
    const isDetected = detectedTargets.has(token.id)

    // Calculate pulse effect
    const pulseScale = pulseAnimation
      ? 1 + Math.sin(animationPhase) * 0.15
      : 1

    const strokeWidth = isDetected ? 4 : 3
    const glowRadius = tokenRadius + 15

    return (
      <Group key={token.id} x={token.position.x} y={token.position.y}>
        {/* Outer glow effect */}
        <Circle
          radius={glowRadius * pulseScale}
          stroke={highlightColor}
          strokeWidth={1}
          opacity={0.3}
          listening={false}
        />

        {/* Main highlight ring */}
        <Circle
          radius={tokenRadius + 5}
          stroke={highlightColor}
          strokeWidth={strokeWidth}
          opacity={0.8}
          scaleX={pulseScale}
          scaleY={pulseScale}
          listening={false}
          shadowColor={highlightColor}
          shadowBlur={15}
          shadowOpacity={0.6}
        />

        {/* Inner ring for emphasis */}
        <Circle
          radius={tokenRadius}
          stroke={highlightColor}
          strokeWidth={1}
          opacity={0.5}
          scaleX={pulseScale}
          scaleY={pulseScale}
          listening={false}
        />

        {/* Target crosshair for detected targets */}
        {isDetected && (
          <Group opacity={0.7}>
            {[0, 90, 180, 270].map(angle => (
              <Line
                key={angle}
                points={[
                  tokenRadius * 0.6 * Math.cos(angle * Math.PI / 180),
                  tokenRadius * 0.6 * Math.sin(angle * Math.PI / 180),
                  tokenRadius * 0.9 * Math.cos(angle * Math.PI / 180),
                  tokenRadius * 0.9 * Math.sin(angle * Math.PI / 180)
                ]}
                stroke={highlightColor}
                strokeWidth={2}
                listening={false}
                opacity={Math.sin(animationPhase + angle * Math.PI / 180) * 0.5 + 0.5}
              />
            ))}
          </Group>
        )}
      </Group>
    )
  }

  // Don't render if no tokens to highlight and no active actions
  if (tokens.length === 0 && activeActions.length === 0) return null

  return (
    <Group ref={groupRef} listening={false}>
      {/* Render area previews first (behind token highlights) */}
      {showAreaPreviews && activeActions.map(action => {
        const area = action.effects.areaOfEffect || generateActionArea(action)
        if (!area) return null
        return renderAreaPreview(area, action)
      })}

      {/* Render token highlights */}
      {tokens.map(renderTokenHighlight)}
    </Group>
  )
}

export const TargetHighlighter = memo(TargetHighlighterComponent)