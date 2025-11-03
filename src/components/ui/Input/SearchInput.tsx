import { forwardRef, type ReactNode, type CSSProperties } from 'react'
import { Box } from '@/components/primitives/BoxVE'
import { Input } from './Input'
import type { InputProps } from './Input'

export type SearchInputProps = Omit<InputProps, 'type'> & {
  icon?: ReactNode
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ icon, style, ...props }, ref) => {
    const searchStyles: CSSProperties = {
      paddingLeft: icon ? '40px' : '12px',
      ...style,
    }

    return (
      <Box style={{ position: 'relative', width: '100%' }}>
        {icon && (
          <Box
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--gray500)',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          >
            {icon}
          </Box>
        )}
        <Input
          ref={ref}
          type="search"
          style={searchStyles}
          {...props}
        />
      </Box>
    )
  }
)

SearchInput.displayName = 'SearchInput'
