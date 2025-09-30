/**
 * Dynamic Icon Loading System
 * Reduces bundle size by loading icons on-demand instead of importing entire lucide-react library
 */

import React from 'react'
import { LucideIcon } from 'lucide-react'

// Cache for loaded icons to prevent re-fetching
const iconCache = new Map<string, LucideIcon>()

// Most frequently used icons (loaded immediately)
const CRITICAL_ICONS = [
  'X', 'Settings', 'Eye', 'ChevronDown', 'Plus', 'Move', 'EyeOff', 'Zap',
  'Trash2', 'Shield', 'Sword', 'Sparkles', 'Search', 'ChevronUp', 'Users',
  'Square', 'Save', 'RotateCcw', 'Play', 'Wand2'
]

// Preload critical icons
const preloadCriticalIcons = async () => {
  const promises = CRITICAL_ICONS.map(async (iconName) => {
    try {
      const iconModule = await import(`lucide-react/dist/esm/icons/${iconName.toLowerCase().replace(/([A-Z])/g, '-$1').toLowerCase()}`)
      iconCache.set(iconName, iconModule.default)
    } catch (error) {
      console.warn(`Failed to preload icon: ${iconName}`, error)
    }
  })

  await Promise.all(promises)
}

// Load icon dynamically
export const loadIcon = async (iconName: string): Promise<LucideIcon | null> => {
  // Return from cache if available
  if (iconCache.has(iconName)) {
    return iconCache.get(iconName)!
  }

  try {
    // Convert PascalCase to kebab-case for file names
    const fileName = iconName
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .replace(/^-/, '')

    const iconModule = await import(`lucide-react/dist/esm/icons/${fileName}`)
    const icon = iconModule.default

    // Cache the loaded icon
    iconCache.set(iconName, icon)
    return icon
  } catch (error) {
    console.warn(`Failed to load icon: ${iconName}`, error)
    return null
  }
}

// Get icon synchronously (returns null if not cached)
export const getIcon = (iconName: string): LucideIcon | null => {
  return iconCache.get(iconName) || null
}

// Preload critical icons on module load
void preloadCriticalIcons()

// Icon component for dynamic loading
export interface DynamicIconProps {
  name: string
  size?: number
  className?: string
  style?: React.CSSProperties
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({
  name,
  size = 16,
  className = '',
  style = {}
}) => {
  const [Icon, setIcon] = React.useState<LucideIcon | null>(() => getIcon(name))
  const [isLoading, setIsLoading] = React.useState(!Icon)

  React.useEffect(() => {
    if (!Icon) {
      void loadIcon(name).then((loadedIcon) => {
        if (loadedIcon) {
          setIcon(loadedIcon)
          setIsLoading(false)
        }
      })
    }
  }, [name, Icon])

  if (isLoading || !Icon) {
    // Fallback placeholder while loading
    return (
      <div
        className={className}
        style={{
          width: size,
          height: size,
          backgroundColor: 'currentColor',
          opacity: 0.3,
          borderRadius: '2px',
          ...style
        }}
      />
    )
  }

  return <Icon size={size} className={className} style={style} />
}

