/**
 * useAsyncOperation Hook - Comprehensive async operation management
 *
 * Provides loading states, error handling, and retry logic for async operations
 * throughout the MapMaker application.
 */

import { useState, useCallback, useRef, useEffect } from 'react'

export interface AsyncOperationOptions<T> {
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  retryCount?: number
  retryDelay?: number
  minLoadingTime?: number
  autoExecute?: boolean
  cacheTime?: number // Time in ms to cache successful results
}

export interface AsyncOperationState<T> {
  data: T | null
  error: Error | null
  isLoading: boolean
  isSuccess: boolean
  isError: boolean
  isIdle: boolean
  // Retry state
  retryCount: number
  canRetry: boolean
  // Progress tracking
  progress?: number
  message?: string
}

export interface AsyncOperationResult<T> extends AsyncOperationState<T> {
  execute: (params?: any) => Promise<T | null>
  retry: () => Promise<T | null>
  reset: () => void
  cancel: () => void
  updateProgress: (progress: number, message?: string) => void
}

export function useAsyncOperation<T>(
  asyncFunction: (params?: any) => Promise<T>,
  options: AsyncOperationOptions<T> = {}
): AsyncOperationResult<T> {
  const {
    onSuccess,
    onError,
    retryCount: maxRetries = 3,
    retryDelay = 1000,
    minLoadingTime = 0,
    autoExecute = false,
    cacheTime = 0
  } = options

  const [state, setState] = useState<AsyncOperationState<T>>({
    data: null,
    error: null,
    isLoading: false,
    isSuccess: false,
    isError: false,
    isIdle: true,
    retryCount: 0,
    canRetry: false,
    progress: undefined,
    message: undefined
  })

  const abortControllerRef = useRef<AbortController | null>(null)
  const loadingStartTimeRef = useRef<number>(0)
  const cacheRef = useRef<{ data: T; timestamp: number } | null>(null)
  const lastParamsRef = useRef<any>(undefined)

  // Update progress during async operation
  const updateProgress = useCallback((progress: number, message?: string) => {
    setState(prev => ({
      ...prev,
      progress: Math.max(0, Math.min(100, progress)),
      message
    }))
  }, [])

  // Cancel ongoing operation
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setState(prev => ({
      ...prev,
      isLoading: false,
      progress: undefined,
      message: undefined
    }))
  }, [])

  // Reset state
  const reset = useCallback(() => {
    cancel()
    setState({
      data: null,
      error: null,
      isLoading: false,
      isSuccess: false,
      isError: false,
      isIdle: true,
      retryCount: 0,
      canRetry: false,
      progress: undefined,
      message: undefined
    })
    cacheRef.current = null
  }, [cancel])

  // Execute async operation
  const execute = useCallback(async (params?: any): Promise<T | null> => {
    // Check cache if enabled
    if (cacheTime > 0 && cacheRef.current) {
      const now = Date.now()
      const cacheAge = now - cacheRef.current.timestamp

      if (cacheAge < cacheTime && JSON.stringify(params) === JSON.stringify(lastParamsRef.current)) {
        setState(prev => ({
          ...prev,
          data: cacheRef.current!.data,
          isSuccess: true,
          isIdle: false,
          isError: false
        }))
        return cacheRef.current.data
      }
    }

    // Cancel any ongoing operation
    cancel()

    // Create new abort controller
    abortControllerRef.current = new AbortController()

    // Store params for retry
    lastParamsRef.current = params

    // Start loading
    loadingStartTimeRef.current = Date.now()
    setState(prev => ({
      ...prev,
      isLoading: true,
      isIdle: false,
      isError: false,
      isSuccess: false,
      error: null,
      progress: 0,
      message: 'Starting...'
    }))

    try {
      // Execute the async function
      const result = await asyncFunction(params)

      // Check if operation was cancelled
      if (abortControllerRef.current?.signal.aborted) {
        throw new Error('Operation cancelled')
      }

      // Ensure minimum loading time if specified
      if (minLoadingTime > 0) {
        const elapsed = Date.now() - loadingStartTimeRef.current
        const remaining = minLoadingTime - elapsed
        if (remaining > 0) {
          await new Promise(resolve => setTimeout(resolve, remaining))
        }
      }

      // Cache result if caching is enabled
      if (cacheTime > 0) {
        cacheRef.current = {
          data: result,
          timestamp: Date.now()
        }
      }

      // Update state with success
      setState({
        data: result,
        error: null,
        isLoading: false,
        isSuccess: true,
        isError: false,
        isIdle: false,
        retryCount: 0,
        canRetry: false,
        progress: 100,
        message: 'Complete'
      })

      // Call success callback
      if (onSuccess) {
        onSuccess(result)
      }

      return result
    } catch (error) {
      // Check if cancelled
      if (error instanceof Error && error.message === 'Operation cancelled') {
        setState(prev => ({
          ...prev,
          isLoading: false,
          progress: undefined,
          message: undefined
        }))
        return null
      }

      const errorObj = error instanceof Error ? error : new Error('Unknown error')

      // Update state with error
      setState(prev => ({
        ...prev,
        data: null,
        error: errorObj,
        isLoading: false,
        isSuccess: false,
        isError: true,
        isIdle: false,
        canRetry: prev.retryCount < maxRetries,
        progress: undefined,
        message: undefined
      }))

      // Call error callback
      if (onError) {
        onError(errorObj)
      }

      return null
    } finally {
      abortControllerRef.current = null
    }
  }, [asyncFunction, cancel, cacheTime, maxRetries, minLoadingTime, onError, onSuccess])

  // Retry operation
  const retry = useCallback(async (): Promise<T | null> => {
    if (state.retryCount >= maxRetries) {
      console.warn('Maximum retry attempts reached')
      return null
    }

    setState(prev => ({
      ...prev,
      retryCount: prev.retryCount + 1,
      message: `Retrying... (${prev.retryCount + 1}/${maxRetries})`
    }))

    // Wait before retrying
    await new Promise(resolve => setTimeout(resolve, retryDelay))

    return execute(lastParamsRef.current)
  }, [state.retryCount, maxRetries, retryDelay, execute])

  // Auto-execute on mount if requested
  useEffect(() => {
    if (autoExecute && state.isIdle) {
      void execute()
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancel()
    }
  }, [cancel])

  return {
    ...state,
    execute,
    retry,
    reset,
    cancel,
    updateProgress
  }
}

// Specialized hook for file operations
export function useFileOperation<T>(
  fileOperation: (file: File) => Promise<T>,
  options?: AsyncOperationOptions<T>
) {
  const asyncOp = useAsyncOperation(fileOperation, options)

  const executeWithFile = useCallback(async (file: File) => {
    // Validate file before executing
    if (!file) {
      // Can't directly set state, but we can throw an error that execute will catch
      throw new Error('No file provided')
    }

    // Execute with file
    return asyncOp.execute(file)
  }, [asyncOp])

  return {
    ...asyncOp,
    executeWithFile
  }
}

// Specialized hook for network requests
export function useNetworkRequest<T>(
  url: string,
  requestOptions?: RequestInit,
  asyncOptions?: AsyncOperationOptions<T>
) {
  const fetchData = useCallback(async () => {
    const response = await fetch(url, requestOptions)

    if (!response.ok) {
      throw new Error(`Network error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data as T
  }, [url, requestOptions])

  return useAsyncOperation(fetchData, {
    ...asyncOptions,
    retryCount: asyncOptions?.retryCount ?? 3,
    retryDelay: asyncOptions?.retryDelay ?? 1000
  })
}

// Specialized hook for batch operations
export function useBatchOperation<T, R>(
  batchProcessor: (items: T[]) => Promise<R[]>,
  options?: AsyncOperationOptions<R[]> & { batchSize?: number }
) {
  const { batchSize = 10, ...asyncOptions } = options || {}

  const processBatch = useCallback(async (items: T[]) => {
    const results: R[] = []
    const totalBatches = Math.ceil(items.length / batchSize)

    for (let i = 0; i < totalBatches; i++) {
      const start = i * batchSize
      const end = Math.min(start + batchSize, items.length)
      const batch = items.slice(start, end)

      // Progress tracking would be implemented via updateProgress callback
      // const progress = Math.round(((i + 1) / totalBatches) * 100)

      const batchResults = await batchProcessor(batch)
      results.push(...batchResults)
    }

    return results
  }, [batchProcessor, batchSize])

  return useAsyncOperation(processBatch, asyncOptions)
}

export default useAsyncOperation