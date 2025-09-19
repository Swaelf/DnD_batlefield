import React, { useEffect, useRef } from 'react'
import { Circle, Group, Star, Ring } from 'react-konva'
import Konva from 'konva'
import { SpellEventData } from '@/types/timeline'

interface BurstSpellProps {
  spell: SpellEventData
  isAnimating: boolean
  onAnimationComplete?: () => void
}

export const BurstSpell: React.FC<BurstSpellProps> = ({
  spell,
  isAnimating,
  onAnimationComplete
}) => {
  const burstRef = useRef<Konva.Group>(null)
  const coreRef = useRef<Konva.Circle>(null)
  const ringsRef = useRef<(Konva.Ring | null)[]>([])
  const starsRef = useRef<(Konva.Star | null)[]>([])

  useEffect(() => {
    if (!isAnimating || !burstRef.current) return

    const burst = burstRef.current
    const core = coreRef.current

    // Position at target
    burst.position(spell.toPosition)
    burst.visible(true)

    // Initial state
    burst.scale({ x: 0, y: 0 })
    burst.opacity(1)

    // Burst expansion animation
    const burstAnim = new Konva.Animation((frame) => {
      if (!frame) return

      const duration = spell.duration || 600
      const progress = Math.min(frame.time / duration, 1)

      // Exponential expansion
      const scale = Math.pow(progress, 0.5) * 1.5
      burst.scale({ x: scale, y: scale })

      // Core flash
      if (core) {
        const coreProgress = Math.min(progress * 2, 1)
        core.radius(Math.max(0, spell.size * coreProgress))
        core.opacity(1 - coreProgress * 0.7)
      }

      // Animate rings expanding outward
      ringsRef.current.forEach((ring, index) => {
        if (!ring) return

        const ringDelay = index * 0.1
        const ringProgress = Math.max(0, progress - ringDelay)

        const innerRadius = Math.max(0, spell.size * 0.3 * (1 + ringProgress * 3))
        const outerRadius = Math.max(innerRadius + 1, spell.size * 0.5 * (1 + ringProgress * 3))
        const opacity = 0.6 * (1 - ringProgress)

        ring.innerRadius(innerRadius)
        ring.outerRadius(outerRadius)
        ring.opacity(opacity)
      })

      // Animate star particles
      starsRef.current.forEach((star, index) => {
        if (!star) return

        const starProgress = Math.pow(progress, 0.7)
        const angle = (index * Math.PI * 2) / starsRef.current.length
        const distance = spell.size * starProgress * 2

        star.x(Math.cos(angle) * distance)
        star.y(Math.sin(angle) * distance)
        star.rotation(starProgress * 360)
        star.opacity(1 - starProgress * 0.8)
        star.scale({
          x: 1 - starProgress * 0.5,
          y: 1 - starProgress * 0.5
        })
      })

      // Fade out at end
      if (progress > 0.7) {
        const fadeProgress = (progress - 0.7) / 0.3
        burst.opacity(1 - fadeProgress)
      }

      if (progress >= 1) {
        burstAnim.stop()
        burst.visible(false)
        onAnimationComplete?.()
      }
    })

    burstAnim.start()

    return () => {
      burstAnim.stop()
    }
  }, [isAnimating, spell, onAnimationComplete])

  return (
    <Group ref={burstRef} visible={false}>
      {/* Core flash */}
      <Circle
        ref={coreRef}
        x={0}
        y={0}
        radius={0}
        fill={spell.secondaryColor || '#ffffff'}
        opacity={1}
        shadowColor={spell.secondaryColor || '#ffffff'}
        shadowBlur={spell.size * 2}
      />

      {/* Main burst */}
      <Circle
        x={0}
        y={0}
        radius={Math.max(1, spell.size)}
        fill={spell.color}
        opacity={0.6}
        shadowColor={spell.color}
        shadowBlur={spell.size}
        shadowOpacity={0.8}
      />

      {/* Expanding rings */}
      {Array.from({ length: 3 }).map((_, i) => (
        <Ring
          key={`ring-${i}`}
          ref={(el) => { ringsRef.current[i] = el }}
          x={0}
          y={0}
          innerRadius={Math.max(0, spell.size * 0.3)}
          outerRadius={Math.max(1, spell.size * 0.5)}
          fill={spell.color}
          opacity={0}
        />
      ))}

      {/* Particle stars */}
      {spell.particleEffect !== false && Array.from({ length: 12 }).map((_, i) => (
        <Star
          key={`star-${i}`}
          ref={(el) => { starsRef.current[i] = el }}
          x={0}
          y={0}
          numPoints={4}
          innerRadius={Math.max(0, spell.size * 0.05)}
          outerRadius={Math.max(1, spell.size * 0.1)}
          fill={spell.secondaryColor || '#ffffff'}
          opacity={1}
        />
      ))}
    </Group>
  )
}