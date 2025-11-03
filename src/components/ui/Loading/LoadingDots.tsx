import { type FC } from 'react'
import { Box } from '@/components/primitives/BoxVE'
import { dotStyles } from './Loading.css'

export type DotsProps = {
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'secondary' | 'white' | 'current'
}

export const LoadingDots: FC<DotsProps> = ({
  size = 'md',
  color = 'primary'
}) => {
  const sizes = {
    sm: 4,
    md: 6,
    lg: 8
  }

  const colors = {
    primary: 'var(--colors-primary)',
    secondary: 'var(--colors-secondary)',
    white: 'var(--colors-white)',
    current: 'currentColor'
  }

  const dotSize = sizes[size]

  return (
    <Box style={{ display: 'inline-flex', gap: `${dotSize / 2}px` }}>
      {[0, 1, 2].map((index) => (
        <Box
          key={index}
          className={dotStyles}
          style={{
            width: `${dotSize}px`,
            height: `${dotSize}px`,
            borderRadius: '50%',
            backgroundColor: colors[color],
            animationDelay: `${index * 0.15}s`
          }}
        />
      ))}
    </Box>
  )
}
