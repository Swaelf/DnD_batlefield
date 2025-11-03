import type { ReactNode, CSSProperties } from 'react'
import { vars } from '@/styles/theme.css'

export type MenuHeaderProps = {
  children: ReactNode
  style?: CSSProperties
  className?: string
}

export const MenuHeader = ({ children, ...props }: MenuHeaderProps) => (
  <div style={{
    padding: '8px 12px',
    fontWeight: 'bold',
    fontSize: '14px',
    color: vars.colors.text,
    borderBottom: `1px solid ${vars.colors.border}`,
    ...props.style
  }} className={props.className}>
    {children}
  </div>
)
