import { memo, type ReactNode, type CSSProperties } from 'react'
import { Box } from '@/components/primitives/BoxVE'

export type VirtualListItemProps = {
  children: ReactNode
  style?: CSSProperties
  className?: string
}

// Optimized list item component with memoization
export const VirtualListItem = memo<VirtualListItemProps>(({ children, style, className }) => {
  return (
    <Box className={className} style={style}>
      {children}
    </Box>
  )
})

VirtualListItem.displayName = 'VirtualListItem'
