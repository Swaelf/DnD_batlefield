import { type FC } from 'react'
import { Box } from '@/components/primitives/BoxVE'
import { pulseStyles } from './Loading.css'

export type SkeletonProps = {
  width?: string | number
  height?: string | number
  variant?: 'text' | 'rectangular' | 'circular'
  className?: string
}

export const Skeleton: FC<SkeletonProps> = ({
  width = '100%',
  height = '20px',
  variant = 'rectangular',
  className
}) => {
  const getWidth = () => typeof width === 'number' ? `${width}px` : width
  const getHeight = () => typeof height === 'number' ? `${height}px` : height
  const getBorderRadius = () => {
    switch (variant) {
      case 'circular': return '50%'
      case 'text': return '4px'
      default: return '8px'
    }
  }

  return (
    <Box
      className={`${pulseStyles} ${className || ''}`}
      style={{
        width: getWidth(),
        height: getHeight(),
        backgroundColor: 'var(--colors-gray800)',
        borderRadius: getBorderRadius(),
        display: 'inline-block'
      }}
    />
  )
}
