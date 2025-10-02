import { Dropdown, MenuItem, MenuSeparator } from './Popover'
import { Button } from '@/components/primitives'
import { vars } from '@/styles/theme.css'
import type { ReactNode, CSSProperties } from 'react'

// Main Menu container
export const Menu = ({ children, ...props }: { children: ReactNode; style?: CSSProperties; className?: string }) => (
  <div {...props}>{children}</div>
)

// Menu Button (trigger)
export const MenuButton = Button

// Menu Header
export const MenuHeader = ({ children, ...props }: { children: ReactNode; style?: CSSProperties; className?: string }) => (
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

// Menu Status
export const MenuStatus = ({ children, ...props }: { children: ReactNode; style?: CSSProperties; className?: string }) => (
  <div style={{
    padding: '4px 12px',
    fontSize: '12px',
    color: vars.colors.gray400,
    ...props.style
  }} className={props.className}>
    {children}
  </div>
)

// Menu Group
export const MenuGroup = ({ children, label, ...props }: {
  children: ReactNode;
  label?: string;
  style?: CSSProperties;
  className?: string
}) => (
  <div style={props.style} className={props.className}>
    {label && <div style={{ padding: '8px 12px 4px', fontSize: '12px', color: vars.colors.gray500 }}>{label}</div>}
    {children}
  </div>
)

// Menu Content Container
export const MenuContent = ({ children, ...props }: { children: ReactNode; style?: CSSProperties; className?: string }) => (
  <div {...props}>{children}</div>
)

// Menu Label (non-interactive)
export const MenuLabel = ({ children, ...props }: { children: ReactNode; style?: CSSProperties; className?: string }) => (
  <div style={{ fontSize: '12px', color: vars.colors.textSecondary, ...props.style }} className={props.className}>{children}</div>
)

// Menu Divider
export const MenuDivider = ({ ...props }: { style?: CSSProperties; className?: string }) => (
  <div style={{ height: '1px', backgroundColor: vars.colors.border, margin: '4px 0', ...props.style }} className={props.className} />
)

// Menu Icon
export const MenuIcon = ({ children, ...props }: { children: ReactNode; style?: CSSProperties; className?: string }) => (
  <span {...props}>{children}</span>
)

// Re-export Popover components for convenience
export { Dropdown, MenuItem, MenuSeparator }