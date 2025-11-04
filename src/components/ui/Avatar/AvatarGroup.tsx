import { Children, isValidElement, cloneElement, forwardRef, type ReactNode, type ReactElement, type CSSProperties } from 'react'
import { Avatar, type AvatarProps } from './Avatar'

// Avatar Group for displaying multiple avatars
export type AvatarGroupProps = {
  children: ReactNode
  max?: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  spacing?: 'tight' | 'normal' | 'loose'
  className?: string
  style?: CSSProperties
  'aria-label'?: string
}

export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  (
    {
      children,
      max = 5,
      size = 'md',
      spacing = 'normal',
      className,
      style,
      'aria-label': ariaLabel,
    },
    ref
  ) => {
    const spacingValues = {
      tight: '-4px',
      normal: '-8px',
      loose: '-2px',
    }

    const groupStyles: CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      ...style,
    }

    const avatarStyles: CSSProperties = {
      marginLeft: spacingValues[spacing],
      border: '2px solid var(--background)',
      zIndex: 1,
    }

    const avatarArray = Children.toArray(children)
    const visibleAvatars = avatarArray.slice(0, max)
    const hiddenCount = Math.max(0, avatarArray.length - max)

    return (
      <div
        ref={ref}
        style={groupStyles}
        className={className}
        role="group"
        aria-label={ariaLabel || `Avatar group with ${avatarArray.length} members`}
        data-size={size}
        data-spacing={spacing}
      >
        {visibleAvatars.map((child, index) => {
          if (isValidElement(child) && child.type === Avatar) {
            const childProps = child.props as AvatarProps
            return cloneElement(child as ReactElement<AvatarProps>, {
              key: index,
              size,
              style: {
                ...avatarStyles,
                ...(index === 0 && { marginLeft: '0px' }),
                zIndex: visibleAvatars.length - index,
                ...childProps.style,
              },
            })
          }
          return child
        })}

        {hiddenCount > 0 && (
          <Avatar
            size={size}
            fallback={`+${hiddenCount}`}
            style={{
              ...avatarStyles,
              backgroundColor: 'var(--gray700)',
              color: 'var(--gray300)',
              zIndex: 0,
            }}
            aria-label={`${hiddenCount} more members`}
          />
        )}
      </div>
    )
  }
)

AvatarGroup.displayName = 'AvatarGroup'
