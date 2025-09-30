import type { ComponentProps } from 'react'
import { kbdRecipe } from './Kbd.css'

export type KbdProps = {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'dark' | 'accent'
} & Omit<ComponentProps<'kbd'>, 'className'>

export const Kbd = ({
  size = 'md',
  variant = 'default',
  ...props
}: KbdProps) => (
  <kbd
    {...props}
    className={kbdRecipe({ size, variant })}
  />
)