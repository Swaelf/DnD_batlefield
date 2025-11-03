// Main Popover component and types
export { Popover } from './Popover'
export type { PopoverProps } from './Popover'

// Popover sub-components
export { PopoverHeader } from './PopoverHeader'
export type { PopoverHeaderProps } from './PopoverHeader'

export { PopoverTitle } from './PopoverTitle'
export type { PopoverTitleProps } from './PopoverTitle'

export { PopoverBody } from './PopoverBody'
export type { PopoverBodyProps } from './PopoverBody'

export { PopoverFooter } from './PopoverFooter'
export type { PopoverFooterProps } from './PopoverFooter'

export { PopoverCloseButton } from './PopoverCloseButton'
export type { PopoverCloseButtonProps } from './PopoverCloseButton'

// Dropdown variant
export { Dropdown } from './Dropdown'
export type { DropdownProps } from './Dropdown'

// Menu components (renamed from MenuItem/MenuSeparator)
export { PopoverMenuItem } from './PopoverMenuItem'
export type { PopoverMenuItemProps } from './PopoverMenuItem'

export { PopoverMenuSeparator } from './PopoverMenuSeparator'
export type { PopoverMenuSeparatorProps } from './PopoverMenuSeparator'

// Popover hook
export { usePopover } from './usePopover'

// ============================================================================
// Backward Compatibility Aliases (DEPRECATED)
// ============================================================================
// These aliases maintain backward compatibility with existing imports.
// New code should use PopoverMenuItem and PopoverMenuSeparator instead.
// @deprecated Use PopoverMenuItem instead
export { PopoverMenuItem as MenuItem } from './PopoverMenuItem'
export type { PopoverMenuItemProps as MenuItemProps } from './PopoverMenuItem'

// @deprecated Use PopoverMenuSeparator instead
export { PopoverMenuSeparator as MenuSeparator } from './PopoverMenuSeparator'
export type { PopoverMenuSeparatorProps as MenuSeparatorProps } from './PopoverMenuSeparator'
