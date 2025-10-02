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

    // Animate the melee attack
    const anim = new Konva.Animation((frame) => {
      if (!frame) return

      const progress = Math.min(frame.time / duration, 1)

      if (animation === 'melee_slash') {
        animateSlashEffect(effect as Konva.Line, progress, isCritical)
      } else if (animation === 'melee_thrust') {
        animateThrustEffect(effect as Konva.Line, progress, isCritical)
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

      // Calculate the initial position (right side of 45-degree cone)
      const coneRightAngle = angle + (Math.PI / 8) // +22.5 degrees in radians
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

  const animateSlashEffect = (effect: Konva.Line, progress: number, isCritical?: boolean) => {
    const { fromPosition, toPosition, range } = attack

    // Calculate base angle to target
    const baseAngle = Math.atan2(toPosition.y - fromPosition.y, toPosition.x - fromPosition.x)

    // Calculate slash length based on range
    const PIXELS_PER_SQUARE = 50
    const rangeInSquares = (range || 5) / 5
    const slashLength = rangeInSquares * PIXELS_PER_SQUARE

    // Sweep from right to left and back within 45-degree cone
    // Progress 0-0.5: right to left, 0.5-1.0: left to right
    let sweepProgress
    if (progress <= 0.5) {
      // First half: sweep from right (+22.5°) to left (-22.5°)
      sweepProgress = progress * 2 // 0 to 1
    } else {
      // Second half: sweep back from left (-22.5°) to right (+22.5°)
      sweepProgress = 2 - (progress * 2) // 1 to 0
    }

    // Calculate current angle within the 45-degree cone
    const coneHalfAngle = Math.PI / 8 // 22.5 degrees in radians
    const currentAngle = baseAngle + coneHalfAngle - (sweepProgress * coneHalfAngle * 2)

    // Calculate end point of the slash line
    const endX = fromPosition.x + Math.cos(currentAngle) * slashLength
    const endY = fromPosition.y + Math.sin(currentAngle) * slashLength

    // Update line points
    effect.points([fromPosition.x, fromPosition.y, endX, endY])

    // Fade in and out
    const opacity = Math.sin(progress * Math.PI) * 0.9
    effect.opacity(opacity)

    // Scale for critical hits
    if (isCritical) {
      effect.strokeWidth(8)
    }
  }

  const animateThrustEffect = (effect: Konva.Line, progress: number, isCritical?: boolean) => {
    const { fromPosition, toPosition } = attack
    const currentX = fromPosition.x + (toPosition.x - fromPosition.x) * progress
    const currentY = fromPosition.y + (toPosition.y - fromPosition.y) * progress

    const opacity = Math.sin(progress * Math.PI)
    const width = 6 * (isCritical ? CRITICAL_HIT.EFFECT_SCALE : 1)

    effect.points([fromPosition.x, fromPosition.y, currentX, currentY])
    effect.opacity(opacity * 0.8)
    effect.strokeWidth(width)
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
    />
  )
}

export const AttackRenderer = memo(AttackRendererComponent)