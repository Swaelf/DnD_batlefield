import { type ReactNode, type CSSProperties } from 'react'
import { Text } from '@/components/primitives/TextVE'

export type FieldMessageProps = {
  children: ReactNode
  state?: 'default' | 'error' | 'success' | 'warning'
  className?: string
  style?: CSSProperties
}

export const FieldMessage = ({ children, state = 'default', className, style }: FieldMessageProps) => {
  const stateColors = {
    default: 'var(--gray500)',
    error: 'var(--error)',
    success: 'var(--success)',
    warning: 'var(--warning)',
  }

  return (
    <Text
      size="sm"
      className={className}
      style={{
        color: stateColors[state],
        ...style,
      }}
    >
      {children}
    </Text>
  )
}

FieldMessage.displayName = 'FieldMessage'
