import type { ReactNode, CSSProperties } from 'react'
import { vars } from '@/styles/theme.css'

export type MenuStatusProps = {
  children: ReactNode
  style?: CSSProperties
  className?: string
}

export const MenuStatus = ({ children, ...props }: MenuStatusProps) => (
  <div style={{
    padding: '4px 12px',
    fontSize: '12px',
    color: vars.colors.gray400,
    ...props.style
  }} className={props.className}>
    {children}
  </div>
)
