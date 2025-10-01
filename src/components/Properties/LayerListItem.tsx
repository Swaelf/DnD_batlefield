import { memo, type FC, type MouseEvent } from 'react'
import type { Layer } from '@/types'
import { Eye, EyeOff, Lock, Unlock, ChevronUp, ChevronDown, Trash2 } from '@/utils/optimizedIcons'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Button } from '@/components/primitives/ButtonVE'

type LayerListItemProps = {
  layer: Layer
  isActive: boolean
  objectCount: number
  onSelect: (layerId: string) => void
  onToggleVisibility: (layerId: string) => void
  onToggleLock: (layerId: string) => void
  onDelete: (layerId: string) => void
  onMoveUp: (layerId: string) => void
  onMoveDown: (layerId: string) => void
}

const LayerListItemComponent: FC<LayerListItemProps> = ({
  layer,
  isActive,
  objectCount,
  onSelect,
  onToggleVisibility,
  onToggleLock,
  onDelete,
  onMoveUp,
  onMoveDown
}) => {
  return (
    <Box
      data-active={isActive}
      onClick={() => onSelect(layer.id)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px',
        borderRadius: '4px',
        backgroundColor: isActive ? 'var(--colors-gray800)' : 'var(--colors-gray900)',
        border: `1px solid ${isActive ? 'var(--colors-secondary)' : 'transparent'}`,
        cursor: 'pointer',
        transition: 'all 0.15s ease'
      }}
      onMouseEnter={(e: MouseEvent<HTMLDivElement>) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'var(--colors-gray800)'
        }
      }}
      onMouseLeave={(e: MouseEvent<HTMLDivElement>) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'var(--colors-gray900)'
        }
      }}
    >
      {/* Layer Color Indicator */}
      <Box
        style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          flexShrink: 0,
          backgroundColor: layer.color || '#6B7280'
        }}
      />

      {/* Layer Name */}
      <Box style={{ flex: 1 }}>
        <Text
          variant="body"
          size="xs"
          style={{
            margin: 0,
            fontWeight: '500',
            color: 'var(--colors-gray200)'
          }}
        >
          {layer.name}
          {objectCount > 0 && (
            <Text
              as="span"
              variant="body"
              size="xs"
              style={{
                margin: 0,
                color: 'var(--colors-gray400)'
              }}
            >
              {' '}({objectCount})
            </Text>
          )}
        </Text>
      </Box>

      {/* Layer Actions */}
      <Box
        style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Visibility Toggle */}
        <Button
          variant="ghost"
          onClick={() => onToggleVisibility(layer.id)}
          title={layer.visible ? 'Hide Layer' : 'Show Layer'}
          style={{
            padding: '4px',
            minWidth: 'auto',
            width: '24px',
            height: '24px',
            backgroundColor: 'transparent',
            border: 'none'
          }}
          onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
            e.currentTarget.style.backgroundColor = 'var(--colors-gray700)'
          }}
          onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          {layer.visible ? <Eye size={12} /> : <EyeOff size={12} />}
        </Button>

        {/* Lock Toggle */}
        <Button
          variant="ghost"
          onClick={() => onToggleLock(layer.id)}
          title={layer.locked ? 'Unlock Layer' : 'Lock Layer'}
          style={{
            padding: '4px',
            minWidth: 'auto',
            width: '24px',
            height: '24px',
            backgroundColor: 'transparent',
            border: 'none'
          }}
          onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
            e.currentTarget.style.backgroundColor = 'var(--colors-gray700)'
          }}
          onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          {layer.locked ? <Lock size={12} /> : <Unlock size={12} />}
        </Button>

        {/* Move Up */}
        <Button
          variant="ghost"
          onClick={() => onMoveUp(layer.id)}
          title="Move Layer Up"
          style={{
            padding: '4px',
            minWidth: 'auto',
            width: '24px',
            height: '24px',
            backgroundColor: 'transparent',
            border: 'none'
          }}
          onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
            e.currentTarget.style.backgroundColor = 'var(--colors-gray700)'
          }}
          onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          <ChevronUp size={12} />
        </Button>

        {/* Move Down */}
        <Button
          variant="ghost"
          onClick={() => onMoveDown(layer.id)}
          title="Move Layer Down"
          style={{
            padding: '4px',
            minWidth: 'auto',
            width: '24px',
            height: '24px',
            backgroundColor: 'transparent',
            border: 'none'
          }}
          onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
            e.currentTarget.style.backgroundColor = 'var(--colors-gray700)'
          }}
          onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          <ChevronDown size={12} />
        </Button>

        {/* Delete */}
        {layer.isDeletable && (
          <Button
            variant="ghost"
            onClick={() => onDelete(layer.id)}
            title="Delete Layer"
            style={{
              padding: '4px',
              minWidth: 'auto',
              width: '24px',
              height: '24px',
              backgroundColor: 'transparent',
              border: 'none',
              color: 'var(--colors-error)'
            }}
            onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.backgroundColor = 'var(--colors-error)'
              e.currentTarget.style.color = 'white'
            }}
            onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = 'var(--colors-error)'
            }}
          >
            <Trash2 size={12} />
          </Button>
        )}
      </Box>
    </Box>
  )
}

export const LayerListItem = memo(LayerListItemComponent)
LayerListItem.displayName = 'LayerListItem'
