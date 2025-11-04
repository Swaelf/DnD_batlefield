import { forwardRef, createElement, type ReactNode, type CSSProperties } from 'react'

export type ModalTitleProps = {
  children: ReactNode
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  className?: string
  style?: CSSProperties
  id?: string
}

export const ModalTitle = forwardRef<HTMLHeadingElement, ModalTitleProps>(
  ({ children, as: Component = 'h2', className, style, id }, ref) => {
    const titleStyles: CSSProperties = {
      margin: 0,
      fontSize: '20px',
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

ModalTitle.displayName = 'ModalTitle'
