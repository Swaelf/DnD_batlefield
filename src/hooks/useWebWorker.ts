/**
 * useWebWorker Hook
 * Manages Web Worker lifecycle and communication with proper cleanup
 */

import { useCallback, useEffect, useRef, useState } from 'react'

interface WebWorkerMessage {
  type: string
  payload: any
  id: string
}

interface WebWorkerResponse {
  type: string
  payload: any
  id: string
}

interface WebWorkerOptions {
  onProgress?: (progress: { stage: string; progress: number; message: string }) => void
  onError?: (error: Error) => void
  timeout?: number
}

export function useWebWorker<TMessage extends WebWorkerMessage, TResponse extends WebWorkerResponse>(
  workerPath: string,
  options: WebWorkerOptions = {}
) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const workerRef = useRef<Worker | null>(null)
  const pendingTasks = useRef<Map<string, {
    resolve: (value: any) => void
    reject: (error: Error) => void
    timeout?: NodeJS.Timeout
  }>>(new Map())

  // Initialize worker
  useEffect(() => {
    try {
      workerRef.current = new Worker(new URL(workerPath, import.meta.url), {
        type: 'module'
      })

      workerRef.current.onmessage = (event: MessageEvent<TResponse>) => {
        const { type, payload, id } = event.data
        const task = pendingTasks.current.get(id)

        if (!task) return

        switch (type) {
          case 'PROGRESS':
            options.onProgress?.(payload)
            break

          case 'COMPLETE':
            if (task.timeout) clearTimeout(task.timeout)
            pendingTasks.current.delete(id)
            setIsLoading(false)
            task.resolve(payload)
            break

          case 'ERROR':
            if (task.timeout) clearTimeout(task.timeout)
            pendingTasks.current.delete(id)
            setIsLoading(false)
            const error = new Error(payload.message || 'Worker error')
            setError(error)
            options.onError?.(error)
            task.reject(error)
            break
        }
      }

      workerRef.current.onerror = (error) => {
        const workerError = new Error(`Worker error: ${error.message}`)
        setError(workerError)
        options.onError?.(workerError)
      }

    } catch (err) {
      const initError = new Error(`Failed to initialize worker: ${err}`)
      setError(initError)
      options.onError?.(initError)
    }

    return () => {
      // Clean up worker and pending tasks
      if (workerRef.current) {
        workerRef.current.terminate()
        workerRef.current = null
      }

      // Clear all pending tasks
      pendingTasks.current.forEach(task => {
        if (task.timeout) clearTimeout(task.timeout)
        task.reject(new Error('Worker terminated'))
      })
      pendingTasks.current.clear()
    }
  }, [workerPath, options])

  const postMessage = useCallback(<T = any>(message: Omit<TMessage, 'id'>): Promise<T> => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        reject(new Error('Worker not initialized'))
        return
      }

      const id = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const fullMessage = { ...message, id } as TMessage

      // Set up timeout if specified
      let timeout: NodeJS.Timeout | undefined
      if (options.timeout) {
        timeout = setTimeout(() => {
          pendingTasks.current.delete(id)
          setIsLoading(false)
          reject(new Error('Worker task timeout'))
        }, options.timeout)
      }

      // Store task
      pendingTasks.current.set(id, { resolve, reject, timeout })
      setIsLoading(true)
      setError(null)

      // Send message to worker
      workerRef.current.postMessage(fullMessage)
    })
  }, [options.timeout])

  const terminate = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate()
      workerRef.current = null
    }

    // Clear all pending tasks
    pendingTasks.current.forEach(task => {
      if (task.timeout) clearTimeout(task.timeout)
      task.reject(new Error('Worker terminated'))
    })
    pendingTasks.current.clear()
    setIsLoading(false)
  }, [])

  return {
    postMessage,
    terminate,
    isLoading,
    error,
    isReady: !!workerRef.current && !error
  }
}