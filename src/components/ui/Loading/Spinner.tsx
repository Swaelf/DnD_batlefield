import { type FC } from 'react'
import { Box } from '@/components/primitives/BoxVE'
import { spinnerStyles } from './Loading.css'

export type SpinnerProps = {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'secondary' | 'white' | 'current'
}

export const Spinner: FC<SpinnerProps> = ({
  size = 'md',
  color = 'primary'
}) => {
  const sizes = {
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48
  }

  const colors = {
    primary: 'var(--colors-primary)',
    secondary: 'var(--colors-secondary)',
    white: 'var(--colors-white)',
    current: 'currentColor'
  }

  const dimension = sizes[size]

  return (
    <Box
      className={spinnerStyles}
      style={{
        width: `${dimension}px`,
        height: `${dimension}px`,
        display: 'inline-block'
      }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%' }}
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke={colors[color]}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="31.4 31.4"
        />
      </svg>
    </Box>
  )
}
