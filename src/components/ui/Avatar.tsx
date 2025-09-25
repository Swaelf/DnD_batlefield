import React from 'react'
import { styled } from '@/styles/theme.config'
import { Box, Text } from '@/components/primitives'

const AvatarRoot = styled(Box, {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '$round',
  backgroundColor: '$secondary',
  color: '$dndBlack',
  fontWeight: '$semibold',
  userSelect: 'none',
  overflow: 'hidden',

  variants: {
    size: {
      sm: {
        width: 24,
        height: 24,
        fontSize: '$xs'
      },
      md: {
        width: 32,
        height: 32,
        fontSize: '$sm'
      },
      lg: {
        width: 40,
        height: 40,
        fontSize: '$md'
      }
    }
  },

  defaultVariants: {
    size: 'md'
  }
})

const AvatarImage = styled('img', {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  borderRadius: '$round'
})

interface AvatarProps {
  src?: string
  alt?: string
  fallback?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  fallback,
  size = 'md',
  className
}) => {
  // Generate fallback text from name or use provided fallback
  const getFallbackText = () => {
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

  return (
    <AvatarRoot size={size} className={className}>
      {src ? (
        <AvatarImage src={src} alt={alt} />
      ) : (
        <Text size={size === 'sm' ? 'xs' : size === 'lg' ? 'md' : 'sm'}>
          {getFallbackText()}
        </Text>
      )}
    </AvatarRoot>
  )
}

export default Avatar