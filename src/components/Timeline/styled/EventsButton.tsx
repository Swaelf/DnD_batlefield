import { forwardRef, type ButtonHTMLAttributes } from 'react'
import * as styles from '../CombatTracker.css'

export const EventsButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>((props, ref) => (
  <button ref={ref} className={styles.eventsButton} {...props} />
))
EventsButton.displayName = 'EventsButton'
