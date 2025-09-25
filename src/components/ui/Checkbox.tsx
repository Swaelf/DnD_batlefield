import React from 'react'
import { styled } from '@/styles/theme.config'
import { Check } from 'lucide-react'

const CheckboxRoot = styled('label', {
  display: 'inline-flex',
  alignItems: 'center',
  cursor: 'pointer',
  gap: '$2',
  userSelect: 'none',

  '&[data-disabled="true"]': {
    cursor: 'not-allowed',
    opacity: 0.6
  }
})

const CheckboxInput = styled('input', {
  position: 'absolute',
  opacity: 0,
  width: 1,
  height: 1,
  overflow: 'hidden'
})

const CheckboxIndicator = styled('div', {
  width: 16,
  height: 16,
  borderRadius: '$sm',
  border: '2px solid $gray600',
  backgroundColor: '$gray900',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s ease',
  flexShrink: 0,

  '&[data-checked="true"]': {
    backgroundColor: '$primary',
    borderColor: '$primary',
    color: 'white'
  },

  '&:hover': {
    borderColor: '$gray500'
  },

  '&[data-checked="true"]:hover': {
    backgroundColor: '$primaryHover',
    borderColor: '$primaryHover'
  },

  '&[data-disabled="true"]': {
    borderColor: '$gray700',
    backgroundColor: '$gray800'
  }
})

const CheckboxLabel = styled('span', {
  fontSize: '$sm',
  color: '$gray100',
  lineHeight: 1.4,

  '&[data-disabled="true"]': {
    color: '$gray500'
  }
})

interface CheckboxProps {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  label?: string
  children?: React.ReactNode
  id?: string
  name?: string
  value?: string
  className?: string
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  defaultChecked,
  onCheckedChange,
  disabled = false,
  label,
  children,
  id,
  name,
  value,
  className
}) => {
  const isControlled = checked !== undefined
  const [internalChecked, setInternalChecked] = React.useState(defaultChecked || false)

  const actualChecked = isControlled ? checked : internalChecked

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return

    const newChecked = event.target.checked

    if (!isControlled) {
      setInternalChecked(newChecked)
    }

    onCheckedChange?.(newChecked)
  }

  const displayText = children || label

  return (
    <CheckboxRoot
      className={className}
      data-disabled={disabled}
      htmlFor={id}
    >
      <CheckboxInput
        type="checkbox"
        id={id}
        name={name}
        value={value}
        checked={actualChecked}
        onChange={handleChange}
        disabled={disabled}
      />

      <CheckboxIndicator
        data-checked={actualChecked}
        data-disabled={disabled}
      >
        {actualChecked && <Check size={12} />}
      </CheckboxIndicator>

      {displayText && (
        <CheckboxLabel data-disabled={disabled}>
          {displayText}
        </CheckboxLabel>
      )}
    </CheckboxRoot>
  )
}

export default Checkbox