import React, { memo } from 'react'
import { Plus, Target, Move, Sparkles } from '@/utils/optimizedIcons'
import { Box, Text, Button } from '@/components/primitives'
import type { UnifiedAction } from '@/types/unifiedAction'

type SelectActionProps = {
  selectedAction: UnifiedAction | null
  onSelectAction: () => void
}

const SelectActionComponent: React.FC<SelectActionProps> = ({
  selectedAction,
  onSelectAction
}) => {
  const getActionIcon = (type: string) => {
    switch (type) {
      case 'spell': return <Sparkles size={18} color="#FFFFFF" />
      case 'attack': return <Target size={18} color="#FFFFFF" />
      case 'interaction': return <Target size={18} color="#FFFFFF" />
      case 'move': return <Move size={18} color="#FFFFFF" />
      default: return <Target size={18} color="#FFFFFF" />
    }
  }

  const getActionColor = (type: string) => {
    switch (type) {
      case 'spell': return '#8B5CF6'
      case 'attack': return '#EF4444'
      case 'interaction': return '#10B981'
      case 'move': return '#3B82F6'
      default: return '#6B7280'
    }
  }

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
        Action
      </Text>
      {selectedAction ? (
        <Box
          style={{
            padding: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#374151',
            borderRadius: '8px',
            border: '1px solid #4B5563'
          }}
        >
          <Box style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Box
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: getActionColor(selectedAction.type)
              }}
            >
              {getActionIcon(selectedAction.type)}
            </Box>
            <Box>
              <Text
                variant="body"
                size="md"
                style={{
                  fontWeight: '600',
                  color: '#FFFFFF',
                  marginBottom: '2px'
                }}
              >
                {selectedAction.metadata.name}
              </Text>
              <Text
                variant="body"
                size="sm"
                style={{
                  color: '#9CA3AF',
                  marginBottom: '4px'
                }}
              >
                {selectedAction.category} • {selectedAction.type}
              </Text>
            </Box>
          </Box>
          <Button
            onClick={onSelectAction}
            variant="secondary"
            size="sm"
            style={{
              backgroundColor: '#4B5563',
              color: '#D1D5DB',
              border: '1px solid #6B7280',
              borderRadius: '6px',
              padding: '6px 12px'
            }}
          >
            Change
          </Button>
        </Box>
      ) : (
        <Button
          onClick={onSelectAction}
          variant="secondary"
          style={{
            padding: '16px',
            backgroundColor: '#374151',
            color: '#D1D5DB',
            border: '2px dashed #6B7280',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <Plus size={16} style={{ marginRight: '8px' }} />
          Select Action
        </Button>
      )}
    </Box>
  )
}

export const SelectAction = memo(SelectActionComponent)
SelectAction.displayName = 'SelectAction'