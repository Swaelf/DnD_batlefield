import { type FC, memo, useState, useEffect, useMemo, useRef } from 'react'
import { Circle, Group, Ring } from 'react-konva'
import type { BaseSpellProps, AreaVariant } from '../types'
import { getAreaConfig } from '../variants'
import { getSpellVariant } from '../types'

interface IceBurst {
  x: number
  y: number
  startTime: number
  size: number
}

export const AbstractArea: FC<BaseSpellProps> = memo(({
  spell,
  isAnimating,
  onAnimationComplete
}) => {
  const [progress, setProgress] = useState(0)
  const [iceBursts, setIceBursts] = useState<IceBurst[]>([])
  const startTimeRef = useRef<number>(0)
  const lastIceSpawnRef = useRef<number>(-800) // Initialize to -800 so first burst spawns immediately
  const animationStartedRef = useRef<boolean>(false)

  const variant = useMemo(() => getSpellVariant(spell) as AreaVariant, [spell])
  const config = useMemo(() => getAreaConfig(variant), [variant])

  // Check if this is Ice Storm spell
  const isIceStorm = spell.spellName?.toLowerCase() === 'ice storm'

  useEffect(() => {
    if (!isAnimating) {
      // Reset on animation stop
      animationStartedRef.current = false
      setIceBursts([])
      lastIceSpawnRef.current = -800
      return
    }

    // For persistent spells, use a short fade-in (200ms) instead of spell.duration
    // EXCEPT for Ice Storm which needs its full duration for multi-burst animation
    const isPersistent = spell.persistDuration && spell.persistDuration > 0
    const duration = isIceStorm ? (spell.duration || 4100) : (isPersistent ? 200 : (spell.duration || 500))

    // Only set startTime once when animation first starts
    if (!animationStartedRef.current) {
      startTimeRef.current = Date.now()
      animationStartedRef.current = true
    }

    let animationFrameId: number

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current
      const newProgress = Math.min(elapsed / duration, 1)

      setProgress(newProgress)

      // Handle Ice Storm multi-burst spawning
      if (isIceStorm) {
        const spawnInterval = 800 // Spawn a new ice impact every 800ms (5 bursts over 4 seconds)
        if (elapsed - lastIceSpawnRef.current > spawnInterval && iceBursts.length < 5) {
          lastIceSpawnRef.current = elapsed

          // Generate random position within the spell area
          const areaRadius = spell.size || 200
          const angle = Math.random() * Math.PI * 2
          const distance = Math.sqrt(Math.random()) * areaRadius // sqrt for uniform distribution
          const newIce: IceBurst = {
            x: spell.toPosition.x + Math.cos(angle) * distance,
            y: spell.toPosition.y + Math.sin(angle) * distance,
            startTime: elapsed,
            size: 25 // 1 grid cell = 50px diameter, so radius = 25px
          }

          setIceBursts(prev => [...prev, newIce])
        }
      }

      if (newProgress < 1) {
        animationFrameId = requestAnimationFrame(animate)
      } else {
        onAnimationComplete?.()
      }
    }

    animationFrameId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
    // NOTE: iceBursts.length is intentionally NOT in dependencies to prevent startTimeRef reset
  }, [isAnimating, spell.duration, spell.persistDuration, isIceStorm, spell.size, spell.toPosition.x, spell.toPosition.y, onAnimationComplete])

  const effectRadius = spell.size || 40
  const areaOpacity = progress * 0.6

  // Ice Storm special rendering with multiple bursts
  if (isIceStorm) {
    const elapsed = Date.now() - startTimeRef.current

    return (
      <>
        {/* Area indicator - subtle circle showing the affected zone */}
        <Circle
          x={spell.toPosition.x}
          y={spell.toPosition.y}
          radius={effectRadius}
          stroke="#87CEEB"
          strokeWidth={2}
          opacity={0.3}
          fill="#87CEEB"
          fillOpacity={0.1}
        />

        {/* Render each ice burst */}
        {iceBursts.map((ice, index) => {
          const iceAge = elapsed - ice.startTime
          const iceDuration = 500 // Each ice impact lasts 500ms
          const iceProgress = Math.min(Math.max(iceAge / iceDuration, 0), 1)

          if (iceProgress >= 1 || iceAge < 0) return null // Ice animation complete or not started

          // Expanding burst for each ice impact
          const burstRadius = Math.max(1, ice.size * (1 + iceProgress * 2))
          const burstOpacity = (1 - iceProgress) * 0.8

          return (
            <Group key={index}>
              {/* Impact burst */}
              <Circle
                x={ice.x}
                y={ice.y}
                radius={burstRadius}
                fill="#87CEEB"
                opacity={burstOpacity * 0.4}
              />

              {/* Inner impact ring */}
              <Ring
                x={ice.x}
                y={ice.y}
                innerRadius={Math.max(0, burstRadius * 0.5)}
                outerRadius={Math.max(burstRadius * 0.5 + 1, burstRadius)}
                fill="#ADD8E6"
                opacity={burstOpacity * 0.6}
              />

              {/* Central ice impact */}
              <Circle
                x={ice.x}
                y={ice.y}
                radius={Math.max(1, ice.size * 0.5)}
                fill="#F0F8FF"
                opacity={burstOpacity}
              />

              {/* Ice shard particles */}
              {[0, 1, 2, 3].map(i => {
                const angle = (i * Math.PI) / 2
                const particleDistance = burstRadius * 1.2
                return (
                  <Circle
                    key={i}
                    x={ice.x + Math.cos(angle) * particleDistance}
                    y={ice.y + Math.sin(angle) * particleDistance}
                    radius={3}
                    fill="#E0F4FF"
                    opacity={burstOpacity * 0.5}
                  />
                )
              })}
            </Group>
          )
        })}
      </>
    )
  }

  // Standard area spell rendering
  return (
    <>
      {/* Outer fade effect */}
      <Circle
        x={spell.toPosition.x}
        y={spell.toPosition.y}
        radius={effectRadius * (1 + progress * 0.2)}
        fill={spell.color}
        opacity={areaOpacity * 0.3}
      />

      {/* Main area circle */}
      <Circle
        x={spell.toPosition.x}
        y={spell.toPosition.y}
        radius={effectRadius}
        fill={spell.color}
        opacity={areaOpacity}
        stroke={spell.color}
        strokeWidth={2}
      />

      {/* Inner core for darkness variant */}
      {variant === 'darkness' && (
        <Circle
          x={spell.toPosition.x}
          y={spell.toPosition.y}
          radius={effectRadius * 0.7}
          fill={config.coreColor}
          opacity={areaOpacity * 0.5}
        />
      )}
    </>
  )
}, (prevProps, nextProps) => {
  return (
    prevProps.spell.id === nextProps.spell.id &&
    prevProps.isAnimating === nextProps.isAnimating
  )
})

AbstractArea.displayName = 'AbstractArea'
