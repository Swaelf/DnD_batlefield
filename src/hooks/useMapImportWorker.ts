/**
 * useMapImportWorker Hook
 * Handles heavy map import processing using Web Workers
 */

import { useCallback, useState } from 'react'
import { useWebWorker } from './useWebWorker'
import type { BattleMap, MapObject } from '@/types'
import type { ImportWorkerMessage, ImportWorkerResponse } from '@/workers/mapImportWorker'

interface ImportProgress {
  stage: string
  progress: number
  message: string
}

export function useMapImportWorker() {
  const [progress, setProgress] = useState<ImportProgress | null>(null)

  const { postMessage, isLoading, error, isReady } = useWebWorker<ImportWorkerMessage, ImportWorkerResponse>(
    '/src/workers/mapImportWorker.ts',
    {
      onProgress: setProgress,
      onError: (error) => console.error('Map import worker error:', error),
      timeout: 30000 // 30 second timeout
    }
  )

  const processMap = useCallback(async (data: any, format: string): Promise<BattleMap> => {
    if (!isReady) {
      throw new Error('Worker not ready')
    }

    setProgress({ stage: 'starting', progress: 0, message: 'Starting import...' })

    const result = await postMessage<BattleMap>({
      type: 'PROCESS_MAP',
      payload: { data, format }
    })

    setProgress(null)
    return result
  }, [isReady, postMessage])

  const convertObjects = useCallback(async (objects: any[], sourceFormat: string): Promise<MapObject[]> => {
    if (!isReady) {
      throw new Error('Worker not ready')
    }

    setProgress({ stage: 'converting', progress: 50, message: 'Converting objects...' })

    const result = await postMessage<MapObject[]>({
      type: 'CONVERT_OBJECTS',
      payload: { objects, sourceFormat }
    })

    setProgress(null)
    return result
  }, [isReady, postMessage])

  const scaleMap = useCallback(async (
    map: BattleMap,
    targetWidth: number,
    targetHeight: number
  ): Promise<BattleMap> => {
    if (!isReady) {
      throw new Error('Worker not ready')
    }

    setProgress({ stage: 'scaling', progress: 75, message: 'Scaling map...' })

    const result = await postMessage<BattleMap>({
      type: 'SCALE_MAP',
      payload: { map, targetWidth, targetHeight }
    })

    setProgress(null)
    return result
  }, [isReady, postMessage])

  return {
    processMap,
    convertObjects,
    scaleMap,
    progress,
    isLoading,
    error,
    isReady
  }
}