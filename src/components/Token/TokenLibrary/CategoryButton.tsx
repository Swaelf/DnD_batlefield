import { forwardRef, type ReactNode, type CSSProperties } from 'react'

export type CategoryButtonProps = {
  children: ReactNode
  isSelected: boolean
  onClick: () => void
}

export const CategoryButton = forwardRef<HTMLButtonElement, CategoryButtonProps>(
  ({ children, isSelected, onClick }, ref) => {
    const buttonStyles: CSSProperties = {
      textTransform: 'capitalize',
      flex: '1 1 auto',
      minWidth: '60px',
      padding: '6px 12px',
      fontSize: '12px',
      fontWeight: '500',
      borderRadius: '6px',
      border: '1px solid var(--gray600)',
      backgroundColor: isSelected ? 'var(--primary)' : 'transparent',
      color: isSelected ? 'white' : 'var(--gray300)',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }

    return (
      <button
        ref={ref}
        onClick={onClick}
        style={buttonStyles}
        onMouseEnter={(e) => {
          if (!isSelected) {
            e.currentTarget.style.backgroundColor = 'var(--gray700)'
            e.currentTarget.style.color = 'var(--gray100)'
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected) {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = 'var(--gray300)'
          }
        }}
      >
        {children}
      </button>
    )
  }
)

CategoryButton.displayName = 'CategoryButton'
