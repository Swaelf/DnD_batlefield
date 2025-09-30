import React, { memo } from 'react'

type SpellPreviewProps = {
  gridSize: number
}

const SpellPreviewOptimizedComponent: React.FC<SpellPreviewProps> = () => {
  // This component is deprecated - spell preview is now handled by the unified action system
  return null
}

export const SpellPreviewOptimized = memo(SpellPreviewOptimizedComponent)
SpellPreviewOptimized.displayName = 'SpellPreviewOptimized'

export default SpellPreviewOptimized