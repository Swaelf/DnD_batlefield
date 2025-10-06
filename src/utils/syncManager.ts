/**
 * SyncManager - Cross-tab synchronization using BroadcastChannel API
 *
 * Enables real-time synchronization between main DM interface and viewer mode.
 * Main tab broadcasts state changes, viewer tab receives and applies them.
 */

import type { BattleMap } from '@/types/map'

export type SyncMessageType =
  | 'MAP_STATE_UPDATE'      // Full map state changed
  | 'OBJECT_ADDED'          // Single object added
  | 'OBJECT_UPDATED'        // Single object updated (deprecated - use BATCH_UPDATE)
  | 'BATCH_UPDATE'          // Batched object updates (performance optimized)
  | 'OBJECT_REMOVED'        // Single object removed
  | 'ANIMATION_START'       // Animation initiated (spell, attack, movement)
  | 'TIMELINE_EVENT'        // Combat round/event changed
  | 'CAMERA_SYNC'           // Camera position/zoom changed
  | 'VIEWER_COMMAND'        // Control command for viewer
  | 'HEARTBEAT'             // Keep-alive ping
  | 'SYNC_REQUEST'          // Viewer requests initial state
  | 'SYNC_RESPONSE'         // Main responds with current state

export interface SyncMessage {
  type: SyncMessageType
  timestamp: number
  payload: any
  sourceTab: 'main' | 'viewer'
}

export interface AnimationSyncData {
  animationType: 'spell' | 'attack' | 'movement'
  data: any
  tokenId?: string
}

export interface CameraSyncData {
  x: number
  y: number
  scale: number
}

class SyncManager {
  private channel: BroadcastChannel | null = null
  private isMain: boolean
  private listeners: Map<SyncMessageType, Set<(payload: any) => void>> = new Map()
  private heartbeatInterval: number | null = null
  private batchQueue: Map<string, any> = new Map() // objectId -> updates
  private batchTimeout: number | null = null
  private readonly BATCH_DELAY = 16 // ~60fps batching

  constructor(mode: 'main' | 'viewer') {
    this.isMain = mode === 'main'
    this.initChannel()
  }

  private initChannel() {
    // Check if BroadcastChannel is supported
    if (typeof BroadcastChannel === 'undefined') {
      console.warn('[SyncManager] BroadcastChannel not supported in this browser')
      return
    }

    try {
      this.channel = new BroadcastChannel('mapmaker-sync')
      this.setupMessageHandler()

      if (this.isMain) {
        this.startHeartbeat()
      }

      console.log(`[SyncManager] Initialized in ${this.isMain ? 'MAIN' : 'VIEWER'} mode`)
    } catch (error) {
      console.error('[SyncManager] Failed to create BroadcastChannel:', error)
    }
  }

  private setupMessageHandler() {
    if (!this.channel) return

    this.channel.onmessage = (event: MessageEvent<SyncMessage>) => {
      const message = event.data

      // Main tab handles sync requests, viewer handles responses
      if (this.isMain && message.type === 'SYNC_REQUEST') {
        this.handleSyncRequest()
        return
      }

      // Main tab ignores other messages (only broadcasts)
      if (this.isMain) return

      // Viewer tab processes messages
      console.log(`[SyncManager] Received ${message.type}:`, message.payload)

      const listeners = this.listeners.get(message.type)
      if (listeners) {
        listeners.forEach(callback => {
          try {
            callback(message.payload)
          } catch (error) {
            console.error(`[SyncManager] Error in listener for ${message.type}:`, error)
          }
        })
      }
    }
  }

  private startHeartbeat() {
    // Send heartbeat every 5 seconds to detect main tab presence
    this.heartbeatInterval = window.setInterval(() => {
      this.broadcast('HEARTBEAT', { timestamp: Date.now() })
    }, 5000)
  }

  /**
   * Broadcast a message to all viewer tabs
   * Only works in main mode
   */
  private broadcast(type: SyncMessageType, payload: any) {
    if (!this.isMain) {
      console.warn('[SyncManager] Only main tab can broadcast')
      return
    }

    if (!this.channel) {
      console.warn('[SyncManager] BroadcastChannel not available')
      return
    }

    const message: SyncMessage = {
      type,
      timestamp: Date.now(),
      payload,
      sourceTab: 'main'
    }

    try {
      this.channel.postMessage(message)
      console.log(`[SyncManager] Broadcasted ${type}`)
    } catch (error) {
      console.error(`[SyncManager] Failed to broadcast ${type}:`, error)
    }
  }

  /**
   * Subscribe to a specific message type
   * Only works in viewer mode
   */
  on(type: SyncMessageType, callback: (payload: any) => void) {
    if (this.isMain) {
      console.warn('[SyncManager] Main tab should not listen to messages')
      return () => {}
    }

    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set())
    }

    this.listeners.get(type)!.add(callback)

    // Return unsubscribe function
    return () => {
      this.listeners.get(type)?.delete(callback)
    }
  }

  // ===== PUBLIC API FOR MAIN TAB =====

  /**
   * Broadcast full map state update
   */
  broadcastMapUpdate(map: BattleMap | null) {
    this.broadcast('MAP_STATE_UPDATE', { map })
  }

  /**
   * Broadcast single object added
   */
  broadcastObjectAdded(object: any) {
    this.broadcast('OBJECT_ADDED', { object })
  }

  /**
   * Broadcast single object updated (batched for performance)
   */
  broadcastObjectUpdated(objectId: string, updates: any) {
    // Add to batch queue
    const existing = this.batchQueue.get(objectId) || {}
    this.batchQueue.set(objectId, { ...existing, ...updates })

    // Schedule batch processing
    if (this.batchTimeout === null) {
      this.batchTimeout = window.setTimeout(() => {
        this.flushBatchQueue()
      }, this.BATCH_DELAY)
    }
  }

  /**
   * Flush batched updates
   */
  private flushBatchQueue() {
    if (this.batchQueue.size === 0) {
      this.batchTimeout = null
      return
    }

    // Send all batched updates at once
    const updates: Array<{ objectId: string; updates: any }> = []
    this.batchQueue.forEach((objectUpdates, objectId) => {
      updates.push({ objectId, updates: objectUpdates })
    })

    this.broadcast('BATCH_UPDATE', { updates })

    // Clear queue and timeout
    this.batchQueue.clear()
    this.batchTimeout = null
  }

  /**
   * Broadcast single object removed
   */
  broadcastObjectRemoved(objectId: string) {
    this.broadcast('OBJECT_REMOVED', { objectId })
  }

  /**
   * Broadcast animation start
   */
  broadcastAnimation(data: AnimationSyncData) {
    this.broadcast('ANIMATION_START', data)
  }

  /**
   * Broadcast timeline event
   */
  broadcastTimelineEvent(eventType: string, data: any) {
    this.broadcast('TIMELINE_EVENT', { eventType, data })
  }

  /**
   * Broadcast camera sync
   */
  broadcastCameraSync(camera: CameraSyncData) {
    this.broadcast('CAMERA_SYNC', camera)
  }

  /**
   * Send command to viewer
   */
  sendViewerCommand(command: string, data?: any) {
    this.broadcast('VIEWER_COMMAND', { command, data })
  }

  /**
   * Request initial sync (viewer only)
   */
  requestSync() {
    if (this.isMain) {
      console.warn('[SyncManager] Main tab cannot request sync')
      return
    }

    if (!this.channel) {
      console.warn('[SyncManager] BroadcastChannel not available')
      return
    }

    console.log('[SyncManager] Requesting initial sync...')
    const message: SyncMessage = {
      type: 'SYNC_REQUEST',
      timestamp: Date.now(),
      payload: {},
      sourceTab: 'viewer'
    }

    this.channel.postMessage(message)
  }

  /**
   * Handle sync request from viewer (main only)
   */
  private handleSyncRequest() {
    console.log('[SyncManager] Received sync request, sending current state...')

    // Import mapStore dynamically to avoid circular dependencies
    import('@/store/mapStore').then((module) => {
      const currentMap = module.default.getState().currentMap
      this.broadcast('SYNC_RESPONSE', { map: currentMap })
    }).catch((error) => {
      console.error('[SyncManager] Failed to get map state:', error)
    })
  }

  /**
   * Cleanup and close channel
   */
  destroy() {
    // Flush any pending batches
    if (this.batchTimeout !== null) {
      clearTimeout(this.batchTimeout)
      this.flushBatchQueue()
    }

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }

    if (this.channel) {
      this.channel.close()
      this.channel = null
    }

    this.listeners.clear()
    this.batchQueue.clear()
    console.log('[SyncManager] Destroyed')
  }
}

// Singleton instances
let mainSyncManager: SyncManager | null = null
let viewerSyncManager: SyncManager | null = null

/**
 * Get or create SyncManager instance
 */
export function getSyncManager(mode: 'main' | 'viewer'): SyncManager {
  if (mode === 'main') {
    if (!mainSyncManager) {
      mainSyncManager = new SyncManager('main')
    }
    return mainSyncManager
  } else {
    if (!viewerSyncManager) {
      viewerSyncManager = new SyncManager('viewer')
    }
    return viewerSyncManager
  }
}

/**
 * Destroy SyncManager instance
 */
export function destroySyncManager(mode: 'main' | 'viewer') {
  if (mode === 'main' && mainSyncManager) {
    mainSyncManager.destroy()
    mainSyncManager = null
  } else if (mode === 'viewer' && viewerSyncManager) {
    viewerSyncManager.destroy()
    viewerSyncManager = null
  }
}

export default SyncManager
