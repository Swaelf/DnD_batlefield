import React, { memo } from 'react'
import { Box, Text } from '@/components/primitives'
import type { UnifiedAction } from '@/types/unifiedAction'

type ActionPreviewProps = {
  selectedAction: UnifiedAction | null
  targetTokenId?: string
}

const ActionPreviewComponent: React.FC<ActionPreviewProps> = ({
  selectedAction,
  targetTokenId
}) => {
  if (!selectedAction) return null

  return (
    <Box style={{ display: 'flex', flexDirection: 'column' }}>
      <Text
        variant="body"
        size="md"
        style={{
          fontWeight: '600',
          color: '#FFFFFF',
          marginBottom: '8px'
        }}
      >
        Action Preview
      </Text>
      <Box
        style={{
          padding: '14px',
          backgroundColor: '#374151',
          borderRadius: '8px',
          border: '1px solid #4B5563'
        }}
      >
        <Box style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <Text
            variant="body"
            size="xs"
            style={{ color: '#9CA3AF' }}
          >
            Animation: {selectedAction.animation.type} • Duration: {selectedAction.animation.duration}ms
          </Text>

          {selectedAction.animation.trackTarget && targetTokenId && (
            <Box style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 8px',
              backgroundColor: 'rgba(201, 173, 106, 0.1)',
              borderRadius: '4px',
              border: '1px solid rgba(201, 173, 106, 0.2)'
            }}>
              <Text variant="body" size="xs" style={{ color: '#C9AD6A', fontWeight: '500' }}>
                🎯 Token Tracking Active
              </Text>
              <Text variant="body" size="xs" style={{ color: '#9CA3AF' }}>
                Will follow target token movement
              </Text>
            </Box>
          )}

          {selectedAction.animation.trackTarget && !targetTokenId && (
            <Box style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 8px',
              backgroundColor: 'rgba(156, 163, 175, 0.1)',
              borderRadius: '4px',
              border: '1px solid rgba(156, 163, 175, 0.2)'
            }}>
              <Text variant="body" size="xs" style={{ color: '#9CA3AF', fontWeight: '500' }}>
                📍 Fixed Position Target
              </Text>
              <Text variant="body" size="xs" style={{ color: '#9CA3AF' }}>
                Will target exact location
              </Text>
            </Box>
          )}

          {selectedAction.metadata.description && (
            <Text
              variant="body"
              size="xs"
              style={{ color: '#D1D5DB', lineHeight: '1.4', marginTop: '2px' }}
            >
              {selectedAction.metadata.description}
            </Text>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export const ActionPreview = memo(ActionPreviewComponent)
ActionPreview.displayName = 'ActionPreview'