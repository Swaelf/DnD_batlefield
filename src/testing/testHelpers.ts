/**
 * Test Helpers for Visual Test Scenarios
 *
 * Provides reusable helper functions for test scenarios to ensure
 * consistency and proper state management across all tests.
 */

import type { MapObject } from '@/types/map'

/**
 * Advances to the next round in the timeline
 * Ends the current round and creates a new one
 * Uses round counter (not event counter)
 */
export async function moveToNextRound() {
  const timelineStore = (await import('@/store/timelineStore')).default.getState()
  await timelineStore.startNewRound()
}

/**
 * Advances to the next event in the current round
 * Uses event counter within the current round
 */
export async function moveToNextEvent() {
  const timelineStore = (await import('@/store/timelineStore')).default.getState()
  await timelineStore.nextEvent()
}

/**
 * Gets the current round number
 */
export async function getCurrentRound(): Promise<number> {
  const timelineStore = (await import('@/store/timelineStore')).default.getState()
  return timelineStore.currentRound
}

/**
 * Gets the current event count
 */
export async function getCurrentEventCount(): Promise<number> {
  const timelineStore = (await import('@/store/timelineStore')).default.getState()
  return timelineStore.timeline?.rounds[timelineStore.currentRound - 1]?.events.length || 0
}

/**
 * Checks if a persistent area spell exists on the map
 * @param spellName - Name of the spell to find (e.g., 'Darkness', 'Wall of Fire')
 */
export async function hasPersistentAreaSpell(spellName: string): Promise<boolean> {
  const mapStore = (await import('@/store/mapStore')).default.getState()
  const allObjects = mapStore.currentMap?.objects || []

  const persistentAreas = allObjects.filter(obj =>
    obj.type === 'persistent-area' &&
    (obj as any).persistentAreaData?.spellName === spellName
  )

  return persistentAreas.length > 0
}

/**
 * Counts how many persistent area spells exist on the map
 * @param spellName - Name of the spell to count (e.g., 'Darkness', 'Wall of Fire')
 */
export async function countPersistentAreaSpells(spellName: string): Promise<number> {
  const mapStore = (await import('@/store/mapStore')).default.getState()
  const persistentAreas = mapStore.currentMap?.objects.filter(obj =>
    obj.type === 'persistent-area' &&
    (obj as any).persistentAreaData?.spellName === spellName
  ) || []
  return persistentAreas.length
}

/**
 * Gets all objects of a specific type from the map
 * @param objectType - Type of object to retrieve
 */
export async function getObjectsByType(objectType: MapObject['type']): Promise<MapObject[]> {
  const mapStore = (await import('@/store/mapStore')).default.getState()
  return mapStore.currentMap?.objects.filter(obj => obj.type === objectType) || []
}

/**
 * Checks if a token exists on the map
 * @param tokenId - ID of the token to find
 */
export async function hasToken(tokenId: string): Promise<boolean> {
  const mapStore = (await import('@/store/mapStore')).default.getState()
  const token = mapStore.currentMap?.objects.find(obj =>
    obj.type === 'token' && obj.id === tokenId
  )
  return token !== undefined
}

/**
 * Gets the total number of objects on the map
 */
export async function getObjectCount(): Promise<number> {
  const mapStore = (await import('@/store/mapStore')).default.getState()
  return mapStore.currentMap?.objects.length || 0
}

/**
 * Starts combat mode
 */
export async function startCombat() {
  const timelineStore = (await import('@/store/timelineStore')).default.getState()
  const mapStore = (await import('@/store/mapStore')).default.getState()
  if (mapStore.currentMap) {
    timelineStore.startCombat(mapStore.currentMap.id)
  }
}

/**
 * Ends combat mode
 */
export async function endCombat() {
  const timelineStore = (await import('@/store/timelineStore')).default.getState()
  timelineStore.endCombat()
}

/**
 * Waits for a specific duration
 * @param ms - Milliseconds to wait
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Logs debug information about the current test state
 * @param label - Label for the log message
 */
export async function logTestState(label: string) {
  const timelineStore = (await import('@/store/timelineStore')).default.getState()
  const mapStore = (await import('@/store/mapStore')).default.getState()

  console.log(`[TEST STATE: ${label}]`, {
    round: timelineStore.currentRound,
    eventCount: timelineStore.timeline?.rounds[timelineStore.currentRound - 1]?.events.length || 0,
    objectCount: mapStore.currentMap?.objects.length || 0,
    inCombat: timelineStore.isInCombat
  })
}
