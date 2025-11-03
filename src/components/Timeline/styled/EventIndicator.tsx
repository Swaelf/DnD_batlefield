import { forwardRef, type HTMLAttributes } from 'react'
import * as styles from '../CombatTracker.css'

export const EventIndicator = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>((props, ref) => (
  <div ref={ref} className={styles.eventIndicator} {...props} />
))
EventIndicator.displayName = 'EventIndicator'
