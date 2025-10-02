import { memo, type FC } from 'react'

type SpellPreviewProps = {
  gridSize: number
}

const SpellPreviewComponent: FC<SpellPreviewProps> = () => {
  // This component is deprecated - spell preview is now handled by the unified action system
  // in UnifiedEventEditor and the mapStore spell preview system
  return null
}

export const SpellPreview = memo(SpellPreviewComponent)
SpellPreview.displayName = 'SpellPreview'

export default SpellPreview