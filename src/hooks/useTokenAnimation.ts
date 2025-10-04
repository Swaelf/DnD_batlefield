import { useEffect, useRef, useCallback, type MutableRefObject } from 'react'
import type Konva from 'konva'
import useTimelineStore from '@/store/timelineStore'
import useMapStore from '@/store/mapStore'
import useAnimationStore from '@/store/animationStore'
import type { TimelineAction } from '@/types/timeline';
import { isMoveEvent, isAppearEvent, isDisappearEvent, isSpellEvent } from '@/types/timeline'

export function useTokenAnimation(stageRef: MutableRefObject<Konva.Stage | null>) {
  const activeSpellAnimations = useRef<Set<string>>(new Set())
  const rafIdsRef = useRef<Set<number>>(new Set())
  const timeoutIdsRef = useRef<Set<NodeJS.Timeout>>(new Set())
  const { currentMap, updateObjectPosition, addSpellEffect } = useMapStore()
  const { startAnimation, updateProgress, endAnimation } = useAnimationStore()

  // Execute animations for a specific event
  const animateEvent = useCallback((event: TimelineAction, tokenNode: Konva.Node | null) => {
    if (!stageRef.current) {
      return Promise.resolve()
    }

    // For spell events, we don't need a tokenNode
    if (isSpellEvent(event.data) && !tokenNode) {
      // This is fine for spell events
    } else if (!tokenNode) {
      return Promise.resolve()
    }

    const { animationSpeed } = useTimelineStore.getState()
    // Convert milliseconds to seconds and adjust for speed
    const adjustedDuration = (event.data.duration || 1000) / 1000 / animationSpeed


    return new Promise<void>((resolve) => {
      if (isMoveEvent(event.data)) {
        if (!tokenNode) {
          return resolve()
        }

        const moveData = event.data // Type narrowing for MoveEventData

        // For sequential movements, use the token's current position instead of stored fromPosition
        // This ensures that movements chain correctly
        const currentTokenPosition = {
          x: tokenNode.x(),
          y: tokenNode.y()
        }

        // Use current position as start if the token has moved from its original position
        // Otherwise use the stored fromPosition (for first movement)
        const fromPos = currentTokenPosition
        const toPos = moveData.toPosition


        // Start animation path tracking
        startAnimation(event.tokenId, fromPos, toPos)

        // Token is already at the correct position (current position)

        // Force initial draw
        tokenNode.getLayer()?.batchDraw()

        // Move animation - use manual animation with store updates

        const startTime = Date.now()
        const duration = adjustedDuration * 1000 // Convert to milliseconds

        let currentRafId: number | null = null

        const animate = () => {

          // Remove the current RAF ID from tracking since it's executing
          if (currentRafId !== null) {
            rafIdsRef.current.delete(currentRafId)
          }

          const elapsed = Date.now() - startTime
          const progress = Math.min(elapsed / duration, 1)

          // Calculate interpolated position
          const currentX = fromPos.x + (toPos.x - fromPos.x) * progress
          const currentY = fromPos.y + (toPos.y - fromPos.y) * progress

          // Update the position in the store - this will cause React to re-render
          const { updateObjectPosition: updatePos } = useMapStore.getState()
          updatePos(event.tokenId, { x: currentX, y: currentY })

          // Update animation progress
          updateProgress(event.tokenId, progress)

          if (progress < 1) {
            // Continue animation
            currentRafId = requestAnimationFrame(animate)
            rafIdsRef.current.add(currentRafId)
          } else {
            // Animation complete

            // Ensure final position is exact
            const { updateObjectPosition: updatePosFinal } = useMapStore.getState()
            updatePosFinal(event.tokenId, toPos)

            // End animation path tracking
            endAnimation(event.tokenId)

            resolve()
          }
        }

        // Start the animation
        currentRafId = requestAnimationFrame(animate)
        rafIdsRef.current.add(currentRafId)

      } else if (isAppearEvent(event.data)) {
        // Appear animation
        if (!tokenNode) {
          return resolve()
        }

        const token = currentMap?.objects.find(obj => obj.id === event.tokenId)
        if (!token) {
          // Create a temporary token if it doesn't exist
          // In a real scenario, you'd have the token data stored with the event
          resolve()
          return
        }

        // Initially hide the token
        tokenNode.opacity(0)
        tokenNode.position(event.data.position)

        if (event.data.fadeIn) {
          const startTime = Date.now()
          const duration = adjustedDuration * 1000
          const targetOpacity = token.opacity || 1

          const animateFade = () => {
            const elapsed = Date.now() - startTime
            const progress = Math.min(elapsed / duration, 1)

            tokenNode.opacity(targetOpacity * progress)
            tokenNode.getLayer()?.batchDraw()

            if (progress < 1) {
              const rafId = requestAnimationFrame(animateFade)
              rafIdsRef.current.add(rafId)
            } else {
              resolve()
            }
          }

          const rafId = requestAnimationFrame(animateFade)
          rafIdsRef.current.add(rafId)
        } else {
          tokenNode.opacity(token.opacity || 1)
          resolve()
        }

      } else if (isDisappearEvent(event.data)) {
        // Disappear animation
        if (!tokenNode) {
          return resolve()
        }

        if (event.data.fadeOut) {
          const startTime = Date.now()
          const duration = adjustedDuration * 1000
          const startOpacity = tokenNode.opacity()

          const animateFade = () => {
            const elapsed = Date.now() - startTime
            const progress = Math.min(elapsed / duration, 1)

            tokenNode.opacity(startOpacity * (1 - progress))
            tokenNode.getLayer()?.batchDraw()

            if (progress < 1) {
              const rafId = requestAnimationFrame(animateFade)
              rafIdsRef.current.add(rafId)
            } else {
              // Optionally remove the token from the map
              // deleteObject(event.tokenId)
              resolve()
            }
          }

          const rafId = requestAnimationFrame(animateFade)
          rafIdsRef.current.add(rafId)
        } else {
          tokenNode.opacity(0)
          // deleteObject(event.tokenId)
          resolve()
        }
      } else if (isSpellEvent(event.data)) {
        // Spell animation
        const spellData = event.data // Type narrowing for SpellEventData

        // Get the current position of the caster token for dynamic positioning
        const { currentMap } = useMapStore.getState()
        const casterToken = currentMap?.objects.find(obj => obj.id === event.tokenId)

        // Use the caster's current position (after any move animations)
        // This ensures spells are cast from where the token IS, not where it WAS
        const actualFromPosition = casterToken ? casterToken.position : spellData.fromPosition

        // Update the spell data with the actual position
        const updatedSpellData = {
          ...spellData,
          fromPosition: actualFromPosition
        }

        // Create a unique ID for the spell effect
        const spellId = `spell-${event.id}-${Date.now()}`

        // Calculate animation duration first, before using it
        // For projectile-burst, we need to account for both travel and burst time
        let animDuration = spellData.duration || 1500

        // Calculate actual animation duration for projectile spells
        if (spellData.category === 'projectile' || spellData.category === 'projectile-burst') {
          const dx = spellData.toPosition.x - actualFromPosition.x
          const dy = spellData.toPosition.y - actualFromPosition.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          const speed = spellData.projectileSpeed || 500
          const travelTime = (distance / speed) * 1000

          // For projectile-burst, add burst animation time
          if (spellData.category === 'projectile-burst') {
            animDuration = travelTime + 500 // 300ms for burst + buffer
          } else {
            animDuration = travelTime + 100 // Small buffer for projectile
          }
        } else if (spellData.category === 'burst') {
          animDuration = 600 // Standard burst duration
        } else if (spellData.category === 'ray') {
          animDuration = 800 // Standard ray duration
        } else if (spellData.category === 'area') {
          // For area spells, use the duration from the spell data (expanding animation only)
          animDuration = spellData.duration || 800 // Default expanding animation duration
        } else if (spellData.spellName?.toLowerCase() === 'stone rain') {
          // Stone rain has its own special multi-burst animation
          animDuration = 2000 // Total duration for all stone impacts
        }

        const persistDuration = (spellData.persistDuration || 0) // Already in milliseconds
        // const totalDuration = animDuration // For area spells, only use animation duration (unused)

        // Create spell object for initial animation
        const spellObject = {
          id: spellId,
          type: 'spell' as const,
          position: spellData.category === 'area' ? spellData.toPosition : actualFromPosition,
          rotation: 0,
          layer: 100, // Spells render above everything
          isSpellEffect: true,
          spellData: {
            ...updatedSpellData,
            // For area spells, keep persistDuration for the AreaSpell component to use
            // For other spells, set to 0 since they don't use persistent effects
            persistDuration: spellData.category === 'area' ? persistDuration : 0,
            roundCreated: event.eventNumber
          },
          roundCreated: event.eventNumber,
          eventCreated: timelineStore.currentEvent,
          spellDuration: spellData.category === 'area' ? 0 : 0, // Initial spell objects don't persist
          durationType: 'rounds' as const
        }

        addSpellEffect(spellObject)

        // Create persistent areas for spells with persist duration > 0
        // Area spells create them immediately, projectile-burst creates after explosion
        // Other spell types (projectile, ray) typically don't have persistent effects
        if (persistDuration > 0 && (spellData.category === 'area' || spellData.category === 'projectile-burst')) {
          const persistentAreaId = `${spellId}-persistent`

          // For projectile-burst, wait for the explosion to complete
          // For area spells, create immediately after initial animation
          setTimeout(() => {
            // For tracking spells, we need to get the final target position
            let finalPosition = updatedSpellData.toPosition

            // If this spell tracks targets, get the current position of the target token
            if (updatedSpellData.trackTarget && updatedSpellData.targetTokenId) {
              const { currentMap } = useMapStore.getState()
              const targetToken = currentMap?.objects.find(obj =>
                obj.id === updatedSpellData.targetTokenId && obj.type === 'token'
              )
              if (targetToken) {
                finalPosition = targetToken.position
              }
            }

            const persistentAreaObject = {
              id: persistentAreaId,
              type: 'persistent-area' as const,
              position: finalPosition,
              rotation: 0,
              layer: 0, // Below tokens to allow token selection
              isSpellEffect: true, // Mark as spell effect for cleanup
              persistentAreaData: {
                position: finalPosition,
                radius: spellData.category === 'projectile-burst' ? (spellData.burstRadius || 40) : (spellData.size || 80),
                color: spellData.persistColor || spellData.color || '#CC2500',
                opacity: spellData.persistOpacity || (spellData.category === 'projectile-burst' ? 0.3 : 0.4),
                spellName: spellData.spellName || 'Unknown Spell',
                roundCreated: event.eventNumber
              },
              roundCreated: event.eventNumber,
              eventCreated: timelineStore.currentEvent,
              // For Fireball and similar spells, persist for 1 round
              // Convert milliseconds to rounds: if persistDuration > 0, use 1 round
              spellDuration: persistDuration > 0 ? 1 : 0,
              durationType: 'events' as const
            }

            addSpellEffect(persistentAreaObject)
          }, animDuration)
        }

        // Mark spell as actively animating
        activeSpellAnimations.current.add(spellId)


        // Create a promise that resolves after the animation completes
        // This ensures sequential execution of spells
        const timeoutId = setTimeout(() => {
          timeoutIdsRef.current.delete(timeoutId) // Remove from tracking once executed
          activeSpellAnimations.current.delete(spellId)

          // For area spells with persistent effects, the AreaSpell component handles the persistence
          // For other spells, remove them if they don't have persistence or aren't area spells
          if (spellData.category === 'area') {
            // Area spells: Remove the initial expanding animation spell object immediately
            // The persistent area (if any) is created by the AreaSpell component
            setTimeout(() => {
              const { deleteObject } = useMapStore.getState()
              deleteObject(spellId)
            }, 100)
          } else if (!spellData.persistDuration || spellData.persistDuration === 0) {
            // Non-area spells without persistence: remove after animation
            setTimeout(() => {
              const { deleteObject } = useMapStore.getState()
              deleteObject(spellId)
            }, 100)
          }

          resolve()
        }, animDuration) // Use animDuration instead of totalDuration for area spells

        timeoutIdsRef.current.add(timeoutId) // Track timeout for cleanup

      } else {
        resolve()
      }
    })
  }, [currentMap, updateObjectPosition, startAnimation, updateProgress, endAnimation, addSpellEffect])

  // Execute all events for a round
  const executeRoundAnimations = useCallback(async (roundNumber: number) => {
    if (!stageRef.current) return

    const { timeline } = useTimelineStore.getState()
    if (!timeline) return

    // Don't clean up persistent areas here - let cleanupExpiredSpells handle it
    // This was incorrectly deleting persistent areas that should still be active

    const currentRoundData = timeline.rounds.find(r => r.number === roundNumber)
    const event = currentRoundData?.events.find(e => e.number === timelineStore.currentEvent)
    if (!event || event.actions.length === 0) {
      return
    }


    // The objects are in the second layer (index 1)
    const layers = stageRef.current.getLayers()
    if (layers.length < 2) {
      return
    }

    // Objects layer is the second layer
    const objectLayer = layers[1]
    if (!objectLayer) {
      return
    }


    // The ObjectsLayer component wraps everything in a Group, so we need to get that first
    const children = objectLayer.getChildren()
    const objectsGroup = children[0] as Konva.Group | undefined

    if (!objectsGroup) {
      return
    }

    // Get the actual container to search in - prefer the group if it has getChildren method
    const searchContainer = objectsGroup && 'getChildren' in objectsGroup ? objectsGroup : objectLayer

    // Sort actions by order
    const sortedActions = [...event.actions].sort((a, b) => (a.order || 0) - (b.order || 0))

    // Execute animations sequentially
    for (const action of sortedActions) {

      // Special handling for spell events - they don't always need a token node
      if (action.type === 'spell' || isSpellEvent(action.data)) {
        // For spell events, we can pass null as tokenNode since spells create their own effects
        await animateEvent(action, null)
        continue
      }

      // Try multiple search strategies
      let tokenNode: Konva.Node | null = null

      // Strategy 1: Direct search in container
      if ('findOne' in searchContainer && typeof searchContainer.findOne === 'function') {
        tokenNode = searchContainer.findOne(`#${action.tokenId}`) as Konva.Node | null
      }

      // Strategy 2: If not found, try searching from the stage level
      if (!tokenNode) {
        tokenNode = stageRef.current.findOne(`#${action.tokenId}`) || null
      }

      // Strategy 3: Manual search through all children
      if (!tokenNode) {
        if ('getChildren' in searchContainer && typeof searchContainer.getChildren === 'function') {
          const children = (searchContainer as Konva.Group | Konva.Layer).getChildren()
          children.forEach((child: Konva.Node) => {
            if (!tokenNode && child.id() === action.tokenId) {
              tokenNode = child
            }
          })
        }
      }

      // Make sure we have the Group node, not a child shape
      if (tokenNode && tokenNode.className !== 'Group') {
        const parent = tokenNode.getParent()
        if (parent && parent.id() === action.tokenId) {
          tokenNode = parent
        }
      }

      if (tokenNode) {
        await animateEvent(action, tokenNode)
      }
    }

    // Mark event as executed (the event containing all these actions)
    useTimelineStore.setState((state: any) => {
      const evt = state.timeline?.events.find((e: any) => e.number === roundNumber)
      if (evt) {
        evt.executed = true
      }
    })
  }, [animateEvent])

  // Stop all running animations and clean up all resources
  const stopAllAnimations = useCallback(() => {
    // Cancel all pending RAF calls
    rafIdsRef.current.forEach(id => {
      cancelAnimationFrame(id)
    })
    rafIdsRef.current.clear()

    // Clear all pending timeouts
    timeoutIdsRef.current.forEach(id => {
      clearTimeout(id)
    })
    timeoutIdsRef.current.clear()

    // Clear active spell animations tracking
    activeSpellAnimations.current.clear()
  }, [])

  // Listen for event changes
  useEffect(() => {
    let previousEvent = useTimelineStore.getState().currentEvent

    const unsubscribe = useTimelineStore.subscribe(
      async (state) => {
        const newEvent = state.currentEvent


        // Check if we moved forward and should execute actions
        if (newEvent > previousEvent && state.isInCombat) {
          // Execute actions for the event we just entered
          // Actions are scheduled FOR a specific event
          // When we advance TO that event, we execute those actions
          await executeRoundAnimations(newEvent)
        }

        previousEvent = newEvent
      }
    )

    return () => {
      unsubscribe()
      // Only stop animations when the hook is actually unmounting, not on every re-render
      // stopAllAnimations() - Removed to prevent canceling animations on re-renders
    }
  }, [executeRoundAnimations]) // Removed stopAllAnimations from deps

  // Clean up animations on unmount
  useEffect(() => {
    return () => {
      stopAllAnimations()
    }
  }, [stopAllAnimations]) // Include stopAllAnimations in deps

  return {
    executeRoundAnimations,
    stopAllAnimations,
    animateEvent
  }
}