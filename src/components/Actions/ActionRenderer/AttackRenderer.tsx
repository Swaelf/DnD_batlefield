import { memo, useRef, useEffect } from 'react'
import Konva from 'konva'
import { Group } from 'react-konva'
import type { AttackEventData } from '@/types'
import { ATTACK_VISUALS, CRITICAL_HIT } from '@/constants'

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

  useEffect(() => {
    if (!isAnimating || !groupRef.current || hasStartedRef.current) return

    hasStartedRef.current = true
    const group = groupRef.current

    // Reset animation state
    group.visible(true)

    // Create animation based on attack type
    if (attack.attackType === 'ranged') {
      animateRangedAttack(group)
    } else {
      animateMeleeAttack(group)
    }

    // Cleanup function
    return () => {
      if (animationRef.current) {
        animationRef.current.stop()
        animationRef.current = null
      }
      hasStartedRef.current = false
    }
  }, [isAnimating, attack])

  const animateRangedAttack = (group: Konva.Group) => {
    const { fromPosition, toPosition, duration, color, isCritical } = attack

    // Calculate projectile path
    const distance = Math.sqrt(
      Math.pow(toPosition.x - fromPosition.x, 2) +
      Math.pow(toPosition.y - fromPosition.y, 2)
    )

    const angle = Math.atan2(
      toPosition.y - fromPosition.y,
      toPosition.x - fromPosition.x
    )

    // Create projectile
    const projectile = new Konva.Circle({
      x: fromPosition.x,
      y: fromPosition.y,
      radius: 3,
      fill: color,
      stroke: '#FFFFFF',
      strokeWidth: 1,
      shadowColor: color,
      shadowBlur: 8,
      shadowOpacity: 0.8,
    })

    // Create trail effect
    const trail = new Konva.Line({
      points: [fromPosition.x, fromPosition.y, fromPosition.x, fromPosition.y],
      stroke: color,
      strokeWidth: 2,
      opacity: 0.6,
      lineCap: 'round',
      dash: [5, 5],
    })

    group.add(trail)
    group.add(projectile)

    // Animate projectile movement
    const anim = new Konva.Animation((frame) => {
      if (!frame) return

      const progress = Math.min(frame.time / duration, 1)

      // Update projectile position
      const currentX = fromPosition.x + (toPosition.x - fromPosition.x) * progress
      const currentY = fromPosition.y + (toPosition.y - fromPosition.y) * progress

      projectile.position({ x: currentX, y: currentY })

      // Update trail
      const trailLength = Math.min(ATTACK_VISUALS.TRAIL_LENGTH, distance * progress)
      const trailStartX = currentX - Math.cos(angle) * trailLength
      const trailStartY = currentY - Math.sin(angle) * trailLength

      trail.points([trailStartX, trailStartY, currentX, currentY])

      // Critical hit effect
      if (isCritical && progress > 0.8) {
        const scale = 1 + Math.sin(frame.time / 50) * 0.3
        projectile.scale({ x: scale, y: scale })
      }

      if (progress >= 1) {
        // Impact effect
        createImpactEffect(group, toPosition, color, isCritical)
        anim.stop()

        // Clean up after impact effect
        setTimeout(() => {
          onAnimationComplete?.()
        }, ATTACK_VISUALS.IMPACT_FLASH_DURATION)
      }
    })

    animationRef.current = anim
    anim.start()
  }

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
        animateSwingEffect(effect as Konva.Circle, progress, isCritical)
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
  ): Konva.Arc | Konva.Line | Konva.Circle => {
    const angle = Math.atan2(toPos.y - fromPos.y, toPos.x - fromPos.x)
    const midX = (fromPos.x + toPos.x) / 2
    const midY = (fromPos.y + toPos.y) / 2

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
      // Default swing effect
      return new Konva.Circle({
        x: midX,
        y: midY,
        radius: 0,
        fill: color,
        opacity: 0,
        stroke: color,
        strokeWidth: 2,
      })
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

  const animateSwingEffect = (effect: Konva.Circle, progress: number, isCritical?: boolean) => {
    const radius = 25 * progress * (isCritical ? CRITICAL_HIT.EFFECT_SCALE : 1)
    const opacity = Math.sin(progress * Math.PI)

    effect.radius(radius)
    effect.opacity(opacity * 0.6)
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

  return (
    <Group
      ref={groupRef}
      visible={false}
      listening={false}
    />
  )
}

export const AttackRenderer = memo(AttackRendererComponent)