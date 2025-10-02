import { useState, forwardRef, Children, isValidElement, cloneElement, type ReactNode, type ReactElement, type CSSProperties, type MouseEvent, type SyntheticEvent } from 'react'
import { Text } from '@/components/primitives/TextVE'

// Avatar event handlers
type AvatarEventHandlers = {
  onClick?: (event: MouseEvent<HTMLDivElement>) => void
  onMouseEnter?: (event: MouseEvent<HTMLDivElement>) => void
  onMouseLeave?: (event: MouseEvent<HTMLDivElement>) => void
  onLoad?: (event: SyntheticEvent<HTMLImageElement>) => void
  onError?: (event: SyntheticEvent<HTMLImageElement>) => void
}

// Avatar component props with exact typing
export type AvatarProps = {
  src?: string
  alt?: string
  fallback?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'circle' | 'rounded' | 'square'
  className?: string
  style?: CSSProperties

  // Status indicator
  status?: 'online' | 'offline' | 'away' | 'busy'
  showStatus?: boolean

  // HTML attributes
  id?: string
  title?: string
  role?: string
  tabIndex?: number

  // ARIA attributes
  'aria-label'?: string
  'aria-describedby'?: string

  // Data attributes
  'data-testid'?: string
  'data-test-id'?: string
  'data-state'?: string
} & AvatarEventHandlers

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      src,
      alt,
      fallback,
      size = 'md',
      variant = 'circle',
      className,
      style,
      status,
      showStatus = false,
      id,
      title,
      role,
      tabIndex,
      onClick,
      onMouseEnter,
      onMouseLeave,
      onLoad,
      onError,
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedby,
      'data-testid': dataTestId,
      'data-test-id': dataTestId2,
      'data-state': dataState,
    },
    ref
  ) => {
    const [imageError, setImageError] = useState(false)

    // Generate fallback text from name or use provided fallback
    const getFallbackText = (): string => {
      if (fallback) return fallback
      if (alt) {
        return alt
          .split(' ')
          .map(word => word[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      }
      return '?'
    }

    const handleImageError = (event: SyntheticEvent<HTMLImageElement>) => {
      setImageError(true)
      onError?.(event)
    }

    const handleImageLoad = (event: SyntheticEvent<HTMLImageElement>) => {
      setImageError(false)
      onLoad?.(event)
    }

    // Size styles
    const sizeStyles = {
      sm: {
        width: '24px',
        height: '24px',
        fontSize: '10px',
      },
      md: {
        width: '32px',
        height: '32px',
        fontSize: '12px',
      },
      lg: {
        width: '40px',
        height: '40px',
        fontSize: '16px',
      },
      xl: {
        width: '48px',
        height: '48px',
        fontSize: '18px',
      },
    }

    // Variant styles
    const variantStyles = {
      circle: { borderRadius: '50%' },
      rounded: { borderRadius: '8px' },
      square: { borderRadius: '0px' },
    }

    // Status styles
    const statusColors = {
      online: 'var(--success)',
      offline: 'var(--gray500)',
      away: 'var(--warning)',
      busy: 'var(--error)',
    }

    // Root styles
    const rootStyles: CSSProperties = {
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--secondary)',
      color: 'var(--dndBlack)',
      fontWeight: '600',
      userSelect: 'none',
      overflow: 'hidden',
      cursor: onClick ? 'pointer' : 'default',
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...style,
    }

    // Image styles
    const imageStyles: CSSProperties = {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      ...variantStyles[variant],
    }

    // Status indicator styles
    const statusIndicatorSize = {
      sm: '6px',
      md: '8px',
      lg: '10px',
      xl: '12px',
    }

    const statusIndicatorStyles: CSSProperties = {
      position: 'absolute',
      bottom: '0px',
      right: '0px',
      width: statusIndicatorSize[size],
      height: statusIndicatorSize[size],
      borderRadius: '50%',
      backgroundColor: status ? statusColors[status] : 'var(--gray500)',
      border: '2px solid var(--background)',
      pointerEvents: 'none',
    }

    const showImage = src && !imageError

    return (
      <div
        ref={ref}
        style={rootStyles}
        className={className}
        id={id}
        title={title || alt}
        role={role || (onClick ? 'button' : undefined)}
        tabIndex={onClick ? (tabIndex !== undefined ? tabIndex : 0) : tabIndex}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        aria-label={ariaLabel || alt}
        aria-describedby={ariaDescribedby}
        data-testid={dataTestId}
        data-test-id={dataTestId2}
        data-state={dataState}
        data-size={size}
        data-variant={variant}
        data-status={status}
      >
        {showImage ? (
          <img
            src={src}
            alt={alt}
            style={imageStyles}
            onLoad={handleImageLoad}
            onError={handleImageError}
            draggable={false}
          />
        ) : (
          <Text
            size={size === 'sm' ? 'xs' : size === 'xl' ? 'lg' : 'sm'}
            weight="semibold"
            color="inherit"
          >
            {getFallbackText()}
          </Text>
        )}

        {showStatus && status && (
          <div
            style={statusIndicatorStyles}
            data-status={status}
            aria-label={`Status: ${status}`}
          />
        )}
      </div>
    )
  }
)

Avatar.displayName = 'Avatar'

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