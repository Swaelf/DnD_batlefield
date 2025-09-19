import React, { useEffect, useRef } from 'react'
import { Circle, Group, RegularPolygon, Ring } from 'react-konva'
import Konva from 'konva'
import { SpellEventData } from '@/types/timeline'

type AreaSpellProps = {
  spell: SpellEventData
  isAnimating: boolean
  onAnimationComplete?: () => void
}

export const AreaSpell: React.FC<AreaSpellProps> = ({
  spell,
  isAnimating,
  onAnimationComplete
}) => {
  const areaRef = useRef<Konva.Group>(null)
  const pulseRef = useRef<Konva.Ring>(null)
  const hasStartedRef = useRef(false)
  const animationsRef = useRef<Set<Konva.Animation>>(new Set())

  // Reset flag when animation should start fresh
  useEffect(() => {
    if (!isAnimating) {
      hasStartedRef.current = false
    }
  }, [isAnimating])

  useEffect(() => {
    if (!isAnimating || !areaRef.current || hasStartedRef.current) return

    hasStartedRef.current = true
    const area = areaRef.current

    // Position at target
    area.position(spell.toPosition)
    area.visible(true)

    // Check if this is a persistent area effect
    const isPersistent = spell.persistDuration && spell.persistDuration > 0

    if (isPersistent) {
      // For persistent area effects: simple fade-in then stay visible
      area.opacity(0)
      area.scale({ x: 0.5, y: 0.5 })

      const fadeInAnim = new Konva.Animation((frame) => {
        if (!frame) return

        const fadeInDuration = 500
        const progress = Math.min(frame.time / fadeInDuration, 1)

        area.opacity(progress * 0.7) // Slightly more transparent for persistent effects
        area.scale({ x: 0.5 + progress * 0.5, y: 0.5 + progress * 0.5 })

        if (progress >= 1) {
          fadeInAnim.stop()
          animationsRef.current.delete(fadeInAnim)
          // Stay visible - no animation complete callback yet
          // The spell will be removed by the cleanup system after persistDuration
        }
      })

      animationsRef.current.add(fadeInAnim)
      fadeInAnim.start()

      // Cleanup function
      return () => {
        animationsRef.current.forEach(anim => {
          anim.stop()
          anim.destroy()
        })
        animationsRef.current.clear()
      }
    } else {
      // For instant area effects: original pulsing animation
      const pulse = pulseRef.current
      area.opacity(0)

      const fadeInAnim = new Konva.Animation((frame) => {
        if (!frame) return

        const fadeInDuration = 300
        const progress = Math.min(frame.time / fadeInDuration, 1)

        area.opacity(progress * 0.8)
        area.scale({ x: progress, y: progress })

        if (progress >= 1) {
          fadeInAnim.stop()

          // Start brief pulse effect for instant spells
          if (pulse) {
            const pulseAnim = new Konva.Animation((pulseFrame) => {
              if (!pulseFrame) return

              const pulseDuration = spell.duration || 1500
              const pulseProgress = (pulseFrame.time % 1000) / 1000
              const innerRadius = Math.max(0, spell.size * 0.7 + (spell.size * 0.2 * pulseProgress))
              const outerRadius = Math.max(innerRadius + 1, spell.size + (spell.size * 0.3 * pulseProgress))
              const opacity = 0.6 * (1 - pulseProgress)

              pulse.innerRadius(innerRadius)
              pulse.outerRadius(outerRadius)
              pulse.opacity(opacity)

              if (pulseFrame.time >= pulseDuration) {
                pulseAnim.stop()
                animationsRef.current.delete(pulseAnim)

                // Fade out
                const fadeOutAnim = new Konva.Animation((fadeFrame) => {
                  if (!fadeFrame) return

                  const fadeProgress = Math.min(fadeFrame.time / 300, 1)
                  area.opacity(0.8 * (1 - fadeProgress))

                  if (fadeProgress >= 1) {
                    fadeOutAnim.stop()
                    animationsRef.current.delete(fadeOutAnim)
                    area.visible(false)
                    onAnimationComplete?.()
                  }
                })

                animationsRef.current.add(fadeOutAnim)
                fadeOutAnim.start()
              }
            })

            animationsRef.current.add(pulseAnim)
            pulseAnim.start()
          }
        }
      })

      animationsRef.current.add(fadeInAnim)
      fadeInAnim.start()

      // Cleanup function
      return () => {
        animationsRef.current.forEach(anim => {
          anim.stop()
          anim.destroy()
        })
        animationsRef.current.clear()
      }
    }
  }, [isAnimating, spell.toPosition, spell.persistDuration, spell.duration, spell.size])

  // Determine shape based on spell
  const sides = spell.spellName?.toLowerCase().includes('web') ? 6 : 30 // Hexagon for web, circle for others

  return (
    <Group ref={areaRef} visible={false}>
      {/* Main area effect */}
      <RegularPolygon
        x={0}
        y={0}
        sides={sides}
        radius={Math.max(1, spell.size)}
        fill={spell.color}
        opacity={spell.persistDuration && spell.persistDuration > 0 ? 0.5 : 0.4}
        shadowColor={spell.color}
        shadowBlur={spell.size * 0.5}
        shadowOpacity={0.6}
      />

      {/* Border for persistent effects */}
      {spell.persistDuration && spell.persistDuration > 0 && (
        <RegularPolygon
          x={0}
          y={0}
          sides={sides}
          radius={Math.max(1, spell.size)}
          stroke={spell.color}
          strokeWidth={3}
          opacity={0.8}
        />
      )}

      {/* Inner glow */}
      <RegularPolygon
        x={0}
        y={0}
        sides={sides}
        radius={Math.max(1, spell.size * 0.7)}
        fill={spell.secondaryColor || spell.color}
        opacity={spell.persistDuration && spell.persistDuration > 0 ? 0.4 : 0.3}
      />

      {/* Pulsing ring - only for instant effects */}
      {(!spell.persistDuration || spell.persistDuration === 0) && (
        <Ring
          ref={pulseRef}
          x={0}
          y={0}
          innerRadius={Math.max(0, spell.size * 0.7)}
          outerRadius={Math.max(1, spell.size)}
          fill={spell.color}
          opacity={0}
        />
      )}

      {/* Particle effects */}
      {spell.particleEffect && Array.from({ length: 8 }).map((_, i) => {
        const angle = (i * Math.PI * 2) / 8
        const x = Math.cos(angle) * spell.size * 0.8
        const y = Math.sin(angle) * spell.size * 0.8

        return (
          <Circle
            key={i}
            x={x}
            y={y}
            radius={Math.max(1, spell.size * 0.05)}
            fill={spell.secondaryColor || '#ffffff'}
            opacity={0.8}
          />
        )
      })}
    </Group>
  )
}