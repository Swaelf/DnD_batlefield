import React, { useEffect, useRef } from 'react'
import { Line, Group, Circle } from 'react-konva'
import Konva from 'konva'
import { SpellEventData } from '@/types/timeline'

interface RaySpellProps {
  spell: SpellEventData
  isAnimating: boolean
  onAnimationComplete?: () => void
}

export const RaySpell: React.FC<RaySpellProps> = ({
  spell,
  isAnimating,
  onAnimationComplete
}) => {
  const rayRef = useRef<Konva.Line>(null)
  const impactRef = useRef<Konva.Circle>(null)

  useEffect(() => {
    if (!isAnimating || !rayRef.current) return

    const ray = rayRef.current
    const impact = impactRef.current

    // Calculate ray path
    const dx = spell.toPosition.x - spell.fromPosition.x
    const dy = spell.toPosition.y - spell.fromPosition.y
    // Distance calculation removed as it was unused

    // Set initial state
    ray.points([
      spell.fromPosition.x,
      spell.fromPosition.y,
      spell.fromPosition.x,
      spell.fromPosition.y
    ])
    ray.visible(true)

    if (impact) {
      impact.position(spell.toPosition)
      impact.visible(false)
    }

    // Animate ray extension
    const rayAnim = new Konva.Animation((frame) => {
      if (!frame) return

      const duration = spell.duration || 500
      const progress = Math.min(frame.time / duration, 1)

      // Extend ray
      const currentEndX = spell.fromPosition.x + (dx * progress)
      const currentEndY = spell.fromPosition.y + (dy * progress)

      ray.points([
        spell.fromPosition.x,
        spell.fromPosition.y,
        currentEndX,
        currentEndY
      ])

      // Pulse effect
      const pulseScale = 1 + Math.sin(frame.time * 0.01) * 0.2
      ray.strokeWidth(spell.size * pulseScale)

      // Show impact at end
      if (progress >= 1 && impact) {
        impact.visible(true)

        // Animate impact
        const impactAnim = new Konva.Animation((impactFrame) => {
          if (!impactFrame) return

          const impactProgress = Math.min(impactFrame.time / 200, 1)
          const radius = spell.size * 2 * impactProgress
          const opacity = 1 - impactProgress

          impact.radius(radius)
          impact.opacity(opacity)

          if (impactProgress >= 1) {
            impactAnim.stop()

            // Fade out ray
            const fadeAnim = new Konva.Animation((fadeFrame) => {
              if (!fadeFrame) return

              const fadeProgress = Math.min(fadeFrame.time / 200, 1)
              ray.opacity(1 - fadeProgress)

              if (fadeProgress >= 1) {
                fadeAnim.stop()
                ray.visible(false)
                impact.visible(false)
                onAnimationComplete?.()
              }
            })

            fadeAnim.start()
          }
        })

        impactAnim.start()
        rayAnim.stop()
      }
    })

    rayAnim.start()

    return () => {
      rayAnim.stop()
    }
  }, [isAnimating, spell, onAnimationComplete])

  return (
    <Group>
      {/* Main ray beam */}
      <Line
        ref={rayRef}
        points={[0, 0, 0, 0]}
        stroke={spell.color}
        strokeWidth={spell.size}
        lineCap="round"
        opacity={0.9}
        shadowColor={spell.color}
        shadowBlur={spell.size * 2}
        shadowOpacity={0.8}
        visible={false}
      />

      {/* Secondary ray (inner glow) */}
      {spell.secondaryColor && (
        <Line
          points={[
            spell.fromPosition.x,
            spell.fromPosition.y,
            spell.fromPosition.x,
            spell.fromPosition.y
          ]}
          stroke={spell.secondaryColor}
          strokeWidth={spell.size * 0.5}
          lineCap="round"
          opacity={0.9}
          listening={false}
        />
      )}

      {/* Impact effect */}
      <Circle
        ref={impactRef}
        x={spell.toPosition.x}
        y={spell.toPosition.y}
        radius={0}
        fill={spell.color}
        opacity={1}
        visible={false}
        shadowColor={spell.color}
        shadowBlur={spell.size * 3}
      />
    </Group>
  )
}