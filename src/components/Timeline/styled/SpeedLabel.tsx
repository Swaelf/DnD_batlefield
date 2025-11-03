import { forwardRef, type HTMLAttributes } from 'react'
import * as styles from '../CombatTracker.css'

export const SpeedLabel = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>((props, ref) => (
  <span ref={ref} className={styles.speedLabel} {...props} />
))
SpeedLabel.displayName = 'SpeedLabel'
