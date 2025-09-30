import { useEffect, useRef, useState } from 'react'
import useMapStore, { migrateTokenLabels } from '@/store/mapStore'
import { useDebouncedCallback } from 'use-debounce'

const AUTOSAVE_KEY = 'mapmaker_autosave'
const AUTOSAVE_DELAY = 2000 // 2 seconds debounce

export const useAutoSave = () => {
  const { currentMap, loadMap } = useMapStore()
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const isFirstLoad = useRef(true)

  // Debounced save function
  const debouncedSave = useDebouncedCallback(
    async () => {
      if (!currentMap) return

      setIsSaving(true)
      try {
        const saveData = {
          map: currentMap,
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        }

        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(saveData))
        setLastSaved(new Date())

        // Optional: Save to multiple slots for history
        const historyKey = `${AUTOSAVE_KEY}_${Date.now()}`
        const allSaves = Object.keys(localStorage)
          .filter(key => key.startsWith(`${AUTOSAVE_KEY}_`))
          .sort()

        // Keep only last 5 autosaves
        if (allSaves.length >= 5) {
          localStorage.removeItem(allSaves[0])
        }
        localStorage.setItem(historyKey, JSON.stringify(saveData))

      } catch (error) {
        console.error('Failed to autosave:', error)
      } finally {
        setIsSaving(false)
      }
    },
    AUTOSAVE_DELAY
  )

  // Load saved map on mount
  useEffect(() => {
    if (!isFirstLoad.current) return
    isFirstLoad.current = false

    try {
      const saved = localStorage.getItem(AUTOSAVE_KEY)
      if (saved) {
        const { map, timestamp } = JSON.parse(saved)
        if (map && !currentMap) {
          loadMap(map)
          setLastSaved(new Date(timestamp))
          // Run migration after map is loaded
          setTimeout(() => migrateTokenLabels(), 100)
        }
      }
    } catch (error) {
      console.error('Failed to load autosaved map:', error)
    }
  }, [])

  // Save whenever map changes
  useEffect(() => {
    if (!currentMap || isFirstLoad.current) return
    void debouncedSave()
  }, [currentMap, debouncedSave])

  // Save before unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentMap && !isSaving) {
        const saveData = {
          map: currentMap,
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        }
        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(saveData))
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [currentMap, isSaving])

  const manualSave = () => {
    void debouncedSave.flush()
  }

  const clearAutoSave = () => {
    localStorage.removeItem(AUTOSAVE_KEY)
    // Clear all autosave history
    Object.keys(localStorage)
      .filter(key => key.startsWith(`${AUTOSAVE_KEY}_`))
      .forEach(key => localStorage.removeItem(key))
    setLastSaved(null)
  }

  const getAutoSaveList = () => {
    const saves: Array<{ timestamp: Date, key: string }> = []

    Object.keys(localStorage)
      .filter(key => key.startsWith(AUTOSAVE_KEY))
      .forEach(key => {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}')
          if (data.timestamp) {
            saves.push({
              timestamp: new Date(data.timestamp),
              key
            })
          }
        } catch {}
      })

    return saves.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  return {
    lastSaved,
    isSaving,
    manualSave,
    clearAutoSave,
    getAutoSaveList
  }
}