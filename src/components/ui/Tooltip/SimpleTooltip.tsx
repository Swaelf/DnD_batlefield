import { type FC, type ReactNode, type ReactElement } from 'react'
import { Tooltip } from './Tooltip'

export type SimpleTooltipProps = {
  children: ReactElement
  content: ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
}

// Simple tooltip for basic use cases
export const SimpleTooltip: FC<SimpleTooltipProps> = ({
  children,
  content,
  side = 'top',
  align = 'center',
}) => {
  return (
    <Tooltip content={content} side={side} align={align} asChild>
      {children}
    </Tooltip>
  )
}
