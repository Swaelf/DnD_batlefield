import React, { useEffect, useRef, useState } from 'react'
import { Group, Circle, Rect, Wedge } from 'react-konva'
import Konva from 'konva'
import { SpellEffect } from '@/types/spells'
import useRoundStore from '@/store/roundStore'

interface SpellEffectRendererProps {
  spell: SpellEffect
  gridSize?: number
  onRemove?: (id: string) => void
}

export const SpellEffectRenderer: React.FC<SpellEffectRendererProps> = ({
  spell,
  // gridSize: unused parameter
  onRemove
}) => {
  const { currentRound } = useRoundStore()
  const [animationPhase, setAnimationPhase] = useState<'entering' | 'active' | 'exiting'>('entering')
  const [scale, setScale] = useState(0)
  const [opacity, setOpacity] = useState(0)
  const animationRef = useRef<Konva.Tween | null>(null)
  const groupRef = useRef<Konva.Group>(null)

  // Calculate if spell should be removed
  const shouldRemove = spell.duration > 0
    ? currentRound >= spell.roundCreated + spell.duration
    : animationPhase === 'exiting' && scale <= 0

  // Handle animation phases
  useEffect(() => {
    if (!groupRef.current) return

    // Determine current phase
    const isExpired = spell.duration > 0 && currentRound >= spell.roundCreated + spell.duration

    if (isExpired && animationPhase !== 'exiting') {
      setAnimationPhase('exiting')
    } else if (!isExpired && animationPhase === 'entering' && scale >= 1) {
      setAnimationPhase('active')
    }

    // Clean up previous animation
    if (animationRef.current) {
      animationRef.current.destroy()
    }

    // Create appropriate animation
    const animation = spell.animation[animationPhase === 'entering' ? 'enter' : animationPhase === 'exiting' ? 'exit' : 'active']
    const duration = animationPhase === 'entering'
      ? spell.animation.enterDuration
      : animationPhase === 'exiting'
      ? spell.animation.exitDuration
      : 1000

    switch (animation) {
      case 'burst':
        animationRef.current = new Konva.Tween({
          node: groupRef.current,
          duration: duration / 1000,
          scaleX: animationPhase === 'entering' ? 1.2 : 0,
          scaleY: animationPhase === 'entering' ? 1.2 : 0,
          opacity: animationPhase === 'entering' ? spell.opacity : 0,
          easing: Konva.Easings.EaseOut,
          onFinish: () => {
            setScale(animationPhase === 'entering' ? 1 : 0)
            setOpacity(animationPhase === 'entering' ? spell.opacity : 0)
            if (animationPhase === 'entering') {
              // After burst, shrink slightly
              setTimeout(() => {
                if (groupRef.current) {
                  groupRef.current.scaleX(1)
                  groupRef.current.scaleY(1)
                }
              }, 100)
            }
            if (animationPhase === 'exiting' && spell.duration === 0) {
              onRemove?.(spell.id)
            }
          }
        })
        break

      case 'spread':
        animationRef.current = new Konva.Tween({
          node: groupRef.current,
          duration: duration / 1000,
          scaleX: animationPhase === 'entering' ? 1 : animationPhase === 'exiting' ? 0 : scale,
          scaleY: animationPhase === 'entering' ? 1 : animationPhase === 'exiting' ? 0 : scale,
          opacity: animationPhase === 'entering' ? spell.opacity : animationPhase === 'exiting' ? 0 : opacity,
          easing: Konva.Easings.EaseInOut,
          onFinish: () => {
            setScale(animationPhase === 'entering' ? 1 : 0)
            setOpacity(animationPhase === 'entering' ? spell.opacity : 0)
            if (animationPhase === 'exiting') {
              onRemove?.(spell.id)
            }
          }
        })
        break

      case 'fade-in':
      case 'fade-out':
        animationRef.current = new Konva.Tween({
          node: groupRef.current,
          duration: duration / 1000,
          opacity: animation === 'fade-in' ? spell.opacity : 0,
          easing: Konva.Easings.Linear,
          onFinish: () => {
            setOpacity(animation === 'fade-in' ? spell.opacity : 0)
            if (animation === 'fade-out') {
              onRemove?.(spell.id)
            }
          }
        })
        break

      case 'pulse':
        if (animationPhase === 'active') {
          // Create pulsing animation for active phase
          const pulseAnimation = new Konva.Animation((frame) => {
            if (!groupRef.current || !frame) return
            const period = 2000 // 2 second pulse
            const scale = 0.95 + 0.1 * Math.sin((frame.time * 2 * Math.PI) / period)
            groupRef.current.scaleX(scale)
            groupRef.current.scaleY(scale)
            const opacity = spell.opacity * (0.8 + 0.2 * Math.sin((frame.time * 2 * Math.PI) / period))
            groupRef.current.opacity(opacity)
          })
          pulseAnimation.start()

          // Store animation for cleanup
          return () => pulseAnimation.stop()
        }
        break

      case 'ripple':
        // Ripple effect - expand and fade
        animationRef.current = new Konva.Tween({
          node: groupRef.current,
          duration: duration / 1000,
          scaleX: animationPhase === 'entering' ? 1.5 : 1,
          scaleY: animationPhase === 'entering' ? 1.5 : 1,
          opacity: animationPhase === 'entering' ? 0 : spell.opacity,
          easing: Konva.Easings.EaseOut,
          onFinish: () => {
            if (groupRef.current) {
              groupRef.current.scaleX(1)
              groupRef.current.scaleY(1)
              groupRef.current.opacity(spell.opacity)
            }
          }
        })
        break

      case 'dissolve':
        // Particle dissolve effect
        if (animationPhase === 'exiting') {
          animationRef.current = new Konva.Tween({
            node: groupRef.current,
            duration: duration / 1000,
            opacity: 0,
            scaleX: 1.2,
            scaleY: 1.2,
            easing: Konva.Easings.EaseIn,
            onFinish: () => {
              onRemove?.(spell.id)
            }
          })
        }
        break

      case 'collapse':
        if (animationPhase === 'exiting') {
          animationRef.current = new Konva.Tween({
            node: groupRef.current,
            duration: duration / 1000,
            scaleX: 0,
            scaleY: 0,
            rotation: 180,
            easing: Konva.Easings.BackEaseIn,
            onFinish: () => {
              onRemove?.(spell.id)
            }
          })
        }
        break
    }

    if (animationRef.current) {
      animationRef.current.play()
    }

    // Initial setup for entering phase
    if (animationPhase === 'entering' && groupRef.current) {
      if (animation === 'burst' || animation === 'spread') {
        groupRef.current.scaleX(0)
        groupRef.current.scaleY(0)
      }
      if (animation === 'fade-in') {
        groupRef.current.opacity(0)
      }
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.destroy()
      }
    }
  }, [animationPhase, currentRound, spell, onRemove])

  // Check for removal
  useEffect(() => {
    if (shouldRemove) {
      if (animationPhase !== 'exiting') {
        setAnimationPhase('exiting')
      }
    }
  }, [shouldRemove, animationPhase])

  // Render spell effect shape
  const renderSpellShape = () => {
    const baseProps = {
      fill: spell.color,
      opacity: spell.opacity,
      stroke: spell.color,
      strokeWidth: 2,
      strokeOpacity: 0.3
    }

    switch (spell.type) {
      case 'area':
        if (spell.size.radius) {
          return <Circle {...baseProps} radius={spell.size.radius} />
        } else {
          return (
            <Rect
              {...baseProps}
              width={spell.size.width || 100}
              height={spell.size.height || 100}
              offsetX={(spell.size.width || 100) / 2}
              offsetY={(spell.size.height || 100) / 2}
            />
          )
        }

      case 'cone':
        const length = spell.size.length || 150
        const angle = spell.size.angle || 60
        return (
          <Wedge
            {...baseProps}
            radius={length}
            angle={angle}
            rotation={-angle / 2}
          />
        )

      case 'line':
        return (
          <Rect
            {...baseProps}
            width={spell.size.length || 200}
            height={spell.size.width || 10}
            offsetY={(spell.size.width || 10) / 2}
          />
        )

      case 'wall':
        return (
          <Rect
            {...baseProps}
            width={spell.size.length || 200}
            height={spell.size.width || 5}
            offsetY={(spell.size.width || 5) / 2}
          />
        )

      default:
        return <Circle {...baseProps} radius={50} />
    }
  }

  return (
    <Group
      ref={groupRef}
      x={spell.position.x}
      y={spell.position.y}
      rotation={spell.rotation}
    >
      {renderSpellShape()}
    </Group>
  )
}