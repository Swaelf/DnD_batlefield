import { type FC, useEffect, useRef, useState } from 'react'
import { Group, Circle, Ring, RegularPolygon, Line } from 'react-konva'
import type { SpellEventData } from '@/types/timeline'
import type { Position } from '@/types/map'
import useMapStore from '@/store/mapStore'

interface SimpleSpellComponentProps {
  spell: SpellEventData
  isAnimating: boolean
  onAnimationComplete?: () => void
}

interface TrailPosition {
  x: number
  y: number
  progress: number
}

interface StoneBurst {
  x: number
  y: number
  startTime: number
  size: number
}

/**
 * Simplified spell component that uses React state for animation
 */
export const SimpleSpellComponent: FC<SimpleSpellComponentProps> = ({
  spell,
  isAnimating,
  onAnimationComplete
}) => {
  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [trailPositions, setTrailPositions] = useState<TrailPosition[]>([])
  const [stoneBursts, setStoneBursts] = useState<StoneBurst[]>([])
  const animationFrameRef = useRef<number>(0)
  const startTimeRef = useRef<number>(Date.now())
  // const _lastTrailUpdateRef = useRef<number>(0) // unused
  const lastStoneSpawnRef = useRef<number>(0)
  const currentMap = useMapStore(state => state.currentMap)

  // Get current target position if tracking is enabled
  const getTargetPosition = (): Position => {
    if (spell.trackTarget && spell.targetTokenId && currentMap) {
      const targetToken = currentMap.objects.find(obj =>
        obj.id === spell.targetTokenId && obj.type === 'token'
      )
      if (targetToken) {
        return targetToken.position
      }
    }
    return spell.toPosition
  }

  useEffect(() => {
    if (!isAnimating || isComplete) return


    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current
      const duration = spell.duration || 1000
      const currentProgress = Math.min(elapsed / duration, 1)

      setProgress(currentProgress)

      // Handle Stone Rain multi-burst spawning
      if (spell.spellName?.toLowerCase() === 'stone rain') {
        const spawnInterval = 150 // Spawn a new stone every 150ms
        if (elapsed - lastStoneSpawnRef.current > spawnInterval && stoneBursts.length < 12) {
          lastStoneSpawnRef.current = elapsed

          // Generate random position within the spell area
          const areaRadius = spell.size || 100
          const angle = Math.random() * Math.PI * 2
          const distance = Math.random() * areaRadius
          const newStone: StoneBurst = {
            x: getTargetPosition().x + Math.cos(angle) * distance,
            y: getTargetPosition().y + Math.sin(angle) * distance,
            startTime: elapsed,
            size: 15 + Math.random() * 10 // Vary stone sizes slightly
          }

          setStoneBursts(prev => [...prev, newStone])
        }
      }

      // Update trail for regular projectiles only (not projectile-burst which generates its own)
      if (spell.category === 'projectile') {
        const dx = getTargetPosition().x - spell.fromPosition.x
        const dy = getTargetPosition().y - spell.fromPosition.y

        // Generate trail positions
        const trailCount = 12
        const newTrailPositions: TrailPosition[] = []

        for (let i = 0; i < trailCount; i++) {
          // Calculate progress for this trail segment (going backwards from current position)
          const trailProgress = Math.max(0, currentProgress - (i * 0.02)) // 0.02 = spacing between trail segments

          if (trailProgress === 0 && currentProgress > 0.1) continue // Don't show trail at start position once we've moved

          let x, y
          if (spell.spellName?.toLowerCase().includes('magic missile')) {
            // Enhanced curve for magic missile with much better randomization
            const baseHeight = spell.curveHeight || 50

            // Create multiple random seeds from spell ID for more variation
            const spellId = spell.id || 'default'
            const seed1 = spellId.charCodeAt(0) % 100 / 100
            const seed2 = spellId.charCodeAt(Math.min(1, spellId.length - 1)) % 100 / 100
            const seed3 = spellId.charCodeAt(Math.min(2, spellId.length - 1)) % 100 / 100

            // Create highly varied curve parameters
            const heightVariation = (seed1 - 0.5) * 80 // ±40 pixel variation
            const curveHeight = Math.max(20, baseHeight + heightVariation)

            // Determine curve direction with enhanced randomization
            let directionMultiplier = 1
            const directionSeed = seed2

            if (directionSeed < 0.33) {
              directionMultiplier = 1 // Curve up/right
            } else if (directionSeed < 0.66) {
              directionMultiplier = -1 // Curve down/left
            } else {
              // Mirror across the source-target line (alternating sides)
              const mirrorSeed = seed3
              directionMultiplier = mirrorSeed < 0.5 ? 1 : -1
            }

            // Enhanced curve shape with asymmetry
            const asymmetryFactor = (seed3 - 0.5) * 0.5 // Shift peak of curve
            const adjustedProgress = Math.max(0, Math.min(1, trailProgress + asymmetryFactor))
            const curveFactor = Math.sin(adjustedProgress * Math.PI) * curveHeight * directionMultiplier

            const baseX = spell.fromPosition.x + dx * trailProgress
            const baseY = spell.fromPosition.y + dy * trailProgress

            // Perpendicular to the line direction with safety check
            const length = Math.sqrt(dx * dx + dy * dy)
            const perpX = length > 0 ? -dy / length : 0
            const perpY = length > 0 ? dx / length : 0

            x = baseX + perpX * curveFactor
            y = baseY + perpY * curveFactor
          } else {
            x = spell.fromPosition.x + dx * trailProgress
            y = spell.fromPosition.y + dy * trailProgress
          }

          newTrailPositions.unshift({ x, y, progress: 1 - (i / trailCount) }) // unshift to reverse order
        }

        setTrailPositions(newTrailPositions)
      }

      if (currentProgress >= 1) {
        setIsComplete(true)
        onAnimationComplete?.()
      } else {
        // Only continue animation if page is visible for performance
        if (!document.hidden) {
          animationFrameRef.current = requestAnimationFrame(animate)
        }
      }
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isAnimating, isComplete, spell, onAnimationComplete])

  // Reset when animation should restart
  useEffect(() => {
    if (!isAnimating) {
      setProgress(0)
      setIsComplete(false)
      setTrailPositions([])
      setStoneBursts([])
      startTimeRef.current = Date.now()
      lastStoneSpawnRef.current = 0
    }
  }, [isAnimating])

  // Render based on spell category
  const renderSpell = () => {
    const baseRadius = spell.size || 20
    const opacity = 1 - progress * 0.5

    switch (spell.category) {
      case 'projectile':
        // Calculate current position
        const dx = getTargetPosition().x - spell.fromPosition.x
        const dy = getTargetPosition().y - spell.fromPosition.y

        let x, y
        if (spell.spellName?.toLowerCase().includes('magic missile')) {
          // Enhanced curved path for magic missile with much better randomization
          const baseHeight = spell.curveHeight || 50

          // Create multiple random seeds from spell ID for more variation (same as trail)
          const spellId = spell.id || 'default'
          const seed1 = spellId.charCodeAt(0) % 100 / 100
          const seed2 = spellId.charCodeAt(Math.min(1, spellId.length - 1)) % 100 / 100
          const seed3 = spellId.charCodeAt(Math.min(2, spellId.length - 1)) % 100 / 100

          // Create highly varied curve parameters
          const heightVariation = (seed1 - 0.5) * 80 // ±40 pixel variation
          const curveHeight = Math.max(20, baseHeight + heightVariation)

          // Determine curve direction with enhanced randomization
          let directionMultiplier = 1
          const directionSeed = seed2

          if (directionSeed < 0.33) {
            directionMultiplier = 1 // Curve up/right
          } else if (directionSeed < 0.66) {
            directionMultiplier = -1 // Curve down/left
          } else {
            // Mirror across the source-target line (alternating sides)
            const mirrorSeed = seed3
            directionMultiplier = mirrorSeed < 0.5 ? 1 : -1
          }

          // Enhanced curve shape with asymmetry
          const asymmetryFactor = (seed3 - 0.5) * 0.5 // Shift peak of curve
          const adjustedProgress = Math.max(0, Math.min(1, progress + asymmetryFactor))
          const curveFactor = Math.sin(adjustedProgress * Math.PI) * curveHeight * directionMultiplier

          const baseX = spell.fromPosition.x + dx * progress
          const baseY = spell.fromPosition.y + dy * progress

          // Perpendicular to the line direction with safety check
          const length = Math.sqrt(dx * dx + dy * dy)
          const perpX = length > 0 ? -dy / length : 0
          const perpY = length > 0 ? dx / length : 0

          x = baseX + perpX * curveFactor
          y = baseY + perpY * curveFactor
        } else {
          x = spell.fromPosition.x + dx * progress
          y = spell.fromPosition.y + dy * progress
        }

        // Calculate angle for arrow
        const angle = Math.atan2(dy, dx)

        // Determine projectile style based on spell
        const isFireball = spell.spellName?.toLowerCase().includes('fireball')

        return (
          <>
            {/* Trail effect - enhanced for different spells */}
            {trailPositions.map((pos, index) => {
              const trailRatio = pos.progress // Use the progress stored in the position
              const trailSize = baseRadius * (0.2 + trailRatio * 0.8)

              if (isFireball) {
                // Fire trail with particles
                return (
                  <Group key={index}>
                    <Circle
                      x={pos.x}
                      y={pos.y}
                      radius={trailSize * 1.2}
                      fill="#FF6B35"
                      opacity={trailRatio * 0.3}
                    />
                    <Circle
                      x={pos.x}
                      y={pos.y}
                      radius={trailSize}
                      fill={spell.color}
                      opacity={trailRatio * 0.5}
                    />
                  </Group>
                )
              } else {
                // Standard trail
                return (
                  <Circle
                    key={index}
                    x={pos.x}
                    y={pos.y}
                    radius={trailSize}
                    fill={spell.color}
                    opacity={trailRatio * 0.6}
                  />
                )
              }
            })}

            {/* Glow effect */}
            <Circle
              x={x}
              y={y}
              radius={baseRadius * 1.5}
              fill={spell.color}
              opacity={0.3}
            />

            {/* Main projectile body - all projectiles use circle */}
            <Circle
              x={x}
              y={y}
              radius={baseRadius}
              fill={spell.color}
              opacity={opacity}
              shadowColor={spell.color}
              shadowBlur={baseRadius * 2}
              shadowOpacity={0.6}
            />
            {/* Inner core */}
            <Circle
              x={x}
              y={y}
              radius={baseRadius * 0.5}
              fill="#FFFFFF"
              opacity={opacity * 0.8}
            />

            {/* Directional energy effect */}
            <RegularPolygon
              x={x - Math.cos(angle) * baseRadius * 0.8}
              y={y - Math.sin(angle) * baseRadius * 0.8}
              sides={3}
              radius={baseRadius * 0.7}
              fill={spell.color}
              opacity={opacity * 0.4}
              rotation={angle * 180 / Math.PI - 90}
            />

            {/* Front-facing point */}
            <Circle
              x={x + Math.cos(angle) * baseRadius}
              y={y + Math.sin(angle) * baseRadius}
              radius={baseRadius * 0.3}
              fill="#FFFFFF"
              opacity={opacity * 0.9}
            />
          </>
        )

      case 'projectile-burst':
        // Two-phase animation: projectile then burst
        const projectilePhase = 0.7 // 70% of time for projectile

        if (progress < projectilePhase) {
          // Phase 1: Projectile travel
          const projectileProgress = progress / projectilePhase
          const pdx = getTargetPosition().x - spell.fromPosition.x
          const pdy = getTargetPosition().y - spell.fromPosition.y

          let px, py
          if (spell.spellName?.toLowerCase().includes('fireball')) {
            // Straight path for fireball
            px = spell.fromPosition.x + pdx * projectileProgress
            py = spell.fromPosition.y + pdy * projectileProgress
          } else {
            px = spell.fromPosition.x + pdx * projectileProgress
            py = spell.fromPosition.y + pdy * projectileProgress
          }

          const pAngle = Math.atan2(pdy, pdx)

          const isFireball = spell.spellName?.toLowerCase().includes('fireball')

          // Generate proper trail for projectile-burst phase
          const burstTrailPositions: TrailPosition[] = []
          const trailCount = 15

          for (let i = 0; i < trailCount; i++) {
            // Calculate progress for this trail segment (going backwards from current position)
            const trailProgress = Math.max(0, projectileProgress - (i * 0.025)) // Slightly larger spacing for fireball

            if (trailProgress === 0 && projectileProgress > 0.1) continue

            const tx = spell.fromPosition.x + pdx * trailProgress
            const ty = spell.fromPosition.y + pdy * trailProgress

            burstTrailPositions.unshift({ x: tx, y: ty, progress: 1 - (i / trailCount) })
          }

          return (
            <>
              {/* Enhanced trail for fireballs */}
              {burstTrailPositions.map((pos, index) => {
                const trailRatio = pos.progress // Use the progress stored in the position
                const trailSize = baseRadius * (0.3 + trailRatio * 0.7)

                if (isFireball) {
                  return (
                    <Group key={index}>
                      <Circle
                        x={pos.x}
                        y={pos.y}
                        radius={trailSize * 1.3}
                        fill="#FF8C00"
                        opacity={trailRatio * 0.4}
                      />
                      <Circle
                        x={pos.x}
                        y={pos.y}
                        radius={trailSize}
                        fill={spell.color}
                        opacity={trailRatio * 0.6}
                      />
                      {/* Small fire particles */}
                      {trailRatio > 0.5 && (
                        <Circle
                          x={pos.x + (Math.random() - 0.5) * 10}
                          y={pos.y + (Math.random() - 0.5) * 10}
                          radius={trailSize * 0.3}
                          fill="#FFD700"
                          opacity={trailRatio * 0.3}
                        />
                      )}
                    </Group>
                  )
                } else {
                  return (
                    <Circle
                      key={index}
                      x={pos.x}
                      y={pos.y}
                      radius={trailSize}
                      fill={spell.color}
                      opacity={trailRatio * 0.5}
                    />
                  )
                }
              })}

              {/* Outer glow */}
              <Circle
                x={px}
                y={py}
                radius={baseRadius * 1.8}
                fill={spell.color}
                opacity={0.25}
              />

              {/* Main projectile - enhanced for fireball */}
              <Circle
                x={px}
                y={py}
                radius={baseRadius}
                fill={spell.color}
                opacity={opacity}
                shadowColor={spell.color}
                shadowBlur={baseRadius * 2.5}
                shadowOpacity={0.7}
              />

              {/* Inner hot core */}
              <Circle
                x={px}
                y={py}
                radius={baseRadius * 0.6}
                fill={isFireball ? "#FFD700" : "#FFFFFF"}
                opacity={opacity * 0.9}
              />

              {/* Energy trail direction */}
              <RegularPolygon
                x={px - Math.cos(pAngle) * baseRadius}
                y={py - Math.sin(pAngle) * baseRadius}
                sides={3}
                radius={baseRadius * 0.8}
                fill={spell.color}
                opacity={opacity * 0.5}
                rotation={pAngle * 180 / Math.PI - 90}
              />

              {/* Leading edge highlight */}
              <Circle
                x={px + Math.cos(pAngle) * baseRadius * 0.8}
                y={py + Math.sin(pAngle) * baseRadius * 0.8}
                radius={baseRadius * 0.4}
                fill="#FFFFFF"
                opacity={opacity}
              />
            </>
          )
        } else {
          // Phase 2: Burst explosion
          const burstProgress = (progress - projectilePhase) / (1 - projectilePhase)
          const maxBurstRadius = spell.burstRadius || baseRadius * 2
          const burstRadius = maxBurstRadius * (0.3 + burstProgress * 0.7) // Expand from 30% to 100%
          const burstOpacity = (1 - burstProgress) * 0.8

          return (
            <>
              {/* Explosion core */}
              <Circle
                x={getTargetPosition().x}
                y={getTargetPosition().y}
                radius={burstRadius}
                fill={spell.color}
                opacity={burstOpacity * 0.3}
              />

              {/* Explosion rings */}
              <Ring
                x={getTargetPosition().x}
                y={getTargetPosition().y}
                innerRadius={burstRadius * 0.5}
                outerRadius={burstRadius}
                fill={spell.color}
                opacity={burstOpacity * 0.5}
              />

              <Ring
                x={getTargetPosition().x}
                y={getTargetPosition().y}
                innerRadius={burstRadius * 0.8}
                outerRadius={burstRadius * 1.2}
                fill={spell.secondaryColor || spell.color}
                opacity={burstOpacity * 0.3}
              />
            </>
          )
        }

      case 'burst':
        // Expanding burst - use burstRadius (from event data) if available, otherwise use size
        const maxBurstRadius = spell.burstRadius || spell.size || baseRadius
        const burstRadius = maxBurstRadius * (0.3 + progress * 0.7) // Start at 30%, expand to 100%
        const burstOpacityValue = spell.opacity !== undefined ? spell.opacity : opacity

        // Debug logging
        if (progress === 0) {
          console.log('[SimpleSpellComponent] Burst spell:', {
            spellName: spell.spellName,
            burstRadius: spell.burstRadius,
            size: spell.size,
            baseRadius,
            maxBurstRadius,
            finalBurstRadius: maxBurstRadius
          })
        }

        return (
          <>
            <Circle
              x={getTargetPosition().x}
              y={getTargetPosition().y}
              radius={burstRadius}
              fill={spell.color}
              opacity={burstOpacityValue * 0.3}
            />
            <Ring
              x={getTargetPosition().x}
              y={getTargetPosition().y}
              innerRadius={burstRadius * 0.7}
              outerRadius={burstRadius}
              fill={spell.color}
              opacity={burstOpacityValue}
            />
          </>
        )

      case 'area':
        // Fade-in area effect that transitions to persistent
        const areaOpacity = progress * 0.6
        const isDarkness = spell.spellName?.toLowerCase().includes('darkness')
        const effectRadius = spell.size || baseRadius * 2

        return (
          <>
            {/* Outer fade effect */}
            <Circle
              x={getTargetPosition().x}
              y={getTargetPosition().y}
              radius={effectRadius * (1 + progress * 0.2)}
              fill={spell.color}
              opacity={areaOpacity * 0.3}
            />

            {/* Main area circle */}
            <Circle
              x={getTargetPosition().x}
              y={getTargetPosition().y}
              radius={effectRadius}
              fill={spell.color}
              opacity={areaOpacity}
              stroke={spell.color}
              strokeWidth={2}
            />

            {/* Inner darker core for darkness spell */}
            {isDarkness && (
              <Circle
                x={getTargetPosition().x}
                y={getTargetPosition().y}
                radius={effectRadius * 0.7}
                fill="#000000"
                opacity={areaOpacity * 0.5}
              />
            )}
          </>
        )

      case 'ray':
        // Ray/beam effect with proper visualization
        const rayProgress = Math.min(progress * 2, 1) // Faster initial appearance
        const rayOpacity = 1 - (progress * 0.3) // Slight fade over time

        // Calculate the beam width based on distance
        const rayDx = getTargetPosition().x - spell.fromPosition.x
        const rayDy = getTargetPosition().y - spell.fromPosition.y
        // const _rayDistance = Math.sqrt(rayDx * rayDx + rayDy * rayDy) // unused

        // Create points for the beam (tapered from source to target)
        const rayAngle = Math.atan2(rayDy, rayDx)
        const perpAngle = rayAngle + Math.PI / 2

        // Beam width at source and target
        const sourceWidth = baseRadius * 0.3
        const targetWidth = baseRadius * 1.5

        // Calculate perpendicular offsets for beam shape
        const sourceOffset1 = {
          x: spell.fromPosition.x + Math.cos(perpAngle) * sourceWidth,
          y: spell.fromPosition.y + Math.sin(perpAngle) * sourceWidth
        }
        const sourceOffset2 = {
          x: spell.fromPosition.x - Math.cos(perpAngle) * sourceWidth,
          y: spell.fromPosition.y - Math.sin(perpAngle) * sourceWidth
        }
        const targetOffset1 = {
          x: getTargetPosition().x + Math.cos(perpAngle) * targetWidth,
          y: getTargetPosition().y + Math.sin(perpAngle) * targetWidth
        }
        const targetOffset2 = {
          x: getTargetPosition().x - Math.cos(perpAngle) * targetWidth,
          y: getTargetPosition().y - Math.sin(perpAngle) * targetWidth
        }

        // Create the beam polygon points
        const beamPoints = [
          sourceOffset1.x, sourceOffset1.y,
          targetOffset1.x, targetOffset1.y,
          targetOffset2.x, targetOffset2.y,
          sourceOffset2.x, sourceOffset2.y
        ]

        return (
          <>
            {/* Main beam with gradient effect */}
            <Line
              points={beamPoints}
              closed={true}
              fill={spell.color}
              opacity={rayOpacity * 0.6 * rayProgress}
              shadowColor={spell.color}
              shadowBlur={20}
              shadowOpacity={0.8}
            />

            {/* Bright center line */}
            <Line
              points={[
                spell.fromPosition.x,
                spell.fromPosition.y,
                spell.fromPosition.x + rayDx * rayProgress,
                spell.fromPosition.y + rayDy * rayProgress
              ]}
              stroke={spell.color}
              strokeWidth={baseRadius * 0.5}
              opacity={rayOpacity * rayProgress}
              shadowColor={spell.color}
              shadowBlur={baseRadius * 2}
              shadowOpacity={0.9}
              lineCap="round"
            />

            {/* Inner bright core */}
            <Line
              points={[
                spell.fromPosition.x,
                spell.fromPosition.y,
                spell.fromPosition.x + rayDx * rayProgress,
                spell.fromPosition.y + rayDy * rayProgress
              ]}
              stroke="#FFFFFF"
              strokeWidth={baseRadius * 0.2}
              opacity={rayOpacity * 0.9 * rayProgress}
              lineCap="round"
            />

            {/* Origin flash */}
            <Circle
              x={spell.fromPosition.x}
              y={spell.fromPosition.y}
              radius={sourceWidth * 2}
              fill={spell.color}
              opacity={rayOpacity * 0.8 * rayProgress}
            />

            {/* Impact point */}
            <Circle
              x={getTargetPosition().x}
              y={getTargetPosition().y}
              radius={targetWidth * 1.5 * rayProgress}
              fill={spell.color}
              opacity={rayOpacity * 0.4 * rayProgress}
            />

            {/* Impact core */}
            <Circle
              x={getTargetPosition().x}
              y={getTargetPosition().y}
              radius={targetWidth * rayProgress}
              fill="#FFFFFF"
              opacity={rayOpacity * 0.7 * rayProgress}
            />
          </>
        )

      case 'cone':
        // Cone spell effect - circular sector (pie slice) centered at source
        if (progress === 0) {
          console.log('[Cone Spell]', {
            spellName: spell.spellName,
            category: spell.category,
            size: spell.size,
            coneAngle: spell.coneAngle,
            fromPosition: spell.fromPosition,
            toPosition: spell.toPosition
          })
        }
        // Size is already in pixels from the spell data - use it directly
        const coneLength = spell.size || 100
        const coneAngle = (spell.coneAngle || 60) * (Math.PI / 180)
        const expansionProgress = Math.min(progress * 1.5, 1) // Faster expansion

        // Calculate cone direction from source to target
        const coneDx = getTargetPosition().x - spell.fromPosition.x
        const coneDy = getTargetPosition().y - spell.fromPosition.y
        const coneDirection = Math.atan2(coneDy, coneDx)

        // Calculate cone sector angles (source is center, range is radius)
        const leftAngle = coneDirection - coneAngle / 2

        // Current radius based on expansion
        const currentRadius = coneLength * expansionProgress

        // Opacity fades at the end of animation
        const coneOpacity = progress < 0.85 ? 0.65 : (1 - progress) * 4.3

        // Build circular sector points (pie slice)
        const arcSegments = 30
        const sectorPoints: number[] = [
          spell.fromPosition.x, // Start at source (sector center)
          spell.fromPosition.y
        ]

        // Add arc points from left to right angle
        for (let i = 0; i <= arcSegments; i++) {
          const angle = leftAngle + (coneAngle * i / arcSegments)
          sectorPoints.push(
            spell.fromPosition.x + Math.cos(angle) * currentRadius,
            spell.fromPosition.y + Math.sin(angle) * currentRadius
          )
        }

        // Close the sector back to center
        sectorPoints.push(spell.fromPosition.x, spell.fromPosition.y)

        return (
          <>
            {/* Main filled sector (pie slice) */}
            <Line
              points={sectorPoints}
              closed={true}
              fill={spell.color}
              opacity={coneOpacity * 0.5}
              shadowColor={spell.color}
              shadowBlur={20}
              shadowOpacity={0.6}
            />

            {/* Sector border for definition */}
            <Line
              points={sectorPoints}
              closed={true}
              stroke={spell.secondaryColor || spell.color}
              strokeWidth={2}
              opacity={coneOpacity * 0.8}
              shadowColor={spell.secondaryColor || spell.color}
              shadowBlur={10}
            />

            {/* Expanding wave effect at the arc edge */}
            {[0, 0.15, 0.3].map((waveOffset, index) => {
              const waveProgress = expansionProgress - waveOffset
              if (waveProgress <= 0 || waveProgress > 1) return null

              const waveRadius = coneLength * waveProgress
              const waveOpacity = (1 - waveOffset / 0.3) * coneOpacity

              // Arc points for wave
              const wavePoints: number[] = []
              for (let i = 0; i <= arcSegments; i++) {
                const angle = leftAngle + (coneAngle * i / arcSegments)
                wavePoints.push(
                  spell.fromPosition.x + Math.cos(angle) * waveRadius,
                  spell.fromPosition.y + Math.sin(angle) * waveRadius
                )
              }

              return (
                <Line
                  key={index}
                  points={wavePoints}
                  stroke={index === 0 ? '#FFD700' : spell.secondaryColor || spell.color}
                  strokeWidth={4}
                  opacity={waveOpacity * 0.8}
                  lineCap="round"
                  shadowColor={spell.color}
                  shadowBlur={15}
                />
              )
            })}

            {/* Particle effects within the cone */}
            {spell.particleEffect && (
              <>
                {[...Array(25)].map((_, i) => {
                  // Random position within the cone sector
                  const angleVariation = (Math.random() - 0.5) * coneAngle
                  const particleAngle = coneDirection + angleVariation
                  const baseDistance = Math.random()
                  const particleDistance = currentRadius * baseDistance

                  const particleX = spell.fromPosition.x + Math.cos(particleAngle) * particleDistance
                  const particleY = spell.fromPosition.y + Math.sin(particleAngle) * particleDistance

                  // Particles flicker based on distance and time
                  const flickerOffset = (i * 0.1) % 1
                  const flickerValue = Math.sin((progress + flickerOffset) * Math.PI * 4) * 0.3 + 0.7
                  const distanceFade = 1 - (baseDistance * 0.3)
                  const particleOpacity = Math.max(0, (1 - progress) * distanceFade * flickerValue * coneOpacity)

                  // Varied particle colors based on spell
                  const particleColor = i % 4 === 0
                    ? '#FFFF00'  // Bright yellow
                    : i % 4 === 1
                    ? spell.secondaryColor || '#FFD700'  // Secondary or gold
                    : i % 4 === 2
                    ? spell.color  // Primary spell color
                    : '#FFFFFF'  // White

                  const particleSize = (2 + Math.random() * 4) * (1 - baseDistance * 0.2)

                  return (
                    <Circle
                      key={i}
                      x={particleX}
                      y={particleY}
                      radius={particleSize}
                      fill={particleColor}
                      opacity={particleOpacity}
                      shadowColor={particleColor}
                      shadowBlur={6}
                      shadowOpacity={0.7}
                    />
                  )
                })}
              </>
            )}
          </>
        )

      default:
        // Check for Stone Rain spell
        if (spell.spellName?.toLowerCase() === 'stone rain') {
          const areaRadius = spell.size || 100
          const elapsed = Date.now() - startTimeRef.current

          return (
            <>
              {/* Area indicator - subtle circle showing the affected zone */}
              <Circle
                x={getTargetPosition().x}
                y={getTargetPosition().y}
                radius={areaRadius}
                stroke="#8B7355"
                strokeWidth={2}
                opacity={0.3}
                fill="#8B7355"
                fillOpacity={0.1}
              />

              {/* Render each stone burst */}
              {stoneBursts.map((stone, index) => {
                const stoneAge = elapsed - stone.startTime
                const stoneDuration = 500 // Each stone impact lasts 500ms
                const stoneProgress = Math.min(stoneAge / stoneDuration, 1)

                if (stoneProgress >= 1) return null // Stone animation complete

                // Expanding burst for each stone
                const burstRadius = stone.size * (1 + stoneProgress * 2)
                const burstOpacity = (1 - stoneProgress) * 0.8

                return (
                  <Group key={index}>
                    {/* Impact burst */}
                    <Circle
                      x={stone.x}
                      y={stone.y}
                      radius={burstRadius}
                      fill="#8B7355"
                      opacity={burstOpacity * 0.4}
                    />

                    {/* Inner impact ring */}
                    <Ring
                      x={stone.x}
                      y={stone.y}
                      innerRadius={burstRadius * 0.5}
                      outerRadius={burstRadius}
                      fill="#696969"
                      opacity={burstOpacity * 0.6}
                    />

                    {/* Central stone impact */}
                    <Circle
                      x={stone.x}
                      y={stone.y}
                      radius={stone.size * 0.5}
                      fill="#4B4B4B"
                      opacity={burstOpacity}
                    />

                    {/* Debris particles */}
                    {[0, 1, 2, 3].map(i => {
                      const angle = (i * Math.PI) / 2
                      const particleDistance = burstRadius * 1.2
                      return (
                        <Circle
                          key={i}
                          x={stone.x + Math.cos(angle) * particleDistance}
                          y={stone.y + Math.sin(angle) * particleDistance}
                          radius={3}
                          fill="#8B7355"
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
        return null
    }
  }

  if (!isAnimating || isComplete) {
    return null
  }

  return (
    <Group listening={false}>
      {renderSpell()}
    </Group>
  )
}