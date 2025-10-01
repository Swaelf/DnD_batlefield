import { memo, type FC, type MouseEvent } from 'react'
import { Layers, Plus } from '@/utils/optimizedIcons'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Button } from '@/components/primitives/ButtonVE'

type LayerManagementHeaderProps = {
  onCreateClick: () => void
}

const LayerManagementHeaderComponent: FC<LayerManagementHeaderProps> = ({
  onCreateClick
}) => {
  return (
    <Box
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: '8px',
        marginBottom: '8px',
        borderBottom: '1px solid var(--colors-gray800)'
      }}
    >
      <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Layers size={16} />
        <Text
          variant="body"
          size="sm"
          style={{
            margin: 0,
            fontWeight: '500',
            color: 'var(--colors-gray200)'
          }}
        >
          Layers
        </Text>
      </Box>

      <Button
        variant="ghost"
        onClick={onCreateClick}
        title="Add Layer"
        style={{
          padding: '4px',
          minWidth: 'auto',
          width: '24px',
          height: '24px',
          backgroundColor: 'transparent',
          border: 'none'
        }}
        onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
          e.currentTarget.style.backgroundColor = 'var(--colors-gray800)'
        }}
        onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
          e.currentTarget.style.backgroundColor = 'transparent'
        }}
      >
        <Plus size={12} />
      </Button>
    </Box>
  )
}

export const LayerManagementHeader = memo(LayerManagementHeaderComponent)
LayerManagementHeader.displayName = 'LayerManagementHeader'
