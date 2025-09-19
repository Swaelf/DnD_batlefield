import React, { useEffect, useRef } from 'react'
import { Line, Group, Circle } from 'react-konva'
import Konva from 'konva'
import { SpellEventData } from '@/types/timeline'

type RaySpellProps = {
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
    let dx = spell.toPosition.x - spell.fromPosition.x
    let dy = spell.toPosition.y - spell.fromPosition.y
    let distance = Math.sqrt(dx * dx + dy * dy)

    // Limit range if specified
    if (spell.range && distance > spell.range) {
      const ratio = spell.range / distance
      dx *= ratio
      dy *= ratio
      distance = spell.range
    }

    // Calculate actual target position (may be limited by range)
    const actualTarget = {
      x: spell.fromPosition.x + dx,
      y: spell.fromPosition.y + dy
    }

    // Set initial state
    ray.points([
      spell.fromPosition.x,
      spell.fromPosition.y,
      spell.fromPosition.x,
      spell.fromPosition.y
    ])
    ray.visible(true)

    if (impact) {
      impact.position(actualTarget)
      impact.visible(false)
    }

    // Animate ray extension
    const rayAnim = new Konva.Animation((frame) => {
      if (!frame) return

      const duration = spell.duration || 500
      const progress = Math.min(frame.time / duration, 1)

      // Extend ray instantly (rays are instant in D&D)
      ray.points([
        spell.fromPosition.x,
        spell.fromPosition.y,
        actualTarget.x,
        actualTarget.y
      ])

      // Keep consistent width, no pulse
      ray.strokeWidth(spell.size)

      // Fade in/out effect for the ray
      const fadeIn = Math.min(frame.time / 100, 1) // Quick fade in
      const fadeOut = frame.time > duration - 200 ? Math.max(0, 1 - (frame.time - (duration - 200)) / 200) : 1
      ray.opacity(0.9 * fadeIn * fadeOut)

      // Show impact immediately (rays are instant)
      if (frame.time > 50 && impact && !impact.visible()) {
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
        x={0}
        y={0}
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