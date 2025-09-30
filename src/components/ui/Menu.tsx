// TODO: Convert to Vanilla Extract - styled import disabled
import { Dropdown, MenuItem, MenuSeparator } from './Popover'
import { Button } from '@/components/primitives'

// TODO: These components need to be migrated from Stitches to Vanilla Extract CSS
// Temporarily exporting plain components to fix build errors

// Main Menu container
export const Menu = ({ children, ...props }: any) => (
  <div {...props}>{children}</div>
)

// Menu Button (trigger)
export const MenuButton = Button

// Menu Header
export const MenuHeader = ({ children, ...props }: any) => (
  <div style={{ padding: '8px 12px', fontWeight: 'bold', borderBottom: '1px solid var(--colors-border)' }} {...props}>
    {children}
  </div>
)

// Menu Status
export const MenuStatus = ({ children, ...props }: any) => (
  <div style={{ padding: '4px 12px', fontSize: '12px', color: 'var(--colors-gray400)' }} {...props}>
    {children}
  </div>
)

// Menu Group
export const MenuGroup = ({ children, label, ...props }: any) => (
  <div {...props}>
    {label && <div style={{ padding: '8px 12px 4px', fontSize: '12px', color: 'var(--colors-gray500)' }}>{label}</div>}
    {children}
  </div>
)

// Menu Content Container
export const MenuContent = ({ children, ...props }: any) => (
  <div {...props}>{children}</div>
)

// Menu Label (non-interactive)
export const MenuLabel = ({ children, ...props }: any) => (
  <div {...props}>{children}</div>
)

// Menu Divider
export const MenuDivider = ({ ...props }: any) => (
  <div style={{ height: '1px', backgroundColor: 'var(--colors-border)', margin: '4px 0' }} {...props} />
)

// Menu Icon
export const MenuIcon = ({ children, ...props }: any) => (
  <span {...props}>{children}</span>
)

// Re-export Popover components for convenience
export { Dropdown, MenuItem, MenuSeparator }