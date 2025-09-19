import { useEffect, useRef, useCallback } from 'react'
import Konva from 'konva'
import useRoundStore from '@/store/roundStore'
import useMapStore from '@/store/mapStore'
import useAnimationStore from '@/store/animationStore'
import { RoundEvent, isMoveEvent, isAppearEvent, isDisappearEvent, isSpellEvent } from '@/types/timeline'

export function useTokenAnimation(stageRef: React.MutableRefObject<Konva.Stage | null>) {
  const animationsRef = useRef<Map<string, Konva.Tween>>(new Map())
  const activeSpellAnimations = useRef<Set<string>>(new Set())
  const { currentMap, updateObjectPosition, addSpellEffect } = useMapStore()
  const { startAnimation, updateProgress, endAnimation } = useAnimationStore()

  // Execute animations for a specific event
  const animateEvent = useCallback((event: RoundEvent, tokenNode: Konva.Node | null) => {
    if (!stageRef.current) {
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
        // Get current actual position from the node
        const currentX = tokenNode.x()
        const currentY = tokenNode.y()
        const fromPos = { x: currentX, y: currentY }
        const toPos = event.data.toPosition
        const moveData = event.data // Type narrowing for MoveEventData

        // Start animation path tracking
        startAnimation(event.tokenId, fromPos, toPos)

        // Ensure the node starts at the correct position
        tokenNode.x(fromPos.x)
        tokenNode.y(fromPos.y)

        // Force initial draw
        tokenNode.getLayer()?.batchDraw()

        // Move animation - use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
          const tween = new Konva.Tween({
            node: tokenNode,
            duration: adjustedDuration,
            x: toPos.x,
            y: toPos.y,
            easing: moveData.easing === 'linear' ? Konva.Easings.Linear : Konva.Easings.EaseInOut,
          onUpdate: () => {
            // Calculate progress
            const currentX = tokenNode.x()
            const currentY = tokenNode.y()
            const totalDistX = toPos.x - fromPos.x
            const totalDistY = toPos.y - fromPos.y
            const progressX = totalDistX !== 0 ? (currentX - fromPos.x) / totalDistX : 1
            const progressY = totalDistY !== 0 ? (currentY - fromPos.y) / totalDistY : 1
            const progress = (progressX + progressY) / 2

            // Update animation progress
            updateProgress(event.tokenId, Math.min(1, Math.max(0, progress)))

            // Force layer redraw during animation
            tokenNode.getLayer()?.batchDraw()
          },
          onFinish: () => {

            // Force the node to the final position first
            tokenNode.x(toPos.x)
            tokenNode.y(toPos.y)

            // Then update the position in the store
            updateObjectPosition(event.tokenId, toPos)

            // End animation path tracking
            endAnimation(event.tokenId)

            // Force layer redraw
            const layer = tokenNode.getLayer()
            if (layer) {
              layer.batchDraw()
              // Also trigger stage redraw
              const stage = layer.getStage()
              if (stage) {
                stage.batchDraw()
              }
            }

            animationsRef.current.delete(event.id)
            resolve()
          }
          })

          animationsRef.current.set(event.id, tween)
          tween.play()
        })

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
          const tween = new Konva.Tween({
            node: tokenNode,
            duration: adjustedDuration,
            opacity: token.opacity || 1,
            easing: Konva.Easings.EaseIn,
            onFinish: () => {
              animationsRef.current.delete(event.id)
              resolve()
            }
          })

          animationsRef.current.set(event.id, tween)
          tween.play()
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
          const tween = new Konva.Tween({
            node: tokenNode,
            duration: adjustedDuration,
            opacity: 0,
            easing: Konva.Easings.EaseOut,
            onFinish: () => {
              // Optionally remove the token from the map
              // deleteObject(event.tokenId)
              animationsRef.current.delete(event.id)
              resolve()
            }
          })

          animationsRef.current.set(event.id, tween)
          tween.play()
        } else {
          tokenNode.opacity(0)
          // deleteObject(event.tokenId)
          resolve()
        }
      } else if (isSpellEvent(event.data)) {
        // Spell animation
        const spellData = event.data // Type narrowing for SpellEventData

        // Create a unique ID for the spell effect
        const spellId = `spell-${event.id}-${Date.now()}`

        // Add spell effect to the map with animation data
        const spellObject = {
          id: spellId,
          type: 'spell' as const,
          position: spellData.fromPosition,
          rotation: 0,
          layer: 100, // Spells render above everything
          isSpellEffect: true,
          spellData: spellData,
          roundCreated: event.roundNumber,
          spellDuration: spellData.persistDuration || 0
        }

        addSpellEffect(spellObject)

        // Mark spell as actively animating
        activeSpellAnimations.current.add(spellId)

        // Set up cleanup after animation duration
        // event.data.duration is already in milliseconds
        const animDuration = spellData.duration || 1500
        const persistDuration = (spellData.persistDuration || 0) * 1000
        const totalDuration = animDuration + persistDuration


        setTimeout(() => {
          activeSpellAnimations.current.delete(spellId)

          // If it's not a persistent spell, remove it immediately
          if (!spellData.persistDuration || spellData.persistDuration === 0) {
            const { deleteObject } = useMapStore.getState()
            deleteObject(spellId)
          }

          resolve()
        }, totalDuration)

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

    // Execute animations sequentially
    for (const event of sortedEvents) {

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
        await animateEvent(event, tokenNode)
      } else {

        // Debug: List all available IDs at different levels
        const allIds: string[] = []

        // List direct children IDs
        if ('getChildren' in searchContainer && typeof searchContainer.getChildren === 'function') {
          const children = (searchContainer as Konva.Group | Konva.Layer).getChildren()
          children.forEach((child: Konva.Node) => {
            if (child.id()) {
              allIds.push(child.id())
            }
          })
        }

        // Also try to get all nodes with IDs from the stage
        const allNodesWithIds = stageRef.current.find((node: Konva.Node) => {
          return node.id() !== undefined && node.id() !== ''
        })

        if (allNodesWithIds.length > 0) {
        }
      }
    }

    // Mark round as executed
    const { updateEvent } = useRoundStore.getState()
    round.events.forEach(event => {
      updateEvent(event.id, { executed: true })
    })
  }, [animateEvent])

  // Stop all running animations
  const stopAllAnimations = useCallback(() => {
    animationsRef.current.forEach(tween => {
      tween.destroy()
    })
    animationsRef.current.clear()
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
          // Events scheduled in round 1 are for "round 2" (next round)
          // So when we enter round 2, we execute round 2's events
          await executeRoundAnimations(newRound)
        } else {
        }

        previousRound = newRound
      }
    )

    return () => {
      unsubscribe()
      stopAllAnimations()
    }
  }, [executeRoundAnimations, stopAllAnimations])

  return {
    executeRoundAnimations,
    stopAllAnimations,
    animateEvent
  }
}