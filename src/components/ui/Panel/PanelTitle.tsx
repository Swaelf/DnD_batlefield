import { forwardRef, createElement, type ReactNode, type CSSProperties } from 'react'

export type PanelTitleProps = {
  children: ReactNode
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  className?: string
  style?: CSSProperties
  id?: string
}

export const PanelTitle = forwardRef<HTMLHeadingElement, PanelTitleProps>(
  ({ children, as: Component = 'h2', className, style, id }, ref) => {
    const titleStyles: CSSProperties = {
      margin: 0,
      fontSize: '18px',
      fontWeight: '600',
      color: 'var(--gray100)',
      fontFamily: 'system-ui, sans-serif',
      lineHeight: 1.2,
      ...style,
    }

    return createElement(
      Component,
      {
        ref,
        style: titleStyles,
        className,
        id,
      },
      children
    )
  }
)

PanelTitle.displayName = 'PanelTitle'
