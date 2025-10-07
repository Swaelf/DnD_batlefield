import { memo, useRef, useEffect, useState } from 'react'
import Konva from 'konva'
import { Group, Circle } from 'react-konva'
import type { AttackEventData } from '@/types'
import { ATTACK_VISUALS, CRITICAL_HIT } from '@/constants'
import { createLinearMotion } from '@/lib/animation-effects/motion'
import type { MotionPathGenerator } from '@/lib/animation-effects/motion/LinearMotion'

type AttackRendererProps = {
  attack: AttackEventData
  isAnimating: boolean
  onAnimationComplete?: () => void
}

const AttackRendererComponent = ({
  attack,
  isAnimating,
  onAnimationComplete
}: AttackRendererProps) => {
  const groupRef = useRef<Konva.Group>(null)
  const animationRef = useRef<Konva.Animation | null>(null)
  const hasStartedRef = useRef(false)
  const [showImpactEffect, setShowImpactEffect] = useState(false)

  // Ranged attack animation state
  const [rangedProgress, setRangedProgress] = useState(0)
  const [rangedIsComplete, setRangedIsComplete] = useState(false)
  const [trailPositions, setTrailPositions] = useState<Array<{x: number, y: number, progress: number}>>([])
  const rangedAnimationFrameRef = useRef<number>(0)
  const rangedStartTimeRef = useRef<number>(Date.now())
  const motionGeneratorRef = useRef<MotionPathGenerator | null>(null)

  useEffect(() => {
    if (!isAnimating || attack.attackType === 'ranged') return
    if (!groupRef.current || hasStartedRef.current) return

    hasStartedRef.current = true
    const group = groupRef.current

    // Reset animation state
    group.visible(true)

    // Create melee animation
    animateMeleeAttack(group)

    // Cleanup function
    return () => {
      if (animationRef.current) {
        animationRef.current.stop()
        animationRef.current = null
      }
      hasStartedRef.current = false
    }
  }, [isAnimating, attack])

  // Reset impact effect when animation restarts
  useEffect(() => {
    if (isAnimating) {
      setShowImpactEffect(false)
    }
  }, [isAnimating])

  // Initialize motion generator for ranged attacks
  useEffect(() => {
    if (attack.attackType !== 'ranged' || !isAnimating) return

    motionGeneratorRef.current = createLinearMotion(attack.fromPosition, attack.toPosition)
    rangedStartTimeRef.current = Date.now()
    setRangedProgress(0)
    setRangedIsComplete(false)
    setTrailPositions([])
  }, [attack.fromPosition, attack.toPosition, attack.attackType, isAnimating])

  // Ranged attack animation loop
  useEffect(() => {
    if (attack.attackType !== 'ranged' || !isAnimating || rangedIsComplete) return

    const motionGenerator = motionGeneratorRef.current
    if (!motionGenerator) return

    const animate = () => {
      const elapsed = Date.now() - rangedStartTimeRef.current
      const duration = attack.duration || 800
      const currentProgress = Math.min(elapsed / duration, 1)

      setRangedProgress(currentProgress)

      // Update trail positions
      const trailCount = 8
      const newTrailPositions: Array<{x: number, y: number, progress: number}> = []

      for (let i = 0; i < trailCount; i++) {
        const trailProgress = Math.max(0, currentProgress - (i * 0.03))
        if (trailProgress === 0 && currentProgress > 0.1) continue

        const position = motionGenerator(trailProgress)
        newTrailPositions.unshift({
          x: position.x,
          y: position.y,
          progress: 1 - (i / trailCount)
        })
      }

      setTrailPositions(newTrailPositions)

      if (currentProgress >= 1) {
        setRangedIsComplete(true)
        setShowImpactEffect(true)
        setTimeout(() => {
          onAnimationComplete?.()
        }, ATTACK_VISUALS.IMPACT_FLASH_DURATION)
      } else {
        if (!document.hidden) {
          rangedAnimationFrameRef.current = requestAnimationFrame(animate)
        }
      }
    }

    rangedAnimationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (rangedAnimationFrameRef.current) {
        cancelAnimationFrame(rangedAnimationFrameRef.current)
      }
    }
  }, [isAnimating, rangedIsComplete, attack, onAnimationComplete])

  // Impact effect for ranged attacks (shown after projectile hits)
  useEffect(() => {
    if (!showImpactEffect || !groupRef.current) return

    const group = groupRef.current
    createImpactEffect(group, attack.toPosition, attack.color, attack.isCritical)
  }, [showImpactEffect, attack])

  const animateMeleeAttack = (group: Konva.Group) => {
    const { fromPosition, toPosition, duration, color, animation, isCritical, range } = attack

    // Create melee effect based on animation type
    const effect = createMeleeEffect(animation, fromPosition, toPosition, color, range)
    group.add(effect)

    // Create trail array for slash animation
    const trailLines: Konva.Line[] = []
    if (animation === 'melee_slash') {
      // Create 5 trail lines
      for (let i = 0; i < 5; i++) {
        const trailLine = new Konva.Line({
          points: [fromPosition.x, fromPosition.y, fromPosition.x, fromPosition.y],
          stroke: color,
          strokeWidth: 4,
          lineCap: 'round',
          opacity: 0,
        })
        group.add(trailLine)
        trailLines.push(trailLine)
      }
    }

    // Create arrow wave trail for thrust animation
    const arrowTrails: Konva.Line[] = []
    if (animation === 'melee_thrust') {
      // Create 4 arrow shapes for fading trail
      for (let i = 0; i < 4; i++) {
        const arrowTrail = new Konva.Line({
          points: [],
          stroke: color,
          strokeWidth: 3,
          lineCap: 'round',
          lineJoin: 'round',
          opacity: 0,
          closed: false,
        })
        group.add(arrowTrail)
        arrowTrails.push(arrowTrail)
      }
    }

    // Animate the melee attack
    const anim = new Konva.Animation((frame) => {
      if (!frame) return

      const progress = Math.min(frame.time / duration, 1)

      if (animation === 'melee_slash') {
        animateSlashEffect(effect as Konva.Line, progress, isCritical, trailLines)
      } else if (animation === 'melee_thrust') {
        animateThrustEffect(effect as Konva.Line, progress, isCritical, arrowTrails)
      } else {
        animateSwingEffect(effect as Konva.Group, progress, isCritical)
      }

      if (progress >= 1) {
        // No impact effect for melee slash - just complete animation
        anim.stop()
        onAnimationComplete?.()
      }
    })

    animationRef.current = anim
    anim.start()
  }

  const createMeleeEffect = (
    animation: string,
    fromPos: { x: number; y: number },
    toPos: { x: number; y: number },
    color: string,
    range?: number
  ): Konva.Arc | Konva.Line | Konva.Group => {
    const angle = Math.atan2(toPos.y - fromPos.y, toPos.x - fromPos.x)

    if (animation === 'melee_slash') {
      // Create line for slash that sweeps through cone
      // Range is in D&D feet (5ft per square = 50px)
      // Default range is 5ft (1 square = 50px)
      const PIXELS_PER_SQUARE = 50
      const rangeInSquares = (range || 5) / 5 // Convert feet to squares
      const slashLength = rangeInSquares * PIXELS_PER_SQUARE

      // Calculate the initial position (right side of 60-degree cone)
      const coneRightAngle = angle + (Math.PI / 6) // +30 degrees in radians
      const endX = fromPos.x + Math.cos(coneRightAngle) * slashLength
      const endY = fromPos.y + Math.sin(coneRightAngle) * slashLength

      return new Konva.Line({
        points: [fromPos.x, fromPos.y, endX, endY],
        stroke: color,
        strokeWidth: 6,
        lineCap: 'round',
        opacity: 0,
        shadowColor: color,
        shadowBlur: 12,
        shadowOpacity: 0.6,
      })
    } else if (animation === 'melee_thrust') {
      // Create line for thrust
      return new Konva.Line({
        points: [fromPos.x, fromPos.y, fromPos.x, fromPos.y],
        stroke: color,
        strokeWidth: 6,
        lineCap: 'round',
        opacity: 0,
      })
    } else {
      // Default swing effect - create hammer with dynamic handle
      // The handle will be drawn dynamically from source to hammer position
      const hammerGroup = new Konva.Group({
        x: 0,
        y: 0,
        opacity: 0,
      })

      const hammerSize = 12

      // Hammer handle (will be positioned dynamically in animation)
      const handle = new Konva.Line({
        name: 'hammer-handle',
        points: [fromPos.x, fromPos.y, fromPos.x, fromPos.y], // Will be updated
        stroke: '#654321',
        strokeWidth: 3,
        lineCap: 'round',
      })

      // Hammer head (metal rectangle, will be positioned at end of handle)
      const head = new Konva.Rect({
        name: 'hammer-head',
        x: fromPos.x - hammerSize / 2,
        y: fromPos.y - hammerSize / 2,
        width: hammerSize,
        height: hammerSize,
        fill: color,
        stroke: '#8B7355',
        strokeWidth: 2,
        cornerRadius: 2,
      })

      hammerGroup.add(handle)
      hammerGroup.add(head)

      return hammerGroup
    }
  }

  const animateSlashEffect = (
    effect: Konva.Line,
    progress: number,
    isCritical?: boolean,
    trailLines?: Konva.Line[]
  ) => {
    const { fromPosition, toPosition, range } = attack

    // Calculate base angle to target
    const baseAngle = Math.atan2(toPosition.y - fromPosition.y, toPosition.x - fromPosition.x)

    // Calculate maximum slash length based on range
    const PIXELS_PER_SQUARE = 50
    const rangeInSquares = (range || 5) / 5
    const maxSlashLength = rangeInSquares * PIXELS_PER_SQUARE

    // Sweep from right to left and back within 60-degree cone
    // Progress 0-0.5: right to left, 0.5-1.0: left to right
    let sweepProgress
    if (progress <= 0.5) {
      // First half: sweep from right (+30°) to left (-30°)
      sweepProgress = progress * 2 // 0 to 1
    } else {
      // Second half: sweep back from left (-30°) to right (+30°)
      sweepProgress = 2 - (progress * 2) // 1 to 0
    }

    // Calculate current angle within the 60-degree cone
    const coneHalfAngle = Math.PI / 6 // 30 degrees in radians (60° cone)
    const currentAngle = baseAngle + coneHalfAngle - (sweepProgress * coneHalfAngle * 2)

    // Dynamic length: half → full+bonus → half → zero
    // Progress 0-0.25: half to full with 0.5 square bonus at center
    // Progress 0.25-0.5: full to half (center to left)
    // Progress 0.5-0.75: half to zero (return sweep)
    // Progress 0.75-1.0: zero (completed)
    let lengthMultiplier
    let centerBonus = 0
    if (progress <= 0.25) {
      // Start at half, grow to full
      lengthMultiplier = 0.5 + (progress * 2) // 0.5 to 1.0
      // Add bonus at center (progress = 0.25)
      centerBonus = (progress / 0.25) * 25 // 0 to 25px (0.5 grid squares)
    } else if (progress <= 0.5) {
      // Shrink from full to half
      lengthMultiplier = 1.5 - (progress * 2) // 1.0 to 0.5
      // Reduce bonus from center to left
      centerBonus = ((0.5 - progress) / 0.25) * 25 // 25px to 0
    } else if (progress <= 0.75) {
      // Shrink from half to zero on return
      lengthMultiplier = 1.5 - (progress * 2) // 0.5 to 0
    } else {
      // Zero length at end
      lengthMultiplier = 0
    }

    const currentLength = (maxSlashLength * lengthMultiplier) + centerBonus

    // Calculate end point of the slash line
    const endX = fromPosition.x + Math.cos(currentAngle) * currentLength
    const endY = fromPosition.y + Math.sin(currentAngle) * currentLength

    // Update main line points
    effect.points([fromPosition.x, fromPosition.y, endX, endY])

    // Fade in and out
    const opacity = Math.sin(progress * Math.PI) * 0.9
    effect.opacity(opacity)

    // Update trail lines with fading positions
    if (trailLines) {
      trailLines.forEach((trailLine, index) => {
        // Trail lag increases with index
        const trailLag = (index + 1) * 0.04 // 4% lag per trail line
        const trailProgress = Math.max(0, progress - trailLag)

        // Calculate trail sweep progress
        let trailSweepProgress
        if (trailProgress <= 0.5) {
          trailSweepProgress = trailProgress * 2
        } else {
          trailSweepProgress = 2 - (trailProgress * 2)
        }

        // Calculate trail length
        let trailLengthMultiplier
        if (trailProgress <= 0.25) {
          trailLengthMultiplier = 0.5 + (trailProgress * 2)
        } else if (trailProgress <= 0.5) {
          trailLengthMultiplier = 1.5 - (trailProgress * 2)
        } else if (trailProgress <= 0.75) {
          trailLengthMultiplier = 1.5 - (trailProgress * 2)
        } else {
          trailLengthMultiplier = 0
        }

        const trailAngle = baseAngle + coneHalfAngle - (trailSweepProgress * coneHalfAngle * 2)
        const trailLength = maxSlashLength * trailLengthMultiplier

        const trailEndX = fromPosition.x + Math.cos(trailAngle) * trailLength
        const trailEndY = fromPosition.y + Math.sin(trailAngle) * trailLength

        trailLine.points([fromPosition.x, fromPosition.y, trailEndX, trailEndY])

        // Fade trail opacity based on lag
        const trailOpacity = Math.sin(trailProgress * Math.PI) * 0.6 * (1 - index * 0.15)
        trailLine.opacity(trailOpacity)
      })
    }

    // Scale for critical hits
    if (isCritical) {
      effect.strokeWidth(8)
    }
  }

  const animateThrustEffect = (
    effect: Konva.Line,
    progress: number,
    isCritical?: boolean,
    arrowTrails?: Konva.Line[]
  ) => {
    const { fromPosition, toPosition, color, range } = attack

    // Calculate direction angle
    const angle = Math.atan2(toPosition.y - fromPosition.y, toPosition.x - fromPosition.x)

    // Calculate maximum travel distance based on attack range
    const PIXELS_PER_SQUARE = 50
    const rangeInSquares = (range || 5) / 5 // Convert feet to squares
    const maxDistance = rangeInSquares * PIXELS_PER_SQUARE
    const rangeBonus = PIXELS_PER_SQUARE * 0.5 // Add 0.5 grid cells (25px)

    // Calculate actual distance to target
    const fullDistance = Math.sqrt(
      Math.pow(toPosition.x - fromPosition.x, 2) +
      Math.pow(toPosition.y - fromPosition.y, 2)
    )

    // Limit travel distance to attack range + bonus
    const travelDistance = Math.min(fullDistance, maxDistance + rangeBonus)

    // Arrow wave position along the path (limited by range)
    const currentX = fromPosition.x + Math.cos(angle) * travelDistance * progress
    const currentY = fromPosition.y + Math.sin(angle) * travelDistance * progress

    // Arrow wave size (0.3 of grid cell = 15px width)
    const arrowWidth = PIXELS_PER_SQUARE * 0.3 // 15px
    const arrowLength = (arrowWidth * 1.5) + (PIXELS_PER_SQUARE * 0.3) // 22.5px + 15px = 37.5px

    // Scale effect: grow in first half, shrink in second half
    const scale = Math.sin(progress * Math.PI) * (isCritical ? CRITICAL_HIT.EFFECT_SCALE : 1)
    const scaledWidth = arrowWidth * scale
    const scaledLength = arrowLength * scale

    // Create chevron/arrow shape pointing in direction of travel
    // Arrow tip at currentX, currentY
    const tipX = currentX
    const tipY = currentY

    // Calculate perpendicular offset for wings
    const perpAngle = angle + Math.PI / 2

    // Left wing back point
    const leftX = tipX - Math.cos(angle) * scaledLength + Math.cos(perpAngle) * (scaledWidth / 2)
    const leftY = tipY - Math.sin(angle) * scaledLength + Math.sin(perpAngle) * (scaledWidth / 2)

    // Right wing back point
    const rightX = tipX - Math.cos(angle) * scaledLength - Math.cos(perpAngle) * (scaledWidth / 2)
    const rightY = tipY - Math.sin(angle) * scaledLength - Math.sin(perpAngle) * (scaledWidth / 2)

    // Main arrow shape (chevron): left wing → tip → right wing
    effect.points([leftX, leftY, tipX, tipY, rightX, rightY])
    effect.opacity(Math.sin(progress * Math.PI) * 0.9)
    effect.strokeWidth(3)
    effect.stroke(color)

    // Animate trail arrows with lag and fade
    if (arrowTrails) {
      arrowTrails.forEach((trail, index) => {
        const trailLag = (index + 1) * 0.08 // 8% lag per trail
        const trailProgress = Math.max(0, progress - trailLag)

        if (trailProgress > 0) {
          // Trail position (also limited by range)
          const trailX = fromPosition.x + Math.cos(angle) * travelDistance * trailProgress
          const trailY = fromPosition.y + Math.sin(angle) * travelDistance * trailProgress

          // Trail scale (smaller than main arrow)
          const trailScale = Math.sin(trailProgress * Math.PI) * scale * (1 - index * 0.15)
          const trailScaledWidth = arrowWidth * trailScale
          const trailScaledLength = arrowLength * trailScale

          // Trail arrow tip
          const trailTipX = trailX
          const trailTipY = trailY

          // Trail arrow wings
          const trailLeftX = trailTipX - Math.cos(angle) * trailScaledLength + Math.cos(perpAngle) * (trailScaledWidth / 2)
          const trailLeftY = trailTipY - Math.sin(angle) * trailScaledLength + Math.sin(perpAngle) * (trailScaledWidth / 2)

          const trailRightX = trailTipX - Math.cos(angle) * trailScaledLength - Math.cos(perpAngle) * (trailScaledWidth / 2)
          const trailRightY = trailTipY - Math.sin(angle) * trailScaledLength - Math.sin(perpAngle) * (trailScaledWidth / 2)

          // Update trail arrow points
          trail.points([trailLeftX, trailLeftY, trailTipX, trailTipY, trailRightX, trailRightY])
          trail.opacity(Math.sin(trailProgress * Math.PI) * 0.6 * (1 - index * 0.2))
          trail.strokeWidth(2)
          trail.stroke(color)
        }
      })
    }
  }

  const animateSwingEffect = (effect: Konva.Group, progress: number, _isCritical?: boolean) => {
    const { fromPosition, toPosition, color, range } = attack

    // Calculate direction and distance
    const angle = Math.atan2(toPosition.y - fromPosition.y, toPosition.x - fromPosition.x)
    const PIXELS_PER_SQUARE = 50
    const rangeInSquares = (range || 5) / 5
    const maxDistance = rangeInSquares * PIXELS_PER_SQUARE

    const fullDistance = Math.sqrt(
      Math.pow(toPosition.x - fromPosition.x, 2) +
      Math.pow(toPosition.y - fromPosition.y, 2)
    )
    const travelDistance = Math.min(fullDistance, maxDistance)

    // Calculate target position
    const targetX = fromPosition.x + Math.cos(angle) * travelDistance
    const targetY = fromPosition.y + Math.sin(angle) * travelDistance

    // Two-phase animation: fall from Z-axis (0-0.7), burst (0.7-1.0)
    let hammerX, hammerY, hammerScale, hammerOpacity, showBurst = false

    if (progress <= 0.7) {
      // Phase 1: Fall from Z-axis (simulated by scaling and position interpolation)
      const fallProgress = progress / 0.7 // 0 to 1

      // Interpolate position from source to target
      hammerX = fromPosition.x + (targetX - fromPosition.x) * fallProgress
      hammerY = fromPosition.y + (targetY - fromPosition.y) * fallProgress

      // Scale grows as hammer "falls closer" (Z-axis simulation)
      // Starts small (0.2) and grows to full size (1.0)
      hammerScale = 0.2 + (0.8 * fallProgress)
      hammerOpacity = 0.5 + (0.4 * fallProgress) // Fade in as it approaches
    } else {
      // Phase 2: Impact - hammer disappears, burst appears
      const burstProgress = (progress - 0.7) / 0.3 // 0 to 1
      hammerX = targetX
      hammerY = targetY
      hammerScale = 1.0
      hammerOpacity = Math.max(0, 0.9 - burstProgress * 2) // Quick fade out
      showBurst = true
    }

    // Update hammer group opacity
    effect.opacity(hammerOpacity)

    // Get handle and head from group
    const handle = effect.findOne('.hammer-handle') as Konva.Line
    const head = effect.findOne('.hammer-head') as Konva.Rect

    if (handle && head) {
      // Update handle - always connects from source to hammer position
      handle.points([fromPosition.x, fromPosition.y, hammerX, hammerY])

      // Update hammer head position and scale
      const hammerSize = 12
      const scaledSize = hammerSize * hammerScale

      head.x(hammerX - scaledSize / 2)
      head.y(hammerY - scaledSize / 2)
      head.width(scaledSize)
      head.height(scaledSize)
      head.fill(color)
    }

    // Create expanding ring burst effect on impact with trailing rings
    if (showBurst && progress >= 0.7) {
      const burstProgress = (progress - 0.7) / 0.3

      // Get parent group to add burst effect
      const group = effect.getParent() as Konva.Group
      if (group) {
        // Remove old bursts if exist
        group.find('.hammer-burst').forEach(node => node.destroy())

        // Create expanding ring (0.6 grid cells = 30px max radius - smaller burst)
        const maxRadius = PIXELS_PER_SQUARE * 0.6 // Smaller burst
        const ringThickness = 3 // Thinner ring

        // Main expanding ring with radial gradient (0% opacity at center, 100% at border)
        const currentRadius = maxRadius * burstProgress

        // Create a circle with radial gradient for gradient effect
        // Convert hex color to rgba for gradient with alpha
        const hexToRgba = (hex: string, alpha: number) => {
          const r = parseInt(hex.slice(1, 3), 16)
          const g = parseInt(hex.slice(3, 5), 16)
          const b = parseInt(hex.slice(5, 7), 16)
          return `rgba(${r}, ${g}, ${b}, ${alpha})`
        }

        const gradientCircle = new Konva.Circle({
          name: 'hammer-burst',
          x: targetX,
          y: targetY,
          radius: currentRadius,
          fillRadialGradientStartPoint: { x: 0, y: 0 },
          fillRadialGradientStartRadius: 0,
          fillRadialGradientEndPoint: { x: 0, y: 0 },
          fillRadialGradientEndRadius: currentRadius,
          fillRadialGradientColorStops: [
            0, hexToRgba(color, 0),      // 0% position: fully transparent center
            0.7, hexToRgba(color, 0.4),  // 70% position: semi-transparent
            1, hexToRgba(color, 0.7)     // 100% position: 70% opacity at edge
          ],
          opacity: (1 - burstProgress),
          stroke: color,
          strokeWidth: 1.5,
          strokeOpacity: (1 - burstProgress) * 0.9,
        })
        group.add(gradientCircle)

        // Add 2 trailing rings behind the main ring
        for (let i = 1; i <= 2; i++) {
          const trailLag = i * 0.15 // Each trail lags by 15%
          const trailProgress = Math.max(0, burstProgress - trailLag)

          if (trailProgress > 0) {
            const trailRadius = maxRadius * trailProgress
            const trailOpacity = (1 - trailProgress) * 0.4 * (1 - i * 0.3) // Fainter trails

            const trailRing = new Konva.Ring({
              name: 'hammer-burst',
              x: targetX,
              y: targetY,
              innerRadius: Math.max(0, trailRadius - ringThickness),
              outerRadius: trailRadius,
              fill: color,
              opacity: trailOpacity,
              stroke: color,
              strokeWidth: 1,
              strokeOpacity: trailOpacity,
            })
            group.add(trailRing)
          }
        }

        // Add 3 aftershock waves after the main burst
        for (let i = 1; i <= 3; i++) {
          const aftershockDelay = i * 0.2 // Each aftershock starts 20% later
          const aftershockProgress = Math.max(0, burstProgress - aftershockDelay)

          if (aftershockProgress > 0) {
            const aftershockRadius = maxRadius * aftershockProgress
            const baseOpacity = 0.3 - (i * 0.07) // Decreasing base opacity: 0.3, 0.23, 0.16
            const aftershockOpacity = (1 - aftershockProgress) * baseOpacity

            const aftershockRing = new Konva.Ring({
              name: 'hammer-burst',
              x: targetX,
              y: targetY,
              innerRadius: Math.max(0, aftershockRadius - ringThickness),
              outerRadius: aftershockRadius,
              fill: color,
              opacity: aftershockOpacity,
              stroke: color,
              strokeWidth: 0.8,
              strokeOpacity: aftershockOpacity * 0.8,
            })
            group.add(aftershockRing)
          }
        }
      }
    }
  }

  const createImpactEffect = (
    group: Konva.Group,
    position: { x: number; y: number },
    color: string,
    isCritical?: boolean
  ) => {
    const impactSize = isCritical ? 20 : 12
    const duration = isCritical ? CRITICAL_HIT.EFFECT_DURATION : ATTACK_VISUALS.IMPACT_FLASH_DURATION

    // Create impact flash
    const impact = new Konva.Circle({
      x: position.x,
      y: position.y,
      radius: impactSize,
      fill: color,
      stroke: '#FFFFFF',
      strokeWidth: 2,
      opacity: 1,
    })

    group.add(impact)

    // Animate impact effect
    const impactAnim = new Konva.Animation((frame) => {
      if (!frame) return

      const progress = Math.min(frame.time / duration, 1)
      const scale = 1 + progress * 2
      const opacity = 1 - progress

      impact.scale({ x: scale, y: scale })
      impact.opacity(opacity)

      if (progress >= 1) {
        impact.destroy()
        impactAnim.stop()
      }
    })

    impactAnim.start()

    // Add damage number if specified
    if (attack.actualDamage) {
      createDamageNumber(group, position, attack.actualDamage, isCritical)
    }

    // Critical hit screen shake effect
    if (isCritical) {
      createScreenShake(group)
    }
  }

  const createDamageNumber = (
    group: Konva.Group,
    position: { x: number; y: number },
    damage: number,
    isCritical?: boolean
  ) => {
    const damageText = new Konva.Text({
      x: position.x - 15,
      y: position.y - 30,
      text: damage.toString(),
      fontSize: isCritical ? 24 : 18,
      fontFamily: 'Arial Black',
      fill: isCritical ? '#FFD700' : '#FFFFFF',
      stroke: '#000000',
      strokeWidth: 2,
      align: 'center',
      opacity: 1,
    })

    group.add(damageText)

    // Animate damage number
    const damageAnim = new Konva.Animation((frame) => {
      if (!frame) return

      const progress = Math.min(frame.time / ATTACK_VISUALS.DAMAGE_NUMBER_DURATION, 1)
      const yOffset = -50 * progress
      const opacity = 1 - progress

      damageText.y(position.y - 30 + yOffset)
      damageText.opacity(opacity)

      if (progress >= 1) {
        damageText.destroy()
        damageAnim.stop()
      }
    })

    damageAnim.start()
  }

  const createScreenShake = (group: Konva.Group) => {
    const originalPos = group.position()
    let shakeTime = 0

    const shakeAnim = new Konva.Animation((frame) => {
      if (!frame) return

      shakeTime += frame.timeDiff

      if (shakeTime < CRITICAL_HIT.EFFECT_DURATION) {
        const intensity = CRITICAL_HIT.SHAKE_INTENSITY * (1 - shakeTime / CRITICAL_HIT.EFFECT_DURATION)
        const offsetX = (Math.random() - 0.5) * intensity
        const offsetY = (Math.random() - 0.5) * intensity

        group.position({
          x: originalPos.x + offsetX,
          y: originalPos.y + offsetY
        })
      } else {
        group.position(originalPos)
        shakeAnim.stop()
      }
    })

    shakeAnim.start()
  }

  // Render ranged attacks using custom animation
  if (attack.attackType === 'ranged') {
    if (rangedIsComplete) {
      return (
        <Group
          ref={groupRef}
          visible={false}
          listening={false}
        />
      )
    }

    const motionGenerator = motionGeneratorRef.current
    if (!motionGenerator) {
      return (
        <Group
          ref={groupRef}
          visible={false}
          listening={false}
        />
      )
    }

    const position = motionGenerator(rangedProgress)
    const size = attack.isCritical ? 10 : 6
    const color = attack.color
    const opacity = 1 - rangedProgress * 0.3

    // Calculate angle for directional effect
    const dx = attack.toPosition.x - attack.fromPosition.x
    const dy = attack.toPosition.y - attack.fromPosition.y
    const angle = Math.atan2(dy, dx)

    return (
      <>
        <Group listening={false}>
          {/* Trail effect */}
          {trailPositions.map((pos, index) => {
            const trailRatio = pos.progress
            const trailSize = size * (0.3 + trailRatio * 0.7)

            return (
              <Circle
                key={index}
                x={pos.x}
                y={pos.y}
                radius={trailSize}
                fill={color}
                opacity={trailRatio * 0.5}
              />
            )
          })}

          {/* Glow effect */}
          <Circle
            x={position.x}
            y={position.y}
            radius={size * 1.5}
            fill={color}
            opacity={0.3}
          />

          {/* Main projectile body */}
          <Circle
            x={position.x}
            y={position.y}
            radius={size}
            fill={color}
            opacity={opacity}
            shadowColor={color}
            shadowBlur={size * 2}
            shadowOpacity={0.6}
          />

          {/* Inner core */}
          <Circle
            x={position.x}
            y={position.y}
            radius={size * 0.5}
            fill="#FFFFFF"
            opacity={opacity * 0.8}
          />

          {/* Front-facing point */}
          <Circle
            x={position.x + Math.cos(angle) * size}
            y={position.y + Math.sin(angle) * size}
            radius={size * 0.3}
            fill="#FFFFFF"
            opacity={opacity * 0.9}
          />
        </Group>
        <Group
          ref={groupRef}
          visible={false}
          listening={false}
        />
      </>
    )
  }

  // Render melee attacks using custom Konva animations
  return (
    <Group
      ref={groupRef}
      visible={false}
      listening={false}
    />
  )
}

export const AttackRenderer = memo(AttackRendererComponent)