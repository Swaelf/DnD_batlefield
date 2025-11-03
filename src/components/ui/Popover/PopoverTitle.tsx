import { createElement, forwardRef, type ReactNode, type CSSProperties } from 'react'
import { vars } from '@/styles/theme.css'

export type PopoverTitleProps = {
  children: ReactNode
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  className?: string
  style?: CSSProperties
  id?: string
}

export const PopoverTitle = forwardRef<HTMLHeadingElement, PopoverTitleProps>(
  ({ children, as: Component = 'h3', className, style, id }, ref) => {
    const titleStyles: CSSProperties = {
      margin: 0,
      fontSize: '18px',
      fontWeight: '600',
      color: vars.colors.gray100,
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

PopoverTitle.displayName = 'PopoverTitle'
