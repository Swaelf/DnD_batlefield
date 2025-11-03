import { type ReactNode, type CSSProperties } from 'react'
import { Box } from '@/components/primitives/BoxVE'

export type FieldProps = {
  children: ReactNode
  className?: string
  style?: CSSProperties
}

export const Field = ({ children, className, style }: FieldProps) => (
  <Box
    style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      width: '100%',
      ...style,
    }}
    className={className}
  >
    {children}
  </Box>
)

Field.displayName = 'Field'
