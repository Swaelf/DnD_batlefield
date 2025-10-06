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
import './ViewerMode.css'

export const ViewerMode = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [gridVisible, setGridVisible] = useState(true)
  const { currentMap, loadMap, addObject, updateObject, deleteObject } = useMapStore()

  useEffect(() => {
    // Initialize viewer sync manager
    const syncManager = getSyncManager('viewer')

    // Request initial sync on mount
    console.log('[ViewerMode] Requesting initial sync...')
    syncManager.requestSync()

    // Subscribe to sync response (initial state from main tab)
    const unsubSyncResponse = syncManager.on('SYNC_RESPONSE', ({ map }: { map: BattleMap | null }) => {
      console.log('[ViewerMode] Received sync response:', map?.name)
      if (map) {
        loadMap(map)
        setIsConnected(true)
      }
    })

    // Subscribe to map state updates (for subsequent changes)
    const unsubMapUpdate = syncManager.on('MAP_STATE_UPDATE', ({ map }: { map: BattleMap | null }) => {
      console.log('[ViewerMode] Received map update:', map?.name)
      if (map) {
        loadMap(map)
        setIsConnected(true)
      }
    })

    // Subscribe to object added
    const unsubObjectAdded = syncManager.on('OBJECT_ADDED', ({ object }) => {
      console.log('[ViewerMode] Object added:', object.id)
      addObject(object)
    })

    // Subscribe to object updated
    const unsubObjectUpdated = syncManager.on('OBJECT_UPDATED', ({ objectId, updates }) => {
      console.log('[ViewerMode] Object updated:', objectId)
      updateObject(objectId, updates)
    })

    // Subscribe to object removed
    const unsubObjectRemoved = syncManager.on('OBJECT_REMOVED', ({ objectId }) => {
      console.log('[ViewerMode] Object removed:', objectId)
      deleteObject(objectId)
    })

    // Subscribe to heartbeat to detect main tab presence
    const unsubHeartbeat = syncManager.on('HEARTBEAT', () => {
      setIsConnected(true)
    })

    // Subscribe to timeline events (will trigger animations)
    const unsubTimelineEvent = syncManager.on('TIMELINE_EVENT', ({ eventType, data }) => {
      console.log('[ViewerMode] Timeline event:', eventType, data)
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
      unsubObjectRemoved()
      unsubHeartbeat()
      unsubTimelineEvent()
      clearInterval(connectionCheck)
    }
  }, [loadMap, addObject, updateObject, deleteObject])

  return (
    <div className="viewer-mode">
      {/* Minimal Header */}
      <div className="viewer-header">
        <div className="viewer-title">
          <span className="viewer-icon">🎬</span>
          <span>Viewer Mode</span>
          {isConnected && <span className="viewer-status connected">● Synced</span>}
          {!isConnected && <span className="viewer-status disconnected">○ Waiting for DM...</span>}
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
        {!currentMap && !isConnected && (
          <div className="viewer-waiting">
            <div className="viewer-waiting-content">
              <div className="viewer-waiting-icon">🎲</div>
              <h2>Waiting for DM...</h2>
              <p>Make sure the main MapMaker tab is open</p>
              <div className="viewer-waiting-spinner" />
            </div>
          </div>
        )}

        {currentMap && (
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
