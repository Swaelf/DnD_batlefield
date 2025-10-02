import { type FC, useRef, useEffect } from 'react'
import { Circle, Group } from 'react-konva'
import Konva from 'konva'
import type { Position } from '@/types/map'

type PersistentAreaProps = {
  position: Position
  radius: number
  color: string
  opacity: number
  spellName: string
  roundCreated: number
}

export const PersistentArea: FC<PersistentAreaProps> = ({
  position,
  radius,
  color,
  opacity,
  spellName: _spellName,
  roundCreated: _roundCreated
}) => {
  const groupRef = useRef<Konva.Group>(null)
  const animationRef = useRef<Konva.Animation | null>(null)


  useEffect(() => {
    if (!groupRef.current) return

    const group = groupRef.current

    // Start with 0 opacity and fade in
    group.opacity(0)

    // Fade in animation
    const anim = new Konva.Animation((frame) => {
      if (!frame) return

      const progress = Math.min(frame.time / 500, 1) // 500ms fade in
      group.opacity(progress * opacity)

      if (progress >= 1) {
        anim.stop()
      }
    })

    animationRef.current = anim
    anim.start()

    return () => {
      if (animationRef.current) {
        animationRef.current.stop()
        animationRef.current = null
      }
    }
  }, [opacity])

  return (
    <Group
      ref={groupRef}
      x={position.x}
      y={position.y}
      listening={false} // Make non-interactive so tokens can be selected through it
    >
      {/* Outer smoldering area */}
      <Circle
        x={0}
        y={0}
        radius={Math.max(1, radius * 1.1)}
        fill={color}
        opacity={0.3}
        stroke={color}
        strokeWidth={1}
        strokeOpacity={0.5}
        listening={false}
      />
      {/* Main burning ground */}
      <Circle
        x={0}
        y={0}
        radius={Math.max(1, radius)}
        fill={color}
        opacity={0.6}
        stroke={color}
        strokeWidth={2}
        strokeOpacity={0.8}
        listening={false}
      />
      {/* Inner embers */}
      <Circle
        x={0}
        y={0}
        radius={Math.max(1, radius * 0.7)}
        fill={color}
        opacity={0.4}
        listening={false}
      />
    </Group>
  )
}