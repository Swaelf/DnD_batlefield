import { forwardRef, useState, type CSSProperties, type MouseEvent } from 'react'
import { Panel } from './Panel'
import type { PanelProps } from './Panel'

export type CardProps = Omit<PanelProps, 'padding' | 'elevation'> & {
  interactive?: boolean
  selected?: boolean
  padding?: 'sm' | 'md' | 'lg'
  elevation?: 'sm' | 'md' | 'lg'
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      interactive = false,
      selected = false,
      padding = 'sm',
      elevation = 'sm',
      variant = 'default',
      style,
      onMouseEnter,
      onMouseLeave,
      onClick,
      ...props
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = useState(false)

    const handleMouseEnter = (event: MouseEvent<HTMLDivElement>) => {
      if (interactive) setIsHovered(true)
      onMouseEnter?.(event)
    }

    const handleMouseLeave = (event: MouseEvent<HTMLDivElement>) => {
      if (interactive) setIsHovered(false)
      onMouseLeave?.(event)
    }

    const interactiveStyles: CSSProperties = interactive
      ? {
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          ...(isHovered && {
            backgroundColor: 'var(--gray750)',
            borderColor: 'var(--gray600)',
            transform: 'translateY(-1px)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
          }),
          ...(selected && {
            borderColor: 'var(--primary)',
            backgroundColor: 'rgba(139, 69, 19, 0.05)',
            boxShadow: '0 0 0 1px var(--primary)',
          }),
        }
      : {}

    const cardStyles: CSSProperties = {
      ...interactiveStyles,
      ...style,
    }

    return (
      <Panel
        ref={ref}
        padding={padding}
        elevation={elevation}
        variant={variant}
        style={cardStyles}
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        data-interactive={interactive}
        data-selected={selected}
        {...props}
      >
        {children}
      </Panel>
    )
  }
)

Card.displayName = 'Card'
