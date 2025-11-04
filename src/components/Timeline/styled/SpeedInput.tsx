import { forwardRef, type InputHTMLAttributes } from 'react'
import * as styles from '../CombatTracker.css'

export const SpeedInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>((props, ref) => (
  <input ref={ref} className={styles.speedInput} {...props} />
))
SpeedInput.displayName = 'SpeedInput'
