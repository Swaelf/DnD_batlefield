import { forwardRef, type HTMLAttributes } from 'react'
import * as styles from '../CombatTracker.css'

export const StatusIndicator = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>((props, ref) => (
  <div ref={ref} className={styles.statusIndicator} {...props} />
))
StatusIndicator.displayName = 'StatusIndicator'
