import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { TimelineStore } from '../types'
import type { TimelineAction } from '../types'
import useMapStore from './mapStore'
import useEventCreationStore from './eventCreationStore'

const useTimelineStore = create<TimelineStore>()(
  immer((set, get) => ({
    timeline: null,
    currentEvent: 1,
    isInCombat: false,
    animationSpeed: 1,

    startCombat: (mapId) => {
      // Clean up any event creation state when starting combat
      const eventCreationStore = useEventCreationStore.getState()
      if (eventCreationStore.isCreatingEvent || eventCreationStore.isPicking) {
        eventCreationStore.cancelEventCreation()
      }

      set((state) => {
        state.isInCombat = true
        state.currentEvent = 1

      if (!state.timeline) {
        state.timeline = {
          id: crypto.randomUUID(),
          mapId,
          events: [{
            id: crypto.randomUUID(),
            number: 1,
            timestamp: Date.now(),
            actions: [],
            executed: false
          }],
          currentEvent: 1,
          isActive: true,
          history: []
        }
      } else {
        state.timeline.isActive = true
      }
    })
    },

    endCombat: () => {
      // Clean up any event creation state when ending combat
      const eventCreationStore = useEventCreationStore.getState()
      if (eventCreationStore.isCreatingEvent || eventCreationStore.isPicking) {
        eventCreationStore.cancelEventCreation()
      }

      set((state) => {
        state.isInCombat = false
        if (state.timeline) {
          state.timeline.isActive = false
          // Move all events to history
          state.timeline.history.push(...state.timeline.events)
          state.timeline.events = []
        }
      })
    },

    nextEvent: async () => {
      const { timeline, currentEvent } = get()
      if (!timeline || !timeline.isActive) return

      // Clean up any lingering event creation state before advancing
      const eventCreationStore = useEventCreationStore.getState()
      if (eventCreationStore.isCreatingEvent || eventCreationStore.isPicking) {
        eventCreationStore.cancelEventCreation()
      }

      // Create snapshot before executing actions
      const mapStore = useMapStore.getState()
      const currentMap = mapStore.currentMap
      if (currentMap) {
        const snapshot = {
          tokenPositions: {} as Record<string, { x: number; y: number }>,
          spellEffects: [] as string[]
        }

        // Save all token positions
        currentMap.objects.forEach(obj => {
          if (obj.type === 'token') {
            snapshot.tokenPositions[obj.id] = { ...obj.position }
          } else if (obj.isSpellEffect) {
            snapshot.spellEffects.push(obj.id)
          }
        })

        // Store snapshot in the next event for undo
        set((state) => {
          const nextEventNumber = currentEvent + 1
          let nextEvent = state.timeline!.events.find(e => e.number === nextEventNumber)
          if (!nextEvent) {
            nextEvent = {
              id: crypto.randomUUID(),
              number: nextEventNumber,
              timestamp: Date.now(),
              actions: [],
              executed: false
            }
            state.timeline!.events.push(nextEvent)
          }
          nextEvent.snapshot = snapshot
        })
      }

      // Execute actions for current event before advancing
      await get().executeEventActions(currentEvent)

      // Then increment the event
      const nextEventNumber = currentEvent + 1
      set((state) => {
        state.currentEvent = nextEventNumber
        state.timeline!.currentEvent = nextEventNumber
      })

      // Clean up expired spell effects when advancing events
      const newEvent = get().currentEvent
      useMapStore.getState().cleanupExpiredSpells(newEvent)
    },

    previousEvent: () => {
      const { timeline, currentEvent } = get()
      if (!timeline || currentEvent <= 1) return

      // Clean up any lingering event creation state before navigating
      const eventCreationStore = useEventCreationStore.getState()
      if (eventCreationStore.isCreatingEvent || eventCreationStore.isPicking) {
        eventCreationStore.cancelEventCreation()
      }

      // Get the snapshot from the current event (which was stored before execution)
      const currentEventData = timeline.events.find(e => e.number === currentEvent)
      const snapshot = currentEventData?.snapshot

      set((state) => {
        state.currentEvent -= 1
        if (state.timeline) {
          state.timeline.currentEvent = state.currentEvent
        }

        // Mark the previous event's actions as not executed so they can be re-executed
        const previousEventIndex = state.timeline!.events.findIndex(e => e.number === state.currentEvent)
        if (previousEventIndex !== -1) {
          state.timeline!.events[previousEventIndex].actions.forEach(action => {
            action.executed = false
          })
          state.timeline!.events[previousEventIndex].executed = false
        }
      })

      // Restore snapshot if available
      if (snapshot) {
        const mapStore = useMapStore.getState()

        // Restore token positions
        Object.entries(snapshot.tokenPositions).forEach(([tokenId, position]) => {
          mapStore.updateObjectPosition(tokenId, position)
        })

        // Remove spell effects that were created after this snapshot
        const currentMap = mapStore.currentMap
        if (currentMap) {
          const spellEffectsToRemove = currentMap.objects
            .filter(obj => obj.isSpellEffect && !snapshot.spellEffects.includes(obj.id))
            .map(obj => obj.id)

          spellEffectsToRemove.forEach(id => {
            mapStore.deleteObject(id)
          })
        }
      }

      // Clean up spell effects when navigating to previous event
      const newEvent = get().currentEvent
      useMapStore.getState().cleanupExpiredSpells(newEvent)
    },

    goToEvent: (eventNumber) => {
      // Clean up any lingering event creation state before jumping
      const eventCreationStore = useEventCreationStore.getState()
      if (eventCreationStore.isCreatingEvent || eventCreationStore.isPicking) {
        eventCreationStore.cancelEventCreation()
      }

      set((state) => {
        state.currentEvent = eventNumber
        if (state.timeline) {
          state.timeline.currentEvent = eventNumber

          // Ensure the event exists
          const eventExists = state.timeline.events.find(e => e.number === eventNumber)
          if (!eventExists) {
            state.timeline.events.push({
              id: crypto.randomUUID(),
              number: eventNumber,
              timestamp: Date.now(),
              actions: [],
              executed: false
            })
            // Sort events by number
            state.timeline.events.sort((a, b) => a.number - b.number)
          }
        }
      })

      // Clean up spell effects when jumping to a specific event
      useMapStore.getState().cleanupExpiredSpells(eventNumber)
    },

    addAction: (tokenId, type, data, eventNumber) => set((state) => {
      if (!state.timeline) return

      // Validate event type against token's allowedEvents
      const token = useMapStore.getState().currentMap?.objects.find(obj => obj.id === tokenId)
      if (token && token.type === 'token' && 'allowedEvents' in token) {
        const allowedEvents = (token as any).allowedEvents as string[] | undefined
        if (allowedEvents && !allowedEvents.includes(type)) {
          console.warn(`Event type '${type}' not allowed for token '${tokenId}' (${(token as any).name}). Allowed: ${allowedEvents.join(', ')}`)
          return
        }
      }

      const targetEvent = eventNumber || state.currentEvent
      let event = state.timeline.events.find(e => e.number === targetEvent)

      if (!event) {
        // Create the event if it doesn't exist
        event = {
          id: crypto.randomUUID(),
          number: targetEvent,
          timestamp: Date.now(),
          actions: [],
          executed: false
        }
        state.timeline.events.push(event)
        state.timeline.events.sort((a, b) => a.number - b.number)
      }

      const newAction: TimelineAction = {
        id: crypto.randomUUID(),
        eventNumber: targetEvent,
        tokenId,
        type,
        data,
        executed: false,
        order: event.actions.length
      }

      const eventIndex = state.timeline.events.findIndex(e => e.number === targetEvent)
      if (eventIndex !== -1) {
        state.timeline.events[eventIndex].actions.push(newAction)
      }
    }),

    updateAction: (actionId, updates) => set((state) => {
      if (!state.timeline) return

      for (const event of state.timeline.events) {
        const actionIndex = event.actions.findIndex(a => a.id === actionId)
        if (actionIndex !== -1) {
          Object.assign(event.actions[actionIndex], updates)
          break
        }
      }
    }),

    removeAction: (actionId) => set((state) => {
      if (!state.timeline) return

      for (const event of state.timeline.events) {
        const actionIndex = event.actions.findIndex(a => a.id === actionId)
        if (actionIndex !== -1) {
          event.actions.splice(actionIndex, 1)
          break
        }
      }
    }),

    executeEventActions: async (eventNumber) => {
      const { timeline } = get()
      if (!timeline) return

      const event = timeline.events.find(e => e.number === eventNumber)
      if (!event || event.executed) return

      // Execute each action sequentially, waiting for each animation to complete
      for (const action of event.actions) {
        // Get mapStore methods - we'll need to import this properly
        const mapStore = (await import('./mapStore')).default.getState()

        // Create a promise for each action that resolves when animation completes
        await new Promise<void>((resolve) => {
          const executeActionAsync = async () => {
            switch (action.type) {
            case 'spell': {
              // Create proper SpellMapObject for spell
              const spellData = action.data as any
              const spellObject = {
                id: `spell-${Date.now()}-${Math.random()}`,
                type: 'spell' as const,
                position: spellData.toPosition || spellData.fromPosition || { x: 0, y: 0 }, // Use target position for persistent effects
                rotation: 0,
                layer: 10,
                isSpellEffect: true,
                roundCreated: get().currentEvent,
                spellDuration: spellData.duration || 1,
                spellData: spellData
              }
              mapStore.addSpellEffect(spellObject)
              // Wait for spell animation duration
              setTimeout(resolve, spellData.duration || 1000)
              break
            }
            case 'attack': {
              mapStore.addAttackEffect(action.data as any)
              const attackData = action.data as any
              // Wait for attack animation duration
              setTimeout(resolve, attackData.duration || 1000)
              break
            }
            case 'move': {
              // Handle token movement animation
              const moveData = action.data as any
              if (moveData.fromPosition && moveData.toPosition) {
                // Start smooth animation using animationStore
                const animationStoreModule = await import('./animationStore')
                const animationStore = animationStoreModule.default.getState()
                animationStore.startAnimation(action.tokenId, moveData.fromPosition, moveData.toPosition)

                // Create animation loop
                const duration = moveData.duration || 1000 // Default 1 second
                const startTime = Date.now()

                const animate = () => {
                  // Check if animations are paused
                  if (animationStore.isPaused) {
                    requestAnimationFrame(animate)
                    return
                  }

                  const elapsed = Date.now() - startTime
                  const progress = Math.min(elapsed / duration, 1)

                  // Update animation progress
                  animationStore.updateProgress(action.tokenId, progress)

                  // Calculate current position
                  const currentX = moveData.fromPosition.x + (moveData.toPosition.x - moveData.fromPosition.x) * progress
                  const currentY = moveData.fromPosition.y + (moveData.toPosition.y - moveData.fromPosition.y) * progress

                  // Update token position in map
                  mapStore.updateObjectPosition(action.tokenId, { x: currentX, y: currentY })

                  if (progress < 1) {
                    requestAnimationFrame(animate)
                  } else {
                    // Animation complete
                    animationStore.endAnimation(action.tokenId)
                    resolve() // Resolve the promise when animation is done
                  }
                }

                requestAnimationFrame(animate)
              } else {
                resolve() // No animation needed
              }
              break
            }
            default:
              // For other action types, resolve immediately
              resolve()
              break
            }
          }

          executeActionAsync().catch(error => {
            console.error('Action execution failed:', error)
            resolve() // Continue with next action even if one fails
          })
        })
      }

      // Mark actions as being executed
      set((state) => {
        const eventIndex = state.timeline!.events.findIndex(e => e.number === eventNumber)
        if (eventIndex !== -1) {
          // Mark each action as executed
          state.timeline!.events[eventIndex].actions.forEach(action => {
            action.executed = true
          })
          state.timeline!.events[eventIndex].executed = true
        }
      })

      // All animations are handled within the action execution promises above
      // No additional setTimeout needed as animations resolve their own promises
    },

    previewAction: (/* action */) => {
      // This will trigger a preview animation
      // Implementation will be in the Canvas component
      // TODO: Implement action preview functionality
    },

    setAnimationSpeed: (speed) => set((state) => {
      state.animationSpeed = Math.max(0.1, Math.min(5, speed))
    }),

    clearTimeline: () => set((state) => {
      state.timeline = null
      state.currentEvent = 1
      state.isInCombat = false
    })
  }))
)

export default useTimelineStore