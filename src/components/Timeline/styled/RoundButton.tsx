import { forwardRef, type ButtonHTMLAttributes } from 'react'
import * as styles from '../CombatTracker.css'

export const RoundButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>((props, ref) => (
  <button ref={ref} className={styles.roundButton} {...props} />
))
RoundButton.displayName = 'RoundButton'
