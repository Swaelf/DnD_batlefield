import { useCallback, useState } from 'react'

// Hook for managing virtual scroll state
export function useVirtualScroll<T>(
  _items: T[],
  itemHeight: number,
  _containerHeight: number
) {
  const [scrollTop, setScrollTop] = useState(0)
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 0 })

  const scrollToIndex = useCallback((index: number) => {
    setScrollTop(index * itemHeight)
  }, [itemHeight])

  const onScroll = useCallback((newScrollTop: number, range: { start: number; end: number }) => {
    setScrollTop(newScrollTop)
    setVisibleRange(range)
  }, [])

  const isItemVisible = useCallback((index: number) => {
    return index >= visibleRange.start && index <= visibleRange.end
  }, [visibleRange])

  return {
    scrollTop,
    visibleRange,
    scrollToIndex,
    onScroll,
    isItemVisible
  }
}
