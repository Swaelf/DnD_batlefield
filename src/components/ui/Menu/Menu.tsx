import type { ReactNode, CSSProperties } from 'react'

export type MenuProps = {
  children: ReactNode
  style?: CSSProperties
  className?: string
}

export const Menu = ({ children, ...props }: MenuProps) => (
  <div {...props}>{children}</div>
)
