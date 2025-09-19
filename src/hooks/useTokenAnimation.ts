import { useEffect, useRef, useCallback } from 'react'
import Konva from 'konva'
import useRoundStore from '@/store/roundStore'
import useMapStore from '@/store/mapStore'
import useAnimationStore from '@/store/animationStore'
import { RoundEvent, isMoveEvent, isAppearEvent, isDisappearEvent, isSpellEvent } from '@/types/timeline'

export function useTokenAnimation(stageRef: React.MutableRefObject<Konva.Stage | null>) {
  const activeSpellAnimations = useRef<Set<string>>(new Set())
  const rafIdsRef = useRef<Set<number>>(new Set())
  const timeoutIdsRef = useRef<Set<NodeJS.Timeout>>(new Set())
  const { currentMap, updateObjectPosition, addSpellEffect } = useMapStore()
  const { startAnimation, updateProgress, endAnimation } = useAnimationStore()

  // Execute animations for a specific event
  const animateEvent = useCallback((event: RoundEvent, tokenNode: Konva.Node | null) => {
    console.log('[Animation] Starting event:', event.type, event.id, { tokenId: event.tokenId })

    if (!stageRef.current) {
      console.log('[Animation] No stage, skipping')
      return Promise.resolve()
    }

    // For spell events, we don't need a tokenNode
    if (isSpellEvent(event.data) && !tokenNode) {
      // This is fine for spell events
    } else if (!tokenNode) {
      return Promise.resolve()
    }

    const { animationSpeed } = useRoundStore.getState()
    // Convert milliseconds to seconds and adjust for speed
    const adjustedDuration = (event.data.duration || 1000) / 1000 / animationSpeed


    return new Promise<void>((resolve) => {
      if (isMoveEvent(event.data)) {
        if (!tokenNode) {
          return resolve()
        }

        const moveData = event.data // Type narrowing for MoveEventData
        const fromPos = moveData.fromPosition
        const toPos = moveData.toPosition


        // Start animation path tracking
        startAnimation(event.tokenId, fromPos, toPos)

        // Ensure the node starts at the correct position
        tokenNode.x(fromPos.x)
        tokenNode.y(fromPos.y)

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
          animDuration = 500 // Area fade-in duration
        }

        const persistDuration = (spellData.persistDuration || 0) * 1000
        const totalDuration = animDuration + persistDuration

        // Add spell effect to the map with animation data
        const spellObject = {
          id: spellId,
          type: 'spell' as const,
          position: actualFromPosition,
          rotation: 0,
          layer: 100, // Spells render above everything
          isSpellEffect: true,
          spellData: updatedSpellData,
          roundCreated: event.roundNumber,
          spellDuration: spellData.persistDuration || 0
        }

        console.log('[Animation] Adding spell:', spellId, {
          category: updatedSpellData.category,
          from: actualFromPosition,
          to: updatedSpellData.toPosition,
          duration: animDuration,
          persistDuration
        })

        addSpellEffect(spellObject)

        // Mark spell as actively animating
        activeSpellAnimations.current.add(spellId)

        console.log('[Animation] Spell will resolve in:', totalDuration, 'ms')

        // Create a promise that resolves after the animation completes
        // This ensures sequential execution of spells
        const timeoutId = setTimeout(() => {
          console.log('[Animation] Spell complete:', spellId)
          timeoutIdsRef.current.delete(timeoutId) // Remove from tracking once executed
          activeSpellAnimations.current.delete(spellId)

          // If it's not a persistent spell, remove it after a small delay
          // This gives the animation time to complete visually
          if (!spellData.persistDuration || spellData.persistDuration === 0) {
            setTimeout(() => {
              const { deleteObject } = useMapStore.getState()
              deleteObject(spellId)
              console.log('[Animation] Removed spell object:', spellId)
            }, 100)
          }

          resolve()
        }, totalDuration)

        timeoutIdsRef.current.add(timeoutId) // Track timeout for cleanup

      } else {
        resolve()
      }
    })
  }, [currentMap, updateObjectPosition, startAnimation, updateProgress, endAnimation, addSpellEffect])

  // Execute all events for a round
  const executeRoundAnimations = useCallback(async (roundNumber: number) => {
    if (!stageRef.current) return

    const { timeline } = useRoundStore.getState()
    if (!timeline) return

    const round = timeline.rounds.find(r => r.number === roundNumber)
    if (!round || round.events.length === 0) {
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

    // Sort events by order
    const sortedEvents = [...round.events].sort((a, b) => (a.order || 0) - (b.order || 0))

    console.log('[Animation] Executing round', roundNumber, 'with', sortedEvents.length, 'events')

    // Execute animations sequentially
    for (const event of sortedEvents) {
      console.log('[Animation] Processing event:', event.type, 'order:', event.order || 0)

      // Special handling for spell events - they don't always need a token node
      if (event.type === 'spell' || (event.data && isSpellEvent(event.data))) {
        // For spell events, we can pass null as tokenNode since spells create their own effects
        await animateEvent(event, null)
        continue
      }

      // Try multiple search strategies
      let tokenNode: Konva.Node | null = null

      // Strategy 1: Direct search in container
      if ('findOne' in searchContainer && typeof searchContainer.findOne === 'function') {
        tokenNode = searchContainer.findOne(`#${event.tokenId}`) as Konva.Node | null
      }

      // Strategy 2: If not found, try searching from the stage level
      if (!tokenNode) {
        tokenNode = stageRef.current.findOne(`#${event.tokenId}`) || null
      }

      // Strategy 3: Manual search through all children
      if (!tokenNode) {
        if ('getChildren' in searchContainer && typeof searchContainer.getChildren === 'function') {
          const children = (searchContainer as Konva.Group | Konva.Layer).getChildren()
          children.forEach((child: Konva.Node) => {
            if (!tokenNode && child.id() === event.tokenId) {
              tokenNode = child
            }
          })
        }
      }

      // Make sure we have the Group node, not a child shape
      if (tokenNode && tokenNode.className !== 'Group') {
        const parent = tokenNode.getParent()
        if (parent && parent.id() === event.tokenId) {
          tokenNode = parent
        }
      }

      if (tokenNode) {
        console.log('[Animation] Found token node for:', event.tokenId)
        await animateEvent(event, tokenNode)
      } else if (event.type !== 'spell') {
        console.log('[Animation] WARNING: No token node found for non-spell event:', event.tokenId)
      }
    }

    console.log('[Animation] Round', roundNumber, 'complete')

    // Mark round as executed
    const { updateEvent } = useRoundStore.getState()
    round.events.forEach(event => {
      updateEvent(event.id, { executed: true })
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

  // Listen for round changes
  useEffect(() => {
    let previousRound = useRoundStore.getState().currentRound

    const unsubscribe = useRoundStore.subscribe(
      async (state) => {
        const newRound = state.currentRound


        // Check if we moved forward and should execute events
        if (newRound > previousRound && state.isInCombat) {
          // Execute events for the round we just entered
          // Events are scheduled FOR a specific round
          // When we advance TO that round, we execute those events
          await executeRoundAnimations(newRound)
        } else {
        }

        previousRound = newRound
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