import { forwardRef, type HTMLAttributes } from 'react'
import * as styles from '../CombatTracker.css'

export const TrackerContainer = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>((props, ref) => (
  <div ref={ref} className={styles.trackerContainer} {...props} />
))
TrackerContainer.displayName = 'TrackerContainer'
