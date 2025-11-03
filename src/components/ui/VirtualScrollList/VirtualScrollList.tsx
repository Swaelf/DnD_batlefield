/**
 * VirtualScrollList Component
 * High-performance virtual scrolling for large lists
 * Only renders visible items for optimal performance
 */

import { useCallback, useMemo, useRef, useState, type ReactNode, type CSSProperties, type UIEvent } from 'react'
import { Box } from '@/components/primitives/BoxVE'

export type VirtualScrollListProps<T> = {
  items: T[]
  itemHeight: number
  containerHeight: number
  renderItem: (item: T, index: number, isVisible: boolean) => ReactNode
  getItemKey: (item: T, index: number) => string | number
  className?: string
  style?: CSSProperties
  overscan?: number // Number of items to render outside visible area
  onScroll?: (scrollTop: number, visibleRange: { start: number; end: number }) => void
}

export function VirtualScrollList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  getItemKey,
  className,
  style,
  overscan = 3,
  onScroll
}: VirtualScrollListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight)
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight),
      items.length - 1
    )

    return {
      start: Math.max(0, startIndex - overscan),
      end: Math.min(items.length - 1, endIndex + overscan)
    }
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan])

  // Get visible items
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end + 1)
  }, [items, visibleRange.start, visibleRange.end])

  // Handle scroll events
  const handleScroll = useCallback((e: UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop
    setScrollTop(newScrollTop)
    onScroll?.(newScrollTop, visibleRange)
  }, [onScroll, visibleRange])

  // Removed unused scrollToItem function

  // Total height for scrollbar
  const totalHeight = items.length * itemHeight

  // Offset for visible items
  const offsetY = visibleRange.start * itemHeight

  return (
    <Box
      ref={scrollContainerRef}
      className={className}
      style={{
        height: containerHeight,
        overflow: 'auto',
        position: 'relative',
        ...style
      }}
      onScroll={handleScroll}
    >
      {/* Total height container for scrollbar */}
      <Box style={{ height: totalHeight, position: 'relative' }}>
        {/* Visible items container */}
        <Box
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleItems.map((item, index) => {
            const actualIndex = visibleRange.start + index
            const isInView = actualIndex >= Math.floor(scrollTop / itemHeight) &&
                           actualIndex <= Math.floor((scrollTop + containerHeight) / itemHeight)

            return (
              <Box
                key={getItemKey(item, actualIndex)}
                style={{
                  height: itemHeight,
                  overflow: 'hidden'
                }}
              >
                {renderItem(item, actualIndex, isInView)}
              </Box>
            )
          })}
        </Box>
      </Box>
    </Box>
  )
}
