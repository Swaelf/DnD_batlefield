import type { ReactNode, CSSProperties } from 'react'
import { vars } from '@/styles/theme.css'

export type MenuGroupProps = {
  children: ReactNode
  label?: string
  style?: CSSProperties
  className?: string
}

export const MenuGroup = ({ children, label, ...props }: MenuGroupProps) => (
  <div style={props.style} className={props.className}>
    {label && <div style={{ padding: '8px 12px 4px', fontSize: '12px', color: vars.colors.gray500 }}>{label}</div>}
    {children}
  </div>
)
