import { type FC } from 'react'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { sprinkles } from '@/styles/sprinkles.css'
import { fadeInStyles } from './Loading.css'
import { Spinner } from './Spinner'
import { Progress } from './Progress'

export type FullScreenLoadingProps = {
  message?: string
  description?: string
  progress?: number
  onCancel?: () => void
}

export const FullScreenLoading: FC<FullScreenLoadingProps> = ({
  message = 'Loading...',
  description,
  progress,
  onCancel
}) => {
  return (
    <Box
      className={fadeInStyles}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}
    >
      <Box
        className={sprinkles({
          padding: 8,
          backgroundColor: 'surface',
          borderRadius: 'lg'
        })}
        style={{
          minWidth: '300px',
          maxWidth: '400px',
          textAlign: 'center',
          border: '1px solid var(--colors-gray700)'
        }}
      >
        <Spinner size="xl" color="primary" />

        <Text
          variant="heading"
          size="lg"
          style={{ marginTop: '24px', marginBottom: '8px' }}
        >
          {message}
        </Text>

        {description && (
          <Text
            variant="body"
            size="sm"
            style={{ color: 'var(--colors-gray400)', marginBottom: '16px' }}
          >
            {description}
          </Text>
        )}

        {progress !== undefined && (
          <Box style={{ marginTop: '16px' }}>
            <Progress value={progress} showPercentage color="primary" />
          </Box>
        )}

        {onCancel && (
          <Box style={{ marginTop: '24px' }}>
            <button
              onClick={onCancel}
              className={sprinkles({
                padding: 3,
                backgroundColor: 'surface',
                borderRadius: 'md'
              })}
              style={{
                border: '1px solid var(--colors-gray600)',
                color: 'var(--colors-gray300)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Cancel
            </button>
          </Box>
        )}
      </Box>
    </Box>
  )
}
