/**
 * ViewerMode - Clean viewer interface for screen sharing
 *
 * Minimal UI showing only map canvas and navigation controls.
 * Synchronized with main DM interface via BroadcastChannel.
 */

import { useEffect, useState } from 'react'
import { MapCanvas } from '../Canvas/MapCanvas'
import { getSyncManager } from '@/utils/syncManager'
import useMapStore from '@/store/mapStore'
import type { BattleMap } from '@/types/map'
import { logger } from '@/utils/logger'
import './ViewerMode.css'

export const ViewerMode = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [gridVisible, setGridVisible] = useState(() => {
    const saved = localStorage.getItem('viewerMode.gridVisible')
    return saved !== null ? JSON.parse(saved) : true
  })
  const [isEnabled, setIsEnabled] = useState(() => {
    const saved = localStorage.getItem('viewerMode.isEnabled')
    return saved !== null ? JSON.parse(saved) : true
  })
  const { currentMap, loadMap, addObject, updateObject, deleteObject } = useMapStore()

  // Persist settings to localStorage
  useEffect(() => {
    localStorage.setItem('viewerMode.gridVisible', JSON.stringify(gridVisible))
  }, [gridVisible])

  useEffect(() => {
    localStorage.setItem('viewerMode.isEnabled', JSON.stringify(isEnabled))
  }, [isEnabled])

  useEffect(() => {
    // Don't initialize sync if viewer mode is disabled
    if (!isEnabled) {
      return
    }

    // Initialize viewer sync manager
    const syncManager = getSyncManager('viewer')

    // Request initial sync on mount
    logger.debug('sync', 'ViewerMode: Requesting initial sync...')
    syncManager.requestSync()

    // Subscribe to sync response (initial state from main tab)
    const unsubSyncResponse = syncManager.on('SYNC_RESPONSE', ({ map }: { map: BattleMap | null }) => {
      logger.debug('sync', 'ViewerMode: Received sync response', map?.name)
      if (map) {
        loadMap(map)
        setIsConnected(true)
      }
    })

    // Subscribe to map state updates (for subsequent changes)
    const unsubMapUpdate = syncManager.on('MAP_STATE_UPDATE', ({ map }: { map: BattleMap | null }) => {
      logger.debug('sync', 'ViewerMode: Received map update', map?.name)
      if (map) {
        loadMap(map)
        setIsConnected(true)
      }
    })

    // Subscribe to object added
    const unsubObjectAdded = syncManager.on('OBJECT_ADDED', ({ object }) => {
      logger.debug('sync', 'ViewerMode: Object added', object.id)
      addObject(object)
    })

    // Subscribe to object updated (legacy single updates)
    const unsubObjectUpdated = syncManager.on('OBJECT_UPDATED', ({ objectId, updates }) => {
      logger.debug('sync', 'ViewerMode: Object updated', objectId)
      updateObject(objectId, updates)
    })

    // Subscribe to batched updates (performance optimized)
    const unsubBatchUpdate = syncManager.on('BATCH_UPDATE', ({ updates }: { updates: Array<{ objectId: string; updates: any }> }) => {
      logger.debug('sync', 'ViewerMode: Batch update', `${updates.length} objects`)
      // Process all updates in a single RAF for smooth rendering
      requestAnimationFrame(() => {
        updates.forEach(({ objectId, updates }) => {
          updateObject(objectId, updates)
        })
      })
    })

    // Subscribe to object removed
    const unsubObjectRemoved = syncManager.on('OBJECT_REMOVED', ({ objectId }) => {
      logger.debug('sync', 'ViewerMode: Object removed', objectId)
      deleteObject(objectId)
    })

    // Subscribe to heartbeat to detect main tab presence
    const unsubHeartbeat = syncManager.on('HEARTBEAT', () => {
      setIsConnected(true)
    })

    // Subscribe to timeline events (will trigger animations)
    const unsubTimelineEvent = syncManager.on('TIMELINE_EVENT', ({ eventType, data }) => {
      logger.debug('sync', 'ViewerMode: Timeline event', eventType, data)
      // Timeline events will automatically trigger animations via existing mapStore integration
    })

    // Check connection status periodically
    const connectionCheck = setInterval(() => {
      // If no heartbeat received in 10 seconds, mark as disconnected
      // This is handled by setting connected to true on heartbeat
    }, 10000)

    return () => {
      unsubSyncResponse()
      unsubMapUpdate()
      unsubObjectAdded()
      unsubObjectUpdated()
      unsubBatchUpdate()
      unsubObjectRemoved()
      unsubHeartbeat()
      unsubTimelineEvent()
      clearInterval(connectionCheck)
    }
  }, [isEnabled, loadMap, addObject, updateObject, deleteObject])

  return (
    <div className="viewer-mode">
      {/* Minimal Header */}
      <div className="viewer-header">
        <div className="viewer-title">
          <span className="viewer-icon">🎬</span>
          <span>Viewer Mode</span>
          {!isEnabled && <span className="viewer-status disconnected">○ Disabled</span>}
          {isEnabled && isConnected && <span className="viewer-status connected">● Synced</span>}
          {isEnabled && !isConnected && <span className="viewer-status disconnected">○ Waiting for DM...</span>}
        </div>

        <button
          className="viewer-settings-btn"
          onClick={() => setShowSettings(!showSettings)}
          title="Settings"
        >
          ⚙️
        </button>
      </div>

      {/* Settings Dropdown */}
      {showSettings && (
        <div className="viewer-settings-dropdown">
          <div className="viewer-setting-item">
            <label>
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={(e) => setIsEnabled(e.target.checked)}
              />
              Enable Viewer Mode
            </label>
          </div>
          <div className="viewer-setting-divider" />
          <div className="viewer-setting-item">
            <label>
              <input
                type="checkbox"
                checked={gridVisible}
                onChange={(e) => setGridVisible(e.target.checked)}
              />
              Show Grid
            </label>
          </div>
          <div className="viewer-setting-divider" />
          <button
            className="viewer-setting-button"
            onClick={() => window.location.reload()}
          >
            🔄 Refresh Viewer
          </button>
          <button
            className="viewer-setting-button danger"
            onClick={() => window.close()}
          >
            ✕ Close Viewer
          </button>
        </div>
      )}

      {/* Main Canvas */}
      <div className="viewer-canvas-container">
        {!isEnabled && (
          <div className="viewer-waiting">
            <div className="viewer-waiting-content">
              <div className="viewer-waiting-icon">⏸️</div>
              <h2>Viewer Mode Disabled</h2>
              <p>Enable viewer mode in settings to sync with DM</p>
            </div>
          </div>
        )}

        {isEnabled && !currentMap && !isConnected && (
          <div className="viewer-waiting">
            <div className="viewer-waiting-content">
              <div className="viewer-waiting-icon">🎲</div>
              <h2>Waiting for DM...</h2>
              <p>Make sure the main MapMaker tab is open</p>
              <div className="viewer-waiting-spinner" />
            </div>
          </div>
        )}

        {isEnabled && currentMap && (
          <MapCanvas
            width={window.innerWidth}
            height={window.innerHeight - 50} // Account for header
            gridVisible={gridVisible}
            isViewerMode={true}
          />
        )}
      </div>

      {/* Minimal Footer with Navigation Hint */}
      <div className="viewer-footer">
        <span className="viewer-hint">
          🖱️ Pan: Drag canvas | 🔍 Zoom: Mouse wheel
        </span>
      </div>
    </div>
  )
}
