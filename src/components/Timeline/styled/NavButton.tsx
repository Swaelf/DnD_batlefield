import { forwardRef, type ButtonHTMLAttributes } from 'react'
import * as styles from '../CombatTracker.css'

export const NavButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>((props, ref) => (
  <button ref={ref} className={styles.navButton} {...props} />
))
NavButton.displayName = 'NavButton'
