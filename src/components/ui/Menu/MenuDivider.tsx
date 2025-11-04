import type { CSSProperties } from 'react'
import { vars } from '@/styles/theme.css'

export type MenuDividerProps = {
  style?: CSSProperties
  className?: string
}

export const MenuDivider = ({ ...props }: MenuDividerProps) => (
  <div style={{ height: '1px', backgroundColor: vars.colors.border, margin: '4px 0', ...props.style }} className={props.className} />
)
