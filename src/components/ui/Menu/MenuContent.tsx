import type { ReactNode, CSSProperties } from 'react'

export type MenuContentProps = {
  children: ReactNode
  style?: CSSProperties
  className?: string
}

export const MenuContent = ({ children, ...props }: MenuContentProps) => (
  <div {...props}>{children}</div>
)
