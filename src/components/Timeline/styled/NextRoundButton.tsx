import { forwardRef, type ButtonHTMLAttributes } from 'react'
import * as styles from '../CombatTracker.css'

export const NextRoundButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>((props, ref) => (
  <button ref={ref} className={styles.nextRoundButton} {...props} />
))
NextRoundButton.displayName = 'NextRoundButton'
