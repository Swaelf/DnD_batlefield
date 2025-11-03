/**
 * StatusEffectOverlay - Visual effects for token status conditions
 *
 * Renders animated visual effects on top of tokens to indicate conditions like
 * stunned, poisoned, on fire, etc. Effects can stack and combine.
 */

import { memo, useEffect, useRef, useState, type FC } from 'react'
import { Group, Circle, Ring, Line, Star } from 'react-konva'
import Konva from 'konva'
import type { StatusEffect } from '@/types'
import { STATUS_EFFECT_CONFIGS } from '@/types'

type StatusEffectOverlayProps = {
  statusEffects: StatusEffect[]
  tokenRadius: number
  tokenId: string
}

/**
 * Individual status effect renderer
 */
const StatusEffectRenderer: FC<{
  effect: StatusEffect
  tokenRadius: number
  index: number
  tokenId: string
}> = memo(({ effect, tokenRadius, index, tokenId }) => {
  const config = STATUS_EFFECT_CONFIGS[effect.type]
  const groupRef = useRef<Konva.Group>(null)
  const animationRef = useRef<Konva.Animation | null>(null)
  const [animationState, setAnimationState] = useState(0)

  useEffect(() => {
    const group = groupRef.current
    if (!group) return

    // Create animation based on effect type
    const anim = new Konva.Animation((frame) => {
      if (!frame) return

      const time = frame.time / 1000 // Convert to seconds
      const intensity = effect.intensity ?? 1

      // Update animation state for render
      setAnimationState(time)

      switch (config.animationType) {
        case 'pulse': {
          // Pulsing scale effect
          const scale = 1 + Math.sin(time * 3) * 0.15 * intensity
          group.scale({ x: scale, y: scale })
          break
        }

        case 'spin': {
          // Spinning effect
          group.rotation((time * 60) % 360)
          break
        }

        case 'flicker': {
          // Flickering opacity
          const opacity = config.opacity * (0.6 + Math.random() * 0.4 * intensity)
          group.opacity(opacity)
          break
        }

        case 'wave': {
          // Wave motion
          const offset = Math.sin(time * 2 + index * 0.5) * 5 * intensity
          group.y(offset)
          break
        }

        case 'bubbles': {
          // Bubbling/rising effect
          const offset = Math.sin(time * 3) * 3 * intensity
          group.y(offset)
          break
        }

        case 'shimmer': {
          // Shimmering opacity and scale
          const shimmer = Math.sin(time * 4 + index * 0.3) * 0.5 + 0.5
          group.opacity(config.opacity * (0.5 + shimmer * 0.5))
          const scale = 1 + shimmer * 0.1 * intensity
          group.scale({ x: scale, y: scale })
          break
        }

        default:
          break
      }
    })

    animationRef.current = anim
    anim.start()

    return () => {
      anim.stop()
    }
  }, [effect, config, tokenRadius, index])

  // Render based on effect type - custom visuals for each
  const renderEffect = () => {
    const color = config.color
    const secondaryColor = config.secondaryColor || color
    // const intensity = effect.intensity ?? 1 // Used in future for intensity-based rendering

    // Custom rendering for specific effects
    if (effect.type === 'flaming') {
      // Flaming: Full overlay with flickering fire texture
      return (
        <>
          {/* Fire overlay */}
          <Circle
            radius={tokenRadius}
            fill={color}
            opacity={0.3 + Math.sin(animationState * 8) * 0.15}
            listening={false}
          />
          {/* Flame particles around edge */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
            const rad = (angle * Math.PI) / 180
            const flicker = Math.sin(animationState * 10 + i) * 5
            const x = Math.cos(rad) * (tokenRadius + flicker)
            const y = Math.sin(rad) * (tokenRadius + flicker)
            return (
              <Group key={i} x={x} y={y} rotation={angle + 90}>
                <Line
                  points={[0, 0, 0, -18, -4, -14, 4, -14, 0, -18]}
                  fill={i % 2 === 0 ? color : secondaryColor}
                  closed
                  opacity={0.7 + Math.sin(animationState * 8 + i) * 0.3}
                  listening={false}
                />
              </Group>
            )
          })}
        </>
      )
    }

    if (effect.type === 'chilled') {
      // Chilled: Snowflake overlay with floating ice crystals
      return (
        <>
          {/* Frost overlay */}
          <Circle
            radius={tokenRadius}
            fill={color}
            opacity={0.25}
            listening={false}
          />
          {/* Snowflakes */}
          {Array.from({ length: 8 }, (_, i) => {
            const angle = (i * 45 * Math.PI) / 180
            const wobble = Math.sin(animationState * 2 + i) * 8
            const x = Math.cos(angle) * (tokenRadius * 0.7) + wobble
            const y = Math.sin(angle) * (tokenRadius * 0.7) + wobble
            return (
              <Star
                key={i}
                x={x}
                y={y}
                numPoints={6}
                innerRadius={3}
                outerRadius={6}
                fill={secondaryColor}
                stroke={color}
                strokeWidth={1}
                opacity={0.8}
                rotation={animationState * 20 + i * 60}
                listening={false}
              />
            )
          })}
        </>
      )
    }

    if (effect.type === 'entangled') {
      // Entangled: Roots/vines from bottom wrapping around token
      return (
        <>
          {/* Bottom roots cluster */}
          <Group y={tokenRadius * 0.5}>
            {Array.from({ length: 5 }, (_, i) => {
              const offset = (i - 2) * 8
              const sway = Math.sin(animationState * 2 + i) * 3
              return (
                <Line
                  key={i}
                  points={[
                    offset + sway, tokenRadius * 0.6,
                    offset + sway * 0.5, tokenRadius * 0.3,
                    offset, 0,
                    offset - sway * 0.5, -tokenRadius * 0.3,
                    offset - sway, -tokenRadius * 0.6
                  ]}
                  stroke={i % 2 === 0 ? color : secondaryColor}
                  strokeWidth={3}
                  lineCap="round"
                  opacity={0.8}
                  listening={false}
                />
              )
            })}
          </Group>
          {/* Vine ring around token */}
          <Circle
            radius={tokenRadius + 2}
            stroke={color}
            strokeWidth={4}
            opacity={0.6}
            dash={[8, 4]}
            listening={false}
          />
        </>
      )
    }

    if (effect.type === 'poisoned') {
      // Poisoned: Bubbling/dripping toxic effect
      return (
        <>
          {/* Poison drips */}
          {Array.from({ length: 8 }, (_, i) => {
            const angle = (i * 45 * Math.PI) / 180
            const drip = Math.abs(Math.sin(animationState * 3 + i)) * 12
            const x = Math.cos(angle) * tokenRadius
            const y = Math.sin(angle) * tokenRadius + drip
            return (
              <Circle
                key={i}
                x={x}
                y={y}
                radius={3 + Math.sin(animationState * 4 + i) * 1.5}
                fill={i % 2 === 0 ? color : secondaryColor}
                opacity={0.7 - (drip / 12) * 0.3}
                listening={false}
              />
            )
          })}
          {/* Poison cloud overlay */}
          <Circle
            radius={tokenRadius}
            fill={color}
            opacity={0.15 + Math.sin(animationState * 2) * 0.1}
            listening={false}
          />
        </>
      )
    }

    if (effect.type === 'blessed') {
      // Blessed: Golden shimmer with radiating light
      return (
        <>
          {/* Radiant glow overlay */}
          <Circle
            radius={tokenRadius}
            fill={color}
            opacity={0.2 + Math.sin(animationState * 2) * 0.1}
            listening={false}
          />
          {/* Radiating light rays */}
          {Array.from({ length: 8 }, (_, i) => {
            const angle = (i * 45 * Math.PI) / 180
            const shimmer = Math.sin(animationState * 4 + i) * 0.3 + 0.7
            const length = (tokenRadius + 8) * shimmer
            const x1 = Math.cos(angle) * tokenRadius
            const y1 = Math.sin(angle) * tokenRadius
            const x2 = Math.cos(angle) * length
            const y2 = Math.sin(angle) * length
            return (
              <Line
                key={i}
                points={[x1, y1, x2, y2]}
                stroke={secondaryColor}
                strokeWidth={2}
                opacity={shimmer * 0.8}
                listening={false}
              />
            )
          })}
        </>
      )
    }

    if (effect.type === 'regenerating') {
      // Regenerating: Pulsing green energy with healing particles
      return (
        <>
          {/* Healing aura overlay */}
          <Circle
            radius={tokenRadius}
            fill={color}
            opacity={0.15 + Math.sin(animationState * 3) * 0.1}
            listening={false}
          />
          {/* Healing particles rising upward */}
          {Array.from({ length: 6 }, (_, i) => {
            const angle = (i * 60 * Math.PI) / 180
            const rise = (animationState * 20 + i * 10) % 40 - 20
            const x = Math.cos(angle) * tokenRadius * 0.7
            const y = Math.sin(angle) * tokenRadius * 0.7 - rise
            const opacity = 1 - Math.abs(rise) / 20
            return (
              <Star
                key={i}
                x={x}
                y={y}
                numPoints={4}
                innerRadius={2}
                outerRadius={4}
                fill={secondaryColor}
                opacity={opacity * 0.8}
                listening={false}
              />
            )
          })}
        </>
      )
    }

    if (effect.type === 'sleeping') {
      // Sleeping: Floating Z's and gentle breathing aura
      return (
        <>
          {/* Sleep overlay */}
          <Circle
            radius={tokenRadius}
            fill={color}
            opacity={0.2 + Math.sin(animationState * 1.5) * 0.05}
            listening={false}
          />
          {/* Floating Z's */}
          {Array.from({ length: 3 }, (_, i) => {
            const rise = ((animationState * 15 + i * 15) % 60) - 10
            const drift = Math.sin(animationState * 2 + i) * 5
            const opacity = Math.max(0, 1 - rise / 50)
            return (
              <Group key={i} x={tokenRadius * 0.6 + drift} y={-tokenRadius * 0.3 - rise}>
                <Line
                  points={[0, 0, 8, 0, 0, 10, 8, 10]}
                  stroke={secondaryColor}
                  strokeWidth={2}
                  opacity={opacity * 0.7}
                  listening={false}
                />
              </Group>
            )
          })}
        </>
      )
    }

    if (effect.type === 'frightened') {
      // Frightened: Dark shadowy tendrils reaching from edges
      return (
        <>
          {/* Fear overlay */}
          <Circle
            radius={tokenRadius}
            fill={secondaryColor}
            opacity={0.2 + Math.random() * 0.1}
            listening={false}
          />
          {/* Shadow tendrils */}
          {Array.from({ length: 8 }, (_, i) => {
            const angle = (i * 45 * Math.PI) / 180
            const flicker = Math.sin(animationState * 6 + i) * 0.3 + 0.7
            const length = tokenRadius * (0.8 + flicker * 0.4)
            const x1 = Math.cos(angle) * length
            const y1 = Math.sin(angle) * length
            const x2 = Math.cos(angle) * tokenRadius
            const y2 = Math.sin(angle) * tokenRadius
            return (
              <Line
                key={i}
                points={[x1, y1, x2, y2]}
                stroke={color}
                strokeWidth={3}
                opacity={flicker * 0.6}
                lineCap="round"
                listening={false}
              />
            )
          })}
        </>
      )
    }

    // Default rendering based on animation type
    switch (config.animationType) {
      case 'ring':
      case 'pulse':
        return (
          <Ring
            innerRadius={tokenRadius - 3}
            outerRadius={tokenRadius + 3}
            stroke={color}
            strokeWidth={2}
            opacity={config.opacity}
            listening={false}
          />
        )

      case 'spin':
        return (
          <>
            {[0, 90, 180, 270].map((angle, i) => {
              const rad = (angle * Math.PI) / 180
              const x = Math.cos(rad) * (tokenRadius + 10)
              const y = Math.sin(rad) * (tokenRadius + 10)
              return (
                <Circle
                  key={i}
                  x={x}
                  y={y}
                  radius={4}
                  fill={color}
                  opacity={config.opacity}
                  listening={false}
                />
              )
            })}
          </>
        )

      case 'wave':
        return (
          <>
            <Circle
              radius={tokenRadius + 5}
              stroke={color}
              strokeWidth={2}
              opacity={config.opacity * 0.6}
              dash={[5, 5]}
              listening={false}
            />
            <Circle
              radius={tokenRadius + 10}
              stroke={secondaryColor}
              strokeWidth={2}
              opacity={config.opacity * 0.4}
              dash={[5, 5]}
              listening={false}
            />
          </>
        )

      case 'particles':
        return (
          <>
            {Array.from({ length: 12 }, (_, i) => {
              const angle = (i * 30 * Math.PI) / 180
              const distance = tokenRadius + 5 + (i % 3) * 5
              const x = Math.cos(angle) * distance
              const y = Math.sin(angle) * distance
              return (
                <Circle
                  key={i}
                  x={x}
                  y={y}
                  radius={2}
                  fill={i % 2 === 0 ? color : secondaryColor}
                  opacity={config.opacity}
                  listening={false}
                />
              )
            })}
          </>
        )

      case 'overlay':
        return (
          <Circle
            radius={tokenRadius}
            fill={color}
            opacity={config.opacity}
            listening={false}
          />
        )

      default:
        return null
    }
  }

  return (
    <Group ref={groupRef} id={`status-effect-${tokenId}-${effect.type}`} listening={false}>
      {renderEffect()}
    </Group>
  )
})

StatusEffectRenderer.displayName = 'StatusEffectRenderer'

/**
 * Main overlay component that combines all active status effects
 */
export const StatusEffectOverlay: FC<StatusEffectOverlayProps> = memo(({
  statusEffects,
  tokenRadius,
  tokenId,
}) => {
  if (!statusEffects || statusEffects.length === 0) {
    return null
  }

  // Sort effects by layer (bottom to top)
  const sortedEffects = [...statusEffects].sort((a, b) => {
    const layerA = STATUS_EFFECT_CONFIGS[a.type].layer
    const layerB = STATUS_EFFECT_CONFIGS[b.type].layer
    return layerA - layerB
  })

  return (
    <Group listening={false}>
      {sortedEffects.map((effect, index) => (
        <StatusEffectRenderer
          key={`${effect.type}-${index}`}
          effect={effect}
          tokenRadius={tokenRadius}
          index={index}
          tokenId={tokenId}
        />
      ))}
    </Group>
  )
})

StatusEffectOverlay.displayName = 'StatusEffectOverlay'
