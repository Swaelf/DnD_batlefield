import { forwardRef, type ButtonHTMLAttributes } from 'react'
import * as styles from '../CombatTracker.css'

export const ControlButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>((props, ref) => (
  <button ref={ref} className={styles.controlButton} {...props} />
))
ControlButton.displayName = 'ControlButton'
