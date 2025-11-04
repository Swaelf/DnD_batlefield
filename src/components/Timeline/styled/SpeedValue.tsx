import { forwardRef, type HTMLAttributes } from 'react'
import * as styles from '../CombatTracker.css'

export const SpeedValue = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>((props, ref) => (
  <span ref={ref} className={styles.speedValue} {...props} />
))
SpeedValue.displayName = 'SpeedValue'
