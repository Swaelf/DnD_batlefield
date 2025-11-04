import type { ReactNode, CSSProperties } from 'react'
import { vars } from '@/styles/theme.css'

export type MenuLabelProps = {
  children: ReactNode
  style?: CSSProperties
  className?: string
}

export const MenuLabel = ({ children, ...props }: MenuLabelProps) => (
  <div style={{ fontSize: '12px', color: vars.colors.textSecondary, ...props.style }} className={props.className}>{children}</div>
)
