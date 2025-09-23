import { memo, useEffect, useRef } from 'react'
import { Group } from 'react-konva'
import type Konva from 'konva'
import type { UnifiedAction } from '@/types/unifiedAction'
import { useUnifiedActionStore } from '@/store/unifiedActionStore'
import {
  ProjectileAnimation,
  MeleeAnimation,
  RayAnimation,
  AreaAnimation,
  BurstAnimation,
  InteractionAnimation
} from './animations'

type ActionRendererProps = {
  action: UnifiedAction
  onAnimationComplete?: (actionId: string) => void
}

const ActionRendererComponent = ({ action, onAnimationComplete }: ActionRendererProps) => {
  const groupRef = useRef<Konva.Group>(null)
  const hasStartedRef = useRef(false)
  const completeAction = useUnifiedActionStore(state => state.completeAction)

  useEffect(() => {
    // Mark action as started
    if (!hasStartedRef.current) {
      hasStartedRef.current = true
      console.log(`Starting action: ${action.metadata.name} (${action.id})`)
    }

    // Cleanup on unmount
    return () => {
      if (hasStartedRef.current) {
        console.log(`Cleaning up action: ${action.metadata.name} (${action.id})`)
      }
    }
  }, [action.id, action.metadata.name])

  const handleAnimationComplete = () => {
    // Mark action as complete in store
    completeAction(action.id)

    // Call external callback if provided
    onAnimationComplete?.(action.id)

    console.log(`Completed action: ${action.metadata.name} (${action.id})`)
  }

  // Select appropriate animation component based on action type and animation type
  const renderAnimation = () => {
    const animationType = action.animation.type

    switch (animationType) {
      case 'projectile':
        return <ProjectileAnimation action={action} onComplete={handleAnimationComplete} />

      case 'melee_swing':
      case 'melee_slash':
        return <MeleeAnimation action={action} onComplete={handleAnimationComplete} />

      case 'ray':
        return <RayAnimation action={action} onComplete={handleAnimationComplete} />

      case 'area':
        return <AreaAnimation action={action} onComplete={handleAnimationComplete} />

      case 'burst':
        return <BurstAnimation action={action} onComplete={handleAnimationComplete} />

      case 'interaction':
        return <InteractionAnimation action={action} onComplete={handleAnimationComplete} />

      default:
        console.warn(`Unknown animation type: ${animationType}`)
        // Still complete the action even if animation type is unknown
        handleAnimationComplete()
        return null
    }
  }

  return (
    <Group ref={groupRef} listening={false}>
      {renderAnimation()}
    </Group>
  )
}

export const ActionRenderer = memo(ActionRendererComponent)