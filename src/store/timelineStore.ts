import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { TimelineStore } from '../types'
import type { TimelineAction, Position } from '../types'
import useMapStore from './mapStore'
import useEventCreationStore from './eventCreationStore'
import useBattleLogStore from './battleLogStore'

const useTimelineStore = create<TimelineStore>()(
  immer((set, get) => ({
    timeline: null,
    currentRound: 1,
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
        state.currentRound = 1
        state.currentEvent = 1

      if (!state.timeline) {
        state.timeline = {
          id: crypto.randomUUID(),
          mapId,
          currentRound: 1,
          currentEvent: 1,
          rounds: [{
            id: crypto.randomUUID(),
            number: 1,
            name: 'Round 1',
            events: [{
              id: crypto.randomUUID(),
              roundNumber: 1,
              number: 1,
              timestamp: Date.now(),
              actions: [],
              executed: false
            }],
            allActions: [],
            executed: false,
            timestamp: Date.now()
          }],
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
          // Move all completed rounds to history
          state.timeline.history.push(...state.timeline.rounds.filter(r => r.executed))
          state.timeline.rounds = state.timeline.rounds.filter(r => !r.executed)
        }
      })
    },

    nextEvent: async () => {
      const { timeline, currentRound, currentEvent } = get()
      if (!timeline || !timeline.isActive) return

      // Clean up any lingering event creation state before advancing
      const eventCreationStore = useEventCreationStore.getState()
      if (eventCreationStore.isCreatingEvent || eventCreationStore.isPicking) {
        eventCreationStore.cancelEventCreation()
      }

      // Get current round data
      const round = timeline.rounds.find(r => r.number === currentRound)
      if (!round) return

      // Check if the current event exists and needs execution
      const currentEventData = round.events.find(e => e.number === currentEvent)

      // Only execute if the event has actions and is not marked as executed
      // This allows re-execution after previousEvent() marks it as not executed
      if (currentEventData && currentEventData.actions.length > 0 && !currentEventData.executed) {
        // Execute actions for current event before advancing
        await get().executeEventActions(currentEvent)
      }

      // Create snapshot before moving to next event
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
          const currentRoundData = state.timeline!.rounds.find(r => r.number === currentRound)
          if (!currentRoundData) return

          const nextEventNumber = currentEvent + 1
          let nextEvent = currentRoundData.events.find(e => e.number === nextEventNumber)
          if (!nextEvent) {
            nextEvent = {
              id: crypto.randomUUID(),
              roundNumber: currentRound,
              number: nextEventNumber,
              timestamp: Date.now(),
              actions: [],
              executed: false
            }
            currentRoundData.events.push(nextEvent)
          }
          nextEvent.snapshot = snapshot
        })
      }

      // Then increment the event
      const nextEventNumber = currentEvent + 1
      set((state) => {
        state.currentEvent = nextEventNumber
        state.timeline!.currentEvent = nextEventNumber
      })

      // Clean up expired spell effects and status effects when advancing events
      const { currentRound: newRound, currentEvent: newEvent } = get()
      useMapStore.getState().cleanupExpiredSpells(newRound, newEvent)
      useMapStore.getState().cleanupExpiredStatusEffects(newRound)
    },

    previousEvent: () => {
      const { timeline, currentRound, currentEvent } = get()
      if (!timeline || currentEvent <= 1) return

      // Clean up any lingering event creation state before navigating
      const eventCreationStore = useEventCreationStore.getState()
      if (eventCreationStore.isCreatingEvent || eventCreationStore.isPicking) {
        eventCreationStore.cancelEventCreation()
      }

      // Get current round
      const round = timeline.rounds.find(r => r.number === currentRound)
      if (!round) return

      // Calculate previous event number
      const previousEventNumber = currentEvent - 1

      // Get the snapshot from the PREVIOUS event (the one we're navigating TO)
      const previousEventData = round.events.find(e => e.number === previousEventNumber)
      const snapshot = previousEventData?.snapshot

      set((state) => {
        state.currentEvent = previousEventNumber
        if (state.timeline) {
          state.timeline.currentEvent = previousEventNumber
        }

        // Mark the previous event's actions as not executed so they can be re-executed
        const currentRoundData = state.timeline!.rounds.find(r => r.number === currentRound)
        if (!currentRoundData) return

        const previousEventIndex = currentRoundData.events.findIndex(e => e.number === previousEventNumber)
        if (previousEventIndex !== -1) {
          currentRoundData.events[previousEventIndex].actions.forEach(action => {
            action.executed = false
          })
          currentRoundData.events[previousEventIndex].executed = false
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

          console.log(`⏮️ Returned to Event ${previousEventNumber}: Restored ${Object.keys(snapshot.tokenPositions).length} token positions, removed ${spellEffectsToRemove.length} spell effects`)
        }
      }

      // Clean up spell effects and status effects when navigating to previous event
      const { currentRound: newRound, currentEvent: newEvent } = get()
      useMapStore.getState().cleanupExpiredSpells(newRound, newEvent)
      useMapStore.getState().cleanupExpiredStatusEffects(newRound)
    },

    goToEvent: (eventNumber) => {
      const { currentRound } = get()

      // Clean up any lingering event creation state before jumping
      const eventCreationStore = useEventCreationStore.getState()
      if (eventCreationStore.isCreatingEvent || eventCreationStore.isPicking) {
        eventCreationStore.cancelEventCreation()
      }

      set((state) => {
        state.currentEvent = eventNumber
        if (state.timeline) {
          state.timeline.currentEvent = eventNumber

          // Ensure the event exists in the current round
          const currentRoundData = state.timeline.rounds.find(r => r.number === currentRound)
          if (!currentRoundData) return

          const eventExists = currentRoundData.events.find(e => e.number === eventNumber)
          if (!eventExists) {
            currentRoundData.events.push({
              id: crypto.randomUUID(),
              roundNumber: currentRound,
              number: eventNumber,
              timestamp: Date.now(),
              actions: [],
              executed: false
            })
            // Sort events by number
            currentRoundData.events.sort((a, b) => a.number - b.number)
          }
        }
      })

      // Clean up spell effects and status effects when jumping to a specific event
      const { currentRound: newRound } = get()
      useMapStore.getState().cleanupExpiredSpells(newRound, eventNumber)
      useMapStore.getState().cleanupExpiredStatusEffects(newRound)
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

      const currentRound = state.currentRound
      const targetEvent = eventNumber || state.currentEvent

      // Find current round
      const roundData = state.timeline.rounds.find(r => r.number === currentRound)
      if (!roundData) return

      let event = roundData.events.find(e => e.number === targetEvent)

      if (!event) {
        // Create the event if it doesn't exist
        event = {
          id: crypto.randomUUID(),
          roundNumber: currentRound,
          number: targetEvent,
          timestamp: Date.now(),
          actions: [],
          executed: false
        }
        roundData.events.push(event)
        roundData.events.sort((a, b) => a.number - b.number)
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

      const eventIndex = roundData.events.findIndex(e => e.number === targetEvent)
      if (eventIndex !== -1) {
        roundData.events[eventIndex].actions.push(newAction)
      }
    }),

    updateAction: (actionId, updates) => set((state) => {
      if (!state.timeline) return

      for (const round of state.timeline.rounds) {
        for (const event of round.events) {
          const actionIndex = event.actions.findIndex(a => a.id === actionId)
          if (actionIndex !== -1) {
            Object.assign(event.actions[actionIndex], updates)
            return
          }
        }
      }
    }),

    removeAction: (actionId) => set((state) => {
      if (!state.timeline) return

      for (const round of state.timeline.rounds) {
        for (const event of round.events) {
          const actionIndex = event.actions.findIndex(a => a.id === actionId)
          if (actionIndex !== -1) {
            event.actions.splice(actionIndex, 1)
            return
          }
        }
      }
    }),

    executeEventActions: async (eventNumber) => {
      const { timeline, currentRound } = get()
      if (!timeline) return

      const round = timeline.rounds.find(r => r.number === currentRound)
      if (!round) return

      const event = round.events.find(e => e.number === eventNumber)
      if (!event || event.executed) return

      // Save snapshot before executing event (for undo/navigation)
      if (!event.snapshot) {
        const mapStore = (await import('./mapStore')).default.getState()
        const tokenPositions: Record<string, Position> = {}
        const spellEffects: string[] = []

        mapStore.currentMap?.objects.forEach(obj => {
          if (obj.type === 'token') {
            tokenPositions[obj.id] = { ...obj.position }
          }
          if (obj.isSpellEffect) {
            spellEffects.push(obj.id)
          }
        })

        set((state) => {
          const roundData = state.timeline?.rounds.find(r => r.number === currentRound)
          if (!roundData) return

          const eventToUpdate = roundData.events.find(e => e.number === eventNumber)
          if (eventToUpdate) {
            eventToUpdate.snapshot = { tokenPositions, spellEffects }
          }
        })
      }

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

              // ✅ FIX: Get actual current positions of caster and target tokens
              // This ensures spells use the token's current position after any previous movements
              let actualFromPosition = spellData.fromPosition
              let actualToPosition = spellData.toPosition

              console.log('🔮 Spell execution - original positions:', {
                from: spellData.fromPosition,
                to: spellData.toPosition,
                tokenId: spellData.tokenId,
                targetTokenId: spellData.targetTokenId
              })

              // Look up caster token's current position
              if (spellData.tokenId) {
                const casterToken = mapStore.currentMap?.objects.find(obj => obj.id === spellData.tokenId)
                if (casterToken) {
                  actualFromPosition = casterToken.position
                  console.log(`✅ Caster token ${spellData.tokenId} current position:`, casterToken.position)
                } else {
                  console.warn(`⚠️ Caster token ${spellData.tokenId} not found!`)
                }
              }

              // Look up target token's current position (if targeting a token)
              if (spellData.targetTokenId) {
                const targetToken = mapStore.currentMap?.objects.find(obj => obj.id === spellData.targetTokenId)
                if (targetToken) {
                  actualToPosition = targetToken.position
                  console.log(`✅ Target token ${spellData.targetTokenId} current position:`, targetToken.position)
                } else {
                  console.warn(`⚠️ Target token ${spellData.targetTokenId} not found!`)
                }
              }

              console.log('🎯 Spell will use positions:', {
                from: actualFromPosition,
                to: actualToPosition
              })

              // Create spell with actual current positions
              const updatedSpellData = {
                ...spellData,
                fromPosition: actualFromPosition,
                toPosition: actualToPosition
              }

              const spellObject = {
                id: `spell-${Date.now()}-${Math.random()}`,
                type: 'spell' as const,
                position: actualToPosition || actualFromPosition || { x: 0, y: 0 }, // Use target position for persistent effects
                rotation: 0,
                layer: 10,
                isSpellEffect: true,
                roundCreated: get().currentRound,
                eventCreated: get().currentEvent,
                spellDuration: updatedSpellData.persistDuration || 0, // Use persistDuration, not animation duration
                durationType: updatedSpellData.durationType || 'rounds', // Respect spell's durationType
                spellData: updatedSpellData
              }
              mapStore.addSpellEffect(spellObject)

              // Add battle log entry
              const casterToken = spellData.tokenId ? mapStore.currentMap?.objects.find(obj => obj.id === spellData.tokenId) : null
              useBattleLogStore.getState().addEntry({
                roundNumber: get().currentRound,
                eventNumber: eventNumber,
                type: 'spell',
                tokenId: spellData.tokenId,
                tokenName: casterToken?.name || 'Unknown',
                message: `Cast ${spellData.spellName || 'spell'}`,
                severity: 'normal',
                details: {
                  spell: spellData.spellName,
                  target: updatedSpellData.targetTokenId ? 'Token' : 'Position'
                }
              })

              // Wait for spell animation duration
              setTimeout(resolve, updatedSpellData.duration || 1000)
              break
            }
            case 'attack': {
              const attackData = action.data as any

              // ✅ FIX: Get actual current positions of attacker and target tokens
              let actualFromPosition = attackData.fromPosition
              let actualToPosition = attackData.toPosition

              // Look up attacker token's current position
              if (action.tokenId) {
                const attackerToken = mapStore.currentMap?.objects.find(obj => obj.id === action.tokenId)
                if (attackerToken) {
                  actualFromPosition = attackerToken.position
                }
              }

              // Look up target token's current position (if targeting a token)
              if (attackData.targetTokenId) {
                const targetToken = mapStore.currentMap?.objects.find(obj => obj.id === attackData.targetTokenId)
                if (targetToken) {
                  actualToPosition = targetToken.position
                }
              }

              // Create attack with actual current positions
              const updatedAttackData = {
                ...attackData,
                fromPosition: actualFromPosition,
                toPosition: actualToPosition
              }

              mapStore.addAttackEffect(updatedAttackData)

              // Add battle log entry
              const attackerToken = action.tokenId ? mapStore.currentMap?.objects.find(obj => obj.id === action.tokenId) : null
              const targetToken = attackData.targetTokenId ? mapStore.currentMap?.objects.find(obj => obj.id === attackData.targetTokenId) : null
              useBattleLogStore.getState().addEntry({
                roundNumber: get().currentRound,
                eventNumber: eventNumber,
                type: 'action',
                tokenId: action.tokenId,
                tokenName: attackerToken?.name || 'Unknown',
                message: `${attackData.weaponName || 'Attack'} ${targetToken ? `on ${targetToken.name}` : 'at position'}`,
                severity: 'normal',
                details: {
                  attack: attackData.weaponName,
                  target: targetToken?.name || 'Position'
                }
              })

              // Wait for attack animation duration
              setTimeout(resolve, updatedAttackData.duration || 1000)
              break
            }
            case 'move': {
              // Handle token movement animation
              const moveData = action.data as any

              // ✅ FIX: Get token's actual current position for chain movements
              // This ensures movements chain correctly: initial → point1 → point2
              let actualFromPosition = moveData.fromPosition
              const actualToPosition = moveData.toPosition

              if (action.tokenId) {
                const movingToken = mapStore.currentMap?.objects.find(obj => obj.id === action.tokenId)
                if (movingToken) {
                  // Use token's current position as the starting point
                  actualFromPosition = movingToken.position
                  console.log(`🏃 Token ${action.tokenId} moving from current position:`, movingToken.position, 'to:', actualToPosition)
                }
              }

              if (actualFromPosition && actualToPosition) {
                // Start smooth animation using animationStore
                const animationStoreModule = await import('./animationStore')
                const animationStore = animationStoreModule.default.getState()
                animationStore.startAnimation(action.tokenId, actualFromPosition, actualToPosition)

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

                  // Calculate current position using actual positions
                  const currentX = actualFromPosition.x + (actualToPosition.x - actualFromPosition.x) * progress
                  const currentY = actualFromPosition.y + (actualToPosition.y - actualFromPosition.y) * progress

                  // Update token position in map
                  mapStore.updateObjectPosition(action.tokenId, { x: currentX, y: currentY })

                  if (progress < 1) {
                    requestAnimationFrame(animate)
                  } else {
                    // Animation complete
                    animationStore.endAnimation(action.tokenId)

                    // Add battle log entry after movement completes
                    const movedToken = mapStore.currentMap?.objects.find(obj => obj.id === action.tokenId)
                    useBattleLogStore.getState().addEntry({
                      roundNumber: get().currentRound,
                      eventNumber: eventNumber,
                      type: 'movement',
                      tokenId: action.tokenId,
                      tokenName: movedToken?.name || 'Unknown',
                      message: `Moved to new position`,
                      severity: 'low',
                      details: {
                        from: actualFromPosition,
                        to: actualToPosition
                      }
                    })

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
        const roundData = state.timeline!.rounds.find(r => r.number === currentRound)
        if (!roundData) return

        const eventIndex = roundData.events.findIndex(e => e.number === eventNumber)
        if (eventIndex !== -1) {
          // Mark each action as executed
          roundData.events[eventIndex].actions.forEach(action => {
            action.executed = true
          })
          roundData.events[eventIndex].executed = true
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

    // Round Management
    startNewRound: () => {
      const { timeline, currentRound: activeRound, currentEvent: activeEvent } = get()
      if (!timeline) return

      // First, execute the current event's actions (like nextEvent does)
      void get().executeEventActions(activeEvent)

      set((state) => {
        const currentRoundData = state.timeline!.rounds.find(r => r.number === activeRound)
        if (currentRoundData) {
          // Mark all events in this round as executed
          currentRoundData.events.forEach(event => {
            event.executed = true
          })

          // Mark round as executed (ended)
          currentRoundData.executed = true

          // Keep all events and actions intact - no merging, no clearing
          // This preserves the full event structure for historical review
        }

        // Create new round
        const newRoundNumber = activeRound + 1
        const newRound = {
          id: crypto.randomUUID(),
          number: newRoundNumber,
          name: `Round ${newRoundNumber}`,
          events: [{
            id: crypto.randomUUID(),
            roundNumber: newRoundNumber,
            number: 1,
            timestamp: Date.now(),
            actions: [],
            executed: false
          }],
          allActions: [],
          executed: false,
          timestamp: Date.now()
        }

        state.timeline!.rounds.push(newRound)
        state.currentRound = newRoundNumber
        state.currentEvent = 1
        state.timeline!.currentRound = newRoundNumber
        state.timeline!.currentEvent = 1
      })

      // Remove EXPIRED post effects (durationType='events') from previous round
      const mapStore = useMapStore.getState()
      const currentEvent = get().currentEvent // Get current event count

      if (mapStore.currentMap) {
        const expiredEffects = mapStore.currentMap.objects.filter(obj => {
          if (!obj.isSpellEffect || obj.durationType !== 'events') return false

          // Check if effect has expired based on event count
          if (obj.eventCreated !== undefined && obj.spellDuration !== undefined) {
            const expiresAtEvent = obj.eventCreated + obj.spellDuration
            return currentEvent >= expiresAtEvent // Remove if current event >= expiration
          }

          return false // Keep if no duration info
        })

        expiredEffects.forEach(effect => {
          mapStore.deleteObject(effect.id)
        })
        console.log(`🧹 Removed ${expiredEffects.length} expired post effects from Round ${activeRound}`)
      }

      // Add battle log entry for round ending
      useBattleLogStore.getState().addEntry({
        roundNumber: activeRound,
        eventNumber: activeEvent,
        type: 'round',
        message: `Round ${activeRound} ended`,
        severity: 'high'
      })

      // Clean up expired spells and status effects based on rounds
      const state = get()
      useMapStore.getState().cleanupExpiredSpells(state.currentRound, state.currentEvent)
      useMapStore.getState().cleanupExpiredStatusEffects(state.currentRound)
    },

    nextRound: async () => {
      const { timeline, currentRound } = get()
      if (!timeline) return

      // Check if next round exists
      const nextRoundData = timeline.rounds.find(r => r.number === currentRound + 1)
      if (!nextRoundData) {
        console.warn('Cannot go to next round: round does not exist')
        return
      }

      // Check if current round is executed
      const currentRoundData = timeline.rounds.find(r => r.number === currentRound)
      if (!currentRoundData || !currentRoundData.executed) {
        console.warn('Cannot go to next round: current round not ended yet')
        return
      }

      const nextRoundNumber = currentRound + 1

      // Check if CURRENT round (the one we're leaving) has unexecuted events
      // If so, replay them before moving to next round
      const currentRoundHasUnexecutedEvents = currentRoundData.events.some(event => !event.executed && event.actions.length > 0)

      if (currentRoundHasUnexecutedEvents) {
        // Get all events sorted by number
        const sortedEvents = [...currentRoundData.events].sort((a, b) => a.number - b.number)

        // Execute each event in sequence
        for (const event of sortedEvents) {
          if (event.actions.length > 0) {
            await get().executeEventActions(event.number)

            // Small delay between events for visual clarity
            await new Promise(resolve => setTimeout(resolve, 200))

            // Update current event number as we progress
            set((state) => {
              state.currentEvent = event.number
              if (state.timeline) {
                state.timeline.currentEvent = event.number
              }
            })
          }
        }
      }

      // Navigate to next round
      set((state) => {
        state.currentRound = nextRoundNumber
        state.currentEvent = 1
        if (state.timeline) {
          state.timeline.currentRound = nextRoundNumber
          state.timeline.currentEvent = 1
        }
      })

      // Get the first event of the next round and restore its snapshot if it exists
      const firstEvent = nextRoundData.events.find(e => e.number === 1)
      const snapshot = firstEvent?.snapshot

      if (snapshot) {
        const mapStore = useMapStore.getState()

        // Restore token positions from when this event was first created
        Object.entries(snapshot.tokenPositions).forEach(([tokenId, position]) => {
          mapStore.updateObjectPosition(tokenId, position)
        })

        // Restore spell effects - remove any created after, restore any from snapshot
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
    },

    previousRound: () => {
      const { timeline, currentRound } = get()
      if (currentRound <= 1 || !timeline) return

      const previousRoundNumber = currentRound - 1

      // Get the previous round data
      const previousRoundData = timeline.rounds.find(r => r.number === previousRoundNumber)
      if (!previousRoundData) return

      const firstEvent = previousRoundData.events.find(e => e.number === 1)
      const snapshot = firstEvent?.snapshot

      // Navigate to previous round AND mark all events in the PREVIOUS ROUND as not executed
      // so they can be replayed when we navigate forward
      set((state) => {
        // Mark all events in the PREVIOUS ROUND (the one we're going TO) as not executed
        // so they can be replayed when we navigate forward again
        const roundWeAreGoingTo = state.timeline?.rounds.find(r => r.number === previousRoundNumber)
        if (roundWeAreGoingTo) {
          roundWeAreGoingTo.events.forEach(event => {
            event.executed = false
            event.actions.forEach(action => {
              action.executed = false
            })
          })
        }

        // Navigate to previous round
        state.currentRound = previousRoundNumber
        state.currentEvent = 1
        if (state.timeline) {
          state.timeline.currentRound = previousRoundNumber
          state.timeline.currentEvent = 1
        }
      })

      // Restore token positions and spell effects from snapshot
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

          console.log(`🔙 Restored Round ${previousRoundNumber}: ${Object.keys(snapshot.tokenPositions).length} tokens, removed ${spellEffectsToRemove.length} spell effects`)
        }
      }
    },

    goToRound: (roundNumber) => {
      set((state) => {
        state.currentRound = roundNumber
        state.currentEvent = 1
        if (state.timeline) {
          state.timeline.currentRound = roundNumber
          state.timeline.currentEvent = 1
        }
      })
    },

    replayRound: async (roundNumber) => {
      const { timeline } = get()
      if (!timeline) return

      const round = timeline.rounds.find(r => r.number === roundNumber)
      if (!round || !round.allActions || round.allActions.length === 0) return

      // Execute all actions in sequence
      for (const action of round.allActions) {
        await get().executeEventActions(action.eventNumber)
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    },

    setAnimationSpeed: (speed) => set((state) => {
      state.animationSpeed = Math.max(0.1, Math.min(5, speed))
    }),

    clearTimeline: () => set((state) => {
      state.timeline = null
      state.currentEvent = 1
      state.isInCombat = false
    }),

    // Helper function to check if current round is editable (not a historical round)
    isCurrentRoundEditable: () => {
      const { timeline, currentRound } = get()
      if (!timeline) return false

      const round = timeline.rounds.find(r => r.number === currentRound)
      if (!round) return false

      // A round is editable if it's not executed (not ended yet)
      return !round.executed
    }
  }))
)

export default useTimelineStore