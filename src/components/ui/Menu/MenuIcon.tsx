import type { ReactNode, CSSProperties } from 'react'

export type MenuIconProps = {
  children: ReactNode
  style?: CSSProperties
  className?: string
}

export const MenuIcon = ({ children, ...props }: MenuIconProps) => (
  <span {...props}>{children}</span>
)
